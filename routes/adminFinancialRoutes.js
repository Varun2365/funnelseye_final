const express = require('express');
const router = express.Router();
const adminFinancialController = require('../controllers/adminFinancialController');
const { verifyAdminToken, checkAdminPermission, adminRateLimit, logAdminActivity } = require('../middleware/adminAuth');

// ===== FINANCIAL & BILLING CONTROL CENTER ROUTES =====

// @route   GET /api/admin/financial/credit-system
// @desc    Get credit system configuration
// @access  Private (Admin)
router.get('/credit-system', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    logAdminActivity, 
    adminFinancialController.getCreditSystem
);

// @route   PUT /api/admin/financial/credit-system
// @desc    Update credit system configuration
// @access  Private (Admin)
router.put('/credit-system', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit, 
    logAdminActivity, 
    adminFinancialController.updateCreditSystem
);

// @route   GET /api/admin/financial/credit-packages
// @desc    Get credit packages
// @access  Private (Admin)
router.get('/credit-packages', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    logAdminActivity, 
    adminFinancialController.getCreditPackages
);

// @route   GET /api/admin/financial/revenue-analytics
// @desc    Get revenue analytics
// @access  Private (Admin)
router.get('/revenue-analytics', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    logAdminActivity, 
    adminFinancialController.getRevenueAnalytics
);

// @route   GET /api/admin/financial/payment-failures
// @desc    Get payment failure analytics
// @access  Private (Admin)
router.get('/payment-failures', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    logAdminActivity, 
    adminFinancialController.getPaymentFailures
);

// @route   GET /api/admin/financial/gateway-markup
// @desc    Get gateway markup analytics
// @access  Private (Admin)
router.get('/gateway-markup', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    logAdminActivity, 
    adminFinancialController.getGatewayMarkup
);

// @route   GET /api/admin/financial/credit-usage
// @desc    Get credit usage analytics
// @access  Private (Admin)
router.get('/credit-usage', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    logAdminActivity, 
    adminFinancialController.getCreditUsage
);

// ===== PAYMENT SETTINGS & COMMISSION PAYOUTS =====

// @route   GET /api/admin/financial/payment-settings
// @desc    Get payment settings
// @access  Private (Admin)
router.get('/payment-settings', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'), 
    logAdminActivity, 
    adminFinancialController.getPaymentSettings
);

// @route   PUT /api/admin/financial/payment-settings
// @desc    Update payment settings
// @access  Private (Admin)
router.put('/payment-settings', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'), 
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity, 
    adminFinancialController.updatePaymentSettings
);

// @route   GET /api/admin/financial/commission-payouts
// @desc    Get commission payouts
// @access  Private (Admin)
router.get('/commission-payouts', 
    verifyAdminToken, 
    checkAdminPermission('financialReports'), 
    logAdminActivity, 
    adminFinancialController.getCommissionPayouts
);

// @route   POST /api/admin/financial/commission-payouts/:paymentId/process
// @desc    Process commission payout
// @access  Private (Admin)
router.post('/commission-payouts/:paymentId/process', 
    verifyAdminToken, 
    checkAdminPermission('paymentManagement'), 
    adminRateLimit(20, 5 * 60 * 1000), // 20 requests per 5 minutes
    logAdminActivity, 
    adminFinancialController.processCommissionPayout
);

// @route   GET /api/admin/financial/payment-gateways
// @desc    Get payment gateway configurations
// @access  Private (Admin)
router.get('/payment-gateways', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'), 
    logAdminActivity, 
    adminFinancialController.getPaymentGateways
);

// @route   PUT /api/admin/financial/payment-gateways/:gatewayName
// @desc    Update payment gateway configuration
// @access  Private (Admin)
router.put('/payment-gateways/:gatewayName', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'), 
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity, 
    adminFinancialController.updatePaymentGateway
);

// @route   POST /api/admin/financial/payment-gateways/:gatewayName/test
// @desc    Test payment gateway
// @access  Private (Admin)
router.post('/payment-gateways/:gatewayName/test', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'), 
    adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    logAdminActivity, 
    adminFinancialController.testPaymentGateway
);

// @route   GET /api/admin/financial/payment-analytics
// @desc    Get payment analytics (enhanced with funnelseye-payments)
// @access  Private (Admin)
router.get('/payment-analytics', 
    verifyAdminToken, 
    checkAdminPermission('financialReports'), 
    logAdminActivity, 
    adminFinancialController.getPaymentAnalytics
);

module.exports = router;
