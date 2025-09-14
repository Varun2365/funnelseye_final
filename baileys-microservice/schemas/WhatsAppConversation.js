const mongoose = require('mongoose');

const WhatsAppConversationSchema = new mongoose.Schema({
    // Device association
    deviceId: {
        type: String,
        required: true
    },
    
    // Coach association
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true
    },
    
    // Participant (phone number or JID)
    participant: {
        type: String,
        required: true
    },
    
    // Conversation metadata
    participantName: {
        type: String,
        default: ''
    },
    
    participantAvatar: {
        type: String,
        default: ''
    },
    
    // Message counts
    messageCount: {
        type: Number,
        default: 0
    },
    
    unreadCount: {
        type: Number,
        default: 0
    },
    
    // Last message reference
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WhatsAppMessage',
        default: null
    },
    
    lastMessageTime: {
        type: Date,
        default: Date.now
    },
    
    // Conversation status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
WhatsAppConversationSchema.index({ deviceId: 1, participant: 1 }, { unique: true });
WhatsAppConversationSchema.index({ coachId: 1, lastMessageTime: -1 });
WhatsAppConversationSchema.index({ deviceId: 1, lastMessageTime: -1 });

module.exports = mongoose.model('WhatsAppConversation', WhatsAppConversationSchema);
