const mongoose = require('mongoose');
const SubscriptionPlan = require('../schema/SubscriptionPlan');
const CoachSubscription = require('../schema/CoachSubscription');
const User = require('../schema/User');
const logger = require('../utils/logger');

class SubscriptionController {
    
    /**
     * Get all available subscription plans
     * GET /api/subscriptions/plans
     */
    async getPlans(req, res) {
        try {
            logger.info('[SubscriptionController] Getting subscription plans');
            
            const plans = await SubscriptionPlan.find({ isActive: true })
                .sort({ sortOrder: 1, price: 1 });
            
            res.json({
                success: true,
                data: plans
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error getting plans:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting subscription plans',
                error: error.message
            });
        }
    }
    
    /**
     * Get coach's current subscription
     * GET /api/subscriptions/current
     */
    async getCurrentSubscription(req, res) {
        try {
            const coachId = req.user._id;
            
            logger.info(`[SubscriptionController] Getting current subscription for coach: ${coachId}`);
            
            const subscription = await CoachSubscription.findOne({ 
                coachId, 
                status: { $in: ['active', 'trial'] }
            }).populate('planId');
            
            if (!subscription) {
                return res.json({
                    success: true,
                    data: null,
                    message: 'No active subscription found'
                });
            }
            
            res.json({
                success: true,
                data: subscription
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error getting current subscription:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting current subscription',
                error: error.message
            });
        }
    }
    
    /**
     * Create subscription order
     * POST /api/subscriptions/create-order
     */
    async createOrder(req, res) {
        try {
            const { planId, paymentMethod = 'razorpay' } = req.body;
            const coachId = req.user._id;
            
            logger.info(`[SubscriptionController] Creating subscription order for plan: ${planId}`);
            
            // Validate plan exists and is active
            const plan = await SubscriptionPlan.findOne({ 
                _id: planId, 
                isActive: true 
            });
            
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription plan not found or not available'
                });
            }
            
            // Check if coach already has a subscription (any status)
            const existingSubscription = await CoachSubscription.findOne({
                coachId
            });
            
            if (existingSubscription && existingSubscription.status === 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'You already have an active subscription. Please cancel it before subscribing to a new plan.'
                });
            }
            
            // Calculate dates
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + plan.duration);
            
            let subscription;
            
            if (existingSubscription) {
                // Update existing subscription
                subscription = existingSubscription;
                subscription.planId = plan._id;
                subscription.status = 'active';
                subscription.startDate = startDate;
                subscription.endDate = endDate;
                subscription.nextBillingDate = endDate;
                subscription.autoRenew = true;
                subscription.cancellationDate = null;
                subscription.cancellationReason = null;
                
                await subscription.save();
            } else {
                // Create new subscription record
                subscription = new CoachSubscription({
                    coachId,
                    planId: plan._id,
                    status: 'active',
                    startDate,
                    endDate,
                    nextBillingDate: endDate,
                    autoRenew: true
                });
                
                await subscription.save();
            }
            
            // Create payment order for all subscriptions
            const paymentOrder = await this.createPaymentOrder(plan, subscription);
            
            res.json({
                success: true,
                message: 'Subscription order created successfully',
                data: {
                    subscription: subscription,
                    plan: plan,
                    paymentOrder: paymentOrder
                }
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error creating subscription order:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating subscription order',
                error: error.message
            });
        }
    }
    
    /**
     * Create Razorpay payment order for subscription
     */
    async createPaymentOrder(plan, subscription) {
        try {
            const Razorpay = require('razorpay');
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET
            });
            
            // Create a short receipt (max 40 characters for Razorpay)
            const receipt = `sub_${Date.now()}`.substring(0, 40);
            
            const orderOptions = {
                amount: (plan.price + plan.setupFee) * 100, // Convert to paise
                currency: plan.currency,
                receipt: receipt,
                notes: {
                    subscription_id: subscription._id.toString(),
                    plan_id: plan._id.toString(),
                    coach_id: subscription.coachId.toString(),
                    billing_cycle: plan.billingCycle
                }
            };
            
            const razorpayOrder = await razorpay.orders.create(orderOptions);
            
            return {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                receipt: razorpayOrder.receipt
            };
            
        } catch (error) {
            logger.error('[SubscriptionController] Error creating payment order:', error);
            throw error;
        }
    }
    
    /**
     * Verify subscription payment
     * POST /api/subscriptions/verify-payment
     */
    async verifyPayment(req, res) {
        try {
            const { 
                razorpay_order_id, 
                razorpay_payment_id, 
                razorpay_signature,
                subscription_id 
            } = req.body;
            
            logger.info(`[SubscriptionController] Verifying payment for subscription: ${subscription_id}`);
            
            // Verify Razorpay signature
            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
            hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
            const generatedSignature = hmac.digest('hex');
            
            if (generatedSignature !== razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment signature'
                });
            }
            
            // Update subscription
            const subscription = await CoachSubscription.findById(subscription_id);
            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription not found'
                });
            }
            
            // Add payment to history
            subscription.paymentHistory.push({
                paymentId: razorpay_payment_id,
                amount: subscription.planId.price,
                currency: subscription.planId.currency,
                paymentMethod: 'razorpay',
                paymentDate: new Date(),
                status: 'success',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            });
            
            // Activate subscription
            subscription.status = 'active';
            subscription.startDate = new Date();
            subscription.endDate = new Date();
            subscription.endDate.setMonth(subscription.endDate.getMonth() + subscription.planId.duration);
            subscription.nextBillingDate = subscription.endDate;
            
            await subscription.save();
            
            // Populate plan details for response
            await subscription.populate('planId', 'name price currency billingCycle');
            
            res.json({
                success: true,
                message: 'Payment verified and subscription activated successfully',
                data: {
                    subscription,
                    planName: subscription.planId.name
                }
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error verifying payment:', error);
            res.status(500).json({
                success: false,
                message: 'Error verifying payment',
                error: error.message
            });
        }
    }
    
    /**
     * Cancel subscription
     * POST /api/subscriptions/cancel
     */
    async cancelSubscription(req, res) {
        try {
            const { reason } = req.body;
            const coachId = req.user._id;
            
            logger.info(`[SubscriptionController] Cancelling subscription for coach: ${coachId}`);
            
            const subscription = await CoachSubscription.findOne({
                coachId,
                status: { $in: ['active', 'trial'] }
            });
            
            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    message: 'No active subscription found'
                });
            }
            
            subscription.status = 'cancelled';
            subscription.cancellationDate = new Date();
            subscription.cancellationReason = reason;
            subscription.autoRenew = false;
            
            await subscription.save();
            
            res.json({
                success: true,
                message: 'Subscription cancelled successfully',
                data: subscription
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error cancelling subscription:', error);
            res.status(500).json({
                success: false,
                message: 'Error cancelling subscription',
                error: error.message
            });
        }
    }
    
    /**
     * Get subscription history
     * GET /api/subscriptions/history
     */
    async getSubscriptionHistory(req, res) {
        try {
            const coachId = req.user._id;
            const { page = 1, limit = 10 } = req.query;
            
            logger.info(`[SubscriptionController] Getting subscription history for coach: ${coachId}`);
            
            const skip = (page - 1) * limit;
            const subscriptions = await CoachSubscription.find({ coachId })
                .populate('planId', 'name price currency billingCycle')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
            
            const total = await CoachSubscription.countDocuments({ coachId });
            
            res.json({
                success: true,
                data: subscriptions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalSubscriptions: total,
                    hasNextPage: skip + subscriptions.length < total,
                    hasPrevPage: page > 1
                }
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error getting subscription history:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting subscription history',
                error: error.message
            });
        }
    }
}

// Create controller instance and bind all methods
const controller = new SubscriptionController();

module.exports = {
    getPlans: controller.getPlans.bind(controller),
    getCurrentSubscription: controller.getCurrentSubscription.bind(controller),
    createOrder: controller.createOrder.bind(controller),
    verifyPayment: controller.verifyPayment.bind(controller),
    cancelSubscription: controller.cancelSubscription.bind(controller),
    getSubscriptionHistory: controller.getSubscriptionHistory.bind(controller)
};