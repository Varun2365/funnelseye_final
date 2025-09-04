const express = require('express');
const router = express.Router();

// Import all route modules
const deviceRoutes = require('./deviceRoutes');
const messageRoutes = require('./messageRoutes');
const conversationRoutes = require('./conversationRoutes');
const templateRoutes = require('./templateRoutes');
const emailRoutes = require('./emailRoutes');
const webhookRoutes = require('./webhookRoutes');

// Mount routes
router.use('/devices', deviceRoutes);
router.use('/messages', messageRoutes);
router.use('/conversations', conversationRoutes);
router.use('/templates', templateRoutes);
router.use('/email', emailRoutes);
router.use('/webhook', webhookRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'WhatsApp microservice is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
