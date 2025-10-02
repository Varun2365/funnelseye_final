const express = require('express');
const router = express.Router();

// Import controllers
const messagingController = require('../controllers/messagingController');
const templateController = require('../controllers/templateController');
const contactController = require('../controllers/contactController');
const inboxController = require('../controllers/inboxController');

// Import middleware
const { protect } = require('../middleware/auth');
const { verifyAdminToken } = require('../middleware/adminAuth');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { noLogActivity } = require('../middleware/adminAuth');

// ===== COACH MESSAGING ROUTES =====
// All routes use protect middleware for coach authentication

// @route   POST /api/messaging/send
// @desc    Send single message (text, template, or media)
// @access  Private (Coach)
router.post('/send', 
    protect, 
    messagingController.sendMessage
);

// @route   POST /api/messaging/send-bulk
// @desc    Send bulk messages to multiple contacts
// @access  Private (Coach)
router.post('/send-bulk', 
    protect, 
    messagingController.sendBulkMessages
);

// @route   GET /api/messaging/contacts
// @desc    Get coach's contacts (leads only)
// @access  Private (Coach)
router.get('/contacts', 
    protect, 
    noLogActivity, 
    contactController.getCoachContacts
);

// @route   GET /api/messaging/contacts/search
// @desc    Search contacts by name, phone, or email
// @access  Private (Coach)
router.get('/contacts/search', 
    protect, 
    noLogActivity, 
    contactController.searchContacts
);

// @route   GET /api/messaging/templates
// @desc    Get available templates for coach
// @access  Private (Coach)
router.get('/templates', 
    protect, 
    noLogActivity, 
    templateController.getCoachTemplates
);

// @route   GET /api/messaging/templates/:templateId/preview
// @desc    Preview template with sample data
// @access  Private (Coach)
router.get('/templates/:templateId/preview', 
    protect, 
    noLogActivity, 
    templateController.previewTemplate
);

// @route   GET /api/messaging/templates/parameters
// @desc    Get available template parameters from database
// @access  Private (Coach)
router.get('/templates/parameters', 
    protect, 
    noLogActivity, 
    templateController.getTemplateParameters
);

// @route   GET /api/messaging/inbox
// @desc    Get inbox messages for coach
// @access  Private (Coach)
router.get('/inbox', 
    protect, 
    noLogActivity, 
    inboxController.getInboxMessages
);

// @route   GET /api/messaging/inbox/conversation/:contactId
// @desc    Get conversation with specific contact
// @access  Private (Coach)
router.get('/inbox/conversation/:contactId', 
    protect, 
    noLogActivity, 
    inboxController.getConversation
);

// @route   POST /api/messaging/inbox/send
// @desc    Send message from inbox
// @access  Private (Coach)
router.post('/inbox/send', 
    protect, 
    inboxController.sendInboxMessage
);

// @route   PUT /api/messaging/inbox/messages/:messageId/read
// @desc    Mark message as read
// @access  Private (Coach)
router.put('/inbox/messages/:messageId/read', 
    protect, 
    inboxController.markAsRead
);

// @route   GET /api/messaging/stats
// @desc    Get messaging statistics for coach
// @access  Private (Coach)
router.get('/stats', 
    protect, 
    noLogActivity, 
    messagingController.getMessagingStats
);

// ===== ADMIN MESSAGING ROUTES =====
// All routes use verifyAdminToken middleware for admin authentication

// @route   GET /api/messaging/admin/contacts
// @desc    Get all contacts across all coaches
// @access  Private (Admin)
router.get('/admin/contacts', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    contactController.getAllContacts
);

// @route   GET /api/messaging/admin/contacts/search
// @desc    Search all contacts by name, phone, or email
// @access  Private (Admin)
router.get('/admin/contacts/search', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    contactController.searchAllContacts
);

// @route   POST /api/messaging/admin/send
// @desc    Send message as admin to any contact
// @access  Private (Admin)
router.post('/admin/send', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    messagingController.sendAdminMessage
);

// @route   POST /api/messaging/admin/send-bulk
// @desc    Send bulk messages as admin
// @access  Private (Admin)
router.post('/admin/send-bulk', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    messagingController.sendAdminBulkMessages
);

// @route   GET /api/messaging/admin/templates
// @desc    Get all templates across all coaches
// @access  Private (Admin)
router.get('/admin/templates', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    templateController.getAllTemplates
);

// @route   POST /api/messaging/admin/templates
// @desc    Create global template
// @access  Private (Admin)
router.post('/admin/templates', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    templateController.createGlobalTemplate
);

// @route   PUT /api/messaging/admin/templates/:templateId
// @desc    Update global template
// @access  Private (Admin)
router.put('/admin/templates/:templateId', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    templateController.updateGlobalTemplate
);

// @route   DELETE /api/messaging/admin/templates/:templateId
// @desc    Delete global template
// @access  Private (Admin)
router.delete('/admin/templates/:templateId', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    templateController.deleteGlobalTemplate
);

// @route   GET /api/messaging/admin/inbox
// @desc    Get all inbox messages across coaches
// @access  Private (Admin)
router.get('/admin/inbox', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    inboxController.getAllInboxMessages
);

// @route   GET /api/messaging/admin/inbox/conversation/:contactId
// @desc    Get conversation with specific contact (admin view)
// @access  Private (Admin)
router.get('/admin/inbox/conversation/:contactId', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    inboxController.getAdminConversation
);

// @route   GET /api/messaging/admin/stats
// @desc    Get system-wide messaging statistics
// @access  Private (Admin)
router.get('/admin/stats', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    messagingController.getAdminMessagingStats
);

// @route   GET /api/messaging/admin/coaches/:coachId/messages
// @desc    Get messages for specific coach
// @access  Private (Admin)
router.get('/admin/coaches/:coachId/messages', 
    verifyAdminToken, 
    requirePermission('whatsapp_management'), 
    noLogActivity, 
    messagingController.getCoachMessages
);

module.exports = router;
