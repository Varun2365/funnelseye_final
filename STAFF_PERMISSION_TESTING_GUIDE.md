# 🧪 Staff Permission System - Testing Documentation

## 📋 Overview

This document provides comprehensive testing guidelines for the staff permission system implementation. The system allows coaches to grant specific permissions to staff members, enabling them to access various features based on their assigned permissions.

## 🎯 Key Features Tested

- **Unified Authentication**: Staff and coaches use the same APIs with permission-based access
- **Permission-Based Data Filtering**: Staff only see data they have permission for
- **"No Data Found" Responses**: Clean UX when staff lacks permissions
- **Staff Action Logging**: Complete audit trail of staff actions
- **Calendar Functionality**: Full calendar support for staff with permissions
- **Permissions API**: New endpoint to retrieve all available permissions

---

## 🔐 Authentication & Authorization Testing

### Test Case 1: Staff Token Authentication
**Endpoint**: Any protected route
**Method**: GET/POST/PUT/DELETE
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Expected Results**:
- ✅ Staff token is accepted
- ✅ `req.userContext.isStaff` = true
- ✅ `req.coachId` = assigned coach's ID
- ✅ `req.userId` = staff member's ID

**Test Data**:
```json
{
  "userContext": {
    "isStaff": true,
    "userId": "staff_member_id",
    "coachId": "assigned_coach_id",
    "permissions": ["leads:read", "funnels:write"]
  }
}
```

### Test Case 2: Coach Token Authentication
**Endpoint**: Any protected route
**Method**: GET/POST/PUT/DELETE
**Headers**: 
```
Authorization: Bearer <coach_token>
Content-Type: application/json
```

**Expected Results**:
- ✅ Coach token is accepted
- ✅ `req.userContext.isStaff` = false
- ✅ `req.coachId` = coach's own ID
- ✅ Full access to all features

---

## 📊 New Permissions API Testing

### Test Case 3: Get All Permissions List
**Endpoint**: `GET /api/coach/staff/permissions`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <coach_token_or_staff_with_staff:read>
Content-Type: application/json
```

**Expected Response Structure**:
```json
{
  "success": true,
  "data": {
    "permissions": {
      "leads": {
        "category": "Lead Management",
        "description": "Manage leads, lead magnets, and lead generation tools",
        "permissions": {
          "leads:read": {
            "name": "View Leads",
            "description": "View lead information and analytics"
          },
          "leads:write": {
            "name": "Create Leads",
            "description": "Create new leads and lead magnet tools"
          }
        }
      }
    },
    "totalCategories": 18,
    "totalPermissions": 89,
    "userContext": {
      "isStaff": false,
      "permissions": []
    }
  }
}
```

**Test Scenarios**:
- ✅ **Coach Access**: Coach can access permissions list
- ✅ **Staff with Permission**: Staff with `staff:read` can access
- ❌ **Staff without Permission**: Staff without `staff:read` gets 403
- ❌ **Invalid Token**: Unauthenticated requests get 401

---

## 🎛️ Dashboard Functionality Testing

### Test Case 4: Staff Dashboard Access
**Endpoint**: `GET /api/coach/dashboard/overview`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Permission Scenarios**:

#### Scenario A: Staff with `dashboard:read` permission
**Expected Results**:
- ✅ Access granted to dashboard
- ✅ Data filtered based on other permissions
- ✅ Response includes `userContext`

#### Scenario B: Staff without `dashboard:read` permission
**Expected Results**:
- ❌ Access denied (403 Forbidden)
- ❌ No dashboard data returned

#### Scenario C: Staff with `dashboard:read` but no other permissions
**Expected Results**:
- ✅ Dashboard loads with limited data
- ✅ Sections without permissions show "No data found"
- ✅ Only permitted data is visible

**Sample Response for Limited Permissions**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "leads": { "message": "No data found" },
      "funnels": { "message": "No data found" },
      "tasks": { "total": 5, "completed": 3 }
    },
    "userContext": {
      "isStaff": true,
      "permissions": ["dashboard:read", "tasks:read"]
    }
  }
}
```

---

## 📈 Lead Management Testing

### Test Case 5: Lead Access with Permissions
**Endpoint**: `GET /api/leads`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

#### Scenario A: Staff with `leads:read` permission
**Expected Results**:
- ✅ Can view leads
- ✅ Data filtered to coach's leads only
- ✅ Staff action logged

#### Scenario B: Staff without `leads:read` permission
**Expected Results**:
- ❌ Access denied (403 Forbidden)

#### Scenario C: Staff with `leads:read` but no `leads:write`
**Test**: `POST /api/leads` (Create Lead)
**Expected Results**:
- ❌ Creation denied (403 Forbidden)

### Test Case 6: Lead Magnets with Permissions
**Endpoint**: `GET /api/lead-magnets/coach`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Permission Scenarios**:
- ✅ **With `leads:read`**: Can view lead magnets
- ❌ **Without `leads:read`**: Access denied
- ✅ **With `leads:write`**: Can create/modify lead magnets
- ❌ **Without `leads:write`**: Creation/modification denied

---

## 🎯 Funnel Management Testing

### Test Case 7: Funnel Access with Permissions
**Endpoint**: `GET /api/funnels`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Permission Matrix**:

| Permission | Read Funnels | Create Funnels | Update Funnels | Delete Funnels | View Analytics |
|------------|--------------|----------------|----------------|----------------|----------------|
| `funnels:read` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `funnels:write` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `funnels:update` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `funnels:delete` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `funnels:view_analytics` | ✅ | ❌ | ❌ | ❌ | ✅ |

**Test Scenarios**:
- ✅ **Full Access**: Staff with all funnel permissions
- ✅ **Read Only**: Staff with only `funnels:read`
- ❌ **No Access**: Staff without funnel permissions
- ✅ **Analytics Only**: Staff with only `funnels:view_analytics`

---

## 📅 Calendar Functionality Testing

### Test Case 8: Calendar Access with Permissions
**Endpoint**: `GET /api/coach/availability/:coachId`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Permission Scenarios**:

#### Scenario A: Staff with `calendar:read` permission
**Expected Results**:
- ✅ Can view coach availability
- ✅ Staff action logged
- ✅ Response includes user context

#### Scenario B: Staff with `calendar:manage` permission
**Test**: `POST /api/coach/availability` (Set Availability)
**Expected Results**:
- ✅ Can modify coach availability
- ✅ Staff action logged
- ✅ Changes applied to coach's calendar

#### Scenario C: Staff without calendar permissions
**Expected Results**:
- ✅ Public availability can be viewed (no auth required)
- ❌ Private calendar operations denied

### Test Case 9: Staff Calendar Events
**Endpoint**: `GET /api/staff-calendar`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Permission Matrix**:

| Permission | View Events | Create Events | Update Events | Delete Events |
|------------|-------------|---------------|---------------|---------------|
| `calendar:read` | ✅ | ❌ | ❌ | ❌ |
| `calendar:write` | ✅ | ✅ | ❌ | ❌ |
| `calendar:update` | ✅ | ✅ | ✅ | ❌ |
| `calendar:delete` | ✅ | ✅ | ✅ | ✅ |

---

## 🤖 AI Tools Testing

### Test Case 10: AI Tools Access with Permissions
**Endpoint**: `POST /api/lead-magnets/ai-diet-plan`
**Method**: POST
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Body**:
```json
{
  "leadId": "lead_id_here",
  "userPreferences": {
    "dietType": "keto",
    "allergies": ["nuts"]
  }
}
```

**Permission Scenarios**:
- ✅ **With `leads:write`**: Can generate AI diet plans
- ❌ **Without `leads:write`**: Access denied
- ✅ **Staff action logged**: All AI tool usage tracked

---

## 📊 Marketing & Ads Testing

### Test Case 11: Marketing Tools Access
**Endpoint**: `GET /api/marketing/v1/credentials/meta/setup-steps`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Permission Scenarios**:
- ✅ **With `ads:read`**: Can view marketing setup steps
- ❌ **Without `ads:read`**: Access denied

### Test Case 12: Ad Campaign Management
**Endpoint**: `GET /api/marketing/v1/campaigns`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Permission Matrix**:

| Permission | View Campaigns | Create Campaigns | Update Campaigns | Delete Campaigns |
|------------|----------------|------------------|------------------|------------------|
| `ads:read` | ✅ | ❌ | ❌ | ❌ |
| `ads:write` | ✅ | ✅ | ❌ | ❌ |
| `ads:update` | ✅ | ✅ | ✅ | ❌ |
| `ads:delete` | ✅ | ✅ | ✅ | ✅ |

---

## 📝 Message Templates Testing

### Test Case 13: Template Management
**Endpoint**: `GET /api/message-templates`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Permission Scenarios**:
- ✅ **With `templates:read`**: Can view templates
- ✅ **With `templates:write`**: Can create templates
- ✅ **With `templates:update`**: Can modify templates
- ✅ **With `templates:delete`**: Can remove templates
- ❌ **Without permissions**: Access denied

---

## 🔄 Automation & Sequences Testing

### Test Case 14: Automation Rules
**Endpoint**: `GET /api/automation-rules`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Permission Scenarios**:
- ✅ **With `automation:read`**: Can view automation rules
- ✅ **With `automation:write`**: Can create rules
- ✅ **With `automation:execute`**: Can test sequences
- ❌ **Without permissions**: Access denied

---

## 📈 Performance & Analytics Testing

### Test Case 15: Financial Data Access
**Endpoint**: `GET /api/coach/financial/data`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Permission Scenarios**:

#### Scenario A: Staff with `performance:read` permission
**Expected Results**:
- ✅ Can view financial data
- ✅ Data filtered appropriately
- ✅ Staff action logged

#### Scenario B: Staff without `performance:read` permission
**Expected Results**:
- ✅ Returns "No data found" message
- ❌ No financial data exposed
- ✅ Clean UX response

**Sample Response for No Permission**:
```json
{
  "success": true,
  "data": { "message": "No data found" },
  "userContext": {
    "isStaff": true,
    "permissions": ["leads:read"]
  }
}
```

---

## 👥 Staff Management Testing

### Test Case 16: Staff CRUD Operations
**Endpoint**: `GET /api/coach/staff`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Permission Scenarios**:
- ✅ **With `staff:read`**: Can view staff members
- ✅ **With `staff:write`**: Can create staff
- ✅ **With `staff:update`**: Can modify staff
- ✅ **With `staff:delete`**: Can remove staff
- ❌ **Without permissions**: Access denied

### Test Case 17: Permission Assignment
**Endpoint**: `PUT /api/coach/staff/:staffId/permissions`
**Method**: PUT
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Body**:
```json
{
  "permissions": ["leads:read", "funnels:write", "calendar:manage"]
}
```

**Expected Results**:
- ✅ **With `staff:manage`**: Can assign permissions
- ❌ **Without `staff:manage`**: Access denied
- ✅ **Permissions updated**: Staff gets new permissions
- ✅ **Action logged**: Permission changes tracked

---

## 🔍 MLM & Hierarchy Testing

### Test Case 18: MLM Access
**Endpoint**: `GET /api/mlm/downline`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Permission Scenarios**:
- ✅ **With `mlm:read`**: Can view MLM data
- ✅ **With `mlm:manage`**: Can manage MLM operations
- ❌ **Without permissions**: Access denied

---

## 📋 Task Management Testing

### Test Case 19: Workflow Tasks
**Endpoint**: `GET /api/workflow/tasks`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Permission Scenarios**:
- ✅ **With `tasks:read`**: Can view tasks
- ✅ **With `tasks:write`**: Can create tasks
- ✅ **With `tasks:assign`**: Can assign tasks
- ✅ **With `tasks:manage`**: Full task management
- ❌ **Without permissions**: Access denied

---

## 🔐 Security & Access Control Testing

### Test Case 20: Cross-Coach Data Access
**Test Scenario**: Staff from Coach A trying to access Coach B's data
**Expected Results**:
- ❌ **Access Denied**: Staff can only access their assigned coach's data
- ✅ **Data Filtering**: All queries automatically filtered by coach ID
- ✅ **Security Maintained**: No data leakage between coaches

### Test Case 21: Permission Escalation
**Test Scenario**: Staff trying to access features beyond their permissions
**Expected Results**:
- ❌ **Access Denied**: 403 Forbidden responses
- ✅ **Clean UX**: "No data found" instead of errors where appropriate
- ✅ **Audit Trail**: All unauthorized access attempts logged

---

## 📊 Daily Priority Feed Testing

### Test Case 22: Priority Feed Access
**Endpoint**: `GET /api/coach/daily-feed`
**Method**: GET
**Headers**: 
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Permission Scenarios**:
- ✅ **With `dashboard:read`**: Can view priority feed
- ✅ **Data Filtering**: Feed items filtered based on permissions
- ✅ **Staff Context**: Response includes user context
- ❌ **Without permissions**: Access denied

---

## 🧪 Test Data Setup

### Staff Test Accounts
Create test staff accounts with different permission sets:

```json
{
  "staffAccounts": [
    {
      "name": "Staff Read Only",
      "permissions": ["leads:read", "funnels:read", "dashboard:read"]
    },
    {
      "name": "Staff Lead Manager", 
      "permissions": ["leads:read", "leads:write", "leads:update", "leads:manage"]
    },
    {
      "name": "Staff Full Access",
      "permissions": ["leads:*", "funnels:*", "tasks:*", "calendar:*"]
    },
    {
      "name": "Staff No Permissions",
      "permissions": []
    }
  ]
}
```

### Coach Test Account
```json
{
  "coachAccount": {
    "name": "Test Coach",
    "permissions": "ALL", // Coach has full access
    "staffMembers": 4
  }
}
```

---

## 🚀 Performance Testing

### Test Case 23: Load Testing with Permissions
**Scenario**: Multiple staff members accessing the same endpoints
**Metrics to Monitor**:
- ✅ **Response Times**: Should remain under 200ms
- ✅ **Memory Usage**: No memory leaks from permission checks
- ✅ **Database Queries**: Efficient querying with proper indexing
- ✅ **Concurrent Access**: Multiple staff can access simultaneously

### Test Case 24: Permission Check Performance
**Scenario**: Heavy permission validation
**Expected Results**:
- ✅ **Fast Permission Checks**: <10ms per check
- ✅ **Cached Results**: Repeated checks use cache
- ✅ **Minimal Database Impact**: Efficient permission queries

---

## 🐛 Error Handling Testing

### Test Case 25: Invalid Permission Scenarios
**Test Cases**:
- ❌ **Invalid Permission Format**: `invalid:permission`
- ❌ **Non-existent Permissions**: `leads:invalid_action`
- ❌ **Malformed Tokens**: Invalid JWT tokens
- ❌ **Expired Tokens**: Expired staff tokens

**Expected Results**:
- ✅ **Proper Error Messages**: Clear error responses
- ✅ **Security Maintained**: No information leakage
- ✅ **Graceful Degradation**: System remains stable

---

## 📝 Test Checklist

### Pre-Test Setup
- [ ] Create test coach account
- [ ] Create test staff accounts with various permission sets
- [ ] Set up test data (leads, funnels, tasks, etc.)
- [ ] Ensure all routes are properly configured
- [ ] Verify middleware is working correctly

### Core Functionality Tests
- [ ] Staff authentication works
- [ ] Permission-based access control works
- [ ] Data filtering works correctly
- [ ] "No data found" responses work
- [ ] Staff action logging works
- [ ] Permissions API returns correct data

### Security Tests
- [ ] Cross-coach data access is blocked
- [ ] Permission escalation is prevented
- [ ] Invalid tokens are rejected
- [ ] Unauthorized access is logged

### Performance Tests
- [ ] Response times are acceptable
- [ ] Memory usage is stable
- [ ] Database queries are efficient
- [ ] Concurrent access works

### Integration Tests
- [ ] All coach routes work with staff tokens
- [ ] Calendar functionality works for staff
- [ ] Dashboard shows appropriate data
- [ ] Permission changes take effect immediately

---

## 📋 Test Results Documentation

### Test Result Template
```markdown
## Test Case: [Test Name]
**Date**: [Date]
**Tester**: [Name]
**Environment**: [Dev/Staging/Production]

### Test Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Results:
- [Expected Result 1]
- [Expected Result 2]

### Actual Results:
- [Actual Result 1]
- [Actual Result 2]

### Status: ✅ PASS / ❌ FAIL
**Notes**: [Additional notes or issues found]
```

---

## 🎯 Success Criteria

The staff permission system is considered successfully implemented when:

- ✅ **All test cases pass**
- ✅ **Staff can access permitted features**
- ✅ **Staff cannot access restricted features**
- ✅ **Data filtering works correctly**
- ✅ **Performance is acceptable**
- ✅ **Security is maintained**
- ✅ **Audit trail is complete**
- ✅ **Permissions API works correctly**

---

## 📞 Support & Troubleshooting

### Common Issues:
1. **403 Forbidden**: Check staff permissions
2. **No data found**: Verify data exists and permissions are correct
3. **Slow responses**: Check database indexes and query optimization
4. **Permission not working**: Verify permission assignment and middleware

### Debug Information:
- Check server logs for permission checks
- Verify JWT token payload
- Confirm staff-coach relationship
- Validate permission format

---

*This testing documentation covers all implemented staff permission functionality. Update this document as new features are added or existing features are modified.*
