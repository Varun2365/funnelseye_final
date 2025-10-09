// D:\PRJ_YCT_Final\routes\dailyPriorityFeedRoutes.js

const express = require('express');
const { getDailyPriorityFeed } = require('../controllers/dailyPriorityFeedController');
const { 
    getCoachAvailability, 
    setCoachAvailability, 
    getAvailableSlots, 
    bookAppointment, 
    getCoachCalendar,
    getAppointmentDetails,
    rescheduleAppointment,
    cancelAppointment
} = require('../controllers/coachAvailabilityController');
const { 
    initiateBookingRecovery, 
    cancelBookingRecovery 
} = require('../controllers/bookingRecoveryController'); // <-- NEW: Import booking recovery controller
const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

const router = express.Router();

// Apply unified authentication and resource filtering to all routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('dashboard'));

// --- Main Coach & Feed Routes ---
router.get('/daily-feed', requirePermission('dashboard:read'), getDailyPriorityFeed);

// --- Coach Availability & Calendar Routes ---
router.get('/:coachId/availability', requirePermission('calendar:read'), getCoachAvailability);
router.post('/availability', requirePermission('calendar:manage'), setCoachAvailability);
router.get('/:coachId/available-slots', requirePermission('calendar:read'), getAvailableSlots);
router.post('/:coachId/book', requirePermission('calendar:book'), bookAppointment);
router.get('/:coachId/calendar', requirePermission('calendar:read'), getCoachCalendar);
// Appointment management endpoints (protected)
router.get('/appointments/:id', requirePermission('calendar:read'), getAppointmentDetails);
router.put('/appointments/:id/reschedule', requirePermission('calendar:update'), rescheduleAppointment);
router.delete('/appointments/:id', requirePermission('calendar:delete'), cancelAppointment);

// --- NEW: Booking Recovery Routes ---
// @desc    Initiate a booking recovery session when a user visits the booking page
// @route   POST /api/coach/booking-recovery/initiate
// @access  Public
router.post('/booking-recovery/initiate', initiateBookingRecovery);

// @desc    Cancel the recovery session upon successful booking
// @route   POST /api/coach/booking-recovery/cancel
// @access  Public
router.post('/booking-recovery/cancel', cancelBookingRecovery);

module.exports = router;