const axios = require('axios');

async function testBypassPermissions() {
    console.log('🔍 Testing financial endpoint with permission bypass...\n');
    
    const baseURL = 'http://localhost:8080';
    
    try {
        // Login first
        const loginResponse = await axios.post(`${baseURL}/api/admin/auth/login`, {
            email: 'admin@funnelseye.com',
            password: 'Admin@123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Authentication successful');
        
        // Test a simple endpoint that doesn't require special permissions
        console.log('\n🔄 Testing admin profile endpoint...');
        const profileResponse = await axios.get(`${baseURL}/api/admin/auth/profile`, {
            timeout: 10000,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Profile endpoint works:', profileResponse.data.success);
        
        // Now test a financial endpoint
        console.log('\n🔄 Testing financial endpoint...');
        const financialResponse = await axios.get(`${baseURL}/api/admin/financial/credit-system`, {
            timeout: 10000,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Financial endpoint works:', financialResponse.data.success);
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Response:', error.response.data);
        }
    }
}

testBypassPermissions().catch(console.error);
