const staffLeaderboardService = require('../services/staffLeaderboardService');
const asyncHandler = require('../middleware/async');

// Get staff leaderboard
exports.getLeaderboard = asyncHandler(async (req, res, next) => {
    const { timeRange = 30, limit = 20 } = req.query;
    const coachId = req.user.id;

    const leaderboard = await staffLeaderboardService.getLeaderboard(
        coachId, 
        parseInt(timeRange), 
        parseInt(limit)
    );

    res.json({
        success: true,
        data: leaderboard
    });
});

// Get individual staff score
exports.getStaffScore = asyncHandler(async (req, res, next) => {
    const { staffId } = req.params;
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const score = await staffLeaderboardService.calculateStaffScore(
        staffId, 
        coachId, 
        parseInt(timeRange)
    );

    res.json({
        success: true,
        data: score
    });
});

// Get staff achievements
exports.getStaffAchievements = asyncHandler(async (req, res, next) => {
    const { staffId } = req.params;
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const achievements = await staffLeaderboardService.getStaffAchievements(
        staffId, 
        coachId, 
        parseInt(timeRange)
    );

    res.json({
        success: true,
        data: achievements
    });
});

// Get staff progress over time
exports.getStaffProgress = asyncHandler(async (req, res, next) => {
    const { staffId } = req.params;
    const { days = 30 } = req.query;
    const coachId = req.user.id;

    const progress = await staffLeaderboardService.getStaffProgress(
        staffId, 
        coachId, 
        parseInt(days)
    );

    res.json({
        success: true,
        data: progress
    });
});

// Get team analytics
exports.getTeamAnalytics = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const analytics = await staffLeaderboardService.getTeamAnalytics(
        coachId, 
        parseInt(timeRange)
    );

    res.json({
        success: true,
        data: analytics
    });
});

// Get most improved staff member
exports.getMostImprovedStaff = asyncHandler(async (req, res, next) => {
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    const mostImproved = await staffLeaderboardService.getMostImprovedStaff(
        coachId, 
        parseInt(timeRange)
    );

    res.json({
        success: true,
        data: mostImproved
    });
});

// Get ranking levels configuration
exports.getRankingLevels = asyncHandler(async (req, res, next) => {
    res.json({
        success: true,
        data: staffLeaderboardService.rankingLevels
    });
});

// Get achievements configuration
exports.getAchievements = asyncHandler(async (req, res, next) => {
    res.json({
        success: true,
        data: staffLeaderboardService.achievements
    });
});

// Get scoring weights
exports.getScoringWeights = asyncHandler(async (req, res, next) => {
    res.json({
        success: true,
        data: staffLeaderboardService.scoringWeights
    });
});

// Update scoring weights (admin only)
exports.updateScoringWeights = asyncHandler(async (req, res, next) => {
    const { weights } = req.body;
    const coachId = req.user.id;

    // Validate weights
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalWeight - 1) > 0.01) {
        return res.status(400).json({
            success: false,
            error: 'Weights must sum to 1.0'
        });
    }

    // Update weights
    Object.assign(staffLeaderboardService.scoringWeights, weights);

    res.json({
        success: true,
        message: 'Scoring weights updated successfully',
        data: staffLeaderboardService.scoringWeights
    });
});

// Get staff comparison
exports.getStaffComparison = asyncHandler(async (req, res, next) => {
    const { staffIds } = req.query;
    const { timeRange = 30 } = req.query;
    const coachId = req.user.id;

    if (!staffIds || !Array.isArray(staffIds)) {
        return res.status(400).json({
            success: false,
            error: 'staffIds array is required'
        });
    }

    const comparison = await Promise.all(
        staffIds.map(async (staffId) => {
            const score = await staffLeaderboardService.calculateStaffScore(
                staffId, 
                coachId, 
                parseInt(timeRange)
            );
            return {
                staffId,
                score: score.scores.total,
                detailedScores: score.scores,
                metrics: score.metrics
            };
        })
    );

    res.json({
        success: true,
        data: comparison
    });
});

// Get performance trends for all staff
exports.getTeamPerformanceTrends = asyncHandler(async (req, res, next) => {
    const { days = 30 } = req.query;
    const coachId = req.user.id;

    const leaderboard = await staffLeaderboardService.getLeaderboard(coachId, days);
    const trends = await Promise.all(
        leaderboard.map(async (staff) => {
            const progress = await staffLeaderboardService.getStaffProgress(
                staff.staffId, 
                coachId, 
                parseInt(days)
            );
            return {
                staffId: staff.staffId,
                name: staff.name,
                progress: progress
            };
        })
    );

    res.json({
        success: true,
        data: trends
    });
});
