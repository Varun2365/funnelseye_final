# MLM & Team Management System Documentation

## Overview
The Advanced MLM (Multi-Level Marketing) System provides sophisticated hierarchy management, commission tracking, and team performance analytics for coaches. The system supports both digital system sponsors and external sponsors, with advanced features for hierarchy locking, admin request management, and automated commission calculations.

## System Architecture

### Core Components
- **12-Level Hierarchy System** with customizable ranks
- **Dual Sponsor System** (Digital + External sponsors)
- **Hierarchy Locking** mechanism for security
- **Admin Request System** for hierarchy changes
- **Commission Management** with multiple calculation types
- **Team Performance Analytics** with comprehensive metrics
- **Report Generation** system for business intelligence

### Database Schemas

#### CoachHierarchyLevel Schema
```javascript
{
  level: Number,           // 1-12, unique
  name: String,           // e.g., "Distributor Coach"
  description: String,     // e.g., "Entry level coach"
  isActive: Boolean,       // Default: true
  createdBy: ObjectId,    // Reference to User
  lastModifiedBy: ObjectId,
  lastModifiedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### CommissionSettings Schema
```javascript
{
  settingId: String,                    // Unique identifier
  commissionPercentage: Number,          // 0-100, default: 10
  minimumSubscriptionAmount: Number,     // Minimum amount for commission
  maximumCommissionAmount: Number,       // Optional cap
  isActive: Boolean,                    // Default: true
  effectiveFrom: Date,                   // When settings take effect
  effectiveTo: Date,                    // Optional end date
  createdBy: ObjectId,                  // Reference to User
  lastModifiedBy: ObjectId,
  notes: String                         // Additional notes
}
```

## API Endpoints

### Base URL: `/api/advanced-mlm`

### 1. Health Check
**GET** `/health`
- **Description**: System health check
- **Authentication**: None
- **Response**:
```json
{
  "success": true,
  "message": "MLM System is healthy",
  "timestamp": "2025-01-20T10:00:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```

### 2. Hierarchy Level Management

#### Setup Hierarchy Levels (Admin Only)
**POST** `/setup-hierarchy`
- **Description**: Initialize default 12-level hierarchy
- **Authentication**: Admin required
- **Request Body**: None
- **Response**:
```json
{
  "success": true,
  "message": "Hierarchy levels setup completed successfully",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345a",
      "level": 1,
      "name": "Distributor Coach",
      "description": "Entry level coach",
      "isActive": true,
      "createdBy": "65a1b2c3d4e5f6789012345b",
      "createdAt": "2025-01-20T10:00:00Z",
      "updatedAt": "2025-01-20T10:00:00Z"
    }
  ]
}
```

#### Get Hierarchy Levels
**GET** `/hierarchy-levels`
- **Description**: Retrieve all hierarchy levels
- **Authentication**: None
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345a",
      "level": 1,
      "name": "Distributor Coach",
      "description": "Entry level coach",
      "isActive": true
    }
  ]
}
```

#### Generate Coach ID
**POST** `/generate-coach-id`
- **Description**: Generate unique coach ID
- **Authentication**: None
- **Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```
- **Response**:
```json
{
  "success": true,
  "coachId": "JD2025001",
  "message": "Coach ID generated successfully"
}
```

### 3. Sponsor Management

#### Search Sponsor
**GET** `/search-sponsor?query=john&type=digital`
- **Description**: Search for sponsors (digital or external)
- **Authentication**: None
- **Query Parameters**:
  - `query`: Search term
  - `type`: "digital" or "external"
- **Response**:
```json
{
  "success": true,
  "data": {
    "digital": [
      {
        "_id": "65a1b2c3d4e5f6789012345c",
        "coachId": "JD2024001",
        "firstName": "John",
        "lastName": "Smith",
        "email": "john@example.com",
        "hierarchyLevel": 3
      }
    ],
    "external": []
  }
}
```

#### Create External Sponsor
**POST** `/external-sponsor`
- **Description**: Create external sponsor record
- **Authentication**: None
- **Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@external.com",
  "phone": "+1234567890",
  "company": "External Company",
  "notes": "External sponsor details"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012345d",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@external.com",
    "phone": "+1234567890",
    "company": "External Company",
    "notes": "External sponsor details",
    "createdAt": "2025-01-20T10:00:00Z"
  }
}
```

### 4. Hierarchy Locking (Coach Authentication Required)

#### Lock Hierarchy
**POST** `/lock-hierarchy`
- **Description**: Lock hierarchy after first login
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "digitalSponsorId": "65a1b2c3d4e5f6789012345c",
  "externalSponsorId": "65a1b2c3d4e5f6789012345d",
  "hierarchyLevel": 1
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Hierarchy locked successfully",
  "data": {
    "coachId": "JD2025001",
    "digitalSponsorId": "65a1b2c3d4e5f6789012345c",
    "externalSponsorId": "65a1b2c3d4e5f6789012345d",
    "hierarchyLevel": 1,
    "lockedAt": "2025-01-20T10:00:00Z"
  }
}
```

### 5. Admin Request System

#### Submit Admin Request
**POST** `/admin-request`
- **Description**: Submit request for hierarchy changes
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "requestType": "change_sponsor",
  "reason": "Sponsor is inactive",
  "newSponsorId": "65a1b2c3d4e5f6789012345e",
  "supportingDocuments": ["document1.pdf", "document2.pdf"]
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Admin request submitted successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345f",
    "coachId": "JD2025001",
    "requestType": "change_sponsor",
    "reason": "Sponsor is inactive",
    "status": "pending",
    "submittedAt": "2025-01-20T10:00:00Z"
  }
}
```

#### Get Coach Admin Requests
**GET** `/admin-requests/:coachId`
- **Description**: Get admin requests for specific coach
- **Authentication**: Coach/Admin/Super Admin
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345f",
      "coachId": "JD2025001",
      "requestType": "change_sponsor",
      "reason": "Sponsor is inactive",
      "status": "pending",
      "submittedAt": "2025-01-20T10:00:00Z",
      "processedAt": null,
      "processedBy": null
    }
  ]
}
```

### 6. Commission System

#### Get Commission Settings (Admin Only)
**GET** `/admin/commission-settings`
- **Description**: Retrieve current commission settings
- **Authentication**: Admin required
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012345g",
    "settingId": "COMMISSION_2025",
    "commissionPercentage": 10,
    "minimumSubscriptionAmount": 50,
    "maximumCommissionAmount": 1000,
    "isActive": true,
    "effectiveFrom": "2025-01-01T00:00:00Z",
    "effectiveTo": null
  }
}
```

#### Update Commission Settings (Admin Only)
**PUT** `/admin/commission-settings`
- **Description**: Update commission settings
- **Authentication**: Admin required
- **Request Body**:
```json
{
  "commissionPercentage": 12,
  "minimumSubscriptionAmount": 75,
  "maximumCommissionAmount": 1500,
  "notes": "Updated commission rates for 2025"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Commission settings updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345g",
    "commissionPercentage": 12,
    "minimumSubscriptionAmount": 75,
    "maximumCommissionAmount": 1500,
    "lastModifiedBy": "65a1b2c3d4e5f6789012345h",
    "lastModifiedAt": "2025-01-20T10:00:00Z"
  }
}
```

#### Calculate Commission (Admin Only)
**POST** `/admin/calculate-commission`
- **Description**: Calculate commission for subscription
- **Authentication**: Admin required
- **Request Body**:
```json
{
  "coachId": "JD2025001",
  "subscriptionId": "65a1b2c3d4e5f6789012345i",
  "amount": 100,
  "commissionType": "subscription"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "coachId": "JD2025001",
    "subscriptionId": "65a1b2c3d4e5f6789012345i",
    "amount": 100,
    "commissionPercentage": 12,
    "commissionAmount": 12,
    "calculatedAt": "2025-01-20T10:00:00Z"
  }
}
```

#### Get Coach Commissions
**GET** `/commissions/:coachId`
- **Description**: Get commission history for coach
- **Authentication**: Coach/Admin/Super Admin
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345j",
      "coachId": "JD2025001",
      "subscriptionId": "65a1b2c3d4e5f6789012345i",
      "amount": 100,
      "commissionAmount": 12,
      "status": "pending",
      "calculatedAt": "2025-01-20T10:00:00Z",
      "paidAt": null
    }
  ]
}
```

### 7. Team Management

#### Add Downline
**POST** `/downline`
- **Description**: Add new coach to downline
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "newCoachId": "JD2025002",
  "sponsorId": "JD2025001",
  "hierarchyLevel": 1
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Coach added to downline successfully",
  "data": {
    "newCoachId": "JD2025002",
    "sponsorId": "JD2025001",
    "hierarchyLevel": 1,
    "addedAt": "2025-01-20T10:00:00Z"
  }
}
```

#### Get Downline
**GET** `/downline/:sponsorId`
- **Description**: Get direct downline for sponsor
- **Authentication**: Coach/Admin/Super Admin
- **Response**:
```json
{
  "success": true,
  "data": {
    "sponsorId": "JD2025001",
    "directDownline": [
      {
        "_id": "65a1b2c3d4e5f6789012345k",
        "coachId": "JD2025002",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com",
        "hierarchyLevel": 1,
        "joinedAt": "2025-01-20T10:00:00Z"
      }
    ],
    "totalCount": 1
  }
}
```

#### Get Downline Hierarchy
**GET** `/hierarchy/:coachId`
- **Description**: Get complete downline hierarchy
- **Authentication**: Coach/Admin/Super Admin
- **Response**:
```json
{
  "success": true,
  "data": {
    "coachId": "JD2025001",
    "hierarchy": {
      "level1": [
        {
          "coachId": "JD2025002",
          "firstName": "Jane",
          "lastName": "Smith",
          "hierarchyLevel": 1,
          "subDownline": {
            "level2": [
              {
                "coachId": "JD2025003",
                "firstName": "Bob",
                "lastName": "Johnson",
                "hierarchyLevel": 2
              }
            ]
          }
        }
      ]
    },
    "totalLevels": 2,
    "totalMembers": 2
  }
}
```

#### Get Team Performance
**GET** `/team-performance/:sponsorId`
- **Description**: Get team performance summary
- **Authentication**: Coach/Admin/Super Admin
- **Response**:
```json
{
  "success": true,
  "data": {
    "sponsorId": "JD2025001",
    "performance": {
      "totalTeamMembers": 5,
      "activeMembers": 4,
      "totalRevenue": 2500,
      "totalCommissions": 300,
      "monthlyGrowth": 15.5,
      "topPerformers": [
        {
          "coachId": "JD2025002",
          "firstName": "Jane",
          "lastName": "Smith",
          "revenue": 1000,
          "commission": 120
        }
      ]
    },
    "period": "2025-01-01 to 2025-01-31"
  }
}
```

### 8. Report Generation

#### Generate Team Report
**POST** `/generate-report`
- **Description**: Generate comprehensive team report
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "reportType": "monthly_performance",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "includeDetails": true
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Team report generated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345l",
    "reportId": "RPT2025001",
    "reportType": "monthly_performance",
    "generatedAt": "2025-01-20T10:00:00Z",
    "status": "completed"
  }
}
```

#### Get Reports
**GET** `/reports/:sponsorId`
- **Description**: Get list of generated reports
- **Authentication**: Coach/Admin/Super Admin
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345l",
      "reportId": "RPT2025001",
      "reportType": "monthly_performance",
      "generatedAt": "2025-01-20T10:00:00Z",
      "status": "completed",
      "fileSize": "2.5MB"
    }
  ]
}
```

#### Get Report Detail
**GET** `/reports/detail/:reportId`
- **Description**: Get specific report details
- **Authentication**: Coach/Admin/Super Admin
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012345l",
    "reportId": "RPT2025001",
    "reportType": "monthly_performance",
    "content": {
      "summary": {
        "totalRevenue": 2500,
        "totalCommissions": 300,
        "teamGrowth": 15.5
      },
      "details": [
        {
          "coachId": "JD2025002",
          "performance": "excellent",
          "revenue": 1000
        }
      ]
    },
    "generatedAt": "2025-01-20T10:00:00Z"
  }
}
```

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

- **Public Endpoints**: Health check, hierarchy levels, coach ID generation, sponsor search
- **Coach Authentication**: Hierarchy locking, admin requests, downline management, report generation
- **Admin Authentication**: Commission management, admin request processing, hierarchy changes

## Rate Limiting

- **Public Endpoints**: 100 requests per hour
- **Authenticated Endpoints**: 1000 requests per hour
- **Admin Endpoints**: 2000 requests per hour

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error
