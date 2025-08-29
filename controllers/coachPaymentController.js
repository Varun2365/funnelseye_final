const CoachPayment = require('../schema/CoachPayment');
const User = require('../schema/User');

// ===== COACH PAYMENT COLLECTION SETTINGS =====

/**
 * @route   POST /api/coach-payments/setup-payment-collection
 * @desc    Setup payment collection settings for a coach
 * @access  Private (Coach/Admin)
 */
exports.setupPaymentCollection = async (req, res) => {
    try {
        const { upiId, bankAccount, paymentCollectionMethod } = req.body;
        const coachId = req.user.role === 'admin' ? req.body.coachId : req.user._id;

        // Validate required fields
        if (!upiId && !bankAccount) {
            return res.status(400).json({
                success: false,
                message: 'Either UPI ID or bank account details are required'
            });
        }

        if (paymentCollectionMethod === 'bank_transfer' && (!bankAccount?.accountNumber || !bankAccount?.ifscCode)) {
            return res.status(400).json({
                success: false,
                message: 'Bank account number and IFSC code are required for bank transfer method'
            });
        }

        // Find and update coach
        const coach = await User.findById(coachId);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        // Update payment collection settings
        coach.paymentCollection = {
            upiId: upiId || null,
            bankAccount: bankAccount || null,
            isPaymentCollectionEnabled: true,
            paymentCollectionMethod: paymentCollectionMethod || 'upi'
        };

        await coach.save();

        res.status(200).json({
            success: true,
            message: 'Payment collection settings updated successfully',
            data: {
                paymentCollection: coach.paymentCollection
            }
        });
    } catch (error) {
        console.error('Error setting up payment collection:', error);
        res.status(500).json({
            success: false,
            message: 'Error setting up payment collection',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/coach-payments/payment-settings
 * @desc    Get coach's payment collection settings
 * @access  Private (Coach/Admin)
 */
exports.getPaymentSettings = async (req, res) => {
    try {
        const coachId = req.user.role === 'admin' ? req.params.coachId : req.user._id;

        const coach = await User.findById(coachId).select('paymentCollection');
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                paymentCollection: coach.paymentCollection
            }
        });
    } catch (error) {
        console.error('Error fetching payment settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment settings',
            error: error.message
        });
    }
};

// ===== COACH PAYMENTS =====

/**
 * @route   POST /api/coach-payments/create-payment
 * @desc    Create a new payment for a coach (Admin only)
 * @access  Private (Admin)
 */
exports.createPayment = async (req, res) => {
    try {
        const { coachId, amount, currency, paymentType, description, reference, metadata, notes } = req.body;

        // Validate required fields
        if (!coachId || !amount || !paymentType || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: coachId, amount, paymentType, description'
            });
        }

        // Check if coach exists and has payment collection enabled
        const coach = await User.findById(coachId);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        if (!coach.paymentCollection?.isPaymentCollectionEnabled) {
            return res.status(400).json({
                success: false,
                message: 'Coach has not enabled payment collection'
            });
        }

        // Create payment
        const payment = new CoachPayment({
            coachId,
            amount,
            currency: currency || 'INR',
            paymentMethod: 'centralized_system',
            paymentType,
            description,
            reference,
            metadata,
            notes,
            createdBy: req.user._id,
            processingDetails: {
                initiatedAt: new Date()
            }
        });

        await payment.save();

        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: payment
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/coach-payments/my-payments
 * @desc    Get coach's payment history
 * @access  Private (Coach)
 */
exports.getMyPayments = async (req, res) => {
    try {
        const { status, paymentType, page = 1, limit = 20 } = req.query;
        const coachId = req.user._id;

        let query = { coachId };
        
        if (status) {
            query.status = status;
        }
        
        if (paymentType) {
            query.paymentType = paymentType;
        }

        const skip = (page - 1) * limit;
        
        const payments = await CoachPayment.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await CoachPayment.countDocuments(query);

        res.status(200).json({
            success: true,
            count: payments.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            data: payments
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payments',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/coach-payments/coach/:coachId
 * @desc    Get specific coach's payments (Admin only)
 * @access  Private (Admin)
 */
exports.getCoachPayments = async (req, res) => {
    try {
        const { coachId } = req.params;
        const { status, paymentType, page = 1, limit = 20 } = req.query;

        let query = { coachId };
        
        if (status) {
            query.status = status;
        }
        
        if (paymentType) {
            query.paymentType = paymentType;
        }

        const skip = (page - 1) * limit;
        
        const payments = await CoachPayment.find(query)
            .populate('coachId', 'name email company')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await CoachPayment.countDocuments(query);

        res.status(200).json({
            success: true,
            count: payments.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            data: payments
        });
    } catch (error) {
        console.error('Error fetching coach payments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching coach payments',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/coach-payments/:paymentId/process
 * @desc    Process a payment (Admin only)
 * @access  Private (Admin)
 */
exports.processPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { action, transactionId, notes } = req.body;

        const payment = await CoachPayment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        switch (action) {
            case 'process':
                await payment.markAsProcessed(req.user._id);
                break;
            case 'complete':
                await payment.markAsCompleted(transactionId);
                break;
            case 'fail':
                if (!notes) {
                    return res.status(400).json({
                        success: false,
                        message: 'Failure reason is required'
                    });
                }
                await payment.markAsFailed(notes);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action. Use: process, complete, or fail'
                });
        }

        res.status(200).json({
            success: true,
            message: `Payment ${action}ed successfully`,
            data: payment
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payment',
            error: error.message
        });
    }
};

// ===== PAYMENT ANALYTICS =====

/**
 * @route   GET /api/coach-payments/analytics
 * @desc    Get payment analytics for a coach
 * @access  Private (Coach/Admin)
 */
exports.getPaymentAnalytics = async (req, res) => {
    try {
        const coachId = req.user.role === 'admin' ? req.params.coachId : req.user._id;
        const { period } = req.query;

        let periodFilter = null;
        if (period === 'month') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            periodFilter = { startDate: startOfMonth, endDate: endOfMonth };
        } else if (period === 'year') {
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31);
            periodFilter = { startDate: startOfYear, endDate: endOfYear };
        }

        const stats = await CoachPayment.getCoachPaymentStats(coachId, periodFilter);

        // Get recent payments
        const recentPayments = await CoachPayment.find({ coachId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('amount status paymentType createdAt');

        res.status(200).json({
            success: true,
            data: {
                stats,
                recentPayments,
                period: periodFilter
            }
        });
    } catch (error) {
        console.error('Error fetching payment analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment analytics',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/coach-payments/admin/analytics
 * @desc    Get overall payment analytics (Admin only)
 * @access  Private (Admin)
 */
exports.getAdminPaymentAnalytics = async (req, res) => {
    try {
        const { period } = req.query;

        let periodFilter = null;
        if (period === 'month') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            periodFilter = { startDate: startOfMonth, endDate: endOfMonth };
        } else if (period === 'year') {
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31);
            periodFilter = { startDate: startOfYear, endDate: endOfYear };
        }

        let query = {};
        if (periodFilter) {
            query.createdAt = {
                $gte: periodFilter.startDate,
                $lte: periodFilter.endDate
            };
        }

        const stats = await CoachPayment.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        const totalStats = await CoachPayment.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalPayments: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    uniqueCoaches: { $addToSet: '$coachId' }
                }
            }
        ]);

        const result = {
            totalPayments: totalStats[0]?.totalPayments || 0,
            totalAmount: totalStats[0]?.totalAmount || 0,
            uniqueCoaches: totalStats[0]?.uniqueCoaches?.length || 0,
            byStatus: {},
            period: periodFilter
        };

        stats.forEach(stat => {
            result.byStatus[stat._id] = {
                count: stat.count,
                amount: stat.totalAmount
            };
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching admin payment analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin payment analytics',
            error: error.message
        });
    }
};
