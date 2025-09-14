const axios = require('axios');

async function testServerRoutes() {
    console.log('🔍 Testing server and financial routes...\n');
    
    const baseURL = 'http://localhost:8080';
    
    // Test 1: Check if server is running
    try {
        console.log('1️⃣ Testing server connectivity...');
        const response = await axios.get(`${baseURL}/api/admin/auth/profile`, {
            timeout: 5000,
            headers: {
                'Authorization': 'Bearer invalid-token-for-test'
            }
        });
        console.log('❌ Server responded but should have failed auth');
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Server is running and responding to requests');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running on localhost:8080');
            return;
        } else {
            console.log('⚠️ Server responded with:', error.response?.status || error.message);
        }
    }
    
    // Test 2: Check financial routes without auth (should get 401)
    const financialEndpoints = [
        '/api/admin/financial/credit-system',
        '/api/admin/financial/credit-packages',
        '/api/admin/financial/revenue-analytics',
        '/api/admin/financial/payment-failures',
        '/api/admin/financial/gateway-markup',
        '/api/admin/financial/credit-usage',
        '/api/admin/financial/payment-gateways',
        '/api/admin/financial/commission-payouts',
        '/api/admin/financial/payment-analytics'
    ];
    
    console.log('\n2️⃣ Testing financial route accessibility...');
    for (const endpoint of financialEndpoints) {
        try {
            const response = await axios.get(`${baseURL}${endpoint}`, {
                timeout: 3000
            });
            console.log(`❌ ${endpoint} - Should require auth but didn't`);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log(`✅ ${endpoint} - Route exists, requires auth`);
            } else if (error.response?.status === 404) {
                console.log(`❌ ${endpoint} - Route not found (404)`);
            } else {
                console.log(`⚠️ ${endpoint} - Error: ${error.response?.status || error.message}`);
            }
        }
    }
    
    console.log('\n🏁 Route testing complete!');
}

testServerRoutes().catch(console.error);
