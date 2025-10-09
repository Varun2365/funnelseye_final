// D:\PRJ_YCT_Final\controllers\coachAvailabilityController.js

// --- Imports ---
const CoachAvailability = require('../schema/CoachAvailability');
const Appointment = require('../schema/Appointment');
const { getAvailableSlots, bookAppointment: bookAppointmentService, rescheduleAppointment, cancelAppointment } = require('../services/calendarService'); // <-- NEW: Import from the new service
const CoachStaffService = require('../services/coachStaffService');

// Utility to wrap async functions for error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @desc    Get coach availability settings
 * @route   GET /api/coach/:coachId/availability
 * @access  Public
 */
const getCoachAvailability = asyncHandler(async (req, res) => {
  const { coachId } = req.params;
  
  // If this is an authenticated request, get user context
  let userContext = null;
  if (req.userId || req.coachId) {
    userContext = CoachStaffService.getUserContext(req);
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'read', 'calendar', 'availability', { coachId });
  }
  
  const availability = await CoachAvailability.findOne({ coachId : coachId });
  if (!availability) {
    return res.status(200).json({
      success: true,
      data: {
        timeZone: 'UTC',
        workingHours: [],
        unavailableSlots: [], // <-- CORRECTED: Changed 'unavailableDates' to 'unavailableSlots'
        slotDuration: 30,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: availability,
  });
});

/**
 * @desc    Set or update the authenticated coach's availability
 * @route   POST /api/coach/availability
 * @access  Private (Coach/Staff with permission)
 */
const setCoachAvailability = asyncHandler(async (req, res) => {
    // Get coach ID using unified service (handles both coach and staff)
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Log staff action if applicable
    CoachStaffService.logStaffAction(req, 'manage', 'calendar', 'set_availability', { coachId });
    
    // Check if the user is authenticated
    if (!coachId) {
        console.error('Authentication Error: coachId not found');
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Please log in.'
        });
    }

    // FIX: Use 'defaultAppointmentDuration' to match the schema field name
    const { timeZone, workingHours, unavailableSlots, defaultAppointmentDuration, bufferTime } = req.body;

    if (!workingHours || !Array.isArray(workingHours)) {
        return res.status(400).json({
            success: false,
            message: 'Working hours are required and must be an array.',
        });
    }

    try {
        const availability = await CoachAvailability.findOneAndUpdate(
            { coachId: _id },
            {
                timeZone,
                workingHours,
                unavailableSlots,
                defaultAppointmentDuration, // <-- This is now correct
                bufferTime,
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: availability,
        });
    } catch (error) {
        console.error('Error saving availability settings:', error.message);
        res.status(500).json({
            success: false,
            message: 'An error occurred while saving availability settings.',
            error: error.message
        });
    }
});
/**
 * @desc    Get available booking slots for a coach on a specific day
 * @route   GET /api/coach/:coachId/available-slots?date=YYYY-MM-DD
 * @access  Public
 */
const getAvailableSlotsController = asyncHandler(async (req, res) => {
  const { coachId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Date is required to find available slots.',
    });
  }
  
  // <-- CHANGED: Now calls the service function
  const availableSlots = await getAvailableSlots(coachId, date);

  res.status(200).json({
    success: true,
    date,
    slots: availableSlots,
  });
});

/**
 * @desc    Book an appointment with a coach
 * @route   POST /api/coach/:coachId/book
 * @access  Public
 */
const bookAppointmentController = asyncHandler(async (req, res) => {
  const { coachId } = req.params;
  const { leadId, startTime, duration, notes, timeZone } = req.body;

  // <-- CHANGED: Now calls the service function for booking logic
  const newAppointment = await bookAppointmentService(coachId, leadId, startTime, duration, notes, timeZone);

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully.',
    appointmentDetails: newAppointment,
  });
});

/**
 * @desc    Reschedule an existing appointment (protected)
 * @route   PUT /api/coach/appointments/:id/reschedule
 * @access  Private (Coach/Admin/Staff)
 */
const rescheduleAppointmentController = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id;
  const { newStartTime, newDuration } = req.body;

  if (!newStartTime) {
    return res.status(400).json({ success: false, message: 'newStartTime is required.' });
  }

  const updated = await rescheduleAppointment(appointmentId, req.coachId, newStartTime, newDuration);

  res.status(200).json({
    success: true,
    message: 'Appointment rescheduled successfully.',
    appointmentDetails: updated,
  });
});

/**
 * @desc    Cancel an appointment (protected)
 * @route   DELETE /api/coach/appointments/:id
 * @access  Private (Coach/Admin/Staff)
 */
const cancelAppointmentController = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id;
  await cancelAppointment(appointmentId, req.coachId);
  res.status(200).json({ success: true, message: 'Appointment cancelled.' });
});

/**
 * @desc    Get a full calendar view for a coach, including available and booked slots
 * @route   GET /api/coach/:coachId/calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * @access  Public
 */
const getCoachCalendar = asyncHandler(async (req, res) => {
  const { coachId } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Both startDate and endDate are required to view the calendar.',
    });
  }
  
  const calendar = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dateString = currentDate.toISOString().split('T')[0];

    // <-- CHANGED: Now calls the service function to get slots for the day
    const availableSlots = await getAvailableSlots(coachId, dateString);

    // Get all existing appointments for the day from the database
    // This part can also be moved into the service later if we need to centralize it.
    const existingAppointments = await Appointment.find({
      coachId: coachId,
      startTime: {
        $gte: new Date(dateString),
        $lt: new Date(new Date(dateString).getTime() + 86400000),
      },
    });
    
    const daySchedule = {
      date: dateString,
      appointments: existingAppointments,
      availableSlots: availableSlots,
    };

    calendar.push(daySchedule);

    currentDate.setDate(currentDate.getDate() + 1);
  }

    res.status(200).json({
    success: true,
    data: calendar,
  });
});

/**
 * @desc    Get appointment details including Zoom meeting information
 * @route   GET /api/coach/appointments/:id
 * @access  Private (Coach/Admin/Staff)
 */
const getAppointmentDetails = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id;
  const appointment = await Appointment.findById(appointmentId)
    .populate('leadId', 'name email phone')
    .populate('coachId', 'name email');
  
  if (!appointment) {
    return res.status(404).json({ 
      success: false, 
      message: 'Appointment not found.' 
    });
  }

  res.status(200).json({
    success: true,
    data: appointment
  });
});

module.exports = {
  getCoachAvailability,
  setCoachAvailability,
  getAvailableSlots: getAvailableSlotsController, // <-- CHANGED: Export the new controller function
  bookAppointment: bookAppointmentController, // <-- CHANGED: Export the new controller function
  getCoachCalendar,
  getAppointmentDetails,
  rescheduleAppointment: rescheduleAppointmentController,
  cancelAppointment: cancelAppointmentController,
};