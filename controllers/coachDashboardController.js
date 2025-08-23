const coachDashboardService = require('../services/coachDashboardService');
const calendarService = require('../services/calendarService');
const asyncHandler = require('../middleware/async');

// Get complete dashboard data
exports.getDashboardData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const dashboardData = await coachDashboardService.getDashboardData(
        coachId, 
        parseInt(timeRange)
    );

    res.json({
        success: true,
        data: dashboardData
    });
});

// Get overview data only
exports.getOverviewData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const overview = await coachDashboardService.getOverviewData(coachId, startDate);

    res.json({
        success: true,
        data: overview
    });
});

// Get leads data only
exports.getLeadsData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const leadsData = await coachDashboardService.getLeadsData(coachId, startDate);

    res.json({
        success: true,
        data: leadsData
    });
});

// Get tasks data only
exports.getTasksData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const tasksData = await coachDashboardService.getTasksData(coachId, startDate);

    res.json({
        success: true,
        data: tasksData
    });
});

// Get marketing data only
exports.getMarketingData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const marketingData = await coachDashboardService.getMarketingData(coachId, startDate);

    res.json({
        success: true,
        data: marketingData
    });
});

// Get financial data only
exports.getFinancialData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const financialData = await coachDashboardService.getFinancialData(coachId, startDate, parseInt(timeRange));

    res.json({
        success: true,
        data: financialData
    });
});

// Get team data only
exports.getTeamData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const teamData = await coachDashboardService.getTeamData(coachId, startDate);

    res.json({
        success: true,
        data: teamData
    });
});

// Get performance data only
exports.getPerformanceData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const performanceData = await coachDashboardService.getPerformanceData(coachId, startDate);

    res.json({
        success: true,
        data: performanceData
    });
});

// Get dashboard widgets
exports.getDashboardWidgets = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;

    const widgets = await coachDashboardService.getDashboardWidgets(coachId);

    res.json({
        success: true,
        data: widgets
    });
});

// Get specific widget data
exports.getWidgetData = asyncHandler(async (req, res, next) => {
    const { widgetId } = req.params;
    const coachId = req.user.id;

    let data;
    switch (widgetId) {
        case 'revenue_chart':
            data = await coachDashboardService.getRevenueChartData(coachId);
            break;
        case 'lead_funnel':
            data = await coachDashboardService.getLeadFunnelData(coachId);
            break;
        case 'team_performance':
            const staffLeaderboardService = require('../services/staffLeaderboardService');
            data = await staffLeaderboardService.getLeaderboard(coachId, 30, 5);
            break;
        case 'task_overview':
            const workflowTaskService = require('../services/workflowTaskService');
            data = await workflowTaskService.getKanbanBoard(coachId);
            break;
        default:
            return res.status(400).json({
                success: false,
                error: 'Invalid widget ID'
            });
    }

    res.json({
        success: true,
        data: data
    });
});

// Get performance trends
exports.getPerformanceTrends = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const trends = await coachDashboardService.getPerformanceTrends(coachId, startDate);

    res.json({
        success: true,
        data: trends
    });
});

// Get performance alerts
exports.getPerformanceAlerts = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const alerts = await coachDashboardService.getPerformanceAlerts(coachId, startDate);

    res.json({
        success: true,
        data: alerts
    });
});

// Get AI insights
exports.getAIInsights = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const insights = await coachDashboardService.getAIInsights(coachId, startDate);

    res.json({
        success: true,
        data: insights
    });
});

// Get KPIs
exports.getKPIs = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const kpis = await coachDashboardService.calculateKPIs(coachId, startDate);

    res.json({
        success: true,
        data: kpis
    });
});

// Get dashboard sections configuration
exports.getDashboardSections = asyncHandler(async (req, res, next) => {
    res.json({
        success: true,
        data: coachDashboardService.dashboardSections
    });
});

// Get real-time dashboard updates
exports.getRealTimeUpdates = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;

    // Get only critical updates that need real-time monitoring
    const [overview, alerts] = await Promise.all([
        coachDashboardService.getOverviewData(coachId, new Date(Date.now() - 24 * 60 * 60 * 1000)), // Last 24 hours
        coachDashboardService.getPerformanceAlerts(coachId, new Date(Date.now() - 24 * 60 * 60 * 1000))
    ]);

    res.json({
        success: true,
        data: {
            overview: overview.metrics,
            alerts: alerts,
            lastUpdated: new Date().toISOString()
        }
    });
});

// Export dashboard data
exports.exportDashboardData = asyncHandler(async (req, res, next) => {
    const { timeRange = 30, format = 'json' } = req.query;
    const coachId = req.user.id;

    const dashboardData = await coachDashboardService.getDashboardData(
        coachId, 
        parseInt(timeRange)
    );

    if (format === 'csv') {
        // Convert to CSV format
        const csvData = convertToCSV(dashboardData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=dashboard-data.csv');
        return res.send(csvData);
    }

    res.json({
        success: true,
        data: dashboardData
    });
});

// ===== NEW: CALENDAR & APPOINTMENT MANAGEMENT =====

// Get coach's calendar for a date range
exports.getCalendar = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const coachId = req.user.id;

    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: 'Both startDate and endDate are required'
        });
    }

    const calendar = await calendarService.getCoachCalendar(coachId, startDate, endDate);

    res.json({
        success: true,
        data: calendar
    });
});

// Get available booking slots for a specific date
exports.getAvailableSlots = asyncHandler(async (req, res, next) => {
    const { date } = req.query;
    const coachId = req.user.id;

    if (!date) {
        return res.status(400).json({
            success: false,
            message: 'Date is required'
        });
    }

    const slots = await calendarService.getAvailableSlots(coachId, date);

    res.json({
        success: true,
        data: slots
    });
});

// Book a new appointment
exports.bookAppointment = asyncHandler(async (req, res, next) => {
    const { leadId, startTime, duration, notes, timeZone } = req.body;
    const coachId = req.user.id;

    if (!leadId || !startTime || !duration) {
        return res.status(400).json({
            success: false,
            message: 'leadId, startTime, and duration are required'
        });
    }

    const appointment = await calendarService.bookAppointment(
        coachId, 
        leadId, 
        startTime, 
        duration, 
        notes, 
        timeZone
    );

    res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: appointment
    });
});

// Get upcoming appointments
exports.getUpcomingAppointments = asyncHandler(async (req, res, next) => {
    const { limit = 10 } = req.query;
    const coachId = req.user.id;

    const appointments = await calendarService.getUpcomingAppointments(coachId, parseInt(limit));

    res.json({
        success: true,
        data: appointments
    });
});

// Get today's appointments
exports.getTodayAppointments = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;

    const appointments = await calendarService.getTodayAppointments(coachId);

    res.json({
        success: true,
        data: appointments
    });
});

// Reschedule an appointment
exports.rescheduleAppointment = asyncHandler(async (req, res, next) => {
    const { appointmentId } = req.params;
    const { newStartTime, newDuration } = req.body;
    const coachId = req.user.id;

    if (!newStartTime) {
        return res.status(400).json({
            success: false,
            message: 'newStartTime is required'
        });
    }

    const appointment = await calendarService.rescheduleAppointment(
        appointmentId, 
        coachId, 
        newStartTime, 
        newDuration
    );

    res.json({
        success: true,
        message: 'Appointment rescheduled successfully',
        data: appointment
    });
});

// Cancel an appointment
exports.cancelAppointment = asyncHandler(async (req, res, next) => {
    const { appointmentId } = req.params;
    const coachId = req.user.id;

    const result = await calendarService.cancelAppointment(appointmentId, coachId);

    res.json({
        success: true,
        message: result.message
    });
});

// Get appointment statistics
exports.getAppointmentStats = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const stats = await calendarService.getAppointmentStats(coachId, parseInt(timeRange));

    res.json({
        success: true,
        data: stats
    });
});

// Get coach availability settings
exports.getAvailability = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;

    const availability = await calendarService.getCoachAvailability(coachId);

    res.json({
        success: true,
        data: availability
    });
});

// Set coach availability settings
exports.setAvailability = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const availabilityData = req.body;

    const availability = await calendarService.setCoachAvailability(coachId, availabilityData);

    res.json({
        success: true,
        message: 'Availability settings updated successfully',
        data: availability
    });
});

// Helper function to convert data to CSV
function convertToCSV(data) {
    // This is a simplified CSV conversion
    // In a real implementation, you'd want a more robust CSV library
    const lines = [];
    
    // Add headers
    lines.push('Metric,Value');
    
    // Add overview metrics
    Object.entries(data.overview.metrics).forEach(([key, value]) => {
        lines.push(`${key},${value}`);
    });
    
    return lines.join('\n');
}
