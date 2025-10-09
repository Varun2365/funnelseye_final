const Staff = require('../schema/Staff');
const User = require('../schema/User');
const asyncHandler = require('../middleware/async');
const { PERMISSIONS, PERMISSION_GROUPS } = require('../utils/permissions');
const { 
    SECTIONS, 
    SECTION_METADATA, 
    PERMISSION_PRESETS,
    getSectionsGroupedByCategory,
    getAvailablePresets 
} = require('../utils/sectionPermissions');

/**
 * Coach Staff Management Controller
 * Allows coaches to manage their staff members and assign permissions
 */
class CoachStaffManagementController {

    /**
     * Get all permissions grouped by category
     * @route GET /api/coach/staff/permissions
     * @access Private (Coach/Staff with staff:read permission)
     */
    getPermissionsList = asyncHandler(async (req, res) => {
        const coachId = req.coachId;
        const userContext = req.userContext;
        
        // Log staff action if applicable
        if (userContext && userContext.isStaff) {
            console.log(`[Staff Action] ${userContext.userId} accessed permissions list for coach ${coachId}`);
        }

        // Group permissions by category with descriptions
        const permissionsList = {
            leads: {
                category: "Lead Management",
                description: "Manage leads, lead magnets, and lead generation tools",
                permissions: {
                    "leads:read": {
                        name: "View Leads",
                        description: "View lead information and analytics"
                    },
                    "leads:write": {
                        name: "Create Leads",
                        description: "Create new leads and lead magnet tools"
                    },
                    "leads:update": {
                        name: "Update Leads", 
                        description: "Update existing lead information and status"
                    },
                    "leads:delete": {
                        name: "Delete Leads",
                        description: "Remove leads from the system"
                    },
                    "leads:manage": {
                        name: "Manage Leads",
                        description: "Full lead management including bulk operations"
                    }
                }
            },
            funnels: {
                category: "Funnel Management",
                description: "Create and manage sales funnels",
                permissions: {
                    "funnels:read": {
                        name: "View Funnels",
                        description: "View funnel information and analytics"
                    },
                    "funnels:write": {
                        name: "Create Funnels",
                        description: "Create new sales funnels"
                    },
                    "funnels:update": {
                        name: "Update Funnels",
                        description: "Modify existing funnel configurations"
                    },
                    "funnels:delete": {
                        name: "Delete Funnels",
                        description: "Remove funnels from the system"
                    },
                    "funnels:manage": {
                        name: "Manage Funnels",
                        description: "Full funnel management including publishing"
                    },
                    "funnels:view_analytics": {
                        name: "View Funnel Analytics",
                        description: "Access funnel performance analytics"
                    },
                    "funnels:edit_stages": {
                        name: "Edit Funnel Stages",
                        description: "Modify funnel stage configurations"
                    },
                    "funnels:manage_stages": {
                        name: "Manage Funnel Stages",
                        description: "Add, remove, and reorder funnel stages"
                    },
                    "funnels:publish": {
                        name: "Publish Funnels",
                        description: "Make funnels live and accessible"
                    },
                    "funnels:unpublish": {
                        name: "Unpublish Funnels",
                        description: "Take funnels offline"
                    }
                }
            },
            tasks: {
                category: "Task Management",
                description: "Manage workflow tasks and automation",
                permissions: {
                    "tasks:read": {
                        name: "View Tasks",
                        description: "View task information and status"
                    },
                    "tasks:write": {
                        name: "Create Tasks",
                        description: "Create new tasks and workflows"
                    },
                    "tasks:update": {
                        name: "Update Tasks",
                        description: "Modify existing task information"
                    },
                    "tasks:delete": {
                        name: "Delete Tasks",
                        description: "Remove tasks from the system"
                    },
                    "tasks:manage": {
                        name: "Manage Tasks",
                        description: "Full task management including bulk operations"
                    },
                    "tasks:assign": {
                        name: "Assign Tasks",
                        description: "Assign tasks to team members"
                    }
                }
            },
            calendar: {
                category: "Calendar Management",
                description: "Manage appointments and calendar events",
                permissions: {
                    "calendar:read": {
                        name: "View Calendar",
                        description: "View calendar events and availability"
                    },
                    "calendar:write": {
                        name: "Create Events",
                        description: "Create new calendar events"
                    },
                    "calendar:update": {
                        name: "Update Events",
                        description: "Modify existing calendar events"
                    },
                    "calendar:delete": {
                        name: "Delete Events",
                        description: "Remove calendar events"
                    },
                    "calendar:manage": {
                        name: "Manage Calendar",
                        description: "Full calendar management including settings"
                    },
                    "calendar:book": {
                        name: "Book Appointments",
                        description: "Book appointments for clients"
                    }
                }
            },
            staff: {
                category: "Staff Management",
                description: "Manage team members and permissions",
                permissions: {
                    "staff:read": {
                        name: "View Staff",
                        description: "View staff member information"
                    },
                    "staff:write": {
                        name: "Create Staff",
                        description: "Add new staff members"
                    },
                    "staff:update": {
                        name: "Update Staff",
                        description: "Modify staff member information"
                    },
                    "staff:delete": {
                        name: "Delete Staff",
                        description: "Remove staff members"
                    },
                    "staff:manage": {
                        name: "Manage Staff",
                        description: "Full staff management including permissions"
                    }
                }
            },
            performance: {
                category: "Performance & Analytics",
                description: "Access performance metrics and analytics",
                permissions: {
                    "performance:read": {
                        name: "View Performance",
                        description: "View performance metrics and analytics"
                    },
                    "performance:manage": {
                        name: "Manage Performance",
                        description: "Manage performance tracking and reporting"
                    }
                }
            },
            files: {
                category: "File Management",
                description: "Manage files and documents",
                permissions: {
                    "files:read": {
                        name: "View Files",
                        description: "View and download files"
                    },
                    "files:write": {
                        name: "Upload Files",
                        description: "Upload new files and documents"
                    },
                    "files:update": {
                        name: "Update Files",
                        description: "Modify file information and metadata"
                    },
                    "files:delete": {
                        name: "Delete Files",
                        description: "Remove files from the system"
                    },
                    "files:manage": {
                        name: "Manage Files",
                        description: "Full file management including organization"
                    }
                }
            },
            ai: {
                category: "AI Tools",
                description: "Access AI-powered features and tools",
                permissions: {
                    "ai:read": {
                        name: "View AI Tools",
                        description: "View AI-generated content and insights"
                    },
                    "ai:write": {
                        name: "Use AI Tools",
                        description: "Generate content using AI tools"
                    },
                    "ai:manage": {
                        name: "Manage AI Tools",
                        description: "Configure and manage AI tool settings"
                    }
                }
            },
            whatsapp: {
                category: "WhatsApp Integration",
                description: "Manage WhatsApp messaging and automation",
                permissions: {
                    "whatsapp:read": {
                        name: "View WhatsApp",
                        description: "View WhatsApp messages and analytics"
                    },
                    "whatsapp:write": {
                        name: "Send Messages",
                        description: "Send WhatsApp messages"
                    },
                    "whatsapp:manage": {
                        name: "Manage WhatsApp",
                        description: "Configure WhatsApp integration settings"
                    }
                }
            },
            automation: {
                category: "Automation & Sequences",
                description: "Manage automated sequences and workflows",
                permissions: {
                    "automation:read": {
                        name: "View Automation",
                        description: "View automation rules and sequences"
                    },
                    "automation:write": {
                        name: "Create Automation",
                        description: "Create new automation rules"
                    },
                    "automation:update": {
                        name: "Update Automation",
                        description: "Modify existing automation rules"
                    },
                    "automation:delete": {
                        name: "Delete Automation",
                        description: "Remove automation rules"
                    },
                    "automation:manage": {
                        name: "Manage Automation",
                        description: "Full automation management"
                    },
                    "automation:execute": {
                        name: "Execute Automation",
                        description: "Run and test automation sequences"
                    }
                }
            },
            ads: {
                category: "Advertising Management",
                description: "Manage advertising campaigns and marketing",
                permissions: {
                    "ads:read": {
                        name: "View Ads",
                        description: "View advertising campaigns and analytics"
                    },
                    "ads:write": {
                        name: "Create Ads",
                        description: "Create new advertising campaigns"
                    },
                    "ads:update": {
                        name: "Update Ads",
                        description: "Modify existing advertising campaigns"
                    },
                    "ads:delete": {
                        name: "Delete Ads",
                        description: "Remove advertising campaigns"
                    },
                    "ads:manage": {
                        name: "Manage Ads",
                        description: "Full advertising management"
                    },
                    "ads:analytics": {
                        name: "View Ad Analytics",
                        description: "Access advertising performance analytics"
                    }
                }
            },
            appointments: {
                category: "Appointment Management",
                description: "Manage client appointments and scheduling",
                permissions: {
                    "appointments:read": {
                        name: "View Appointments",
                        description: "View appointment information and schedules"
                    },
                    "appointments:manage": {
                        name: "Manage Appointments",
                        description: "Full appointment management including scheduling"
                    }
                }
            },
            templates: {
                category: "Message Templates",
                description: "Manage message templates and communications",
                permissions: {
                    "templates:read": {
                        name: "View Templates",
                        description: "View message templates"
                    },
                    "templates:write": {
                        name: "Create Templates",
                        description: "Create new message templates"
                    },
                    "templates:update": {
                        name: "Update Templates",
                        description: "Modify existing message templates"
                    },
                    "templates:delete": {
                        name: "Delete Templates",
                        description: "Remove message templates"
                    }
                }
            },
            dashboard: {
                category: "Dashboard Access",
                description: "Access to dashboard sections and overview",
                permissions: {
                    "dashboard:read": {
                        name: "View Dashboard",
                        description: "Access main dashboard and overview"
                    }
                }
            },
            marketing: {
                category: "Marketing Tools",
                description: "Access marketing tools and credentials",
                permissions: {
                    "marketing:read": {
                        name: "View Marketing Tools",
                        description: "View marketing tools and configurations"
                    },
                    "marketing:manage": {
                        name: "Manage Marketing Tools",
                        description: "Configure marketing tools and credentials"
                    }
                }
            },
            mlm: {
                category: "MLM Management",
                description: "Manage MLM hierarchy and commissions",
                permissions: {
                    "mlm:read": {
                        name: "View MLM",
                        description: "View MLM hierarchy and commission data"
                    },
                    "mlm:manage": {
                        name: "Manage MLM",
                        description: "Full MLM management including hierarchy"
                    }
                }
            },
            plan: {
                category: "Plan Management",
                description: "Manage subscription plans and features",
                permissions: {
                    "plan:read": {
                        name: "View Plans",
                        description: "View subscription plans and features"
                    },
                    "plan:write": {
                        name: "Create Plans",
                        description: "Create new subscription plans"
                    },
                    "plan:update": {
                        name: "Update Plans",
                        description: "Modify existing subscription plans"
                    },
                    "plan:delete": {
                        name: "Delete Plans",
                        description: "Remove subscription plans"
                    }
                }
            },
            payment: {
                category: "Payment Management",
                description: "Manage payments and financial transactions",
                permissions: {
                    "payment:read": {
                        name: "View Payments",
                        description: "View payment information and history"
                    },
                    "payment:manage": {
                        name: "Manage Payments",
                        description: "Full payment management including processing"
                    }
                }
            },
            subscription: {
                category: "Subscription Management",
                description: "Manage subscriptions and billing",
                permissions: {
                    "subscription:read": {
                        name: "View Subscriptions",
                        description: "View subscription information and limits"
                    }
                }
            },
            coach: {
                category: "Coach Management",
                description: "Manage coach information and settings",
                permissions: {
                    "coach:read": {
                        name: "View Coach Info",
                        description: "View coach information and settings"
                    },
                    "coach:manage": {
                        name: "Manage Coach Info",
                        description: "Modify coach information and settings"
                    }
                }
            }
        };

        res.json({
            success: true,
            data: {
                permissions: permissionsList,
                totalCategories: Object.keys(permissionsList).length,
                totalPermissions: Object.values(permissionsList).reduce((total, category) => {
                    return total + Object.keys(category.permissions).length;
                }, 0),
                userContext: {
                    isStaff: userContext ? userContext.isStaff : false,
                    permissions: userContext ? userContext.permissions : []
                }
            }
        });
    });

    /**
     * Get all staff members for a coach
     * @route GET /api/coach/staff
     * @access Private (Coach)
     */
    getStaffMembers = asyncHandler(async (req, res) => {
        const coachId = req.coachId;
        
        const staffMembers = await Staff.find({ coachId }).select('-password');
        
        res.json({
            success: true,
            data: staffMembers
        });
    });

    /**
     * Create new staff member
     * @route POST /api/coach/staff
     * @access Private (Coach)
     */
    createStaffMember = asyncHandler(async (req, res) => {
        const coachId = req.coachId;
        
        // Check subscription limits for staff creation
        const SubscriptionLimitsMiddleware = require('../middleware/subscriptionLimits');
        const limitCheck = await SubscriptionLimitsMiddleware.checkStaffLimit(coachId);
        
        if (!limitCheck.allowed) {
            return res.status(403).json({
                success: false,
                message: limitCheck.reason,
                error: 'STAFF_LIMIT_REACHED',
                currentCount: limitCheck.currentCount,
                maxLimit: limitCheck.maxLimit,
                upgradeRequired: limitCheck.upgradeRequired,
                subscriptionRequired: true
            });
        }
        
        // Validate required fields
        const { name, email, password, permissions = [] } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Create staff member
        const staffData = {
            name,
            email,
            password,
            role: 'staff',
            coachId,
            permissions,
            isActive: true
        };

        const staff = await Staff.create(staffData);
        
        // Remove password from response
        const staffResponse = staff.toObject();
        delete staffResponse.password;

        res.status(201).json({
            success: true,
            data: staffResponse
        });
    });

    /**
     * Update staff member
     * @route PUT /api/coach/staff/:staffId
     * @access Private (Coach)
     */
    updateStaffMember = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const coachId = req.coachId;
        
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
     * @route DELETE /api/coach/staff/:staffId
     * @access Private (Coach)
     */
    deleteStaffMember = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const coachId = req.coachId;
        
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
     * @route PUT /api/coach/staff/:staffId/permissions
     * @access Private (Coach)
     */
    updateStaffPermissions = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const { permissions } = req.body;
        const coachId = req.coachId;
        
        if (!Array.isArray(permissions)) {
            return res.status(400).json({
                success: false,
                message: 'Permissions must be an array'
            });
        }

        // Validate permissions
        const allValidPermissions = Object.values(PERMISSIONS).flatMap(group => Object.values(group));
        const invalidPermissions = permissions.filter(permission => !allValidPermissions.includes(permission));
        
        if (invalidPermissions.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid permissions: ${invalidPermissions.join(', ')}`
            });
        }

        const staff = await Staff.findOneAndUpdate(
            { _id: staffId, coachId },
            { permissions },
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
     * Assign permission group to staff
     * @route POST /api/coach/staff/:staffId/permission-group
     * @access Private (Coach)
     */
    assignPermissionGroup = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const { groupName } = req.body;
        const coachId = req.coachId;
        
        if (!PERMISSION_GROUPS[groupName]) {
            return res.status(400).json({
                success: false,
                message: `Permission group '${groupName}' not found`
            });
        }

        const permissions = PERMISSION_GROUPS[groupName];

        const staff = await Staff.findOneAndUpdate(
            { _id: staffId, coachId },
            { permissions },
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
            data: staff,
            message: `Permission group '${groupName}' assigned successfully`
        });
    });

    /**
     * Toggle staff active status
     * @route PUT /api/coach/staff/:staffId/toggle-status
     * @access Private (Coach)
     */
    toggleStaffStatus = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const coachId = req.coachId;
        
        const staff = await Staff.findOne({ _id: staffId, coachId });
        
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        staff.isActive = !staff.isActive;
        await staff.save();

        res.json({
            success: true,
            data: {
                staffId: staff._id,
                isActive: staff.isActive
            },
            message: `Staff member ${staff.isActive ? 'activated' : 'deactivated'} successfully`
        });
    });

    /**
     * Get staff member details
     * @route GET /api/coach/staff/:staffId
     * @access Private (Coach)
     */
    getStaffDetails = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const coachId = req.coachId;
        
        const staff = await Staff.findOne({ _id: staffId, coachId }).select('-password');
        
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
     * Get staff performance summary
     * @route GET /api/coach/staff/:staffId/performance
     * @access Private (Coach)
     */
    getStaffPerformance = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const coachId = req.coachId;
        
        const staff = await Staff.findOne({ _id: staffId, coachId });
        
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // This would integrate with your performance tracking system
        const performance = {
            staffId: staff._id,
            name: staff.name,
            email: staff.email,
            isActive: staff.isActive,
            permissions: staff.permissions,
            lastActive: staff.lastActive || 'Never',
            createdAt: staff.createdAt,
            // Add performance metrics here
            metrics: {
                tasksCompleted: 0,
                leadsGenerated: 0,
                performanceScore: 0
            }
        };

        res.json({
            success: true,
            data: performance
        });
    });

    /**
     * Bulk update staff permissions
     * @route PUT /api/coach/staff/bulk-permissions
     * @access Private (Coach)
     */
    bulkUpdatePermissions = asyncHandler(async (req, res) => {
        const { staffUpdates } = req.body;
        const coachId = req.coachId;
        
        if (!Array.isArray(staffUpdates)) {
            return res.status(400).json({
                success: false,
                message: 'staffUpdates must be an array'
            });
        }

        const results = [];
        
        for (const update of staffUpdates) {
            const { staffId, permissions } = update;
            
            if (!staffId || !Array.isArray(permissions)) {
                results.push({
                    staffId,
                    success: false,
                    message: 'Invalid staffId or permissions'
                });
                continue;
            }

            try {
                const staff = await Staff.findOneAndUpdate(
                    { _id: staffId, coachId },
                    { permissions },
                    { new: true, runValidators: true }
                ).select('-password');
                
                if (staff) {
                    results.push({
                        staffId,
                        success: true,
                        data: staff
                    });
                } else {
                    results.push({
                        staffId,
                        success: false,
                        message: 'Staff member not found'
                    });
                }
            } catch (error) {
                results.push({
                    staffId,
                    success: false,
                    message: error.message
                });
            }
        }

        res.json({
            success: true,
            data: results
        });
    });

    /**
     * Get all sections grouped by category (NEW SECTION-BASED SYSTEM)
     * @route GET /api/coach/staff/sections
     * @access Private (Coach/Staff with staff_management permission)
     */
    getSectionsList = asyncHandler(async (req, res) => {
        const coachId = req.coachId;
        const userContext = req.userContext;
        
        // Log staff action if applicable
        if (userContext && userContext.isStaff) {
            console.log(`[Staff Action] ${userContext.userId} accessed sections list for coach ${coachId}`);
        }

        // Get sections grouped by category
        const sectionsGrouped = getSectionsGroupedByCategory();
        
        // Get available presets
        const presets = {};
        const presetNames = getAvailablePresets();
        for (const presetName of presetNames) {
            presets[presetName] = PERMISSION_PRESETS[presetName];
        }

        res.json({
            success: true,
            data: {
                sections: sectionsGrouped,
                presets: presets,
                totalCategories: Object.keys(sectionsGrouped).length,
                totalSections: Object.keys(SECTIONS).length,
                userContext: {
                    isStaff: userContext ? userContext.isStaff : false,
                    sections: userContext ? userContext.sections : []
                }
            }
        });
    });

    /**
     * Update staff sections (NEW SECTION-BASED SYSTEM)
     * @route PUT /api/coach/staff/:staffId/sections
     * @access Private (Coach/Staff with staff_management permission)
     */
    updateStaffSections = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const { sections } = req.body;
        const coachId = req.coachId;

        // Validate sections array
        if (!Array.isArray(sections)) {
            return res.status(400).json({
                success: false,
                message: 'Sections must be an array'
            });
        }

        // Validate each section
        const { validateSections } = require('../utils/sectionPermissions');
        const validation = validateSections(sections);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.error,
                invalid: validation.invalid
            });
        }

        // Find staff member
        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // Verify staff belongs to this coach
        if (staff.coachId.toString() !== coachId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only manage your own staff members'
            });
        }

        // Always include dashboard and profile
        const finalSections = [...new Set([...sections, 'dashboard', 'profile'])];

        // Update staff sections
        staff.permissions = finalSections; // Reuse permissions field
        await staff.save();

        // Log action
        if (req.userContext && req.userContext.isStaff) {
            console.log(`[Staff Action] ${req.userContext.userId} updated sections for staff ${staffId}`);
        }

        res.json({
            success: true,
            message: 'Staff sections updated successfully',
            data: {
                staffId: staff._id,
                sections: staff.permissions,
                updatedAt: staff.updatedAt
            }
        });
    });

    /**
     * Assign section preset to staff (NEW SECTION-BASED SYSTEM)
     * @route POST /api/coach/staff/:staffId/section-preset
     * @access Private (Coach/Staff with staff_management permission)
     */
    assignSectionPreset = asyncHandler(async (req, res) => {
        const { staffId } = req.params;
        const { presetName } = req.body;
        const coachId = req.coachId;

        // Validate preset exists
        if (!PERMISSION_PRESETS[presetName]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid preset name',
                availablePresets: getAvailablePresets()
            });
        }

        // Find staff member
        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // Verify staff belongs to this coach
        if (staff.coachId.toString() !== coachId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only manage your own staff members'
            });
        }

        // Get preset sections
        const presetSections = PERMISSION_PRESETS[presetName];

        // Update staff sections
        staff.permissions = presetSections;
        await staff.save();

        // Log action
        if (req.userContext && req.userContext.isStaff) {
            console.log(`[Staff Action] ${req.userContext.userId} assigned preset "${presetName}" to staff ${staffId}`);
        }

        res.json({
            success: true,
            message: `Preset "${presetName}" assigned successfully`,
            data: {
                staffId: staff._id,
                presetName: presetName,
                sections: staff.permissions,
                updatedAt: staff.updatedAt
            }
        });
    });
}

module.exports = new CoachStaffManagementController();
