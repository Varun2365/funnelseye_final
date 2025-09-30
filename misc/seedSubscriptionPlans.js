const mongoose = require('mongoose');
const SubscriptionPlan = require('../schema/SubscriptionPlan');
require('dotenv').config();

// Sample subscription plans
const samplePlans = [
    {
        name: 'Starter',
        description: 'Perfect for coaches just getting started with FunnelsEye',
        price: {
            amount: 29,
            currency: 'USD',
            billingCycle: 'monthly'
        },
        features: {
            maxFunnels: -1, // Unlimited
            maxLeads: -1, // Unlimited
            maxStaff: 1,
            maxAutomationRules: 5,
            aiFeatures: false,
            advancedAnalytics: false,
            prioritySupport: false,
            customDomain: false
        },
        isPopular: false,
        sortOrder: 1
    },
    {
        name: 'Professional',
        description: 'Ideal for growing coaches who need more features and capacity',
        price: {
            amount: 79,
            currency: 'USD',
            billingCycle: 'monthly'
        },
        features: {
            maxFunnels: 10,
            maxLeads: -1, // Unlimited
            maxStaff: 3,
            maxAutomationRules: 15,
            aiFeatures: true,
            advancedAnalytics: true,
            prioritySupport: false,
            customDomain: true
        },
        isPopular: true,
        sortOrder: 2
    },
    {
        name: 'Business',
        description: 'For established coaches with teams and high-volume needs',
        price: {
            amount: 149,
            currency: 'USD',
            billingCycle: 'monthly'
        },
        features: {
            maxFunnels: -1, // Unlimited
            maxLeads: -1, // Unlimited
            maxStaff: 8,
            maxAutomationRules: 30,
            aiFeatures: true,
            advancedAnalytics: true,
            prioritySupport: true,
            customDomain: true
        },
        isPopular: false,
        sortOrder: 3
    },
    {
        name: 'Enterprise',
        description: 'Custom solution for large organizations and agencies',
        price: {
            amount: 299,
            currency: 'USD',
            billingCycle: 'monthly'
        },
        features: {
            maxFunnels: -1, // Unlimited
            maxLeads: -1, // Unlimited
            maxStaff: 25,
            maxAutomationRules: 100,
            aiFeatures: true,
            advancedAnalytics: true,
            prioritySupport: true,
            customDomain: true
        },
        isPopular: false,
        sortOrder: 4
    },
    {
        name: 'Starter Annual',
        description: 'Starter plan with annual billing (2 months free)',
        price: {
            amount: 290,
            currency: 'USD',
            billingCycle: 'yearly'
        },
        features: {
            maxFunnels: -1, // Unlimited
            maxLeads: -1, // Unlimited
            maxStaff: 1,
            maxAutomationRules: 5,
            aiFeatures: false,
            advancedAnalytics: false,
            prioritySupport: false,
            customDomain: false
        },
        isPopular: false,
        sortOrder: 5
    },
    {
        name: 'Professional Annual',
        description: 'Professional plan with annual billing (2 months free)',
        price: {
            amount: 790,
            currency: 'USD',
            billingCycle: 'yearly'
        },
        features: {
            maxFunnels: 10,
            maxLeads: -1, // Unlimited
            maxStaff: 3,
            maxAutomationRules: 15,
            aiFeatures: true,
            advancedAnalytics: true,
            prioritySupport: false,
            customDomain: true
        },
        isPopular: true,
        sortOrder: 6
    }
];

async function seedSubscriptionPlans() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB');

        // Clear existing plans
        await SubscriptionPlan.deleteMany({});
        console.log('🗑️ Cleared existing subscription plans');

        // Create admin user ID (you'll need to replace this with an actual admin ID)
        const adminId = new mongoose.Types.ObjectId(); // Replace with actual admin ID

        // Insert sample plans
        const plans = await SubscriptionPlan.insertMany(
            samplePlans.map(plan => ({ ...plan, createdBy: adminId }))
        );

        console.log(`✅ Successfully created ${plans.length} subscription plans:`);
        plans.forEach(plan => {
            console.log(`   - ${plan.name}: $${plan.price.amount}/${plan.price.billingCycle}`);
        });

        console.log('\n🎯 Sample plans created successfully!');
        console.log('📝 Note: Update the adminId in this script with an actual admin user ID');

    } catch (error) {
        console.error('❌ Error seeding subscription plans:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the seeding function
if (require.main === module) {
    seedSubscriptionPlans();
}

module.exports = { seedSubscriptionPlans, samplePlans };
