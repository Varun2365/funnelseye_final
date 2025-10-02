const express = require('express');
const router = express.Router();

// Import controllers
const centralWhatsAppController = require('../controllers/centralWhatsAppController');
const whatsappInboxController = require('../controllers/whatsappInboxController');
const whatsappAIKnowledgeController = require('../controllers/whatsappAIKnowledgeController');
const whatsappWebhookController = require('../controllers/whatsappWebhookController');
const whatsappCoachSettingsController = require('../controllers/whatsappCoachSettingsController');
const whatsappAdminSettingsController = require('../controllers/whatsappAdminSettingsController');
const messagingController = require('../controllers/messagingController');
const templateController = require('../controllers/templateController');
const contactController = require('../controllers/contactController');
const inboxController = require('../controllers/inboxController');
const unifiedMessagingController = require('../controllers/unifiedMessagingController');
const unifiedMessagingAdminController = require('../controllers/unifiedMessagingAdminController');
const whatsappCreditController = require('../controllers/whatsappCreditController');
const emailConfigController = require('../controllers/emailConfigController');

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

// ===== WHATSAPP V1 ADMIN ROUTES =====
// These routes are mounted at /api/whatsapp/v1 for admin access

// @route   GET /api/whatsapp/v1/config
// @desc    Get Central WhatsApp Configuration
// @access  Private (Admin)
router.get('/config',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getCentralWhatsAppConfig
);

// @route   POST /api/whatsapp/v1/setup
// @desc    Setup Central WhatsApp
// @access  Private (Admin)
router.post('/setup',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.setupCentralWhatsApp
);

// @route   GET /api/whatsapp/v1/templates
// @desc    Get All Templates
// @access  Private (Admin)
router.get('/templates',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getTemplates
);

// @route   GET /api/whatsapp/v1/contacts
// @desc    Get Contacts
// @access  Private (Admin)
router.get('/contacts',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getContacts
);

// @route   GET /api/whatsapp/v1/analytics
// @desc    Get WhatsApp Analytics
// @access  Private (Admin)
router.get('/analytics',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getWhatsAppAnalytics
);

// @route   GET /api/whatsapp/v1/messages
// @desc    Get All WhatsApp Messages
// @access  Private (Admin)
router.get('/messages',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getAllMessages
);

// @route   POST /api/whatsapp/v1/send-message
// @desc    Send Message as Admin
// @access  Private (Admin)
router.post('/send-message',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.sendAdminMessage
);

// @route   POST /api/whatsapp/v1/test-message
// @desc    Send Test Message
// @access  Private (Admin)
router.post('/test-message',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.sendTestMessage
);

// @route   PUT /api/whatsapp/v1/contacts/update
// @desc    Update Contact Name
// @access  Private (Admin)
router.put('/contacts/update',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.updateContact
);

// @route   POST /api/whatsapp/v1/send-bulk-messages
// @desc    Send Bulk Messages
// @access  Private (Admin)
router.post('/send-bulk-messages',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.sendBulkMessages
);

// @route   GET /api/admin/central-whatsapp/analytics
// @desc    Get WhatsApp Analytics
// @access  Private (Admin)
router.get('/analytics',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getWhatsAppAnalytics
);

// ===== CREDIT & SETTINGS MANAGEMENT =====

// @route   GET /api/admin/central-whatsapp/credit-settings
// @desc    Get Credit Rates and Settings
// @access  Private (Admin)
router.get('/credit-settings',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getCreditSettings
);

// @route   PUT /api/admin/central-whatsapp/credit-settings
// @desc    Update Credit Rates and Settings
// @access  Private (Admin)
router.put('/credit-settings',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.updateCreditSettings
);

// @route   GET /api/admin/central-whatsapp/settings-overview
// @desc    Get Complete Admin Settings Overview
// @access  Private (Admin)
router.get('/settings-overview',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    centralWhatsAppController.getSettingsOverview
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

// ===== WHATSAPP INBOX ROUTES =====
// These routes are accessible by Admin, Coach, and Staff

// @route   GET /api/whatsapp/v1/inbox
// @desc    Get inbox messages for user
// @access  Private (Admin/Coach/Staff)
router.get('/inbox',
    protect,
    whatsappInboxController.getInboxMessages
);

// @route   GET /api/whatsapp/v1/inbox/conversation/:conversationId
// @desc    Get conversation messages
// @access  Private (Admin/Coach/Staff)
router.get('/inbox/conversation/:conversationId',
    protect,
    whatsappInboxController.getConversationMessages
);

// @route   POST /api/whatsapp/v1/inbox/send
// @desc    Send message from inbox
// @access  Private (Admin/Coach/Staff)
router.post('/inbox/send',
    protect,
    whatsappInboxController.sendInboxMessage
);

// @route   PUT /api/whatsapp/v1/inbox/messages/:messageId/read
// @desc    Mark message as read
// @access  Private (Admin/Coach/Staff)
router.put('/inbox/messages/:messageId/read',
    protect,
    whatsappInboxController.markMessageAsRead
);

// @route   PUT /api/whatsapp/v1/inbox/messages/:messageId/assign
// @desc    Assign message to user
// @access  Private (Admin/Coach/Staff)
router.put('/inbox/messages/:messageId/assign',
    protect,
    whatsappInboxController.assignMessage
);

// @route   PUT /api/whatsapp/v1/inbox/messages/:messageId/archive
// @desc    Archive message
// @access  Private (Admin/Coach/Staff)
router.put('/inbox/messages/:messageId/archive',
    protect,
    whatsappInboxController.archiveMessage
);

// @route   GET /api/whatsapp/v1/inbox/stats
// @desc    Get inbox statistics
// @access  Private (Admin/Coach/Staff)
router.get('/inbox/stats',
    protect,
    whatsappInboxController.getInboxStats
);

// ===== AI KNOWLEDGE MANAGEMENT ROUTES =====
// These routes are Admin only

// @route   POST /api/whatsapp/v1/ai-knowledge
// @desc    Create AI Knowledge Base
// @access  Private (Admin)
router.post('/ai-knowledge',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.createAIKnowledge
);

// @route   GET /api/whatsapp/v1/ai-knowledge
// @desc    Get all AI Knowledge Bases
// @access  Private (Admin)
router.get('/ai-knowledge',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.getAIKnowledgeBases
);

// @route   GET /api/whatsapp/v1/ai-knowledge/:id
// @desc    Get single AI Knowledge Base
// @access  Private (Admin)
router.get('/ai-knowledge/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.getAIKnowledgeBase
);

// @route   PUT /api/whatsapp/v1/ai-knowledge/:id
// @desc    Update AI Knowledge Base
// @access  Private (Admin)
router.put('/ai-knowledge/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.updateAIKnowledgeBase
);

// @route   DELETE /api/whatsapp/v1/ai-knowledge/:id
// @desc    Delete AI Knowledge Base
// @access  Private (Admin)
router.delete('/ai-knowledge/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.deleteAIKnowledgeBase
);

// @route   PUT /api/whatsapp/v1/ai-knowledge/:id/set-default
// @desc    Set default AI Knowledge Base
// @access  Private (Admin)
router.put('/ai-knowledge/:id/set-default',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.setDefaultAIKnowledgeBase
);

// @route   POST /api/whatsapp/v1/ai-knowledge/:id/test
// @desc    Test AI Knowledge Base
// @access  Private (Admin)
router.post('/ai-knowledge/:id/test',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.testAIKnowledgeBase
);

// @route   GET /api/whatsapp/v1/ai-knowledge/:id/stats
// @desc    Get AI Knowledge Base statistics
// @access  Private (Admin)
router.get('/ai-knowledge/:id/stats',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAIKnowledgeController.getAIKnowledgeStats
);

// ===== WEBHOOK ROUTES =====

// @route   POST /api/whatsapp/v1/webhook
// @desc    Handle WhatsApp webhook from Meta
// @access  Public (Meta webhook)
router.post('/webhook',
    whatsappWebhookController.handleWebhook
);

// @route   GET /api/whatsapp/v1/webhook/status
// @desc    Get webhook status
// @access  Private (Admin)
router.get('/webhook/status',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappWebhookController.getWebhookStatus
);

// ===== COACH WHATSAPP SETTINGS ROUTES =====
// These routes are mounted at /api/whatsapp/v1/coach/settings
// All coach routes use protect middleware

// @route   GET /api/whatsapp/v1/coach/settings
// @desc    Get coach's WhatsApp settings
// @access  Private (Coach)
router.get('/coach/settings',
    protect,
    whatsappCoachSettingsController.getCoachSettings
);

// @route   POST /api/whatsapp/v1/coach/settings
// @desc    Create or update coach's WhatsApp settings
// @access  Private (Coach)
router.post('/coach/settings',
    protect,
    whatsappCoachSettingsController.createOrUpdateCoachSettings
);

// @route   PUT /api/whatsapp/v1/coach/settings/customize
// @desc    Customize specific field in coach settings
// @access  Private (Coach)
router.put('/coach/settings/customize',
    protect,
    whatsappCoachSettingsController.customizeCoachField
);

// @route   DELETE /api/whatsapp/v1/coach/settings/customize/:fieldPath
// @desc    Remove customization for specific field
// @access  Private (Coach)
router.delete('/coach/settings/customize/:fieldPath',
    protect,
    whatsappCoachSettingsController.removeCoachCustomization
);

// @route   PUT /api/whatsapp/v1/coach/settings/set-default
// @desc    Set coach settings as default
// @access  Private (Coach)
router.put('/coach/settings/set-default',
    protect,
    whatsappCoachSettingsController.setCoachSettingsAsDefault
);

// @route   GET /api/whatsapp/v1/coach/settings/effective
// @desc    Get coach's effective settings (with inheritance applied)
// @access  Private (Coach)
router.get('/coach/settings/effective',
    protect,
    whatsappCoachSettingsController.getCoachEffectiveSettings
);

// @route   POST /api/whatsapp/v1/coach/settings/test-ai
// @desc    Test coach's AI settings
// @access  Private (Coach)
router.post('/coach/settings/test-ai',
    protect,
    whatsappCoachSettingsController.testCoachAISettings
);

// @route   GET /api/whatsapp/v1/coach/settings/analytics
// @desc    Get coach's WhatsApp analytics
// @access  Private (Coach)
router.get('/coach/settings/analytics',
    protect,
    whatsappCoachSettingsController.getCoachAnalytics
);

// @route   PUT /api/whatsapp/v1/coach/settings/reset
// @desc    Reset coach settings to inherit from parent
// @access  Private (Coach)
router.put('/coach/settings/reset',
    protect,
    whatsappCoachSettingsController.resetCoachSettings
);

// @route   POST /api/whatsapp/v1/coach/settings/clone
// @desc    Clone settings from another coach
// @access  Private (Coach)
router.post('/coach/settings/clone',
    protect,
    whatsappCoachSettingsController.cloneCoachSettings
);

// ===== ADMIN WHATSAPP SETTINGS ROUTES =====
// These routes are mounted at /api/whatsapp/v1/admin/settings
// All admin routes use verifyAdminToken middleware

// @route   GET /api/whatsapp/v1/admin/settings
// @desc    Get all admin WhatsApp settings
// @access  Private (Admin)
router.get('/admin/settings',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getAllAdminSettings
);

// @route   GET /api/whatsapp/v1/admin/settings/:id
// @desc    Get specific admin WhatsApp settings
// @access  Private (Admin)
router.get('/admin/settings/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getAdminSettings
);

// @route   GET /api/whatsapp/v1/admin/settings/default
// @desc    Get default admin WhatsApp settings
// @access  Private (Admin)
router.get('/admin/settings/default',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getDefaultAdminSettings
);

// @route   POST /api/whatsapp/v1/admin/settings
// @desc    Create new admin WhatsApp settings
// @access  Private (Admin)
router.post('/admin/settings',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.createAdminSettings
);

// @route   PUT /api/whatsapp/v1/admin/settings/:id
// @desc    Update admin WhatsApp settings
// @access  Private (Admin)
router.put('/admin/settings/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.updateAdminSettings
);

// @route   PUT /api/whatsapp/v1/admin/settings/:id/set-default
// @desc    Set admin settings as default
// @access  Private (Admin)
router.put('/admin/settings/:id/set-default',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.setAdminSettingsAsDefault
);

// @route   DELETE /api/whatsapp/v1/admin/settings/:id
// @desc    Delete admin WhatsApp settings
// @access  Private (Admin)
router.delete('/admin/settings/:id',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.deleteAdminSettings
);

// @route   POST /api/whatsapp/v1/admin/settings/:id/test-ai
// @desc    Test admin AI settings
// @access  Private (Admin)
router.post('/admin/settings/:id/test-ai',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.testAdminAISettings
);

// @route   GET /api/whatsapp/v1/admin/settings/analytics
// @desc    Get admin WhatsApp analytics
// @access  Private (Admin)
router.get('/admin/settings/analytics',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getAdminAnalytics
);

// @route   POST /api/whatsapp/v1/admin/settings/:id/clone
// @desc    Clone admin settings
// @access  Private (Admin)
router.post('/admin/settings/:id/clone',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.cloneAdminSettings
);

// @route   POST /api/whatsapp/v1/admin/settings/:id/apply-to-coaches
// @desc    Apply settings to all coaches
// @access  Private (Admin)
router.post('/admin/settings/:id/apply-to-coaches',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.applySettingsToCoaches
);

// @route   GET /api/whatsapp/v1/admin/settings/usage-stats
// @desc    Get settings usage statistics
// @access  Private (Admin)
router.get('/admin/settings/usage-stats',
    verifyAdminToken,
    requirePermission('whatsapp_management'),
    whatsappAdminSettingsController.getSettingsUsageStats
);

module.exports = router;
