const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:8080'; // Adjust port if needed
const TEST_USER_ID = 'test_user_id'; // Replace with actual user ID
const TEST_USER_TYPE = 'coach'; // or 'staff'

// Test data
const testIntegration = {
    integrationType: 'central_fallback',
    useCentralFallback: true,
    centralAccountCredits: 100
};

// Test functions
async function testWhatsAppAPI() {
    console.log('🧪 Testing WhatsApp API endpoints...\n');

    try {
        // Test 1: Get all coach integrations (public endpoint)
        console.log('1️⃣ Testing GET /api/whatsapp/integration/coaches...');
        const response1 = await axios.get(`${BASE_URL}/api/whatsapp/integration/coaches`);
        console.log('✅ Success:', response1.status, response1.data.success);
        console.log('📊 Data:', response1.data.data?.length || 0, 'integrations found\n');

    } catch (error) {
        console.log('❌ Failed:', error.response?.status || error.code, error.message);
        if (error.response) {
            console.log('Response:', error.response.data);
        }
        console.log('');
    }

    try {
        // Test 2: Get integration health (requires auth)
        console.log('2️⃣ Testing GET /api/whatsapp/integration/health...');
        const response2 = await axios.get(`${BASE_URL}/api/whatsapp/integration/health`, {
            headers: {
                'Authorization': 'Bearer test_token',
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Success:', response2.status, response2.data.success);

    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Expected: 401 Unauthorized (no valid token)\n');
        } else {
            console.log('❌ Unexpected error:', error.response?.status || error.code, error.message);
        }
    }

    try {
        // Test 3: Test integration (requires auth)
        console.log('3️⃣ Testing POST /api/whatsapp/integration/test...');
        const response3 = await axios.post(`${BASE_URL}/api/whatsapp/integration/test`, testIntegration, {
            headers: {
                'Authorization': 'Bearer test_token',
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Success:', response3.status, response3.data.success);

    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Expected: 401 Unauthorized (no valid token)\n');
        } else {
            console.log('❌ Unexpected error:', error.response?.status || error.code, error.message);
        }
    }

    try {
        // Test 4: Get inbox stats (requires auth)
        console.log('4️⃣ Testing GET /api/whatsapp/inbox/stats...');
        const response4 = await axios.get(`${BASE_URL}/api/whatsapp/inbox/stats`, {
            headers: {
                'Authorization': 'Bearer test_token',
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Success:', response4.status, response4.data.success);

    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Expected: 401 Unauthorized (no valid token)\n');
        } else {
            console.log('❌ Unexpected error:', error.response?.status || error.code, error.message);
        }
    }

    console.log('🎯 WhatsApp API testing completed!');
    console.log('💡 To test authenticated endpoints, you need a valid JWT token');
}

// Run tests
testWhatsAppAPI().catch(console.error);
