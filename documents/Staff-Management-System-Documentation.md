# Staff Management System Documentation

## Overview

The Staff Management System provides comprehensive tools for coaches to manage their staff members, assign permissions, and control access to various features. This system includes permission viewing, staff creation, and granular permission management.

## Key Features

- **Permission Discovery**: View all available permissions and permission groups
- **Staff Creation**: Coaches can create new staff members with custom permissions
- **Permission Management**: Granular control over what each staff member can access
- **Permission Groups**: Pre-defined permission sets for common roles
- **Bulk Operations**: Manage multiple staff members at once
- **Status Management**: Activate/deactivate staff accounts

## API Endpoints

### Permission Discovery

#### Get All Permissions
**GET** `/api/permissions`
- **Description**: Get all available permissions and permission groups
- **Authentication**: Required (any authenticated user)
- **Response**:
```json
{
    "success": true,
    "data": {
        "permissions": {
            "LEADS": {
                "READ": "leads:read",
                "WRITE": "leads:write",
                "UPDATE": "leads:update",
                "DELETE": "leads:delete",
                "MANAGE": "leads:manage"
            },
            "TASKS": {
                "READ": "tasks:read",
                "WRITE": "tasks:write",
                "UPDATE": "tasks:update",
                "DELETE": "tasks:delete",
                "MANAGE": "tasks:manage",
                "ASSIGN": "tasks:assign"
            }
            // ... more permissions
        },
        "permissionGroups": {
            "Lead Manager": ["leads:read", "leads:write", "leads:update", "leads:manage"],
            "Task Manager": ["tasks:read", "tasks:write", "tasks:update", "tasks:manage", "tasks:assign"],
            "Funnel Manager": ["funnels:read", "funnels:write", "funnels:update", "funnels:manage", "funnels:view_analytics", "funnels:edit_stages", "funnels:manage_stages", "funnels:publish", "funnels:unpublish"]
            // ... more groups
        },
        "metadata": {
            "totalPermissions": 45,
            "totalGroups": 8,
            "lastUpdated": "2025-01-20T11:00:00Z"
        }
    }
}
```

#### Get Permission Groups Only
**GET** `/api/permissions/groups`
- **Description**: Get only the permission groups
- **Authentication**: Required (any authenticated user)

#### Get Section Permissions
**GET** `/api/permissions/section/:section`
- **Description**: Get permissions for a specific section (leads, tasks, funnels, etc.)
- **Authentication**: Required (any authenticated user)
- **Parameters**:
  - `section`: The section name (leads, tasks, funnels, etc.)

### Coach Staff Management

#### Get All Staff Members
**GET** `/api/coach/staff`
- **Description**: Get all staff members for the authenticated coach
- **Authentication**: Required (Coach only)
- **Response**:
```json
{
    "success": true,
    "data": [
        {
            "_id": "65a1b2c3d4e5f6789012345a",
            "name": "John Doe",
            "email": "john@example.com",
            "role": "staff",
            "coachId": "65a1b2c3d4e5f6789012345b",
            "permissions": ["leads:read", "leads:write", "tasks:read"],
            "isActive": true,
            "createdAt": "2025-01-20T10:00:00Z"
        }
    ]
}
```

#### Create New Staff Member
**POST** `/api/coach/staff`
- **Description**: Create a new staff member
- **Authentication**: Required (Coach only)
- **Request Body**:
```json
{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "securePassword123",
    "permissions": [
        "leads:read",
        "leads:write",
        "tasks:read",
        "tasks:write"
    ]
}
```
- **Response**:
```json
{
    "success": true,
    "data": {
        "_id": "65a1b2c3d4e5f6789012345c",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "staff",
        "coachId": "65a1b2c3d4e5f6789012345b",
        "permissions": ["leads:read", "leads:write", "tasks:read", "tasks:write"],
        "isActive": true,
        "createdAt": "2025-01-20T11:00:00Z"
    }
}
```

#### Update Staff Member
**PUT** `/api/coach/staff/:staffId`
- **Description**: Update staff member information
- **Authentication**: Required (Coach only)
- **Parameters**:
  - `staffId`: The staff member's ID
- **Request Body**:
```json
{
    "name": "Jane Smith Updated",
    "email": "jane.updated@example.com"
}
```

#### Delete Staff Member
**DELETE** `/api/coach/staff/:staffId`
- **Description**: Delete a staff member
- **Authentication**: Required (Coach only)
- **Parameters**:
  - `staffId`: The staff member's ID

#### Update Staff Permissions
**PUT** `/api/coach/staff/:staffId/permissions`
- **Description**: Update staff member permissions
- **Authentication**: Required (Coach only)
- **Parameters**:
  - `staffId`: The staff member's ID
- **Request Body**:
```json
{
    "permissions": [
        "leads:read",
        "leads:write",
        "leads:update",
        "tasks:read",
        "tasks:write",
        "funnels:read",
        "funnels:write"
    ]
}
```

#### Assign Permission Group
**POST** `/api/coach/staff/:staffId/permission-group`
- **Description**: Assign a pre-defined permission group to staff
- **Authentication**: Required (Coach only)
- **Parameters**:
  - `staffId`: The staff member's ID
- **Request Body**:
```json
{
    "groupName": "Lead Manager"
}
```
- **Available Groups**:
  - `Lead Manager`
  - `Funnel Editor`
  - `Funnel Manager`
  - `Task Manager`
  - `Calendar Manager`
  - `Staff Manager`
  - `Analytics Manager`
  - `Content Manager`
  - `Communication Manager`
  - `Full Access`

#### Toggle Staff Status
**PUT** `/api/coach/staff/:staffId/toggle-status`
- **Description**: Activate or deactivate a staff member
- **Authentication**: Required (Coach only)
- **Parameters**:
  - `staffId`: The staff member's ID
- **Response**:
```json
{
    "success": true,
    "data": {
        "staffId": "65a1b2c3d4e5f6789012345a",
        "isActive": false
    },
    "message": "Staff member deactivated successfully"
}
```

#### Get Staff Details
**GET** `/api/coach/staff/:staffId`
- **Description**: Get detailed information about a specific staff member
- **Authentication**: Required (Coach only)
- **Parameters**:
  - `staffId`: The staff member's ID

#### Get Staff Performance
**GET** `/api/coach/staff/:staffId/performance`
- **Description**: Get performance metrics for a staff member
- **Authentication**: Required (Coach only)
- **Parameters**:
  - `staffId`: The staff member's ID
- **Response**:
```json
{
    "success": true,
    "data": {
        "staffId": "65a1b2c3d4e5f6789012345a",
        "name": "John Doe",
        "email": "john@example.com",
        "isActive": true,
        "permissions": ["leads:read", "leads:write"],
        "lastActive": "2025-01-20T10:30:00Z",
        "createdAt": "2025-01-15T09:00:00Z",
        "metrics": {
            "tasksCompleted": 15,
            "leadsGenerated": 8,
            "performanceScore": 85
        }
    }
}
```

#### Bulk Update Permissions
**PUT** `/api/coach/staff/bulk-permissions`
- **Description**: Update permissions for multiple staff members
- **Authentication**: Required (Coach only)
- **Request Body**:
```json
{
    "staffUpdates": [
        {
            "staffId": "65a1b2c3d4e5f6789012345a",
            "permissions": ["leads:read", "leads:write"]
        },
        {
            "staffId": "65a1b2c3d4e5f6789012345b",
            "permissions": ["tasks:read", "tasks:write", "tasks:manage"]
        }
    ]
}
```
- **Response**:
```json
{
    "success": true,
    "data": [
        {
            "staffId": "65a1b2c3d4e5f6789012345a",
            "success": true,
            "data": { /* updated staff object */ }
        },
        {
            "staffId": "65a1b2c3d4e5f6789012345b",
            "success": true,
            "data": { /* updated staff object */ }
        }
    ]
}
```

## Permission Groups Reference

### Lead Manager
```json
[
    "leads:read",
    "leads:write",
    "leads:update",
    "leads:manage"
]
```

### Funnel Editor
```json
[
    "funnels:read",
    "funnels:update",
    "funnels:edit_stages",
    "funnels:view_analytics"
]
```

### Funnel Manager
```json
[
    "funnels:read",
    "funnels:write",
    "funnels:update",
    "funnels:manage",
    "funnels:view_analytics",
    "funnels:edit_stages",
    "funnels:manage_stages",
    "funnels:publish",
    "funnels:unpublish"
]
```

### Task Manager
```json
[
    "tasks:read",
    "tasks:write",
    "tasks:update",
    "tasks:manage",
    "tasks:assign"
]
```

### Calendar Manager
```json
[
    "calendar:read",
    "calendar:write",
    "calendar:update",
    "calendar:manage",
    "calendar:book"
]
```

### Staff Manager
```json
[
    "staff:read",
    "staff:write",
    "staff:update",
    "staff:manage"
]
```

### Analytics Manager
```json
[
    "performance:read",
    "performance:write",
    "performance:manage"
]
```

### Full Access
All available permissions across all sections.

## Usage Examples

### Creating a Staff Member with Custom Permissions

```javascript
// 1. First, get available permissions
const permissionsResponse = await fetch('/api/permissions', {
    headers: { 'Authorization': `Bearer ${coachToken}` }
});
const { data } = await permissionsResponse.json();

// 2. Create staff with specific permissions
const createStaffResponse = await fetch('/api/coach/staff', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${coachToken}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'Marketing Specialist',
        email: 'marketing@example.com',
        password: 'securePassword123',
        permissions: [
            'leads:read',
            'leads:write',
            'leads:update',
            'funnels:read',
            'funnels:write',
            'funnels:view_analytics'
        ]
    })
});
```

### Assigning Permission Groups

```javascript
// Assign Lead Manager permissions to a staff member
const assignGroupResponse = await fetch('/api/coach/staff/65a1b2c3d4e5f6789012345a/permission-group', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${coachToken}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        groupName: 'Lead Manager'
    })
});
```

### Bulk Permission Updates

```javascript
// Update multiple staff members at once
const bulkUpdateResponse = await fetch('/api/coach/staff/bulk-permissions', {
    method: 'PUT',
    headers: {
        'Authorization': `Bearer ${coachToken}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        staffUpdates: [
            {
                staffId: '65a1b2c3d4e5f6789012345a',
                permissions: ['leads:read', 'leads:write']
            },
            {
                staffId: '65a1b2c3d4e5f6789012345b',
                permissions: ['tasks:read', 'tasks:write', 'tasks:manage']
            }
        ]
    })
});
```

## Error Handling

### Common Error Responses

#### Permission Denied (403)
```json
{
    "success": false,
    "message": "Access denied. This endpoint requires coach authentication."
}
```

#### Staff Not Found (404)
```json
{
    "success": false,
    "message": "Staff member not found"
}
```

#### Invalid Permissions (400)
```json
{
    "success": false,
    "message": "Invalid permissions: invalid:permission, another:invalid"
}
```

#### Email Already Exists (400)
```json
{
    "success": false,
    "message": "Email already exists"
}
```

## Security Considerations

1. **Authentication Required**: All endpoints require valid authentication
2. **Coach Authorization**: Staff management endpoints are restricted to coaches only
3. **Permission Validation**: All permissions are validated against the defined permission set
4. **Data Isolation**: Coaches can only manage their own staff members
5. **Password Security**: Staff passwords are hashed before storage
6. **Status Control**: Staff accounts can be deactivated without deletion

## Integration with Staff Dashboard

The permissions assigned through this system directly control access to the Staff Unified Dashboard API (`/api/staff-unified/v1`). Staff members will only be able to access features and perform operations that they have been granted permissions for.

For example:
- Staff with `leads:read` can view leads data
- Staff with `leads:write` can create new leads
- Staff with `leads:update` can modify existing leads
- Staff with `leads:delete` can delete leads
- Staff with `leads:manage` has full lead management access

This creates a seamless integration between permission management and feature access.
