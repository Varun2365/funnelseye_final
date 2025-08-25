const mongoose = require('mongoose');
const { CommissionSettings } = require('../schema');

// Connect to MongoDB
const connectDB = require('../config/db');

const defaultCommissionSettings = {
    settingId: `SET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    commissionPercentage: 10, // Default 10% commission
    minimumSubscriptionAmount: 0, // No minimum amount required
    maximumCommissionAmount: null, // No maximum limit
    isActive: true,
    effectiveFrom: new Date(),
    notes: 'Default commission settings - 10% commission on all subscription referrals'
};

async function seedCommissionSettings() {
    try {
        // Connect to database
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // Check if settings already exist
        const existingSettings = await CommissionSettings.findOne({ isActive: true });
        
        if (existingSettings) {
            console.log('⚠️  Commission settings already exist. Skipping seeding.');
            console.log(`Current settings: ${existingSettings.commissionPercentage}% commission`);
            process.exit(0);
        }

        // Create a default admin user ID for seeding
        const defaultAdminId = new mongoose.Types.ObjectId();

        // Create default commission settings
        const settings = new CommissionSettings({
            ...defaultCommissionSettings,
            createdBy: defaultAdminId
        });

        await settings.save();
        
        console.log('✅ Successfully seeded commission settings:');
        console.log(`   Commission Percentage: ${settings.commissionPercentage}%`);
        console.log(`   Minimum Subscription Amount: $${settings.minimumSubscriptionAmount}`);
        console.log(`   Maximum Commission Amount: ${settings.maximumCommissionAmount ? `$${settings.maximumCommissionAmount}` : 'No limit'}`);
        console.log(`   Setting ID: ${settings.settingId}`);

        console.log('\n🎯 Commission settings are now ready for use!');
        console.log('💡 Admins can modify these settings through the API');

    } catch (error) {
        console.error('❌ Error seeding commission settings:', error);
        process.exit(1);
    } finally {
        // Close database connection
        // mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the seeding function
seedCommissionSettings();
