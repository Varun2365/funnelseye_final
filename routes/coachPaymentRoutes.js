const express = require('express');
const router = express.Router();
const {
    // Payment Collection Settings
    setupPaymentCollection,
    getPaymentSettings,
    
    // Coach Payments
    createPayment,
    getMyPayments,
    getCoachPayments,
    processPayment,
    
    // Analytics
    getPaymentAnalytics,
    getAdminPaymentAnalytics
} = require('../controllers/coachPaymentController');

const { protect, authorizeCoach, authorizeAdmin } = require('../middleware/auth');

// ===== PAYMENT COLLECTION SETTINGS =====

// Coach routes
router.post('/setup-payment-collection', protect, authorizeCoach('coach'), setupPaymentCollection);
router.get('/payment-settings', protect, authorizeCoach('coach'), getPaymentSettings);

// Admin routes for managing coach payment settings
router.get('/coach/:coachId/payment-settings', protect, authorizeAdmin, getPaymentSettings);
router.post('/setup-coach-payment-collection', protect, authorizeAdmin, setupPaymentCollection);

// ===== COACH PAYMENTS =====

// Coach routes
router.get('/my-payments', protect, authorizeCoach('coach'), getMyPayments);
router.get('/analytics', protect, authorizeCoach('coach'), getPaymentAnalytics);

// Admin routes for managing coach payments
router.post('/create-payment', protect, authorizeAdmin, createPayment);
router.get('/coach/:coachId/payments', protect, authorizeAdmin, getCoachPayments);
router.put('/:paymentId/process', protect, authorizeAdmin, processPayment);
router.get('/admin/analytics', protect, authorizeAdmin, getAdminPaymentAnalytics);

module.exports = router;
