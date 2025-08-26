const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema({
    notificationId: {
        type: String,
        required: true,
        unique: true,
        default: () => `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['info', 'success', 'warning', 'error', 'critical'],
        default: 'info'
    },
    category: {
        type: String,
        required: true,
        enum: ['system', 'payment', 'coach', 'financial', 'security', 'mlm', 'general'],
        default: 'general'
    },
    priority: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    targetAudience: {
        type: String,
        required: true,
        enum: ['admin_only', 'all_coaches', 'specific_coaches', 'all_users'],
        default: 'admin_only'
    },
    targetUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isRead: {
        type: Boolean,
        default: false
    },
    isDismissed: {
        type: Boolean,
        default: false
    },
    isGlobal: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date
    },
    actionRequired: {
        type: Boolean,
        default: false
    },
    actionUrl: String,
    actionText: String,
    metadata: {
        source: String,
        relatedEntity: {
            type: String,
            enum: ['user', 'payment', 'subscription', 'commission', 'system']
        },
        entityId: mongoose.Schema.Types.ObjectId,
        additionalData: mongoose.Schema.Types.Mixed
    },
    readBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    dismissedBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        dismissedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for performance
adminNotificationSchema.index({ type: 1, priority: 1 });
adminNotificationSchema.index({ category: 1, isActive: 1 });
adminNotificationSchema.index({ targetAudience: 1, isGlobal: 1 });
adminNotificationSchema.index({ isRead: 1, isDismissed: 1 });
adminNotificationSchema.index({ expiresAt: 1 });
adminNotificationSchema.index({ createdAt: -1 });

// Virtual for notification status
adminNotificationSchema.virtual('status').get(function() {
    if (this.isDismissed) return 'dismissed';
    if (this.isRead) return 'read';
    return 'unread';
});

// Virtual for isActive (not expired)
adminNotificationSchema.virtual('isActive').get(function() {
    if (!this.expiresAt) return true;
    return new Date() < this.expiresAt;
});

// Virtual for urgency score
adminNotificationSchema.virtual('urgencyScore').get(function() {
    let score = 0;
    
    // Priority scoring
    switch (this.priority) {
        case 'urgent': score += 4; break;
        case 'high': score += 3; break;
        case 'medium': score += 2; break;
        case 'low': score += 1; break;
    }
    
    // Type scoring
    switch (this.type) {
        case 'critical': score += 3; break;
        case 'error': score += 2; break;
        case 'warning': score += 1; break;
    }
    
    // Action required scoring
    if (this.actionRequired) score += 2;
    
    // Expiration scoring
    if (this.expiresAt && new Date() > this.expiresAt) score += 1;
    
    return score;
});

// Pre-save middleware to set expiration if not set
adminNotificationSchema.pre('save', function(next) {
    if (!this.expiresAt && this.type === 'info') {
        // Info notifications expire in 7 days by default
        this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    next();
});

// Static method to create system notification
adminNotificationSchema.statics.createSystemNotification = function(data) {
    return this.create({
        ...data,
        createdBy: data.createdBy || 'system',
        isGlobal: true,
        targetAudience: 'admin_only'
    });
};

// Static method to create coach notification
adminNotificationSchema.statics.createCoachNotification = function(data, coachIds) {
    return this.create({
        ...data,
        targetAudience: 'specific_coaches',
        targetUsers: coachIds,
        isGlobal: false
    });
};

// Ensure virtual fields are serialized
adminNotificationSchema.set('toJSON', { virtuals: true });
adminNotificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.AdminNotification || mongoose.model('AdminNotification', adminNotificationSchema);
