const mongoose = require('mongoose');
const { AdminSystemSettings, AdminUser, AdminAuditLog } = require('./schema');

// Test the new admin system
async function testAdminSystem() {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect('mongodb://localhost:27017/FunnelsEye', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Database connected successfully');

        // Test 1: Create default admin system settings
        console.log('\n🔍 Testing Admin System Settings...');
        let adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
        
        if (!adminSettings) {
            console.log('❌ No admin system settings found. Creating default settings...');
            
            const defaultSettings = {
                settingId: 'global',
                platformConfig: {
                    platformName: 'FunnelsEye',
                    platformVersion: '1.0.0',
                    maintenanceMode: false,
                    maxUsers: 10000,
                    maxCoaches: 1000,
                    maxLeads: 100000
                },
                paymentSystem: {
                    platformFees: {
                        defaultPercentage: 10,
                        byCategory: {
                            fitness_training: 10,
                            nutrition_coaching: 8,
                            weight_loss: 12,
                            muscle_gain: 10,
                            sports_performance: 15,
                            wellness_coaching: 8,
                            rehabilitation: 12,
                            online_courses: 5,
                            ebooks: 3,
                            consultation: 15,
                            other: 10
                        },
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
                        minimumTeamSize: 1,
                        minimumMonthlyRevenue: 100,
                        requireActiveSubscription: true
                    },
                    payoutSettings: {
                        frequency: 'monthly',
                        minimumPayoutAmount: 50,
                        maximumPayoutAmount: 10000,
                        allowedPayoutMethods: ['bank_transfer', 'paypal', 'stripe_connect'],
                        payoutProcessingDays: 3,
                        autoApproveThreshold: 100
                    },
                    refundPolicy: {
                        refundsAllowed: true,
                        timeLimit: 7,
                        partialRefundsAllowed: true,
                        refundProcessingDays: 5,
                        refundFeePercentage: 2
                    },
                    paymentGateways: {
                        stripe: {
                            enabled: false,
                            config: {
                                publishableKey: '',
                                secretKey: '',
                                webhookSecret: '',
                                currency: 'USD'
                            }
                        },
                        paypal: {
                            enabled: false,
                            config: {
                                clientId: '',
                                clientSecret: '',
                                mode: 'sandbox'
                            }
                        },
                        razorpay: {
                            enabled: false,
                            config: {
                                keyId: '',
                                keySecret: '',
                                webhookSecret: ''
                            }
                        }
                    },
                    currencies: {
                        supported: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD'],
                        default: 'USD',
                        exchangeRates: new Map()
                    },
                    taxSettings: {
                        taxHandledBy: 'coach',
                        taxRates: {
                            default: 0,
                            byCountry: new Map(),
                            byState: new Map()
                        },
                        taxInclusive: false
                    }
                },
                mlmSystem: {
                    maxDownlineLevels: 10,
                    performanceUpdateInterval: 3600000,
                    reportRetentionDays: 365,
                    aiInsightsEnabled: true,
                    realTimeUpdates: true,
                    performanceScoring: {
                        leadGenerationWeight: 0.30,
                        salesPerformanceWeight: 0.25,
                        clientManagementWeight: 0.20,
                        activityEngagementWeight: 0.15,
                        teamLeadershipWeight: 0.10
                    },
                    coachRequirements: {
                        minimumAge: 18,
                        requiredCertifications: [],
                        minimumExperience: 1,
                        backgroundCheckRequired: false,
                        insuranceRequired: false
                    }
                },
                security: {
                    passwordPolicy: {
                        minLength: 8,
                        requireUppercase: true,
                        requireLowercase: true,
                        requireNumbers: true,
                        requireSpecialChars: true,
                        maxLoginAttempts: 5,
                        lockoutDuration: 30
                    },
                    sessionSettings: {
                        sessionTimeout: 24,
                        rememberMeDuration: 30,
                        requireTwoFactor: false
                    },
                    apiSecurity: {
                        rateLimitPerMinute: 100,
                        maxRequestsPerHour: 1000,
                        allowedOrigins: [],
                        requireApiKey: false
                    }
                },
                notifications: {
                    email: {
                        enabled: true,
                        smtpConfig: {
                            host: '',
                            port: 587,
                            secure: false,
                            username: '',
                            password: ''
                        },
                        fromEmail: 'noreply@funnelseye.com',
                        fromName: 'FunnelsEye'
                    },
                    sms: {
                        enabled: false,
                        provider: 'twilio',
                        config: {
                            accountSid: '',
                            authToken: '',
                            fromNumber: ''
                        }
                    },
                    push: {
                        enabled: false,
                        firebaseConfig: {
                            serverKey: '',
                            projectId: ''
                        }
                    }
                },
                integrations: {
                    // whatsapp: { // WhatsApp functionality moved to dustbin/whatsapp-dump/
                    //     enabled: false,
                    //     apiUrl: '',
                    //     apiKey: '',
                    //     webhookUrl: ''
                    // },
                    zoom: {
                        enabled: false,
                        apiKey: '',
                        apiSecret: '',
                        webhookSecret: ''
                    },
                    calendar: {
                        enabled: false,
                        googleCalendar: {
                            clientId: '',
                            clientSecret: ''
                        }
                    }
                },
                systemStatus: {
                    isActive: true,
                    lastUpdated: new Date(),
                    version: '1.0.0',
                    maintenanceMode: false,
                    maintenanceMessage: ''
                },
                auditTrail: {
                    enabled: true,
                    retentionDays: 365,
                    logLevel: 'medium'
                }
            };

            adminSettings = await AdminSystemSettings.create(defaultSettings);
            console.log('✅ Default admin system settings created successfully');
        } else {
            console.log('✅ Admin system settings found');
        }

        // Test 2: Create default admin user
        console.log('\n🔍 Testing Admin User...');
        let adminUser = await AdminUser.findOne({ email: 'admin@funnelseye.com' });
        
        if (!adminUser) {
            console.log('❌ No admin user found. Creating default admin user...');
            
            const defaultAdmin = {
                email: 'admin@funnelseye.com',
                password: 'Admin123!@#', // This will be hashed automatically
                firstName: 'System',
                lastName: 'Administrator',
                role: 'super_admin',
                permissions: {
                    systemSettings: true,
                    userManagement: true,
                    paymentSettings: true,
                    mlmSettings: true,
                    coachManagement: true,
                    planManagement: true,
                    contentModeration: true,
                    viewAnalytics: true,
                    exportData: true,
                    financialReports: true,
                    systemLogs: true,
                    maintenanceMode: true,
                    backupRestore: true,
                    securitySettings: true,
                    auditLogs: true,
                    twoFactorAuth: true
                },
                profile: {
                    phone: '',
                    timezone: 'UTC',
                    language: 'en',
                    notifications: {
                        email: true,
                        sms: false,
                        push: true
                    }
                },
                status: 'active',
                isEmailVerified: true
            };

            adminUser = await AdminUser.create(defaultAdmin);
            console.log('✅ Default admin user created successfully');
            console.log('📧 Email: admin@funnelseye.com');
            console.log('🔑 Password: Admin123!@#');
        } else {
            console.log('✅ Admin user found');
        }

        // Test 3: Test admin system methods
        console.log('\n🔍 Testing Admin System Methods...');
        
        // Test platform fee calculation
        const platformFee = adminSettings.paymentSystem.platformFees.defaultPercentage;
        console.log(`✅ Platform fee calculation: ${platformFee}%`);
        
        // Test commission structure
        const level1Commission = adminSettings.paymentSystem.mlmCommissionStructure.level1;
        console.log(`✅ Level 1 commission: ${level1Commission}%`);
        
        // Test admin user methods
        const fullName = adminUser.getFullName();
        console.log(`✅ Admin full name: ${fullName}`);
        
        const hasPermission = adminUser.hasPermission('systemSettings');
        console.log(`✅ Has system settings permission: ${hasPermission}`);

        // Test 4: Create sample audit log
        console.log('\n🔍 Testing Audit Log...');
        const logId = `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const sampleAuditLog = await AdminAuditLog.create({
            logId,
            adminId: adminUser._id,
            adminEmail: adminUser.email,
            adminRole: adminUser.role,
            action: 'UPDATE_SYSTEM_SETTINGS',
            category: 'SYSTEM_MANAGEMENT',
            description: 'Admin system initialized and tested',
            severity: 'low',
            ipAddress: '127.0.0.1',
            userAgent: 'Test Script',
            endpoint: '/test',
            method: 'POST',
            status: 'success'
        });
        console.log('✅ Sample audit log created');

        console.log('\n📊 Admin System Configuration Summary:');
        console.log(`- Platform Name: ${adminSettings.platformConfig.platformName}`);
        console.log(`- Platform Version: ${adminSettings.platformConfig.platformVersion}`);
        console.log(`- Default Platform Fee: ${adminSettings.paymentSystem.platformFees.defaultPercentage}%`);
        console.log(`- MLM Levels: ${Object.keys(adminSettings.paymentSystem.mlmCommissionStructure).length} levels configured`);
        console.log(`- Payout Frequency: ${adminSettings.paymentSystem.payoutSettings.frequency}`);
        console.log(`- Supported Currencies: ${adminSettings.paymentSystem.currencies.supported.join(', ')}`);
        console.log(`- Default Currency: ${adminSettings.paymentSystem.currencies.default}`);
        console.log(`- Admin User: ${adminUser.email} (${adminUser.role})`);
        console.log(`- System Status: ${adminSettings.systemStatus.isActive ? 'Active' : 'Inactive'}`);

        console.log('\n🎯 Admin system is now fully configured and ready to use!');
        console.log('\n📋 Next Steps:');
        console.log('1. Start the server: npm start');
        console.log('2. Access admin login: http://localhost:3000/admin-login');
        console.log('3. Login with: admin@funnelseye.com / Admin123!@#');
        console.log('4. Access admin dashboard: http://localhost:3000/admin');
        console.log('5. Configure payment gateways in the admin panel');
        console.log('6. Test the payment system with the unified payment gateway');

    } catch (error) {
        console.error('❌ Error testing admin system:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Database disconnected');
    }
}

// Run the test
testAdminSystem();
