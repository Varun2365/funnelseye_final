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
    setAvailability
} = require('../controllers/coachDashboardController');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// ===== DASHBOARD DATA ENDPOINTS =====

// Get complete dashboard data
router.get('/data', getDashboardData);

// Get specific dashboard sections
router.get('/overview', getOverviewData);
router.get('/leads', getLeadsData);
router.get('/tasks', getTasksData);
router.get('/marketing', getMarketingData);
router.get('/financial', getFinancialData);
router.get('/team', getTeamData);
router.get('/performance', getPerformanceData);

// Get dashboard widgets
router.get('/widgets', getDashboardWidgets);
router.get('/widgets/:widgetId', getWidgetData);

// Get performance data
router.get('/trends', getPerformanceTrends);
router.get('/alerts', getPerformanceAlerts);
router.get('/ai-insights', getAIInsights);
router.get('/kpis', getKPIs);

// Get configuration and real-time data
router.get('/sections', getDashboardSections);
router.get('/real-time', getRealTimeUpdates);

// Export dashboard data
router.get('/export', exportDashboardData);

// ===== NEW: CALENDAR & APPOINTMENT MANAGEMENT =====

// Calendar view and management
router.get('/calendar', getCalendar);
router.get('/available-slots', getAvailableSlots);

// Appointment management
router.post('/appointments', bookAppointment);
router.get('/appointments/upcoming', getUpcomingAppointments);
router.get('/appointments/today', getTodayAppointments);
router.put('/appointments/:appointmentId/reschedule', rescheduleAppointment);
router.delete('/appointments/:appointmentId', cancelAppointment);

// Appointment analytics
router.get('/appointments/stats', getAppointmentStats);

// Coach availability settings
router.get('/availability', getAvailability);
router.put('/availability', setAvailability);

module.exports = router;
