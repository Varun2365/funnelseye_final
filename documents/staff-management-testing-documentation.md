# Staff Management System Testing Documentation

## Overview

This document provides comprehensive testing guidelines for the Staff Management System, including all endpoints, test cases, and expected responses. The system includes staff management, permissions, calendar management, appointments, and dashboard functionality.

## Table of Contents

1. [Authentication & Setup](#authentication--setup)
2. [Staff Management Endpoints](#staff-management-endpoints)
3. [Staff Calendar Endpoints](#staff-calendar-endpoints)
4. [Staff Appointment Endpoints](#staff-appointment-endpoints)
5. [Staff Dashboard Endpoints](#staff-dashboard-endpoints)
6. [Test Data Setup](#test-data-setup)
7. [Error Handling Tests](#error-handling-tests)
8. [Performance Tests](#performance-tests)

## Authentication & Setup

### Prerequisites
- Valid coach/admin account with authentication token
- Test database configured
- All required schemas and services available

### Authentication Headers
```bash
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Staff Management Endpoints

### 1. Create Staff Member

**Endpoint:** `POST /api/staff`

**Test Cases:**

#### TC-001: Create Staff with Valid Data
```bash
curl -X POST http://localhost:3000/api/staff \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "permissions": ["leads:read", "tasks:read", "calendar:read"]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Staff member created successfully. Email verification required on first login.",
  "data": {
    "_id": "staff_id",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "permissions": ["leads:read", "tasks:read", "calendar:read"],
    "coachId": "coach_id",
    "isActive": true,
    "isVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### TC-002: Create Staff with Invalid Permissions
```bash
curl -X POST http://localhost:3000/api/staff \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "password": "password123",
    "permissions": ["invalid:permission"]
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid permissions provided",
  "invalidPermissions": ["invalid:permission"]
}
```

#### TC-003: Create Staff with Duplicate Email
```bash
# First create staff
curl -X POST http://localhost:3000/api/staff \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123"
  }'

# Then try to create another with same email
curl -X POST http://localhost:3000/api/staff \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Jr",
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Email already in use."
}
```

### 2. List Staff Members

**Endpoint:** `GET /api/staff`

#### TC-004: List All Staff
```bash
curl -X GET http://localhost:3000/api/staff \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "staff_id_1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "permissions": ["leads:read", "tasks:read"],
      "isActive": true,
      "isVerified": true
    },
    {
      "_id": "staff_id_2",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "permissions": ["leads:read", "calendar:read"],
      "isActive": true,
      "isVerified": false
    }
  ]
}
```

### 3. Get Staff Details

**Endpoint:** `GET /api/staff/:id`

#### TC-005: Get Valid Staff Member
```bash
curl -X GET http://localhost:3000/api/staff/staff_id_1 \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "staff_id_1",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "permissions": ["leads:read", "tasks:read"],
    "isActive": true,
    "isVerified": true,
    "coachId": "coach_id"
  }
}
```

#### TC-006: Get Non-existent Staff
```bash
curl -X GET http://localhost:3000/api/staff/nonexistent_id \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Staff not found"
}
```

### 4. Update Staff Member

**Endpoint:** `PUT /api/staff/:id`

#### TC-007: Update Staff Permissions
```bash
curl -X PUT http://localhost:3000/api/staff/staff_id_1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["leads:read", "leads:write", "tasks:read", "calendar:manage"]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "staff_id_1",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "permissions": ["leads:read", "leads:write", "tasks:read", "calendar:manage"],
    "isActive": true,
    "isVerified": true
  }
}
```

### 5. Staff Search

**Endpoint:** `GET /api/staff/search?query=john&page=1&limit=10`

#### TC-008: Search Staff by Name
```bash
curl -X GET "http://localhost:3000/api/staff/search?query=john&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "staff_id_1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "permissions": ["leads:read", "tasks:read"],
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### 6. Staff Statistics

**Endpoint:** `GET /api/staff/stats`

#### TC-009: Get Staff Statistics
```bash
curl -X GET http://localhost:3000/api/staff/stats \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "active": 4,
    "inactive": 1,
    "verified": 3,
    "unverified": 2,
    "activePercentage": 80,
    "verifiedPercentage": 60
  }
}
```

### 7. Staff Profile Management

**Endpoint:** `GET /api/staff/:id/profile`

#### TC-010: Get Staff Profile with Stats
```bash
curl -X GET http://localhost:3000/api/staff/staff_id_1/profile \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "staff_id_1",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "permissions": ["leads:read", "tasks:read"],
    "isActive": true,
    "isVerified": true,
    "coachId": {
      "_id": "coach_id",
      "name": "Coach Name",
      "email": "coach@example.com"
    },
    "stats": {
      "totalTasks": 25,
      "completedTasks": 20,
      "taskCompletionRate": 80,
      "totalLeads": 15,
      "managedLeads": 12,
      "leadManagementRate": 80,
      "totalEvents": 30,
      "completedEvents": 28,
      "eventCompletionRate": 93
    }
  }
}
```

### 8. Staff Activity

**Endpoint:** `GET /api/staff/:id/activity?page=1&limit=10`

#### TC-011: Get Staff Activity Log
```bash
curl -X GET "http://localhost:3000/api/staff/staff_id_1/activity?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "task_id_1",
      "name": "Follow up with lead",
      "status": "Completed",
      "dueDate": "2024-01-15T10:00:00.000Z",
      "relatedLead": {
        "_id": "lead_id_1",
        "name": "John Lead",
        "email": "lead@example.com"
      },
      "updatedAt": "2024-01-15T09:30:00.000Z"
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

### 9. Staff Performance

**Endpoint:** `GET /api/staff/:id/performance?startDate=2024-01-01&endDate=2024-01-31`

#### TC-012: Get Staff Performance Metrics
```bash
curl -X GET "http://localhost:3000/api/staff/staff_id_1/performance?startDate=2024-01-01&endDate=2024-01-31&includeDetails=true" \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "staffId": "staff_id_1",
    "overallScore": 85,
    "summary": {
      "taskMetrics": {
        "totalTasks": 25,
        "completedTasks": 22,
        "completionRate": 88,
        "onTimeCompletion": 20,
        "overdueTasks": 2
      },
      "leadMetrics": {
        "totalLeads": 15,
        "managedLeads": 12,
        "conversionRate": 80,
        "qualificationRate": 85
      },
      "calendarMetrics": {
        "totalEvents": 30,
        "completedEvents": 28,
        "availabilityPercentage": 92
      },
      "responseMetrics": {
        "averageResponseTime": 45,
        "responseRate": 95
      }
    },
    "period": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z"
    }
  }
}
```

### 10. Performance Comparison

**Endpoint:** `GET /api/staff/performance/comparison?startDate=2024-01-01&endDate=2024-01-31`

#### TC-013: Compare Staff Performance
```bash
curl -X GET "http://localhost:3000/api/staff/performance/comparison?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "staffId": "staff_id_1",
      "staffName": "John Doe",
      "overallScore": 85,
      "summary": {
        "taskCompletionRate": 88,
        "leadConversionRate": 80,
        "availabilityPercentage": 92
      }
    },
    {
      "staffId": "staff_id_2",
      "staffName": "Jane Smith",
      "overallScore": 78,
      "summary": {
        "taskCompletionRate": 82,
        "leadConversionRate": 75,
        "availabilityPercentage": 88
      }
    }
  ]
}
```

### 11. Performance Trends

**Endpoint:** `GET /api/staff/:id/performance/trends?period=monthly&months=6`

#### TC-014: Get Performance Trends
```bash
curl -X GET "http://localhost:3000/api/staff/staff_id_1/performance/trends?period=monthly&months=6" \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "2023-08",
      "overallScore": 75,
      "summary": {
        "taskCompletionRate": 80,
        "leadConversionRate": 70
      }
    },
    {
      "period": "2023-09",
      "overallScore": 78,
      "summary": {
        "taskCompletionRate": 82,
        "leadConversionRate": 72
      }
    }
  ]
}
```

### 12. Bulk Operations

**Endpoint:** `POST /api/staff/bulk-actions`

#### TC-015: Bulk Activate Staff
```bash
curl -X POST http://localhost:3000/api/staff/bulk-actions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "staffIds": ["staff_id_1", "staff_id_2"],
    "action": "activate"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bulk activate completed successfully",
  "modifiedCount": 2,
  "action": "activate"
}
```

#### TC-016: Bulk Deactivate Staff
```bash
curl -X POST http://localhost:3000/api/staff/bulk-actions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "staffIds": ["staff_id_1", "staff_id_2"],
    "action": "deactivate"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bulk deactivate completed successfully",
  "modifiedCount": 2,
  "action": "deactivate"
}
```

## Staff Calendar Endpoints

### 1. Create Calendar Event

**Endpoint:** `POST /api/staff-calendar`

#### TC-017: Create Calendar Event
```bash
curl -X POST http://localhost:3000/api/staff-calendar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "staffId": "staff_id_1",
    "eventType": "task",
    "title": "Follow up call",
    "description": "Call with potential client",
    "startTime": "2024-01-15T10:00:00.000Z",
    "endTime": "2024-01-15T11:00:00.000Z",
    "duration": 60,
    "priority": "high",
    "relatedTask": "task_id_1"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "calendar_event_id",
    "staffId": "staff_id_1",
    "eventType": "task",
    "title": "Follow up call",
    "description": "Call with potential client",
    "startTime": "2024-01-15T10:00:00.000Z",
    "endTime": "2024-01-15T11:00:00.000Z",
    "duration": 60,
    "priority": "high",
    "status": "scheduled",
    "relatedTask": "task_id_1"
  }
}
```

### 2. Get Calendar Events

**Endpoint:** `GET /api/staff-calendar?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20`

#### TC-018: Get Calendar Events
```bash
curl -X GET "http://localhost:3000/api/staff-calendar?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "calendar_event_id",
      "staffId": {
        "_id": "staff_id_1",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "eventType": "task",
      "title": "Follow up call",
      "startTime": "2024-01-15T10:00:00.000Z",
      "endTime": "2024-01-15T11:00:00.000Z",
      "status": "scheduled",
      "priority": "high"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

## Staff Appointment Endpoints

### 1. Assign Appointment to Staff

**Endpoint:** `POST /api/staff-appointments/assign`

#### TC-019: Assign Appointment to Staff
```bash
curl -X POST http://localhost:3000/api/staff-appointments/assign \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "appointment_id_1",
    "staffId": "staff_id_1"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Appointment assigned to staff successfully",
  "data": {
    "_id": "appointment_id_1",
    "coachId": "coach_id",
    "leadId": {
      "_id": "lead_id_1",
      "name": "John Lead",
      "email": "lead@example.com",
      "phone": "+1234567890"
    },
    "assignedStaffId": {
      "_id": "staff_id_1",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "startTime": "2024-01-15T10:00:00.000Z",
    "duration": 30,
    "summary": "Initial consultation",
    "status": "scheduled"
  }
}
```

### 2. Get Available Staff

**Endpoint:** `GET /api/staff-appointments/available-staff?appointmentDate=2024-01-15&appointmentTime=10:00&duration=30`

#### TC-020: Get Available Staff for Appointment
```bash
curl -X GET "http://localhost:3000/api/staff-appointments/available-staff?appointmentDate=2024-01-15&appointmentTime=10:00&duration=30" \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "staff_id_1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "permissions": ["calendar:read", "calendar:write"],
      "hasConflicts": false,
      "conflictCount": 0
    },
    {
      "_id": "staff_id_2",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "permissions": ["calendar:read"],
      "hasConflicts": true,
      "conflictCount": 1
    }
  ],
  "appointmentTime": {
    "start": "2024-01-15T10:00:00.000Z",
    "end": "2024-01-15T10:30:00.000Z",
    "duration": 30
  }
}
```

### 3. Get Staff Appointments

**Endpoint:** `GET /api/staff-appointments/staff/:staffId?startDate=2024-01-01&endDate=2024-01-31`

#### TC-021: Get Staff Appointments
```bash
curl -X GET "http://localhost:3000/api/staff-appointments/staff/staff_id_1?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "appointment_id_1",
      "coachId": {
        "_id": "coach_id",
        "name": "Coach Name",
        "email": "coach@example.com"
      },
      "leadId": {
        "_id": "lead_id_1",
        "name": "John Lead",
        "email": "lead@example.com",
        "phone": "+1234567890"
      },
      "assignedStaffId": "staff_id_1",
      "startTime": "2024-01-15T10:00:00.000Z",
      "duration": 30,
      "summary": "Initial consultation",
      "status": "scheduled"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

## Staff Dashboard Endpoints

### 1. Get Dashboard Data

**Endpoint:** `GET /api/staff-dashboard/data?timeRange=30`

#### TC-022: Get Complete Dashboard Data
```bash
curl -X GET "http://localhost:3000/api/staff-dashboard/data?timeRange=30" \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalTasks": 25,
      "completedTasks": 22,
      "pendingTasks": 3,
      "overdueTasks": 1,
      "totalLeads": 15,
      "managedLeads": 12,
      "upcomingAppointments": 5,
      "todayEvents": 3
    },
    "tasks": {
      "recent": [...],
      "upcoming": [...],
      "overdue": [...]
    },
    "performance": {
      "overallScore": 85,
      "taskCompletionRate": 88,
      "leadConversionRate": 80,
      "responseTime": 45
    },
    "achievements": [...],
    "team": {
      "leaderboard": [...],
      "teamStats": {...}
    },
    "recentActivity": [...],
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

## Test Data Setup

### Required Test Data

1. **Coach Account**
   - Valid coach with authentication token
   - Multiple staff members under the coach

2. **Staff Members**
   - Active staff with various permission sets
   - Inactive staff for testing
   - Staff with different performance levels

3. **Tasks**
   - Tasks assigned to different staff members
   - Tasks in various states (pending, completed, overdue)

4. **Leads**
   - Leads assigned to staff members
   - Leads in different stages

5. **Calendar Events**
   - Various types of calendar events
   - Events with different priorities and statuses

6. **Appointments**
   - Appointments with and without staff assignments
   - Appointments in different time slots

### Test Environment Setup

```bash
# Set up test database
export NODE_ENV=test
export MONGODB_URI=mongodb://localhost:27017/staff_management_test

# Run test setup script
node scripts/setup-test-data.js
```

## Error Handling Tests

### Authentication Errors

#### TC-023: Missing Authentication Token
```bash
curl -X GET http://localhost:3000/api/staff
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

#### TC-024: Invalid Authentication Token
```bash
curl -X GET http://localhost:3000/api/staff \
  -H "Authorization: Bearer invalid_token"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### Permission Errors

#### TC-025: Insufficient Permissions
```bash
# Test with staff member trying to access coach-only endpoint
curl -X POST http://localhost:3000/api/staff \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Staff",
    "email": "new@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Only coach/admin can create staff."
}
```

### Validation Errors

#### TC-026: Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/staff \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "name, email, password are required."
}
```

#### TC-027: Invalid Email Format
```bash
curl -X POST http://localhost:3000/api/staff \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "invalid-email",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

## Performance Tests

### Load Testing

#### TC-028: Bulk Staff Creation
```bash
# Test creating 100 staff members simultaneously
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/staff \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Staff Member $i\",
      \"email\": \"staff$i@example.com\",
      \"password\": \"password123\"
    }" &
done
wait
```

#### TC-029: Concurrent Dashboard Access
```bash
# Test 50 concurrent dashboard requests
for i in {1..50}; do
  curl -X GET "http://localhost:3000/api/staff-dashboard/data?timeRange=30" \
    -H "Authorization: Bearer <token>" &
done
wait
```

### Response Time Tests

#### TC-030: Staff List Response Time
```bash
time curl -X GET http://localhost:3000/api/staff \
  -H "Authorization: Bearer <token>"
```

**Expected:** Response time < 500ms for 100 staff members

#### TC-031: Dashboard Data Response Time
```bash
time curl -X GET "http://localhost:3000/api/staff-dashboard/data?timeRange=30" \
  -H "Authorization: Bearer <token>"
```

**Expected:** Response time < 1000ms for complete dashboard data

## Security Tests

### Data Access Control

#### TC-032: Cross-Coach Access Prevention
```bash
# Test staff member from coach A trying to access staff from coach B
curl -X GET http://localhost:3000/api/staff/staff_from_coach_b \
  -H "Authorization: Bearer <coach_a_token>"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Forbidden"
}
```

#### TC-033: Staff Self-Access Control
```bash
# Test staff member accessing their own data
curl -X GET http://localhost:3000/api/staff/staff_id_1 \
  -H "Authorization: Bearer <staff_token>"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Only coach/admin can access staff details"
}
```

## Integration Tests

### End-to-End Workflow

#### TC-034: Complete Staff Management Workflow
1. Create staff member
2. Assign permissions
3. Create calendar event
4. Assign appointment
5. Check dashboard data
6. Update performance
7. Deactivate staff

```bash
# Step 1: Create staff
STAFF_ID=$(curl -X POST http://localhost:3000/api/staff \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Staff",
    "email": "test@example.com",
    "password": "password123",
    "permissions": ["leads:read", "tasks:read", "calendar:read"]
  }' | jq -r '.data._id')

# Step 2: Update permissions
curl -X POST http://localhost:3000/api/staff/$STAFF_ID/permissions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["leads:read", "leads:write", "tasks:read", "tasks:write", "calendar:read", "calendar:write"]
  }'

# Step 3: Create calendar event
curl -X POST http://localhost:3000/api/staff-calendar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{
    \"staffId\": \"$STAFF_ID\",
    \"eventType\": \"task\",
    \"title\": \"Test Event\",
    \"startTime\": \"2024-01-15T10:00:00.000Z\",
    \"endTime\": \"2024-01-15T11:00:00.000Z\",
    \"duration\": 60
  }"

# Step 4: Check dashboard
curl -X GET "http://localhost:3000/api/staff-dashboard/data?timeRange=30" \
  -H "Authorization: Bearer <token>"

# Step 5: Deactivate staff
curl -X DELETE http://localhost:3000/api/staff/$STAFF_ID \
  -H "Authorization: Bearer <token>"
```

## Conclusion

This testing documentation provides comprehensive coverage for all staff management endpoints. Each test case includes:

- Clear test scenarios
- Expected request/response formats
- Error handling validation
- Performance benchmarks
- Security considerations

The tests should be run in a controlled test environment with proper data isolation and cleanup procedures.
