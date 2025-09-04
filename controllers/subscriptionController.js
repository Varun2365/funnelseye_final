const subscriptionService = require('../services/subscriptionService');
const SubscriptionPlan = require('../schema/SubscriptionPlan');
const CoachSubscription = require('../schema/CoachSubscription');

// ===== SUBSCRIPTION PLANS (Admin Only) =====

/**
 * @route   POST /api/subscription/plans
 * @desc    Create a new subscription plan (Admin only)
 * @access  Private (Admin)
 */
exports.createPlan = async (req, res) => {
    try {
        const { name, description, price, features, isPopular, sortOrder } = req.body;

        if (!name || !description || !price || !price.amount || !price.billingCycle) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, description, price.amount, price.billingCycle'
            });
        }

        const result = await subscriptionService.createPlan(req.body, req.admin._id);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.status(201).json({
            success: true,
            message: 'Subscription plan created successfully',
            data: result.data
        });
    } catch (error) {
        console.error('Error creating subscription plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating subscription plan',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/subscription/plans
 * @desc    Get all active subscription plans
 * @access  Public
 */
exports.getPlans = async (req, res) => {
    try {
        const result = await subscriptionService.getActivePlans();
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error
            });
        }

        res.status(200).json({
            success: true,
            count: result.data.length,
            data: result.data
        });
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription plans',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/subscription/plans/:id
 * @desc    Update a subscription plan (Admin only)
 * @access  Private (Admin)
 */
exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData.createdBy;
        delete updateData._id;

        const plan = await SubscriptionPlan.findByIdAndUpdate(
            id,
            updateData,
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
            message: 'Subscription plan updated successfully',
            data: plan
        });
    } catch (error) {
        console.error('Error updating subscription plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating subscription plan',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/subscription/plans/:id
 * @desc    Delete a subscription plan (Admin only)
 * @access  Private (Admin)
 */
exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if any coaches are subscribed to this plan
        const activeSubscriptions = await CoachSubscription.countDocuments({
            planId: id,
            status: { $in: ['active', 'pending_renewal'] }
        });

        if (activeSubscriptions > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete plan. ${activeSubscriptions} active subscriptions found.`
            });
        }

        const plan = await SubscriptionPlan.findByIdAndDelete(id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subscription plan deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting subscription plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting subscription plan',
            error: error.message
        });
    }
};

// ===== COACH SUBSCRIPTIONS =====

/**
 * @route   POST /api/subscription/subscribe
 * @desc    Subscribe a coach to a plan
 * @access  Private (Coach/Admin)
 */
exports.subscribeCoach = async (req, res) => {
    try {
        const { planId, paymentData } = req.body;
        const coachId = req.admin ? req.body.coachId : req.user._id;

        if (!planId) {
            return res.status(400).json({
                success: false,
                message: 'Plan ID is required'
            });
        }

        const result = await subscriptionService.subscribeCoach(coachId, planId, paymentData);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: result.data
        });
    } catch (error) {
        console.error('Error subscribing coach:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating subscription',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/subscription/renew
 * @desc    Renew a coach's subscription
 * @access  Private (Coach/Admin)
 */
exports.renewSubscription = async (req, res) => {
    try {
        const { planId, paymentData } = req.body;
        const coachId = req.admin ? req.body.coachId : req.user._id;

        if (!planId) {
            return res.status(400).json({
                success: false,
                message: 'Plan ID is required'
            });
        }

        const result = await subscriptionService.renewSubscription(coachId, planId, paymentData);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subscription renewed successfully',
            data: result.data
        });
    } catch (error) {
        console.error('Error renewing subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error renewing subscription',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/subscription/cancel
 * @desc    Cancel a coach's subscription
 * @access  Private (Coach/Admin)
 */
exports.cancelSubscription = async (req, res) => {
    try {
        const { reason } = req.body;
        const coachId = req.admin ? req.body.coachId : req.user._id;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Cancellation reason is required'
            });
        }

        const result = await subscriptionService.cancelSubscription(
            coachId, 
            reason, 
            req.admin ? req.admin._id : req.user._id
        );
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: result.data
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling subscription',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/subscription/my-subscription
 * @desc    Get coach's current subscription details
 * @access  Private (Coach)
 */
exports.getMySubscription = async (req, res) => {
    try {
        const result = await subscriptionService.getCoachSubscription(req.admin ? req.admin._id : req.user._id);
        
        if (!result.success) {
            return res.status(404).json({
                success: false,
                message: result.error
            });
        }

        res.status(200).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/subscription/coach/:coachId
 * @desc    Get specific coach's subscription (Admin only)
 * @access  Private (Admin)
 */
exports.getCoachSubscription = async (req, res) => {
    try {
        const { coachId } = req.params;

        const result = await subscriptionService.getCoachSubscription(coachId);
        
        if (!result.success) {
            return res.status(404).json({
                success: false,
                message: result.error
            });
        }

        res.status(200).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('Error fetching coach subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching coach subscription',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/subscription/all
 * @desc    Get all coach subscriptions (Admin only)
 * @access  Private (Admin)
 */
exports.getAllSubscriptions = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        let query = {};
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        
        const subscriptions = await CoachSubscription.find(query)
            .populate('coachId', 'name email company')
            .populate('planId', 'name price features')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await CoachSubscription.countDocuments(query);

        res.status(200).json({
            success: true,
            count: subscriptions.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            data: subscriptions
        });
    } catch (error) {
        console.error('Error fetching all subscriptions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscriptions',
            error: error.message
        });
    }
};



/**
 * @route   GET /api/subscription/analytics
 * @desc    Get subscription analytics (Admin only)
 * @access  Private (Admin)
 */
exports.getSubscriptionAnalytics = async (req, res) => {
    try {
        const result = await subscriptionService.getSubscriptionAnalytics();
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error
            });
        }

        res.status(200).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('Error fetching subscription analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription analytics',
            error: error.message
        });
    }
};

// ===== ADMIN UTILITIES =====

/**
 * @route   POST /api/subscription/send-reminders
 * @desc    Manually trigger reminder sending (Admin only)
 * @access  Private (Admin)
 */
exports.sendReminders = async (req, res) => {
    try {
        const result = await subscriptionService.checkAndSendReminders();
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error
            });
        }

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error sending reminders:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending reminders',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/subscription/disable-expired
 * @desc    Manually disable expired subscriptions (Admin only)
 * @access  Private (Admin)
 */
exports.disableExpiredSubscriptions = async (req, res) => {
    try {
        const result = await subscriptionService.disableExpiredSubscriptions();
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error
            });
        }

        res.status(200).json({
            success: true,
            message: `Disabled ${result.disabledCount} expired subscriptions`,
            disabledCount: result.disabledCount
        });
    } catch (error) {
        console.error('Error disabling expired subscriptions:', error);
        res.status(500).json({
            success: false,
            message: 'Error disabling expired subscriptions',
            error: error.message
        });
    }
};
