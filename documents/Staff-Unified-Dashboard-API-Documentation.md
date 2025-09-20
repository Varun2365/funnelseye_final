# Staff Unified Dashboard API Documentation

## Overview

The Staff Unified Dashboard API (`/api/staff-unified/v1`) provides a comprehensive dashboard system that mirrors the coach dashboard functionality but with granular permission-based access control. Each section can be individually controlled by coach-assigned permissions, allowing coaches to customize what their staff members can access and modify.

## Key Features

- **Full Coach Feature Access**: Staff can perform all coach operations (create, read, update, delete) based on permissions
- **Permission-Based Access Control**: Each dashboard section and operation requires specific permissions
- **Granular Funnel Management**: Detailed permissions for funnel creation, editing, stage management, and analytics
- **Complete CRUD Operations**: Full create, read, update, delete functionality for all sections
- **Real-time Permission Validation**: All endpoints validate permissions before allowing access
- **Staff-Specific Data**: Tasks and performance data are filtered to show only staff-relevant information
- **Coach Data Access**: Staff can view and manage coach's leads, marketing, financial, and team data based on permissions
- **Task Assignment**: Staff can assign tasks to other team members (if permitted)
- **Team Management**: Staff can manage other staff members and their permissions (if permitted)

## Authentication

All endpoints require authentication via the `protect` middleware. The API automatically validates:
- Staff account exists and is active
- Staff has proper permissions for requested sections
- Coach ownership of data being accessed

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
    
    // Funnel Management
    FUNNELS: {
        READ: 'funnels:read',
        WRITE: 'funnels:write',
        UPDATE: 'funnels:update',
        DELETE: 'funnels:delete',
        MANAGE: 'funnels:manage',
        VIEW_ANALYTICS: 'funnels:view_analytics',
        EDIT_STAGES: 'funnels:edit_stages',
        MANAGE_STAGES: 'funnels:manage_stages',
        PUBLISH: 'funnels:publish',
        UNPUBLISH: 'funnels:unpublish'
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
    
    'Funnel Editor': [
        PERMISSIONS.FUNNELS.READ,
        PERMISSIONS.FUNNELS.UPDATE,
        PERMISSIONS.FUNNELS.EDIT_STAGES,
        PERMISSIONS.FUNNELS.VIEW_ANALYTICS
    ],
    
    'Funnel Manager': [
        PERMISSIONS.FUNNELS.READ,
        PERMISSIONS.FUNNELS.WRITE,
        PERMISSIONS.FUNNELS.UPDATE,
        PERMISSIONS.FUNNELS.MANAGE,
        PERMISSIONS.FUNNELS.VIEW_ANALYTICS,
        PERMISSIONS.FUNNELS.EDIT_STAGES,
        PERMISSIONS.FUNNELS.MANAGE_STAGES,
        PERMISSIONS.FUNNELS.PUBLISH,
        PERMISSIONS.FUNNELS.UNPUBLISH
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
    
    'Full Access': Object.values(PERMISSIONS).flatMap(group => 
        Object.values(group)
    )
};
```

## API Endpoints

### Dashboard Data

#### Get Complete Dashboard Data
**GET** `/api/staff-unified/v1/data`

Get complete dashboard data with permission filtering.

**Query Parameters:**
- `timeRange` (optional): Number of days to look back (default: 30)
- `sections` (optional): Comma-separated list of sections to include (default: 'all')

**Response:**
```json
{
    "success": true,
    "data": {
        "metadata": {
            "staffId": "65a1b2c3d4e5f6789012345a",
            "coachId": "65a1b2c3d4e5f6789012345b",
            "timeRange": 30,
            "requestedSections": ["overview", "leads", "tasks"],
            "lastUpdated": "2025-01-20T11:00:00Z",
            "permissions": ["leads:read", "tasks:read", "performance:read"]
        },
        "overview": { /* overview data */ },
        "leads": { /* leads data */ },
        "tasks": { /* tasks data */ }
    }
}
```

#### Get Specific Dashboard Sections

**GET** `/api/staff-unified/v1/overview`
- **Required Permission**: `leads:read`, `tasks:read`, `performance:read`
- **Description**: Get overview metrics and quick actions

**GET** `/api/staff-unified/v1/leads`
- **Required Permission**: `leads:read`
- **Description**: Get leads analytics and funnel data

**GET** `/api/staff-unified/v1/tasks`
- **Required Permission**: `tasks:read`
- **Description**: Get tasks analytics and distribution (staff-specific)

**GET** `/api/staff-unified/v1/marketing`
- **Required Permission**: `leads:read`, `performance:read`
- **Description**: Get marketing analytics and AI insights

**GET** `/api/staff-unified/v1/financial`
- **Required Permission**: `performance:read`
- **Description**: Get financial analytics and revenue trends

**GET** `/api/staff-unified/v1/team`
- **Required Permission**: `staff:read`, `performance:read`
- **Description**: Get team analytics and leaderboard

**GET** `/api/staff-unified/v1/performance`
- **Required Permission**: `performance:read`
- **Description**: Get performance analytics and KPIs (staff-specific)

**GET** `/api/staff-unified/v1/calendar`
- **Required Permission**: `calendar:read`
- **Description**: Get calendar data and appointments

### Lead Management

#### Create New Lead
**POST** `/api/staff-unified/v1/leads`
- **Required Permission**: `leads:write`
- **Description**: Create a new lead

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "source": "website",
    "status": "new"
}
```

#### Update Lead
**PUT** `/api/staff-unified/v1/leads/:leadId`
- **Required Permission**: `leads:update`
- **Description**: Update lead information

#### Delete Lead
**DELETE** `/api/staff-unified/v1/leads/:leadId`
- **Required Permission**: `leads:delete`
- **Description**: Delete a lead

#### Get Lead Details
**GET** `/api/staff-unified/v1/leads/:leadId`
- **Required Permission**: `leads:read`
- **Description**: Get detailed information about a specific lead

### Task Management

#### Create New Task
**POST** `/api/staff-unified/v1/tasks`
- **Required Permission**: `tasks:write`
- **Description**: Create a new task

**Request Body:**
```json
{
    "title": "Follow up with client",
    "description": "Call client to discuss pricing",
    "priority": "high",
    "dueDate": "2025-01-25T10:00:00Z",
    "assignedTo": "65a1b2c3d4e5f6789012345a"
}
```

#### Update Task
**PUT** `/api/staff-unified/v1/tasks/:taskId`
- **Required Permission**: `tasks:update`
- **Description**: Update task information

#### Delete Task
**DELETE** `/api/staff-unified/v1/tasks/:taskId`
- **Required Permission**: `tasks:delete`
- **Description**: Delete a task

#### Assign Task
**POST** `/api/staff-unified/v1/tasks/:taskId/assign`
- **Required Permission**: `tasks:assign`
- **Description**: Assign task to a staff member

**Request Body:**
```json
{
    "assignedTo": "65a1b2c3d4e5f6789012345a"
}
```

#### Get Task Details
**GET** `/api/staff-unified/v1/tasks/:taskId`
- **Required Permission**: `tasks:read`
- **Description**: Get detailed information about a specific task

### Marketing Management

#### Get All Ad Campaigns
**GET** `/api/staff-unified/v1/marketing/campaigns`
- **Required Permission**: `leads:read`
- **Description**: Get all ad campaigns

#### Create Ad Campaign
**POST** `/api/staff-unified/v1/marketing/campaigns`
- **Required Permission**: `leads:write`
- **Description**: Create a new ad campaign

**Request Body:**
```json
{
    "name": "Summer Sale Campaign",
    "platform": "facebook",
    "budget": 1000,
    "status": "active"
}
```

#### Update Ad Campaign
**PUT** `/api/staff-unified/v1/marketing/campaigns/:campaignId`
- **Required Permission**: `leads:update`
- **Description**: Update ad campaign

#### Delete Ad Campaign
**DELETE** `/api/staff-unified/v1/marketing/campaigns/:campaignId`
- **Required Permission**: `leads:delete`
- **Description**: Delete an ad campaign

### Financial Management

#### Get All Payments
**GET** `/api/staff-unified/v1/financial/payments`
- **Required Permission**: `performance:read`
- **Description**: Get all payments

#### Get Payment Details
**GET** `/api/staff-unified/v1/financial/payments/:paymentId`
- **Required Permission**: `performance:read`
- **Description**: Get detailed payment information

#### Update Payment Status
**PUT** `/api/staff-unified/v1/financial/payments/:paymentId/status`
- **Required Permission**: `performance:write`
- **Description**: Update payment status

**Request Body:**
```json
{
    "status": "completed"
}
```

### Team Management

#### Get All Staff Members
**GET** `/api/staff-unified/v1/team/staff`
- **Required Permission**: `staff:read`
- **Description**: Get all staff members

#### Create New Staff Member
**POST** `/api/staff-unified/v1/team/staff`
- **Required Permission**: `staff:write`
- **Description**: Create a new staff member

**Request Body:**
```json
{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "staff",
    "permissions": ["leads:read", "tasks:read"]
}
```

#### Update Staff Member
**PUT** `/api/staff-unified/v1/team/staff/:staffId`
- **Required Permission**: `staff:update`
- **Description**: Update staff member information

#### Delete Staff Member
**DELETE** `/api/staff-unified/v1/team/staff/:staffId`
- **Required Permission**: `staff:delete`
- **Description**: Delete a staff member

#### Update Staff Permissions
**PUT** `/api/staff-unified/v1/team/staff/:staffId/permissions`
- **Required Permission**: `staff:manage`
- **Description**: Update staff member permissions

**Request Body:**
```json
{
    "permissions": ["leads:read", "leads:write", "tasks:read", "tasks:write"]
}
```

### Calendar Management

#### Get All Appointments
**GET** `/api/staff-unified/v1/calendar/appointments`
- **Required Permission**: `calendar:read`
- **Description**: Get all appointments

#### Create New Appointment
**POST** `/api/staff-unified/v1/calendar/appointments`
- **Required Permission**: `calendar:write`
- **Description**: Create a new appointment

**Request Body:**
```json
{
    "title": "Client Consultation",
    "startTime": "2025-01-25T10:00:00Z",
    "endTime": "2025-01-25T11:00:00Z",
    "clientId": "65a1b2c3d4e5f6789012345a",
    "notes": "Initial consultation call"
}
```

#### Update Appointment
**PUT** `/api/staff-unified/v1/calendar/appointments/:appointmentId`
- **Required Permission**: `calendar:update`
- **Description**: Update appointment information

#### Delete Appointment
**DELETE** `/api/staff-unified/v1/calendar/appointments/:appointmentId`
- **Required Permission**: `calendar:delete`
- **Description**: Delete an appointment

#### Book Appointment
**POST** `/api/staff-unified/v1/calendar/book`
- **Required Permission**: `calendar:book`
- **Description**: Book a new appointment

### Funnel Management

#### Get All Funnels
**GET** `/api/staff-unified/v1/funnels`
- **Required Permission**: `funnels:read`
- **Description**: Get all funnels with permission-based access control

**Response:**
```json
{
    "success": true,
    "data": {
        "totalFunnels": 5,
        "activeFunnels": 3,
        "funnels": [
            {
                "_id": "65a1b2c3d4e5f6789012345c",
                "name": "Weight Loss Funnel",
                "description": "Main weight loss conversion funnel",
                "isActive": true,
                "funnelUrl": "weight-loss-funnel",
                "permissions": {
                    "canEdit": true,
                    "canDelete": false,
                    "canManage": false,
                    "canViewAnalytics": true,
                    "canEditStages": true,
                    "canManageStages": false,
                    "canPublish": false,
                    "canUnpublish": false
                }
            }
        ]
    }
}
```

#### Get Specific Funnel Details
**GET** `/api/staff-unified/v1/funnels/:funnelId`
- **Required Permission**: `funnels:read`
- **Description**: Get detailed funnel information

#### Create New Funnel
**POST** `/api/staff-unified/v1/funnels`
- **Required Permission**: `funnels:write`
- **Description**: Create a new funnel

**Request Body:**
```json
{
    "name": "New Funnel",
    "description": "Funnel description",
    "funnelUrl": "new-funnel-url",
    "targetAudience": "customer",
    "stages": []
}
```

#### Update Funnel
**PUT** `/api/staff-unified/v1/funnels/:funnelId`
- **Required Permission**: `funnels:update`
- **Description**: Update funnel details

#### Delete Funnel
**DELETE** `/api/staff-unified/v1/funnels/:funnelId`
- **Required Permission**: `funnels:delete`
- **Description**: Delete a funnel

### Funnel Stage Management

#### Add Stage to Funnel
**POST** `/api/staff-unified/v1/funnels/:funnelId/stages`
- **Required Permission**: `funnels:manage_stages`
- **Description**: Add a new stage to a funnel

**Request Body:**
```json
{
    "name": "Landing Page",
    "type": "Landing",
    "html": "<div>Landing page content</div>",
    "isEnabled": true
}
```

#### Update Funnel Stage
**PUT** `/api/staff-unified/v1/funnels/:funnelId/stages/:stageId`
- **Required Permission**: `funnels:manage_stages`
- **Description**: Update a specific stage in a funnel

#### Delete Funnel Stage
**DELETE** `/api/staff-unified/v1/funnels/:funnelId/stages/:stageId`
- **Required Permission**: `funnels:manage_stages`
- **Description**: Delete a stage from a funnel

### Funnel Analytics and Publishing

#### Get Funnel Analytics
**GET** `/api/staff-unified/v1/funnels/:funnelId/analytics`
- **Required Permission**: `funnels:view_analytics`
- **Description**: Get analytics data for a specific funnel

**Response:**
```json
{
    "success": true,
    "data": {
        "funnelId": "65a1b2c3d4e5f6789012345c",
        "totalViews": 1250,
        "conversions": 45,
        "conversionRate": 3.6,
        "stageBreakdown": [
            {
                "stageId": "65a1b2c3d4e5f6789012345d",
                "name": "Landing Page",
                "views": 1250,
                "conversions": 45
            }
        ]
    }
}
```

#### Publish Funnel
**PUT** `/api/staff-unified/v1/funnels/:funnelId/publish`
- **Required Permission**: `funnels:publish`
- **Description**: Publish a funnel (set isActive to true)

#### Unpublish Funnel
**PUT** `/api/staff-unified/v1/funnels/:funnelId/unpublish`
- **Required Permission**: `funnels:unpublish`
- **Description**: Unpublish a funnel (set isActive to false)

### Dashboard Widgets

#### Get Dashboard Widgets
**GET** `/api/staff-unified/v1/widgets`
- **Description**: Get dashboard widgets configuration based on permissions

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "revenue_chart",
            "title": "Revenue Trends",
            "type": "chart",
            "data": { /* chart data */ }
        },
        {
            "id": "lead_funnel",
            "title": "Lead Conversion Funnel",
            "type": "funnel",
            "data": { /* funnel data */ }
        }
    ]
}
```

#### Get Specific Widget Data
**GET** `/api/staff-unified/v1/widgets/:widgetId`
- **Description**: Get data for a specific widget

## Error Responses

### Permission Denied (403)
```json
{
    "success": false,
    "message": "Insufficient permissions to access leads data",
    "requiredPermission": "leads:read",
    "currentPermissions": ["tasks:read", "performance:read"]
}
```

### Staff Account Issues (403)
```json
{
    "success": false,
    "message": "Your staff account has been deactivated. Please contact your coach.",
    "code": "STAFF_DEACTIVATED"
}
```

### Resource Not Found (404)
```json
{
    "success": false,
    "message": "Funnel not found"
}
```

## Usage Examples

### Assigning Permissions to Staff

Coaches can assign specific permission groups to staff members:

```javascript
// Assign Funnel Manager permissions
const funnelManagerPermissions = [
    'funnels:read',
    'funnels:write',
    'funnels:update',
    'funnels:manage',
    'funnels:view_analytics',
    'funnels:edit_stages',
    'funnels:manage_stages',
    'funnels:publish',
    'funnels:unpublish'
];

// Update staff permissions
await Staff.findByIdAndUpdate(staffId, {
    permissions: funnelManagerPermissions
});
```

### Frontend Integration

```javascript
// Check if staff can access specific sections
const canAccessLeads = staffPermissions.includes('leads:read');
const canEditFunnels = staffPermissions.includes('funnels:update');
const canManageStages = staffPermissions.includes('funnels:manage_stages');

// Conditionally show UI elements
if (canAccessLeads) {
    showLeadsSection();
}

if (canEditFunnels) {
    showFunnelEditButton();
}

if (canManageStages) {
    showStageManagementControls();
}
```

## Security Considerations

1. **Permission Validation**: All endpoints validate permissions before processing requests
2. **Coach Data Isolation**: Staff can only access data belonging to their assigned coach
3. **Staff-Specific Filtering**: Task and performance data is filtered to show only staff-relevant information
4. **Granular Funnel Control**: Funnel permissions allow fine-grained control over what staff can do with funnels
5. **Account Status Validation**: Inactive staff accounts are automatically blocked

## Migration from Legacy APIs

The new unified API replaces the need for multiple separate staff dashboard endpoints. Coaches can gradually migrate their staff to use the new permission-based system while maintaining backward compatibility with existing APIs.

## Support

For questions or issues with the Staff Unified Dashboard API, please refer to the main API documentation or contact the development team.
