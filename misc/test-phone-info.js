const axios = require('axios');

async function testPhoneInfo() {
    console.log('🧪 Testing Phone Number Info Endpoint...\n');

    const phoneNumberId = "761615423698084";
    const accessToken = "EAA3wYvYoTAUBPTqXddkZA8hDu8kCBpDSUhh0KZB4a3gyB8JmUWZBWZCt7yaeiXumBzrkIURsnxI0arS0yFNktHOxj9VoufWRHNfQJmWUdN8GxH044JghwY88XJt45uMyAU6cMtjns1ntagsFydNl5Kdiys4ySCtDSTYl1m7DNMaH357eeCgFgwf6Aj4BIkEdqCL7s0Na42GeVpgwxUlzjB1KiFAv5k4ekjNfE4D2T5C7LgZDZD";
    
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}`;
    
    try {
        console.log('📱 Making request to:', url);
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Response Status:', response.status);
        console.log('📋 Response Data:');
        console.log(JSON.stringify(response.data, null, 2));
        
        console.log('\n🔍 Available Fields:');
        console.log(Object.keys(response.data));
        
        // Check for business account ID in various possible fields
        const possibleFields = [
            'waba_id',
            'business_account_id', 
            'whatsapp_business_account_id',
            'business_account',
            'waba',
            'account_id'
        ];
        
        console.log('\n🎯 Checking for Business Account ID:');
        possibleFields.forEach(field => {
            if (response.data[field]) {
                console.log(`   ✅ Found ${field}:`, response.data[field]);
            } else {
                console.log(`   ❌ ${field}: not found`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response?.data) {
            console.log('📋 Error Response:');
            console.log(JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the test
testPhoneInfo();
