const Task = require('../schema/Task');
const Lead = require('../schema/Lead');
const { hasPermission } = require('../utils/permissions');

/**
 * Staff Task Controller
 * Handles staff task management and completion
 */

// Helper function to ensure staff can only access their own tasks
function ensureTaskAccess(req, taskDoc) {
    if (req.role === 'admin' || req.role === 'super_admin') return true;
    
    if (req.role === 'coach') {
        // Coach can access tasks they created
        if (String(taskDoc.coachId) === String(req.coachId)) return true;
    }
    
    if (req.role === 'staff') {
        // Staff can only access tasks assigned to them
        if (String(taskDoc.assignedTo) === String(req.userId)) return true;
    }
    
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
}

// GET /api/staff-tasks
// Get all tasks assigned to the authenticated staff member
exports.getStaffTasks = async (req, res) => {
    try {
        const { status, priority, stage, page = 1, limit = 20 } = req.query;
        const staffId = req.userId;

        // Build query for staff's tasks
        const query = { assignedTo: staffId };
        
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (stage) query.stage = stage;

        const skip = (page - 1) * limit;
        const tasks = await Task.find(query)
            .populate('relatedLead', 'name email phone status')
            .populate('coachId', 'name email')
            .sort({ dueDate: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Task.countDocuments(query);

        // Get summary statistics
        const [totalTasks, pendingTasks, inProgressTasks, completedTasks, overdueTasks] = await Promise.all([
            Task.countDocuments({ assignedTo: staffId }),
            Task.countDocuments({ assignedTo: staffId, status: 'Pending' }),
            Task.countDocuments({ assignedTo: staffId, status: 'In Progress' }),
            Task.countDocuments({ assignedTo: staffId, status: 'Completed' }),
            Task.countDocuments({ 
                assignedTo: staffId, 
                dueDate: { $lt: new Date() },
                status: { $nin: ['Completed', 'Cancelled'] }
            })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                tasks,
                summary: {
                    total: totalTasks,
                    pending: pendingTasks,
                    inProgress: inProgressTasks,
                    completed: completedTasks,
                    overdue: overdueTasks
                }
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (err) {
        console.error('getStaffTasks error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// GET /api/staff-tasks/:id
// Get specific task details
exports.getStaffTask = async (req, res) => {
    try {
        const { id } = req.params;
        const staffId = req.userId;

        const task = await Task.findOne({ _id: id, assignedTo: staffId })
            .populate('relatedLead', 'name email phone status')
            .populate('coachId', 'name email')
            .populate('dependencies', 'name status dueDate');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: task
        });

    } catch (err) {
        console.error('getStaffTask error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// PUT /api/staff-tasks/:id/status
// Update task status
exports.updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const staffId = req.userId;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const task = await Task.findOne({ _id: id, assignedTo: staffId });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Validate status transition
        const validTransitions = {
            'Pending': ['In Progress', 'Cancelled'],
            'In Progress': ['Completed', 'Paused', 'Overdue'],
            'Paused': ['In Progress', 'Cancelled'],
            'Overdue': ['In Progress', 'Completed', 'Cancelled']
        };

        if (!validTransitions[task.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from ${task.status} to ${status}`
            });
        }

        // Update task
        task.status = status;
        task.updatedAt = new Date();

        // Set completion time if completing
        if (status === 'Completed' && !task.completedAt) {
            task.completedAt = new Date();
        }

        // Add comment if notes provided
        if (notes) {
            task.comments.push({
                user: staffId,
                content: notes,
                createdAt: new Date()
            });
        }

        await task.save();

        const populatedTask = await Task.findById(id)
            .populate('relatedLead', 'name email phone status')
            .populate('coachId', 'name email');

        return res.status(200).json({
            success: true,
            message: 'Task status updated successfully',
            data: populatedTask
        });

    } catch (err) {
        console.error('updateTaskStatus error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// POST /api/staff-tasks/:id/complete
// Mark task as complete with detailed completion data
exports.completeTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            completionNotes, 
            actualHours, 
            outcome, 
            qualityRating, 
            feedback 
        } = req.body;
        const staffId = req.userId;

        const task = await Task.findOne({ _id: id, assignedTo: staffId });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        if (task.status === 'Completed') {
            return res.status(400).json({
                success: false,
                message: 'Task is already completed'
            });
        }

        // Update task completion
        task.status = 'Completed';
        task.completedAt = new Date();
        task.updatedAt = new Date();

        // Add completion data
        if (actualHours !== undefined) task.actualHours = actualHours;
        if (completionNotes) {
            task.comments.push({
                user: staffId,
                content: `COMPLETION: ${completionNotes}`,
                createdAt: new Date()
            });
        }

        // Add staff-specific fields
        if (outcome) task.outcome = outcome;
        if (qualityRating) task.qualityRating = qualityRating;
        if (feedback) task.feedback = feedback;

        // Calculate efficiency
        if (actualHours && task.estimatedHours) {
            task.efficiency = (task.estimatedHours / actualHours) * 100;
        }

        await task.save();

        // Calculate performance metrics
        const performance = {
            onTime: task.completedAt <= task.dueDate,
            efficiency: task.efficiency || 0,
            quality: qualityRating || 0
        };

        const populatedTask = await Task.findById(id)
            .populate('relatedLead', 'name email phone status')
            .populate('coachId', 'name email');

        return res.status(200).json({
            success: true,
            message: 'Task completed successfully',
            data: {
                ...populatedTask.toObject(),
                performance
            }
        });

    } catch (err) {
        console.error('completeTask error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// POST /api/staff-tasks/:id/start
// Start working on a task
exports.startTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;
        const staffId = req.userId;

        const task = await Task.findOne({ _id: id, assignedTo: staffId });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        if (task.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Task is not in pending status'
            });
        }

        // Update task status
        task.status = 'In Progress';
        task.startedAt = new Date();
        task.updatedAt = new Date();

        // Add time log entry
        task.timeLogs.push({
            user: staffId,
            startTime: new Date(),
            endTime: null,
            duration: 0,
            description: notes || 'Started working on task'
        });

        // Add comment if notes provided
        if (notes) {
            task.comments.push({
                user: staffId,
                content: `STARTED: ${notes}`,
                createdAt: new Date()
            });
        }

        await task.save();

        const populatedTask = await Task.findById(id)
            .populate('relatedLead', 'name email phone status')
            .populate('coachId', 'name email');

        return res.status(200).json({
            success: true,
            message: 'Task started successfully',
            data: populatedTask
        });

    } catch (err) {
        console.error('startTask error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// POST /api/staff-tasks/:id/pause
// Pause working on a task
exports.pauseTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;
        const staffId = req.userId;

        const task = await Task.findOne({ _id: id, assignedTo: staffId });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        if (task.status !== 'In Progress') {
            return res.status(400).json({
                success: false,
                message: 'Task is not in progress'
            });
        }

        // Update task status
        task.status = 'Paused';
        task.pausedAt = new Date();
        task.updatedAt = new Date();

        // Update time log
        const activeTimeLog = task.timeLogs.find(log => 
            log.user.toString() === staffId && !log.endTime
        );

        if (activeTimeLog) {
            activeTimeLog.endTime = new Date();
            activeTimeLog.duration = (activeTimeLog.endTime - activeTimeLog.startTime) / (1000 * 60); // in minutes
        }

        // Add comment if notes provided
        if (notes) {
            task.comments.push({
                user: staffId,
                content: `PAUSED: ${notes}`,
                createdAt: new Date()
            });
        }

        await task.save();

        const populatedTask = await Task.findById(id)
            .populate('relatedLead', 'name email phone status')
            .populate('coachId', 'name email');

        return res.status(200).json({
            success: true,
            message: 'Task paused successfully',
            data: populatedTask
        });

    } catch (err) {
        console.error('pauseTask error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// POST /api/staff-tasks/:id/comments
// Add comment to task
exports.addTaskComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const staffId = req.userId;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const task = await Task.findOne({ _id: id, assignedTo: staffId });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Add comment
        task.comments.push({
            user: staffId,
            content,
            createdAt: new Date()
        });

        await task.save();

        const populatedTask = await Task.findById(id)
            .populate('relatedLead', 'name email phone status')
            .populate('coachId', 'name email');

        return res.status(200).json({
            success: true,
            message: 'Comment added successfully',
            data: populatedTask
        });

    } catch (err) {
        console.error('addTaskComment error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// POST /api/staff-tasks/:id/time-log
// Log time to task
exports.logTaskTime = async (req, res) => {
    try {
        const { id } = req.params;
        const { startTime, endTime, description } = req.body;
        const staffId = req.userId;

        if (!startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'startTime and endTime are required'
            });
        }

        const task = await Task.findOne({ _id: id, assignedTo: staffId });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Add time log
        const duration = (new Date(endTime) - new Date(startTime)) / (1000 * 60); // in minutes
        task.timeLogs.push({
            user: staffId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            duration,
            description: description || 'Time logged'
        });

        // Update actual hours
        task.actualHours = task.timeLogs.reduce((total, log) => total + (log.duration / 60), 0);

        await task.save();

        const populatedTask = await Task.findById(id)
            .populate('relatedLead', 'name email phone status')
            .populate('coachId', 'name email');

        return res.status(200).json({
            success: true,
            message: 'Time logged successfully',
            data: populatedTask
        });

    } catch (err) {
        console.error('logTaskTime error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// GET /api/staff-tasks/my-tasks
// Get staff's personal task overview
exports.getMyTasks = async (req, res) => {
    try {
        const staffId = req.userId;
        const { timeRange = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        const [tasks, leads] = await Promise.all([
            Task.find({ 
                assignedTo: staffId, 
                createdAt: { $gte: startDate } 
            }).sort({ dueDate: 1 }),
            Lead.find({ 
                assignedTo: staffId, 
                createdAt: { $gte: startDate } 
            }).sort({ createdAt: -1 })
        ]);

        const taskStats = {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'Pending').length,
            inProgress: tasks.filter(t => t.status === 'In Progress').length,
            completed: tasks.filter(t => t.status === 'Completed').length,
            overdue: tasks.filter(t => 
                t.dueDate < new Date() && t.status !== 'Completed'
            ).length
        };

        const recentTasks = tasks
            .filter(t => t.status !== 'Completed')
            .slice(0, 5);

        const upcomingTasks = tasks
            .filter(t => t.dueDate > new Date() && t.status !== 'Completed')
            .slice(0, 5);

        return res.status(200).json({
            success: true,
            data: {
                taskStats,
                recentTasks,
                upcomingTasks,
                totalLeads: leads.length,
                timeRange: parseInt(timeRange)
            }
        });

    } catch (err) {
        console.error('getMyTasks error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// GET /api/staff-tasks/overdue
// Get staff's overdue tasks
exports.getOverdueTasks = async (req, res) => {
    try {
        const staffId = req.userId;
        const { page = 1, limit = 20 } = req.query;

        const query = {
            assignedTo: staffId,
            dueDate: { $lt: new Date() },
            status: { $nin: ['Completed', 'Cancelled'] }
        };

        const skip = (page - 1) * limit;
        const tasks = await Task.find(query)
            .populate('relatedLead', 'name email phone status')
            .populate('coachId', 'name email')
            .sort({ dueDate: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Task.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: tasks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (err) {
        console.error('getOverdueTasks error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// GET /api/staff-tasks/upcoming
// Get staff's upcoming tasks
exports.getUpcomingTasks = async (req, res) => {
    try {
        const staffId = req.userId;
        const { days = 7, page = 1, limit = 20 } = req.query;

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(days));

        const query = {
            assignedTo: staffId,
            dueDate: { $gte: new Date(), $lte: endDate },
            status: { $nin: ['Completed', 'Cancelled'] }
        };

        const skip = (page - 1) * limit;
        const tasks = await Task.find(query)
            .populate('relatedLead', 'name email phone status')
            .populate('coachId', 'name email')
            .sort({ dueDate: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Task.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                tasks,
                dateRange: {
                    start: new Date(),
                    end: endDate,
                    days: parseInt(days)
                }
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (err) {
        console.error('getUpcomingTasks error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// PUT /api/staff-tasks/bulk-update
// Bulk update multiple tasks
exports.bulkUpdateTasks = async (req, res) => {
    try {
        const { taskIds, updates } = req.body;
        const staffId = req.userId;

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'taskIds array is required'
            });
        }

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Updates object is required'
            });
        }

        // Validate that all tasks belong to the staff member
        const tasks = await Task.find({
            _id: { $in: taskIds },
            assignedTo: staffId
        });

        if (tasks.length !== taskIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Some tasks not found or access denied'
            });
        }

        // Update tasks
        const result = await Task.updateMany(
            { _id: { $in: taskIds }, assignedTo: staffId },
            { 
                $set: { 
                    ...updates, 
                    updatedAt: new Date() 
                } 
            }
        );

        return res.status(200).json({
            success: true,
            message: `Updated ${result.modifiedCount} tasks successfully`,
            data: {
                modifiedCount: result.modifiedCount,
                totalRequested: taskIds.length
            }
        });

    } catch (err) {
        console.error('bulkUpdateTasks error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
