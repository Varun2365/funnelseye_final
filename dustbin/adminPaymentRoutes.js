const express = require('express');
const router = express.Router();
const adminPaymentController = require('../controllers/adminPaymentController');
const { verifyAdminToken, checkAdminPermission, adminRateLimit, logAdminActivity } = require('../middleware/adminAuth');

// ===== ADMIN PAYMENT ROUTES =====

// @route   GET /api/admin/payment/settings
// @desc    Get payment settings
// @access  Private (Admin)
router.get('/settings', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'),
    logAdminActivity('VIEW_PAYMENT_SETTINGS'),
    adminPaymentController.getPaymentSettings
);

// @route   PUT /api/admin/payment/settings
// @desc    Update payment settings
// @access  Private (Admin)
router.put('/settings', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'),
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('UPDATE_PAYMENT_SETTINGS'),
    adminPaymentController.updatePaymentSettings
);

// @route   PUT /api/admin/payment/platform-fees
// @desc    Update platform fees
// @access  Private (Admin)
router.put('/platform-fees', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'),
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('UPDATE_PLATFORM_FEES'),
    adminPaymentController.updatePlatformFees
);

// @route   PUT /api/admin/payment/mlm-commissions
// @desc    Update MLM commission structure
// @access  Private (Admin)
router.put('/mlm-commissions', 
    verifyAdminToken, 
    checkAdminPermission('mlmSettings'),
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('UPDATE_MLM_COMMISSIONS'),
    adminPaymentController.updateMlmCommissions
);

// @route   PUT /api/admin/payment/payout-settings
// @desc    Update payout settings
// @access  Private (Admin)
router.put('/payout-settings', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'),
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('UPDATE_PAYOUT_SETTINGS'),
    adminPaymentController.updatePayoutSettings
);

// @route   PUT /api/admin/payment/gateway-settings
// @desc    Update payment gateway settings
// @access  Private (Admin)
router.put('/gateway-settings', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'),
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('UPDATE_GATEWAY_SETTINGS'),
    adminPaymentController.updateGatewaySettings
);

// @route   GET /api/admin/payment/analytics
// @desc    Get payment analytics
// @access  Private (Admin)
router.get('/analytics', 
    verifyAdminToken, 
    checkAdminPermission('financialReports'),
    logAdminActivity('VIEW_PAYMENT_ANALYTICS'),
    adminPaymentController.getPaymentAnalytics
);

// @route   GET /api/admin/payment/transactions
// @desc    Get payment transactions
// @access  Private (Admin)
router.get('/transactions', 
    verifyAdminToken, 
    checkAdminPermission('financialReports'),
    logAdminActivity('VIEW_PAYMENT_TRANSACTIONS'),
    adminPaymentController.getPaymentTransactions
);

// @route   GET /api/admin/payment/commissions
// @desc    Get commission distributions
// @access  Private (Admin)
router.get('/commissions', 
    verifyAdminToken, 
    checkAdminPermission('financialReports'),
    logAdminActivity('VIEW_COMMISSION_DISTRIBUTIONS'),
    adminPaymentController.getCommissionDistributions
);

// @route   POST /api/admin/payment/test-gateway
// @desc    Test payment gateway
// @access  Private (Admin)
router.post('/test-gateway', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'),
    adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    logAdminActivity('TEST_PAYMENT_GATEWAY'),
    adminPaymentController.testPaymentGateway
);

module.exports = router;
