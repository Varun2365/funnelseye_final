const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
const DEVICE_ID = '68c5bdef5958f1e066c9eb66'; // Replace with your device ID

async function testInitializeWithQR() {
    console.log('🧪 Testing Initialize Connection with QR Data...\n');

    try {
        // Test initialization endpoint
        console.log('1️⃣ Testing initialization endpoint with QR data...');
        const initUrl = `${BASE_URL}/api/messagingv1/baileys/connect/${DEVICE_ID}`;
        
        try {
            const response = await axios.post(initUrl, {}, {
                headers: {
                    'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`   Status: ${response.status}`);
            console.log(`   Response:`, JSON.stringify(response.data, null, 2));
            
            if (response.data.success && response.data.data.qrCode) {
                console.log(`   ✅ QR code data included in response!`);
                console.log(`   QR Data URL length: ${response.data.data.qrCode.length} characters`);
                console.log(`   QR Data starts with: ${response.data.data.qrCode.substring(0, 50)}...`);
                console.log(`   QR Message: ${response.data.data.qrMessage}`);
                
                // You can now copy-paste this QR data URL into browser
                console.log(`\n   📋 Copy this QR data URL to browser:`);
                console.log(`   ${response.data.data.qrCode}`);
                
            } else {
                console.log(`   ⚠️  QR code not available: ${response.data.data.qrMessage}`);
            }
        } catch (error) {
            console.log(`   ❌ Error calling initialization API: ${error.message}`);
            if (error.response) {
                console.log(`   Response status: ${error.response.status}`);
                console.log(`   Response data:`, JSON.stringify(error.response.data, null, 2));
            }
        }

        console.log('\n📋 Expected Response Format:');
        console.log(`   {`);
        console.log(`     "success": true,`);
        console.log(`     "message": "Connection initialized successfully",`);
        console.log(`     "data": {`);
        console.log(`       "deviceId": "${DEVICE_ID}",`);
        console.log(`       "sessionId": "session_${DEVICE_ID}",`);
        console.log(`       "status": "initialized",`);
        console.log(`       "qrSetupUrl": "/whatsapp-qr-setup.html?device=${DEVICE_ID}",`);
        console.log(`       "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",`);
        console.log(`       "qrMessage": "QR code generated successfully"`);
        console.log(`     }`);
        console.log(`   }`);

        console.log('\n🎯 Usage:');
        console.log('   1. Call the initialization endpoint');
        console.log('   2. Copy the qrCode data URL from response');
        console.log('   3. Paste it directly in browser address bar');
        console.log('   4. The QR code will display immediately');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testInitializeWithQR();
