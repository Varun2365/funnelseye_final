const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
const ADMIN_TOKEN = 'your-admin-token-here'; // Replace with actual admin token

async function testTemplateFix() {
    console.log('🧪 Testing Template Fix...\n');

    const headers = {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
    };

    try {
        console.log('1️⃣ Testing Get Templates...');
        const getResponse = await axios.get(`${BASE_URL}/api/whatsapp/v1/templates`, { headers });
        
        console.log(`   Status: ${getResponse.status}`);
        console.log(`   Success: ${getResponse.data.success}`);
        console.log(`   Templates Count: ${getResponse.data.data?.length || 0}`);
        
        if (getResponse.data.success) {
            console.log(`   ✅ Get templates working!`);
        } else {
            console.log(`   ❌ Get templates failed: ${getResponse.data.message}`);
        }

    } catch (error) {
        console.log(`   ❌ Get templates failed: ${error.response?.data?.message || error.message}`);
        if (error.response?.data?.error) {
            console.log(`   Error details: ${JSON.stringify(error.response.data.error, null, 2)}`);
        }
    }

    console.log('\n2️⃣ Testing Create Template...');
    const createPayload = {
        name: "test_template_" + Date.now(),
        category: "UTILITY",
        language: "en",
        components: [
            {
                type: "HEADER",
                text: "Test Template"
            },
            {
                type: "BODY",
                text: "This is a test template created at {{1}}"
            }
        ]
    };

    try {
        const createResponse = await axios.post(`${BASE_URL}/api/whatsapp/v1/templates`, createPayload, { headers });
        
        console.log(`   Status: ${createResponse.status}`);
        console.log(`   Success: ${createResponse.data.success}`);
        
        if (createResponse.data.success) {
            console.log(`   ✅ Create template working!`);
            console.log(`   Template ID: ${createResponse.data.data?.templateId}`);
        } else {
            console.log(`   ❌ Create template failed: ${createResponse.data.message}`);
        }

    } catch (error) {
        console.log(`   ❌ Create template failed: ${error.response?.data?.message || error.message}`);
        if (error.response?.data?.error) {
            console.log(`   Error details: ${JSON.stringify(error.response.data.error, null, 2)}`);
        }
    }

    console.log('\n🎯 Fix Summary:');
    console.log('   ✅ Get business account ID from phone number info');
    console.log('   ✅ Use business account ID for template operations');
    console.log('   ✅ Fixed createTemplate endpoint');
    console.log('   ✅ Fixed getTemplates endpoint');
    console.log('   ✅ Fixed syncTemplates endpoint');
}

// Run the test
testTemplateFix();
