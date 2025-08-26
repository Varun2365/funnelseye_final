# 📊 Advanced MLM Network Testing Guide

## 🎯 **Overview**
The Advanced MLM Network is a comprehensive multi-level marketing system that integrates with the **unified signup system**. Users can now:
- **Sign up as coaches directly** during registration using `/api/auth/signup` with `role: 'coach'`
- **Upgrade to coaches later** using `/api/auth/upgrade-to-coach`
- **Access all MLM features** through the advanced MLM routes

## 🚨 **IMPORTANT: Fix for "Invalid hierarchy level selected" Error**

**Problem:** The error occurs because the `CoachHierarchyLevel` collection is empty.

**Solution:** Use the setup endpoint to populate hierarchy levels before testing.

### **Quick Fix - Setup Hierarchy Levels (Admin Only):**
```http
POST /api/advanced-mlm/setup-hierarchy
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

This creates 12 default levels (Bronze to Supreme Crown Ambassador) and resolves the signup error.

## 🚀 **Testing Phases**

### **Phase 1: Public Routes (No Authentication Required)**
*Start here - these routes can be tested immediately*

### **Phase 2: Private Routes (Coach Authentication Required)**
*Requires a coach account and JWT token*

### **Phase 3: Admin Routes (Admin Authentication Required)**
*Requires admin privileges*

---

## 🔧 **Phase 1: Public Routes (No Authentication Required)**

### **1.1 Setup Hierarchy Levels (Admin Only)**
**Endpoint:** `POST /api/advanced-mlm/setup-hierarchy`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Body:** No body required

**Expected Response:**
```json
{
  "success": true,
  "message": "Hierarchy levels setup completed successfully.",
  "data": [
    {
      "_id": "...",
      "level": 1,
      "name": "Bronze",
      "description": "Entry level coach",
      "isActive": true
    }
    // ... 11 more levels
  ]
}
```

**Testing Checklist:**
- ✅ Admin JWT token is valid
- ✅ Returns 12 hierarchy levels
- ✅ All levels are marked as active
- ✅ Levels have proper names (Bronze, Silver, Gold, etc.)

### **1.2 Get Hierarchy Levels**
**Endpoint:** `GET /api/advanced-mlm/hierarchy-levels`

**Headers:** No authentication required

**Expected Response:**
```json
{
  "success": true,
  "message": "Hierarchy levels retrieved successfully.",
  "data": [
    {
      "_id": "...",
      "level": 1,
      "name": "Bronze",
      "description": "Entry level coach",
      "isActive": true
    }
    // ... all 12 levels
  ]
}
```

**Testing Checklist:**
- ✅ Returns all 12 hierarchy levels
- ✅ Levels are sorted by level number (1-12)
- ✅ Each level has name, description, and isActive fields

### **1.3 Generate Coach ID**
**Endpoint:** `POST /api/advanced-mlm/generate-coach-id`

**Headers:** No authentication required

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

**Testing Checklist:**
- ✅ Returns a unique 8-character coach ID
- ✅ ID starts with 'W' followed by 7 digits
- ✅ Each call generates a different ID

### **1.4 Search for Sponsors**
**Endpoint:** `GET /api/advanced-mlm/search-sponsor?searchTerm=john&searchType=digital`

**Headers:** No authentication required

**Expected Response:**
```json
{
  "success": true,
  "message": "Sponsors found successfully.",
  "data": {
    "digitalSponsors": [
      {
        "_id": "...",
        "name": "John Smith",
        "email": "john@example.com",
        "selfCoachId": "W1234567"
      }
    ],
    "externalSponsors": []
  }
}
```

**Testing Checklist:**
- ✅ Search by name returns matching results
- ✅ Search by email returns matching results
- ✅ Search by coach ID returns matching results
- ✅ Returns both digital and external sponsors
- ✅ Empty results handled gracefully

### **1.5 Create External Sponsor**
**Endpoint:** `POST /api/advanced-mlm/external-sponsor`

**Headers:** No authentication required

**Body:**
```json
{
  "name": "External Company Ltd",
  "email": "contact@external.com",
  "phone": "+1234567890",
  "company": "External Company Ltd",
  "website": "https://external.com",
  "notes": "External business partner"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "External sponsor created successfully.",
  "data": {
    "_id": "...",
    "name": "External Company Ltd",
    "email": "contact@external.com",
    "isActive": true
  }
}
```

**Testing Checklist:**
- ✅ Creates external sponsor with all required fields
- ✅ Sets isActive to true by default
- ✅ Returns created sponsor data
- ✅ Validates required fields (name, email, phone, company)

---

## 🔐 **Phase 2: Private Routes (Coach Authentication Required)**

### **2.1 Coach Account Setup**
Before testing these routes, you need a coach account:

**Option A: Coach Signup During Registration**
```http
POST /api/auth/signup
{
  "name": "Test Coach",
  "email": "testcoach@example.com",
  "password": "Passw0rd!",
  "role": "coach",
  "sponsorId": null,
  "teamRankName": "Test Team"
}
```

**Option B: Upgrade Existing User**
```http
POST /api/auth/upgrade-to-coach
{
  "userId": "EXISTING_USER_ID",
  "sponsorId": null,
  "teamRankName": "Test Team"
}
```

### **2.2 Lock Hierarchy**
**Endpoint:** `POST /api/advanced-mlm/lock-hierarchy`

**Headers:**
```
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "coachId": "COACH_USER_ID"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Hierarchy locked successfully.",
  "data": {
    "hierarchyLocked": true,
    "hierarchyLockedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Testing Checklist:**
- ✅ Requires valid coach JWT token
- ✅ Sets hierarchyLocked to true
- ✅ Records lock timestamp
- ✅ Should prevent future hierarchy changes

### **2.3 Submit Admin Request**
**Endpoint:** `POST /api/advanced-mlm/admin-request`

**Headers:**
```
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "coachId": "COACH_USER_ID",
  "requestType": "changeSponsor",
  "reason": "Better mentorship opportunity",
  "requestedChanges": {
    "newSponsorId": "NEW_SPONSOR_ID"
  },
  "priority": "medium"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin request submitted successfully.",
  "data": {
    "requestId": "...",
    "status": "pending",
    "submittedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Testing Checklist:**
- ✅ Requires valid coach JWT token
- ✅ Creates admin request with pending status
- ✅ Records submission timestamp
- ✅ Validates required fields

### **2.4 Get Coach Admin Requests**
**Endpoint:** `GET /api/advanced-mlm/admin-requests/COACH_USER_ID`

**Headers:**
```
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin requests retrieved successfully.",
  "data": [
    {
      "_id": "...",
      "requestType": "changeSponsor",
      "status": "pending",
      "reason": "Better mentorship opportunity",
      "submittedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Testing Checklist:**
- ✅ Returns only requests for the authenticated coach
- ✅ Shows request status and details
- ✅ Includes submission timestamp

### **2.5 Get Coach Commissions**
**Endpoint:** `GET /api/advanced-mlm/commissions/COACH_USER_ID?month=2024-01`

**Headers:**
```
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Commissions retrieved successfully.",
  "data": {
    "monthlyCommissions": [
      {
        "month": "2024-01",
        "totalEarnings": 150.00,
        "pendingAmount": 50.00,
        "paidAmount": 100.00
      }
    ]
  }
}
```

**Testing Checklist:**
- ✅ Returns commission data for specified month
- ✅ Shows total, pending, and paid amounts
- ✅ Handles month/year query parameters

### **2.6 Add Downline Member**
**Endpoint:** `POST /api/advanced-mlm/downline`

**Headers:**
```
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Passw0rd!",
  "sponsorId": "COACH_USER_ID",
  "phone": "+1234567890",
  "currentLevel": 1,
  "teamRankName": "Team A"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Downline member added successfully.",
  "data": {
    "coachId": "...",
    "sponsorId": "COACH_USER_ID",
    "currentLevel": 1
  }
}
```

**Testing Checklist:**
- ✅ Creates new coach in downline
- ✅ Sets correct sponsor relationship
- ✅ Assigns specified hierarchy level
- ✅ Generates unique coach ID

### **2.7 Get Direct Downline**
**Endpoint:** `GET /api/advanced-mlm/downline/COACH_USER_ID?includePerformance=true`

**Headers:**
```
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Downline retrieved successfully.",
  "data": {
    "downline": [
      {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "isActive": true,
        "lastActiveAt": "2024-01-15T10:30:00Z"
      }
    ],
    "downlineWithPerformance": [
      {
        "_id": "...",
        "name": "John Doe",
        "performance": {
          "currentLevel": "Beginner",
          "performanceScore": 75,
          "isActive": true
        }
      }
    ]
  }
}
```

**Testing Checklist:**
- ✅ Returns direct team members only
- ✅ Includes performance data when requested
- ✅ Shows active status and last activity
- ✅ Performance scores are calculated correctly

### **2.8 Get Complete Hierarchy**
**Endpoint:** `GET /api/advanced-mlm/hierarchy/COACH_USER_ID?levels=5&includePerformance=true`

**Headers:**
```
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Hierarchy retrieved successfully.",
  "data": {
    "_id": "COACH_USER_ID",
    "name": "Test Coach",
    "downlineHierarchy": [
      {
        "_id": "...",
        "name": "John Doe",
        "level": 1,
        "isActive": true
      }
    ]
  }
}
```

**Testing Checklist:**
- ✅ Returns specified number of levels
- ✅ Shows hierarchical structure
- ✅ Includes performance data when requested
- ✅ Levels are properly numbered

### **2.9 Get Team Performance**
**Endpoint:** `GET /api/advanced-mlm/team-performance/COACH_USER_ID?period=month`

**Headers:**
```
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Team performance retrieved successfully.",
  "data": {
    "teamSize": 5,
    "totalSales": 2500.00,
    "averagePerformance": 78.5,
    "topPerformers": [
      {
        "name": "John Doe",
        "performanceScore": 85
      }
    ]
  }
}
```

**Testing Checklist:**
- ✅ Returns team performance metrics
- ✅ Calculates averages correctly
- ✅ Identifies top performers
- ✅ Handles different time periods

### **2.10 Generate Team Report**
**Endpoint:** `POST /api/advanced-mlm/generate-report`

**Headers:**
```
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "reportType": "team_performance",
  "sponsorId": "COACH_USER_ID",
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
  "message": "Report generated successfully.",
  "data": {
    "reportId": "...",
    "reportType": "team_performance",
    "status": "completed",
    "downloadUrl": "/reports/download/..."
  }
}
```

**Testing Checklist:**
- ✅ Generates report with specified parameters
- ✅ Returns report ID and status
- ✅ Includes download URL when complete
- ✅ Handles different report types

### **2.11 Get Reports List**
**Endpoint:** `GET /api/advanced-mlm/reports/COACH_USER_ID?reportType=team_performance&limit=10`

**Headers:**
```
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Reports retrieved successfully.",
  "data": [
    {
      "_id": "...",
      "reportType": "team_performance",
      "status": "completed",
      "generatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Testing Checklist:**
- ✅ Returns list of generated reports
- ✅ Filters by report type when specified
- ✅ Respects limit parameter
- ✅ Shows report status and generation date

### **2.12 Get Report Details**
**Endpoint:** `GET /api/advanced-mlm/reports/detail/REPORT_ID`

**Headers:**
```
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Report details retrieved successfully.",
  "data": {
    "reportId": "...",
    "reportType": "team_performance",
    "content": {
      "summary": "Team performance for January 2024",
      "metrics": { ... },
      "charts": [ ... ]
    },
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Testing Checklist:**
- ✅ Returns complete report content
- ✅ Includes metrics and charts
- ✅ Shows generation timestamp
- ✅ Accessible only to report owner

---

## 👑 **Phase 3: Admin Routes (Admin Authentication Required)**

### **3.1 Get Pending Admin Requests**
**Endpoint:** `GET /api/advanced-mlm/admin/pending-requests`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Pending requests retrieved successfully.",
  "data": [
    {
      "_id": "...",
      "coachId": "COACH_USER_ID",
      "requestType": "changeSponsor",
      "status": "pending",
      "submittedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Testing Checklist:**
- ✅ Requires admin JWT token
- ✅ Returns only pending requests
- ✅ Shows request details and timestamps
- ✅ Includes coach information

### **3.2 Process Admin Request**
**Endpoint:** `PUT /api/advanced-mlm/admin/process-request/REQUEST_ID`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "action": "approve",
  "adminNotes": "Request approved after review",
  "approvedChanges": {
    "newSponsorId": "NEW_SPONSOR_ID"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Request processed successfully.",
  "data": {
    "requestId": "...",
    "status": "approved",
    "processedAt": "2024-01-15T10:30:00Z",
    "adminNotes": "Request approved after review"
  }
}
```

**Testing Checklist:**
- ✅ Requires admin JWT token
- ✅ Updates request status
- ✅ Records processing timestamp
- ✅ Applies approved changes

### **3.3 Change Coach Upline**
**Endpoint:** `PUT /api/advanced-mlm/admin/change-upline`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "coachId": "COACH_USER_ID",
  "newSponsorId": "NEW_SPONSOR_ID",
  "reason": "Performance optimization",
  "effectiveDate": "2024-02-01"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Coach upline changed successfully.",
  "data": {
    "coachId": "COACH_USER_ID",
    "oldSponsorId": "OLD_SPONSOR_ID",
    "newSponsorId": "NEW_SPONSOR_ID",
    "changedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Testing Checklist:**
- ✅ Requires admin JWT token
- ✅ Updates coach sponsor relationship
- ✅ Records change timestamp
- ✅ Validates new sponsor exists

### **3.4 Get Commission Settings**
**Endpoint:** `GET /api/advanced-mlm/admin/commission-settings`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Commission settings retrieved successfully.",
  "data": {
    "commissionStructure": {
      "level1": 0.10,
      "level2": 0.05,
      "level3": 0.03
    },
    "bonusRates": {
      "performanceBonus": 0.02,
      "teamBonus": 0.01
    }
  }
}
```

**Testing Checklist:**
- ✅ Requires admin JWT token
- ✅ Returns current commission structure
- ✅ Shows bonus rates and thresholds
- ✅ Includes all configuration options

### **3.5 Update Commission Settings**
**Endpoint:** `PUT /api/advanced-mlm/admin/commission-settings`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "commissionStructure": {
    "level1": 0.12,
    "level2": 0.06,
    "level3": 0.04
  },
  "bonusRates": {
    "performanceBonus": 0.03,
    "teamBonus": 0.015
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Commission settings updated successfully.",
  "data": {
    "commissionStructure": {
      "level1": 0.12,
      "level2": 0.06,
      "level3": 0.04
    },
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Testing Checklist:**
- ✅ Requires admin JWT token
- ✅ Updates commission structure
- ✅ Records update timestamp
- ✅ Validates percentage values

### **3.6 Calculate Commission**
**Endpoint:** `POST /api/advanced-mlm/admin/calculate-commission`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "subscriptionId": "SUBSCRIPTION_ID",
  "coachId": "COACH_USER_ID",
  "amount": 100.00,
  "commissionType": "referral",
  "notes": "Monthly subscription commission"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Commission calculated successfully.",
  "data": {
    "commissionId": "...",
    "amount": 10.00,
    "percentage": 0.10,
    "status": "pending"
  }
}
```

**Testing Checklist:**
- ✅ Requires admin JWT token
- ✅ Calculates commission based on structure
- ✅ Creates commission record
- ✅ Sets status to pending

### **3.7 Process Monthly Commissions**
**Endpoint:** `POST /api/advanced-mlm/admin/process-monthly-commissions`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "month": "01",
  "year": 2024,
  "paymentMethod": "bank_transfer",
  "batchSize": 100
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Monthly commissions processed successfully.",
  "data": {
    "totalProcessed": 25,
    "totalAmount": 1250.00,
    "processedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Testing Checklist:**
- ✅ Requires admin JWT token
- ✅ Processes all pending commissions for month
- ✅ Updates commission status to paid
- ✅ Records processing timestamp

---

## 🎯 **Testing Summary & Checklist**

### **✅ Phase 1 Complete (Public Routes)**
- [ ] Setup hierarchy levels (admin only)
- [ ] Get hierarchy levels
- [ ] Generate coach ID
- [ ] Search for sponsors
- [ ] Create external sponsor

### **✅ Phase 2 Complete (Coach Routes)**
- [ ] Coach account setup (signup or upgrade)
- [ ] Lock hierarchy
- [ ] Submit admin request
- [ ] Get coach admin requests
- [ ] Get coach commissions
- [ ] Add downline member
- [ ] Get direct downline
- [ ] Get complete hierarchy
- [ ] Get team performance
- [ ] Generate team report
- [ ] Get reports list
- [ ] Get report details

### **✅ Phase 3 Complete (Admin Routes)**
- [ ] Get pending admin requests
- [ ] Process admin request
- [ ] Change coach upline
- [ ] Get commission settings
- [ ] Update commission settings
- [ ] Calculate commission
- [ ] Process monthly commissions

---

## 🚀 **Ready to Start Testing!**

**Begin with Phase 1 (Public Routes) and work your way through each phase systematically.**

**Remember:** Start with the hierarchy setup to resolve the "Invalid hierarchy level selected" error!
