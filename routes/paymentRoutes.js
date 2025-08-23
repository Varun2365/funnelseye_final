// D:\PRJ_YCT_Final\routes\paymentRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const asyncHandler = require('../middleware/async');

// Protect all payment routes
router.use(protect);

// ===== PAYMENT PROCESSING =====

/**
 * @route   POST /api/payments/process
 * @desc    Process payment with multiple gateways
 * @access  Private (Coach/Lead)
 */
router.post('/process', asyncHandler(async (req, res, next) => {
    const { amount, currency, paymentMethod, leadId, coachId } = req.body;
    
    const payment = await paymentService.processPayment({
        amount,
        currency,
        paymentMethod,
        leadId,
        coachId
    });
    
    res.status(201).json({
        success: true,
        data: payment
    });
}));

/**
 * @route   POST /api/payments/stripe
 * @desc    Process Stripe payment
 * @access  Private (Coach/Lead)
 */
router.post('/stripe', asyncHandler(async (req, res, next) => {
    const { amount, currency, token, leadId, coachId } = req.body;
    
    const payment = await paymentService.processStripePayment({
        amount,
        currency,
        token,
        leadId,
        coachId
    });
    
    res.status(201).json({
        success: true,
        data: payment
    });
}));

/**
 * @route   POST /api/payments/paypal
 * @desc    Process PayPal payment
 * @access  Private (Coach/Lead)
 */
router.post('/paypal', asyncHandler(async (req, res, next) => {
    const { amount, currency, paypalOrderId, leadId, coachId } = req.body;
    
    const payment = await paymentService.processPayPalPayment({
        amount,
        currency,
        paypalOrderId,
        leadId,
        coachId
    });
    
    res.status(201).json({
        success: true,
        data: payment
    });
}));

/**
 * @route   POST /api/payments/razorpay
 * @desc    Process Razorpay payment
 * @access  Private (Coach/Lead)
 */
router.post('/razorpay', asyncHandler(async (req, res, next) => {
    const { amount, currency, razorpayPaymentId, leadId, coachId } = req.body;
    
    const payment = await paymentService.processRazorpayPayment({
        amount,
        currency,
        razorpayPaymentId,
        leadId,
        coachId
    });
    
    res.status(201).json({
        success: true,
        data: payment
    });
}));

/**
 * @route   GET /api/payments/revenue-analytics
 * @desc    Get revenue analytics
 * @access  Private (Coach)
 */
router.get('/revenue-analytics', asyncHandler(async (req, res, next) => {
    const { coachId, timeRange = 30 } = req.query;
    
    const analytics = await paymentService.getRevenueAnalytics(coachId, timeRange);
    
    res.json({
        success: true,
        data: analytics
    });
}));

/**
 * @route   GET /api/payments/subscription-analytics
 * @desc    Get subscription analytics
 * @access  Private (Coach)
 */
router.get('/subscription-analytics', asyncHandler(async (req, res, next) => {
    const { coachId } = req.query;
    
    const analytics = await paymentService.getSubscriptionAnalytics(coachId);
    
    res.json({
        success: true,
        data: analytics
    });
}));

/**
 * @route   POST /api/payments/:paymentId/invoice
 * @desc    Generate invoice for payment
 * @access  Private (Coach)
 */
router.post('/:paymentId/invoice', asyncHandler(async (req, res, next) => {
    const { paymentId } = req.params;
    
    const invoice = await paymentService.generateInvoice(paymentId);
    
    res.json({
        success: true,
        data: invoice
    });
}));

/**
 * @route   GET /api/payments/subscription-plans
 * @desc    Get available subscription plans
 * @access  Private (Coach)
 */
router.get('/subscription-plans', asyncHandler(async (req, res, next) => {
    const plans = paymentService.getSubscriptionPlans();
    
    res.json({
        success: true,
        data: plans
    });
}));

/**
 * @route   GET /api/payments/payment-methods
 * @desc    Get supported payment methods
 * @access  Private (Coach)
 */
router.get('/payment-methods', asyncHandler(async (req, res, next) => {
    const methods = paymentService.getPaymentMethods();
    
    res.json({
        success: true,
        data: methods
    });
}));

/**
 * @route   POST /api/payments/receive
 * @desc    Receive a new payment and trigger automations (Webhook)
 * @access  Public (Webhook)
 */
router.post('/receive', asyncHandler(async (req, res, next) => {
    const { paymentId, leadId, amount, currency, status, paymentMethod, gatewayResponse } = req.body;
    
    // This endpoint is typically called by payment gateways
    // For now, just return success
    res.json({
        success: true,
        message: 'Payment received successfully'
    });
}));

module.exports = router;