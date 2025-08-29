# 🚀 Subscription System Testing Guide

This guide provides comprehensive testing instructions for the Coach Dashboard subscription system, including all API endpoints, sample inputs, and expected responses.

## 📋 Table of Contents

1. [Authentication Setup](#authentication-setup)
2. [Subscription Plans Management](#subscription-plans-management)
3. [Coach Subscriptions](#coach-subscriptions)
4. [Admin Utilities](#admin-utilities)
5. [Testing Scenarios](#testing-scenarios)
6. [Error Handling](#error-handling)

---

## 🔐 Authentication Setup

### Required Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### User Roles
- **Admin**: Full access to all endpoints
- **Coach**: Limited access to subscription management
- **Public**: Access to view plans only

---

## 📊 Subscription Plans Management

### 1. Create Subscription Plan (Admin Only)

**Endpoint:** `POST /api/subscriptions/plans`

**Sample Input:**
```json
{
  "name": "Premium Fitness Coach",
  "description": "Complete fitness coaching platform with AI features and advanced analytics",
  "price": {
    "amount": 99.99,
    "currency": "USD",
    "billingCycle": "monthly"
  },
  "features": {
    "maxFunnels": 20,
    "maxLeads": 5000,
    "maxStaff": 10,
    "maxAutomationRules": 100,
    "aiFeatures": true,
    "advancedAnalytics": true,
    "prioritySupport": true,
    "customDomain": true
  },
  "isPopular": true,
  "sortOrder": 1
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Subscription plan created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Premium Fitness Coach",
    "description": "Complete fitness coaching platform with AI features and advanced analytics",
    "price": {
      "amount": 99.99,
      "currency": "USD",
      "billingCycle": "monthly"
    },
    "features": {
      "maxFunnels": 20,
      "maxLeads": 5000,
      "maxStaff": 10,
      "maxAutomationRules": 100,
      "aiFeatures": true,
      "advancedAnalytics": true,
      "prioritySupport": true,
      "customDomain": true
    },
    "isActive": true,
    "isPopular": true,
    "sortOrder": 1,
    "createdBy": "64f8a1b2c3d4e5f6a7b8c9d1",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Active Plans (Public)

**Endpoint:** `GET /api/subscriptions/plans`

**Expected Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Starter Plan",
      "description": "Basic coaching platform for beginners",
      "price": {
        "amount": 29.99,
        "currency": "USD",
        "billingCycle": "monthly"
      },
      "features": {
        "maxFunnels": 5,
        "maxLeads": 1000,
        "maxStaff": 3,
        "maxAutomationRules": 10,
        "aiFeatures": false,
        "advancedAnalytics": false,
        "prioritySupport": false,
        "customDomain": false
      },
      "isActive": true,
      "isPopular": false,
      "sortOrder": 0
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "Premium Fitness Coach",
      "description": "Complete fitness coaching platform with AI features and advanced analytics",
      "price": {
        "amount": 99.99,
        "currency": "USD",
        "billingCycle": "monthly"
      },
      "features": {
        "maxFunnels": 20,
        "maxLeads": 5000,
        "maxStaff": 10,
        "maxAutomationRules": 100,
        "aiFeatures": true,
        "advancedAnalytics": true,
        "prioritySupport": true,
        "customDomain": true
      },
      "isActive": true,
      "isPopular": true,
      "sortOrder": 1
    }
  ]
}
```

### 3. Update Subscription Plan (Admin Only)

**Endpoint:** `PUT /api/subscriptions/plans/:id`

**Sample Input:**
```json
{
  "price": {
    "amount": 89.99,
    "currency": "USD",
    "billingCycle": "monthly"
  },
  "isPopular": false
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Subscription plan updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "name": "Premium Fitness Coach",
    "description": "Complete fitness coaching platform with AI features and advanced analytics",
    "price": {
      "amount": 89.99,
      "currency": "USD",
      "billingCycle": "monthly"
    },
    "features": {
      "maxFunnels": 20,
      "maxLeads": 5000,
      "maxStaff": 10,
      "maxAutomationRules": 100,
      "aiFeatures": true,
      "advancedAnalytics": true,
      "prioritySupport": true,
      "customDomain": true
    },
    "isActive": true,
    "isPopular": false,
    "sortOrder": 1,
    "createdBy": "64f8a1b2c3d4e5f6a7b8c9d1",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### 4. Delete Subscription Plan (Admin Only)

**Endpoint:** `DELETE /api/subscriptions/plans/:id`

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Subscription plan deleted successfully"
}
```

**Error Response (400) - Plan has active subscriptions:**
```json
{
  "success": false,
  "message": "Cannot delete plan. 5 active subscriptions found."
}
```

---

## 👨‍💼 Coach Subscriptions

### 1. Subscribe Coach to Plan

**Endpoint:** `POST /api/subscriptions/subscribe`

**Sample Input (Coach subscribing themselves):**
```json
{
  "planId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "paymentData": {
    "status": "paid",
    "gateway": "stripe",
    "transactionId": "txn_123456789"
  }
}
```

**Sample Input (Admin subscribing a coach):**
```json
{
  "coachId": "64f8a1b2c3d4e5f6a7b8c9d3",
  "planId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "paymentData": {
    "status": "paid",
    "gateway": "stripe",
    "transactionId": "txn_123456789"
  }
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "coachId": "64f8a1b2c3d4e5f6a7b8c9d3",
    "planId": "64f8a1b2c3d4e5f6a7b8c9d2",
    "status": "active",
    "currentPeriod": {
      "startDate": "2024-01-15T10:30:00.000Z",
      "endDate": "2024-02-15T10:30:00.000Z"
    },
    "billing": {
      "amount": 99.99,
      "currency": "USD",
      "billingCycle": "monthly",
      "nextBillingDate": "2024-02-15T10:30:00.000Z",
      "lastPaymentDate": "2024-01-15T10:30:00.000Z",
      "paymentMethod": "stripe",
      "paymentStatus": "paid"
    },
    "features": {
      "maxFunnels": 20,
      "maxLeads": 5000,
      "maxStaff": 10,
      "maxAutomationRules": 100,
      "aiFeatures": true,
      "advancedAnalytics": true,
      "prioritySupport": true,
      "customDomain": true
    },
    "usage": {
      "currentFunnels": 0,
      "currentLeads": 0,
      "currentStaff": 0,
      "currentAutomationRules": 0
    },
    "reminders": {
      "sevenDaysBefore": {
        "sent": false,
        "emailSent": false,
        "whatsappSent": false
      },
      "threeDaysBefore": {
        "sent": false,
        "emailSent": false,
        "whatsappSent": false
      },
      "oneDayBefore": {
        "sent": false,
        "emailSent": false,
        "whatsappSent": false
      },
      "onExpiry": {
        "sent": false,
        "emailSent": false,
        "whatsappSent": false
      }
    },
    "accountStatus": {
      "isEnabled": true
    },
    "autoRenew": {
      "enabled": true
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Renew Subscription

**Endpoint:** `POST /api/subscriptions/renew`

**Sample Input:**
```json
{
  "planId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "paymentData": {
    "status": "paid",
    "gateway": "stripe",
    "transactionId": "txn_987654321"
  }
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Subscription renewed successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "status": "active",
    "currentPeriod": {
      "startDate": "2024-02-15T10:30:00.000Z",
      "endDate": "2024-03-15T10:30:00.000Z"
    },
    "billing": {
      "nextBillingDate": "2024-03-15T10:30:00.000Z",
      "lastPaymentDate": "2024-02-15T10:30:00.000Z",
      "paymentStatus": "paid"
    },
    "updatedAt": "2024-02-15T10:30:00.000Z"
  }
}
```

### 3. Cancel Subscription

**Endpoint:** `POST /api/subscriptions/cancel`

**Sample Input:**
```json
{
  "reason": "Switching to a different platform"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "status": "cancelled",
    "cancellation": {
      "cancelledAt": "2024-01-20T10:30:00.000Z",
      "cancelledBy": "64f8a1b2c3d4e5f6a7b8c9d3",
      "reason": "Switching to a different platform",
      "effectiveDate": "2024-02-15T10:30:00.000Z"
    },
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

### 4. Get My Subscription (Coach)

**Endpoint:** `GET /api/subscriptions/my-subscription`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "coachId": "64f8a1b2c3d4e5f6a7b8c9d3",
    "planId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "Premium Fitness Coach",
      "description": "Complete fitness coaching platform with AI features and advanced analytics",
      "price": {
        "amount": 99.99,
        "currency": "USD",
        "billingCycle": "monthly"
      },
      "features": {
        "maxFunnels": 20,
        "maxLeads": 5000,
        "maxStaff": 10,
        "maxAutomationRules": 100,
        "aiFeatures": true,
        "advancedAnalytics": true,
        "prioritySupport": true,
        "customDomain": true
      }
    },
    "status": "active",
    "currentPeriod": {
      "startDate": "2024-01-15T10:30:00.000Z",
      "endDate": "2024-02-15T10:30:00.000Z"
    },
    "billing": {
      "amount": 99.99,
      "currency": "USD",
      "billingCycle": "monthly",
      "nextBillingDate": "2024-02-15T10:30:00.000Z",
      "lastPaymentDate": "2024-01-15T10:30:00.000Z",
      "paymentMethod": "stripe",
      "paymentStatus": "paid"
    },
    "features": {
      "maxFunnels": 20,
      "maxLeads": 5000,
      "maxStaff": 10,
      "maxAutomationRules": 100,
      "aiFeatures": true,
      "advancedAnalytics": true,
      "prioritySupport": true,
      "customDomain": true
    },
    "usage": {
      "currentFunnels": 5,
      "currentLeads": 1250,
      "currentStaff": 3,
      "currentAutomationRules": 25
    },
    "daysUntilExpiry": 15,
    "isExpired": false,
    "isExpiringSoon": false,
    "isOverdue": false
  }
}
```

### 5. Get Coach Subscription (Admin)

**Endpoint:** `GET /api/subscriptions/coach/:coachId`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "coachId": "64f8a1b2c3d4e5f6a7b8c9d3",
    "planId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "Premium Fitness Coach"
    },
    "status": "active",
    "currentPeriod": {
      "startDate": "2024-01-15T10:30:00.000Z",
      "endDate": "2024-02-15T10:30:00.000Z"
    },
    "billing": {
      "amount": 99.99,
      "currency": "USD",
      "billingCycle": "monthly",
      "nextBillingDate": "2024-02-15T10:30:00.000Z",
      "paymentStatus": "paid"
    },
    "features": {
      "maxFunnels": 20,
      "maxLeads": 5000,
      "maxStaff": 10,
      "maxAutomationRules": 100,
      "aiFeatures": true,
      "advancedAnalytics": true,
      "prioritySupport": true,
      "customDomain": true
    },
    "usage": {
      "currentFunnels": 5,
      "currentLeads": 1250,
      "currentStaff": 3,
      "currentAutomationRules": 25
    }
  }
}
```

### 6. Get All Subscriptions (Admin)

**Endpoint:** `GET /api/subscriptions/all?status=active&page=1&limit=10`

**Expected Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "coachId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "John Doe",
        "email": "john@fitnesscoach.com",
        "company": "Fitness Pro"
      },
      "planId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "Premium Fitness Coach",
        "price": {
          "amount": 99.99,
          "currency": "USD",
          "billingCycle": "monthly"
        },
        "features": {
          "maxFunnels": 20,
          "maxLeads": 5000,
          "maxStaff": 10,
          "maxAutomationRules": 100,
          "aiFeatures": true,
          "advancedAnalytics": true,
          "prioritySupport": true,
          "customDomain": true
        }
      },
      "status": "active",
      "currentPeriod": {
        "startDate": "2024-01-15T10:30:00.000Z",
        "endDate": "2024-02-15T10:30:00.000Z"
      },
      "billing": {
        "amount": 99.99,
        "currency": "USD",
        "billingCycle": "monthly",
        "nextBillingDate": "2024-02-15T10:30:00.000Z",
        "paymentStatus": "paid"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 🛠️ Admin Utilities

### 1. Get Subscription Analytics (Admin)

**Endpoint:** `GET /api/subscriptions/analytics`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSubscriptions": 45,
    "activeSubscriptions": 38,
    "expiredSubscriptions": 5,
    "cancelledSubscriptions": 2,
    "monthlyRevenue": 4567.89,
    "revenueByPlan": [
      {
        "planName": "Premium Fitness Coach",
        "count": 25,
        "revenue": 2499.75
      },
      {
        "planName": "Starter Plan",
        "count": 20,
        "revenue": 599.80
      }
    ],
    "subscriptionGrowth": {
      "thisMonth": 8,
      "lastMonth": 6,
      "growthPercentage": 33.33
    },
    "churnRate": 4.44,
    "averageSubscriptionDuration": 4.2
  }
}
```

### 2. Send Reminders (Admin)

**Endpoint:** `POST /api/subscriptions/send-reminders`

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Reminders sent successfully. 5 reminders sent to coaches with expiring subscriptions."
}
```

### 3. Disable Expired Subscriptions (Admin)

**Endpoint:** `POST /api/subscriptions/disable-expired`

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Disabled 3 expired subscriptions",
  "disabledCount": 3
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Subscription Lifecycle

1. **Create Plan** → Admin creates a new subscription plan
2. **Subscribe Coach** → Coach subscribes to the plan
3. **Check Access** → Verify coach can access features
4. **Renew Subscription** → Coach renews before expiry
5. **Cancel Subscription** → Coach cancels subscription
6. **Verify Cancellation** → Check subscription status

### Scenario 2: Subscription Expiry Handling

1. **Create Expired Subscription** → Admin creates subscription with past end date
2. **Run Cleanup Task** → Execute disable expired subscriptions
3. **Verify Status** → Check if account is disabled
4. **Test Access** → Verify coach cannot access protected features

### Scenario 3: Feature Access Control

1. **Subscribe to Basic Plan** → Coach subscribes to plan without AI features
2. **Test AI Feature** → Attempt to access AI feature
3. **Verify Blocking** → Check if access is properly blocked
4. **Upgrade Plan** → Upgrade to plan with AI features
5. **Test Access** → Verify AI feature is now accessible

### Scenario 4: Usage Limits

1. **Create Funnels** → Coach creates funnels up to limit
2. **Test Limit** → Attempt to create one more funnel
3. **Verify Blocking** → Check if creation is blocked
4. **Check Usage** → Verify current usage is tracked correctly

---

## ❌ Error Handling

### Common Error Responses

#### 400 - Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: name, description, price.amount, price.billingCycle"
}
```

#### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

#### 403 - Forbidden
```json
{
  "success": false,
  "message": "Your subscription is not active. Please check your subscription status.",
  "code": "INACTIVE_SUBSCRIPTION"
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "message": "Subscription plan not found"
}
```

#### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error creating subscription plan",
  "error": "Database connection failed"
}
```

---

## 🔧 Testing Tools

### 1. Postman Collection
Import the subscription endpoints into Postman for easy testing.

### 2. cURL Examples
```bash
# Get all plans
curl -X GET "http://localhost:3000/api/subscriptions/plans"

# Create plan (Admin only)
curl -X POST "http://localhost:3000/api/subscriptions/plans" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Plan","description":"Test","price":{"amount":29.99,"billingCycle":"monthly"}}'

# Subscribe coach
curl -X POST "http://localhost:3000/api/subscriptions/subscribe" \
  -H "Authorization: Bearer COACH_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId":"PLAN_ID","paymentData":{"status":"paid"}}'
```

### 3. Database Queries
```javascript
// Check subscription status
db.coachsubscriptions.findOne({ coachId: ObjectId("COACH_ID") })

// Get all active subscriptions
db.coachsubscriptions.find({ status: "active" })

// Check subscription plans
db.subscriptionplans.find({ isActive: true })
```

---

## 📝 Notes

1. **JWT Tokens**: Ensure you have valid JWT tokens for authentication
2. **Database**: Make sure MongoDB is running and accessible
3. **Environment**: Set up proper environment variables for testing
4. **Cleanup**: Clean up test data after testing to avoid conflicts
5. **Validation**: Test both valid and invalid inputs for comprehensive coverage

---

## 🚀 Quick Start Testing

1. **Start the server** and ensure MongoDB is running
2. **Create an admin user** and get JWT token
3. **Create a subscription plan** using admin token
4. **Create a coach user** and get JWT token
5. **Subscribe the coach** to the plan
6. **Test all endpoints** with the provided sample data
7. **Verify responses** match expected formats
8. **Test error scenarios** with invalid inputs

Happy Testing! 🎉
