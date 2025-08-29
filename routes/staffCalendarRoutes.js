const express = require('express');
const router = express.Router();
const { protect, authorizeCoach } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const { populateStaffPermissions } = require('../middleware/permissionMiddleware');
const { 
    createCalendarEvent,
    getCalendarEvents,
    getCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    getStaffAvailability,
    bulkCreateEvents
} = require('../controllers/staffCalendarController');

// All calendar routes are protected
router.use(protect, updateLastActive, populateStaffPermissions);

// Calendar event management
router.post('/', createCalendarEvent);
router.get('/', getCalendarEvents);
router.get('/:id', getCalendarEvent);
router.put('/:id', updateCalendarEvent);
router.delete('/:id', deleteCalendarEvent);

// Staff availability
router.get('/staff/:staffId/availability', getStaffAvailability);

// Bulk operations
router.post('/bulk-create', bulkCreateEvents);

module.exports = router;
