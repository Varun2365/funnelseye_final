const axios = require('axios');

// Test script to verify financial APIs
async function testFinancialAPIs() {
    const baseURL = 'http://localhost:8080/api';
    const token = 'your-admin-token-here'; // Replace with actual token
    
    const endpoints = [
        '/admin/financial/credit-system',
        '/admin/financial/credit-packages',
        '/admin/financial/revenue-analytics',
        '/admin/financial/payment-failures',
        '/admin/financial/gateway-markup',
        '/admin/financial/credit-usage',
        '/admin/financial/payment-gateways',
        '/admin/financial/commission-payouts',
        '/admin/financial/payment-analytics'
    ];

    console.log('🧪 Testing Financial APIs...\n');

    for (const endpoint of endpoints) {
        try {
            console.log(`🔄 Testing: ${endpoint}`);
            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            if (response.data.success) {
                console.log(`✅ ${endpoint} - SUCCESS`);
                console.log(`   Data keys: ${Object.keys(response.data.data || {}).join(', ')}`);
            } else {
                console.log(`❌ ${endpoint} - FAILED: ${response.data.message}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint} - ERROR: ${error.response?.data?.message || error.message}`);
        }
        console.log('');
    }
}

// Run the test
testFinancialAPIs().catch(console.error);
