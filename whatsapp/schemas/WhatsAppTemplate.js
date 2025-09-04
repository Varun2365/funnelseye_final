const mongoose = require('mongoose');

const whatsAppTemplateSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['marketing', 'support', 'appointment', 'reminder', 'welcome', 'custom'],
        default: 'custom'
    },
    language: {
        type: String,
        default: 'en',
        trim: true
    },
    content: {
        header: {
            type: String,
            trim: true
        },
        body: {
            type: String,
            required: true,
            trim: true
        },
        footer: {
            type: String,
            trim: true
        },
        buttons: [{
            type: {
                type: String,
                enum: ['url', 'phone_number', 'quick_reply']
            },
            text: String,
            url: String,
            phoneNumber: String
        }]
    },
    variables: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        defaultValue: {
            type: String,
            trim: true
        },
        required: {
            type: Boolean,
            default: false
        }
    }],
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected'],
        default: 'draft'
    },
    metaTemplateId: {
        type: String,
        trim: true,
        sparse: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageCount: {
        type: Number,
        default: 0
    },
    lastUsed: {
        type: Date,
        default: null
    },
    tags: [{
        type: String,
        trim: true
    }],
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes
whatsAppTemplateSchema.index({ coachId: 1, isActive: 1 });
whatsAppTemplateSchema.index({ coachId: 1, category: 1 });
whatsAppTemplateSchema.index({ metaTemplateId: 1 }, { sparse: true });

// Ensure unique template names per coach
whatsAppTemplateSchema.index({ coachId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('WhatsAppTemplate', whatsAppTemplateSchema);
