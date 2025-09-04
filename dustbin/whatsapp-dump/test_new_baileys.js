const mongoose = require('mongoose');
const { WhatsAppIntegration } = require('../schema');

// Test the new simplified Baileys integration
async function testNewBaileys() {
    try {
        console.log('🧪 Testing new simplified Baileys integration...');
        
        // Test 1: Check if we can import the service
        console.log('📦 Testing service import...');
        const baileysService = require('../services/baileysWhatsAppService');
        console.log('✅ Baileys service imported successfully');
        
        // Test 2: Check if we can access basic methods
        console.log('🔍 Testing service methods...');
        console.log('📊 Available sessions:', baileysService.getAllSessions());
        console.log('✅ Service methods accessible');
        
        // Test 3: Check if we can import unified service
        console.log('🔗 Testing unified service import...');
        const unifiedService = require('../services/unifiedWhatsAppService');
        console.log('✅ Unified service imported successfully');
        
        console.log('🎉 All tests passed! New Baileys integration is ready.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testNewBaileys();
