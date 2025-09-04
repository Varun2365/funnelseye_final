const express = require('express');
const router = express.Router();
const adminWhatsappController = require('../controllers/adminWhatsappController');
const { verifyAdminToken, checkAdminPermission, adminRateLimit, logAdminActivity } = require('../middleware/adminAuth');

// ===== CENTRAL WHATSAPP MANAGEMENT ROUTES =====

// @route   GET /api/admin/whatsapp/settings
// @desc    Get central WhatsApp settings
// @access  Private (Admin)
router.get('/settings', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    logAdminActivity('VIEW_WHATSAPP_SETTINGS'), 
    adminWhatsappController.getCentralWhatsAppSettings
);

// @route   PUT /api/admin/whatsapp/settings
// @desc    Update central WhatsApp settings
// @access  Private (Admin)
router.put('/settings', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('UPDATE_WHATSAPP_SETTINGS'), 
    adminWhatsappController.updateCentralWhatsAppSettings
);

// @route   POST /api/admin/whatsapp/test
// @desc    Test central WhatsApp integration
// @access  Private (Admin)
router.post('/test', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    logAdminActivity('TEST_WHATSAPP_INTEGRATION'), 
    adminWhatsappController.testCentralWhatsAppIntegration
);

// @route   GET /api/admin/whatsapp/analytics
// @desc    Get WhatsApp usage analytics
// @access  Private (Admin)
router.get('/analytics', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    logAdminActivity('VIEW_WHATSAPP_ANALYTICS'), 
    adminWhatsappController.getWhatsAppAnalytics
);

// @route   GET /api/admin/whatsapp/integrations
// @desc    Get all WhatsApp integrations across platform
// @access  Private (Admin)
router.get('/integrations', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    logAdminActivity('VIEW_WHATSAPP_INTEGRATIONS'), 
    adminWhatsappController.getAllWhatsAppIntegrations
);

// @route   GET /api/admin/whatsapp/templates
// @desc    Get WhatsApp message templates
// @access  Private (Admin)
router.get('/templates', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    logAdminActivity('VIEW_WHATSAPP_TEMPLATES'), 
    adminWhatsappController.getWhatsAppTemplates
);

// @route   POST /api/admin/whatsapp/templates
// @desc    Create WhatsApp message template
// @access  Private (Admin)
router.post('/templates', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('CREATE_WHATSAPP_TEMPLATE'), 
    adminWhatsappController.createWhatsAppTemplate
);

// @route   GET /api/admin/whatsapp/webhook
// @desc    Get WhatsApp webhook configuration
// @access  Private (Admin)
router.get('/webhook', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    logAdminActivity('VIEW_WHATSAPP_WEBHOOK'), 
    adminWhatsappController.getWebhookConfiguration
);

// @route   PUT /api/admin/whatsapp/webhook
// @desc    Update webhook configuration
// @access  Private (Admin)
router.put('/webhook', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('UPDATE_WHATSAPP_WEBHOOK'), 
    adminWhatsappController.updateWebhookConfiguration
);

module.exports = router;
