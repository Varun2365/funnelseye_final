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
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Coach lead magnet management
router.get('/coach', getCoachLeadMagnets);
router.put('/coach', updateCoachLeadMagnets);

// Lead magnet tools
router.post('/ai-diet-plan', generateAIDietPlan);
router.post('/bmi-calculator', calculateBMIAndRecommendations);
router.post('/ebook-generator', generateEbookContent);
router.post('/workout-calculator', calculateWorkoutMetrics);
router.post('/progress-tracker', trackProgress);
router.post('/sleep-analyzer', analyzeSleepQuality);
router.post('/stress-assessment', assessStressLevel);

// Mark lead magnet conversion
router.post('/mark-conversion', markConversion);

// Analytics and history
router.get('/available', getAvailableLeadMagnets);
router.get('/analytics', getLeadMagnetAnalytics);
router.get('/interaction-analytics', getInteractionAnalytics);
router.get('/history/:leadId', getLeadMagnetHistory);

module.exports = router;
