# Automation Rules Testing Guide

## Overview
This guide provides comprehensive testing documentation for the Automation Rules system, including API endpoints, test scenarios, and validation requirements.

## System Components
- **Schema**: `schema/AutomationRule.js` - MongoDB schema definition
- **Controller**: `controllers/automationRuleController.js` - Business logic
- **Routes**: `routes/automationRuleRoutes.js` - API endpoints

## API Endpoints

### Base URL
```
/api/automation-rules
```

### Authentication
All endpoints except `/events-actions` require authentication via Bearer token.

### Endpoints

#### 1. Get Available Events and Actions
- **Method**: `GET`
- **URL**: `/api/automation-rules/events-actions`
- **Authentication**: None (Public)
- **Description**: Returns all available trigger events and actions for creating automation rules

#### 2. Create Automation Rule
- **Method**: `POST`
- **URL**: `/api/automation-rules`
- **Authentication**: Required
- **Description**: Creates a new automation rule

#### 3. Get All Rules
- **Method**: `GET`
- **URL**: `/api/automation-rules`
- **Authentication**: Required
- **Description**: Retrieves all automation rules

#### 4. Get Rule by ID
- **Method**: `GET`
- **URL**: `/api/automation-rules/:id`
- **Authentication**: Required
- **Description**: Retrieves a specific automation rule by ID

#### 5. Update Rule
- **Method**: `PUT`
- **URL**: `/api/automation-rules/:id`
- **Authentication**: Required
- **Description**: Updates an existing automation rule

#### 6. Delete Rule
- **Method**: `DELETE`
- **URL**: `/api/automation-rules/:id`
- **Authentication**: Required
- **Description**: Deletes an automation rule

## Test Scenarios

### 1. Public Endpoint Tests

#### Test Case 1.1: Get Events and Actions (Success)
```json
{
  "testName": "Get Events and Actions - Success",
  "method": "GET",
  "url": "/api/automation-rules/events-actions",
  "expectedStatus": 200,
  "expectedResponse": {
    "success": true,
    "data": {
      "events": "Array of event objects",
      "actions": "Array of action objects",
      "categories": {
        "events": "Array of event categories",
        "actions": "Array of action categories"
      }
    }
  }
}
```

### 2. Authentication Tests

#### Test Case 2.1: Unauthorized Access
```json
{
  "testName": "Unauthorized Access - Missing Token",
  "method": "POST",
  "url": "/api/automation-rules",
  "headers": {},
  "expectedStatus": 401,
  "expectedResponse": {
    "message": "Access denied. No token provided."
  }
}
```

#### Test Case 2.2: Invalid Token
```json
{
  "testName": "Invalid Token",
  "method": "POST",
  "url": "/api/automation-rules",
  "headers": {
    "Authorization": "Bearer invalid_token"
  },
  "expectedStatus": 401,
  "expectedResponse": {
    "message": "Invalid token"
  }
}
```

### 3. Create Rule Tests

#### Test Case 3.1: Valid Rule Creation
```json
{
  "testName": "Create Valid Automation Rule",
  "method": "POST",
  "url": "/api/automation-rules",
  "headers": {
    "Authorization": "Bearer {{auth_token}}",
    "Content-Type": "application/json"
  },
  "body": {
    "name": "Welcome New Lead",
    "coachId": "{{coach_id}}",
    "triggerEvent": "lead_created",
    "actions": [
      {
        "type": "send_whatsapp_message",
        "config": {
          "message": "Welcome! Thank you for your interest.",
          "templateId": "welcome_template"
        }
      },
      {
        "type": "add_lead_tag",
        "config": {
          "tag": "new_lead"
        }
      }
    ]
  },
  "expectedStatus": 201,
  "expectedResponse": {
    "name": "Welcome New Lead",
    "coachId": "{{coach_id}}",
    "triggerEvent": "lead_created",
    "actions": "Array of 2 actions",
    "isActive": true,
    "createdBy": "{{user_id}}"
  }
}
```

#### Test Case 3.2: Missing Required Fields
```json
{
  "testName": "Create Rule - Missing Required Fields",
  "method": "POST",
  "url": "/api/automation-rules",
  "headers": {
    "Authorization": "Bearer {{auth_token}}",
    "Content-Type": "application/json"
  },
  "body": {
    "name": "Incomplete Rule"
  },
  "expectedStatus": 400,
  "expectedResponse": {
    "message": "Validation error"
  }
}
```

#### Test Case 3.3: Invalid Trigger Event
```json
{
  "testName": "Create Rule - Invalid Trigger Event",
  "method": "POST",
  "url": "/api/automation-rules",
  "headers": {
    "Authorization": "Bearer {{auth_token}}",
    "Content-Type": "application/json"
  },
  "body": {
    "name": "Invalid Trigger Rule",
    "coachId": "{{coach_id}}",
    "triggerEvent": "invalid_event",
    "actions": []
  },
  "expectedStatus": 400,
  "expectedResponse": {
    "message": "Validation error"
  }
}
```

#### Test Case 3.4: Invalid Action Type
```json
{
  "testName": "Create Rule - Invalid Action Type",
  "method": "POST",
  "url": "/api/automation-rules",
  "headers": {
    "Authorization": "Bearer {{auth_token}}",
    "Content-Type": "application/json"
  },
  "body": {
    "name": "Invalid Action Rule",
    "coachId": "{{coach_id}}",
    "triggerEvent": "lead_created",
    "actions": [
      {
        "type": "invalid_action",
        "config": {}
      }
    ]
  },
  "expectedStatus": 400,
  "expectedResponse": {
    "message": "Validation error"
  }
}
```

#### Test Case 3.5: Duplicate Rule Name
```json
{
  "testName": "Create Rule - Duplicate Name",
  "method": "POST",
  "url": "/api/automation-rules",
  "headers": {
    "Authorization": "Bearer {{auth_token}}",
    "Content-Type": "application/json"
  },
  "body": {
    "name": "Welcome New Lead",
    "coachId": "{{coach_id}}",
    "triggerEvent": "lead_created",
    "actions": []
  },
  "expectedStatus": 400,
  "expectedResponse": {
    "message": "Rule with this name already exists"
  }
}
```

### 4. Get Rules Tests

#### Test Case 4.1: Get All Rules (Success)
```json
{
  "testName": "Get All Rules - Success",
  "method": "GET",
  "url": "/api/automation-rules",
  "headers": {
    "Authorization": "Bearer {{auth_token}}"
  },
  "expectedStatus": 200,
  "expectedResponse": "Array of automation rules"
}
```

#### Test Case 4.2: Get Rule by ID (Success)
```json
{
  "testName": "Get Rule by ID - Success",
  "method": "GET",
  "url": "/api/automation-rules/{{rule_id}}",
  "headers": {
    "Authorization": "Bearer {{auth_token}}"
  },
  "expectedStatus": 200,
  "expectedResponse": {
    "_id": "{{rule_id}}",
    "name": "Welcome New Lead",
    "coachId": "{{coach_id}}",
    "triggerEvent": "lead_created",
    "actions": "Array of actions",
    "isActive": true,
    "createdBy": "{{user_id}}"
  }
}
```

#### Test Case 4.3: Get Rule by ID (Not Found)
```json
{
  "testName": "Get Rule by ID - Not Found",
  "method": "GET",
  "url": "/api/automation-rules/507f1f77bcf86cd799439011",
  "headers": {
    "Authorization": "Bearer {{auth_token}}"
  },
  "expectedStatus": 404,
  "expectedResponse": {
    "message": "Rule not found"
  }
}
```

### 5. Update Rule Tests

#### Test Case 5.1: Update Rule (Success)
```json
{
  "testName": "Update Rule - Success",
  "method": "PUT",
  "url": "/api/automation-rules/{{rule_id}}",
  "headers": {
    "Authorization": "Bearer {{auth_token}}",
    "Content-Type": "application/json"
  },
  "body": {
    "name": "Updated Welcome Rule",
    "isActive": false
  },
  "expectedStatus": 200,
  "expectedResponse": {
    "_id": "{{rule_id}}",
    "name": "Updated Welcome Rule",
    "isActive": false
  }
}
```

#### Test Case 5.2: Update Rule (Not Found)
```json
{
  "testName": "Update Rule - Not Found",
  "method": "PUT",
  "url": "/api/automation-rules/507f1f77bcf86cd799439011",
  "headers": {
    "Authorization": "Bearer {{auth_token}}",
    "Content-Type": "application/json"
  },
  "body": {
    "name": "Updated Rule"
  },
  "expectedStatus": 404,
  "expectedResponse": {
    "message": "Rule not found"
  }
}
```

### 6. Delete Rule Tests

#### Test Case 6.1: Delete Rule (Success)
```json
{
  "testName": "Delete Rule - Success",
  "method": "DELETE",
  "url": "/api/automation-rules/{{rule_id}}",
  "headers": {
    "Authorization": "Bearer {{auth_token}}"
  },
  "expectedStatus": 200,
  "expectedResponse": {
    "message": "Rule deleted successfully"
  }
}
```

#### Test Case 6.2: Delete Rule (Not Found)
```json
{
  "testName": "Delete Rule - Not Found",
  "method": "DELETE",
  "url": "/api/automation-rules/507f1f77bcf86cd799439011",
  "headers": {
    "Authorization": "Bearer {{auth_token}}"
  },
  "expectedStatus": 404,
  "expectedResponse": {
    "message": "Rule not found"
  }
}
```

## Schema Validation Tests

### Required Fields
- `name` (String, required, unique)
- `coachId` (ObjectId, required)
- `triggerEvent` (String, required, enum)
- `actions` (Array, required)
- `createdBy` (ObjectId, required)

### Enum Validations

#### Valid Trigger Events
- `lead_created`
- `lead_status_changed`
- `lead_temperature_changed`
- `lead_converted_to_client`
- `form_submitted`
- `funnel_stage_entered`
- `funnel_stage_exited`
- `funnel_completed`
- `appointment_booked`
- `appointment_rescheduled`
- `appointment_cancelled`
- `appointment_reminder_time`
- `appointment_finished`
- `content_consumed`
- `task_created`
- `task_completed`
- `task_overdue`
- `payment_successful`
- `payment_failed`
- `payment_link_clicked`
- `payment_abandoned`
- `invoice_paid`
- `subscription_created`
- `subscription_cancelled`
- `card_expired`

#### Valid Action Types
- `update_lead_score`
- `add_lead_tag`
- `remove_lead_tag`
- `add_to_funnel`
- `move_to_funnel_stage`
- `remove_from_funnel`
- `update_lead_field`
- `create_deal`
- `send_whatsapp_message`
- `create_email_message`
- `send_internal_notification`
- `send_push_notification`
- `schedule_drip_sequence`
- `create_task`
- `create_calendar_event`
- `add_note_to_lead`
- `add_followup_date`
- `create_zoom_meeting`
- `create_invoice`
- `issue_refund`
- `call_webhook`
- `trigger_another_automation`

## Test Data Setup

### Prerequisites
1. Valid authentication token
2. Valid coach ID
3. MongoDB connection
4. Test environment setup

### Sample Test Data
```json
{
  "auth_token": "your_jwt_token_here",
  "coach_id": "507f1f77bcf86cd799439012",
  "user_id": "507f1f77bcf86cd799439013",
  "rule_id": "507f1f77bcf86cd799439014"
}
```

## Error Handling Tests

### Common Error Scenarios
1. **400 Bad Request**: Invalid data format, missing required fields
2. **401 Unauthorized**: Missing or invalid authentication token
3. **404 Not Found**: Resource not found
4. **500 Internal Server Error**: Server-side errors

### Error Response Format
```json
{
  "message": "Error description",
  "success": false
}
```

## Performance Tests

### Load Testing Scenarios
1. **Concurrent Rule Creation**: Test multiple simultaneous rule creations
2. **Large Dataset Retrieval**: Test getting rules with large datasets
3. **Bulk Operations**: Test updating/deleting multiple rules

### Expected Response Times
- GET requests: < 200ms
- POST requests: < 500ms
- PUT requests: < 300ms
- DELETE requests: < 200ms

## Security Tests

### Authentication Tests
1. Token expiration handling
2. Invalid token formats
3. Missing authorization headers

### Authorization Tests
1. User access to own rules only
2. Cross-user rule access prevention
3. Admin vs regular user permissions

## Integration Tests

### Database Integration
1. MongoDB connection handling
2. Transaction rollback on errors
3. Data consistency checks

### Middleware Integration
1. Authentication middleware
2. Activity tracking middleware
3. Error handling middleware

## Monitoring and Logging

### Expected Log Messages
- Rule creation: `[AutomationRuleController] New automation rule created: "Rule Name" (ID: rule_id) by coach coach_id.`
- Error logs: `Error creating automation rule: error_message`

### Metrics to Monitor
- API response times
- Error rates
- Database query performance
- Authentication success rates

## Troubleshooting

### Common Issues
1. **MongoDB Connection Errors**: Check database connectivity
2. **Authentication Failures**: Verify token validity and format
3. **Validation Errors**: Check enum values and required fields
4. **Duplicate Name Errors**: Ensure unique rule names

### Debug Steps
1. Check server logs for detailed error messages
2. Verify request payload format
3. Confirm authentication token validity
4. Check database connection status
5. Validate enum values against schema

## Test Environment Setup

### Required Environment Variables
```
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/test_db
JWT_SECRET=your_test_jwt_secret
```

### Database Setup
1. Create test database
2. Seed test data
3. Configure test user accounts
4. Set up test coach profiles

## Conclusion

This testing guide provides comprehensive coverage for the Automation Rules system. Follow the test cases systematically to ensure all functionality works correctly and handles edge cases appropriately.
