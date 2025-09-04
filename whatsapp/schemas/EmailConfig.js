const mongoose = require('mongoose');

const emailConfigSchema = new mongoose.Schema({
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
    provider: {
        type: String,
        enum: ['gmail', 'outlook', 'yahoo', 'custom', 'sendgrid', 'mailgun', 'aws-ses'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    smtp: {
        host: {
            type: String,
            required: true,
            trim: true
        },
        port: {
            type: Number,
            required: true
        },
        secure: {
            type: Boolean,
            default: true
        },
        auth: {
            user: {
                type: String,
                required: true,
                trim: true
            },
            pass: {
                type: String,
                required: true,
                select: false
            }
        }
    },
    from: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        }
    },
    replyTo: {
        name: String,
        email: String
    },
    dailyLimit: {
        type: Number,
        default: 1000
    },
    emailsSentToday: {
        type: Number,
        default: 0
    },
    lastResetDate: {
        type: Date,
        default: Date.now
    },
    settings: {
        trackOpens: {
            type: Boolean,
            default: true
        },
        trackClicks: {
            type: Boolean,
            default: true
        },
        unsubscribeHeader: {
            type: Boolean,
            default: true
        },
        autoReply: {
            type: Boolean,
            default: false
        },
        autoReplyMessage: {
            type: String,
            trim: true,
            default: ''
        }
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes
emailConfigSchema.index({ coachId: 1, isActive: 1 });
emailConfigSchema.index({ coachId: 1, isDefault: 1 });

// Ensure only one default config per coach
emailConfigSchema.pre('save', async function(next) {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { coachId: this.coachId, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

// Reset daily email count
emailConfigSchema.methods.resetDailyCount = function() {
    const today = new Date().toDateString();
    const lastReset = this.lastResetDate.toDateString();
    
    if (today !== lastReset) {
        this.emailsSentToday = 0;
        this.lastResetDate = new Date();
        return this.save();
    }
    return Promise.resolve(this);
};

// Check if daily limit exceeded
emailConfigSchema.methods.canSendEmail = function() {
    return this.emailsSentToday < this.dailyLimit;
};

// Increment sent count
emailConfigSchema.methods.incrementSentCount = function() {
    this.emailsSentToday += 1;
    return this.save();
};

module.exports = mongoose.model('EmailConfig', emailConfigSchema);
