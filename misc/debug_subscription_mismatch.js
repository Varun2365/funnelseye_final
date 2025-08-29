const mongoose = require('mongoose');
const { User } = require('../schema/User');
const { SubscriptionPlan } = require('../schema/SubscriptionPlan');
const { CoachSubscription } = require('../schema/CoachSubscription');

// Debug subscription data mismatch
async function debugSubscriptionMismatch() {
    try {
        console.log('🔍 Debugging Subscription Data Mismatch...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB\n');

        // Find a coach user
        const coachUser = await User.findOne({ role: 'coach' });
        
        if (!coachUser) {
            console.log('❌ No coach users found');
            return;
        }

        console.log(`👤 Coach User Found:`);
        console.log(`   ID: ${coachUser._id}`);
        console.log(`   Name: ${coachUser.name}`);
        console.log(`   Email: ${coachUser.email}`);
        console.log(`   Role: ${coachUser.role}`);
        console.log(`   Has subscription field: ${!!coachUser.subscription}`);
        
        if (coachUser.subscription) {
            console.log(`   Subscription Status: ${coachUser.subscription.status}`);
            console.log(`   Is Enabled: ${coachUser.subscription.isEnabled}`);
            console.log(`   Plan ID: ${coachUser.subscription.planId}`);
            console.log(`   Start Date: ${coachUser.subscription.currentPeriod?.startDate}`);
            console.log(`   End Date: ${coachUser.subscription.currentPeriod?.endDate}`);
        }
        console.log('');

        // Check CoachSubscription collection
        const coachSubscription = await CoachSubscription.findOne({ coachId: coachUser._id });
        
        console.log(`📋 CoachSubscription Collection Check:`);
        if (coachSubscription) {
            console.log(`   ✅ Found subscription record:`);
            console.log(`      ID: ${coachSubscription._id}`);
            console.log(`      Coach ID: ${coachSubscription.coachId}`);
            console.log(`      Plan ID: ${coachSubscription.planId}`);
            console.log(`      Status: ${coachSubscription.status}`);
            console.log(`      Is Enabled: ${coachSubscription.accountStatus?.isEnabled}`);
            console.log(`      Start Date: ${coachSubscription.currentPeriod?.startDate}`);
            console.log(`      End Date: ${coachSubscription.currentPeriod?.endDate}`);
        } else {
            console.log(`   ❌ No subscription record found in CoachSubscription collection`);
        }
        console.log('');

        // Check if plan exists
        if (coachUser.subscription?.planId) {
            const plan = await SubscriptionPlan.findById(coachUser.subscription.planId);
            console.log(`📦 Subscription Plan Check:`);
            if (plan) {
                console.log(`   ✅ Plan found: ${plan.name}`);
                console.log(`   Price: ${plan.price.currency} ${plan.price.amount}`);
                console.log(`   Billing Cycle: ${plan.price.billingCycle}`);
            } else {
                console.log(`   ❌ Plan not found for ID: ${coachUser.subscription.planId}`);
            }
        }
        console.log('');

        // Analysis
        console.log(`🔍 ANALYSIS:`);
        if (coachUser.subscription && !coachSubscription) {
            console.log(`   ❌ MISMATCH DETECTED:`);
            console.log(`      - User schema has subscription data`);
            console.log(`      - CoachSubscription collection has no record`);
            console.log(`      - This will cause the "no subscription" error`);
            console.log(`      - The protect middleware will see subscription data`);
            console.log(`      - But the subscription service will return "no subscription"`);
        } else if (!coachUser.subscription && coachSubscription) {
            console.log(`   ❌ MISMATCH DETECTED:`);
            console.log(`      - User schema has no subscription data`);
            console.log(`      - CoachSubscription collection has record`);
            console.log(`      - This will cause the protect middleware to block access`);
            console.log(`      - But the subscription service will return subscription data`);
        } else if (coachUser.subscription && coachSubscription) {
            console.log(`   ✅ DATA SYNCED:`);
            console.log(`      - Both User schema and CoachSubscription collection have data`);
            console.log(`      - This should work correctly`);
        } else {
            console.log(`   ❌ NO SUBSCRIPTION DATA:`);
            console.log(`      - Neither User schema nor CoachSubscription collection has data`);
            console.log(`      - Coach needs to subscribe to a plan`);
        }

        // Check all coaches for mismatches
        console.log('\n🔍 Checking all coaches for mismatches...');
        const allCoaches = await User.find({ role: 'coach' });
        let mismatchCount = 0;
        
        for (const coach of allCoaches) {
            const hasUserSubscription = !!coach.subscription;
            const hasCoachSubscription = await CoachSubscription.exists({ coachId: coach._id });
            
            if (hasUserSubscription !== hasCoachSubscription) {
                mismatchCount++;
                console.log(`   ❌ Mismatch for coach ${coach.name} (${coach._id}):`);
                console.log(`      User schema: ${hasUserSubscription ? 'Has subscription' : 'No subscription'}`);
                console.log(`      CoachSubscription: ${hasCoachSubscription ? 'Has record' : 'No record'}`);
            }
        }
        
        if (mismatchCount > 0) {
            console.log(`\n🚨 Found ${mismatchCount} coaches with subscription data mismatches!`);
        } else {
            console.log(`\n✅ All coaches have consistent subscription data`);
        }

    } catch (error) {
        console.error('❌ Error debugging subscription mismatch:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the debug
if (require.main === module) {
    debugSubscriptionMismatch();
}

module.exports = { debugSubscriptionMismatch };
