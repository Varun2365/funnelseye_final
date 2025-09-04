/**
 * Test Script: QR Code Method Availability
 * 
 * This script tests that the getQRCode method is properly available
 * in the Baileys WhatsApp service.
 */

async function testQRCodeMethod() {
    console.log('🧪 Testing QR Code Method Availability\n');
    
    try {
        // Import the service
        const BaileysService = require('../services/baileysWhatsAppService');
        
        // Check if the method exists
        if (typeof BaileysService.getQRCode === 'function') {
            console.log('✅ getQRCode method is available');
            
            // Test method signature
            const methodString = BaileysService.getQRCode.toString();
            console.log('📝 Method signature:', methodString.substring(0, 100) + '...');
            
            // Check if it's async
            if (methodString.includes('async')) {
                console.log('✅ Method is async');
            } else {
                console.log('⚠️ Method is not async');
            }
            
            // Test calling the method (this will fail but shows it exists)
            try {
                await BaileysService.getQRCode('test_user', 'coach');
            } catch (error) {
                if (error.message.includes('Baileys session not found')) {
                    console.log('✅ Method is callable and returns expected error for non-existent session');
                } else {
                    console.log('⚠️ Method returned unexpected error:', error.message);
                }
            }
            
        } else {
            console.log('❌ getQRCode method is NOT available');
            console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(BaileysService)));
        }
        
        // Check for other QR-related methods
        console.log('\n🔍 Checking for other QR-related methods:');
        
        const qrMethods = ['refreshQRCode', 'startQRCodeGeneration', 'handleQRCode'];
        qrMethods.forEach(method => {
            if (typeof BaileysService[method] === 'function') {
                console.log(`✅ ${method} method is available`);
            } else {
                console.log(`❌ ${method} method is NOT available`);
            }
        });
        
        console.log('\n🎉 QR Code method test completed!');
        
    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testQRCodeMethod().catch(console.error);
}

module.exports = { testQRCodeMethod };
