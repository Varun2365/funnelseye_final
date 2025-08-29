const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
    // Platform Configuration
    platformConfig: {
        platformName: { type: String, default: 'FunnelsEye' },
        platformVersion: { type: String, default: '2.0.0' },
        maintenanceMode: { type: Boolean, default: false },
        maintenanceMessage: { type: String, default: 'Platform is under maintenance' },
        maxFileUploadSize: { type: Number, default: 10 }, // MB
        allowedFileTypes: [{ type: String, default: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'] }],
        sessionTimeout: { type: Number, default: 24 }, // hours
        maxLoginAttempts: { type: Number, default: 5 },
        passwordPolicy: {
            minLength: { type: Number, default: 8 },
            requireUppercase: { type: Boolean, default: true },
            requireLowercase: { type: Boolean, default: true },
            requireNumbers: { type: Boolean, default: true },
            requireSpecialChars: { type: Boolean, default: true }
        }
    },

    // Credit System Configuration
    creditSystem: {
        defaultCredits: { type: Number, default: 100 },
        creditDeductionRates: {
            leadGeneration: { type: Number, default: 1 },
            whatsappMessage: { type: Number, default: 0.5 },
            emailCampaign: { type: Number, default: 2 },
            smsCampaign: { type: Number, default: 1.5 },
            aiAdGeneration: { type: Number, default: 5 },
            reportGeneration: { type: Number, default: 3 },
            funnelCreation: { type: Number, default: 2 },
            automationRule: { type: Number, default: 1 }
        },
        creditPackages: [{
            name: { type: String, required: true },
            credits: { type: Number, required: true },
            price: { type: Number, required: true },
            currency: { type: String, default: 'USD' },
            isActive: { type: Boolean, default: true }
        }],
        bonusCredits: {
            newUserSignup: { type: Number, default: 50 },
            referralBonus: { type: Number, default: 25 },
            monthlyActive: { type: Number, default: 10 }
        }
    },

    // User Access & Permissions
    userAccess: {
        maxCoachesPerSponsor: { type: Number, default: 10 },
        maxStaffPerCoach: { type: Number, default: 5 },
        maxFunnelsPerCoach: { type: Number, default: 20 },
        maxLeadsPerCoach: { type: Number, default: 1000 },
        maxAutomationRules: { type: Number, default: 50 },
        maxAdCampaigns: { type: Number, default: 10 },
        trialPeriod: { type: Number, default: 14 }, // days
        autoSuspendInactive: { type: Boolean, default: true },
        inactiveThreshold: { type: Number, default: 30 } // days
    },

    // MLM Configuration
    mlmConfig: {
        maxDownlineLevels: { type: Number, default: 10 },
        performanceUpdateInterval: { type: Number, default: 3600000 }, // 1 hour in ms
        reportRetentionDays: { type: Number, default: 30 },
        aiInsightsEnabled: { type: Boolean, default: true },
        realTimeUpdates: { type: Boolean, default: true },
        performanceScoring: {
            leadGenerationWeight: { type: Number, default: 0.30 },
            salesPerformanceWeight: { type: Number, default: 0.25 },
            clientManagementWeight: { type: Number, default: 0.20 },
            activityEngagementWeight: { type: Number, default: 0.15 },
            teamLeadershipWeight: { type: Number, default: 0.10 }
        }
    },

    // Payment & Billing
    paymentConfig: {
        supportedCurrencies: [{ type: String, default: ['USD', 'INR', 'EUR'] }],
        defaultCurrency: { type: String, default: 'USD' },
        paymentGateways: {
            stripe: { enabled: { type: Boolean, default: true }, config: {} },
            paypal: { enabled: { type: Boolean, default: false }, config: {} },
            razorpay: { enabled: { type: Boolean, default: true }, config: {} }
        },
        taxRates: {
            default: { type: Number, default: 0 },
            byCountry: { type: Map, of: Number, default: new Map() }
        },
        refundPolicy: {
            allowed: { type: Boolean, default: true },
            timeLimit: { type: Number, default: 7 }, // days
            percentage: { type: Number, default: 100 }
        }
    },

    // AI & Automation Settings
    aiConfig: {
        openaiEnabled: { type: Boolean, default: true },
        maxTokensPerRequest: { type: Number, default: 2000 },
        aiFeatures: {
            leadScoring: { type: Boolean, default: true },
            adCopyGeneration: { type: Boolean, default: true },
            reportInsights: { type: Boolean, default: true },
            taskAssignment: { type: Boolean, default: true },
            contentGeneration: { type: Boolean, default: true }
        },
        automationLimits: {
            maxRulesPerCoach: { type: Number, default: 20 },
            maxActionsPerRule: { type: Number, default: 10 },
            executionDelay: { type: Number, default: 5000 } // ms
        }
    },

    // Notification Settings
    notificationConfig: {
        emailNotifications: {
            enabled: { type: Boolean, default: true },
            smtpConfig: {
                host: { type: String },
                port: { type: Number },
                secure: { type: Boolean, default: true }
            }
        },
        smsNotifications: {
            enabled: { type: Boolean, default: true },
            provider: { type: String, default: 'twilio' }
        },
        pushNotifications: {
            enabled: { type: Boolean, default: true },
            vapidKeys: {
                publicKey: { type: String },
                privateKey: { type: String }
            }
        },
        notificationTypes: {
            newLead: { type: Boolean, default: true },
            paymentReceived: { type: Boolean, default: true },
            lowCredits: { type: Boolean, default: true },
            systemMaintenance: { type: Boolean, default: true },
            performanceAlerts: { type: Boolean, default: true }
        }
    },

    // Analytics & Monitoring
    analyticsConfig: {
        dataRetention: {
            userActivity: { type: Number, default: 365 }, // days
            performanceMetrics: { type: Number, default: 730 }, // days
            systemLogs: { type: Number, default: 90 } // days
        },
        realTimeMonitoring: {
            enabled: { type: Boolean, default: true },
            updateInterval: { type: Number, default: 30000 } // ms
        },
        performanceThresholds: {
            apiResponseTime: { type: Number, default: 2000 }, // ms
            databaseQueryTime: { type: Number, default: 1000 }, // ms
            memoryUsage: { type: Number, default: 80 }, // percentage
            cpuUsage: { type: Number, default: 70 } // percentage
        }
    },

    // Security Settings
    securityConfig: {
        rateLimiting: {
            enabled: { type: Boolean, default: true },
            windowMs: { type: Number, default: 900000 }, // 15 minutes
            maxRequests: { type: Number, default: 100 }
        },
        // CORS settings are now centrally managed in config/cors.js
        // This allows for unified CORS configuration across all routes
        encryption: {
            algorithm: { type: String, default: 'aes-256-gcm' },
            keyRotationDays: { type: Number, default: 90 }
        }
    },

    // Feature Flags
    featureFlags: {
        mlmSystem: { type: Boolean, default: true },
        aiAdsAgent: { type: Boolean, default: true },
        workflowManagement: { type: Boolean, default: true },
        leadMagnets: { type: Boolean, default: true },
        staffLeaderboard: { type: Boolean, default: true },
        coachDashboard: { type: Boolean, default: true },
        advancedAnalytics: { type: Boolean, default: true },
        bulkOperations: { type: Boolean, default: true },
        apiAccess: { type: Boolean, default: true }
    },

    // System Status
    systemStatus: {
        lastUpdated: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        version: { type: String, default: '1.0.0' },
        isActive: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

// Indexes
adminSettingsSchema.index({ 'systemStatus.isActive': 1 });
adminSettingsSchema.index({ 'systemStatus.lastUpdated': -1 });

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
