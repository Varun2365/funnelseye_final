/**
 * Test Script: Crash Prevention Verification
 * 
 * This script tests that the enhanced crash prevention measures are working
 * and helps identify any remaining issues that could cause server restarts.
 */

async function testCrashPrevention() {
    console.log('🧪 Testing Crash Prevention Measures\n');
    
    try {
        // Test 1: Load the service
        console.log('📦 Loading Baileys service...');
        const BaileysService = require('../services/baileysWhatsAppService');
        console.log('✅ Service loaded successfully');
        
        // Test 2: Check if timeout wrapper exists
        console.log('\n🔍 Checking timeout wrapper method:');
        if (typeof BaileysService.executeWithTimeout === 'function') {
            console.log('✅ executeWithTimeout method is available');
        } else {
            console.log('❌ executeWithTimeout method is NOT available');
        }
        
        // Test 3: Test timeout wrapper functionality
        console.log('\n⏱️ Testing timeout wrapper:');
        try {
            const result = await BaileysService.executeWithTimeout(async () => {
                return 'test result';
            }, 1000);
            console.log('✅ Timeout wrapper working correctly:', result);
        } catch (error) {
            console.log('❌ Timeout wrapper test failed:', error.message);
        }
        
        // Test 4: Test timeout wrapper with slow operation
        console.log('\n⏱️ Testing timeout wrapper with slow operation:');
        try {
            await BaileysService.executeWithTimeout(async () => {
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
                return 'slow result';
            }, 1000); // 1 second timeout
            console.log('❌ Timeout wrapper should have timed out');
        } catch (error) {
            if (error.message.includes('timed out')) {
                console.log('✅ Timeout wrapper correctly timed out slow operation');
            } else {
                console.log('⚠️ Unexpected error in timeout test:', error.message);
            }
        }
        
        // Test 5: Check service state
        console.log('\n📊 Service state:');
        console.log(`- Active sessions: ${BaileysService.sessions.size}`);
        console.log(`- QR sessions: ${BaileysService.qrSessions.size}`);
        console.log(`- WebSocket server: ${BaileysService.wss ? 'Initialized' : 'Not initialized'}`);
        
        // Test 6: Check if error handlers are properly set up
        console.log('\n🛡️ Checking error handlers:');
        const processEvents = process.eventNames();
        const hasUncaughtException = processEvents.includes('uncaughtException');
        const hasUnhandledRejection = processEvents.includes('unhandledRejection');
        const hasSIGINT = processEvents.includes('SIGINT');
        const hasSIGTERM = processEvents.includes('SIGTERM');
        
        console.log(`- uncaughtException handler: ${hasUncaughtException ? '✅' : '❌'}`);
        console.log(`- unhandledRejection handler: ${hasUnhandledRejection ? '✅' : '❌'}`);
        console.log(`- SIGINT handler: ${hasSIGINT ? '✅' : '❌'}`);
        console.log(`- SIGTERM handler: ${hasSIGTERM ? '✅' : '❌'}`);
        
        console.log('\n🎉 Crash prevention test completed successfully!');
        console.log('\n💡 The service should now be much more resilient to crashes.');
        console.log('💡 Try scanning the QR code again and watch the detailed logs.');
        console.log('💡 If the server still restarts, the logs should now show exactly where the issue occurs.');
        
    } catch (error) {
        console.error('💥 Test failed:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testCrashPrevention().catch(console.error);
}

module.exports = { testCrashPrevention };
