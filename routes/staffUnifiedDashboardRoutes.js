const express = require('express');
const router = express.Router();
const staffUnifiedDashboardController = require('../controllers/staffUnifiedDashboardController');
const staffEnhancedFeaturesRoutes = require('./staffEnhancedFeaturesRoutes');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Apply staff access validation to all routes
router.use(staffUnifiedDashboardController.validateStaffAccess);

// ===== MAIN DASHBOARD ENDPOINTS =====

// Get complete dashboard data with permission filtering
router.get('/data', staffUnifiedDashboardController.getDashboardData);

// Get specific dashboard sections
router.get('/overview', staffUnifiedDashboardController.getOverviewData);
router.get('/leads', staffUnifiedDashboardController.getLeadsData);
router.get('/tasks', staffUnifiedDashboardController.getTasksData);
router.get('/marketing', staffUnifiedDashboardController.getMarketingData);
router.get('/financial', staffUnifiedDashboardController.getFinancialData);
router.get('/team', staffUnifiedDashboardController.getTeamData);
router.get('/performance', staffUnifiedDashboardController.getPerformanceData);
router.get('/calendar', staffUnifiedDashboardController.getCalendarData);

// ===== LEAD MANAGEMENT ENDPOINTS =====

// Lead CRUD operations
router.get('/leads/:leadId', staffUnifiedDashboardController.getLeadDetails);
router.post('/leads', staffUnifiedDashboardController.createLead);
router.put('/leads/:leadId', staffUnifiedDashboardController.updateLead);
router.delete('/leads/:leadId', staffUnifiedDashboardController.deleteLead);

// ===== TASK MANAGEMENT ENDPOINTS =====

// Task CRUD operations
router.get('/tasks/:taskId', staffUnifiedDashboardController.getTaskDetails);
router.post('/tasks', staffUnifiedDashboardController.createTask);
router.put('/tasks/:taskId', staffUnifiedDashboardController.updateTask);
router.delete('/tasks/:taskId', staffUnifiedDashboardController.deleteTask);
router.post('/tasks/:taskId/assign', staffUnifiedDashboardController.assignTask);

// ===== MARKETING MANAGEMENT ENDPOINTS =====

// Ad Campaign management
router.get('/marketing/campaigns', staffUnifiedDashboardController.getAdCampaigns);
router.post('/marketing/campaigns', staffUnifiedDashboardController.createAdCampaign);
router.put('/marketing/campaigns/:campaignId', staffUnifiedDashboardController.updateAdCampaign);
router.delete('/marketing/campaigns/:campaignId', staffUnifiedDashboardController.deleteAdCampaign);

// ===== FINANCIAL MANAGEMENT ENDPOINTS =====

// Payment management
router.get('/financial/payments', staffUnifiedDashboardController.getPayments);
router.get('/financial/payments/:paymentId', staffUnifiedDashboardController.getPaymentDetails);
router.put('/financial/payments/:paymentId/status', staffUnifiedDashboardController.updatePaymentStatus);

// ===== TEAM MANAGEMENT ENDPOINTS =====

// Staff management
router.get('/team/staff', staffUnifiedDashboardController.getStaffMembers);
router.post('/team/staff', staffUnifiedDashboardController.createStaffMember);
router.put('/team/staff/:staffId', staffUnifiedDashboardController.updateStaffMember);
router.delete('/team/staff/:staffId', staffUnifiedDashboardController.deleteStaffMember);
router.put('/team/staff/:staffId/permissions', staffUnifiedDashboardController.updateStaffPermissions);

// ===== CALENDAR MANAGEMENT ENDPOINTS =====

// Appointment management
router.get('/calendar/appointments', staffUnifiedDashboardController.getAppointments);
router.post('/calendar/appointments', staffUnifiedDashboardController.createAppointment);
router.put('/calendar/appointments/:appointmentId', staffUnifiedDashboardController.updateAppointment);
router.delete('/calendar/appointments/:appointmentId', staffUnifiedDashboardController.deleteAppointment);
router.post('/calendar/book', staffUnifiedDashboardController.bookAppointment);

// ===== FUNNEL MANAGEMENT ENDPOINTS =====

// Get all funnels (with permission filtering)
router.get('/funnels', staffUnifiedDashboardController.getFunnelsData);

// Get specific funnel details
router.get('/funnels/:funnelId', staffUnifiedDashboardController.getFunnelDetails);

// Create new funnel (requires funnels:write permission)
router.post('/funnels', staffUnifiedDashboardController.createFunnel);

// Update funnel (requires funnels:update permission)
router.put('/funnels/:funnelId', staffUnifiedDashboardController.updateFunnel);

// Delete funnel (requires funnels:delete permission)
router.delete('/funnels/:funnelId', staffUnifiedDashboardController.deleteFunnel);

// Funnel stage management
router.post('/funnels/:funnelId/stages', staffUnifiedDashboardController.addStageToFunnel);
router.put('/funnels/:funnelId/stages/:stageId', staffUnifiedDashboardController.updateFunnelStage);
router.delete('/funnels/:funnelId/stages/:stageId', staffUnifiedDashboardController.deleteFunnelStage);

// Funnel analytics and publishing
router.get('/funnels/:funnelId/analytics', staffUnifiedDashboardController.getFunnelAnalytics);
router.put('/funnels/:funnelId/publish', staffUnifiedDashboardController.toggleFunnelPublish);
router.put('/funnels/:funnelId/unpublish', staffUnifiedDashboardController.toggleFunnelPublish);

// ===== DASHBOARD WIDGETS =====

// Get dashboard widgets configuration
router.get('/widgets', staffUnifiedDashboardController.getDashboardWidgets);

// Get specific widget data
router.get('/widgets/:widgetId', staffUnifiedDashboardController.getWidgetData);

// ===== ENHANCED FEATURES =====
// Mount enhanced features routes
router.use('/', staffEnhancedFeaturesRoutes);

module.exports = router;
