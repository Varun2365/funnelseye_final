const User = require('../../schema/User');
const Lead = require('../../schema/Lead');
const Payment = require('../../schema/Payment');
const Subscription = require('../../schema/Subscription');
const AdminNotification = require('../schemas/AdminNotification');
const Plan = require('../schemas/Plan');
const CreditPackage = require('../schemas/CreditPackage');
const CommissionRate = require('../schemas/CommissionRate');
const PaymentGateway = require('../schemas/PaymentGateway');

class AdminDashboardService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Get cached data or fetch fresh data
    async getCachedData(key, fetchFunction) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        const data = await fetchFunction();
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });

        return data;
    }

    // Clear cache for specific key
    clearCache(key) {
        this.cache.delete(key);
    }

    // Clear all cache
    clearAllCache() {
        this.cache.clear();
    }

    // Get real-time dashboard overview
    async getDashboardOverview() {
        try {
            const [
                userStats,
                leadStats,
                paymentStats,
                subscriptionStats,
                notificationStats,
                systemHealth
            ] = await Promise.all([
                this.getUserStatistics(),
                this.getLeadStatistics(),
                this.getPaymentStatistics(),
                this.getSubscriptionStatistics(),
                this.getNotificationStatistics(),
                this.getSystemHealth()
            ]);

            return {
                overview: {
                    users: userStats,
                    leads: leadStats,
                    payments: paymentStats,
                    subscriptions: subscriptionStats,
                    notifications: notificationStats,
                    system: systemHealth
                },
                lastUpdated: new Date(),
                cacheStatus: 'fresh'
            };
        } catch (error) {
            console.error('Error getting dashboard overview:', error);
            throw error;
        }
    }

    // Get user statistics
    async getUserStatistics() {
        return await this.getCachedData('user_stats', async () => {
            const now = new Date();
            const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const [
                totalUsers,
                newUsers30Days,
                newUsers7Days,
                newUsers24Hours,
                activeUsers7Days,
                activeUsers24Hours,
                userRoleStats
            ] = await Promise.all([
                User.countDocuments(),
                User.countDocuments({ createdAt: { $gte: last30Days } }),
                User.countDocuments({ createdAt: { $gte: last7Days } }),
                User.countDocuments({ createdAt: { $gte: last24Hours } }),
                User.countDocuments({ lastActiveAt: { $gte: last7Days } }),
                User.countDocuments({ lastActiveAt: { $gte: last24Hours } }),
                User.aggregate([
                    { $group: { _id: '$role', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ])
            ]);

            return {
                total: totalUsers,
                new: {
                    last30Days,
                    last7Days,
                    last24Hours
                },
                active: {
                    last7Days: activeUsers7Days,
                    last24Hours: activeUsers24Hours
                },
                byRole: userRoleStats,
                growthRate: this.calculateGrowthRate(newUsers7Days, newUsers30Days)
            };
        });
    }

    // Get lead statistics
    async getLeadStatistics() {
        return await this.getCachedData('lead_stats', async () => {
            const now = new Date();
            const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const [
                totalLeads,
                newLeads30Days,
                newLeads7Days,
                qualifiedLeads,
                leadSourceStats,
                leadStatusStats
            ] = await Promise.all([
                Lead.countDocuments(),
                Lead.countDocuments({ createdAt: { $gte: last30Days } }),
                Lead.countDocuments({ createdAt: { $gte: last7Days } }),
                Lead.countDocuments({ isQualified: true }),
                Lead.aggregate([
                    { $group: { _id: '$source', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ]),
                Lead.aggregate([
                    { $group: { _id: '$status', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ])
            ]);

            return {
                total: totalLeads,
                new: {
                    last30Days: newLeads30Days,
                    last7Days: newLeads7Days
                },
                qualified: qualifiedLeads,
                qualificationRate: totalLeads > 0 ? (qualifiedLeads / totalLeads * 100).toFixed(2) : 0,
                bySource: leadSourceStats,
                byStatus: leadStatusStats,
                growthRate: this.calculateGrowthRate(newLeads7Days, newLeads30Days)
            };
        });
    }

    // Get payment statistics
    async getPaymentStatistics() {
        return await this.getCachedData('payment_stats', async () => {
            const now = new Date();
            const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const [
                totalPayments,
                successfulPayments,
                failedPayments,
                pendingPayments,
                totalRevenue,
                revenue30Days,
                revenue7Days,
                paymentMethodStats,
                paymentStatusStats
            ] = await Promise.all([
                Payment.countDocuments(),
                Payment.countDocuments({ status: 'successful' }),
                Payment.countDocuments({ status: 'failed' }),
                Payment.countDocuments({ status: 'pending' }),
                Payment.aggregate([
                    { $match: { status: 'successful' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]),
                Payment.aggregate([
                    { $match: { status: 'successful', createdAt: { $gte: last30Days } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]),
                Payment.aggregate([
                    { $match: { status: 'successful', createdAt: { $gte: last7Days } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]),
                Payment.aggregate([
                    { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } },
                    { $sort: { total: -1 } }
                ]),
                Payment.aggregate([
                    { $group: { _id: '$status', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ])
            ]);

            return {
                total: totalPayments,
                byStatus: {
                    successful: successfulPayments,
                    failed: failedPayments,
                    pending: pendingPayments
                },
                successRate: totalPayments > 0 ? (successfulPayments / totalPayments * 100).toFixed(2) : 0,
                revenue: {
                    total: totalRevenue[0]?.total || 0,
                    last30Days: revenue30Days[0]?.total || 0,
                    last7Days: revenue7Days[0]?.total || 0
                },
                byMethod: paymentMethodStats,
                byStatus: paymentStatusStats,
                growthRate: this.calculateGrowthRate(revenue7Days[0]?.total || 0, revenue30Days[0]?.total || 0)
            };
        });
    }

    // Get subscription statistics
    async getSubscriptionStatistics() {
        return await this.getCachedData('subscription_stats', async () => {
            const now = new Date();
            const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const [
                totalSubscriptions,
                activeSubscriptions,
                expiredSubscriptions,
                cancelledSubscriptions,
                mrr,
                subscriptionPlanStats
            ] = await Promise.all([
                Subscription.countDocuments(),
                Subscription.countDocuments({ status: 'active' }),
                Subscription.countDocuments({ status: 'expired' }),
                Subscription.countDocuments({ status: 'cancelled' }),
                Subscription.aggregate([
                    { $match: { status: 'active' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]),
                Subscription.aggregate([
                    { $group: { _id: '$planType', count: { $sum: 1 }, total: { $sum: '$amount' } } },
                    { $sort: { total: -1 } }
                ])
            ]);

            return {
                total: totalSubscriptions,
                byStatus: {
                    active: activeSubscriptions,
                    expired: expiredSubscriptions,
                    cancelled: cancelledSubscriptions
                },
                mrr: mrr[0]?.total || 0,
                byPlan: subscriptionPlanStats,
                churnRate: totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions * 100).toFixed(2) : 0
            };
        });
    }

    // Get notification statistics
    async getNotificationStatistics() {
        return await this.getCachedData('notification_stats', async () => {
            const [
                totalNotifications,
                unreadNotifications,
                urgentNotifications,
                criticalNotifications,
                notificationCategoryStats
            ] = await Promise.all([
                AdminNotification.countDocuments(),
                AdminNotification.countDocuments({ isRead: false, isDismissed: false }),
                AdminNotification.countDocuments({ priority: 'urgent', isRead: false, isDismissed: false }),
                AdminNotification.countDocuments({ type: 'critical', isRead: false, isDismissed: false }),
                AdminNotification.aggregate([
                    { $match: { isRead: false, isDismissed: false } },
                    { $group: { _id: '$category', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ])
            ]);

            return {
                total: totalNotifications,
                unread: unreadNotifications,
                urgent: urgentNotifications,
                critical: criticalNotifications,
                byCategory: notificationCategoryStats
            };
        });
    }

    // Get system health
    async getSystemHealth() {
        return await this.getCachedData('system_health', async () => {
            const memoryUsage = process.memoryUsage();
            const uptime = process.uptime();

            // Get recent error logs count
            const recentErrors = await AdminNotification.countDocuments({
                type: 'error',
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });

            // Get critical notifications count
            const criticalNotifications = await AdminNotification.countDocuments({
                type: 'critical',
                isRead: false,
                isDismissed: false
            });

            // Determine system status
            let status = 'healthy';
            if (criticalNotifications > 0) status = 'critical';
            else if (recentErrors > 10) status = 'warning';
            else if (memoryUsage.heapUsed / memoryUsage.heapTotal > 0.9) status = 'warning';

            return {
                status,
                uptime: Math.floor(uptime),
                memory: {
                    used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                    total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                    percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
                },
                errors: {
                    last24Hours: recentErrors,
                    critical: criticalNotifications
                },
                timestamp: new Date()
            };
        });
    }

    // Get financial overview
    async getFinancialOverview() {
        return await this.getCachedData('financial_overview', async () => {
            const [
                plans,
                creditPackages,
                commissionRates,
                paymentGateways
            ] = await Promise.all([
                Plan.find({ isActive: true }).sort('sortOrder'),
                CreditPackage.find({ isActive: true }).sort('sortOrder'),
                CommissionRate.find({ isActive: true }),
                PaymentGateway.find({ isActive: true })
            ]);

            return {
                plans: {
                    total: plans.length,
                    active: plans.filter(p => p.isActive).length,
                    popular: plans.filter(p => p.isPopular).length
                },
                creditPackages: {
                    total: creditPackages.length,
                    byType: creditPackages.reduce((acc, pkg) => {
                        acc[pkg.type] = (acc[pkg.type] || 0) + 1;
                        return acc;
                    }, {})
                },
                commissionRates: {
                    total: commissionRates.length,
                    active: commissionRates.filter(r => r.isCurrentlyActive).length
                },
                paymentGateways: {
                    total: paymentGateways.length,
                    active: paymentGateways.filter(g => g.isActive).length,
                    default: paymentGateways.find(g => g.isDefault)
                }
            };
        });
    }

    // Calculate growth rate
    calculateGrowthRate(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(2);
    }

    // Refresh specific cache
    async refreshCache(key) {
        this.clearCache(key);
        return await this.getCachedData(key, async () => {
            // This will be handled by the specific method
            return null;
        });
    }

    // Refresh all cache
    async refreshAllCache() {
        this.clearAllCache();
        return await this.getDashboardOverview();
    }

    // Get real-time updates for specific section
    async getRealTimeUpdates(section) {
        switch (section) {
            case 'users':
                return await this.getUserStatistics();
            case 'leads':
                return await this.getLeadStatistics();
            case 'payments':
                return await this.getPaymentStatistics();
            case 'subscriptions':
                return await this.getSubscriptionStatistics();
            case 'notifications':
                return await this.getNotificationStatistics();
            case 'system':
                return await this.getSystemHealth();
            case 'financial':
                return await this.getFinancialOverview();
            default:
                return await this.getDashboardOverview();
        }
    }
}

module.exports = new AdminDashboardService();
