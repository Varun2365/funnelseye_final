const mongoose = require('mongoose');
const WhatsAppDevice = require('./schemas/WhatsAppDevice');

// Test script to verify the disconnect fix
async function testDisconnectFix() {
    try {
        console.log('🧪 Testing disconnect fix...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
        console.log('✅ Connected to MongoDB');
        
        // Find a test device
        const device = await WhatsAppDevice.findOne();
        if (!device) {
            console.log('❌ No devices found in database');
            return;
        }
        
        console.log(`📱 Testing with device: ${device._id}`);
        
        // Test the update operation that was failing
        const result = await WhatsAppDevice.findByIdAndUpdate(device._id, {
            isConnected: false,
            qrCode: null,
            lastDisconnected: new Date()
        }, { 
            new: true,
            runValidators: false // Skip validation to prevent schema conflicts
        });
        
        console.log('✅ Update successful:', result);
        
        // Test with validation enabled (should work now)
        const result2 = await WhatsAppDevice.findByIdAndUpdate(device._id, {
            isConnected: true,
            lastConnected: new Date()
        }, { 
            new: true,
            runValidators: true
        });
        
        console.log('✅ Update with validation successful:', result2);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testDisconnectFix();
