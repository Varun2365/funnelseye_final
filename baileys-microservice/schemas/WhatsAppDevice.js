const mongoose = require('mongoose');

const WhatsAppDeviceSchema = new mongoose.Schema({
    // Device identification
    deviceId: {
        type: String,
        required: true,
        unique: true
    },
    
    // Device type (baileys or meta)
    deviceType: {
        type: String,
        enum: ['baileys', 'meta'],
        required: true
    },
    
    // Device name for display
    deviceName: {
        type: String,
        required: true
    },
    
    // Phone number
    phoneNumber: {
        type: String,
        required: true
    },
    
    // Device description
    description: {
        type: String,
        default: ''
    },
    
    // Connection status
    isConnected: {
        type: Boolean,
        default: false
    },
    
    // QR code for Baileys
    qrCode: {
        type: String,
        default: null
    },
    
    // Session ID for Baileys
    sessionId: {
        type: String,
        default: null
    },
    
    // Meta WhatsApp configuration (if deviceType is meta)
    phoneNumberId: {
        type: String,
        default: null
    },
    
    accessToken: {
        type: String,
        default: null
    },
    
    // Coach association
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true
    },
    
    // Staff association (optional)
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        default: null
    },
    
    // Default device flag
    isDefault: {
        type: Boolean,
        default: false
    },
    
    // Timestamps
    lastConnected: {
        type: Date,
        default: null
    },
    
    lastDisconnected: {
        type: Date,
        default: null
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
WhatsAppDeviceSchema.index({ coachId: 1, deviceType: 1 });
WhatsAppDeviceSchema.index({ coachId: 1, isDefault: 1 });
WhatsAppDeviceSchema.index({ deviceId: 1 });
WhatsAppDeviceSchema.index({ phoneNumber: 1 });

module.exports = mongoose.model('WhatsAppDevice', WhatsAppDeviceSchema);
