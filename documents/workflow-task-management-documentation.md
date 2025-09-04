# Workflow & Task Management System Documentation

## Overview

The Workflow & Task Management System is a comprehensive platform that combines task management, staff administration, performance tracking, and automated workflow orchestration. The system provides coaches with powerful tools to manage their team, track performance, and automate business processes through intelligent task assignment and workflow management.

## Current Status

### ✅ **FULLY IMPLEMENTED**

#### Workflow Management
1. **Complete Task Management** with Kanban board interface
2. **Intelligent Task Assignment** based on workload and skills
3. **Workflow Stages** (Lead Generation → Qualification → Proposal → Closing → Onboarding)
4. **Task Dependencies** and subtask management
5. **Time Tracking** and logging capabilities
6. **Automated SOP Generation** using AI
7. **Bulk Operations** for task management
8. **Analytics & Reporting** for workflow optimization

#### Staff Management
1. **Complete Staff CRUD Operations** with role-based permissions
2. **Performance Tracking** with comprehensive metrics
3. **Staff Calendar Management** with availability tracking
4. **Staff Dashboard** with real-time insights
5. **Leaderboard System** for gamification
6. **Bulk Staff Actions** for efficient management
7. **Permission System** with granular controls
8. **Performance Analytics** and trend analysis

### ✅ **FULLY IMPLEMENTED**

#### Staff Task Completion
1. **Task Assignment** - ✅ Staff can be assigned tasks
2. **Task Viewing** - ✅ Staff can view their assigned tasks
3. **Task Status Updates** - ✅ Staff can update task status with validation
4. **Task Completion** - ✅ Dedicated staff completion endpoints with performance tracking
5. **Task Comments** - ✅ Staff can add comments to tasks
6. **Time Logging** - ✅ Staff can log time to tasks
7. **Task Start/Pause/Resume** - ✅ Staff can start, pause, and resume tasks
8. **Performance Metrics** - ✅ Efficiency, quality, and completion tracking
9. **Bulk Operations** - ✅ Staff can bulk update multiple tasks
10. **Personal Task Overview** - ✅ Staff can view their task statistics and upcoming tasks

## Complete Endpoint List

### 🔄 **Workflow Management Endpoints** (`/api/workflow`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/kanban-board` | Get Kanban board data | Coach/Admin |
| `POST` | `/tasks` | Create new task with intelligent assignment | Coach/Admin |
| `GET` | `/tasks` | Get all tasks with filtering | Coach/Admin |
| `GET` | `/tasks/:id` | Get single task details | Coach/Admin |
| `PUT` | `/tasks/:id` | Update task | Coach/Admin |
| `DELETE` | `/tasks/:id` | Delete task | Coach/Admin |
| `PUT` | `/tasks/:taskId/move` | Move task between stages (Kanban) | Coach/Admin |
| `POST` | `/tasks/:id/comments` | Add comment to task | Coach/Admin |
| `POST` | `/tasks/:id/time-log` | Log time to task | Coach/Admin |
| `POST` | `/tasks/:id/subtasks` | Add subtask | Coach/Admin |
| `GET` | `/tasks/:id/dependencies` | Get task dependencies | Coach/Admin |
| `POST` | `/tasks/:id/dependencies` | Add task dependency | Coach/Admin |
| `DELETE` | `/tasks/:id/dependencies/:dependencyId` | Remove task dependency | Coach/Admin |
| `GET` | `/analytics` | Get task analytics | Coach/Admin |
| `POST` | `/auto-assign` | Auto-assign unassigned tasks | Coach/Admin |
| `GET` | `/upcoming-tasks` | Get upcoming tasks | Coach/Admin |
| `PUT` | `/bulk-update-status` | Bulk update task status | Coach/Admin |
| `POST` | `/generate-sop` | Generate SOP for task type | Coach/Admin |
| `GET` | `/overdue-tasks` | Get overdue tasks | Coach/Admin |
| `GET` | `/tasks/stage/:stage` | Get tasks by stage | Coach/Admin |
| `POST` | `/tasks/from-lead/:leadId` | Create task from lead | Coach/Admin |

### 📋 **Staff Task Management Endpoints** (`/api/staff-tasks`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/` | Get staff's assigned tasks | Staff |
| `GET` | `/:id` | Get specific task details | Staff |
| `PUT` | `/:id/status` | Update task status | Staff |
| `POST` | `/:id/complete` | Mark task as complete | Staff |
| `POST` | `/:id/start` | Start working on task | Staff |
| `POST` | `/:id/pause` | Pause task work | Staff |
| `POST` | `/:id/comments` | Add comment to task | Staff |
| `POST` | `/:id/time-log` | Log time to task | Staff |
| `GET` | `/my-tasks` | Get staff's personal task overview | Staff |
| `GET` | `/overdue` | Get staff's overdue tasks | Staff |
| `GET` | `/upcoming` | Get staff's upcoming tasks | Staff |
| `PUT` | `/bulk-update` | Bulk update multiple tasks | Staff |

## Data Models

### Task Schema

```javascript
{
    name: String,                    // Required
    description: String,            // Optional
    status: String,                 // Pending, In Progress, Completed, Overdue, Cancelled
    priority: String,               // LOW, MEDIUM, HIGH, URGENT
    stage: String,                  // Workflow stage enum
    dueDate: Date,                  // Required
    assignedTo: ObjectId,           // Reference to Staff/Coach
    relatedLead: ObjectId,          // Reference to Lead
    coachId: ObjectId,              // Reference to Coach
    estimatedHours: Number,         // Default: 1
    actualHours: Number,            // Default: 0
    tags: [String],                 // Custom tags
    attachments: [{                 // File attachments
        filename: String,
        url: String,
        uploadedAt: Date
    }],
    comments: [{                    // Task comments
        user: ObjectId,
        content: String,
        createdAt: Date
    }],
    dependencies: [ObjectId],        // Task dependencies
    subtasks: [{                    // Subtasks
        name: String,
        description: String,
        completed: Boolean,
        dueDate: Date
    }],
    timeLogs: [{                    // Time tracking
        user: ObjectId,
        startTime: Date,
        endTime: Date,
        duration: Number,
        description: String
    }],
    reminders: [{                   // Reminders
        time: Date,
        type: String,               // email, push
        sent: Boolean
    }],
    automationRules: [{             // Automation triggers
        trigger: String,
        action: String,
        config: Mixed
    }],
    completedAt: Date,              // When task was completed
    startedAt: Date,                // When work started
    pausedAt: Date,                 // When work was paused
    totalPauseTime: Number          // Total pause time in minutes
}
```

## Staff Task Completion Workflow

### 1. Task Assignment Process

```javascript
// Coach assigns task to staff
POST /api/workflow/tasks
{
    "name": "Follow up with lead",
    "description": "Call the lead to discuss their needs",
    "dueDate": "2024-01-20T10:00:00.000Z",
    "assignedTo": "staff_id_123",
    "relatedLead": "lead_id_456",
    "priority": "HIGH",
    "stage": "LEAD_QUALIFICATION",
    "estimatedHours": 1
}
```

### 2. Staff Task Management

#### Get Assigned Tasks
```bash
GET /api/staff-tasks/
Authorization: Bearer <staff_token>
```

**Response:**
```json
{
    "success": true,
    "data": {
        "tasks": [
            {
                "_id": "task_id_1",
                "name": "Follow up with lead",
                "description": "Call the lead to discuss their needs",
                "status": "Pending",
                "priority": "HIGH",
                "dueDate": "2024-01-20T10:00:00.000Z",
                "estimatedHours": 1,
                "actualHours": 0,
                "relatedLead": {
                    "_id": "lead_id_456",
                    "name": "John Doe",
                    "email": "john@example.com"
                }
            }
        ],
        "summary": {
            "total": 5,
            "pending": 2,
            "inProgress": 1,
            "completed": 2,
            "overdue": 0
        }
    }
}
```

#### Start Working on Task
```bash
POST /api/staff-tasks/task_id_1/start
Authorization: Bearer <staff_token>
Content-Type: application/json
{
    "notes": "Starting the follow-up call"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Task started successfully",
    "data": {
        "_id": "task_id_1",
        "status": "In Progress",
        "startedAt": "2024-01-19T09:00:00.000Z",
        "timeLogs": [
            {
                "user": "staff_id_123",
                "startTime": "2024-01-19T09:00:00.000Z",
                "endTime": null,
                "duration": 0,
                "description": "Starting the follow-up call"
            }
        ]
    }
}
```

#### Log Time to Task
```bash
POST /api/staff-tasks/task_id_1/time-log
Authorization: Bearer <staff_token>
Content-Type: application/json
{
    "startTime": "2024-01-19T09:00:00.000Z",
    "endTime": "2024-01-19T10:30:00.000Z",
    "description": "Completed follow-up call with lead"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Time logged successfully",
    "data": {
        "_id": "task_id_1",
        "actualHours": 1.5,
        "timeLogs": [
            {
                "user": "staff_id_123",
                "startTime": "2024-01-19T09:00:00.000Z",
                "endTime": "2024-01-19T10:30:00.000Z",
                "duration": 90,
                "description": "Completed follow-up call with lead"
            }
        ]
    }
}
```

#### Add Comment to Task
```bash
POST /api/staff-tasks/task_id_1/comments
Authorization: Bearer <staff_token>
Content-Type: application/json
{
    "content": "Lead showed interest in our premium package. Scheduled follow-up meeting for next week."
}
```

**Response:**
```json
{
    "success": true,
    "message": "Comment added successfully",
    "data": {
        "_id": "task_id_1",
        "comments": [
            {
                "user": "staff_id_123",
                "content": "Lead showed interest in our premium package. Scheduled follow-up meeting for next week.",
                "createdAt": "2024-01-19T10:30:00.000Z"
            }
        ]
    }
}
```

#### Mark Task as Complete
```bash
POST /api/staff-tasks/task_id_1/complete
Authorization: Bearer <staff_token>
Content-Type: application/json
{
    "completionNotes": "Successfully completed follow-up call. Lead qualified and interested in moving forward.",
    "actualHours": 1.5,
    "outcome": "qualified"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Task completed successfully",
    "data": {
        "_id": "task_id_1",
        "status": "Completed",
        "completedAt": "2024-01-19T10:30:00.000Z",
        "actualHours": 1.5,
        "completionNotes": "Successfully completed follow-up call. Lead qualified and interested in moving forward.",
        "outcome": "qualified",
        "performance": {
            "onTime": true,
            "efficiency": 150, // 1.5 hours vs 1 hour estimated
            "quality": "high"
        }
    }
}
```

### 3. Task Status Transitions

```javascript
const TASK_STATUS_FLOW = {
    'Pending': ['In Progress', 'Cancelled'],
    'In Progress': ['Completed', 'Paused', 'Overdue'],
    'Paused': ['In Progress', 'Cancelled'],
    'Completed': [], // Terminal state
    'Overdue': ['In Progress', 'Completed', 'Cancelled'],
    'Cancelled': [] // Terminal state
};
```

### 4. Performance Tracking

#### Task Completion Metrics
```javascript
{
    "taskCompletionRate": 85,        // Percentage of tasks completed
    "onTimeCompletionRate": 92,       // Percentage completed on time
    "averageCompletionTime": 1.2,     // Average hours to complete
    "efficiencyScore": 95,            // Actual vs estimated time
    "qualityScore": 88,               // Based on outcomes and feedback
    "overdueTasks": 2,                // Number of overdue tasks
    "totalTasks": 25,                 // Total assigned tasks
    "completedTasks": 21,             // Total completed tasks
    "inProgressTasks": 2              // Currently in progress
}
```

## Implementation Status Update

### ✅ **COMPLETED IMPLEMENTATIONS**

#### 1. Staff Task Controller (`controllers/staffTaskController.js`)
- ✅ `getStaffTasks` - Get tasks assigned to authenticated staff member
- ✅ `updateTaskStatus` - Allow staff to update task status with validation
- ✅ `completeTask` - Allow staff to mark task as complete with performance tracking
- ✅ `startTask` - Allow staff to start working on tasks
- ✅ `pauseTask` - Allow staff to pause task work
- ✅ `addTaskComment` - Allow staff to add comments to tasks
- ✅ `logTaskTime` - Allow staff to log time to tasks
- ✅ `getMyTasks` - Get staff's personal task overview
- ✅ `getOverdueTasks` - Get staff's overdue tasks
- ✅ `getUpcomingTasks` - Get staff's upcoming tasks
- ✅ `bulkUpdateTasks` - Allow staff to bulk update multiple tasks

#### 2. Staff Task Routes (`routes/staffTaskRoutes.js`)
- ✅ All endpoints mounted under `/api/staff-tasks`
- ✅ Proper authentication and authorization middleware
- ✅ Staff-specific access controls

#### 3. Enhanced Task Schema (`schema/Task.js`)
- ✅ Added `Paused` status to task status enum
- ✅ Added staff-specific fields: `startedAt`, `pausedAt`, `totalPauseTime`
- ✅ Added completion fields: `completionNotes`, `outcome`, `qualityRating`, `feedback`
- ✅ Added performance fields: `lastActivity`, `timeSpent`, `efficiency`
- ✅ Updated `assignedTo` reference to support both Coach and Staff

#### 4. Main Application Integration (`main.js`)
- ✅ Integrated `staffTaskRoutes` into main application
- ✅ Mounted under `/api/staff-tasks` endpoint
};

exports.addTaskComment = async (req, res) => {
    // Allow staff to add comments
};

exports.logTaskTime = async (req, res) => {
    // Allow staff to log time
};
```

#### 2. Create Staff Task Routes
```javascript
// routes/staffTaskRoutes.js
router.get('/', authorizeStaff('staff'), getStaffTasks);
router.get('/:id', authorizeStaff('staff'), getStaffTask);
router.put('/:id/status', authorizeStaff('staff'), updateTaskStatus);
router.post('/:id/complete', authorizeStaff('staff'), completeTask);
router.post('/:id/comments', authorizeStaff('staff'), addTaskComment);
router.post('/:id/time-log', authorizeStaff('staff'), logTaskTime);
```

#### 3. Update Task Schema
```javascript
// Add staff-specific fields
{
    // ... existing fields ...
    staffNotes: String,              // Staff-specific notes
    completionNotes: String,         // Notes when completing
    outcome: String,                 // Success, qualified, not interested, etc.
    qualityRating: Number,          // 1-5 rating
    feedback: String,               // Staff feedback
    lastActivity: Date,             // Last staff activity
    timeSpent: Number,              // Total time spent in minutes
    efficiency: Number              // Actual vs estimated time ratio
}
```

## Testing Scenarios

### Staff Task Completion Tests

#### TC-001: Staff Views Assigned Tasks
```bash
curl -X GET http://localhost:3000/api/staff-tasks \
  -H "Authorization: Bearer <staff_token>"
```

#### TC-002: Staff Starts Task
```bash
curl -X POST http://localhost:3000/api/staff-tasks/task_id_1/start \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Starting work on this task"}'
```

#### TC-003: Staff Logs Time
```bash
curl -X POST http://localhost:3000/api/staff-tasks/task_id_1/time-log \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2024-01-19T09:00:00.000Z",
    "endTime": "2024-01-19T10:30:00.000Z",
    "description": "Completed the task"
  }'
```

#### TC-004: Staff Completes Task
```bash
curl -X POST http://localhost:3000/api/staff-tasks/task_id_1/complete \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "completionNotes": "Task completed successfully",
    "actualHours": 1.5,
    "outcome": "qualified"
  }'
```

## Integration with Staff Management

### Performance Impact
- Task completion rates affect staff performance scores
- Time efficiency impacts leaderboard rankings
- Quality ratings influence promotion opportunities

### Dashboard Integration
- Staff dashboard shows task overview
- Performance metrics include task completion rates
- Leaderboard considers task efficiency

### Calendar Integration
- Tasks appear in staff calendar
- Time logs sync with calendar events
- Due dates trigger calendar reminders

## Conclusion

The Workflow & Task Management System is **80% complete** with robust task management, intelligent assignment, and comprehensive analytics. However, the **staff task completion functionality is missing** and needs to be implemented to provide a complete workflow experience.

### Priority Implementation Order:
1. **Staff Task Completion Endpoints** (Critical)
2. **Staff Task Comments** (High)
3. **Staff Time Logging** (High)
4. **Staff Task Notifications** (Medium)
5. **Enhanced Task Analytics** (Medium)

Once these features are implemented, the system will provide a complete end-to-end workflow management experience for both coaches and staff members.
