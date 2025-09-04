const express = require('express');
const router = express.Router();
const { protect, authorizeStaff } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const { populateStaffPermissions } = require('../middleware/permissionMiddleware');
const {
    getStaffTasks,
    getStaffTask,
    updateTaskStatus,
    completeTask,
    startTask,
    pauseTask,
    addTaskComment,
    logTaskTime,
    getMyTasks,
    getOverdueTasks,
    getUpcomingTasks,
    bulkUpdateTasks
} = require('../controllers/staffTaskController');

// All staff task routes are protected
router.use(protect, updateLastActive, populateStaffPermissions);

// ===== TASK LISTING & OVERVIEW =====

// Get all tasks assigned to staff member
router.get('/', authorizeStaff('staff'), getStaffTasks);

// Get staff's personal task overview
router.get('/my-tasks', authorizeStaff('staff'), getMyTasks);

// Get overdue tasks
router.get('/overdue', authorizeStaff('staff'), getOverdueTasks);

// Get upcoming tasks
router.get('/upcoming', authorizeStaff('staff'), getUpcomingTasks);

// ===== INDIVIDUAL TASK MANAGEMENT =====

// Get specific task details
router.get('/:id', authorizeStaff('staff'), getStaffTask);

// Update task status
router.put('/:id/status', authorizeStaff('staff'), updateTaskStatus);

// Mark task as complete
router.post('/:id/complete', authorizeStaff('staff'), completeTask);

// Start working on task
router.post('/:id/start', authorizeStaff('staff'), startTask);

// Pause working on task
router.post('/:id/pause', authorizeStaff('staff'), pauseTask);

// Add comment to task
router.post('/:id/comments', authorizeStaff('staff'), addTaskComment);

// Log time to task
router.post('/:id/time-log', authorizeStaff('staff'), logTaskTime);

// ===== BULK OPERATIONS =====

// Bulk update tasks
router.put('/bulk-update', authorizeStaff('staff'), bulkUpdateTasks);

module.exports = router;
