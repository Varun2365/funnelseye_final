const mongoose = require('mongoose');
const { AdminSystemSettings } = require('./schema');

// Test database connection and payment settings
async function testPaymentSystem() {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect('mongodb://localhost:27017/funnelseye', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Database connected successfully');

        // Check if payment settings exist
        console.log('\n🔍 Checking for existing payment settings...');
        let settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        
        if (!settings) {
            console.log('⚠️  No global payment settings found, checking for any settings...');
            settings = await AdminSystemSettings.findOne({}).sort({ createdAt: -1 });
            
            if (!settings) {
                console.log('❌ No payment settings found at all. Creating default settings...');
                
                const defaultSettings = {
                    settingId: 'global',
                    platformFees: {
                        defaultPercentage: 10,
                        byCategory: {},
                        byPriceRange: [],
                        minimumAmount: 1
                    },
                    mlmCommissionStructure: {
                        level1: 5,
                        level2: 3,
                        level3: 2,
                        level4: 1,
                        level5: 0.5,
                        level6: 0.3,
                        level7: 0.2,
                        level8: 0.1,
                        level9: 0.05,
                        level10: 0.02
                    },
                    commissionEligibility: {
                        minimumCoachLevel: 1,
                        minimumPerformanceRating: 3.0,
                        minimumActiveDays: 30,
                        minimumTeamSize: 1
                    },
                    payoutSettings: {
                        frequency: 'monthly',
                        minimumPayoutAmount: 50,
                        allowedPayoutMethods: ['bank_transfer', 'paypal', 'stripe_connect']
                    },
                    refundPolicy: {
                        refundsAllowed: true,
                        timeLimit: 7,
                        partialRefundsAllowed: true
                    },
                    paymentGateways: {
                        stripe: { enabled: false, config: {} },
                        paypal: { enabled: false, config: {} },
                        razorpay: { enabled: false, config: {} }
                    },
                    currencies: {
                        supported: ['USD', 'INR', 'EUR', 'GBP'],
                        default: 'USD'
                    },
                    taxSettings: {
                        taxHandledBy: 'coach'
                    }
                };

                settings = await AdminSystemSettings.create(defaultSettings);
                console.log('✅ Default payment settings created successfully');
            } else {
                console.log(`⚠️  Found existing settings with ID: ${settings.settingId}`);
                console.log('🔄 Updating existing settings to have global settingId...');
                settings.settingId = 'global';
                await settings.save();
                console.log('✅ Settings updated to have global settingId');
            }
        } else {
            console.log('✅ Global payment settings found');
        }

        console.log('\n📊 Current Payment Settings:');
        console.log(`- Setting ID: ${settings.settingId}`);
        console.log(`- Platform Fee: ${settings.platformFees.defaultPercentage}%`);
        console.log(`- MLM Levels: ${Object.keys(settings.mlmCommissionStructure).length} levels configured`);
        console.log(`- Payout Frequency: ${settings.payoutSettings.frequency}`);
        console.log(`- Supported Currencies: ${settings.currencies.supported.join(', ')}`);
        console.log(`- Default Currency: ${settings.currencies.default}`);

        console.log('\n🎯 Payment system is now properly configured!');
        console.log('You can now test the /api/payments endpoint.');

    } catch (error) {
        console.error('❌ Error testing payment system:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Database disconnected');
    }
}

// Run the test
testPaymentSystem();
