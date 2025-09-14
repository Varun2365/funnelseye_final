// D:\PRJ_YCT_Final\routes\marketingV1Routes.js

const express = require('express');
const router = express.Router();
const { protect, authorizeCoach } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const {
    // Credentials Management
    getMetaSetupSteps,
    getOpenAISetupSteps,
    setupMetaCredentials,
    verifyMetaCredentials,
    getMetaAccountInfo,
    setupOpenAICredentials,
    getCredentialsStatus,
    
    // Campaign Analysis & Management
    getCampaignAnalysis,
    getCampaignInsights,
    getCampaignMetrics,
    getCampaignAudienceInsights,
    getCampaignRecommendations,
    createCampaign,
    updateCampaign,
    pauseCampaign,
    resumeCampaign,
    deleteCampaign,
    duplicateCampaign,
    
    // AI-Powered Features
    generateAICopy,
    generateAITargeting,
    optimizeCampaignWithAI,
    generateAICreatives,
    getAIPerformanceInsights,
    generateAIStrategy,
    
    // Dashboard & Analytics
    getMarketingDashboard,
    getCampaignPerformanceSummary,
    exportCampaignData,
    
    // Automation & Scheduling
    scheduleCampaign,
    setupCampaignAutomation,
    getAutomationStatus
} = require('../controllers/marketingV1Controller');

// All routes are protected and require coach authentication
router.use(protect, updateLastActive);

// ===== CREDENTIALS MANAGEMENT =====

// Get Meta API setup steps
router.get('/credentials/meta/setup-steps', authorizeCoach('coach'), getMetaSetupSteps);

// Get OpenAI setup steps
router.get('/credentials/openai/setup-steps', authorizeCoach('coach'), getOpenAISetupSteps);

// Setup Meta API credentials
router.post('/credentials/meta', authorizeCoach('coach'), setupMetaCredentials);

// Verify Meta API credentials
router.post('/credentials/meta/verify', authorizeCoach('coach'), verifyMetaCredentials);

// Get Meta account information
router.get('/credentials/meta/account-info', authorizeCoach('coach'), getMetaAccountInfo);

// Setup OpenAI credentials
router.post('/credentials/openai', authorizeCoach('coach'), setupOpenAICredentials);

// Get marketing credentials status
router.get('/credentials/status', authorizeCoach('coach'), getCredentialsStatus);

// ===== CAMPAIGN ANALYSIS & MANAGEMENT =====

// Get comprehensive campaign analysis
router.get('/campaigns/analysis', authorizeCoach('coach'), getCampaignAnalysis);

// Get detailed campaign insights
router.get('/campaigns/:campaignId/insights', authorizeCoach('coach'), getCampaignInsights);

// Get campaign performance metrics
router.get('/campaigns/:campaignId/metrics', authorizeCoach('coach'), getCampaignMetrics);

// Get campaign audience insights
router.get('/campaigns/:campaignId/audience-insights', authorizeCoach('coach'), getCampaignAudienceInsights);

// Get campaign optimization recommendations
router.get('/campaigns/:campaignId/recommendations', authorizeCoach('coach'), getCampaignRecommendations);

// Create new campaign with AI assistance
router.post('/campaigns/create', authorizeCoach('coach'), createCampaign);

// Update campaign settings
router.put('/campaigns/:campaignId', authorizeCoach('coach'), updateCampaign);

// Pause campaign
router.post('/campaigns/:campaignId/pause', authorizeCoach('coach'), pauseCampaign);

// Resume campaign
router.post('/campaigns/:campaignId/resume', authorizeCoach('coach'), resumeCampaign);

// Delete campaign
router.delete('/campaigns/:campaignId', authorizeCoach('coach'), deleteCampaign);

// Duplicate campaign
router.post('/campaigns/:campaignId/duplicate', authorizeCoach('coach'), duplicateCampaign);

// ===== AI-POWERED FEATURES =====

// Generate AI-powered ad copy
router.post('/ai/generate-copy', authorizeCoach('coach'), generateAICopy);

// Generate AI-powered targeting recommendations
router.post('/ai/targeting-recommendations', authorizeCoach('coach'), generateAITargeting);

// Optimize campaign with AI
router.post('/ai/optimize-campaign/:campaignId', authorizeCoach('coach'), optimizeCampaignWithAI);

// Generate AI-powered creative variations
router.post('/ai/generate-creatives', authorizeCoach('coach'), generateAICreatives);

// Get AI-powered performance insights
router.get('/ai/performance-insights/:campaignId', authorizeCoach('coach'), getAIPerformanceInsights);

// Generate AI-powered marketing strategy
router.post('/ai/generate-strategy', authorizeCoach('coach'), generateAIStrategy);

// ===== DASHBOARD & ANALYTICS =====

// Get marketing dashboard data
router.get('/dashboard', authorizeCoach('coach'), getMarketingDashboard);

// Get campaign performance summary
router.get('/campaigns/performance-summary', authorizeCoach('coach'), getCampaignPerformanceSummary);

// Export campaign data
router.get('/campaigns/export', authorizeCoach('coach'), exportCampaignData);

// ===== AUTOMATION & SCHEDULING =====

// Schedule campaign
router.post('/campaigns/:campaignId/schedule', authorizeCoach('coach'), scheduleCampaign);

// Set up campaign automation rules
router.post('/campaigns/:campaignId/automation', authorizeCoach('coach'), setupCampaignAutomation);

// Get automation status
router.get('/campaigns/:campaignId/automation/status', authorizeCoach('coach'), getAutomationStatus);

module.exports = router;
