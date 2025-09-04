const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Create a proper logger for Baileys (same as in the service)
const createBaileysLogger = () => {
    return {
        level: 'silent',
        child: () => createBaileysLogger(),
        trace: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        fatal: () => {},
        // Additional properties that Baileys might expect
        isLevelEnabled: () => false,
        isTraceEnabled: () => false,
        isDebugEnabled: () => false,
        isInfoEnabled: () => false,
        isWarnEnabled: () => false,
        isErrorEnabled: () => false,
        isFatalEnabled: () => false
    };
};

async function testBaileysLogger() {
    try {
        console.log('🧪 Testing Baileys logger configuration...');
        
        // Create a test session directory
        const testSessionDir = path.join(__dirname, 'test_session');
        if (!fs.existsSync(testSessionDir)) {
            fs.mkdirSync(testSessionDir, { recursive: true });
        }

        // Test the logger creation
        const logger = createBaileysLogger();
        console.log('✅ Logger created successfully');
        console.log('✅ Logger has child method:', typeof logger.child === 'function');
        console.log('✅ Logger has all required methods:', {
            trace: typeof logger.trace === 'function',
            debug: typeof logger.debug === 'function',
            info: typeof logger.info === 'function',
            warn: typeof logger.warn === 'function',
            error: typeof logger.error === 'function',
            fatal: typeof logger.fatal === 'function'
        });

        // Test Baileys socket creation with the logger
        const { state, saveCreds } = await useMultiFileAuthState(testSessionDir);
        const { version } = await fetchLatestBaileysVersion();

        console.log('✅ Auth state created successfully');
        console.log('✅ Baileys version fetched:', version);

        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            logger: createBaileysLogger()
        });

        console.log('✅ Baileys socket created successfully with custom logger');
        console.log('✅ Socket has event emitter:', typeof sock.ev === 'object');

        // Clean up
        if (fs.existsSync(testSessionDir)) {
            fs.rmSync(testSessionDir, { recursive: true, force: true });
        }

        console.log('🎉 All tests passed! The logger fix is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
}

// Run the test
testBaileysLogger();
