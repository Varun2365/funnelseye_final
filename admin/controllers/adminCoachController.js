const asyncHandler = require('../../middleware/async');
const User = require('../../schema/User');
const adminNotificationService = require('../services/adminNotificationService');
const { generateCoachId } = require('../../controllers/advancedMlmController');

// @desc    Get all coaches with MLM information
// @route   GET /api/admin/coaches
// @access  Private (Admin only)
const getAllCoaches = asyncHandler(async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            level, 
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { role: 'coach' };
        
        // Apply filters
        if (status) query.isActive = status === 'active';
        if (level) query.currentLevel = parseInt(level);
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { selfCoachId: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const [coaches, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .populate('externalSponsorId', 'name phone email')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        // Get MLM statistics
        const mlmStats = await User.aggregate([
            { $match: { role: 'coach' } },
            { $group: {
                _id: '$currentLevel',
                count: { $sum: 1 },
                activeCount: { $sum: { $cond: ['$isActive', 1, 0] } }
            }},
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            message: 'Coaches retrieved successfully',
            data: {
                coaches,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalCoaches: total,
                    hasNext: skip + coaches.length < total,
                    hasPrev: page > 1
                },
                mlmStats
            }
        });
    } catch (error) {
        console.error('Error getting coaches:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve coaches',
            error: error.message
        });
    }
});

// @desc    Get single coach with full details
// @route   GET /api/admin/coaches/:id
// @access  Private (Admin only)
const getCoach = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        const coach = await User.findById(id)
            .select('-password')
            .populate('externalSponsorId', 'name phone email');

        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        // Get downline information
        const downline = await User.find({ 
            'mlmInfo.sponsorId': coach._id,
            role: 'coach'
        }).select('name email selfCoachId currentLevel isActive');

        // Get performance metrics
        const performance = await User.aggregate([
            { $match: { 'mlmInfo.sponsorId': coach._id, role: 'coach' } },
            { $group: {
                _id: null,
                totalDownline: { $sum: 1 },
                activeDownline: { $sum: { $cond: ['$isActive', 1, 0] } },
                totalLevels: { $addToSet: '$currentLevel' }
            }}
        ]);

        const coachData = {
            ...coach.toObject(),
            downline,
            performance: performance[0] || { totalDownline: 0, activeDownline: 0, totalLevels: [] }
        };

        res.json({
            success: true,
            message: 'Coach details retrieved successfully',
            data: coachData
        });
    } catch (error) {
        console.error('Error getting coach:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve coach details',
            error: error.message
        });
    }
});

// @desc    Update coach status and permissions
// @route   PUT /api/admin/coaches/:id/status
// @access  Private (Admin only)
const updateCoachStatus = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive, reason, permissions } = req.body;

        const coach = await User.findById(id);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        const previousStatus = coach.isActive;
        const previousPermissions = coach.permissions;

        // Update status and permissions
        if (isActive !== undefined) coach.isActive = isActive;
        if (permissions) coach.permissions = { ...coach.permissions, ...permissions };

        await coach.save();

        // Create notification for status change
        await adminNotificationService.createNotification({
            title: 'Coach Status Updated',
            message: `Coach ${coach.name} (${coach.email}) status changed from ${previousStatus} to ${isActive}. Reason: ${reason || 'No reason provided'}`,
            type: 'info',
            category: 'coach',
            priority: 'medium',
            targetAudience: 'admin_only',
            metadata: {
                source: 'coach_management',
                relatedEntity: 'user',
                entityId: coach._id,
                additionalData: { previousStatus, newStatus: isActive, reason }
            }
        });

        res.json({
            success: true,
            message: 'Coach status updated successfully',
            data: {
                coach: {
                    id: coach._id,
                    name: coach.name,
                    email: coach.email,
                    isActive: coach.isActive,
                    permissions: coach.permissions
                }
            }
        });
    } catch (error) {
        console.error('Error updating coach status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update coach status',
            error: error.message
        });
    }
});

// @desc    Update coach MLM information
// @route   PUT /api/admin/coaches/:id/mlm
// @access  Private (Admin only)
const updateCoachMLM = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { currentLevel, sponsorId, teamRankName, presidentTeamRankName } = req.body;

        const coach = await User.findById(id);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        const previousMLM = {
            currentLevel: coach.currentLevel,
            sponsorId: coach.mlmInfo?.sponsorId,
            teamRankName: coach.teamRankName,
            presidentTeamRankName: coach.presidentTeamRankName
        };

        // Update MLM information
        if (currentLevel !== undefined) coach.currentLevel = currentLevel;
        if (sponsorId !== undefined) {
            if (coach.mlmInfo) {
                coach.mlmInfo.sponsorId = sponsorId;
            } else {
                coach.mlmInfo = { sponsorId };
            }
        }
        if (teamRankName !== undefined) coach.teamRankName = teamRankName;
        if (presidentTeamRankName !== undefined) coach.presidentTeamRankName = presidentTeamRankName;

        await coach.save();

        // Create notification for MLM update
        await adminNotificationService.createNotification({
            title: 'Coach MLM Information Updated',
            message: `MLM information updated for coach ${coach.name} (${coach.email})`,
            type: 'info',
            category: 'coach',
            priority: 'medium',
            targetAudience: 'admin_only',
            metadata: {
                source: 'coach_management',
                relatedEntity: 'user',
                entityId: coach._id,
                additionalData: { previousMLM, newMLM: req.body }
            }
        });

        res.json({
            success: true,
            message: 'Coach MLM information updated successfully',
            data: {
                coach: {
                    id: coach._id,
                    name: coach.name,
                    email: coach.email,
                    currentLevel: coach.currentLevel,
                    mlmInfo: coach.mlmInfo,
                    teamRankName: coach.teamRankName,
                    presidentTeamRankName: coach.presidentTeamRankName
                }
            }
        });
    } catch (error) {
        console.error('Error updating coach MLM:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update coach MLM information',
            error: error.message
        });
    }
});

// @desc    Generate new coach ID
// @route   POST /api/admin/coaches/:id/generate-id
// @access  Private (Admin only)
const generateNewCoachId = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        const coach = await User.findById(id);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        const previousId = coach.selfCoachId;
        const newCoachId = generateCoachId();

        coach.selfCoachId = newCoachId;
        await coach.save();

        // Create notification for coach ID change
        await adminNotificationService.createNotification({
            title: 'New Coach ID Generated',
            message: `New coach ID ${newCoachId} generated for ${coach.name} (${coach.email})`,
            type: 'info',
            category: 'coach',
            priority: 'medium',
            targetAudience: 'admin_only',
            metadata: {
                source: 'coach_management',
                relatedEntity: 'user',
                entityId: coach._id,
                additionalData: { previousId, newId: newCoachId }
            }
        });

        res.json({
            success: true,
            message: 'New coach ID generated successfully',
            data: {
                coach: {
                    id: coach._id,
                    name: coach.name,
                    email: coach.email,
                    previousId,
                    newId: newCoachId
                }
            }
        });
    } catch (error) {
        console.error('Error generating coach ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate new coach ID',
            error: error.message
        });
    }
});

// @desc    Get coach performance analytics
// @route   GET /api/admin/coaches/:id/performance
// @access  Private (Admin only)
const getCoachPerformance = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { period = '30' } = req.query;
        const days = parseInt(period);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const coach = await User.findById(id);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        // Get downline performance
        const downlinePerformance = await User.aggregate([
            { $match: { 'mlmInfo.sponsorId': coach._id, role: 'coach' } },
            { $group: {
                _id: '$currentLevel',
                count: { $sum: 1 },
                activeCount: { $sum: { $cond: ['$isActive', 1, 0] } }
            }},
            { $sort: { _id: 1 } }
        ]);

        // Get recent activity
        const recentActivity = await User.aggregate([
            { $match: { 'mlmInfo.sponsorId': coach._id, role: 'coach' } },
            { $match: { lastActiveAt: { $gte: startDate } } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastActiveAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        // Get team growth
        const teamGrowth = await User.aggregate([
            { $match: { 'mlmInfo.sponsorId': coach._id, role: 'coach' } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        const performanceData = {
            coach: {
                id: coach._id,
                name: coach.name,
                email: coach.email,
                selfCoachId: coach.selfCoachId,
                currentLevel: coach.currentLevel
            },
            period: days,
            downline: {
                total: downlinePerformance.reduce((sum, level) => sum + level.count, 0),
                byLevel: downlinePerformance,
                active: downlinePerformance.reduce((sum, level) => sum + level.activeCount, 0)
            },
            activity: {
                recent: recentActivity,
                growth: teamGrowth
            },
            metrics: {
                teamSize: downlinePerformance.reduce((sum, level) => sum + level.count, 0),
                activeRate: downlinePerformance.reduce((sum, level) => sum + level.count, 0) > 0 
                    ? (downlinePerformance.reduce((sum, level) => sum + level.activeCount, 0) / downlinePerformance.reduce((sum, level) => sum + level.count, 0) * 100).toFixed(2)
                    : 0
            }
        };

        res.json({
            success: true,
            message: 'Coach performance analytics retrieved successfully',
            data: performanceData
        });
    } catch (error) {
        console.error('Error getting coach performance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve coach performance analytics',
            error: error.message
        });
    }
});

// @desc    Get MLM hierarchy overview
// @route   GET /api/admin/coaches/mlm/overview
// @access  Private (Admin only)
const getMLMOverview = asyncHandler(async (req, res) => {
    try {
        const { level } = req.query;

        const query = { role: 'coach' };
        if (level) query.currentLevel = parseInt(level);

        const [coaches, levelStats, sponsorStats] = await Promise.all([
            User.find(query).select('name email selfCoachId currentLevel isActive mlmInfo'),
            User.aggregate([
                { $match: { role: 'coach' } },
                { $group: {
                    _id: '$currentLevel',
                    count: { $sum: 1 },
                    activeCount: { $sum: { $cond: ['$isActive', 1, 0] } }
                }},
                { $sort: { _id: 1 } }
            ]),
            User.aggregate([
                { $match: { role: 'coach' } },
                { $group: {
                    _id: '$mlmInfo.sponsorId',
                    count: { $sum: 1 }
                }},
                { $sort: { count: -1 } },
                { $limit: 10 }
            ])
        ]);

        // Get top sponsors
        const topSponsors = await User.find({
            _id: { $in: sponsorStats.map(s => s._id).filter(id => id) }
        }).select('name email selfCoachId currentLevel');

        const mlmOverview = {
            totalCoaches: coaches.length,
            levelDistribution: levelStats,
            topSponsors: topSponsors.map(sponsor => ({
                ...sponsor.toObject(),
                downlineCount: sponsorStats.find(s => s._id.toString() === sponsor._id.toString())?.count || 0
            })),
            hierarchy: {
                levels: levelStats.length,
                maxLevel: Math.max(...levelStats.map(l => l._id)),
                averageDownline: coaches.length > 0 ? (coaches.filter(c => c.mlmInfo?.sponsorId).length / coaches.length).toFixed(2) : 0
            }
        };

        res.json({
            success: true,
            message: 'MLM overview retrieved successfully',
            data: mlmOverview
        });
    } catch (error) {
        console.error('Error getting MLM overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve MLM overview',
            error: error.message
        });
    }
});

// @desc    Impersonate coach (for support purposes)
// @route   POST /api/admin/coaches/:id/impersonate
// @access  Private (Admin only)
const impersonateCoach = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const coach = await User.findById(id);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        // Create impersonation token (this would typically be a JWT with limited scope)
        const impersonationData = {
            coachId: coach._id,
            coachEmail: coach.email,
            coachName: coach.name,
            adminId: req.user.id,
            adminEmail: req.user.email,
            reason: reason || 'Support request',
            timestamp: new Date(),
            expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        };

        // Create notification for impersonation
        await adminNotificationService.createNotification({
            title: 'Coach Account Impersonated',
            message: `Admin ${req.user.email} is impersonating coach ${coach.name} (${coach.email}). Reason: ${reason || 'Support request'}`,
            type: 'warning',
            category: 'coach',
            priority: 'high',
            targetAudience: 'admin_only',
            metadata: {
                source: 'coach_management',
                relatedEntity: 'user',
                entityId: coach._id,
                additionalData: impersonationData
            }
        });

        res.json({
            success: true,
            message: 'Coach impersonation initiated',
            data: {
                impersonation: impersonationData,
                coach: {
                    id: coach._id,
                    name: coach.name,
                    email: coach.email
                }
            }
        });
    } catch (error) {
        console.error('Error impersonating coach:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate coach impersonation',
            error: error.message
        });
    }
});

module.exports = {
    getAllCoaches,
    getCoach,
    updateCoachStatus,
    updateCoachMLM,
    generateNewCoachId,
    getCoachPerformance,
    getMLMOverview,
    impersonateCoach
};
