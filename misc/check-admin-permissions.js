const mongoose = require('mongoose');
const { AdminUser } = require('./schema');

async function checkAdminPermissions() {
    try {
        console.log('🔍 Checking admin permissions...');
        
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB');

        // Find the admin user
        const admin = await AdminUser.findOne({ email: 'admin@funnelseye.com' });
        
        if (admin) {
            console.log('📊 Admin permissions:');
            console.log('   Role:', admin.role);
            console.log('   Permissions:', JSON.stringify(admin.permissions, null, 2));
            
            // Test the hasPermission method
            console.log('\n🧪 Testing hasPermission method:');
            console.log('   systemSettings:', admin.hasPermission('systemSettings'));
            console.log('   viewAnalytics:', admin.hasPermission('viewAnalytics'));
            console.log('   paymentSettings:', admin.hasPermission('paymentSettings'));
            console.log('   financialReports:', admin.hasPermission('financialReports'));
            console.log('   paymentManagement:', admin.hasPermission('paymentManagement'));
            
        } else {
            console.log('❌ Admin user not found');
        }

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

checkAdminPermissions();
