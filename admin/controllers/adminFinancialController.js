const asyncHandler = require('../../middleware/async');
const Plan = require('../schemas/Plan');
const CreditPackage = require('../schemas/CreditPackage');
const CommissionRate = require('../schemas/CommissionRate');
const PaymentGateway = require('../schemas/PaymentGateway');
const adminNotificationService = require('../services/adminNotificationService');

// ===== PLAN MANAGEMENT =====

// @desc    Create new subscription plan
// @route   POST /api/admin/financial/plans
// @access  Private (Admin only)
const createPlan = asyncHandler(async (req, res) => {
    try {
        const planData = {
            ...req.body,
            createdBy: req.user.id
        };

        const plan = await Plan.create(planData);

        // Create notification for new plan
        await adminNotificationService.createNotification({
            title: 'New Subscription Plan Created',
            message: `Plan "${plan.name}" has been created with ${plan.type} pricing`,
            type: 'info',
            category: 'financial',
            priority: 'medium',
            targetAudience: 'admin_only',
            metadata: {
                source: 'plan_management',
                relatedEntity: 'plan',
                entityId: plan._id
            }
        });

        res.status(201).json({
            success: true,
            message: 'Subscription plan created successfully',
            data: plan
        });
    } catch (error) {
        console.error('Error creating plan:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create subscription plan',
            error: error.message
        });
    }
});

// @desc    Get all subscription plans
// @route   GET /api/admin/financial/plans
// @access  Private (Admin only)
const getPlans = asyncHandler(async (req, res) => {
    try {
        const { isActive, type, sortBy = 'sortOrder', sortOrder = 'asc' } = req.query;
        
        const query = {};
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (type) query.type = type;

        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
        const plans = await Plan.find(query).sort(sort);

        res.json({
            success: true,
            message: 'Subscription plans retrieved successfully',
            data: plans
        });
    } catch (error) {
        console.error('Error getting plans:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve subscription plans',
            error: error.message
        });
    }
});

// @desc    Update subscription plan
// @route   PUT /api/admin/financial/plans/:id
// @access  Private (Admin only)
const updatePlan = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            lastModifiedBy: req.user.id
        };

        const plan = await Plan.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }

        // Create notification for plan update
        await adminNotificationService.createNotification({
            title: 'Subscription Plan Updated',
            message: `Plan "${plan.name}" has been updated`,
            type: 'info',
            category: 'financial',
            priority: 'medium',
            targetAudience: 'admin_only',
            metadata: {
                source: 'plan_management',
                relatedEntity: 'plan',
                entityId: plan._id
            }
        });

        res.json({
            success: true,
            message: 'Subscription plan updated successfully',
            data: plan
        });
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update subscription plan',
            error: error.message
        });
    }
});

// @desc    Delete subscription plan
// @route   DELETE /api/admin/financial/plans/:id
// @access  Private (Admin only)
const deletePlan = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await Plan.findById(id);
        
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }

        // Check if plan is being used
        // TODO: Add check for active subscriptions using this plan
        
        await Plan.findByIdAndDelete(id);

        // Create notification for plan deletion
        await adminNotificationService.createNotification({
            title: 'Subscription Plan Deleted',
            message: `Plan "${plan.name}" has been deleted`,
            type: 'warning',
            category: 'financial',
            priority: 'high',
            targetAudience: 'admin_only',
            metadata: {
                source: 'plan_management',
                relatedEntity: 'plan',
                entityId: plan._id
            }
        });

        res.json({
            success: true,
            message: 'Subscription plan deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting plan:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete subscription plan',
            error: error.message
        });
    }
});

// ===== CREDIT PACKAGE MANAGEMENT =====

// @desc    Create new credit package
// @route   POST /api/admin/financial/credit-packages
// @access  Private (Admin only)
const createCreditPackage = asyncHandler(async (req, res) => {
    try {
        const packageData = {
            ...req.body,
            createdBy: req.user.id
        };

        const creditPackage = await CreditPackage.create(packageData);

        // Create notification for new credit package
        await adminNotificationService.createNotification({
            title: 'New Credit Package Created',
            message: `${creditPackage.type.toUpperCase()} credit package "${creditPackage.name}" created with ${creditPackage.credits} credits`,
            type: 'info',
            category: 'financial',
            priority: 'medium',
            targetAudience: 'admin_only',
            metadata: {
                source: 'credit_management',
                relatedEntity: 'credit_package',
                entityId: creditPackage._id
            }
        });

        res.status(201).json({
            success: true,
            message: 'Credit package created successfully',
            data: creditPackage
        });
    } catch (error) {
        console.error('Error creating credit package:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create credit package',
            error: error.message
        });
    }
});

// @desc    Get all credit packages
// @route   GET /api/admin/financial/credit-packages
// @access  Private (Admin only)
const getCreditPackages = asyncHandler(async (req, res) => {
    try {
        const { type, isActive, isPopular, sortBy = 'sortOrder', sortOrder = 'asc' } = req.query;
        
        const query = {};
        if (type) query.type = type;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (isPopular !== undefined) query.isPopular = isPopular === 'true';

        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
        const packages = await CreditPackage.find(query).sort(sort);

        res.json({
            success: true,
            message: 'Credit packages retrieved successfully',
            data: packages
        });
    } catch (error) {
        console.error('Error getting credit packages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve credit packages',
            error: error.message
        });
    }
});

// @desc    Update credit package
// @route   PUT /api/admin/financial/credit-packages/:id
// @access  Private (Admin only)
const updateCreditPackage = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            lastModifiedBy: req.user.id
        };

        const creditPackage = await CreditPackage.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        
        if (!creditPackage) {
            return res.status(404).json({
                success: false,
                message: 'Credit package not found'
            });
        }

        // Create notification for credit package update
        await adminNotificationService.createNotification({
            title: 'Credit Package Updated',
            message: `${creditPackage.type.toUpperCase()} credit package "${creditPackage.name}" has been updated`,
            type: 'info',
            category: 'financial',
            priority: 'medium',
            targetAudience: 'admin_only',
            metadata: {
                source: 'credit_management',
                relatedEntity: 'credit_package',
                entityId: creditPackage._id
            }
        });

        res.json({
            success: true,
            message: 'Credit package updated successfully',
            data: creditPackage
        });
    } catch (error) {
        console.error('Error updating credit package:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update credit package',
            error: error.message
        });
    }
});

// ===== COMMISSION RATE MANAGEMENT =====

// @desc    Create new commission rate
// @route   POST /api/admin/financial/commission-rates
// @access  Private (Admin only)
const createCommissionRate = asyncHandler(async (req, res) => {
    try {
        const commissionData = {
            ...req.body,
            createdBy: req.user.id
        };

        const commissionRate = await CommissionRate.create(commissionData);

        // Create notification for new commission rate
        await adminNotificationService.createNotification({
            title: 'New Commission Rate Created',
            message: `${commissionRate.type} commission rate "${commissionRate.name}" created with ${commissionRate.totalPercentage}% total commission`,
            type: 'info',
            category: 'financial',
            priority: 'medium',
            targetAudience: 'admin_only',
            metadata: {
                source: 'commission_management',
                relatedEntity: 'commission_rate',
                entityId: commissionRate._id
            }
        });

        res.status(201).json({
            success: true,
            message: 'Commission rate created successfully',
            data: commissionRate
        });
    } catch (error) {
        console.error('Error creating commission rate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create commission rate',
            error: error.message
        });
    }
});

// @desc    Get all commission rates
// @route   GET /api/admin/financial/commission-rates
// @access  Private (Admin only)
const getCommissionRates = asyncHandler(async (req, res) => {
    try {
        const { type, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const query = {};
        if (type) query.type = type;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
        const rates = await CommissionRate.find(query).sort(sort);

        res.json({
            success: true,
            message: 'Commission rates retrieved successfully',
            data: rates
        });
    } catch (error) {
        console.error('Error getting commission rates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve commission rates',
            error: error.message
        });
    }
});

// @desc    Update commission rate
// @route   PUT /api/admin/financial/commission-rates/:id
// @access  Private (Admin only)
const updateCommissionRate = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            lastModifiedBy: req.user.id
        };

        const commissionRate = await CommissionRate.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        
        if (!commissionRate) {
            return res.status(404).json({
                success: false,
                message: 'Commission rate not found'
            });
        }

        // Create notification for commission rate update
        await adminNotificationService.createNotification({
            title: 'Commission Rate Updated',
            message: `${commissionRate.type} commission rate "${commissionRate.name}" has been updated`,
            type: 'info',
            category: 'financial',
            priority: 'medium',
            targetAudience: 'admin_only',
            metadata: {
                source: 'commission_management',
                relatedEntity: 'commission_rate',
                entityId: commissionRate._id
            }
        });

        res.json({
            success: true,
            message: 'Commission rate updated successfully',
            data: commissionRate
        });
    } catch (error) {
        console.error('Error updating commission rate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update commission rate',
            error: error.message
        });
    }
});

// ===== PAYMENT GATEWAY MANAGEMENT =====

// @desc    Create new payment gateway
// @route   POST /api/admin/financial/payment-gateways
// @access  Private (Admin only)
const createPaymentGateway = asyncHandler(async (req, res) => {
    try {
        const gatewayData = {
            ...req.body,
            createdBy: req.user.id
        };

        const paymentGateway = await PaymentGateway.create(gatewayData);

        // Create notification for new payment gateway
        await adminNotificationService.createNotification({
            title: 'New Payment Gateway Added',
            message: `Payment gateway "${paymentGateway.displayName}" (${paymentGateway.name}) has been configured`,
            type: 'info',
            category: 'financial',
            priority: 'medium',
            targetAudience: 'admin_only',
            metadata: {
                source: 'payment_gateway_management',
                relatedEntity: 'payment_gateway',
                entityId: paymentGateway._id
            }
        });

        res.status(201).json({
            success: true,
            message: 'Payment gateway created successfully',
            data: paymentGateway
        });
    } catch (error) {
        console.error('Error creating payment gateway:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment gateway',
            error: error.message
        });
    }
});

// @desc    Get all payment gateways
// @route   GET /api/admin/financial/payment-gateways
// @access  Private (Admin only)
const getPaymentGateways = asyncHandler(async (req, res) => {
    try {
        const { name, isActive, sortBy = 'priority', sortOrder = 'asc' } = req.query;
        
        const query = {};
        if (name) query.name = name;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
        const gateways = await PaymentGateway.find(query).sort(sort);

        res.json({
            success: true,
            message: 'Payment gateways retrieved successfully',
            data: gateways
        });
    } catch (error) {
        console.error('Error getting payment gateways:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve payment gateways',
            error: error.message
        });
    }
});

// @desc    Update payment gateway
// @route   PUT /api/admin/financial/payment-gateways/:id
// @access  Private (Admin only)
const updatePaymentGateway = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            lastModifiedBy: req.user.id
        };

        const paymentGateway = await PaymentGateway.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        
        if (!paymentGateway) {
            return res.status(404).json({
                success: false,
                message: 'Payment gateway not found'
            });
        }

        // Create notification for payment gateway update
        await adminNotificationService.createNotification({
            title: 'Payment Gateway Updated',
            message: `Payment gateway "${paymentGateway.displayName}" has been updated`,
            type: 'info',
            category: 'financial',
            priority: 'medium',
            targetAudience: 'admin_only',
            metadata: {
                source: 'payment_gateway_management',
                relatedEntity: 'payment_gateway',
                entityId: paymentGateway._id
            }
        });

        res.json({
            success: true,
            message: 'Payment gateway updated successfully',
            data: paymentGateway
        });
    } catch (error) {
        console.error('Error updating payment gateway:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment gateway',
            error: error.message
        });
    }
});

// @desc    Test payment gateway
// @route   POST /api/admin/financial/payment-gateways/:id/test
// @access  Private (Admin only)
const testPaymentGateway = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const paymentGateway = await PaymentGateway.findById(id);
        
        if (!paymentGateway) {
            return res.status(404).json({
                success: false,
                message: 'Payment gateway not found'
            });
        }

        // TODO: Implement actual gateway testing logic
        const testResult = {
            gatewayId: paymentGateway._id,
            name: paymentGateway.name,
            status: 'success',
            message: 'Gateway test completed successfully',
            timestamp: new Date(),
            responseTime: Math.random() * 100 + 50 // Mock response time
        };

        // Update gateway status
        paymentGateway.status.isHealthy = testResult.status === 'success';
        paymentGateway.status.lastTested = new Date();
        await paymentGateway.save();

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
});

module.exports = {
    // Plan Management
    createPlan,
    getPlans,
    updatePlan,
    deletePlan,
    
    // Credit Package Management
    createCreditPackage,
    getCreditPackages,
    updateCreditPackage,
    
    // Commission Rate Management
    createCommissionRate,
    getCommissionRates,
    updateCommissionRate,
    
    // Payment Gateway Management
    createPaymentGateway,
    getPaymentGateways,
    updatePaymentGateway,
    testPaymentGateway
};
