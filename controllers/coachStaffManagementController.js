const Staff = require('../schema/Staff');
const User = require('../schema/User');
const asyncHandler = require('../middleware/async');
const { PERMISSIONS, PERMISSION_GROUPS } = require('../utils/permissions');

/**
 * Coach Staff Management Controller
 * Allows coaches to manage their staff members and assign permissions
 */
class CoachStaffManagementController {

    /**
     * Get all staff members for a coach
     * @route GET /api/coach/staff
     * @access Private (Coach)
     */
    getStaffMembers = asyncHandler(async (req, res) => {
        const coachId = req.user.id;
        
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
        const coachId = req.user.id;
        
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
        const coachId = req.user.id;
        
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
        const coachId = req.user.id;
        
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
        const coachId = req.user.id;
        
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
        const coachId = req.user.id;
        
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
        const coachId = req.user.id;
        
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
        const coachId = req.user.id;
        
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
        const coachId = req.user.id;
        
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
        const coachId = req.user.id;
        
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
}

module.exports = new CoachStaffManagementController();
