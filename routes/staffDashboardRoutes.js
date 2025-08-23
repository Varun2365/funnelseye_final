const express = require('express');
const router = express.Router();
const { 
    getDashboardData, 
    getOverviewData, 
    getTasksData, 
    getPerformanceData, 
    getAchievements, 
    getTeamData, 
    getProgress, 
    getComparison, 
    getGoals, 
    getCalendar, 
    getNotifications, 
    getAnalytics 
} = require('../controllers/staffDashboardController');
const { protect, authorizeStaff } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply authentication and activity middleware to all routes
router.use(protect, updateLastActive);

// ===== MAIN DASHBOARD =====

// Get complete dashboard data
router.get('/data', authorizeStaff('staff'), getDashboardData);

// Get specific dashboard sections
router.get('/overview', authorizeStaff('staff'), getOverviewData);
router.get('/tasks', authorizeStaff('staff'), getTasksData);
router.get('/performance', authorizeStaff('staff'), getPerformanceData);
router.get('/achievements', authorizeStaff('staff'), getAchievements);
router.get('/team', authorizeStaff('staff'), getTeamData);

// ===== PERFORMANCE & PROGRESS =====

// Get staff progress over time
router.get('/progress', authorizeStaff('staff'), getProgress);

// Get staff comparison with team
router.get('/comparison', authorizeStaff('staff'), getComparison);

// ===== GOALS & PLANNING =====

// Get staff goals and targets
router.get('/goals', authorizeStaff('staff'), getGoals);

// Get staff calendar and schedule
router.get('/calendar', authorizeStaff('staff'), getCalendar);

// ===== NOTIFICATIONS & INSIGHTS =====

// Get staff notifications and alerts
router.get('/notifications', authorizeStaff('staff'), getNotifications);

// Get staff analytics and insights
router.get('/analytics', authorizeStaff('staff'), getAnalytics);

module.exports = router;
