const mongoose = require('mongoose');
const { 
    CentralPaymentHandler, 
    MlmCommissionDistribution, 
    AdminSystemSettings, 
    CoachPlan, 
    User, 
    Lead 
} = require('../schema');

// ===== CENTRAL PAYMENT HANDLER CONTROLLER =====

// @desc    Process payment for coach plan purchase
// @route   POST /api/central-payment/process-plan-purchase
// @access  Public (for customers)
const processPlanPurchase = async (req, res) => {
    try {
        const {
            planId,
            customerId,
            customerEmail,
            customerPhone,
            paymentMethod,
            paymentGateway,
            gatewayTransactionId,
            gatewayResponse
        } = req.body;

        // Validate required fields
        if (!planId || !customerId || !customerEmail || !paymentMethod || !paymentGateway) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Get the coach plan
        const plan = await CoachPlan.findById(planId);
        if (!plan || plan.status !== 'active') {
            return res.status(404).json({
                success: false,
                message: 'Plan not found or not available'
            });
        }

        // Get admin payment settings
        const adminSettings = await AdminSystemSettings.findOne({}).sort({ createdAt: -1 });
        if (!adminSettings) {
            return res.status(500).json({
                success: false,
                message: 'Payment settings not configured'
            });
        }

        // Calculate platform fee
        const platformFeeInfo = adminSettings.getPlatformFee(plan.category, plan.price);
        const platformFee = platformFeeInfo.amount;
        const netAmount = plan.price - platformFee;

        // Generate transaction ID
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create central payment record
        const centralPayment = new CentralPaymentHandler({
            transactionId,
            sourceType: 'coach_plan_purchase',
            customerId,
            customerEmail,
            customerPhone,
            coachId: plan.coachId,
            planId: plan._id,
            planTitle: plan.title,
            grossAmount: plan.price,
            currency: plan.currency,
            platformFee,
            platformFeePercentage: platformFeeInfo.percentage,
            netAmount,
            paymentGateway,
            gatewayTransactionId,
            gatewayResponse,
            status: 'pending',
            description: `Purchase of ${plan.title}`,
            tags: ['plan_purchase', plan.category]
        });

        // Save the payment record
        await centralPayment.save();

        // Update plan sales statistics
        plan.totalSales += 1;
        plan.totalRevenue += plan.price;
        await plan.save();

        res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                transactionId: centralPayment.transactionId,
                amount: centralPayment.grossAmount,
                currency: centralPayment.currency,
                platformFee: centralPayment.platformFee,
                netAmount: centralPayment.netAmount,
                status: centralPayment.status
            }
        });

    } catch (error) {
        console.error('Error processing plan purchase:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// @desc    Confirm payment success (webhook from payment gateway)
// @route   POST /api/central-payment/confirm-payment
// @access  Private (webhook)
const confirmPayment = async (req, res) => {
    try {
        const {
            transactionId,
            gatewayTransactionId,
            status,
            additionalData
        } = req.body;

        // Find the payment record
        const payment = await CentralPaymentHandler.findOne({ transactionId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Update payment status
        payment.status = status;
        payment.gatewayTransactionId = gatewayTransactionId;
        payment.gatewayResponse = additionalData || payment.gatewayResponse;

        if (status === 'successful') {
            payment.paidAt = new Date();
            payment.processedAt = new Date();
        }

        await payment.save();

        // If payment is successful, trigger commission calculation
        if (status === 'successful' && payment.sourceType === 'coach_plan_purchase') {
            await calculateAndDistributeCommissions(payment);
        }

        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            data: {
                transactionId: payment.transactionId,
                status: payment.status,
                updatedAt: payment.updatedAt
            }
        });

    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// @desc    Calculate and distribute MLM commissions
// @route   POST /api/central-payment/calculate-commissions
// @access  Private
const calculateAndDistributeCommissions = async (payment) => {
    try {
        // Get admin payment settings
        const adminSettings = await AdminSystemSettings.findOne({}).sort({ createdAt: -1 });
        if (!adminSettings) {
            throw new Error('Payment settings not configured');
        }

        // Get the coach hierarchy
        const coach = await User.findById(payment.coachId);
        if (!coach) {
            throw new Error('Coach not found');
        }

        // Calculate commissions for up to 10 levels
        const commissionEntries = [];
        let currentCoach = coach;
        let level = 1;

        while (currentCoach && level <= 10) {
            // Check if coach is eligible for commission
            if (await isCoachEligibleForCommission(currentCoach, adminSettings)) {
                const commissionStructure = adminSettings.getCommissionForLevel(level);
                
                if (commissionStructure && commissionStructure.isActive) {
                    // Calculate commission amount
                    let baseAmount = payment.netAmount; // After platform fee
                    if (adminSettings.commissionEligibility.calculationBase === 'gross_amount') {
                        baseAmount = payment.grossAmount;
                    }

                    let commissionAmount = (baseAmount * commissionStructure.percentage) / 100;
                    
                    // Apply maximum commission limit if set
                    if (commissionStructure.maxAmount && commissionAmount > commissionStructure.maxAmount) {
                        commissionAmount = commissionStructure.maxAmount;
                    }

                    // Create commission entry
                    commissionEntries.push({
                        coachId: currentCoach._id,
                        coachEmail: currentCoach.email,
                        coachName: currentCoach.name || currentCoach.email,
                        level,
                        sponsorId: currentCoach.sponsorId,
                        sponsorEmail: currentCoach.sponsorEmail,
                        sponsorName: currentCoach.sponsorName,
                        baseAmount,
                        commissionPercentage: commissionStructure.percentage,
                        commissionAmount,
                        maxCommissionAmount: commissionStructure.maxAmount,
                        finalCommissionAmount: commissionAmount,
                        status: 'pending',
                        eligibilityReason: 'Eligible based on current settings'
                    });
                }
            }

            // Move to next level (sponsor)
            if (currentCoach.sponsorId) {
                currentCoach = await User.findById(currentCoach.sponsorId);
                level++;
            } else {
                break;
            }
        }

        // Create MLM commission distribution record
        if (commissionEntries.length > 0) {
            const distributionId = `DIST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const commissionDistribution = new MlmCommissionDistribution({
                distributionId,
                sourceTransactionId: payment.transactionId,
                sourceTransaction: payment._id,
                commissionPeriod: {
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear()
                },
                commissionStructure: adminSettings.mlmCommissionStructure,
                commissionEntries,
                processingStatus: 'completed',
                processedAt: new Date(),
                approvalStatus: 'auto_approved',
                approvedAt: new Date(),
                payoutSchedule: adminSettings.payoutSettings.frequency
            });

            // Calculate summary statistics
            commissionDistribution.calculateSummary();

            await commissionDistribution.save();

            // Update payment record with commission distribution
            payment.commissionDistribution = commissionEntries.map(entry => ({
                coachId: entry.coachId,
                coachEmail: entry.coachEmail,
                level: entry.level,
                commissionPercentage: entry.commissionPercentage,
                commissionAmount: entry.finalCommissionAmount,
                status: entry.status
            }));

            await payment.save();

            console.log(`✅ Commissions calculated for ${commissionEntries.length} coaches`);
        }

    } catch (error) {
        console.error('Error calculating commissions:', error);
        throw error;
    }
};

// @desc    Check if coach is eligible for commission
// @route   Private function
const isCoachEligibleForCommission = async (coach, adminSettings) => {
    try {
        // Check minimum coach level
        if (coach.currentLevel < adminSettings.commissionEligibility.minimumCoachLevel) {
            return false;
        }

        // Check performance requirements
        const requirements = adminSettings.commissionEligibility.performanceRequirements;
        
        // Get coach performance data (you may need to implement this based on your existing system)
        // For now, we'll assume eligibility if basic requirements are met
        
        return true;
    } catch (error) {
        console.error('Error checking commission eligibility:', error);
        return false;
    }
};

// @desc    Process commission payouts
// @route   POST /api/central-payment/process-payouts
// @access  Private (Admin)
const processCommissionPayouts = async (req, res) => {
    try {
        const { distributionId, payoutMethod } = req.body;

        // Find the commission distribution
        const distribution = await MlmCommissionDistribution.findOne({ distributionId });
        if (!distribution) {
            return res.status(404).json({
                success: false,
                message: 'Commission distribution not found'
            });
        }

        // Get admin payment settings
        const adminSettings = await AdminSystemSettings.findOne({}).sort({ createdAt: -1 });
        if (!adminSettings) {
            return res.status(500).json({
                success: false,
                message: 'Payment settings not configured'
            });
        }

        // Process payouts for eligible entries
        const processedPayouts = [];
        
        for (const entry of distribution.commissionEntries) {
            if (entry.status === 'pending' && entry.finalCommissionAmount >= adminSettings.payoutSettings.minimumPayoutAmount) {
                // Update entry status
                entry.status = 'paid';
                entry.payoutMethod = payoutMethod;
                entry.payoutDate = new Date();
                entry.payoutStatus = 'completed';
                entry.payoutReference = `PAYOUT_${Date.now()}_${entry.coachId}`;

                processedPayouts.push({
                    coachId: entry.coachId,
                    coachEmail: entry.coachEmail,
                    amount: entry.finalCommissionAmount,
                    payoutReference: entry.payoutReference
                });
            }
        }

        // Update distribution status
        distribution.processingStatus = 'completed';
        distribution.lastPayoutDate = new Date();
        distribution.calculateSummary();

        await distribution.save();

        res.status(200).json({
            success: true,
            message: 'Payouts processed successfully',
            data: {
                distributionId: distribution.distributionId,
                processedPayouts: processedPayouts.length,
                totalAmount: processedPayouts.reduce((sum, payout) => sum + payout.amount, 0),
                payouts: processedPayouts
            }
        });

    } catch (error) {
        console.error('Error processing payouts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// @desc    Process refund
// @route   POST /api/central-payment/process-refund
// @access  Private (Admin)
const processRefund = async (req, res) => {
    try {
        const {
            transactionId,
            refundAmount,
            refundReason,
            refundMethod
        } = req.body;

        // Find the payment record
        const payment = await CentralPaymentHandler.findOne({ transactionId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Get admin payment settings
        const adminSettings = await AdminSystemSettings.findOne({}).sort({ createdAt: -1 });
        if (!adminSettings) {
            return res.status(500).json({
                success: false,
                message: 'Payment settings not configured'
            });
        }

        // Check if refund is allowed
        if (!adminSettings.refundPolicy.refundsAllowed) {
            return res.status(400).json({
                success: false,
                message: 'Refunds are not allowed'
            });
        }

        // Check refund time limit
        const daysSincePayment = Math.floor((new Date() - payment.paidAt) / (1000 * 60 * 60 * 24));
        if (daysSincePayment > adminSettings.refundPolicy.timeLimit) {
            return res.status(400).json({
                success: false,
                message: `Refund time limit exceeded. Maximum ${adminSettings.refundPolicy.timeLimit} days allowed.`
            });
        }

        // Calculate refund amount
        const maxRefundAmount = (payment.grossAmount * adminSettings.refundPolicy.refundPercentage) / 100;
        const actualRefundAmount = Math.min(refundAmount, maxRefundAmount);

        // Update payment record
        payment.status = actualRefundAmount === payment.grossAmount ? 'refunded' : 'partially_refunded';
        payment.refundInfo = {
            refundAmount: actualRefundAmount,
            refundReason,
            refundDate: new Date(),
            refundStatus: 'pending'
        };

        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            data: {
                transactionId: payment.transactionId,
                refundAmount: actualRefundAmount,
                refundStatus: payment.refundInfo.refundStatus,
                newPaymentStatus: payment.status
            }
        });

    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// @desc    Get payment analytics
// @route   GET /api/central-payment/analytics
// @access  Private (Admin)
const getPaymentAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'daily' } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Aggregate payments
        const analytics = await CentralPaymentHandler.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: groupBy === 'daily' ? {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    } : groupBy === 'monthly' ? {
                        $dateToString: { format: "%Y-%m", date: "$createdAt" }
                    } : {
                        $dateToString: { format: "%Y", date: "$createdAt" }
                    },
                    totalTransactions: { $sum: 1 },
                    totalGrossAmount: { $sum: "$grossAmount" },
                    totalPlatformFees: { $sum: "$platformFee" },
                    totalNetAmount: { $sum: "$netAmount" },
                    successfulTransactions: {
                        $sum: { $cond: [{ $eq: ["$status", "successful"] }, 1, 0] }
                    },
                    failedTransactions: {
                        $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
                    },
                    refundedTransactions: {
                        $sum: { $cond: [{ $eq: ["$status", "refunded"] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get summary statistics
        const summary = await CentralPaymentHandler.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalTransactions: { $sum: 1 },
                    totalGrossAmount: { $sum: "$grossAmount" },
                    totalPlatformFees: { $sum: "$platformFee" },
                    totalNetAmount: { $sum: "$netAmount" },
                    averageTransactionAmount: { $avg: "$grossAmount" },
                    successRate: {
                        $multiply: [
                            {
                                $divide: [
                                    { $sum: { $cond: [{ $eq: ["$status", "successful"] }, 1, 0] } },
                                    { $sum: 1 }
                                ]
                            },
                            100
                        ]
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Analytics retrieved successfully',
            data: {
                analytics,
                summary: summary[0] || {},
                dateRange: { startDate, endDate, groupBy }
            }
        });

    } catch (error) {
        console.error('Error getting payment analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// @desc    Get transaction details
// @route   GET /api/central-payment/transaction/:transactionId
// @access  Private
const getTransactionDetails = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await CentralPaymentHandler.findOne({ transactionId })
            .populate('customerId', 'name email phone')
            .populate('coachId', 'name email')
            .populate('planId', 'title category');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Transaction details retrieved successfully',
            data: transaction
        });

    } catch (error) {
        console.error('Error getting transaction details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// @desc    Get commission distribution details
// @route   GET /api/central-payment/commission-distribution/:distributionId
// @access  Private
const getCommissionDistributionDetails = async (req, res) => {
    try {
        const { distributionId } = req.params;

        const distribution = await MlmCommissionDistribution.findOne({ distributionId })
            .populate('sourceTransaction', 'transactionId grossAmount currency status')
            .populate('commissionEntries.coachId', 'name email currentLevel')
            .populate('commissionEntries.sponsorId', 'name email');

        if (!distribution) {
            return res.status(404).json({
                success: false,
                message: 'Commission distribution not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Commission distribution details retrieved successfully',
            data: distribution
        });

    } catch (error) {
        console.error('Error getting commission distribution details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    processPlanPurchase,
    confirmPayment,
    calculateAndDistributeCommissions,
    processCommissionPayouts,
    processRefund,
    getPaymentAnalytics,
    getTransactionDetails,
    getCommissionDistributionDetails
};
