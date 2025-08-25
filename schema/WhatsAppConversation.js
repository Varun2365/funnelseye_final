const mongoose = require('mongoose');

const WhatsAppConversationSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true,
        unique: true
    },
    
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Contact Information
    contactNumber: {
        type: String,
        required: true,
        index: true
    },
    contactName: {
        type: String,
        default: 'Unknown Contact'
    },
    profilePicture: {
        type: String,
        default: null
    },
    
    // Integration Details
    integrationType: {
        type: String,
        enum: ['meta_official', 'baileys_personal'],
        required: true
    },
    
    // Conversation Status
    status: {
        type: String,
        enum: ['active', 'archived', 'blocked', 'spam'],
        default: 'active',
        index: true
    },
    
    // Message Tracking
    lastMessageAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    lastMessageContent: {
        type: String,
        default: ''
    },
    lastMessageDirection: {
        type: String,
        enum: ['inbound', 'outbound'],
        default: 'inbound'
    },
    
    // Unread and Engagement
    unreadCount: {
        type: Number,
        default: 0
    },
    totalMessages: {
        type: Number,
        default: 0
    },
    
    // Organization
    isPinned: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    
    // Tags and Categories
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        enum: ['lead', 'client', 'prospect', 'support', 'general'],
        default: 'general'
    },
    
    // Lead Integration
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        default: null
    },
    
    // Notes and Context
    notes: {
        type: String,
        maxlength: 1000
    },
    
    // Business Intelligence
    firstMessageAt: {
        type: Date,
        default: Date.now
    },
    responseTime: {
        average: { type: Number, default: 0 }, // in minutes
        lastResponse: { type: Number, default: 0 }
    },
    
    // Integration-specific Data
    metaData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Compound indexes for efficient querying
WhatsAppConversationSchema.index({ coachId: 1, lastMessageAt: -1 });
WhatsAppConversationSchema.index({ coachId: 1, status: 1 });
WhatsAppConversationSchema.index({ coachId: 1, contactNumber: 1 }, { unique: true });
WhatsAppConversationSchema.index({ coachId: 1, category: 1 });
WhatsAppConversationSchema.index({ coachId: 1, isPinned: 1, lastMessageAt: -1 });

// Virtual for conversation summary
WhatsAppConversationSchema.virtual('summary').get(function() {
    return {
        conversationId: this.conversationId,
        contactName: this.contactName,
        contactNumber: this.contactNumber,
        lastMessage: this.lastMessageContent,
        lastMessageAt: this.lastMessageAt,
        unreadCount: this.unreadCount,
        status: this.status,
        isPinned: this.isPinned,
        category: this.category
    };
});

// Method to mark as read
WhatsAppConversationSchema.methods.markAsRead = function() {
    this.unreadCount = 0;
    return this.save();
};

// Method to add message
WhatsAppConversationSchema.methods.addMessage = function(messageData) {
    this.lastMessageAt = messageData.timestamp;
    this.lastMessageContent = messageData.content;
    this.lastMessageDirection = messageData.direction;
    this.totalMessages += 1;
    
    if (messageData.direction === 'inbound') {
        this.unreadCount += 1;
    }
    
    return this.save();
};

// Method to archive conversation
WhatsAppConversationSchema.methods.archive = function() {
    this.isArchived = true;
    this.status = 'archived';
    return this.save();
};

// Method to pin conversation
WhatsAppConversationSchema.methods.togglePin = function() {
    this.isPinned = !this.isPinned;
    return this.save();
};

// Static method to find conversations by coach
WhatsAppConversationSchema.statics.findByCoach = function(coachId, filters = {}) {
    const query = { coachId, ...filters };
    return this.find(query).sort({ isPinned: -1, lastMessageAt: -1 });
};

// Static method to get conversation statistics
WhatsAppConversationSchema.statics.getStats = function(coachId) {
    return this.aggregate([
        { $match: { coachId: mongoose.Types.ObjectId(coachId) } },
        {
            $group: {
                _id: null,
                totalConversations: { $sum: 1 },
                activeConversations: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                unreadTotal: { $sum: '$unreadCount' },
                totalMessages: { $sum: '$totalMessages' }
            }
        }
    ]);
};

module.exports = mongoose.models.WhatsAppConversation || mongoose.model('WhatsAppConversation', WhatsAppConversationSchema);
