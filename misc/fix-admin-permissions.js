const mongoose = require('mongoose');
const { AdminUser } = require('./schema');

async function fixAdminPermissions() {
    try {
        console.log('🔧 Fixing admin permissions...');
        
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB');

        // Find the admin user
        const admin = await AdminUser.findOne({ email: 'admin@funnelseye.com' });
        
        if (admin) {
            console.log('📝 Current admin permissions:', admin.permissions);
            
            // Update all permissions to true
            const updatedPermissions = {
                systemSettings: true,
                userManagement: true,
                paymentSettings: true,
                mlmSettings: true,
                coachManagement: true,
                planManagement: true,
                contentModeration: true,
                viewAnalytics: true,
                exportData: true,
                financialReports: true,
                paymentManagement: true,
                securitySettings: true,
                auditLogs: true,
                supportManagement: true,
                notificationSettings: true
            };
            
            await AdminUser.findByIdAndUpdate(admin._id, {
                permissions: updatedPermissions
            });
            
            console.log('✅ Admin permissions updated successfully');
            console.log('📊 New permissions:', updatedPermissions);
            
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

fixAdminPermissions();
