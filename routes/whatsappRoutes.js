const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const { protect, authorizeCoach, authorizeStaff } = require('../middleware/auth');

// ========================================
// INTEGRATION MANAGEMENT ROUTES
// ========================================

/**
 * @route   POST /api/whatsapp/integration/setup
 * @desc    Setup WhatsApp integration (Meta API, Baileys, or Central Fallback)
 * @access  Private (Coach or Staff)
 */
router.post('/integration/setup', protect, authorizeCoach, whatsappController.setupIntegration);

/**
 * @route   POST /api/whatsapp/integration/switch
 * @desc    Switch between integration types
 * @access  Private (Coach or Staff)
 */
router.post('/integration/switch', protect, authorizeCoach, whatsappController.switchIntegration);

/**
 * @route   GET /api/whatsapp/integration/list
 * @desc    Get user's WhatsApp integrations
 * @access  Private (Coach or Staff)
 */
router.get('/integration/list', protect, authorizeCoach, whatsappController.getIntegrations);

/**
 * @route   GET /api/whatsapp/integration/coaches
 * @desc    Get all coach integrations (visible to all users)
 * @access  Public
 */
router.get('/integration/coaches', whatsappController.getAllCoachIntegrations);

/**
 * @route   POST /api/whatsapp/integration/test
 * @desc    Test integration connection
 * @access  Private (Coach or Staff)
 */
router.post('/integration/test', protect, authorizeCoach, whatsappController.testIntegration);

/**
 * @route   GET /api/whatsapp/integration/health
 * @desc    Get integration health status
 * @access  Private (Coach or Staff)
 */
router.get('/integration/health', protect, authorizeCoach, whatsappController.getIntegrationHealth);

// ========================================
// BAILEYS PERSONAL ACCOUNT ROUTES
// ========================================

/**
 * @route   POST /api/whatsapp/baileys/initialize
 * @desc    Initialize Baileys WhatsApp session
 * @access  Private (Coach or Staff)
 */
router.post('/baileys/initialize', protect, authorizeCoach, whatsappController.initializeBaileysSession);

/**
 * @route   GET /api/whatsapp/baileys/qr-code
 * @desc    Get QR code for WhatsApp Web authentication
 * @access  Private (Coach or Staff)
 */
router.get('/baileys/qr-code', protect, authorizeCoach, whatsappController.getBaileysQRCode);

/**
 * @route   GET /api/whatsapp/baileys/status
 * @desc    Get Baileys session status
 * @access  Private (Coach or Staff)
 */
router.get('/baileys/status', protect, authorizeCoach, whatsappController.getBaileysSessionStatus);

/**
 * @route   POST /api/whatsapp/baileys/disconnect
 * @desc    Disconnect Baileys session
 * @access  Private (Coach or Staff)
 */
router.post('/baileys/disconnect', protect, authorizeCoach, whatsappController.disconnectBaileysSession);

// ========================================
// MESSAGING ROUTES
// ========================================

/**
 * @route   POST /api/whatsapp/message/send
 * @desc    Send WhatsApp message
 * @access  Private (Coach or Staff)
 */
router.post('/message/send', protect, authorizeCoach, whatsappController.sendMessage);

/**
 * @route   POST /api/whatsapp/message/template
 * @desc    Send template message
 * @access  Private (Coach or Staff)
 */
router.post('/message/template', protect, authorizeCoach, whatsappController.sendTemplateMessage);

// ========================================
// INBOX MANAGEMENT ROUTES
// ========================================

/**
 * @route   GET /api/whatsapp/inbox/conversations
 * @desc    Get inbox conversations
 * @access  Private (Coach or Staff)
 */
router.get('/inbox/conversations', protect, authorizeCoach, whatsappController.getInboxConversations);

/**
 * @route   GET /api/whatsapp/inbox/conversations/:contactPhone/messages
 * @desc    Get messages for a conversation
 * @access  Private (Coach or Staff)
 */
router.get('/inbox/conversations/:contactPhone/messages', protect, authorizeCoach, whatsappController.getConversationMessages);

/**
 * @route   POST /api/whatsapp/inbox/conversations/:conversationId/read
 * @desc    Mark conversation as read
 * @access  Private (Coach or Staff)
 */
router.post('/inbox/conversations/:conversationId/read', protect, authorizeCoach, whatsappController.markConversationAsRead);

/**
 * @route   POST /api/whatsapp/inbox/conversations/:conversationId/archive
 * @desc    Archive/unarchive conversation
 * @access  Private (Coach or Staff)
 */
router.post('/inbox/conversations/:conversationId/archive', protect, authorizeCoach, whatsappController.archiveConversation);

/**
 * @route   POST /api/whatsapp/inbox/conversations/:conversationId/pin
 * @desc    Toggle conversation pin
 * @access  Private (Coach or Staff)
 */
router.post('/inbox/conversations/:conversationId/pin', protect, authorizeCoach, whatsappController.togglePinConversation);

/**
 * @route   GET /api/whatsapp/inbox/search
 * @desc    Search conversations and messages
 * @access  Private (Coach or Staff)
 */
router.get('/inbox/search', protect, authorizeCoach, whatsappController.searchInbox);

/**
 * @route   GET /api/whatsapp/inbox/stats
 * @desc    Get inbox statistics
 * @access  Private (Coach or Staff)
 */
router.get('/inbox/stats', protect, authorizeCoach, whatsappController.getInboxStats);

// ========================================
// STAFF-SPECIFIC ROUTES
// ========================================

/**
 * @route   GET /api/whatsapp/staff/integrations
 * @desc    Get all staff WhatsApp integrations (Admin only)
 * @access  Private (Admin only)
 */
router.get('/staff/integrations', protect, authorizeCoach, whatsappController.getIntegrations);

// ========================================
// ADMIN ROUTES
// ========================================

/**
 * @route   GET /api/whatsapp/admin/all-integrations
 * @desc    Get all WhatsApp integrations across the platform (Admin only)
 * @access  Private (Admin only)
 */
router.get('/admin/all-integrations', protect, authorizeCoach, whatsappController.getAllCoachIntegrations);

// ========================================
// CONTACT MANAGEMENT ROUTES
// ========================================

/**
 * @route   GET /api/whatsapp/contacts
 * @desc    Get all contacts
 * @access  Private (Coach only)
 */
router.get('/contacts', protect, authorizeCoach, whatsappController.getContacts);

/**
 * @route   PUT /api/whatsapp/contacts/:contactId
 * @desc    Update contact information
 * @access  Private (Coach only)
 */
router.put('/contacts/:contactId', protect, authorizeCoach, whatsappController.updateContact);

/**
 * @route   POST /api/whatsapp/contacts/:contactId/block
 * @desc    Block/unblock contact
 * @access  Private (Coach only)
 */
router.post('/contacts/:contactId/block', protect, authorizeCoach, whatsappController.toggleContactBlock);

// ========================================
// WEBHOOK ROUTES (for Meta API)
// ========================================

/**
 * @route   GET /api/whatsapp/webhook
 * @desc    WhatsApp webhook verification
 * @access  Public
 */
router.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verify token should match your webhook verify token
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode && token === verifyToken) {
        console.log('Webhook verified');
        res.status(200).send(challenge);
    } else {
        console.log('Webhook verification failed');
        res.sendStatus(403);
    }
});

/**
 * @route   POST /api/whatsapp/webhook
 * @desc    Handle incoming WhatsApp messages
 * @access  Public
 */
router.post('/webhook', async (req, res) => {
    try {
        const body = req.body;

        if (body.object === 'whatsapp_business_account') {
            if (body.entry && body.entry.length > 0) {
                for (const entry of body.entry) {
                    if (entry.changes && entry.changes.length > 0) {
                        for (const change of entry.changes) {
                            if (change.value && change.value.messages && change.value.messages.length > 0) {
                                for (const message of change.value.messages) {
                                    // Process incoming message
                                    console.log('Incoming WhatsApp message:', message);
                                    
                                    // Here you would call the unified service to handle the message
                                    // This would integrate with your existing automation system
                                }
                            }
                        }
                    }
                }
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});

module.exports = router;
