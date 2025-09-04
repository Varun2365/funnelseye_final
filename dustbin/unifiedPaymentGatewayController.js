const CentralPaymentHandler = require('../schema/CentralPaymentHandler');
const CoachPlan = require('../schema/CoachPlan');
const AdminSystemSettings = require('../schema/AdminSystemSettings');
const MlmCommissionDistribution = require('../schema/MlmCommissionDistribution');
const User = require('../schema/User');
const Lead = require('../schema/Lead');
const Subscription = require('../schema/Subscription');
const crypto = require('crypto');

class UnifiedPaymentGatewayController {
    /**
     * Initialize payment session and return payment page data
     * This is the main entry point for any payment from frontend
     */
    async initializePayment(req, res) {
        try {
            const { sourceType, customerId, coachId, planId, amount, currency, billingCycle, planType } = req.body;

            // Validate required fields
            if (!sourceType || !customerId || !amount || !currency) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: sourceType, customerId, amount, currency'
                });
            }

            // Get admin payment settings - fetch the latest settings
            const adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            if (!adminSettings) {
                return res.status(500).json({
                    success: false,
                    message: 'Payment system not configured. Please contact administrator to configure payment settings.'
                });
            }

            // Calculate platform fee
            const platformFeePercentage = adminSettings.paymentSystem.platformFees.defaultPercentage;
            const platformFee = (amount * platformFeePercentage) / 100;
            const netAmount = amount - platformFee;

            // Generate unique transaction ID
            const transactionId = `TXN_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

            // Create payment session
            const paymentSession = {
                transactionId,
                paymentType,
                amount,
                currency,
                customerId,
                coachId,
                planId,
                description,
                platformFee,
                platformFeePercentage,
                netAmount,
                redirectUrl,
                metadata,
                status: 'pending',
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes expiry
            };

            // Store payment session (in production, use Redis or similar)
            global.paymentSessions = global.paymentSessions || new Map();
            global.paymentSessions.set(transactionId, paymentSession);

            // Return payment page data
            res.json({
                success: true,
                data: {
                    transactionId,
                    paymentPageUrl: `/api/payments/process/${transactionId}`,
                    amount,
                    currency,
                    platformFee,
                    netAmount,
                    description,
                    expiresAt: paymentSession.expiresAt
                }
            });

        } catch (error) {
            console.error('Error initializing payment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to initialize payment',
                error: error.message
            });
        }
    }

    /**
     * Process payment on the unified payment page
     * This opens the payment interface with all details
     */
    async processPayment(req, res) {
        try {
            const { transactionId } = req.params;

            // Get payment session
            const paymentSession = global.paymentSessions?.get(transactionId);
            if (!paymentSession) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment session not found or expired'
                });
            }

            // Check if session expired
            if (new Date() > paymentSession.expiresAt) {
                global.paymentSessions.delete(transactionId);
                return res.status(400).json({
                    success: false,
                    message: 'Payment session expired'
                });
            }

            // Get admin settings for payment gateway
            const adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            const paymentGateway = adminSettings?.paymentSystem?.paymentGateways?.stripe?.enabled ? 'stripe' : 
                                 adminSettings?.paymentSystem?.paymentGateways?.razorpay?.enabled ? 'razorpay' : 'stripe';

            // Render payment page with all details
            const paymentPageData = {
                transactionId,
                paymentType: paymentSession.paymentType,
                amount: paymentSession.amount,
                currency: paymentSession.currency,
                platformFee: paymentSession.platformFee,
                netAmount: paymentSession.netAmount,
                description: paymentSession.description,
                customerId: paymentSession.customerId,
                coachId: paymentSession.coachId,
                planId: paymentSession.planId,
                paymentGateway,
                metadata: paymentSession.metadata,
                redirectUrl: paymentSession.redirectUrl
            };

            // Return payment page HTML (in production, render actual HTML template)
            res.json({
                success: true,
                message: 'Payment page loaded',
                data: paymentPageData,
                paymentGatewayConfig: this.getPaymentGatewayConfig(paymentGateway)
            });

        } catch (error) {
            console.error('Error processing payment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process payment',
                error: error.message
            });
        }
    }

    /**
     * Handle payment confirmation from payment gateway
     */
    async confirmPayment(req, res) {
        try {
            const {
                transactionId,
                paymentGateway,
                gatewayTransactionId,
                paymentStatus,
                gatewayResponse
            } = req.body;

            // Get payment session
            const paymentSession = global.paymentSessions?.get(transactionId);
            if (!paymentSession) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment session not found'
                });
            }

            if (paymentStatus !== 'successful') {
                // Handle failed payment
                await this.handleFailedPayment(transactionId, paymentSession, paymentStatus, gatewayResponse);
                return res.json({
                    success: false,
                    message: 'Payment failed',
                    status: paymentStatus
                });
            }

            // Process successful payment
            const result = await this.processSuccessfulPayment(
                transactionId,
                paymentSession,
                paymentGateway,
                gatewayTransactionId,
                gatewayResponse
            );

            // Clear payment session
            global.paymentSessions.delete(transactionId);

            res.json({
                success: true,
                message: 'Payment processed successfully',
                data: result
            });

        } catch (error) {
            console.error('Error confirming payment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to confirm payment',
                error: error.message
            });
        }
    }

    /**
     * Process successful payment and update all relevant data
     */
    async processSuccessfulPayment(transactionId, paymentSession, paymentGateway, gatewayTransactionId, gatewayResponse) {
        try {
            // Create central payment record
            const centralPayment = new CentralPaymentHandler({
                transactionId,
                sourceType: paymentSession.paymentType,
                customerId: paymentSession.customerId,
                coachId: paymentSession.coachId,
                planId: paymentSession.planId,
                grossAmount: paymentSession.amount,
                currency: paymentSession.currency,
                platformFee: paymentSession.platformFee,
                platformFeePercentage: paymentSession.platformFeePercentage,
                netAmount: paymentSession.netAmount,
                paymentGateway,
                gatewayTransactionId,
                gatewayResponse,
                status: 'successful',
                metadata: paymentSession.metadata
            });

            await centralPayment.save();

            // Handle different payment types
            switch (paymentSession.paymentType) {
                case 'coach_plan_purchase':
                    await this.handleCoachPlanPurchase(paymentSession, centralPayment);
                    break;
                case 'subscription_payment':
                    await this.handleSubscriptionPayment(paymentSession, centralPayment);
                    break;
                case 'platform_subscription':
                    await this.handlePlatformSubscription(paymentSession, centralPayment);
                    break;
                default:
                    // Handle other payment types
                    break;
            }

            // Calculate and distribute MLM commissions if applicable
            if (paymentSession.coachId) {
                await this.calculateAndDistributeCommissions(centralPayment);
            }

            return {
                transactionId,
                centralPaymentId: centralPayment._id,
                status: 'successful'
            };

        } catch (error) {
            console.error('Error processing successful payment:', error);
            throw error;
        }
    }

    /**
     * Handle coach plan purchase
     */
    async handleCoachPlanPurchase(paymentSession, centralPayment) {
        try {
            if (paymentSession.planId) {
                // Update plan sales data
                await CoachPlan.findByIdAndUpdate(paymentSession.planId, {
                    $inc: {
                        totalSales: 1,
                        totalRevenue: paymentSession.netAmount
                    }
                });

                // Update coach revenue
                if (paymentSession.coachId) {
                    await User.findByIdAndUpdate(paymentSession.coachId, {
                        $inc: { totalRevenue: paymentSession.netAmount }
                    });
                }
            }
        } catch (error) {
            console.error('Error handling coach plan purchase:', error);
        }
    }

    /**
     * Handle subscription payment
     */
    async handleSubscriptionPayment(paymentSession, centralPayment) {
        try {
            // Update subscription status
            if (paymentSession.metadata.subscriptionId) {
                await Subscription.findByIdAndUpdate(paymentSession.metadata.subscriptionId, {
                    status: 'active',
                    lastPaymentDate: new Date(),
                    nextPaymentDate: this.calculateNextPaymentDate(paymentSession.metadata.billingCycle)
                });
            }
        } catch (error) {
            console.error('Error handling subscription payment:', error);
        }
    }

    /**
     * Handle platform subscription
     */
    async handlePlatformSubscription(paymentSession, centralPayment) {
        try {
            // Enable coach subscription to platform
            if (paymentSession.coachId) {
                await User.findByIdAndUpdate(paymentSession.coachId, {
                    'subscription.status': 'active',
                    'subscription.planType': paymentSession.metadata.planType || 'basic',
                    'subscription.startDate': new Date(),
                    'subscription.endDate': this.calculateSubscriptionEndDate(paymentSession.metadata.planType),
                    'subscription.lastPaymentDate': new Date()
                });
            }
        } catch (error) {
            console.error('Error handling platform subscription:', error);
        }
    }

    /**
     * Calculate and distribute MLM commissions
     */
    async calculateAndDistributeCommissions(centralPayment) {
        try {
            // Get admin settings
            const adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            if (!adminSettings) return;

            // Get coach hierarchy
            const coach = await User.findById(centralPayment.coachId);
            if (!coach || !coach.sponsorId) return;

            const commissionStructure = adminSettings.paymentSystem.mlmCommissionStructure;
            const commissionEntries = [];
            let currentCoachId = coach.sponsorId;
            let level = 1;

            // Calculate commissions for up to 10 levels
            while (currentCoachId && level <= 10) {
                const levelPercentage = commissionStructure[`level${level}`];
                if (levelPercentage && levelPercentage > 0) {
                    const commissionAmount = (centralPayment.netAmount * levelPercentage) / 100;
                    
                    commissionEntries.push({
                        coachId: currentCoachId,
                        level,
                        baseAmount: centralPayment.netAmount,
                        commissionPercentage: levelPercentage,
                        finalCommissionAmount: commissionAmount,
                        status: 'pending'
                    });
                }

                // Move to next level
                const parentCoach = await User.findById(currentCoachId);
                currentCoachId = parentCoach?.sponsorId;
                level++;
            }

            if (commissionEntries.length > 0) {
                // Create commission distribution record
                const commissionDistribution = new MlmCommissionDistribution({
                    distributionId: `COMM_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
                    sourceTransactionId: centralPayment.transactionId,
                    sourceTransaction: centralPayment._id,
                    commissionPeriod: {
                        month: new Date().getMonth() + 1,
                        year: new Date().getFullYear()
                    },
                    commissionStructure: commissionStructure,
                    commissionEntries,
                    summary: {
                        totalEligibleCoaches: commissionEntries.length,
                        totalCommissionAmount: commissionEntries.reduce((sum, entry) => sum + entry.finalCommissionAmount, 0),
                        levelsInvolved: level - 1
                    },
                    processingStatus: 'completed',
                    approvalStatus: 'auto_approved'
                });

                await commissionDistribution.save();
            }

        } catch (error) {
            console.error('Error calculating MLM commissions:', error);
        }
    }

    /**
     * Handle failed payment
     */
    async handleFailedPayment(transactionId, paymentSession, paymentStatus, gatewayResponse) {
        try {
            // Create failed payment record
            const centralPayment = new CentralPaymentHandler({
                transactionId,
                sourceType: paymentSession.paymentType,
                customerId: paymentSession.customerId,
                coachId: paymentSession.coachId,
                planId: paymentSession.planId,
                grossAmount: paymentSession.amount,
                currency: paymentSession.currency,
                platformFee: paymentSession.platformFee,
                platformFeePercentage: paymentSession.platformFeePercentage,
                netAmount: paymentSession.netAmount,
                paymentGateway: 'unknown',
                gatewayResponse,
                status: 'failed',
                metadata: paymentSession.metadata
            });

            await centralPayment.save();

        } catch (error) {
            console.error('Error handling failed payment:', error);
        }
    }

    /**
     * Get payment gateway configuration
     */
    getPaymentGatewayConfig(gateway) {
        const configs = {
            stripe: {
                publicKey: process.env.STRIPE_PUBLIC_KEY,
                supportedMethods: ['card', 'bank_transfer', 'upi', 'wallet'],
                supportedCurrencies: ['USD', 'INR', 'EUR', 'GBP']
            },
            razorpay: {
                keyId: process.env.RAZORPAY_KEY_ID,
                supportedMethods: ['card', 'netbanking', 'upi', 'wallet'],
                supportedCurrencies: ['INR', 'USD']
            }
        };

        return configs[gateway] || configs.stripe;
    }

    /**
     * Calculate next payment date for subscriptions
     */
    calculateNextPaymentDate(billingCycle) {
        const now = new Date();
        switch (billingCycle) {
            case 'weekly':
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            case 'monthly':
                return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            case 'yearly':
                return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            default:
                return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        }
    }

    /**
     * Calculate subscription end date
     */
    calculateSubscriptionEndDate(planType) {
        const now = new Date();
        switch (planType) {
            case 'monthly':
                return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            case 'quarterly':
                return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
            case 'yearly':
                return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            default:
                return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        }
    }

    /**
     * Get payment status
     */
    async getPaymentStatus(req, res) {
        try {
            const { transactionId } = req.params;

            const paymentSession = global.paymentSessions?.get(transactionId);
            if (!paymentSession) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment session not found'
                });
            }

            res.json({
                success: true,
                data: {
                    transactionId,
                    status: paymentSession.status,
                    amount: paymentSession.amount,
                    currency: paymentSession.currency,
                    expiresAt: paymentSession.expiresAt
                }
            });

        } catch (error) {
            console.error('Error getting payment status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment status',
                error: error.message
            });
        }
    }
}

module.exports = new UnifiedPaymentGatewayController();
