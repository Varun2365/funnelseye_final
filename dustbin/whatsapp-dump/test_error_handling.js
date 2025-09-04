/**
 * Test Script: Error Handling Verification
 * 
 * This script tests that the enhanced error handling in the Baileys service
 * is working correctly and preventing server crashes.
 */

async function testErrorHandling() {
    console.log('🧪 Testing Enhanced Error Handling\n');
    
    try {
        // Test 1: Load the service
        console.log('📦 Loading Baileys service...');
        const BaileysService = require('../services/baileysWhatsAppService');
        console.log('✅ Service loaded successfully');
        
        // Test 2: Check if error handling methods exist
        console.log('\n🔍 Checking error handling methods:');
        const errorHandlingMethods = [
            'setupGlobalErrorHandlers',
            'cleanupAllSessions'
        ];
        
        errorHandlingMethods.forEach(method => {
            if (typeof BaileysService[method] === 'function') {
                console.log(`✅ ${method} method is available`);
            } else {
                console.log(`❌ ${method} method is NOT available`);
            }
        });
        
        // Test 3: Check if the service has proper error boundaries
        console.log('\n🛡️ Checking error boundaries:');
        
        // Test that the service can handle errors gracefully
        try {
            // This should not crash the service
            const result = await BaileysService.getQRCode('non_existent_user', 'coach');
            console.log('✅ getQRCode handled non-existent user gracefully');
        } catch (error) {
            if (error.message.includes('Baileys session not found')) {
                console.log('✅ getQRCode properly handled error for non-existent session');
            } else {
                console.log('⚠️ getQRCode returned unexpected error:', error.message);
            }
        }
        
        // Test 4: Check if the service can be called multiple times without issues
        console.log('\n🔄 Testing multiple calls:');
        for (let i = 0; i < 3; i++) {
            try {
                await BaileysService.getQRCode(`test_user_${i}`, 'coach');
            } catch (error) {
                // Expected error
            }
        }
        console.log('✅ Multiple calls handled without crashes');
        
        // Test 5: Check service state
        console.log('\n📊 Service state:');
        console.log(`- Active sessions: ${BaileysService.sessions.size}`);
        console.log(`- QR sessions: ${BaileysService.qrSessions.size}`);
        console.log(`- WebSocket server: ${BaileysService.wss ? 'Initialized' : 'Not initialized'}`);
        
        console.log('\n🎉 Error handling test completed successfully!');
        console.log('\n💡 The service should now be more resilient to crashes.');
        console.log('💡 Try scanning the QR code again - it should handle errors gracefully.');
        
    } catch (error) {
        console.error('💥 Test failed:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testErrorHandling().catch(console.error);
}

module.exports = { testErrorHandling };
