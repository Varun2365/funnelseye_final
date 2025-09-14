const express = require('express');
const router = express.Router();
const path = require('path');
const baileysService = require('../services/baileysService');
const rabbitmqService = require('../services/rabbitmqService');

// Middleware for validating device ID
const validateDeviceId = (req, res, next) => {
    const { deviceId } = req.params;
    
    if (!deviceId || deviceId === 'null' || deviceId === 'undefined') {
        return res.status(400).json({
            success: false,
            message: 'Invalid device ID provided'
        });
    }
    
    next();
};

// ===== CORE WHATSAPP OPERATIONS ONLY =====

// QR Code Display Page
router.get('/qr-page/:deviceId', validateDeviceId, (req, res) => {
    const { deviceId } = req.params;
    console.log(`[BAILEYS_API] Serving QR page for device ${deviceId}`);
    
    // Serve the QR display page
    res.sendFile(path.join(__dirname, '..', 'public', 'qr-display.html'));
});

// 1. Initialize WhatsApp session
router.post('/initialize/:deviceId', validateDeviceId, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { coachId } = req.body;
        
        if (!coachId) {
            return res.status(400).json({
                success: false,
                message: 'Coach ID is required'
            });
        }
        
        console.log(`[BAILEYS_API] Initializing device ${deviceId} for coach ${coachId}`);
        
        // Direct service call for initialization
        try {
            const result = await baileysService.initializeDevice(deviceId, coachId);
            
            res.json({
                success: true,
                message: 'Device initialized successfully',
                data: result
            });
        } catch (error) {
            console.error(`[BAILEYS_API] Error initializing device:`, error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to initialize device',
                error: error.message
            });
        }
        
    } catch (error) {
        console.error('[BAILEYS_API] Error initializing device:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize device',
            error: error.message
        });
    }
});

// 2. Get WhatsApp session status
router.get('/status/:deviceId', validateDeviceId, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        console.log(`[BAILEYS_API] Getting status for device ${deviceId}`);
        
        // Direct service call for status
        const result = await baileysService.getConnectionStatus(deviceId);
        
        res.json({
            success: true,
            message: 'Status retrieved successfully',
            data: result
        });
        
    } catch (error) {
        console.error('[BAILEYS_API] Error getting connection status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get connection status',
            error: error.message
        });
    }
});

// 3. Get QR Code
router.get('/qr/:deviceId', validateDeviceId, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        console.log(`[BAILEYS_API] Getting QR code for device ${deviceId}`);
        
        // Direct service call for QR code
        const result = await baileysService.getQRCode(deviceId);
        
        if (!result.success || !result.data) {
            return res.json({
                success: false,
                message: result.message || 'QR code not available yet. Please wait a moment and try again.',
                data: null,
                suggestion: 'Try initializing the device first or force QR generation'
            });
        }
        
        console.log(`[BAILEYS_API] ✅ QR code retrieved successfully for device ${deviceId}`);
        res.json({
            success: true,
            message: result.message || 'QR code retrieved successfully',
            data: result.data
        });
        
    } catch (error) {
        console.error('[BAILEYS_API] Error getting QR code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get QR code',
            error: error.message
        });
    }
});

// 4. Establish Full Session (Force QR generation)
router.post('/establish-session/:deviceId', validateDeviceId, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        console.log(`[BAILEYS_API] Establishing full session for device ${deviceId}`);
        
        // Direct service call for force QR generation
        const result = await baileysService.forceQRGeneration(deviceId);
        
        res.json({
            success: true,
            message: 'Session establishment completed',
            data: result
        });
        
    } catch (error) {
        console.error('[BAILEYS_API] Error establishing session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to establish session',
            error: error.message
        });
    }
});

// 5. Send Messages
router.post('/send/:deviceId', validateDeviceId, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { to, message, type = 'text' } = req.body;
        
        if (!to || !message) {
            return res.status(400).json({
                success: false,
                message: 'Recipient and message are required'
            });
        }
        
        console.log(`[BAILEYS_API] Sending message from device ${deviceId} to ${to}`);
        
        // Use RabbitMQ for scalability
        const result = await rabbitmqService.publishMessageRequest(deviceId, to, message, type);
        
        res.json({
            success: true,
            message: 'Message queued for sending',
            data: result
        });
        
    } catch (error) {
        console.error('[BAILEYS_API] Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// Batch send messages for high volume
router.post('/send-batch', async (req, res) => {
    try {
        const { messages } = req.body;
        
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Messages array is required'
            });
        }
        
        console.log(`[BAILEYS_API] Batch sending ${messages.length} messages`);
        
        // Use RabbitMQ for scalability
        const results = await rabbitmqService.publishBatchMessages(messages);
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        res.json({
            success: true,
            message: `Batch message request queued: ${successful} successful, ${failed} failed`,
            data: {
                total: messages.length,
                successful,
                failed,
                results
            }
        });
        
    } catch (error) {
        console.error('[BAILEYS_API] Error batch sending messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to batch send messages',
            error: error.message
        });
    }
});

// Disconnect device (for cleanup)
router.post('/disconnect/:deviceId', validateDeviceId, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        console.log(`[BAILEYS_API] Disconnecting device ${deviceId}`);
        
        // Direct service call for disconnect
        try {
            const result = await baileysService.disconnectDevice(deviceId);
            
            res.json({
                success: true,
                message: 'Device disconnected successfully',
                data: result
            });
        } catch (error) {
            console.error(`[BAILEYS_API] Error disconnecting device:`, error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to disconnect device',
                error: error.message
            });
        }
        
    } catch (error) {
        console.error('[BAILEYS_API] Error disconnecting device:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disconnect device',
            error: error.message
        });
    }
});

// RabbitMQ health check
router.get('/rabbitmq/status', async (req, res) => {
    try {
        const status = await rabbitmqService.getConnectionStatus();
        
        res.json({
            success: true,
            message: 'RabbitMQ status retrieved',
            data: status
        });
        
    } catch (error) {
        console.error('[BAILEYS_API] Error getting RabbitMQ status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get RabbitMQ status',
            error: error.message
        });
    }
});

module.exports = router;
