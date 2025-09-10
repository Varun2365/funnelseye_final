const staffLeaderboardService = require('../services/staffLeaderboardService');
const workflowTaskService = require('../services/workflowTaskService');
const Lead = require('../schema/Lead');
const Task = require('../schema/Task');
const asyncHandler = require('../middleware/async');

// @desc    Get complete staff dashboard data
// @route   GET /api/staff-dashboard/data
// @access  Private (Staff)
exports.getDashboardData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const staffId = req.user.id;

    const [
        overview,
        tasksData,
        performanceData,
        achievements,
        teamData,
        recentActivity
    ] = await Promise.all([
        getOverviewData(staffId, parseInt(timeRange)),
        getTasksData(staffId, parseInt(timeRange)),
        getPerformanceData(staffId, parseInt(timeRange)),
        getAchievementsData(staffId, parseInt(timeRange)),
        getTeamData(staffId, parseInt(timeRange)),
        getRecentActivity(staffId, parseInt(timeRange))
    ]);

    res.json({
        success: true,
        data: {
            overview,
            tasks: tasksData,
            performance: performanceData,
            achievements,
            team: teamData,
            recentActivity,
            lastUpdated: new Date().toISOString()
        }
    });
});

// @desc    Get staff overview data
// @route   GET /api/staff-dashboard/overview
// @access  Private (Staff)
exports.getOverviewData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const staffId = req.user.id;
    const coachId = req.user.coachId;

    const overview = await getOverviewData(staffId, coachId, parseInt(timeRange));

    res.json({
        success: true,
        data: overview
    });
});

// @desc    Get staff tasks data
// @route   GET /api/staff-dashboard/tasks
// @access  Private (Staff)
exports.getTasksData = asyncHandler(async (req, res) => {
    const { timeRange = 30 } = req.query;
    const staffId = req.user.id;

    const tasksData = await getTasksData(staffId, parseInt(timeRange));

    res.json({
        success: true,
        data: tasksData
    });
});

// @desc    Get staff performance data
// @route   GET /api/staff-dashboard/performance
// @access  Private (Staff)
exports.getPerformanceData = asyncHandler(async (req, res) => {
    const { timeRange = 30 } = req.query;
    const staffId = req.user.id;
    const coachId = req.user.coachId;

    const performanceData = await getPerformanceData(staffId, coachId, parseInt(timeRange));

    res.json({
        success: true,
        data: performanceData
    });
});

// @desc    Get staff achievements
// @route   GET /api/staff-dashboard/achievements
// @access  Private (Staff)
exports.getAchievements = asyncHandler(async (req, res) => {
    const { timeRange = 30 } = req.query;
    const staffId = req.user.id;
    const coachId = req.user.coachId;

    const achievements = await getAchievementsData(staffId, coachId, parseInt(timeRange));

    res.json({
        success: true,
        data: achievements
    });
});

// @desc    Get team data
// @route   GET /api/staff-dashboard/team
// @access  Private (Staff)
exports.getTeamData = asyncHandler(async (req, res) => {
    const { timeRange = 30 } = req.query;
    const staffId = req.user.id;
    const coachId = req.user.coachId;

    const teamData = await getTeamData(staffId, coachId, parseInt(timeRange));

    res.json({
        success: true,
        data: teamData
    });
});

// @desc    Get staff progress over time
// @route   GET /api/staff-dashboard/progress
// @access  Private (Staff)
exports.getProgress = asyncHandler(async (req, res) => {
    const { days = 30 } = req.query;
    const staffId = req.user.id;

    const progress = await staffLeaderboardService.getStaffProgress(
        staffId, 
        req.user.coachId, 
        parseInt(days)
    );

    res.json({
        success: true,
        data: progress
    });
});

// @desc    Get staff comparison with team
// @route   GET /api/staff-dashboard/comparison
// @access  Private (Staff)
exports.getComparison = asyncHandler(async (req, res) => {
    const { timeRange = 30 } = req.query;
    const staffId = req.user.id;

    // Get team leaderboard to compare with
    const leaderboard = await staffLeaderboardService.getLeaderboard(
        req.user.coachId, 
        parseInt(timeRange), 
        20
    );

    // Find current staff position
    const staffPosition = leaderboard.findIndex(staff => staff.staffId.toString() === staffId.toString()) + 1;
    const totalStaff = leaderboard.length;

    // Get staff's own performance
    const staffPerformance = await staffLeaderboardService.calculateStaffScore(
        staffId, 
        req.user.coachId, 
        parseInt(timeRange)
    );

    // Get top 3 performers for comparison
    const topPerformers = leaderboard.slice(0, 3);

    res.json({
        success: true,
        data: {
            staffPerformance,
            position: staffPosition,
            totalStaff,
            topPerformers,
            leaderboard
        }
    });
});

// @desc    Get staff goals and targets
// @route   GET /api/staff-dashboard/goals
// @access  Private (Staff)
exports.getGoals = asyncHandler(async (req, res) => {
    const staffId = req.user.id;

    // This would typically come from a goals schema
    // For now, we'll create dynamic goals based on performance
    const currentScore = await staffLeaderboardService.calculateStaffScore(
        staffId, 
        req.user.coachId, 
        30
    );

    const goals = generateDynamicGoals(currentScore);

    res.json({
        success: true,
        data: goals
    });
});

// @desc    Get staff calendar and schedule
// @route   GET /api/staff-dashboard/calendar
// @access  Private (Staff)
exports.getCalendar = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const staffId = req.user.id;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Get tasks for the date range
    const tasks = await Task.find({
        assignedTo: staffId,
        dueDate: { $gte: start, $lte: end }
    }).populate('relatedLead', 'name email');

    // Get upcoming deadlines
    const upcomingDeadlines = tasks
        .filter(task => task.status !== 'Completed')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 10);

    res.json({
        success: true,
        data: {
            tasks,
            upcomingDeadlines,
            dateRange: { start, end }
        }
    });
});

// @desc    Get staff notifications and alerts
// @route   GET /api/staff-dashboard/notifications
// @access  Private (Staff)
exports.getNotifications = asyncHandler(async (req, res) => {
    const staffId = req.user.id;

    const notifications = await generateStaffNotifications(staffId);

    res.json({
        success: true,
        data: notifications
    });
});

// @desc    Get staff analytics and insights
// @route   GET /api/staff-dashboard/analytics
// @access  Private (Staff)
exports.getAnalytics = asyncHandler(async (req, res) => {
    const { timeRange = 30 } = req.query;
    const staffId = req.user.id;

    const analytics = await generateStaffAnalytics(staffId, parseInt(timeRange));

    res.json({
        success: true,
        data: analytics
    });
});

// ===== HELPER FUNCTIONS =====

async function getOverviewData(staffId, coachId, timeRange) {
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
            rank: await getStaffRank(staffId, timeRange)
        },
        quickActions: [
            { name: 'View Tasks', action: 'view_tasks', icon: '📋' },
            { name: 'Add Time Log', action: 'add_time_log', icon: '⏱️' },
            { name: 'Update Progress', action: 'update_progress', icon: '📈' },
            { name: 'Request Help', action: 'request_help', icon: '🆘' }
        ]
    };
}

async function getTasksData(staffId, timeRange) {
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

async function getPerformanceData(staffId, coachId, timeRange) {
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
        trends: await calculateTrends(staffId, timeRange),
        recommendations: generateRecommendations(performance)
    };
}

async function getAchievementsData(staffId, coachId, timeRange) {
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
        progress: calculateAchievementProgress(achievements, allAchievements)
    };
}

async function getTeamData(staffId, coachId, timeRange) {
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

async function getRecentActivity(staffId, timeRange) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    const [taskUpdates, leadUpdates, scoreChanges] = await Promise.all([
        Task.find({
            assignedTo: staffId,
            updatedAt: { $gte: startDate }
        }).sort('-updatedAt').limit(10),
        Lead.find({
            assignedTo: staffId,
            updatedAt: { $gte: startDate }
        }).sort('-updatedAt').limit(10),
        // Score changes would come from ScoreLog schema
        []
    ]);

    const activities = [
        ...taskUpdates.map(task => ({
            type: 'task_update',
            title: `Task "${task.name}" updated`,
            description: `Status changed to ${task.status}`,
            timestamp: task.updatedAt,
            data: task
        })),
        ...leadUpdates.map(lead => ({
            type: 'lead_update',
            title: `Lead "${lead.name}" updated`,
            description: `Status changed to ${lead.status}`,
            timestamp: lead.updatedAt,
            data: lead
        }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return activities.slice(0, 20);
}

function generateDynamicGoals(currentScore) {
    const goals = [];
    const score = currentScore.scores.total;

    if (score < 60) {
        goals.push({
            id: 'improve_basics',
            title: 'Improve Basic Performance',
            description: 'Focus on completing tasks on time and maintaining quality',
            target: 'Reach 70+ score in 30 days',
            progress: Math.min(100, (score / 70) * 100),
            priority: 'HIGH'
        });
    }

    if (score < 80) {
        goals.push({
            id: 'become_consistent',
            title: 'Become Consistent Performer',
            description: 'Maintain steady performance above 80 points',
            target: 'Maintain 80+ score for 2 weeks',
            progress: Math.min(100, (score / 80) * 100),
            priority: 'MEDIUM'
        });
    }

    if (score >= 80) {
        goals.push({
            id: 'reach_elite',
            title: 'Reach Elite Level',
            description: 'Achieve and maintain 90+ score',
            target: 'Reach 90+ score and maintain for 1 month',
            progress: Math.min(100, (score / 90) * 100),
            priority: 'MEDIUM'
        });
    }

    return goals;
}

async function generateStaffNotifications(staffId) {
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
            priority: 'HIGH'
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
            priority: 'MEDIUM'
        });
    }

    return notifications;
}

async function generateStaffAnalytics(staffId, timeRange) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    const [tasks, leads] = await Promise.all([
        Task.find({ assignedTo: staffId, createdAt: { $gte: startDate } }),
        Lead.find({ assignedTo: staffId, createdAt: { $gte: startDate } })
    ]);

    const taskEfficiency = calculateTaskEfficiency(tasks);
    const leadConversion = calculateLeadConversion(leads);
    const timeManagement = calculateTimeManagement(tasks);

    return {
        taskEfficiency,
        leadConversion,
        timeManagement,
        trends: await calculateTrends(staffId, timeRange),
        insights: generateInsights(tasks, leads)
    };
}

function calculateTaskEfficiency(tasks) {
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

function calculateLeadConversion(leads) {
    const convertedLeads = leads.filter(lead => lead.status === 'Converted');
    
    return {
        totalLeads: leads.length,
        convertedLeads: convertedLeads.length,
        conversionRate: leads.length > 0 ? 
            (convertedLeads.length / leads.length) * 100 : 0
    };
}

function calculateTimeManagement(tasks) {
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

async function calculateTrends(staffId, timeRange) {
    // This would calculate performance trends over time
    // For now, return mock data
    return {
        scoreTrend: [65, 68, 72, 75, 78, 82, 85],
        taskTrend: [12, 15, 18, 14, 20, 22, 19],
        conversionTrend: [45, 52, 48, 58, 62, 67, 71]
    };
}

function generateInsights(tasks, leads) {
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

function generateRecommendations(performance) {
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

function calculateAchievementProgress(achievements, allAchievements) {
    const earned = achievements.filter(a => a.earned).length;
    const total = Object.keys(allAchievements).length;
    
    return {
        earned,
        total,
        percentage: Math.round((earned / total) * 100),
        nextAchievement: achievements.find(a => !a.earned && a.progress > 50)
    };
}

async function getStaffRank(staffId, timeRange) {
    const leaderboard = await staffLeaderboardService.getLeaderboard(
        req.user.coachId, 
        timeRange, 
        100
    );
    
    const position = leaderboard.findIndex(staff => 
        staff.staffId.toString() === staffId.toString()
    );
    
    return position + 1;
}
