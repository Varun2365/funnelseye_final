const express = require('express');
const router = express.Router();
const adminV1Controller = require('../controllers/adminV1Controller');
const { verifyAdminToken, checkAdminPermission, adminRateLimit, logAdminActivity } = require('../middleware/adminAuth');

// Helper middleware to skip activity logging for certain routes
const noLogActivity = (req, res, next) => {
    req.skipActivityLog = true;
    next();
};

// ===== ADMIN V1 MASTER API ROUTES =====

// ===== DASHBOARD & ANALYTICS =====

/**
 * @route GET /api/admin/v1/dashboard
 * @desc Get comprehensive admin dashboard data
 * @access Private (Admin)
 * @query timeRange (optional): Number of days to analyze (default: 30)
 * @example GET /api/admin/v1/dashboard?timeRange=30
 */
router.get('/dashboard', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    adminV1Controller.getDashboard
);

/**
 * @route GET /api/admin/v1/analytics
 * @desc Get platform analytics
 * @access Private (Admin)
 * @query timeRange (optional): Number of days to analyze (default: 30)
 * @query metric (optional): Specific metric to retrieve (all, users, revenue, coaches, subscriptions)
 * @example GET /api/admin/v1/analytics?timeRange=30&metric=all
 */
router.get('/analytics', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    adminV1Controller.getPlatformAnalytics
);

/**
 * @route GET /api/admin/v1/system-health
 * @desc Get system health status
 * @access Private (Admin)
 * @example GET /api/admin/v1/system-health
 */
router.get('/system-health', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    adminV1Controller.getSystemHealth
);

// ===== USER MANAGEMENT =====

/**
 * @route GET /api/admin/v1/users
 * @desc Get all users with filtering and pagination
 * @access Private (Admin)
 * @query page (optional): Page number (default: 1)
 * @query limit (optional): Items per page (default: 20)
 * @query role (optional): Filter by user role
 * @query status (optional): Filter by user status
 * @query search (optional): Search by name, email, or phone
 * @query sortBy (optional): Sort field (default: createdAt)
 * @query sortOrder (optional): Sort order (asc/desc, default: desc)
 * @example GET /api/admin/v1/users?page=1&limit=20&role=user&status=active&search=john
 */
router.get('/users', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    adminV1Controller.getUsers
);

/**
 * @route GET /api/admin/v1/users/:userId
 * @desc Get user details with subscriptions and appointments
 * @access Private (Admin)
 * @param userId: User ID
 * @example GET /api/admin/v1/users/64a1b2c3d4e5f6789012345
 */
router.get('/users/:userId', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    adminV1Controller.getUserDetails
);

/**
 * @route PUT /api/admin/v1/users/:userId
 * @desc Update user status or details
 * @access Private (Admin)
 * @param userId: User ID
 * @body status (optional): User status
 * @body role (optional): User role
 * @body coachId (optional): Assigned coach ID
 * @body notes (optional): Admin notes
 * @example PUT /api/admin/v1/users/64a1b2c3d4e5f6789012345
 * @body { "status": "active", "coachId": "coach_id_here", "notes": "VIP client" }
 */
router.put('/users/:userId', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    adminRateLimit(10, 60 * 1000), // 10 requests per minute
    adminV1Controller.updateUser
);

/**
 * @route POST /api/admin/v1/users
 * @desc Create a new user
 * @access Private (Admin)
 * @body name: User's full name
 * @body email: User's email address
 * @body phone: User's phone number (optional)
 * @body password: User's password
 * @body role: User's role (default: user)
 * @body status: User's status (default: active)
 * @body coachId: Assigned coach ID (optional)
 * @body notes: Admin notes (optional)
 * @example POST /api/admin/v1/users
 * @body { "name": "John Doe", "email": "john@example.com", "password": "password123", "role": "user", "status": "active" }
 */
router.post('/users', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    adminRateLimit(5, 60 * 1000), // 5 requests per minute
    adminV1Controller.createUser
);

/**
 * @route POST /api/admin/v1/users/bulk-update
 * @desc Bulk update multiple users
 * @access Private (Admin)
 * @body updates: Array of user updates
 * @example POST /api/admin/v1/users/bulk-update
 * @body { "updates": [{ "userId": "64a1b2c3d4e5f6789012345", "status": "active" }, { "userId": "64a1b2c3d4e5f6789012346", "role": "premium" }] }
 */
router.post('/users/bulk-update', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    adminRateLimit(3, 60 * 1000), // 3 requests per minute
    adminV1Controller.bulkUpdateUsers
);

/**
 * @route GET /api/admin/v1/users/export
 * @desc Export users data
 * @access Private (Admin)
 * @query format: Export format (csv/json, default: csv)
 * @query includeDeleted: Include deleted users (true/false, default: false)
 * @example GET /api/admin/v1/users/export?format=csv&includeDeleted=false
 */
router.get('/users/export', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    adminRateLimit(5, 60 * 1000), // 5 requests per minute
    adminV1Controller.exportUsers
);

/**
 * @route POST /api/admin/v1/users/bulk-delete
 * @desc Bulk delete multiple users
 * @access Private (Admin)
 * @body userIds: Array of user IDs to delete
 * @body permanent: Whether to permanently delete (true/false, default: false)
 * @example POST /api/admin/v1/users/bulk-delete
 * @body { "userIds": ["64a1b2c3d4e5f6789012345", "64a1b2c3d4e5f6789012346"], "permanent": false }
 */
router.post('/users/bulk-delete', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    adminRateLimit(2, 60 * 1000), // 2 requests per minute
    adminV1Controller.bulkDeleteUsers
);

/**
 * @route GET /api/admin/v1/subscription-plans
 * @desc Get available subscription plans
 * @access Private (Admin)
 * @example GET /api/admin/v1/subscription-plans
 */
router.get('/subscription-plans', 
    verifyAdminToken, 
    checkAdminPermission('planManagement'), 
    adminV1Controller.getSubscriptionPlans
);

/**
 * @route POST /api/admin/v1/subscription-plans
 * @desc Create new subscription plan
 * @access Private (Admin)
 * @body name, description, price, currency, billingCycle, duration, features, limits
 * @example POST /api/admin/v1/subscription-plans
 */
router.post('/subscription-plans', 
    verifyAdminToken, 
    checkAdminPermission('planManagement'), 
    adminRateLimit(5, 60 * 1000), // 5 requests per minute
    adminV1Controller.createSubscriptionPlan
);

/**
 * @route PUT /api/admin/v1/subscription-plans/:id
 * @desc Update subscription plan
 * @access Private (Admin)
 * @param id: Plan ID
 * @body name, description, price, currency, billingCycle, duration, features, limits
 * @example PUT /api/admin/v1/subscription-plans/64a1b2c3d4e5f6789012345
 */
router.put('/subscription-plans/:id', 
    verifyAdminToken, 
    checkAdminPermission('planManagement'), 
    adminRateLimit(5, 60 * 1000), // 5 requests per minute
    adminV1Controller.updateSubscriptionPlan
);

/**
 * @route DELETE /api/admin/v1/subscription-plans/:id
 * @desc Delete subscription plan
 * @access Private (Admin)
 * @param id: Plan ID
 * @example DELETE /api/admin/v1/subscription-plans/64a1b2c3d4e5f6789012345
 */
router.delete('/subscription-plans/:id', 
    verifyAdminToken, 
    checkAdminPermission('planManagement'), 
    adminRateLimit(3, 60 * 1000), // 3 requests per minute
    adminV1Controller.deleteSubscriptionPlan
);

/**
 * @route GET /api/admin/v1/subscriptions
 * @desc Get all coach subscriptions with filtering
 * @access Private (Admin)
 * @query page, limit, status, coachId, planId, startDate, endDate
 * @example GET /api/admin/v1/subscriptions?page=1&limit=20&status=active
 */
router.get('/subscriptions', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    adminV1Controller.getAllSubscriptions
);

/**
 * @route GET /api/admin/v1/subscriptions/:id
 * @desc Get specific subscription details
 * @access Private (Admin)
 * @param id: Subscription ID
 * @example GET /api/admin/v1/subscriptions/64a1b2c3d4e5f6789012345
 */
router.get('/subscriptions/:id', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    adminV1Controller.getSubscriptionDetails
);

/**
 * @route POST /api/admin/v1/subscriptions/:id/cancel
 * @desc Cancel coach subscription (Admin)
 * @access Private (Admin)
 * @param id: Subscription ID
 * @body reason: Cancellation reason
 * @example POST /api/admin/v1/subscriptions/64a1b2c3d4e5f6789012345/cancel
 */
router.post('/subscriptions/:id/cancel', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    adminRateLimit(3, 60 * 1000), // 3 requests per minute
    adminV1Controller.cancelCoachSubscription
);

/**
 * @route POST /api/admin/v1/subscriptions/:id/renew
 * @desc Renew coach subscription (Admin)
 * @access Private (Admin)
 * @param id: Subscription ID
 * @body duration: Renewal duration in months
 * @example POST /api/admin/v1/subscriptions/64a1b2c3d4e5f6789012345/renew
 */
router.post('/subscriptions/:id/renew', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    adminRateLimit(3, 60 * 1000), // 3 requests per minute
    adminV1Controller.renewCoachSubscription
);

// ===== FINANCIAL SETTINGS =====

/**
 * @route GET /api/admin/v1/financial-settings
 * @desc Get financial settings including Razorpay, platform fees, and MLM structure
 * @access Private (Admin)
 * @example GET /api/admin/v1/financial-settings
 */
router.get('/financial-settings', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminV1Controller.getSystemFinancialSettings
);

/**
 * @route PUT /api/admin/v1/financial-settings
 * @desc Update financial settings
 * @access Private (Admin)
 * @body razorpay: Razorpay configuration
 * @body platformFees: Platform fee structure
 * @body mlmCommissionStructure: MLM commission structure
 * @example PUT /api/admin/v1/financial-settings
 * @body {
 *   "razorpay": {
 *     "keyId": "rzp_test_...",
 *     "keySecret": "secret_key",
 *     "accountNumber": "account_number",
 *     "webhookSecret": "webhook_secret"
 *   },
 *   "platformFees": {
 *     "subscriptionFee": 5.0,
 *     "transactionFee": 2.0,
 *     "payoutFee": 1.0,
 *     "refundFee": 0.5
 *   },
 *   "mlmCommissionStructure": {
 *     "levels": [
 *       { "level": 1, "percentage": 10 },
 *       { "level": 2, "percentage": 5 }
 *     ],
 *     "platformFeePercentage": 5,
 *     "maxLevels": 3,
 *     "autoPayoutEnabled": true,
 *     "payoutThreshold": 100
 *   }
 * }
 */
router.put('/financial-settings', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    adminV1Controller.updateFinancialSettings
);

// ===== DOWNLINE MANAGEMENT =====

/**
 * @route GET /api/admin/v1/downline
 * @desc Get downline structure
 * @access Private (Admin)
 * @query coachId (optional): Specific coach ID to view downline
 * @query level (optional): Maximum levels to display (default: 3)
 * @example GET /api/admin/v1/downline?coachId=coach_id_here&level=3
 */
router.get('/downline', 
    verifyAdminToken, 
    checkAdminPermission('mlmSettings'), 
    adminV1Controller.getDownlineStructure
);

/**
 * @route GET /api/admin/v1/mlm-reports
 * @desc Get MLM commission reports
 * @access Private (Admin)
 * @query timeRange (optional): Number of days to analyze (default: 30)
 * @query coachId (optional): Filter by specific coach
 * @example GET /api/admin/v1/mlm-reports?timeRange=30&coachId=coach_id_here
 */
router.get('/mlm-reports', 
    verifyAdminToken, 
    checkAdminPermission('mlmSettings'), 
    adminV1Controller.getMlmReports
);

// ===== PLATFORM CONFIGURATION =====

/**
 * @route GET /api/admin/v1/platform-config
 * @desc Get platform configuration
 * @access Private (Admin)
 * @example GET /api/admin/v1/platform-config
 */
router.get('/platform-config', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminV1Controller.getPlatformConfig
);

/**
 * @route PUT /api/admin/v1/platform-config
 * @desc Update platform configuration
 * @access Private (Admin)
 * @body general: General platform settings
 * @body features: Feature toggles
 * @body limits: System limits
 * @example PUT /api/admin/v1/platform-config
 * @body {
 *   "general": {
 *     "platformName": "FunnelEye Platform",
 *     "defaultLanguage": "en",
 *     "timezone": "Asia/Kolkata",
 *     "currency": "INR"
 *   },
 *   "features": {
 *     "mlmEnabled": true,
 *     "aiEnabled": true,
 *     "messagingEnabled": true,
 *     "communityEnabled": true
 *   },
 *   "limits": {
 *     "maxUsersPerCoach": 100,
 *     "maxCoachesPerAdmin": 50,
 *     "maxSubscriptionDuration": 365
 *   }
 * }
 */
router.put('/platform-config', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    adminV1Controller.updatePlatformConfig
);

// ===== CONTENT MANAGEMENT =====

/**
 * @route GET /api/admin/v1/content/plans
 * @desc Get all coach plans/programs
 * @access Private (Admin)
 * @query page (optional): Page number (default: 1)
 * @query limit (optional): Items per page (default: 20)
 * @query status (optional): Filter by plan status
 * @query search (optional): Search by name or description
 * @example GET /api/admin/v1/content/plans?page=1&limit=20&status=active&search=fat%20loss
 */
router.get('/content/plans', 
    verifyAdminToken, 
    checkAdminPermission('contentManagement'), 
    adminV1Controller.getCoachPlans
);

/**
 * @route POST /api/admin/v1/content/plans
 * @desc Create new coach plan
 * @access Private (Admin)
 * @body name: Plan name
 * @body description: Plan description
 * @body price: Plan price
 * @body duration: Plan duration in days
 * @body features: Array of plan features
 * @body status: Plan status (active/inactive)
 * @example POST /api/admin/v1/content/plans
 * @body {
 *   "name": "21-Day Fat Loss Program",
 *   "description": "Complete fat loss transformation program",
 *   "price": 2999,
 *   "duration": 21,
 *   "features": ["Meal Plans", "Workout Videos", "Coach Support"],
 *   "status": "active"
 * }
 */
router.post('/content/plans', 
    verifyAdminToken, 
    checkAdminPermission('contentManagement'), 
    adminRateLimit(10, 60 * 1000), // 10 requests per minute
    adminV1Controller.manageCoachPlan
);

/**
 * @route PUT /api/admin/v1/content/plans/:planId
 * @desc Update existing coach plan
 * @access Private (Admin)
 * @param planId: Plan ID
 * @body name (optional): Plan name
 * @body description (optional): Plan description
 * @body price (optional): Plan price
 * @body duration (optional): Plan duration in days
 * @body features (optional): Array of plan features
 * @body status (optional): Plan status
 * @example PUT /api/admin/v1/content/plans/64a1b2c3d4e5f6789012345
 * @body { "price": 3999, "status": "active" }
 */
router.put('/content/plans/:planId', 
    verifyAdminToken, 
    checkAdminPermission('contentManagement'), 
    adminRateLimit(10, 60 * 1000), // 10 requests per minute
    adminV1Controller.manageCoachPlan
);

// ===== MESSAGING & AUTOMATION =====

/**
 * @route GET /api/admin/v1/messaging/settings
 * @desc Get messaging settings
 * @access Private (Admin)
 * @example GET /api/admin/v1/messaging/settings
 */
router.get('/messaging/settings', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminV1Controller.getMessagingSettings
);

/**
 * @route PUT /api/admin/v1/messaging/settings
 * @desc Update messaging settings
 * @access Private (Admin)
 * @body whatsapp: WhatsApp configuration
 * @body email: Email configuration
 * @body push: Push notification configuration
 * @body automation: Automation settings
 * @example PUT /api/admin/v1/messaging/settings
 * @body {
 *   "whatsapp": {
 *     "enabled": true,
 *     "provider": "gupshup",
 *     "apiKey": "api_key_here",
 *     "templateId": "template_id_here"
 *   },
 *   "email": {
 *     "enabled": true,
 *     "provider": "sendgrid",
 *     "apiKey": "api_key_here",
 *     "fromEmail": "noreply@platform.com"
 *   },
 *   "push": {
 *     "enabled": true,
 *     "provider": "fcm",
 *     "serverKey": "server_key_here"
 *   },
 *   "automation": {
 *     "welcomeSequence": true,
 *     "reminderSequence": true,
 *     "milestoneSequence": true
 *   }
 * }
 */
router.put('/messaging/settings', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    adminV1Controller.updateMessagingSettings
);

// ===== SUBSCRIPTION PLANS =====

/**
 * @route GET /api/admin/v1/debug/subscription-plans
 * @desc Debug endpoint to test SubscriptionPlan model
 * @access Private (Admin)
 */
router.get('/debug/subscription-plans', 
    verifyAdminToken, 
    checkAdminPermission('subscriptionManagement'), 
    adminV1Controller.debugSubscriptionPlans
);

/**
 * @route GET /api/admin/v1/subscription-plans
 * @desc Get all subscription plans
 * @access Private (Admin)
 * @query page (optional): Page number (default: 1)
 * @query limit (optional): Items per page (default: 20)
 * @query status (optional): Filter by plan status (active/inactive)
 * @query search (optional): Search by name or description
 * @example GET /api/admin/v1/subscription-plans?page=1&limit=20&status=active
 */
router.get('/subscription-plans', 
    verifyAdminToken, 
    checkAdminPermission('subscriptionManagement'), 
    adminV1Controller.getSubscriptionPlans
);

/**
 * @route POST /api/admin/v1/subscription-plans
 * @desc Create new subscription plan
 * @access Private (Admin)
 * @body name: Plan name
 * @body description: Plan description
 * @body price: Plan price
 * @body currency: Currency code (default: USD)
 * @body billingCycle: Billing cycle (monthly/quarterly/yearly)
 * @body duration: Plan duration in months
 * @body features: Plan features object
 * @body limits: Plan limits object
 * @body isPopular: Mark as popular plan (default: false)
 * @body trialDays: Trial period in days (default: 0)
 * @body setupFee: One-time setup fee (default: 0)
 * @body sortOrder: Display order (default: 0)
 * @example POST /api/admin/v1/subscription-plans
 * @body {
 *   "name": "Professional Plan",
 *   "description": "Advanced features for growing businesses",
 *   "price": 99.99,
 *   "currency": "USD",
 *   "billingCycle": "monthly",
 *   "duration": 1,
 *   "features": {
 *     "maxFunnels": 10,
 *     "maxStaff": 5,
 *     "maxDevices": 3,
 *     "aiFeatures": true,
 *     "advancedAnalytics": true,
 *     "prioritySupport": true,
 *     "customDomain": true,
 *     "apiAccess": true,
 *     "whiteLabel": false,
 *     "automationRules": 50,
 *     "emailCredits": 10000,
 *     "smsCredits": 1000,
 *     "storageGB": 100,
 *     "integrations": ["zapier", "webhook", "api"]
 *   },
 *   "limits": {
 *     "maxLeads": 1000,
 *     "maxAppointments": 500,
 *     "maxCampaigns": 20,
 *     "maxAutomationRules": 50,
 *     "maxWhatsAppMessages": 1000,
 *     "maxEmailTemplates": 100,
 *     "maxLandingPages": 25,
 *     "maxWebinars": 10
 *   },
 *   "isPopular": true,
 *   "trialDays": 14,
 *   "setupFee": 0,
 *   "sortOrder": 2
 * }
 */
router.post('/subscription-plans', 
    verifyAdminToken, 
    checkAdminPermission('subscriptionManagement'), 
    adminRateLimit(10, 60 * 1000), // 10 requests per minute
    adminV1Controller.createSubscriptionPlan
);

/**
 * @route GET /api/admin/v1/subscription-plans/:planId
 * @desc Get specific subscription plan details
 * @access Private (Admin)
 * @param planId: Subscription plan ID
 * @example GET /api/admin/v1/subscription-plans/64a1b2c3d4e5f6789012345
 */
router.get('/subscription-plans/:planId', 
    verifyAdminToken, 
    checkAdminPermission('subscriptionManagement'), 
    adminV1Controller.getSubscriptionPlanById
);

/**
 * @route PUT /api/admin/v1/subscription-plans/:planId
 * @desc Update subscription plan
 * @access Private (Admin)
 * @param planId: Subscription plan ID
 * @body name (optional): Plan name
 * @body description (optional): Plan description
 * @body price (optional): Plan price
 * @body currency (optional): Currency code
 * @body billingCycle (optional): Billing cycle
 * @body duration (optional): Plan duration
 * @body features (optional): Plan features object
 * @body limits (optional): Plan limits object
 * @body isPopular (optional): Mark as popular plan
 * @body trialDays (optional): Trial period
 * @body setupFee (optional): Setup fee
 * @body sortOrder (optional): Display order
 * @body isActive (optional): Plan status
 * @example PUT /api/admin/v1/subscription-plans/64a1b2c3d4e5f6789012345
 * @body { "price": 149.99, "features": { "maxFunnels": 15, "aiFeatures": true } }
 */
router.put('/subscription-plans/:planId', 
    verifyAdminToken, 
    checkAdminPermission('subscriptionManagement'), 
    adminRateLimit(10, 60 * 1000), // 10 requests per minute
    adminV1Controller.updateSubscriptionPlan
);

/**
 * @route DELETE /api/admin/v1/subscription-plans/:planId
 * @desc Delete subscription plan
 * @access Private (Admin)
 * @param planId: Subscription plan ID
 * @example DELETE /api/admin/v1/subscription-plans/64a1b2c3d4e5f6789012345
 */
router.delete('/subscription-plans/:planId', 
    verifyAdminToken, 
    checkAdminPermission('subscriptionManagement'), 
    adminRateLimit(5, 60 * 1000), // 5 requests per minute
    adminV1Controller.deleteSubscriptionPlan
);

/**
 * @route PUT /api/admin/v1/subscription-plans/:planId/toggle-status
 * @desc Toggle subscription plan active status
 * @access Private (Admin)
 * @param planId: Subscription plan ID
 * @example PUT /api/admin/v1/subscription-plans/64a1b2c3d4e5f6789012345/toggle-status
 */
router.put('/subscription-plans/:planId/toggle-status', 
    verifyAdminToken, 
    checkAdminPermission('subscriptionManagement'), 
    adminRateLimit(10, 60 * 1000), // 10 requests per minute
    adminV1Controller.toggleSubscriptionPlanStatus
);

/**
 * @route POST /api/admin/v1/subscription-plans/:planId/duplicate
 * @desc Duplicate subscription plan
 * @access Private (Admin)
 * @param planId: Subscription plan ID to duplicate
 * @body name (optional): New plan name
 * @body price (optional): New plan price
 * @example POST /api/admin/v1/subscription-plans/64a1b2c3d4e5f6789012345/duplicate
 * @body { "name": "Professional Plan Copy", "price": 79.99 }
 */
router.post('/subscription-plans/:planId/duplicate', 
    verifyAdminToken, 
    checkAdminPermission('subscriptionManagement'), 
    adminRateLimit(5, 60 * 1000), // 5 requests per minute
    adminV1Controller.duplicateSubscriptionPlan
);

/**
 * @route GET /api/admin/v1/subscription-plans/analytics
 * @desc Get subscription plan analytics
 * @access Private (Admin)
 * @query timeRange (optional): Time range in days (default: 30)
 * @example GET /api/admin/v1/subscription-plans/analytics?timeRange=30
 */
router.get('/subscription-plans/analytics', 
    verifyAdminToken, 
    checkAdminPermission('subscriptionManagement'), 
    adminRateLimit(20, 60 * 1000), // 20 requests per minute
    adminV1Controller.getSubscriptionPlanAnalytics
);

/**
 * @route POST /api/admin/v1/subscription-plans/subscribe-coach
 * @desc Subscribe coach to plan (admin action)
 * @access Private (Admin)
 * @body coachId: Coach ID
 * @body planId: Subscription plan ID
 * @body startDate (optional): Subscription start date
 * @body notes (optional): Admin notes
 * @example POST /api/admin/v1/subscription-plans/subscribe-coach
 * @body {
 *   "coachId": "64a1b2c3d4e5f6789012345",
 *   "planId": "64a1b2c3d4e5f6789012346",
 *   "startDate": "2024-01-01",
 *   "notes": "VIP coach subscription"
 * }
 */
router.post('/subscription-plans/subscribe-coach', 
    verifyAdminToken, 
    checkAdminPermission('subscriptionManagement'), 
    adminRateLimit(10, 60 * 1000), // 10 requests per minute
    adminV1Controller.subscribeCoachToPlan
);

// ===== AI SETTINGS =====

/**
 * @route GET /api/admin/v1/ai-settings
 * @desc Get AI settings
 * @access Private (Admin)
 * @example GET /api/admin/v1/ai-settings
 */
router.get('/ai-settings', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminV1Controller.getAiSettings
);

/**
 * @route PUT /api/admin/v1/ai-settings
 * @desc Update AI settings
 * @access Private (Admin)
 * @body nutritionist: AI nutritionist configuration
 * @body support: AI support configuration
 * @body automation: AI automation configuration
 * @example PUT /api/admin/v1/ai-settings
 * @body {
 *   "nutritionist": {
 *     "enabled": true,
 *     "model": "gpt-3.5-turbo",
 *     "temperature": 0.7,
 *     "maxTokens": 500,
 *     "safetyMode": true
 *   },
 *   "support": {
 *     "enabled": true,
 *     "escalationThreshold": 3,
 *     "humanHandoff": true
 *   },
 *   "automation": {
 *     "enabled": true,
 *     "responseDelay": 1000,
 *     "maxRetries": 3
 *   }
 * }
 */
router.put('/ai-settings', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    adminV1Controller.updateAiSettings
);

// ===== ADMIN AUTHENTICATION =====

/**
 * @route POST /api/admin/v1/auth/login
 * @desc Admin login
 * @access Public
 * @body email, password, rememberMe (optional)
 * @example POST /api/admin/v1/auth/login
 * @body { "email": "admin@example.com", "password": "password123", "rememberMe": true }
 */
router.post('/auth/login', adminV1Controller.adminLogin);

/**
 * @route POST /api/admin/v1/auth/logout
 * @desc Admin logout
 * @access Private (Admin)
 * @body sessionToken (optional)
 * @example POST /api/admin/v1/auth/logout
 * @body { "sessionToken": "session_token_here" }
 */
router.post('/auth/logout', 
    verifyAdminToken, 
    adminV1Controller.adminLogout
);

/**
 * @route GET /api/admin/v1/auth/profile
 * @desc Get current admin profile
 * @access Private (Admin)
 * @example GET /api/admin/v1/auth/profile
 */
router.get('/auth/profile', 
    verifyAdminToken, 
    adminV1Controller.getAdminProfile
);

// ===== SYSTEM MANAGEMENT =====

/**
 * @route GET /api/admin/v1/system/health
 * @desc Get system health status
 * @access Private (Admin)
 * @example GET /api/admin/v1/system/health
 */
router.get('/system/health', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminV1Controller.getSystemHealth
);

/**
 * @route GET /api/admin/v1/settings
 * @desc Get global platform settings
 * @access Private (Admin)
 * @example GET /api/admin/v1/settings
 */
router.get('/settings', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminV1Controller.getGlobalSettings
);

/**
 * @route PUT /api/admin/v1/settings/:section
 * @desc Update global platform settings section
 * @access Private (Admin)
 * @param section: Settings section (platformConfig, paymentSystem, mlmSystem, security, messagingSystem, aiSystem, notifications, integrations)
 * @body Settings data for the specific section
 * @example PUT /api/admin/v1/settings/platformConfig
 * @body { "platformName": "New Platform Name", "defaultLanguage": "en" }
 */
router.put('/settings/:section', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    adminV1Controller.updateGlobalSettings
);

// ===== AUDIT LOGS =====

/**
 * @route GET /api/admin/v1/audit-logs
 * @desc Get audit logs with filtering and pagination
 * @access Private (Admin)
 * @query page (optional): Page number (default: 1)
 * @query limit (optional): Items per page (default: 20)
 * @query action (optional): Filter by action
 * @query category (optional): Filter by category
 * @query severity (optional): Filter by severity
 * @query adminEmail (optional): Filter by admin email
 * @query startDate (optional): Start date filter
 * @query endDate (optional): End date filter
 * @query sortBy (optional): Sort field (default: createdAt)
 * @query sortOrder (optional): Sort order (asc/desc, default: desc)
 * @example GET /api/admin/v1/audit-logs?page=1&limit=20&severity=high&startDate=2024-01-01
 */
router.get('/audit-logs', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    adminV1Controller.getAuditLogs
);

// ===== PRODUCT MANAGEMENT =====

/**
 * @route GET /api/admin/v1/products
 * @desc Get all admin products with filtering and pagination
 * @access Private (Admin)
 * @query page (optional): Page number (default: 1)
 * @query limit (optional): Items per page (default: 20)
 * @query status (optional): Filter by product status
 * @query category (optional): Filter by product category
 * @query productType (optional): Filter by product type
 * @query search (optional): Search by name, description, or tags
 * @example GET /api/admin/v1/products?page=1&limit=20&status=active&search=fitness
 */
router.get('/products', 
    verifyAdminToken, 
    checkAdminPermission('contentManagement'), 
    adminV1Controller.getAdminProducts
);

/**
 * @route POST /api/admin/v1/products
 * @desc Create new admin product
 * @access Private (Admin)
 * @body name: Product name
 * @body description: Product description
 * @body category: Product category
 * @body productType: Product type
 * @body basePrice: Base price
 * @body currency: Currency code
 * @body features: Array of product features
 * @body status: Product status (active/inactive)
 * @example POST /api/admin/v1/products
 * @body {
 *   "name": "Fitness Program",
 *   "description": "Complete fitness transformation program",
 *   "category": "fitness",
 *   "productType": "program",
 *   "basePrice": 2999,
 *   "currency": "INR",
 *   "features": ["Meal Plans", "Workout Videos", "Coach Support"],
 *   "status": "active"
 * }
 */
router.post('/products', 
    verifyAdminToken, 
    checkAdminPermission('contentManagement'), 
    adminRateLimit(10, 60 * 1000), // 10 requests per minute
    adminV1Controller.createAdminProduct
);

// ===== SECURITY MANAGEMENT =====

/**
 * @route GET /api/admin/v1/security/incidents
 * @desc Get security incidents
 * @access Private (Admin)
 * @query timeRange (optional): Time range in days (default: 30)
 * @query severity (optional): Filter by severity level
 * @example GET /api/admin/v1/security/incidents?timeRange=7&severity=high
 */
router.get('/security/incidents', 
    verifyAdminToken, 
    checkAdminPermission('securityManagement'), 
    adminV1Controller.getSecurityIncidents
);

// ===== FINANCIAL MANAGEMENT (Enhanced) =====

/**
 * @route GET /api/admin/v1/financial/razorpay-account
 * @desc Get Razorpay account details and balance
 * @access Private (Admin)
 * @example GET /api/admin/v1/financial/razorpay-account
 */
// router.get('/financial/razorpay-account', 
//     verifyAdminToken, 
//     checkAdminPermission('systemSettings'), 
//     noLogActivity, 
//     adminV1Controller.getRazorpayAccount
// );

/**
 * @route PUT /api/admin/v1/financial/mlm-commission-structure
 * @desc Update MLM commission structure
 * @access Private (Admin)
 * @body levels: Commission levels array
 * @body platformFeePercentage: Platform fee percentage
 * @body maxLevels: Maximum commission levels
 * @body autoPayoutEnabled: Enable automatic payouts
 * @body payoutThreshold: Minimum payout threshold
 * @example PUT /api/admin/v1/financial/mlm-commission-structure
 * @body {
 *   "levels": [
 *     { "level": 1, "percentage": 10 },
 *     { "level": 2, "percentage": 5 }
 *   ],
 *   "platformFeePercentage": 5,
 *   "maxLevels": 3,
 *   "autoPayoutEnabled": true,
 *   "payoutThreshold": 100
 * }
 */
// router.put('/financial/mlm-commission-structure', 
//     verifyAdminToken, 
//     checkAdminPermission('mlmSettings'), 
//     adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
//     noLogActivity, 
//     adminV1Controller.updateMlmCommissionStructure
// );

/**
 * @route POST /api/admin/v1/financial/process-mlm-commission
 * @desc Process MLM commission for subscription
 * @access Private (Admin)
 * @body subscriptionId: Subscription ID
 * @body subscriptionAmount: Subscription amount
 * @body coachId: Coach ID
 * @example POST /api/admin/v1/financial/process-mlm-commission
 * @body {
 *   "subscriptionId": "sub_id_here",
 *   "subscriptionAmount": 1000,
 *   "coachId": "coach_id_here"
 * }
 */
// router.post('/financial/process-mlm-commission', 
//     verifyAdminToken, 
//     checkAdminPermission('mlmSettings'), 
//     adminRateLimit(10, 60 * 1000), // 10 requests per minute
//     noLogActivity, 
//     adminV1Controller.processMlmCommission
// );

/**
 * @route GET /api/admin/v1/financial/platform-fees
 * @desc Get platform fee settings
 * @access Private (Admin)
 * @example GET /api/admin/v1/financial/platform-fees
 */
// router.get('/financial/platform-fees', 
//     verifyAdminToken, 
//     checkAdminPermission('systemSettings'), 
//     noLogActivity, 
//     adminV1Controller.getPlatformFees
// );

/**
 * @route PUT /api/admin/v1/financial/platform-fees
 * @desc Update platform fee settings
 * @access Private (Admin)
 * @body subscriptionFee: Subscription fee percentage
 * @body transactionFee: Transaction fee percentage
 * @body payoutFee: Payout fee percentage
 * @body refundFee: Refund fee percentage
 * @example PUT /api/admin/v1/financial/platform-fees
 * @body {
 *   "subscriptionFee": 5.0,
 *   "transactionFee": 2.0,
 *   "payoutFee": 1.0,
 *   "refundFee": 0.5
 * }
 */
// router.put('/financial/platform-fees', 
//     verifyAdminToken, 
//     checkAdminPermission('systemSettings'), 
//     adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
//     noLogActivity, 
//     adminV1Controller.updatePlatformFees
// );

/**
 * @route GET /api/admin/v1/financial/analytics-dashboard
 * @desc Get comprehensive financial analytics dashboard
 * @access Private (Admin)
 * @query timeRange (optional): Time range in days (default: 30)
 * @example GET /api/admin/v1/financial/analytics-dashboard?timeRange=30
 */
// router.get('/financial/analytics-dashboard', 
//     verifyAdminToken, 
//     checkAdminPermission('viewAnalytics'), 
//     noLogActivity, 
//     adminV1Controller.getFinancialAnalyticsDashboard
// );

// ===== HIERARCHY REQUEST MANAGEMENT =====

/**
 * @route GET /api/admin/v1/hierarchy-requests
 * @desc Get hierarchy change requests with filtering and pagination
 * @access Private (Admin)
 * @query page (optional): Page number (default: 1)
 * @query limit (optional): Items per page (default: 20)
 * @query status (optional): Filter by request status
 * @query coachId (optional): Filter by coach ID
 * @query sortBy (optional): Sort field (default: createdAt)
 * @query sortOrder (optional): Sort order (asc/desc, default: desc)
 * @example GET /api/admin/v1/hierarchy-requests?page=1&limit=20&status=pending
 */
router.get('/hierarchy-requests', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    adminV1Controller.getHierarchyRequests
);

/**
 * @route PUT /api/admin/v1/hierarchy-requests/:requestId
 * @desc Process hierarchy change request (approve/reject)
 * @access Private (Admin)
 * @param requestId: Request ID
 * @body status: Request status (approved/rejected)
 * @body notes: Admin notes (optional)
 * @example PUT /api/admin/v1/hierarchy-requests/req_id_here
 * @body { "status": "approved", "notes": "Request approved after review" }
 */
router.put('/hierarchy-requests/:requestId', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    adminRateLimit(10, 60 * 1000), // 10 requests per minute
    adminV1Controller.processHierarchyRequest
);

/**
 * @route POST /api/admin/v1/hierarchy-requests
 * @desc Create hierarchy change request (for coaches)
 * @access Private (Coach)
 * @body targetUserId: Target user ID
 * @body requestedLevel: Requested hierarchy level
 * @body reason: Reason for hierarchy change
 * @example POST /api/admin/v1/hierarchy-requests
 * @body {
 *   "targetUserId": "user_id_here",
 *   "requestedLevel": 2,
 *   "reason": "User has shown leadership potential"
 * }
 */
router.post('/hierarchy-requests', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'), 
    adminRateLimit(5, 60 * 1000), // 5 requests per minute
    adminV1Controller.createHierarchyRequest
);

// ========================================
// FINANCIAL MANAGEMENT ROUTES
// ========================================

/**
 * @route GET /api/admin/v1/financial/settings
 * @desc Get financial settings (Razorpay, fees, etc.)
 * @access Private (Admin)
 * @example GET /api/admin/v1/financial/settings
 */
router.get('/financial/settings', 
    verifyAdminToken, 
    checkAdminPermission('financialManagement'), 
    adminRateLimit(10, 60 * 1000), // 10 requests per minute
    adminV1Controller.getFinancialSettings
);

/**
 * @route PUT /api/admin/v1/financial/settings
 * @desc Update financial settings
 * @access Private (Admin)
 * @body razorpayApiKey: Razorpay API key
 * @body razorpaySecret: Razorpay secret
 * @body platformFee: Platform fee percentage
 * @body mlmCommission: MLM commission percentage
 * @body payoutFrequency: Payout frequency (daily/weekly/monthly)
 * @body payoutDay: Payout day
 * @body payoutTime: Payout time
 * @body taxRate: Tax rate percentage
 * @body upiEnabled: Enable UPI payouts
 * @body bankTransferEnabled: Enable bank transfer payouts
 * @body minimumPayoutAmount: Minimum payout amount
 * @example PUT /api/admin/v1/financial/settings
 * @body {
 *   "razorpayApiKey": "rzp_test_...",
 *   "razorpaySecret": "secret_...",
 *   "platformFee": 5.0,
 *   "mlmCommission": 10.0,
 *   "payoutFrequency": "weekly",
 *   "payoutDay": "monday",
 *   "payoutTime": "09:00",
 *   "taxRate": 18.0,
 *   "upiEnabled": true,
 *   "bankTransferEnabled": true,
 *   "minimumPayoutAmount": 100
 * }
 */
router.put('/financial/settings', 
    verifyAdminToken, 
    checkAdminPermission('financialManagement'), 
    adminRateLimit(5, 60 * 1000), // 5 requests per minute
    logAdminActivity('financial_settings_update'),
    adminV1Controller.updateFinancialSettings
);

/**
 * @route GET /api/admin/v1/financial/revenue-stats
 * @desc Get revenue statistics and Razorpay balance
 * @access Private (Admin)
 * @example GET /api/admin/v1/financial/revenue-stats
 */
router.get('/financial/revenue-stats', 
    verifyAdminToken, 
    checkAdminPermission('financialManagement'), 
    adminRateLimit(20, 60 * 1000), // 20 requests per minute
    adminV1Controller.getRevenueStats
);

/**
 * @route GET /api/admin/v1/financial/coaches-payout
 * @desc Get coaches eligible for payout
 * @access Private (Admin)
 * @example GET /api/admin/v1/financial/coaches-payout
 */
router.get('/financial/coaches-payout', 
    verifyAdminToken, 
    checkAdminPermission('financialManagement'), 
    adminRateLimit(20, 60 * 1000), // 20 requests per minute
    adminV1Controller.getCoachesForPayout
);

/**
 * @route GET /api/admin/v1/financial/payment-history
 * @desc Get payment and payout history
 * @access Private (Admin)
 * @example GET /api/admin/v1/financial/payment-history
 */
router.get('/financial/payment-history', 
    verifyAdminToken, 
    checkAdminPermission('financialManagement'), 
    adminRateLimit(20, 60 * 1000), // 20 requests per minute
    adminV1Controller.getPaymentHistory
);

/**
 * @route POST /api/admin/v1/financial/migrate-subscription-payments
 * @desc Migrate existing subscription payments to RazorpayPayment records
 * @access Private (Admin)
 * @example POST /api/admin/v1/financial/migrate-subscription-payments
 */
router.post('/financial/migrate-subscription-payments', 
    verifyAdminToken, 
    checkAdminPermission('financialManagement'), 
    adminRateLimit(1, 60 * 1000), // 1 request per minute (migration is expensive)
    logAdminActivity('subscription_payment_migration'),
    adminV1Controller.migrateSubscriptionPayments
);

/**
 * @route POST /api/admin/v1/financial/process-payout
 * @desc Process individual coach payout
 * @access Private (Admin)
 * @body coachId: Coach ID
 * @body amount: Payout amount
 * @example POST /api/admin/v1/financial/process-payout
 * @body { "coachId": "coach_id_here", "amount": 5000 }
 */
router.post('/financial/process-payout', 
    verifyAdminToken, 
    checkAdminPermission('financialManagement'), 
    adminRateLimit(5, 60 * 1000), // 5 requests per minute
    logAdminActivity('coach_payout_process'),
    adminV1Controller.processCoachPayout
);

/**
 * @route POST /api/admin/v1/financial/payout-all
 * @desc Process payouts for all eligible coaches
 * @access Private (Admin)
 * @example POST /api/admin/v1/financial/payout-all
 */
router.post('/financial/payout-all', 
    verifyAdminToken, 
    checkAdminPermission('financialManagement'), 
    adminRateLimit(2, 60 * 1000), // 2 requests per minute
    logAdminActivity('bulk_payout_process'),
    adminV1Controller.processPayoutAll
);

/**
 * @route POST /api/admin/v1/financial/refresh-balance
 * @desc Refresh Razorpay balance
 * @access Private (Admin)
 * @example POST /api/admin/v1/financial/refresh-balance
 */
router.post('/financial/refresh-balance', 
    verifyAdminToken, 
    checkAdminPermission('financialManagement'), 
    adminRateLimit(10, 60 * 1000), // 10 requests per minute
    adminV1Controller.refreshRazorpayBalance
);

module.exports = router;
