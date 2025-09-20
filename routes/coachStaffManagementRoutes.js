const express = require('express');
const router = express.Router();
const coachStaffManagementController = require('../controllers/coachStaffManagementController');
const { protect, authorizeCoach } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Authorize only coaches
router.use(authorizeCoach('coach'));

// ===== STAFF MANAGEMENT ENDPOINTS =====

// Get all staff members
router.get('/', coachStaffManagementController.getStaffMembers);

// Create new staff member
router.post('/', coachStaffManagementController.createStaffMember);

// Get staff member details
router.get('/:staffId', coachStaffManagementController.getStaffDetails);

// Update staff member
router.put('/:staffId', coachStaffManagementController.updateStaffMember);

// Delete staff member
router.delete('/:staffId', coachStaffManagementController.deleteStaffMember);

// ===== PERMISSION MANAGEMENT ENDPOINTS =====

// Update staff permissions
router.put('/:staffId/permissions', coachStaffManagementController.updateStaffPermissions);

// Assign permission group to staff
router.post('/:staffId/permission-group', coachStaffManagementController.assignPermissionGroup);

// Toggle staff active status
router.put('/:staffId/toggle-status', coachStaffManagementController.toggleStaffStatus);

// Get staff performance
router.get('/:staffId/performance', coachStaffManagementController.getStaffPerformance);

// ===== BULK OPERATIONS =====

// Bulk update staff permissions
router.put('/bulk-permissions', coachStaffManagementController.bulkUpdatePermissions);

module.exports = router;
