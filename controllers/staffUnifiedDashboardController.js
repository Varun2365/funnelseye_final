const coachDashboardService = require('../services/coachDashboardService');
const calendarService = require('../services/calendarService');
const asyncHandler = require('../middleware/async');
const { hasPermission } = require('../utils/permissions');
const Lead = require('../schema/Lead');
const Task = require('../schema/Task');
const AdCampaign = require('../schema/AdCampaign');
const RazorpayPayment = require('../schema/RazorpayPayment');
const Staff = require('../schema/Staff');
const Appointment = require('../schema/Appointment');
const Funnel = require('../schema/Funnel');
const User = require('../schema/User');

/**
 * Unified Staff Dashboard Controller
 * Mirrors coach dashboard functionality with permission-based access control
 * Each section can be individually controlled by coach-assigned permissions
 */
class StaffUnifiedDashboardController {
    
    constructor() {
        this.dashboardSections = {
            OVERVIEW: 'overview',
            LEADS: 'leads',
            TASKS: 'tasks',
            MARKETING: 'marketing',
            FINANCIAL: 'financial',
            TEAM: 'team',
            PERFORMANCE: 'performance',
            CALENDAR: 'calendar',
            FUNNELS: 'funnels',
            APPOINTMENTS: 'appointments',
            WHATSAPP: 'whatsapp',
            AUTOMATION: 'automation',
            ADS: 'ads'
        };
    }

    /**
     * Validate staff access and permissions for dashboard sections
     */
    validateStaffAccess = asyncHandler(async (req, res, next) => {
        try {
            const staffId = req.user.id;
            
            // Get staff details
            const staff = await User.findById(staffId).select('isActive coachId permissions role');
            
            if (!staff) {
                return res.status(404).json({
                    success: false,
                    message: 'Staff account not found'
                });
            }
            
            if (staff.role !== 'staff') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. This account is not a staff account.'
                });
            }
            
            if (staff.isActive === false) {
                return res.status(403).json({
                    success: false,
                    message: 'Your staff account has been deactivated. Please contact your coach.'
                });
            }
            
            // Add staff info to request
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

    /**
     * Check if staff has permission for a specific section
     */
    checkSectionPermission(section, permissions) {
        const permissionMap = {
            'overview': ['leads:read', 'tasks:read', 'performance:read'],
            'leads': ['leads:read'],
            'tasks': ['tasks:read'],
            'marketing': ['leads:read', 'performance:read'],
            'financial': ['performance:read'],
            'team': ['staff:read', 'performance:read'],
            'performance': ['performance:read'],
            'calendar': ['calendar:read'],
            'funnels': ['funnels:read'],
            'appointments': ['appointments:read'],
            'whatsapp': ['whatsapp:read'],
            'automation': ['automation:read'],
            'ads': ['ads:read']
        };

        const requiredPermissions = permissionMap[section] || [];
        return requiredPermissions.some(permission => hasPermission(permissions, permission));
    }

    /**
     * Check if staff has write permission for a specific section
     */
    checkWritePermission(section, permissions) {
        const writePermissionMap = {
            'leads': ['leads:write', 'leads:update', 'leads:manage'],
            'tasks': ['tasks:write', 'tasks:update', 'tasks:manage'],
            'marketing': ['leads:write', 'leads:update', 'leads:manage'],
            'financial': ['performance:write', 'performance:manage'],
            'team': ['staff:write', 'staff:update', 'staff:manage'],
            'performance': ['performance:write', 'performance:manage'],
            'calendar': ['calendar:write', 'calendar:update', 'calendar:manage'],
            'funnels': ['funnels:write', 'funnels:update', 'funnels:manage'],
            'appointments': ['appointments:write', 'appointments:update', 'appointments:manage'],
            'whatsapp': ['whatsapp:write', 'whatsapp:send', 'whatsapp:manage'],
            'automation': ['automation:write', 'automation:update', 'automation:manage'],
            'ads': ['ads:write', 'ads:update', 'ads:manage']
        };

        const requiredPermissions = writePermissionMap[section] || [];
        return requiredPermissions.some(permission => hasPermission(permissions, permission));
    }

    /**
     * Get complete dashboard data with permission filtering
     * @route GET /api/staff-unified/v1/data
     * @access Private (Staff)
     */
    getDashboardData = asyncHandler(async (req, res) => {
        const { timeRange = 30, sections = 'all' } = req.query;
        const { staffId, coachId, permissions } = req.staffInfo;
        
        const requestedSections = sections === 'all' ? 
            Object.values(this.dashboardSections) : 
            sections.split(',');

        const dashboardData = {
            metadata: {
                staffId,
                coachId,
                timeRange: parseInt(timeRange),
                requestedSections,
                lastUpdated: new Date().toISOString(),
                permissions: permissions
            }
        };

        // Get data for requested sections based on permissions
        const sectionPromises = [];
        
        if (requestedSections.includes('overview') && this.checkSectionPermission('overview', permissions)) {
            sectionPromises.push(
                this.getOverviewDataInternal(coachId, parseInt(timeRange))
                    .then(data => ({ section: 'overview', data }))
            );
        }
        
        if (requestedSections.includes('leads') && this.checkSectionPermission('leads', permissions)) {
            sectionPromises.push(
                this.getLeadsDataInternal(coachId, parseInt(timeRange))
                    .then(data => ({ section: 'leads', data }))
            );
        }
        
        if (requestedSections.includes('tasks') && this.checkSectionPermission('tasks', permissions)) {
            sectionPromises.push(
                this.getTasksDataInternal(staffId, coachId, parseInt(timeRange))
                    .then(data => ({ section: 'tasks', data }))
            );
        }
        
        if (requestedSections.includes('marketing') && this.checkSectionPermission('marketing', permissions)) {
            sectionPromises.push(
                this.getMarketingDataInternal(coachId, parseInt(timeRange))
                    .then(data => ({ section: 'marketing', data }))
            );
        }
        
        if (requestedSections.includes('financial') && this.checkSectionPermission('financial', permissions)) {
            sectionPromises.push(
                this.getFinancialDataInternal(coachId, parseInt(timeRange))
                    .then(data => ({ section: 'financial', data }))
            );
        }
        
        if (requestedSections.includes('team') && this.checkSectionPermission('team', permissions)) {
            sectionPromises.push(
                this.getTeamDataInternal(coachId, parseInt(timeRange))
                    .then(data => ({ section: 'team', data }))
            );
        }
        
        if (requestedSections.includes('performance') && this.checkSectionPermission('performance', permissions)) {
            sectionPromises.push(
                this.getPerformanceDataInternal(staffId, coachId, parseInt(timeRange))
                    .then(data => ({ section: 'performance', data }))
            );
        }
        
        if (requestedSections.includes('calendar') && this.checkSectionPermission('calendar', permissions)) {
            sectionPromises.push(
                this.getCalendarDataInternal(coachId, parseInt(timeRange))
                    .then(data => ({ section: 'calendar', data }))
            );
        }
        
        if (requestedSections.includes('funnels') && this.checkSectionPermission('funnels', permissions)) {
            sectionPromises.push(
                this.getFunnelsDataInternal(coachId, permissions)
                    .then(data => ({ section: 'funnels', data }))
            );
        }

        // Execute all section requests in parallel
        const sectionResults = await Promise.all(sectionPromises);
        
        // Add section data to dashboard
        sectionResults.forEach(({ section, data }) => {
            dashboardData[section] = data;
        });

        res.json({
            success: true,
            data: dashboardData
        });
    });

    /**
     * Get overview data
     * @route GET /api/staff-unified/v1/overview
     * @access Private (Staff with leads:read permission)
     */
    getOverviewData = asyncHandler(async (req, res) => {
        const { timeRange = 30 } = req.query;
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('overview', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access overview data'
            });
        }

        const data = await this.getOverviewDataInternal(coachId, parseInt(timeRange));
        
        res.json({
            success: true,
            data
        });
    });

    /**
     * Get leads data
     * @route GET /api/staff-unified/v1/leads
     * @access Private (Staff with leads:read permission)
     */
    getLeadsData = asyncHandler(async (req, res) => {
        const { timeRange = 30 } = req.query;
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('leads', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access leads data'
            });
        }

        const data = await this.getLeadsDataInternal(coachId, parseInt(timeRange));
        
        res.json({
            success: true,
            data
        });
    });

    /**
     * Create new lead
     * @route POST /api/staff-unified/v1/leads
     * @access Private (Staff with leads:write permission)
     */
    createLead = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkWritePermission('leads', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to create leads'
            });
        }

        // Check subscription limits for lead creation
        const SubscriptionLimitsMiddleware = require('../middleware/subscriptionLimits');
        const limitCheck = await SubscriptionLimitsMiddleware.checkLeadLimit(coachId);
        
        if (!limitCheck.allowed) {
            return res.status(403).json({
                success: false,
                message: limitCheck.reason,
                error: 'LEAD_LIMIT_REACHED',
                currentCount: limitCheck.currentCount,
                maxLimit: limitCheck.maxLimit,
                upgradeRequired: limitCheck.upgradeRequired,
                subscriptionRequired: true
            });
        }

        req.body.coachId = coachId;
        const lead = await Lead.create(req.body);

        res.status(201).json({
            success: true,
            data: lead
        });
    });

    /**
     * Update lead
     * @route PUT /api/staff-unified/v1/leads/:leadId
     * @access Private (Staff with leads:update permission)
     */
    updateLead = asyncHandler(async (req, res) => {
        const { leadId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'leads:update')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to update leads'
            });
        }

        const lead = await Lead.findOneAndUpdate(
            { _id: leadId, coachId },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        res.json({
            success: true,
            data: lead
        });
    });

    /**
     * Delete lead
     * @route DELETE /api/staff-unified/v1/leads/:leadId
     * @access Private (Staff with leads:delete permission)
     */
    deleteLead = asyncHandler(async (req, res) => {
        const { leadId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'leads:delete')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to delete leads'
            });
        }

        const lead = await Lead.findOneAndDelete({ _id: leadId, coachId });
        
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        res.json({
            success: true,
            message: 'Lead deleted successfully'
        });
    });

    /**
     * Get specific lead details
     * @route GET /api/staff-unified/v1/leads/:leadId
     * @access Private (Staff with leads:read permission)
     */
    getLeadDetails = asyncHandler(async (req, res) => {
        const { leadId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('leads', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access lead details'
            });
        }

        const lead = await Lead.findOne({ _id: leadId, coachId });
        
        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        res.json({
            success: true,
            data: lead
        });
    });

    /**
     * Get tasks data
     * @route GET /api/staff-unified/v1/tasks
     * @access Private (Staff with tasks:read permission)
     */
    getTasksData = asyncHandler(async (req, res) => {
        const { timeRange = 30 } = req.query;
        const { staffId, coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('tasks', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access tasks data'
            });
        }

        const data = await this.getTasksDataInternal(staffId, coachId, parseInt(timeRange));
        
        res.json({
            success: true,
            data
        });
    });

    /**
     * Create new task
     * @route POST /api/staff-unified/v1/tasks
     * @access Private (Staff with tasks:write permission)
     */
    createTask = asyncHandler(async (req, res) => {
        const { staffId, coachId, permissions } = req.staffInfo;
        
        if (!this.checkWritePermission('tasks', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to create tasks'
            });
        }

        req.body.coachId = coachId;
        req.body.createdBy = staffId;
        const task = await Task.create(req.body);

        res.status(201).json({
            success: true,
            data: task
        });
    });

    /**
     * Update task
     * @route PUT /api/staff-unified/v1/tasks/:taskId
     * @access Private (Staff with tasks:update permission)
     */
    updateTask = asyncHandler(async (req, res) => {
        const { taskId } = req.params;
        const { staffId, coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'tasks:update')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to update tasks'
            });
        }

        const task = await Task.findOneAndUpdate(
            { _id: taskId, coachId },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            data: task
        });
    });

    /**
     * Delete task
     * @route DELETE /api/staff-unified/v1/tasks/:taskId
     * @access Private (Staff with tasks:delete permission)
     */
    deleteTask = asyncHandler(async (req, res) => {
        const { taskId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'tasks:delete')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to delete tasks'
            });
        }

        const task = await Task.findOneAndDelete({ _id: taskId, coachId });
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    });

    /**
     * Assign task to staff member
     * @route POST /api/staff-unified/v1/tasks/:taskId/assign
     * @access Private (Staff with tasks:assign permission)
     */
    assignTask = asyncHandler(async (req, res) => {
        const { taskId } = req.params;
        const { assignedTo } = req.body;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'tasks:assign')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to assign tasks'
            });
        }

        const task = await Task.findOneAndUpdate(
            { _id: taskId, coachId },
            { assignedTo },
            { new: true, runValidators: true }
        );
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            data: task
        });
    });

    /**
     * Get specific task details
     * @route GET /api/staff-unified/v1/tasks/:taskId
     * @access Private (Staff with tasks:read permission)
     */
    getTaskDetails = asyncHandler(async (req, res) => {
        const { taskId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('tasks', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access task details'
            });
        }

        const task = await Task.findOne({ _id: taskId, coachId }).populate('assignedTo', 'name email');
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            data: task
        });
    });

    /**
     * Get marketing data
     * @route GET /api/staff-unified/v1/marketing
     * @access Private (Staff with leads:read permission)
     */
    getMarketingData = asyncHandler(async (req, res) => {
        const { timeRange = 30 } = req.query;
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('marketing', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access marketing data'
            });
        }

        const data = await this.getMarketingDataInternal(coachId, parseInt(timeRange));
        
        res.json({
            success: true,
            data
        });
    });

    /**
     * Create new ad campaign
     * @route POST /api/staff-unified/v1/marketing/campaigns
     * @access Private (Staff with leads:write permission)
     */
    createAdCampaign = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkWritePermission('marketing', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to create ad campaigns'
            });
        }

        req.body.coachId = coachId;
        const campaign = await AdCampaign.create(req.body);

        res.status(201).json({
            success: true,
            data: campaign
        });
    });

    /**
     * Update ad campaign
     * @route PUT /api/staff-unified/v1/marketing/campaigns/:campaignId
     * @access Private (Staff with leads:update permission)
     */
    updateAdCampaign = asyncHandler(async (req, res) => {
        const { campaignId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'leads:update')) {
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
                message: 'Campaign not found'
            });
        }

        res.json({
            success: true,
            data: campaign
        });
    });

    /**
     * Delete ad campaign
     * @route DELETE /api/staff-unified/v1/marketing/campaigns/:campaignId
     * @access Private (Staff with leads:delete permission)
     */
    deleteAdCampaign = asyncHandler(async (req, res) => {
        const { campaignId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'leads:delete')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to delete ad campaigns'
            });
        }

        const campaign = await AdCampaign.findOneAndDelete({ _id: campaignId, coachId });
        
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        res.json({
            success: true,
            message: 'Campaign deleted successfully'
        });
    });

    /**
     * Get all ad campaigns
     * @route GET /api/staff-unified/v1/marketing/campaigns
     * @access Private (Staff with leads:read permission)
     */
    getAdCampaigns = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('marketing', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access ad campaigns'
            });
        }

        const campaigns = await AdCampaign.find({ coachId });

        res.json({
            success: true,
            data: campaigns
        });
    });

    /**
     * Get financial data
     * @route GET /api/staff-unified/v1/financial
     * @access Private (Staff with performance:read permission)
     */
    getFinancialData = asyncHandler(async (req, res) => {
        const { timeRange = 30 } = req.query;
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('financial', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access financial data'
            });
        }

        const data = await this.getFinancialDataInternal(coachId, parseInt(timeRange));
        
        res.json({
            success: true,
            data
        });
    });

    /**
     * Get all payments
     * @route GET /api/staff-unified/v1/financial/payments
     * @access Private (Staff with performance:read permission)
     */
    getPayments = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('financial', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access payments'
            });
        }

        const payments = await RazorpayPayment.find({ coachId });

        res.json({
            success: true,
            data: payments
        });
    });

    /**
     * Get payment details
     * @route GET /api/staff-unified/v1/financial/payments/:paymentId
     * @access Private (Staff with performance:read permission)
     */
    getPaymentDetails = asyncHandler(async (req, res) => {
        const { paymentId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('financial', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access payment details'
            });
        }

        const payment = await RazorpayPayment.findOne({ _id: paymentId, coachId });
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: payment
        });
    });

    /**
     * Update payment status
     * @route PUT /api/staff-unified/v1/financial/payments/:paymentId/status
     * @access Private (Staff with performance:write permission)
     */
    updatePaymentStatus = asyncHandler(async (req, res) => {
        const { paymentId } = req.params;
        const { status } = req.body;
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkWritePermission('financial', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to update payment status'
            });
        }

        const payment = await RazorpayPayment.findOneAndUpdate(
            { _id: paymentId, coachId },
            { status },
            { new: true, runValidators: true }
        );
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: payment
        });
    });

    /**
     * Get team data
     * @route GET /api/staff-unified/v1/team
     * @access Private (Staff with staff:read permission)
     */
    getTeamData = asyncHandler(async (req, res) => {
        const { timeRange = 30 } = req.query;
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('team', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access team data'
            });
        }

        const data = await this.getTeamDataInternal(coachId, parseInt(timeRange));
        
        res.json({
            success: true,
            data
        });
    });

    /**
     * Get all staff members
     * @route GET /api/staff-unified/v1/team/staff
     * @access Private (Staff with staff:read permission)
     */
    getStaffMembers = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('team', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access staff members'
            });
        }

        const staffMembers = await Staff.find({ coachId }).select('-password');

        res.json({
            success: true,
            data: staffMembers
        });
    });

    /**
     * Create new staff member
     * @route POST /api/staff-unified/v1/team/staff
     * @access Private (Staff with staff:write permission)
     */
    createStaffMember = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkWritePermission('team', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to create staff members'
            });
        }

        req.body.coachId = coachId;
        req.body.role = 'staff';
        const staff = await Staff.create(req.body);

        res.status(201).json({
            success: true,
            data: staff
        });
    });

    /**
     * Update staff member
     * @route PUT /api/staff-unified/v1/team/staff/:staffId
     * @access Private (Staff with staff:update permission)
     */
    updateStaffMember = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'staff:update')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to update staff members'
            });
        }

        const staff = await Staff.findOneAndUpdate(
            { _id: staffId, coachId },
            req.body,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.json({
            success: true,
            data: staff
        });
    });

    /**
     * Delete staff member
     * @route DELETE /api/staff-unified/v1/team/staff/:staffId
     * @access Private (Staff with staff:delete permission)
     */
    deleteStaffMember = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'staff:delete')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to delete staff members'
            });
        }

        const staff = await Staff.findOneAndDelete({ _id: staffId, coachId });
        
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.json({
            success: true,
            message: 'Staff member deleted successfully'
        });
    });

    /**
     * Update staff permissions
     * @route PUT /api/staff-unified/v1/team/staff/:staffId/permissions
     * @access Private (Staff with staff:manage permission)
     */
    updateStaffPermissions = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const { permissions: newPermissions } = req.body;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'staff:manage')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to manage staff permissions'
            });
        }

        const staff = await Staff.findOneAndUpdate(
            { _id: staffId, coachId },
            { permissions: newPermissions },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.json({
            success: true,
            data: staff
        });
    });

    /**
     * Get performance data
     * @route GET /api/staff-unified/v1/performance
     * @access Private (Staff with performance:read permission)
     */
    getPerformanceData = asyncHandler(async (req, res) => {
        const { timeRange = 30 } = req.query;
        const { staffId, coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('performance', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access performance data'
            });
        }

        const data = await this.getPerformanceDataInternal(staffId, coachId, parseInt(timeRange));
        
        res.json({
            success: true,
            data
        });
    });

    /**
     * Get calendar data
     * @route GET /api/staff-unified/v1/calendar
     * @access Private (Staff with calendar:read permission)
     */
    getCalendarData = asyncHandler(async (req, res) => {
        const { timeRange = 30 } = req.query;
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('calendar', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access calendar data'
            });
        }

        const data = await this.getCalendarDataInternal(coachId, parseInt(timeRange));
        
        res.json({
            success: true,
            data
        });
    });

    /**
     * Get all appointments
     * @route GET /api/staff-unified/v1/calendar/appointments
     * @access Private (Staff with calendar:read permission)
     */
    getAppointments = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('calendar', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access appointments'
            });
        }

        const appointments = await Appointment.find({ coachId }).populate('clientId', 'name email');

        res.json({
            success: true,
            data: appointments
        });
    });

    /**
     * Create new appointment
     * @route POST /api/staff-unified/v1/calendar/appointments
     * @access Private (Staff with calendar:write permission)
     */
    createAppointment = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkWritePermission('calendar', permissions)) {
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
     * @route PUT /api/staff-unified/v1/calendar/appointments/:appointmentId
     * @access Private (Staff with calendar:update permission)
     */
    updateAppointment = asyncHandler(async (req, res) => {
        const { appointmentId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'calendar:update')) {
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
     * Delete appointment
     * @route DELETE /api/staff-unified/v1/calendar/appointments/:appointmentId
     * @access Private (Staff with calendar:delete permission)
     */
    deleteAppointment = asyncHandler(async (req, res) => {
        const { appointmentId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'calendar:delete')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to delete appointments'
            });
        }

        const appointment = await Appointment.findOneAndDelete({ _id: appointmentId, coachId });
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            message: 'Appointment deleted successfully'
        });
    });

    /**
     * Book appointment
     * @route POST /api/staff-unified/v1/calendar/book
     * @access Private (Staff with calendar:book permission)
     */
    bookAppointment = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'calendar:book')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to book appointments'
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
     * Get funnels data
     * @route GET /api/staff-unified/v1/funnels
     * @access Private (Staff with funnels:read permission)
     */
    getFunnelsData = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('funnels', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access funnels data'
            });
        }

        const data = await this.getFunnelsDataInternal(coachId, permissions);
        
        res.json({
            success: true,
            data
        });
    });

    /**
     * Get specific funnel details
     * @route GET /api/staff-unified/v1/funnels/:funnelId
     * @access Private (Staff with funnels:read permission)
     */
    getFunnelDetails = asyncHandler(async (req, res) => {
        const { funnelId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!this.checkSectionPermission('funnels', permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access funnel details'
            });
        }

        const funnel = await Funnel.findOne({ _id: funnelId, coachId });
        
        if (!funnel) {
            return res.status(404).json({
                success: false,
                message: 'Funnel not found'
            });
        }

        res.json({
            success: true,
            data: funnel
        });
    });

    /**
     * Update funnel (if staff has write permissions)
     * @route PUT /api/staff-unified/v1/funnels/:funnelId
     * @access Private (Staff with funnels:update permission)
     */
    updateFunnel = asyncHandler(async (req, res) => {
        const { funnelId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'funnels:update')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to update funnels'
            });
        }

        const funnel = await Funnel.findOneAndUpdate(
            { _id: funnelId, coachId },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!funnel) {
            return res.status(404).json({
                success: false,
                message: 'Funnel not found'
            });
        }

        res.json({
            success: true,
            data: funnel
        });
    });

    /**
     * Create new funnel (if staff has write permissions)
     * @route POST /api/staff-unified/v1/funnels
     * @access Private (Staff with funnels:write permission)
     */
    createFunnel = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'funnels:write')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to create funnels'
            });
        }

        // Check subscription limits for funnel creation
        const SubscriptionLimitsMiddleware = require('../middleware/subscriptionLimits');
        const limitCheck = await SubscriptionLimitsMiddleware.checkFunnelLimit(coachId);
        
        if (!limitCheck.allowed) {
            return res.status(403).json({
                success: false,
                message: limitCheck.reason,
                error: 'FUNNEL_LIMIT_REACHED',
                currentCount: limitCheck.currentCount,
                maxLimit: limitCheck.maxLimit,
                upgradeRequired: limitCheck.upgradeRequired,
                subscriptionRequired: true
            });
        }

        req.body.coachId = coachId;
        const funnel = await Funnel.create(req.body);

        res.status(201).json({
            success: true,
            data: funnel
        });
    });

    /**
     * Delete funnel (if staff has delete permissions)
     * @route DELETE /api/staff-unified/v1/funnels/:funnelId
     * @access Private (Staff with funnels:delete permission)
     */
    deleteFunnel = asyncHandler(async (req, res) => {
        const { funnelId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'funnels:delete')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to delete funnels'
            });
        }

        const funnel = await Funnel.findOneAndDelete({ _id: funnelId, coachId });
        
        if (!funnel) {
            return res.status(404).json({
                success: false,
                message: 'Funnel not found'
            });
        }

        res.json({
            success: true,
            message: 'Funnel deleted successfully'
        });
    });

    /**
     * Add stage to funnel (if staff has stage management permissions)
     * @route POST /api/staff-unified/v1/funnels/:funnelId/stages
     * @access Private (Staff with funnels:manage_stages permission)
     */
    addStageToFunnel = asyncHandler(async (req, res) => {
        const { funnelId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'funnels:manage_stages')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to manage funnel stages'
            });
        }

        const funnel = await Funnel.findOne({ _id: funnelId, coachId });
        
        if (!funnel) {
            return res.status(404).json({
                success: false,
                message: 'Funnel not found'
            });
        }

        funnel.stages.push(req.body);
        await funnel.save();

        res.json({
            success: true,
            data: funnel
        });
    });

    /**
     * Update funnel stage (if staff has stage management permissions)
     * @route PUT /api/staff-unified/v1/funnels/:funnelId/stages/:stageId
     * @access Private (Staff with funnels:manage_stages permission)
     */
    updateFunnelStage = asyncHandler(async (req, res) => {
        const { funnelId, stageId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'funnels:manage_stages')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to manage funnel stages'
            });
        }

        const funnel = await Funnel.findOne({ _id: funnelId, coachId });
        
        if (!funnel) {
            return res.status(404).json({
                success: false,
                message: 'Funnel not found'
            });
        }

        const stage = funnel.stages.id(stageId);
        if (!stage) {
            return res.status(404).json({
                success: false,
                message: 'Stage not found'
            });
        }

        Object.assign(stage, req.body);
        await funnel.save();

        res.json({
            success: true,
            data: funnel
        });
    });

    /**
     * Delete funnel stage (if staff has stage management permissions)
     * @route DELETE /api/staff-unified/v1/funnels/:funnelId/stages/:stageId
     * @access Private (Staff with funnels:manage_stages permission)
     */
    deleteFunnelStage = asyncHandler(async (req, res) => {
        const { funnelId, stageId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'funnels:manage_stages')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to manage funnel stages'
            });
        }

        const funnel = await Funnel.findOne({ _id: funnelId, coachId });
        
        if (!funnel) {
            return res.status(404).json({
                success: false,
                message: 'Funnel not found'
            });
        }

        funnel.stages.pull(stageId);
        await funnel.save();

        res.json({
            success: true,
            data: funnel
        });
    });

    /**
     * Get funnel analytics (if staff has analytics permission)
     * @route GET /api/staff-unified/v1/funnels/:funnelId/analytics
     * @access Private (Staff with funnels:view_analytics permission)
     */
    getFunnelAnalytics = asyncHandler(async (req, res) => {
        const { funnelId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        if (!hasPermission(permissions, 'funnels:view_analytics')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view funnel analytics'
            });
        }

        const funnel = await Funnel.findOne({ _id: funnelId, coachId });
        
        if (!funnel) {
            return res.status(404).json({
                success: false,
                message: 'Funnel not found'
            });
        }

        // This would integrate with your analytics service
        const analytics = {
            funnelId,
            totalViews: 0,
            conversions: 0,
            conversionRate: 0,
            stageBreakdown: funnel.stages.map(stage => ({
                stageId: stage._id,
                name: stage.name,
                views: 0,
                conversions: 0
            }))
        };

        res.json({
            success: true,
            data: analytics
        });
    });

    /**
     * Publish/Unpublish funnel (if staff has publish permissions)
     * @route PUT /api/staff-unified/v1/funnels/:funnelId/publish
     * @route PUT /api/staff-unified/v1/funnels/:funnelId/unpublish
     * @access Private (Staff with funnels:publish/funnels:unpublish permission)
     */
    toggleFunnelPublish = asyncHandler(async (req, res) => {
        const { funnelId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        const isPublishing = req.path.includes('/publish');
        
        const requiredPermission = isPublishing ? 'funnels:publish' : 'funnels:unpublish';
        
        if (!hasPermission(permissions, requiredPermission)) {
            return res.status(403).json({
                success: false,
                message: `Insufficient permissions to ${isPublishing ? 'publish' : 'unpublish'} funnels`
            });
        }

        const funnel = await Funnel.findOneAndUpdate(
            { _id: funnelId, coachId },
            { isActive: isPublishing },
            { new: true, runValidators: true }
        );
        
        if (!funnel) {
            return res.status(404).json({
                success: false,
                message: 'Funnel not found'
            });
        }

        res.json({
            success: true,
            data: funnel,
            message: `Funnel ${isPublishing ? 'published' : 'unpublished'} successfully`
        });
    });

    /**
     * Get dashboard widgets
     * @route GET /api/staff-unified/v1/widgets
     * @access Private (Staff)
     */
    getDashboardWidgets = asyncHandler(async (req, res) => {
        const { coachId, permissions } = req.staffInfo;
        
        const widgets = await this.getDashboardWidgetsInternal(coachId, permissions);
        
        res.json({
            success: true,
            data: widgets
        });
    });

    /**
     * Get specific widget data
     * @route GET /api/staff-unified/v1/widgets/:widgetId
     * @access Private (Staff)
     */
    getWidgetData = asyncHandler(async (req, res) => {
        const { widgetId } = req.params;
        const { coachId, permissions } = req.staffInfo;
        
        const widgetData = await this.getWidgetDataInternal(widgetId, coachId, permissions);
        
        res.json({
            success: true,
            data: widgetData
        });
    });

    // ===== INTERNAL HELPER METHODS =====

    async getOverviewDataInternal(coachId, timeRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        return await coachDashboardService.getOverviewData(coachId, startDate);
    }

    async getLeadsDataInternal(coachId, timeRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        return await coachDashboardService.getLeadsData(coachId, startDate);
    }

    async getTasksDataInternal(staffId, coachId, timeRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        // Get tasks assigned to this staff member
        const tasks = await Task.find({
            assignedTo: staffId,
            createdAt: { $gte: startDate }
        }).populate('assignedBy', 'name email');

        return {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(task => task.status === 'completed').length,
            pendingTasks: tasks.filter(task => task.status === 'pending').length,
            overdueTasks: tasks.filter(task => 
                task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
            ).length,
            tasks: tasks
        };
    }

    async getMarketingDataInternal(coachId, timeRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        return await coachDashboardService.getMarketingData(coachId, startDate);
    }

    async getFinancialDataInternal(coachId, timeRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        return await coachDashboardService.getFinancialData(coachId, startDate);
    }

    async getTeamDataInternal(coachId, timeRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        return await coachDashboardService.getTeamData(coachId, startDate);
    }

    async getPerformanceDataInternal(staffId, coachId, timeRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        // Get staff-specific performance data
        const tasks = await Task.find({
            assignedTo: staffId,
            createdAt: { $gte: startDate }
        });

        const completedTasks = tasks.filter(task => task.status === 'completed');
        const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

        return {
            staffId,
            completionRate,
            totalTasks: tasks.length,
            completedTasks: completedTasks.length,
            averageTaskCompletionTime: this.calculateAverageCompletionTime(completedTasks),
            performanceScore: this.calculatePerformanceScore(completedTasks, tasks)
        };
    }

    async getCalendarDataInternal(coachId, timeRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        return await coachDashboardService.getCalendarData(coachId, startDate);
    }

    async getFunnelsDataInternal(coachId, permissions) {
        const funnels = await Funnel.find({ coachId }).select('-stages.html');
        
        // Filter funnels based on permissions
        const accessibleFunnels = funnels.map(funnel => ({
            ...funnel.toObject(),
            permissions: {
                canEdit: hasPermission(permissions, 'funnels:update'),
                canDelete: hasPermission(permissions, 'funnels:delete'),
                canManage: hasPermission(permissions, 'funnels:manage'),
                canViewAnalytics: hasPermission(permissions, 'funnels:view_analytics'),
                canEditStages: hasPermission(permissions, 'funnels:edit_stages'),
                canManageStages: hasPermission(permissions, 'funnels:manage_stages'),
                canPublish: hasPermission(permissions, 'funnels:publish'),
                canUnpublish: hasPermission(permissions, 'funnels:unpublish')
            }
        }));

        return {
            totalFunnels: accessibleFunnels.length,
            activeFunnels: accessibleFunnels.filter(f => f.isActive).length,
            funnels: accessibleFunnels
        };
    }

    async getDashboardWidgetsInternal(coachId, permissions) {
        const widgets = [];
        
        if (this.checkSectionPermission('financial', permissions)) {
            widgets.push({
                id: 'revenue_chart',
                title: 'Revenue Trends',
                type: 'chart',
                data: await coachDashboardService.getRevenueChartData(coachId)
            });
        }
        
        if (this.checkSectionPermission('leads', permissions)) {
            widgets.push({
                id: 'lead_funnel',
                title: 'Lead Conversion Funnel',
                type: 'funnel',
                data: await coachDashboardService.getLeadFunnelData(coachId)
            });
        }
        
        if (this.checkSectionPermission('team', permissions)) {
            widgets.push({
                id: 'team_performance',
                title: 'Team Performance',
                type: 'leaderboard',
                data: await coachDashboardService.getTeamPerformanceData(coachId)
            });
        }
        
        if (this.checkSectionPermission('tasks', permissions)) {
            widgets.push({
                id: 'task_overview',
                title: 'Task Overview',
                type: 'kanban',
                data: await coachDashboardService.getTaskOverviewData(coachId)
            });
        }
        
        if (this.checkSectionPermission('calendar', permissions)) {
            widgets.push({
                id: 'calendar_overview',
                title: 'Calendar Overview',
                type: 'calendar',
                data: await coachDashboardService.getCalendarOverviewData(coachId)
            });
        }

        return widgets;
    }

    async getWidgetDataInternal(widgetId, coachId, permissions) {
        // This would be implemented based on specific widget requirements
        return { widgetId, data: 'Widget data placeholder' };
    }

    calculateAverageCompletionTime(completedTasks) {
        if (completedTasks.length === 0) return 0;
        
        const totalTime = completedTasks.reduce((sum, task) => {
            if (task.completedAt && task.createdAt) {
                return sum + (new Date(task.completedAt) - new Date(task.createdAt));
            }
            return sum;
        }, 0);
        
        return totalTime / completedTasks.length;
    }

    calculatePerformanceScore(completedTasks, allTasks) {
        if (allTasks.length === 0) return 0;
        
        const completionRate = (completedTasks.length / allTasks.length) * 100;
        const onTimeRate = completedTasks.filter(task => {
            if (!task.dueDate || !task.completedAt) return true;
            return new Date(task.completedAt) <= new Date(task.dueDate);
        }).length / completedTasks.length * 100;
        
        return (completionRate + onTimeRate) / 2;
    }
}

module.exports = new StaffUnifiedDashboardController();
