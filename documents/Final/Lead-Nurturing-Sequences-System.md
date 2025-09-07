# Lead Nurturing Sequences System Documentation

## Overview
The Lead Nurturing Sequences System provides comprehensive automated follow-up campaigns for leads with multiple action types, funnel integration, AI-powered sequence generation, and detailed analytics. The system supports automated execution through worker processes and provides detailed tracking of lead progress through nurturing sequences.

## System Architecture

### Core Components
- **Automated Follow-up Campaigns** - Multi-step nurturing sequences
- **Multiple Action Types** - Email, tasks, notifications, and more
- **Funnel Integration** - Automatic assignment based on triggers
- **AI-Powered Generation** - Intelligent sequence creation
- **Worker System** - Automated execution and scheduling
- **Analytics & Statistics** - Performance tracking and optimization
- **Lead Progress Tracking** - Detailed journey monitoring

### Database Schema

#### NurturingSequence Schema
```javascript
{
  name: String,                   // Sequence name - Required
  description: String,            // Sequence description
  coachId: ObjectId,             // Reference to User (Coach) - Required
  category: String,               // 'warm_lead', 'cold_lead', 'objection_handling', 'follow_up', 'reactivation', 'custom'
  steps: [NurturingStepSchema],   // Array of nurturing steps
  assignedFunnels: [ObjectId],   // References to Funnels
  isActive: Boolean,              // Sequence active status (default: true)
  isDefault: Boolean,             // Default sequence flag (default: false)
  triggerConditions: {
    leadScore: {
      min: Number,               // Minimum lead score (0-100)
      max: Number                // Maximum lead score (0-100)
    },
    leadSource: [String],        // Allowed lead sources
    leadStatus: [String],        // Allowed lead statuses
    leadTemperature: [String]    // Allowed lead temperatures
  },
  settings: {
    maxRetries: Number,           // Maximum retry attempts (default: 3)
    retryDelayDays: Number,       // Days between retries (default: 2)
    stopOnConversion: Boolean,    // Stop sequence on conversion (default: true)
    allowManualAdvance: Boolean  // Allow manual step advancement (default: true)
  },
  stats: {
    totalLeads: Number,           // Total leads assigned (default: 0)
    activeLeads: Number,          // Currently active leads (default: 0)
    completedLeads: Number,       // Completed sequence leads (default: 0)
    conversionRate: Number,       // Conversion rate percentage (default: 0)
    averageCompletionTime: Number // Average completion time in days (default: 0)
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### NurturingStep Schema
```javascript
{
  stepNumber: Number,             // Step number - Required
  name: String,                   // Step name - Required
  description: String,            // Step description
  actionType: String,            // Action type - Required
  actionConfig: Mixed,            // Action configuration - Required
  delayDays: Number,              // Delay in days (default: 0)
  delayHours: Number,             // Delay in hours (default: 0)
  conditions: Mixed,              // Step conditions (default: {})
  isActive: Boolean              // Step active status (default: true)
}
```

#### SequenceLog Schema
```javascript
{
  sequenceId: ObjectId,           // Reference to NurturingSequence - Required
  leadId: ObjectId,              // Reference to Lead - Required
  stepNumber: Number,             // Step number - Required
  actionType: String,            // Action type - Required
  status: String,                // 'pending', 'executed', 'failed', 'skipped'
  executedAt: Date,              // Execution timestamp
  result: Mixed,                 // Execution result
  error: String,                 // Error message if failed
  retryCount: Number,            // Number of retries (default: 0)
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Base URL: `/api/nurturing-sequences`

### 1. Sequence Management

#### Create Sequence
**POST** `/`
- **Description**: Create new nurturing sequence
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "name": "Weight Loss Follow-up Sequence",
  "description": "Automated follow-up sequence for weight loss leads",
  "category": "warm_lead",
  "steps": [
    {
      "stepNumber": 1,
      "name": "Welcome Email",
      "description": "Send welcome email with program overview",
      "actionType": "send_email",
      "actionConfig": {
        "subject": "Welcome to Your Weight Loss Journey!",
        "template": "welcome_email",
        "personalization": {
          "leadName": "{{lead.name}}",
          "programName": "30-Day Transformation"
        }
      },
      "delayDays": 0,
      "delayHours": 0
    },
    {
      "stepNumber": 2,
      "name": "Success Story Email",
      "description": "Share success story from similar client",
      "actionType": "send_email",
      "actionConfig": {
        "subject": "How Sarah Lost 25 Pounds in 30 Days",
        "template": "success_story",
        "personalization": {
          "leadGoal": "{{lead.clientQuestions.healthGoal}}",
          "similarAge": "{{lead.clientQuestions.age}}"
        }
      },
      "delayDays": 2,
      "delayHours": 0
    },
    {
      "stepNumber": 3,
      "name": "Schedule Discovery Call",
      "description": "Create task to schedule discovery call",
      "actionType": "create_task",
      "actionConfig": {
        "taskName": "Schedule Discovery Call with {{lead.name}}",
        "description": "Follow up with lead to schedule discovery call",
        "priority": "HIGH",
        "dueDate": "{{currentDate + 1 day}}",
        "assignedTo": "{{coach.id}}"
      },
      "delayDays": 5,
      "delayHours": 0
    }
  ],
  "triggerConditions": {
    "leadScore": {
      "min": 50,
      "max": 100
    },
    "leadSource": ["Web Form", "Social Media"],
    "leadStatus": ["New", "Contacted"],
    "leadTemperature": ["Warm", "Hot"]
  },
  "settings": {
    "maxRetries": 3,
    "retryDelayDays": 2,
    "stopOnConversion": true,
    "allowManualAdvance": true
  }
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Nurturing sequence created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345a",
    "name": "Weight Loss Follow-up Sequence",
    "description": "Automated follow-up sequence for weight loss leads",
    "category": "warm_lead",
    "coachId": "65a1b2c3d4e5f6789012345b",
    "steps": [
      {
        "_id": "65a1b2c3d4e5f6789012345c",
        "stepNumber": 1,
        "name": "Welcome Email",
        "description": "Send welcome email with program overview",
        "actionType": "send_email",
        "actionConfig": {
          "subject": "Welcome to Your Weight Loss Journey!",
          "template": "welcome_email",
          "personalization": {
            "leadName": "{{lead.name}}",
            "programName": "30-Day Transformation"
          }
        },
        "delayDays": 0,
        "delayHours": 0,
        "isActive": true
      }
    ],
    "assignedFunnels": [],
    "isActive": true,
    "isDefault": false,
    "triggerConditions": {
      "leadScore": {
        "min": 50,
        "max": 100
      },
      "leadSource": ["Web Form", "Social Media"],
      "leadStatus": ["New", "Contacted"],
      "leadTemperature": ["Warm", "Hot"]
    },
    "settings": {
      "maxRetries": 3,
      "retryDelayDays": 2,
      "stopOnConversion": true,
      "allowManualAdvance": true
    },
    "stats": {
      "totalLeads": 0,
      "activeLeads": 0,
      "completedLeads": 0,
      "conversionRate": 0,
      "averageCompletionTime": 0
    },
    "totalSteps": 3,
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
  }
}
```

#### Get All Sequences
**GET** `/?category=warm_lead&isActive=true&funnelId=65a1b2c3d4e5f6789012345d`
- **Description**: Get all nurturing sequences with filtering
- **Authentication**: Coach required
- **Query Parameters**:
  - `category`: Filter by sequence category
  - `isActive`: Filter by active status
  - `funnelId`: Filter by assigned funnel
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345a",
      "name": "Weight Loss Follow-up Sequence",
      "description": "Automated follow-up sequence for weight loss leads",
      "category": "warm_lead",
      "coachId": "65a1b2c3d4e5f6789012345b",
      "steps": [
        {
          "stepNumber": 1,
          "name": "Welcome Email",
          "actionType": "send_email",
          "delayDays": 0
        }
      ],
      "assignedFunnels": [
        {
          "_id": "65a1b2c3d4e5f6789012345d",
          "name": "Weight Loss Funnel",
          "description": "Main weight loss conversion funnel"
        }
      ],
      "isActive": true,
      "isDefault": false,
      "stats": {
        "totalLeads": 25,
        "activeLeads": 8,
        "completedLeads": 15,
        "conversionRate": 60,
        "averageCompletionTime": 12
      },
      "totalSteps": 3,
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ]
}
```

#### Get Single Sequence
**GET** `/:id`
- **Description**: Get detailed sequence information
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012345a",
    "name": "Weight Loss Follow-up Sequence",
    "description": "Automated follow-up sequence for weight loss leads",
    "category": "warm_lead",
    "coachId": "65a1b2c3d4e5f6789012345b",
    "steps": [
      {
        "_id": "65a1b2c3d4e5f6789012345c",
        "stepNumber": 1,
        "name": "Welcome Email",
        "description": "Send welcome email with program overview",
        "actionType": "send_email",
        "actionConfig": {
          "subject": "Welcome to Your Weight Loss Journey!",
          "template": "welcome_email",
          "personalization": {
            "leadName": "{{lead.name}}",
            "programName": "30-Day Transformation"
          }
        },
        "delayDays": 0,
        "delayHours": 0,
        "conditions": {},
        "isActive": true
      },
      {
        "_id": "65a1b2c3d4e5f6789012345e",
        "stepNumber": 2,
        "name": "Success Story Email",
        "description": "Share success story from similar client",
        "actionType": "send_email",
        "actionConfig": {
          "subject": "How Sarah Lost 25 Pounds in 30 Days",
          "template": "success_story",
          "personalization": {
            "leadGoal": "{{lead.clientQuestions.healthGoal}}",
            "similarAge": "{{lead.clientQuestions.age}}"
          }
        },
        "delayDays": 2,
        "delayHours": 0,
        "conditions": {},
        "isActive": true
      }
    ],
    "assignedFunnels": [
      {
        "_id": "65a1b2c3d4e5f6789012345d",
        "name": "Weight Loss Funnel",
        "description": "Main weight loss conversion funnel"
      }
    ],
    "isActive": true,
    "isDefault": false,
    "triggerConditions": {
      "leadScore": {
        "min": 50,
        "max": 100
      },
      "leadSource": ["Web Form", "Social Media"],
      "leadStatus": ["New", "Contacted"],
      "leadTemperature": ["Warm", "Hot"]
    },
    "settings": {
      "maxRetries": 3,
      "retryDelayDays": 2,
      "stopOnConversion": true,
      "allowManualAdvance": true
    },
    "stats": {
      "totalLeads": 25,
      "activeLeads": 8,
      "completedLeads": 15,
      "conversionRate": 60,
      "averageCompletionTime": 12
    },
    "totalSteps": 3,
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
  }
}
```

#### Update Sequence
**PUT** `/:id`
- **Description**: Update nurturing sequence
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "name": "Updated Weight Loss Follow-up Sequence",
  "description": "Enhanced automated follow-up sequence",
  "steps": [
    {
      "stepNumber": 1,
      "name": "Welcome Email",
      "description": "Send welcome email with program overview",
      "actionType": "send_email",
      "actionConfig": {
        "subject": "Welcome to Your Weight Loss Journey!",
        "template": "welcome_email_v2",
        "personalization": {
          "leadName": "{{lead.name}}",
          "programName": "30-Day Transformation",
          "coachName": "{{coach.name}}"
        }
      },
      "delayDays": 0,
      "delayHours": 0
    }
  ],
  "settings": {
    "maxRetries": 5,
    "retryDelayDays": 1,
    "stopOnConversion": true,
    "allowManualAdvance": true
  }
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Nurturing sequence updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345a",
    "name": "Updated Weight Loss Follow-up Sequence",
    "description": "Enhanced automated follow-up sequence",
    "steps": [
      {
        "stepNumber": 1,
        "name": "Welcome Email",
        "actionConfig": {
          "subject": "Welcome to Your Weight Loss Journey!",
          "template": "welcome_email_v2",
          "personalization": {
            "leadName": "{{lead.name}}",
            "programName": "30-Day Transformation",
            "coachName": "{{coach.name}}"
          }
        }
      }
    ],
    "settings": {
      "maxRetries": 5,
      "retryDelayDays": 1,
      "stopOnConversion": true,
      "allowManualAdvance": true
    },
    "updatedAt": "2025-01-20T11:00:00Z"
  }
}
```

#### Delete Sequence
**DELETE** `/:id`
- **Description**: Delete nurturing sequence
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "message": "Nurturing sequence deleted successfully"
}
```

### 2. Sequence Operations

#### Duplicate Sequence
**POST** `/:id/duplicate`
- **Description**: Duplicate existing sequence
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "newName": "Weight Loss Follow-up Sequence - Copy"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Sequence duplicated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345f",
    "name": "Weight Loss Follow-up Sequence - Copy",
    "description": "Automated follow-up sequence for weight loss leads",
    "category": "warm_lead",
    "coachId": "65a1b2c3d4e5f6789012345b",
    "steps": [
      {
        "stepNumber": 1,
        "name": "Welcome Email",
        "actionType": "send_email",
        "delayDays": 0
      }
    ],
    "assignedFunnels": [],
    "isActive": true,
    "isDefault": false,
    "stats": {
      "totalLeads": 0,
      "activeLeads": 0,
      "completedLeads": 0,
      "conversionRate": 0,
      "averageCompletionTime": 0
    },
    "createdAt": "2025-01-20T11:00:00Z"
  }
}
```

#### Toggle Active Status
**PUT** `/:id/toggle`
- **Description**: Toggle sequence active status
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "message": "Sequence status updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345a",
    "isActive": false,
    "updatedAt": "2025-01-20T11:00:00Z"
  }
}
```

#### Get Sequence Statistics
**GET** `/:id/stats`
- **Description**: Get detailed sequence statistics
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "sequenceId": "65a1b2c3d4e5f6789012345a",
    "sequenceName": "Weight Loss Follow-up Sequence",
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31",
      "days": 31
    },
    "summary": {
      "totalLeads": 25,
      "activeLeads": 8,
      "completedLeads": 15,
      "conversionRate": 60,
      "averageCompletionTime": 12
    },
    "byStep": [
      {
        "stepNumber": 1,
        "stepName": "Welcome Email",
        "totalExecutions": 25,
        "successfulExecutions": 23,
        "failedExecutions": 2,
        "successRate": 92,
        "averageExecutionTime": "2 minutes"
      },
      {
        "stepNumber": 2,
        "stepName": "Success Story Email",
        "totalExecutions": 20,
        "successfulExecutions": 18,
        "failedExecutions": 2,
        "successRate": 90,
        "averageExecutionTime": "3 minutes"
      }
    ],
    "byLeadTemperature": [
      {
        "temperature": "Hot",
        "leads": 10,
        "conversions": 8,
        "conversionRate": 80
      },
      {
        "temperature": "Warm",
        "leads": 15,
        "conversions": 7,
        "conversionRate": 47
      }
    ],
    "bySource": [
      {
        "source": "Web Form",
        "leads": 18,
        "conversions": 12,
        "conversionRate": 67
      },
      {
        "source": "Social Media",
        "leads": 7,
        "conversions": 3,
        "conversionRate": 43
      }
    ],
    "trends": {
      "dailyConversions": [2, 1, 3, 2, 1, 4, 2],
      "weeklyGrowth": 15.2,
      "monthlyGrowth": 25.8,
      "peakConversionDay": "Tuesday",
      "peakConversionHour": "14:00-15:00"
    },
    "performance": {
      "overallScore": 78,
      "grade": "B+",
      "recommendations": [
        "Optimize step 2 timing for better engagement",
        "Add personalization to step 3",
        "Consider A/B testing different email templates"
      ]
    }
  }
}
```

### 3. Funnel Management

#### Assign to Funnel
**POST** `/assign-to-funnel`
- **Description**: Assign sequence to funnel
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "sequenceId": "65a1b2c3d4e5f6789012345a",
  "funnelId": "65a1b2c3d4e5f6789012345d",
  "triggerStage": "lead_qualified",
  "conditions": {
    "leadScore": {
      "min": 50
    },
    "leadTemperature": ["Warm", "Hot"]
  }
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Sequence assigned to funnel successfully",
  "data": {
    "sequenceId": "65a1b2c3d4e5f6789012345a",
    "funnelId": "65a1b2c3d4e5f6789012345d",
    "funnelName": "Weight Loss Funnel",
    "triggerStage": "lead_qualified",
    "conditions": {
      "leadScore": {
        "min": 50
      },
      "leadTemperature": ["Warm", "Hot"]
    },
    "assignedAt": "2025-01-20T11:00:00Z"
  }
}
```

#### Remove from Funnel
**POST** `/remove-from-funnel`
- **Description**: Remove sequence from funnel
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "sequenceId": "65a1b2c3d4e5f6789012345a",
  "funnelId": "65a1b2c3d4e5f6789012345d"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Sequence removed from funnel successfully",
  "data": {
    "sequenceId": "65a1b2c3d4e5f6789012345a",
    "funnelId": "65a1b2c3d4e5f6789012345d",
    "removedAt": "2025-01-20T11:00:00Z"
  }
}
```

#### Bulk Assign to Funnels
**POST** `/bulk-assign`
- **Description**: Assign sequence to multiple funnels
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "sequenceId": "65a1b2c3d4e5f6789012345a",
  "funnelAssignments": [
    {
      "funnelId": "65a1b2c3d4e5f6789012345d",
      "triggerStage": "lead_qualified",
      "conditions": {
        "leadScore": { "min": 50 }
      }
    },
    {
      "funnelId": "65a1b2c3d4e5f6789012345e",
      "triggerStage": "lead_contacted",
      "conditions": {
        "leadTemperature": ["Warm"]
      }
    }
  ]
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Sequence assigned to multiple funnels successfully",
  "data": {
    "sequenceId": "65a1b2c3d4e5f6789012345a",
    "assignments": [
      {
        "funnelId": "65a1b2c3d4e5f6789012345d",
        "funnelName": "Weight Loss Funnel",
        "triggerStage": "lead_qualified",
        "assignedAt": "2025-01-20T11:00:00Z"
      },
      {
        "funnelId": "65a1b2c3d4e5f6789012345e",
        "funnelName": "Fitness Funnel",
        "triggerStage": "lead_contacted",
        "assignedAt": "2025-01-20T11:00:00Z"
      }
    ],
    "totalAssignments": 2
  }
}
```

#### Get Funnel Assignments
**GET** `/:id/funnel-assignments`
- **Description**: Get funnel assignments for sequence
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "sequenceId": "65a1b2c3d4e5f6789012345a",
    "sequenceName": "Weight Loss Follow-up Sequence",
    "assignments": [
      {
        "funnelId": "65a1b2c3d4e5f6789012345d",
        "funnelName": "Weight Loss Funnel",
        "triggerStage": "lead_qualified",
        "conditions": {
          "leadScore": { "min": 50 },
          "leadTemperature": ["Warm", "Hot"]
        },
        "assignedAt": "2025-01-20T10:00:00Z",
        "isActive": true,
        "stats": {
          "totalTriggers": 15,
          "successfulAssignments": 12,
          "conversionRate": 80
        }
      }
    ],
    "totalAssignments": 1
  }
}
```

### 4. Category & Testing

#### Get Sequences by Category
**GET** `/category/:category`
- **Description**: Get sequences filtered by category
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345a",
      "name": "Weight Loss Follow-up Sequence",
      "description": "Automated follow-up sequence for weight loss leads",
      "category": "warm_lead",
      "coachId": "65a1b2c3d4e5f6789012345b",
      "steps": [
        {
          "stepNumber": 1,
          "name": "Welcome Email",
          "actionType": "send_email",
          "delayDays": 0
        }
      ],
      "stats": {
        "totalLeads": 25,
        "activeLeads": 8,
        "completedLeads": 15,
        "conversionRate": 60
      },
      "totalSteps": 3,
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ],
  "category": "warm_lead",
  "totalSequences": 1
}
```

#### Test Sequence
**POST** `/:id/test`
- **Description**: Test sequence execution
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "testLeadId": "65a1b2c3d4e5f6789012345g",
  "testSteps": [1, 2],
  "dryRun": true
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Sequence test completed successfully",
  "data": {
    "sequenceId": "65a1b2c3d4e5f6789012345a",
    "testLeadId": "65a1b2c3d4e5f6789012345g",
    "testResults": [
      {
        "stepNumber": 1,
        "stepName": "Welcome Email",
        "actionType": "send_email",
        "status": "success",
        "executionTime": "1.2 seconds",
        "result": {
          "emailSent": true,
          "emailId": "email_123456789",
          "recipient": "john@example.com",
          "subject": "Welcome to Your Weight Loss Journey!"
        },
        "executedAt": "2025-01-20T11:00:00Z"
      },
      {
        "stepNumber": 2,
        "stepName": "Success Story Email",
        "actionType": "send_email",
        "status": "success",
        "executionTime": "0.8 seconds",
        "result": {
          "emailSent": true,
          "emailId": "email_123456790",
          "recipient": "john@example.com",
          "subject": "How Sarah Lost 25 Pounds in 30 Days"
        },
        "executedAt": "2025-01-20T11:00:00Z"
      }
    ],
    "summary": {
      "totalSteps": 2,
      "successfulSteps": 2,
      "failedSteps": 0,
      "successRate": 100,
      "totalExecutionTime": "2.0 seconds"
    },
    "testedAt": "2025-01-20T11:00:00Z"
  }
}
```

## Action Types

### Supported Action Types
1. **send_email** - Send email to lead
2. **create_task** - Create task for coach/staff
3. **update_lead_score** - Update lead qualification score
4. **add_lead_tag** - Add tag to lead
5. **schedule_appointment** - Schedule appointment
6. **send_notification** - Send internal notification
7. **wait_delay** - Wait for specified time

### Action Configuration Examples

#### Email Action
```javascript
{
  "actionType": "send_email",
  "actionConfig": {
    "subject": "Welcome to Your Weight Loss Journey!",
    "template": "welcome_email",
    "personalization": {
      "leadName": "{{lead.name}}",
      "programName": "30-Day Transformation",
      "coachName": "{{coach.name}}"
    },
    "attachments": ["program_overview.pdf"],
    "tracking": {
      "trackOpens": true,
      "trackClicks": true
    }
  }
}
```

#### Task Creation Action
```javascript
{
  "actionType": "create_task",
  "actionConfig": {
    "taskName": "Follow up with {{lead.name}}",
    "description": "Call lead to discuss program details",
    "priority": "HIGH",
    "dueDate": "{{currentDate + 1 day}}",
    "assignedTo": "{{coach.id}}",
    "tags": ["follow-up", "high-priority"],
    "relatedLead": "{{lead.id}}"
  }
}
```

#### Lead Score Update Action
```javascript
{
  "actionType": "update_lead_score",
  "actionConfig": {
    "scoreChange": 10,
    "reason": "Engaged with welcome email",
    "notes": "Opened email and clicked on program link"
  }
}
```

## Worker System

### Automated Execution
The system uses worker processes to automatically execute nurturing sequences:

1. **Scheduled Execution** - Steps are executed based on delay settings
2. **Retry Logic** - Failed steps are retried based on settings
3. **Condition Checking** - Steps are executed only if conditions are met
4. **Progress Tracking** - Lead progress is tracked through sequences

### Worker Configuration
```javascript
{
  "executionInterval": "5 minutes",
  "maxConcurrentExecutions": 100,
  "retrySettings": {
    "maxRetries": 3,
    "retryDelay": "2 hours",
    "exponentialBackoff": true
  },
  "logging": {
    "level": "info",
    "retention": "30 days"
  }
}
```

## Personalization Variables

### Available Variables
- **{{lead.name}}** - Lead's name
- **{{lead.email}}** - Lead's email
- **{{lead.phone}}** - Lead's phone number
- **{{lead.clientQuestions.healthGoal}}** - Lead's health goal
- **{{lead.clientQuestions.age}}** - Lead's age
- **{{coach.name}}** - Coach's name
- **{{coach.email}}** - Coach's email
- **{{currentDate}}** - Current date
- **{{currentDate + 1 day}}** - Date calculations

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

- **Sequence Management**: 100 requests per hour
- **Testing Endpoints**: 50 requests per hour
- **Statistics Endpoints**: 200 requests per hour

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **500**: Internal Server Error
