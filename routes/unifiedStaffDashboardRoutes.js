const express = require('express');
const router = express.Router();
const unifiedStaffDashboardController = require('../controllers/unifiedStaffDashboardController');
const { protect, authorizeStaff } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const { populateStaffPermissions } = require('../middleware/permissionMiddleware');
const { hasPermission } = require('../utils/permissions');

// Apply authentication and activity middleware to all routes
router.use(protect, (req, res, next) => {
    console.log('✅ [Middleware] Protect middleware passed');
    next();
}, updateLastActive, (req, res, next) => {
    console.log('✅ [Middleware] UpdateLastActive middleware passed');
    next();
}, populateStaffPermissions, (req, res, next) => {
    console.log('✅ [Middleware] PopulateStaffPermissions middleware passed');
    next();
});

// Apply staff validation middleware to all routes
router.use((req, res, next) => {
    console.log('🔍 [Middleware] About to call validateStaffAccess');
    unifiedStaffDashboardController.validateStaffAccess(req, res, next);
});

// Add logging for all route requests
router.use((req, res, next) => {
    console.log(`🔍 [Route] ${req.method} ${req.originalUrl} - Middleware complete, entering route handler`);
    next();
});

// ===== UNIFIED DASHBOARD ENDPOINTS =====

/**
 * @route GET /api/staff-dashboard/unified/data
 * @desc Get complete unified dashboard data with all sections
 * @access Private (Staff)
 * @query timeRange (optional): Number of days to look back (default: 30)
 * @query sections (optional): Comma-separated list of sections to include (default: all)
 * @example GET /api/staff-dashboard/unified/data?timeRange=7&sections=overview,tasks,performance
 */
router.get('/data', authorizeStaff('staff'), unifiedStaffDashboardController.getUnifiedDashboardData);

// ===== TASK MANAGEMENT ENDPOINTS =====

/**
 * @route GET /api/staff-dashboard/unified/tasks
 * @desc Get all tasks assigned to staff member with filtering and pagination
 * @access Private (Staff)
 * @query status (optional): Filter by task status
 * @query priority (optional): Filter by task priority
 * @query stage (optional): Filter by task stage
 * @query page (optional): Page number for pagination (default: 1)
 * @query limit (optional): Number of tasks per page (default: 20)
 * @example GET /api/staff-dashboard/unified/tasks?status=Pending&priority=HIGH&page=1&limit=10
 */
router.get('/tasks', authorizeStaff('staff'), unifiedStaffDashboardController.getStaffTasks);

/**
 * @route PUT /api/staff-dashboard/unified/tasks/:id/status
 * @desc Update task status with validation
 * @access Private (Staff)
 * @param id: Task ID
 * @body status: New task status
 * @body notes (optional): Notes about the status change
 * @example PUT /api/staff-dashboard/unified/tasks/64a1b2c3d4e5f6789012345/status
 * @body { "status": "In Progress", "notes": "Started working on this task" }
 */
router.put('/tasks/:id/status', authorizeStaff('staff'), unifiedStaffDashboardController.updateTaskStatus);

/**
 * @route POST /api/staff-dashboard/unified/tasks/:id/complete
 * @desc Mark task as complete with detailed completion data
 * @access Private (Staff)
 * @param id: Task ID
 * @body completionNotes (optional): Notes about completion
 * @body actualHours (optional): Actual hours spent on task
 * @body outcome (optional): Outcome description
 * @body qualityRating (optional): Quality rating (1-10)
 * @body feedback (optional): Feedback about the task
 * @example POST /api/staff-dashboard/unified/tasks/64a1b2c3d4e5f6789012345/complete
 * @body { "completionNotes": "Task completed successfully", "actualHours": 2.5, "qualityRating": 9 }
 */
router.post('/tasks/:id/complete', authorizeStaff('staff'), unifiedStaffDashboardController.completeTask);

// ===== CALENDAR MANAGEMENT ENDPOINTS =====

/**
 * @route GET /api/staff-dashboard/unified/calendar
 * @desc Get calendar events with filtering and pagination
 * @access Private (Staff)
 * @query startDate (optional): Start date for filtering (ISO string)
 * @query endDate (optional): End date for filtering (ISO string)
 * @query eventType (optional): Filter by event type
 * @query status (optional): Filter by event status
 * @query page (optional): Page number for pagination (default: 1)
 * @query limit (optional): Number of events per page (default: 50)
 * @example GET /api/staff-dashboard/unified/calendar?startDate=2024-01-01&endDate=2024-01-31&eventType=meeting
 */
router.get('/calendar', authorizeStaff('staff'), unifiedStaffDashboardController.getCalendarEvents);

/**
 * @route POST /api/staff-dashboard/unified/calendar
 * @desc Create new calendar event
 * @access Private (Staff)
 * @body eventType: Type of event (task, meeting, break, unavailable, custom)
 * @body title: Event title
 * @body startTime: Start time (ISO string)
 * @body endTime: End time (ISO string)
 * @body description (optional): Event description
 * @body priority (optional): Event priority (low, medium, high, urgent)
 * @body isRecurring (optional): Whether event is recurring (boolean)
 * @body recurrencePattern (optional): Recurrence pattern object
 * @body relatedTask (optional): Related task ID
 * @body relatedLead (optional): Related lead ID
 * @body location (optional): Event location
 * @body attendees (optional): Array of attendee IDs
 * @body notes (optional): Additional notes
 * @body tags (optional): Array of tags
 * @body color (optional): Event color
 * @body isPublic (optional): Whether event is public (boolean)
 * @body reminder (optional): Reminder settings
 * @example POST /api/staff-dashboard/unified/calendar
 * @body {
 *   "eventType": "meeting",
 *   "title": "Client Meeting",
 *   "startTime": "2024-01-15T10:00:00Z",
 *   "endTime": "2024-01-15T11:00:00Z",
 *   "description": "Meeting with client to discuss project",
 *   "priority": "high",
 *   "location": "Conference Room A"
 * }
 */
router.post('/calendar', authorizeStaff('staff'), unifiedStaffDashboardController.createCalendarEvent);

// ===== PERFORMANCE & ANALYTICS ENDPOINTS =====

/**
 * @route GET /api/staff-dashboard/unified/performance
 * @desc Get staff performance data with trends and recommendations
 * @access Private (Staff)
 * @query timeRange (optional): Number of days to analyze (default: 30)
 * @example GET /api/staff-dashboard/unified/performance?timeRange=7
 */
router.get('/performance', authorizeStaff('staff'), (req, res, next) => {
    console.log('🔍 [Performance Route] GET /performance - Starting handler');
    unifiedStaffDashboardController.getStaffPerformance(req, res, next);
});

/**
 * @route GET /api/staff-dashboard/unified/achievements
 * @desc Get staff achievements and progress
 * @access Private (Staff)
 * @query timeRange (optional): Number of days to analyze (default: 30)
 * @example GET /api/staff-dashboard/unified/achievements?timeRange=30
 */
router.get('/achievements', authorizeStaff('staff'), unifiedStaffDashboardController.getStaffAchievements);

/**
 * @route GET /api/staff-dashboard/unified/team/leaderboard
 * @desc Get team leaderboard with staff rankings
 * @access Private (Staff)
 * @query timeRange (optional): Number of days to analyze (default: 30)
 * @query limit (optional): Number of staff to include (default: 20)
 * @example GET /api/staff-dashboard/unified/team/leaderboard?timeRange=7&limit=10
 */
router.get('/team/leaderboard', authorizeStaff('staff'), unifiedStaffDashboardController.getTeamLeaderboard);

// ===== OVERVIEW ENDPOINTS =====

/**
 * @route GET /api/staff-dashboard/unified/overview
 * @desc Get overview data with key metrics
 * @access Private (Staff)
 * @example GET /api/staff-dashboard/unified/overview
 */
router.get('/overview', authorizeStaff('staff'), unifiedStaffDashboardController.getOverviewData);

/**
 * @route GET /api/staff-dashboard/unified/notifications
 * @desc Get staff notifications and alerts
 * @access Private (Staff)
 * @example GET /api/staff-dashboard/unified/notifications
 */
router.get('/notifications', authorizeStaff('staff'), unifiedStaffDashboardController.getNotifications);

// ===== TASK MANAGEMENT ADDITIONAL ENDPOINTS =====

/**
 * @route GET /api/staff-dashboard/unified/tasks/my-tasks
 * @desc Get personal task overview
 * @access Private (Staff)
 * @query timeRange (optional): Number of days to look back (default: 30)
 * @example GET /api/staff-dashboard/unified/tasks/my-tasks?timeRange=30
 */
router.get('/tasks/my-tasks', authorizeStaff('staff'), unifiedStaffDashboardController.getMyTasks);

/**
 * @route GET /api/staff-dashboard/unified/tasks/overdue
 * @desc Get overdue tasks
 * @access Private (Staff)
 * @example GET /api/staff-dashboard/unified/tasks/overdue
 */
router.get('/tasks/overdue', authorizeStaff('staff'), unifiedStaffDashboardController.getOverdueTasks);

/**
 * @route GET /api/staff-dashboard/unified/tasks/upcoming
 * @desc Get upcoming tasks
 * @access Private (Staff)
 * @query days (optional): Number of days ahead (default: 7)
 * @example GET /api/staff-dashboard/unified/tasks/upcoming?days=7
 */
router.get('/tasks/upcoming', authorizeStaff('staff'), unifiedStaffDashboardController.getUpcomingTasks);

/**
 * @route GET /api/staff-dashboard/unified/tasks/:taskId
 * @desc Get specific task details
 * @access Private (Staff)
 * @param taskId: Task ID
 * @example GET /api/staff-dashboard/unified/tasks/64a1b2c3d4e5f6789012345
 */
router.get('/tasks/:taskId', authorizeStaff('staff'), unifiedStaffDashboardController.getStaffTask);

/**
 * @route POST /api/staff-dashboard/unified/tasks/:taskId/start
 * @desc Start working on a task
 * @access Private (Staff)
 * @param taskId: Task ID
 * @example POST /api/staff-dashboard/unified/tasks/64a1b2c3d4e5f6789012345/start
 */
router.post('/tasks/:taskId/start', authorizeStaff('staff'), unifiedStaffDashboardController.startTask);

/**
 * @route POST /api/staff-dashboard/unified/tasks/:taskId/pause
 * @desc Pause working on a task
 * @access Private (Staff)
 * @param taskId: Task ID
 * @example POST /api/staff-dashboard/unified/tasks/64a1b2c3d4e5f6789012345/pause
 */
router.post('/tasks/:taskId/pause', authorizeStaff('staff'), unifiedStaffDashboardController.pauseTask);

/**
 * @route POST /api/staff-dashboard/unified/tasks/:taskId/comments
 * @desc Add comment to task
 * @access Private (Staff)
 * @param taskId: Task ID
 * @body comment: Comment content
 * @example POST /api/staff-dashboard/unified/tasks/64a1b2c3d4e5f6789012345/comments
 * @body { "comment": "Working on this task, will complete by end of day" }
 */
router.post('/tasks/:taskId/comments', authorizeStaff('staff'), unifiedStaffDashboardController.addTaskComment);

/**
 * @route POST /api/staff-dashboard/unified/tasks/:taskId/time-log
 * @desc Log time to task
 * @access Private (Staff)
 * @param taskId: Task ID
 * @body hours: Hours worked
 * @body description (optional): Description of work done
 * @example POST /api/staff-dashboard/unified/tasks/64a1b2c3d4e5f6789012345/time-log
 * @body { "hours": 1.5, "description": "Initial research and preparation" }
 */
router.post('/tasks/:taskId/time-log', authorizeStaff('staff'), unifiedStaffDashboardController.logTaskTime);

/**
 * @route PUT /api/staff-dashboard/unified/tasks/bulk-update
 * @desc Bulk update multiple tasks
 * @access Private (Staff)
 * @body taskIds: Array of task IDs
 * @body updates: Object with fields to update
 * @example PUT /api/staff-dashboard/unified/tasks/bulk-update
 * @body { "taskIds": ["task_id_1", "task_id_2"], "updates": { "status": "In Progress" } }
 */
router.put('/tasks/bulk-update', authorizeStaff('staff'), unifiedStaffDashboardController.bulkUpdateTasks);

// ===== CALENDAR MANAGEMENT ADDITIONAL ENDPOINTS =====

/**
 * @route PUT /api/staff-dashboard/unified/calendar/:eventId
 * @desc Update calendar event
 * @access Private (Staff)
 * @param eventId: Event ID
 * @body Updates to apply to the event
 * @example PUT /api/staff-dashboard/unified/calendar/64a1b2c3d4e5f6789012345
 * @body { "title": "Updated Event", "startTime": "2024-01-16T15:00:00Z" }
 */
router.put('/calendar/:eventId', authorizeStaff('staff'), unifiedStaffDashboardController.updateCalendarEvent);

/**
 * @route DELETE /api/staff-dashboard/unified/calendar/:eventId
 * @desc Delete calendar event
 * @access Private (Staff)
 * @param eventId: Event ID
 * @example DELETE /api/staff-dashboard/unified/calendar/64a1b2c3d4e5f6789012345
 */
router.delete('/calendar/:eventId', authorizeStaff('staff'), unifiedStaffDashboardController.deleteCalendarEvent);

/**
 * @route GET /api/staff-dashboard/unified/calendar/staff/:staffId/availability
 * @desc Get staff availability for a time range
 * @access Private (Staff)
 * @param staffId: Staff ID
 * @query startTime: Start time for availability check
 * @query endTime: End time for availability check
 * @example GET /api/staff-dashboard/unified/calendar/staff/64a1b2c3d4e5f6789012345/availability?startTime=2024-01-16T09:00:00Z&endTime=2024-01-16T17:00:00Z
 */
router.get('/calendar/staff/:staffId/availability', authorizeStaff('staff'), unifiedStaffDashboardController.getStaffAvailability);

// ===== APPOINTMENT MANAGEMENT ENDPOINTS =====

/**
 * @route POST /api/staff-dashboard/unified/appointments/assign
 * @desc Assign appointment to staff
 * @access Private (Staff)
 * @body appointmentId: Appointment ID
 * @body staffId: Staff ID to assign to
 * @example POST /api/staff-dashboard/unified/appointments/assign
 * @body { "appointmentId": "appointment_id_here", "staffId": "staff_id_here" }
 */
router.post('/appointments/assign', authorizeStaff('staff'), unifiedStaffDashboardController.assignAppointmentToStaff);

/**
 * @route GET /api/staff-dashboard/unified/appointments/staff/:staffId
 * @desc Get staff appointments
 * @access Private (Staff)
 * @param staffId: Staff ID
 * @query startDate (optional): Start date for filtering
 * @query endDate (optional): End date for filtering
 * @query status (optional): Filter by appointment status
 * @query page (optional): Page number
 * @query limit (optional): Appointments per page
 * @example GET /api/staff-dashboard/unified/appointments/staff/64a1b2c3d4e5f6789012345?startDate=2024-01-01&endDate=2024-01-31
 */
router.get('/appointments/staff/:staffId', authorizeStaff('staff'), unifiedStaffDashboardController.getStaffAppointments);

/**
 * @route GET /api/staff-dashboard/unified/appointments/available-staff
 * @desc Get available staff for appointment assignment
 * @access Private (Staff)
 * @query appointmentDate: Date for the appointment
 * @query appointmentTime: Time for the appointment
 * @query duration (optional): Duration in minutes (default: 30)
 * @example GET /api/staff-dashboard/unified/appointments/available-staff?appointmentDate=2024-01-16&appointmentTime=14:00&duration=30
 */
router.get('/appointments/available-staff', authorizeStaff('staff'), unifiedStaffDashboardController.getAvailableStaff);

/**
 * @route PUT /api/staff-dashboard/unified/appointments/:appointmentId/unassign
 * @desc Unassign appointment from staff
 * @access Private (Staff)
 * @param appointmentId: Appointment ID
 * @example PUT /api/staff-dashboard/unified/appointments/64a1b2c3d4e5f6789012345/unassign
 */
router.put('/appointments/:appointmentId/unassign', authorizeStaff('staff'), unifiedStaffDashboardController.unassignAppointment);

// ===== PERFORMANCE & ANALYTICS ADDITIONAL ENDPOINTS =====

/**
 * @route GET /api/staff-dashboard/unified/performance/metrics
 * @desc Get detailed performance metrics
 * @access Private (Staff)
 * @query timeRange (optional): Number of days to analyze (default: 30)
 * @query includeDetails (optional): Include detailed metrics (default: false)
 * @example GET /api/staff-dashboard/unified/performance/metrics?timeRange=30&includeDetails=true
 */
router.get('/performance/metrics', authorizeStaff('staff'), (req, res, next) => {
    console.log('🔍 [Performance Metrics Route] GET /performance/metrics - Starting handler');
    unifiedStaffDashboardController.getPerformanceMetrics(req, res, next);
});

/**
 * @route GET /api/staff-dashboard/unified/performance/comparison
 * @desc Get performance comparison between staff
 * @access Private (Staff)
 * @query timeRange (optional): Number of days to analyze (default: 30)
 * @example GET /api/staff-dashboard/unified/performance/comparison?timeRange=30
 */
router.get('/performance/comparison', authorizeStaff('staff'), unifiedStaffDashboardController.getPerformanceComparison);

/**
 * @route GET /api/staff-dashboard/unified/performance/trends
 * @desc Get performance trends over time
 * @access Private (Staff)
 * @query period (optional): Period for trends (default: monthly)
 * @query months (optional): Number of months to look back (default: 6)
 * @example GET /api/staff-dashboard/unified/performance/trends?period=monthly&months=6
 */
router.get('/performance/trends', authorizeStaff('staff'), unifiedStaffDashboardController.getPerformanceTrends);

/**
 * @route GET /api/staff-dashboard/unified/team/leaderboard
 * @desc Get team leaderboard with staff rankings
 * @access Private (Staff)
 * @query timeRange (optional): Number of days to analyze (default: 30)
 * @query limit (optional): Number of staff to include (default: 20)
 * @example GET /api/staff-dashboard/unified/team/leaderboard?timeRange=30&limit=20
 */
router.get('/team/leaderboard', authorizeStaff('staff'), unifiedStaffDashboardController.getTeamLeaderboard);

/**
 * @route GET /api/staff-dashboard/unified/analytics
 * @desc Get analytics data
 * @access Private (Staff)
 * @query timeRange (optional): Number of days to analyze (default: 30)
 * @example GET /api/staff-dashboard/unified/analytics?timeRange=30
 */
router.get('/analytics', authorizeStaff('staff'), unifiedStaffDashboardController.getAnalyticsData);

// ===== QUESTION RESPONSE SUBMISSION =====

/**
 * @route POST /api/staff-dashboard/unified/../leads/question-responses
 * @desc Submit question responses (redirects to leads API)
 * @access Private (Staff)
 * @body leadId: Lead ID
 * @body questionResponses: Object with client and coach questions
 * @body appointmentData: Appointment scheduling data
 * @example POST /api/staff-dashboard/unified/../leads/question-responses
 * @body { "leadId": "lead_id", "questionResponses": {...}, "appointmentData": {...} }
 */
router.post('/../leads/question-responses', authorizeStaff('staff'), (req, res) => {
    // Redirect to the leads API for question response submission
    res.redirect(307, '/api/leads/question-responses');
});

// ===== HEALTH CHECK ENDPOINT =====

/**
 * @route GET /api/staff-dashboard/unified/health
 * @desc Check staff dashboard health and system status
 * @access Private (Staff)
 * @example GET /api/staff-dashboard/unified/health
 */
router.get('/health', authorizeStaff('staff'), async (req, res) => {
    try {
        const globalSettings = await unifiedStaffDashboardController.getRelevantGlobalSettings();
        
        res.json({
            success: true,
            data: {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                staffInfo: {
                    staffId: req.staffInfo.staffId,
                    coachId: req.staffInfo.coachId,
                    isActive: req.staffInfo.isActive,
                    permissionsCount: req.staffInfo.permissions.length
                },
                systemStatus: {
                    maintenanceMode: globalSettings.maintenanceMode || false,
                    systemTimezone: globalSettings.systemTimezone || 'UTC',
                    debugMode: globalSettings.debugMode || false
                },
                features: {
                    taskManagement: hasPermission(req.staffInfo.permissions, 'tasks:read'),
                    calendarManagement: hasPermission(req.staffInfo.permissions, 'calendar:read'),
                    performanceTracking: hasPermission(req.staffInfo.permissions, 'performance:read'),
                    leadManagement: hasPermission(req.staffInfo.permissions, 'leads:read')
                }
            }
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
});

// ===== SYSTEM INFO ENDPOINT =====

/**
 * @route GET /api/staff-dashboard/unified/system-info
 * @desc Get system information and configuration
 * @access Private (Staff)
 * @example GET /api/staff-dashboard/unified/system-info
 */
router.get('/system-info', authorizeStaff('staff'), async (req, res) => {
    try {
        const globalSettings = await unifiedStaffDashboardController.getRelevantGlobalSettings();
        
        res.json({
            success: true,
            data: {
                platform: {
                    name: 'FunnelsEye Staff Dashboard',
                    version: '2.0.0',
                    environment: process.env.NODE_ENV || 'development'
                },
                staff: {
                    id: req.staffInfo.staffId,
                    coachId: req.staffInfo.coachId,
                    permissions: req.staffInfo.permissions,
                    isActive: req.staffInfo.isActive
                },
                system: {
                    timezone: globalSettings.systemTimezone || 'UTC',
                    dateFormat: globalSettings.dateFormat || 'MM/DD/YYYY',
                    timeFormat: globalSettings.timeFormat || '12h',
                    maintenanceMode: globalSettings.maintenanceMode || false
                },
                features: {
                    availableSections: [
                        'overview',
                        'tasks',
                        'performance',
                        'achievements',
                        'team',
                        'calendar',
                        'notifications',
                        'analytics'
                    ],
                    supportedTaskStatuses: [
                        'Pending',
                        'In Progress',
                        'Completed',
                        'Paused',
                        'Overdue',
                        'Cancelled'
                    ],
                    supportedEventTypes: [
                        'task',
                        'meeting',
                        'break',
                        'unavailable',
                        'custom'
                    ],
                    supportedPriorities: [
                        'low',
                        'medium',
                        'high',
                        'urgent'
                    ]
                }
            }
        });
    } catch (error) {
        console.error('System info error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving system information',
            error: error.message
        });
    }
});

module.exports = router;
