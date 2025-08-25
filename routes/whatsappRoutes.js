const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const { protect, authorizeCoach } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect, authorizeCoach);

// ========================================
// INTEGRATION MANAGEMENT ROUTES
// ========================================

/**
 * @route   POST /api/whatsapp/integration/setup
 * @desc    Setup WhatsApp integration (Meta API or Baileys)
 * @access  Private (Coach only)
 */
router.post('/integration/setup', whatsappController.setupIntegration);

/**
 * @route   POST /api/whatsapp/integration/switch
 * @desc    Switch between integration types
 * @access  Private (Coach only)
 */
router.post('/integration/switch', whatsappController.switchIntegration);

/**
 * @route   GET /api/whatsapp/integration/list
 * @desc    Get all integrations for a coach
 * @access  Private (Coach only)
 */
router.get('/integration/list', whatsappController.getIntegrations);

/**
 * @route   POST /api/whatsapp/integration/test
 * @desc    Test integration connection
 * @access  Private (Coach only)
 */
router.post('/integration/test', whatsappController.testIntegration);

/**
 * @route   GET /api/whatsapp/integration/health
 * @desc    Get integration health status
 * @access  Private (Coach only)
 */
router.get('/integration/health', whatsappController.getIntegrationHealth);

// ========================================
// MESSAGING ROUTES
// ========================================

/**
 * @route   POST /api/whatsapp/message/send
 * @desc    Send WhatsApp message
 * @access  Private (Coach only)
 */
router.post('/message/send', whatsappController.sendMessage);

/**
 * @route   POST /api/whatsapp/message/template
 * @desc    Send template message
 * @access  Private (Coach only)
 */
router.post('/message/template', whatsappController.sendTemplateMessage);

// ========================================
// INBOX MANAGEMENT ROUTES
// ========================================

/**
 * @route   GET /api/whatsapp/inbox/conversations
 * @desc    Get inbox conversations
 * @access  Private (Coach only)
 */
router.get('/inbox/conversations', whatsappController.getInboxConversations);

/**
 * @route   GET /api/whatsapp/inbox/conversations/:conversationId/messages
 * @desc    Get messages for a conversation
 * @access  Private (Coach only)
 */
router.get('/inbox/conversations/:conversationId/messages', whatsappController.getConversationMessages);

/**
 * @route   POST /api/whatsapp/inbox/conversations/:conversationId/read
 * @desc    Mark conversation as read
 * @access  Private (Coach only)
 */
router.post('/inbox/conversations/:conversationId/read', whatsappController.markConversationAsRead);

/**
 * @route   POST /api/whatsapp/inbox/conversations/:conversationId/archive
 * @desc    Archive conversation
 * @access  Private (Coach only)
 */
router.post('/inbox/conversations/:conversationId/archive', whatsappController.archiveConversation);

/**
 * @route   POST /api/whatsapp/inbox/conversations/:conversationId/pin
 * @desc    Toggle conversation pin
 * @access  Private (Coach only)
 */
router.post('/inbox/conversations/:conversationId/pin', whatsappController.togglePinConversation);

/**
 * @route   GET /api/whatsapp/inbox/stats
 * @desc    Get inbox statistics
 * @access  Private (Coach only)
 */
router.get('/inbox/stats', whatsappController.getInboxStats);

/**
 * @route   GET /api/whatsapp/inbox/search
 * @desc    Search inbox
 * @access  Private (Coach only)
 */
router.get('/inbox/search', whatsappController.searchInbox);

// ========================================
// CONTACT MANAGEMENT ROUTES
// ========================================

/**
 * @route   GET /api/whatsapp/contacts
 * @desc    Get all contacts
 * @access  Private (Coach only)
 */
router.get('/contacts', whatsappController.getContacts);

/**
 * @route   PUT /api/whatsapp/contacts/:contactId
 * @desc    Update contact information
 * @access  Private (Coach only)
 */
router.put('/contacts/:contactId', whatsappController.updateContact);

/**
 * @route   POST /api/whatsapp/contacts/:contactId/block
 * @desc    Block/unblock contact
 * @access  Private (Coach only)
 */
router.post('/contacts/:contactId/block', whatsappController.toggleContactBlock);

// ========================================
// BAILEYS SPECIFIC ROUTES
// ========================================

/**
 * @route   POST /api/whatsapp/baileys/session/init
 * @desc    Initialize Baileys session
 * @access  Private (Coach only)
 */
router.post('/baileys/session/init', whatsappController.initializeBaileysSession);

/**
 * @route   GET /api/whatsapp/baileys/session/qr
 * @desc    Get Baileys QR code
 * @access  Private (Coach only)
 */
router.get('/baileys/session/qr', whatsappController.getBaileysQRCode);

/**
 * @route   GET /api/whatsapp/baileys/session/status
 * @desc    Get Baileys session status
 * @access  Private (Coach only)
 */
router.get('/baileys/session/status', whatsappController.getBaileysSessionStatus);

/**
 * @route   POST /api/whatsapp/baileys/session/disconnect
 * @desc    Disconnect Baileys session
 * @access  Private (Coach only)
 */
router.post('/baileys/session/disconnect', whatsappController.disconnectBaileysSession);

/**
 * @route   DELETE /api/whatsapp/baileys/session
 * @desc    Delete Baileys session data
 * @access  Private (Coach only)
 */
router.delete('/baileys/session', whatsappController.deleteBaileysSession);

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
