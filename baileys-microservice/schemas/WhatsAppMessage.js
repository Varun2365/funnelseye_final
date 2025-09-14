const mongoose = require('mongoose');

const WhatsAppMessageSchema = new mongoose.Schema({
    // Message identification
    messageId: {
        type: String,
        required: true
    },
    
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
    
    // Message direction
    direction: {
        type: String,
        enum: ['inbound', 'outbound'],
        required: true
    },
    
    // Message type
    messageType: {
        type: String,
        enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker'],
        default: 'text'
    },
    
    // Participants
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
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    
    // Conversation ID
    conversationId: {
        type: String,
        required: true
    },
    
    // Message status
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent'
    },
    
    // Status timestamp
    statusTimestamp: {
        type: Date,
        default: Date.now
    },
    
    // Timestamps
    timestamp: {
        type: Date,
        required: true
    },
    
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
WhatsAppMessageSchema.index({ messageId: 1, deviceId: 1 });
WhatsAppMessageSchema.index({ coachId: 1, timestamp: -1 });
WhatsAppMessageSchema.index({ conversationId: 1, timestamp: -1 });
WhatsAppMessageSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('WhatsAppMessage', WhatsAppMessageSchema);
