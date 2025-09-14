# 💰 Financial Management System Documentation

## Overview

The Financial Management System provides comprehensive financial control for both coaches and administrators, with full Razorpay integration, MLM commission management, and automated payout processing.

## 🏗️ System Architecture

### Core Components

1. **Razorpay Service** (`services/razorpayService.js`)
   - Account balance management
   - UPI and bank transfer payouts
   - Payment and refund processing
   - MLM commission calculations

2. **Coach Financial Controller** (`controllers/coachFinancialController.js`)
   - Revenue analytics and tracking
   - Payment history management
   - Manual and automatic payouts
   - MLM commission tracking

3. **Admin Financial Controller** (`controllers/adminFinancialController.js`)
   - Razorpay account management
   - MLM commission structure configuration
   - Platform fee management
   - Financial analytics dashboard

4. **Frontend Components**
   - `FinancialManagement.jsx` - Admin financial management interface
   - `CoachFinancialDashboard.jsx` - Coach financial dashboard

## 🔧 API Endpoints

### Admin Financial Management

#### 📊 Financial Analytics Dashboard
```http
GET /api/admin/financial/analytics-dashboard?timeRange=30
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRevenue": 50000,
      "activeSubscriptions": 150,
      "totalCommissionsPaid": 15000,
      "totalPayouts": 12000,
      "platformFeesCollected": 2500,
      "netProfit": 1000
    },
    "razorpayAccount": {
      "balance": {
        "available": 25000,
        "pending": 5000
      },
      "currency": "INR",
      "accountName": "Platform Account"
    },
    "timeRange": 30,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

#### 🏦 Razorpay Account Management
```http
GET /api/admin/financial/razorpay-account
```

**Response:**
```json
{
  "success": true,
  "data": {
    "account": {
      "id": "acc_123456789",
      "name": "Platform Account",
      "balance": {
        "available": 25000,
        "pending": 5000
      },
      "currency": "INR"
    },
    "recentActivity": {
      "payments": [
        {
          "id": "pay_123456789",
          "amount": 1000,
          "status": "captured",
          "created_at": 1705312200
        }
      ],
      "payouts": [
        {
          "id": "pout_123456789",
          "amount": 500,
          "status": "processed",
          "created_at": 1705312200
        }
      ]
    }
  }
}
```

#### 🎯 Update MLM Commission Structure
```http
PUT /api/admin/financial/mlm-commission-structure
```

**Request Body:**
```json
{
  "levels": [
    {
      "level": 1,
      "percentage": 10
    },
    {
      "level": 2,
      "percentage": 5
    },
    {
      "level": 3,
      "percentage": 3
    }
  ],
  "platformFeePercentage": 5,
  "maxLevels": 3,
  "autoPayoutEnabled": true,
  "payoutThreshold": 100
}
```

#### ⚡ Process MLM Commission
```http
POST /api/admin/financial/process-mlm-commission
```

**Request Body:**
```json
{
  "subscriptionId": "sub_123456789",
  "subscriptionAmount": 1000,
  "coachId": "coach_123456789"
}
```

#### 💳 Platform Fee Management
```http
GET /api/admin/financial/platform-fees
PUT /api/admin/financial/platform-fees
```

**Request Body:**
```json
{
  "subscriptionFee": 5.0,
  "transactionFee": 2.0,
  "payoutFee": 1.0,
  "refundFee": 0.5
}
```

### Coach Financial Management

#### 📈 Revenue Analytics
```http
GET /api/coach/financial/revenue?timeRange=30&period=daily
```

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 25000,
      "monthly": 15000,
      "yearly": 10000,
      "byPeriod": [
        {
          "date": "2024-01-15",
          "amount": 1000
        }
      ]
    },
    "commissions": {
      "total": 2500,
      "count": 15,
      "breakdown": [
        {
          "level": 1,
          "percentage": 10,
          "amount": 100,
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ]
    },
    "metrics": {
      "totalSubscriptions": 25,
      "averageRevenuePerSubscription": 1000,
      "timeRange": 30,
      "period": "daily"
    }
  }
}
```

#### 💳 Payment History
```http
GET /api/coach/financial/payments?page=1&limit=20&status=active
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "sub_123456789",
        "amount": 1000,
        "status": "active",
        "paymentMethod": "razorpay",
        "createdAt": "2024-01-15T10:30:00Z",
        "plan": "Premium Plan",
        "customer": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "razorpayPaymentId": "pay_123456789"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### 🏦 Account Balance
```http
GET /api/coach/financial/balance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 25000,
    "currency": "INR",
    "accountId": "acc_123456789",
    "accountName": "Coach Account",
    "availableForPayout": 20000
  }
}
```

#### 💰 Create Manual Payout
```http
POST /api/coach/financial/payout
```

**Request Body (UPI):**
```json
{
  "amount": 1000,
  "payoutMethod": "UPI",
  "upiId": "coach@paytm",
  "notes": "Monthly payout"
}
```

**Request Body (Bank Transfer):**
```json
{
  "amount": 2000,
  "payoutMethod": "BANK",
  "bankAccount": {
    "accountHolderName": "John Doe",
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234"
  },
  "notes": "Bank transfer payout"
}
```

#### 📋 Payout History
```http
GET /api/coach/financial/payouts?page=1&limit=20&status=processed
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": "pout_123456789",
        "amount": 1000,
        "status": "processed",
        "mode": "UPI",
        "purpose": "Manual Payout",
        "createdAt": "2024-01-15T10:30:00Z",
        "processedAt": "2024-01-15T11:00:00Z",
        "referenceId": "MANUAL_coach_123_456",
        "narration": "Monthly payout"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### ⚙️ Update Payout Settings
```http
PUT /api/coach/financial/payout-settings
```

**Request Body:**
```json
{
  "autoPayoutEnabled": true,
  "payoutMethod": "UPI",
  "upiId": "coach@paytm",
  "minimumAmount": 500,
  "payoutFrequency": "weekly",
  "commissionPercentage": 10
}
```

#### 🎯 MLM Commission Structure
```http
GET /api/coach/financial/mlm-commission
```

**Response:**
```json
{
  "success": true,
  "data": {
    "commissionStructure": {
      "levels": [
        {
          "level": 1,
          "percentage": 10
        },
        {
          "level": 2,
          "percentage": 5
        }
      ],
      "platformFeePercentage": 5,
      "maxLevels": 3
    },
    "commissionHistory": [
      {
        "subscriptionId": "sub_123456789",
        "recipientId": "coach_123456789",
        "level": 1,
        "percentage": 10,
        "amount": 100,
        "platformFee": 50,
        "netAmount": 950,
        "status": "paid",
        "payoutId": "pout_123456789",
        "paidAt": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "totalCommissionsEarned": 2500
  }
}
```

#### 👥 Payout to Another Coach
```http
POST /api/coach/financial/payout-to-coach
```

**Request Body:**
```json
{
  "targetCoachId": "target_coach_id_here",
  "amount": 500,
  "notes": "Commission payout"
}
```

#### 🔄 Refund History
```http
GET /api/coach/financial/refunds?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refunds": [
      {
        "id": "refund_123456789",
        "amount": 500,
        "status": "processed",
        "reason": "Customer request",
        "refundId": "rfnd_123456789",
        "createdAt": "2024-01-15T10:30:00Z",
        "originalPayment": {
          "amount": 1000,
          "plan": "Premium Plan",
          "customer": {
            "name": "John Doe",
            "email": "john@example.com"
          }
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 🎯 MLM Commission System

### Commission Structure

The MLM commission system calculates commissions based on platform subscriptions only, with the following structure:

```json
{
  "levels": [
    {
      "level": 1,
      "percentage": 10
    },
    {
      "level": 2,
      "percentage": 5
    },
    {
      "level": 3,
      "percentage": 3
    }
  ],
  "platformFeePercentage": 5,
  "maxLevels": 3,
  "autoPayoutEnabled": true,
  "payoutThreshold": 100
}
```

### Commission Calculation

1. **Platform Fee Deduction**: `platformFee = subscriptionAmount * platformFeePercentage / 100`
2. **Net Amount**: `netAmount = subscriptionAmount - platformFee`
3. **Commission Calculation**: `commissionAmount = netAmount * levelPercentage / 100`
4. **Automatic Payout**: If `totalCommission >= payoutThreshold` and `autoPayoutEnabled = true`

### Example Calculation

For a ₹1000 subscription with 5% platform fee and 10% Level 1 commission:

- Platform Fee: ₹1000 × 5% = ₹50
- Net Amount: ₹1000 - ₹50 = ₹950
- Level 1 Commission: ₹950 × 10% = ₹95
- Remaining Amount: ₹950 - ₹95 = ₹855

## 💳 Platform Fee Structure

### Default Fees

- **Subscription Fee**: 5% of subscription amount
- **Transaction Fee**: 2% per transaction
- **Payout Fee**: 1% per payout
- **Refund Fee**: 0.5% per refund

### Fee Calculation

```javascript
const platformFee = (amount * feePercentage) / 100;
const netAmount = amount - platformFee;
```

## 🔐 Security Features

### Authentication & Authorization

- **JWT Tokens**: All endpoints require valid JWT tokens
- **Role-Based Access**: Admin vs Coach permissions
- **Token Validation**: Middleware validates tokens on each request

### Data Protection

- **Encrypted Storage**: Sensitive data encrypted using AES-256-CBC
- **Webhook Verification**: Razorpay webhook signature verification
- **Balance Validation**: Payout amount validation against available balance

### Audit Logging

- **Transaction History**: Complete audit trail for all financial operations
- **Commission Tracking**: Detailed commission distribution records
- **Payout Logging**: Full payout history with status tracking

## 🚀 Frontend Integration

### Admin Financial Management

The `FinancialManagement.jsx` component provides:

- **Dashboard Overview**: Key financial metrics and charts
- **Razorpay Account Management**: Balance monitoring and transaction history
- **MLM Commission Configuration**: Commission structure setup
- **Platform Fee Management**: Fee configuration interface
- **Financial Analytics**: Comprehensive reporting dashboard

### Coach Financial Dashboard

The `CoachFinancialDashboard.jsx` component provides:

- **Revenue Analytics**: Revenue tracking with charts and trends
- **Payment History**: Complete transaction history
- **Payout Management**: Manual and automatic payout controls
- **Commission Tracking**: MLM commission structure and history
- **Refund Management**: Refund history and processing

## 📊 Analytics & Reporting

### Key Metrics

- **Total Revenue**: Sum of all subscription payments
- **Active Subscriptions**: Currently active subscription count
- **Commissions Paid**: Total MLM commission distributions
- **Platform Fees Collected**: Total platform fee revenue
- **Net Profit**: Platform fees minus commissions paid

### Reporting Features

- **Time Range Filtering**: 7, 30, 90, 365 days
- **Period Grouping**: Daily, weekly, monthly
- **Export Options**: CSV, PDF export capabilities
- **Real-time Updates**: Live data refresh functionality

## 🔧 Configuration

### Environment Variables

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_ACCOUNT_NUMBER=your_account_number
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/platform_db

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
```

### Database Schemas

#### MlmCommissionDistribution
```javascript
{
  subscriptionId: ObjectId,
  recipientId: ObjectId,
  level: Number,
  percentage: Number,
  amount: Number,
  platformFee: Number,
  netAmount: Number,
  status: String, // 'pending', 'paid', 'failed', 'cancelled'
  payoutId: String,
  paidAt: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚨 Error Handling

### Common Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Error Codes

- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Invalid or missing token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **500**: Internal Server Error - Server-side error

## 📱 Mobile Responsiveness

Both frontend components are fully responsive and optimized for:

- **Desktop**: Full feature set with advanced layouts
- **Tablet**: Optimized layouts with touch-friendly controls
- **Mobile**: Streamlined interface with essential features

## 🔄 API Rate Limiting

- **Admin Endpoints**: 100 requests per hour
- **Coach Endpoints**: 200 requests per hour
- **Financial Operations**: 50 requests per hour

## 📈 Performance Optimization

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis caching for frequently accessed data
- **Pagination**: Efficient data loading with pagination
- **Lazy Loading**: On-demand data loading for better performance

## 🧪 Testing

### Test Coverage

- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: Complete workflow testing
- **Performance Tests**: Load and stress testing

### Test Data

Use the provided Postman collection for comprehensive API testing with sample data and responses.

## 📚 Additional Resources

- **Postman Collection**: `Financial_Management_API_Postman_Collection.json`
- **API Documentation**: Complete endpoint documentation
- **Frontend Components**: React components with TypeScript support
- **Database Schemas**: MongoDB schema definitions

## 🆘 Support

For technical support or questions about the Financial Management System:

1. Check the API documentation for endpoint details
2. Use the Postman collection for testing
3. Review error logs for troubleshooting
4. Contact the development team for advanced issues

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Production Ready
