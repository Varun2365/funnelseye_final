// D:\\PRJ_YCT_Final\\routes\\funnelRoutes.js

const express = require('express');
const router = express.Router();
const funnelController = require('../controllers/funnelController');
const { protect, authorizeCoach } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware'); // Your new middleware
const StaffPermissionMiddleware = require('../middleware/staffPermissionMiddleware');
const { getFunnelAnalytics } = require('../controllers/analyticsController');

// --- Public Routes (Must be defined BEFORE router.use()) ---
// Track a funnel event (no changes needed here as it deals with FunnelEvent schema)
router.post('/track', funnelController.trackFunnelEvent);

// --- Apply authentication and activity tracking to all routes below this line ---
router.use(protect, updateLastActive, StaffPermissionMiddleware.ensureCoachDataAccess());

// Route to get all funnels for a specific coach
router.get('/coach/:coachId/funnels', authorizeCoach(), StaffPermissionMiddleware.checkFunnelPermission('read'), funnelController.getFunnelsByCoachId);

// Route to get a specific funnel by ID
router.get('/coach/:coachId/funnels/:funnelId', authorizeCoach(), StaffPermissionMiddleware.checkFunnelPermission('read'), funnelController.getFunnelById);

// Route to create a new funnel
router.post('/coach/:coachId/funnels', authorizeCoach(), StaffPermissionMiddleware.checkFunnelPermission('write'), funnelController.createFunnel);

// Route to update an existing funnel
router.put('/coach/:coachId/funnels/:funnelId', authorizeCoach(), StaffPermissionMiddleware.checkFunnelPermission('update'), funnelController.updateFunnel);

// Route to delete a funnel
router.delete('/coach/:coachId/funnels/:funnelId', authorizeCoach(), StaffPermissionMiddleware.checkFunnelPermission('delete'), funnelController.deleteFunnel);


// Route to add a new stage to a funnel
router.post(
    '/:funnelId/stages',
    authorizeCoach(),
    StaffPermissionMiddleware.checkFunnelPermission('manage_stages'),
    funnelController.addStageToFunnel
);

// PUT /api/funnels/:funnelId/stages/:stageId
router.put(
    '/:funnelId/stages/:stageId',
    authorizeCoach(),
    StaffPermissionMiddleware.checkFunnelPermission('manage_stages'),
    funnelController.editFunnelStage
);

// Get analytics for a specific funnel
router.get('/:funnelId/analytics', authorizeCoach(), StaffPermissionMiddleware.checkFunnelPermission('view_analytics'), getFunnelAnalytics);

module.exports = router;