const mongoose = require('mongoose');
const { User } = require('../schema/User');

// Clean up subscription fields from User schema
async function cleanupUserSubscriptionFields() {
    try {
        console.log('🧹 Cleaning up subscription fields from User schema...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB\n');

        // Find all users with subscription fields
        const usersWithSubscription = await User.find({
            'subscription.planId': { $exists: true, $ne: null }
        });

        console.log(`📋 Found ${usersWithSubscription.length} users with subscription fields in User schema\n`);

        if (usersWithSubscription.length === 0) {
            console.log('✅ No users with subscription fields found - cleanup not needed');
            return;
        }

        // Remove subscription fields from all users
        const result = await User.updateMany(
            { 'subscription.planId': { $exists: true } },
            { $unset: { subscription: 1 } }
        );

        console.log(`✅ Cleanup completed successfully!`);
        console.log(`   - Modified ${result.modifiedCount} users`);
        console.log(`   - Removed subscription fields from User schema`);
        console.log(`\n🎯 Now subscription data is stored ONLY in CoachSubscription collection!`);
        console.log(`   - Single source of truth`);
        console.log(`   - No more data inconsistency`);
        console.log(`   - Protect middleware will work correctly`);

    } catch (error) {
        console.error('❌ Error cleaning up subscription fields:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the cleanup
if (require.main === module) {
    cleanupUserSubscriptionFields();
}

module.exports = { cleanupUserSubscriptionFields };
