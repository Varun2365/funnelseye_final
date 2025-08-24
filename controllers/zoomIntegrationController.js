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
    
    if (!clientId || !clientSecret || !zoomEmail || !zoomAccountId) {
        return next(new ErrorResponse('Client ID, Client Secret, Zoom Email, and Account ID are required', 400));
    }

    // Check if integration already exists
    let integration = await ZoomIntegration.findOne({ coachId: req.coachId });
    
    if (integration) {
        // Update existing integration
        integration.clientId = clientId;
        integration.clientSecret = clientSecret;
        integration.zoomEmail = zoomEmail;
        integration.zoomAccountId = zoomAccountId;
        if (meetingSettings) {
            integration.meetingSettings = { ...integration.meetingSettings, ...meetingSettings };
        }
    } else {
        // Create new integration
        integration = new ZoomIntegration({
            coachId: req.coachId,
            clientId,
            clientSecret,
            zoomEmail,
            zoomAccountId,
            meetingSettings: meetingSettings || {}
        });
    }

    // Save the integration first
    await integration.save();
    
    // Then test the connection
    try {
        const testResult = await zoomService.testConnection(req.coachId);
        if (!testResult.success) {
            // If test fails, update integration status and return error
            integration.lastSync = {
                timestamp: new Date(),
                status: 'failed',
                error: testResult.message
            };
            await integration.save();
            
            return next(new ErrorResponse(`Zoom connection test failed: ${testResult.message}`, 400));
        }
        
        // Update integration with success status
        integration.lastSync = {
            timestamp: new Date(),
            status: 'success'
        };
        
        await integration.save();
        
        res.status(200).json({
            success: true,
            message: 'Zoom integration setup successfully',
            data: {
                integrationId: integration._id,
                zoomAccountId: integration.zoomAccountId,
                zoomEmail: integration.zoomEmail,
                isActive: integration.isActive
            }
        });
        
    } catch (error) {
        // Update integration with error status
        integration.lastSync = {
            timestamp: new Date(),
            status: 'failed',
            error: error.message
        };
        await integration.save();
        
        return next(new ErrorResponse(`Failed to setup Zoom integration: ${error.message}`, 400));
    }
});

// @desc    Get Zoom integration details
// @route   GET /api/zoom-integration
// @access  Private (Coaches)
const getZoomIntegration = asyncHandler(async (req, res, next) => {
    const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
    
    if (!integration) {
        return next(new ErrorResponse('Zoom integration not found', 404));
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
});

// @desc    Update Zoom integration settings
// @route   PUT /api/zoom-integration
// @access  Private (Coaches)
const updateZoomIntegration = asyncHandler(async (req, res, next) => {
    const { meetingSettings, isActive } = req.body;
    
    let integration = await ZoomIntegration.findOne({ coachId: req.coachId });
    
    if (!integration) {
        return next(new ErrorResponse('Zoom integration not found', 404));
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
});

// @desc    Test Zoom connection
// @route   POST /api/zoom-integration/test
// @access  Private (Coaches)
const testZoomConnection = asyncHandler(async (req, res, next) => {
    const result = await zoomService.testConnection(req.coachId);
    
    res.status(200).json(result);
});

// @desc    Get Zoom usage statistics
// @route   GET /api/zoom-integration/usage
// @access  Private (Coaches)
const getZoomUsage = asyncHandler(async (req, res, next) => {
    const result = await zoomService.getAccountUsage(req.coachId);
    
    res.status(200).json(result);
});

// @desc    Create a meeting template
// @route   POST /api/zoom-integration/meeting-templates
// @access  Private (Coaches)
const createMeetingTemplate = asyncHandler(async (req, res, next) => {
    const { name, description, duration, settings, isDefault } = req.body;
    
    if (!name || !duration) {
        return next(new ErrorResponse('Name and duration are required', 400));
    }

    const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
    
    if (!integration) {
        return next(new ErrorResponse('Zoom integration not found', 404));
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
});

// @desc    Get meeting templates
// @route   GET /api/zoom-integration/meeting-templates
// @access  Private (Coaches)
const getMeetingTemplates = asyncHandler(async (req, res, next) => {
    const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
    
    if (!integration) {
        return next(new ErrorResponse('Zoom integration not found', 404));
    }

    res.status(200).json({
        success: true,
        data: integration.meetingSettings.templates
    });
});

// @desc    Delete Zoom integration
// @route   DELETE /api/zoom-integration
// @access  Private (Coaches)
const deleteZoomIntegration = asyncHandler(async (req, res, next) => {
    const integration = await ZoomIntegration.findOne({ coachId: req.coachId });
    
    if (!integration) {
        return next(new ErrorResponse('Zoom integration not found', 404));
    }

    await integration.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Zoom integration deleted successfully'
    });
});

// @desc    Get Zoom integration status
// @route   GET /api/zoom-integration/status
// @access  Private (Coaches)
const getIntegrationStatus = asyncHandler(async (req, res, next) => {
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
        return next(new ErrorResponse(error.message, 404));
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
        return next(new ErrorResponse(error.message, 500));
    }
});

// ===== ZOOM CLEANUP MANAGEMENT =====

// @desc    Start automatic Zoom meeting cleanup
// @route   POST /api/zoom-integration/cleanup/start
// @access  Private (Coaches)
const startCleanup = asyncHandler(async (req, res, next) => {
    const { retentionDays = 2, interval = 'daily' } = req.body;
    
    if (retentionDays < 1) {
        return next(new ErrorResponse('Retention period must be at least 1 day', 400));
    }
    
    if (!['daily', 'weekly', 'manual'].includes(interval)) {
        return next(new ErrorResponse('Invalid interval. Must be daily, weekly, or manual', 400));
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
});

// @desc    Stop automatic Zoom meeting cleanup
// @route   POST /api/zoom-integration/cleanup/stop
// @access  Private (Coaches)
const stopCleanup = asyncHandler(async (req, res, next) => {
    zoomCleanupService.stopCleanup();
    
    res.status(200).json({
        success: true,
        message: 'Zoom cleanup stopped successfully',
        data: {
            isRunning: false
        }
    });
});

// @desc    Perform manual Zoom meeting cleanup
// @route   POST /api/zoom-integration/cleanup/manual
// @access  Private (Coaches)
const manualCleanup = asyncHandler(async (req, res, next) => {
    const { retentionDays = 2 } = req.body;
    
    if (retentionDays < 1) {
        return next(new ErrorResponse('Retention period must be at least 1 day', 400));
    }
    
    const result = await zoomCleanupService.manualCleanup(retentionDays);
    
    res.status(200).json({
        success: true,
        message: result.message,
        data: result
    });
});

// @desc    Get Zoom cleanup statistics and status
// @route   GET /api/zoom-integration/cleanup/stats
// @access  Private (Coaches)
const getCleanupStats = asyncHandler(async (req, res, next) => {
    const stats = await zoomCleanupService.getCleanupStats();
    
    res.status(200).json({
        success: true,
        data: stats
    });
});

// @desc    Update Zoom cleanup retention period
// @route   PUT /api/zoom-integration/cleanup/retention
// @access  Private (Coaches)
const updateRetentionPeriod = asyncHandler(async (req, res, next) => {
    const { retentionDays } = req.body;
    
    if (!retentionDays || retentionDays < 1) {
        return next(new ErrorResponse('Retention period must be at least 1 day', 400));
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
