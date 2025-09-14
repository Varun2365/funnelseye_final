const mongoose = require('mongoose');

const WhatsAppMessageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  deviceId: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker'],
    required: true
  },
  content: {
    text: String,
    mediaUrl: String,
    mediaType: String,
    caption: String,
    location: {
      latitude: Number,
      longitude: Number,
      name: String,
      address: String
    },
    contact: {
      name: String,
      number: String
    }
  },
  timestamp: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppConversation'
  }
}, {
  timestamps: true
});

// Index for efficient queries
WhatsAppMessageSchema.index({ deviceId: 1, timestamp: -1 });
WhatsAppMessageSchema.index({ conversationId: 1, timestamp: -1 });
WhatsAppMessageSchema.index({ from: 1, to: 1 });

module.exports = mongoose.model('WhatsAppMessage', WhatsAppMessageSchema);
