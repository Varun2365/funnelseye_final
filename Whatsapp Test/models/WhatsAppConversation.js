const mongoose = require('mongoose');

const WhatsAppConversationSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true
  },
  participant: {
    type: String,
    required: true
  },
  participantName: {
    type: String,
    default: ''
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppMessage'
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
WhatsAppConversationSchema.index({ deviceId: 1, participant: 1 }, { unique: true });
WhatsAppConversationSchema.index({ deviceId: 1, lastMessageTime: -1 });

module.exports = mongoose.model('WhatsAppConversation', WhatsAppConversationSchema);
