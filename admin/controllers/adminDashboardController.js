const asyncHandler = require('../../middleware/async');
const adminDashboardService = require('../services/adminDashboardService');
const adminNotificationService = require('../services/adminNotificationService');
const Plan = require('../schemas/Plan');
const CreditPackage = require('../schemas/CreditPackage');
const CommissionRate = require('../schemas/CommissionRate');
const PaymentGateway = require('../schemas/PaymentGateway');
const User = require('../../schema/User');
const Lead = require('../../schema/Lead');
const Payment = require('../../schema/Payment');
const Subscription = require('../../schema/Subscription');

// @desc    Get admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardOverview = asyncHandler(async (req, res) => {
    try {
        const dashboardData = await adminDashboardService.getDashboardOverview();
        
        res.json({
            success: true,
            message: 'Dashboard data retrieved successfully',
            data: dashboardData
        });
    } catch (error) {
        console.error('Error getting dashboard overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard data',
            error: error.message
        });
    }
});

// @desc    Get real-time updates for specific section
// @route   GET /api/admin/dashboard/updates/:section
// @access  Private (Admin only)
const getRealTimeUpdates = asyncHandler(async (req, res) => {
    try {
        const { section } = req.params;
        const updates = await adminDashboardService.getRealTimeUpdates(section);
        
        res.json({
            success: true,
            message: 'Real-time updates retrieved successfully',
            data: updates,
            section,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error getting real-time updates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve real-time updates',
            error: error.message
        });
    }
});

// @desc    Refresh dashboard cache
// @route   POST /api/admin/dashboard/refresh
// @access  Private (Admin only)
const refreshDashboardCache = asyncHandler(async (req, res) => {
    try {
        const { section } = req.body;
        
        if (section) {
            await adminDashboardService.refreshCache(section);
        } else {
            await adminDashboardService.refreshAllCache();
        }
        
        res.json({
            success: true,
            message: `Dashboard cache refreshed successfully${section ? ` for ${section}` : ''}`,
            data: {
                refreshedSection: section || 'all',
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Error refreshing dashboard cache:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh dashboard cache',
            error: error.message
        });
    }
});

// @desc    Get financial overview
// @route   GET /api/admin/dashboard/financial
// @access  Private (Admin only)
const getFinancialOverview = asyncHandler(async (req, res) => {
    try {
        const financialData = await adminDashboardService.getFinancialOverview();
        
        res.json({
            success: true,
            message: 'Financial overview retrieved successfully',
            data: financialData
        });
    } catch (error) {
        console.error('Error getting financial overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve financial overview',
            error: error.message
        });
    }
});

// @desc    Get system health status
// @route   GET /api/admin/dashboard/health
// @access  Private (Admin only)
const getSystemHealth = asyncHandler(async (req, res) => {
    try {
        const healthData = await adminDashboardService.getSystemHealth();
        
        // Create system health notification if status is critical
        if (healthData.status === 'critical') {
            await adminNotificationService.createSystemHealthAlert({
                status: 'critical',
                message: 'System is experiencing critical issues. Immediate attention required.',
                timestamp: new Date()
            });
        }
        
        res.json({
            success: true,
            message: 'System health status retrieved successfully',
            data: healthData
        });
    } catch (error) {
        console.error('Error getting system health:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve system health status',
            error: error.message
        });
    }
});

// @desc    Get notification statistics
// @route   GET /api/admin/dashboard/notifications
// @access  Private (Admin only)
const getNotificationStats = asyncHandler(async (req, res) => {
    try {
        const notificationStats = await adminDashboardService.getNotificationStatistics();
        
        res.json({
            success: true,
            message: 'Notification statistics retrieved successfully',
            data: notificationStats
        });
    } catch (error) {
        console.error('Error getting notification statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve notification statistics',
            error: error.message
        });
    }
});

// @desc    Get user activity summary
// @route   GET /api/admin/dashboard/user-activity
// @access  Private (Admin only)
const getUserActivity = asyncHandler(async (req, res) => {
    try {
        const { period = '7' } = req.query;
        const days = parseInt(period);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const [
            newUsers,
            activeUsers,
            userLogins,
            roleDistribution
        ] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: startDate } }),
            User.countDocuments({ lastActiveAt: { $gte: startDate } }),
            User.aggregate([
                { $match: { lastActiveAt: { $gte: startDate } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastActiveAt' } }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ]);

        const activityData = {
            period: days,
            newUsers,
            activeUsers,
            userLogins,
            roleDistribution,
            activityRate: newUsers > 0 ? (activeUsers / newUsers * 100).toFixed(2) : 0
        };

        res.json({
            success: true,
            message: 'User activity summary retrieved successfully',
            data: activityData
        });
    } catch (error) {
        console.error('Error getting user activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user activity summary',
            error: error.message
        });
    }
});

// @desc    Get revenue analytics
// @route   GET /api/admin/dashboard/revenue
// @access  Private (Admin only)
const getRevenueAnalytics = asyncHandler(async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const [
            totalRevenue,
            revenueByDay,
            revenueByMethod,
            subscriptionRevenue,
            creditRevenue
        ] = await Promise.all([
            Payment.aggregate([
                { $match: { status: 'successful', createdAt: { $gte: startDate } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Payment.aggregate([
                { $match: { status: 'successful', createdAt: { $gte: startDate } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$amount' } } },
                { $sort: { _id: 1 } }
            ]),
            Payment.aggregate([
                { $match: { status: 'successful', createdAt: { $gte: startDate } } },
                { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } },
                { $sort: { total: -1 } }
            ]),
            Subscription.aggregate([
                { $match: { status: 'active', createdAt: { $gte: startDate } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Payment.aggregate([
                { $match: { status: 'successful', createdAt: { $gte: startDate }, category: 'credits' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        const revenueData = {
            period: days,
            total: totalRevenue[0]?.total || 0,
            byDay: revenueByDay,
            byMethod: revenueByMethod,
            subscription: subscriptionRevenue[0]?.total || 0,
            credits: creditRevenue[0]?.total || 0,
            breakdown: {
                subscription: subscriptionRevenue[0]?.total || 0,
                credits: creditRevenue[0]?.total || 0,
                other: (totalRevenue[0]?.total || 0) - (subscriptionRevenue[0]?.total || 0) - (creditRevenue[0]?.total || 0)
            }
        };

        res.json({
            success: true,
            message: 'Revenue analytics retrieved successfully',
            data: revenueData
        });
    } catch (error) {
        console.error('Error getting revenue analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve revenue analytics',
            error: error.message
        });
    }
});

// @desc    Get platform performance metrics
// @route   GET /api/admin/dashboard/performance
// @access  Private (Admin only)
const getPlatformPerformance = asyncHandler(async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const [
            leadConversion,
            paymentSuccess,
            userRetention,
            systemUptime,
            responseTime
        ] = await Promise.all([
            Lead.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: null, total: { $sum: 1 }, qualified: { $sum: { $cond: ['$isQualified', 1, 0] } } } }
            ]),
            Payment.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: null, total: { $sum: 1 }, successful: { $sum: { $cond: [{ $eq: ['$status', 'successful'] }, 1, 0] } } } }
            ]),
            User.aggregate([
                { $match: { lastActiveAt: { $gte: startDate } } },
                { $group: { _id: null, count: { $sum: 1 } } }
            ]),
            Promise.resolve(99.9), // Mock system uptime - replace with actual monitoring
            Promise.resolve(150)    // Mock response time in ms - replace with actual monitoring
        ]);

        const performanceData = {
            period: days,
            metrics: {
                leadConversion: leadConversion[0] ? (leadConversion[0].qualified / leadConversion[0].total * 100).toFixed(2) : 0,
                paymentSuccess: paymentSuccess[0] ? (paymentSuccess[0].successful / paymentSuccess[0].total * 100).toFixed(2) : 0,
                userRetention: userRetention[0]?.count || 0,
                systemUptime: systemUptime,
                responseTime: responseTime
            },
            status: this.getPerformanceStatus(leadConversion[0], paymentSuccess[0], systemUptime)
        };

        res.json({
            success: true,
            message: 'Platform performance metrics retrieved successfully',
            data: performanceData
        });
    } catch (error) {
        console.error('Error getting platform performance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve platform performance metrics',
            error: error.message
        });
    }
});

// @desc    Get quick actions summary
// @route   GET /api/admin/dashboard/quick-actions
// @access  Private (Admin only)
const getQuickActions = asyncHandler(async (req, res) => {
    try {
        const [
            pendingCoaches,
            failedPayments,
            criticalAlerts,
            systemIssues
        ] = await Promise.all([
            User.countDocuments({ role: 'coach', isActive: false, 'profile.isApproved': false }),
            Payment.countDocuments({ status: 'failed', createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
            adminNotificationService.getUnreadNotifications(req.user.id, 'admin_only').then(notifications => 
                notifications.filter(n => n.priority === 'urgent' || n.type === 'critical').length
            ),
            adminDashboardService.getSystemHealth().then(health => health.status === 'critical' ? 1 : 0)
        ]);

        const quickActions = {
            pendingCoaches: {
                count: pendingCoaches,
                action: 'Review Coach Applications',
                url: '/admin/coaches/pending',
                priority: pendingCoaches > 0 ? 'high' : 'low'
            },
            failedPayments: {
                count: failedPayments,
                action: 'Review Failed Payments',
                url: '/admin/payments/failed',
                priority: failedPayments > 0 ? 'high' : 'low'
            },
            criticalAlerts: {
                count: criticalAlerts,
                action: 'Review Critical Alerts',
                url: '/admin/notifications/critical',
                priority: criticalAlerts > 0 ? 'urgent' : 'low'
            },
            systemIssues: {
                count: systemIssues,
                action: 'Check System Health',
                url: '/admin/system/health',
                priority: systemIssues > 0 ? 'urgent' : 'low'
            }
        };

        res.json({
            success: true,
            message: 'Quick actions summary retrieved successfully',
            data: quickActions
        });
    } catch (error) {
        console.error('Error getting quick actions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve quick actions summary',
            error: error.message
        });
    }
});

// Helper method to determine performance status
const getPerformanceStatus = (leadConversion, paymentSuccess, systemUptime) => {
    let status = 'excellent';
    
    if (leadConversion) {
        const conversionRate = leadConversion.qualified / leadConversion.total * 100;
        if (conversionRate < 10) status = 'poor';
        else if (conversionRate < 20) status = 'fair';
        else if (conversionRate < 30) status = 'good';
    }
    
    if (paymentSuccess) {
        const successRate = paymentSuccess.successful / paymentSuccess.total * 100;
        if (successRate < 90) status = 'poor';
        else if (successRate < 95) status = 'fair';
        else if (successRate < 98) status = 'good';
    }
    
    if (systemUptime < 95) status = 'poor';
    else if (systemUptime < 99) status = 'fair';
    
    return status;
};

module.exports = {
    getDashboardOverview,
    getRealTimeUpdates,
    refreshDashboardCache,
    getFinancialOverview,
    getSystemHealth,
    getNotificationStats,
    getUserActivity,
    getRevenueAnalytics,
    getPlatformPerformance,
    getQuickActions
};
