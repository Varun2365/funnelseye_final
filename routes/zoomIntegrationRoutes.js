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

// ===== PUBLIC ROUTES (No Authentication Required) =====

// Get Zoom API setup guide (Public)
router.get('/setup-guide', (req, res) => {
    const setupGuide = {
        title: "🔗 Zoom Integration Setup Guide",
        description: "Complete step-by-step guide to set up Zoom API integration",
        steps: [
            {
                step: 1,
                title: "Create Zoom Marketplace App",
                description: "Create a Server-to-Server OAuth app in Zoom Marketplace",
                details: [
                    "Go to https://marketplace.zoom.us/",
                    "Sign in with your Zoom account",
                    "Click 'Develop' > 'Build App'",
                    "Select 'Server-to-Server OAuth'",
                    "Fill in app details:",
                    "  - App Name: 'Your Coaching Platform Integration'",
                    "  - Short Description: 'Integration for coaching platform'",
                    "  - Company Name: Your company name",
                    "  - Developer Contact: Your email"
                ],
                required: true
            },
            {
                step: 2,
                title: "Configure App Scopes",
                description: "Set up required OAuth scopes for meeting management",
                details: [
                    "In your app settings, go to 'Scopes' tab",
                    "Add the following OAuth scopes:",
                    "  - meeting:write:create (Create meetings)",
                    "  - meeting:write:update (Update meetings)",
                    "  - meeting:write:delete (Delete meetings)",
                    "  - meeting:read:admin (Read meeting details)",
                    "  - user:read:admin (Read user profile)",
                    "  - meeting:read (Read meeting information)",
                    "  - meeting:write (Write meeting information)",
                    "Click 'Save' to apply scopes"
                ],
                required: true
            },
            {
                step: 3,
                title: "Get API Credentials",
                description: "Retrieve your Client ID, Client Secret, and Account ID",
                details: [
                    "Go to 'App Credentials' tab",
                    "Copy the following values:",
                    "  - Client ID (starts with letters/numbers)",
                    "  - Client Secret (long random string)",
                    "  - Account ID (found in the same section)",
                    "Keep these credentials secure - they're needed for integration"
                ],
                required: true
            },
            {
                step: 4,
                title: "Test App Permissions",
                description: "Verify your app has the correct permissions",
                details: [
                    "Go to 'Activation' tab",
                    "Click 'Test' to verify your app works",
                    "Ensure all required scopes are granted",
                    "Your app should show 'Active' status"
                ],
                required: true
            },
            {
                step: 5,
                title: "Configure Meeting Settings (Optional)",
                description: "Set up default meeting preferences",
                details: [
                    "Default Duration: 15-480 minutes (recommended: 60)",
                    "Meeting Type: 'scheduled' for appointments",
                    "Video Settings: Enable host and participant video",
                    "Security Settings: Enable waiting room",
                    "Recording: Choose 'none', 'local', or 'cloud'",
                    "Join Before Host: Usually disabled for appointments"
                ],
                required: false
            },
            {
                step: 6,
                title: "Create Meeting Templates",
                description: "Set up different meeting templates for various session types",
                details: [
                    "30-minute Quick Session",
                    "60-minute Standard Session",
                    "90-minute Deep Dive Session",
                    "Custom duration sessions",
                    "Each template can have different settings:",
                    "  - Recording preferences",
                    "  - Video settings",
                    "  - Security options"
                ],
                required: false
            }
        ],
        apiCredentials: {
            clientId: {
                description: "Your Zoom OAuth app Client ID",
                example: "abcd1234efgh5678ijkl9012mnop3456",
                required: true
            },
            clientSecret: {
                description: "Your Zoom OAuth app Client Secret",
                example: "qrst7890uvwx1234yzab5678cdef9012",
                required: true
            },
            zoomEmail: {
                description: "Your Zoom account email address",
                example: "coach@example.com",
                required: true
            },
            zoomAccountId: {
                description: "Your Zoom Account ID",
                example: "abcdefghijklmnopqrstuvwx",
                required: true
            }
        },
        integrationEndpoint: {
            method: "POST",
            url: "/api/zoom-integration/setup",
            description: "Use this endpoint to set up your Zoom integration"
        },
        commonIssues: [
            {
                issue: "Invalid credentials error",
                solution: "Double-check your Client ID, Client Secret, and Account ID from the Zoom Marketplace"
            },
            {
                issue: "Insufficient scopes error",
                solution: "Ensure your app has all required OAuth scopes enabled"
            },
            {
                issue: "Account not found error",
                solution: "Verify your Account ID is correct and your Zoom account is active"
            },
            {
                issue: "Meeting creation fails",
                solution: "Check that your app has meeting:write permissions and test the connection"
            }
        ],
        support: {
            zoomMarketplace: "https://marketplace.zoom.us/",
            zoomDeveloperDocs: "https://developers.zoom.us/docs/api/",
            serverToServerOAuth: "https://developers.zoom.us/docs/api/guide/using-oauth-credentials/"
        }
    };

    res.status(200).json({
        success: true,
        data: setupGuide
    });
});

// Apply authentication and activity tracking to protected routes
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
