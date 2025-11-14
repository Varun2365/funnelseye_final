const CoachSubscription = require('../schema/CoachSubscription');
const SubscriptionPlan = require('../schema/SubscriptionPlan');
const Funnel = require('../schema/Funnel');
const Staff = require('../schema/Staff');
const Lead = require('../schema/Lead');
const logger = require('../utils/logger');

/**
 * Subscription Limits Middleware
 * Checks coach subscription limits before allowing resource creation
 */
class SubscriptionLimitsMiddleware {
    
    /**
     * Get coach's active subscription with plan details
     */
    static async getCoachSubscription(coachId) {
        try {
            const subscription = await CoachSubscription.findOne({
                coachId,
                status: { $in: ['active', 'trial'] }
            }).populate('planId');
            
            if (!subscription) {
                return null;
            }
            
            return {
                subscription,
                plan: subscription.planId,
                features: subscription.planId?.features || {},
                limits: subscription.planId?.limits || {}
            };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error fetching coach subscription:', error);
            return null;
        }
    }
    
    /**
     * Check funnel limit
     */
    static async checkFunnelLimit(coachId) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                return { allowed: false, reason: 'No active subscription' };
            }
            
            const { features } = subscriptionData;
            const maxFunnels = features.maxFunnels || 0;
            
            if (maxFunnels === -1) {
                // Unlimited
                const currentFunnelCount = await Funnel.countDocuments({ coachId });
                return { allowed: true, currentCount: currentFunnelCount, maxLimit: -1 };
            }
            
            const currentFunnelCount = await Funnel.countDocuments({ coachId });
            
            if (currentFunnelCount >= maxFunnels) {
                return {
                    allowed: false,
                    reason: 'Funnel limit reached',
                    currentCount: currentFunnelCount,
                    maxLimit: maxFunnels,
                    upgradeRequired: true
                };
            }
            
            return { allowed: true, currentCount: currentFunnelCount, maxLimit: maxFunnels };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error checking funnel limit:', error);
            return { allowed: false, reason: 'Error checking limits' };
        }
    }
    
    /**
     * Check staff limit
     */
    static async checkStaffLimit(coachId) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                return { allowed: false, reason: 'No active subscription' };
            }
            
            const { features } = subscriptionData;
            const maxStaff = features.maxStaff || 0;
            
            if (maxStaff === -1) {
                return { allowed: true }; // Unlimited
            }
            
            const currentStaffCount = await Staff.countDocuments({ coachId, isActive: true });
            
            if (currentStaffCount >= maxStaff) {
                return {
                    allowed: false,
                    reason: 'Staff limit reached',
                    currentCount: currentStaffCount,
                    maxLimit: maxStaff,
                    upgradeRequired: true
                };
            }
            
            return { allowed: true, currentCount: currentStaffCount, maxLimit: maxStaff };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error checking staff limit:', error);
            return { allowed: false, reason: 'Error checking limits' };
        }
    }
    
    /**
     * Check campaign limit
     */
    static async checkCampaignLimit(coachId) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                return { allowed: false, reason: 'No active subscription' };
            }
            
            const { limits } = subscriptionData;
            const maxCampaigns = limits.maxCampaigns || 0;
            
            if (maxCampaigns === -1) {
                return { allowed: true }; // Unlimited
            }
            
            // For now, we'll assume campaigns are tracked in a separate collection
            // This would need to be implemented based on your campaign tracking system
            const currentCampaignCount = 0; // Placeholder - implement based on your system
            
            if (currentCampaignCount >= maxCampaigns) {
                return {
                    allowed: false,
                    reason: 'Campaign limit reached',
                    currentCount: currentCampaignCount,
                    maxLimit: maxCampaigns,
                    upgradeRequired: true
                };
            }
            
            return { allowed: true, currentCount: currentCampaignCount, maxLimit: maxCampaigns };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error checking campaign limit:', error);
            return { allowed: false, reason: 'Error checking limits' };
        }
    }
    
    /**
     * Check lead limit - UNLIMITED
     */
    static async checkLeadLimit(coachId) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                return { allowed: false, reason: 'No active subscription' };
            }
            
            // Always allow unlimited leads
            const currentLeadCount = await Lead.countDocuments({ coachId });
            return { allowed: true, currentCount: currentLeadCount, maxLimit: -1 };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error checking lead limit:', error);
            return { allowed: false, reason: 'Error checking limits' };
        }
    }
    
    /**
     * Check feature access (boolean features)
     */
    static async checkFeatureAccess(coachId, featureName) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                return { allowed: false, reason: 'No active subscription' };
            }
            
            const { features } = subscriptionData;
            const hasFeature = features[featureName] || false;
            
            if (!hasFeature) {
                return {
                    allowed: false,
                    reason: `${featureName} not available in current plan`,
                    upgradeRequired: true
                };
            }
            
            return { allowed: true };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error checking feature access:', error);
            return { allowed: false, reason: 'Error checking feature access' };
        }
    }
    
    /**
     * Check credit limits (email, SMS, etc.)
     */
    static async checkCreditLimit(coachId, creditType) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                return { allowed: false, reason: 'No active subscription' };
            }
            
            const { features } = subscriptionData;
            const maxCredits = features[creditType] || 0;
            
            if (maxCredits === -1) {
                return { allowed: true }; // Unlimited
            }
            
            // For now, we'll assume credits are tracked in a separate collection
            // This would need to be implemented based on your credit tracking system
            const currentCredits = 0; // Placeholder - implement based on your system
            
            if (currentCredits >= maxCredits) {
                return {
                    allowed: false,
                    reason: `${creditType} limit reached`,
                    currentCount: currentCredits,
                    maxLimit: maxCredits,
                    upgradeRequired: true
                };
            }
            
            return { allowed: true, currentCount: currentCredits, maxLimit: maxCredits };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error checking credit limit:', error);
            return { allowed: false, reason: 'Error checking credit limits' };
        }
    }
    
    /**
     * Middleware factory for funnel creation
     */
    static checkFunnelCreation() {
        return async (req, res, next) => {
            try {
                const coachId = req.user._id || req.coachId;
                if (!coachId) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }
                
                const limitCheck = await this.checkFunnelLimit(coachId);
                
                if (!limitCheck.allowed) {
                    return res.status(403).json({
                        success: false,
                        message: limitCheck.reason,
                        error: 'FUNNEL_LIMIT_REACHED',
                        currentCount: limitCheck.currentCount,
                        maxLimit: limitCheck.maxLimit,
                        upgradeRequired: limitCheck.upgradeRequired,
                        subscriptionRequired: true
                    });
                }
                
                // Add limit info to request for potential use
                req.subscriptionLimits = {
                    funnels: limitCheck
                };
                
                next();
            } catch (error) {
                logger.error('[SubscriptionLimits] Error in funnel creation check:', error);
                next(error);
            }
        };
    }
    
    /**
     * Middleware factory for staff creation
     */
    static checkStaffCreation() {
        return async (req, res, next) => {
            try {
                const coachId = req.user._id || req.coachId;
                if (!coachId) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }
                
                const limitCheck = await this.checkStaffLimit(coachId);
                
                if (!limitCheck.allowed) {
                    return res.status(403).json({
                        success: false,
                        message: limitCheck.reason,
                        error: 'STAFF_LIMIT_REACHED',
                        currentCount: limitCheck.currentCount,
                        maxLimit: limitCheck.maxLimit,
                        upgradeRequired: limitCheck.upgradeRequired,
                        subscriptionRequired: true
                    });
                }
                
                // Add limit info to request for potential use
                req.subscriptionLimits = {
                    staff: limitCheck
                };
                
                next();
            } catch (error) {
                logger.error('[SubscriptionLimits] Error in staff creation check:', error);
                next(error);
            }
        };
    }
    
    /**
     * Middleware factory for lead creation
     */
    static checkLeadCreation() {
        return async (req, res, next) => {
            try {
                const coachId = req.user._id || req.coachId;
                if (!coachId) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }
                
                const limitCheck = await this.checkLeadLimit(coachId);
                
                if (!limitCheck.allowed) {
                    return res.status(403).json({
                        success: false,
                        message: limitCheck.reason,
                        error: 'LEAD_LIMIT_REACHED',
                        currentCount: limitCheck.currentCount,
                        maxLimit: limitCheck.maxLimit,
                        upgradeRequired: limitCheck.upgradeRequired,
                        subscriptionRequired: true
                    });
                }
                
                // Add limit info to request for potential use
                req.subscriptionLimits = {
                    leads: limitCheck
                };
                
                next();
            } catch (error) {
                logger.error('[SubscriptionLimits] Error in lead creation check:', error);
                next(error);
            }
        };
    }
    
    /**
     * Middleware factory for feature access
     */
    static checkFeatureAccess(featureName) {
        return async (req, res, next) => {
            try {
                const coachId = req.user._id || req.coachId;
                if (!coachId) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }
                
                const accessCheck = await this.checkFeatureAccess(coachId, featureName);
                
                if (!accessCheck.allowed) {
                    return res.status(403).json({
                        success: false,
                        message: accessCheck.reason,
                        error: 'FEATURE_NOT_AVAILABLE',
                        featureName,
                        upgradeRequired: accessCheck.upgradeRequired,
                        subscriptionRequired: true
                    });
                }
                
                next();
            } catch (error) {
                logger.error('[SubscriptionLimits] Error in feature access check:', error);
                next(error);
            }
        };
    }
    
    /**
     * Get coach's subscription limits info
     */
    static async getCoachLimitsInfo(coachId) {
        try {
            const subscriptionData = await this.getCoachSubscription(coachId);
            if (!subscriptionData) {
                return {
                    hasActiveSubscription: false,
                    message: 'No active subscription found'
                };
            }
            
            const { subscription, plan, features, limits } = subscriptionData;
            
            // Get current usage counts
            const [funnelCount, staffCount, leadCount] = await Promise.all([
                Funnel.countDocuments({ coachId }),
                Staff.countDocuments({ coachId, isActive: true }),
                Lead.countDocuments({ coachId })
            ]);
            
            return {
                hasActiveSubscription: true,
                subscription: {
                    status: subscription.status,
                    startDate: subscription.startDate,
                    endDate: subscription.endDate,
                    planName: plan.name
                },
                limits: {
                    funnels: {
                        current: funnelCount,
                        max: features.maxFunnels,
                        unlimited: features.maxFunnels === -1
                    },
                    staff: {
                        current: staffCount,
                        max: features.maxStaff,
                        unlimited: features.maxStaff === -1
                    },
                    leads: {
                        current: leadCount,
                        max: limits.maxLeads,
                        unlimited: limits.maxLeads === -1
                    },
                    devices: {
                        max: features.maxDevices,
                        unlimited: features.maxDevices === -1
                    },
                    automationRules: {
                        max: features.automationRules,
                        unlimited: features.automationRules === -1
                    },
                    emailCredits: {
                        max: features.emailCredits,
                        unlimited: features.emailCredits === -1
                    },
                    smsCredits: {
                        max: features.smsCredits,
                        unlimited: features.smsCredits === -1
                    },
                    storageGB: {
                        max: features.storageGB,
                        unlimited: features.storageGB === -1
                    }
                },
                features: {
                    aiFeatures: features.aiFeatures,
                    advancedAnalytics: features.advancedAnalytics,
                    prioritySupport: features.prioritySupport,
                    customDomain: features.customDomain,
                    apiAccess: features.apiAccess,
                    whiteLabel: features.whiteLabel,
                    customBranding: features.customBranding,
                    advancedReporting: features.advancedReporting,
                    teamCollaboration: features.teamCollaboration,
                    mobileApp: features.mobileApp,
                    webhooks: features.webhooks,
                    sso: features.sso
                }
            };
        } catch (error) {
            logger.error('[SubscriptionLimits] Error getting coach limits info:', error);
            return {
                hasActiveSubscription: false,
                message: 'Error retrieving subscription information'
            };
        }
    }
}

module.exports = SubscriptionLimitsMiddleware;
