# 👥 Staff Management Documentation

## Overview
The Staff Management module provides coaches with comprehensive tools to manage their team members, assign roles, track performance, and coordinate activities. This system helps coaches build effective teams, delegate responsibilities, and ensure smooth operations across their coaching business.

## Table of Contents
1. [Core Features](#core-features)
2. [API Endpoints](#api-endpoints)
3. [Staff Roles & Permissions](#staff-roles--permissions)
4. [Team Management](#team-management)
5. [Performance Tracking](#performance-tracking)
6. [Setup & Configuration](#setup--configuration)
7. [Use Cases](#use-cases)
8. [Best Practices](#best-practices)

---

## Core Features

### 1. Staff Onboarding & Management
- **User Creation**: Add new team members with role assignments
- **Permission Management**: Control access to different system features
- **Profile Management**: Maintain staff information and preferences
- **Status Tracking**: Monitor active and inactive staff members

### 2. Role-Based Access Control
- **Permission Levels**: Define what each staff member can access
- **Feature Restrictions**: Limit access to sensitive information
- **Hierarchical Structure**: Organize staff by roles and responsibilities
- **Security Management**: Ensure data protection and privacy

### 3. Team Coordination
- **Task Assignment**: Delegate work to appropriate team members
- **Communication Tools**: Facilitate team collaboration
- **Performance Monitoring**: Track individual and team progress
- **Resource Allocation**: Optimize team utilization

---

## API Endpoints

### 1. List Staff Members
**Endpoint:** `GET /api/staff`  
**Description:** Retrieve all staff members under a coach  
**Authentication:** Required  
**Use Case:** View team roster, manage staff, assign tasks

**Query Parameters:**
```json
{
  "coachId": "coach_123", // Optional: Admin can specify coach
  "status": "active", // active, inactive, all
  "role": "assistant", // coach, admin, assistant, specialist
  "department": "sales", // sales, marketing, support, operations
  "limit": 20,
  "page": 1,
  "sortBy": "name", // name, role, joinDate, performance
  "sortOrder": "asc" // asc, desc
}
```

**Response:**
```json
{
  "staff": [
    {
      "id": "staff_123",
      "name": "Sarah Johnson",
      "email": "sarah@coachbusiness.com",
      "role": "assistant",
      "department": "sales",
      "status": "active",
      "joinDate": "2023-06-15T10:00:00Z",
      "lastActive": "2024-01-20T14:30:00Z",
      "permissions": ["leads:read", "leads:update", "tasks:create"],
      "performance": {
        "rating": 4.8,
        "tasksCompleted": 45,
        "leadsHandled": 23,
        "customerSatisfaction": 4.9
      },
      "contact": {
        "phone": "+1-555-0123",
        "timezone": "America/New_York",
        "availability": "9 AM - 5 PM EST"
      }
    },
    {
      "id": "staff_456",
      "name": "Mike Chen",
      "email": "mike@coachbusiness.com",
      "role": "specialist",
      "department": "marketing",
      "status": "active",
      "joinDate": "2023-08-20T09:00:00Z",
      "lastActive": "2024-01-20T16:45:00Z",
      "permissions": ["campaigns:read", "campaigns:create", "analytics:view"],
      "performance": {
        "rating": 4.6,
        "campaignsCreated": 12,
        "conversionRate": 18.5,
        "roi": 320
      },
      "contact": {
        "phone": "+1-555-0456",
        "timezone": "America/Los_Angeles",
        "availability": "8 AM - 4 PM PST"
      }
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  },
  "summary": {
    "totalStaff": 15,
    "activeStaff": 14,
    "inactiveStaff": 1,
    "byRole": {
      "assistant": 8,
      "specialist": 4,
      "admin": 2,
      "coach": 1
    },
    "byDepartment": {
      "sales": 6,
      "marketing": 4,
      "support": 3,
      "operations": 2
    }
  }
}
```

### 2. Create Staff Member
**Endpoint:** `POST /api/staff`  
**Description:** Add a new staff member under a coach  
**Authentication:** Required  
**Use Case:** Hire new team members, expand team capacity

**Request Body:**
```json
{
  "coachId": "coach_123",
  "staffData": {
    "name": "Alex Rodriguez",
    "email": "alex@coachbusiness.com",
    "phone": "+1-555-0789",
    "role": "assistant",
    "department": "sales",
    "permissions": [
      "leads:read",
      "leads:update",
      "tasks:create",
      "tasks:update",
      "customers:read"
    ],
    "startDate": "2024-02-01T09:00:00Z",
    "timezone": "America/Chicago",
    "availability": "9 AM - 5 PM CST",
    "compensation": {
      "type": "hourly",
      "rate": 25,
      "currency": "USD"
    },
    "skills": ["sales", "customer_service", "crm_management"],
    "experience": "3 years in sales",
    "goals": ["Increase conversion rate", "Improve customer satisfaction"]
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Staff member created successfully",
  "staff": {
    "id": "staff_789",
    "name": "Alex Rodriguez",
    "email": "alex@coachbusiness.com",
    "role": "assistant",
    "department": "sales",
    "status": "active",
    "joinDate": "2024-02-01T09:00:00Z",
    "permissions": [
      "leads:read",
      "leads:update",
      "tasks:create",
      "tasks:update",
      "customers:read"
    ],
    "temporaryPassword": "TempPass123!",
    "onboarding": {
      "status": "pending",
      "steps": [
        "Email verification",
        "Password change",
        "System training",
        "First task assignment"
      ],
      "estimatedCompletion": "3 days"
    }
  },
  "nextSteps": [
    "Send welcome email with login credentials",
    "Schedule onboarding meeting",
    "Assign first training tasks",
    "Set up performance tracking"
  ]
}
```

### 3. Update Staff Member
**Endpoint:** `PUT /api/staff/:id`  
**Description:** Update staff member information and permissions  
**Authentication:** Required  
**Use Case:** Modify roles, update permissions, change status

**Request Body:**
```json
{
  "updates": {
    "name": "Alex Rodriguez Jr.",
    "role": "specialist",
    "department": "marketing",
    "permissions": [
      "leads:read",
      "leads:update",
      "campaigns:create",
      "campaigns:manage",
      "analytics:view"
    ],
    "compensation": {
      "type": "salary",
      "amount": 45000,
      "currency": "USD"
    },
    "goals": [
      "Launch 3 new campaigns",
      "Achieve 25% conversion rate",
      "Improve customer engagement"
    ]
  },
  "reason": "Promotion to marketing specialist role",
  "effectiveDate": "2024-02-01T00:00:00Z"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Staff member updated successfully",
  "updatedFields": [
    "name",
    "role",
    "department",
    "permissions",
    "compensation",
    "goals"
  ],
  "changes": {
    "role": {
      "from": "assistant",
      "to": "specialist"
    },
    "department": {
      "from": "sales",
      "to": "marketing"
    },
    "permissions": {
      "added": ["campaigns:create", "campaigns:manage", "analytics:view"],
      "removed": ["tasks:create", "tasks:update"]
    }
  },
  "notifications": {
    "staffMember": "Email sent to Alex",
    "team": "Department change announced",
    "system": "Permissions updated automatically"
  }
}
```

### 4. Deactivate Staff Member
**Endpoint:** `DELETE /api/staff/:id`  
**Description:** Deactivate a staff member (soft delete)  
**Authentication:** Required  
**Use Case:** Handle departures, temporary suspensions, role changes

**Request Body:**
```json
{
  "reason": "Resigned for new opportunity",
  "effectiveDate": "2024-01-31T17:00:00Z",
  "handoverRequired": true,
  "handoverTo": "staff_123",
  "exitInterview": true,
  "finalPaycheck": true,
  "returnEquipment": true
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Staff member deactivated successfully",
  "deactivation": {
    "staffId": "staff_456",
    "staffName": "Mike Chen",
    "deactivationDate": "2024-01-31T17:00:00Z",
    "reason": "Resigned for new opportunity",
    "status": "inactive"
  },
  "handover": {
    "assignedTo": "staff_123",
    "assignedToName": "Sarah Johnson",
    "tasks": [
      "Complete pending campaigns",
      "Transfer customer relationships",
      "Update documentation"
    ],
    "deadline": "2024-02-07T17:00:00Z"
  },
  "exitProcess": {
    "exitInterview": "Scheduled for 2024-02-01",
    "finalPaycheck": "Processed",
    "equipmentReturn": "Pending",
    "systemAccess": "Revoked"
  },
  "notifications": {
    "team": "Departure announced",
    "customers": "Reassignment notifications sent",
    "system": "Access revoked automatically"
  }
}
```

---

## Staff Roles & Permissions

### 1. Role Definitions

#### Assistant
- **Description**: Entry-level team member with basic access
- **Permissions**: 
  - `leads:read` - View lead information
  - `leads:update` - Update lead details
  - `tasks:create` - Create new tasks
  - `tasks:update` - Update assigned tasks
  - `customers:read` - View customer information
- **Use Case**: Lead follow-up, basic customer service, task execution

#### Specialist
- **Description**: Skilled team member with domain expertise
- **Permissions**:
  - All Assistant permissions
  - `campaigns:create` - Create marketing campaigns
  - `campaigns:manage` - Manage campaign settings
  - `analytics:view` - Access performance data
  - `content:create` - Create marketing content
- **Use Case**: Campaign management, content creation, specialized tasks

#### Admin
- **Description**: Team leader with management responsibilities
- **Permissions**:
  - All Specialist permissions
  - `staff:manage` - Manage team members
  - `settings:configure` - Configure system settings
  - `reports:generate` - Create and export reports
  - `billing:view` - Access billing information
- **Use Case**: Team management, system configuration, performance oversight

#### Coach
- **Description**: Business owner with full system access
- **Permissions**:
  - All system permissions
  - `system:admin` - Full administrative access
  - `billing:manage` - Manage billing and subscriptions
  - `integrations:configure` - Configure third-party integrations
- **Use Case**: Business ownership, strategic decisions, system administration

### 2. Permission Matrix

| Permission | Assistant | Specialist | Admin | Coach |
|------------|-----------|------------|-------|-------|
| `leads:read` | ✅ | ✅ | ✅ | ✅ |
| `leads:update` | ✅ | ✅ | ✅ | ✅ |
| `leads:delete` | ❌ | ❌ | ✅ | ✅ |
| `campaigns:create` | ❌ | ✅ | ✅ | ✅ |
| `campaigns:manage` | ❌ | ✅ | ✅ | ✅ |
| `staff:manage` | ❌ | ❌ | ✅ | ✅ |
| `settings:configure` | ❌ | ❌ | ✅ | ✅ |
| `billing:view` | ❌ | ❌ | ✅ | ✅ |
| `billing:manage` | ❌ | ❌ | ❌ | ✅ |

---

## Team Management

### 1. Department Organization

#### Sales Department
- **Responsibilities**: Lead management, customer acquisition, revenue generation
- **Key Metrics**: Conversion rate, sales volume, customer satisfaction
- **Tools**: CRM system, lead scoring, follow-up automation

#### Marketing Department
- **Responsibilities**: Campaign creation, content marketing, brand management
- **Key Metrics**: Campaign performance, lead generation, brand awareness
- **Tools**: Campaign builder, analytics dashboard, content creator

#### Support Department
- **Responsibilities**: Customer service, issue resolution, relationship management
- **Key Metrics**: Response time, resolution rate, customer satisfaction
- **Tools**: Help desk, knowledge base, communication tools

#### Operations Department
- **Responsibilities**: Process optimization, system administration, quality assurance
- **Key Metrics**: Efficiency, accuracy, system uptime
- **Tools**: Workflow automation, quality monitoring, system tools

### 2. Team Structure Examples

#### Small Team (3-5 members)
```
Coach (Owner)
├── Admin (Team Lead)
│   ├── Assistant (Sales)
│   ├── Assistant (Marketing)
│   └── Assistant (Support)
```

#### Medium Team (6-15 members)
```
Coach (Owner)
├── Admin (Sales Manager)
│   ├── Specialist (Sales)
│   ├── Assistant (Sales)
│   └── Assistant (Sales)
├── Admin (Marketing Manager)
│   ├── Specialist (Content)
│   ├── Specialist (Campaigns)
│   └── Assistant (Marketing)
└── Admin (Operations Manager)
    ├── Specialist (Support)
    └── Assistant (Support)
```

#### Large Team (16+ members)
```
Coach (Owner)
├── Admin (VP Sales)
│   ├── Admin (Sales Manager)
│   │   ├── Specialist (Enterprise)
│   │   ├── Specialist (SMB)
│   │   └── Assistant (Sales)
│   └── Admin (Sales Manager)
│       ├── Specialist (Enterprise)
│       ├── Specialist (SMB)
│       └── Assistant (Sales)
├── Admin (VP Marketing)
│   ├── Admin (Content Manager)
│   │   ├── Specialist (Content)
│   │   ├── Specialist (SEO)
│   │   └── Assistant (Content)
│   └── Admin (Campaign Manager)
│       ├── Specialist (Paid Ads)
│       ├── Specialist (Social Media)
│       └── Assistant (Campaigns)
└── Admin (VP Operations)
    ├── Admin (Support Manager)
    │   ├── Specialist (Technical)
    │   ├── Specialist (Customer Success)
    │   └── Assistant (Support)
    └── Admin (Systems Manager)
        ├── Specialist (IT)
        ├── Specialist (QA)
        └── Assistant (Operations)
```

---

## Performance Tracking

### 1. Key Performance Indicators (KPIs)

#### Sales Performance
- **Conversion Rate**: Percentage of leads converted to customers
- **Sales Volume**: Total revenue generated
- **Customer Acquisition Cost**: Cost to acquire new customers
- **Customer Lifetime Value**: Total value of customer relationship

#### Marketing Performance
- **Campaign ROI**: Return on investment for marketing campaigns
- **Lead Generation**: Number of new leads generated
- **Content Engagement**: User interaction with marketing content
- **Brand Awareness**: Recognition and perception metrics

#### Support Performance
- **Response Time**: Time to first response
- **Resolution Rate**: Percentage of issues resolved
- **Customer Satisfaction**: Rating of support quality
- **First Contact Resolution**: Issues resolved in first interaction

#### Operational Performance
- **Task Completion Rate**: Percentage of tasks completed on time
- **System Uptime**: Availability of business systems
- **Process Efficiency**: Time and resource optimization
- **Quality Score**: Accuracy and quality of work

### 2. Performance Monitoring

#### Real-time Dashboards
- **Individual Performance**: Personal metrics and progress
- **Team Performance**: Department and team metrics
- **Business Performance**: Overall business health
- **Alert System**: Notifications for performance issues

#### Performance Reviews
- **Weekly Check-ins**: Quick performance updates
- **Monthly Reviews**: Detailed performance analysis
- **Quarterly Assessments**: Comprehensive performance evaluation
- **Annual Reviews**: Long-term performance and goal setting

---

## Setup & Configuration

### 1. Initial Setup

#### Enable Staff Management
```bash
# Check if staff management is enabled
curl -X GET /api/staff \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create First Staff Member
```bash
# Create your first team member
curl -X POST /api/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "staffData": {
      "name": "First Team Member",
      "email": "team@yourbusiness.com",
      "role": "assistant",
      "department": "sales",
      "permissions": ["leads:read", "leads:update"]
    }
  }'
```

### 2. Permission Configuration

#### Define Custom Permissions
```json
{
  "customPermissions": {
    "leads:export": "Export lead data to CSV",
    "campaigns:approve": "Approve marketing campaigns",
    "reports:schedule": "Schedule automated reports",
    "integrations:test": "Test third-party integrations"
  }
}
```

#### Role Templates
```json
{
  "roleTemplates": {
    "junior_assistant": {
      "permissions": ["leads:read", "tasks:create"],
      "restrictions": ["leads:delete", "billing:view"]
    },
    "senior_assistant": {
      "permissions": ["leads:read", "leads:update", "tasks:create", "tasks:update"],
      "restrictions": ["staff:manage", "billing:view"]
    }
  }
}
```

---

## Use Cases

### 1. Team Expansion
- **Hiring Process**: Streamlined onboarding and role assignment
- **Skill Assessment**: Evaluate candidate capabilities and fit
- **Training Programs**: Structured learning and development
- **Performance Tracking**: Monitor new hire progress

### 2. Role Management
- **Promotions**: Upgrade staff roles and permissions
- **Department Transfers**: Move staff between teams
- **Specialization**: Develop expertise in specific areas
- **Leadership Development**: Prepare staff for management roles

### 3. Performance Optimization
- **Goal Setting**: Establish clear performance objectives
- **Feedback Systems**: Regular performance communication
- **Recognition Programs**: Reward high performance
- **Improvement Plans**: Support underperforming staff

### 4. Compliance & Security
- **Access Control**: Limit sensitive information access
- **Audit Trails**: Track system usage and changes
- **Data Protection**: Ensure privacy and security
- **Regulatory Compliance**: Meet industry requirements

---

## Best Practices

### 1. Team Structure
- **Clear Roles**: Define responsibilities and expectations
- **Scalable Design**: Plan for future growth and expansion
- **Cross-training**: Develop versatile team members
- **Succession Planning**: Prepare for leadership transitions

### 2. Permission Management
- **Principle of Least Privilege**: Grant minimum necessary access
- **Regular Reviews**: Periodically audit permissions and access
- **Documentation**: Maintain clear permission guidelines
- **Training**: Educate staff on security best practices

### 3. Performance Management
- **Clear Metrics**: Establish measurable performance indicators
- **Regular Feedback**: Provide consistent performance communication
- **Development Focus**: Emphasize growth and improvement
- **Recognition**: Celebrate achievements and milestones

### 4. Communication
- **Open Channels**: Maintain transparent communication
- **Regular Meetings**: Schedule consistent team interactions
- **Documentation**: Keep processes and procedures updated
- **Feedback Loops**: Encourage two-way communication

---

## Conclusion

The Staff Management module provides coaches with powerful tools to build, manage, and optimize their teams. By implementing effective staff management practices, coaches can create high-performing teams that drive business growth and success.

The key to success is finding the right balance between structure and flexibility, ensuring clear roles and responsibilities while maintaining adaptability to changing business needs. Remember that effective staff management is not just about systems and processes, but about people and relationships.

Focus on creating a positive work environment, providing clear direction and support, and recognizing the contributions of your team members. The success of your coaching business depends on the quality and performance of your team.
