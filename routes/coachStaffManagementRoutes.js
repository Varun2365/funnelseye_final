const express = require('express');
const router = express.Router();
const coachStaffManagementController = require('../controllers/coachStaffManagementController');
const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');

const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication and resource filtering to all routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('staff'));

// ===== STAFF MANAGEMENT ENDPOINTS =====

// Get all permissions grouped by category (for frontend permission management)
router.get('/permissions', requirePermission('staff:read'), coachStaffManagementController.getPermissionsList);

// Get all staff members
router.get('/', requirePermission('staff:read'), coachStaffManagementController.getStaffMembers);

// Create new staff member
router.post('/', requirePermission('staff:write'), coachStaffManagementController.createStaffMember);

// Get staff member details
router.get('/:staffId', requirePermission('staff:read'), coachStaffManagementController.getStaffDetails);

// Update staff member
router.put('/:staffId', requirePermission('staff:update'), coachStaffManagementController.updateStaffMember);

// Delete staff member
router.delete('/:staffId', requirePermission('staff:delete'), coachStaffManagementController.deleteStaffMember);

// ===== PERMISSION MANAGEMENT ENDPOINTS =====

// Update staff permissions
router.put('/:staffId/permissions', requirePermission('staff:manage'), coachStaffManagementController.updateStaffPermissions);

// Assign permission group to staff
router.post('/:staffId/permission-group', requirePermission('staff:manage'), coachStaffManagementController.assignPermissionGroup);

// Toggle staff active status
router.put('/:staffId/toggle-status', requirePermission('staff:manage'), coachStaffManagementController.toggleStaffStatus);

// Get staff performance
router.get('/:staffId/performance', requirePermission('staff:read'), coachStaffManagementController.getStaffPerformance);

// ===== BULK OPERATIONS =====

// Bulk update staff permissions
router.put('/bulk-permissions', coachStaffManagementController.bulkUpdatePermissions);

module.exports = router;
