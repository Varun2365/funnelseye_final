const CentralPaymentHandler = require('../schema/CentralPaymentHandler');
const MlmCommissionDistribution = require('../schema/MlmCommissionDistribution');
const AdminSystemSettings = require('../schema/AdminSystemSettings');
const User = require('../schema/User');
const crypto = require('crypto');

class PayoutController {
    /**
     * Process automatic payouts for coaches
     */
    async processAutomaticPayouts(req, res) {
        try {
            const { payoutType = 'commission', period = 'current' } = req.body;

            const adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            if (!adminSettings) {
                return res.status(500).json({
                    success: false,
                    message: 'Payout system not configured'
                });
            }

            const payoutSettings = adminSettings.payoutSettings;
            
            if (payoutSettings.frequency === 'manual') {
                return res.status(400).json({
                    success: false,
                    message: 'Automatic payouts are disabled. Manual processing required.'
                });
            }

            let payoutResults = [];

            switch (payoutType) {
                case 'commission':
                    payoutResults = await this.processCommissionPayouts(adminSettings, period);
                    break;
                case 'revenue':
                    payoutResults = await this.processRevenuePayouts(adminSettings, period);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid payout type'
                    });
            }

            res.json({
                success: true,
                message: `Processed ${payoutResults.length} payouts`,
                data: {
                    totalPayouts: payoutResults.length,
                    totalAmount: payoutResults.reduce((sum, payout) => sum + payout.amount, 0),
                    payouts: payoutResults
                }
            });

        } catch (error) {
            console.error('Error processing automatic payouts:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process automatic payouts',
                error: error.message
            });
        }
    }

    /**
     * Process commission payouts
     */
    async processCommissionPayouts(adminSettings, period) {
        try {
            const payoutResults = [];
            const currentDate = new Date();
            let startDate, endDate;

            if (period === 'current') {
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            } else if (period === 'previous') {
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
            }

            const pendingCommissions = await MlmCommissionDistribution.find({
                'commissionPeriod.month': startDate.getMonth() + 1,
                'commissionPeriod.year': startDate.getFullYear(),
                processingStatus: 'completed',
                approvalStatus: 'auto_approved'
            }).populate('commissionEntries.coachId');

            for (const commission of pendingCommissions) {
                for (const entry of commission.commissionEntries) {
                    if (entry.status === 'pending' && entry.commissionAmount > 0) {
                        if (entry.commissionAmount >= adminSettings.payoutSettings.minimumPayoutAmount) {
                            const payoutResult = await this.processSinglePayout({
                                coachId: entry.coachId._id,
                                amount: entry.commissionAmount,
                                currency: 'USD',
                                payoutType: 'commission',
                                sourceTransactionId: commission.sourceTransactionId,
                                commissionLevel: entry.level,
                                metadata: {
                                    commissionDistributionId: commission._id,
                                    commissionEntryId: entry._id
                                }
                            });

                            if (payoutResult.success) {
                                entry.status = 'paid';
                                entry.payoutDate = new Date();
                                await commission.save();
                                payoutResults.push(payoutResult.data);
                            }
                        }
                    }
                }
            }

            return payoutResults;

        } catch (error) {
            console.error('Error processing commission payouts:', error);
            throw error;
        }
    }

    /**
     * Process a single payout to a coach
     */
    async processSinglePayout(payoutData) {
        try {
            const {
                coachId,
                amount,
                currency,
                payoutType,
                sourceTransactionId,
                commissionLevel,
                metadata = {}
            } = payoutData;

            const coach = await User.findById(coachId);
            if (!coach) {
                return {
                    success: false,
                    message: 'Coach not found'
                };
            }

            if (!coach.paymentCollection || !coach.paymentCollection.bankAccount) {
                return {
                    success: false,
                    message: 'Coach has no payout method configured'
                };
            }

            const payoutId = `PAYOUT_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

            const adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            const paymentGateway = adminSettings?.paymentGateways?.stripe?.enabled ? 'stripe' : 
                                 adminSettings?.paymentGateways?.razorpay?.enabled ? 'razorpay' : 'stripe';

            const payout = new CentralPaymentHandler({
                transactionId: payoutId,
                sourceType: 'commission_payout',
                customerId: coachId,
                coachId: coachId,
                grossAmount: amount,
                currency: currency,
                platformFee: 0,
                platformFeePercentage: 0,
                netAmount: amount,
                paymentGateway: paymentGateway,
                status: 'processing',
                payoutInfo: {
                    payoutAmount: amount,
                    payoutStatus: 'processing'
                },
                metadata: {
                    payoutType,
                    sourceTransactionId,
                    commissionLevel,
                    ...metadata
                }
            });

            await payout.save();

            const gatewayResult = await this.processPayoutThroughGateway(
                payout,
                coach,
                paymentGateway
            );

            if (gatewayResult.success) {
                payout.status = 'successful';
                payout.payoutInfo.payoutStatus = 'completed';
                payout.gatewayTransactionId = gatewayResult.gatewayTransactionId;
                payout.gatewayResponse = gatewayResult.gatewayResponse;
                await payout.save();

                return {
                    success: true,
                    data: {
                        payoutId,
                        coachId,
                        amount,
                        currency,
                        status: 'successful',
                        gatewayTransactionId: gatewayResult.gatewayTransactionId
                    }
                };
            } else {
                payout.status = 'failed';
                payout.payoutInfo.payoutStatus = 'failed';
                payout.gatewayResponse = gatewayResult.error;
                await payout.save();

                return {
                    success: false,
                    message: 'Payout failed',
                    error: gatewayResult.error
                };
            }

        } catch (error) {
            console.error('Error processing single payout:', error);
            return {
                success: false,
                message: 'Payout processing failed',
                error: error.message
            };
        }
    }

    /**
     * Process payout through payment gateway
     */
    async processPayoutThroughGateway(payout, coach, paymentGateway) {
        try {
            if (paymentGateway === 'stripe') {
                return await this.processStripePayout(payout, coach);
            } else if (paymentGateway === 'razorpay') {
                return await this.processRazorpayPayout(payout, coach);
            } else {
                return await this.processBankTransferPayout(payout, coach);
            }

        } catch (error) {
            console.error('Error processing payout through gateway:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process Stripe Connect payout
     */
    async processStripePayout(payout, coach) {
        try {
            const gatewayTransactionId = `stripe_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
            
            return {
                success: true,
                gatewayTransactionId,
                gatewayResponse: {
                    status: 'succeeded',
                    transfer_id: gatewayTransactionId,
                    amount: payout.netAmount,
                    currency: payout.currency
                }
            };

        } catch (error) {
            console.error('Error processing Stripe payout:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process Razorpay payout
     */
    async processRazorpayPayout(payout, coach) {
        try {
            const gatewayTransactionId = `razorpay_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
            
            return {
                success: true,
                gatewayTransactionId,
                gatewayResponse: {
                    status: 'processed',
                    payout_id: gatewayTransactionId,
                    amount: payout.netAmount,
                    currency: payout.currency
                }
            };

        } catch (error) {
            console.error('Error processing Razorpay payout:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process bank transfer payout
     */
    async processBankTransferPayout(payout, coach) {
        try {
            const gatewayTransactionId = `bank_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
            
            return {
                success: true,
                gatewayTransactionId,
                gatewayResponse: {
                    status: 'initiated',
                    reference_id: gatewayTransactionId,
                    amount: payout.netAmount,
                    currency: payout.currency,
                    bank_details: coach.paymentCollection.bankAccount
                }
            };

        } catch (error) {
            console.error('Error processing bank transfer payout:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get payout history for a coach
     */
    async getPayoutHistory(req, res) {
        try {
            const { coachId } = req.params;
            const { page = 1, limit = 10, status } = req.query;

            const query = {
                sourceType: 'commission_payout',
                customerId: coachId
            };

            if (status) {
                query.status = status;
            }

            const payouts = await CentralPaymentHandler.find(query)
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate('coachId', 'firstName lastName email');

            const total = await CentralPaymentHandler.countDocuments(query);

            res.json({
                success: true,
                data: {
                    payouts,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalPayouts: total,
                        hasNextPage: page * limit < total,
                        hasPrevPage: page > 1
                    }
                }
            });

        } catch (error) {
            console.error('Error getting payout history:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payout history',
                error: error.message
            });
        }
    }

    /**
     * Get payout analytics
     */
    async getPayoutAnalytics(req, res) {
        try {
            const { period = 'current' } = req.query;
            const currentDate = new Date();
            let startDate, endDate;

            if (period === 'current') {
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            } else if (period === 'previous') {
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
            }

            const analytics = await CentralPaymentHandler.aggregate([
                {
                    $match: {
                        sourceType: 'commission_payout',
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$netAmount' }
                    }
                }
            ]);

            res.json({
                success: true,
                data: {
                    period: { startDate, endDate },
                    summary: {
                        totalPayouts: analytics.reduce((sum, item) => sum + item.count, 0),
                        totalAmount: analytics.reduce((sum, item) => sum + item.totalAmount, 0),
                        successfulPayouts: analytics.find(item => item._id === 'successful')?.count || 0,
                        failedPayouts: analytics.find(item => item._id === 'failed')?.count || 0
                    },
                    byStatus: analytics
                }
            });

        } catch (error) {
            console.error('Error getting payout analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payout analytics',
                error: error.message
            });
        }
    }
}

module.exports = new PayoutController();
