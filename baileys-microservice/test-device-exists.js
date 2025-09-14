const mongoose = require('mongoose');
const WhatsAppDevice = require('./schemas/WhatsAppDevice');

// Test script to check if device exists
async function testDeviceExists() {
    try {
        console.log('🧪 Testing device existence...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
        console.log('✅ Connected to MongoDB');
        
        // Test device ID from your error
        const testDeviceId = '68c5bdef5958f1e066c9eb66';
        
        console.log(`📱 Looking for device: ${testDeviceId}`);
        
        // Check if device exists
        const device = await WhatsAppDevice.findById(testDeviceId);
        
        if (device) {
            console.log('✅ Device found:', {
                id: device._id,
                name: device.deviceName,
                type: device.deviceType,
                phone: device.phoneNumber,
                coachId: device.coachId,
                connected: device.isConnected
            });
        } else {
            console.log('❌ Device not found!');
            console.log('📋 Available devices:');
            
            const allDevices = await WhatsAppDevice.find().limit(5);
            allDevices.forEach(dev => {
                console.log(`  - ${dev._id}: ${dev.deviceName} (${dev.deviceType})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testDeviceExists();
