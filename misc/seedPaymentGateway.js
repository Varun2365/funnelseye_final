/**
 * Seed Script: Initialize Default Payment Gateway Configuration
 * 
 * This script sets up the default Razorpay payment gateway configuration
 * for the Funnelseye Payments system.
 */

const mongoose = require('mongoose');
const PaymentGatewayConfig = require('../schema/PaymentGatewayConfig');
const logger = require('../utils/logger');

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye';

// Default Razorpay configuration
const defaultRazorpayConfig = {
    gatewayName: 'razorpay',
    isEnabled: true,
    isActive: true,
    priority: 1,
    config: {
        razorpay: {
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_TEST_KEY_ID',
            keySecret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_TEST_KEY_SECRET',
            webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'YOUR_WEBHOOK_SECRET',
            environment: 'test' // Change to 'live' for production
        }
    },
    supportedPaymentMethods: ['card', 'upi', 'netbanking', 'wallet'],
    supportedCurrencies: ['INR'],
    feeStructure: {
        percentage: 2.5, // 2.5% transaction fee
        fixed: 0,
        currency: 'INR'
    },
    limits: {
        minAmount: 1,
        maxAmount: 1000000,
        dailyLimit: 10000000,
        monthlyLimit: 100000000
    },
    features: {
        supportsRefunds: true,
        supportsPartialRefunds: true,
        supportsRecurringPayments: false,
        supportsInstallments: false,
        supportsInternationalPayments: false
    },
    webhooks: {
        enabled: true,
        url: process.env.RAZORPAY_WEBHOOK_URL || 'https://yourdomain.com/api/funnelseye-payments/webhook/razorpay',
        events: ['payment.captured', 'payment.failed', 'refund.processed']
    },
    adminSettings: {
        autoEnable: false,
        requireApproval: true,
        notificationEmail: process.env.ADMIN_EMAIL || 'admin@funnelseye.com',
        allowedUserTypes: ['coach', 'customer', 'admin', 'system']
    },
    description: 'Razorpay - Leading Payment Gateway for India',
    documentationUrl: 'https://razorpay.com/docs/',
    supportEmail: 'support@razorpay.com',
    supportPhone: '+91-80-6746-2200'
};

// Default Stripe configuration (for future use)
const defaultStripeConfig = {
    gatewayName: 'stripe',
    isEnabled: false, // Disabled by default
    isActive: false,
    priority: 2,
    config: {
        stripe: {
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_TEST_KEY',
            secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_TEST_KEY',
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_YOUR_WEBHOOK_SECRET',
            environment: 'test'
        }
    },
    supportedPaymentMethods: ['card', 'apple_pay', 'google_pay'],
    supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP'],
    feeStructure: {
        percentage: 2.9,
        fixed: 30, // 30 cents
        currency: 'USD'
    },
    limits: {
        minAmount: 50, // 50 cents
        maxAmount: 999999,
        dailyLimit: 10000000,
        monthlyLimit: 100000000
    },
    features: {
        supportsRefunds: true,
        supportsPartialRefunds: true,
        supportsRecurringPayments: true,
        supportsInstallments: true,
        supportsInternationalPayments: true
    },
    webhooks: {
        enabled: false,
        url: process.env.STRIPE_WEBHOOK_URL || 'https://yourdomain.com/api/funnelseye-payments/webhook/stripe',
        events: ['payment_intent.succeeded', 'payment_intent.payment_failed', 'charge.refunded']
    },
    adminSettings: {
        autoEnable: false,
        requireApproval: true,
        notificationEmail: process.env.ADMIN_EMAIL || 'admin@funnelseye.com',
        allowedUserTypes: ['coach', 'customer', 'admin', 'system']
    },
    description: 'Stripe - Global Payment Processing Platform',
    documentationUrl: 'https://stripe.com/docs',
    supportEmail: 'support@stripe.com',
    supportPhone: '+1-888-254-3489'
};

// Default PayPal configuration (for future use)
const defaultPayPalConfig = {
    gatewayName: 'paypal',
    isEnabled: false, // Disabled by default
    isActive: false,
    priority: 3,
    config: {
        paypal: {
            clientId: process.env.PAYPAL_CLIENT_ID || 'YOUR_CLIENT_ID',
            clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
            webhookId: process.env.PAYPAL_WEBHOOK_ID || 'YOUR_WEBHOOK_ID',
            environment: 'sandbox'
        }
    },
    supportedPaymentMethods: ['paypal'],
    supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP'],
    feeStructure: {
        percentage: 3.49,
        fixed: 0,
        currency: 'USD'
    },
    limits: {
        minAmount: 1,
        maxAmount: 10000,
        dailyLimit: 100000,
        monthlyLimit: 1000000
    },
    features: {
        supportsRefunds: true,
        supportsPartialRefunds: true,
        supportsRecurringPayments: true,
        supportsInstallments: false,
        supportsInternationalPayments: true
    },
    webhooks: {
        enabled: false,
        url: process.env.PAYPAL_WEBHOOK_URL || 'https://yourdomain.com/api/funnelseye-payments/webhook/paypal',
        events: ['PAYMENT.CAPTURE.COMPLETED', 'PAYMENT.CAPTURE.DENIED', 'PAYMENT.CAPTURE.REFUNDED']
    },
    adminSettings: {
        autoEnable: false,
        requireApproval: true,
        notificationEmail: process.env.ADMIN_EMAIL || 'admin@funnelseye.com',
        allowedUserTypes: ['coach', 'customer', 'admin', 'system']
    },
    description: 'PayPal - Global Digital Payment Platform',
    documentationUrl: 'https://developer.paypal.com/docs/',
    supportEmail: 'support@paypal.com',
    supportPhone: '+1-888-221-1161'
};

// Default Bank Transfer configuration
const defaultBankTransferConfig = {
    gatewayName: 'bank_transfer',
    isEnabled: true,
    isActive: true,
    priority: 4,
    config: {
        bank_transfer: {
            bankName: process.env.BANK_NAME || 'State Bank of India',
            accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
            ifscCode: process.env.BANK_IFSC_CODE || 'SBIN0001234',
            accountHolderName: process.env.BANK_ACCOUNT_HOLDER || 'Funnelseye Technologies Pvt Ltd',
            branchName: process.env.BANK_BRANCH || 'Main Branch'
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
        minAmount: 100,
        maxAmount: 1000000,
        dailyLimit: 10000000,
        monthlyLimit: 100000000
    },
    features: {
        supportsRefunds: false,
        supportsPartialRefunds: false,
        supportsRecurringPayments: false,
        supportsInstallments: false,
        supportsInternationalPayments: false
    },
    webhooks: {
        enabled: false,
        url: '',
        events: []
    },
    adminSettings: {
        autoEnable: false,
        requireApproval: true,
        notificationEmail: process.env.ADMIN_EMAIL || 'admin@funnelseye.com',
        allowedUserTypes: ['coach', 'customer', 'admin', 'system']
    },
    description: 'Bank Transfer - Direct bank account transfers',
    documentationUrl: '',
    supportEmail: process.env.ADMIN_EMAIL || 'admin@funnelseye.com',
    supportPhone: process.env.ADMIN_PHONE || '+91-XXXXXXXXXX'
};

// Default Manual Payment configuration
const defaultManualConfig = {
    gatewayName: 'manual',
    isEnabled: true,
    isActive: true,
    priority: 5,
    config: {
        manual: {
            instructions: 'Please contact our support team to complete this payment manually.',
            contactEmail: process.env.SUPPORT_EMAIL || 'support@funnelseye.com',
            contactPhone: process.env.SUPPORT_PHONE || '+91-XXXXXXXXXX',
            processingTime: '24-48 hours'
        }
    },
    supportedPaymentMethods: ['manual'],
    supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP'],
    feeStructure: {
        percentage: 0,
        fixed: 0,
        currency: 'INR'
    },
    limits: {
        minAmount: 1,
        maxAmount: 1000000,
        dailyLimit: 10000000,
        monthlyLimit: 100000000
    },
    features: {
        supportsRefunds: false,
        supportsPartialRefunds: false,
        supportsRecurringPayments: false,
        supportsInstallments: false,
        supportsInternationalPayments: false
    },
    webhooks: {
        enabled: false,
        url: '',
        events: []
    },
    adminSettings: {
        autoEnable: false,
        requireApproval: true,
        notificationEmail: process.env.ADMIN_EMAIL || 'admin@funnelseye.com',
        allowedUserTypes: ['coach', 'customer', 'admin', 'system']
    },
    description: 'Manual Payment - Offline payment processing',
    documentationUrl: '',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@funnelseye.com',
    supportPhone: process.env.SUPPORT_PHONE || '+91-XXXXXXXXXX'
};

async function seedPaymentGateways() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        logger.info('[SeedPaymentGateway] Connected to MongoDB');

        // Clear existing gateway configurations
        await PaymentGatewayConfig.deleteMany({});
        logger.info('[SeedPaymentGateway] Cleared existing gateway configurations');

        // Create default gateway configurations
        const gateways = [
            defaultRazorpayConfig,
            defaultStripeConfig,
            defaultPayPalConfig,
            defaultBankTransferConfig,
            defaultManualConfig
        ];

        for (const gatewayConfig of gateways) {
            const gateway = new PaymentGatewayConfig(gatewayConfig);
            await gateway.save();
            logger.info(`[SeedPaymentGateway] Created ${gatewayConfig.gatewayName} gateway configuration`);
        }

        logger.info('[SeedPaymentGateway] All payment gateway configurations seeded successfully');

        // Display summary
        const totalGateways = await PaymentGatewayConfig.countDocuments();
        const activeGateways = await PaymentGatewayConfig.countDocuments({ isActive: true });
        const enabledGateways = await PaymentGatewayConfig.countDocuments({ isEnabled: true });

        console.log('\n🎉 Payment Gateway Seeding Complete!');
        console.log('=====================================');
        console.log(`Total Gateways: ${totalGateways}`);
        console.log(`Active Gateways: ${activeGateways}`);
        console.log(`Enabled Gateways: ${enabledGateways}`);
        console.log('\n📋 Gateway Status:');
        
        const allGateways = await PaymentGatewayConfig.find().sort({ priority: 1 });
        for (const gateway of allGateways) {
            const status = gateway.isActive ? '🟢 Active' : '🔴 Inactive';
            const enabled = gateway.isEnabled ? '✅ Enabled' : '❌ Disabled';
            console.log(`${gateway.gatewayName}: ${status} | ${enabled} | Priority: ${gateway.priority}`);
        }

        console.log('\n⚠️  IMPORTANT: Update environment variables with your actual API keys!');
        console.log('🔑 Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, etc. in your .env file');
        console.log('🌐 Update webhook URLs to your actual domain');
        console.log('📧 Update admin and support email addresses');

    } catch (error) {
        logger.error('[SeedPaymentGateway] Error seeding payment gateways:', error);
        console.error('❌ Error seeding payment gateways:', error.message);
    } finally {
        // Close MongoDB connection
        await mongoose.connection.close();
        logger.info('[SeedPaymentGateway] MongoDB connection closed');
    }
}

// Run the seeding function if this script is executed directly
if (require.main === module) {
    seedPaymentGateways()
        .then(() => {
            console.log('\n✅ Payment gateway seeding completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Payment gateway seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedPaymentGateways };
