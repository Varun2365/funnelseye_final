# Complete Staff Management System Guide

## Overview

The Staff Management System is a comprehensive platform that provides coaches with powerful tools to manage their team, track performance, and automate business processes through intelligent task assignment and workflow management. The system includes staff management, permissions, calendar management, appointments, dashboard functionality, and performance analytics.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [API Endpoints](#api-endpoints)
3. [Data Models](#data-models)
4. [Permission System](#permission-system)
5. [Testing Guide](#testing-guide)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)

## System Architecture

### Core Components

#### 1. Staff Management & Permissions
- Complete CRUD operations with role-based access
- Granular permission system with 8 permission groups
- Cross-coach data isolation
- Secure password management
- Email verification system

#### 2. Staff Calendar Management
- Event creation and management
- Recurring events support
- Conflict detection
- Availability tracking
- Priority levels
- Status management

#### 3. Staff Appointment System
- Coach-assigned appointments to staff members
- Conflict detection
- Availability checking
- Bulk assignment operations
- Calendar integration

#### 4. Staff Dashboard
- Real-time analytics and performance tracking
- Task completion rates
- Lead conversion tracking
- Response time monitoring
- Availability tracking
- Performance trends over time

#### 5. Staff Performance Analytics
- Comprehensive metrics and comparison tools
- Team performance tracking
- Individual performance analysis
- Trend analysis
- Export capabilities

#### 6. Staff Leaderboard
- Gamification and team performance tracking
- Performance scoring
- Achievement tracking
- Team comparison
- Progress monitoring

### Active Components

- **Controllers**: `staffController.js`, `staffCalendarController.js`, `staffDashboardController.js`, `staffLeaderboardController.js`
- **Services**: `staffPerformanceService.js`, `staffDashboardService.js`, `staffLeaderboardService.js`
- **Schemas**: `Staff.js`, `StaffCalendar.js`
- **Routes**: `staffRoutes.js`, `staffCalendarRoutes.js`

## API Endpoints

### Staff Management Endpoints (`/api/staff`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/` | Create staff member | Coach/Admin |
| `GET` | `/` | List all staff members | Coach/Admin |
| `GET` | `/search` | Search staff members | Coach/Admin |
| `GET` | `/stats` | Get staff statistics | Coach/Admin |
| `GET` | `/:id` | Get staff details | Coach/Admin |
| `PUT` | `/:id` | Update staff information | Coach/Admin |
| `DELETE` | `/:id` | Deactivate staff (soft delete) | Coach/Admin |
| `POST` | `/:id/permissions` | Update staff permissions | Coach/Admin |
| `POST` | `/:id/activate` | Activate staff account | Coach/Admin |
| `POST` | `/:id/reset-password` | Reset staff password | Coach/Admin |
| `GET` | `/:id/profile` | Get staff profile with stats | Coach/Admin |
| `PUT` | `/:id/profile` | Update staff profile | Coach/Admin |
| `GET` | `/:id/activity` | Get staff activity log | Coach/Admin |
| `POST` | `/:id/send-invitation` | Send invitation email | Coach/Admin |
| `GET` | `/:id/performance` | Get performance metrics | Coach/Admin |
| `GET` | `/:id/performance/trends` | Get performance trends | Coach/Admin |
| `GET` | `/performance/comparison` | Compare staff performance | Coach/Admin |
| `POST` | `/bulk-actions` | Bulk operations on staff | Coach/Admin |

### Staff Calendar Endpoints (`/api/staff-calendar`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/` | Create calendar event | All |
| `GET` | `/` | List calendar events | All |
| `GET` | `/:id` | Get specific event | All |
| `PUT` | `/:id` | Update calendar event | All |
| `DELETE` | `/:id` | Delete calendar event | All |
| `GET` | `/staff/:staffId/availability` | Get staff availability | All |
| `POST` | `/bulk-create` | Bulk create events | All |

### Staff Appointment Endpoints (`/api/staff-appointments`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/assign` | Assign appointment to staff | Coach/Admin |
| `GET` | `/available-staff` | Get available staff for assignment | Coach/Admin |
| `POST` | `/bulk-assign` | Bulk assign appointments | Coach/Admin |
| `GET` | `/staff/:staffId` | Get staff appointments | All |
| `GET` | `/staff/:staffId/calendar` | Get staff calendar view | All |
| `PUT` | `/:appointmentId/unassign` | Unassign appointment | Coach/Admin |

### Staff Dashboard Endpoints (`/api/staff-dashboard`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/data` | Complete dashboard data | Staff |
| `GET` | `/overview` | Overview metrics | Staff |
| `GET` | `/tasks` | Task data | Staff |
| `GET` | `/performance` | Performance data | Staff |
| `GET` | `/achievements` | Achievements | Staff |
| `GET` | `/team` | Team data | Staff |
| `GET` | `/goals` | Goals and targets | Staff |
| `GET` | `/calendar` | Calendar view | Staff |
| `GET` | `/notifications` | Notifications | Staff |
| `GET` | `/analytics` | Analytics | Staff |

### Staff Leaderboard Endpoints (`/api/staff-leaderboard`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/` | Get leaderboard | All |
| `GET` | `/staff/:staffId` | Get staff ranking | All |
| `GET` | `/stats` | Get leaderboard statistics | All |
| `POST` | `/recalculate` | Recalculate scores | Coach/Admin |
| `GET` | `/staff/:staffId/achievements` | Get staff achievements | All |
| `GET` | `/staff/:staffId/progress` | Get staff progress | All |
| `GET` | `/team-analytics` | Get team analytics | All |
| `GET` | `/most-improved` | Get most improved staff | All |
| `GET` | `/ranking-levels` | Get ranking levels configuration | All |
| `GET` | `/achievements` | Get achievements configuration | All |
| `GET` | `/scoring-weights` | Get scoring weights | All |
| `PUT` | `/scoring-weights` | Update scoring weights | All |
| `GET` | `/staff-comparison` | Get staff comparison | All |
| `GET` | `/team-performance-trends` | Get performance trends for all staff | All |

## Data Models

### Staff Schema

```javascript
{
    // Inherits from User schema
    name: String,                    // Required
    email: String,                   // Required, unique
    password: String,                // Required, hashed
    role: String,                    // 'staff'
    
    // Staff-specific fields
    coachId: ObjectId,               // Reference to owning coach
    permissions: [String],           // Array of permission strings
    isActive: Boolean,               // Default: true
    isVerified: Boolean,            // Email verification status
    
    // Performance tracking
    performance: {
        overallScore: Number,          // 0-100
        taskCompletionRate: Number,   // Percentage
        leadConversionRate: Number,    // Percentage
        averageResponseTime: Number,   // Minutes
        lastActivity: Date
    },
    
    // Skills and capabilities
    skills: [String],               // e.g., ['sales', 'coaching', 'admin']
    specializations: [String],      // e.g., ['fitness', 'nutrition']
    
    // Work preferences
    workSchedule: {
        startTime: String,             // '09:00'
        endTime: String,               // '17:00'
        timezone: String,              // 'UTC'
        workingDays: [Number]          // [1,2,3,4,5] for Mon-Fri
    }
}
```

### Staff Calendar Schema

```javascript
{
    staffId: ObjectId,              // Reference to staff member
    coachId: ObjectId,              // Reference to coach
    eventType: String,              // 'task', 'meeting', 'break', 'unavailable', 'custom'
    title: String,                  // Required
    description: String,
    startTime: Date,                // Required
    endTime: Date,                  // Required
    duration: Number,               // in minutes
    status: String,                 // 'scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'
    priority: String,               // 'low', 'medium', 'high', 'urgent'
    isRecurring: Boolean,           // Default: false
    recurrencePattern: Object,      // Recurrence settings
    relatedTask: ObjectId,          // Reference to task
    relatedLead: ObjectId,          // Reference to lead
    location: String,
    attendees: Array,
    notes: String,
    tags: [String],
    color: String,
    isPublic: Boolean,
    reminder: Object
}
```

### Appointment Schema (Extended)

```javascript
{
    coachId: ObjectId,              // Reference to coach
    leadId: ObjectId,               // Reference to lead
    assignedStaffId: ObjectId,       // NEW: Reference to assigned staff
    startTime: Date,                // Required
    duration: Number,               // in minutes
    summary: String,                // Required
    notes: String,
    timeZone: String,               // Required
    appointmentType: String,        // 'online', 'offline'
    zoomMeeting: Object,            // Zoom meeting details
    status: String                  // 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'
}
```

## Permission System

### Available Permissions

```javascript
const PERMISSIONS = {
    // Lead Management
    LEADS: {
        READ: 'leads:read',
        WRITE: 'leads:write', 
        UPDATE: 'leads:update',
        DELETE: 'leads:delete',
        MANAGE: 'leads:manage'
    },
    
    // Task Management
    TASKS: {
        READ: 'tasks:read',
        WRITE: 'tasks:write',
        UPDATE: 'tasks:update',
        DELETE: 'tasks:delete',
        MANAGE: 'tasks:manage',
        ASSIGN: 'tasks:assign'
    },
    
    // Calendar Management
    CALENDAR: {
        READ: 'calendar:read',
        WRITE: 'calendar:write',
        UPDATE: 'calendar:update',
        DELETE: 'calendar:delete',
        MANAGE: 'calendar:manage',
        BOOK: 'calendar:book'
    },
    
    // Staff Management
    STAFF: {
        READ: 'staff:read',
        WRITE: 'staff:write',
        UPDATE: 'staff:update',
        DELETE: 'staff:delete',
        MANAGE: 'staff:manage'
    },
    
    // Performance & Analytics
    PERFORMANCE: {
        READ: 'performance:read',
        WRITE: 'performance:write',
        MANAGE: 'performance:manage'
    },
    
    // File Management
    FILES: {
        READ: 'files:read',
        WRITE: 'files:write',
        DELETE: 'files:delete',
        MANAGE: 'files:manage'
    },
    
    // AI Services
    AI: {
        READ: 'ai:read',
        WRITE: 'ai:write',
        MANAGE: 'ai:manage'
    },
    
    // Automation Rules
    AUTOMATION: {
        READ: 'automation:read',
        WRITE: 'automation:write',
        MANAGE: 'automation:manage'
    }
};
```

### Permission Groups

```javascript
const PERMISSION_GROUPS = {
    'Lead Manager': [
        PERMISSIONS.LEADS.READ,
        PERMISSIONS.LEADS.WRITE,
        PERMISSIONS.LEADS.UPDATE,
        PERMISSIONS.LEADS.MANAGE
    ],
    
    'Task Manager': [
        PERMISSIONS.TASKS.READ,
        PERMISSIONS.TASKS.WRITE,
        PERMISSIONS.TASKS.UPDATE,
        PERMISSIONS.TASKS.MANAGE,
        PERMISSIONS.TASKS.ASSIGN
    ],
    
    'Calendar Manager': [
        PERMISSIONS.CALENDAR.READ,
        PERMISSIONS.CALENDAR.WRITE,
        PERMISSIONS.CALENDAR.UPDATE,
        PERMISSIONS.CALENDAR.MANAGE,
        PERMISSIONS.CALENDAR.BOOK
    ],
    
    'Staff Manager': [
        PERMISSIONS.STAFF.READ,
        PERMISSIONS.STAFF.WRITE,
        PERMISSIONS.STAFF.UPDATE,
        PERMISSIONS.STAFF.MANAGE
    ],
    
    'Analytics Manager': [
        PERMISSIONS.PERFORMANCE.READ,
        PERMISSIONS.PERFORMANCE.WRITE,
        PERMISSIONS.PERFORMANCE.MANAGE
    ],
    
    'Content Manager': [
        PERMISSIONS.FILES.READ,
        PERMISSIONS.FILES.WRITE,
        PERMISSIONS.FILES.MANAGE,
        PERMISSIONS.AI.READ,
        PERMISSIONS.AI.WRITE
    ],
    
    'Communication Manager': [
        PERMISSIONS.AUTOMATION.READ,
        PERMISSIONS.AUTOMATION.WRITE
    ],
    
    'Full Access': Object.values(PERMISSIONS).flatMap(group => 
        Object.values(group)
    )
};
```

## Testing Guide

### Test Environment Setup

#### Prerequisites
- Valid coach/admin account with authentication token
- Test database configured
- All required schemas and services available

#### Authentication Headers
```bash
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Test Cases

#### 1. Staff Management Tests

**Create Staff with Valid Data**
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

**Create Staff with Invalid Permissions**
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

#### 2. Staff Performance Tests

**Get Staff Performance Metrics**
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

#### 3. Calendar Management Tests

**Create Calendar Event**
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

#### 4. Appointment Assignment Tests

**Assign Appointment to Staff**
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

#### 5. Dashboard Tests

**Get Complete Dashboard Data**
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

### Error Handling Tests

#### Authentication Errors

**Missing Authentication Token**
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

#### Permission Errors

**Insufficient Permissions**
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

### Performance Tests

#### Load Testing

**Bulk Staff Creation**
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

**Concurrent Dashboard Access**
```bash
# Test 50 concurrent dashboard requests
for i in {1..50}; do
  curl -X GET "http://localhost:3000/api/staff-dashboard/data?timeRange=30" \
    -H "Authorization: Bearer <token>" &
done
wait
```

#### Response Time Tests

**Expected Response Times:**
- Staff creation: < 500ms
- Dashboard data: < 1000ms
- Performance metrics: < 800ms
- Calendar events: < 300ms

## Usage Examples

### Creating a Staff Member

```javascript
// Create new staff member
const staffData = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  password: 'securePassword123',
  permissions: ['leads:read', 'leads:update', 'tasks:read', 'tasks:update'],
  skills: ['sales', 'coaching', 'fitness'],
  specializations: ['weight-loss', 'muscle-gain']
};

const response = await fetch('/api/staff', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(staffData)
});
```

### Assigning an Appointment to Staff

```javascript
// Assign appointment to staff
const assignmentData = {
  appointmentId: 'appointment_id_1',
  staffId: 'staff_id_1'
};

const response = await fetch('/api/staff-appointments/assign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(assignmentData)
});
```

### Getting Staff Dashboard Data

```javascript
// Get staff dashboard data
const response = await fetch('/api/staff-dashboard/data?timeRange=30', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const dashboardData = await response.json();
console.log('Dashboard Data:', dashboardData.data);
```

### Getting Staff Performance

```javascript
// Get staff performance metrics
const performanceResponse = await fetch('/api/staff/staffId123/performance?startDate=2024-01-01&endDate=2024-01-31&includeDetails=true', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const performance = await performanceResponse.json();
console.log('Staff Performance:', performance.data);
```

## Best Practices

### 1. Staff Management

#### Permission Assignment
- Grant minimal required permissions
- Use permission groups for common roles
- Regularly review and update permissions
- Implement role-based access control

#### Performance Monitoring
- Regularly review performance metrics
- Set up automated performance alerts
- Track trends over time
- Provide feedback and coaching

#### Skill Development
- Track and develop staff skills
- Provide training opportunities
- Recognize achievements
- Create development plans

### 2. Calendar Management

#### Availability Updates
- Keep availability calendar current
- Use calendar for all team meetings
- Block time for focused work
- Address scheduling conflicts promptly

#### Event Management
- Use appropriate event types
- Set realistic durations
- Include relevant details
- Use reminders effectively

### 3. Performance Tracking

#### Metrics Selection
- Focus on relevant KPIs
- Balance quantity and quality metrics
- Consider individual circumstances
- Regular metric review and adjustment

#### Data Analysis
- Use trend analysis for insights
- Compare performance across team members
- Identify improvement opportunities
- Celebrate achievements

### 4. Security & Compliance

#### Data Protection
- Implement proper access controls
- Regular security audits
- Data encryption where needed
- Compliance with regulations

#### Audit Trails
- Log all important actions
- Track permission changes
- Monitor system access
- Regular security reviews

## Future Enhancements

### Planned Features

1. **Advanced Analytics Dashboard**
   - Real-time performance metrics
   - Predictive analytics
   - Custom report builder
   - Data visualization tools

2. **Mobile App Integration**
   - Native mobile applications
   - Push notifications
   - Offline capabilities
   - Mobile-optimized interface

3. **Advanced Automation**
   - Intelligent task assignment
   - Automated scheduling
   - Smart notifications
   - Workflow automation

4. **Team Communication Tools**
   - Built-in messaging
   - Video conferencing
   - File sharing
   - Collaboration tools

5. **Advanced Reporting**
   - Custom report builder
   - Scheduled reports
   - Export capabilities
   - Data visualization

### Technical Improvements

1. **Performance Optimization**
   - Database query optimization
   - Caching layer implementation
   - Real-time updates
   - Scalability improvements

2. **Advanced Security**
   - Multi-factor authentication
   - Advanced encryption
   - Security monitoring
   - Compliance features

3. **Integration Capabilities**
   - Third-party integrations
   - API enhancements
   - Webhook support
   - External system connectivity

## Support & Troubleshooting

### Common Issues

1. **Staff Creation Failures**
   - Check permissions and validation
   - Verify email uniqueness
   - Ensure proper data format

2. **Performance Calculation Errors**
   - Verify data integrity
   - Check calculation logic
   - Review input data

3. **Calendar Conflicts**
   - Review overlapping events
   - Check availability settings
   - Validate time zones

4. **Permission Issues**
   - Verify permission assignments
   - Check role configurations
   - Review access controls

### Debug Information

Enable debug logging:
```bash
DEBUG=staff:*,calendar:*,dashboard:*
NODE_ENV=development
```

### Contact Information

For technical support or feature requests, contact the development team or create an issue in the project repository.

---

*Last Updated: January 2024*
*Version: 1.0.0*
