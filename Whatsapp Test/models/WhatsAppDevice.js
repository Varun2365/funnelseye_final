const mongoose = require('mongoose');

const WhatsAppDeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: false,
    default: ''
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['disconnected', 'connecting', 'connected', 'qr_required'],
    default: 'disconnected'
  },
  qrCode: {
    type: String,
    default: null
  },
  sessionData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WhatsAppDevice', WhatsAppDeviceSchema);
