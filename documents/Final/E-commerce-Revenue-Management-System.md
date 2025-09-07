# E-commerce & Revenue Management System Documentation

## Overview
The E-commerce & Revenue Management System provides comprehensive payment processing, subscription management, commission distribution, and financial analytics. The system supports multiple payment gateways, automated MLM commission calculations, instant payouts, and detailed revenue tracking with multi-currency support.

## System Architecture

### Core Components
- **Subscription Management** - Multi-currency pricing plans and billing
- **Payment Processing** - Installment and recurring billing
- **Commission Distribution** - MLM commission processing
- **Revenue Analytics** - Financial performance tracking
- **Multi-Gateway Support** - Razorpay, Stripe, PayPal integration
- **Tax Management** - GST, TDS calculation and compliance
- **Payout Management** - Instant and scheduled payouts

### Database Schema

#### CoachPayment Schema
```javascript
{
  coachId: ObjectId,               // Reference to User (Coach) - Required
  paymentId: String,              // Unique payment identifier - Required
  amount: Number,                 // Payment amount - Required
  currency: String,               // 'INR', 'USD', 'EUR', 'GBP' (default: 'INR')
  paymentMethod: String,          // 'upi', 'bank_transfer', 'centralized_system'
  status: String,                 // 'pending', 'processing', 'completed', 'failed', 'cancelled'
  paymentType: String,            // 'commission', 'bonus', 'referral_reward', 'performance_bonus', 'monthly_payout', 'other'
  description: String,            // Payment description - Required
  reference: String,              // Reference number
  transactionId: String,          // External transaction ID
  upiId: String,                  // UPI ID for payments
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String
  },
  processingDetails: {
    initiatedAt: Date,
    processedAt: Date,
    completedAt: Date,
    failedAt: Date,
    failureReason: String
  },
  metadata: {
    source: String,               // 'mlm_commission', 'lead_generation', 'subscription_referral', 'platform_bonus', 'other'
    period: {
      startDate: Date,
      endDate: Date
    },
    relatedTransactions: [ObjectId],
    tags: [String]
  },
  notes: String,                  // Additional notes
  createdBy: ObjectId,            // Reference to User - Required
  processedBy: ObjectId,          // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

#### UnifiedPaymentTransaction Schema
```javascript
{
  transactionId: String,         // Unique transaction ID - Required
  transactionType: String,        // 'course_purchase', 'product_purchase', 'subscription_payment', 'mlm_commission', 'instant_payout', 'refund', 'adjustment'
  grossAmount: Number,            // Total transaction amount - Required
  netAmount: Number,             // Amount after fees and taxes
  currency: String,              // Transaction currency (default: 'INR')
  gateway: String,               // 'razorpay', 'stripe', 'paypal', 'bank_transfer', 'upi', 'manual'
  status: String,                // 'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
  
  // Transaction Parties
  senderId: ObjectId,            // Reference to User - Required
  senderType: String,            // 'customer', 'coach', 'admin', 'system', 'central_account'
  receiverId: ObjectId,          // Reference to User - Required
  receiverType: String,          // 'customer', 'coach', 'admin', 'system', 'central_account'
  
  // Product/Service Details
  productId: ObjectId,           // Reference to product/service
  productType: String,           // 'course', 'subscription', 'consultation', 'product'
  productName: String,           // Product name
  productDescription: String,    // Product description
  
  // MLM Details
  coachId: ObjectId,             // Reference to Coach
  mlmLevel: Number,              // MLM hierarchy level
  sponsorId: ObjectId,           // Reference to Sponsor
  
  // Commission Details
  commissionBreakdown: [{
    recipientId: ObjectId,       // Commission recipient
    level: Number,               // MLM level
    percentage: Number,          // Commission percentage
    amount: Number,              // Commission amount
    status: String              // 'pending', 'paid', 'cancelled'
  }],
  
  // Fee Structure
  fees: {
    platformFee: Number,        // Platform fee
    gatewayFee: Number,          // Payment gateway fee
    taxAmount: Number,           // Tax amount (GST/TDS)
    netAmount: Number           // Final amount after all deductions
  },
  
  // Payment Details
  paymentDetails: {
    gatewayTransactionId: String,
    gatewayResponse: Mixed,
    paymentMethod: String,
    paymentStatus: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number
  },
  
  // Payout Details
  payoutDetails: {
    payoutMethod: String,        // 'upi', 'bank_transfer', 'paytm', 'phonepe', 'google_pay'
    payoutStatus: String,        // 'pending', 'processing', 'completed', 'failed'
    payoutId: String,
    payoutDate: Date,
    payoutReference: String
  },
  
  // Checkout Page Integration
  checkoutPage: {
    pageId: String,
    configuration: Mixed,
    businessLogic: Mixed
  },
  
  metadata: Mixed,               // Additional transaction metadata
  createdAt: Date,
  updatedAt: Date
}
```

#### SubscriptionPlan Schema
```javascript
{
  name: String,                  // Plan name - Required
  description: String,           // Plan description - Required
  price: {
    amount: Number,              // Price amount - Required
    currency: String,            // 'USD', 'EUR', 'GBP', 'INR' (default: 'USD')
    billingCycle: String         // 'monthly', 'quarterly', 'yearly' - Required
  },
  features: {
    maxFunnels: Number,          // Maximum funnels allowed
    maxLeads: Number,            // Maximum leads allowed
    maxStaff: Number,            // Maximum staff members
    maxAutomationRules: Number,  // Maximum automation rules
    aiFeatures: Boolean,         // AI features access
    advancedAnalytics: Boolean,  // Advanced analytics access
    prioritySupport: Boolean,    // Priority support access
    customDomain: Boolean        // Custom domain access
  },
  isActive: Boolean,             // Plan active status (default: true)
  isPopular: Boolean,            // Popular plan flag (default: false)
  sortOrder: Number,             // Display order (default: 0)
  createdBy: ObjectId,           // Reference to AdminUser - Required
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Base URL: `/api/unified-payments`

### 1. Payment Session Management

#### Create Payment Session
**POST** `/create-session`
- **Description**: Create unified payment session
- **Authentication**: Required
- **Request Body**:
```json
{
  "transactionType": "course_purchase",
  "grossAmount": 2999,
  "senderId": "65a1b2c3d4e5f6789012345a",
  "senderType": "customer",
  "receiverId": "65a1b2c3d4e5f6789012345b",
  "receiverType": "coach",
  "productId": "65a1b2c3d4e5f6789012345c",
  "productType": "course",
  "productName": "30-Day Weight Loss Transformation",
  "productDescription": "Complete weight loss program with meal plans and workouts",
  "coachId": "65a1b2c3d4e5f6789012345b",
  "mlmLevel": 1,
  "sponsorId": "65a1b2c3d4e5f6789012345d",
  "gateway": "razorpay",
  "checkoutPageId": "checkout_123",
  "metadata": {
    "source": "website",
    "campaignId": "camp_123",
    "referralCode": "FITNESS2025"
  }
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Payment session created successfully",
  "data": {
    "transactionId": "TXN_20250120_123456789",
    "sessionId": "sess_123456789",
    "grossAmount": 2999,
    "netAmount": 2549.15,
    "currency": "INR",
    "gateway": "razorpay",
    "fees": {
      "platformFee": 299.90,
      "gatewayFee": 89.97,
      "taxAmount": 60.98,
      "netAmount": 2549.15
    },
    "commissionBreakdown": [
      {
        "recipientId": "65a1b2c3d4e5f6789012345d",
        "level": 1,
        "percentage": 10,
        "amount": 254.92,
        "status": "pending"
      }
    ],
    "paymentUrl": "https://checkout.razorpay.com/v1/checkout.js",
    "orderId": "order_123456789",
    "checkoutPage": {
      "pageId": "checkout_123",
      "configuration": {
        "theme": "fitness",
        "logo": "https://example.com/logo.png",
        "colors": {
          "primary": "#FF6B35",
          "secondary": "#004E89"
        }
      }
    },
    "expiresAt": "2025-01-20T13:00:00Z",
    "createdAt": "2025-01-20T12:00:00Z"
  }
}
```

### 2. Transaction Processing

#### Process Course Purchase
**POST** `/course-purchase`
- **Description**: Process course purchase transaction
- **Authentication**: Required
- **Request Body**:
```json
{
  "transactionId": "TXN_20250120_123456789",
  "paymentMethod": "card",
  "installmentPlan": {
    "enabled": true,
    "installments": 3,
    "interval": "monthly",
    "firstPayment": 999,
    "remainingPayments": [1000, 1000]
  },
  "customerDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Course purchase processed successfully",
  "data": {
    "transactionId": "TXN_20250120_123456789",
    "status": "completed",
    "paymentDetails": {
      "gatewayTransactionId": "pay_123456789",
      "paymentMethod": "card",
      "paymentStatus": "captured",
      "paidAt": "2025-01-20T12:05:00Z",
      "amount": 999
    },
    "installmentPlan": {
      "totalAmount": 2999,
      "installments": 3,
      "interval": "monthly",
      "nextPaymentDate": "2025-02-20T12:00:00Z",
      "remainingAmount": 2000
    },
    "commissionBreakdown": [
      {
        "recipientId": "65a1b2c3d4e5f6789012345d",
        "level": 1,
        "percentage": 10,
        "amount": 99.90,
        "status": "pending"
      }
    ],
    "courseAccess": {
      "courseId": "65a1b2c3d4e5f6789012345c",
      "accessGranted": true,
      "expiresAt": "2026-01-20T12:00:00Z"
    },
    "receipt": {
      "receiptNumber": "RCP_20250120_123456789",
      "downloadUrl": "https://example.com/receipts/RCP_20250120_123456789.pdf"
    }
  }
}
```

#### Process Subscription Payment
**POST** `/subscription-payment`
- **Description**: Process platform subscription payment
- **Authentication**: Required
- **Request Body**:
```json
{
  "planId": "65a1b2c3d4e5f6789012345e",
  "coachId": "65a1b2c3d4e5f6789012345b",
  "billingCycle": "monthly",
  "paymentMethod": "card",
  "autoRenew": true,
  "couponCode": "LAUNCH2025"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Subscription payment processed successfully",
  "data": {
    "subscriptionId": "SUB_20250120_123456789",
    "planId": "65a1b2c3d4e5f6789012345e",
    "planName": "Professional Plan",
    "amount": 79.99,
    "currency": "USD",
    "billingCycle": "monthly",
    "status": "active",
    "startDate": "2025-01-20T12:00:00Z",
    "endDate": "2025-02-20T12:00:00Z",
    "nextBillingDate": "2025-02-20T12:00:00Z",
    "autoRenew": true,
    "features": {
      "maxFunnels": 10,
      "maxLeads": 1000,
      "maxStaff": 5,
      "aiFeatures": true,
      "advancedAnalytics": true,
      "prioritySupport": true
    },
    "paymentDetails": {
      "gatewayTransactionId": "pay_123456790",
      "paymentMethod": "card",
      "paidAt": "2025-01-20T12:05:00Z"
    },
    "discountApplied": {
      "couponCode": "LAUNCH2025",
      "discountAmount": 15.99,
      "originalAmount": 95.98
    }
  }
}
```

#### Process Instant Payout
**POST** `/instant-payout`
- **Description**: Process instant payout to coach
- **Authentication**: Required
- **Request Body**:
```json
{
  "coachId": "65a1b2c3d4e5f6789012345b",
  "amount": 5000,
  "payoutMethod": "upi",
  "upiId": "coach@paytm",
  "reason": "commission_payout",
  "reference": "COMM_20250120_001"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Instant payout processed successfully",
  "data": {
    "payoutId": "PAYOUT_20250120_123456789",
    "coachId": "65a1b2c3d4e5f6789012345b",
    "amount": 5000,
    "currency": "INR",
    "payoutMethod": "upi",
    "upiId": "coach@paytm",
    "status": "processing",
    "fees": {
      "platformFee": 25,
      "gatewayFee": 15,
      "netAmount": 4960
    },
    "processingTime": "5-10 minutes",
    "reference": "COMM_20250120_001",
    "initiatedAt": "2025-01-20T12:00:00Z",
    "estimatedCompletion": "2025-01-20T12:10:00Z"
  }
}
```

### 3. Commission Management

#### Get Commission Calculator
**GET** `/commission-calculator?amount=10000&level=1&coachId=65a1b2c3d4e5f6789012345b`
- **Description**: Calculate MLM commission breakdown
- **Authentication**: Required
- **Query Parameters**:
  - `amount`: Transaction amount
  - `level`: MLM level
  - `coachId`: Coach ID for calculation
- **Response**:
```json
{
  "success": true,
  "data": {
    "transactionAmount": 10000,
    "currency": "INR",
    "commissionSettings": {
      "level1": 10,
      "level2": 5,
      "level3": 3,
      "level4": 2,
      "level5": 1
    },
    "commissionBreakdown": [
      {
        "level": 1,
        "percentage": 10,
        "amount": 1000,
        "recipientId": "65a1b2c3d4e5f6789012345d",
        "recipientName": "Jane Smith",
        "status": "eligible"
      },
      {
        "level": 2,
        "percentage": 5,
        "amount": 500,
        "recipientId": "65a1b2c3d4e5f6789012345e",
        "recipientName": "Mike Johnson",
        "status": "eligible"
      }
    ],
    "totalCommission": 1500,
    "netAmount": 8500,
    "platformFee": 1000,
    "taxAmount": 150,
    "calculationDate": "2025-01-20T12:00:00Z"
  }
}
```

### 4. Transaction Management

#### Get Transaction by ID
**GET** `/transaction/:transactionId`
- **Description**: Get transaction details by ID
- **Authentication**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "transactionId": "TXN_20250120_123456789",
    "transactionType": "course_purchase",
    "grossAmount": 2999,
    "netAmount": 2549.15,
    "currency": "INR",
    "gateway": "razorpay",
    "status": "completed",
    "sender": {
      "_id": "65a1b2c3d4e5f6789012345a",
      "name": "John Doe",
      "email": "john@example.com",
      "type": "customer"
    },
    "receiver": {
      "_id": "65a1b2c3d4e5f6789012345b",
      "name": "Coach Smith",
      "email": "coach@example.com",
      "type": "coach"
    },
    "product": {
      "_id": "65a1b2c3d4e5f6789012345c",
      "name": "30-Day Weight Loss Transformation",
      "type": "course",
      "description": "Complete weight loss program with meal plans and workouts"
    },
    "fees": {
      "platformFee": 299.90,
      "gatewayFee": 89.97,
      "taxAmount": 60.98,
      "netAmount": 2549.15
    },
    "commissionBreakdown": [
      {
        "recipientId": "65a1b2c3d4e5f6789012345d",
        "level": 1,
        "percentage": 10,
        "amount": 254.92,
        "status": "paid",
        "paidAt": "2025-01-20T12:10:00Z"
      }
    ],
    "paymentDetails": {
      "gatewayTransactionId": "pay_123456789",
      "paymentMethod": "card",
      "paymentStatus": "captured",
      "paidAt": "2025-01-20T12:05:00Z"
    },
    "createdAt": "2025-01-20T12:00:00Z",
    "updatedAt": "2025-01-20T12:10:00Z"
  }
}
```

#### Get Transactions by User
**GET** `/user/:userId?page=1&limit=10&type=all&status=completed`
- **Description**: Get transactions for specific user
- **Authentication**: Required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `type`: Transaction type filter
  - `status`: Transaction status filter
  - `startDate`: Start date filter
  - `endDate`: End date filter
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "transactionId": "TXN_20250120_123456789",
      "transactionType": "course_purchase",
      "grossAmount": 2999,
      "netAmount": 2549.15,
      "currency": "INR",
      "status": "completed",
      "productName": "30-Day Weight Loss Transformation",
      "createdAt": "2025-01-20T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "summary": {
    "totalTransactions": 25,
    "totalAmount": 75000,
    "completedAmount": 65000,
    "pendingAmount": 10000
  }
}
```

#### Get Transaction Statistics
**GET** `/statistics?period=30&coachId=65a1b2c3d4e5f6789012345b`
- **Description**: Get transaction statistics and analytics
- **Authentication**: Required
- **Query Parameters**:
  - `period`: Number of days for analysis (default: 30)
  - `coachId`: Coach ID for filtering
  - `type`: Transaction type filter
- **Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31",
      "days": 31
    },
    "summary": {
      "totalTransactions": 150,
      "totalAmount": 450000,
      "completedTransactions": 140,
      "completedAmount": 420000,
      "pendingTransactions": 8,
      "pendingAmount": 25000,
      "failedTransactions": 2,
      "failedAmount": 5000,
      "averageTransactionValue": 3000,
      "conversionRate": 93.3
    },
    "byType": [
      {
        "type": "course_purchase",
        "count": 80,
        "amount": 240000,
        "percentage": 53.3
      },
      {
        "type": "subscription_payment",
        "count": 50,
        "amount": 150000,
        "percentage": 33.3
      },
      {
        "type": "mlm_commission",
        "count": 20,
        "amount": 60000,
        "percentage": 13.3
      }
    ],
    "byStatus": [
      {
        "status": "completed",
        "count": 140,
        "amount": 420000,
        "percentage": 93.3
      },
      {
        "status": "pending",
        "count": 8,
        "amount": 25000,
        "percentage": 5.3
      },
      {
        "status": "failed",
        "count": 2,
        "amount": 5000,
        "percentage": 1.3
      }
    ],
    "byGateway": [
      {
        "gateway": "razorpay",
        "count": 100,
        "amount": 300000,
        "percentage": 66.7
      },
      {
        "gateway": "stripe",
        "count": 30,
        "amount": 90000,
        "percentage": 20.0
      },
      {
        "gateway": "paypal",
        "count": 20,
        "amount": 60000,
        "percentage": 13.3
      }
    ],
    "commissionStats": {
      "totalCommissions": 45000,
      "paidCommissions": 40000,
      "pendingCommissions": 5000,
      "averageCommissionRate": 10.7,
      "topEarners": [
        {
          "coachId": "65a1b2c3d4e5f6789012345d",
          "name": "Jane Smith",
          "commission": 15000,
          "transactions": 25
        }
      ]
    },
    "trends": {
      "dailyVolume": [15000, 18000, 12000, 22000, 19000],
      "weeklyGrowth": 15.2,
      "monthlyGrowth": 25.8,
      "peakDay": "Friday",
      "peakHour": "19:00-20:00"
    }
  }
}
```

### 5. Subscription Management

#### Get Subscription Plans
**GET** `/subscription-plans`
- **Description**: Get available subscription plans
- **Authentication**: None
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345e",
      "name": "Basic Plan",
      "description": "Perfect for getting started with fitness coaching",
      "price": {
        "amount": 29.99,
        "currency": "USD",
        "billingCycle": "monthly"
      },
      "features": {
        "maxFunnels": 5,
        "maxLeads": 1000,
        "maxStaff": 2,
        "maxAutomationRules": 10,
        "aiFeatures": false,
        "advancedAnalytics": false,
        "prioritySupport": false,
        "customDomain": false
      },
      "isActive": true,
      "isPopular": false,
      "sortOrder": 1
    },
    {
      "_id": "65a1b2c3d4e5f6789012345f",
      "name": "Professional Plan",
      "description": "Advanced features for growing fitness businesses",
      "price": {
        "amount": 79.99,
        "currency": "USD",
        "billingCycle": "monthly"
      },
      "features": {
        "maxFunnels": 10,
        "maxLeads": 2000,
        "maxStaff": 5,
        "maxAutomationRules": 25,
        "aiFeatures": true,
        "advancedAnalytics": true,
        "prioritySupport": true,
        "customDomain": false
      },
      "isActive": true,
      "isPopular": true,
      "sortOrder": 2
    },
    {
      "_id": "65a1b2c3d4e5f6789012345g",
      "name": "Enterprise Plan",
      "description": "Complete solution for established fitness businesses",
      "price": {
        "amount": 199.99,
        "currency": "USD",
        "billingCycle": "monthly"
      },
      "features": {
        "maxFunnels": -1,
        "maxLeads": -1,
        "maxStaff": -1,
        "maxAutomationRules": -1,
        "aiFeatures": true,
        "advancedAnalytics": true,
        "prioritySupport": true,
        "customDomain": true
      },
      "isActive": true,
      "isPopular": false,
      "sortOrder": 3
    }
  ]
}
```

### 6. Admin Management

#### Get Global Settings
**GET** `/settings`
- **Description**: Get global payment settings
- **Authentication**: Admin required
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012345h",
    "platformSettings": {
      "defaultCurrency": "USD",
      "supportedCurrencies": ["USD", "EUR", "GBP", "INR"],
      "platformFeePercentage": 10,
      "minimumTransactionAmount": 1,
      "maximumTransactionAmount": 100000
    },
    "gatewaySettings": {
      "razorpay": {
        "enabled": true,
        "keyId": "rzp_test_123456789",
        "webhookSecret": "webhook_secret_123",
        "feePercentage": 2.5,
        "supportedCurrencies": ["INR", "USD"]
      },
      "stripe": {
        "enabled": true,
        "publishableKey": "pk_test_123456789",
        "secretKey": "sk_test_123456789",
        "webhookSecret": "whsec_123456789",
        "feePercentage": 2.9,
        "supportedCurrencies": ["USD", "EUR", "GBP"]
      },
      "paypal": {
        "enabled": true,
        "clientId": "paypal_client_123",
        "clientSecret": "paypal_secret_123",
        "feePercentage": 3.4,
        "supportedCurrencies": ["USD", "EUR", "GBP"]
      }
    },
    "commissionSettings": {
      "mlmLevels": 12,
      "commissionRates": {
        "level1": 10,
        "level2": 5,
        "level3": 3,
        "level4": 2,
        "level5": 1,
        "level6": 0.5,
        "level7": 0.5,
        "level8": 0.5,
        "level9": 0.5,
        "level10": 0.5,
        "level11": 0.5,
        "level12": 0.5
      },
      "minimumCommissionAmount": 10,
      "maximumCommissionAmount": 10000
    },
    "taxSettings": {
      "gstEnabled": true,
      "gstRate": 18,
      "tdsEnabled": true,
      "tdsRate": 10,
      "taxCalculationMethod": "inclusive"
    },
    "payoutSettings": {
      "instantPayoutEnabled": true,
      "instantPayoutFee": 5,
      "minimumPayoutAmount": 100,
      "maximumPayoutAmount": 50000,
      "payoutProcessingTime": "5-10 minutes",
      "supportedPayoutMethods": ["upi", "bank_transfer", "paytm", "phonepe", "google_pay"]
    },
    "securitySettings": {
      "webhookVerification": true,
      "transactionEncryption": true,
      "auditLogging": true,
      "fraudDetection": true
    },
    "updatedAt": "2025-01-20T10:00:00Z"
  }
}
```

#### Update Global Settings
**PUT** `/settings`
- **Description**: Update global payment settings
- **Authentication**: Admin required
- **Request Body**:
```json
{
  "platformSettings": {
    "defaultCurrency": "USD",
    "platformFeePercentage": 12,
    "minimumTransactionAmount": 5
  },
  "commissionSettings": {
    "commissionRates": {
      "level1": 12,
      "level2": 6,
      "level3": 4
    }
  },
  "payoutSettings": {
    "instantPayoutFee": 7,
    "minimumPayoutAmount": 200
  }
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Global settings updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345h",
    "platformSettings": {
      "defaultCurrency": "USD",
      "platformFeePercentage": 12,
      "minimumTransactionAmount": 5
    },
    "commissionSettings": {
      "commissionRates": {
        "level1": 12,
        "level2": 6,
        "level3": 4
      }
    },
    "payoutSettings": {
      "instantPayoutFee": 7,
      "minimumPayoutAmount": 200
    },
    "updatedAt": "2025-01-20T11:00:00Z"
  }
}
```

### 7. Webhook Processing

#### Process Webhook
**POST** `/webhook/:gateway`
- **Description**: Process payment gateway webhooks
- **Authentication**: None (webhook verification required)
- **Request Body**: Gateway-specific webhook payload
- **Response**:
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "data": {
    "webhookId": "webhook_123456789",
    "gateway": "razorpay",
    "eventType": "payment.captured",
    "transactionId": "TXN_20250120_123456789",
    "status": "processed",
    "processedAt": "2025-01-20T12:05:00Z"
  }
}
```

## Payment Gateway Integration

### Supported Gateways
1. **Razorpay** - Primary gateway for Indian market
2. **Stripe** - International payments
3. **PayPal** - Global payment processing
4. **Bank Transfer** - Direct bank transfers
5. **UPI** - Unified Payments Interface

### Gateway Configuration
```javascript
{
  "razorpay": {
    "enabled": true,
    "keyId": "rzp_test_123456789",
    "webhookSecret": "webhook_secret_123",
    "feePercentage": 2.5,
    "supportedCurrencies": ["INR", "USD"],
    "features": ["cards", "upi", "netbanking", "wallet"]
  },
  "stripe": {
    "enabled": true,
    "publishableKey": "pk_test_123456789",
    "secretKey": "sk_test_123456789",
    "webhookSecret": "whsec_123456789",
    "feePercentage": 2.9,
    "supportedCurrencies": ["USD", "EUR", "GBP"],
    "features": ["cards", "ach", "sepa"]
  }
}
```

## Commission Calculation

### MLM Commission Structure
- **Level 1**: 10% commission
- **Level 2**: 5% commission
- **Level 3**: 3% commission
- **Level 4**: 2% commission
- **Level 5**: 1% commission
- **Levels 6-12**: 0.5% commission each

### Commission Calculation Example
```javascript
// Transaction Amount: ₹10,000
// Platform Fee (10%): ₹1,000
// Net Amount: ₹9,000

// Commission Breakdown:
// Level 1 (10%): ₹900
// Level 2 (5%): ₹450
// Level 3 (3%): ₹270
// Total Commission: ₹1,620
// Coach Receives: ₹7,380
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

- **Public Endpoints**: Health check, webhook processing
- **Authenticated Endpoints**: All transaction and management endpoints
- **Admin Endpoints**: Global settings management

## Rate Limiting

- **Transaction Endpoints**: 100 requests per hour
- **Analytics Endpoints**: 200 requests per hour
- **Webhook Endpoints**: 1000 requests per hour
- **Admin Endpoints**: 50 requests per hour

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **429**: Rate Limited
- **500**: Internal Server Error
