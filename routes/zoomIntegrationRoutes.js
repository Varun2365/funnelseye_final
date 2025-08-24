const express = require('express');
const router = express.Router();
const {
    setupZoomIntegration,
    getZoomIntegration,
    updateZoomIntegration,
    testZoomConnection,
    getZoomUsage,
    createMeetingTemplate,
    getMeetingTemplates,
    deleteZoomIntegration,
    getIntegrationStatus,
    // NEW: Zoom Meeting Management
    getZoomMeetingForAppointment,
    getCoachZoomMeetings,
    // NEW: Zoom Cleanup Management
    startCleanup,
    stopCleanup,
    manualCleanup,
    getCleanupStats,
    updateRetentionPeriod
} = require('../controllers/zoomIntegrationController');

const { protect, authorizeCoach } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply authentication and activity tracking to all routes
router.use(protect, updateLastActive);

// ===== ZOOM INTEGRATION SETUP & MANAGEMENT =====

// Setup Zoom integration
router.post('/setup', authorizeCoach(), setupZoomIntegration);

// Get Zoom integration details
router.get('/', authorizeCoach(), getZoomIntegration);

// Update Zoom integration settings
router.put('/', authorizeCoach(), updateZoomIntegration);

// Test Zoom connection
router.post('/test', authorizeCoach(), testZoomConnection);

// Get Zoom usage statistics
router.get('/usage', authorizeCoach(), getZoomUsage);

// Get integration status
router.get('/status', authorizeCoach(), getIntegrationStatus);

// ===== ZOOM MEETING MANAGEMENT =====

// Get Zoom meeting details for an appointment
router.get('/meetings/appointment/:appointmentId', authorizeCoach(), getZoomMeetingForAppointment);

// Get all Zoom meetings for a coach
router.get('/meetings', authorizeCoach(), getCoachZoomMeetings);

// ===== MEETING TEMPLATES =====

// Create meeting template
router.post('/meeting-templates', authorizeCoach(), createMeetingTemplate);

// Get meeting templates
router.get('/meeting-templates', authorizeCoach(), getMeetingTemplates);

// ===== INTEGRATION MANAGEMENT =====

// Delete Zoom integration
router.delete('/', authorizeCoach(), deleteZoomIntegration);

// ===== ZOOM CLEANUP MANAGEMENT =====

// Start automatic cleanup
router.post('/cleanup/start', authorizeCoach(), startCleanup);

// Stop automatic cleanup
router.post('/cleanup/stop', authorizeCoach(), stopCleanup);

// Manual cleanup
router.post('/cleanup/manual', authorizeCoach(), manualCleanup);

// Get cleanup statistics
router.get('/cleanup/stats', authorizeCoach(), getCleanupStats);

// Update retention period
router.put('/cleanup/retention', authorizeCoach(), updateRetentionPeriod);

module.exports = router;
