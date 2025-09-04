/**
 * Test Script: Service Loading Test
 * 
 * This script tests that the Baileys WhatsApp service can be loaded
 * without any syntax or runtime errors.
 */

async function testServiceLoading() {
    console.log('🧪 Testing Baileys Service Loading\n');
    
    try {
        // Test 1: Basic require
        console.log('📦 Testing basic require...');
        const BaileysService = require('../services/baileysWhatsAppService');
        console.log('✅ Service loaded successfully');
        
        // Test 2: Check if it's an instance
        console.log('🔍 Checking service instance...');
        if (BaileysService && typeof BaileysService === 'object') {
            console.log('✅ Service is an object');
        } else {
            console.log('❌ Service is not an object');
            return;
        }
        
        // Test 3: Check available methods
        console.log('📋 Checking available methods...');
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(BaileysService));
        console.log('Available methods:', methods);
        
        // Test 4: Check specific methods
        const requiredMethods = [
            'getQRCode',
            'refreshQRCode', 
            'startQRCodeGeneration',
            'handleQRCode',
            'broadcastQR',
            'broadcastConnectionStatus',
            'cleanupSessionFiles',
            'initializeSession',
            'cleanupSession'
        ];
        
        console.log('\n🔍 Checking required methods:');
        requiredMethods.forEach(method => {
            if (typeof BaileysService[method] === 'function') {
                console.log(`✅ ${method} method is available`);
            } else {
                console.log(`❌ ${method} method is NOT available`);
            }
        });
        
        // Test 5: Check constructor
        console.log('\n🏗️ Checking constructor...');
        if (BaileysService.constructor && BaileysService.constructor.name) {
            console.log(`✅ Constructor: ${BaileysService.constructor.name}`);
        } else {
            console.log('❌ Constructor not available');
        }
        
        console.log('\n🎉 Service loading test completed successfully!');
        
    } catch (error) {
        console.error('💥 Service loading test failed:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testServiceLoading().catch(console.error);
}

module.exports = { testServiceLoading };
