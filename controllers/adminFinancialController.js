const asyncHandler = require('../middleware/async');
const { AdminSystemSettings, Coach, Payment, Subscription, CentralPayment, PaymentGatewayConfig } = require('../schema');

// ===== FINANCIAL & BILLING CONTROL CENTER =====

/**
 * @desc    Get credit system configuration
 * @route   GET /api/admin/financial/credit-system
 * @access  Private (Admin)
 */
exports.getCreditSystem = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne().select('paymentSystem.currencies paymentSystem.taxSettings');
        
        // Get credit types and pricing
        const creditTypes = {
            aiCredits: { name: 'AI Credits', basePrice: 0.01, markup: 0.005 },
            // whatsappCredits: { name: 'WhatsApp Credits', basePrice: 0.01, markup: 0.003 }, // WhatsApp functionality moved to dustbin/whatsapp-dump/
            emailCredits: { name: 'Email Credits', basePrice: 0.005, markup: 0.002 }
        };

        res.status(200).json({
            success: true,
            data: {
                creditTypes,
                currencies: settings?.paymentSystem?.currencies || { supported: ['USD'], default: 'USD' },
                taxSettings: settings?.paymentSystem?.taxSettings || {}
            }
        });
    } catch (error) {
        console.error('Error getting credit system:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving credit system configuration',
            error: error.message
        });
    }
});

/**
 * @desc    Update credit system configuration
 * @route   PUT /api/admin/financial/credit-system
 * @access  Private (Admin)
 */
exports.updateCreditSystem = asyncHandler(async (req, res) => {
    try {
        const { creditTypes, currencies, taxSettings } = req.body;

        const settings = await AdminSystemSettings.findOneAndUpdate(
            {},
            {
                $set: {
                    'paymentSystem.currencies': currencies,
                    'paymentSystem.taxSettings': taxSettings
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Credit system updated successfully',
            data: {
                creditTypes,
                currencies: settings.paymentSystem.currencies,
                taxSettings: settings.paymentSystem.taxSettings
            }
        });
    } catch (error) {
        console.error('Error updating credit system:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating credit system',
            error: error.message
        });
    }
});

/**
 * @desc    Get credit packages
 * @route   GET /api/admin/financial/credit-packages
 * @access  Private (Admin)
 */
exports.getCreditPackages = asyncHandler(async (req, res) => {
    try {
        // This would typically fetch from a CreditPackage schema
        const packages = [
            {
                id: 'starter',
                name: 'Starter Pack',
                aiCredits: 1000,
                // whatsappCredits: 500, // WhatsApp functionality moved to dustbin/whatsapp-dump/
                emailCredits: 1000,
                price: 29.99,
                autoRecharge: false
            },
            {
                id: 'professional',
                name: 'Professional Pack',
                aiCredits: 5000,
                // whatsappCredits: 2500, // WhatsApp functionality moved to dustbin/whatsapp-dump/
                emailCredits: 5000,
                price: 99.99,
                autoRecharge: true,
                rechargeThreshold: 100,
                rechargeAmount: 500
            },
            {
                id: 'enterprise',
                name: 'Enterprise Pack',
                aiCredits: 20000,
                // whatsappCredits: 10000, // WhatsApp functionality moved to dustbin/whatsapp-dump/
                emailCredits: 20000,
                price: 299.99,
                autoRecharge: true,
                rechargeThreshold: 500,
                rechargeAmount: 2000
            }
        ];

        res.status(200).json({
            success: true,
            data: packages
        });
    } catch (error) {
        console.error('Error getting credit packages:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving credit packages',
            error: error.message
        });
    }
});

/**
 * @desc    Get revenue analytics
 * @route   GET /api/admin/financial/revenue-analytics
 * @access  Private (Admin)
 */
exports.getRevenueAnalytics = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        // Get payment analytics
        const paymentStats = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalPayments: { $count: {} },
                    averagePayment: { $avg: '$amount' }
                }
            }
        ]);

        // Get subscription analytics
        const subscriptionStats = await Subscription.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: 'active'
                }
            },
            {
                $group: {
                    _id: '$planType',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' }
                }
            }
        ]);

        // Get MRR (Monthly Recurring Revenue)
        const mrr = await Subscription.aggregate([
            {
                $match: {
                    status: 'active',
                    nextBillingDate: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    mrr: { $sum: '$amount' }
                }
            }
        ]);

        // Get churn analysis
        const churnedSubscriptions = await Subscription.aggregate([
            {
                $match: {
                    status: 'cancelled',
                    updatedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    churnedCount: { $count: {} },
                    churnedRevenue: { $sum: '$amount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                paymentStats: paymentStats[0] || {
                    totalRevenue: 0,
                    totalPayments: 0,
                    averagePayment: 0
                },
                subscriptionStats,
                mrr: mrr[0]?.mrr || 0,
                churnStats: churnedSubscriptions[0] || {
                    churnedCount: 0,
                    churnedRevenue: 0
                },
                timeRange
            }
        });
    } catch (error) {
        console.error('Error getting revenue analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving revenue analytics',
            error: error.message
        });
    }
});

/**
 * @desc    Get payment failure analytics
 * @route   GET /api/admin/financial/payment-failures
 * @access  Private (Admin)
 */
exports.getPaymentFailures = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        const failedPayments = await Payment.aggregate([
            {
                $match: {
                    status: 'failed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$failureReason',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const retryAttempts = await Payment.aggregate([
            {
                $match: {
                    status: 'pending',
                    retryCount: { $gt: 0 },
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRetries: { $sum: '$retryCount' },
                    averageRetries: { $avg: '$retryCount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                failedPayments,
                retryStats: retryAttempts[0] || {
                    totalRetries: 0,
                    averageRetries: 0
                },
                timeRange
            }
        });
    } catch (error) {
        console.error('Error getting payment failures:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment failures',
            error: error.message
        });
    }
});

/**
 * @desc    Get gateway markup analytics
 * @route   GET /api/admin/financial/gateway-markup
 * @access  Private (Admin)
 */
exports.getGatewayMarkup = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        const gatewayStats = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$gateway',
                    totalAmount: { $sum: '$amount' },
                    totalPayments: { $count: {} },
                    totalFees: { $sum: '$gatewayFee' },
                    averageFee: { $avg: '$gatewayFee' }
                }
            },
            {
                $addFields: {
                    markupPercentage: {
                        $multiply: [
                            { $divide: ['$totalFees', '$totalAmount'] },
                            100
                        ]
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                gatewayStats,
                timeRange
            }
        });
    } catch (error) {
        console.error('Error getting gateway markup:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving gateway markup analytics',
            error: error.message
        });
    }
});

/**
 * @desc    Get credit usage analytics
 * @route   GET /api/admin/financial/credit-usage
 * @access  Private (Admin)
 */
exports.getCreditUsage = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        // Get coach credit usage
        const creditUsage = await Coach.aggregate([
            {
                $project: {
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    aiCredits: 1,
                    // whatsappCredits: 1, // WhatsApp functionality moved to dustbin/whatsapp-dump/
                    emailCredits: 1,
                    totalCreditsUsed: {
                        $add: [
                            { $ifNull: ['$aiCreditsUsed', 0] },
                            // { $ifNull: ['$whatsappCreditsUsed', 0] }, // WhatsApp functionality moved to dustbin/whatsapp-dump/
                            { $ifNull: ['$emailCreditsUsed', 0] }
                        ]
                    }
                }
            },
            {
                $sort: { totalCreditsUsed: -1 }
            },
            {
                $limit: 50
            }
        ]);

        // Get credit consumption trends
        const consumptionTrends = [
            { date: '2024-01-01', aiCredits: 15000, emailCredits: 12000 }, // WhatsApp functionality moved to dustbin/whatsapp-dump/
            { date: '2024-01-02', aiCredits: 18000, emailCredits: 14000 }, // WhatsApp functionality moved to dustbin/whatsapp-dump/
            { date: '2024-01-03', aiCredits: 22000, emailCredits: 16000 } // WhatsApp functionality moved to dustbin/whatsapp-dump/
        ];

        res.status(200).json({
            success: true,
            data: {
                creditUsage,
                consumptionTrends,
                timeRange
            }
        });
    } catch (error) {
        console.error('Error getting credit usage:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving credit usage analytics',
            error: error.message
        });
    }
});

/**
 * @desc    Get payment settings
 * @route   GET /api/admin/financial/payment-settings
 * @access  Private (Admin)
 */
exports.getPaymentSettings = asyncHandler(async (req, res) => {
    try {
        let settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        
        if (!settings) {
            // Create default settings
            settings = new AdminSystemSettings({
                settingId: 'global'
            });
            await settings.save();
        }

        // Get payment gateway configurations
        const gateways = await PaymentGatewayConfig.find();

        res.status(200).json({
            success: true,
            message: 'Payment settings retrieved successfully',
            data: {
                paymentSystem: settings.paymentSystem || {},
                gateways: gateways
            }
        });
    } catch (error) {
        console.error('Error getting payment settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve payment settings',
            error: error.message
        });
    }
});

/**
 * @desc    Update payment settings
 * @route   PUT /api/admin/financial/payment-settings
 * @access  Private (Admin)
 */
exports.updatePaymentSettings = asyncHandler(async (req, res) => {
    try {
        const { paymentSystem } = req.body;
        const adminId = req.admin.id;

        if (!paymentSystem) {
            return res.status(400).json({
                success: false,
                message: 'Payment system data is required'
            });
        }

        let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
        
        if (!systemSettings) {
            systemSettings = new AdminSystemSettings({
                settingId: 'global'
            });
        }

        // Store previous settings for audit
        const previousSettings = JSON.parse(JSON.stringify(systemSettings.paymentSystem));

        // Update payment system settings
        systemSettings.paymentSystem = { ...systemSettings.paymentSystem, ...paymentSystem };
        systemSettings.systemStatus.lastUpdated = new Date();
        systemSettings.systemStatus.updatedBy = adminId;

        await systemSettings.save();

        res.status(200).json({
            success: true,
            message: 'Payment settings updated successfully',
            data: {
                paymentSystem: systemSettings.paymentSystem,
                changes: Object.keys(paymentSystem)
            }
        });
    } catch (error) {
        console.error('Error updating payment settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment settings',
            error: error.message
        });
    }
});

/**
 * @desc    Get commission payouts
 * @route   GET /api/admin/financial/commission-payouts
 * @access  Private (Admin)
 */
exports.getCommissionPayouts = asyncHandler(async (req, res) => {
    try {
        const { status, page = 1, limit = 20, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = { businessType: 'commission' };
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Get commission payments
        const commissionPayments = await CentralPayment.find(filter)
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const totalCount = await CentralPayment.countDocuments(filter);

        // Calculate summary stats
        const summaryStats = await CentralPayment.aggregate([
            { $match: { businessType: 'commission' } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                commissionPayments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    limit: parseInt(limit)
                },
                summaryStats
            }
        });
    } catch (error) {
        console.error('Error getting commission payouts:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving commission payouts',
            error: error.message
        });
    }
});

/**
 * @desc    Process commission payout
 * @route   POST /api/admin/financial/commission-payouts/:paymentId/process
 * @access  Private (Admin)
 */
exports.processCommissionPayout = asyncHandler(async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status, notes } = req.body;
        const adminId = req.admin.id;

        const payment = await CentralPayment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Commission payment not found'
            });
        }

        if (payment.businessType !== 'commission') {
            return res.status(400).json({
                success: false,
                message: 'This payment is not a commission payment'
            });
        }

        // Update payment status
        payment.status = status;
        payment.adminNotes = notes;
        payment.processedAt = new Date();
        payment.processedBy = adminId;

        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Commission payout processed successfully',
            data: payment
        });
    } catch (error) {
        console.error('Error processing commission payout:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing commission payout',
            error: error.message
        });
    }
});

/**
 * @desc    Get payment gateway configurations
 * @route   GET /api/admin/financial/payment-gateways
 * @access  Private (Admin)
 */
exports.getPaymentGateways = asyncHandler(async (req, res) => {
    try {
        const gateways = await PaymentGatewayConfig.find().sort({ gatewayName: 1 });

        res.status(200).json({
            success: true,
            data: gateways
        });
    } catch (error) {
        console.error('Error getting payment gateways:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment gateways',
            error: error.message
        });
    }
});

/**
 * @desc    Update payment gateway configuration
 * @route   PUT /api/admin/financial/payment-gateways/:gatewayName
 * @access  Private (Admin)
 */
exports.updatePaymentGateway = asyncHandler(async (req, res) => {
    try {
        const { gatewayName } = req.params;
        const { isEnabled, config, feeStructure } = req.body;
        const adminId = req.admin.id;

        const gateway = await PaymentGatewayConfig.findOne({ gatewayName });
        if (!gateway) {
            return res.status(404).json({
                success: false,
                message: 'Payment gateway not found'
            });
        }

        // Update gateway configuration
        if (isEnabled !== undefined) gateway.isEnabled = isEnabled;
        if (config) gateway.config = { ...gateway.config, ...config };
        if (feeStructure) gateway.feeStructure = feeStructure;
        
        gateway.lastUpdated = new Date();
        gateway.updatedBy = adminId;

        await gateway.save();

        res.status(200).json({
            success: true,
            message: 'Payment gateway updated successfully',
            data: gateway
        });
    } catch (error) {
        console.error('Error updating payment gateway:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating payment gateway',
            error: error.message
        });
    }
});

/**
 * @desc    Test payment gateway
 * @route   POST /api/admin/financial/payment-gateways/:gatewayName/test
 * @access  Private (Admin)
 */
exports.testPaymentGateway = asyncHandler(async (req, res) => {
    try {
        const { gatewayName } = req.params;
        const { testAmount = 100 } = req.body;

        const gateway = await PaymentGatewayConfig.findOne({ gatewayName });
        if (!gateway) {
            return res.status(404).json({
                success: false,
                message: 'Payment gateway not found'
            });
        }

        if (!gateway.isEnabled) {
            return res.status(400).json({
                success: false,
                message: 'Payment gateway is not enabled'
            });
        }

        // Test gateway connection based on type
        let testResult = { success: false, message: 'Gateway test not implemented' };

        switch (gatewayName.toLowerCase()) {
            case 'razorpay':
                // Test Razorpay connection
                const Razorpay = require('razorpay');
                const razorpay = new Razorpay({
                    key_id: gateway.config.keyId,
                    key_secret: gateway.config.keySecret
                });

                try {
                    // Test by creating a test order
                    const testOrder = await razorpay.orders.create({
                        amount: testAmount * 100, // Convert to paise
                        currency: 'INR',
                        receipt: `test_${Date.now()}`
                    });

                    testResult = {
                        success: true,
                        message: 'Razorpay connection successful',
                        testOrderId: testOrder.id
                    };
                } catch (error) {
                    testResult = {
                        success: false,
                        message: 'Razorpay connection failed',
                        error: error.message
                    };
                }
                break;

            case 'stripe':
                // Test Stripe connection
                const stripe = require('stripe')(gateway.config.secretKey);
                
                try {
                    const testPaymentIntent = await stripe.paymentIntents.create({
                        amount: testAmount * 100, // Convert to cents
                        currency: 'usd',
                        description: 'Test payment'
                    });

                    testResult = {
                        success: true,
                        message: 'Stripe connection successful',
                        testPaymentIntentId: testPaymentIntent.id
                    };
                } catch (error) {
                    testResult = {
                        success: false,
                        message: 'Stripe connection failed',
                        error: error.message
                    };
                }
                break;

            default:
                testResult = {
                    success: true,
                    message: `${gatewayName} gateway test completed (no specific test implemented)`
                };
        }

        res.status(200).json({
            success: true,
            data: {
                gatewayName,
                testResult,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Error testing payment gateway:', error);
        res.status(500).json({
            success: false,
            message: 'Error testing payment gateway',
            error: error.message
        });
    }
});

/**
 * @desc    Get payment analytics (enhanced with funnelseye-payments)
 * @route   GET /api/admin/financial/payment-analytics
 * @access  Private (Admin)
 */
exports.getPaymentAnalytics = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30, businessType } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        // Build filter
        const filter = { createdAt: { $gte: startDate } };
        if (businessType) filter.businessType = businessType;

        // Get payment statistics
        const paymentStats = await CentralPayment.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    averageAmount: { $avg: '$amount' }
                }
            }
        ]);

        // Get business type breakdown
        const businessTypeStats = await CentralPayment.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$businessType',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        // Get gateway performance
        const gatewayStats = await CentralPayment.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    successRate: {
                        $avg: {
                            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        // Get daily trends
        const dailyTrends = await CentralPayment.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                paymentStats,
                businessTypeStats,
                gatewayStats,
                dailyTrends,
                timeRange: parseInt(timeRange)
            }
        });
    } catch (error) {
        console.error('Error getting payment analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment analytics',
            error: error.message
        });
    }
});
