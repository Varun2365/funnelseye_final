# Staff Enhanced Features Documentation

## Overview

The Staff Enhanced Features system extends the basic staff dashboard with advanced functionality including appointment management, WhatsApp messaging, automation rules, ad campaigns, and permission requests. This provides staff members with comprehensive tools to manage all aspects of the coach's business.

## Key Features

- **Appointment Management**: Full CRUD operations for appointments with rescheduling
- **WhatsApp Integration**: Send messages, manage templates, view message history
- **Automation Rules**: Create, manage, and execute automated workflows
- **Ad Campaign Management**: Create, update, publish, and analyze ad campaigns
- **Permission Requests**: Request additional permissions with approval workflow
- **Enhanced Permissions**: Granular control over all new features

## API Endpoints

### Appointment Management

#### Get Staff Appointments
**GET** `/api/staff-unified/v1/appointments`
- **Required Permission**: `appointments:read`
- **Description**: Get all appointments for the coach
- **Response**:
```json
{
    "success": true,
    "data": [
        {
            "_id": "65a1b2c3d4e5f6789012345a",
            "title": "Client Consultation",
            "startTime": "2025-01-25T10:00:00Z",
            "endTime": "2025-01-25T11:00:00Z",
            "clientId": "65a1b2c3d4e5f6789012345b",
            "notes": "Initial consultation call",
            "status": "scheduled",
            "type": "consultation"
        }
    ]
}
```

#### Create Appointment
**POST** `/api/staff-unified/v1/appointments`
- **Required Permission**: `appointments:write`
- **Description**: Create a new appointment
- **Request Body**:
```json
{
    "title": "Client Consultation",
    "startTime": "2025-01-25T10:00:00Z",
    "endTime": "2025-01-25T11:00:00Z",
    "clientId": "65a1b2c3d4e5f6789012345a",
    "notes": "Initial consultation call",
    "type": "consultation"
}
```

#### Update Appointment
**PUT** `/api/staff-unified/v1/appointments/:appointmentId`
- **Required Permission**: `appointments:update`
- **Description**: Update appointment details

#### Reschedule Appointment
**PUT** `/api/staff-unified/v1/appointments/:appointmentId/reschedule`
- **Required Permission**: `appointments:reschedule`
- **Description**: Reschedule an appointment
- **Request Body**:
```json
{
    "startTime": "2025-01-26T14:00:00Z",
    "endTime": "2025-01-26T15:00:00Z"
}
```

### WhatsApp Messaging

#### Send WhatsApp Message
**POST** `/api/staff-unified/v1/whatsapp/send`
- **Required Permission**: `whatsapp:send`
- **Description**: Send a WhatsApp message
- **Request Body**:
```json
{
    "to": "+1234567890",
    "message": "Hello! This is a test message from our staff team.",
    "templateId": "template_1"
}
```
- **Response**:
```json
{
    "success": true,
    "data": {
        "messageId": "msg_1705747200000",
        "status": "sent",
        "to": "+1234567890",
        "message": "Hello! This is a test message from our staff team.",
        "timestamp": "2025-01-20T11:00:00Z"
    }
}
```

#### Get WhatsApp Templates
**GET** `/api/staff-unified/v1/whatsapp/templates`
- **Required Permission**: `whatsapp:templates`
- **Description**: Get available WhatsApp message templates
- **Response**:
```json
{
    "success": true,
    "data": [
        {
            "id": "template_1",
            "name": "Welcome Message",
            "content": "Welcome to our service!",
            "status": "approved"
        },
        {
            "id": "template_2",
            "name": "Appointment Reminder",
            "content": "Your appointment is scheduled for {{date}} at {{time}}",
            "status": "approved"
        }
    ]
}
```

#### Get WhatsApp Messages
**GET** `/api/staff-unified/v1/whatsapp/messages`
- **Required Permission**: `whatsapp:read`
- **Description**: Get WhatsApp message history

### Automation Rules

#### Get Automation Rules
**GET** `/api/staff-unified/v1/automation/rules`
- **Required Permission**: `automation:read`
- **Description**: Get all automation rules for the coach
- **Response**:
```json
{
    "success": true,
    "data": [
        {
            "_id": "65a1b2c3d4e5f6789012345a",
            "name": "Welcome New Leads",
            "description": "Automatically send welcome message to new leads",
            "trigger": {
                "type": "lead_created",
                "conditions": {
                    "source": "website"
                }
            },
            "actions": [
                {
                    "type": "send_whatsapp",
                    "templateId": "welcome_template",
                    "delay": 0
                }
            ],
            "isActive": true,
            "createdBy": "65a1b2c3d4e5f6789012345b"
        }
    ]
}
```

#### Create Automation Rule
**POST** `/api/staff-unified/v1/automation/rules`
- **Required Permission**: `automation:write`
- **Description**: Create a new automation rule
- **Request Body**:
```json
{
    "name": "Welcome New Leads",
    "description": "Automatically send welcome message to new leads",
    "trigger": {
        "type": "lead_created",
        "conditions": {
            "source": "website"
        }
    },
    "actions": [
        {
            "type": "send_whatsapp",
            "templateId": "welcome_template",
            "delay": 0
        }
    ],
    "isActive": true
}
```

#### Update Automation Rule
**PUT** `/api/staff-unified/v1/automation/rules/:ruleId`
- **Required Permission**: `automation:update`
- **Description**: Update automation rule details

#### Execute Automation Rule
**POST** `/api/staff-unified/v1/automation/rules/:ruleId/execute`
- **Required Permission**: `automation:execute`
- **Description**: Manually execute an automation rule
- **Response**:
```json
{
    "success": true,
    "data": {
        "ruleId": "65a1b2c3d4e5f6789012345a",
        "executedAt": "2025-01-20T11:00:00Z",
        "status": "success",
        "actionsPerformed": 5,
        "message": "Automation rule executed successfully"
    }
}
```

### Ads & Campaigns

#### Get Ad Campaigns
**GET** `/api/staff-unified/v1/ads/campaigns`
- **Required Permission**: `ads:read`
- **Description**: Get all ad campaigns for the coach
- **Response**:
```json
{
    "success": true,
    "data": [
        {
            "_id": "65a1b2c3d4e5f6789012345a",
            "name": "Summer Weight Loss Campaign",
            "description": "Targeted campaign for weight loss services",
            "platform": "facebook",
            "budget": 1000,
            "targetAudience": {
                "age": "25-45",
                "interests": ["fitness", "weight loss", "health"]
            },
            "creative": {
                "headline": "Transform Your Body This Summer",
                "description": "Join our proven weight loss program",
                "imageUrl": "https://example.com/image.jpg"
            },
            "status": "active",
            "createdBy": "65a1b2c3d4e5f6789012345b"
        }
    ]
}
```

#### Create Ad Campaign
**POST** `/api/staff-unified/v1/ads/campaigns`
- **Required Permission**: `ads:write`
- **Description**: Create a new ad campaign
- **Request Body**:
```json
{
    "name": "Summer Weight Loss Campaign",
    "description": "Targeted campaign for weight loss services",
    "platform": "facebook",
    "budget": 1000,
    "targetAudience": {
        "age": "25-45",
        "interests": ["fitness", "weight loss", "health"]
    },
    "creative": {
        "headline": "Transform Your Body This Summer",
        "description": "Join our proven weight loss program",
        "imageUrl": "https://example.com/image.jpg"
    },
    "status": "draft"
}
```

#### Update Ad Campaign
**PUT** `/api/staff-unified/v1/ads/campaigns/:campaignId`
- **Required Permission**: `ads:update`
- **Description**: Update ad campaign details

#### Publish Ad Campaign
**POST** `/api/staff-unified/v1/ads/campaigns/:campaignId/publish`
- **Required Permission**: `ads:publish`
- **Description**: Publish an ad campaign
- **Response**:
```json
{
    "success": true,
    "data": {
        "_id": "65a1b2c3d4e5f6789012345a",
        "status": "active",
        "publishedAt": "2025-01-20T11:00:00Z"
    }
}
```

#### Get Ad Campaign Analytics
**GET** `/api/staff-unified/v1/ads/campaigns/:campaignId/analytics`
- **Required Permission**: `ads:analytics`
- **Description**: Get analytics data for an ad campaign
- **Response**:
```json
{
    "success": true,
    "data": {
        "campaignId": "65a1b2c3d4e5f6789012345a",
        "impressions": 12500,
        "clicks": 450,
        "conversions": 25,
        "spend": 150.00,
        "ctr": 3.6,
        "conversionRate": 5.56,
        "cpc": 0.33,
        "cpa": 6.00
    }
}
```

### Permission Requests

#### Request Additional Permissions
**POST** `/api/staff-unified/v1/permissions/request`
- **Required Permission**: `permissions:request`
- **Description**: Request additional permissions
- **Request Body**:
```json
{
    "permissions": [
        "funnels:write",
        "funnels:publish",
        "ads:write",
        "ads:publish"
    ],
    "reason": "I need these permissions to create and manage marketing campaigns for the upcoming product launch. This will help me better support the coach's business goals."
}
```
- **Response**:
```json
{
    "success": true,
    "data": {
        "staffId": "65a1b2c3d4e5f6789012345a",
        "coachId": "65a1b2c3d4e5f6789012345b",
        "requestedPermissions": ["funnels:write", "funnels:publish", "ads:write", "ads:publish"],
        "reason": "I need these permissions to create and manage marketing campaigns...",
        "status": "pending",
        "requestedAt": "2025-01-20T11:00:00Z"
    },
    "message": "Permission request submitted successfully"
}
```

#### Get Permission Requests
**GET** `/api/staff-unified/v1/permissions/requests`
- **Required Permission**: `permissions:manage`
- **Description**: Get all permission requests (for coaches/managers)
- **Response**:
```json
{
    "success": true,
    "data": [
        {
            "id": "req_1",
            "staffId": "65a1b2c3d4e5f6789012345a",
            "staffName": "John Doe",
            "requestedPermissions": ["funnels:write", "funnels:publish"],
            "reason": "Need to create and publish funnels for marketing campaigns",
            "status": "pending",
            "requestedAt": "2025-01-20T10:00:00Z"
        }
    ]
}
```

#### Approve Permission Request
**POST** `/api/staff-unified/v1/permissions/requests/:requestId/approve`
- **Required Permission**: `permissions:approve`
- **Description**: Approve a permission request
- **Response**:
```json
{
    "success": true,
    "data": {
        "requestId": "req_1",
        "status": "approved",
        "approvedAt": "2025-01-20T11:00:00Z",
        "approvedBy": "65a1b2c3d4e5f6789012345b"
    },
    "message": "Permission request approved successfully"
}
```

#### Deny Permission Request
**POST** `/api/staff-unified/v1/permissions/requests/:requestId/deny`
- **Required Permission**: `permissions:deny`
- **Description**: Deny a permission request
- **Request Body**:
```json
{
    "reason": "These permissions require additional training and approval from senior management. Please complete the funnel management course first."
}
```

## Enhanced Permission Groups

### WhatsApp Manager
```json
[
    "whatsapp:read",
    "whatsapp:write",
    "whatsapp:send",
    "whatsapp:manage",
    "whatsapp:templates"
]
```

### Automation Manager
```json
[
    "automation:read",
    "automation:write",
    "automation:update",
    "automation:delete",
    "automation:manage",
    "automation:execute"
]
```

### Ads Manager
```json
[
    "ads:read",
    "ads:write",
    "ads:update",
    "ads:delete",
    "ads:manage",
    "ads:publish",
    "ads:analytics"
]
```

### Appointment Manager
```json
[
    "appointments:read",
    "appointments:write",
    "appointments:update",
    "appointments:delete",
    "appointments:manage",
    "appointments:book",
    "appointments:reschedule"
]
```

### Permission Manager
```json
[
    "permissions:request",
    "permissions:approve",
    "permissions:deny",
    "permissions:manage"
]
```

## Usage Examples

### Creating a Marketing Specialist Staff Member

```javascript
// Create staff with comprehensive marketing permissions
const createMarketingSpecialist = async () => {
    const response = await fetch('/api/coach/staff', {
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
                'leads:read', 'leads:write', 'leads:update',
                'funnels:read', 'funnels:write', 'funnels:update', 'funnels:publish',
                'ads:read', 'ads:write', 'ads:update', 'ads:publish', 'ads:analytics',
                'whatsapp:read', 'whatsapp:send', 'whatsapp:templates',
                'automation:read', 'automation:write', 'automation:execute',
                'appointments:read', 'appointments:write', 'appointments:update',
                'permissions:request'
            ]
        })
    });
    
    return response.json();
};
```

### Setting Up Automated Lead Nurturing

```javascript
// Create automation rule for lead nurturing
const createLeadNurturingRule = async () => {
    const response = await fetch('/api/staff-unified/v1/automation/rules', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${staffToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Lead Nurturing Sequence',
            description: 'Automated follow-up sequence for new leads',
            trigger: {
                type: 'lead_created',
                conditions: {
                    source: 'website',
                    status: 'new'
                }
            },
            actions: [
                {
                    type: 'send_whatsapp',
                    templateId: 'welcome_template',
                    delay: 0
                },
                {
                    type: 'send_whatsapp',
                    templateId: 'follow_up_template',
                    delay: 86400 // 24 hours
                },
                {
                    type: 'create_task',
                    taskData: {
                        title: 'Follow up with new lead',
                        assignedTo: 'staff_id',
                        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                    },
                    delay: 172800 // 48 hours
                }
            ],
            isActive: true
        })
    });
    
    return response.json();
};
```

### Managing Ad Campaigns

```javascript
// Create and publish ad campaign
const createAdCampaign = async () => {
    // Create campaign
    const createResponse = await fetch('/api/staff-unified/v1/ads/campaigns', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${staffToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Summer Weight Loss Campaign',
            description: 'Targeted campaign for weight loss services',
            platform: 'facebook',
            budget: 1000,
            targetAudience: {
                age: '25-45',
                interests: ['fitness', 'weight loss', 'health']
            },
            creative: {
                headline: 'Transform Your Body This Summer',
                description: 'Join our proven weight loss program',
                imageUrl: 'https://example.com/image.jpg'
            },
            status: 'draft'
        })
    });
    
    const campaign = await createResponse.json();
    
    // Publish campaign
    const publishResponse = await fetch(`/api/staff-unified/v1/ads/campaigns/${campaign.data._id}/publish`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${staffToken}`
        }
    });
    
    return publishResponse.json();
};
```

### Permission Request Workflow

```javascript
// Staff requests additional permissions
const requestPermissions = async () => {
    const response = await fetch('/api/staff-unified/v1/permissions/request', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${staffToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            permissions: ['funnels:publish', 'ads:publish'],
            reason: 'Need to publish marketing campaigns for the upcoming product launch'
        })
    });
    
    return response.json();
};

// Coach approves the request
const approvePermissionRequest = async (requestId) => {
    const response = await fetch(`/api/staff-unified/v1/permissions/requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${coachToken}`
        }
    });
    
    return response.json();
};
```

## Integration Points

### WhatsApp Integration
- Integrates with central WhatsApp service
- Supports message templates and delivery tracking
- Handles message history and analytics

### Automation Engine
- Triggers based on various events (lead creation, appointment booking, etc.)
- Supports multiple action types (WhatsApp, email, task creation)
- Configurable delays and conditions

### Ad Platform Integration
- Supports multiple platforms (Facebook, Google, etc.)
- Real-time analytics and performance tracking
- Budget management and campaign optimization

### Permission Management
- Seamless integration with existing permission system
- Approval workflow for sensitive permissions
- Audit trail for permission changes

## Security Considerations

1. **Permission Validation**: All endpoints validate permissions before execution
2. **Data Isolation**: Staff can only access coach's data
3. **Audit Logging**: All actions are logged for compliance
4. **Approval Workflows**: Sensitive operations require approval
5. **Rate Limiting**: API endpoints are rate-limited to prevent abuse
6. **Input Validation**: All inputs are validated and sanitized

## Error Handling

### Common Error Responses

#### Permission Denied (403)
```json
{
    "success": false,
    "message": "Insufficient permissions to send WhatsApp messages"
}
```

#### Resource Not Found (404)
```json
{
    "success": false,
    "message": "Automation rule not found"
}
```

#### Validation Error (400)
```json
{
    "success": false,
    "message": "Invalid automation rule configuration",
    "errors": ["Trigger conditions are required"]
}
```

## Performance Considerations

1. **Caching**: Frequently accessed data is cached
2. **Pagination**: Large datasets are paginated
3. **Async Processing**: Long-running operations are processed asynchronously
4. **Database Optimization**: Queries are optimized for performance
5. **Rate Limiting**: Prevents system overload

This enhanced features system provides staff members with comprehensive tools to manage all aspects of the coach's business while maintaining strict permission-based access control.
