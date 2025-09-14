const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
const DEVICE_ID = '68c5bdef5958f1e066c9eb66'; // Replace with your device ID
const COACH_TOKEN = 'YOUR_COACH_TOKEN_HERE'; // Replace with actual token

async function testQRGeneration() {
    console.log('🧪 Testing QR Generation Consistency...\n');

    const headers = {
        'Authorization': `Bearer ${COACH_TOKEN}`,
        'Content-Type': 'application/json'
    };

    try {
        // Test 1: Initialize device and check QR
        console.log('1️⃣ Testing device initialization with QR generation...');
        try {
            const response = await axios.post(`${BASE_URL}/api/messagingv1/baileys/connect/${DEVICE_ID}`, {}, { headers });
            
            console.log(`   Status: ${response.status}`);
            console.log(`   Success: ${response.data.success}`);
            console.log(`   Message: ${response.data.message}`);
            
            if (response.data.data.qrCode) {
                console.log(`   ✅ QR Code Generated!`);
                console.log(`   QR Data Length: ${response.data.data.qrCode.length} characters`);
                console.log(`   QR Message: ${response.data.data.qrMessage}`);
                console.log(`   QR starts with: ${response.data.data.qrCode.substring(0, 50)}...`);
            } else {
                console.log(`   ❌ No QR Code Generated`);
                console.log(`   QR Message: ${response.data.data.qrMessage}`);
            }
            
            console.log(`   Device Status: ${response.data.data.status}`);
            console.log(`   Session ID: ${response.data.data.sessionId}\n`);
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.response?.data?.message || error.message}\n`);
        }

        // Test 2: Test multiple initializations to ensure consistency
        console.log('2️⃣ Testing multiple initializations for consistency...');
        for (let i = 1; i <= 3; i++) {
            console.log(`   Attempt ${i}:`);
            try {
                const response = await axios.post(`${BASE_URL}/api/messagingv1/baileys/connect/${DEVICE_ID}`, {}, { headers });
                
                if (response.data.data.qrCode) {
                    console.log(`     ✅ QR Code Generated (${response.data.data.qrCode.length} chars)`);
                } else {
                    console.log(`     ❌ No QR Code: ${response.data.data.qrMessage}`);
                }
                
                // Wait between attempts
                if (i < 3) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.log(`     ❌ Error: ${error.response?.data?.message || error.message}`);
            }
        }
        console.log('');

        // Test 3: Test direct QR endpoint
        console.log('3️⃣ Testing direct QR endpoint...');
        try {
            const response = await axios.get(`${BASE_URL}/api/messagingv1/baileys/qr/${DEVICE_ID}`, { headers });
            
            console.log(`   Status: ${response.status}`);
            console.log(`   Success: ${response.data.success}`);
            
            if (response.data.data && response.data.data.qrCode) {
                console.log(`   ✅ QR Code Retrieved!`);
                console.log(`   QR Data Length: ${response.data.data.qrCode.length} characters`);
            } else {
                console.log(`   ❌ No QR Code: ${response.data.message}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
        }

        console.log('\n📋 Expected Results:');
        console.log('   ✅ QR code should always be generated during initialization');
        console.log('   ✅ QR code should be consistent across multiple attempts');
        console.log('   ✅ QR code should be available via direct endpoint');
        console.log('   ✅ Session files should be deleted and recreated for fresh QR');

        console.log('\n🎯 Key Improvements Made:');
        console.log('   🔄 Delete existing session files before initialization');
        console.log('   ⏱️  Wait longer (5 seconds) for QR generation');
        console.log('   🔁 Retry QR generation if not available');
        console.log('   📱 Force fresh QR generation on each initialization');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testQRGeneration();
