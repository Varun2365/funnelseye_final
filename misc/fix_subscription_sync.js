const mongoose = require('mongoose');
const { User } = require('../schema/User');
const { SubscriptionPlan } = require('../schema/SubscriptionPlan');
const { CoachSubscription } = require('../schema/CoachSubscription');

// Fix subscription data sync issue
async function fixSubscriptionSync() {
    try {
        console.log('🔧 Fixing Subscription Data Sync Issue...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB\n');

        // Find all coaches with subscription data in User schema
        const coachesWithUserSubscriptions = await User.find({
            role: 'coach',
            'subscription.planId': { $exists: true, $ne: null }
        });

        console.log(`📋 Found ${coachesWithUserSubscriptions.length} coaches with subscription data in User schema\n`);

        if (coachesWithUserSubscriptions.length === 0) {
            console.log('❌ No coaches with subscription data found in User schema');
            return;
        }

        let createdCount = 0;
        let syncedCount = 0;

        for (const coach of coachesWithUserSubscriptions) {
            console.log(`👤 Processing coach: ${coach.name} (${coach._id})`);
            console.log(`   Subscription status: ${coach.subscription.status}`);
            console.log(`   Plan ID: ${coach.subscription.planId}`);
            console.log(`   Is enabled: ${coach.subscription.isEnabled}`);

            // Check if CoachSubscription record exists
            let coachSubscription = await CoachSubscription.findOne({ coachId: coach._id });

            if (!coachSubscription) {
                console.log(`   ❌ No CoachSubscription record found - Creating new one...`);
                
                // Get the plan details
                const plan = await SubscriptionPlan.findById(coach.subscription.planId);
                if (!plan) {
                    console.log(`   ⚠️ Plan not found for ID: ${coach.subscription.planId}, skipping...`);
                    continue;
                }

                // Calculate dates if not present
                let startDate = coach.subscription.currentPeriod?.startDate || new Date();
                let endDate = coach.subscription.currentPeriod?.endDate;
                
                if (!endDate) {
                    endDate = new Date(startDate);
                    switch (plan.price.billingCycle) {
                        case 'monthly':
                            endDate.setMonth(endDate.getMonth() + 1);
                            break;
                        case 'quarterly':
                            endDate.setMonth(endDate.getMonth() + 3);
                            break;
                        case 'yearly':
                            endDate.setFullYear(endDate.getFullYear() + 1);
                            break;
                        default:
                            endDate.setMonth(endDate.getMonth() + 1); // Default to monthly
                    }
                }

                // Create new CoachSubscription record
                coachSubscription = new CoachSubscription({
                    coachId: coach._id,
                    planId: coach.subscription.planId,
                    status: coach.subscription.status || 'active',
                    currentPeriod: {
                        startDate,
                        endDate
                    },
                    billing: {
                        amount: plan.price.amount,
                        currency: plan.price.currency,
                        billingCycle: plan.price.billingCycle,
                        nextBillingDate: endDate,
                        paymentStatus: 'paid'
                    },
                    features: plan.features,
                    accountStatus: {
                        isEnabled: coach.subscription.isEnabled !== false
                    },
                    reminders: {
                        sevenDaysBefore: { sent: false },
                        threeDaysBefore: { sent: false },
                        oneDayBefore: { sent: false },
                        onExpiry: { sent: false }
                    }
                });

                await coachSubscription.save();
                createdCount++;
                console.log(`   ✅ Created CoachSubscription record`);
            } else {
                console.log(`   ✅ CoachSubscription record already exists - Syncing data...`);
                
                // Update existing record to match User schema
                const plan = await SubscriptionPlan.findById(coach.subscription.planId);
                if (plan) {
                    coachSubscription.status = coach.subscription.status || 'active';
                    coachSubscription.accountStatus.isEnabled = coach.subscription.isEnabled !== false;
                    
                    if (coach.subscription.currentPeriod) {
                        coachSubscription.currentPeriod = coach.subscription.currentPeriod;
                    }
                    
                    await coachSubscription.save();
                    syncedCount++;
                    console.log(`   🔄 Synced data with User schema`);
                }
            }
            console.log('');
        }

        console.log(`✅ Subscription data sync completed successfully!`);
        console.log(`   - Created: ${createdCount} new CoachSubscription records`);
        console.log(`   - Synced: ${syncedCount} existing records`);
        console.log(`\n🎯 Now both User schema and CoachSubscription collection should be in sync!`);
        console.log(`   - The protect middleware will see subscription data`);
        console.log(`   - The subscription service will return subscription data`);
        console.log(`   - No more "no subscription" errors!`);

    } catch (error) {
        console.error('❌ Error fixing subscription sync:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the fix
if (require.main === module) {
    fixSubscriptionSync();
}

module.exports = { fixSubscriptionSync };
