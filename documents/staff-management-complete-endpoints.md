# Staff Management System - Complete Endpoints Summary

## Overview

The Staff Management System is now fully implemented with comprehensive endpoints covering staff management, permissions, calendar management, appointments, and dashboard functionality. This document provides a complete overview of all available endpoints.

## System Components

### ✅ **FULLY IMPLEMENTED**

1. **Staff Management & Permissions** - Complete CRUD operations with role-based access
2. **Staff Calendar Management** - Full calendar event management with recurring events
3. **Staff Appointment System** - Coach-assigned appointments to staff members
4. **Staff Dashboard** - Real-time analytics and performance tracking
5. **Staff Performance Analytics** - Comprehensive metrics and comparison tools
6. **Staff Leaderboard** - Gamification and team performance tracking

## Complete Endpoint List

### 🔐 **Staff Management Endpoints** (`/api/staff`)

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

### 📅 **Staff Calendar Endpoints** (`/api/staff-calendar`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/` | Create calendar event | All |
| `GET` | `/` | List calendar events | All |
| `GET` | `/:id` | Get specific event | All |
| `PUT` | `/:id` | Update calendar event | All |
| `DELETE` | `/:id` | Delete calendar event | All |
| `GET` | `/staff/:staffId/availability` | Get staff availability | All |
| `POST` | `/bulk-create` | Bulk create events | All |

### 📋 **Staff Appointment Endpoints** (`/api/staff-appointments`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/assign` | Assign appointment to staff | Coach/Admin |
| `GET` | `/available-staff` | Get available staff for assignment | Coach/Admin |
| `POST` | `/bulk-assign` | Bulk assign appointments | Coach/Admin |
| `GET` | `/staff/:staffId` | Get staff appointments | All |
| `GET` | `/staff/:staffId/calendar` | Get staff calendar view | All |
| `PUT` | `/:appointmentId/unassign` | Unassign appointment | Coach/Admin |

### 📊 **Staff Dashboard Endpoints** (`/api/staff-dashboard`)

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

### 🏆 **Staff Leaderboard Endpoints** (`/api/staff-leaderboard`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/` | Get leaderboard | All |
| `GET` | `/staff/:staffId` | Get staff ranking | All |
| `GET` | `/stats` | Get leaderboard statistics | All |
| `POST` | `/recalculate` | Recalculate scores | Coach/Admin |

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

## Key Features

### 🔐 **Security & Access Control**
- Role-based access control (Coach, Admin, Staff)
- Granular permission system
- Cross-coach data isolation
- Secure password management
- Email verification system

### 📊 **Performance Tracking**
- Real-time performance metrics
- Task completion rates
- Lead conversion tracking
- Response time monitoring
- Availability tracking
- Performance trends over time

### 📅 **Calendar Management**
- Event creation and management
- Recurring events support
- Conflict detection
- Availability tracking
- Priority levels
- Status management

### 📋 **Appointment System**
- Coach-to-staff appointment assignment
- Conflict detection
- Availability checking
- Bulk assignment operations
- Calendar integration

### 🏆 **Gamification**
- Leaderboard system
- Performance scoring
- Achievement tracking
- Team comparison
- Progress monitoring

### 📈 **Analytics & Reporting**
- Comprehensive dashboard
- Performance analytics
- Team statistics
- Trend analysis
- Export capabilities

## Testing

Comprehensive testing documentation is available in:
- `documents/staff-management-testing-documentation.md`

The testing documentation includes:
- 34 test cases covering all endpoints
- Authentication and authorization tests
- Error handling validation
- Performance benchmarks
- Security testing
- Integration testing

## Usage Examples

### Creating a Staff Member
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

### Assigning an Appointment to Staff
```bash
curl -X POST http://localhost:3000/api/staff-appointments/assign \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "appointment_id_1",
    "staffId": "staff_id_1"
  }'
```

### Getting Staff Dashboard Data
```bash
curl -X GET "http://localhost:3000/api/staff-dashboard/data?timeRange=30" \
  -H "Authorization: Bearer <token>"
```

## Conclusion

The Staff Management System is now complete with:

- ✅ **34 API endpoints** covering all functionality
- ✅ **Comprehensive permission system** with 8 permission groups
- ✅ **Complete CRUD operations** for all entities
- ✅ **Real-time analytics** and performance tracking
- ✅ **Calendar and appointment management**
- ✅ **Gamification and leaderboard system**
- ✅ **Security and access control**
- ✅ **Comprehensive testing documentation**

The system provides coaches with powerful tools to manage their team, track performance, and automate business processes through intelligent task assignment and workflow management.
