# 🚀 Advanced MLM Network Testing Guide v2.0

## 📋 **Table of Contents**
- [🎯 Quick Start Checklist](#-quick-start-checklist)
- [⏱️ Time Estimates](#️-time-estimates)
- [🔧 Prerequisites](#-prerequisites)
- [🏗️ Hierarchy System Testing](#️-hierarchy-system-testing)
- [👥 Coach Management Testing](#-coach-management-testing)
- [💰 Commission System Testing](#-commission-system-testing)
- [📊 Reporting & Analytics Testing](#-reporting--analytics-testing)
- [🔒 Security & Access Control Testing](#-security--access-control-testing)
- [🧪 Integration Testing](#-integration-testing)
- [🚨 Troubleshooting Guide](#-troubleshooting-guide)

---

## 🎯 **Quick Start Checklist**

### **Phase 1: Setup & Configuration (30 mins)**
- [ ] ✅ Setup coach ranks with new MLM names
- [ ] ✅ Configure commission settings for subscriptions only
- [ ] ✅ Verify admin access and permissions

### **Phase 2: Core Functionality (45 mins)**
- [ ] ✅ Test coach signup with complete hierarchy
- [ ] ✅ Test sponsor selection (digital coaches only)
- [ ] ✅ Test hierarchy locking system
- [ ] ✅ Test subscription commission calculation

### **Phase 3: Advanced Features (30 mins)**
- [ ] ✅ Test admin request system
- [ ] ✅ Test reporting and analytics
- [ ] ✅ Test security and access control

---

## ⏱️ **Time Estimates**

| **Testing Phase** | **Estimated Time** | **Priority** |
|-------------------|-------------------|--------------|
| **Setup & Configuration** | 30 minutes | 🔴 High |
| **Core Functionality** | 45 minutes | 🔴 High |
| **Advanced Features** | 30 minutes | 🟡 Medium |
| **Integration Testing** | 20 minutes | 🟡 Medium |
| **Total Estimated Time** | **2 hours 5 minutes** | - |

---

## 🔧 **Prerequisites**

### **Required Tools:**
- **API Testing Tool:** Postman, Insomnia, or similar
- **Database Access:** MongoDB connection (optional)
- **Admin Account:** Verified admin user with JWT token
- **Test Data:** Sample coach and subscription data

### **Environment Setup:**
- **Base URL:** `http://localhost:3000/api` (adjust as needed)
- **Authentication:** JWT tokens in Authorization header
- **Database:** MongoDB with MLM schemas

---

## 🏗️ **Coach Rank System Testing**

### **Test 1: Setup Coach Ranks**

**Endpoint:** `POST /api/advanced-mlm/setup-hierarchy`

**Headers:**
```http
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Body:** None required

**Expected Response:**
```json
{
  "success": true,
  "message": "Coach ranks setup completed successfully.",
  "data": [
    {
      "level": 1,
      "name": "Distributor Coach",
      "description": "Entry level coach"
    },
    {
      "level": 2,
      "name": "Senior Consultant", 
      "description": "Intermediate coach"
    }
    // ... 10 more ranks
  ]
}
```

**Test Cases:**
- [ ] ✅ Admin can setup coach ranks
- [ ] ✅ All 12 ranks created with correct names
- [ ] ✅ Non-admin users cannot setup ranks
- [ ] ✅ Duplicate setup returns existing ranks

---

### **Test 2: Get Coach Ranks**

**Endpoint:** `GET /api/auth/coach-ranks`

**Headers:** None required (public endpoint)

**Expected Response:**
```json
{
  "success": true,
  "message": "Coach ranks retrieved successfully.",
  "data": [
    {
      "level": 1,
      "name": "Distributor Coach",
      "description": "Entry level coach"
    }
  ]
}
```

**Test Cases:**
- [ ] ✅ Public access to coach ranks
- [ ] ✅ All 12 ranks returned
- [ ] ✅ Ranks sorted by level number
- [ ] ✅ Only active ranks returned

---

### **Test 3: Generate Coach ID**

**Endpoint:** `POST /api/advanced-mlm/generate-coach-id`

**Headers:** None required (public endpoint)

**Expected Response:**
```json
{
  "success": true,
  "message": "Coach ID generated successfully.",
  "data": {
    "coachId": "W1234567"
  }
}
```

**Test Cases:**
- [ ] ✅ Unique 8-character coach ID generated
- [ ] ✅ Format: W + 7 digits
- [ ] ✅ Multiple calls generate different IDs
- [ ] ✅ ID format validation

---

## 👥 **Coach Management Testing**

### **Test 4: Coach Signup with Complete Hierarchy**

**Endpoint:** `POST /api/auth/signup`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Test Coach",
  "email": "testcoach@example.com",
  "password": "Passw0rd!",
  "role": "coach",
  "selfCoachId": "W1234567",
  "currentLevel": 1,
  "sponsorId": "existing_sponsor_id",
  "teamRankName": "Team Alpha",
  "presidentTeamRankName": "President Team"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Coach registered successfully with MLM hierarchy. An OTP has been sent to your email for verification.",
  "userId": "user_id",
  "email": "testcoach@example.com",
  "role": "coach",
  "selfCoachId": "W1234567",
  "currentLevel": 1,
  "sponsorId": "sponsor_id",
  "teamRankName": "Team Alpha",
  "presidentTeamRankName": "President Team"
}
```

**Test Cases:**
- [ ] ✅ Coach created with all hierarchy fields
- [ ] ✅ Self coach ID is unique
- [ ] ✅ Current level is valid (1-12)
- [ ] ✅ Sponsor ID is required and valid
- [ ] ✅ Optional team rank fields accepted
- [ ] ✅ OTP sent for verification
- [ ] ✅ Hierarchy automatically locked after save

---

### **Test 5: Get Available Sponsors**

**Endpoint:** `GET /api/auth/available-sponsors`

**Headers:** None required (public endpoint)

**Expected Response:**
```json
{
  "success": true,
  "message": "Available sponsors retrieved successfully.",
  "data": {
    "digitalSponsors": [
      {
        "id": "sponsor_id",
        "name": "Sponsor Name",
        "email": "sponsor@example.com",
        "selfCoachId": "W2345678",
        "currentLevel": 2,
        "teamRankName": "Team Beta"
      }
    ],
    "message": "Only digital coaches can be sponsors. External sponsors are not supported."
  }
}
```

**Test Cases:**
- [ ] ✅ Only digital coaches returned as sponsors
- [ ] ✅ No external sponsors in response
- [ ] ✅ Only verified and active coaches
- [ ] ✅ Clear message about external sponsors removed
- [ ] ✅ Sponsor details include required fields

---

### **Test 6: Upgrade User to Coach**

**Endpoint:** `POST /api/auth/upgrade-to-coach`

**Headers:**
```http
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "user_id",
  "selfCoachId": "W1234567",
  "currentLevel": 1,
  "sponsorId": "sponsor_id",
  "teamRankName": "Team Alpha",
  "presidentTeamRankName": "President Team"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User successfully upgraded to coach with MLM hierarchy!",
  "user": {
    "id": "user_id",
    "name": "Coach Name",
    "email": "coach@example.com",
    "role": "coach",
    "selfCoachId": "W1234567",
    "currentLevel": 1,
    "sponsorId": "sponsor_id"
  }
}
```

**Test Cases:**
- [ ] ✅ User upgraded to coach role
- [ ] ✅ All hierarchy fields set correctly
- [ ] ✅ Hierarchy automatically locked
- [ ] ✅ Only verified users can upgrade
- [ ] ✅ Duplicate coach ID validation

---

### **Test 7: Lock Hierarchy**

**Endpoint:** `POST /api/auth/lock-hierarchy`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "coachId": "coach_id"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Hierarchy locked successfully. Changes can only be made through admin request.",
  "data": {
    "hierarchyLocked": true,
    "hierarchyLockedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Test Cases:**
- [ ] ✅ Hierarchy locked successfully
- [ ] ✅ Timestamp recorded
- [ ] ✅ Only coaches can lock hierarchy
- [ ] ✅ Already locked hierarchy returns error
- [ ] ✅ Non-coach users cannot lock hierarchy

---

### **Test 8: Get Current User (Me Route)**

**Endpoint:** `GET /api/auth/me`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "Coach Name",
    "email": "coach@example.com",
    "role": "coach",
    "isVerified": true,
    "selfCoachId": "W1234567",
    "currentLevel": 1,
    "sponsorId": {
      "id": "sponsor_id",
      "name": "Sponsor Name",
      "email": "sponsor@example.com",
      "selfCoachId": "W2345678",
      "currentLevel": 2
    },
    "teamRankName": "Team Alpha",
    "presidentTeamRankName": "President Team",
    "hierarchyLocked": true,
    "hierarchyLockedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Test Cases:**
- [ ] ✅ Complete user data returned
- [ ] ✅ Sponsor information populated
- [ ] ✅ No external sponsor data
- [ ] ✅ Password field excluded
- [ ] ✅ Hierarchy lock status included
- [ ] ✅ All MLM fields present

---

## 💰 **Commission System Testing**

### **Test 9: Calculate Subscription Commission**

**Endpoint:** `POST /api/advanced-mlm/calculate-subscription-commission`

**Headers:**
```http
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "subscriptionId": "subscription_id",
  "coachId": "coach_id",
  "subscriptionAmount": 99.99,
  "subscriptionType": "monthly",
  "notes": "Monthly subscription commission"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Subscription commission calculated successfully.",
  "data": {
    "commissionId": "commission_id",
    "coachId": "coach_id",
    "coachName": "Coach Name",
    "coachLevel": 1,
    "subscriptionAmount": 99.99,
    "commissionPercentage": 0.10,
    "commissionAmount": 9.99,
    "status": "pending"
  }
}
```

**Test Cases:**
- [ ] ✅ Commission calculated only on subscriptions
- [ ] ✅ Different rates for subscription types
- [ ] ✅ Level-based multipliers applied
- [ ] ✅ Commission record created
- [ ] ✅ Only admins can calculate commissions
- [ ] ✅ Required fields validation

---

### **Test 10: Commission Settings Management**

**Endpoint:** `PUT /api/advanced-mlm/admin/commission-settings`

**Headers:**
```http
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "subscriptionCommissions": {
    "monthly": 0.10,
    "yearly": 0.15,
    "lifetime": 0.20,
    "default": 0.10
  },
  "levelMultipliers": {
    "1": 1.0,
    "2": 1.1,
    "3": 1.2
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Commission settings updated successfully.",
  "data": {
    "subscriptionCommissions": {
      "monthly": 0.10,
      "yearly": 0.15,
      "lifetime": 0.20,
      "default": 0.10
    }
  }
}
```

**Test Cases:**
- [ ] ✅ Subscription commission rates updated
- [ ] ✅ Level multipliers configured
- [ ] ✅ Only admins can update settings
- [ ] ✅ Validation of commission percentages
- [ ] ✅ Settings saved correctly

---

## 📊 **Reporting & Analytics Testing**

### **Test 11: Get Downline**

**Endpoint:** `GET /api/advanced-mlm/downline/:coachId?includePerformance=true`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Downline retrieved successfully.",
  "data": {
    "directDownline": [
      {
        "id": "downline_id",
        "name": "Downline Name",
        "email": "downline@example.com",
        "selfCoachId": "W3456789",
        "currentLevel": 1,
        "joinDate": "2024-01-15T10:30:00Z"
      }
    ],
    "totalCount": 1,
    "levels": 1
  }
}
```

**Test Cases:**
- [ ] ✅ Direct downline members returned
- [ ] ✅ Performance data included when requested
- [ ] ✅ Only coach can access their downline
- [ ] ✅ Proper pagination and filtering

---

### **Test 12: Generate Team Report**

**Endpoint:** `POST /api/advanced-mlm/generate-report`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "reportType": "team_performance",
  "sponsorId": "coach_id",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "includeCharts": true,
  "format": "pdf"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Team report generated successfully.",
  "data": {
    "reportId": "report_id",
    "downloadUrl": "download_url",
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Test Cases:**
- [ ] ✅ Report generated successfully
- [ ] ✅ Different report types supported
- [ ] ✅ Date range filtering works
- [ ] ✅ Multiple output formats
- [ ] ✅ Only coach can generate their reports

---

## 🔒 **Security & Access Control Testing**

### **Test 13: Hierarchy Security**

**Test Cases:**
- [ ] ✅ Hierarchy locked after first save
- [ ] ✅ Coaches cannot edit hierarchy fields
- [ ] ✅ Admin requests required for changes
- [ ] ✅ Support tickets for level/rank changes
- [ ] ✅ Proper role-based access control

---

### **Test 14: Authentication & Authorization**

**Test Cases:**
- [ ] ✅ JWT tokens required for protected routes
- [ ] ✅ Role-based access control working
- [ ] ✅ Admin-only functions protected
- [ ] ✅ Coach-only functions protected
- [ ] ✅ Public endpoints accessible without auth

---

## 🧪 **Integration Testing**

### **Test 15: Complete MLM Flow**

**Test Scenario:** Complete coach onboarding and commission flow

**Steps:**
1. ✅ Setup hierarchy levels (admin)
2. ✅ Coach signup with complete hierarchy
3. ✅ Verify email with OTP
4. ✅ Login and get complete user data
5. ✅ Lock hierarchy (one-time action)
6. ✅ Admin calculates subscription commission
7. ✅ Generate team performance report
8. ✅ Submit admin request for hierarchy change

**Expected Results:**
- [ ] ✅ All steps complete successfully
- [ ] ✅ Data consistency across endpoints
- [ ] ✅ Proper error handling
- [ ] ✅ Security measures enforced

---

## 🚨 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **Issue 1: Hierarchy Levels Not Setup**
**Symptoms:** 404 errors on hierarchy endpoints
**Solution:** Run `POST /api/advanced-mlm/setup-hierarchy` as admin

#### **Issue 2: External Sponsor Errors**
**Symptoms:** References to external sponsors
**Solution:** External sponsors removed - only digital coaches supported

#### **Issue 3: Commission Calculation Fails**
**Symptoms:** Commission calculation errors
**Solution:** Verify commission settings configured and subscription data valid

#### **Issue 4: Hierarchy Lock Issues**
**Symptoms:** Hierarchy not locking after save
**Solution:** Check auto-lock function and verify coach role

#### **Issue 5: Authentication Errors**
**Symptoms:** 401/403 errors
**Solution:** Verify JWT token and user role permissions

---

## 📝 **Testing Notes**

### **Key Changes in v2.0:**
1. **External Sponsors Removed:** Only digital coaches can be sponsors
2. **Commission System:** Only applies to platform subscriptions
3. **Hierarchy Levels:** 12 specific MLM levels with proper names
4. **Auto-Lock:** Hierarchy automatically locked after first save
5. **Admin Approval:** All changes require admin verification

### **Testing Priorities:**
- 🔴 **High Priority:** Core functionality, security, commission system
- 🟡 **Medium Priority:** Reporting, analytics, integration
- 🟢 **Low Priority:** Edge cases, performance testing

---

## 🎯 **Success Criteria**

### **All Tests Must Pass:**
- [ ] ✅ Hierarchy system working correctly
- [ ] ✅ Coach management complete
- [ ] ✅ Commission system functional
- [ ] ✅ Security measures enforced
- [ ] ✅ Integration flow working
- [ ] ✅ Error handling proper
- [ ] ✅ Performance acceptable

---

**Last Updated:** January 2024  
**Version:** 2.0  
**Status:** Ready for Testing
