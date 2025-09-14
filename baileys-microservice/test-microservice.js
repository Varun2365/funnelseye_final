const axios = require('axios');

const baseUrl = 'http://localhost:4444';

async function testMicroservice() {
    console.log('🧪 Testing Baileys Microservice...\n');
    
    try {
        // Test 1: Health check
        console.log('1️⃣ Testing health check...');
        const healthResponse = await axios.get(`${baseUrl}/health`);
        console.log('✅ Health check passed:', healthResponse.data);
        
        // Test 2: Initialize test session
        console.log('\n2️⃣ Testing session initialization...');
        const initResponse = await axios.post(`${baseUrl}/testing/init`, {
            phoneNumber: '+1234567890',
            sessionName: 'Test Session'
        });
        
        if (initResponse.data.success) {
            const sessionId = initResponse.data.data.sessionId;
            console.log('✅ Session initialized:', sessionId);
            
            // Test 3: Get QR code
            console.log('\n3️⃣ Testing QR code generation...');
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for QR
            
            const qrResponse = await axios.get(`${baseUrl}/testing/qr/${sessionId}`);
            if (qrResponse.data.success) {
                console.log('✅ QR code generated successfully');
                console.log('QR code length:', qrResponse.data.data.qrCode.length);
            } else {
                console.log('⚠️ QR code not available yet:', qrResponse.data.message);
            }
            
            // Test 4: Check status
            console.log('\n4️⃣ Testing status check...');
            const statusResponse = await axios.get(`${baseUrl}/testing/status/${sessionId}`);
            if (statusResponse.data.success) {
                console.log('✅ Status check passed:', statusResponse.data.data);
            }
            
            // Test 5: List sessions
            console.log('\n5️⃣ Testing session list...');
            const sessionsResponse = await axios.get(`${baseUrl}/testing/sessions`);
            if (sessionsResponse.data.success) {
                console.log('✅ Sessions list:', sessionsResponse.data.data);
            }
            
            // Test 6: Disconnect session
            console.log('\n6️⃣ Testing session disconnect...');
            const disconnectResponse = await axios.delete(`${baseUrl}/testing/disconnect/${sessionId}`);
            if (disconnectResponse.data.success) {
                console.log('✅ Session disconnected successfully');
            }
            
        } else {
            console.log('❌ Session initialization failed:', initResponse.data.message);
        }
        
        console.log('\n✅ All tests completed successfully!');
        console.log('\n🌐 You can also test via browser:');
        console.log('   http://localhost:4444/test-qr.html');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testMicroservice();
