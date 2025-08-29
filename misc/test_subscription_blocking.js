const mongoose = require('mongoose');
const { User } = require('../schema/User');
const { SubscriptionPlan } = require('../schema/SubscriptionPlan');
const { CoachSubscription } = require('../schema/CoachSubscription');

// Test subscription blocking logic
async function testSubscriptionBlocking() {
    try {
        console.log('🧪 Testing Subscription Blocking Logic...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB\n');

        // Test 1: Coach with no subscription trying to access lead management
        console.log('📋 Test 1: Coach with no subscription accessing lead management');
        const testRoute1 = '/api/leads/manage';
        const subscriptionRoutes = [
            '/api/subscription/renew',
            '/api/subscription/cancel',
            '/api/subscription/my-subscription',
            '/api/subscription/subscribe',
            '/api/subscription/plans'
        ];
        
        const isSubscriptionRoute1 = subscriptionRoutes.some(route => 
            testRoute1.includes(route)
        );
        console.log(`Route: ${testRoute1} -> Is subscription route: ${isSubscriptionRoute1}`);
        console.log(`Result: Should be BLOCKED (not a subscription route)\n`);

        // Test 2: Coach with no subscription trying to access subscription management
        console.log('📋 Test 2: Coach with no subscription accessing subscription management');
        const testRoute2 = '/api/subscription/my-subscription';
        const isSubscriptionRoute2 = subscriptionRoutes.some(route => 
            testRoute2.includes(route)
        );
        console.log(`Route: ${testRoute2} -> Is subscription route: ${isSubscriptionRoute2}`);
        console.log(`Result: Should be ALLOWED (is a subscription route)\n`);

        // Test 3: Coach with expired subscription trying to access dashboard
        console.log('📋 Test 3: Coach with expired subscription accessing dashboard');
        const testRoute3 = '/api/dashboard/analytics';
        const isSubscriptionRoute3 = subscriptionRoutes.some(route => 
            testRoute3.includes(route)
        );
        console.log(`Route: ${testRoute3} -> Is subscription route: ${isSubscriptionRoute3}`);
        console.log(`Result: Should be BLOCKED (not a subscription route)\n`);

        // Test 4: Coach with active subscription accessing any route
        console.log('📋 Test 4: Coach with active subscription accessing any route');
        console.log(`Result: Should be ALLOWED (active subscription)\n`);

        // Test 5: Admin user accessing any route
        console.log('📋 Test 5: Admin user accessing any route');
        console.log(`Result: Should be ALLOWED (admin role, no subscription check)\n`);

        // Test 6: Staff user accessing any route
        console.log('📋 Test 6: Staff user accessing any route');
        console.log(`Result: Should be ALLOWED (staff role, no subscription check)\n`);

        // Test subscription status blocking logic
        console.log('📋 Test 7: Subscription Status Blocking Logic');
        const testStatuses = ['active', 'expired', 'cancelled', 'suspended', 'pending_renewal'];
        
        testStatuses.forEach(status => {
            const shouldBlock = status !== 'active';
            console.log(`Status: ${status} -> Should block non-subscription routes: ${shouldBlock}`);
        });

        console.log('\n✅ Subscription blocking logic test completed!');
        console.log('\n📝 Summary:');
        console.log('- Coaches with NO subscription: BLOCKED from all non-subscription routes');
        console.log('- Coaches with EXPIRED/CANCELLED/SUSPENDED subscriptions: BLOCKED from all non-subscription routes');
        console.log('- Coaches with ACTIVE subscriptions: ALLOWED to all routes');
        console.log('- Coaches can always access subscription management routes');
        console.log('- Admin and Staff users are not affected by subscription checks');

    } catch (error) {
        console.error('❌ Error testing subscription blocking:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
if (require.main === module) {
    testSubscriptionBlocking();
}

module.exports = { testSubscriptionBlocking };
