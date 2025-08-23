const { Payment, Lead, Coach, Subscription, Cart } = require('../schema');
const { publishEvent } = require('./rabbitmqProducer');

/**
 * Comprehensive Payment & E-commerce Service
 */
class PaymentService {
    constructor() {
        this.paymentMethods = ['stripe', 'paypal', 'razorpay', 'bank_transfer'];
        this.subscriptionPlans = [
            {
                id: 'basic',
                name: 'Basic Plan',
                price: 29.99,
                currency: 'USD',
                interval: 'month',
                features: ['Basic coaching', 'Email support', 'Mobile app access'],
                maxLeads: 50,
                maxStaff: 2
            },
            {
                id: 'professional',
                name: 'Professional Plan',
                price: 79.99,
                currency: 'USD',
                interval: 'month',
                features: ['Advanced coaching', 'Priority support', 'Analytics dashboard', 'WhatsApp automation'],
                maxLeads: 200,
                maxStaff: 5
            },
            {
                id: 'enterprise',
                name: 'Enterprise Plan',
                price: 199.99,
                currency: 'USD',
                interval: 'month',
                features: ['Full platform access', '24/7 support', 'Custom integrations', 'White-label options'],
                maxLeads: 'Unlimited',
                maxStaff: 'Unlimited'
            }
        ];
    }

    // ===== PAYMENT PROCESSING =====

    /**
     * Process a payment
     */
    async processPayment(paymentData) {
        try {
            const {
                coachId,
                leadId,
                amount,
                currency = 'USD',
                paymentMethod,
                description,
                metadata = {}
            } = paymentData;

            // Validate payment data
            if (!coachId || !amount || !paymentMethod) {
                throw new Error('Missing required payment data');
            }

            // Create payment record
            const payment = new Payment({
                coachId,
                leadId,
                amount,
                currency,
                paymentMethod,
                description,
                metadata,
                status: 'pending'
            });

            await payment.save();

            // Process payment based on method
            let paymentResult;
            switch (paymentMethod) {
                case 'stripe':
                    paymentResult = await this.processStripePayment(payment);
                    break;
                case 'paypal':
                    paymentResult = await this.processPayPalPayment(payment);
                    break;
                case 'razorpay':
                    paymentResult = await this.processRazorpayPayment(payment);
                    break;
                default:
                    throw new Error(`Unsupported payment method: ${paymentMethod}`);
            }

            // Update payment status
            payment.status = paymentResult.success ? 'completed' : 'failed';
            payment.transactionId = paymentResult.transactionId;
            payment.processedAt = new Date();
            await payment.save();

            // Trigger payment events
            if (paymentResult.success) {
                await this.triggerPaymentSuccessEvents(payment);
            } else {
                await this.triggerPaymentFailureEvents(payment, paymentResult.error);
            }

            return paymentResult;

        } catch (error) {
            console.error('Error processing payment:', error);
            throw error;
        }
    }

    /**
     * Process Stripe payment
     */
    async processStripePayment(payment) {
        try {
            // This would integrate with actual Stripe API
            // For now, simulate successful payment
            const success = Math.random() > 0.1; // 90% success rate
            
            return {
                success,
                transactionId: success ? `stripe_${Date.now()}` : null,
                error: success ? null : 'Payment failed'
            };
        } catch (error) {
            console.error('Stripe payment error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Process PayPal payment
     */
    async processPayPalPayment(payment) {
        try {
            // This would integrate with actual PayPal API
            const success = Math.random() > 0.1;
            
            return {
                success,
                transactionId: success ? `paypal_${Date.now()}` : null,
                error: success ? null : 'Payment failed'
            };
        } catch (error) {
            console.error('PayPal payment error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Process Razorpay payment
     */
    async processRazorpayPayment(payment) {
        try {
            // This would integrate with actual Razorpay API
            const success = Math.random() > 0.1;
            
            return {
                success,
                transactionId: success ? `razorpay_${Date.now()}` : null,
                error: success ? null : 'Payment failed'
            };
        } catch (error) {
            console.error('Razorpay payment error:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== SUBSCRIPTION MANAGEMENT =====

    /**
     * Create a subscription
     */
    async createSubscription(subscriptionData) {
        try {
            const {
                coachId,
                planId,
                paymentMethod,
                startDate = new Date(),
                autoRenew = true
            } = subscriptionData;

            // Validate plan
            const plan = this.subscriptionPlans.find(p => p.id === planId);
            if (!plan) {
                throw new Error('Invalid subscription plan');
            }

            // Check if coach already has an active subscription
            const existingSubscription = await Subscription.findOne({
                coachId,
                status: 'active'
            });

            if (existingSubscription) {
                throw new Error('Coach already has an active subscription');
            }

            // Create subscription
            const subscription = new Subscription({
                coachId,
                planId,
                planDetails: plan,
                paymentMethod,
                startDate,
                nextBillingDate: this.calculateNextBillingDate(startDate, plan.interval),
                autoRenew,
                status: 'active'
            });

            await subscription.save();

            // Trigger subscription created event
            await publishEvent('funnelseye_events', 'subscription_created', {
                eventName: 'subscription_created',
                payload: { subscriptionId: subscription._id, coachId },
                relatedDoc: { subscriptionId: subscription._id, coachId },
                timestamp: new Date().toISOString()
            });

            return subscription;

        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    }

    /**
     * Calculate next billing date
     */
    calculateNextBillingDate(startDate, interval) {
        const date = new Date(startDate);
        switch (interval) {
            case 'month':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'year':
                date.setFullYear(date.getFullYear() + 1);
                break;
            case 'week':
                date.setDate(date.getDate() + 7);
                break;
            default:
                date.setMonth(date.getMonth() + 1);
        }
        return date;
    }

    /**
     * Renew subscription
     */
    async renewSubscription(subscriptionId) {
        try {
            const subscription = await Subscription.findById(subscriptionId);
            if (!subscription) {
                throw new Error('Subscription not found');
            }

            // Process renewal payment
            const renewalPayment = await this.processPayment({
                coachId: subscription.coachId,
                amount: subscription.planDetails.price,
                currency: subscription.planDetails.currency,
                paymentMethod: subscription.paymentMethod,
                description: `Renewal for ${subscription.planDetails.name}`,
                metadata: { subscriptionId: subscription._id, type: 'renewal' }
            });

            if (renewalPayment.success) {
                // Update subscription
                subscription.currentPeriodStart = subscription.nextBillingDate;
                subscription.nextBillingDate = this.calculateNextBillingDate(
                    subscription.nextBillingDate,
                    subscription.planDetails.interval
                );
                subscription.lastRenewalDate = new Date();
                await subscription.save();

                // Trigger renewal event
                await publishEvent('funnelseye_events', 'subscription_renewed', {
                    eventName: 'subscription_renewed',
                    payload: { subscriptionId: subscription._id, coachId: subscription.coachId },
                    relatedDoc: { subscriptionId: subscription._id, coachId: subscription.coachId },
                    timestamp: new Date().toISOString()
                });

                return subscription;
            } else {
                throw new Error('Renewal payment failed');
            }

        } catch (error) {
            console.error('Error renewing subscription:', error);
            throw error;
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId, reason = 'User requested cancellation') {
        try {
            const subscription = await Subscription.findById(subscriptionId);
            if (!subscription) {
                throw new Error('Subscription not found');
            }

            subscription.status = 'cancelled';
            subscription.cancelledAt = new Date();
            subscription.cancellationReason = reason;
            await subscription.save();

            // Trigger cancellation event
            await publishEvent('funnelseye_events', 'subscription_cancelled', {
                eventName: 'subscription_cancelled',
                payload: { subscriptionId: subscription._id, coachId: subscription.coachId },
                relatedDoc: { subscriptionId: subscription._id, coachId: subscription.coachId },
                timestamp: new Date().toISOString()
            });

            return subscription;

        } catch (error) {
            console.error('Error cancelling subscription:', error);
            throw error;
        }
    }

    // ===== CART RECOVERY =====

    /**
     * Create or update cart
     */
    async updateCart(cartData) {
        try {
            const {
                coachId,
                leadId,
                items,
                total,
                currency = 'USD'
            } = cartData;

            let cart = await Cart.findOne({ coachId, leadId });
            
            if (cart) {
                // Update existing cart
                cart.items = items;
                cart.total = total;
                cart.updatedAt = new Date();
            } else {
                // Create new cart
                cart = new Cart({
                    coachId,
                    leadId,
                    items,
                    total,
                    currency,
                    status: 'active'
                });
            }

            await cart.save();

            // Schedule cart recovery if not completed within 24 hours
            setTimeout(async () => {
                await this.checkCartRecovery(cart._id);
            }, 24 * 60 * 60 * 1000);

            return cart;

        } catch (error) {
            console.error('Error updating cart:', error);
            throw error;
        }
    }

    /**
     * Check cart recovery
     */
    async checkCartRecovery(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart || cart.status !== 'active') {
                return;
            }

            // Check if cart is older than 24 hours
            const hoursSinceUpdate = (new Date() - cart.updatedAt) / (1000 * 60 * 60);
            if (hoursSinceUpdate < 24) {
                return;
            }

            // Send cart recovery email/SMS
            await this.sendCartRecoveryNotification(cart);

            // Update cart status
            cart.status = 'recovery_sent';
            await cart.save();

        } catch (error) {
            console.error('Error checking cart recovery:', error);
        }
    }

    /**
     * Send cart recovery notification
     */
    async sendCartRecoveryNotification(cart) {
        try {
            // This would integrate with your notification system
            console.log(`Sending cart recovery notification for cart: ${cart._id}`);
            
            // Trigger cart recovery event
            await publishEvent('funnelseye_events', 'cart_recovery_sent', {
                eventName: 'cart_recovery_sent',
                payload: { cartId: cart._id, coachId: cart.coachId, leadId: cart.leadId },
                relatedDoc: { cartId: cart._id, coachId: cart.coachId, leadId: cart.leadId },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error sending cart recovery notification:', error);
        }
    }

    /**
     * Complete cart purchase
     */
    async completeCartPurchase(cartId, paymentData) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Cart not found');
            }

            // Process payment
            const paymentResult = await this.processPayment({
                ...paymentData,
                leadId: cart.leadId,
                amount: cart.total,
                currency: cart.currency,
                metadata: { cartId: cart._id, type: 'cart_purchase' }
            });

            if (paymentResult.success) {
                // Update cart status
                cart.status = 'completed';
                cart.completedAt = new Date();
                cart.paymentId = paymentResult.transactionId;
                await cart.save();

                // Trigger cart completed event
                await publishEvent('funnelseye_events', 'cart_completed', {
                    eventName: 'cart_completed',
                    payload: { cartId: cart._id, coachId: cart.coachId, leadId: cart.leadId },
                    relatedDoc: { cartId: cart._id, coachId: cart.coachId, leadId: cart.leadId },
                    timestamp: new Date().toISOString()
                });

                return { success: true, cart, payment: paymentResult };
            } else {
                throw new Error('Payment failed');
            }

        } catch (error) {
            console.error('Error completing cart purchase:', error);
            throw error;
        }
    }

    // ===== REVENUE ANALYTICS =====

    /**
     * Get revenue analytics for a coach
     */
    async getRevenueAnalytics(coachId, timeRange = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - timeRange);

            // Get payments in time range
            const payments = await Payment.find({
                coachId,
                status: 'completed',
                createdAt: { $gte: startDate }
            });

            // Get subscriptions
            const subscriptions = await Subscription.find({
                coachId,
                status: 'active'
            });

            // Calculate metrics
            const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
            const recurringRevenue = subscriptions.reduce((sum, sub) => sum + sub.planDetails.price, 0);
            const oneTimeRevenue = totalRevenue - recurringRevenue;
            const averageOrderValue = payments.length > 0 ? totalRevenue / payments.length : 0;

            // Revenue by payment method
            const revenueByMethod = {};
            payments.forEach(payment => {
                revenueByMethod[payment.paymentMethod] = (revenueByMethod[payment.paymentMethod] || 0) + payment.amount;
            });

            // Revenue trends (daily)
            const dailyRevenue = {};
            payments.forEach(payment => {
                const date = payment.createdAt.toISOString().split('T')[0];
                dailyRevenue[date] = (dailyRevenue[date] || 0) + payment.amount;
            });

            // Subscription metrics
            const subscriptionMetrics = {
                totalActive: subscriptions.length,
                totalMonthlyValue: subscriptions.reduce((sum, sub) => {
                    return sum + (sub.planDetails.interval === 'month' ? sub.planDetails.price : sub.planDetails.price / 12);
                }, 0),
                totalYearlyValue: subscriptions.reduce((sum, sub) => {
                    return sum + (sub.planDetails.interval === 'year' ? sub.planDetails.price : sub.planDetails.price * 12);
                }, 0)
            };

            return {
                overview: {
                    totalRevenue,
                    recurringRevenue,
                    oneTimeRevenue,
                    averageOrderValue,
                    totalTransactions: payments.length
                },
                revenueByMethod,
                dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({ date, revenue })),
                subscriptions: subscriptionMetrics,
                timeRange
            };

        } catch (error) {
            console.error('Error getting revenue analytics:', error);
            throw error;
        }
    }

    /**
     * Get subscription analytics
     */
    async getSubscriptionAnalytics(coachId) {
        try {
            const subscriptions = await Subscription.find({ coachId });

            const analytics = {
                total: subscriptions.length,
                active: subscriptions.filter(sub => sub.status === 'active').length,
                cancelled: subscriptions.filter(sub => sub.status === 'cancelled').length,
                expired: subscriptions.filter(sub => sub.status === 'expired').length,
                byPlan: {},
                churnRate: 0,
                averageLifetime: 0
            };

            // Group by plan
            subscriptions.forEach(sub => {
                const planId = sub.planId;
                analytics.byPlan[planId] = analytics.byPlan[planId] || {
                    total: 0,
                    active: 0,
                    revenue: 0
                };
                analytics.byPlan[planId].total++;
                if (sub.status === 'active') {
                    analytics.byPlan[planId].active++;
                    analytics.byPlan[planId].revenue += sub.planDetails.price;
                }
            });

            // Calculate churn rate
            if (analytics.total > 0) {
                analytics.churnRate = (analytics.cancelled / analytics.total) * 100;
            }

            // Calculate average lifetime
            const activeSubs = subscriptions.filter(sub => sub.status === 'active');
            if (activeSubs.length > 0) {
                const totalLifetime = activeSubs.reduce((sum, sub) => {
                    return sum + ((new Date() - sub.startDate) / (1000 * 60 * 60 * 24)); // Days
                }, 0);
                analytics.averageLifetime = totalLifetime / activeSubs.length;
            }

            return analytics;

        } catch (error) {
            console.error('Error getting subscription analytics:', error);
            throw error;
        }
    }

    // ===== INVOICE GENERATION =====

    /**
     * Generate invoice for payment
     */
    async generateInvoice(paymentId) {
        try {
            const payment = await Payment.findById(paymentId).populate('coachId leadId');
            if (!payment) {
                throw new Error('Payment not found');
            }

            const invoice = {
                invoiceNumber: `INV-${Date.now()}`,
                date: payment.createdAt,
                dueDate: new Date(payment.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
                coach: {
                    name: payment.coachId.name,
                    email: payment.coachId.email,
                    address: payment.coachId.address || 'N/A'
                },
                customer: payment.leadId ? {
                    name: payment.leadId.name,
                    email: payment.leadId.email
                } : null,
                items: [{
                    description: payment.description || 'Service Payment',
                    quantity: 1,
                    unitPrice: payment.amount,
                    total: payment.amount
                }],
                subtotal: payment.amount,
                tax: 0, // Add tax calculation if needed
                total: payment.amount,
                currency: payment.currency,
                paymentMethod: payment.paymentMethod,
                status: payment.status
            };

            return invoice;

        } catch (error) {
            console.error('Error generating invoice:', error);
            throw error;
        }
    }

    // ===== EVENT TRIGGERS =====

    /**
     * Trigger payment success events
     */
    async triggerPaymentSuccessEvents(payment) {
        try {
            await publishEvent('funnelseye_events', 'payment_successful', {
                eventName: 'payment_successful',
                payload: { paymentId: payment._id, coachId: payment.coachId, leadId: payment.leadId },
                relatedDoc: { paymentId: payment._id, coachId: payment.coachId, leadId: payment.leadId },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error triggering payment success events:', error);
        }
    }

    /**
     * Trigger payment failure events
     */
    async triggerPaymentFailureEvents(payment, error) {
        try {
            await publishEvent('funnelseye_events', 'payment_failed', {
                eventName: 'payment_failed',
                payload: { paymentId: payment._id, coachId: payment.coachId, leadId: payment.leadId, error },
                relatedDoc: { paymentId: payment._id, coachId: payment.coachId, leadId: payment.leadId },
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            console.error('Error triggering payment failure events:', err);
        }
    }

    // ===== UTILITY METHODS =====

    /**
     * Get available subscription plans
     */
    getSubscriptionPlans() {
        return this.subscriptionPlans;
    }

    /**
     * Get payment methods
     */
    getPaymentMethods() {
        return this.paymentMethods;
    }

    /**
     * Validate payment data
     */
    validatePaymentData(paymentData) {
        const errors = [];

        if (!paymentData.coachId) errors.push('Coach ID is required');
        if (!paymentData.amount || paymentData.amount <= 0) errors.push('Valid amount is required');
        if (!paymentData.paymentMethod) errors.push('Payment method is required');
        if (!this.paymentMethods.includes(paymentData.paymentMethod)) {
            errors.push('Invalid payment method');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = new PaymentService();
