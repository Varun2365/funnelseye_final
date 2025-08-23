// D:\\PRJ_YCT_Final\\routes\\coachWhatsappRoutes.js

const express = require('express');
const router = express.Router();
const { 
    // WhatsApp Management
    initializeWhatsApp,
    getActiveConversations,
    getConversationHistory,
    getEscalationQueue,
    resolveEscalation,
    
    // Automation Rules
    getAutomationRules,
    createAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
    
    // Message Templates
    getMessageTemplates,
    createMessageTemplate,
    
    // Campaign Management
    getWhatsAppCampaigns,
    createWhatsAppCampaign,
    sendCampaign,
    
    // Analytics
    getWhatsAppAnalytics,
    getLeadEngagementInsights,
    
    // Settings
    getWhatsAppSettings,
    updateWhatsAppSettings,
    testWhatsAppIntegration
} = require('../controllers/coachWhatsappController');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// ===== WHATSAPP MANAGEMENT =====

// Initialize WhatsApp manager
router.post('/initialize', initializeWhatsApp);

// Get active conversations
router.get('/conversations', getActiveConversations);

// Get conversation history for a specific lead
router.get('/conversations/:leadId/history', getConversationHistory);

// Get escalation queue
router.get('/escalations', getEscalationQueue);

// Resolve an escalation
router.put('/escalations/:leadId/resolve', resolveEscalation);

// ===== AUTOMATION RULES =====

// Get all automation rules
router.get('/automation-rules', getAutomationRules);

// Create new automation rule
router.post('/automation-rules', createAutomationRule);

// Update automation rule
router.put('/automation-rules/:ruleId', updateAutomationRule);

// Delete automation rule
router.delete('/automation-rules/:ruleId', deleteAutomationRule);

// ===== MESSAGE TEMPLATES =====

// Get all message templates
router.get('/templates', getMessageTemplates);

// Create new message template
router.post('/templates', createMessageTemplate);

// ===== CAMPAIGN MANAGEMENT =====

// Get all WhatsApp campaigns
router.get('/campaigns', getWhatsAppCampaigns);

// Create new campaign
router.post('/campaigns', createWhatsAppCampaign);

// Send campaign
router.post('/campaigns/:campaignId/send', sendCampaign);

// ===== ANALYTICS =====

// Get WhatsApp analytics
router.get('/analytics', getWhatsAppAnalytics);

// Get lead engagement insights
router.get('/leads/:leadId/engagement-insights', getLeadEngagementInsights);

// ===== SETTINGS =====

// Get WhatsApp settings
router.get('/settings', getWhatsAppSettings);

// Update WhatsApp settings
router.put('/settings', updateWhatsAppSettings);

// Test WhatsApp integration
router.post('/test-integration', testWhatsAppIntegration);

module.exports = router;