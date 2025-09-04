const express = require('express');
const router = express.Router();
const unifiedPaymentGatewayController = require('../controllers/unifiedPaymentGatewayController');
const payoutController = require('../controllers/payoutController');

// Middleware for authentication (to be implemented)
const authenticateUser = (req, res, next) => {
    // TODO: Implement proper authentication middleware
    next();
};

const authenticateAdmin = (req, res, next) => {
    // TODO: Implement admin authentication middleware
    next();
};

// ============================================================================
// UNIFIED PAYMENT GATEWAY ROUTES (FOR RECEIVING PAYMENTS)
// ============================================================================

/**
 * @route POST /api/payments
 * @desc Initialize payment session and return payment page data
 * @access Public (any frontend can call this)
 */
router.post('/', unifiedPaymentGatewayController.initializePayment);

/**
 * @route GET /api/payments/process/:transactionId
 * @desc Process payment on the unified payment page
 * @access Public
 */
router.get('/process/:transactionId', unifiedPaymentGatewayController.processPayment);

/**
 * @route POST /api/payments/confirm
 * @desc Handle payment confirmation from payment gateway
 * @access Public (called by payment gateway webhooks)
 */
router.post('/confirm', unifiedPaymentGatewayController.confirmPayment);

/**
 * @route GET /api/payments/status/:transactionId
 * @desc Get payment status
 * @access Public
 */
router.get('/status/:transactionId', unifiedPaymentGatewayController.getPaymentStatus);

// ============================================================================
// PAYOUT ROUTES (FOR SENDING PAYMENTS TO COACHES)
// ============================================================================

/**
 * @route POST /api/payments/payouts/process
 * @desc Process automatic payouts for coaches
 * @access Admin only
 */
router.post('/payouts/process', authenticateAdmin, payoutController.processAutomaticPayouts);

/**
 * @route GET /api/payments/payouts/history/:coachId
 * @desc Get payout history for a specific coach
 * @access Coach only (or admin)
 */
router.get('/payouts/history/:coachId', authenticateUser, payoutController.getPayoutHistory);

/**
 * @route GET /api/payments/payouts/analytics
 * @desc Get payout analytics
 * @access Admin only
 */
router.get('/payouts/analytics', authenticateAdmin, payoutController.getPayoutAnalytics);

// ============================================================================
// PAYMENT GATEWAY WEBHOOK ROUTES
// ============================================================================

/**
 * @route POST /api/payments/webhooks/stripe
 * @desc Stripe webhook for payment confirmation
 * @access Public (called by Stripe)
 */
router.post('/webhooks/stripe', (req, res) => {
    // TODO: Implement Stripe webhook signature verification
    unifiedPaymentGatewayController.confirmPayment(req, res);
});

/**
 * @route POST /api/payments/webhooks/razorpay
 * @desc Razorpay webhook for payment confirmation
 * @access Public (called by Razorpay)
 */
router.post('/webhooks/razorpay', (req, res) => {
    // TODO: Implement Razorpay webhook signature verification
    unifiedPaymentGatewayController.confirmPayment(req, res);
});

// ============================================================================
// UTILITY ROUTES
// ============================================================================

/**
 * @route GET /api/payments/gateways
 * @desc Get available payment gateways and their configurations
 * @access Public
 */
router.get('/gateways', (req, res) => {
    res.json({
        success: true,
        data: {
            availableGateways: ['stripe', 'razorpay'],
            defaultGateway: 'stripe',
            supportedCurrencies: ['USD', 'INR', 'EUR', 'GBP'],
            supportedPaymentMethods: {
                stripe: ['card', 'bank_transfer', 'upi', 'wallet'],
                razorpay: ['card', 'netbanking', 'upi', 'wallet']
            }
        }
    });
});

/**
 * @route GET /api/payments/supported-types
 * @desc Get supported payment types
 * @access Public
 */
router.get('/supported-types', (req, res) => {
    res.json({
        success: true,
        data: {
            paymentTypes: [
                {
                    type: 'coach_plan_purchase',
                    description: 'Client purchasing a coach plan',
                    requiresFields: ['amount', 'customerId', 'coachId', 'planId']
                },
                {
                    type: 'subscription_payment',
                    description: 'Recurring subscription payment',
                    requiresFields: ['amount', 'customerId', 'subscriptionId', 'billingCycle']
                },
                {
                    type: 'platform_subscription',
                    description: 'Coach subscribing to platform',
                    requiresFields: ['amount', 'customerId', 'coachId', 'planType']
                },
                {
                    type: 'consultation_booking',
                    description: 'Booking consultation with coach',
                    requiresFields: ['amount', 'customerId', 'coachId', 'consultationId']
                },
                {
                    type: 'course_purchase',
                    description: 'Purchasing online course',
                    requiresFields: ['amount', 'customerId', 'courseId']
                },
                {
                    type: 'membership_fee',
                    description: 'Membership or access fee',
                    requiresFields: ['amount', 'customerId', 'membershipType']
                },
                {
                    type: 'other',
                    description: 'Other payment types',
                    requiresFields: ['amount', 'customerId', 'description']
                }
            ]
        }
    });
});

/**
 * @route GET /api/payments/health
 * @desc Health check for payment system
 * @access Public
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Payment Gateway is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        status: 'operational'
    });
});

module.exports = router;
