const mongoose = require('mongoose');

const whatsAppMessageSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true,
        index: true
    },
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WhatsAppDevice',
        required: true,
        index: true
    },
    direction: {
        type: String,
        enum: ['inbound', 'outbound'],
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker', 'template'],
        required: true
    },
    from: {
        type: String,
        required: true,
        trim: true
    },
    to: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        text: {
            type: String,
            trim: true
        },
        media: {
            url: String,
            mimeType: String,
            fileName: String,
            fileSize: Number
        },
        template: {
            name: String,
            language: String,
            components: [{
                type: String,
                text: String,
                url: String
            }]
        },
        location: {
            latitude: Number,
            longitude: Number,
            name: String,
            address: String
        },
        contact: {
            name: String,
            phoneNumber: String
        }
    },
    messageId: {
        type: String,
        unique: true,
        sparse: true
    },
    conversationId: {
        type: String,
        index: true
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed', 'pending'],
        default: 'pending'
    },
    statusTimestamp: {
        type: Date,
        default: Date.now
    },
    creditsUsed: {
        type: Number,
        default: 0
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
whatsAppMessageSchema.index({ coachId: 1, createdAt: -1 });
whatsAppMessageSchema.index({ conversationId: 1, createdAt: -1 });
whatsAppMessageSchema.index({ from: 1, to: 1 });
whatsAppMessageSchema.index({ status: 1 });

// Virtual for conversation
whatsAppMessageSchema.virtual('conversation', {
    ref: 'WhatsAppConversation',
    localField: 'conversationId',
    foreignField: 'conversationId',
    justOne: true
});

module.exports = mongoose.model('WhatsAppMessage', whatsAppMessageSchema);
