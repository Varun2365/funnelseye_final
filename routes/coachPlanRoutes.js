const express = require('express');
const router = express.Router();
const {
    createCoachPlan,
    getCoachPlans,
    getCoachPlan,
    updateCoachPlan,
    deleteCoachPlan,
    getPublicPlans,
    getFeaturedPlans,
    searchPlans,
    getPlanAnalytics
} = require('../controllers/coachPlanController');

// ===== COACH PLAN ROUTES =====

// @route   POST /api/coach-plans
// @desc    Create a new coach plan
// @access  Private (Coach)
router.post('/', createCoachPlan);

// @route   GET /api/coach-plans/coach/:coachId
// @desc    Get all plans for a specific coach
// @access  Private
router.get('/coach/:coachId', getCoachPlans);

// @route   GET /api/coach-plans/:planId
// @desc    Get a specific coach plan
// @access  Public (for viewing plans)
router.get('/:planId', getCoachPlan);

// @route   PUT /api/coach-plans/:planId
// @desc    Update a coach plan
// @access  Private (Coach - owner only)
router.put('/:planId', updateCoachPlan);

// @route   DELETE /api/coach-plans/:planId
// @desc    Delete a coach plan
// @access  Private (Coach - owner only)
router.delete('/:planId', deleteCoachPlan);

// @route   GET /api/coach-plans/public
// @desc    Get public plans (for customers to browse)
// @access  Public
router.get('/public', getPublicPlans);

// @route   GET /api/coach-plans/featured
// @desc    Get featured plans
// @access  Public
router.get('/featured', getFeaturedPlans);

// @route   GET /api/coach-plans/search
// @desc    Search plans
// @access  Public
router.get('/search', searchPlans);

// @route   GET /api/coach-plans/analytics/:coachId
// @desc    Get plan analytics for a coach
// @access  Private (Coach - owner only)
router.get('/analytics/:coachId', getPlanAnalytics);

module.exports = router;
