# Workflow & Task Management System Documentation

## Overview
The Workflow & Task Management System provides comprehensive task management with Kanban board interface, intelligent task assignment, workflow stages, task dependencies, time tracking, and automated SOP generation. The system follows a 5-stage pipeline that mirrors the typical sales process.

## System Architecture

### Core Components
- **Kanban-Style Workflow Board** - Visual task management with drag-and-drop
- **Intelligent Task Assignment** - Based on workload and skills
- **Workflow Stages** - Lead Generation → Qualification → Proposal → Closing → Onboarding
- **Task Dependencies** - Subtask management and dependency tracking
- **Time Tracking** - Comprehensive logging capabilities
- **Automated SOP Generation** - AI-powered standard operating procedures
- **Bulk Operations** - Efficient task management
- **Analytics & Reporting** - Workflow optimization insights

### Database Schema

#### Task Schema
```javascript
{
  name: String,                    // Required
  description: String,            // Optional
  status: String,                 // 'Pending', 'In Progress', 'Completed', 'Overdue', 'Cancelled', 'Paused'
  priority: String,               // 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  stage: String,                  // 'LEAD_GENERATION', 'LEAD_QUALIFICATION', 'PROPOSAL', 'CLOSING', 'ONBOARDING'
  dueDate: Date,                  // Required
  assignedTo: ObjectId,           // Reference to Coach/Staff
  relatedLead: ObjectId,          // Reference to Lead (Required)
  coachId: ObjectId,              // Reference to Coach (Required)
  estimatedHours: Number,         // Default: 1
  actualHours: Number,            // Default: 0
  tags: [String],                 // Task tags
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  comments: [{
    user: ObjectId,                // Reference to Coach
    content: String,
    createdAt: Date
  }],
  dependencies: [ObjectId],       // References to other Tasks
  subtasks: [{
    name: String,
    description: String,
    completed: Boolean,
    dueDate: Date
  }],
  timeLogs: [{
    user: ObjectId,
    startTime: Date,
    endTime: Date,
    duration: Number,              // in minutes
    description: String
  }],
  reminders: [{
    time: Date,
    type: String,                  // 'email', 'push'
    sent: Boolean
  }],
  automationRules: [{
    trigger: String,               // 'status_change', 'due_date_approaching', 'completion', 'assignment'
    action: String,                // 'create_task', 'send_notification', 'update_lead', 'send_email'
    config: Mixed
  }],
  startedAt: Date,
  pausedAt: Date,
  totalPauseTime: Number,         // in minutes
  completionNotes: String,
  outcome: String,                 // 'SUCCESS', 'PARTIAL_SUCCESS', 'FAILED', 'CANCELLED'
  qualityRating: Number,          // 1-5
  feedback: String,
  lastActivity: Date,
  timeSpent: Number,              // in minutes
  efficiency: Number,             // percentage
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

## API Endpoints

### Base URL: `/api/workflow`

### 1. Kanban Board Management

#### Get Kanban Board
**GET** `/kanban-board`
- **Description**: Get complete Kanban board with tasks organized by stages
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "stages": [
      {
        "stage": "LEAD_GENERATION",
        "name": "Lead Generation",
        "tasks": [
          {
            "_id": "65a1b2c3d4e5f6789012345a",
            "name": "Follow up with John Doe",
            "description": "Call lead to discuss program details",
            "status": "Pending",
            "priority": "HIGH",
            "dueDate": "2025-01-22T14:00:00Z",
            "assignedTo": {
              "_id": "65a1b2c3d4e5f6789012345b",
              "name": "Jane Smith",
              "email": "jane@example.com"
            },
            "relatedLead": {
              "_id": "65a1b2c3d4e5f6789012345c",
              "name": "John Doe",
              "email": "john@example.com",
              "phone": "+1234567890",
              "status": "New"
            },
            "estimatedHours": 1,
            "actualHours": 0,
            "tags": ["follow-up", "high-priority"],
            "progress": 0,
            "isOverdue": false,
            "createdAt": "2025-01-20T10:00:00Z"
          }
        ],
        "taskCount": 1
      }
    ],
    "summary": {
      "totalTasks": 15,
      "completedTasks": 5,
      "overdueTasks": 2,
      "completionRate": 33.3
    }
  }
}
```

#### Move Task (Drag & Drop)
**PUT** `/tasks/:taskId/move`
- **Description**: Move task between stages in Kanban board
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "newStage": "LEAD_QUALIFICATION"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Task moved successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345a",
    "name": "Follow up with John Doe",
    "stage": "LEAD_QUALIFICATION",
    "status": "In Progress",
    "updatedAt": "2025-01-20T11:00:00Z"
  }
}
```

### 2. Task Management

#### Create Task
**POST** `/tasks`
- **Description**: Create new task with intelligent assignment
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "name": "Follow up with John Doe",
  "description": "Call lead to discuss program details and answer questions",
  "dueDate": "2025-01-22T14:00:00Z",
  "relatedLead": "65a1b2c3d4e5f6789012345c",
  "priority": "HIGH",
  "stage": "LEAD_GENERATION",
  "estimatedHours": 1,
  "tags": ["follow-up", "high-priority"]
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345a",
    "name": "Follow up with John Doe",
    "description": "Call lead to discuss program details and answer questions",
    "status": "Pending",
    "priority": "HIGH",
    "stage": "LEAD_GENERATION",
    "dueDate": "2025-01-22T14:00:00Z",
    "assignedTo": "65a1b2c3d4e5f6789012345b",
    "relatedLead": "65a1b2c3d4e5f6789012345c",
    "coachId": "65a1b2c3d4e5f6789012345d",
    "estimatedHours": 1,
    "actualHours": 0,
    "tags": ["follow-up", "high-priority"],
    "progress": 0,
    "isOverdue": false,
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
  }
}
```

#### Get All Tasks
**GET** `/tasks?page=1&limit=10&status=Pending&priority=HIGH&stage=LEAD_GENERATION`
- **Description**: Get tasks with filtering and pagination
- **Authentication**: Coach required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `status`: Filter by status
  - `priority`: Filter by priority
  - `stage`: Filter by stage
  - `assignedTo`: Filter by assignee
  - `dueDate`: Filter by due date
  - `sortBy`: Sort field (default: 'dueDate')
  - `sortOrder`: Sort order 'asc' or 'desc'
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345a",
      "name": "Follow up with John Doe",
      "status": "Pending",
      "priority": "HIGH",
      "stage": "LEAD_GENERATION",
      "dueDate": "2025-01-22T14:00:00Z",
      "assignedTo": {
        "_id": "65a1b2c3d4e5f6789012345b",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "relatedLead": {
        "_id": "65a1b2c3d4e5f6789012345c",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "status": "New"
      },
      "estimatedHours": 1,
      "actualHours": 0,
      "tags": ["follow-up", "high-priority"],
      "progress": 0,
      "isOverdue": false,
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Get Single Task
**GET** `/tasks/:id`
- **Description**: Get detailed task information
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012345a",
    "name": "Follow up with John Doe",
    "description": "Call lead to discuss program details and answer questions",
    "status": "Pending",
    "priority": "HIGH",
    "stage": "LEAD_GENERATION",
    "dueDate": "2025-01-22T14:00:00Z",
    "assignedTo": {
      "_id": "65a1b2c3d4e5f6789012345b",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "relatedLead": {
      "_id": "65a1b2c3d4e5f6789012345c",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "status": "New"
    },
    "coachId": "65a1b2c3d4e5f6789012345d",
    "estimatedHours": 1,
    "actualHours": 0,
    "tags": ["follow-up", "high-priority"],
    "attachments": [],
    "comments": [],
    "dependencies": [],
    "subtasks": [],
    "timeLogs": [],
    "reminders": [],
    "automationRules": [],
    "progress": 0,
    "isOverdue": false,
    "timeSpent": 0,
    "efficiency": 0,
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
  }
}
```

#### Update Task
**PUT** `/tasks/:id`
- **Description**: Update task information
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "status": "In Progress",
  "priority": "URGENT",
  "description": "Updated description",
  "estimatedHours": 2,
  "tags": ["follow-up", "urgent", "client-call"]
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345a",
    "status": "In Progress",
    "priority": "URGENT",
    "description": "Updated description",
    "estimatedHours": 2,
    "tags": ["follow-up", "urgent", "client-call"],
    "updatedAt": "2025-01-20T11:00:00Z"
  }
}
```

#### Delete Task
**DELETE** `/tasks/:id`
- **Description**: Delete task
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### 3. Task Collaboration

#### Add Comment
**POST** `/tasks/:id/comments`
- **Description**: Add comment to task
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "content": "Called the lead, very interested in the program. Scheduled follow-up call for tomorrow."
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345a",
    "comments": [
      {
        "user": "65a1b2c3d4e5f6789012345b",
        "content": "Called the lead, very interested in the program. Scheduled follow-up call for tomorrow.",
        "createdAt": "2025-01-20T11:00:00Z"
      }
    ]
  }
}
```

#### Log Time
**POST** `/tasks/:id/time-log`
- **Description**: Log time spent on task
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "startTime": "2025-01-20T10:00:00Z",
  "endTime": "2025-01-20T11:30:00Z",
  "description": "Made follow-up call and discussed program details"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Time logged successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345a",
    "timeLogs": [
      {
        "user": "65a1b2c3d4e5f6789012345b",
        "startTime": "2025-01-20T10:00:00Z",
        "endTime": "2025-01-20T11:30:00Z",
        "duration": 90,
        "description": "Made follow-up call and discussed program details"
      }
    ],
    "actualHours": 1.5,
    "timeSpent": 90
  }
}
```

#### Add Subtask
**POST** `/tasks/:id/subtasks`
- **Description**: Add subtask to main task
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "name": "Send program details email",
  "description": "Send detailed program information and pricing",
  "dueDate": "2025-01-21T09:00:00Z"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Subtask added successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345a",
    "subtasks": [
      {
        "name": "Send program details email",
        "description": "Send detailed program information and pricing",
        "completed": false,
        "dueDate": "2025-01-21T09:00:00Z"
      }
    ],
    "progress": 0
  }
}
```

### 4. Task Dependencies

#### Get Task Dependencies
**GET** `/tasks/:id/dependencies`
- **Description**: Get task dependencies
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "taskId": "65a1b2c3d4e5f6789012345a",
    "dependencies": [
      {
        "_id": "65a1b2c3d4e5f6789012345e",
        "name": "Complete lead qualification",
        "status": "Completed",
        "dueDate": "2025-01-20T16:00:00Z"
      }
    ],
    "dependentTasks": [
      {
        "_id": "65a1b2c3d4e5f6789012345f",
        "name": "Send proposal",
        "status": "Pending",
        "dueDate": "2025-01-23T14:00:00Z"
      }
    ]
  }
}
```

#### Add Task Dependency
**POST** `/tasks/:id/dependencies`
- **Description**: Add dependency to task
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "dependencyTaskId": "65a1b2c3d4e5f6789012345e"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Dependency added successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345a",
    "dependencies": ["65a1b2c3d4e5f6789012345e"]
  }
}
```

#### Remove Task Dependency
**DELETE** `/tasks/:id/dependencies/:dependencyId`
- **Description**: Remove dependency from task
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "message": "Dependency removed successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345a",
    "dependencies": []
  }
}
```

### 5. Analytics & Reporting

#### Get Task Analytics
**GET** `/analytics?startDate=2025-01-01&endDate=2025-01-31`
- **Description**: Get task analytics and performance metrics
- **Authentication**: Coach required
- **Query Parameters**:
  - `startDate`: Start date for analytics
  - `endDate`: End date for analytics
- **Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTasks": 50,
      "completedTasks": 35,
      "overdueTasks": 5,
      "completionRate": 70,
      "averageCompletionTime": 2.5
    },
    "byStatus": [
      {
        "_id": "Completed",
        "count": 35,
        "avgCompletionTime": 2.3
      },
      {
        "_id": "Pending",
        "count": 10,
        "avgCompletionTime": null
      }
    ],
    "byStage": [
      {
        "_id": "LEAD_GENERATION",
        "count": 15,
        "completionRate": 80
      },
      {
        "_id": "LEAD_QUALIFICATION",
        "count": 12,
        "completionRate": 75
      }
    ],
    "byPriority": [
      {
        "_id": "HIGH",
        "count": 20,
        "completionRate": 85
      },
      {
        "_id": "MEDIUM",
        "count": 25,
        "completionRate": 65
      }
    ],
    "performance": {
      "totalTimeSpent": 120,
      "averageEfficiency": 78,
      "topPerformers": [
        {
          "assignedTo": "65a1b2c3d4e5f6789012345b",
          "name": "Jane Smith",
          "completedTasks": 15,
          "efficiency": 92
        }
      ]
    }
  }
}
```

### 6. Automation & Intelligence

#### Auto Assign Tasks
**POST** `/auto-assign`
- **Description**: Automatically assign tasks based on workload and skills
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "taskIds": ["65a1b2c3d4e5f6789012345a", "65a1b2c3d4e5f6789012345b"],
  "criteria": {
    "workloadBalance": true,
    "skillMatching": true,
    "availability": true
  }
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Tasks assigned successfully",
  "data": {
    "assignedTasks": [
      {
        "taskId": "65a1b2c3d4e5f6789012345a",
        "assignedTo": "65a1b2c3d4e5f6789012345b",
        "reason": "Optimal workload and skill match"
      }
    ],
    "assignmentSummary": {
      "totalAssigned": 2,
      "workloadBalanced": true,
      "skillMatched": true
    }
  }
}
```

#### Generate SOP
**POST** `/generate-sop`
- **Description**: Generate AI-powered standard operating procedure
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "taskType": "lead_follow_up",
  "stage": "LEAD_GENERATION",
  "includeBestPractices": true,
  "includeTemplates": true
}
```
- **Response**:
```json
{
  "success": true,
  "message": "SOP generated successfully",
  "data": {
    "sopId": "65a1b2c3d4e5f6789012345g",
    "title": "Lead Follow-up Standard Operating Procedure",
    "stage": "LEAD_GENERATION",
    "steps": [
      {
        "step": 1,
        "title": "Initial Contact",
        "description": "Make initial contact within 24 hours of lead submission",
        "duration": "15 minutes",
        "bestPractices": [
          "Use lead's preferred communication method",
          "Reference specific content they engaged with",
          "Ask qualifying questions"
        ],
        "templates": {
          "email": "Hi [Name], I noticed you're interested in [Program]...",
          "script": "Hello [Name], this is [Your Name] from [Company]..."
        }
      }
    ],
    "qualityChecklist": [
      "Lead's contact information verified",
      "Qualifying questions asked",
      "Next steps clearly defined"
    ],
    "generatedAt": "2025-01-20T12:00:00Z"
  }
}
```

### 7. Task Filtering & Management

#### Get Upcoming Tasks
**GET** `/upcoming-tasks?days=7`
- **Description**: Get tasks due in the next N days
- **Authentication**: Coach required
- **Query Parameters**:
  - `days`: Number of days ahead (default: 7)
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345a",
      "name": "Follow up with John Doe",
      "dueDate": "2025-01-22T14:00:00Z",
      "priority": "HIGH",
      "stage": "LEAD_GENERATION",
      "assignedTo": {
        "_id": "65a1b2c3d4e5f6789012345b",
        "name": "Jane Smith"
      },
      "relatedLead": {
        "_id": "65a1b2c3d4e5f6789012345c",
        "name": "John Doe"
      },
      "daysUntilDue": 2
    }
  ],
  "totalUpcoming": 8
}
```

#### Get Overdue Tasks
**GET** `/overdue-tasks`
- **Description**: Get all overdue tasks
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345h",
      "name": "Send proposal to Sarah",
      "dueDate": "2025-01-18T16:00:00Z",
      "priority": "HIGH",
      "stage": "PROPOSAL",
      "assignedTo": {
        "_id": "65a1b2c3d4e5f6789012345b",
        "name": "Jane Smith"
      },
      "relatedLead": {
        "_id": "65a1b2c3d4e5f6789012345i",
        "name": "Sarah Johnson"
      },
      "daysOverdue": 2
    }
  ],
  "totalOverdue": 3
}
```

#### Get Tasks by Stage
**GET** `/tasks/stage/:stage`
- **Description**: Get tasks filtered by specific stage
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345a",
      "name": "Follow up with John Doe",
      "stage": "LEAD_GENERATION",
      "status": "Pending",
      "priority": "HIGH",
      "dueDate": "2025-01-22T14:00:00Z",
      "assignedTo": {
        "_id": "65a1b2c3d4e5f6789012345b",
        "name": "Jane Smith"
      },
      "relatedLead": {
        "_id": "65a1b2c3d4e5f6789012345c",
        "name": "John Doe"
      }
    }
  ],
  "stage": "LEAD_GENERATION",
  "totalTasks": 5
}
```

#### Bulk Update Task Status
**PUT** `/bulk-update-status`
- **Description**: Update status of multiple tasks
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "taskIds": ["65a1b2c3d4e5f6789012345a", "65a1b2c3d4e5f6789012345b"],
  "status": "Completed",
  "completionNotes": "All tasks completed successfully"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Tasks updated successfully",
  "data": {
    "updatedTasks": 2,
    "newStatus": "Completed",
    "updatedAt": "2025-01-20T12:00:00Z"
  }
}
```

### 8. Lead Integration

#### Create Task from Lead
**POST** `/tasks/from-lead/:leadId`
- **Description**: Create task automatically from lead
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "taskType": "follow_up",
  "priority": "HIGH",
  "dueDate": "2025-01-22T14:00:00Z",
  "customInstructions": "Focus on weight loss goals"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Task created from lead successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345j",
    "name": "Follow up with John Doe - Weight Loss Focus",
    "description": "Follow up with lead John Doe focusing on weight loss goals. Lead is highly interested and ready to start.",
    "status": "Pending",
    "priority": "HIGH",
    "stage": "LEAD_GENERATION",
    "dueDate": "2025-01-22T14:00:00Z",
    "relatedLead": "65a1b2c3d4e5f6789012345c",
    "assignedTo": "65a1b2c3d4e5f6789012345b",
    "tags": ["follow-up", "weight-loss", "high-priority"],
    "createdAt": "2025-01-20T12:00:00Z"
  }
}
```

## Workflow Stages

### 1. Lead Generation
- **Purpose**: Initial contact and qualification
- **Tasks**: Follow-up calls, email outreach, lead scoring
- **Duration**: 1-3 days
- **Success Criteria**: Lead responds and shows interest

### 2. Lead Qualification
- **Purpose**: Assess fit and readiness
- **Tasks**: Discovery calls, needs assessment, budget discussion
- **Duration**: 2-5 days
- **Success Criteria**: Lead qualifies for program

### 3. Proposal
- **Purpose**: Present solution and pricing
- **Tasks**: Create proposal, present program, handle objections
- **Duration**: 1-3 days
- **Success Criteria**: Lead accepts proposal

### 4. Closing
- **Purpose**: Finalize agreement and payment
- **Tasks**: Contract signing, payment processing, onboarding prep
- **Duration**: 1-2 days
- **Success Criteria**: Payment received and contract signed

### 5. Onboarding
- **Purpose**: Client setup and program start
- **Tasks**: Account setup, program delivery, first check-in
- **Duration**: 3-7 days
- **Success Criteria**: Client successfully starts program

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "code": "ERROR_CODE"
}
```

## Authentication

All endpoints require coach authentication.

## Rate Limiting

- **Standard Endpoints**: 1000 requests per hour
- **Analytics Endpoints**: 100 requests per hour
- **Bulk Operations**: 50 requests per hour

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error
