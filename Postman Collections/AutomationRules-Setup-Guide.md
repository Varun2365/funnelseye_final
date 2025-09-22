# Automation Rules API - Postman Collection Setup Guide

## Overview
This guide explains how to set up and use the Automation Rules API Postman collection for comprehensive testing.

## Files Created
1. **Testing Guide**: `Testing Guides/AutomationRules-Testing-Guide.md`
2. **Postman Collection**: `Postman Collections/AutomationRules-API-Collection.json`

## Quick Setup

### 1. Import the Collection
1. Open Postman
2. Click "Import" button
3. Select `AutomationRules-API-Collection.json`
4. The collection will be imported with all test cases

### 2. Configure Environment Variables
The collection uses these variables that you need to set:

#### Required Variables
- `base_url`: Your API base URL (default: `http://localhost:3000/api/automation-rules`)
- `auth_token`: Your JWT authentication token
- `coach_id`: Valid coach ObjectId for testing
- `rule_id`: Valid rule ObjectId for testing (will be set after creating a rule)

#### Setting Variables
1. In Postman, click on the collection name
2. Go to "Variables" tab
3. Update the values:
   ```
   base_url: http://localhost:3000/api/automation-rules
   auth_token: your_actual_jwt_token
   coach_id: 507f1f77bcf86cd799439012
   rule_id: (leave empty, will be set after creating a rule)
   ```

### 3. Authentication Setup
The collection is pre-configured with Bearer token authentication. Make sure your `auth_token` variable contains a valid JWT token.

## Test Execution Order

### Recommended Testing Sequence
1. **Public Endpoints**
   - Get Events and Actions

2. **Authentication Tests**
   - Unauthorized Access - Missing Token
   - Invalid Token

3. **Create Rule Tests**
   - Create Valid Rule (save the returned rule ID)
   - Create Rule - Missing Required Fields
   - Create Rule - Invalid Trigger Event
   - Create Rule - Invalid Action Type
   - Create Rule - Duplicate Name

4. **Get Rules Tests**
   - Get All Rules
   - Get Rule by ID - Success (use the rule ID from step 3)
   - Get Rule by ID - Not Found

5. **Update Rule Tests**
   - Update Rule - Success
   - Update Rule - Not Found

6. **Delete Rule Tests**
   - Delete Rule - Success
   - Delete Rule - Not Found

7. **Complex Rule Examples**
   - Appointment Booking Rule
   - Payment Success Rule

## Expected Responses

### Success Responses
- **200**: GET requests (successful retrieval)
- **201**: POST requests (successful creation)
- **200**: PUT requests (successful update)
- **200**: DELETE requests (successful deletion)

### Error Responses
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication issues)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error (server issues)

## Sample Test Data

### Valid Rule Creation
```json
{
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
}
```

### Valid Trigger Events
- `lead_created`
- `lead_status_changed`
- `appointment_booked`
- `payment_successful`
- `task_completed`
- And 20+ more (see full list in testing guide)

### Valid Action Types
- `send_whatsapp_message`
- `add_lead_tag`
- `create_task`
- `create_calendar_event`
- `send_internal_notification`
- And 20+ more (see full list in testing guide)

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check if `auth_token` is valid and not expired
2. **400 Bad Request**: Verify request body format and required fields
3. **404 Not Found**: Ensure `rule_id` exists in database
4. **Connection Error**: Check if server is running on correct port

### Debug Steps
1. Check server logs for detailed error messages
2. Verify MongoDB connection
3. Confirm JWT token validity
4. Test with simpler requests first

## Advanced Testing

### Load Testing
Use Postman's Collection Runner to:
1. Run multiple iterations
2. Test concurrent requests
3. Measure response times

### Automated Testing
Set up Postman monitors to:
1. Run tests automatically
2. Get notifications on failures
3. Track API performance over time

## Integration with CI/CD

### Newman (Command Line)
```bash
# Install Newman
npm install -g newman

# Run collection
newman run AutomationRules-API-Collection.json \
  --environment your-environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

### Environment Files
Create separate environment files for:
- Development
- Staging
- Production

## Best Practices

1. **Test Data Management**: Use separate test data for each environment
2. **Token Management**: Implement token refresh mechanisms
3. **Error Handling**: Test all error scenarios
4. **Performance**: Monitor response times and set thresholds
5. **Documentation**: Keep test cases updated with API changes

## Support

For issues or questions:
1. Check the detailed testing guide
2. Review server logs
3. Verify database connectivity
4. Test individual endpoints manually

## Next Steps

After completing basic testing:
1. Implement automated test runs
2. Set up monitoring and alerts
3. Create performance benchmarks
4. Add integration tests with other systems
