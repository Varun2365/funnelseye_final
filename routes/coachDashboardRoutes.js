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
    exportDashboardData 
} = require('../controllers/coachDashboardController');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

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

module.exports = router;
