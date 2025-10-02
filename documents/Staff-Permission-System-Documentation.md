# Staff Permission System Documentation

## Overview

The Staff Permission System allows coaches to grant their staff members access to specific features and functionalities within the platform. Staff members can use the same frontend and APIs as coaches, but with granular permission controls that restrict their access based on their assigned permissions.

## Key Features

- **Unified Frontend**: Staff and coaches use the same frontend interface
- **Granular Permissions**: Fine-grained control over what staff can access
- **Route-Level Protection**: All coach routes are protected with permission checks
- **Data Isolation**: Staff can only access their coach's data
- **Permission Groups**: Pre-defined permission groups for easy assignment

## Permission Structure

### Permission Categories

The system includes the following permission categories:

#### 1. Lead Management (`leads:*`)
- `leads:read` - View leads
- `leads:write` - Create new leads
- `leads:update` - Modify existing leads
- `leads:delete` - Delete leads
- `leads:manage` - Full lead management

#### 2. Funnel Management (`funnels:*`)
- `funnels:read` - View funnels
- `funnels:write` - Create new funnels
- `funnels:update` - Modify existing funnels
- `funnels:delete` - Delete funnels
- `funnels:manage` - Full funnel management
- `funnels:view_analytics` - View funnel analytics
- `funnels:edit_stages` - Edit funnel stages
- `funnels:manage_stages` - Manage funnel stages
- `funnels:publish` - Publish funnels
- `funnels:unpublish` - Unpublish funnels

#### 3. Task Management (`tasks:*`)
- `tasks:read` - View tasks
- `tasks:write` - Create new tasks
- `tasks:update` - Modify existing tasks
- `tasks:delete` - Delete tasks
- `tasks:manage` - Full task management
- `tasks:assign` - Assign tasks to others

#### 4. Calendar Management (`calendar:*`)
- `calendar:read` - View calendar
- `calendar:write` - Create calendar events
- `calendar:update` - Modify calendar events
- `calendar:delete` - Delete calendar events
- `calendar:manage` - Full calendar management
- `calendar:book` - Book appointments

#### 5. Appointment Management (`appointments:*`)
- `appointments:read` - View appointments
- `appointments:write` - Create appointments
- `appointments:update` - Modify appointments
- `appointments:delete` - Delete appointments
- `appointments:manage` - Full appointment management
- `appointments:book` - Book appointments
- `appointments:reschedule` - Reschedule appointments

#### 6. Ads Management (`ads:*`)
- `ads:read` - View ad campaigns
- `ads:write` - Create ad campaigns
- `ads:update` - Modify ad campaigns
- `ads:delete` - Delete ad campaigns
- `ads:manage` - Full ad management
- `ads:publish` - Publish ad campaigns
- `ads:analytics` - View ad analytics

#### 7. WhatsApp Management (`whatsapp:*`)
- `whatsapp:read` - View WhatsApp messages
- `whatsapp:write` - Create WhatsApp messages
- `whatsapp:send` - Send WhatsApp messages
- `whatsapp:manage` - Full WhatsApp management
- `whatsapp:templates` - Manage WhatsApp templates

#### 8. Automation Management (`automation:*`)
- `automation:read` - View automation rules
- `automation:write` - Create automation rules
- `automation:update` - Modify automation rules
- `automation:delete` - Delete automation rules
- `automation:manage` - Full automation management
- `automation:execute` - Execute automation rules

#### 9. Performance & Analytics (`performance:*`)
- `performance:read` - View performance data
- `performance:write` - Create performance reports
- `performance:manage` - Full performance management

#### 10. File Management (`files:*`)
- `files:read` - View files
- `files:write` - Upload files
- `files:delete` - Delete files
- `files:manage` - Full file management

#### 11. AI Services (`ai:*`)
- `ai:read` - View AI features
- `ai:write` - Use AI features
- `ai:manage` - Full AI management

#### 12. Staff Management (`staff:*`)
- `staff:read` - View staff members
- `staff:write` - Create staff members
- `staff:update` - Modify staff members
- `staff:delete` - Delete staff members
- `staff:manage` - Full staff management

## Permission Groups

Pre-defined permission groups make it easy to assign common permission sets:

### 1. Lead Manager
- `leads:read`
- `leads:write`
- `leads:update`
- `leads:manage`

### 2. Funnel Editor
- `funnels:read`
- `funnels:update`
- `funnels:edit_stages`
- `funnels:view_analytics`

### 3. Funnel Manager
- `funnels:read`
- `funnels:write`
- `funnels:update`
- `funnels:manage`
- `funnels:view_analytics`
- `funnels:edit_stages`
- `funnels:manage_stages`
- `funnels:publish`
- `funnels:unpublish`

### 4. Task Manager
- `tasks:read`
- `tasks:write`
- `tasks:update`
- `tasks:manage`
- `tasks:assign`

### 5. Calendar Manager
- `calendar:read`
- `calendar:write`
- `calendar:update`
- `calendar:manage`
- `calendar:book`

### 6. Staff Manager
- `staff:read`
- `staff:write`
- `staff:update`
- `staff:manage`

### 7. Analytics Manager
- `performance:read`
- `performance:write`
- `performance:manage`

### 8. Content Manager
- `files:read`
- `files:write`
- `files:manage`
- `ai:read`
- `ai:write`

### 9. Communication Manager
- `automation:read`
- `automation:write`

### 10. WhatsApp Manager
- `whatsapp:read`
- `whatsapp:write`
- `whatsapp:send`
- `whatsapp:manage`
- `whatsapp:templates`

### 11. Automation Manager
- `automation:read`
- `automation:write`
- `automation:update`
- `automation:delete`
- `automation:manage`
- `automation:execute`

### 12. Ads Manager
- `ads:read`
- `ads:write`
- `ads:update`
- `ads:delete`
- `ads:manage`
- `ads:publish`
- `ads:analytics`

### 13. Appointment Manager
- `appointments:read`
- `appointments:write`
- `appointments:update`
- `appointments:delete`
- `appointments:manage`
- `appointments:book`
- `appointments:reschedule`

### 14. Permission Manager
- `permissions:request`
- `permissions:approve`
- `permissions:deny`
- `permissions:manage`

### 15. Full Access
- All permissions from all categories

## Implementation

### Middleware Structure

The system uses a comprehensive middleware (`StaffPermissionMiddleware`) that provides:

1. **Permission Checking**: Validates staff permissions for specific actions
2. **Data Isolation**: Ensures staff can only access their coach's data
3. **Route Protection**: Protects all coach routes with permission checks
4. **Flexible Configuration**: Easy to add new permissions and routes

### Route Protection

All coach routes are protected with permission middleware:

```javascript
// Example: Lead routes
router.get('/', StaffPermissionMiddleware.checkLeadPermission('read'), getLeads);
router.post('/', StaffPermissionMiddleware.checkLeadPermission('write'), createLead);
router.put('/:id', StaffPermissionMiddleware.checkLeadPermission('update'), updateLead);
router.delete('/:id', StaffPermissionMiddleware.checkLeadPermission('delete'), deleteLead);
```

### Dashboard Access

Dashboard sections are protected based on permissions:

```javascript
// Example: Dashboard routes
router.get('/leads', StaffPermissionMiddleware.checkDashboardPermission('leads'), getLeadsData);
router.get('/funnels', StaffPermissionMiddleware.checkDashboardPermission('funnels'), getFunnelsData);
router.get('/ads', StaffPermissionMiddleware.checkDashboardPermission('ads'), getAdsData);
```

## Usage Examples

### Creating Staff with Permissions

```javascript
// Create staff with specific permissions
const staff = new Staff({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'staff',
    coachId: coachId,
    permissions: [
        'leads:read',
        'leads:write',
        'funnels:read',
        'tasks:read',
        'tasks:write'
    ],
    isActive: true
});
```

### Assigning Permission Groups

```javascript
// Assign Lead Manager group
const leadManagerPermissions = PERMISSION_GROUPS['Lead Manager'];
staff.permissions = leadManagerPermissions;
await staff.save();
```

### Checking Permissions

```javascript
// Check if staff has specific permission
const hasPermission = staff.permissions.includes('leads:write');

// Check multiple permissions
const hasAnyPermission = staff.permissions.some(p => 
    ['leads:read', 'leads:write'].includes(p)
);

// Check all permissions
const hasAllPermissions = ['leads:read', 'leads:write'].every(p => 
    staff.permissions.includes(p)
);
```

## API Endpoints

### Staff Management

- `POST /api/staff` - Create staff member
- `GET /api/staff` - List staff members
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member
- `PUT /api/staff/:id/permissions` - Update staff permissions

### Permission Management

- `GET /api/permissions/groups` - Get available permission groups
- `GET /api/permissions/available` - Get all available permissions
- `POST /api/staff/:id/permission-group` - Assign permission group

## Frontend Integration

The frontend can check permissions to show/hide features:

```javascript
// Check if user has permission
const canManageLeads = user.permissions.includes('leads:manage');

// Show/hide UI elements
{canManageLeads && (
    <button onClick={deleteLead}>Delete Lead</button>
)}
```

## Security Considerations

1. **Data Isolation**: Staff can only access their coach's data
2. **Permission Validation**: All routes validate permissions server-side
3. **Active Status Check**: Only active staff can access the system
4. **Coach Verification**: Staff must belong to a valid coach

## Testing

Use the provided test script to verify the permission system:

```bash
node test-staff-permissions.js
```

The test script creates sample staff with different permission levels and validates the middleware functionality.

## Best Practices

1. **Principle of Least Privilege**: Grant only necessary permissions
2. **Regular Review**: Periodically review and update staff permissions
3. **Permission Groups**: Use pre-defined groups when possible
4. **Documentation**: Document custom permission combinations
5. **Testing**: Test permission changes in development first

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check if staff has the required permission
2. **Data Access**: Ensure staff belongs to the correct coach
3. **Active Status**: Verify staff account is active
4. **Route Protection**: Ensure routes are properly protected

### Debug Information

The middleware provides detailed error messages:

```json
{
    "success": false,
    "message": "Insufficient permissions. Required: leads:write",
    "error": "INSUFFICIENT_PERMISSIONS",
    "requiredPermissions": ["leads:write"],
    "staffPermissions": ["leads:read"],
    "action": "write"
}
```

## Future Enhancements

1. **Dynamic Permissions**: Runtime permission changes
2. **Permission Inheritance**: Hierarchical permission structure
3. **Time-based Permissions**: Temporary permission grants
4. **Audit Logging**: Track permission usage and changes
5. **Role-based Access**: Additional role layers beyond permissions
