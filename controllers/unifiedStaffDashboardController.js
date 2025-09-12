const staffLeaderboardService = require('../services/staffLeaderboardService');
const workflowTaskService = require('../services/workflowTaskService');
const staffPerformanceService = require('../services/staffPerformanceService');
const staffDashboardService = require('../services/staffDashboardService');
const globalSettingsService = require('../services/globalSettingsService');
const Lead = require('../schema/Lead');
const Task = require('../schema/Task');
const Staff = require('../schema/Staff');
const StaffCalendar = require('../schema/StaffCalendar');
const Appointment = require('../schema/Appointment');
const AdminSystemSettings = require('../schema/AdminSystemSettings');
const User = require('../schema/User');
const asyncHandler = require('../middleware/async');
const { hasPermission } = require('../utils/permissions');

/**
 * Unified Staff Dashboard Controller
 * Consolidates all staff dashboard functionality into a single controller
 * Includes admin global settings awareness and staff deactivation checks
 */

class UnifiedStaffDashboardController {
    
    /**
     * Check if staff account is active and has proper permissions
     */
    async validateStaffAccess(req, res, next) {
        try {
            console.log('🔍 [ValidateStaffAccess] Starting validation...');
            const staffId = req.userId || req.user.id;
            console.log('🔍 [ValidateStaffAccess] Staff ID:', staffId);
            
            // Get staff details from User collection (discriminator pattern)
            console.log('🔍 [ValidateStaffAccess] Fetching staff details...');
            const staff = await User.findById(staffId).select('isActive coachId permissions role');
            console.log('🔍 [ValidateStaffAccess] Staff found:', !!staff);
            
            if (!staff) {
                return res.status(404).json({
                    success: false,
                    message: 'Staff account not found'
                });
            }
            
            // Check if user has staff role
            if (staff.role !== 'staff') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. This account is not a staff account.',
                    code: 'INVALID_ROLE'
                });
            }
            
            // Check if staff is active (default to true if not set)
            if (staff.isActive === false) {
                return res.status(403).json({
                    success: false,
                    message: 'Your staff account has been deactivated. Please contact your coach or administrator.',
                    code: 'STAFF_DEACTIVATED'
                });
            }
            
            // Check global system settings
            console.log('🔍 [ValidateStaffAccess] Fetching global settings...');
            const globalSettings = await globalSettingsService.getSettings();
            console.log('🔍 [ValidateStaffAccess] Global settings fetched:', !!globalSettings);
            
            // Check maintenance mode
            if (globalSettings.platformConfig.maintenanceMode) {
                return res.status(503).json({
                    success: false,
                    message: globalSettings.platformConfig.maintenanceMessage || 'System is under maintenance. Please try again later.',
                    code: 'MAINTENANCE_MODE'
                });
            }
            
            // Add staff info to request for use in other methods
            req.staffInfo = {
                staffId,
                coachId: staff.coachId,
                permissions: staff.permissions,
                isActive: staff.isActive
            };
            
            console.log('✅ [ValidateStaffAccess] Validation complete, calling next()');
            next();
        } catch (error) {
            console.error('Staff access validation error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error validating staff access'
            });
        }
    }

    /**
     * Get complete unified dashboard data
     * @route GET /api/staff-dashboard/unified/data
     * @access Private (Staff)
     */
    getUnifiedDashboardData = asyncHandler(async (req, res) => {
        const { timeRange = 30, sections = 'all' } = req.query;
        const staffId = req.staffInfo.staffId;
        const coachId = req.staffInfo.coachId;
        
        const requestedSections = sections === 'all' ? 
            ['overview', 'tasks', 'performance', 'achievements', 'team', 'calendar', 'notifications', 'analytics'] :
            sections.split(',');

        const dashboardData = {
            metadata: {
                staffId,
                coachId,
                timeRange: parseInt(timeRange),
                requestedSections,
                lastUpdated: new Date().toISOString(),
                globalSettings: await this.getRelevantGlobalSettings()
            }
        };

        // Get data for requested sections in parallel
        const sectionPromises = [];
        
        if (requestedSections.includes('overview')) {
            sectionPromises.push(
                this.getOverviewDataInternal(staffId, coachId, parseInt(timeRange))
                    .then(data => ({ section: 'overview', data }))
            );
        }
        
        if (requestedSections.includes('tasks')) {
            sectionPromises.push(
                this.getTasksData(staffId, parseInt(timeRange))
                    .then(data => ({ section: 'tasks', data }))
            );
        }
        
        if (requestedSections.includes('performance')) {
            sectionPromises.push(
                this.getPerformanceData(staffId, coachId, parseInt(timeRange))
                    .then(data => ({ section: 'performance', data }))
            );
        }
        
        if (requestedSections.includes('achievements')) {
            sectionPromises.push(
                this.getAchievementsData(staffId, coachId, parseInt(timeRange))
                    .then(data => ({ section: 'achievements', data }))
            );
        }
        
        if (requestedSections.includes('team')) {
            sectionPromises.push(
                this.getTeamData(staffId, coachId, parseInt(timeRange))
                    .then(data => ({ section: 'team', data }))
            );
        }
        
        if (requestedSections.includes('calendar')) {
            sectionPromises.push(
                this.getCalendarData(staffId, parseInt(timeRange))
                    .then(data => ({ section: 'calendar', data }))
            );
        }
        
        if (requestedSections.includes('notifications')) {
            sectionPromises.push(
                this.getNotificationsData(staffId, parseInt(timeRange))
                    .then(data => ({ section: 'notifications', data }))
            );
        }
        
        if (requestedSections.includes('analytics')) {
            sectionPromises.push(
                this.getAnalyticsDataInternal(staffId, parseInt(timeRange))
                    .then(data => ({ section: 'analytics', data }))
            );
        }

        try {
            const sectionResults = await Promise.all(sectionPromises);
            
            // Organize results by section
            sectionResults.forEach(({ section, data }) => {
                dashboardData[section] = data;
            });

            res.json({
                success: true,
                data: dashboardData
            });
        } catch (error) {
            console.error('Error getting unified dashboard data:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving dashboard data',
                error: error.message
            });
        }
    });

    /**
     * Get overview data endpoint
     * @route GET /api/staff-dashboard/unified/overview
     * @access Private (Staff)
     */
    getOverviewData = asyncHandler(async (req, res) => {
        const { timeRange = 30 } = req.query;
        const staffId = req.staffInfo.staffId;
        const coachId = req.staffInfo.coachId;

        const overviewData = await this.getOverviewDataInternal(staffId, coachId, parseInt(timeRange));

        res.json({
            success: true,
            data: overviewData
        });
    });

    /**
     * Get overview data with key metrics (internal method)
     */
    async getOverviewDataInternal(staffId, coachId, timeRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        const [tasks, leads, performance] = await Promise.all([
            Task.find({ assignedTo: staffId, createdAt: { $gte: startDate } }),
            Lead.find({ assignedTo: staffId, createdAt: { $gte: startDate } }),
            staffLeaderboardService.calculateStaffScore(staffId, coachId, timeRange)
        ]);

        const completedTasks = tasks.filter(task => task.status === 'Completed');
        const pendingTasks = tasks.filter(task => task.status === 'Pending');
        const overdueTasks = tasks.filter(task => task.status === 'Overdue');

        const convertedLeads = leads.filter(lead => lead.status === 'Converted');
        const conversionRate = leads.length > 0 ? (convertedLeads.length / leads.length) * 100 : 0;

        return {
            metrics: {
                totalTasks: tasks.length,
                completedTasks: completedTasks.length,
                pendingTasks: pendingTasks.length,
                overdueTasks: overdueTasks.length,
                taskCompletionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
                totalLeads: leads.length,
                convertedLeads: convertedLeads.length,
                conversionRate: Math.round(conversionRate * 100) / 100,
                currentScore: performance.scores.total,
                rank: await this.getStaffRank(staffId, coachId, timeRange)
            },
            quickActions: [
                { name: 'View Tasks', action: 'view_tasks', icon: '📋', route: '/tasks' },
                { name: 'Add Time Log', action: 'add_time_log', icon: '⏱️', route: '/time-log' },
                { name: 'Update Progress', action: 'update_progress', icon: '📈', route: '/progress' },
                { name: 'Request Help', action: 'request_help', icon: '🆘', route: '/help' },
                { name: 'View Achievements', action: 'view_achievements', icon: '🏆', route: '/achievements' },
                { name: 'Team Leaderboard', action: 'view_leaderboard', icon: '🏅', route: '/team' }
            ]
        };
    }

    /**
     * Get tasks data
     */
    async getTasksData(staffId, timeRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        const tasks = await Task.find({
            assignedTo: staffId,
            createdAt: { $gte: startDate }
        }).populate('relatedLead', 'name email phone status')
          .sort('-createdAt');

        const tasksByStatus = {
            pending: tasks.filter(task => task.status === 'Pending'),
            inProgress: tasks.filter(task => task.status === 'In Progress'),
            completed: tasks.filter(task => task.status === 'Completed'),
            overdue: tasks.filter(task => task.status === 'Overdue')
        };

        const tasksByPriority = {
            urgent: tasks.filter(task => task.priority === 'URGENT'),
            high: tasks.filter(task => task.priority === 'HIGH'),
            medium: tasks.filter(task => task.priority === 'MEDIUM'),
            low: tasks.filter(task => task.priority === 'LOW')
        };

        return {
            summary: {
                total: tasks.length,
                byStatus: tasksByStatus,
                byPriority: tasksByPriority
            },
            recentTasks: tasks.slice(0, 10),
            upcomingDeadlines: tasks
                .filter(task => task.status !== 'Completed' && task.dueDate > new Date())
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 5)
        };
    }

    /**
     * Get performance data
     */
    async getPerformanceData(staffId, coachId, timeRange) {
        const performance = await staffLeaderboardService.calculateStaffScore(
            staffId, 
            coachId, 
            timeRange
        );

        const progress = await staffLeaderboardService.getStaffProgress(
            staffId, 
            coachId, 
            timeRange
        );

        return {
            currentScore: performance.scores.total,
            scoreBreakdown: performance.scores,
            metrics: performance.metrics,
            progress: progress,
            trends: await this.calculateTrends(staffId, timeRange),
            recommendations: this.generateRecommendations(performance)
        };
    }

    /**
     * Get achievements data
     */
    async getAchievementsData(staffId, coachId, timeRange) {
        const achievements = await staffLeaderboardService.getStaffAchievements(
            staffId, 
            coachId, 
            timeRange
        );

        const allAchievements = staffLeaderboardService.achievements;
        const earnedAchievements = achievements.filter(a => a.earned);
        const availableAchievements = Object.keys(allAchievements).filter(
            key => !earnedAchievements.find(a => a.achievement === key)
        );

        return {
            earned: earnedAchievements,
            available: availableAchievements.map(key => ({
                key,
                ...allAchievements[key]
            })),
            progress: this.calculateAchievementProgress(achievements, allAchievements)
        };
    }

    /**
     * Get team data
     */
    async getTeamData(staffId, coachId, timeRange) {
        const leaderboard = await staffLeaderboardService.getLeaderboard(
            coachId, 
            timeRange, 
            20
        );

        const currentStaff = leaderboard.find(staff => staff.staffId.toString() === staffId.toString());
        const teamAnalytics = await staffLeaderboardService.getTeamAnalytics(
            coachId, 
            timeRange
        );

        return {
            leaderboard: leaderboard.slice(0, 10), // Top 10
            currentPosition: leaderboard.findIndex(staff => staff.staffId.toString() === staffId.toString()) + 1,
            teamAnalytics,
            topPerformers: leaderboard.slice(0, 3),
            teamAverage: teamAnalytics.averageScore
        };
    }

    /**
     * Get calendar data
     */
    async getCalendarData(staffId, timeRange) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + timeRange);

        // Get calendar events
        const calendarEvents = await StaffCalendar.find({
            staffId,
            startTime: { $gte: startDate, $lte: endDate }
        }).sort({ startTime: 1 });

        // Get assigned appointments
        const appointments = await Appointment.find({
            assignedStaffId: staffId,
            startTime: { $gte: startDate, $lte: endDate }
        }).populate('leadId', 'name email phone')
          .sort({ startTime: 1 });

        // Get upcoming deadlines from tasks
        const upcomingDeadlines = await Task.find({
            assignedTo: staffId,
            dueDate: { $gte: startDate, $lte: endDate },
            status: { $nin: ['Completed', 'Cancelled'] }
        }).sort({ dueDate: 1 });

        return {
            calendarEvents,
            appointments,
            upcomingDeadlines,
            dateRange: { start: startDate, end: endDate }
        };
    }

    /**
     * Get notifications data
     */
    async getNotificationsData(staffId, timeRange) {
        const notifications = [];

        // Check for overdue tasks
        const overdueTasks = await Task.find({
            assignedTo: staffId,
            status: { $in: ['Pending', 'In Progress'] },
            dueDate: { $lt: new Date() }
        });

        if (overdueTasks.length > 0) {
            notifications.push({
                id: 'overdue_tasks',
                type: 'warning',
                title: 'Overdue Tasks',
                message: `You have ${overdueTasks.length} overdue task(s)`,
                action: 'view_tasks',
                priority: 'HIGH',
                timestamp: new Date()
            });
        }

        // Check for upcoming deadlines
        const upcomingDeadlines = await Task.find({
            assignedTo: staffId,
            status: { $in: ['Pending', 'In Progress'] },
            dueDate: { 
                $gte: new Date(),
                $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
            }
        });

        if (upcomingDeadlines.length > 0) {
            notifications.push({
                id: 'upcoming_deadlines',
                type: 'info',
                title: 'Upcoming Deadlines',
                message: `You have ${upcomingDeadlines.length} task(s) due soon`,
                action: 'view_tasks',
                priority: 'MEDIUM',
                timestamp: new Date()
            });
        }

        return notifications;
    }

    /**
     * Get analytics data endpoint
     * @route GET /api/staff-dashboard/unified/analytics
     * @access Private (Staff)
     */
    getAnalyticsData = asyncHandler(async (req, res) => {
        const { timeRange = 30 } = req.query;
        const staffId = req.staffInfo.staffId;

        const analyticsData = await this.getAnalyticsDataInternal(staffId, parseInt(timeRange));

        res.json({
            success: true,
            data: analyticsData
        });
    });

    /**
     * Get analytics data (internal method)
     */
    async getAnalyticsDataInternal(staffId, timeRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        const [tasks, leads] = await Promise.all([
            Task.find({ assignedTo: staffId, createdAt: { $gte: startDate } }),
            Lead.find({ assignedTo: staffId, createdAt: { $gte: startDate } })
        ]);

        const taskEfficiency = this.calculateTaskEfficiency(tasks);
        const leadConversion = this.calculateLeadConversion(leads);
        const timeManagement = this.calculateTimeManagement(tasks);

        return {
            taskEfficiency,
            leadConversion,
            timeManagement,
            trends: await this.calculateTrends(staffId, timeRange),
            insights: this.generateInsights(tasks, leads)
        };
    }

    /**
     * Task Management Endpoints
     */

    /**
     * Get all tasks assigned to staff
     * @route GET /api/staff-dashboard/unified/tasks
     * @access Private (Staff)
     */
    getStaffTasks = asyncHandler(async (req, res) => {
        const { status, priority, stage, page = 1, limit = 20 } = req.query;
        const staffId = req.staffInfo.staffId;

        const query = { assignedTo: staffId };
        
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (stage) query.stage = stage;

        const skip = (page - 1) * limit;
        const tasks = await Task.find(query)
            .populate('relatedLead', 'name email phone status')
            .populate('coachId', 'name email')
            .sort({ dueDate: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Task.countDocuments(query);

        const [totalTasks, pendingTasks, inProgressTasks, completedTasks, overdueTasks] = await Promise.all([
            Task.countDocuments({ assignedTo: staffId }),
            Task.countDocuments({ assignedTo: staffId, status: 'Pending' }),
            Task.countDocuments({ assignedTo: staffId, status: 'In Progress' }),
            Task.countDocuments({ assignedTo: staffId, status: 'Completed' }),
            Task.countDocuments({ 
                assignedTo: staffId, 
                dueDate: { $lt: new Date() },
                status: { $nin: ['Completed', 'Cancelled'] }
            })
        ]);

        res.json({
            success: true,
            data: {
                tasks,
                summary: {
                    total: totalTasks,
                    pending: pendingTasks,
                    inProgress: inProgressTasks,
                    completed: completedTasks,
                    overdue: overdueTasks
                }
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    });

    /**
     * Update task status
     * @route PUT /api/staff-dashboard/unified/tasks/:id/status
     * @access Private (Staff)
     */
    updateTaskStatus = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status, notes } = req.body;
        const staffId = req.staffInfo.staffId;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const task = await Task.findOne({ _id: id, assignedTo: staffId });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Validate status transition
        const validTransitions = {
            'Pending': ['In Progress', 'Cancelled'],
            'In Progress': ['Completed', 'Paused', 'Overdue'],
            'Paused': ['In Progress', 'Cancelled'],
            'Overdue': ['In Progress', 'Completed', 'Cancelled']
        };

        if (!validTransitions[task.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from ${task.status} to ${status}`
            });
        }

        // Update task
        task.status = status;
        task.updatedAt = new Date();

        // Set completion time if completing
        if (status === 'Completed' && !task.completedAt) {
            task.completedAt = new Date();
        }

        // Add comment if notes provided
        if (notes) {
            task.comments.push({
                user: staffId,
                content: notes,
                createdAt: new Date()
            });
        }

        await task.save();

        const populatedTask = await Task.findById(id)
            .populate('relatedLead', 'name email phone status')
            .populate('coachId', 'name email');

        res.json({
            success: true,
            message: 'Task status updated successfully',
            data: populatedTask
        });
    });

    /**
     * Complete task with detailed completion data
     * @route POST /api/staff-dashboard/unified/tasks/:id/complete
     * @access Private (Staff)
     */
    completeTask = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { 
            completionNotes, 
            actualHours, 
            outcome, 
            qualityRating, 
            feedback 
        } = req.body;
        const staffId = req.staffInfo.staffId;

        const task = await Task.findOne({ _id: id, assignedTo: staffId });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        if (task.status === 'Completed') {
            return res.status(400).json({
                success: false,
                message: 'Task is already completed'
            });
        }

        // Update task completion
        task.status = 'Completed';
        task.completedAt = new Date();
        task.updatedAt = new Date();

        // Add completion data
        if (actualHours !== undefined) task.actualHours = actualHours;
        if (completionNotes) {
            task.comments.push({
                user: staffId,
                content: `COMPLETION: ${completionNotes}`,
                createdAt: new Date()
            });
        }

        // Add staff-specific fields
        if (outcome) task.outcome = outcome;
        if (qualityRating) task.qualityRating = qualityRating;
        if (feedback) task.feedback = feedback;

        // Calculate efficiency
        if (actualHours && task.estimatedHours) {
            task.efficiency = (task.estimatedHours / actualHours) * 100;
        }

        await task.save();

        // Calculate performance metrics
        const performance = {
            onTime: task.completedAt <= task.dueDate,
            efficiency: task.efficiency || 0,
            quality: qualityRating || 0
        };

        const populatedTask = await Task.findById(id)
            .populate('relatedLead', 'name email phone status')
            .populate('coachId', 'name email');

        res.json({
            success: true,
            message: 'Task completed successfully',
            data: {
                ...populatedTask.toObject(),
                performance
            }
        });
    });

    /**
     * Calendar Management Endpoints
     */

    /**
     * Get calendar events
     * @route GET /api/staff-dashboard/unified/calendar
     * @access Private (Staff)
     */
    getCalendarEvents = asyncHandler(async (req, res) => {
        const { startDate, endDate, eventType, status, limit = 50, page = 1 } = req.query;
        const staffId = req.staffInfo.staffId;

        const query = { staffId };
        
        if (eventType) query.eventType = eventType;
        if (status) query.status = status;

        // Date filtering
        if (startDate && endDate) {
            query.startTime = { $lt: new Date(endDate) };
            query.endTime = { $gt: new Date(startDate) };
        }

        const skip = (page - 1) * limit;
        const events = await StaffCalendar.find(query)
            .populate('relatedTask', 'name status')
            .populate('relatedLead', 'name email phone')
            .sort({ startTime: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await StaffCalendar.countDocuments(query);

        res.json({
            success: true,
            data: events,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    });

    /**
     * Create calendar event
     * @route POST /api/staff-dashboard/unified/calendar
     * @access Private (Staff)
     */
    createCalendarEvent = asyncHandler(async (req, res) => {
        const {
            eventType,
            title,
            description,
            startTime,
            endTime,
            priority,
            isRecurring,
            recurrencePattern,
            relatedTask,
            relatedLead,
            location,
            attendees,
            notes,
            tags,
            color,
            isPublic,
            reminder
        } = req.body;

        const staffId = req.staffInfo.staffId;
        const coachId = req.staffInfo.coachId;

        // Validate required fields
        if (!eventType || !title || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'eventType, title, startTime, and endTime are required'
            });
        }

        // Validate time logic
        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({
                success: false,
                message: 'startTime must be before endTime'
            });
        }

        // Check for overlapping events
        const overlapping = await StaffCalendar.findOverlapping(staffId, startTime, endTime);
        if (overlapping.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Event overlaps with existing calendar events',
                overlappingEvents: overlapping.map(e => ({
                    id: e._id,
                    title: e.title,
                    startTime: e.startTime,
                    endTime: e.endTime
                }))
            });
        }

        const calendarEvent = await StaffCalendar.create({
            staffId,
            coachId,
            eventType,
            title,
            description,
            startTime,
            endTime,
            priority,
            isRecurring,
            recurrencePattern,
            relatedTask,
            relatedLead,
            location,
            attendees,
            notes,
            tags,
            color,
            isPublic,
            reminder,
            metadata: {
                createdBy: staffId,
                lastModifiedBy: staffId,
                source: 'manual'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Calendar event created successfully',
            data: calendarEvent
        });
    });

    /**
     * Performance & Analytics Endpoints
     */

    /**
     * Get staff performance data
     * @route GET /api/staff-dashboard/unified/performance
     * @access Private (Staff)
     */
    getStaffPerformance = asyncHandler(async (req, res) => {
        console.log('🔍 [getStaffPerformance] Controller method called');
        const { timeRange = 30 } = req.query;
        const staffId = req.staffInfo.staffId;
        const coachId = req.staffInfo.coachId;
        console.log('🔍 [getStaffPerformance] Staff ID:', staffId, 'Coach ID:', coachId);

        // Calculate real performance data
        const performance = await this.calculateRealStaffPerformance(staffId, coachId, parseInt(timeRange));
        const trends = await this.calculateTrends(staffId, parseInt(timeRange));
        const recommendations = this.generateRecommendations(performance);

        res.json({
            success: true,
            data: {
                currentScore: performance.scores.total,
                scoreBreakdown: performance.scores,
                metrics: performance.metrics,
                progress: performance.progress,
                trends: trends,
                recommendations: recommendations,
                timeRange: parseInt(timeRange),
                lastUpdated: new Date().toISOString()
            }
        });
    });

    /**
     * Get staff achievements
     * @route GET /api/staff-dashboard/unified/achievements
     * @access Private (Staff)
     */
    getStaffAchievements = asyncHandler(async (req, res) => {
        const { timeRange = 30 } = req.query;
        const staffId = req.staffInfo.staffId;
        const coachId = req.staffInfo.coachId;

        const achievements = await staffLeaderboardService.getStaffAchievements(
            staffId, 
            coachId, 
            parseInt(timeRange)
        );

        res.json({
            success: true,
            data: achievements
        });
    });

    /**
     * Get team leaderboard
     * @route GET /api/staff-dashboard/unified/team/leaderboard
     * @access Private (Staff)
     */
    getTeamLeaderboard = asyncHandler(async (req, res) => {
        const { timeRange = 30, limit = 20 } = req.query;
        const coachId = req.staffInfo.coachId;

        const leaderboard = await staffLeaderboardService.getLeaderboard(
            coachId, 
            parseInt(timeRange), 
            parseInt(limit)
        );

        res.json({
            success: true,
            data: leaderboard
        });
    });

    /**
     * Utility Methods
     */

    async getRelevantGlobalSettings() {
        try {
            const settings = await globalSettingsService.getSettings();
            return {
                maintenanceMode: settings.platformConfig.maintenanceMode,
                maintenanceMessage: settings.platformConfig.maintenanceMessage,
                systemTimezone: settings.platformConfig.systemTimezone,
                dateFormat: settings.platformConfig.dateFormat,
                timeFormat: settings.platformConfig.timeFormat,
                debugMode: settings.platformConfig.debugMode
            };
        } catch (error) {
            console.error('Error getting global settings:', error);
            return {};
        }
    }

    async getStaffRank(staffId, coachId, timeRange) {
        const leaderboard = await staffLeaderboardService.getLeaderboard(
            coachId, 
            timeRange, 
            100
        );
        
        const position = leaderboard.findIndex(staff => 
            staff.staffId.toString() === staffId.toString()
        );
        
        return position + 1;
    }

    calculateTaskEfficiency(tasks) {
        const completedTasks = tasks.filter(task => task.status === 'Completed');
        const onTimeTasks = completedTasks.filter(task => 
            task.completedAt && task.completedAt <= task.dueDate
        );

        return {
            totalTasks: tasks.length,
            completedTasks: completedTasks.length,
            onTimeTasks: onTimeTasks.length,
            efficiencyRate: completedTasks.length > 0 ? 
                (onTimeTasks.length / completedTasks.length) * 100 : 0
        };
    }

    calculateLeadConversion(leads) {
        const convertedLeads = leads.filter(lead => lead.status === 'Converted');
        
        return {
            totalLeads: leads.length,
            convertedLeads: convertedLeads.length,
            conversionRate: leads.length > 0 ? 
                (convertedLeads.length / leads.length) * 100 : 0
        };
    }

    calculateTimeManagement(tasks) {
        const completedTasks = tasks.filter(task => 
            task.status === 'Completed' && task.estimatedHours && task.actualHours
        );

        if (completedTasks.length === 0) return { averageAccuracy: 0, tasks: 0 };

        const accuracyScores = completedTasks.map(task => {
            if (task.actualHours <= task.estimatedHours) return 100;
            return Math.max(0, (task.estimatedHours / task.actualHours) * 100);
        });

        return {
            averageAccuracy: accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length,
            tasks: completedTasks.length
        };
    }

    async calculateTrends(staffId, timeRange) {
        try {
            const trends = {
                scoreTrend: [],
                taskTrend: [],
                conversionTrend: [],
                efficiencyTrend: [],
                qualityTrend: []
            };

            // Calculate trends for the last 7 periods (weekly if timeRange is 30+ days, daily if less)
            const periodLength = timeRange >= 30 ? 7 : 1; // Weekly or daily periods
            const periodDays = Math.floor(timeRange / 7);

            for (let i = 6; i >= 0; i--) {
                const periodStart = new Date();
                periodStart.setDate(periodStart.getDate() - ((i + 1) * periodDays));
                
                const periodEnd = new Date();
                periodEnd.setDate(periodEnd.getDate() - (i * periodDays));

                // Get tasks for this period
                const periodTasks = await Task.find({
                    assignedTo: staffId,
                    createdAt: { $gte: periodStart, $lt: periodEnd }
                });

                // Get leads for this period
                const periodLeads = await Lead.find({
                    assignedTo: staffId,
                    createdAt: { $gte: periodStart, $lt: periodEnd }
                });

                // Calculate metrics for this period
                const completedTasks = periodTasks.filter(task => task.status === 'Completed');
                const convertedLeads = periodLeads.filter(lead => lead.status === 'Converted');
                
                // Task trend
                trends.taskTrend.push(completedTasks.length);
                
                // Conversion trend
                const conversionRate = periodLeads.length > 0 ? 
                    Math.round((convertedLeads.length / periodLeads.length) * 100) : 0;
                trends.conversionTrend.push(conversionRate);

                // Calculate efficiency trend
                const tasksWithTime = completedTasks.filter(task => 
                    task.estimatedHours && task.actualHours
                );
                const avgEfficiency = tasksWithTime.length > 0 ? 
                    tasksWithTime.reduce((sum, task) => {
                        const efficiency = (task.estimatedHours / task.actualHours) * 100;
                        return sum + Math.min(efficiency, 200); // Cap at 200%
                    }, 0) / tasksWithTime.length : 0;
                trends.efficiencyTrend.push(Math.round(avgEfficiency));

                // Calculate quality trend (based on task quality ratings)
                const tasksWithQuality = completedTasks.filter(task => task.qualityRating);
                const avgQuality = tasksWithQuality.length > 0 ? 
                    tasksWithQuality.reduce((sum, task) => sum + task.qualityRating, 0) / tasksWithQuality.length : 0;
                trends.qualityTrend.push(Math.round(avgQuality));

                // Calculate overall score for this period
                const periodScore = this.calculatePeriodScore({
                    completedTasks: completedTasks.length,
                    totalTasks: periodTasks.length,
                    convertedLeads: convertedLeads.length,
                    totalLeads: periodLeads.length,
                    avgEfficiency,
                    avgQuality
                });
                trends.scoreTrend.push(Math.round(periodScore));
            }

            return trends;
        } catch (error) {
            console.error('Error calculating trends:', error);
            // Return empty trends if calculation fails
            return {
                scoreTrend: [0, 0, 0, 0, 0, 0, 0],
                taskTrend: [0, 0, 0, 0, 0, 0, 0],
                conversionTrend: [0, 0, 0, 0, 0, 0, 0],
                efficiencyTrend: [0, 0, 0, 0, 0, 0, 0],
                qualityTrend: [0, 0, 0, 0, 0, 0, 0]
            };
        }
    }

    calculatePeriodScore(metrics) {
        const weights = {
            taskCompletion: 0.35,
            leadConversion: 0.25,
            efficiency: 0.20,
            quality: 0.20
        };

        let score = 0;

        // Task completion score
        if (metrics.totalTasks > 0) {
            score += (metrics.completedTasks / metrics.totalTasks) * weights.taskCompletion * 100;
        }

        // Lead conversion score
        if (metrics.totalLeads > 0) {
            score += (metrics.convertedLeads / metrics.totalLeads) * weights.leadConversion * 100;
        }

        // Efficiency score
        score += (metrics.avgEfficiency / 100) * weights.efficiency * 100;

        // Quality score
        score += (metrics.avgQuality / 10) * weights.quality * 100;

        return Math.min(score, 100); // Cap at 100
    }

    generateInsights(tasks, leads) {
        const insights = [];

        // Task insights
        if (tasks.length > 0) {
            const completedTasks = tasks.filter(task => task.status === 'Completed');
            const completionRate = completedTasks.length / tasks.length;
            
            if (completionRate < 0.8) {
                insights.push({
                    type: 'warning',
                    message: `Task completion rate is ${Math.round(completionRate * 100)}%. Consider reviewing your workflow and prioritizing tasks.`,
                    action: 'review_workflow',
                    priority: 'HIGH',
                    metric: 'task_completion',
                    currentValue: Math.round(completionRate * 100),
                    targetValue: 80
                });
            } else if (completionRate >= 0.95) {
                insights.push({
                    type: 'success',
                    message: `Excellent task completion rate of ${Math.round(completionRate * 100)}%! Keep up the great work.`,
                    action: 'maintain_performance',
                    priority: 'LOW',
                    metric: 'task_completion',
                    currentValue: Math.round(completionRate * 100),
                    targetValue: 80
                });
            }

            // Check for overdue tasks
            const overdueTasks = tasks.filter(task => 
                task.status !== 'Completed' && 
                task.dueDate && 
                new Date(task.dueDate) < new Date()
            );
            
            if (overdueTasks.length > 0) {
                insights.push({
                    type: 'warning',
                    message: `You have ${overdueTasks.length} overdue task(s). Consider updating priorities or requesting deadline extensions.`,
                    action: 'address_overdue',
                    priority: 'HIGH',
                    metric: 'overdue_tasks',
                    currentValue: overdueTasks.length,
                    targetValue: 0
                });
            }

            // Check task efficiency
            const tasksWithTime = completedTasks.filter(task => 
                task.estimatedHours && task.actualHours
            );
            
            if (tasksWithTime.length > 0) {
                const avgEfficiency = tasksWithTime.reduce((sum, task) => {
                    const efficiency = (task.estimatedHours / task.actualHours) * 100;
                    return sum + Math.min(efficiency, 200);
                }, 0) / tasksWithTime.length;

                if (avgEfficiency < 80) {
                    insights.push({
                        type: 'info',
                        message: `Task efficiency is ${Math.round(avgEfficiency)}%. Consider improving time estimation or workflow optimization.`,
                        action: 'improve_efficiency',
                        priority: 'MEDIUM',
                        metric: 'efficiency',
                        currentValue: Math.round(avgEfficiency),
                        targetValue: 100
                    });
                }
            }
        }

        // Lead insights
        if (leads.length > 0) {
            const convertedLeads = leads.filter(lead => lead.status === 'Converted');
            const conversionRate = convertedLeads.length / leads.length;
            
            if (conversionRate < 0.5) {
                insights.push({
                    type: 'info',
                    message: `Lead conversion rate is ${Math.round(conversionRate * 100)}%. Focus on lead qualification and follow-up strategies.`,
                    action: 'improve_conversion',
                    priority: 'MEDIUM',
                    metric: 'lead_conversion',
                    currentValue: Math.round(conversionRate * 100),
                    targetValue: 50
                });
            } else if (conversionRate >= 0.8) {
                insights.push({
                    type: 'success',
                    message: `Outstanding lead conversion rate of ${Math.round(conversionRate * 100)}%! Your lead management skills are excellent.`,
                    action: 'maintain_conversion',
                    priority: 'LOW',
                    metric: 'lead_conversion',
                    currentValue: Math.round(conversionRate * 100),
                    targetValue: 50
                });
            }

            // Check lead response time
            const leadsWithResponseTime = leads.filter(lead => 
                lead.firstResponseTime && lead.createdAt
            );
            
            if (leadsWithResponseTime.length > 0) {
                const avgResponseTime = leadsWithResponseTime.reduce((sum, lead) => {
                    const responseTime = (new Date(lead.firstResponseTime) - new Date(lead.createdAt)) / (1000 * 60); // minutes
                    return sum + responseTime;
                }, 0) / leadsWithResponseTime.length;

                if (avgResponseTime > 60) { // More than 1 hour
                    insights.push({
                        type: 'warning',
                        message: `Average lead response time is ${Math.round(avgResponseTime)} minutes. Faster responses typically improve conversion rates.`,
                        action: 'improve_response_time',
                        priority: 'MEDIUM',
                        metric: 'response_time',
                        currentValue: Math.round(avgResponseTime),
                        targetValue: 30
                    });
                }
            }
        }

        // Performance insights based on recent activity
        const recentTasks = tasks.filter(task => 
            new Date(task.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        
        if (recentTasks.length === 0 && tasks.length > 0) {
            insights.push({
                type: 'info',
                message: 'No new tasks assigned in the last 7 days. Consider reaching out to your coach for new assignments.',
                action: 'request_tasks',
                priority: 'LOW',
                metric: 'recent_activity',
                currentValue: 0,
                targetValue: 1
            });
        }

        // Sort insights by priority
        const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

        return insights.slice(0, 5); // Return top 5 insights
    }

    generateRecommendations(performance) {
        const recommendations = [];
        const scores = performance.scores;

        // Task completion recommendations
        if (scores.taskCompletion < 80) {
            recommendations.push({
                type: 'task_management',
                title: 'Improve Task Completion Rate',
                description: `Your task completion rate is ${Math.round(scores.taskCompletion)}%. Focus on completing tasks on time and maintaining quality standards. Consider breaking down large tasks into smaller, manageable pieces.`,
                priority: 'HIGH',
                currentScore: Math.round(scores.taskCompletion),
                targetScore: 80,
                actionItems: [
                    'Review your current task priorities',
                    'Break down complex tasks into smaller steps',
                    'Set realistic deadlines for each task',
                    'Use time-blocking techniques'
                ]
            });
        } else if (scores.taskCompletion >= 95) {
            recommendations.push({
                type: 'task_management',
                title: 'Maintain Excellent Task Completion',
                description: `Outstanding task completion rate of ${Math.round(scores.taskCompletion)}%! Continue your excellent work and consider mentoring other team members.`,
                priority: 'LOW',
                currentScore: Math.round(scores.taskCompletion),
                targetScore: 80,
                actionItems: [
                    'Share your productivity techniques with the team',
                    'Consider taking on additional responsibilities',
                    'Mentor newer team members'
                ]
            });
        }

        // Quality recommendations
        if (scores.qualityRating < 75) {
            recommendations.push({
                type: 'quality_improvement',
                title: 'Enhance Quality Standards',
                description: `Your quality rating is ${Math.round(scores.qualityRating)}%. Focus on improving client satisfaction and task quality ratings through better attention to detail and communication.`,
                priority: 'MEDIUM',
                currentScore: Math.round(scores.qualityRating),
                targetScore: 85,
                actionItems: [
                    'Double-check work before submission',
                    'Ask for feedback from clients and colleagues',
                    'Improve communication clarity',
                    'Follow up on completed tasks'
                ]
            });
        }

        // Efficiency recommendations
        if (scores.efficiency < 70) {
            recommendations.push({
                type: 'efficiency',
                title: 'Improve Time Management',
                description: `Your efficiency score is ${Math.round(scores.efficiency)}%. Work on completing tasks within estimated timeframes and improving your time management skills.`,
                priority: 'MEDIUM',
                currentScore: Math.round(scores.efficiency),
                targetScore: 85,
                actionItems: [
                    'Improve time estimation skills',
                    'Use productivity tools and techniques',
                    'Minimize distractions during work',
                    'Track time spent on different activities'
                ]
            });
        }

        // Leadership recommendations
        if (scores.leadership < 60) {
            recommendations.push({
                type: 'leadership',
                title: 'Develop Leadership Skills',
                description: `Your leadership score is ${Math.round(scores.leadership)}%. Consider taking initiative to help team members and contribute to team success.`,
                priority: 'LOW',
                currentScore: Math.round(scores.leadership),
                targetScore: 70,
                actionItems: [
                    'Offer to help colleagues with their tasks',
                    'Share knowledge and best practices',
                    'Participate in team meetings and discussions',
                    'Take on mentoring opportunities'
                ]
            });
        }

        // Innovation recommendations
        if (scores.innovation < 50) {
            recommendations.push({
                type: 'innovation',
                title: 'Contribute to Process Improvement',
                description: `Your innovation score is ${Math.round(scores.innovation)}%. Consider suggesting process improvements and innovative solutions to enhance team productivity.`,
                priority: 'LOW',
                currentScore: Math.round(scores.innovation),
                targetScore: 60,
                actionItems: [
                    'Identify bottlenecks in current processes',
                    'Suggest automation opportunities',
                    'Propose workflow improvements',
                    'Share ideas in team meetings'
                ]
            });
        }

        // Overall performance recommendations
        const overallScore = performance.scores.total;
        if (overallScore < 70) {
            recommendations.push({
                type: 'overall_performance',
                title: 'Focus on Overall Performance Improvement',
                description: `Your overall performance score is ${Math.round(overallScore)}%. Focus on the areas with the lowest scores to improve your overall performance.`,
                priority: 'HIGH',
                currentScore: Math.round(overallScore),
                targetScore: 80,
                actionItems: [
                    'Review your performance metrics regularly',
                    'Set specific goals for improvement',
                    'Seek feedback from your coach',
                    'Create a personal development plan'
                ]
            });
        } else if (overallScore >= 90) {
            recommendations.push({
                type: 'overall_performance',
                title: 'Maintain Excellence and Grow',
                description: `Excellent overall performance score of ${Math.round(overallScore)}%! Continue your outstanding work and consider taking on leadership roles or advanced responsibilities.`,
                priority: 'LOW',
                currentScore: Math.round(overallScore),
                targetScore: 80,
                actionItems: [
                    'Consider leadership opportunities',
                    'Mentor other team members',
                    'Take on advanced projects',
                    'Share your success strategies'
                ]
            });
        }

        // Sort recommendations by priority
        const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

        return recommendations.slice(0, 5); // Return top 5 recommendations
    }

    calculateAchievementProgress(achievements, allAchievements) {
        const earned = achievements.filter(a => a.earned).length;
        const total = Object.keys(allAchievements).length;
        
        // Find the next closest achievement to earn
        const nextAchievement = achievements.find(a => !a.earned && a.progress > 0);
        
        // Calculate progress towards next achievement
        const nextProgress = nextAchievement ? nextAchievement.progress : 0;
        
        // Get recent achievements (earned in last 30 days)
        const recentAchievements = achievements.filter(a => 
            a.earned && a.earnedAt && 
            new Date(a.earnedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );

        return {
            earned,
            total,
            percentage: Math.round((earned / total) * 100),
            nextAchievement: nextAchievement ? {
                key: nextAchievement.achievement,
                name: allAchievements[nextAchievement.achievement]?.name || 'Unknown Achievement',
                description: allAchievements[nextAchievement.achievement]?.description || 'Complete this achievement',
                progress: Math.round(nextProgress),
                threshold: allAchievements[nextAchievement.achievement]?.threshold || 0
            } : null,
            recentAchievements: recentAchievements.slice(0, 3),
            achievementStats: {
                totalEarned: earned,
                totalAvailable: total,
                completionRate: Math.round((earned / total) * 100),
                recentCount: recentAchievements.length,
                streak: this.calculateAchievementStreak(achievements)
            }
        };
    }

    calculateAchievementStreak(achievements) {
        // Calculate consecutive days with achievements
        const earnedAchievements = achievements.filter(a => a.earned && a.earnedAt)
            .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));

        if (earnedAchievements.length === 0) return 0;

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const achievement of earnedAchievements) {
            const achievementDate = new Date(achievement.earnedAt);
            achievementDate.setHours(0, 0, 0, 0);

            if (achievementDate.getTime() === currentDate.getTime()) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    // ===== ADDITIONAL METHODS FROM OTHER CONTROLLERS =====

    /**
     * Get staff notifications and alerts
     */
    async getNotifications(req, res) {
        try {
            const staffId = req.userId || req.user.id;
            const notifications = await this.generateStaffNotifications(staffId);
            
            res.json({
                success: true,
                data: notifications
            });
        } catch (error) {
            console.error('Error getting notifications:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting notifications'
            });
        }
    }

    /**
     * Generate staff notifications
     */
    async generateStaffNotifications(staffId) {
        const notifications = [];

        // Check for overdue tasks
        const overdueTasks = await Task.find({
            assignedTo: staffId,
            status: { $in: ['Pending', 'In Progress'] },
            dueDate: { $lt: new Date() }
        });

        if (overdueTasks.length > 0) {
            notifications.push({
                id: 'overdue_tasks',
                type: 'warning',
                title: 'Overdue Tasks',
                message: `You have ${overdueTasks.length} overdue task(s)`,
                action: 'view_tasks',
                priority: 'HIGH',
                count: overdueTasks.length,
                timestamp: new Date()
            });
        }

        // Check for upcoming deadlines
        const upcomingDeadlines = await Task.find({
            assignedTo: staffId,
            status: { $in: ['Pending', 'In Progress'] },
            dueDate: { 
                $gte: new Date(),
                $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
            }
        });

        if (upcomingDeadlines.length > 0) {
            notifications.push({
                id: 'upcoming_deadlines',
                type: 'info',
                title: 'Upcoming Deadlines',
                message: `You have ${upcomingDeadlines.length} task(s) due soon`,
                action: 'view_tasks',
                priority: 'MEDIUM',
                count: upcomingDeadlines.length,
                timestamp: new Date()
            });
        }

        return notifications.sort((a, b) => {
            const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    // ===== CALENDAR MANAGEMENT =====

    /**
     * Create a new calendar event
     */
    async createCalendarEvent(req, res) {
        try {
            const {
                staffId,
                eventType,
                title,
                description,
                startTime,
                endTime,
                priority,
                isRecurring,
                recurrencePattern,
                relatedTask,
                relatedLead,
                location,
                attendees,
                notes,
                tags,
                color,
                isPublic,
                reminder
            } = req.body;

            // Validate required fields
            if (!staffId || !eventType || !title || !startTime || !endTime) {
                return res.status(400).json({
                    success: false,
                    message: 'staffId, eventType, title, startTime, and endTime are required'
                });
            }

            // Validate time logic
            if (new Date(startTime) >= new Date(endTime)) {
                return res.status(400).json({
                    success: false,
                    message: 'startTime must be before endTime'
                });
            }

            // Check if staff exists and get coachId
            const staff = await User.findOne({ _id: staffId, role: 'staff' });
            if (!staff) {
                return res.status(404).json({
                    success: false,
                    message: 'Staff member not found'
                });
            }

            // Check permissions
            if (req.user.role === 'staff') {
                if (!hasPermission(req.staffPermissions, 'calendar:write')) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions to create calendar events'
                    });
                }
                // Staff can only create events for themselves
                if (String(staffId) !== String(req.userId || req.user.id)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Staff can only create events for themselves'
                    });
                }
            }

            // Check for overlapping events
            const overlapping = await StaffCalendar.findOverlapping(staffId, startTime, endTime);
            if (overlapping.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Event overlaps with existing calendar events',
                    overlappingEvents: overlapping.map(e => ({
                        id: e._id,
                        title: e.title,
                        startTime: e.startTime,
                        endTime: e.endTime
                    }))
                });
            }

            const calendarEvent = await StaffCalendar.create({
                staffId,
                coachId: staff.coachId,
                eventType,
                title,
                description,
                startTime,
                endTime,
                priority,
                isRecurring,
                recurrencePattern,
                relatedTask,
                relatedLead,
                location,
                attendees,
                notes,
                tags,
                color,
                isPublic,
                reminder,
                metadata: {
                    createdBy: req.userId || req.user.id,
                    lastModifiedBy: req.userId || req.user.id,
                    source: 'manual'
                }
            });

            return res.status(201).json({
                success: true,
                message: 'Calendar event created successfully',
                data: calendarEvent
            });

        } catch (err) {
            console.error('createCalendarEvent error:', err.message);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || 'Server Error'
            });
        }
    }

    /**
     * Update calendar event
     */
    async updateCalendarEvent(req, res) {
        try {
            const event = await StaffCalendar.findById(req.params.id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Calendar event not found'
                });
            }

            // Check access permissions
            this.ensureCalendarAccess(req, event);

            // Check permissions for staff
            if (req.user.role === 'staff') {
                if (!hasPermission(req.staffPermissions, 'calendar:update')) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions to update calendar events'
                    });
                }
            }

            const updates = req.body;
            delete updates.staffId; // Prevent changing staff assignment
            delete updates.coachId; // Prevent changing coach assignment

            // Check for overlapping events if time is being changed
            if (updates.startTime || updates.endTime) {
                const startTime = updates.startTime || event.startTime;
                const endTime = updates.endTime || event.endTime;
                
                if (new Date(startTime) >= new Date(endTime)) {
                    return res.status(400).json({
                        success: false,
                        message: 'startTime must be before endTime'
                    });
                }

                const overlapping = await StaffCalendar.findOverlapping(
                    event.staffId,
                    startTime,
                    endTime,
                    event._id
                );
                
                if (overlapping.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: 'Updated event overlaps with existing calendar events',
                        overlappingEvents: overlapping.map(e => ({
                            id: e._id,
                            title: e.title,
                            startTime: e.startTime,
                            endTime: e.endTime
                        }))
                    });
                }
            }

            // Update metadata
            updates.metadata = {
                ...event.metadata,
                lastModifiedBy: req.userId || req.user.id
            };

            const updatedEvent = await StaffCalendar.findByIdAndUpdate(
                event._id,
                { $set: updates },
                { new: true }
            ).populate({
                path: 'staffId',
                select: 'name email role',
                match: { role: 'staff' }
            })
             .populate('relatedTask', 'name status')
             .populate('relatedLead', 'name email phone');

            return res.status(200).json({
                success: true,
                message: 'Calendar event updated successfully',
                data: updatedEvent
            });

        } catch (err) {
            console.error('updateCalendarEvent error:', err.message);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || 'Server Error'
            });
        }
    }

    /**
     * Delete calendar event
     */
    async deleteCalendarEvent(req, res) {
        try {
            const event = await StaffCalendar.findById(req.params.id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Calendar event not found'
                });
            }

            // Check access permissions
            this.ensureCalendarAccess(req, event);

            // Check permissions for staff
            if (req.user.role === 'staff') {
                if (!hasPermission(req.staffPermissions, 'calendar:delete')) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions to delete calendar events'
                    });
                }
            }

            await StaffCalendar.findByIdAndDelete(event._id);

            return res.status(200).json({
                success: true,
                message: 'Calendar event deleted successfully'
            });

        } catch (err) {
            console.error('deleteCalendarEvent error:', err.message);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || 'Server Error'
            });
        }
    }

    /**
     * Get staff availability for a time range
     */
    async getStaffAvailability(req, res) {
        try {
            const { staffId } = req.params;
            const { startTime, endTime } = req.query;

            if (!startTime || !endTime) {
                return res.status(400).json({
                    success: false,
                    message: 'startTime and endTime query parameters are required'
                });
            }

            // Check permissions
            if (req.user.role === 'staff') {
                if (!hasPermission(req.staffPermissions, 'calendar:read')) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions to view availability'
                    });
                }
                // Staff can only see their own availability
                if (String(staffId) !== String(req.userId || req.user.id)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Staff can only view their own availability'
                    });
                }
            }

            const availability = await StaffCalendar.getAvailability(staffId, startTime, endTime);

            return res.status(200).json({
                success: true,
                data: availability
            });

        } catch (err) {
            console.error('getStaffAvailability error:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Server Error'
            });
        }
    }

    // ===== APPOINTMENT MANAGEMENT =====

    /**
     * Assign an appointment to a staff member
     */
    async assignAppointmentToStaff(req, res) {
        try {
            const { appointmentId, staffId } = req.body;
            
            if (!appointmentId || !staffId) {
                return res.status(400).json({
                    success: false,
                    message: 'appointmentId and staffId are required'
                });
            }

            // Verify coach has permission to assign appointments
            if (req.user.role === 'coach' && !hasPermission(req.staffPermissions, 'calendar:manage')) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to assign appointments'
                });
            }

            // Get the appointment
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Ensure coach owns the appointment
            if (req.user.role === 'coach' && String(appointment.coachId) !== String(req.user.coachId)) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only assign your own appointments'
                });
            }

            // Verify staff member exists and belongs to the coach
            const staff = await User.findById(staffId);
            if (!staff || staff.role !== 'staff') {
                return res.status(404).json({
                    success: false,
                    message: 'Staff member not found'
                });
            }

            if (req.user.role === 'coach' && String(staff.coachId) !== String(req.user.coachId)) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only assign to your own staff members'
                });
            }

            // Check if staff has calendar permissions
            if (!hasPermission(staff.permissions, 'calendar:read')) {
                return res.status(400).json({
                    success: false,
                    message: 'Staff member does not have calendar permissions'
                });
            }

            // Assign the appointment
            appointment.assignedStaffId = staffId;
            await appointment.save();

            const populatedAppointment = await Appointment.findById(appointmentId)
                .populate('assignedStaffId', 'name email')
                .populate('leadId', 'name email phone');

            return res.status(200).json({
                success: true,
                message: 'Appointment assigned to staff successfully',
                data: populatedAppointment
            });

        } catch (err) {
            console.error('assignAppointmentToStaff error:', err.message);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || 'Server Error'
            });
        }
    }

    /**
     * Get all appointments assigned to a specific staff member
     */
    async getStaffAppointments(req, res) {
        try {
            const { staffId } = req.params;
            const { startDate, endDate, status, page = 1, limit = 20 } = req.query;

            // Verify access permissions
            if (req.user.role === 'coach') {
                if (!hasPermission(req.staffPermissions, 'calendar:read')) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions to view appointments'
                    });
                }

                // Verify staff belongs to coach
                const staff = await User.findById(staffId);
                if (!staff || staff.role !== 'staff' || String(staff.coachId) !== String(req.user.coachId)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied'
                    });
                }
            } else if (req.user.role === 'staff') {
                // Staff can only view their own appointments
                if (String(staffId) !== String(req.userId || req.user.id)) {
                    return res.status(403).json({
                        success: false,
                        message: 'You can only view your own appointments'
                    });
                }
            }

            // Build query
            const query = { assignedStaffId: staffId };
            
            if (startDate && endDate) {
                query.startTime = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            if (status) {
                query.status = status;
            }

            const skip = (page - 1) * limit;
            const appointments = await Appointment.find(query)
                .populate('leadId', 'name email phone')
                .populate('coachId', 'name email')
                .sort({ startTime: 1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Appointment.countDocuments(query);

            return res.status(200).json({
                success: true,
                data: appointments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (err) {
            console.error('getStaffAppointments error:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Server Error'
            });
        }
    }

    /**
     * Get available staff members for appointment assignment
     * @route GET /api/staff-dashboard/unified/appointments/available-staff
     * @access Private (Staff)
     */
    getAvailableStaff = asyncHandler(async (req, res) => {
        const { appointmentDate, appointmentTime, duration = 30 } = req.query;

        if (!appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: 'appointmentDate and appointmentTime are required'
            });
        }

        // Verify coach permissions
        if (req.user.role === 'coach' && !hasPermission(req.staffPermissions, 'calendar:read')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view staff availability'
            });
        }

        const filterCoachId = (req.user.role === 'admin' || req.user.role === 'super_admin') && req.query.coachId ? req.query.coachId : req.user.coachId;

        // Get all active staff members
        const staff = await User.find({ 
            coachId: filterCoachId, 
            role: 'staff',
            isActive: { $ne: false }
        }).select('name email permissions');

        // Filter staff with calendar permissions
        const availableStaff = staff.filter(member => 
            hasPermission(member.permissions, 'calendar:read')
        );

        // If specific time is provided, check for conflicts
        if (appointmentDate && appointmentTime) {
            const appointmentStart = new Date(`${appointmentDate}T${appointmentTime}`);
            const appointmentEnd = new Date(appointmentStart.getTime() + duration * 60000);

            const availableWithConflicts = await Promise.all(
                availableStaff.map(async (member) => {
                    // Check for conflicting appointments
                    const conflicts = await Appointment.find({
                        assignedStaffId: member._id,
                        $or: [
                            { 
                                startTime: { $gte: appointmentStart, $lt: appointmentEnd }
                            },
                            {
                                startTime: { $lte: appointmentStart },
                                $expr: {
                                    $gte: [
                                        { $add: ['$startTime', { $multiply: ['$duration', 60000] }] },
                                        appointmentStart
                                    ]
                                }
                            }
                        ],
                        status: { $nin: ['cancelled'] }
                    });

                    return {
                        ...member.toObject(),
                        hasConflicts: conflicts.length > 0,
                        conflictCount: conflicts.length
                    };
                })
            );

            return res.status(200).json({
                success: true,
                data: availableWithConflicts,
                appointmentTime: {
                    start: appointmentStart,
                    end: appointmentEnd,
                    duration
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: availableStaff
        });

    });

    /**
     * Unassign an appointment from staff
     */
    async unassignAppointment(req, res) {
        try {
            const { appointmentId } = req.params;

            // Get the appointment
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Ensure proper access
            this.ensureAppointmentAccess(req, appointment);

            // Verify coach has permission
            if (req.user.role === 'coach' && !hasPermission(req.staffPermissions, 'calendar:manage')) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to unassign appointments'
                });
            }

            // Unassign the appointment
            appointment.assignedStaffId = null;
            await appointment.save();

            const populatedAppointment = await Appointment.findById(appointmentId)
                .populate('leadId', 'name email phone')
                .populate('coachId', 'name email');

            return res.status(200).json({
                success: true,
                message: 'Appointment unassigned successfully',
                data: populatedAppointment
            });

        } catch (err) {
            console.error('unassignAppointment error:', err.message);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || 'Server Error'
            });
        }
    }

    // ===== TASK MANAGEMENT =====

    /**
     * Get all tasks assigned to staff member
     */
    async getStaffTasks(req, res) {
        try {
            const { status, priority, stage, page = 1, limit = 20 } = req.query;
            const staffId = req.userId || req.user.id;

            const query = { assignedTo: staffId };
            
            if (status) query.status = status;
            if (priority) query.priority = priority;
            if (stage) query.stage = stage;

            const skip = (page - 1) * limit;
            const tasks = await Task.find(query)
                .populate('relatedLead', 'name email phone status')
                .populate('createdBy', 'name email')
                .sort('-createdAt')
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Task.countDocuments(query);

            res.json({
                success: true,
                data: tasks,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting staff tasks:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting staff tasks'
            });
        }
    }

    /**
     * Get specific task details
     */
    async getStaffTask(req, res) {
        try {
            const task = await Task.findById(req.params.id)
                .populate('relatedLead', 'name email phone status')
                .populate('assignedTo', 'name email')
                .populate('createdBy', 'name email');

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            // Check if staff can access this task
            if (req.user.role === 'staff' && String(task.assignedTo._id) !== String(req.userId || req.user.id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            res.json({
                success: true,
                data: task
            });
        } catch (error) {
            console.error('Error getting task:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting task'
            });
        }
    }

    /**
     * Start working on task
     */
    async startTask(req, res) {
        try {
            const taskId = req.params.id;

            const task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            // Check if staff can start this task
            if (req.user.role === 'staff' && String(task.assignedTo) !== String(req.userId || req.user.id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Start task
            task.status = 'in_progress';
            task.startedAt = new Date();

            await task.save();

            res.json({
                success: true,
                message: 'Task started successfully',
                data: task
            });
        } catch (error) {
            console.error('Error starting task:', error);
            res.status(500).json({
                success: false,
                message: 'Error starting task'
            });
        }
    }

    /**
     * Pause working on task
     */
    async pauseTask(req, res) {
        try {
            const taskId = req.params.id;

            const task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            // Check if staff can pause this task
            if (req.user.role === 'staff' && String(task.assignedTo) !== String(req.userId || req.user.id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Pause task
            task.status = 'paused';
            task.pausedAt = new Date();

            await task.save();

            res.json({
                success: true,
                message: 'Task paused successfully',
                data: task
            });
        } catch (error) {
            console.error('Error pausing task:', error);
            res.status(500).json({
                success: false,
                message: 'Error pausing task'
            });
        }
    }

    /**
     * Add comment to task
     */
    async addTaskComment(req, res) {
        try {
            const { comment } = req.body;
            const taskId = req.params.id;

            if (!comment) {
                return res.status(400).json({
                    success: false,
                    message: 'Comment is required'
                });
            }

            const task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            // Check if staff can comment on this task
            if (req.user.role === 'staff' && String(task.assignedTo) !== String(req.userId || req.user.id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Add comment
            if (!task.comments) task.comments = [];
            task.comments.push({
                user: req.userId || req.user.id,
                userName: req.user.name,
                comment: comment,
                timestamp: new Date()
            });

            await task.save();

            res.json({
                success: true,
                message: 'Comment added successfully',
                data: task
            });
        } catch (error) {
            console.error('Error adding comment:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding comment'
            });
        }
    }

    /**
     * Log time to task
     */
    async logTaskTime(req, res) {
        try {
            const { hours, description } = req.body;
            const taskId = req.params.id;

            if (!hours || hours <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid hours are required'
                });
            }

            const task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            // Check if staff can log time to this task
            if (req.user.role === 'staff' && String(task.assignedTo) !== String(req.userId || req.user.id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Log time
            if (!task.timeLogs) task.timeLogs = [];
            task.timeLogs.push({
                user: req.userId || req.user.id,
                userName: req.user.name,
                hours: hours,
                description: description,
                loggedAt: new Date()
            });

            // Update total logged hours
            task.totalLoggedHours = (task.totalLoggedHours || 0) + hours;

            await task.save();

            res.json({
                success: true,
                message: 'Time logged successfully',
                data: task
            });
        } catch (error) {
            console.error('Error logging time:', error);
            res.status(500).json({
                success: false,
                message: 'Error logging time'
            });
        }
    }

    /**
     * Get staff's personal task overview
     */
    async getMyTasks(req, res) {
        try {
            const staffId = req.userId || req.user.id;
            const { timeRange = 30 } = req.query;

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - timeRange);

            const tasks = await Task.find({
                assignedTo: staffId,
                createdAt: { $gte: startDate }
            }).populate('relatedLead', 'name email phone status')
              .sort('-createdAt');

            const tasksByStatus = {
                pending: tasks.filter(task => task.status === 'Pending'),
                inProgress: tasks.filter(task => task.status === 'In Progress'),
                completed: tasks.filter(task => task.status === 'Completed'),
                overdue: tasks.filter(task => task.status === 'Overdue')
            };

            res.json({
                success: true,
                data: {
                    tasks,
                    summary: {
                        total: tasks.length,
                        byStatus: tasksByStatus
                    },
                    recentTasks: tasks.slice(0, 10),
                    upcomingDeadlines: tasks
                        .filter(task => task.status !== 'Completed' && task.dueDate > new Date())
                        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                        .slice(0, 5)
                }
            });
        } catch (error) {
            console.error('Error getting my tasks:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting my tasks'
            });
        }
    }

    /**
     * Get overdue tasks
     */
    async getOverdueTasks(req, res) {
        try {
            const staffId = req.userId || req.user.id;

            const overdueTasks = await Task.find({
                assignedTo: staffId,
                dueDate: { $lt: new Date() },
                status: { $nin: ['Completed', 'Cancelled'] }
            }).populate('relatedLead', 'name email phone status')
              .sort('dueDate');

            res.json({
                success: true,
                data: overdueTasks
            });
        } catch (error) {
            console.error('Error getting overdue tasks:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting overdue tasks'
            });
        }
    }

    /**
     * Get upcoming tasks
     */
    async getUpcomingTasks(req, res) {
        try {
            const staffId = req.userId || req.user.id;
            const { days = 7 } = req.query;

            const endDate = new Date();
            endDate.setDate(endDate.getDate() + parseInt(days));

            const upcomingTasks = await Task.find({
                assignedTo: staffId,
                dueDate: { $gte: new Date(), $lte: endDate },
                status: { $nin: ['Completed', 'Cancelled'] }
            }).populate('relatedLead', 'name email phone status')
              .sort('dueDate');

            res.json({
                success: true,
                data: upcomingTasks
            });
        } catch (error) {
            console.error('Error getting upcoming tasks:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting upcoming tasks'
            });
        }
    }

    /**
     * Bulk update tasks
     */
    async bulkUpdateTasks(req, res) {
        try {
            const { taskIds, updates } = req.body;
            const staffId = req.userId || req.user.id;

            if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'taskIds array is required'
                });
            }

            // Verify all tasks belong to the staff member
            const tasks = await Task.find({
                _id: { $in: taskIds },
                assignedTo: staffId
            });

            if (tasks.length !== taskIds.length) {
                return res.status(403).json({
                    success: false,
                    message: 'Some tasks do not belong to you or do not exist'
                });
            }

            // Update tasks
            const result = await Task.updateMany(
                { _id: { $in: taskIds } },
                { $set: updates }
            );

            res.json({
                success: true,
                message: `${result.modifiedCount} tasks updated successfully`,
                data: {
                    modifiedCount: result.modifiedCount,
                    matchedCount: result.matchedCount
                }
            });
        } catch (error) {
            console.error('Error bulk updating tasks:', error);
            res.status(500).json({
                success: false,
                message: 'Error bulk updating tasks'
            });
        }
    }

    // ===== PERFORMANCE & ANALYTICS =====

    /**
     * Get comprehensive performance metrics
     */
    async getPerformanceMetrics(req, res) {
        try {
            const { timeRange = 30, includeDetails = false } = req.query;
            const staffId = req.userId || req.user.id;

            const performance = await staffPerformanceService.calculateStaffPerformance(staffId, {
                timeRange: parseInt(timeRange),
                includeDetails: includeDetails === 'true'
            });

            res.json({
                success: true,
                data: performance
            });
        } catch (error) {
            console.error('Error getting performance metrics:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting performance metrics'
            });
        }
    }

    /**
     * Get performance comparison between staff members
     */
    async getPerformanceComparison(req, res) {
        try {
            const { timeRange = 30 } = req.query;
            const coachId = req.user.coachId || req.user.id;

            const comparison = await staffPerformanceService.getStaffPerformanceComparison(coachId, {
                timeRange: parseInt(timeRange)
            });

            res.json({
                success: true,
                data: comparison
            });
        } catch (error) {
            console.error('Error getting performance comparison:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting performance comparison'
            });
        }
    }

    /**
     * Get performance trends over time
     */
    async getPerformanceTrends(req, res) {
        try {
            const { period = 'monthly', months = 6 } = req.query;
            const staffId = req.userId || req.user.id;

            const trends = await staffPerformanceService.getPerformanceTrends(
                staffId, 
                period, 
                parseInt(months)
            );

            res.json({
                success: true,
                data: trends
            });
        } catch (error) {
            console.error('Error getting performance trends:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting performance trends'
            });
        }
    }

    // ===== HELPER METHODS =====

    /**
     * Ensure calendar access permissions
     */
    ensureCalendarAccess(req, calendarDoc) {
        if (req.user.role === 'admin' || req.user.role === 'super_admin') return true;
        
        if (req.user.role === 'coach') {
            // Coach can access any staff calendar under them
            if (String(calendarDoc.coachId) === String(req.user.coachId)) return true;
        }
        
        if (req.user.role === 'staff') {
            // Staff can only access their own calendar
            if (String(calendarDoc.staffId) === String(req.userId || req.user.id)) return true;
        }
        
        const err = new Error('Access denied');
        err.statusCode = 403;
        throw err;
    }

    /**
     * Ensure appointment access permissions
     */
    ensureAppointmentAccess(req, appointmentDoc) {
        if (req.user.role === 'admin' || req.user.role === 'super_admin') return true;
        
        if (req.user.role === 'coach') {
            // Coach can access appointments they created
            if (String(appointmentDoc.coachId) === String(req.user.coachId)) return true;
        }
        
        if (req.user.role === 'staff') {
            // Staff can only access appointments assigned to them
            if (String(appointmentDoc.assignedStaffId) === String(req.user.id)) return true;
        }
        
        const err = new Error('Access denied');
        err.statusCode = 403;
        throw err;
    }

    // ===== REAL PERFORMANCE CALCULATION METHODS =====

    /**
     * Calculate real staff performance data from database
     */
    async calculateRealStaffPerformance(staffId, coachId, timeRange) {
        console.log('🔍 [calculateRealStaffPerformance] Starting calculation');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);
        console.log('🔍 [calculateRealStaffPerformance] Start date:', startDate);

        // Get all tasks for this staff member
        console.log('🔍 [calculateRealStaffPerformance] Fetching tasks...');
        const tasks = await Task.find({
            assignedTo: staffId,
            coachId: coachId,
            createdAt: { $gte: startDate }
        });
        console.log('🔍 [calculateRealStaffPerformance] Tasks found:', tasks.length);

        // Get leads handled by this staff member
        console.log('🔍 [calculateRealStaffPerformance] Fetching leads...');
        const leads = await Lead.find({
            assignedTo: staffId,
            coachId: coachId,
            createdAt: { $gte: startDate }
        });
        console.log('🔍 [calculateRealStaffPerformance] Leads found:', leads.length);

        // Calculate task completion score
        const completedTasks = tasks.filter(task => task.status === 'Completed');
        const onTimeTasks = completedTasks.filter(task => 
            task.completedAt && task.completedAt <= task.dueDate
        );
        const taskCompletionScore = completedTasks.length > 0 ? 
            (onTimeTasks.length / completedTasks.length) * 100 : 0;

        // Calculate quality rating
        const qualityScore = await this.calculateRealQualityScore(tasks, leads);

        // Calculate efficiency score
        const efficiencyScore = await this.calculateRealEfficiencyScore(tasks);

        // Calculate lead conversion score
        const convertedLeads = leads.filter(lead => lead.status === 'Converted');
        const leadConversionScore = leads.length > 0 ? 
            (convertedLeads.length / leads.length) * 100 : 0;

        // Calculate response time score
        const responseTimeScore = await this.calculateRealResponseTimeScore(leads);

        // Calculate leadership score
        const leadershipScore = await this.calculateRealLeadershipScore(staffId, coachId, startDate);

        // Calculate innovation score
        const innovationScore = await this.calculateRealInnovationScore(staffId, coachId, startDate);

        // Calculate total score using weights
        const weights = {
            taskCompletion: 0.35,
            qualityRating: 0.25,
            efficiency: 0.20,
            leadConversion: 0.10,
            responseTime: 0.05,
            leadership: 0.03,
            innovation: 0.02
        };

        const totalScore = 
            (taskCompletionScore * weights.taskCompletion) +
            (qualityScore * weights.qualityRating) +
            (efficiencyScore * weights.efficiency) +
            (leadConversionScore * weights.leadConversion) +
            (responseTimeScore * weights.responseTime) +
            (leadershipScore * weights.leadership) +
            (innovationScore * weights.innovation);

        return {
            scores: {
                total: Math.round(totalScore),
                taskCompletion: Math.round(taskCompletionScore),
                qualityRating: Math.round(qualityScore),
                efficiency: Math.round(efficiencyScore),
                leadConversion: Math.round(leadConversionScore),
                responseTime: Math.round(responseTimeScore),
                leadership: Math.round(leadershipScore),
                innovation: Math.round(innovationScore)
            },
            metrics: {
                taskMetrics: {
                    totalTasks: tasks.length,
                    completedTasks: completedTasks.length,
                    onTimeTasks: onTimeTasks.length,
                    overdueTasks: tasks.filter(task => 
                        task.status !== 'Completed' && 
                        task.dueDate && 
                        new Date(task.dueDate) < new Date()
                    ).length
                },
                leadMetrics: {
                    totalLeads: leads.length,
                    convertedLeads: convertedLeads.length,
                    conversionRate: Math.round(leadConversionScore)
                },
                qualityMetrics: {
                    averageQuality: Math.round(qualityScore),
                    tasksWithQuality: tasks.filter(task => task.qualityRating).length
                },
                efficiencyMetrics: {
                    averageEfficiency: Math.round(efficiencyScore),
                    tasksWithTimeTracking: tasks.filter(task => 
                        task.estimatedHours && task.actualHours
                    ).length
                },
                responseMetrics: {
                    averageResponseTime: Math.round(responseTimeScore),
                    leadsWithResponseTime: leads.filter(lead => 
                        lead.firstResponseTime && lead.createdAt
                    ).length
                }
            },
            progress: await this.calculateRealProgress(staffId, coachId, timeRange, {
                scores: {
                    taskCompletion: taskCompletionScore,
                    leadConversion: leadConversionScore,
                    total: totalScore
                }
            })
        };
    }

    /**
     * Calculate real quality score from task ratings and lead feedback
     */
    async calculateRealQualityScore(tasks, leads) {
        let totalQuality = 0;
        let qualityCount = 0;

        // Get quality from task ratings
        const tasksWithQuality = tasks.filter(task => task.qualityRating);
        if (tasksWithQuality.length > 0) {
            const avgTaskQuality = tasksWithQuality.reduce((sum, task) => sum + task.qualityRating, 0) / tasksWithQuality.length;
            totalQuality += avgTaskQuality * 10; // Convert 1-10 scale to 0-100
            qualityCount++;
        }

        // Get quality from lead feedback (if available)
        const leadsWithFeedback = leads.filter(lead => lead.satisfactionRating);
        if (leadsWithFeedback.length > 0) {
            const avgLeadQuality = leadsWithFeedback.reduce((sum, lead) => sum + lead.satisfactionRating, 0) / leadsWithFeedback.length;
            totalQuality += avgLeadQuality * 10; // Convert 1-10 scale to 0-100
            qualityCount++;
        }

        return qualityCount > 0 ? totalQuality / qualityCount : 75; // Default to 75 if no data
    }

    /**
     * Calculate real efficiency score from time tracking
     */
    async calculateRealEfficiencyScore(tasks) {
        const tasksWithTime = tasks.filter(task => 
            task.status === 'Completed' && 
            task.estimatedHours && 
            task.actualHours
        );

        if (tasksWithTime.length === 0) return 80; // Default if no time data

        const efficiencyScores = tasksWithTime.map(task => {
            const efficiency = (task.estimatedHours / task.actualHours) * 100;
            return Math.min(efficiency, 200); // Cap at 200%
        });

        const avgEfficiency = efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length;
        return Math.min(avgEfficiency, 100); // Cap at 100%
    }

    /**
     * Calculate real response time score
     */
    async calculateRealResponseTimeScore(leads) {
        const leadsWithResponseTime = leads.filter(lead => 
            lead.firstResponseTime && lead.createdAt
        );

        if (leadsWithResponseTime.length === 0) return 85; // Default if no response time data

        const responseTimes = leadsWithResponseTime.map(lead => {
            const responseTimeMinutes = (new Date(lead.firstResponseTime) - new Date(lead.createdAt)) / (1000 * 60);
            return responseTimeMinutes;
        });

        const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        
        // Score based on response time (lower is better)
        // 0-30 minutes = 100, 30-60 minutes = 90, 60-120 minutes = 80, etc.
        if (avgResponseTime <= 30) return 100;
        if (avgResponseTime <= 60) return 90;
        if (avgResponseTime <= 120) return 80;
        if (avgResponseTime <= 240) return 70;
        if (avgResponseTime <= 480) return 60;
        return Math.max(50, 100 - (avgResponseTime / 10)); // Minimum 50
    }

    /**
     * Calculate real leadership score
     */
    async calculateRealLeadershipScore(staffId, coachId, startDate) {
        // This would be based on helping other staff members, mentoring, etc.
        // For now, return a base score that could be enhanced with more data
        const helpingTasks = await Task.find({
            createdBy: staffId,
            assignedTo: { $ne: staffId },
            createdAt: { $gte: startDate }
        });

        const leadershipScore = Math.min(100, helpingTasks.length * 10); // 10 points per helping task
        return leadershipScore;
    }

    /**
     * Calculate real innovation score
     */
    async calculateRealInnovationScore(staffId, coachId, startDate) {
        // This would be based on process improvements, suggestions, etc.
        // For now, return a base score that could be enhanced with more data
        const innovativeTasks = await Task.find({
            assignedTo: staffId,
            tags: { $in: ['innovation', 'improvement', 'optimization'] },
            createdAt: { $gte: startDate }
        });

        const innovationScore = Math.min(100, innovativeTasks.length * 15); // 15 points per innovative task
        return innovationScore;
    }

    /**
     * Calculate real progress over time
     */
    async calculateRealProgress(staffId, coachId, timeRange, currentPerformance = null) {
        // If currentPerformance is not provided, calculate it separately to avoid infinite loop
        if (!currentPerformance) {
            currentPerformance = await this.calculateRealStaffPerformance(staffId, coachId, timeRange);
        }
        
        // Calculate previous period performance for comparison
        const previousStartDate = new Date();
        previousStartDate.setDate(previousStartDate.getDate() - (timeRange * 2));
        const previousEndDate = new Date();
        previousEndDate.setDate(previousEndDate.getDate() - timeRange);

        const previousTasks = await Task.find({
            assignedTo: staffId,
            coachId: coachId,
            createdAt: { $gte: previousStartDate, $lt: previousEndDate }
        });

        const previousLeads = await Lead.find({
            assignedTo: staffId,
            coachId: coachId,
            createdAt: { $gte: previousStartDate, $lt: previousEndDate }
        });

        const previousCompletedTasks = previousTasks.filter(task => task.status === 'Completed');
        const previousConvertedLeads = previousLeads.filter(lead => lead.status === 'Converted');

        const previousTaskCompletion = previousTasks.length > 0 ? 
            (previousCompletedTasks.length / previousTasks.length) * 100 : 0;
        const previousLeadConversion = previousLeads.length > 0 ? 
            (previousConvertedLeads.length / previousLeads.length) * 100 : 0;

        return {
            taskCompletion: {
                current: currentPerformance.scores.taskCompletion,
                previous: Math.round(previousTaskCompletion),
                change: currentPerformance.scores.taskCompletion - Math.round(previousTaskCompletion),
                trend: currentPerformance.scores.taskCompletion > Math.round(previousTaskCompletion) ? 'up' : 'down'
            },
            leadConversion: {
                current: currentPerformance.scores.leadConversion,
                previous: Math.round(previousLeadConversion),
                change: currentPerformance.scores.leadConversion - Math.round(previousLeadConversion),
                trend: currentPerformance.scores.leadConversion > Math.round(previousLeadConversion) ? 'up' : 'down'
            },
            overall: {
                current: currentPerformance.scores.total,
                previous: Math.round((previousTaskCompletion + previousLeadConversion) / 2),
                change: currentPerformance.scores.total - Math.round((previousTaskCompletion + previousLeadConversion) / 2),
                trend: currentPerformance.scores.total > Math.round((previousTaskCompletion + previousLeadConversion) / 2) ? 'up' : 'down'
            }
        };
    }

    // ===== ADDITIONAL MISSING METHODS =====

    /**
     * Get notifications endpoint
     * @route GET /api/staff-dashboard/unified/notifications
     * @access Private (Staff)
     */
    getNotifications = asyncHandler(async (req, res) => {
        const staffId = req.staffInfo.staffId;
        const notifications = await this.getNotificationsData(staffId, 30);

        res.json({
            success: true,
            data: notifications
        });
    });

    /**
     * Get performance metrics endpoint
     * @route GET /api/staff-dashboard/unified/performance/metrics
     * @access Private (Staff)
     */
    getPerformanceMetrics = asyncHandler(async (req, res) => {
        console.log('🔍 [getPerformanceMetrics] Controller method called');
        const { timeRange = 30, includeDetails = false } = req.query;
        const staffId = req.staffInfo.staffId;
        const coachId = req.staffInfo.coachId;
        console.log('🔍 [getPerformanceMetrics] Staff ID:', staffId, 'Coach ID:', coachId);

        // Calculate real performance data
        const performance = await this.calculateRealStaffPerformance(staffId, coachId, parseInt(timeRange));

        const metrics = {
            currentScore: performance.scores.total,
            scoreBreakdown: performance.scores,
            metrics: performance.metrics,
            timeRange: parseInt(timeRange),
            includeDetails: includeDetails === 'true',
            lastUpdated: new Date().toISOString()
        };

        if (includeDetails === 'true') {
            metrics.detailedMetrics = {
                taskCompletion: {
                    score: performance.scores.taskCompletion,
                    breakdown: performance.metrics.taskMetrics
                },
                qualityRating: {
                    score: performance.scores.qualityRating,
                    breakdown: performance.metrics.qualityMetrics
                },
                efficiency: {
                    score: performance.scores.efficiency,
                    breakdown: performance.metrics.efficiencyMetrics
                },
                leadConversion: {
                    score: performance.scores.leadConversion,
                    breakdown: performance.metrics.leadMetrics
                },
                responseTime: {
                    score: performance.scores.responseTime,
                    breakdown: performance.metrics.responseMetrics
                }
            };
        }

        res.json({
            success: true,
            data: metrics
        });
    });

    /**
     * Get performance comparison endpoint
     * @route GET /api/staff-dashboard/unified/performance/comparison
     * @access Private (Staff)
     */
    getPerformanceComparison = asyncHandler(async (req, res) => {
        const { timeRange = 30 } = req.query;
        const staffId = req.staffInfo.staffId;
        const coachId = req.staffInfo.coachId;

        // Get all staff members for this coach
        const allStaff = await User.find({ 
            coachId: coachId, 
            role: 'staff',
            isActive: { $ne: false }
        });

        // Calculate performance for all staff members
        const staffPerformances = await Promise.all(
            allStaff.map(async (staff) => {
                const performance = await this.calculateRealStaffPerformance(staff._id, coachId, parseInt(timeRange));
                return {
                    staffId: staff._id,
                    name: staff.name,
                    email: staff.email,
                    totalScore: performance.scores.total,
                    scores: performance.scores,
                    metrics: performance.metrics
                };
            })
        );

        // Sort by total score
        staffPerformances.sort((a, b) => b.totalScore - a.totalScore);

        // Find current staff position
        const currentStaffIndex = staffPerformances.findIndex(staff => 
            staff.staffId.toString() === staffId.toString()
        );
        const currentStaff = staffPerformances[currentStaffIndex] || null;

        // Calculate team statistics
        const teamScores = staffPerformances.map(staff => staff.totalScore);
        const teamAverage = teamScores.reduce((sum, score) => sum + score, 0) / teamScores.length;
        const teamMedian = teamScores.length > 0 ? 
            teamScores[Math.floor(teamScores.length / 2)] : 0;

        const comparison = {
            currentStaff: currentStaff,
            currentPosition: currentStaffIndex + 1,
            teamAverage: Math.round(teamAverage),
            teamMedian: Math.round(teamMedian),
            percentile: currentStaffIndex >= 0 ? 
                Math.round(((staffPerformances.length - currentStaffIndex) / staffPerformances.length) * 100) : 0,
            topPerformers: staffPerformances.slice(0, 3),
            teamSize: staffPerformances.length,
            timeRange: parseInt(timeRange),
            lastUpdated: new Date().toISOString()
        };

        res.json({
            success: true,
            data: comparison
        });
    });

    /**
     * Get performance trends endpoint
     * @route GET /api/staff-dashboard/unified/performance/trends
     * @access Private (Staff)
     */
    getPerformanceTrends = asyncHandler(async (req, res) => {
        const { period = 'monthly', months = 6 } = req.query;
        const staffId = req.staffInfo.staffId;

        const trends = await this.calculateTrends(staffId, parseInt(months) * 30);

        res.json({
            success: true,
            data: {
                trends,
                period,
                months: parseInt(months),
                generatedAt: new Date().toISOString()
            }
        });
    });
}

module.exports = new UnifiedStaffDashboardController();
