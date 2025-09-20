# Postman Collection Setup Guide

## Overview

This guide will help you set up and use the Staff Unified Dashboard API Postman collection for testing all the staff management and dashboard functionality.

## Collection Features

- **Complete API Coverage**: All staff dashboard endpoints
- **Authentication Support**: Login flows for staff and coaches
- **Permission Testing**: Test permission-based access control
- **Environment Variables**: Easy token management
- **Request Examples**: Pre-configured request bodies
- **Error Handling**: Test various error scenarios

## Setup Instructions

### 1. Import the Collection

1. Open Postman
2. Click "Import" button
3. Select the `Staff-Unified-Dashboard-API-Collection.json` file
4. The collection will be imported with all folders and requests

### 2. Set Up Environment Variables

Create a new environment in Postman with the following variables:

```json
{
    "base_url": "http://localhost:5000",
    "token": "",
    "staff_token": "",
    "coach_token": ""
}
```

**Variable Descriptions:**
- `base_url`: Your API server URL (default: http://localhost:5000)
- `token`: General authentication token
- `staff_token`: Staff member authentication token
- `coach_token`: Coach authentication token

### 3. Authentication Flow

#### Step 1: Staff Login
1. Go to `Authentication > Staff Login`
2. Update the request body with valid staff credentials:
```json
{
    "email": "staff@example.com",
    "password": "password123"
}
```
3. Send the request
4. Copy the `token` from the response
5. Set the `staff_token` environment variable

#### Step 2: Coach Login
1. Go to `Authentication > Coach Login`
2. Update the request body with valid coach credentials:
```json
{
    "email": "coach@example.com",
    "password": "password123"
}
```
3. Send the request
4. Copy the `token` from the response
5. Set the `coach_token` environment variable

### 4. Testing Permissions

#### View Available Permissions
1. Go to `Permissions > Get All Permissions`
2. Use either `staff_token` or `coach_token`
3. This will show all available permissions and permission groups

#### Test Permission Groups
1. Go to `Permissions > Get Permission Groups`
2. This shows pre-defined permission groups like "Lead Manager", "Funnel Manager", etc.

### 5. Coach Staff Management

#### Create Staff Member
1. Go to `Coach Staff Management > Create Staff Member`
2. Update the request body:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "permissions": [
        "leads:read",
        "leads:write",
        "tasks:read",
        "tasks:write"
    ]
}
```
3. Send the request
4. Copy the `_id` from the response for use in other requests

#### Assign Permission Group
1. Go to `Coach Staff Management > Assign Permission Group`
2. Update the `:staffId` parameter with the staff ID from the previous step
3. Update the request body:
```json
{
    "groupName": "Lead Manager"
}
```
4. Send the request

### 6. Staff Dashboard Testing

#### Test Dashboard Access
1. Go to `Staff Dashboard > Get Complete Dashboard`
2. This will return dashboard data based on the staff member's permissions
3. Try different `sections` parameter values:
   - `sections=all` (default)
   - `sections=overview,leads,tasks`
   - `sections=funnels`

#### Test Permission-Based Access
1. Try accessing different sections:
   - `Staff Dashboard > Get Overview`
   - `Lead Management > Get All Leads`
   - `Task Management > Get All Tasks`
2. If the staff member doesn't have the required permissions, you'll get a 403 error

### 7. CRUD Operations Testing

#### Lead Management
1. **Create Lead**: Use `Lead Management > Create Lead`
2. **Update Lead**: Use `Lead Management > Update Lead` (update the `:leadId` parameter)
3. **Delete Lead**: Use `Lead Management > Delete Lead` (update the `:leadId` parameter)

#### Task Management
1. **Create Task**: Use `Task Management > Create Task`
2. **Assign Task**: Use `Task Management > Assign Task` (update the `:taskId` parameter)

#### Funnel Management
1. **Create Funnel**: Use `Funnel Management > Create Funnel`
2. **Add Stage**: Use `Funnel Management > Add Stage to Funnel` (update the `:funnelId` parameter)
3. **View Analytics**: Use `Funnel Management > Get Funnel Analytics`

## Testing Scenarios

### Scenario 1: Lead Manager Staff
1. Create a staff member with Lead Manager permissions
2. Test that they can:
   - View leads (`leads:read`)
   - Create leads (`leads:write`)
   - Update leads (`leads:update`)
   - Manage leads (`leads:manage`)
3. Test that they cannot:
   - Access funnel management (no funnel permissions)
   - Manage other staff (no staff permissions)

### Scenario 2: Funnel Editor Staff
1. Create a staff member with Funnel Editor permissions
2. Test that they can:
   - View funnels (`funnels:read`)
   - Update funnels (`funnels:update`)
   - Edit stages (`funnels:edit_stages`)
   - View analytics (`funnels:view_analytics`)
3. Test that they cannot:
   - Create funnels (no `funnels:write`)
   - Delete funnels (no `funnels:delete`)
   - Publish funnels (no `funnels:publish`)

### Scenario 3: Full Access Staff
1. Create a staff member with Full Access permissions
2. Test that they can access all sections and perform all operations
3. Verify they have complete coach-level functionality

## Error Testing

### Permission Denied (403)
- Try accessing endpoints without proper permissions
- Example: Staff with only `leads:read` trying to create leads

### Authentication Required (401)
- Try accessing endpoints without authentication token
- Example: Remove the Authorization header

### Resource Not Found (404)
- Try accessing non-existent resources
- Example: Use invalid staff ID, lead ID, or funnel ID

## Tips for Effective Testing

1. **Use Environment Variables**: Always use `{{staff_token}}` and `{{coach_token}}` in headers
2. **Update Parameters**: Remember to update `:staffId`, `:leadId`, `:taskId`, `:funnelId` parameters
3. **Test Permission Boundaries**: Try operations that should be denied
4. **Clean Up**: Delete test data after testing
5. **Use Console**: Check Postman console for detailed request/response logs

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if the token is valid and properly set in environment variables
2. **403 Forbidden**: Verify the staff member has the required permissions
3. **404 Not Found**: Ensure the resource ID exists and belongs to the authenticated user
4. **400 Bad Request**: Check the request body format and required fields

### Debug Steps

1. Check environment variables are set correctly
2. Verify the base URL is accessible
3. Ensure the server is running
4. Check request headers include proper Authorization
5. Validate request body JSON format

## Collection Structure

```
Staff Unified Dashboard API
├── Authentication
│   ├── Staff Login
│   └── Coach Login
├── Permissions
│   ├── Get All Permissions
│   ├── Get Permission Groups
│   └── Get Section Permissions
├── Coach Staff Management
│   ├── Get All Staff
│   ├── Create Staff Member
│   ├── Update Staff Permissions
│   └── Assign Permission Group
├── Staff Dashboard
│   ├── Get Complete Dashboard
│   └── Get Overview
├── Lead Management
│   ├── Get All Leads
│   ├── Create Lead
│   ├── Update Lead
│   └── Delete Lead
├── Task Management
│   ├── Get All Tasks
│   ├── Create Task
│   └── Assign Task
└── Funnel Management
    ├── Get All Funnels
    ├── Create Funnel
    ├── Add Stage to Funnel
    └── Get Funnel Analytics
```

This collection provides comprehensive testing coverage for the entire Staff Unified Dashboard system with proper authentication and permission validation.
