const mongoose = require('mongoose');
const { AdminSystemSettings } = require('./schema');

async function testDbQuery() {
    try {
        console.log('🔍 Testing database query...');
        
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB');

        // Test the exact query from the controller
        console.log('🔄 Testing AdminSystemSettings.findOne()...');
        const startTime = Date.now();
        
        const settings = await AdminSystemSettings.findOne().select('paymentSystem.currencies paymentSystem.taxSettings');
        
        const endTime = Date.now();
        console.log(`✅ Query completed in ${endTime - startTime}ms`);
        console.log('📊 Settings found:', !!settings);
        
        if (settings) {
            console.log('   Payment system:', !!settings.paymentSystem);
            console.log('   Currencies:', settings.paymentSystem?.currencies);
            console.log('   Tax settings:', settings.paymentSystem?.taxSettings);
        } else {
            console.log('❌ No AdminSystemSettings document found');
        }

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

testDbQuery();
