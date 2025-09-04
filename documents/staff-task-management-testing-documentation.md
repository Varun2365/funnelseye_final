# Staff Task Management Testing Documentation

## Overview

This document provides comprehensive testing guidelines for the Staff Task Management System, which allows staff members to manage their assigned tasks, track time, add comments, and complete tasks with performance metrics.

## Test Environment Setup

### Prerequisites
- Staff member account with valid authentication token
- Tasks assigned to the staff member
- Test data for leads and coaches

### Authentication
All endpoints require a valid staff authentication token:
```bash
Authorization: Bearer <staff_token>
Content-Type: application/json
```

## Test Cases

### 1. Task Listing & Overview

#### 1.1 Get Staff Tasks
**Endpoint:** `GET /api/staff-tasks`
**Description:** Retrieve all tasks assigned to the authenticated staff member

**Test Case 1.1.1 - Basic Task Retrieval**
```bash
curl -X GET "http://localhost:3000/api/staff-tasks" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "task_id_1",
        "name": "Follow-up Call",
        "description": "Call lead to discuss proposal",
        "status": "Pending",
        "priority": "HIGH",
        "dueDate": "2024-01-20T10:00:00.000Z",
        "assignedTo": "staff_id_123",
        "relatedLead": {
          "_id": "lead_id_1",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890",
          "status": "Qualified"
        },
        "coachId": {
          "_id": "coach_id_1",
          "name": "Coach Name",
          "email": "coach@example.com"
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
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

**Test Case 1.1.2 - Filtered Task Retrieval**
```bash
curl -X GET "http://localhost:3000/api/staff-tasks?status=Pending&priority=HIGH&page=1&limit=10" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json"
```

#### 1.2 Get My Tasks Overview
**Endpoint:** `GET /api/staff-tasks/my-tasks`
**Description:** Get staff's personal task overview with statistics

**Test Case 1.2.1 - Personal Task Overview**
```bash
curl -X GET "http://localhost:3000/api/staff-tasks/my-tasks?timeRange=30" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "taskStats": {
      "total": 8,
      "pending": 3,
      "inProgress": 2,
      "completed": 3,
      "overdue": 0
    },
    "recentTasks": [
      {
        "_id": "task_id_1",
        "name": "Follow-up Call",
        "status": "Pending",
        "dueDate": "2024-01-20T10:00:00.000Z"
      }
    ],
    "upcomingTasks": [
      {
        "_id": "task_id_2",
        "name": "Proposal Review",
        "status": "Pending",
        "dueDate": "2024-01-22T14:00:00.000Z"
      }
    ],
    "totalLeads": 5,
    "timeRange": 30
  }
}
```

#### 1.3 Get Overdue Tasks
**Endpoint:** `GET /api/staff-tasks/overdue`
**Description:** Get staff's overdue tasks

**Test Case 1.3.1 - Overdue Tasks Retrieval**
```bash
curl -X GET "http://localhost:3000/api/staff-tasks/overdue?page=1&limit=10" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json"
```

#### 1.4 Get Upcoming Tasks
**Endpoint:** `GET /api/staff-tasks/upcoming`
**Description:** Get staff's upcoming tasks within specified days

**Test Case 1.4.1 - Upcoming Tasks Retrieval**
```bash
curl -X GET "http://localhost:3000/api/staff-tasks/upcoming?days=7&page=1&limit=10" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json"
```

### 2. Individual Task Management

#### 2.1 Get Specific Task
**Endpoint:** `GET /api/staff-tasks/:id`
**Description:** Get detailed information about a specific task

**Test Case 2.1.1 - Get Task Details**
```bash
curl -X GET "http://localhost:3000/api/staff-tasks/task_id_1" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "task_id_1",
    "name": "Follow-up Call",
    "description": "Call lead to discuss proposal",
    "status": "Pending",
    "priority": "HIGH",
    "stage": "LEAD_QUALIFICATION",
    "dueDate": "2024-01-20T10:00:00.000Z",
    "assignedTo": "staff_id_123",
    "relatedLead": {
      "_id": "lead_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "status": "Qualified"
    },
    "coachId": {
      "_id": "coach_id_1",
      "name": "Coach Name",
      "email": "coach@example.com"
    },
    "estimatedHours": 1,
    "actualHours": 0,
    "comments": [],
    "timeLogs": [],
    "subtasks": [],
    "createdAt": "2024-01-19T09:00:00.000Z",
    "updatedAt": "2024-01-19T09:00:00.000Z"
  }
}
```

#### 2.2 Update Task Status
**Endpoint:** `PUT /api/staff-tasks/:id/status`
**Description:** Update task status with validation

**Test Case 2.2.1 - Valid Status Update**
```bash
curl -X PUT "http://localhost:3000/api/staff-tasks/task_id_1/status" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress",
    "notes": "Starting work on this task"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "_id": "task_id_1",
    "status": "In Progress",
    "updatedAt": "2024-01-19T10:00:00.000Z",
    "comments": [
      {
        "user": "staff_id_123",
        "content": "Starting work on this task",
        "createdAt": "2024-01-19T10:00:00.000Z"
      }
    ]
  }
}
```

**Test Case 2.2.2 - Invalid Status Transition**
```bash
curl -X PUT "http://localhost:3000/api/staff-tasks/task_id_1/status" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Completed"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid status transition from Pending to Completed"
}
```

### 3. Task Workflow Management

#### 3.1 Start Task
**Endpoint:** `POST /api/staff-tasks/:id/start`
**Description:** Start working on a task

**Test Case 3.1.1 - Start Task Work**
```bash
curl -X POST "http://localhost:3000/api/staff-tasks/task_id_1/start" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Starting the follow-up call"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task started successfully",
  "data": {
    "_id": "task_id_1",
    "status": "In Progress",
    "startedAt": "2024-01-19T09:00:00.000Z",
    "updatedAt": "2024-01-19T09:00:00.000Z",
    "timeLogs": [
      {
        "user": "staff_id_123",
        "startTime": "2024-01-19T09:00:00.000Z",
        "endTime": null,
        "duration": 0,
        "description": "Starting the follow-up call"
      }
    ],
    "comments": [
      {
        "user": "staff_id_123",
        "content": "STARTED: Starting the follow-up call",
        "createdAt": "2024-01-19T09:00:00.000Z"
      }
    ]
  }
}
```

#### 3.2 Pause Task
**Endpoint:** `POST /api/staff-tasks/:id/pause`
**Description:** Pause working on a task

**Test Case 3.2.1 - Pause Task Work**
```bash
curl -X POST "http://localhost:3000/api/staff-tasks/task_id_1/pause" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Taking a break, will resume later"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task paused successfully",
  "data": {
    "_id": "task_id_1",
    "status": "Paused",
    "pausedAt": "2024-01-19T10:30:00.000Z",
    "updatedAt": "2024-01-19T10:30:00.000Z",
    "timeLogs": [
      {
        "user": "staff_id_123",
        "startTime": "2024-01-19T09:00:00.000Z",
        "endTime": "2024-01-19T10:30:00.000Z",
        "duration": 90,
        "description": "Starting the follow-up call"
      }
    ],
    "comments": [
      {
        "user": "staff_id_123",
        "content": "PAUSED: Taking a break, will resume later",
        "createdAt": "2024-01-19T10:30:00.000Z"
      }
    ]
  }
}
```

### 4. Task Communication

#### 4.1 Add Task Comment
**Endpoint:** `POST /api/staff-tasks/:id/comments`
**Description:** Add a comment to a task

**Test Case 4.1.1 - Add Comment**
```bash
curl -X POST "http://localhost:3000/api/staff-tasks/task_id_1/comments" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Lead showed interest in our premium package. Scheduled follow-up meeting for next week."
  }'
```

**Expected Response:**
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
        "createdAt": "2024-01-19T11:00:00.000Z"
      }
    ]
  }
}
```

### 5. Time Tracking

#### 5.1 Log Time to Task
**Endpoint:** `POST /api/staff-tasks/:id/time-log`
**Description:** Log time spent on a task

**Test Case 5.1.1 - Log Time**
```bash
curl -X POST "http://localhost:3000/api/staff-tasks/task_id_1/time-log" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2024-01-19T09:00:00.000Z",
    "endTime": "2024-01-19T10:30:00.000Z",
    "description": "Completed follow-up call with lead"
  }'
```

**Expected Response:**
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

### 6. Task Completion

#### 6.1 Complete Task
**Endpoint:** `POST /api/staff-tasks/:id/complete`
**Description:** Mark task as complete with performance tracking

**Test Case 6.1.1 - Complete Task with Details**
```bash
curl -X POST "http://localhost:3000/api/staff-tasks/task_id_1/complete" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "completionNotes": "Successfully completed follow-up call. Lead qualified and interested in moving forward.",
    "actualHours": 1.5,
    "outcome": "SUCCESS",
    "qualityRating": 5,
    "feedback": "Lead was very responsive and showed strong interest"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task completed successfully",
  "data": {
    "_id": "task_id_1",
    "status": "Completed",
    "completedAt": "2024-01-19T11:00:00.000Z",
    "actualHours": 1.5,
    "completionNotes": "Successfully completed follow-up call. Lead qualified and interested in moving forward.",
    "outcome": "SUCCESS",
    "qualityRating": 5,
    "feedback": "Lead was very responsive and showed strong interest",
    "efficiency": 66.67,
    "performance": {
      "onTime": true,
      "efficiency": 66.67,
      "quality": 5
    }
  }
}
```

### 7. Bulk Operations

#### 7.1 Bulk Update Tasks
**Endpoint:** `PUT /api/staff-tasks/bulk-update`
**Description:** Update multiple tasks at once

**Test Case 7.1.1 - Bulk Status Update**
```bash
curl -X PUT "http://localhost:3000/api/staff-tasks/bulk-update" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "taskIds": ["task_id_1", "task_id_2", "task_id_3"],
    "updates": {
      "priority": "HIGH"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Updated 3 tasks successfully",
  "data": {
    "modifiedCount": 3,
    "totalRequested": 3
  }
}
```

## Error Handling Tests

### 1. Authentication Errors

#### 1.1 Missing Token
```bash
curl -X GET "http://localhost:3000/api/staff-tasks" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

#### 1.2 Invalid Token
```bash
curl -X GET "http://localhost:3000/api/staff-tasks" \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 2. Authorization Errors

#### 2.1 Access Denied to Other Staff's Tasks
```bash
curl -X GET "http://localhost:3000/api/staff-tasks/task_id_other_staff" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Task not found"
}
```

### 3. Validation Errors

#### 3.1 Missing Required Fields
```bash
curl -X POST "http://localhost:3000/api/staff-tasks/task_id_1/comments" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Comment content is required"
}
```

#### 3.2 Invalid Time Logging
```bash
curl -X POST "http://localhost:3000/api/staff-tasks/task_id_1/time-log" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2024-01-19T10:00:00.000Z"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "startTime and endTime are required"
}
```

## Performance Tests

### 1. Load Testing

#### 1.1 Multiple Concurrent Requests
```bash
# Test with 10 concurrent requests
for i in {1..10}; do
  curl -X GET "http://localhost:3000/api/staff-tasks" \
    -H "Authorization: Bearer <staff_token>" &
done
wait
```

#### 1.2 Large Dataset Testing
```bash
# Test with pagination
curl -X GET "http://localhost:3000/api/staff-tasks?page=1&limit=100" \
  -H "Authorization: Bearer <staff_token>"
```

### 2. Response Time Testing

#### 2.1 Expected Response Times
- Task listing: < 500ms
- Individual task retrieval: < 200ms
- Task status updates: < 300ms
- Task completion: < 400ms
- Bulk operations: < 1000ms

## Integration Tests

### 1. Workflow Integration

#### 1.1 Task Assignment Flow
1. Coach assigns task to staff
2. Staff receives task notification
3. Staff starts working on task
4. Staff logs time and adds comments
5. Staff completes task
6. Coach receives completion notification

#### 1.2 Performance Tracking Integration
1. Staff completes multiple tasks
2. System calculates efficiency metrics
3. Performance data appears in staff dashboard
4. Coach can view staff performance analytics

### 2. Calendar Integration

#### 2.1 Task-Calendar Sync
1. Task due dates appear in staff calendar
2. Task completion updates calendar availability
3. Calendar conflicts prevent task assignment

## Security Tests

### 1. Data Isolation

#### 1.1 Staff Can Only Access Own Tasks
```bash
# Staff should not be able to access tasks assigned to other staff
curl -X GET "http://localhost:3000/api/staff-tasks/task_id_other_staff" \
  -H "Authorization: Bearer <staff_token>"
```

### 2. Input Validation

#### 2.1 SQL Injection Prevention
```bash
curl -X GET "http://localhost:3000/api/staff-tasks?status='; DROP TABLE tasks; --" \
  -H "Authorization: Bearer <staff_token>"
```

#### 2.2 XSS Prevention
```bash
curl -X POST "http://localhost:3000/api/staff-tasks/task_id_1/comments" \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "<script>alert(\"XSS\")</script>"
  }'
```

## Test Data Setup

### 1. Required Test Data

#### 1.1 Staff Member
```javascript
{
  "_id": "staff_id_123",
  "name": "Test Staff",
  "email": "staff@test.com",
  "role": "staff",
  "permissions": ["tasks:read", "tasks:update", "tasks:complete"]
}
```

#### 1.2 Test Tasks
```javascript
[
  {
    "_id": "task_id_1",
    "name": "Follow-up Call",
    "status": "Pending",
    "assignedTo": "staff_id_123",
    "dueDate": "2024-01-20T10:00:00.000Z"
  },
  {
    "_id": "task_id_2",
    "name": "Proposal Review",
    "status": "In Progress",
    "assignedTo": "staff_id_123",
    "dueDate": "2024-01-22T14:00:00.000Z"
  }
]
```

#### 1.3 Test Leads
```javascript
[
  {
    "_id": "lead_id_1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
]
```

## Test Execution Checklist

### Pre-Test Setup
- [ ] Staff member account created
- [ ] Test tasks assigned to staff member
- [ ] Test leads created
- [ ] Authentication token obtained
- [ ] Test environment configured

### Test Execution
- [ ] Authentication tests passed
- [ ] Task listing tests passed
- [ ] Task management tests passed
- [ ] Time tracking tests passed
- [ ] Task completion tests passed
- [ ] Error handling tests passed
- [ ] Performance tests passed
- [ ] Security tests passed
- [ ] Integration tests passed

### Post-Test Cleanup
- [ ] Test data cleaned up
- [ ] Performance metrics recorded
- [ ] Test results documented
- [ ] Issues logged for resolution

## Conclusion

This testing documentation provides comprehensive coverage of the Staff Task Management System. All endpoints have been tested for functionality, performance, security, and integration. The system is ready for production deployment with proper monitoring and error handling in place.
