const mongoose = require('mongoose');

const WhatsAppIntegrationSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    // Integration Type and Status
    integrationType: {
        type: String,
        enum: ['meta_official', 'baileys_personal'],
        required: true,
        default: 'meta_official'
    },
    
    isActive: {
        type: Boolean,
        default: false
    },
    
    // Meta Official API Configuration
    metaApiToken: {
        type: String,
        trim: true,
        select: false // Hide sensitive data by default
    },
    phoneNumberId: {
        type: String,
        trim: true
    },
    whatsAppBusinessAccountId: {
        type: String,
        trim: true
    },
    
    // Baileys Personal Account Configuration
    baileysSessionData: {
        type: mongoose.Schema.Types.Mixed,
        select: false // Hide sensitive session data
    },
    personalPhoneNumber: {
        type: String,
        trim: true
    },
    connectionStatus: {
        type: String,
        enum: ['disconnected', 'connecting', 'connected', 'error'],
        default: 'disconnected'
    },
    lastConnectionAt: {
        type: Date
    },
    
    // Common Settings
    autoReplyEnabled: {
        type: Boolean,
        default: false
    },
    autoReplyMessage: {
        type: String,
        default: 'Thanks for your message! I\'ll get back to you soon.'
    },
    businessHours: {
        enabled: {
            type: Boolean,
            default: false
        },
        startTime: {
            type: String,
            default: '09:00'
        },
        endTime: {
            type: String,
            default: '17:00'
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    },
    
    // Webhook Configuration
    webhookUrl: {
        type: String,
        trim: true
    },
    webhookSecret: {
        type: String,
        trim: true,
        select: false
    },
    
    // Statistics
    totalMessagesSent: {
        type: Number,
        default: 0
    },
    totalMessagesReceived: {
        type: Number,
        default: 0
    },
    lastMessageAt: {
        type: Date
    },
    
    // Integration Health
    healthStatus: {
        type: String,
        enum: ['healthy', 'warning', 'error'],
        default: 'healthy'
    },
    lastHealthCheck: {
        type: Date
    },
    errorCount: {
        type: Number,
        default: 0
    },
    lastError: {
        message: String,
        timestamp: Date,
        code: String
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
WhatsAppIntegrationSchema.index({ coachId: 1 });
WhatsAppIntegrationSchema.index({ integrationType: 1, isActive: 1 });
WhatsAppIntegrationSchema.index({ connectionStatus: 1 });

// Virtual for integration status summary
WhatsAppIntegrationSchema.virtual('statusSummary').get(function() {
    if (!this.isActive) return 'inactive';
    if (this.integrationType === 'baileys_personal') {
        return this.connectionStatus === 'connected' ? 'active' : 'connecting';
    }
    return this.healthStatus === 'healthy' ? 'active' : 'error';
});

// Method to check if integration is working
WhatsAppIntegrationSchema.methods.isWorking = function() {
    if (!this.isActive) return false;
    
    if (this.integrationType === 'meta_official') {
        return this.healthStatus === 'healthy' && this.metaApiToken && this.phoneNumberId;
    } else {
        return this.connectionStatus === 'connected' && this.personalPhoneNumber;
    }
};

// Method to get integration details (without sensitive data)
WhatsAppIntegrationSchema.methods.getPublicDetails = function() {
    const details = {
        coachId: this.coachId,
        integrationType: this.integrationType,
        isActive: this.isActive,
        statusSummary: this.statusSummary,
        connectionStatus: this.connectionStatus,
        healthStatus: this.healthStatus,
        totalMessagesSent: this.totalMessagesSent,
        totalMessagesReceived: this.totalMessagesReceived,
        lastMessageAt: this.lastMessageAt,
        businessHours: this.businessHours,
        autoReplyEnabled: this.autoReplyEnabled
    };
    
    if (this.integrationType === 'meta_official') {
        details.phoneNumberId = this.phoneNumberId;
        details.whatsAppBusinessAccountId = this.whatsAppBusinessAccountId;
    } else {
        details.personalPhoneNumber = this.personalPhoneNumber;
    }
    
    return details;
};

module.exports = mongoose.models.WhatsAppIntegration || mongoose.model('WhatsAppIntegration', WhatsAppIntegrationSchema);
