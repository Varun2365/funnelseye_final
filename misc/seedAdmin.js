const mongoose = require('mongoose');
const AdminUser = require('../schema/AdminUser');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/FunnelsEye';

async function seedAdmin() {
    await mongoose.connect(MONGO_URI);
    const existing = await AdminUser.findOne({ email: 'admin@funnelseye.com' });
    if (existing) {
        console.log('Admin user already exists.');
        process.exit(0);
    }
    const admin = new AdminUser({
        email: 'admin@funnelseye.com',
        password: 'Admin@123',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        status: 'active',
        isEmailVerified: true,
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
            systemLogs: true,
            maintenanceMode: true,
            backupRestore: true,
            securitySettings: true,
            auditLogs: true,
            twoFactorAuth: true
        }
    });
    await admin.save();
    console.log('Initial admin user created: admin@funnelseye.com / Admin@123');
    process.exit(0);
}

seedAdmin();
