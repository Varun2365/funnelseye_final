const User = require('../schema/User');
const CoachSubscription = require('../schema/CoachSubscription');

/**
 * Middleware to check if coach has active subscription
 * This middleware should be used after authentication middleware
 */
const checkSubscriptionStatus = async (req, res, next) => {
    try {
        // Skip check for non-coach users
        if (req.user.role !== 'coach') {
            return next();
        }

        // Check if user has subscription data in User schema
        if (!req.user.subscription || !req.user.subscription.planId) {
            return res.status(403).json({
                success: false,
                message: 'No active subscription found. Please subscribe to a plan to continue.',
                code: 'NO_SUBSCRIPTION'
            });
        }

        // Check if subscription is enabled
        if (!req.user.subscription.isEnabled) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been temporarily disabled due to expired subscription. Please renew to continue.',
                code: 'ACCOUNT_DISABLED'
            });
        }

        // Check subscription status
        if (req.user.subscription.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Your subscription is not active. Please check your subscription status.',
                code: 'INACTIVE_SUBSCRIPTION'
            });
        }

        // Check if subscription has expired
        if (req.user.subscription.currentPeriod && req.user.subscription.currentPeriod.endDate) {
            const now = new Date();
            const endDate = new Date(req.user.subscription.currentPeriod.endDate);
            
            if (now > endDate) {
                return res.status(403).json({
                    success: false,
                    message: 'Your subscription has expired. Please renew to continue using FunnelsEye.',
                    code: 'SUBSCRIPTION_EXPIRED'
                });
            }
        }

        next();
    } catch (error) {
        console.error('Error in subscription check middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking subscription status',
            error: error.message
        });
    }
};

/**
 * Middleware to check specific feature access based on subscription
 * Usage: checkFeatureAccess('aiFeatures')
 */
const checkFeatureAccess = (featureName) => {
    return async (req, res, next) => {
        try {
            // Skip check for non-coach users
            if (req.user.role !== 'coach') {
                return next();
            }

            // Check if user has subscription data
            if (!req.user.subscription || !req.user.subscription.planId) {
                return res.status(403).json({
                    success: false,
                    message: 'No active subscription found. Please subscribe to a plan to access this feature.',
                    code: 'NO_SUBSCRIPTION'
                });
            }

            // Get detailed subscription info from CoachSubscription collection
            const subscription = await CoachSubscription.findOne({ coachId: req.user._id })
                .populate('planId');

            if (!subscription) {
                return res.status(403).json({
                    success: false,
                    message: 'Subscription details not found. Please contact support.',
                    code: 'SUBSCRIPTION_NOT_FOUND'
                });
            }

            // Check if subscription is active
            if (subscription.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: 'Your subscription is not active. Please check your subscription status.',
                    code: 'INACTIVE_SUBSCRIPTION'
                });
            }

            // Check if feature is available in the plan
            if (!subscription.features[featureName]) {
                return res.status(403).json({
                    success: false,
                    message: `This feature (${featureName}) is not available in your current plan. Please upgrade to access this feature.`,
                    code: 'FEATURE_NOT_AVAILABLE',
                    requiredPlan: subscription.planId.name
                });
            }

            next();
        } catch (error) {
            console.error('Error in feature access check middleware:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking feature access',
                error: error.message
            });
        }
    };
};

/**
 * Middleware to check usage limits based on subscription
 * Usage: checkUsageLimit('maxFunnels')
 */
const checkUsageLimit = (limitType) => {
    return async (req, res, next) => {
        try {
            // Skip check for non-coach users
            if (req.user.role !== 'coach') {
                return next();
            }

            // Get detailed subscription info
            const subscription = await CoachSubscription.findOne({ coachId: req.user._id });

            if (!subscription) {
                return res.status(403).json({
                    success: false,
                    message: 'Subscription details not found. Please contact support.',
                    code: 'SUBSCRIPTION_NOT_FOUND'
                });
            }

            // Check if subscription is active
            if (subscription.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: 'Your subscription is not active. Please check your subscription status.',
                    code: 'INACTIVE_SUBSCRIPTION'
                });
            }

            // Check usage limit
            const maxLimit = subscription.features[limitType];
            const currentUsage = subscription.usage[limitType] || 0;

            if (currentUsage >= maxLimit) {
                return res.status(403).json({
                    success: false,
                    message: `You have reached the maximum limit for ${limitType} (${maxLimit}). Please upgrade your plan to continue.`,
                    code: 'USAGE_LIMIT_REACHED',
                    currentUsage,
                    maxLimit,
                    limitType
                });
            }

            next();
        } catch (error) {
            console.error('Error in usage limit check middleware:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking usage limits',
                error: error.message
            });
        }
    };
};

/**
 * Middleware to check if subscription is expiring soon (within 7 days)
 * This can be used to show warnings in the UI
 */
const checkSubscriptionExpiry = async (req, res, next) => {
    try {
        // Skip check for non-coach users
        if (req.user.role !== 'coach') {
            return next();
        }

        // Check if user has subscription data
        if (!req.user.subscription || !req.user.subscription.currentPeriod) {
            return next();
        }

        const endDate = new Date(req.user.subscription.currentPeriod.endDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        // Add subscription expiry info to request object
        req.subscriptionInfo = {
            daysUntilExpiry,
            isExpiringSoon: daysUntilExpiry <= 7 && daysUntilExpiry > 0,
            isExpired: daysUntilExpiry < 0,
            endDate: endDate
        };

        next();
    } catch (error) {
        console.error('Error in subscription expiry check middleware:', error);
        // Don't block the request, just continue
        next();
    }
};

module.exports = {
    checkSubscriptionStatus,
    checkFeatureAccess,
    checkUsageLimit,
    checkSubscriptionExpiry
};
