const Appointment = require('../schema/Appointment');
const AutomationRule = require('../schema/AutomationRule');
const AdCampaign = require('../schema/AdCampaign');
const Lead = require('../schema/Lead');
const User = require('../schema/User');
const asyncHandler = require('../middleware/async');
const { hasPermission } = require('../utils/permissions');

/**
 * Staff Enhanced Features Controller
 * Handles advanced staff features: appointments, WhatsApp, automation, ads, permission requests
 */
class StaffEnhancedFeaturesController {

    /**
     * Validate staff access and permissions
     */
    validateStaffAccess = asyncHandler(async (req, res, next) => {
        try {
            const staffId = req.user.id;
            
            const staff = await User.findById(staffId).select('isActive coachId permissions role');
            
            if (!staff || staff.role !== 'staff' || staff.isActive === false) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or inactive staff account'
                });
            }
            
            req.staffInfo = {
                staffId,
                coachId: staff.coachId,
                permissions: staff.permissions || [],
                isActive: staff.isActive
            };
            
            next();
        } catch (error) {
            console.error('Staff access validation error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error validating staff access'
            });
        }
    });

    // ===== APPOINTMENT MANAGEMENT =====

    /**
     * Get staff appointments
     * @route GET /api/staff-unified/v1/appointments
     * @access Private (Staff with appointments:read permission)
     */
    getStaffAppointments = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'appointments:read')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access appointments'
            });
        }

        const appointments = await Appointment.find({ coachId })
            .populate('clientId', 'name email phone')
            .sort({ startTime: 1 });

        res.json({
            success: true,
            data: appointments
        });
    });

    /**
     * Create appointment
     * @route POST /api/staff-unified/v1/appointments
     * @access Private (Staff with appointments:write permission)
     */
    createAppointment = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'appointments:write')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to create appointments'
            });
        }

        req.body.coachId = coachId;
        const appointment = await Appointment.create(req.body);

        res.status(201).json({
            success: true,
            data: appointment
        });
    });

    /**
     * Update appointment
     * @route PUT /api/staff-unified/v1/appointments/:appointmentId
     * @access Private (Staff with appointments:update permission)
     */
    updateAppointment = asyncHandler(async (req, res) => {
        const { appointmentId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'appointments:update')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to update appointments'
            });
        }

        const appointment = await Appointment.findOneAndUpdate(
            { _id: appointmentId, coachId },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            data: appointment
        });
    });

    /**
     * Reschedule appointment
     * @route PUT /api/staff-unified/v1/appointments/:appointmentId/reschedule
     * @access Private (Staff with appointments:reschedule permission)
     */
    rescheduleAppointment = asyncHandler(async (req, res) => {
        const { appointmentId } = req.params;
        const { startTime, endTime } = req.body;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'appointments:reschedule')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to reschedule appointments'
            });
        }

        const appointment = await Appointment.findOneAndUpdate(
            { _id: appointmentId, coachId },
            { startTime, endTime },
            { new: true, runValidators: true }
        );
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            data: appointment
        });
    });

    // ===== WHATSAPP MESSAGING =====

    /**
     * Send WhatsApp message
     * @route POST /api/staff-unified/v1/whatsapp/send
     * @access Private (Staff with whatsapp:send permission)
     */
    sendWhatsAppMessage = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'whatsapp:send')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to send WhatsApp messages'
            });
        }

        const { to, message, templateId } = req.body;
        
        // This would integrate with your central WhatsApp service
        const messageData = {
            coachId,
            to,
            message,
            templateId,
            sentBy: req.staffInfo.staffId,
            timestamp: new Date()
        };

        // For now, return success - integrate with actual WhatsApp service
        res.json({
            success: true,
            data: {
                messageId: `msg_${Date.now()}`,
                status: 'sent',
                ...messageData
            }
        });
    });

    /**
     * Get WhatsApp templates
     * @route GET /api/staff-unified/v1/whatsapp/templates
     * @access Private (Staff with whatsapp:templates permission)
     */
    getWhatsAppTemplates = asyncHandler(async (req, res) => {
        const { permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'whatsapp:templates')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access WhatsApp templates'
            });
        }

        // This would fetch templates from your WhatsApp service
        const templates = [
            {
                id: 'template_1',
                name: 'Welcome Message',
                content: 'Welcome to our service!',
                status: 'approved'
            },
            {
                id: 'template_2',
                name: 'Appointment Reminder',
                content: 'Your appointment is scheduled for {{date}} at {{time}}',
                status: 'approved'
            }
        ];

        res.json({
            success: true,
            data: templates
        });
    });

    /**
     * Get WhatsApp message history
     * @route GET /api/staff-unified/v1/whatsapp/messages
     * @access Private (Staff with whatsapp:read permission)
     */
    getWhatsAppMessages = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'whatsapp:read')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access WhatsApp messages'
            });
        }

        // This would fetch from your WhatsApp message history
        const messages = [
            {
                id: 'msg_1',
                to: '+1234567890',
                message: 'Hello, how can I help you?',
                status: 'delivered',
                timestamp: new Date()
            }
        ];

        res.json({
            success: true,
            data: messages
        });
    });

    // ===== AUTOMATION RULES =====

    /**
     * Get automation rules
     * @route GET /api/staff-unified/v1/automation/rules
     * @access Private (Staff with automation:read permission)
     */
    getAutomationRules = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'automation:read')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access automation rules'
            });
        }

        const rules = await AutomationRule.find({ coachId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: rules
        });
    });

    /**
     * Create automation rule
     * @route POST /api/staff-unified/v1/automation/rules
     * @access Private (Staff with automation:write permission)
     */
    createAutomationRule = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'automation:write')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to create automation rules'
            });
        }

        req.body.coachId = coachId;
        req.body.createdBy = req.staffInfo.staffId;
        const rule = await AutomationRule.create(req.body);

        res.status(201).json({
            success: true,
            data: rule
        });
    });

    /**
     * Update automation rule
     * @route PUT /api/staff-unified/v1/automation/rules/:ruleId
     * @access Private (Staff with automation:update permission)
     */
    updateAutomationRule = asyncHandler(async (req, res) => {
        const { ruleId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'automation:update')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to update automation rules'
            });
        }

        const rule = await AutomationRule.findOneAndUpdate(
            { _id: ruleId, coachId },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Automation rule not found'
            });
        }

        res.json({
            success: true,
            data: rule
        });
    });

    /**
     * Execute automation rule
     * @route POST /api/staff-unified/v1/automation/rules/:ruleId/execute
     * @access Private (Staff with automation:execute permission)
     */
    executeAutomationRule = asyncHandler(async (req, res) => {
        const { ruleId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'automation:execute')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to execute automation rules'
            });
        }

        const rule = await AutomationRule.findOne({ _id: ruleId, coachId });
        
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Automation rule not found'
            });
        }

        // This would execute the automation rule
        const executionResult = {
            ruleId: rule._id,
            executedAt: new Date(),
            status: 'success',
            actionsPerformed: 5,
            message: 'Automation rule executed successfully'
        };

        res.json({
            success: true,
            data: executionResult
        });
    });

    // ===== ADS & CAMPAIGNS =====

    /**
     * Get ad campaigns
     * @route GET /api/staff-unified/v1/ads/campaigns
     * @access Private (Staff with ads:read permission)
     */
    getAdCampaigns = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'ads:read')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access ad campaigns'
            });
        }

        const campaigns = await AdCampaign.find({ coachId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: campaigns
        });
    });

    /**
     * Create ad campaign
     * @route POST /api/staff-unified/v1/ads/campaigns
     * @access Private (Staff with ads:write permission)
     */
    createAdCampaign = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'ads:write')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to create ad campaigns'
            });
        }

        req.body.coachId = coachId;
        req.body.createdBy = req.staffInfo.staffId;
        const campaign = await AdCampaign.create(req.body);

        res.status(201).json({
            success: true,
            data: campaign
        });
    });

    /**
     * Update ad campaign
     * @route PUT /api/staff-unified/v1/ads/campaigns/:campaignId
     * @access Private (Staff with ads:update permission)
     */
    updateAdCampaign = asyncHandler(async (req, res) => {
        const { campaignId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'ads:update')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to update ad campaigns'
            });
        }

        const campaign = await AdCampaign.findOneAndUpdate(
            { _id: campaignId, coachId },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Ad campaign not found'
            });
        }

        res.json({
            success: true,
            data: campaign
        });
    });

    /**
     * Publish ad campaign
     * @route POST /api/staff-unified/v1/ads/campaigns/:campaignId/publish
     * @access Private (Staff with ads:publish permission)
     */
    publishAdCampaign = asyncHandler(async (req, res) => {
        const { campaignId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'ads:publish')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to publish ad campaigns'
            });
        }

        const campaign = await AdCampaign.findOneAndUpdate(
            { _id: campaignId, coachId },
            { status: 'active', publishedAt: new Date() },
            { new: true, runValidators: true }
        );
        
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Ad campaign not found'
            });
        }

        res.json({
            success: true,
            data: campaign
        });
    });

    /**
     * Get ad campaign analytics
     * @route GET /api/staff-unified/v1/ads/campaigns/:campaignId/analytics
     * @access Private (Staff with ads:analytics permission)
     */
    getAdCampaignAnalytics = asyncHandler(async (req, res) => {
        const { campaignId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'ads:analytics')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access ad campaign analytics'
            });
        }

        const campaign = await AdCampaign.findOne({ _id: campaignId, coachId });
        
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Ad campaign not found'
            });
        }

        // This would fetch analytics from your ad platform
        const analytics = {
            campaignId: campaign._id,
            impressions: 12500,
            clicks: 450,
            conversions: 25,
            spend: 150.00,
            ctr: 3.6,
            conversionRate: 5.56,
            cpc: 0.33,
            cpa: 6.00
        };

        res.json({
            success: true,
            data: analytics
        });
    });

    // ===== PERMISSION REQUESTS =====

    /**
     * Request additional permissions
     * @route POST /api/staff-unified/v1/permissions/request
     * @access Private (Staff with permissions:request permission)
     */
    requestPermissions = asyncHandler(async (req, res) => {
        const { permissions: requestedPermissions, reason } = req.body;
        const { staffId, coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'permissions:request')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to request additional permissions'
            });
        }

        // This would create a permission request record
        const permissionRequest = {
            staffId,
            coachId,
            requestedPermissions,
            reason,
            status: 'pending',
            requestedAt: new Date(),
            currentPermissions: permissions
        };

        res.status(201).json({
            success: true,
            data: permissionRequest,
            message: 'Permission request submitted successfully'
        });
    });

    /**
     * Get permission requests (for coaches)
     * @route GET /api/staff-unified/v1/permissions/requests
     * @access Private (Staff with permissions:manage permission)
     */
    getPermissionRequests = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'permissions:manage')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view permission requests'
            });
        }

        // This would fetch permission requests for the coach
        const requests = [
            {
                id: 'req_1',
                staffId: '65a1b2c3d4e5f6789012345a',
                staffName: 'John Doe',
                requestedPermissions: ['funnels:write', 'funnels:publish'],
                reason: 'Need to create and publish funnels for marketing campaigns',
                status: 'pending',
                requestedAt: new Date()
            }
        ];

        res.json({
            success: true,
            data: requests
        });
    });

    /**
     * Approve permission request
     * @route POST /api/staff-unified/v1/permissions/requests/:requestId/approve
     * @access Private (Staff with permissions:approve permission)
     */
    approvePermissionRequest = asyncHandler(async (req, res) => {
        const { requestId } = req.params;
        const { permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'permissions:approve')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to approve permission requests'
            });
        }

        // This would approve the permission request and update staff permissions
        const approvalResult = {
            requestId,
            status: 'approved',
            approvedAt: new Date(),
            approvedBy: req.staffInfo.staffId
        };

        res.json({
            success: true,
            data: approvalResult,
            message: 'Permission request approved successfully'
        });
    });

    /**
     * Deny permission request
     * @route POST /api/staff-unified/v1/permissions/requests/:requestId/deny
     * @access Private (Staff with permissions:deny permission)
     */
    denyPermissionRequest = asyncHandler(async (req, res) => {
        const { requestId } = req.params;
        const { reason } = req.body;
        const { permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'permissions:deny')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to deny permission requests'
            });
        }

        const denialResult = {
            requestId,
            status: 'denied',
            deniedAt: new Date(),
            deniedBy: req.staffInfo.staffId,
            reason
        };

        res.json({
            success: true,
            data: denialResult,
            message: 'Permission request denied'
        });
    });
}

module.exports = new StaffEnhancedFeaturesController();
