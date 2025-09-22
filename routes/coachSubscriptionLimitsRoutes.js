const express = require('express');
const router = express.Router();
const coachSubscriptionLimitsController = require('../controllers/coachSubscriptionLimitsController');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route   GET /api/coach/subscription-limits
 * @desc    Get coach's subscription limits and current usage
 * @access  Private (Coach)
 */
router.get('/subscription-limits', coachSubscriptionLimitsController.getSubscriptionLimits);

/**
 * @route   POST /api/coach/check-limit
 * @desc    Check specific limit before performing an action
 * @access  Private (Coach)
 * @body    { "limitType": "funnels|staff|leads|emailCredits|smsCredits" }
 */
router.post('/check-limit', coachSubscriptionLimitsController.checkLimit);

/**
 * @route   POST /api/coach/check-feature
 * @desc    Check feature access
 * @access  Private (Coach)
 * @body    { "featureName": "aiFeatures|customDomain|apiAccess|..." }
 */
router.post('/check-feature', coachSubscriptionLimitsController.checkFeatureAccess);

module.exports = router;
