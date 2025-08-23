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
    getIntegrationStatus
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

// ===== MEETING TEMPLATES =====

// Create meeting template
router.post('/meeting-templates', authorizeCoach(), createMeetingTemplate);

// Get meeting templates
router.get('/meeting-templates', authorizeCoach(), getMeetingTemplates);

// ===== INTEGRATION MANAGEMENT =====

// Delete Zoom integration
router.delete('/', authorizeCoach(), deleteZoomIntegration);

module.exports = router;
