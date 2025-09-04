// D:\PRJ_YCT_Final\routes\subscriptionRoutes.js

const express = require('express');
const router = express.Router();
const {
    // Subscription Plans
    createPlan,
    getPlans,
    updatePlan,
    deletePlan,
    
    // Coach Subscriptions
    subscribeCoach,
    renewSubscription,
    cancelSubscription,
    getMySubscription,
    getCoachSubscription,
    getAllSubscriptions,
    
    // Admin Utilities
    getSubscriptionAnalytics,
    sendReminders,
    disableExpiredSubscriptions
} = require('../controllers/subscriptionController');

const { protect, authorizeCoach, authorizeAdmin } = require('../middleware/auth');
const { verifyAdminToken, checkAdminPermission } = require('../middleware/adminAuth');
const SubscriptionPlan = require('../schema/SubscriptionPlan');
const CoachSubscription = require('../schema/CoachSubscription');
const subscriptionService = require('../services/subscriptionService');

// ===== SUBSCRIPTION PLANS =====

// Public routes
router.get('/plans', getPlans);

// Admin only routes
router.post('/plans', verifyAdminToken, checkAdminPermission('systemSettings'), createPlan);
router.put('/plans/:id', verifyAdminToken, checkAdminPermission('systemSettings'), updatePlan);
router.delete('/plans/:id', verifyAdminToken, checkAdminPermission('systemSettings'), deletePlan);

// ===== COACH SUBSCRIPTIONS =====

// Coach routes
router.post('/subscribe', protect, authorizeCoach('coach'), subscribeCoach);
router.post('/renew', protect, authorizeCoach('coach'), renewSubscription);
router.post('/cancel', protect, authorizeCoach('coach'), cancelSubscription);
router.get('/my-subscription', protect, authorizeCoach('coach'), getMySubscription);

// Admin routes for managing coach subscriptions
router.post('/subscribe-coach', verifyAdminToken, checkAdminPermission('systemSettings'), subscribeCoach);
router.post('/renew-coach', verifyAdminToken, checkAdminPermission('systemSettings'), renewSubscription);
router.post('/cancel-coach', verifyAdminToken, checkAdminPermission('systemSettings'), cancelSubscription);
router.get('/coach/:coachId', verifyAdminToken, checkAdminPermission('systemSettings'), getCoachSubscription);
router.get('/all', verifyAdminToken, checkAdminPermission('systemSettings'), getAllSubscriptions);

// ===== ADMIN UTILITIES =====

router.get('/analytics', verifyAdminToken, checkAdminPermission('viewAnalytics'), getSubscriptionAnalytics);
router.post('/send-reminders', verifyAdminToken, checkAdminPermission('systemSettings'), sendReminders);
router.post('/disable-expired', verifyAdminToken, checkAdminPermission('systemSettings'), disableExpiredSubscriptions);

// ===== ADDITIONAL ADMIN ROUTES =====

// Get subscription plan by ID
router.get('/plans/:id', verifyAdminToken, checkAdminPermission('systemSettings'), async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }
        res.status(200).json({
            success: true,
            data: plan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription plan',
            error: error.message
        });
    }
});

// Get all plans (including inactive) for admin
router.get('/plans-all', verifyAdminToken, checkAdminPermission('systemSettings'), async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find().sort({ sortOrder: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            count: plans.length,
            data: plans
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching all subscription plans',
            error: error.message
        });
    }
});

// Update plan features
router.patch('/plans/:id/features', verifyAdminToken, checkAdminPermission('systemSettings'), async (req, res) => {
    try {
        const { features } = req.body;
        const plan = await SubscriptionPlan.findByIdAndUpdate(
            req.params.id,
            { features },
            { new: true, runValidators: true }
        );
        
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Plan features updated successfully',
            data: plan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating plan features',
            error: error.message
        });
    }
});

// Toggle plan active status
router.patch('/plans/:id/toggle-status', verifyAdminToken, checkAdminPermission('systemSettings'), async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }
        
        plan.isActive = !plan.isActive;
        await plan.save();
        
        res.status(200).json({
            success: true,
            message: `Plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`,
            data: plan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error toggling plan status',
            error: error.message
        });
    }
});

// Get subscription statistics
router.get('/stats', verifyAdminToken, checkAdminPermission('viewAnalytics'), async (req, res) => {
    try {
        const stats = await subscriptionService.getSubscriptionStats();
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription statistics',
            error: error.message
        });
    }
});

// Bulk operations
router.post('/bulk-operations', verifyAdminToken, checkAdminPermission('systemSettings'), async (req, res) => {
    try {
        const { operation, subscriptionIds, data } = req.body;
        
        let result;
        switch (operation) {
            case 'extend':
                result = await subscriptionService.bulkExtendSubscriptions(subscriptionIds, data);
                break;
            case 'suspend':
                result = await subscriptionService.bulkSuspendSubscriptions(subscriptionIds, data.reason);
                break;
            case 'activate':
                result = await subscriptionService.bulkActivateSubscriptions(subscriptionIds);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid operation'
                });
        }
        
        res.status(200).json({
            success: true,
            message: `Bulk ${operation} completed successfully`,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error performing bulk operation',
            error: error.message
        });
    }
});

// Export subscriptions data
router.get('/export', verifyAdminToken, checkAdminPermission('viewAnalytics'), async (req, res) => {
    try {
        const { format = 'json', filters } = req.query;
        const data = await subscriptionService.exportSubscriptions(filters, format);
        
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=subscriptions.csv');
            res.send(data);
        } else {
            res.status(200).json({
                success: true,
                data: data
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error exporting subscriptions',
            error: error.message
        });
    }
});

// Get subscription by ID
router.get('/subscription/:id', verifyAdminToken, checkAdminPermission('systemSettings'), async (req, res) => {
    try {
        const subscription = await CoachSubscription.findById(req.params.id)
            .populate('coachId', 'firstName lastName email')
            .populate('planId', 'name price features');
            
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: subscription
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription',
            error: error.message
        });
    }
});

// Update subscription status
router.patch('/subscription/:id/status', verifyAdminToken, checkAdminPermission('systemSettings'), async (req, res) => {
    try {
        const { status, reason } = req.body;
        const subscription = await CoachSubscription.findByIdAndUpdate(
            req.params.id,
            { 
                status,
                ...(reason && { statusChangeReason: reason }),
                statusChangedAt: new Date(),
                statusChangedBy: req.admin._id
            },
            { new: true, runValidators: true }
        );
        
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Subscription status updated successfully',
            data: subscription
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating subscription status',
            error: error.message
        });
    }
});

// Extend subscription
router.post('/subscription/:id/extend', verifyAdminToken, checkAdminPermission('systemSettings'), async (req, res) => {
    try {
        const { extendBy, billingCycle } = req.body;
        const result = await subscriptionService.extendSubscription(req.params.id, extendBy, billingCycle);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Subscription extended successfully',
            data: result.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error extending subscription',
            error: error.message
        });
    }
});

// Get subscription history
router.get('/subscription/:id/history', verifyAdminToken, checkAdminPermission('viewAnalytics'), async (req, res) => {
    try {
        const subscription = await CoachSubscription.findById(req.params.id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        
        // This would typically come from a separate audit/history collection
        // For now, returning basic subscription data
        res.status(200).json({
            success: true,
            data: {
                subscription,
                history: [
                    {
                        action: 'created',
                        timestamp: subscription.createdAt,
                        details: 'Subscription created'
                    },
                    {
                        action: 'status_changed',
                        timestamp: subscription.statusChangedAt || subscription.updatedAt,
                        details: `Status changed to ${subscription.status}`
                    }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription history',
            error: error.message
        });
    }
});

// Search and filter subscriptions
router.get('/search', verifyAdminToken, checkAdminPermission('viewAnalytics'), async (req, res) => {
    try {
        const { 
            status, 
            planId, 
            coachId, 
            startDate, 
            endDate, 
            page = 1, 
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        
        const filter = {};
        if (status) filter.status = status;
        if (planId) filter.planId = planId;
        if (coachId) filter.coachId = coachId;
        if (startDate || endDate) {
            filter.currentPeriod = {};
            if (startDate) filter.currentPeriod.startDate = { $gte: new Date(startDate) };
            if (endDate) filter.currentPeriod.endDate = { $lte: new Date(endDate) };
        }
        
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const skip = (page - 1) * limit;
        
        const subscriptions = await CoachSubscription.find(filter)
            .populate('coachId', 'firstName lastName email')
            .populate('planId', 'name price features')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await CoachSubscription.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            data: subscriptions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching subscriptions',
            error: error.message
        });
    }
});

// Get expiring subscriptions
router.get('/expiring', verifyAdminToken, checkAdminPermission('viewAnalytics'), async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + parseInt(days));
        
        const expiringSubscriptions = await CoachSubscription.find({
            status: 'active',
            'currentPeriod.endDate': { $lte: targetDate }
        })
        .populate('coachId', 'firstName lastName email')
        .populate('planId', 'name price features')
        .sort({ 'currentPeriod.endDate': 1 });
        
        res.status(200).json({
            success: true,
            count: expiringSubscriptions.length,
            data: expiringSubscriptions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching expiring subscriptions',
            error: error.message
        });
    }
});

// Get revenue analytics
router.get('/revenue', verifyAdminToken, checkAdminPermission('viewAnalytics'), async (req, res) => {
    try {
        const { period = 'month', startDate, endDate } = req.query;
        
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }
        
        const subscriptions = await CoachSubscription.find({
            status: 'active',
            ...dateFilter
        }).populate('planId', 'price');
        
        const revenue = subscriptions.reduce((total, sub) => {
            return total + (sub.planId?.price?.amount || 0);
        }, 0);
        
        const planRevenue = {};
        subscriptions.forEach(sub => {
            const planName = sub.planId?.name || 'Unknown';
            if (!planRevenue[planName]) planRevenue[planName] = 0;
            planRevenue[planName] += sub.planId?.price?.amount || 0;
        });
        
        res.status(200).json({
            success: true,
            data: {
                totalRevenue: revenue,
                activeSubscriptions: subscriptions.length,
                planRevenue,
                period: period
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching revenue analytics',
            error: error.message
        });
    }
});

module.exports = router;
