const express = require('express');
const router = express.Router();
const {
    processPlanPurchase,
    confirmPayment,
    calculateAndDistributeCommissions,
    processCommissionPayouts,
    processRefund,
    getPaymentAnalytics,
    getTransactionDetails,
    getCommissionDistributionDetails
} = require('../controllers/centralPaymentHandlerController');

// ===== CENTRAL PAYMENT HANDLER ROUTES =====

// @route   POST /api/central-payment/process-plan-purchase
// @desc    Process payment for coach plan purchase
// @access  Public (for customers)
router.post('/process-plan-purchase', processPlanPurchase);

// @route   POST /api/central-payment/confirm-payment
// @desc    Confirm payment success (webhook from payment gateway)
// @access  Private (webhook)
router.post('/confirm-payment', confirmPayment);

// @route   POST /api/central-payment/calculate-commissions
// @desc    Calculate and distribute MLM commissions
// @access  Private
router.post('/calculate-commissions', calculateAndDistributeCommissions);

// @route   POST /api/central-payment/process-payouts
// @desc    Process commission payouts
// @access  Private (Admin)
router.post('/process-payouts', processCommissionPayouts);

// @route   POST /api/central-payment/process-refund
// @desc    Process refund
// @access  Private (Admin)
router.post('/process-refund', processRefund);

// @route   GET /api/central-payment/analytics
// @desc    Get payment analytics
// @access  Private (Admin)
router.get('/analytics', getPaymentAnalytics);

// @route   GET /api/central-payment/transaction/:transactionId
// @desc    Get transaction details
// @access  Private
router.get('/transaction/:transactionId', getTransactionDetails);

// @route   GET /api/central-payment/commission-distribution/:distributionId
// @desc    Get commission distribution details
// @access  Private
router.get('/commission-distribution/:distributionId', getCommissionDistributionDetails);

module.exports = router;
