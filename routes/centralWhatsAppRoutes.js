const express = require('express');
const router = express.Router();

// Import controllers
const centralWhatsAppController = require('../controllers/centralWhatsAppController');

// Import middleware
const { verifyAdminToken, noLogActivity } = require('../middleware/adminAuth');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');

// ===== ADMIN CENTRAL WHATSAPP ROUTES =====
// These routes are mounted at /api/admin/central-whatsapp
// All admin routes use verifyAdminToken middleware

// @route   GET /api/admin/central-whatsapp/debug-auth
// @desc    Debug admin authentication
// @access  Private (Admin) - Uses verifyAdminToken only
router.get('/debug-auth',
    verifyAdminToken,
    (req, res) => {
        res.json({
            success: true,
            message: 'Admin authentication successful',
            data: {
                adminId: req.admin?.id,
                adminEmail: req.admin?.email,
                adminRole: req.admin?.role,
                adminPermissions: req.admin?.permissions,
                timestamp: new Date().toISOString()
            }
        });
    }
);

// @route   POST /api/admin/central-whatsapp/setup
// @desc    Setup Central WhatsApp Configuration
// @access  Private (Admin) - Uses verifyAdminToken
router.post('/setup',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.setupCentralWhatsApp
);

// @route   GET /api/admin/central-whatsapp/config
// @desc    Get Central WhatsApp Configuration
// @access  Private (Admin)
router.get('/config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getCentralWhatsAppConfig
);

// @route   PUT /api/admin/central-whatsapp/config
// @desc    Update Central WhatsApp Configuration
// @access  Private (Admin)
router.put('/config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.updateCentralWhatsAppConfig
);

// @route   GET /api/admin/central-whatsapp/health
// @desc    Health Check for Central WhatsApp
// @access  Private (Admin)
router.get('/health',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.healthCheck
);

// ===== TEMPLATE MANAGEMENT =====

// @route   POST /api/admin/central-whatsapp/templates
// @desc    Create WhatsApp Template
// @access  Private (Admin)
router.post('/templates',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.createTemplate
);

// @route   GET /api/admin/central-whatsapp/templates
// @desc    Get All Templates
// @access  Private (Admin)
router.get('/templates',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getTemplates
);

// @route   POST /api/admin/central-whatsapp/templates/sync
// @desc    Sync Templates from Meta
// @access  Private (Admin)
router.post('/templates/sync',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.syncTemplates
);

// ===== CONTACT MANAGEMENT =====

// @route   GET /api/admin/central-whatsapp/contacts
// @desc    Get Contacts
// @access  Private (Admin)
router.get('/contacts',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getContacts
);

// ===== TESTING =====

// @route   POST /api/admin/central-whatsapp/test-message
// @desc    Send Test Message
// @access  Private (Admin)
router.post('/test-message',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.sendTestMessage
);

// ===== MESSAGE MANAGEMENT =====

// @route   GET /api/admin/central-whatsapp/messages
// @desc    Get All WhatsApp Messages
// @access  Private (Admin)
router.get('/messages',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getAllMessages
);

// @route   GET /api/admin/central-whatsapp/messages/conversation/:conversationId
// @desc    Get Conversation Messages
// @access  Private (Admin)
router.get('/messages/conversation/:conversationId',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getConversationMessages
);

// @route   GET /api/admin/central-whatsapp/messages/coach/:coachId
// @desc    Get Messages by Coach
// @access  Private (Admin)
router.get('/messages/coach/:coachId',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getMessagesByCoach
);

// @route   GET /api/admin/central-whatsapp/messages/lead/:leadId
// @desc    Get Messages by Lead
// @access  Private (Admin)
router.get('/messages/lead/:leadId',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getMessagesByLead
);

// @route   POST /api/admin/central-whatsapp/send-message
// @desc    Send Message as Admin
// @access  Private (Admin)
router.post('/send-message',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.sendAdminMessage
);

// @route   GET /api/whatsapp/v1/test-config
// @desc    Test WhatsApp Configuration
// @access  Private (Admin)
router.get('/test-config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.testConfiguration
);

// @route   GET /api/admin/central-whatsapp/analytics
// @desc    Get WhatsApp Analytics
// @access  Private (Admin)
router.get('/analytics',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getWhatsAppAnalytics
);

// ===== COACH WHATSAPP ROUTES =====
// These routes are mounted at /api/centralwhatsapp
// All coach routes use protect middleware (coach authentication)

// @route   POST /api/centralwhatsapp/send-message
// @desc    Send WhatsApp Message (Coach)
// @access  Private (Coach) - Uses protect middleware
router.post('/send-message',
    protect,
    centralWhatsAppController.sendCoachMessage
);

// @route   GET /api/centralwhatsapp/templates
// @desc    Get Available Templates (Coach)
// @access  Private (Coach)
router.get('/templates',
    protect,
    centralWhatsAppController.getCoachTemplates
);

// @route   GET /api/centralwhatsapp/contacts
// @desc    Get Coach's Contacts
// @access  Private (Coach)
router.get('/contacts',
    protect,
    centralWhatsAppController.getCoachContacts
);

// @route   GET /api/centralwhatsapp/status
// @desc    Get Central WhatsApp Status (Coach)
// @access  Private (Coach)
router.get('/status',
    protect,
    centralWhatsAppController.getCoachStatus
);

module.exports = router;
