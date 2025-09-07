const express = require('express');
const router = express.Router();
const { protect, authorizeCoach } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const {
    getCredentials,
    setupMetaAdsCredentials,
    setupOpenAICredentials,
    updatePreferences,
    verifyMetaCredentials,
    verifyOpenAICredentials,
    getMetaAccessToken,
    getOpenAIKey,
    deleteCredentials,
    getSetupStatus
} = require('../controllers/coachMarketingCredentialsController');

// All routes are protected and require coach authentication
router.use(protect, updateLastActive);

// ===== CREDENTIALS MANAGEMENT =====

// Get coach marketing credentials
router.get('/', authorizeCoach('coach'), getCredentials);

// Get setup status
router.get('/setup-status', authorizeCoach('coach'), getSetupStatus);

// ===== META ADS CREDENTIALS =====

// Set up Meta Ads credentials
router.post('/meta-ads', authorizeCoach('coach'), setupMetaAdsCredentials);

// Verify Meta Ads credentials
router.post('/verify-meta', authorizeCoach('coach'), verifyMetaCredentials);

// Get Meta Ads access token (for internal use)
router.get('/meta-token', authorizeCoach('coach'), getMetaAccessToken);

// ===== OPENAI CREDENTIALS =====

// Set up OpenAI credentials
router.post('/openai', authorizeCoach('coach'), setupOpenAICredentials);

// Verify OpenAI credentials
router.post('/verify-openai', authorizeCoach('coach'), verifyOpenAICredentials);

// Get OpenAI API key (for internal use)
router.get('/openai-key', authorizeCoach('coach'), getOpenAIKey);

// ===== PREFERENCES =====

// Update marketing preferences
router.put('/preferences', authorizeCoach('coach'), updatePreferences);

// ===== CREDENTIALS MANAGEMENT =====

// Delete all marketing credentials
router.delete('/', authorizeCoach('coach'), deleteCredentials);

module.exports = router;

