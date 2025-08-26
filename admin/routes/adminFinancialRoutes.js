const express = require('express');
const router = express.Router();
const adminFinancialController = require('../controllers/adminFinancialController');
const adminAuth = require('../../middleware/adminAuth');

// Apply admin authentication middleware to all routes
router.use(adminAuth);

// ===== SUBSCRIPTION PLANS =====
router.route('/plans')
    .get(adminFinancialController.getPlans)
    .post(adminFinancialController.createPlan);

router.route('/plans/:id')
    .put(adminFinancialController.updatePlan)
    .delete(adminFinancialController.deletePlan);

// ===== CREDIT PACKAGES =====
router.route('/credit-packages')
    .get(adminFinancialController.getCreditPackages)
    .post(adminFinancialController.createCreditPackage);

router.route('/credit-packages/:id')
    .put(adminFinancialController.updateCreditPackage);

// ===== COMMISSION RATES =====
router.route('/commission-rates')
    .get(adminFinancialController.getCommissionRates)
    .post(adminFinancialController.createCommissionRate);

router.route('/commission-rates/:id')
    .put(adminFinancialController.updateCommissionRate);

// ===== PAYMENT GATEWAYS =====
router.route('/payment-gateways')
    .get(adminFinancialController.getPaymentGateways)
    .post(adminFinancialController.createPaymentGateway);

router.route('/payment-gateways/:id')
    .put(adminFinancialController.updatePaymentGateway);

router.post('/payment-gateways/:id/test', adminFinancialController.testPaymentGateway);

module.exports = router;
