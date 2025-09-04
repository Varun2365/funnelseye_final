const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

// Import admin schemas
const AdminUser = require('../schema/AdminUser');
const Plan = require('../admin/schemas/Plan');
const CreditPackage = require('../admin/schemas/CreditPackage');
const CommissionRate = require('../admin/schemas/CommissionRate');
const PaymentGateway = require('../admin/schemas/PaymentGateway');

// Sample data for seeding
const samplePlans = [
    {
        name: 'Basic Plan',
        type: 'basic',
        description: 'Perfect for beginners starting their coaching journey',
        price: {
            monthly: 999,
            yearly: 9999,
            currency: 'INR'
        },
        features: {
            aiCredits: { monthly: 100, yearly: 1200 },
            // whatsappCredits: { monthly: 50, yearly: 600 }, // WhatsApp functionality moved to dustbin/whatsapp-dump/
            emailCredits: { monthly: 200, yearly: 2400 },
            maxLeads: 500,
            maxStaff: 2,
            maxFunnels: 5,
            customDomains: 1,
            prioritySupport: false,
            advancedAnalytics: false,
            apiAccess: false
        },
        isActive: true,
        isPopular: false,
        sortOrder: 1
    },
    {
        name: 'Pro Plan',
        type: 'pro',
        description: 'Advanced features for growing coaches',
        price: {
            monthly: 1999,
            yearly: 19999,
            currency: 'INR'
        },
        features: {
            aiCredits: { monthly: 300, yearly: 3600 },
            // whatsappCredits: { monthly: 150, yearly: 1800 }, // WhatsApp functionality moved to dustbin/whatsapp-dump/
            emailCredits: { monthly: 500, yearly: 6000 },
            maxLeads: 2000,
            maxStaff: 5,
            maxFunnels: 15,
            customDomains: 3,
            prioritySupport: true,
            advancedAnalytics: true,
            apiAccess: false
        },
        isActive: true,
        isPopular: true,
        sortOrder: 2
    },
    {
        name: 'Enterprise Plan',
        type: 'enterprise',
        description: 'Full-featured plan for established coaches',
        price: {
            monthly: 4999,
            yearly: 49999,
            currency: 'INR'
        },
        features: {
            aiCredits: { monthly: 1000, yearly: 12000 },
            // whatsappCredits: { monthly: 500, yearly: 6000 }, // WhatsApp functionality moved to dustbin/whatsapp-dump/
            emailCredits: { monthly: 1000, yearly: 12000 },
            maxLeads: 10000,
            maxStaff: 20,
            maxFunnels: 50,
            customDomains: 10,
            prioritySupport: true,
            advancedAnalytics: true,
            apiAccess: true
        },
        isActive: true,
        isPopular: false,
        sortOrder: 3
    }
];

const sampleCreditPackages = [
    {
        name: 'AI Credits Starter',
        type: 'ai',
        description: '100 AI credits for content generation',
        credits: 100,
        price: {
            amount: 499,
            currency: 'INR',
            originalPrice: 599,
            discountPercentage: 17
        },
        validity: { days: 365 },
        features: {
            priority: 'medium',
            support: 'basic'
        },
        isActive: true,
        isPopular: true,
        sortOrder: 1
    },
    {
        // name: 'WhatsApp Credits Pro', // WhatsApp functionality moved to dustbin/whatsapp-dump/
        // type: 'whatsapp', // WhatsApp functionality moved to dustbin/whatsapp-dump/
        // description: '500 WhatsApp message credits', // WhatsApp functionality moved to dustbin/whatsapp-dump/
        credits: 500,
        price: {
            amount: 799,
            currency: 'INR',
            originalPrice: 999,
            discountPercentage: 20
        },
        validity: { days: 365 },
        features: {
            priority: 'high',
            support: 'priority'
        },
        isActive: true,
        isPopular: true,
        sortOrder: 2
    },
    {
        name: 'Email Credits Bundle',
        type: 'email',
        description: '1000 email credits for campaigns',
        credits: 1000,
        price: {
            amount: 1299,
            currency: 'INR',
            originalPrice: 1599,
            discountPercentage: 19
        },
        validity: { days: 365 },
        features: {
            priority: 'medium',
            support: 'basic'
        },
        isActive: true,
        isPopular: false,
        sortOrder: 3
    }
];

const sampleCommissionRates = [
    {
        name: 'Standard Unilevel',
        type: 'unilevel',
        description: 'Standard unilevel commission structure',
        structure: {
            levels: [
                { level: 1, percentage: 10, qualification: 'none' },
                { level: 2, percentage: 5, qualification: 'none' },
                { level: 3, percentage: 3, qualification: 'none' },
                { level: 4, percentage: 2, qualification: 'none' },
                { level: 5, percentage: 1, qualification: 'none' }
            ],
            maxLevels: 5
        },
        triggers: {
            subscriptionRenewal: true,
            creditPurchase: true,
            newCoachSignup: true
        },
        qualifications: {
            personalSales: 1000,
            teamSales: 5000,
            activeDays: 30,
            minimumTeamSize: 3
        },
        payouts: {
            frequency: 'monthly',
            minimumAmount: 100,
            processingDay: 1,
            autoPayout: true
        },
        isActive: true,
        effectiveFrom: new Date()
    },
    {
        name: 'Affiliate Recruitment',
        type: 'affiliate',
        description: '3-tier affiliate commission for coach recruitment',
        structure: {
            levels: [
                { level: 1, percentage: 15, qualification: 'none' },
                { level: 2, percentage: 8, qualification: 'none' },
                { level: 3, percentage: 5, qualification: 'none' }
            ],
            maxLevels: 3
        },
        triggers: {
            subscriptionRenewal: false,
            creditPurchase: false,
            newCoachSignup: true
        },
        qualifications: {
            personalSales: 0,
            teamSales: 0,
            activeDays: 0,
            minimumTeamSize: 0
        },
        payouts: {
            frequency: 'monthly',
            minimumAmount: 50,
            processingDay: 1,
            autoPayout: true
        },
        isActive: true,
        effectiveFrom: new Date()
    }
];

const samplePaymentGateways = [
    {
        name: 'razorpay',
        displayName: 'Razorpay',
        isActive: true,
        isDefault: true,
        priority: 1,
        credentials: {
            apiKey: 'rzp_test_' + Math.random().toString(36).substr(2, 9),
            secretKey: 'test_secret_' + Math.random().toString(36).substr(2, 9)
        },
        settings: {
            testMode: true,
            supportedCurrencies: ['INR', 'USD'],
            defaultCurrency: 'INR',
            supportedPaymentMethods: ['card', 'netbanking', 'upi', 'wallet']
        },
        fees: {
            percentage: 2.5,
            fixed: 0,
            currency: 'INR'
        },
        markup: {
            enabled: true,
            percentage: 1.0,
            fixed: 0
        },
        webhooks: {
            enabled: true,
            events: ['payment.success', 'payment.failed', 'refund.processed']
        },
        limits: {
            dailyTransactionLimit: 1000000,
            monthlyTransactionLimit: 10000000,
            perTransactionLimit: 100000
        },
        status: {
            isHealthy: true,
            errorCount: 0
        }
    }
];

async function seedAdminData() {
    try {
        console.log('🌱 Starting admin data seeding...');
        
        // Get the admin user first
        const adminUser = await AdminUser.findOne({ email: 'admin@funnelseye.com' });
        if (!adminUser) {
            console.error('❌ Admin user not found. Please run seedAdmin.js first.');
            process.exit(1);
        }
        console.log(`✅ Found admin user: ${adminUser.name} (${adminUser._id})`);

        // Seed Plans
        console.log('📋 Seeding subscription plans...');
        for (const planData of samplePlans) {
            const existingPlan = await Plan.findOne({ name: planData.name });
            if (!existingPlan) {
                const plan = new Plan({
                    ...planData,
                    createdBy: adminUser._id
                });
                await plan.save();
                console.log(`✅ Created plan: ${plan.name}`);
            } else {
                console.log(`⏭️ Plan already exists: ${planData.name}`);
            }
        }

        // Seed Credit Packages
        console.log('💳 Seeding credit packages...');
        for (const packageData of sampleCreditPackages) {
            const existingPackage = await CreditPackage.findOne({ name: packageData.name });
            if (!existingPackage) {
                const creditPackage = new CreditPackage({
                    ...packageData,
                    createdBy: adminUser._id
                });
                await creditPackage.save();
                console.log(`✅ Created credit package: ${creditPackage.name}`);
            } else {
                console.log(`⏭️ Credit package already exists: ${packageData.name}`);
            }
        }

        // Seed Commission Rates
        console.log('💰 Seeding commission rates...');
        for (const rateData of sampleCommissionRates) {
            const existingRate = await CommissionRate.findOne({ name: rateData.name });
            if (!existingRate) {
                const commissionRate = new CommissionRate({
                    ...rateData,
                    createdBy: adminUser._id
                });
                await commissionRate.save();
                console.log(`✅ Created commission rate: ${commissionRate.name}`);
            } else {
                console.log(`⏭️ Commission rate already exists: ${rateData.name}`);
            }
        }

        // Seed Payment Gateways
        console.log('🏦 Seeding payment gateways...');
        for (const gatewayData of samplePaymentGateways) {
            const existingGateway = await PaymentGateway.findOne({ name: gatewayData.name });
            if (!existingGateway) {
                const paymentGateway = new PaymentGateway({
                    ...gatewayData,
                    createdBy: adminUser._id
                });
                await paymentGateway.save();
                console.log(`✅ Created payment gateway: ${paymentGateway.displayName}`);
            } else {
                console.log(`⏭️ Payment gateway already exists: ${gatewayData.displayName}`);
            }
        }

        console.log('🎉 Admin data seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`- Plans: ${samplePlans.length}`);
        console.log(`- Credit Packages: ${sampleCreditPackages.length}`);
        console.log(`- Commission Rates: ${sampleCommissionRates.length}`);
        console.log(`- Payment Gateways: ${samplePaymentGateways.length}`);

    } catch (error) {
        console.error('❌ Error seeding admin data:', error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the seeding function
if (require.main === module) {
    connectDB().then(() => {
        seedAdminData();
    }).catch(error => {
        console.error('❌ Failed to connect to database:', error);
        process.exit(1);
    });
}

module.exports = { seedAdminData };
