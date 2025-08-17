const AdminSettings = require('../schema/AdminSettings');
const SystemLog = require('../schema/SystemLog');
const User = require('../schema/User');
const Lead = require('../schema/Lead');
const Payment = require('../schema/Payment');
const CoachPerformance = require('../schema/CoachPerformance');
const { v4: uuidv4 } = require('uuid');

// Helper function to create system log
const createSystemLog = async (logData) => {
    try {
        const log = new SystemLog({
            logId: `LOG_${Date.now()}_${uuidv4().substring(0, 8)}`,
            ...logData
        });
        await log.save();
    } catch (error) {
        console.error('Error creating system log:', error);
    }
};

// @desc    Get all admin settings
// @route   GET /api/admin/settings
// @access  Private (Admin only)
const getAdminSettings = async (req, res) => {
    try {
        let settings = await AdminSettings.findOne({ 'systemStatus.isActive': true });
        
        if (!settings) {
            // Create default settings if none exist
            settings = new AdminSettings();
            await settings.save();
            
            await createSystemLog({
                logType: 'admin_action',
                category: 'settings',
                action: 'CREATE_DEFAULT_SETTINGS',
                description: 'Default admin settings created',
                userId: req.user.id,
                userEmail: req.user.email,
                userRole: req.user.role,
                severity: 'low'
            });
        }

        res.json({
            success: true,
            message: 'Admin settings retrieved successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error getting admin settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve admin settings',
            error: error.message
        });
    }
};

// @desc    Update admin settings
// @route   PUT /api/admin/settings
// @access  Private (Admin only)
const updateAdminSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        
        if (!settings) {
            return res.status(400).json({
                success: false,
                message: 'Settings data is required'
            });
        }

        let adminSettings = await AdminSettings.findOne({ 'systemStatus.isActive': true });
        
        if (!adminSettings) {
            adminSettings = new AdminSettings();
        }

        // Store previous settings for logging
        const previousSettings = JSON.parse(JSON.stringify(adminSettings.toObject()));

        // Update settings
        Object.keys(settings).forEach(key => {
            if (adminSettings[key] !== undefined) {
                adminSettings[key] = settings[key];
            }
        });

        // Update system status
        adminSettings.systemStatus.lastUpdated = new Date();
        adminSettings.systemStatus.updatedBy = req.user.id;
        adminSettings.systemStatus.version = adminSettings.platformConfig.platformVersion;

        await adminSettings.save();

        // Log the changes
        const changedFields = Object.keys(settings);
        await createSystemLog({
            logType: 'admin_action',
            category: 'settings',
            action: 'UPDATE_SETTINGS',
            description: `Updated admin settings: ${changedFields.join(', ')}`,
            userId: req.user.id,
            userEmail: req.user.email,
            userRole: req.user.role,
            severity: 'medium',
            changes: {
                before: previousSettings,
                after: adminSettings.toObject(),
                fieldsChanged: changedFields
            }
        });

        res.json({
            success: true,
            message: 'Admin settings updated successfully',
            data: adminSettings
        });
    } catch (error) {
        console.error('Error updating admin settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update admin settings',
            error: error.message
        });
    }
};

// @desc    Get system dashboard data
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getAdminDashboard = async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        // Get user statistics
        const totalUsers = await User.countDocuments();
        const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
        const activeUsers = await User.countDocuments({ 
            lastActiveAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        // Get lead statistics
        const totalLeads = await Lead.countDocuments();
        const newLeads = await Lead.countDocuments({ createdAt: { $gte: startDate } });

        // Get payment statistics
        const totalPayments = await Payment.countDocuments();
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'successful' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Get MLM statistics
        const totalCoaches = await User.countDocuments({ role: 'coach' });
        const mlmPerformance = await CoachPerformance.aggregate([
            { $group: { 
                _id: null, 
                totalTeamSize: { $sum: '$overallStats.totalTeamSize' },
                totalTeamRevenue: { $sum: '$overallStats.totalTeamRevenue' }
            }}
        ]);

        // Get system logs
        const recentLogs = await SystemLog.find()
            .sort({ timestamp: -1 })
            .limit(10)
            .select('logType category action description severity timestamp');

        // Get performance metrics
        const criticalLogs = await SystemLog.countDocuments({ 
            severity: 'critical',
            timestamp: { $gte: startDate }
        });

        const errorLogs = await SystemLog.countDocuments({ 
            logType: 'error',
            timestamp: { $gte: startDate }
        });

        const dashboardData = {
            overview: {
                totalUsers,
                newUsers,
                activeUsers,
                totalLeads,
                newLeads,
                totalPayments,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalCoaches,
                criticalLogs,
                errorLogs
            },
            mlm: {
                totalTeamSize: mlmPerformance[0]?.totalTeamSize || 0,
                totalTeamRevenue: mlmPerformance[0]?.totalTeamRevenue || 0
            },
            recentActivity: recentLogs,
            period: days
        };

        res.json({
            success: true,
            message: 'Admin dashboard data retrieved successfully',
            data: dashboardData
        });
    } catch (error) {
        console.error('Error getting admin dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve admin dashboard data',
            error: error.message
        });
    }
};

// @desc    Get system logs with filtering
// @route   GET /api/admin/logs
// @access  Private (Admin only)
const getSystemLogs = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            logType, 
            category, 
            severity, 
            userId,
            startDate,
            endDate,
            search
        } = req.query;

        const query = {};

        // Apply filters
        if (logType) query.logType = logType;
        if (category) query.category = category;
        if (severity) query.severity = severity;
        if (userId) query.userId = userId;

        // Date range filter
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Search filter
        if (search) {
            query.$or = [
                { action: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { userEmail: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const logs = await SystemLog.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name email');

        const total = await SystemLog.countDocuments(query);

        res.json({
            success: true,
            message: 'System logs retrieved successfully',
            data: {
                logs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalLogs: total,
                    hasNext: skip + logs.length < total,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error getting system logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve system logs',
            error: error.message
        });
    }
};

// @desc    Get user management data
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            role, 
            status, 
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        // Apply filters
        if (role) query.role = role;
        if (status) query.isActive = status === 'active';
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const users = await User.find(query)
            .select('-password')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        // Get additional stats
        const stats = await User.aggregate([
            { $group: {
                _id: '$role',
                count: { $sum: 1 },
                activeCount: { $sum: { $cond: ['$isActive', 1, 0] } }
            }}
        ]);

        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalUsers: total,
                    hasNext: skip + users.length < total,
                    hasPrev: page > 1
                },
                stats
            }
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve users',
            error: error.message
        });
    }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:userId/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive, reason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const previousStatus = user.isActive;
        user.isActive = isActive;
        await user.save();

        // Log the action
        await createSystemLog({
            logType: 'admin_action',
            category: 'users',
            action: 'UPDATE_USER_STATUS',
            description: `User ${user.email} status changed from ${previousStatus} to ${isActive}. Reason: ${reason || 'No reason provided'}`,
            userId: req.user.id,
            userEmail: req.user.email,
            userRole: req.user.role,
            severity: 'medium',
            changes: {
                before: { isActive: previousStatus },
                after: { isActive },
                fieldsChanged: ['isActive']
            },
            relatedEntities: [{
                entityType: 'user',
                entityId: user._id,
                entityName: user.email
            }]
        });

        res.json({
            success: true,
            message: 'User status updated successfully',
            data: { user: { id: user._id, email: user.email, isActive: user.isActive } }
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: error.message
        });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        // Remove sensitive fields that shouldn't be updated
        delete updateData.password;
        delete updateData.role; // Role changes should be handled separately for security

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Store previous data for logging
        const previousData = JSON.parse(JSON.stringify(user.toObject()));

        // Update user
        Object.keys(updateData).forEach(key => {
            if (user[key] !== undefined) {
                user[key] = updateData[key];
            }
        });

        await user.save();

        // Log the action
        const changedFields = Object.keys(updateData);
        await createSystemLog({
            logType: 'admin_action',
            category: 'users',
            action: 'UPDATE_USER',
            description: `User ${user.email} updated: ${changedFields.join(', ')}`,
            userId: req.user.id,
            userEmail: req.user.email,
            userRole: req.user.role,
            severity: 'medium',
            changes: {
                before: previousData,
                after: user.toObject(),
                fieldsChanged: changedFields
            },
            relatedEntities: [{
                entityType: 'user',
                entityId: user._id,
                entityName: user.email
            }]
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user: { id: user._id, email: user.email, name: user.name, role: user.role, isActive: user.isActive } }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
};

// @desc    Add custom domain for admin management
// @route   POST /api/admin/domains
// @access  Private (Admin only)
const addDomain = async (req, res) => {
    try {
        const { domain, coachId, notes } = req.body;
        
        if (!domain || !coachId) {
            return res.status(400).json({
                success: false,
                message: 'Domain and coachId are required'
            });
        }

        // Check if domain already exists
        const existingDomain = await require('../schema/CustomDomain').findOne({ domain });
        if (existingDomain) {
            return res.status(400).json({
                success: false,
                message: 'Domain is already registered'
            });
        }

        // Verify coach exists
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            return res.status(400).json({
                success: false,
                message: 'Invalid coach ID'
            });
        }

        const CustomDomain = require('../schema/CustomDomain');
        const customDomain = await CustomDomain.create({
            coachId,
            domain: domain.toLowerCase(),
            metadata: { notes: notes || '' }
        });

        // Log the action
        await createSystemLog({
            logType: 'admin_action',
            category: 'domains',
            action: 'ADD_DOMAIN',
            description: `Admin added domain ${domain} for coach ${coach.email}`,
            userId: req.user.id,
            userEmail: req.user.email,
            userRole: req.user.role,
            severity: 'low',
            relatedEntities: [{
                entityType: 'domain',
                entityId: customDomain._id,
                entityName: domain
            }, {
                entityType: 'user',
                entityId: coach._id,
                entityName: coach.email
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Custom domain added successfully',
            data: customDomain
        });
    } catch (error) {
        console.error('Error adding domain:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add domain',
            error: error.message
        });
    }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAnalytics = async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        // User growth analytics
        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: {
                _id: { 
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                count: { $sum: 1 }
            }},
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // Lead generation analytics
        const leadAnalytics = await Lead.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: {
                _id: { 
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                count: { $sum: 1 },
                qualifiedCount: { $sum: { $cond: ['$isQualified', 1, 0] } }
            }},
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // Revenue analytics
        const revenueAnalytics = await Payment.aggregate([
            { $match: { 
                status: 'successful',
                createdAt: { $gte: startDate }
            }},
            { $group: {
                _id: { 
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
            }},
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // MLM performance analytics
        const mlmAnalytics = await CoachPerformance.aggregate([
            { $group: {
                _id: null,
                totalCoaches: { $sum: 1 },
                avgPerformanceScore: { $avg: '$performanceRating.score' },
                totalTeamSize: { $sum: '$overallStats.totalTeamSize' },
                totalTeamRevenue: { $sum: '$overallStats.totalTeamRevenue' }
            }}
        ]);

        // System performance analytics
        const systemLogs = await SystemLog.aggregate([
            { $match: { timestamp: { $gte: startDate } } },
            { $group: {
                _id: { 
                    year: { $year: '$timestamp' },
                    month: { $month: '$timestamp' },
                    day: { $dayOfMonth: '$timestamp' }
                },
                totalLogs: { $sum: 1 },
                errorLogs: { $sum: { $cond: [{ $eq: ['$logType', 'error'] }, 1, 0] } },
                criticalLogs: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } }
            }},
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        const analyticsData = {
            userGrowth,
            leadAnalytics,
            revenueAnalytics,
            mlmAnalytics: mlmAnalytics[0] || {},
            systemLogs,
            period: days
        };

        res.json({
            success: true,
            message: 'Analytics data retrieved successfully',
            data: analyticsData
        });
    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve analytics data',
            error: error.message
        });
    }
};

// @desc    Get system health status
// @route   GET /api/admin/health
// @access  Private (Admin only)
const getSystemHealth = async (req, res) => {
    try {
        // Get current system metrics
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();

        // Get database status
        const dbStatus = {
            connected: true, // Assuming connection is maintained
            collections: await AdminSettings.db.db.listCollections().toArray()
        };

        // Get recent error logs
        const recentErrors = await SystemLog.find({
            logType: 'error',
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }).count();

        // Get critical logs
        const criticalLogs = await SystemLog.find({
            severity: 'critical',
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }).count();

        // Get active users in last hour
        const activeUsers = await User.countDocuments({
            lastActiveAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
        });

        const healthStatus = {
            system: {
                uptime: Math.floor(uptime),
                memoryUsage: {
                    rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
                    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
                    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) // MB
                },
                nodeVersion: process.version,
                platform: process.platform
            },
            database: dbStatus,
            logs: {
                recentErrors,
                criticalLogs
            },
            users: {
                activeLastHour: activeUsers
            },
            status: recentErrors > 10 || criticalLogs > 0 ? 'warning' : 'healthy'
        };

        res.json({
            success: true,
            message: 'System health status retrieved successfully',
            data: healthStatus
        });
    } catch (error) {
        console.error('Error getting system health:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve system health status',
            error: error.message
        });
    }
};

// @desc    Clear system logs
// @route   DELETE /api/admin/logs/clear
// @access  Private (Admin only)
const clearSystemLogs = async (req, res) => {
    try {
        const { days = 90 } = req.query;
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const result = await SystemLog.deleteMany({
            timestamp: { $lt: cutoffDate }
        });

        // Log the action
        await createSystemLog({
            logType: 'admin_action',
            category: 'maintenance',
            action: 'CLEAR_SYSTEM_LOGS',
            description: `Cleared system logs older than ${days} days. Deleted ${result.deletedCount} logs.`,
            userId: req.user.id,
            userEmail: req.user.email,
            userRole: req.user.role,
            severity: 'low'
        });

        res.json({
            success: true,
            message: 'System logs cleared successfully',
            data: {
                deletedCount: result.deletedCount,
                cutoffDate
            }
        });
    } catch (error) {
        console.error('Error clearing system logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear system logs',
            error: error.message
        });
    }
};

module.exports = {
    getAdminSettings,
    updateAdminSettings,
    getAdminDashboard,
    getSystemLogs,
    getUsers,
    updateUser,
    updateUserStatus,
    getAnalytics,
    getSystemHealth,
    clearSystemLogs,
    addDomain
};
