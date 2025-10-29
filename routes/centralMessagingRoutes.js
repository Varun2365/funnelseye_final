const express = require('express');
const router = express.Router();

// Import controllers
const centralMessagingController = require('../controllers/centralMessagingController');
const centralMessagingTemplateController = require('../controllers/centralMessagingTemplateController');

// Import middleware
const { protect } = require('../middleware/auth');
const { verifyAdminToken } = require('../middleware/adminAuth');

/**
 * Central Messaging API Routes
 * Base: /api/central-messaging/v1/
 * 
 * Unified messaging system for WhatsApp and Email
 * Supports: Coach, Staff, Admin
 * Features: Credits, Templates, Analytics, 24hr Window
 */

// ===== TEMPLATE VARIABLES =====

// @route   GET /api/central-messaging/v1/variables
// @desc    Get available template variables
// @access  Private (Coach/Staff/Admin)
router.get('/variables', 
    protect,
    centralMessagingController.getTemplateVariables
);

// @route   POST /api/central-messaging/v1/variables/preview
// @desc    Preview template with variables
// @access  Private (Coach/Staff/Admin)
router.post('/variables/preview',
    protect,
    centralMessagingController.previewTemplate
);

// ===== MESSAGE SENDING =====

// @route   POST /api/central-messaging/v1/send
// @desc    Send message (WhatsApp or Email)
// @access  Private (Coach/Staff/Admin)
// 
// Request Body (WhatsApp):
// {
//   "to": "+1234567890",
//   "messageType": "whatsapp",
//   "type": "text",
//   "message": "Hello!"
// }
//
// Request Body (Email):
// {
//   "to": "user@example.com",
//   "messageType": "email",
//   "subject": "Subject",
//   "emailBody": "Body content"
// }
//
// Request Body (Template with variables):
// {
//   "to": "+1234567890",
//   "messageType": "whatsapp",
//   "type": "template",
//   "templateName": "welcome_message",
//   "templateParameters": ["John"],
//   "leadId": "lead_id_here",
//   "variables": { "custom.var": "value" }
// }
router.post('/send',
    protect,
    centralMessagingController.sendMessage
);

// ===== INBOX =====

// @route   GET /api/central-messaging/v1/inbox
// @desc    Get unified inbox (role-based access)
// @access  Private (Coach/Staff/Admin)
// 
// Query Parameters:
// - page: Page number (default: 1)
// - limit: Items per page (default: 20)
// - contact: Filter by contact phone/email
// - type: Filter by message type (whatsapp, email)
// - within24Hours: Filter contacts within 24hr window (true/false)
//
// Notes:
// - Admin sees all messages
// - Coach sees own messages
// - Staff sees only assigned leads
router.get('/inbox',
    protect,
    centralMessagingController.getUnifiedInbox
);

// ===== CONTACTS =====

// @route   GET /api/central-messaging/v1/contacts
// @desc    Get all contacts with 24hr window info
// @access  Private (Coach/Staff/Admin)
// 
// Query Parameters:
// - page: Page number (default: 1)
// - limit: Items per page (default: 20)
// - within24Hours: Filter by 24hr window (true/false)
//
// Response includes:
// - Contact info
// - Last message
// - Message count
// - 24hr window status
// - Window expiration
router.get('/contacts',
    protect,
    centralMessagingController.getContacts
);

// ===== ANALYTICS =====

// @route   GET /api/central-messaging/v1/analytics
// @desc    Get messaging analytics
// @access  Private (Coach/Staff/Admin)
// 
// Query Parameters:
// - startDate: Start date filter (ISO format)
// - endDate: End date filter (ISO format)
//
// Response includes:
// - WhatsApp stats (sent, total)
// - Email stats (sent, total)
// - Total credits used
// - Credits balance
// - User type
router.get('/analytics',
    protect,
    centralMessagingController.getAnalytics
);

// ===== TEMPLATE VARIABLES =====

// @route   GET /api/central-messaging/v1/templates/variables
// @desc    Get available variables for template creation (with selectable UI format)
// @access  Private (Coach/Admin)
router.get('/templates/variables',
    protect,
    centralMessagingTemplateController.getAvailableVariables
);

// ===== TEMPLATE MANAGEMENT =====

// @route   GET /api/central-messaging/v1/templates/my-templates
// @desc    Get templates available to coach (from subscription + own templates)
// @access  Private (Coach)
router.get('/templates/my-templates',
    protect,
    centralMessagingTemplateController.getMyTemplates
);

// @route   POST /api/central-messaging/v1/templates/create
// @desc    Create template (Admin or Coach) with variable selection
// @access  Private (Coach/Admin)
// 
// Request Body:
// {
//   "name": "appointment_reminder",
//   "description": "Reminder for upcoming appointment",
//   "type": "whatsapp",
//   "category": "reminder",
//   "content": {
//     "body": "Hi {{lead.name}}, your appointment with {{appointment.coachName}} is on {{appointment.dateTime}}"
//   },
//   "selectedVariables": ["lead.name", "appointment.date", "appointment.coachName"],
//   "isMetaTemplate": false
// }
router.post('/templates/create',
    protect,
    centralMessagingTemplateController.createTemplate
);

// @route   POST /api/central-messaging/v1/templates/preview
// @desc    Preview template with actual data
// @access  Private (Coach/Admin)
router.post('/templates/preview',
    protect,
    centralMessagingTemplateController.previewTemplate
);

// @route   GET /api/central-messaging/v1/templates/:templateId/check-usage
// @desc    Check if template can be used (24hr window check)
// @access  Private (Coach)
router.get('/templates/:templateId/check-usage',
    protect,
    centralMessagingTemplateController.checkTemplateUsage
);

// ===== ADMIN TEMPLATE DISTRIBUTION =====

// @route   POST /api/central-messaging/v1/templates/distribute
// @desc    Distribute template to specific subscriptions
// @access  Private (Admin)
router.post('/templates/distribute',
    verifyAdminToken,
    centralMessagingTemplateController.distributeTemplate
);

// ===== LEGACY ROUTES (Keeping for backward compatibility) =====

// @route   GET /api/central-messaging/v1/templates
// @desc    Get templates (Meta + Local) - Legacy endpoint
router.get('/templates',
    protect,
    centralMessagingController.getTemplates
);

// @route   POST /api/central-messaging/v1/templates
// @desc    Create template - Legacy endpoint
router.post('/templates',
    protect,
    centralMessagingController.createTemplate
);

// ===== ADMIN ROUTES =====

// @route   GET /api/central-messaging/v1/admin/config
// @desc    Get messaging configuration
// @access  Private (Admin)
router.get('/admin/config',
    verifyAdminToken,
    centralMessagingController.getConfig
);

// @route   PUT /api/central-messaging/v1/admin/config
// @desc    Update messaging configuration
// @access  Private (Admin)
router.put('/admin/config',
    verifyAdminToken,
    centralMessagingController.updateConfig
);

// @route   GET /api/central-messaging/v1/admin/overview
// @desc    Get system overview
// @access  Private (Admin)
router.get('/admin/overview',
    verifyAdminToken,
    centralMessagingController.getSystemOverview
);

// @route   GET /api/central-messaging/v1/admin/stats
// @desc    Get system-wide messaging statistics
// @access  Private (Admin)
router.get('/admin/stats',
    verifyAdminToken,
    centralMessagingController.getAdminStats
);

// ===== CONVERSATION MANAGEMENT =====

// @route   GET /api/central-messaging/v1/conversation/:contactId
// @desc    Get conversation with contact
// @access  Private (Coach/Staff/Admin)
// 
// Query Parameters:
// - page: Page number (default: 1)
// - limit: Items per page (default: 50)
//
// Notes:
// - Returns all messages (WhatsApp + Email) for a contact
// - Role-based access enforced
router.get('/conversation/:contactId',
    protect,
    centralMessagingController.getConversation
);

// ===== BULK MESSAGING =====

// @route   POST /api/central-messaging/v1/bulk
// @desc    Send bulk messages
// @access  Private (Coach/Staff/Admin)
// 
// Request Body:
// {
//   "recipients": ["+1234567890", "user@email.com"],
//   "messageType": "whatsapp", // or "email"
//   "type": "text", // or "template"
//   "message": "Bulk message content",
//   "templateName": "welcome_template", // if type is template
//   "variables": { "lead.name": "John" },
//   "leadIds": ["lead_id_1", "lead_id_2"] // optional
// }
//
// Notes:
// - Deducts credits for each successful send
// - Returns results for each recipient
router.post('/bulk',
    protect,
    centralMessagingController.sendBulkMessages
);

// ===== CREDITS MANAGEMENT =====

// @route   GET /api/central-messaging/v1/credits/balance
// @desc    Get credit balance
// @access  Private (Coach/Staff)
router.get('/credits/balance',
    protect,
    centralMessagingController.getCreditBalance
);

// @route   GET /api/central-messaging/v1/credits/packages
// @desc    Get available credit packages
// @access  Public
router.get('/credits/packages',
    centralMessagingController.getCreditPackages
);

// @route   POST /api/central-messaging/v1/credits/purchase
// @desc    Purchase credits
// @access  Private (Coach/Staff)
router.post('/credits/purchase',
    protect,
    centralMessagingController.purchaseCredits
);

// @route   GET /api/central-messaging/v1/credits/transactions
// @desc    Get credit transaction history
// @access  Private (Coach/Staff)
router.get('/credits/transactions',
    protect,
    centralMessagingController.getCreditTransactions
);

// ===== EMAIL CONFIGURATION (Admin) =====

// @route   GET /api/central-messaging/v1/admin/email/config
// @desc    Get email configuration
// @access  Private (Admin)
router.get('/admin/email/config',
    verifyAdminToken,
    centralMessagingController.getEmailConfig
);

// @route   POST /api/central-messaging/v1/admin/email/setup
// @desc    Setup email configuration
// @access  Private (Admin)
router.post('/admin/email/setup',
    verifyAdminToken,
    centralMessagingController.setupEmail
);

// @route   POST /api/central-messaging/v1/admin/email/test
// @desc    Send test email
// @access  Private (Admin)
router.post('/admin/email/test',
    verifyAdminToken,
    centralMessagingController.testEmail
);

// ===== WHATSAPP CONFIGURATION (Admin) =====

// @route   GET /api/central-messaging/v1/admin/whatsapp/config
// @desc    Get WhatsApp configuration
// @access  Private (Admin)
router.get('/admin/whatsapp/config',
    verifyAdminToken,
    centralMessagingController.getWhatsAppConfig
);

// @route   POST /api/central-messaging/v1/admin/whatsapp/setup
// @desc    Setup WhatsApp configuration
// @access  Private (Admin)
router.post('/admin/whatsapp/setup',
    verifyAdminToken,
    centralMessagingController.setupWhatsApp
);

// @route   POST /api/central-messaging/v1/admin/whatsapp/test
// @desc    Send test WhatsApp message
// @access  Private (Admin)
router.post('/admin/whatsapp/test',
    verifyAdminToken,
    centralMessagingController.testWhatsApp
);

// @route   GET /api/central-messaging/v1/admin/whatsapp/templates
// @desc    Get Meta templates
// @access  Private (Admin)
router.get('/admin/whatsapp/templates',
    verifyAdminToken,
    centralMessagingController.getMetaTemplates
);

// @route   POST /api/central-messaging/v1/admin/whatsapp/templates/sync
// @desc    Sync templates from Meta
// @access  Private (Admin)
router.post('/admin/whatsapp/templates/sync',
    verifyAdminToken,
    centralMessagingController.syncMetaTemplates
);

// ===== STAFF ROUTES =====

// @route   GET /api/central-messaging/v1/staff/assigned-leads
// @desc    Get leads assigned to staff member
// @access  Private (Staff)
router.get('/staff/assigned-leads',
    protect,
    centralMessagingController.getAssignedLeads
);

// @route   GET /api/central-messaging/v1/staff/contacts
// @desc    Get contacts from assigned leads only
// @access  Private (Staff)
router.get('/staff/contacts',
    protect,
    centralMessagingController.getStaffContacts
);

// @route   GET /api/central-messaging/v1/staff/inbox
// @desc    Get inbox for staff (filtered by assigned leads)
// @access  Private (Staff)
router.get('/staff/inbox',
    protect,
    centralMessagingController.getStaffInbox
);

// ===== ADVANCED FEATURES =====

// @route   POST /api/central-messaging/v1/preview
// @desc    Preview message before sending
// @access  Private (Coach/Staff)
// 
// Request Body:
// {
//   "messageType": "whatsapp",
//   "type": "text",
//   "message": "Hello {{lead.name}}",
//   "leadId": "lead_id_here",
//   "variables": { "custom.var": "value" }
// }
router.post('/preview',
    protect,
    centralMessagingController.previewMessage
);

// @route   GET /api/central-messaging/v1/24hr-window
// @desc    Get contacts within Meta 24-hour window
// @access  Private (Coach/Staff/Admin)
router.get('/24hr-window',
    protect,
    centralMessagingController.get24HourWindowContacts
);

// ===== AUTOMATION INTEGRATION =====

// @route   POST /api/central-messaging/v1/automation/send
// @desc    Send message via automation
// @access  Private (System/Automation)
router.post('/automation/send',
    centralMessagingController.sendAutomationMessage
);

// @route   POST /api/central-messaging/v1/automation/webhook
// @desc    Handle automation webhook events
// @access  Private (System)
router.post('/automation/webhook',
    centralMessagingController.handleAutomationWebhook
);

module.exports = router;

