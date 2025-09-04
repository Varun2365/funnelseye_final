const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // Link the message to a specific user (coach or staff)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userType: {
        type: String,
        enum: ['coach', 'staff'],
        required: true
    },
    
    // Message identification
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    
    // Phone numbers
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    
    // Message content
    content: {
        type: String,
        required: true
    },
    
    // Message direction: 'inbound' or 'outbound'
    direction: {
        type: String,
        enum: ['inbound', 'outbound'],
        required: true
    },
    
    // Timestamps
    timestamp: {
        type: Date,
        required: true
    },
    
    // Message type and media
    type: {
        type: String,
        enum: ['text', 'image', 'video', 'document', 'audio', 'unknown'],
        default: 'text'
    },
    mediaUrl: {
        type: String,
        default: null
    },
    
    // Message status
    deliveryStatus: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent'
    },
    readStatus: {
        type: String,
        enum: ['unread', 'read'],
        default: 'unread'
    },
    
    // Integration details
    integrationType: {
        type: String,
        enum: ['meta_official', 'baileys_personal', 'central_fallback'],
        required: true
    },
    
    // Automation flags
    isAutomated: {
        type: Boolean,
        default: false
    },
    
    // Optional lead reference
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        default: null
    },
    
    // Message metadata
    metaData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
messageSchema.index({ userId: 1, userType: 1 });
messageSchema.index({ messageId: 1 }, { unique: true });
messageSchema.index({ from: 1, to: 1 });
messageSchema.index({ timestamp: -1 });
messageSchema.index({ direction: 1 });
messageSchema.index({ deliveryStatus: 1 });
messageSchema.index({ readStatus: 1 });
messageSchema.index({ integrationType: 1 });

// Virtual for message summary
messageSchema.virtual('summary').get(function() {
    return {
        messageId: this.messageId,
        direction: this.direction,
        type: this.type,
        content: this.content.substring(0, 100) + (this.content.length > 100 ? '...' : ''),
        timestamp: this.timestamp,
        deliveryStatus: this.deliveryStatus,
        readStatus: this.readStatus
    };
});

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
    this.readStatus = 'read';
    this.readAt = new Date();
    return this.save();
};

// Method to update delivery status
messageSchema.methods.updateDeliveryStatus = function(status) {
    this.deliveryStatus = status;
    this.deliveryUpdatedAt = new Date();
    return this.save();
};

// Static method to get conversation messages
messageSchema.statics.getConversationMessages = function(userId, userType, contactPhone, limit = 50) {
    return this.find({
        userId,
        userType,
        $or: [
            { from: contactPhone },
            { to: contactPhone }
        ]
    })
    .sort({ timestamp: 1 })
    .limit(limit);
};

// Static method to get unread message count
messageSchema.statics.getUnreadCount = function(userId, userType) {
    return this.countDocuments({
        userId,
        userType,
        readStatus: 'unread'
    });
};

module.exports = mongoose.models.WhatsAppMessage || mongoose.model('WhatsAppMessage', messageSchema);