# 🧪 Staff Management System - Complete Testing Guide

## 🚀 **API Testing Guide for Staff Management System**

This document provides comprehensive testing information for all staff-related endpoints, including sample JSON inputs and expected responses.

**Base URL**: `{{baseUrl}}`

---

## 📋 **Table of Contents**

1. [Staff Management Routes](#-1-staff-management-routes)
2. [Staff Calendar Routes](#-2-staff-calendar-routes)
3. [Staff Performance Routes](#-3-staff-performance-routes)
4. [Staff Dashboard Routes](#-4-staff-dashboard-routes)
5. [Testing Scenarios](#-5-testing-scenarios)
6. [Test Data Setup](#-6-test-data-setup)
7. [Running Tests](#-7-running-tests)
8. [Expected Test Results](#-8-expected-test-results)
9. [Next Steps After Testing](#-9-next-steps-after-testing)

---

## 🔐 **1. Staff Management Routes**

### **1.1 Create Staff Member**
**Endpoint**: `POST {{baseUrl}}/api/staff`

**Headers**:
```
Authorization: Bearer <coach_token>
Content-Type: application/json
```

**Sample Request Body**:
```json
{
  "name": "John Assistant",
  "email": "john.assistant@example.com",
  "password": "SecurePass123!",
  "permissions": [
    "leads:read",
    "leads:update",
    "tasks:read",
    "calendar:read"
  ]
}
```

**Expected Response (201 Created)**:
```json
{
  "success": true,
  "message": "Staff member created successfully. Email verification required on first login.",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Assistant",
    "email": "john.assistant@example.com",
    "permissions": [
      "leads:read",
      "leads:update",
      "tasks:read",
      "calendar:read"
    ],
    "coachId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "isActive": true,
    "isVerified": false,
    "createdAt": "2025-01-21T10:00:00.000Z",
    "updatedAt": "2025-01-21T10:00:00.000Z"
  }
}
```

**Error Response (400 Bad Request - Invalid Permissions)**:
```json
{
  "success": false,
  "message": "Invalid permissions: invalid:permission",
  "invalidPermissions": ["invalid:permission"]
}
```

---

### **1.2 List All Staff Members**
**Endpoint**: `GET {{baseUrl}}/api/staff`

**Headers**:
```
Authorization: Bearer <coach_token>
```

**Query Parameters**:
- `coachId` (optional, for admin users)

**Sample Request**:
```
GET {{baseUrl}}/api/staff
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Assistant",
      "email": "john.assistant@example.com",
      "permissions": [
        "leads:read",
        "leads:update",
        "tasks:read",
        "calendar:read"
      ],
      "coachId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "isActive": true,
      "isVerified": false,
      "createdAt": "2025-01-21T10:00:00.000Z",
      "updatedAt": "2025-01-21T10:00:00.000Z"
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "Sarah Manager",
      "email": "sarah.manager@example.com",
      "permissions": [
        "leads:manage",
        "tasks:manage",
        "calendar:manage"
      ],
      "coachId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "isActive": true,
      "isVerified": true,
      "createdAt": "2025-01-20T09:00:00.000Z",
      "updatedAt": "2025-01-20T09:00:00.000Z"
    }
  ]
}
```

---

### **1.3 Get Specific Staff Member**
**Endpoint**: `GET {{baseUrl}}/api/staff/:id`

**Headers**:
```
Authorization: Bearer <coach_token>
```

**Sample Request**:
```
GET {{baseUrl}}/api/staff/64f8a1b2c3d4e5f6a7b8c9d0
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Assistant",
    "email": "john.assistant@example.com",
    "permissions": [
      "leads:read",
      "leads:update",
      "tasks:read",
      "calendar:read"
    ],
    "coachId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "isActive": true,
    "isVerified": false,
    "createdAt": "2025-01-21T10:00:00.000Z",
    "updatedAt": "2025-01-21T10:00:00.000Z"
  }
}
```

**Error Response (404 Not Found)**:
```json
{
  "success": false,
  "message": "Staff not found"
}
```

---

### **1.4 Update Staff Member**
**Endpoint**: `PUT {{baseUrl}}/api/staff/:id`

**Headers**:
```
Authorization: Bearer <coach_token>
Content-Type: application/json
```

**Sample Request Body**:
```json
{
  "name": "John Senior Assistant",
  "permissions": [
    "leads:read",
    "leads:update",
    "leads:write",
    "tasks:read",
    "tasks:write",
    "calendar:read",
    "calendar:write"
  ],
  "isActive": true
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Senior Assistant",
    "email": "john.assistant@example.com",
    "permissions": [
      "leads:read",
      "leads:update",
      "leads:write",
      "tasks:read",
      "tasks:write",
      "calendar:read",
      "calendar:write"
    ],
    "coachId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "isActive": true,
    "isVerified": false,
    "createdAt": "2025-01-21T10:00:00.000Z",
    "updatedAt": "2025-01-21T11:00:00.000Z"
  }
}
```

---

### **1.5 Update Staff Permissions**
**Endpoint**: `POST {{baseUrl}}/api/staff/:id/permissions`

**Headers**:
```
Authorization: Bearer <coach_token>
Content-Type: application/json
```

**Sample Request Body**:
```json
{
  "permissions": [
    "leads:read",
    "leads:write",
    "leads:manage",
    "tasks:read",
    "tasks:write",
    "tasks:manage",
    "calendar:read",
    "calendar:write",
    "calendar:manage"
  ]
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Staff permissions updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Senior Assistant",
    "email": "john.assistant@example.com",
    "permissions": [
      "leads:read",
      "leads:write",
      "leads:manage",
      "tasks:read",
      "tasks:write",
      "tasks:manage",
      "calendar:read",
      "calendar:write",
      "calendar:manage"
    ],
    "coachId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "isActive": true,
    "isVerified": false,
    "createdAt": "2025-01-21T10:00:00.000Z",
    "updatedAt": "2025-01-21T11:30:00.000Z"
  }
}
```

---

### **1.6 Activate Staff Account**
**Endpoint**: `POST {{baseUrl}}/api/staff/:id/activate`

**Headers**:
```
Authorization: Bearer <coach_token>
```

**Sample Request**:
```
POST {{baseUrl}}/api/staff/64f8a1b2c3d4e5f6a7b8c9d0/activate
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Staff activated."
}
```

---

### **1.7 Deactivate Staff Account**
**Endpoint**: `DELETE {{baseUrl}}/api/staff/:id`

**Headers**:
```
Authorization: Bearer <coach_token>
```

**Sample Request**:
```
DELETE {{baseUrl}}/api/staff/64f8a1b2c3d4e5f6a7b8c9d0
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Staff deactivated."
}
```

---

### **1.8 Bulk Staff Actions**
**Endpoint**: `POST {{baseUrl}}/api/staff/bulk-actions`

**Headers**:
```
Authorization: Bearer <coach_token>
Content-Type: application/json
```

**Sample Request Body**:
```json
{
  "staffIds": [
    "64f8a1b2c3d4e5f6a7b8c9d0",
    "64f8a1b2c3d4e5f6a7b8c9d2"
  ],
  "action": "activate"
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Bulk activate completed successfully",
  "modifiedCount": 2,
  "action": "activate"
}
```

---

## 📅 **2. Staff Calendar Routes**

### **2.1 Create Calendar Event**
**Endpoint**: `POST {{baseUrl}}/api/staff-calendar`

**Headers**:
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Sample Request Body**:
```json
{
  "staffId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "eventType": "task",
  "title": "Follow up call with lead",
  "description": "Call John Doe to discuss proposal",
  "startTime": "2025-01-22T09:00:00.000Z",
  "endTime": "2025-01-22T09:30:00.000Z",
  "priority": "high",
  "relatedLead": "64f8a1b2c3d4e5f6a7b8c9d3",
  "location": "Phone",
  "notes": "Prepare proposal details before call",
  "tags": ["follow-up", "sales"],
  "color": "#ff6b6b",
  "reminder": {
    "enabled": true,
    "time": 15
  }
}
```

**Expected Response (201 Created)**:
```json
{
  "success": true,
  "message": "Calendar event created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "staffId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "coachId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "eventType": "task",
    "title": "Follow up call with lead",
    "description": "Call John Doe to discuss proposal",
    "startTime": "2025-01-22T09:00:00.000Z",
    "endTime": "2025-01-22T09:30:00.000Z",
    "duration": 30,
    "status": "scheduled",
    "priority": "high",
    "relatedLead": "64f8a1b2c3d4e5f6a7b8c9d3",
    "location": "Phone",
    "notes": "Prepare proposal details before call",
    "tags": ["follow-up", "sales"],
    "color": "#ff6b6b",
    "reminder": {
      "enabled": true,
      "time": 15,
      "sent": false
    },
    "metadata": {
      "createdBy": "64f8a1b2c3d4e5f6a7b8c9d0",
      "lastModifiedBy": "64f8a1b2c3d4e5f6a7b8c9d0",
      "source": "manual"
    },
    "createdAt": "2025-01-21T12:00:00.000Z",
    "updatedAt": "2025-01-21T12:00:00.000Z"
  }
}
```

---

### **2.2 Get Calendar Events**
**Endpoint**: `GET {{baseUrl}}/api/staff-calendar`

**Headers**:
```
Authorization: Bearer <staff_token>
```

**Query Parameters**:
- `staffId` (optional)
- `startDate` (optional)
- `endDate` (optional)
- `eventType` (optional)
- `status` (optional)
- `limit` (optional, default: 50)
- `page` (optional, default: 1)

**Sample Request**:
```
GET {{baseUrl}}/api/staff-calendar?startDate=2025-01-22&endDate=2025-01-28&limit=10
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "staffId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Assistant",
        "email": "john.assistant@example.com"
      },
      "eventType": "task",
      "title": "Follow up call with lead",
      "startTime": "2025-01-22T09:00:00.000Z",
      "endTime": "2025-01-22T09:30:00.000Z",
      "duration": 30,
      "status": "scheduled",
      "priority": "high",
      "relatedLead": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

### **2.3 Get Specific Calendar Event**
**Endpoint**: `GET {{baseUrl}}/api/staff-calendar/:id`

**Headers**:
```
Authorization: Bearer <staff_token>
```

**Sample Request**:
```
GET {{baseUrl}}/api/staff-calendar/64f8a1b2c3d4e5f6a7b8c9d4
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "staffId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Assistant",
      "email": "john.assistant@example.com"
    },
    "coachId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "eventType": "task",
    "title": "Follow up call with lead",
    "description": "Call John Doe to discuss proposal",
    "startTime": "2025-01-22T09:00:00.000Z",
    "endTime": "2025-01-22T09:30:00.000Z",
    "duration": 30,
    "status": "scheduled",
    "priority": "high",
    "relatedLead": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890"
    },
    "location": "Phone",
    "notes": "Prepare proposal details before call",
    "tags": ["follow-up", "sales"],
    "color": "#ff6b6b",
    "reminder": {
      "enabled": true,
      "time": 15,
      "sent": false
    }
  }
}
```

---

### **2.4 Update Calendar Event**
**Endpoint**: `PUT {{baseUrl}}/api/staff-calendar/:id`

**Headers**:
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Sample Request Body**:
```json
{
  "title": "Updated: Follow up call with lead",
  "description": "Call John Doe to discuss updated proposal",
  "startTime": "2025-01-22T10:00:00.000Z",
  "endTime": "2025-01-22T10:30:00.000Z",
  "priority": "urgent",
  "notes": "Prepare updated proposal details before call"
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Calendar event updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "title": "Updated: Follow up call with lead",
    "description": "Call John Doe to discuss updated proposal",
    "startTime": "2025-01-22T10:00:00.000Z",
    "endTime": "2025-01-22T10:30:00.000Z",
    "duration": 30,
    "priority": "urgent",
    "notes": "Prepare updated proposal details before call",
    "updatedAt": "2025-01-21T13:00:00.000Z"
  }
}
```

---

### **2.5 Delete Calendar Event**
**Endpoint**: `DELETE {{baseUrl}}/api/staff-calendar/:id`

**Headers**:
```
Authorization: Bearer <staff_token>
```

**Sample Request**:
```
DELETE {{baseUrl}}/api/staff-calendar/64f8a1b2c3d4e5f6a7b8c9d4
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Calendar event deleted successfully"
}
```

---

### **2.6 Get Staff Availability**
**Endpoint**: `GET {{baseUrl}}/api/staff-calendar/staff/:staffId/availability`

**Headers**:
```
Authorization: Bearer <staff_token>
```

**Query Parameters**:
- `startTime` (required)
- `endTime` (required)

**Sample Request**:
```
GET {{baseUrl}}/api/staff-calendar/staff/64f8a1b2c3d4e5f6a7b8c9d0/availability?startTime=2025-01-22T09:00:00.000Z&endTime=2025-01-22T17:00:00.000Z
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "startTime": "2025-01-22T10:00:00.000Z",
      "endTime": "2025-01-22T10:30:00.000Z",
      "duration": 30,
      "eventType": "task"
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "startTime": "2025-01-22T14:00:00.000Z",
      "endTime": "2025-01-22T15:00:00.000Z",
      "duration": 60,
      "eventType": "meeting"
    }
  ]
}
```

---

### **2.7 Bulk Create Calendar Events**
**Endpoint**: `POST {{baseUrl}}/api/staff-calendar/bulk-create`

**Headers**:
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Sample Request Body**:
```json
{
  "events": [
    {
      "staffId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "eventType": "meeting",
      "title": "Weekly team standup",
      "startTime": "2025-01-23T09:00:00.000Z",
      "endTime": "2025-01-23T09:30:00.000Z",
      "isRecurring": true,
      "recurrencePattern": {
        "frequency": "weekly",
        "interval": 1,
        "daysOfWeek": [1],
        "endDate": "2025-12-31T00:00:00.000Z"
      }
    },
    {
      "staffId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "eventType": "break",
      "title": "Lunch break",
      "startTime": "2025-01-23T12:00:00.000Z",
      "endTime": "2025-01-23T13:00:00.000Z",
      "isRecurring": true,
      "recurrencePattern": {
        "frequency": "daily",
        "interval": 1,
        "endDate": "2025-12-31T00:00:00.000Z"
      }
    }
  ]
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Created 2 events successfully",
  "data": {
    "created": 2,
    "errors": 0,
    "createdEvents": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
        "title": "Weekly team standup",
        "eventType": "meeting"
      },
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
        "title": "Lunch break",
        "eventType": "break"
      }
    ],
    "errors": []
  }
}
```

---

## 📊 **3. Staff Performance Routes**

### **3.1 Get Staff Performance Metrics**
**Endpoint**: `GET {{baseUrl}}/api/staff/:id/performance`

**Headers**:
```
Authorization: Bearer <coach_token>
```

**Query Parameters**:
- `startDate` (optional)
- `endDate` (optional)
- `includeDetails` (optional, default: false)

**Sample Request**:
```
GET {{baseUrl}}/api/staff/64f8a1b2c3d4e5f6a7b8c9d0/performance?startDate=2025-01-01&endDate=2025-01-31&includeDetails=true
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "staffId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "staffName": "John Assistant",
    "period": {
      "start": "2025-01-01T00:00:00.000Z",
      "end": "2025-01-31T23:59:59.999Z"
    },
    "overallScore": 85,
    "taskMetrics": {
      "totalTasks": 25,
      "completedTasks": 22,
      "inProgressTasks": 2,
      "overdueTasks": 1,
      "onTimeCompletion": 20,
      "breakdown": {
        "total": 25,
        "completed": 22,
        "inProgress": 2,
        "overdue": 1,
        "onTime": 20,
        "completionRate": 88,
        "onTimeRate": 90.9
      }
    },
    "leadMetrics": {
      "totalLeads": 15,
      "managedLeads": 14,
      "convertedLeads": 8,
      "qualifiedLeads": 12,
      "breakdown": {
        "total": 15,
        "managed": 14,
        "converted": 8,
        "qualified": 12,
        "managementRate": 93.3,
        "conversionRate": 57.1,
        "qualificationRate": 85.7
      }
    },
    "calendarMetrics": {
      "totalEvents": 45,
      "completedEvents": 42,
      "cancelledEvents": 1,
      "totalDuration": 1800,
      "availabilityPercentage": 75,
      "breakdown": {
        "total": 45,
        "completed": 42,
        "cancelled": 1,
        "totalDuration": 1800,
        "availabilityPercentage": 75
      }
    },
    "responseMetrics": {
      "averageResponseTime": 120,
      "responseRate": 95,
      "totalResponses": 19,
      "breakdown": {
        "averageResponseTime": 120,
        "responseRate": 95,
        "totalResponses": 19
      }
    },
    "summary": {
      "totalTasks": 25,
      "completedTasks": 22,
      "totalLeads": 15,
      "managedLeads": 14,
      "availability": 75,
      "averageResponseTime": 120
    },
    "detailedMetrics": {
      "taskBreakdown": {
        "total": 25,
        "completed": 22,
        "inProgress": 2,
        "overdue": 1,
        "onTime": 20,
        "completionRate": 88,
        "onTimeRate": 90.9
      },
      "leadBreakdown": {
        "total": 15,
        "managed": 14,
        "converted": 8,
        "qualified": 12,
        "managementRate": 93.3,
        "conversionRate": 57.1,
        "qualificationRate": 85.7
      },
      "calendarBreakdown": {
        "total": 45,
        "completed": 42,
        "cancelled": 1,
        "totalDuration": 1800,
        "availabilityPercentage": 75
      }
    }
  }
}
```

---

### **3.2 Get Staff Performance Trends**
**Endpoint**: `GET {{baseUrl}}/api/staff/:id/performance/trends`

**Headers**:
```
Authorization: Bearer <coach_token>
```

**Query Parameters**:
- `period` (optional, default: 'monthly')
- `months` (optional, default: 6)

**Sample Request**:
```
GET {{baseUrl}}/api/staff/64f8a1b2c3d4e5f6a7b8c9d0/performance/trends?period=monthly&months=3
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "period": "2024-11",
      "overallScore": 78,
      "summary": {
        "totalTasks": 20,
        "completedTasks": 18,
        "totalLeads": 12,
        "managedLeads": 11,
        "availability": 70,
        "averageResponseTime": 150
      }
    },
    {
      "period": "2024-12",
      "overallScore": 82,
      "summary": {
        "totalTasks": 22,
        "completedTasks": 20,
        "totalLeads": 14,
        "managedLeads": 13,
        "availability": 72,
        "averageResponseTime": 135
      }
    },
    {
      "period": "2025-01",
      "overallScore": 85,
      "summary": {
        "totalTasks": 25,
        "completedTasks": 22,
        "totalLeads": 15,
        "managedLeads": 14,
        "availability": 75,
        "averageResponseTime": 120
      }
    }
  ]
}
```

---

### **3.3 Get Staff Performance Comparison**
**Endpoint**: `GET {{baseUrl}}/api/staff/performance/comparison`

**Headers**:
```
Authorization: Bearer <coach_token>
```

**Query Parameters**:
- `startDate` (optional)
- `endDate` (optional)

**Sample Request**:
```
GET {{baseUrl}}/api/staff/performance/comparison?startDate=2025-01-01&endDate=2025-01-31
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "staffId": "64f8a1b2c3d4e5f6a7b8c9d2",
      "staffName": "Sarah Manager",
      "overallScore": 92,
      "summary": {
        "totalTasks": 30,
        "completedTasks": 28,
        "totalLeads": 20,
        "managedLeads": 19,
        "availability": 88,
        "averageResponseTime": 90
      }
    },
    {
      "staffId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "staffName": "John Assistant",
      "overallScore": 85,
      "summary": {
        "totalTasks": 25,
        "completedTasks": 22,
        "totalLeads": 15,
        "managedLeads": 14,
        "availability": 75,
        "averageResponseTime": 120
      }
    }
  ]
}
```

---

## 🏠 **4. Staff Dashboard Routes**

### **4.1 Get Dashboard Overview**
**Endpoint**: `GET {{baseUrl}}/api/staff/dashboard/overview`

**Headers**:
```
Authorization: Bearer <staff_token>
```

**Sample Request**:
```
GET {{baseUrl}}/api/staff/dashboard/overview
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "staffId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "staffName": "John Assistant",
    "overview": {
      "overallScore": 85,
      "taskCompletionRate": 88,
      "leadConversionRate": 57.1,
      "availabilityPercentage": 75,
      "averageResponseTime": 120
    },
    "quickStats": {
      "todayTasks": 3,
      "overdueTasks": 1,
      "upcomingDeadlines": 5,
      "recentLeads": 2,
      "calendarEvents": 4
    },
    "recentActivity": [
      {
        "type": "task_completed",
        "description": "Completed follow-up call with lead",
        "timestamp": "2025-01-21T14:30:00.000Z",
        "relatedId": "64f8a1b2c3d4e5f6a7b8c9d8"
      },
      {
        "type": "lead_updated",
        "description": "Updated lead status to qualified",
        "timestamp": "2025-01-21T13:15:00.000Z",
        "relatedId": "64f8a1b2c3d4e5f6a7b8c9d3"
      }
    ]
  }
}
```

---

### **4.2 Get Dashboard Statistics**
**Endpoint**: `GET {{baseUrl}}/api/staff/dashboard/stats`

**Headers**:
```
Authorization: Bearer <staff_token>
```

**Query Parameters**:
- `period` (optional, default: 'week')
- `startDate` (optional)
- `endDate` (optional)

**Sample Request**:
```
GET {{baseUrl}}/api/staff/dashboard/stats?period=month
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "period": "month",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-31T23:59:59.999Z",
    "stats": {
      "tasks": {
        "total": 25,
        "completed": 22,
        "inProgress": 2,
        "overdue": 1,
        "completionRate": 88
      },
      "leads": {
        "total": 15,
        "managed": 14,
        "converted": 8,
        "conversionRate": 57.1
      },
      "calendar": {
        "totalEvents": 45,
        "completedEvents": 42,
        "availability": 75
      },
      "performance": {
        "overallScore": 85,
        "trend": "improving",
        "previousPeriod": 78
      }
    }
  }
}
```

---

### **4.3 Get Personal Performance Dashboard**
**Endpoint**: `GET {{baseUrl}}/api/staff/dashboard/performance`

**Headers**:
```
Authorization: Bearer <staff_token>
```

**Query Parameters**:
- `includeDetails` (optional, default: false)
- `includeTrends` (optional, default: false)

**Sample Request**:
```
GET {{baseUrl}}/api/staff/dashboard/performance?includeDetails=true&includeTrends=true
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "staffId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "staffName": "John Assistant",
    "currentPeriod": {
      "start": "2025-01-01T00:00:00.000Z",
      "end": "2025-01-31T23:59:59.999Z",
      "overallScore": 85
    },
    "performanceMetrics": {
      "taskMetrics": {
        "totalTasks": 25,
        "completedTasks": 22,
        "completionRate": 88,
        "onTimeRate": 90.9
      },
      "leadMetrics": {
        "totalLeads": 15,
        "managedLeads": 14,
        "conversionRate": 57.1
      },
      "calendarMetrics": {
        "availability": 75,
        "eventCompletion": 93.3
      }
    },
    "goals": {
      "taskCompletion": {
        "target": 90,
        "current": 88,
        "status": "on_track"
      },
      "leadConversion": {
        "target": 60,
        "current": 57.1,
        "status": "needs_improvement"
      }
    },
    "achievements": [
      {
        "type": "task_completion",
        "title": "Task Master",
        "description": "Completed 20+ tasks this month",
        "earnedAt": "2025-01-20T00:00:00.000Z"
      }
    ]
  }
}
```

---

### **4.4 Get Staff Notifications**
**Endpoint**: `GET {{baseUrl}}/api/staff/dashboard/notifications`

**Headers**:
```
Authorization: Bearer <staff_token>
```

**Query Parameters**:
- `status` (optional: 'unread', 'read', 'all')
- `type` (optional: 'task', 'lead', 'calendar', 'system')
- `limit` (optional, default: 20)
- `page` (optional, default: 1)

**Sample Request**:
```
GET {{baseUrl}}/api/staff/dashboard/notifications?status=unread&type=task&limit=10
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
      "type": "task",
      "title": "Task Due Soon",
      "message": "Follow-up call with lead is due in 2 hours",
      "relatedId": "64f8a1b2c3d4e5f6a7b8c9d8",
      "relatedType": "task",
      "priority": "high",
      "isRead": false,
      "createdAt": "2025-01-21T12:00:00.000Z"
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9da",
      "type": "lead",
      "title": "New Lead Assigned",
      "message": "You have been assigned a new lead: Jane Smith",
      "relatedId": "64f8a1b2c3d4e5f6a7b8c9db",
      "relatedType": "lead",
      "priority": "medium",
      "isRead": false,
      "createdAt": "2025-01-21T11:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

---

### **4.5 Get Recent Activity**
**Endpoint**: `GET {{baseUrl}}/api/staff/dashboard/recent-activity`

**Headers**:
```
Authorization: Bearer <staff_token>
```

**Query Parameters**:
- `limit` (optional, default: 20)
- `type` (optional: 'all', 'tasks', 'leads', 'calendar')

**Sample Request**:
```
GET {{baseUrl}}/api/staff/dashboard/recent-activity?limit=15&type=tasks
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9dc",
      "type": "task_completed",
      "description": "Completed follow-up call with lead",
      "relatedId": "64f8a1b2c3d4e5f6a7b8c9d8",
      "relatedType": "task",
      "timestamp": "2025-01-21T14:30:00.000Z",
      "metadata": {
        "taskTitle": "Follow up call with lead",
        "leadName": "John Doe"
      }
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9dd",
      "type": "task_created",
      "description": "Created new task: Prepare proposal",
      "relatedId": "64f8a1b2c3d4e5f6a7b8c9de",
      "relatedType": "task",
      "timestamp": "2025-01-21T13:00:00.000Z",
      "metadata": {
        "taskTitle": "Prepare proposal",
        "priority": "high"
      }
    }
  ]
}
```

---

### **4.6 Get My Tasks**
**Endpoint**: `GET {{baseUrl}}/api/staff/tasks/my-tasks`

**Headers**:
```
Authorization: Bearer <staff_token>
```

**Query Parameters**:
- `status` (optional: 'all', 'pending', 'in_progress', 'completed', 'overdue')
- `priority` (optional: 'all', 'low', 'medium', 'high', 'urgent')
- `dueDate` (optional: 'today', 'week', 'month', 'overdue')
- `limit` (optional, default: 20)
- `page` (optional, default: 1)

**Sample Request**:
```
GET {{baseUrl}}/api/staff/tasks/my-tasks?status=pending&priority=high&limit=10
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
      "name": "Follow up call with lead",
      "description": "Call John Doe to discuss proposal",
      "status": "pending",
      "priority": "high",
      "dueDate": "2025-01-22T09:00:00.000Z",
      "assignedTo": "64f8a1b2c3d4e5f6a7b8c9d0",
      "relatedLead": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "createdAt": "2025-01-21T10:00:00.000Z",
      "updatedAt": "2025-01-21T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

### **4.7 Create New Task**
**Endpoint**: `POST {{baseUrl}}/api/staff/tasks`

**Headers**:
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Sample Request Body**:
```json
{
  "name": "Prepare client presentation",
  "description": "Create presentation slides for client meeting",
  "priority": "high",
  "dueDate": "2025-01-25T17:00:00.000Z",
  "relatedLead": "64f8a1b2c3d4e5f6a7b8c9d3",
  "tags": ["presentation", "client", "sales"]
}
```

**Expected Response (201 Created)**:
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9df",
    "name": "Prepare client presentation",
    "description": "Create presentation slides for client meeting",
    "status": "pending",
    "priority": "high",
    "dueDate": "2025-01-25T17:00:00.000Z",
    "assignedTo": "64f8a1b2c3d4e5f6a7b8c9d0",
    "relatedLead": "64f8a1b2c3d4e5f6a7b8c9d3",
    "tags": ["presentation", "client", "sales"],
    "createdAt": "2025-01-21T15:00:00.000Z",
    "updatedAt": "2025-01-21T15:00:00.000Z"
  }
}
```

---

### **4.8 Update Task Status**
**Endpoint**: `PUT {{baseUrl}}/api/staff/tasks/:id/status`

**Headers**:
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Sample Request Body**:
```json
{
  "status": "in_progress",
  "notes": "Started working on presentation slides",
  "progress": 25
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9df",
    "status": "in_progress",
    "notes": "Started working on presentation slides",
    "progress": 25,
    "updatedAt": "2025-01-21T16:00:00.000Z"
  }
}
```

---

### **4.9 Get Upcoming Tasks**
**Endpoint**: `GET {{baseUrl}}/api/staff/tasks/upcoming`

**Headers**:
```
Authorization: Bearer <staff_token>
```

**Query Parameters**:
- `days` (optional, default: 7)
- `includeOverdue` (optional, default: true)

**Sample Request**:
```
GET {{baseUrl}}/api/staff/tasks/upcoming?days=14&includeOverdue=true
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
      "name": "Follow up call with lead",
      "status": "pending",
      "priority": "high",
      "dueDate": "2025-01-22T09:00:00.000Z",
      "isOverdue": false,
      "daysUntilDue": 1
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9df",
      "name": "Prepare client presentation",
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2025-01-25T17:00:00.000Z",
      "isOverdue": false,
      "daysUntilDue": 4
    }
  ]
}
```

---

### **4.10 Get My Leads**
**Endpoint**: `GET {{baseUrl}}/api/staff/leads/my-leads`

**Headers**:
```
Authorization: Bearer <staff_token>
```

**Query Parameters**:
- `status` (optional: 'all', 'new', 'contacted', 'qualified', 'converted', 'lost')
- `priority` (optional: 'all', 'low', 'medium', 'high')
- `limit` (optional, default: 20)
- `page` (optional, default: 1)

**Sample Request**:
```
GET {{baseUrl}}/api/staff/leads/my-leads?status=qualified&limit=10
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "status": "qualified",
      "priority": "high",
      "assignedTo": "64f8a1b2c3d4e5f6a7b8c9d0",
      "lastContact": "2025-01-21T09:00:00.000Z",
      "nextFollowUp": "2025-01-23T10:00:00.000Z",
      "createdAt": "2025-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

### **4.11 Update Lead Status**
**Endpoint**: `PUT {{baseUrl}}/api/staff/leads/:id/status`

**Headers**:
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Sample Request Body**:
```json
{
  "status": "converted",
  "notes": "Client signed the contract today!",
  "nextFollowUp": "2025-01-30T10:00:00.000Z"
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Lead status updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "status": "converted",
    "notes": "Client signed the contract today!",
    "nextFollowUp": "2025-01-30T10:00:00.000Z",
    "updatedAt": "2025-01-21T17:00:00.000Z"
  }
}
```

---

### **4.12 Add Lead Notes**
**Endpoint**: `POST {{baseUrl}}/api/staff/leads/:id/notes`

**Headers**:
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Sample Request Body**:
```json
{
  "note": "Client requested additional information about pricing tiers",
  "type": "interaction",
  "followUpRequired": true,
  "followUpDate": "2025-01-24T14:00:00.000Z"
}
```

**Expected Response (201 Created)**:
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9e0",
    "leadId": "64f8a1b2c3d4e5f6a7b8c9d3",
    "note": "Client requested additional information about pricing tiers",
    "type": "interaction",
    "followUpRequired": true,
    "followUpDate": "2025-01-24T14:00:00.000Z",
    "createdBy": "64f8a1b2c3d4e5f6a7b8c9d0",
    "createdAt": "2025-01-21T18:00:00.000Z"
  }
}
```

---

### **4.13 Get Staff Profile**
**Endpoint**: `GET {{baseUrl}}/api/staff/profile`

**Headers**:
```
Authorization: Bearer <staff_token>
```

**Sample Request**:
```
GET {{baseUrl}}/api/staff/profile
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Assistant",
    "email": "john.assistant@example.com",
    "phone": "+1234567890",
    "avatar": "https://example.com/avatars/john.jpg",
    "permissions": [
      "leads:read",
      "leads:update",
      "tasks:read",
      "calendar:read"
    ],
    "workingHours": {
      "monday": { "start": "09:00", "end": "17:00" },
      "tuesday": { "start": "09:00", "end": "17:00" },
      "wednesday": { "start": "09:00", "end": "17:00" },
      "thursday": { "start": "09:00", "end": "17:00" },
      "friday": { "start": "09:00", "end": "17:00" }
    },
    "timezone": "America/New_York",
    "createdAt": "2025-01-21T10:00:00.000Z",
    "updatedAt": "2025-01-21T10:00:00.000Z"
  }
}
```

---

### **4.14 Update Staff Profile**
**Endpoint**: `PUT {{baseUrl}}/api/staff/profile`

**Headers**:
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Sample Request Body**:
```json
{
  "name": "John Senior Assistant",
  "phone": "+1234567891",
  "timezone": "America/Chicago",
  "workingHours": {
    "monday": { "start": "08:00", "end": "18:00" },
    "tuesday": { "start": "08:00", "end": "18:00" },
    "wednesday": { "start": "08:00", "end": "18:00" },
    "thursday": { "start": "08:00", "end": "18:00" },
    "friday": { "start": "08:00", "end": "18:00" }
  }
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Senior Assistant",
    "phone": "+1234567891",
    "timezone": "America/Chicago",
    "workingHours": {
      "monday": { "start": "08:00", "end": "18:00" },
      "tuesday": { "start": "08:00", "end": "18:00" },
      "wednesday": { "start": "08:00", "end": "18:00" },
      "thursday": { "start": "08:00", "end": "18:00" },
      "friday": { "start": "08:00", "end": "18:00" }
    },
    "updatedAt": "2025-01-21T19:00:00.000Z"
  }
}
```

---

### **4.15 Update Notification Preferences**
**Endpoint**: `PUT {{baseUrl}}/api/staff/settings/notifications`

**Headers**:
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Sample Request Body**:
```json
{
  "email": {
    "taskReminders": true,
    "leadUpdates": true,
    "performanceReports": false,
    "systemNotifications": true
  },
  "sms": {
    "urgentTasks": true,
    "leadAssignments": false
  },
  "inApp": {
    "allNotifications": true
  }
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "data": {
    "email": {
      "taskReminders": true,
      "leadUpdates": true,
      "performanceReports": false,
      "systemNotifications": true
    },
    "sms": {
      "urgentTasks": true,
      "leadAssignments": false
    },
    "inApp": {
      "allNotifications": true
    },
    "updatedAt": "2025-01-21T20:00:00.000Z"
  }
}
```

---

### **4.16 Update Working Hours**
**Endpoint**: `PUT {{baseUrl}}/api/staff/settings/working-hours`

**Headers**:
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```

**Sample Request Body**:
```json
{
  "workingHours": {
    "monday": { "start": "08:00", "end": "18:00", "available": true },
    "tuesday": { "start": "08:00", "end": "18:00", "available": true },
    "wednesday": { "start": "08:00", "end": "18:00", "available": true },
    "thursday": { "start": "08:00", "end": "18:00", "available": true },
    "friday": { "start": "08:00", "end": "18:00", "available": true },
    "saturday": { "start": "10:00", "end": "14:00", "available": false },
    "sunday": { "start": "00:00", "end": "00:00", "available": false }
  },
  "timezone": "America/Chicago",
  "breaks": [
    { "start": "12:00", "end": "13:00", "type": "lunch" }
  ]
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Working hours updated successfully",
  "data": {
    "workingHours": {
      "monday": { "start": "08:00", "end": "18:00", "available": true },
      "tuesday": { "start": "08:00", "end": "18:00", "available": true },
      "wednesday": { "start": "08:00", "end": "18:00", "available": true },
      "thursday": { "start": "08:00", "end": "18:00", "available": true },
      "friday": { "start": "08:00", "end": "18:00", "available": true },
      "saturday": { "start": "10:00", "end": "14:00", "available": false },
      "sunday": { "start": "00:00", "end": "00:00", "available": false }
    },
    "timezone": "America/Chicago",
    "breaks": [
      { "start": "12:00", "end": "13:00", "type": "lunch" }
    ],
    "updatedAt": "2025-01-21T21:00:00.000Z"
  }
}
```

---

## 🔧 **5. Testing Scenarios**

### **5.1 Permission Testing**
Test each endpoint with different permission levels:

1. **Staff with insufficient permissions** - Should get 403 error
2. **Staff with correct permissions** - Should succeed
3. **Coach accessing staff data** - Should succeed
4. **Admin accessing any data** - Should succeed

### **5.2 Data Validation Testing**
Test with invalid data:

1. **Invalid permissions** - Should get 400 error with invalid permissions list
2. **Missing required fields** - Should get 400 error
3. **Invalid date formats** - Should get 400 error
4. **Overlapping calendar events** - Should get 409 error

### **5.3 Access Control Testing**
Test access restrictions:

1. **Staff accessing other staff data** - Should get 403 error
2. **Staff accessing coach data** - Should get 403 error
3. **Coach accessing other coach's staff** - Should get 403 error

---

## 📋 **6. Test Data Setup**

### **5.1 Required Test Users**
```json
{
  "coach": {
    "email": "coach@example.com",
    "password": "CoachPass123!",
    "role": "coach"
  },
  "staff": {
    "email": "staff@example.com",
    "password": "StaffPass123!",
    "role": "staff",
    "permissions": ["leads:read", "tasks:read", "calendar:read"]
  },
  "admin": {
    "email": "admin@example.com",
    "password": "AdminPass123!",
    "role": "admin"
  }
}
```

### **5.2 Test Permissions**
```json
{
  "validPermissions": [
    "leads:read", "leads:write", "leads:update", "leads:delete", "leads:manage",
    "tasks:read", "tasks:write", "tasks:update", "tasks:delete", "tasks:manage", "tasks:assign",
    "calendar:read", "calendar:write", "calendar:update", "calendar:delete", "calendar:manage", "calendar:book"
  ],
  "invalidPermissions": [
    "invalid:permission", "unknown:action", "test:wrong"
  ]
}
```

---

## 🚀 **7. Running Tests**

### **6.1 Using Postman/Insomnia**
1. Import the endpoints
2. Set `{{baseUrl}}` as environment variable
3. Set authentication tokens
4. Run tests in sequence

### **6.2 Using cURL**
```bash
# Example: Create staff member
curl -X POST "{{baseUrl}}/api/staff" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Assistant",
    "email": "test.assistant@example.com",
    "password": "TestPass123!",
    "permissions": ["leads:read", "tasks:read"]
  }'
```

### **6.3 Using Automated Testing**
Create test scripts using your preferred testing framework (Jest, Mocha, etc.)

---

## ✅ **8. Expected Test Results**

All endpoints should return:
- **Success responses** with proper data structure
- **Error responses** with meaningful error messages
- **Proper HTTP status codes**
- **Consistent response format**
- **Permission-based access control**
- **Data validation**
- **Proper error handling**

---

## 🎯 **9. Next Steps After Testing**

1. **Fix any issues** found during testing
2. **Optimize performance** if needed
3. **Add additional validation** if required
4. **Implement frontend integration**
5. **Deploy to production**

---

**Happy Testing! 🧪✨**
