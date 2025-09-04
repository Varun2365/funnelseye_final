const mongoose = require('mongoose');

const emailMessageSchema = new mongoose.Schema({
    configId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmailConfig',
        required: true,
        index: true
    },
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true,
        index: true
    },
    to: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        text: {
            type: String,
            trim: true
        },
        html: {
            type: String,
            trim: true
        }
    },
    messageId: {
        type: String,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced'],
        default: 'sent'
    },
    statusTimestamp: {
        type: Date,
        default: Date.now
    },
    isAutomated: {
        type: Boolean,
        default: false
    },
    automationRuleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AutomationRule',
        sparse: true
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        sparse: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    errorDetails: {
        code: String,
        message: String,
        timestamp: Date
    }
}, {
    timestamps: true
});

// Indexes
emailMessageSchema.index({ configId: 1, createdAt: -1 });
emailMessageSchema.index({ coachId: 1, createdAt: -1 });
emailMessageSchema.index({ to: 1 });
emailMessageSchema.index({ status: 1 });

module.exports = mongoose.model('EmailMessage', emailMessageSchema);
