# 🚀 FunnelsEye MLM System API Documentation

## 📋 **Table of Contents**
- [🔐 Authentication Routes](#-authentication-routes)
- [🏗️ Advanced MLM Routes](#️-advanced-mlm-routes)
- [👥 Coach Management](#-coach-management)
- [💰 Commission System](#-commission-system)
- [📊 Reporting & Analytics](#-reporting--analytics)

---

## 🔐 **Authentication Routes**

### **Base URL:** `/api/auth`

#### **1. User Signup**
```http
POST /api/auth/signup
```

**Description:** Register a new user with optional MLM hierarchy fields for coaches.

**Body (Regular User):**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "Passw0rd!",
  "role": "client"
}
```

**Body (Coach User):**
```json
{
  "name": "Coach Name",
  "email": "coach@example.com",
  "password": "Passw0rd!",
  "role": "coach",
  "selfCoachId": "W1234567",
  "currentLevel": 1,
  "sponsorId": "existing_coach_id",
  "teamRankName": "Team Alpha",
  "presidentTeamRankName": "President Team"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coach registered successfully with MLM hierarchy. An OTP has been sent to your email for verification.",
  "userId": "user_id",
  "email": "coach@example.com",
  "role": "coach",
  "selfCoachId": "W1234567",
  "currentLevel": 1,
  "sponsorId": "sponsor_id",
  "teamRankName": "Team Alpha",
  "presidentTeamRankName": "President Team",
  "message": "You can now build your downline and earn commissions!"
}
```

---

#### **2. User Login**
```http
POST /api/auth/login
```

**Description:** Authenticate user and return JWT token with complete user data.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Passw0rd!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "coach",
    "isVerified": true,
    "selfCoachId": "W1234567",
    "currentLevel": 1,
    "sponsorId": "sponsor_id",
    "teamRankName": "Team Alpha",
    "presidentTeamRankName": "President Team",
    "hierarchyLocked": true,
    "hierarchyLockedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### **3. Get Current User**
```http
GET /api/auth/me
```

**Description:** Get complete user profile including all MLM hierarchy fields.

**Headers:**
```http
Authorization: Bearer JWT_TOKEN
```

**Response:**
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

---

#### **4. Upgrade User to Coach**
```http
POST /api/auth/upgrade-to-coach
```

**Description:** Convert existing verified user to coach with MLM hierarchy.

**Headers:**
```http
Authorization: Bearer JWT_TOKEN
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

**Response:**
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
    "sponsorId": "sponsor_id",
    "teamRankName": "Team Alpha",
    "presidentTeamRankName": "President Team"
  }
}
```

---

#### **5. Lock Hierarchy**
```http
POST /api/auth/lock-hierarchy
```

**Description:** Lock coach hierarchy to prevent future changes (one-time action).

**Headers:**
```http
Authorization: Bearer JWT_TOKEN
```

**Body:**
```json
{
  "coachId": "coach_id"
}
```

**Response:**
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

---

#### **6. Get Available Sponsors**
```http
GET /api/auth/available-sponsors
```

**Description:** Get list of available digital coaches who can be sponsors.

**Response:**
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

---

#### **7. Get Coach Ranks**
```http
GET /api/auth/coach-ranks
```

**Description:** Get all available coach ranks for signup dropdown.

**Response:**
```json
{
  "success": true,
  "message": "Coach ranks retrieved successfully.",
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
    },
    {
      "level": 3,
      "name": "Success Builder",
      "description": "Advanced coach"
    },
    {
      "level": 4,
      "name": "Supervisor",
      "description": "Expert coach"
    },
    {
      "level": 5,
      "name": "World Team",
      "description": "Master coach"
    },
    {
      "level": 6,
      "name": "G.E.T Team",
      "description": "Elite coach"
    },
    {
      "level": 7,
      "name": "Get 2500 Team",
      "description": "Premier coach"
    },
    {
      "level": 8,
      "name": "Millionaire Team",
      "description": "Distinguished coach"
    },
    {
      "level": 9,
      "name": "Millionaire 7500 Team",
      "description": "Honored coach"
    },
    {
      "level": 10,
      "name": "President's Team",
      "description": "Esteemed coach"
    },
    {
      "level": 11,
      "name": "Chairman's Club",
      "description": "Legendary coach"
    },
    {
      "level": 12,
      "name": "Founder's Circle",
      "description": "Ultimate coach"
    }
  ]
}
```

---

## 🏗️ **Advanced MLM Routes**

### **Base URL:** `/api/advanced-mlm`

#### **1. Setup Hierarchy Levels**
```http
POST /api/advanced-mlm/setup-hierarchy
```

**Description:** Initialize default hierarchy levels (Admin only).

**Headers:**
```http
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Hierarchy levels setup completed successfully.",
  "data": [
    {
      "level": 1,
      "name": "Distributor Coach",
      "description": "Entry level coach",
      "isActive": true
    }
  ]
}
```

---

#### **2. Generate Coach ID**
```http
POST /api/advanced-mlm/generate-coach-id
```

**Description:** Generate unique 8-character coach ID.

**Response:**
```json
{
  "success": true,
  "message": "Coach ID generated successfully.",
  "data": {
    "coachId": "W1234567"
  }
}
```

---

#### **3. Search for Sponsors**
```http
GET /api/advanced-mlm/search-sponsor?searchTerm=john&searchType=digital
```

**Description:** Search for available sponsors by name, email, or coach ID.

**Response:**
```json
{
  "success": true,
  "message": "Sponsors found successfully.",
  "data": {
    "digitalSponsors": [
      {
        "id": "sponsor_id",
        "name": "John Smith",
        "email": "john@example.com",
        "selfCoachId": "W1234567"
      }
    ]
  }
}
```

---

#### **4. Lock Hierarchy (Advanced MLM)**
```http
POST /api/advanced-mlm/lock-hierarchy
```

**Description:** Lock coach hierarchy through advanced MLM system.

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

**Body:**
```json
{
  "coachId": "coach_id"
}
```

---

#### **5. Submit Admin Request**
```http
POST /api/advanced-mlm/admin-request
```

**Description:** Submit request for hierarchy changes (requires admin approval).

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

**Body:**
```json
{
  "coachId": "coach_id",
  "requestType": "changeSponsor",
  "reason": "Better mentorship opportunity",
  "requestedChanges": {
    "newSponsorId": "new_sponsor_id"
  },
  "priority": "medium"
}
```

---

#### **6. Get Coach Admin Requests**
```http
GET /api/advanced-mlm/admin-requests/:coachId
```

**Description:** Get all admin requests for a specific coach.

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

---

## 💰 **Commission System**

### **Base URL:** `/api/advanced-mlm`

#### **1. Calculate Subscription Commission**
```http
POST /api/advanced-mlm/calculate-subscription-commission
```

**Description:** Calculate commission only on platform subscriptions (Admin only).

**Headers:**
```http
Authorization: Bearer ADMIN_JWT_TOKEN
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

**Response:**
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

---

#### **2. Get Commission Settings**
```http
GET /api/advanced-mlm/admin/commission-settings
```

**Description:** Get current commission structure and settings (Admin only).

**Headers:**
```http
Authorization: Bearer ADMIN_JWT_TOKEN
```

---

#### **3. Update Commission Settings**
```http
PUT /api/advanced-mlm/admin/commission-settings
```

**Description:** Update commission structure and rates (Admin only).

**Headers:**
```http
Authorization: Bearer ADMIN_JWT_TOKEN
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

---

#### **4. Process Monthly Commissions**
```http
POST /api/advanced-mlm/admin/process-monthly-commissions
```

**Description:** Process all pending commissions for a specific month (Admin only).

**Headers:**
```http
Authorization: Bearer ADMIN_JWT_TOKEN
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

---

## 📊 **Reporting & Analytics**

### **Base URL:** `/api/advanced-mlm`

#### **1. Get Downline**
```http
GET /api/advanced-mlm/downline/:coachId?includePerformance=true
```

**Description:** Get direct downline members with optional performance data.

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

---

#### **2. Get Complete Hierarchy**
```http
GET /api/advanced-mlm/hierarchy/:coachId?levels=5&includePerformance=true
```

**Description:** Get complete hierarchical structure for a coach.

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

---

#### **3. Get Team Performance**
```http
GET /api/advanced-mlm/team-performance/:coachId?period=month
```

**Description:** Get team performance metrics and analytics.

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

---

#### **4. Generate Team Report**
```http
POST /api/advanced-mlm/generate-report
```

**Description:** Generate comprehensive team performance report.

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
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

---

## 🔒 **Security & Access Control**

### **Role-Based Access:**
- **Public Routes:** No authentication required
- **Coach Routes:** Requires coach JWT token
- **Admin Routes:** Requires admin JWT token

### **Hierarchy Security:**
- **Auto-Lock:** Hierarchy automatically locked after first save
- **Non-Editable:** Coaches cannot change hierarchy after signup
- **Admin Approval:** All changes require admin verification
- **Support Tickets:** Level/rank changes require support team

---

## 📝 **Notes**

1. **External Sponsors Removed:** Only digital coaches can be sponsors
2. **Commission System:** Only applies to platform subscriptions, not all earnings
3. **Hierarchy Levels:** 12 specific MLM levels with proper names
4. **Non-Editable:** Hierarchy becomes locked after first save
5. **Admin Approval:** All changes require admin verification

---

## 🧪 **Testing**

Use the [Advanced MLM Testing Guide](./ADVANCED_MLM_TESTING_GUIDE.md) for comprehensive testing instructions.

---

**Last Updated:** January 2024  
**Version:** 2.0  
**Status:** Active Development
