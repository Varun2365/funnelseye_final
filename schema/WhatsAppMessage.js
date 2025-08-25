const mongoose = require('mongoose');

const WhatsAppMessageSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    
    conversationId: {
        type: String,
        required: true,
        index: true
    },
    
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Message Direction and Type
    direction: {
        type: String,
        enum: ['inbound', 'outbound'],
        required: true,
        index: true
    },
    
    messageType: {
        type: String,
        enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker', 'reaction'],
        required: true,
        default: 'text'
    },
    
    // Message Content
    content: {
        type: String,
        required: true
    },
    
    // Media Information
    mediaUrl: {
        type: String,
        default: null
    },
    mediaType: {
        type: String,
        default: null
    },
    mediaSize: {
        type: Number,
        default: null
    },
    mediaCaption: {
        type: String,
        default: null
    },
    
    // Message Metadata
    timestamp: {
        type: Date,
        required: true,
        index: true
    },
    
    // Delivery and Read Status
    deliveryStatus: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
        default: 'pending',
        index: true
    },
    
    readStatus: {
        type: String,
        enum: ['unread', 'read'],
        default: 'unread',
        index: true
    },
    
    // Message Threading
    replyToMessageId: {
        type: String,
        default: null
    },
    threadId: {
        type: String,
        default: null
    },
    
    // Reactions and Interactions
    reactions: [{
        emoji: String,
        count: Number,
        users: [String]
    }],
    
    // Integration Details
    integrationType: {
        type: String,
        enum: ['meta_official', 'baileys_personal'],
        required: true
    },
    
    // Template Information (for Meta API)
    templateName: {
        type: String,
        default: null
    },
    templateLanguage: {
        type: String,
        default: null
    },
    
    // Error Handling
    errorDetails: {
        code: String,
        message: String,
        timestamp: Date
    },
    
    // Business Intelligence
    processingTime: {
        type: Number, // in milliseconds
        default: null
    },
    
    // Lead Integration
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        default: null
    },
    
    // Automation Tracking
    automationTriggered: {
        type: Boolean,
        default: false
    },
    automationRuleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AutomationRule',
        default: null
    },
    
    // Integration-specific Data
    metaData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
WhatsAppMessageSchema.index({ conversationId: 1, timestamp: -1 });
WhatsAppMessageSchema.index({ coachId: 1, timestamp: -1 });
WhatsAppMessageSchema.index({ direction: 1, timestamp: -1 });
WhatsAppMessageSchema.index({ deliveryStatus: 1, timestamp: -1 });
WhatsAppMessageSchema.index({ messageType: 1, timestamp: -1 });
WhatsAppMessageSchema.index({ leadId: 1, timestamp: -1 });

// Virtual for message summary
WhatsAppMessageSchema.virtual('summary').get(function() {
    return {
        messageId: this.messageId,
        conversationId: this.conversationId,
        direction: this.direction,
        messageType: this.messageType,
        content: this.content,
        timestamp: this.timestamp,
        deliveryStatus: this.deliveryStatus,
        readStatus: this.readStatus,
        hasMedia: !!this.mediaUrl
    };
});

// Method to mark as read
WhatsAppMessageSchema.methods.markAsRead = function() {
    this.readStatus = 'read';
    return this.save();
};

// Method to update delivery status
WhatsAppMessageSchema.methods.updateDeliveryStatus = function(status) {
    this.deliveryStatus = status;
    if (status === 'read') {
        this.readStatus = 'read';
    }
    return this.save();
};

// Method to add reaction
WhatsAppMessageSchema.methods.addReaction = function(emoji, userId) {
    const existingReaction = this.reactions.find(r => r.emoji === emoji);
    
    if (existingReaction) {
        if (!existingReaction.users.includes(userId)) {
            existingReaction.users.push(userId);
            existingReaction.count = existingReaction.users.length;
        }
    } else {
        this.reactions.push({
            emoji,
            count: 1,
            users: [userId]
        });
    }
    
    return this.save();
};

// Method to remove reaction
WhatsAppMessageSchema.methods.removeReaction = function(emoji, userId) {
    const existingReaction = this.reactions.find(r => r.emoji === emoji);
    
    if (existingReaction) {
        existingReaction.users = existingReaction.users.filter(id => id !== userId);
        existingReaction.count = existingReaction.users.length;
        
        if (existingReaction.count === 0) {
            this.reactions = this.reactions.filter(r => r.emoji !== emoji);
        }
    }
    
    return this.save();
};

// Static method to find messages by conversation
WhatsAppMessageSchema.statics.findByConversation = function(conversationId, options = {}) {
    const { limit = 50, offset = 0, beforeTimestamp } = options;
    
    let query = { conversationId };
    if (beforeTimestamp) {
        query.timestamp = { $lt: beforeTimestamp };
    }
    
    return this.find(query)
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit);
};

// Static method to get message statistics
WhatsAppMessageSchema.statics.getStats = function(coachId, timeRange = {}) {
    const matchStage = { coachId: mongoose.Types.ObjectId(coachId) };
    
    if (timeRange.startDate) {
        matchStage.timestamp = { $gte: timeRange.startDate };
    }
    if (timeRange.endDate) {
        matchStage.timestamp = { ...matchStage.timestamp, $lte: timeRange.endDate };
    }
    
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalMessages: { $sum: 1 },
                inboundMessages: { $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] } },
                outboundMessages: { $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] } },
                deliveredMessages: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'delivered'] }, 1, 0] } },
                readMessages: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'read'] }, 1, 0] } }
            }
        }
    ]);
};

module.exports = mongoose.models.WhatsAppMessage || mongoose.model('WhatsAppMessage', WhatsAppMessageSchema);
