const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs').promises;
const path = require('path');

// Test Baileys socket creation
async function testBaileysSocket() {
    try {
        console.log('🧪 Testing Baileys socket creation...');
        
        // Create a test session directory
        const testDir = path.join(__dirname, '../baileys_auth/test_user');
        await fs.mkdir(testDir, { recursive: true });
        
        console.log('📁 Test directory created:', testDir);
        
        // Load or create auth state
        const { state, saveCreds } = await useMultiFileAuthState(testDir);
        console.log('✅ Auth state loaded');
        
        // Get Baileys version
        const { version } = await fetchLatestBaileysVersion();
        console.log('📦 Baileys version:', version);
        
        // Create socket
        const sock = makeWASocket({
            version,
            auth: state,
            logger: pino({ level: 'silent' }),
            browser: Browsers.ubuntu('Chrome'),
            connectTimeoutMs: 30_000,
            keepAliveIntervalMs: 15_000,
            markOnlineOnConnect: false,
            emitOwnEvents: false
        });
        
        console.log('🔌 Socket created successfully');
        console.log('🔌 Socket events available:', Object.keys(sock.ev));
        
        // Test event handler setup
        if (sock.ev) {
            console.log('✅ Socket events object is valid');
            
            // Test adding a simple event listener
            sock.ev.on('test', () => {
                console.log('✅ Test event listener works');
            });
            
            console.log('✅ Event listener added successfully');
        } else {
            throw new Error('Socket events object is invalid');
        }
        
        // Clean up
        if (sock.end) {
            sock.end();
            console.log('🔌 Socket ended successfully');
        }
        
        console.log('🎉 All tests passed! Baileys socket creation is working.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testBaileysSocket();
