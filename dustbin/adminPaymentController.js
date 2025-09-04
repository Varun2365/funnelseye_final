const { AdminSystemSettings, AdminUser, AdminAuditLog, CentralPaymentHandler, MlmCommissionDistribution, CoachPlan } = require('../schema');

// ===== ADMIN PAYMENT CONTROLLER =====

class AdminPaymentController {

    // Create audit log
    async createAuditLog(adminId, action, details, req) {
        try {
            const admin = await AdminUser.findById(adminId);
            if (!admin) return;

            await AdminAuditLog.create({
                adminId,
                adminEmail: admin.email,
                adminRole: admin.role,
                action,
                category: 'PAYMENT_MANAGEMENT',
                description: details.description,
                severity: details.severity || 'medium',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                endpoint: req.originalUrl,
                method: req.method,
                status: details.status || 'success',
                errorMessage: details.errorMessage,
                changes: details.changes
            });
        } catch (error) {
            console.error('Error creating audit log:', error);
        }
    }

    // @desc    Get payment settings
    // @route   GET /api/admin/payment/settings
    // @access  Private (Admin)
    async getPaymentSettings(req, res) {
        try {
            let settings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!settings) {
                // Create default settings
                settings = new AdminSystemSettings({
                    settingId: 'global'
                });
                await settings.save();
            }

            res.json({
                success: true,
                message: 'Payment settings retrieved successfully',
                data: settings.paymentSystem
            });

        } catch (error) {
            console.error('Error getting payment settings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve payment settings',
                error: error.message
            });
        }
    }

    // @desc    Update payment settings
    // @route   PUT /api/admin/payment/settings
    // @access  Private (Admin)
    async updatePaymentSettings(req, res) {
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

            // Create audit log
            const changedFields = Object.keys(paymentSystem);
            await this.createAuditLog(adminId, 'UPDATE_PAYMENT_SETTINGS', {
                description: `Payment settings updated: ${changedFields.join(', ')}`,
                severity: 'high',
                status: 'success',
                changes: {
                    before: previousSettings,
                    after: systemSettings.paymentSystem,
                    fieldsChanged: changedFields
                }
            }, req);

            res.json({
                success: true,
                message: 'Payment settings updated successfully',
                data: systemSettings.paymentSystem
            });

        } catch (error) {
            console.error('Error updating payment settings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update payment settings',
                error: error.message
            });
        }
    }

    // @desc    Update platform fees
    // @route   PUT /api/admin/payment/platform-fees
    // @access  Private (Admin)
    async updatePlatformFees(req, res) {
        try {
            const { platformFees } = req.body;
            const adminId = req.admin.id;

            if (!platformFees) {
                return res.status(400).json({
                    success: false,
                    message: 'Platform fees data is required'
                });
            }

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({
                    settingId: 'global'
                });
            }

            // Store previous settings for audit
            const previousFees = JSON.parse(JSON.stringify(systemSettings.paymentSystem.platformFees));

            // Update platform fees
            systemSettings.paymentSystem.platformFees = { 
                ...systemSettings.paymentSystem.platformFees, 
                ...platformFees 
            };
            systemSettings.systemStatus.lastUpdated = new Date();
            systemSettings.systemStatus.updatedBy = adminId;

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_PAYMENT_SETTINGS', {
                description: 'Platform fees updated',
                severity: 'high',
                status: 'success',
                changes: {
                    before: previousFees,
                    after: systemSettings.paymentSystem.platformFees,
                    fieldsChanged: Object.keys(platformFees)
                }
            }, req);

            res.json({
                success: true,
                message: 'Platform fees updated successfully',
                data: systemSettings.paymentSystem.platformFees
            });

        } catch (error) {
            console.error('Error updating platform fees:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update platform fees',
                error: error.message
            });
        }
    }

    // @desc    Update MLM commission structure
    // @route   PUT /api/admin/payment/mlm-commissions
    // @access  Private (Admin)
    async updateMlmCommissions(req, res) {
        try {
            const { mlmCommissionStructure } = req.body;
            const adminId = req.admin.id;

            if (!mlmCommissionStructure) {
                return res.status(400).json({
                    success: false,
                    message: 'MLM commission structure data is required'
                });
            }

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({
                    settingId: 'global'
                });
            }

            // Store previous settings for audit
            const previousCommissions = JSON.parse(JSON.stringify(systemSettings.paymentSystem.mlmCommissionStructure));

            // Update MLM commission structure
            systemSettings.paymentSystem.mlmCommissionStructure = { 
                ...systemSettings.paymentSystem.mlmCommissionStructure, 
                ...mlmCommissionStructure 
            };
            systemSettings.systemStatus.lastUpdated = new Date();
            systemSettings.systemStatus.updatedBy = adminId;

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_MLM_SETTINGS', {
                description: 'MLM commission structure updated',
                severity: 'high',
                status: 'success',
                changes: {
                    before: previousCommissions,
                    after: systemSettings.paymentSystem.mlmCommissionStructure,
                    fieldsChanged: Object.keys(mlmCommissionStructure)
                }
            }, req);

            res.json({
                success: true,
                message: 'MLM commission structure updated successfully',
                data: systemSettings.paymentSystem.mlmCommissionStructure
            });

        } catch (error) {
            console.error('Error updating MLM commissions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update MLM commission structure',
                error: error.message
            });
        }
    }

    // @desc    Update payout settings
    // @route   PUT /api/admin/payment/payout-settings
    // @access  Private (Admin)
    async updatePayoutSettings(req, res) {
        try {
            const { payoutSettings } = req.body;
            const adminId = req.admin.id;

            if (!payoutSettings) {
                return res.status(400).json({
                    success: false,
                    message: 'Payout settings data is required'
                });
            }

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({
                    settingId: 'global'
                });
            }

            // Store previous settings for audit
            const previousPayouts = JSON.parse(JSON.stringify(systemSettings.paymentSystem.payoutSettings));

            // Update payout settings
            systemSettings.paymentSystem.payoutSettings = { 
                ...systemSettings.paymentSystem.payoutSettings, 
                ...payoutSettings 
            };
            systemSettings.systemStatus.lastUpdated = new Date();
            systemSettings.systemStatus.updatedBy = adminId;

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_PAYMENT_SETTINGS', {
                description: 'Payout settings updated',
                severity: 'high',
                status: 'success',
                changes: {
                    before: previousPayouts,
                    after: systemSettings.paymentSystem.payoutSettings,
                    fieldsChanged: Object.keys(payoutSettings)
                }
            }, req);

            res.json({
                success: true,
                message: 'Payout settings updated successfully',
                data: systemSettings.paymentSystem.payoutSettings
            });

        } catch (error) {
            console.error('Error updating payout settings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update payout settings',
                error: error.message
            });
        }
    }

    // @desc    Update payment gateway settings
    // @route   PUT /api/admin/payment/gateway-settings
    // @access  Private (Admin)
    async updateGatewaySettings(req, res) {
        try {
            const { paymentGateways } = req.body;
            const adminId = req.admin.id;

            if (!paymentGateways) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment gateway settings data is required'
                });
            }

            let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            if (!systemSettings) {
                systemSettings = new AdminSystemSettings({
                    settingId: 'global'
                });
            }

            // Store previous settings for audit
            const previousGateways = JSON.parse(JSON.stringify(systemSettings.paymentSystem.paymentGateways));

            // Update payment gateway settings
            systemSettings.paymentSystem.paymentGateways = { 
                ...systemSettings.paymentSystem.paymentGateways, 
                ...paymentGateways 
            };
            systemSettings.systemStatus.lastUpdated = new Date();
            systemSettings.systemStatus.updatedBy = adminId;

            await systemSettings.save();

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_PAYMENT_SETTINGS', {
                description: 'Payment gateway settings updated',
                severity: 'high',
                status: 'success',
                changes: {
                    before: previousGateways,
                    after: systemSettings.paymentSystem.paymentGateways,
                    fieldsChanged: Object.keys(paymentGateways)
                }
            }, req);

            res.json({
                success: true,
                message: 'Payment gateway settings updated successfully',
                data: systemSettings.paymentSystem.paymentGateways
            });

        } catch (error) {
            console.error('Error updating gateway settings:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update payment gateway settings',
                error: error.message
            });
        }
    }

    // @desc    Get payment analytics
    // @route   GET /api/admin/payment/analytics
    // @access  Private (Admin)
    async getPaymentAnalytics(req, res) {
        try {
            const { period = '30' } = req.query;
            const days = parseInt(period);
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            // Payment statistics
            const paymentStats = await CentralPaymentHandler.aggregate([
                {
                    $match: { createdAt: { $gte: startDate } }
                },
                {
                    $group: {
                        _id: null,
                        totalTransactions: { $sum: 1 },
                        totalGrossAmount: { $sum: '$grossAmount' },
                        totalPlatformFees: { $sum: '$platformFee' },
                        totalNetAmount: { $sum: '$netAmount' },
                        successfulTransactions: {
                            $sum: { $cond: [{ $eq: ['$status', 'successful'] }, 1, 0] }
                        },
                        failedTransactions: {
                            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                        },
                        refundedTransactions: {
                            $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
                        }
                    }
                }
            ]);

            // Payment by source type
            const paymentBySource = await CentralPaymentHandler.aggregate([
                {
                    $match: { 
                        createdAt: { $gte: startDate },
                        status: 'successful'
                    }
                },
                {
                    $group: {
                        _id: '$sourceType',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$grossAmount' },
                        totalFees: { $sum: '$platformFee' }
                    }
                },
                { $sort: { totalAmount: -1 } }
            ]);

            // Payment by gateway
            const paymentByGateway = await CentralPaymentHandler.aggregate([
                {
                    $match: { 
                        createdAt: { $gte: startDate },
                        status: 'successful'
                    }
                },
                {
                    $group: {
                        _id: '$paymentGateway',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$grossAmount' }
                    }
                },
                { $sort: { totalAmount: -1 } }
            ]);

            // Commission distribution statistics
            const commissionStats = await MlmCommissionDistribution.aggregate([
                {
                    $match: { createdAt: { $gte: startDate } }
                },
                {
                    $group: {
                        _id: null,
                        totalDistributions: { $sum: 1 },
                        totalCommissions: { $sum: '$summary.totalCommissionAmount' },
                        paidCommissions: {
                            $sum: { $cond: [{ $eq: ['$processingStatus', 'completed'] }, '$summary.totalCommissionAmount', 0] }
                        },
                        pendingCommissions: {
                            $sum: { $cond: [{ $eq: ['$processingStatus', 'pending'] }, '$summary.totalCommissionAmount', 0] }
                        }
                    }
                }
            ]);

            // Daily payment trends
            const dailyTrends = await CentralPaymentHandler.aggregate([
                {
                    $match: { 
                        createdAt: { $gte: startDate },
                        status: 'successful'
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$grossAmount' },
                        totalFees: { $sum: '$platformFee' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
            ]);

            // Top performing coaches by revenue
            const topCoaches = await CentralPaymentHandler.aggregate([
                {
                    $match: { 
                        createdAt: { $gte: startDate },
                        status: 'successful',
                        coachId: { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: '$coachId',
                        totalRevenue: { $sum: '$grossAmount' },
                        transactionCount: { $sum: 1 },
                        totalFees: { $sum: '$platformFee' }
                    }
                },
                { $sort: { totalRevenue: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'coach'
                    }
                },
                { $unwind: '$coach' },
                {
                    $project: {
                        coachId: '$_id',
                        coachName: { $concat: ['$coach.firstName', ' ', '$coach.lastName'] },
                        coachEmail: '$coach.email',
                        totalRevenue: 1,
                        transactionCount: 1,
                        totalFees: 1
                    }
                }
            ]);

            const analytics = {
                overview: paymentStats[0] || {
                    totalTransactions: 0,
                    totalGrossAmount: 0,
                    totalPlatformFees: 0,
                    totalNetAmount: 0,
                    successfulTransactions: 0,
                    failedTransactions: 0,
                    refundedTransactions: 0
                },
                paymentBySource,
                paymentByGateway,
                commissionStats: commissionStats[0] || {
                    totalDistributions: 0,
                    totalCommissions: 0,
                    paidCommissions: 0,
                    pendingCommissions: 0
                },
                dailyTrends,
                topCoaches,
                period: days
            };

            res.json({
                success: true,
                message: 'Payment analytics retrieved successfully',
                data: analytics
            });

        } catch (error) {
            console.error('Error getting payment analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve payment analytics',
                error: error.message
            });
        }
    }

    // @desc    Get payment transactions
    // @route   GET /api/admin/payment/transactions
    // @access  Private (Admin)
    async getPaymentTransactions(req, res) {
        try {
            const { 
                page = 1, 
                limit = 50, 
                status, 
                sourceType, 
                paymentGateway,
                startDate,
                endDate,
                search
            } = req.query;

            const query = {};
            
            if (status) query.status = status;
            if (sourceType) query.sourceType = sourceType;
            if (paymentGateway) query.paymentGateway = paymentGateway;
            if (search) {
                query.$or = [
                    { transactionId: { $regex: search, $options: 'i' } },
                    { 'customerId': { $regex: search, $options: 'i' } }
                ];
            }
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            const transactions = await CentralPaymentHandler.find(query)
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate('customerId', 'firstName lastName email')
                .populate('coachId', 'firstName lastName email')
                .populate('planId', 'title price currency')
                .select('-commissionDistribution -refundInfo -payoutInfo'); // Exclude sensitive data

            const total = await CentralPaymentHandler.countDocuments(query);

            res.json({
                success: true,
                message: 'Payment transactions retrieved successfully',
                data: {
                    transactions,
                    pagination: {
                        current: page,
                        pages: Math.ceil(total / limit),
                        total
                    }
                }
            });

        } catch (error) {
            console.error('Error getting payment transactions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve payment transactions',
                error: error.message
            });
        }
    }

    // @desc    Get commission distributions
    // @route   GET /api/admin/payment/commissions
    // @access  Private (Admin)
    async getCommissionDistributions(req, res) {
        try {
            const { 
                page = 1, 
                limit = 50, 
                processingStatus, 
                payoutSchedule,
                startDate,
                endDate,
                search
            } = req.query;

            const query = {};
            
            if (processingStatus) query.processingStatus = processingStatus;
            if (payoutSchedule) query.payoutSchedule = payoutSchedule;
            if (search) {
                query.$or = [
                    { distributionId: { $regex: search, $options: 'i' } },
                    { sourceTransactionId: { $regex: search, $options: 'i' } }
                ];
            }
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            const distributions = await MlmCommissionDistribution.find(query)
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate('sourceTransaction', 'transactionId grossAmount currency')
                .select('-commissionEntries -commissionStructure'); // Exclude detailed data

            const total = await MlmCommissionDistribution.countDocuments(query);

            res.json({
                success: true,
                message: 'Commission distributions retrieved successfully',
                data: {
                    distributions,
                    pagination: {
                        current: page,
                        pages: Math.ceil(total / limit),
                        total
                    }
                }
            });

        } catch (error) {
            console.error('Error getting commission distributions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve commission distributions',
                error: error.message
            });
        }
    }

    // @desc    Test payment gateway
    // @route   POST /api/admin/payment/test-gateway
    // @access  Private (Admin)
    async testPaymentGateway(req, res) {
        try {
            const { gateway, config } = req.body;
            const adminId = req.admin.id;

            if (!gateway || !config) {
                return res.status(400).json({
                    success: false,
                    message: 'Gateway and config are required'
                });
            }

            // This would contain actual gateway testing logic
            // For now, we'll simulate the test
            const testResult = {
                gateway,
                status: 'success',
                message: `${gateway} gateway test successful`,
                responseTime: Math.random() * 1000,
                timestamp: new Date()
            };

            // Create audit log
            await this.createAuditLog(adminId, 'TEST_PAYMENT_GATEWAY', {
                description: `Tested ${gateway} payment gateway`,
                severity: 'low',
                status: 'success',
                changes: {
                    gateway,
                    testResult
                }
            }, req);

            res.json({
                success: true,
                message: 'Payment gateway test completed',
                data: testResult
            });

        } catch (error) {
            console.error('Error testing payment gateway:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to test payment gateway',
                error: error.message
            });
        }
    }
}

module.exports = new AdminPaymentController();
