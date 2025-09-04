const express = require('express');
const router = express.Router();
const { protect, authorizeCoach } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const { populateStaffPermissions } = require('../middleware/permissionMiddleware');
const { 
    assignAppointmentToStaff,
    getStaffAppointments,
    getAvailableStaff,
    unassignAppointment,
    getStaffCalendar,
    bulkAssignAppointments
} = require('../controllers/staffAppointmentController');

// All staff appointment routes are protected
router.use(protect, updateLastActive, populateStaffPermissions);

// ===== APPOINTMENT ASSIGNMENT =====

// Assign appointment to staff member
router.post('/assign', authorizeCoach('coach','admin','super_admin'), assignAppointmentToStaff);

// Get available staff for assignment
router.get('/available-staff', authorizeCoach('coach','admin','super_admin'), getAvailableStaff);

// Bulk assign appointments
router.post('/bulk-assign', authorizeCoach('coach','admin','super_admin'), bulkAssignAppointments);

// ===== STAFF APPOINTMENT MANAGEMENT =====

// Get appointments for specific staff member
router.get('/staff/:staffId', getStaffAppointments);

// Get staff calendar view
router.get('/staff/:staffId/calendar', getStaffCalendar);

// ===== APPOINTMENT UNASSIGNMENT =====

// Unassign appointment from staff
router.put('/:appointmentId/unassign', authorizeCoach('coach','admin','super_admin'), unassignAppointment);

module.exports = router;
