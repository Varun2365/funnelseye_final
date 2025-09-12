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
            const staffId = req.user.id;
            
            // Get staff details
            const staff = await Staff.findById(staffId).select('isActive coachId permissions');
            
            if (!staff) {
                return res.status(404).json({
                    success: false,
                    message: 'Staff account not found'
                });
            }
            
            // Check if staff is active
            if (!staff.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Your staff account has been deactivated. Please contact your coach or administrator.',
                    code: 'STAFF_DEACTIVATED'
                });
            }
            
            // Check global system settings
            const globalSettings = await globalSettingsService.getSettings();
            
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
                this.getOverviewData(staffId, coachId, parseInt(timeRange))
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
                this.getAnalyticsData(staffId, parseInt(timeRange))
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
     * Get overview data with key metrics
     */
    async getOverviewData(staffId, coachId, timeRange) {
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
     * Get analytics data
     */
    async getAnalyticsData(staffId, timeRange) {
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
        const { timeRange = 30 } = req.query;
        const staffId = req.staffInfo.staffId;
        const coachId = req.staffInfo.coachId;

        const performance = await staffLeaderboardService.calculateStaffScore(
            staffId, 
            coachId, 
            parseInt(timeRange)
        );

        const progress = await staffLeaderboardService.getStaffProgress(
            staffId, 
            coachId, 
            parseInt(timeRange)
        );

        res.json({
            success: true,
            data: {
                currentScore: performance.scores.total,
                scoreBreakdown: performance.scores,
                metrics: performance.metrics,
                progress: progress,
                trends: await this.calculateTrends(staffId, parseInt(timeRange)),
                recommendations: this.generateRecommendations(performance)
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
        // This would calculate performance trends over time
        // For now, return mock data
        return {
            scoreTrend: [65, 68, 72, 75, 78, 82, 85],
            taskTrend: [12, 15, 18, 14, 20, 22, 19],
            conversionTrend: [45, 52, 48, 58, 62, 67, 71]
        };
    }

    generateInsights(tasks, leads) {
        const insights = [];

        // Task insights
        if (tasks.length > 0) {
            const completedTasks = tasks.filter(task => task.status === 'Completed');
            if (completedTasks.length / tasks.length < 0.8) {
                insights.push({
                    type: 'warning',
                    message: 'Task completion rate is below 80%. Consider reviewing your workflow.',
                    action: 'review_workflow'
                });
            }
        }

        // Lead insights
        if (leads.length > 0) {
            const convertedLeads = leads.filter(lead => lead.status === 'Converted');
            if (convertedLeads.length / leads.length < 0.5) {
                insights.push({
                    type: 'info',
                    message: 'Lead conversion rate could be improved. Focus on qualification and follow-up.',
                    action: 'improve_conversion'
                });
            }
        }

        return insights;
    }

    generateRecommendations(performance) {
        const recommendations = [];
        const scores = performance.scores;

        if (scores.taskCompletion < 80) {
            recommendations.push({
                type: 'task_management',
                title: 'Improve Task Completion',
                description: 'Focus on completing tasks on time and maintaining quality standards',
                priority: 'HIGH'
            });
        }

        if (scores.qualityRating < 75) {
            recommendations.push({
                type: 'quality_improvement',
                title: 'Enhance Quality',
                description: 'Work on improving client satisfaction and task quality ratings',
                priority: 'MEDIUM'
            });
        }

        if (scores.efficiency < 70) {
            recommendations.push({
                type: 'efficiency',
                title: 'Improve Efficiency',
                description: 'Work on completing tasks within estimated timeframes',
                priority: 'MEDIUM'
            });
        }

        return recommendations;
    }

    calculateAchievementProgress(achievements, allAchievements) {
        const earned = achievements.filter(a => a.earned).length;
        const total = Object.keys(allAchievements).length;
        
        return {
            earned,
            total,
            percentage: Math.round((earned / total) * 100),
            nextAchievement: achievements.find(a => !a.earned && a.progress > 50)
        };
    }

    // ===== ADDITIONAL METHODS FROM OTHER CONTROLLERS =====

    /**
     * Get staff notifications and alerts
     */
    async getNotifications(req, res) {
        try {
            const staffId = req.user.id;
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
                if (String(staffId) !== String(req.user.id)) {
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
                    createdBy: req.user.id,
                    lastModifiedBy: req.user.id,
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
                lastModifiedBy: req.user.id
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
                if (String(staffId) !== String(req.user.id)) {
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
            const staff = await Staff.findById(staffId);
            if (!staff) {
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
                const staff = await Staff.findById(staffId);
                if (!staff || String(staff.coachId) !== String(req.user.coachId)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied'
                    });
                }
            } else if (req.user.role === 'staff') {
                // Staff can only view their own appointments
                if (String(staffId) !== String(req.user.id)) {
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
     */
    async getAvailableStaff(req, res) {
        try {
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
            const staff = await Staff.find({ 
                coachId: filterCoachId, 
                isActive: true 
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
                            startTime: { $lt: appointmentEnd },
                            $or: [
                                { 
                                    startTime: { $gte: appointmentStart },
                                    startTime: { $lt: appointmentEnd }
                                },
                                {
                                    startTime: { $lte: appointmentStart },
                                    $expr: {
                                        $gte: {
                                            $add: ['$startTime', { $multiply: ['$duration', 60000] }],
                                            appointmentStart
                                        }
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

        } catch (err) {
            console.error('getAvailableStaff error:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Server Error'
            });
        }
    }

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
            const staffId = req.user.id;

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
            if (req.user.role === 'staff' && String(task.assignedTo._id) !== String(req.user.id)) {
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
            if (req.user.role === 'staff' && String(task.assignedTo) !== String(req.user.id)) {
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
            if (req.user.role === 'staff' && String(task.assignedTo) !== String(req.user.id)) {
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
            if (req.user.role === 'staff' && String(task.assignedTo) !== String(req.user.id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Add comment
            if (!task.comments) task.comments = [];
            task.comments.push({
                user: req.user.id,
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
            if (req.user.role === 'staff' && String(task.assignedTo) !== String(req.user.id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Log time
            if (!task.timeLogs) task.timeLogs = [];
            task.timeLogs.push({
                user: req.user.id,
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
            const staffId = req.user.id;
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
            const staffId = req.user.id;

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
            const staffId = req.user.id;
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
            const staffId = req.user.id;

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
            const staffId = req.user.id;

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
            const staffId = req.user.id;

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
            if (String(calendarDoc.staffId) === String(req.user.id)) return true;
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
}

module.exports = new UnifiedStaffDashboardController();
