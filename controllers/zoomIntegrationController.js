const ZoomIntegration = require('../schema/ZoomIntegration');
const zoomService = require('../services/zoomService');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Setup Zoom integration for a coach
// @route   POST /api/zoom-integration/setup
// @access  Private (Coaches)
const setupZoomIntegration = asyncHandler(async (req, res, next) => {
    const { apiKey, apiSecret, zoomEmail, meetingSettings } = req.body;
    
    if (!apiKey || !apiSecret) {
        return next(new ErrorResponse('API Key and API Secret are required', 400));
    }

    // Check if integration already exists
    let integration = await ZoomIntegration.findOne({ coachId: req.coachId });
    
    if (integration) {
        // Update existing integration
        integration.apiKey = apiKey;
        integration.apiSecret = apiSecret;
        integration.zoomEmail = zoomEmail;
        if (meetingSettings) {
            integration.meetingSettings = { ...integration.meetingSettings, ...meetingSettings };
        }
    } else {
        // Create new integration
        integration = new ZoomIntegration({
            coachId: req.coachId,
            apiKey,
            apiSecret,
            zoomEmail,
            meetingSettings: meetingSettings || {}
        });
    }

    // Test the connection
    try {
        const testResult = await zoomService.testConnection(req.coachId);
        if (!testResult.success) {
            return next(new ErrorResponse(`Zoom connection test failed: ${testResult.message}`, 400));
        }
        
        // Update integration with account info
        integration.zoomAccountId = testResult.user.id;
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

module.exports = {
    setupZoomIntegration,
    getZoomIntegration,
    updateZoomIntegration,
    testZoomConnection,
    getZoomUsage,
    createMeetingTemplate,
    getMeetingTemplates,
    deleteZoomIntegration,
    getIntegrationStatus
};
