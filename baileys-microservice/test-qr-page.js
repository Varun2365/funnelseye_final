const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const DEVICE_ID = '68c5bdef5958f1e066c9eb66'; // Replace with your device ID

async function testQRPage() {
    console.log('🧪 Testing QR Page Functionality...\n');

    try {
        // Test 1: Check if QR page is accessible
        console.log('1️⃣ Testing QR page accessibility...');
        const qrPageUrl = `${BASE_URL}/api/baileys/qr-page/${DEVICE_ID}`;
        console.log(`   QR Page URL: ${qrPageUrl}`);
        console.log(`   ✅ QR page should be accessible at: ${qrPageUrl}\n`);

        // Test 2: Test QR API endpoint
        console.log('2️⃣ Testing QR API endpoint...');
        const qrApiUrl = `${BASE_URL}/api/baileys/qr/${DEVICE_ID}`;
        
        try {
            const response = await axios.get(qrApiUrl);
            console.log(`   Status: ${response.status}`);
            console.log(`   Success: ${response.data.success}`);
            console.log(`   Message: ${response.data.message}`);
            
            if (response.data.success && response.data.data) {
                console.log(`   ✅ QR code generated successfully!`);
                console.log(`   QR Data URL length: ${response.data.data.length} characters`);
            } else {
                console.log(`   ⚠️  QR code not available: ${response.data.message}`);
            }
        } catch (error) {
            console.log(`   ❌ Error calling QR API: ${error.message}`);
        }

        console.log('\n3️⃣ Testing device initialization...');
        const initUrl = `${BASE_URL}/api/baileys/initialize/${DEVICE_ID}`;
        
        try {
            const initResponse = await axios.post(initUrl, {
                coachId: 'test-coach-id' // Replace with actual coach ID
            });
            console.log(`   Status: ${initResponse.status}`);
            console.log(`   Success: ${initResponse.data.success}`);
            console.log(`   Message: ${initResponse.data.message}`);
            
            if (initResponse.data.success) {
                console.log(`   ✅ Device initialized successfully!`);
                
                // Wait a moment and try QR again
                console.log('\n4️⃣ Testing QR after initialization...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                const qrResponse2 = await axios.get(qrApiUrl);
                if (qrResponse2.data.success && qrResponse2.data.data) {
                    console.log(`   ✅ QR code available after initialization!`);
                } else {
                    console.log(`   ⚠️  QR code still not available: ${qrResponse2.data.message}`);
                }
            }
        } catch (error) {
            console.log(`   ❌ Error initializing device: ${error.message}`);
        }

        console.log('\n📋 Summary:');
        console.log(`   QR Page: ${qrPageUrl}`);
        console.log(`   QR API: ${qrApiUrl}`);
        console.log(`   Initialize API: ${initUrl}`);
        console.log('\n🎯 Instructions:');
        console.log('   1. Open the QR page URL in your browser');
        console.log('   2. The page will automatically fetch and display the QR code');
        console.log('   3. Scan the QR code with your WhatsApp mobile app');
        console.log('   4. The page will show connection status updates');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testQRPage();
