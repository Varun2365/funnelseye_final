const axios = require('axios');

async function testAdminAuth() {
    console.log('🔍 Testing admin authentication...\n');
    
    const baseURL = 'http://localhost:8080';
    
    // Test admin login first
    try {
        console.log('1️⃣ Testing admin login...');
        const loginResponse = await axios.post(`${baseURL}/api/admin/auth/login`, {
            email: 'admin@funnelseye.com',
            password: 'Admin@123'
        }, {
            timeout: 5000
        });
        
        console.log('📊 Login response:', loginResponse.data);
        
        if (loginResponse.data.success && loginResponse.data.data?.token) {
            console.log('✅ Admin login successful');
            const token = loginResponse.data.data.token;
            
            // Test financial route with valid token
            console.log('\n2️⃣ Testing financial route with valid token...');
            const financialResponse = await axios.get(`${baseURL}/api/admin/financial/credit-system`, {
                timeout: 5000,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (financialResponse.data.success) {
                console.log('✅ Financial route works with valid token');
                console.log('📊 Response data keys:', Object.keys(financialResponse.data.data || {}));
            } else {
                console.log('❌ Financial route failed:', financialResponse.data.message);
            }
            
        } else {
            console.log('❌ Admin login failed:', loginResponse.data.message);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.response?.data?.message || error.message);
        if (error.response?.status === 401) {
            console.log('🔑 Authentication failed - check admin credentials');
        }
    }
}

testAdminAuth().catch(console.error);
