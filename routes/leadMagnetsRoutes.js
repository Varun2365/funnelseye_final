const express = require('express');
const router = express.Router();
const { 
    getCoachLeadMagnets,
    updateCoachLeadMagnets,
    generateAIDietPlan,
    calculateBMIAndRecommendations,
    generateEbookContent,
    calculateWorkoutMetrics,
    trackProgress,
    analyzeSleepQuality,
    assessStressLevel,
    getAvailableLeadMagnets,
    getLeadMagnetAnalytics,
    getLeadMagnetHistory,
    markConversion,
    getInteractionAnalytics
} = require('../controllers/leadMagnetsController');

const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication and resource filtering to all routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('leads'));

// Coach lead magnet management
router.get('/coach', requirePermission('leads:read'), getCoachLeadMagnets);
router.put('/coach', requirePermission('leads:manage'), updateCoachLeadMagnets);

// Lead magnet tools
router.post('/ai-diet-plan', requirePermission('leads:write'), generateAIDietPlan);
router.post('/bmi-calculator', requirePermission('leads:write'), calculateBMIAndRecommendations);
router.post('/ebook-generator', requirePermission('leads:write'), generateEbookContent);
router.post('/workout-calculator', requirePermission('leads:write'), calculateWorkoutMetrics);
router.post('/progress-tracker', requirePermission('leads:write'), trackProgress);
router.post('/sleep-analyzer', requirePermission('leads:write'), analyzeSleepQuality);
router.post('/stress-assessment', requirePermission('leads:write'), assessStressLevel);

// Mark lead magnet conversion
router.post('/mark-conversion', requirePermission('leads:update'), markConversion);

// Analytics and history
router.get('/available', requirePermission('leads:read'), getAvailableLeadMagnets);
router.get('/analytics', requirePermission('leads:read'), getLeadMagnetAnalytics);
router.get('/interaction-analytics', requirePermission('leads:read'), getInteractionAnalytics);
router.get('/history/:leadId', requirePermission('leads:read'), getLeadMagnetHistory);

module.exports = router;
