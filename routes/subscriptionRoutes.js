// D:\PRJ_YCT_Final\routes\subscriptionRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const asyncHandler = require('../middleware/async');

// Protect all subscription routes
router.use(protect);

// ===== SUBSCRIPTION MANAGEMENT =====

/**
 * @route   POST /api/subscriptions
 * @desc    Create a new subscription
 * @access  Private (Coach)
 */
router.post('/', asyncHandler(async (req, res, next) => {
    const { coachId, planId, paymentMethod, autoRenew = true } = req.body;
    
    const subscription = await paymentService.createSubscription({
        coachId,
        planId,
        paymentMethod,
        autoRenew
    });
    
    res.status(201).json({
        success: true,
        data: subscription
    });
}));

/**
 * @route   GET /api/subscriptions/:subscriptionId
 * @desc    Get subscription details
 * @access  Private (Coach)
 */
router.get('/:subscriptionId', asyncHandler(async (req, res, next) => {
    const { subscriptionId } = req.params;
    
    // This would typically fetch from a subscription service
    // For now, return mock data
    const subscription = {
        id: subscriptionId,
        status: 'active',
        planId: 'professional',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    res.json({
        success: true,
        data: subscription
    });
}));

/**
 * @route   PUT /api/subscriptions/:subscriptionId/renew
 * @desc    Renew subscription
 * @access  Private (Coach)
 */
router.put('/:subscriptionId/renew', asyncHandler(async (req, res, next) => {
    const { subscriptionId } = req.params;
    
    const renewedSubscription = await paymentService.renewSubscription(subscriptionId);
    
    res.json({
        success: true,
        data: renewedSubscription
    });
}));

/**
 * @route   PUT /api/subscriptions/:subscriptionId/cancel
 * @desc    Cancel subscription
 * @access  Private (Coach)
 */
router.put('/:subscriptionId/cancel', asyncHandler(async (req, res, next) => {
    const { subscriptionId } = req.params;
    const { reason } = req.body;
    
    const cancelledSubscription = await paymentService.cancelSubscription(subscriptionId, reason);
    
    res.json({
        success: true,
        data: cancelledSubscription
    });
}));

/**
 * @route   GET /api/subscriptions/coach/:coachId
 * @desc    Get all subscriptions for a coach
 * @access  Private (Coach)
 */
router.get('/coach/:coachId', asyncHandler(async (req, res, next) => {
    const { coachId } = req.params;
    
    // This would typically fetch from a subscription service
    // For now, return mock data
    const subscriptions = [
        {
            id: 'sub_1',
            planId: 'professional',
            status: 'active',
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    res.json({
        success: true,
        data: subscriptions
    });
}));

module.exports = router;
