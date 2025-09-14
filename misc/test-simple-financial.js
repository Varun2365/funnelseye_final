const axios = require('axios');

async function testSimpleFinancial() {
    console.log('🔍 Testing simple financial endpoint...\n');
    
    const baseURL = 'http://localhost:8080';
    
    try {
        // Login first
        const loginResponse = await axios.post(`${baseURL}/api/admin/auth/login`, {
            email: 'admin@funnelseye.com',
            password: 'Admin@123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Authentication successful');
        
        // Test a simple endpoint with longer timeout
        console.log('\n🔄 Testing credit-system endpoint with 15s timeout...');
        const response = await axios.get(`${baseURL}/api/admin/financial/credit-system`, {
            timeout: 15000, // 15 seconds
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Response received:');
        console.log('   Success:', response.data.success);
        console.log('   Data keys:', Object.keys(response.data.data || {}));
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Response:', error.response.data);
        }
    }
}

testSimpleFinancial().catch(console.error);
