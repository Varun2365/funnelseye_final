const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const adminAuth = require('../../middleware/adminAuth');

// Apply admin authentication middleware to all routes
router.use(adminAuth);

// Dashboard Overview
router.get('/', adminDashboardController.getDashboardOverview);

// Real-time Updates
router.get('/updates/:section', adminDashboardController.getRealTimeUpdates);

// Cache Management
router.post('/refresh', adminDashboardController.refreshDashboardCache);

// Financial Overview
router.get('/financial', adminDashboardController.getFinancialOverview);

// System Health
router.get('/health', adminDashboardController.getSystemHealth);

// Notification Statistics
router.get('/notifications', adminDashboardController.getNotificationStats);

// User Activity
router.get('/user-activity', adminDashboardController.getUserActivity);

// Revenue Analytics
router.get('/revenue', adminDashboardController.getRevenueAnalytics);

// Platform Performance
router.get('/performance', adminDashboardController.getPlatformPerformance);

// Quick Actions
router.get('/quick-actions', adminDashboardController.getQuickActions);

module.exports = router;
