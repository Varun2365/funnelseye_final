const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { AdminUser } = require('./schema');

async function fixAdminUser() {
    try {
        console.log('🔧 Fixing admin user...');
        
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB');

        // Find the admin user
        const admin = await AdminUser.findOne({ email: 'admin@funnelseye.com' });
        
        if (admin) {
            console.log('📝 Updating admin user...');
            
            // Hash the password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash('Admin@123', saltRounds);
            
            // Update the admin user with required fields
            await AdminUser.findByIdAndUpdate(admin._id, {
                firstName: 'Super',
                lastName: 'Admin',
                password: hashedPassword,
                role: 'super_admin',
                permissions: {
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
                }
            });
            
            console.log('✅ Admin user updated successfully');
            console.log('   Email: admin@funnelseye.com');
            console.log('   Password: Admin@123');
            console.log('   Role: super_admin');
            console.log('   Permissions: All enabled');
            
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

fixAdminUser();
