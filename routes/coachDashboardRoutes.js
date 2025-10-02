const express = require('express');
const router = express.Router();
const { 
    getDashboardData, 
    getOverviewData, 
    getLeadsData, 
    getTasksData, 
    getMarketingData, 
    getFinancialData, 
    getTeamData, 
    getPerformanceData, 
    getDashboardWidgets, 
    getWidgetData, 
    getPerformanceTrends, 
    getPerformanceAlerts, 
    getAIInsights, 
    getKPIs, 
    getDashboardSections, 
    getRealTimeUpdates, 
    exportDashboardData,
    // NEW: Calendar & Appointment Management
    getCalendar,
    getAvailableSlots,
    bookAppointment,
    getUpcomingAppointments,
    getTodayAppointments,
    rescheduleAppointment,
    cancelAppointment,
    getAppointmentStats,
    getAvailability,
    setAvailability,
    // NEW: Zoom Meetings Management
    getZoomMeetings,
    getZoomMeetingDetails
} = require('../controllers/coachDashboardController');
const { protect } = require('../middleware/auth');
const StaffPermissionMiddleware = require('../middleware/staffPermissionMiddleware');

// Apply authentication middleware to all routes
router.use(protect, StaffPermissionMiddleware.ensureCoachDataAccess());

// ===== DASHBOARD DATA ENDPOINTS =====

// Get complete dashboard data
router.get('/data', StaffPermissionMiddleware.checkDashboardPermission('overview'), getDashboardData);

// Get specific dashboard sections
router.get('/overview', StaffPermissionMiddleware.checkDashboardPermission('overview'), getOverviewData);
router.get('/leads', StaffPermissionMiddleware.checkDashboardPermission('leads'), getLeadsData);
router.get('/tasks', StaffPermissionMiddleware.checkDashboardPermission('tasks'), getTasksData);
router.get('/marketing', StaffPermissionMiddleware.checkDashboardPermission('marketing'), getMarketingData);
router.get('/financial', StaffPermissionMiddleware.checkDashboardPermission('financial'), getFinancialData);
router.get('/team', StaffPermissionMiddleware.checkDashboardPermission('team'), getTeamData);
router.get('/performance', StaffPermissionMiddleware.checkDashboardPermission('performance'), getPerformanceData);

// Get dashboard widgets
router.get('/widgets', StaffPermissionMiddleware.checkDashboardPermission('overview'), getDashboardWidgets);
router.get('/widgets/:widgetId', StaffPermissionMiddleware.checkDashboardPermission('overview'), getWidgetData);

// Get performance data
router.get('/trends', StaffPermissionMiddleware.checkPerformancePermission('read'), getPerformanceTrends);
router.get('/alerts', StaffPermissionMiddleware.checkPerformancePermission('read'), getPerformanceAlerts);
router.get('/ai-insights', StaffPermissionMiddleware.checkAIPermission('read'), getAIInsights);
router.get('/kpis', StaffPermissionMiddleware.checkPerformancePermission('read'), getKPIs);

// Get configuration and real-time data
router.get('/sections', StaffPermissionMiddleware.checkDashboardPermission('overview'), getDashboardSections);
router.get('/real-time', StaffPermissionMiddleware.checkDashboardPermission('overview'), getRealTimeUpdates);

// Export dashboard data
router.get('/export', StaffPermissionMiddleware.checkPerformancePermission('read'), exportDashboardData);

// ===== NEW: CALENDAR & APPOINTMENT MANAGEMENT =====

// Calendar view and management
router.get('/calendar', StaffPermissionMiddleware.checkCalendarPermission('read'), getCalendar);
router.get('/available-slots', StaffPermissionMiddleware.checkCalendarPermission('read'), getAvailableSlots);

// Appointment management
router.post('/appointments', StaffPermissionMiddleware.checkAppointmentPermission('write'), bookAppointment);
router.get('/appointments/upcoming', StaffPermissionMiddleware.checkAppointmentPermission('read'), getUpcomingAppointments);
router.get('/appointments/today', StaffPermissionMiddleware.checkAppointmentPermission('read'), getTodayAppointments);
router.put('/appointments/:appointmentId/reschedule', StaffPermissionMiddleware.checkAppointmentPermission('reschedule'), rescheduleAppointment);
router.delete('/appointments/:appointmentId', StaffPermissionMiddleware.checkAppointmentPermission('delete'), cancelAppointment);

// Appointment analytics
router.get('/appointments/stats', StaffPermissionMiddleware.checkAppointmentPermission('read'), getAppointmentStats);

// Coach availability settings
router.get('/availability', StaffPermissionMiddleware.checkCalendarPermission('read'), getAvailability);
router.put('/availability', StaffPermissionMiddleware.checkCalendarPermission('manage'), setAvailability);

// ===== ZOOM MEETINGS MANAGEMENT =====

// Get all Zoom meetings for the coach
router.get('/zoom-meetings', StaffPermissionMiddleware.checkAppointmentPermission('read'), getZoomMeetings);

// Get Zoom meeting details for a specific appointment
router.get('/zoom-meetings/appointment/:appointmentId', StaffPermissionMiddleware.checkAppointmentPermission('read'), getZoomMeetingDetails);

module.exports = router;
