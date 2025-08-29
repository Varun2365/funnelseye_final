# 💰 Coach Payment Collection System Testing Guide

This guide provides comprehensive testing instructions for the new Coach Payment Collection system, including UPI ID setup, payment processing, and analytics.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Payment Collection Setup](#payment-collection-setup)
3. [Payment Management](#payment-management)
4. [Payment Analytics](#payment-analytics)
5. [Testing Scenarios](#testing-scenarios)
6. [Error Handling](#error-handling)

---

## 🎯 System Overview

The Coach Payment Collection system allows coaches to:
- **Setup UPI ID and bank details** for receiving payments
- **Receive payments** from the centralized system (commissions, bonuses, etc.)
- **Track payment history** and status
- **View payment analytics** and revenue reports

**Key Features:**
- UPI ID and bank account setup
- Multiple payment collection methods
- Payment status tracking (pending, processing, completed, failed)
- Comprehensive analytics and reporting
- Admin payment management

---

## 🔧 Payment Collection Setup

### 1. Setup Payment Collection (Coach)

**Endpoint:** `POST /api/coach-payments/setup-payment-collection`

**Sample Input (UPI Only):**
```json
{
  "upiId": "fitnesscoach@okicici",
  "paymentCollectionMethod": "upi"
}
```

**Sample Input (Bank Transfer Only):**
```json
{
  "bankAccount": {
    "accountNumber": "1234567890",
    "ifscCode": "ICIC0001234",
    "accountHolderName": "John Doe"
  },
  "paymentCollectionMethod": "bank_transfer"
}
```

**Sample Input (Both Methods):**
```json
{
  "upiId": "fitnesscoach@okicici",
  "bankAccount": {
    "accountNumber": "1234567890",
    "ifscCode": "ICIC0001234",
    "accountHolderName": "John Doe"
  },
  "paymentCollectionMethod": "both"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Payment collection settings updated successfully",
  "data": {
    "paymentCollection": {
      "upiId": "fitnesscoach@okicici",
      "bankAccount": {
        "accountNumber": "1234567890",
        "ifscCode": "ICIC0001234",
        "accountHolderName": "John Doe"
      },
      "isPaymentCollectionEnabled": true,
      "paymentCollectionMethod": "both",
      "lastPaymentReceived": {
        "amount": 0,
        "date": null,
        "reference": null
      },
      "totalPaymentsReceived": 0,
      "pendingPayments": 0
    }
  }
}
```

### 2. Get Payment Settings (Coach)

**Endpoint:** `GET /api/coach-payments/payment-settings`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "paymentCollection": {
      "upiId": "fitnesscoach@okicici",
      "bankAccount": {
        "accountNumber": "1234567890",
        "ifscCode": "ICIC0001234",
        "accountHolderName": "John Doe"
      },
      "isPaymentCollectionEnabled": true,
      "paymentCollectionMethod": "both",
      "lastPaymentReceived": {
        "amount": 0,
        "date": null,
        "reference": null
      },
      "totalPaymentsReceived": 0,
      "pendingPayments": 0
    }
  }
}
```

---

## 💳 Payment Management

### 1. Create Payment (Admin Only)

**Endpoint:** `POST /api/coach-payments/create-payment`

**Sample Input (Commission Payment):**
```json
{
  "coachId": "64f8a1b2c3d4e5f6a7b8c9d3",
  "amount": 2500,
  "currency": "INR",
  "paymentType": "commission",
  "description": "MLM Commission for January 2024",
  "reference": "MLM_COMM_2024_01",
  "metadata": {
    "source": "mlm_commission",
    "period": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z"
    },
    "tags": ["mlm", "commission", "monthly"]
  },
  "notes": "Commission based on team performance"
}
```

**Sample Input (Performance Bonus):**
```json
{
  "coachId": "64f8a1b2c3d4e5f6a7b8c9d3",
  "amount": 1000,
  "currency": "INR",
  "paymentType": "performance_bonus",
  "description": "Performance Bonus - Top 10% Achiever",
  "reference": "PERF_BONUS_2024_01",
  "metadata": {
    "source": "platform_bonus",
    "tags": ["performance", "bonus", "achievement"]
  },
  "notes": "Bonus for achieving monthly targets"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
    "coachId": "64f8a1b2c3d4e5f6a7b8c9d3",
    "paymentId": "CP_1704067200000_ABC123DEF",
    "amount": 2500,
    "currency": "INR",
    "paymentMethod": "centralized_system",
    "status": "pending",
    "paymentType": "commission",
    "description": "MLM Commission for January 2024",
    "reference": "MLM_COMM_2024_01",
    "metadata": {
      "source": "mlm_commission",
      "period": {
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-01-31T23:59:59.999Z"
      },
      "tags": ["mlm", "commission", "monthly"]
    },
    "notes": "Commission based on team performance",
    "createdBy": "64f8a1b2c3d4e5f6a7b8c9d1",
    "processingDetails": {
      "initiatedAt": "2024-01-01T10:00:00.000Z"
    },
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### 2. Get My Payments (Coach)

**Endpoint:** `GET /api/coach-payments/my-payments?status=pending&page=1&limit=10`

**Expected Response (200):**
```json
{
  "success": true,
  "count": 2,
  "total": 5,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "paymentId": "CP_1704067200000_ABC123DEF",
      "amount": 2500,
      "currency": "INR",
      "paymentMethod": "centralized_system",
      "status": "pending",
      "paymentType": "commission",
      "description": "MLM Commission for January 2024",
      "reference": "MLM_COMM_2024_01",
      "createdAt": "2024-01-01T10:00:00.000Z"
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
      "paymentId": "CP_1704067200000_XYZ789GHI",
      "amount": 1000,
      "currency": "INR",
      "paymentMethod": "centralized_system",
      "status": "pending",
      "paymentType": "performance_bonus",
      "description": "Performance Bonus - Top 10% Achiever",
      "reference": "PERF_BONUS_2024_01",
      "createdAt": "2024-01-01T11:00:00.000Z"
    }
  ]
}
```

### 3. Process Payment (Admin Only)

**Endpoint:** `PUT /api/coach-payments/:paymentId/process`

**Sample Input (Mark as Processing):**
```json
{
  "action": "process"
}
```

**Sample Input (Mark as Completed):**
```json
{
  "action": "complete",
  "transactionId": "TXN_123456789"
}
```

**Sample Input (Mark as Failed):**
```json
{
  "action": "fail",
  "notes": "UPI ID not found. Please verify payment details."
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Payment completed successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
    "status": "completed",
    "transactionId": "TXN_123456789",
    "processingDetails": {
      "initiatedAt": "2024-01-01T10:00:00.000Z",
      "processedAt": "2024-01-01T12:00:00.000Z",
      "completedAt": "2024-01-01T14:00:00.000Z"
    },
    "updatedAt": "2024-01-01T14:00:00.000Z"
  }
}
```

---

## 📊 Payment Analytics

### 1. Get Payment Analytics (Coach)

**Endpoint:** `GET /api/coach-payments/analytics?period=month`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalPayments": 5,
      "totalAmount": 8500,
      "pendingAmount": 3500,
      "completedAmount": 5000,
      "failedAmount": 0,
      "byStatus": {
        "pending": {
          "count": 2,
          "amount": 3500
        },
        "completed": {
          "count": 3,
          "amount": 5000
        }
      }
    },
    "recentPayments": [
      {
        "amount": 2500,
        "status": "pending",
        "paymentType": "commission",
        "createdAt": "2024-01-01T10:00:00.000Z"
      },
      {
        "amount": 1000,
        "status": "completed",
        "paymentType": "performance_bonus",
        "createdAt": "2024-01-01T09:00:00.000Z"
      }
    ],
    "period": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z"
    }
  }
}
```

### 2. Get Admin Payment Analytics (Admin Only)

**Endpoint:** `GET /api/coach-payments/admin/analytics?period=month`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "totalPayments": 25,
    "totalAmount": 125000,
    "uniqueCoaches": 15,
    "byStatus": {
      "pending": {
        "count": 8,
        "amount": 40000
      },
      "processing": {
        "count": 3,
        "amount": 15000
      },
      "completed": {
        "count": 12,
        "amount": 60000
      },
      "failed": {
        "count": 2,
        "amount": 10000
      }
    },
    "period": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z"
    }
  }
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Payment Collection Setup

1. **Setup Payment Collection** → Coach sets up UPI ID and bank details
2. **Verify Settings** → Check if payment collection is enabled
3. **Create Payment** → Admin creates a payment for the coach
4. **Process Payment** → Admin processes the payment through different statuses
5. **Verify Analytics** → Check if payment appears in coach's analytics

### Scenario 2: Payment Processing Workflow

1. **Create Multiple Payments** → Admin creates various types of payments
2. **Process Payments** → Test all processing actions (process, complete, fail)
3. **Check Status Updates** → Verify processing details are updated correctly
4. **View Payment History** → Coach checks their payment history

### Scenario 3: Analytics and Reporting

1. **Generate Payments** → Create payments across different periods
2. **Test Period Filters** → Use month/year filters for analytics
3. **Verify Calculations** → Check if totals and counts are accurate
4. **Admin Overview** → Verify admin analytics show correct data

### Scenario 4: Error Handling

1. **Invalid UPI ID** → Test with malformed UPI ID
2. **Missing Bank Details** → Test bank transfer without required fields
3. **Invalid Payment Data** → Test payment creation with missing fields
4. **Processing Errors** → Test invalid processing actions

---

## ❌ Error Handling

### Common Error Responses

#### 400 - Bad Request (Missing Fields)
```json
{
  "success": false,
  "message": "Either UPI ID or bank account details are required"
}
```

#### 400 - Bad Request (Invalid Bank Details)
```json
{
  "success": false,
  "message": "Bank account number and IFSC code are required for bank transfer method"
}
```

#### 400 - Bad Request (Invalid Action)
```json
{
  "success": false,
  "message": "Invalid action. Use: process, complete, or fail"
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "message": "Coach not found"
}
```

#### 403 - Forbidden
```json
{
  "success": false,
  "message": "Coach has not enabled payment collection"
}
```

---

## 🔧 Testing Tools

### 1. cURL Examples

```bash
# Setup payment collection
curl -X POST "http://localhost:3000/api/coach-payments/setup-payment-collection" \
  -H "Authorization: Bearer COACH_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"upiId":"fitnesscoach@okicici","paymentCollectionMethod":"upi"}'

# Create payment (Admin)
curl -X POST "http://localhost:3000/api/coach-payments/create-payment" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"coachId":"COACH_ID","amount":2500,"paymentType":"commission","description":"MLM Commission"}'

# Get payment analytics
curl -X GET "http://localhost:3000/api/coach-payments/analytics?period=month" \
  -H "Authorization: Bearer COACH_JWT_TOKEN"
```

### 2. Database Queries

```javascript
// Check coach payment collection settings
db.users.findOne({ _id: ObjectId("COACH_ID") }, { paymentCollection: 1 })

// Get all payments for a coach
db.coachpayments.find({ coachId: ObjectId("COACH_ID") })

// Get pending payments
db.coachpayments.find({ status: "pending" })

// Get payment statistics
db.coachpayments.aggregate([
  { $match: { coachId: ObjectId("COACH_ID") } },
  { $group: { _id: "$status", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } }
])
```

---

## 📝 Notes

1. **UPI ID Format**: Must follow pattern `username@bank` (e.g., `fitnesscoach@okicici`)
2. **IFSC Code Format**: Must follow pattern `BANK0001234` (4 letters + 0 + 6 alphanumeric)
3. **Payment Types**: commission, bonus, referral_reward, performance_bonus, monthly_payout, other
4. **Payment Statuses**: pending, processing, completed, failed, cancelled
5. **Currency Support**: INR (default), USD, EUR, GBP

---

## 🚀 Quick Start Testing

1. **Start the server** and ensure MongoDB is running
2. **Create a coach user** and get JWT token
3. **Setup payment collection** with UPI ID or bank details
4. **Create admin user** and get JWT token
5. **Create payments** for the coach using admin token
6. **Process payments** through different statuses
7. **Test analytics** and reporting features
8. **Verify error handling** with invalid inputs

Happy Testing! 🎉
