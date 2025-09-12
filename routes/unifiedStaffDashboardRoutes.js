const express = require('express');
const router = express.Router();
const unifiedStaffDashboardController = require('../controllers/unifiedStaffDashboardController');
const { protect, authorizeStaff } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const { populateStaffPermissions } = require('../middleware/permissionMiddleware');

// Apply authentication and activity middleware to all routes
router.use(protect, updateLastActive, populateStaffPermissions);

// Apply staff validation middleware to all routes
router.use(unifiedStaffDashboardController.validateStaffAccess);

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
router.get('/performance', authorizeStaff('staff'), unifiedStaffDashboardController.getStaffPerformance);

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
