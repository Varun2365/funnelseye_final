const ZoomIntegration = require('../schema/ZoomIntegration');
const zoomService = require('../services/zoomService');
const zoomCleanupService = require('../services/zoomCleanupService');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Setup Zoom integration for a coach
// @route   POST /api/zoom-integration/setup
// @access  Private (Coaches)
const setupZoomIntegration = asyncHandler(async (req, res, next) => {
    const { clientId, clientSecret, zoomEmail, zoomAccountId, meetingSettings } = req.body;
    
    // ===== STEP 1: VALIDATE REQUIRED FIELDS =====
    if (!clientId || !clientSecret || !zoomEmail || !zoomAccountId) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields',
            errors: {
                clientId: !clientId ? 'Client ID is required' : null,
                clientSecret: !clientSecret ? 'Client Secret is required' : null,
                zoomEmail: !zoomEmail ? 'Zoom Email is required' : null,
                zoomAccountId: !zoomAccountId ? 'Zoom Account ID is required' : null
            }
        });
    }

    // ===== STEP 2: VALIDATE FIELD FORMATS =====
    const validationErrors = {};
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(zoomEmail)) {
        validationErrors.zoomEmail = 'Please enter a valid email address';
    }
    
    // Validate client ID format (should be alphanumeric, 20-40 characters)
    if (!/^[a-zA-Z0-9]{20,40}$/.test(clientId)) {
        validationErrors.clientId = 'Client ID should be 20-40 alphanumeric characters';
    }
    
    // Validate client secret format (should be alphanumeric, 20-40 characters)
    if (!/^[a-zA-Z0-9]{20,40}$/.test(clientSecret)) {
        validationErrors.clientSecret = 'Client Secret should be 20-40 alphanumeric characters';
    }
    
    // Validate account ID format (should be alphanumeric, 8-20 characters)
    if (!/^[a-zA-Z0-9]{8,20}$/.test(zoomAccountId)) {
        validationErrors.zoomAccountId = 'Account ID should be 8-20 alphanumeric characters';
    }
    
    // If there are validation errors, return them
    if (Object.keys(validationErrors).length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid field formats',
            errors: validationErrors
        });
    }

    // ===== STEP 3: CREATE TEMPORARY INTEGRATION FOR TESTING =====
    let tempIntegration;
    try {
        tempIntegration = new ZoomIntegration({
            coachId: req.coachId,
            clientId,
            clientSecret,
            zoomEmail,
            zoomAccountId,
            meetingSettings: meetingSettings || {},
            isActive: false // Don't activate until verified
        });
        
        // Validate the schema (this will catch any schema validation errors)
        await tempIntegration.validate();
        
    } catch (validationError) {
        return res.status(400).json({
            success: false,
            message: 'Invalid integration data',
            errors: {
                schema: validationError.message
            }
        });
    }

    // ===== STEP 4: TEST CREDENTIALS WITHOUT SAVING =====
    try {
        console.log('[ZoomIntegration] Testing credentials before saving...');
        
        // Test the credentials by attempting to generate an OAuth token
        const testResult = await zoomService.testCredentials({
            clientId,
            clientSecret,
            zoomEmail,
            zoomAccountId
        });
        
        if (!testResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Zoom credentials verification failed',
                errors: {
                    credentials: testResult.message || 'Invalid credentials or network error',
                    details: testResult.details || null
                },
                suggestions: [
                    'Verify your Client ID and Client Secret from Zoom Marketplace',
                    'Ensure your Zoom account is active and has API access',
                    'Check that the Account ID matches your Zoom account',
                    'Verify your email address is associated with the Zoom account'
                ]
            });
        }
        
        console.log('[ZoomIntegration] Credentials verified successfully');
        
    } catch (error) {
        console.error('[ZoomIntegration] Credential test error:', error);
        return res.status(400).json({
            success: false,
            message: 'Failed to verify Zoom credentials',
            errors: {
                network: 'Unable to connect to Zoom API',
                details: error.message
            },
            suggestions: [
                'Check your internet connection',
                'Verify Zoom API endpoints are accessible',
                'Try again in a few moments'
            ]
        });
    }

    // ===== STEP 5: SAVE TO DATABASE ONLY AFTER VERIFICATION =====
    try {
        // Check if integration already exists
        let existingIntegration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (existingIntegration) {
            // Update existing integration with verified credentials
            existingIntegration.clientId = clientId;
            existingIntegration.clientSecret = clientSecret;
            existingIntegration.zoomEmail = zoomEmail;
            existingIntegration.zoomAccountId = zoomAccountId;
            if (meetingSettings) {
                existingIntegration.meetingSettings = { ...existingIntegration.meetingSettings, ...meetingSettings };
            }
            existingIntegration.isActive = true;
            existingIntegration.lastSync = {
                timestamp: new Date(),
                status: 'success',
                message: 'Credentials verified and integration updated successfully'
            };
            
            await existingIntegration.save();
            integration = existingIntegration;
            
        } else {
            // Create new integration with verified credentials
            tempIntegration.isActive = true;
            tempIntegration.lastSync = {
                timestamp: new Date(),
                status: 'success',
                message: 'Credentials verified and integration created successfully'
            };
            
            integration = await tempIntegration.save();
        }
        
        console.log('[ZoomIntegration] Integration saved successfully for coach:', req.coachId);
        
        res.status(200).json({
            success: true,
            message: 'Zoom integration setup completed successfully',
            data: {
                _id: integration._id,
                zoomAccountId: integration.zoomAccountId,
                zoomEmail: integration.zoomEmail,
                isActive: integration.isActive,
                lastSync: integration.lastSync,
                meetingSettings: integration.meetingSettings
            },
            verification: {
                credentials: 'verified',
                connection: 'successful',
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('[ZoomIntegration] Database save error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save Zoom integration',
            errors: {
                database: 'Unable to save integration to database',
                details: error.message
            }
        });
    }
});

// @desc    Get Zoom integration details
// @route   GET /api/zoom-integration
// @access  Private (Coaches)
const getZoomIntegration = asyncHandler(async (req, res, next) => {
    try {
        const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (!integration) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: null,
                error: 'Integration not found'
            });
        }

        // Don't send sensitive data
        const safeIntegration = {
            _id: integration._id,
            zoomAccountId: integration.zoomAccountId,
            zoomEmail: integration.zoomEmail,
            isActive: integration.isActive,
            meetingSettings: integration.meetingSettings,
            lastSync: integration.lastSync,
            usageStats: integration.usageStats,
            createdAt: integration.createdAt,
            updatedAt: integration.updatedAt
        };

        res.status(200).json({
            success: true,
            data: safeIntegration
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get Zoom integration details',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Update Zoom integration settings
// @route   PUT /api/zoom-integration
// @access  Private (Coaches)
const updateZoomIntegration = asyncHandler(async (req, res, next) => {
    try {
        const { meetingSettings, isActive } = req.body;
        
        let integration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (!integration) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: null,
                error: 'Integration not found'
            });
        }

        if (meetingSettings) {
            integration.meetingSettings = { ...integration.meetingSettings, ...meetingSettings };
        }
        
        if (isActive !== undefined) {
            integration.isActive = isActive;
        }

        await integration.save();

        res.status(200).json({
            success: true,
            message: 'Zoom integration updated successfully',
            data: {
                meetingSettings: integration.meetingSettings,
                isActive: integration.isActive
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update Zoom integration',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Test Zoom connection
// @route   POST /api/zoom-integration/test
// @access  Private (Coaches)
const testZoomConnection = asyncHandler(async (req, res, next) => {
    try {
        const result = await zoomService.testConnection(req.coachId);
        res.status(200).json(result);
    } catch (error) {
        if (error.message.includes('Zoom integration not found')) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: null,
                error: error.message
            });
        }
        
        // Include error details for frontend debugging
        return res.status(500).json({
            success: false,
            message: 'Failed to test Zoom connection',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Get Zoom usage statistics
// @route   GET /api/zoom-integration/usage
// @access  Private (Coaches)
const getZoomUsage = asyncHandler(async (req, res, next) => {
    try {
        const result = await zoomService.getAccountUsage(req.coachId);
        res.status(200).json(result);
    } catch (error) {
        if (error.message.includes('Zoom integration not found')) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: null,
                error: error.message
            });
        }
        
        // Include error details for frontend debugging
        return res.status(500).json({
            success: false,
            message: 'Failed to get Zoom usage statistics',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Create a meeting template
// @route   POST /api/zoom-integration/meeting-templates
// @access  Private (Coaches)
const createMeetingTemplate = asyncHandler(async (req, res, next) => {
    try {
        const { name, description, duration, settings, isDefault } = req.body;
        
        if (!name || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Name and duration are required',
                error: 'Missing required fields',
                details: `Missing: ${!name ? 'name' : ''} ${!duration ? 'duration' : ''}`.trim()
            });
        }

        const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (!integration) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: null,
                error: 'Integration not found'
            });
        }

        await integration.createMeetingTemplate({
            name,
            description,
            duration,
            settings,
            isDefault
        });

        res.status(201).json({
            success: true,
            message: 'Meeting template created successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create meeting template',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Get meeting templates
// @route   GET /api/zoom-integration/meeting-templates
// @access  Private (Coaches)
const getMeetingTemplates = asyncHandler(async (req, res, next) => {
    try {
        const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (!integration) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: [],
                error: 'Integration not found'
            });
        }

        res.status(200).json({
            success: true,
            data: integration.meetingSettings.templates
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get meeting templates',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Delete Zoom integration
// @route   DELETE /api/zoom-integration
// @access  Private (Coaches)
const deleteZoomIntegration = asyncHandler(async (req, res, next) => {
    try {
        const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (!integration) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: null,
                error: 'Integration not found'
            });
        }

        await integration.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Zoom integration deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete Zoom integration',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Get Zoom integration status
// @route   GET /api/zoom-integration/status
// @access  Private (Coaches)
const getIntegrationStatus = asyncHandler(async (req, res, next) => {
    try {
        const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
        
        if (!integration) {
            return res.status(200).json({
                success: true,
                data: {
                    isConnected: false,
                    message: 'No Zoom integration found'
                }
            });
        }

        const status = {
            isConnected: integration.isValid(),
            isActive: integration.isActive,
            lastSync: integration.lastSync,
            accountInfo: {
                zoomAccountId: integration.zoomAccountId,
                zoomEmail: integration.zoomEmail
            }
        };

        res.status(200).json({
            success: true,
            data: status
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get integration status',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Get Zoom meeting details for a specific appointment
// @route   GET /api/zoom-integration/meetings/appointment/:appointmentId
// @access  Private (Coaches)
const getZoomMeetingForAppointment = asyncHandler(async (req, res, next) => {
    const { appointmentId } = req.params;
    
    try {
        const meetingDetails = await zoomService.getZoomMeetingForAppointment(appointmentId, req.coachId);
        
        res.status(200).json({
            success: true,
            data: meetingDetails
        });
    } catch (error) {
        if (error.message.includes('Zoom integration not found')) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: null,
                error: error.message
            });
        }
        
        // Include error details for frontend debugging
        return res.status(404).json({
            success: false,
            message: 'Failed to get Zoom meeting details',
            error: error.message,
            details: error.stack || 'No additional details available',
            appointmentId: appointmentId
        });
    }
});

// @desc    Get all Zoom meetings for a coach
// @route   GET /api/zoom-integration/meetings
// @access  Private (Coaches)
const getCoachZoomMeetings = asyncHandler(async (req, res, next) => {
    try {
        const meetings = await zoomService.getCoachZoomMeetings(req.coachId);
        
        res.status(200).json({
            success: true,
            data: meetings
        });
    } catch (error) {
        if (error.message.includes('Zoom integration not found')) {
            return res.status(200).json({
                success: false,
                message: 'Zoom integration not found. Please set up your Zoom integration first.',
                data: [],
                error: error.message
            });
        }
        
        // Include error details for frontend debugging
        return res.status(500).json({
            success: false,
            message: 'Failed to get Zoom meetings',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// ===== ZOOM CLEANUP MANAGEMENT =====

// @desc    Start automatic Zoom meeting cleanup
// @route   POST /api/zoom-integration/cleanup/start
// @access  Private (Coaches)
const startCleanup = asyncHandler(async (req, res, next) => {
    try {
        const { retentionDays = 2, interval = 'daily' } = req.body;
        
        if (retentionDays < 1) {
            return res.status(400).json({
                success: false,
                message: 'Retention period must be at least 1 day',
                error: 'Invalid retention period',
                details: `Provided retentionDays: ${retentionDays}, minimum required: 1`
            });
        }
        
        if (!['daily', 'weekly', 'manual'].includes(interval)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid interval. Must be daily, weekly, or manual',
                error: 'Invalid interval',
                details: `Provided interval: ${interval}, valid options: daily, weekly, manual`
            });
        }
        
        zoomCleanupService.startCleanup(retentionDays, interval);
        
        res.status(200).json({
            success: true,
            message: `Zoom cleanup started with ${retentionDays} days retention, interval: ${interval}`,
            data: {
                retentionDays,
                interval,
                isRunning: true
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to start Zoom cleanup',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Stop automatic Zoom meeting cleanup
// @route   POST /api/zoom-integration/cleanup/stop
// @access  Private (Coaches)
const stopCleanup = asyncHandler(async (req, res, next) => {
    try {
        zoomCleanupService.stopCleanup();
        
        res.status(200).json({
            success: true,
            message: 'Zoom cleanup stopped successfully',
            data: {
                isRunning: false
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to stop Zoom cleanup',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Perform manual Zoom meeting cleanup
// @route   POST /api/zoom-integration/cleanup/manual
// @access  Private (Coaches)
const manualCleanup = asyncHandler(async (req, res, next) => {
    try {
        const { retentionDays = 2 } = req.body;
        
        if (retentionDays < 1) {
            return res.status(400).json({
                success: false,
                message: 'Retention period must be at least 1 day',
                error: 'Invalid retention period',
                details: `Provided retentionDays: ${retentionDays}, minimum required: 1`
            });
        }
        
        const result = await zoomCleanupService.manualCleanup(retentionDays);
        
        res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to perform manual Zoom cleanup',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Get Zoom cleanup statistics and status
// @route   GET /api/zoom-integration/cleanup/stats
// @access  Private (Coaches)
const getCleanupStats = asyncHandler(async (req, res, next) => {
    try {
        const stats = await zoomCleanupService.getCleanupStats();
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get Zoom cleanup statistics',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

// @desc    Update Zoom cleanup retention period
// @route   PUT /api/zoom-integration/cleanup/retention
// @access  Private (Coaches)
const updateRetentionPeriod = asyncHandler(async (req, res, next) => {
    try {
        const { retentionDays } = req.body;
        
        if (!retentionDays || retentionDays < 1) {
            return res.status(400).json({
                success: false,
                message: 'Retention period must be at least 1 day',
                error: 'Invalid retention period',
                details: `Provided retentionDays: ${retentionDays}, minimum required: 1`
            });
        }
        
        zoomCleanupService.updateRetentionPeriod(retentionDays);
        
        res.status(200).json({
            success: true,
            message: `Retention period updated to ${retentionDays} days`,
            data: {
                retentionDays,
                isRunning: !!zoomCleanupService.cleanupInterval
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update retention period',
            error: error.message,
            details: error.stack || 'No additional details available'
        });
    }
});

module.exports = {
    setupZoomIntegration,
    getZoomIntegration,
    updateZoomIntegration,
    testZoomConnection,
    getZoomUsage,
    createMeetingTemplate,
    getMeetingTemplates,
    deleteZoomIntegration,
    getIntegrationStatus,
    getZoomMeetingForAppointment,
    getCoachZoomMeetings,
    // NEW: Zoom Cleanup Management
    startCleanup,
    stopCleanup,
    manualCleanup,
    getCleanupStats,
    updateRetentionPeriod
};
