const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const DEVICE_ID = '68c5bdef5958f1e066c9eb66'; // Replace with your device ID

async function testQRResponse() {
    console.log('🧪 Testing QR Response Format...\n');

    try {
        // Test QR API endpoint directly
        console.log('1️⃣ Testing Baileys microservice QR endpoint...');
        const qrApiUrl = `${BASE_URL}/api/baileys/qr/${DEVICE_ID}`;
        
        try {
            const response = await axios.get(qrApiUrl);
            console.log(`   Status: ${response.status}`);
            console.log(`   Response:`, JSON.stringify(response.data, null, 2));
            
            if (response.data.success && response.data.data) {
                console.log(`   ✅ QR code data available!`);
                console.log(`   QR Data URL length: ${response.data.data.length} characters`);
                console.log(`   QR Data starts with: ${response.data.data.substring(0, 50)}...`);
            } else {
                console.log(`   ⚠️  QR code not available: ${response.data.message}`);
            }
        } catch (error) {
            console.log(`   ❌ Error calling QR API: ${error.message}`);
            if (error.response) {
                console.log(`   Response status: ${error.response.status}`);
                console.log(`   Response data:`, JSON.stringify(error.response.data, null, 2));
            }
        }

        console.log('\n2️⃣ Testing unified messaging QR endpoint...');
        const unifiedQrUrl = `http://localhost:8080/api/messagingv1/baileys/qr/${DEVICE_ID}`;
        
        try {
            const response = await axios.get(unifiedQrUrl);
            console.log(`   Status: ${response.status}`);
            console.log(`   Response:`, JSON.stringify(response.data, null, 2));
            
            if (response.data.success && response.data.data && response.data.data.qrCode) {
                console.log(`   ✅ QR code data available in unified response!`);
                console.log(`   QR Data URL length: ${response.data.data.qrCode.length} characters`);
                console.log(`   QR Data starts with: ${response.data.data.qrCode.substring(0, 50)}...`);
            } else {
                console.log(`   ⚠️  QR code not available: ${response.data.message}`);
            }
        } catch (error) {
            console.log(`   ❌ Error calling unified QR API: ${error.message}`);
            if (error.response) {
                console.log(`   Response status: ${error.response.status}`);
                console.log(`   Response data:`, JSON.stringify(error.response.data, null, 2));
            }
        }

        console.log('\n📋 Summary:');
        console.log(`   Baileys Microservice: ${qrApiUrl}`);
        console.log(`   Unified Messaging: ${unifiedQrUrl}`);
        console.log('\n🎯 Expected Response Format:');
        console.log(`   {`);
        console.log(`     "success": true,`);
        console.log(`     "message": "QR code retrieved successfully",`);
        console.log(`     "data": {`);
        console.log(`       "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",`);
        console.log(`       "deviceId": "${DEVICE_ID}",`);
        console.log(`       "expiresAt": "2025-09-13T19:30:00.000Z"`);
        console.log(`     }`);
        console.log(`   }`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testQRResponse();
