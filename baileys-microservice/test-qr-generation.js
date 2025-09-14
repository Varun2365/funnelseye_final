const baileysService = require('./services/baileysService');
const mongoose = require('mongoose');

async function testQRGeneration() {
    try {
        console.log('🧪 Testing QR Code Generation...');
        
        // Connect to database
        await mongoose.connect('mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to database');
        
        // Test device ID (you can change this)
        const testDeviceId = '64a1b2c3d4e5f6789012345';
        const testCoachId = '64a1b2c3d4e5f6789012346';
        
        console.log(`📱 Testing with device ID: ${testDeviceId}`);
        
        // Step 1: Initialize device
        console.log('\n1️⃣ Initializing device...');
        const initResult = await baileysService.initializeDevice(testDeviceId, testCoachId);
        console.log('Init result:', initResult);
        
        // Step 2: Wait a bit for QR generation
        console.log('\n2️⃣ Waiting for QR generation...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Step 3: Try to get QR code
        console.log('\n3️⃣ Getting QR code...');
        const qrCode = await baileysService.getQRCode(testDeviceId);
        
        if (qrCode) {
            console.log('✅ QR Code generated successfully!');
            console.log(`QR Code length: ${qrCode.length} characters`);
            console.log(`QR Code preview: ${qrCode.substring(0, 50)}...`);
        } else {
            console.log('❌ QR Code not available');
            
            // Step 4: Try force QR generation
            console.log('\n4️⃣ Trying force QR generation...');
            const forceResult = await baileysService.forceQRGeneration(testDeviceId);
            console.log('Force result:', forceResult);
            
            // Wait again
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Try to get QR again
            const qrCode2 = await baileysService.getQRCode(testDeviceId);
            if (qrCode2) {
                console.log('✅ QR Code generated after force!');
                console.log(`QR Code length: ${qrCode2.length} characters`);
            } else {
                console.log('❌ Still no QR code available');
            }
        }
        
        // Step 5: Check connection status
        console.log('\n5️⃣ Checking connection status...');
        const status = await baileysService.getConnectionStatus(testDeviceId);
        console.log('Connection status:', status);
        
        console.log('\n✅ Test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('📡 Disconnected from database');
        process.exit(0);
    }
}

testQRGeneration();
