const mongoose = require('mongoose');
const { User } = require('../schema/User');
const { SubscriptionPlan } = require('../schema/SubscriptionPlan');
const { CoachSubscription } = require('../schema/CoachSubscription');

// Test subscription check logic
async function testSubscriptionCheck() {
    try {
        console.log('🧪 Testing Subscription Check Logic...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB\n');

        // Test 1: Coach with no subscription
        console.log('📋 Test 1: Coach with no subscription');
        const coachNoSub = await User.findOne({ role: 'coach' });
        if (coachNoSub) {
            console.log(`Coach ID: ${coachNoSub._id}`);
            console.log(`Has subscription: ${!!coachNoSub.subscription}`);
            console.log(`Subscription status: ${coachNoSub.subscription?.status || 'none'}`);
            console.log(`Is enabled: ${coachNoSub.subscription?.isEnabled || false}\n`);
        }

        // Test 2: Coach with active subscription
        console.log('📋 Test 2: Coach with active subscription');
        const coachActiveSub = await User.findOne({ 
            role: 'coach', 
            'subscription.status': 'active',
            'subscription.isEnabled': true 
        });
        if (coachActiveSub) {
            console.log(`Coach ID: ${coachActiveSub._id}`);
            console.log(`Subscription status: ${coachActiveSub.subscription.status}`);
            console.log(`Is enabled: ${coachActiveSub.subscription.isEnabled}`);
            console.log(`End date: ${coachActiveSub.subscription.currentPeriod?.endDate || 'none'}\n`);
        }

        // Test 3: Coach with expired subscription
        console.log('📋 Test 3: Coach with expired subscription');
        const coachExpiredSub = await User.findOne({ 
            role: 'coach', 
            'subscription.status': 'expired' 
        });
        if (coachExpiredSub) {
            console.log(`Coach ID: ${coachExpiredSub._id}`);
            console.log(`Subscription status: ${coachExpiredSub.subscription.status}`);
            console.log(`Is enabled: ${coachExpiredSub.subscription.isEnabled}`);
            console.log(`End date: ${coachExpiredSub.subscription.currentPeriod?.endDate || 'none'}\n`);
        }

        // Test 4: Admin user (should skip subscription check)
        console.log('📋 Test 4: Admin user (should skip subscription check)');
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
            console.log(`Admin ID: ${adminUser._id}`);
            console.log(`Role: ${adminUser.role}`);
            console.log(`Has subscription: ${!!adminUser.subscription}\n`);
        }

        // Test 5: Staff user (should skip subscription check)
        console.log('📋 Test 5: Staff user (should skip subscription check)');
        const staffUser = await User.findOne({ role: 'staff' });
        if (staffUser) {
            console.log(`Staff ID: ${staffUser._id}`);
            console.log(`Role: ${staffUser.role}`);
            console.log(`Has subscription: ${!!staffUser.subscription}\n`);
        }

        // Test subscription route detection
        console.log('📋 Test 6: Subscription route detection');
        const subscriptionRoutes = [
            '/api/subscription/renew',
            '/api/subscription/cancel',
            '/api/subscription/my-subscription',
            '/api/dashboard/analytics', // Non-subscription route
            '/api/leads/manage' // Non-subscription route
        ];

        subscriptionRoutes.forEach(route => {
            const isSubscriptionRoute = subscriptionRoutes.slice(0, 3).some(subRoute => 
                route.includes(subRoute)
            );
            console.log(`Route: ${route} -> Is subscription route: ${isSubscriptionRoute}`);
        });

        console.log('\n✅ Subscription check logic test completed!');

    } catch (error) {
        console.error('❌ Error testing subscription check:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
if (require.main === module) {
    testSubscriptionCheck();
}

module.exports = { testSubscriptionCheck };
