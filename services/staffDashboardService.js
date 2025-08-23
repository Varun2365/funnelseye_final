const Staff = require('../schema/Staff');
const Task = require('../schema/Task');
const Lead = require('../schema/Lead');
const ScoreLog = require('../schema/ScoreLog');
const staffLeaderboardService = require('./staffLeaderboardService');
const workflowTaskService = require('./workflowTaskService');

class StaffDashboardService {
    constructor() {
        this.dashboardSections = {
            OVERVIEW: 'overview',
            TASKS: 'tasks',
            PERFORMANCE: 'performance',
            ACHIEVEMENTS: 'achievements',
            TEAM: 'team',
            GOALS: 'goals',
            CALENDAR: 'calendar',
            ANALYTICS: 'analytics'
        };

        this.quickActions = [
            { name: 'View Tasks', action: 'view_tasks', icon: '📋', route: '/tasks' },
            { name: 'Add Time Log', action: 'add_time_log', icon: '⏱️', route: '/time-log' },
            { name: 'Update Progress', action: 'update_progress', icon: '📈', route: '/progress' },
            { name: 'Request Help', action: 'request_help', icon: '🆘', route: '/help' },
            { name: 'View Achievements', action: 'view_achievements', icon: '🏆', route: '/achievements' },
            { name: 'Team Leaderboard', action: 'view_leaderboard', icon: '🏅', route: '/team' }
        ];
    }

    /**
     * Get complete dashboard data for a staff member
     */
    async getDashboardData(staffId, timeRange = 30) {
        try {
            const [
                overview,
                tasksData,
                performanceData,
                achievements,
                teamData,
                recentActivity,
                notifications
            ] = await Promise.all([
                this.getOverviewData(staffId, timeRange),
                this.getTasksData(staffId, timeRange),
                this.getPerformanceData(staffId, timeRange),
                this.getAchievementsData(staffId, timeRange),
                this.getTeamData(staffId, timeRange),
                this.getRecentActivity(staffId, timeRange),
                this.generateNotifications(staffId)
            ]);

            return {
                overview,
                tasks: tasksData,
                performance: performanceData,
                achievements,
                team: teamData,
                recentActivity,
                notifications,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting staff dashboard data:', error);
            throw error;
        }
    }

    /**
     * Get overview data with key metrics
     */
    async getOverviewData(staffId, timeRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        const [tasks, leads, performance] = await Promise.all([
            Task.find({ assignedTo: staffId, createdAt: { $gte: startDate } }),
            Lead.find({ assignedTo: staffId, createdAt: { $gte: startDate } }),
            staffLeaderboardService.calculateStaffScore(staffId, req.user.coachId, timeRange)
        ]);

        const completedTasks = tasks.filter(task => task.status === 'Completed');
        const pendingTasks = tasks.filter(task => task.status === 'Pending');
        const overdueTasks = tasks.filter(task => task.status === 'Overdue');

        const convertedLeads = leads.filter(lead => lead.status === 'Converted');
        const conversionRate = leads.length > 0 ? (convertedLeads.length / leads.length) * 100 : 0;

        // Calculate trends
        const previousPeriodStart = new Date(startDate);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - timeRange);
        
        const previousTasks = await Task.find({ 
            assignedTo: staffId, 
            createdAt: { $gte: previousPeriodStart, $lt: startDate } 
        });
        
        const previousLeads = await Lead.find({ 
            assignedTo: staffId, 
            createdAt: { $gte: previousPeriodStart, $lt: startDate } 
        });

        const taskGrowth = previousTasks.length > 0 ? 
            ((tasks.length - previousTasks.length) / previousTasks.length) * 100 : 0;
        
        const leadGrowth = previousLeads.length > 0 ? 
            ((leads.length - previousLeads.length) / previousLeads.length) * 100 : 0;

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
                rank: await this.getStaffRank(staffId, timeRange)
            },
            trends: {
                taskGrowth: Math.round(taskGrowth * 100) / 100,
                leadGrowth: Math.round(leadGrowth * 100) / 100,
                scoreChange: await this.calculateScoreChange(staffId, timeRange)
            },
            quickActions: this.quickActions,
            alerts: await this.generateOverviewAlerts(staffId, tasks, leads)
        };
    }

    /**
     * Get tasks data with comprehensive breakdown
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

        const tasksByStage = {
            leadGeneration: tasks.filter(task => task.stage === 'LEAD_GENERATION'),
            leadQualification: tasks.filter(task => task.stage === 'LEAD_QUALIFICATION'),
            proposal: tasks.filter(task => task.stage === 'PROPOSAL'),
            closing: tasks.filter(task => task.stage === 'CLOSING'),
            onboarding: tasks.filter(task => task.stage === 'ONBOARDING')
        };

        // Calculate task efficiency metrics
        const efficiencyMetrics = this.calculateTaskEfficiency(tasks);

        return {
            summary: {
                total: tasks.length,
                byStatus: tasksByStatus,
                byPriority: tasksByPriority,
                byStage: tasksByStage
            },
            recentTasks: tasks.slice(0, 10),
            upcomingDeadlines: tasks
                .filter(task => task.status !== 'Completed' && task.dueDate > new Date())
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 5),
            efficiencyMetrics,
            taskDistribution: {
                status: Object.keys(tasksByStatus).map(key => ({
                    status: key,
                    count: tasksByStatus[key].length,
                    percentage: Math.round((tasksByStatus[key].length / tasks.length) * 100)
                })),
                priority: Object.keys(tasksByPriority).map(key => ({
                    priority: key,
                    count: tasksByPriority[key].length,
                    percentage: Math.round((tasksByPriority[key].length / tasks.length) * 100)
                }))
            }
        };
    }

    /**
     * Get performance data with detailed breakdown
     */
    async getPerformanceData(staffId, timeRange) {
        const performance = await staffLeaderboardService.calculateStaffScore(
            staffId, 
            req.user.coachId, 
            timeRange
        );

        const progress = await staffLeaderboardService.getStaffProgress(
            staffId, 
            req.user.coachId, 
            timeRange
        );

        const trends = await this.calculatePerformanceTrends(staffId, timeRange);
        const recommendations = this.generatePerformanceRecommendations(performance);
        const benchmarks = await this.getPerformanceBenchmarks(staffId, timeRange);

        return {
            currentScore: performance.scores.total,
            scoreBreakdown: performance.scores,
            metrics: performance.metrics,
            progress: progress,
            trends: trends,
            recommendations: recommendations,
            benchmarks: benchmarks,
            performanceHistory: await this.getPerformanceHistory(staffId, timeRange)
        };
    }

    /**
     * Get achievements data with progress tracking
     */
    async getAchievementsData(staffId, timeRange) {
        const achievements = await staffLeaderboardService.getStaffAchievements(
            staffId, 
            req.user.coachId, 
            timeRange
        );

        const allAchievements = staffLeaderboardService.achievements;
        const earnedAchievements = achievements.filter(a => a.earned);
        const availableAchievements = Object.keys(allAchievements).filter(
            key => !earnedAchievements.find(a => a.achievement === key)
        );

        // Calculate achievement progress
        const progress = this.calculateAchievementProgress(achievements, allAchievements);
        
        // Get next achievable achievements
        const nextAchievements = this.getNextAchievements(achievements, allAchievements);

        return {
            earned: earnedAchievements,
            available: availableAchievements.map(key => ({
                key,
                ...allAchievements[key],
                progress: this.calculateAchievementProgress(achievements, allAchievements, key)
            })),
            progress: progress,
            nextAchievements: nextAchievements,
            achievementStats: {
                totalEarned: earnedAchievements.length,
                totalAvailable: Object.keys(allAchievements).length,
                completionRate: Math.round((earnedAchievements.length / Object.keys(allAchievements).length) * 100),
                recentEarned: earnedAchievements
                    .filter(a => new Date(a.earnedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                    .slice(0, 5)
            }
        };
    }

    /**
     * Get team data and leaderboard information
     */
    async getTeamData(staffId, timeRange) {
        const leaderboard = await staffLeaderboardService.getLeaderboard(
            req.user.coachId, 
            timeRange, 
            20
        );

        const currentStaff = leaderboard.find(staff => staff.staffId.toString() === staffId.toString());
        const teamAnalytics = await staffLeaderboardService.getTeamAnalytics(
            req.user.coachId, 
            timeRange
        );

        // Get team performance distribution
        const performanceDistribution = this.calculateTeamPerformanceDistribution(leaderboard);

        // Get team collaboration metrics
        const collaborationMetrics = await this.getTeamCollaborationMetrics(staffId, timeRange);

        return {
            leaderboard: leaderboard.slice(0, 10), // Top 10
            currentPosition: leaderboard.findIndex(staff => staff.staffId.toString() === staffId.toString()) + 1,
            teamAnalytics,
            topPerformers: leaderboard.slice(0, 3),
            teamAverage: teamAnalytics.averageScore,
            performanceDistribution,
            collaborationMetrics,
            teamStats: {
                totalStaff: leaderboard.length,
                activeStaff: leaderboard.filter(staff => staff.isActive).length,
                averageScore: teamAnalytics.averageScore,
                topScore: Math.max(...leaderboard.map(staff => staff.score)),
                scoreRange: {
                    min: Math.min(...leaderboard.map(staff => staff.score)),
                    max: Math.max(...leaderboard.map(staff => staff.score))
                }
            }
        };
    }

    /**
     * Get recent activity and updates
     */
    async getRecentActivity(staffId, timeRange) {
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
            ScoreLog.find({
                lead: { $in: await Lead.find({ assignedTo: staffId }).distinct('_id') },
                createdAt: { $gte: startDate }
            }).sort('-createdAt').limit(10)
        ]);

        const activities = [
            ...taskUpdates.map(task => ({
                type: 'task_update',
                title: `Task "${task.name}" updated`,
                description: `Status changed to ${task.status}`,
                timestamp: task.updatedAt,
                data: task,
                icon: this.getActivityIcon('task_update'),
                priority: this.getActivityPriority('task_update')
            })),
            ...leadUpdates.map(lead => ({
                type: 'lead_update',
                title: `Lead "${lead.name}" updated`,
                description: `Status changed to ${lead.status}`,
                timestamp: lead.updatedAt,
                data: lead,
                icon: this.getActivityIcon('lead_update'),
                priority: this.getActivityPriority('lead_update')
            })),
            ...scoreChanges.map(score => ({
                type: 'score_change',
                title: 'Score updated',
                description: `Score changed by ${score.scoreChange > 0 ? '+' : ''}${score.scoreChange}`,
                timestamp: score.createdAt,
                data: score,
                icon: this.getActivityIcon('score_change'),
                priority: this.getActivityPriority('score_change')
            }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return {
            activities: activities.slice(0, 20),
            summary: {
                totalActivities: activities.length,
                byType: this.groupActivitiesByType(activities),
                recentHighlights: activities.filter(a => a.priority === 'HIGH').slice(0, 5)
            }
        };
    }

    /**
     * Generate notifications for staff member
     */
    async generateNotifications(staffId) {
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

        // Check for performance alerts
        const performance = await staffLeaderboardService.calculateStaffScore(
            staffId, 
            req.user.coachId, 
            30
        );

        if (performance.scores.total < 60) {
            notifications.push({
                id: 'performance_alert',
                type: 'error',
                title: 'Performance Alert',
                message: 'Your performance score is below 60. Consider reviewing your workflow.',
                action: 'view_performance',
                priority: 'HIGH',
                timestamp: new Date()
            });
        }

        // Check for new achievements
        const recentAchievements = await this.getRecentAchievements(staffId, 7); // Last 7 days
        if (recentAchievements.length > 0) {
            notifications.push({
                id: 'new_achievements',
                type: 'success',
                title: 'New Achievements!',
                message: `You've earned ${recentAchievements.length} new achievement(s)`,
                action: 'view_achievements',
                priority: 'LOW',
                count: recentAchievements.length,
                timestamp: new Date()
            });
        }

        return notifications.sort((a, b) => {
            const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    // ===== HELPER METHODS =====

    calculateTaskEfficiency(tasks) {
        const completedTasks = tasks.filter(task => task.status === 'Completed');
        const onTimeTasks = completedTasks.filter(task => 
            task.completedAt && task.completedAt <= task.dueDate
        );

        const efficiencyRate = completedTasks.length > 0 ? 
            (onTimeTasks.length / completedTasks.length) * 100 : 0;

        const averageCompletionTime = completedTasks.length > 0 ? 
            completedTasks.reduce((sum, task) => {
                if (task.completedAt && task.createdAt) {
                    return sum + (new Date(task.completedAt) - new Date(task.createdAt));
                }
                return sum;
            }, 0) / completedTasks.length : 0;

        return {
            totalTasks: tasks.length,
            completedTasks: completedTasks.length,
            onTimeTasks: onTimeTasks.length,
            efficiencyRate: Math.round(efficiencyRate * 100) / 100,
            averageCompletionTime: Math.round(averageCompletionTime / (1000 * 60 * 60 * 24)), // Days
            overdueRate: tasks.length > 0 ? 
                (tasks.filter(task => task.status === 'Overdue').length / tasks.length) * 100 : 0
        };
    }

    async calculateScoreChange(staffId, timeRange) {
        const currentScore = await staffLeaderboardService.calculateStaffScore(
            staffId, 
            req.user.coachId, 
            timeRange
        );

        const previousScore = await staffLeaderboardService.calculateStaffScore(
            staffId, 
            req.user.coachId, 
            timeRange * 2
        );

        return {
            current: currentScore.scores.total,
            previous: previousScore.scores.total,
            change: currentScore.scores.total - previousScore.scores.total,
            percentageChange: previousScore.scores.total > 0 ? 
                ((currentScore.scores.total - previousScore.scores.total) / previousScore.scores.total) * 100 : 0
        };
    }

    async getStaffRank(staffId, timeRange) {
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

    async generateOverviewAlerts(staffId, tasks, leads) {
        const alerts = [];

        // Task completion rate alert
        const completedTasks = tasks.filter(task => task.status === 'Completed');
        if (tasks.length > 0 && (completedTasks.length / tasks.length) < 0.7) {
            alerts.push({
                type: 'warning',
                message: 'Task completion rate is below 70%. Focus on completing pending tasks.',
                priority: 'MEDIUM'
            });
        }

        // Overdue tasks alert
        const overdueTasks = tasks.filter(task => task.status === 'Overdue');
        if (overdueTasks.length > 0) {
            alerts.push({
                type: 'error',
                message: `You have ${overdueTasks.length} overdue task(s). Prioritize these immediately.`,
                priority: 'HIGH'
            });
        }

        // Lead conversion alert
        const convertedLeads = leads.filter(lead => lead.status === 'Converted');
        if (leads.length > 0 && (convertedLeads.length / leads.length) < 0.4) {
            alerts.push({
                type: 'info',
                message: 'Lead conversion rate could be improved. Focus on qualification and follow-up.',
                priority: 'LOW'
            });
        }

        return alerts;
    }

    async calculatePerformanceTrends(staffId, timeRange) {
        // This would calculate actual performance trends over time
        // For now, return mock data structure
        return {
            scoreTrend: [65, 68, 72, 75, 78, 82, 85],
            taskTrend: [12, 15, 18, 14, 20, 22, 19],
            conversionTrend: [45, 52, 48, 58, 62, 67, 71],
            efficiencyTrend: [78, 82, 79, 85, 88, 91, 89]
        };
    }

    generatePerformanceRecommendations(performance) {
        const recommendations = [];
        const scores = performance.scores;

        if (scores.taskCompletion < 80) {
            recommendations.push({
                type: 'task_management',
                title: 'Improve Task Completion',
                description: 'Focus on completing tasks on time and maintaining quality standards',
                priority: 'HIGH',
                action: 'review_workflow',
                estimatedImpact: 'High'
            });
        }

        if (scores.qualityRating < 75) {
            recommendations.push({
                type: 'quality_improvement',
                title: 'Enhance Quality',
                description: 'Work on improving client satisfaction and task quality ratings',
                priority: 'MEDIUM',
                action: 'quality_training',
                estimatedImpact: 'Medium'
            });
        }

        if (scores.efficiency < 70) {
            recommendations.push({
                type: 'efficiency',
                title: 'Improve Efficiency',
                description: 'Work on completing tasks within estimated timeframes',
                priority: 'MEDIUM',
                action: 'time_management',
                estimatedImpact: 'Medium'
            });
        }

        if (scores.leadership < 60) {
            recommendations.push({
                type: 'leadership',
                title: 'Develop Leadership Skills',
                description: 'Help other team members and contribute to team success',
                priority: 'LOW',
                action: 'team_collaboration',
                estimatedImpact: 'Low'
            });
        }

        return recommendations.sort((a, b) => {
            const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    async getPerformanceBenchmarks(staffId, timeRange) {
        const leaderboard = await staffLeaderboardService.getLeaderboard(
            req.user.coachId, 
            timeRange, 
            100
        );

        const currentStaff = leaderboard.find(staff => 
            staff.staffId.toString() === staffId.toString()
        );

        if (!currentStaff) return null;

        const teamAverage = leaderboard.reduce((sum, staff) => sum + staff.score, 0) / leaderboard.length;
        const top10Average = leaderboard.slice(0, 10).reduce((sum, staff) => sum + staff.score, 0) / 10;

        return {
            personal: currentStaff.score,
            teamAverage: Math.round(teamAverage * 100) / 100,
            top10Average: Math.round(top10Average * 100) / 100,
            rank: leaderboard.findIndex(staff => staff.staffId.toString() === staffId.toString()) + 1,
            totalStaff: leaderboard.length,
            percentile: Math.round(((leaderboard.length - leaderboard.findIndex(staff => 
                staff.staffId.toString() === staffId.toString())) / leaderboard.length) * 100)
        };
    }

    async getPerformanceHistory(staffId, timeRange) {
        // This would fetch actual performance history from ScoreLog
        // For now, return mock data structure
        return {
            daily: Array.from({ length: timeRange }, (_, i) => ({
                date: new Date(Date.now() - (timeRange - i - 1) * 24 * 60 * 60 * 1000),
                score: Math.floor(Math.random() * 20) + 70,
                tasksCompleted: Math.floor(Math.random() * 5) + 1,
                leadsConverted: Math.floor(Math.random() * 2)
            })),
            weekly: Array.from({ length: Math.ceil(timeRange / 7) }, (_, i) => ({
                week: i + 1,
                averageScore: Math.floor(Math.random() * 15) + 75,
                totalTasks: Math.floor(Math.random() * 20) + 10,
                totalLeads: Math.floor(Math.random() * 8) + 2
            }))
        };
    }

    calculateAchievementProgress(achievements, allAchievements, achievementKey = null) {
        if (achievementKey) {
            const achievement = achievements.find(a => a.achievement === achievementKey);
            if (!achievement) return 0;
            return achievement.progress || 0;
        }

        const earned = achievements.filter(a => a.earned).length;
        const total = Object.keys(allAchievements).length;
        
        return {
            earned,
            total,
            percentage: Math.round((earned / total) * 100)
        };
    }

    getNextAchievements(achievements, allAchievements) {
        const unearned = achievements.filter(a => !a.earned);
        return unearned
            .sort((a, b) => (b.progress || 0) - (a.progress || 0))
            .slice(0, 5)
            .map(achievement => ({
                ...achievement,
                ...allAchievements[achievement.achievement],
                progress: achievement.progress || 0
            }));
    }

    async getRecentAchievements(staffId, days) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const achievements = await staffLeaderboardService.getStaffAchievements(
            staffId, 
            req.user.coachId, 
            days
        );

        return achievements
            .filter(a => a.earned && new Date(a.earnedAt) >= startDate)
            .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));
    }

    calculateTeamPerformanceDistribution(leaderboard) {
        const distribution = {
            elite: { count: 0, percentage: 0, range: '90-100' },
            highAchiever: { count: 0, percentage: 0, range: '80-89' },
            consistent: { count: 0, percentage: 0, range: '70-79' },
            risingStar: { count: 0, percentage: 0, range: '60-69' },
            needsSupport: { count: 0, percentage: 0, range: '0-59' }
        };

        leaderboard.forEach(staff => {
            if (staff.score >= 90) distribution.elite.count++;
            else if (staff.score >= 80) distribution.highAchiever.count++;
            else if (staff.score >= 70) distribution.consistent.count++;
            else if (staff.score >= 60) distribution.risingStar.count++;
            else distribution.needsSupport.count++;
        });

        // Calculate percentages
        Object.keys(distribution).forEach(key => {
            distribution[key].percentage = Math.round((distribution[key].count / leaderboard.length) * 100);
        });

        return distribution;
    }

    async getTeamCollaborationMetrics(staffId, timeRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        // Count tasks where staff helped others
        const helpingTasks = await Task.find({
            coachId: req.user.coachId,
            createdAt: { $gte: startDate },
            'comments.user': staffId
        });

        // Count mentoring activities
        const mentoringActivities = await this.countMentoringActivities(staffId, startDate);

        return {
            tasksHelped: helpingTasks.length,
            mentoringSessions: mentoringActivities,
            collaborationScore: Math.min(100, (helpingTasks.length * 5) + (mentoringActivities * 10)),
            teamContribution: helpingTasks.length > 0 ? 'Active' : 'Limited'
        };
    }

    async countMentoringActivities(staffId, startDate) {
        // This would count actual mentoring activities
        // For now, return mock data
        return Math.floor(Math.random() * 5) + 1;
    }

    getActivityIcon(activityType) {
        const icons = {
            task_update: '📋',
            lead_update: '👤',
            score_change: '📊',
            achievement_earned: '🏆',
            task_completed: '✅',
            lead_converted: '💰'
        };
        return icons[activityType] || '📝';
    }

    getActivityPriority(activityType) {
        const priorities = {
            task_update: 'MEDIUM',
            lead_update: 'HIGH',
            score_change: 'LOW',
            achievement_earned: 'LOW',
            task_completed: 'MEDIUM',
            lead_converted: 'HIGH'
        };
        return priorities[activityType] || 'MEDIUM';
    }

    groupActivitiesByType(activities) {
        const grouped = {};
        activities.forEach(activity => {
            if (!grouped[activity.type]) {
                grouped[activity.type] = [];
            }
            grouped[activity.type].push(activity);
        });

        return Object.keys(grouped).map(type => ({
            type,
            count: grouped[type].length,
            activities: grouped[type].slice(0, 3) // Show first 3 of each type
        }));
    }
}

module.exports = new StaffDashboardService();
