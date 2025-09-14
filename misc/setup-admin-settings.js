const mongoose = require('mongoose');
const { AdminSystemSettings } = require('./schema');

async function setupAdminSettings() {
    try {
        console.log('🔧 Setting up AdminSystemSettings...');
        
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB');

        // Check if AdminSystemSettings already exists
        const existingSettings = await AdminSystemSettings.findOne();
        if (existingSettings) {
            console.log('✅ AdminSystemSettings already exists');
            await mongoose.disconnect();
            return;
        }

        // Create default AdminSystemSettings
        const defaultSettings = new AdminSystemSettings({
            platformConfig: {
                siteName: 'FunnelsEye',
                siteDescription: 'Advanced MLM and Coaching Platform',
                siteUrl: 'https://funnelseye.com',
                contactEmail: 'admin@funnelseye.com',
                supportEmail: 'support@funnelseye.com',
                maintenanceMode: false,
                maintenanceMessage: 'We are currently under maintenance. Please check back later.'
            },
            databaseConfig: {
                connectionPoolSize: 10,
                queryTimeout: 30000,
                enableLogging: true
            },
            corsConfig: {
                allowedOrigins: ['http://localhost:3000', 'http://localhost:8080'],
                allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                allowedHeaders: ['Content-Type', 'Authorization'],
                credentials: true
            },
            paymentSystem: {
                currencies: {
                    supported: ['USD', 'INR', 'EUR'],
                    default: 'USD'
                },
                taxSettings: {
                    enableTax: true,
                    defaultTaxRate: 0.18,
                    taxInclusive: false
                },
                razorpay: {
                    enabled: true,
                    keyId: 'rzp_test_1234567890',
                    keySecret: 'test_secret_1234567890',
                    webhookSecret: 'test_webhook_secret'
                },
                stripe: {
                    enabled: false,
                    publishableKey: '',
                    secretKey: '',
                    webhookSecret: ''
                },
                paypal: {
                    enabled: false,
                    clientId: '',
                    clientSecret: '',
                    sandbox: true
                }
            },
            mlmCommissionStructure: {
                levels: 10,
                commissionRates: [0.05, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01],
                payoutSchedule: 'weekly',
                minimumPayout: 10
            },
            security: {
                passwordPolicy: {
                    minLength: 8,
                    requireUppercase: true,
                    requireLowercase: true,
                    requireNumbers: true,
                    requireSpecialChars: true
                },
                sessionTimeout: 3600,
                maxLoginAttempts: 5,
                lockoutDuration: 900
            },
            notifications: {
                email: {
                    enabled: true,
                    smtpHost: 'smtp.gmail.com',
                    smtpPort: 587,
                    smtpUser: '',
                    smtpPass: ''
                },
                sms: {
                    enabled: false,
                    provider: 'twilio',
                    apiKey: '',
                    apiSecret: ''
                }
            },
            integrations: {
                zoom: {
                    enabled: true,
                    apiKey: '',
                    apiSecret: '',
                    webhookSecret: ''
                },
                googleAnalytics: {
                    enabled: false,
                    trackingId: ''
                }
            },
            aiServices: {
                openai: {
                    enabled: true,
                    apiKey: '',
                    model: 'gpt-3.5-turbo',
                    maxTokens: 1000
                },
                anthropic: {
                    enabled: false,
                    apiKey: '',
                    model: 'claude-3-sonnet'
                }
            },
            workflowConfig: {
                autoApproval: false,
                notificationDelay: 300,
                maxConcurrentTasks: 10
            },
            analyticsConfig: {
                enableTracking: true,
                retentionPeriod: 365,
                anonymizeData: false
            },
            systemStatus: {
                version: '1.0.0',
                lastUpdated: new Date(),
                healthCheck: {
                    database: 'healthy',
                    redis: 'healthy',
                    externalApis: 'healthy'
                }
            },
            creditPackages: [
                {
                    name: 'Starter Pack',
                    credits: 1000,
                    price: 10,
                    currency: 'USD',
                    description: 'Perfect for getting started',
                    active: true
                },
                {
                    name: 'Professional Pack',
                    credits: 5000,
                    price: 45,
                    currency: 'USD',
                    description: 'For professional users',
                    active: true
                },
                {
                    name: 'Enterprise Pack',
                    credits: 15000,
                    price: 120,
                    currency: 'USD',
                    description: 'For enterprise users',
                    active: true
                }
            ]
        });

        await defaultSettings.save();
        console.log('✅ AdminSystemSettings created successfully');

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error setting up AdminSystemSettings:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

setupAdminSettings();
