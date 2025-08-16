// D:\PRJ_YCT_Final\routes\workflowRoutes.js

const express = require('express');
const router = express.Router();
const {
    createTask,
    getKanbanBoard,
    moveTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    addComment,
    logTime,
    addSubtask,
    getTaskAnalytics,
    autoAssignTasks,
    getUpcomingTasks,
    bulkUpdateTaskStatus,
    generateSOP,
    getOverdueTasks,
    getTasksByStage,
    createTaskFromLead,
    getTaskDependencies,
    addTaskDependency,
    removeTaskDependency
} = require('../controllers/workflowTaskController');

// Protect all routes
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Kanban Board
router.get('/kanban-board', getKanbanBoard);

// Task Management
router.route('/tasks')
    .get(getTasks)
    .post(createTask);

router.route('/tasks/:id')
    .get(getTask)
    .put(updateTask)
    .delete(deleteTask);

// Task Movement (Kanban)
router.put('/tasks/:taskId/move', moveTask);

// Task Comments
router.post('/tasks/:id/comments', addComment);

// Time Logging
router.post('/tasks/:id/time-log', logTime);

// Subtasks
router.post('/tasks/:id/subtasks', addSubtask);

// Task Dependencies
router.get('/tasks/:id/dependencies', getTaskDependencies);
router.post('/tasks/:id/dependencies', addTaskDependency);
router.delete('/tasks/:id/dependencies/:dependencyId', removeTaskDependency);

// Analytics
router.get('/analytics', getTaskAnalytics);

// Auto Assignment
router.post('/auto-assign', autoAssignTasks);

// Upcoming Tasks
router.get('/upcoming-tasks', getUpcomingTasks);

// Bulk Operations
router.put('/bulk-update-status', bulkUpdateTaskStatus);

// SOP Generation
router.post('/generate-sop', generateSOP);

// Task Filtering
router.get('/overdue-tasks', getOverdueTasks);
router.get('/tasks/stage/:stage', getTasksByStage);

// Lead Integration
router.post('/tasks/from-lead/:leadId', createTaskFromLead);

module.exports = router;
