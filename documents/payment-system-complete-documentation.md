# 💳 Complete Payment System Documentation

## 📋 Overview

The FunnelsEye payment system is organized into three main components:

1. **🏪 Coach Sellables** - Products/plans that coaches can sell to customers
2. **💎 Platform Subscriptions** - Monthly/yearly subscriptions for coaches to access the platform
3. **💰 Automated Payouts** - Commission and payout management for the MLM system

---

## 🏪 1. COACH SELLABLES SYSTEM

### Overview
Coaches can create and sell their own products/plans to customers. This includes coaching programs, courses, consultations, etc.

### Admin Routes (Product Management)

#### Base URL: `/api/paymentsv1/admin/products`

| Method | Endpoint | Description | Access | Sample Request |
|--------|----------|-------------|--------|----------------|
| `POST` | `/` | Create new admin product | Admin | `{ "name": "Basic Coaching", "price": 999, "currency": "INR", "billingCycle": "monthly", "features": [...] }` |
| `GET` | `/` | Get all admin products | Admin | - |
| `GET` | `/available-for-coaches` | Get products available for coaches | Admin | - |
| `GET` | `/:productId` | Get product by ID | Admin | - |
| `PUT` | `/:productId` | Update product | Admin | `{ "name": "Updated Name", "price": 1299 }` |
| `DELETE` | `/:productId` | Delete product | Admin | - |
| `GET` | `/:productId/stats` | Get product statistics | Admin | - |
| `PUT` | `/:productId/status` | Update product status | Admin | `{ "status": "active" }` |

### Coach Routes (Plan Management)

#### Base URL: `/api/paymentsv1/coach/plans`

| Method | Endpoint | Description | Access | Sample Request |
|--------|----------|-------------|--------|----------------|
| `POST` | `/` | Create coach sellable plan | Coach | `{ "adminProductId": "product_id", "customizations": {...} }` |
| `GET` | `/` | Get coach's plans | Coach | - |
| `GET` | `/stats` | Get plan statistics | Coach | - |
| `GET` | `/:planId` | Get plan by ID | Coach | - |
| `PUT` | `/:planId` | Update plan | Coach | `{ "customizations": {...} }` |
| `DELETE` | `/:planId` | Delete plan | Coach | - |
| `PUT` | `/:planId/status` | Update plan status | Coach | `{ "status": "active" }` |

### Public Routes (Customer Purchase)

#### Base URL: `/api/paymentsv1/public/plans`

| Method | Endpoint | Description | Access | Sample Request |
|--------|----------|-------------|--------|----------------|
| `GET` | `/` | Get public sellable plans | Public | - |
| `GET` | `/:planId/details` | Get plan details for purchase | Public | - |

### Payment Processing

#### Base URL: `/api/paymentsv1/payments`

| Method | Endpoint | Description | Access | Sample Request |
|--------|----------|-------------|--------|----------------|
| `POST` | `/create-razorpay-order` | Create Razorpay order | Public | `{ "amount": 999, "currency": "INR", "receipt": "order_123" }` |
| `POST` | `/coach-plan/create-order` | Create order for coach plan | Public | `{ "planId": "plan_id", "customerInfo": {...} }` |
| `POST` | `/verify` | Verify Razorpay payment | Public | `{ "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }` |
| `GET` | `/:paymentId` | Get payment by ID | Private | - |
| `GET` | `/user/:userId` | Get payments by user | Private | - |
| `POST` | `/:paymentId/refund` | Process refund | Private | `{ "amount": 500, "reason": "Customer request" }` |
| `POST` | `/webhook` | Handle Razorpay webhook | Public | Razorpay webhook data |

### Checkout System

#### Base URL: `/api/paymentsv1/checkout`

| Method | Endpoint | Description | Access | Sample Request |
|--------|----------|-------------|--------|----------------|
| `GET` | `/coach-plan/:planId` | Get checkout data for coach plan | Public | - |
| `GET` | `/subscription` | Get checkout data for subscription | Public | - |
| `POST` | `/complete` | Process checkout completion | Public | `{ "paymentId": "...", "orderId": "..." }` |
| `GET` | `/payment-history/:userId` | Get payment history | Private | - |
| `POST` | `/generate-url` | Generate checkout page URL | Public | `{ "planId": "plan_id", "type": "coach-plan" }` |

---

## 💎 2. PLATFORM SUBSCRIPTION SYSTEM

### Overview
Coaches need to subscribe to the platform to access premium features. This is a recurring subscription system.

### Subscription Routes

#### Base URL: `/api/subscriptions`

| Method | Endpoint | Description | Access | Sample Request |
|--------|----------|-------------|--------|----------------|
| `GET` | `/plans` | Get available subscription plans | Public | - |
| `GET` | `/current` | Get current subscription | Coach | - |
| `POST` | `/create-order` | Create subscription order | Coach | `{ "planId": "plan_id" }` |
| `POST` | `/verify-payment` | Verify subscription payment | Coach | `{ "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }` |
| `POST` | `/cancel` | Cancel subscription | Coach | `{ "reason": "No longer needed" }` |
| `GET` | `/history` | Get subscription history | Coach | - |

### Admin Subscription Management

#### Base URL: `/api/admin/financial`

| Method | Endpoint | Description | Access | Sample Request |
|--------|----------|-------------|--------|----------------|
| `GET` | `/payment-settings` | Get payment settings | Admin | - |
| `PUT` | `/payment-settings` | Update payment settings | Admin | `{ "razorpayKeyId": "...", "razorpayKeySecret": "..." }` |
| `GET` | `/payment-gateways` | Get gateway configurations | Admin | - |
| `PUT` | `/payment-gateways/:gatewayName` | Update gateway config | Admin | `{ "isActive": true, "settings": {...} }` |
| `POST` | `/payment-gateways/:gatewayName/test` | Test payment gateway | Admin | - |
| `GET` | `/payment-analytics` | Get payment analytics | Admin | - |

### Subscription Plans Management

#### Admin Product Routes (for subscription plans)

| Method | Endpoint | Description | Access | Sample Request |
|--------|----------|-------------|--------|----------------|
| `POST` | `/api/paymentsv1/admin/products` | Create subscription plan | Admin | `{ "name": "Starter", "price": 999, "billingCycle": "monthly", "type": "subscription" }` |
| `GET` | `/api/paymentsv1/admin/products` | Get all subscription plans | Admin | - |
| `PUT` | `/api/paymentsv1/admin/products/:id` | Update subscription plan | Admin | `{ "price": 1299 }` |

---

## 💰 3. AUTOMATED PAYOUTS SYSTEM

### Overview
Automated commission calculation and payout system for the MLM hierarchy. Handles commission distribution based on coach levels and sales.

### Commission Management

#### Base URL: `/api/advanced-mlm`

| Method | Endpoint | Description | Access | Sample Request |
|--------|----------|-------------|--------|----------------|
| `POST` | `/calculate-subscription-commission` | Calculate commission for subscription | Admin | `{ "subscriptionId": "sub_id", "coachId": "coach_id" }` |
| `GET` | `/commissions/:coachId` | Get coach commissions | Coach/Admin | - |
| `GET` | `/admin/commission-settings` | Get commission settings | Admin | - |
| `PUT` | `/admin/commission-settings` | Update commission settings | Admin | `{ "levels": [...], "percentages": [...] }` |
| `POST` | `/admin/calculate-commission` | Calculate and create commission | Admin | `{ "saleId": "sale_id", "amount": 1000 }` |
| `POST` | `/admin/process-monthly-commissions` | Process monthly payouts | Admin | `{ "month": "2024-01" }` |

### Payout Processing

#### Base URL: `/api/admin/financial`

| Method | Endpoint | Description | Access | Sample Request |
|--------|----------|-------------|--------|----------------|
| `GET` | `/commission-payouts` | Get commission payouts | Admin | - |
| `POST` | `/commission-payouts/:paymentId/process` | Process commission payout | Admin | `{ "method": "bank_transfer", "accountDetails": {...} }` |

### Coach Payment Management

#### Base URL: `/api/coach-payments`

| Method | Endpoint | Description | Access | Sample Request |
|--------|----------|-------------|--------|----------------|
| `POST` | `/setup-payment-collection` | Setup payment collection | Coach | `{ "bankAccount": {...}, "upiId": "..." }` |
| `GET` | `/payment-settings` | Get payment settings | Coach | - |
| `POST` | `/create-payment` | Create payment for coach | Admin | `{ "coachId": "coach_id", "amount": 1000, "description": "Commission" }` |
| `GET` | `/my-payments` | Get coach's payments | Coach | - |
| `GET` | `/coach-payments/:coachId` | Get coach payments (Admin) | Admin | - |
| `POST` | `/process-payment` | Process payment | Coach/Admin | `{ "paymentId": "payment_id", "method": "bank_transfer" }` |

### Analytics & Reporting

#### Base URL: `/api/admin/financial`

| Method | Endpoint | Description | Access | Sample Request |
|--------|----------|-------------|--------|----------------|
| `GET` | `/revenue-analytics` | Get revenue analytics | Admin | - |
| `GET` | `/payment-failures` | Get payment failure analytics | Admin | - |
| `GET` | `/gateway-markup` | Get gateway markup analytics | Admin | - |
| `GET` | `/credit-usage` | Get credit usage analytics | Admin | - |
| `GET` | `/payment-analytics` | Get comprehensive payment analytics | Admin | - |

---

## 🔧 Configuration & Setup

### Environment Variables

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# Database
MONGODB_URI=mongodb://localhost:27017/FunnelsEye

# Server
PORT=3000
NODE_ENV=development
```

### Database Schemas

#### CoachSubscription
```javascript
{
  coachId: ObjectId, // Unique - one subscription per coach
  planId: ObjectId,
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'trial',
  startDate: Date,
  endDate: Date,
  nextBillingDate: Date,
  autoRenew: Boolean,
  paymentHistory: [{
    paymentId: String,
    amount: Number,
    currency: String,
    paymentMethod: String,
    paymentDate: Date,
    status: 'success' | 'failed' | 'pending' | 'refunded',
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
  }],
  cancellationDate: Date,
  cancellationReason: String
}
```

#### AdminProduct
```javascript
{
  name: String,
  description: String,
  price: Number,
  currency: String,
  billingCycle: 'monthly' | 'yearly' | 'one-time',
  duration: Number, // in months
  features: [String],
  setupFee: Number,
  trialDays: Number,
  status: 'active' | 'inactive' | 'draft',
  type: 'subscription' | 'product'
}
```

#### CoachSellablePlan
```javascript
{
  coachId: ObjectId,
  adminProductId: ObjectId,
  planId: String, // Auto-generated
  customizations: {
    name: String,
    description: String,
    price: Number,
    features: [String]
  },
  status: 'draft' | 'active' | 'inactive',
  isPublic: Boolean,
  storeUrl: String, // Auto-generated
  salesCount: Number,
  revenue: Number
}
```

---

## 🚀 Quick Start Guide

### 1. Setup Admin Products
```bash
# Create subscription plans
POST /api/paymentsv1/admin/products
{
  "name": "Starter Plan",
  "price": 999,
  "currency": "INR",
  "billingCycle": "monthly",
  "duration": 1,
  "features": ["Basic coaching", "Email support"],
  "type": "subscription"
}
```

### 2. Coach Creates Sellable Plan
```bash
# Coach creates plan from admin product
POST /api/paymentsv1/coach/plans
{
  "adminProductId": "admin_product_id",
  "customizations": {
    "name": "My Coaching Program",
    "price": 1299,
    "features": ["1-on-1 sessions", "Custom meal plans"]
  }
}
```

### 3. Customer Purchases Plan
```bash
# Customer visits store page
GET /store/{planId}

# Creates payment order
POST /api/paymentsv1/payments/coach-plan/create-order
{
  "planId": "coach_plan_id",
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 4. Process Commission Payouts
```bash
# Calculate commissions
POST /api/advanced-mlm/admin/calculate-commission
{
  "saleId": "sale_id",
  "amount": 1000
}

# Process monthly payouts
POST /api/advanced-mlm/admin/process-monthly-commissions
{
  "month": "2024-01"
}
```

---

## 🔒 Security & Authentication

### Authentication Levels
- **Public**: No authentication required (customer purchases)
- **Coach**: JWT token required (coach operations)
- **Admin**: Admin JWT token required (system management)

### Rate Limiting
- Admin operations: 10-20 requests per 5-15 minutes
- Coach operations: Standard rate limiting
- Public operations: Higher limits for customer convenience

### Webhook Security
- Razorpay webhooks verified using signature validation
- All webhook endpoints use proper authentication

---

## 📊 Monitoring & Analytics

### Key Metrics Tracked
- Revenue by product type
- Payment success/failure rates
- Commission distribution
- Coach performance
- Customer acquisition costs

### Available Reports
- Revenue analytics
- Payment failure analysis
- Commission payout reports
- Coach performance metrics
- Gateway performance metrics

---

## 🛠️ Troubleshooting

### Common Issues
1. **Payment failures**: Check Razorpay credentials and webhook configuration
2. **Commission calculation errors**: Verify MLM hierarchy and settings
3. **Subscription issues**: Check unique constraint on coachId
4. **Webhook failures**: Verify signature validation and endpoint URLs

### Debug Endpoints
- `GET /api/paymentsv1/health` - System health check
- `GET /api/admin/financial/payment-gateways` - Gateway status
- `GET /api/subscriptions/current` - Current subscription status

---

## 📝 API Testing

### Test Payment Flow
1. Create admin product
2. Create coach plan
3. Generate store URL
4. Create payment order
5. Verify payment
6. Check commission calculation

### Test Subscription Flow
1. Get available plans
2. Create subscription order
3. Process payment
4. Verify subscription activation
5. Test cancellation

### Test Payout Flow
1. Setup coach payment collection
2. Create commission
3. Process payout
4. Verify payment status

---

This documentation covers all three payment system components with their respective routes, authentication requirements, and usage examples. The system is designed to handle the complete payment lifecycle from product creation to commission payouts.
