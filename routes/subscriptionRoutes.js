// D:\PRJ_YCT_Final\routes\subscriptionRoutes.js

const express = require('express');
const router = express.Router();
const {
    // Subscription Plans
    createPlan,
    getPlans,
    updatePlan,
    deletePlan,
    
    // Coach Subscriptions
    subscribeCoach,
    renewSubscription,
    cancelSubscription,
    getMySubscription,
    getCoachSubscription,
    getAllSubscriptions,
    
    // Admin Utilities
    getSubscriptionAnalytics,
    sendReminders,
    disableExpiredSubscriptions
} = require('../controllers/subscriptionController');

const { protect, authorizeCoach, authorizeAdmin } = require('../middleware/auth');

// ===== SUBSCRIPTION PLANS =====

// Public routes
router.get('/plans', getPlans);

// Admin only routes
router.post('/plans', protect, authorizeAdmin, createPlan);
router.put('/plans/:id', protect, authorizeAdmin, updatePlan);
router.delete('/plans/:id', protect, authorizeAdmin, deletePlan);

// ===== COACH SUBSCRIPTIONS =====

// Coach routes
router.post('/subscribe', protect, authorizeCoach('coach'), subscribeCoach);
router.post('/renew', protect, authorizeCoach('coach'), renewSubscription);
router.post('/cancel', protect, authorizeCoach('coach'), cancelSubscription);
router.get('/my-subscription', protect, authorizeCoach('coach'), getMySubscription);

// Admin routes for managing coach subscriptions
router.post('/subscribe-coach', protect, authorizeAdmin, subscribeCoach);
router.post('/renew-coach', protect, authorizeAdmin, renewSubscription);
router.post('/cancel-coach', protect, authorizeAdmin, cancelSubscription);
router.get('/coach/:coachId', protect, authorizeAdmin, getCoachSubscription);
router.get('/all', protect, authorizeAdmin, getAllSubscriptions);

// ===== ADMIN UTILITIES =====

router.get('/analytics', protect, authorizeAdmin, getSubscriptionAnalytics);
router.post('/send-reminders', protect, authorizeAdmin, sendReminders);
router.post('/disable-expired', protect, authorizeAdmin, disableExpiredSubscriptions);

module.exports = router;
