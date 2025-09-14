const mongoose = require('mongoose');
const { AdminUser } = require('./schema');

async function checkAdminUser() {
    try {
        console.log('🔍 Checking admin user...');
        
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB');

        // Check if admin user exists
        const admin = await AdminUser.findOne({ email: 'admin@funnelseye.com' });
        
        if (admin) {
            console.log('✅ Admin user exists:');
            console.log('   Email:', admin.email);
            console.log('   Name:', admin.name);
            console.log('   Status:', admin.status);
            console.log('   Role:', admin.role);
            console.log('   Created:', admin.createdAt);
        } else {
            console.log('❌ Admin user does not exist');
            console.log('🔧 Creating admin user...');
            
            const newAdmin = new AdminUser({
                email: 'admin@funnelseye.com',
                password: 'Admin@123',
                name: 'Super Admin',
                role: 'super_admin',
                status: 'active',
                permissions: ['all']
            });
            
            await newAdmin.save();
            console.log('✅ Admin user created successfully');
        }

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

checkAdminUser();
