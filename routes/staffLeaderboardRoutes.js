const express = require('express');
const router = express.Router();
const { 
    getLeaderboard, 
    getStaffScore, 
    getStaffAchievements, 
    getStaffProgress, 
    getTeamAnalytics, 
    getMostImprovedStaff, 
    getRankingLevels, 
    getAchievements, 
    getScoringWeights, 
    updateScoringWeights, 
    getStaffComparison, 
    getTeamPerformanceTrends 
} = require('../controllers/staffLeaderboardController');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Get staff leaderboard
router.get('/leaderboard', getLeaderboard);

// Get individual staff score
router.get('/staff/:staffId/score', getStaffScore);

// Get staff achievements
router.get('/staff/:staffId/achievements', getStaffAchievements);

// Get staff progress over time
router.get('/staff/:staffId/progress', getStaffProgress);

// Get team analytics
router.get('/team/analytics', getTeamAnalytics);

// Get most improved staff member
router.get('/team/most-improved', getMostImprovedStaff);

// Get team performance trends
router.get('/team/trends', getTeamPerformanceTrends);

// Get staff comparison
router.get('/staff/comparison', getStaffComparison);

// Get configuration data
router.get('/config/ranking-levels', getRankingLevels);
router.get('/config/achievements', getAchievements);
router.get('/config/scoring-weights', getScoringWeights);

// Update configuration (admin only)
router.put('/config/scoring-weights', updateScoringWeights);

module.exports = router;
