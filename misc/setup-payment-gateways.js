const mongoose = require('mongoose');
const PaymentGatewayConfig = require('./schema/PaymentGatewayConfig');
const GlobalPaymentSettings = require('./schema/GlobalPaymentSettings');
const AdminSystemSettings = require('./schema/AdminSystemSettings');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/FunnelsEye', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function setupPaymentGateways() {
    try {
        console.log('🚀 Setting up Payment Gateways Configuration...');
        
        // 1. Setup Razorpay Gateway
        console.log('📱 Setting up Razorpay gateway...');
        await setupRazorpayGateway();
        
        // 2. Setup Stripe Gateway
        console.log('💳 Setting up Stripe gateway...');
        await setupStripeGateway();
        
        // 3. Setup PayPal Gateway
        console.log('💰 Setting up PayPal gateway...');
        await setupPayPalGateway();
        
        // 4. Setup Bank Transfer Gateway
        console.log('🏦 Setting up Bank Transfer gateway...');
        await setupBankTransferGateway();
        
        // 5. Setup Global Payment Settings
        console.log('⚙️ Setting up Global Payment Settings...');
        await setupGlobalPaymentSettings();
        
        console.log('✅ All payment gateways configured successfully!');
        
    } catch (error) {
        console.error('❌ Error setting up payment gateways:', error);
    } finally {
        mongoose.connection.close();
    }
}

async function setupRazorpayGateway() {
    try {
        // Check if Razorpay gateway already exists
        let razorpayGateway = await PaymentGatewayConfig.findOne({ gatewayName: 'razorpay' });
        
        if (!razorpayGateway) {
            razorpayGateway = new PaymentGatewayConfig({
                gatewayName: 'razorpay',
                isEnabled: true,
                isActive: true,
                priority: 1,
                config: {
                    razorpay: {
                        keyId: 'YOUR_RAZORPAY_KEY_ID', // Replace with actual key
                        keySecret: 'YOUR_RAZORPAY_KEY_SECRET', // Replace with actual secret
                        webhookSecret: 'YOUR_WEBHOOK_SECRET', // Replace with actual webhook secret
                        environment: 'test' // Change to 'live' for production
                    }
                },
                supportedPaymentMethods: ['card', 'upi', 'netbanking', 'wallet'],
                supportedCurrencies: ['INR'],
                feeStructure: {
                    percentage: 2.0, // 2% fee
                    fixed: 3, // ₹3 fixed fee
                    currency: 'INR'
                },
                limits: {
                    minAmount: 1,
                    maxAmount: 1000000,
                    dailyLimit: 10000000,
                    monthlyLimit: 100000000
                },
                health: {
                    lastCheck: new Date(),
                    isHealthy: true,
                    responseTime: 0,
                    successRate: 100,
                    errorCount: 0
                },
                features: {
                    supportsRefunds: true,
                    supportsPartialRefunds: true,
                    supportsRecurringPayments: true,
                    supportsInstallments: false,
                    supportsInternationalPayments: false
                },
                webhooks: {
                    enabled: true,
                    url: 'https://your-domain.com/api/webhooks/razorpay',
                    events: ['payment.captured', 'payment.failed', 'refund.created'],
                    lastWebhookReceived: null,
                    webhookFailures: 0
                },
                adminSettings: {
                    autoEnable: false,
                    requireApproval: true,
                    notificationEmail: 'admin@funnelseye.com',
                    allowedUserTypes: ['coach', 'customer', 'admin']
                },
                description: 'Razorpay payment gateway for Indian payments',
                documentationUrl: 'https://razorpay.com/docs/',
                supportEmail: 'support@razorpay.com',
                supportPhone: '+91-80-4716-4444'
            });
        } else {
            // Update existing Razorpay gateway
            razorpayGateway.isEnabled = true;
            razorpayGateway.isActive = true;
            razorpayGateway.priority = 1;
        }
        
        await razorpayGateway.save();
        console.log('✅ Razorpay gateway configured');
        
    } catch (error) {
        console.error('❌ Error setting up Razorpay:', error);
    }
}

async function setupStripeGateway() {
    try {
        let stripeGateway = await PaymentGatewayConfig.findOne({ gatewayName: 'stripe' });
        
        if (!stripeGateway) {
            stripeGateway = new PaymentGatewayConfig({
                gatewayName: 'stripe',
                isEnabled: false, // Disabled by default
                isActive: false,
                priority: 2,
                config: {
                    stripe: {
                        publishableKey: 'YOUR_STRIPE_PUBLISHABLE_KEY',
                        secretKey: 'YOUR_STRIPE_SECRET_KEY',
                        webhookSecret: 'YOUR_STRIPE_WEBHOOK_SECRET',
                        environment: 'test'
                    }
                },
                supportedPaymentMethods: ['card', 'apple_pay', 'google_pay'],
                supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP'],
                feeStructure: {
                    percentage: 2.9,
                    fixed: 30,
                    currency: 'INR'
                },
                limits: {
                    minAmount: 50,
                    maxAmount: 5000000,
                    dailyLimit: 50000000,
                    monthlyLimit: 500000000
                },
                health: {
                    lastCheck: new Date(),
                    isHealthy: true,
                    responseTime: 0,
                    successRate: 100,
                    errorCount: 0
                },
                features: {
                    supportsRefunds: true,
                    supportsPartialRefunds: true,
                    supportsRecurringPayments: true,
                    supportsInstallments: false,
                    supportsInternationalPayments: true
                },
                webhooks: {
                    enabled: true,
                    url: 'https://your-domain.com/api/webhooks/stripe',
                    events: ['payment_intent.succeeded', 'payment_intent.payment_failed'],
                    lastWebhookReceived: null,
                    webhookFailures: 0
                },
                adminSettings: {
                    autoEnable: false,
                    requireApproval: true,
                    notificationEmail: 'admin@funnelseye.com',
                    allowedUserTypes: ['coach', 'customer', 'admin']
                },
                description: 'Stripe payment gateway for international payments',
                documentationUrl: 'https://stripe.com/docs',
                supportEmail: 'support@stripe.com'
            });
        }
        
        await stripeGateway.save();
        console.log('✅ Stripe gateway configured');
        
    } catch (error) {
        console.error('❌ Error setting up Stripe:', error);
    }
}

async function setupPayPalGateway() {
    try {
        let paypalGateway = await PaymentGatewayConfig.findOne({ gatewayName: 'paypal' });
        
        if (!paypalGateway) {
            paypalGateway = new PaymentGatewayConfig({
                gatewayName: 'paypal',
                isEnabled: false, // Disabled by default
                isActive: false,
                priority: 3,
                config: {
                    paypal: {
                        clientId: 'YOUR_PAYPAL_CLIENT_ID',
                        clientSecret: 'YOUR_PAYPAL_CLIENT_SECRET',
                        webhookId: 'YOUR_PAYPAL_WEBHOOK_ID',
                        environment: 'sandbox'
                    }
                },
                supportedPaymentMethods: ['paypal'],
                supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP'],
                feeStructure: {
                    percentage: 3.4,
                    fixed: 0,
                    currency: 'INR'
                },
                limits: {
                    minAmount: 100,
                    maxAmount: 10000000,
                    dailyLimit: 100000000,
                    monthlyLimit: 1000000000
                },
                health: {
                    lastCheck: new Date(),
                    isHealthy: true,
                    responseTime: 0,
                    successRate: 100,
                    errorCount: 0
                },
                features: {
                    supportsRefunds: true,
                    supportsPartialRefunds: true,
                    supportsRecurringPayments: true,
                    supportsInstallments: false,
                    supportsInternationalPayments: true
                },
                webhooks: {
                    enabled: true,
                    url: 'https://your-domain.com/api/webhooks/paypal',
                    events: ['PAYMENT.CAPTURE.COMPLETED', 'PAYMENT.CAPTURE.DENIED'],
                    lastWebhookReceived: null,
                    webhookFailures: 0
                },
                adminSettings: {
                    autoEnable: false,
                    requireApproval: true,
                    notificationEmail: 'admin@funnelseye.com',
                    allowedUserTypes: ['coach', 'customer', 'admin']
                },
                description: 'PayPal payment gateway for international payments',
                documentationUrl: 'https://developer.paypal.com/docs',
                supportEmail: 'support@paypal.com'
            });
        }
        
        await paypalGateway.save();
        console.log('✅ PayPal gateway configured');
        
    } catch (error) {
        console.error('❌ Error setting up PayPal:', error);
    }
}

async function setupBankTransferGateway() {
    try {
        let bankTransferGateway = await PaymentGatewayConfig.findOne({ gatewayName: 'bank_transfer' });
        
        if (!bankTransferGateway) {
            bankTransferGateway = new PaymentGatewayConfig({
                gatewayName: 'bank_transfer',
                isEnabled: true,
                isActive: true,
                priority: 4,
                config: {
                    bank_transfer: {
                        bankName: 'State Bank of India',
                        accountNumber: 'YOUR_BANK_ACCOUNT_NUMBER',
                        ifscCode: 'YOUR_IFSC_CODE',
                        accountHolderName: 'FunnelsEye Private Limited',
                        branchName: 'YOUR_BRANCH_NAME'
                    }
                },
                supportedPaymentMethods: ['bank_transfer'],
                supportedCurrencies: ['INR'],
                feeStructure: {
                    percentage: 0,
                    fixed: 0,
                    currency: 'INR'
                },
                limits: {
                    minAmount: 1000,
                    maxAmount: 10000000,
                    dailyLimit: 50000000,
                    monthlyLimit: 500000000
                },
                health: {
                    lastCheck: new Date(),
                    isHealthy: true,
                    responseTime: 0,
                    successRate: 100,
                    errorCount: 0
                },
                features: {
                    supportsRefunds: true,
                    supportsPartialRefunds: true,
                    supportsRecurringPayments: false,
                    supportsInstallments: false,
                    supportsInternationalPayments: false
                },
                webhooks: {
                    enabled: false,
                    url: '',
                    events: [],
                    lastWebhookReceived: null,
                    webhookFailures: 0
                },
                adminSettings: {
                    autoEnable: false,
                    requireApproval: true,
                    notificationEmail: 'admin@funnelseye.com',
                    allowedUserTypes: ['coach', 'customer', 'admin']
                },
                description: 'Bank transfer for manual payments',
                documentationUrl: '',
                supportEmail: 'admin@funnelseye.com',
                supportPhone: '+91-XXXXXXXXXX'
            });
        }
        
        await bankTransferGateway.save();
        console.log('✅ Bank Transfer gateway configured');
        
    } catch (error) {
        console.error('❌ Error setting up Bank Transfer:', error);
    }
}

async function setupGlobalPaymentSettings() {
    try {
        let globalSettings = await GlobalPaymentSettings.findOne();
        
        if (!globalSettings) {
            globalSettings = new GlobalPaymentSettings({
                // Platform Fees
                platformFee: {
                    percentage: 10,
                    fixedAmount: 0,
                    isPercentageBased: true
                },
                
                // Commission Structure
                commission: {
                    directCommission: {
                        percentage: 70
                    },
                    level1Commission: {
                        percentage: 15
                    },
                    level2Commission: {
                        percentage: 10
                    },
                    level3Commission: {
                        percentage: 5
                    }
                },
                
                // Payout Settings
                payout: {
                    monthlyPayout: {
                        isEnabled: true,
                        dayOfMonth: 1,
                        minimumThreshold: 1000
                    },
                    instantPayout: {
                        isEnabled: false,
                        minimumThreshold: 5000,
                        feePercentage: 1
                    }
                },
                
                // Razorpay Configuration
                razorpay: {
                    keyId: 'YOUR_RAZORPAY_KEY_ID',
                    keySecret: 'YOUR_RAZORPAY_KEY_SECRET',
                    accountNumber: 'YOUR_RAZORPAYX_ACCOUNT_NUMBER',
                    isActive: true,
                    webhookSecret: 'YOUR_WEBHOOK_SECRET'
                },
                
                // Central Account Settings
                centralAccount: {
                    bankAccount: {
                        accountNumber: 'YOUR_CENTRAL_ACCOUNT_NUMBER',
                        ifscCode: 'YOUR_CENTRAL_IFSC_CODE',
                        accountHolder: 'FunnelsEye Private Limited',
                        bankName: 'State Bank of India',
                        branchName: 'YOUR_BRANCH_NAME'
                    }
                },
                
                // Tax Settings
                taxSettings: {
                    gstEnabled: true,
                    gstPercentage: 18,
                    tdsEnabled: false,
                    tdsPercentage: 0
                },
                
                // Currency Settings
                currencies: {
                    supported: ['INR', 'USD'],
                    default: 'INR'
                }
            });
        } else {
            // Update existing settings
            globalSettings.razorpay = {
                keyId: 'YOUR_RAZORPAY_KEY_ID',
                keySecret: 'YOUR_RAZORPAY_KEY_SECRET',
                accountNumber: 'YOUR_RAZORPAYX_ACCOUNT_NUMBER',
                isActive: true,
                webhookSecret: 'YOUR_WEBHOOK_SECRET'
            };
        }
        
        await globalSettings.save();
        console.log('✅ Global Payment Settings configured');
        
    } catch (error) {
        console.error('❌ Error setting up Global Payment Settings:', error);
    }
}

// Run the setup
setupPaymentGateways();
