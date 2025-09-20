const express = require('express');
const router = express.Router();
const staffEnhancedFeaturesController = require('../controllers/staffEnhancedFeaturesController');

// Apply staff access validation to all routes
router.use(staffEnhancedFeaturesController.validateStaffAccess);

// ===== APPOINTMENT MANAGEMENT =====

// Get staff appointments
router.get('/appointments', staffEnhancedFeaturesController.getStaffAppointments);

// Create appointment
router.post('/appointments', staffEnhancedFeaturesController.createAppointment);

// Update appointment
router.put('/appointments/:appointmentId', staffEnhancedFeaturesController.updateAppointment);

// Reschedule appointment
router.put('/appointments/:appointmentId/reschedule', staffEnhancedFeaturesController.rescheduleAppointment);

// ===== WHATSAPP MESSAGING =====

// Send WhatsApp message
router.post('/whatsapp/send', staffEnhancedFeaturesController.sendWhatsAppMessage);

// Get WhatsApp templates
router.get('/whatsapp/templates', staffEnhancedFeaturesController.getWhatsAppTemplates);

// Get WhatsApp message history
router.get('/whatsapp/messages', staffEnhancedFeaturesController.getWhatsAppMessages);

// ===== AUTOMATION RULES =====

// Get automation rules
router.get('/automation/rules', staffEnhancedFeaturesController.getAutomationRules);

// Create automation rule
router.post('/automation/rules', staffEnhancedFeaturesController.createAutomationRule);

// Update automation rule
router.put('/automation/rules/:ruleId', staffEnhancedFeaturesController.updateAutomationRule);

// Execute automation rule
router.post('/automation/rules/:ruleId/execute', staffEnhancedFeaturesController.executeAutomationRule);

// ===== ADS & CAMPAIGNS =====

// Get ad campaigns
router.get('/ads/campaigns', staffEnhancedFeaturesController.getAdCampaigns);

// Create ad campaign
router.post('/ads/campaigns', staffEnhancedFeaturesController.createAdCampaign);

// Update ad campaign
router.put('/ads/campaigns/:campaignId', staffEnhancedFeaturesController.updateAdCampaign);

// Publish ad campaign
router.post('/ads/campaigns/:campaignId/publish', staffEnhancedFeaturesController.publishAdCampaign);

// Get ad campaign analytics
router.get('/ads/campaigns/:campaignId/analytics', staffEnhancedFeaturesController.getAdCampaignAnalytics);

// ===== PERMISSION REQUESTS =====

// Request additional permissions
router.post('/permissions/request', staffEnhancedFeaturesController.requestPermissions);

// Get permission requests (for coaches/managers)
router.get('/permissions/requests', staffEnhancedFeaturesController.getPermissionRequests);

// Approve permission request
router.post('/permissions/requests/:requestId/approve', staffEnhancedFeaturesController.approvePermissionRequest);

// Deny permission request
router.post('/permissions/requests/:requestId/deny', staffEnhancedFeaturesController.denyPermissionRequest);

module.exports = router;
