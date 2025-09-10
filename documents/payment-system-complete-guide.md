# Complete Payment System Guide

## Overview

The Payment System is a comprehensive solution built for the FunnelsEye platform that enables coaches to sell products and services while handling platform subscriptions and MLM commission payments. The system is built with Razorpay integration and provides a complete checkout experience with AI-powered optimization.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Setup & Configuration](#setup--configuration)
3. [API Endpoints](#api-endpoints)
4. [Frontend Integration](#frontend-integration)
5. [Testing Guide](#testing-guide)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

## System Architecture

### Core Features

#### 1. Admin Product Management
- Create and manage products that coaches can sell
- Set pricing rules and commission structures
- Control product availability for coaches
- Track product performance and sales

#### 2. Coach Sellable Plans
- Coaches can create custom plans based on admin products
- Set their own pricing within admin-defined limits
- Add custom features and content
- Manage plan visibility and status

#### 3. Razorpay Payment Integration
- Secure payment processing with Razorpay
- Support for multiple payment methods (cards, UPI, net banking, wallets)
- Webhook handling for payment status updates
- Refund processing

#### 4. Checkout Page System
- Dynamic checkout pages for coach plans
- Platform subscription checkout
- Payment verification and completion handling
- Customer payment history

#### 5. MLM Commission System
- Automatic commission calculation and distribution
- Platform commission tracking
- Coach commission tracking
- MLM hierarchy support

### Database Schemas

#### AdminProduct
```javascript
{
  productId: String,           // Unique product identifier
  name: String,                // Product name
  description: String,          // Detailed description
  category: String,             // Product category
  productType: String,          // digital, physical, service, subscription
  basePrice: Number,            // Base price coaches can use
  currency: String,             // Currency code
  pricingRules: {               // Pricing constraints for coaches
    allowCustomPricing: Boolean,
    minPrice: Number,
    maxPrice: Number,
    suggestedMarkup: Number
  },
  features: Array,              // Product features
  contentFiles: Array,          // Digital content files
  videoContent: Array,          // Video content
  commissionSettings: {         // Commission structure
    platformCommissionPercentage: Number,
    coachCommissionPercentage: Number
  },
  status: String,               // draft, active, inactive, archived
  isAvailableForCoaches: Boolean
}
```

#### CoachSellablePlan
```javascript
{
  planId: String,               // Unique plan identifier
  coachId: ObjectId,            // Reference to coach
  adminProductId: ObjectId,      // Reference to admin product
  title: String,                // Coach's custom title
  description: String,           // Coach's custom description
  price: Number,                // Coach's selling price
  currency: String,             // Currency
  additionalFeatures: Array,    // Coach's additional features
  additionalContentFiles: Array, // Coach's additional content
  additionalVideoContent: Array, // Coach's additional videos
  customTermsAndConditions: String,
  customRefundPolicy: String,
  status: String,               // draft, active, paused, archived, deleted
  isPublic: Boolean,            // Public visibility
  totalSales: Number,           // Sales count
  totalRevenue: Number,         // Total revenue
  commissionEarned: Number,     // Coach's commission
  platformCommissionPaid: Number // Platform commission
}
```

#### RazorpayPayment
```javascript
{
  razorpayPaymentId: String,    // Razorpay payment ID
  razorpayOrderId: String,      // Razorpay order ID
  razorpaySignature: String,    // Payment signature
  amount: Number,               // Payment amount
  currency: String,             // Currency
  status: String,               // created, authorized, captured, refunded, failed
  businessType: String,         // coach_plan_purchase, platform_subscription, mlm_commission
  userId: ObjectId,             // Customer/coach ID
  userType: String,             // customer, coach, admin, system
  planId: ObjectId,             // Reference to coach plan
  productId: ObjectId,          // Reference to admin product
  coachId: ObjectId,            // Coach ID
  commissionAmount: Number,     // Commission amount
  platformCommission: Number,   // Platform commission
  coachCommission: Number,      // Coach commission
  paymentMethod: String,        // card, netbanking, wallet, upi
  razorpayResponse: Object,     // Full Razorpay response
  refunds: Array               // Refund records
}
```

## Setup & Configuration

### Prerequisites

#### 1. Razorpay Account Setup
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in to your account
3. Go to **Settings** → **API Keys**
4. Copy your **Key ID** and **Key Secret**
5. For testing, use **Test Mode** keys (they start with `rzp_test_`)
6. For production, use **Live Mode** keys (they start with `rzp_live_`)

#### 2. Webhook Configuration
1. Go to **Settings** → **Webhooks**
2. Create a new webhook with URL: `https://yourdomain.com/api/paymentsv1/payments/webhook`
3. Copy the **Webhook Secret**

#### 3. Environment Variables
Create a `.env` file with the following variables:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Or use BASE_URL as fallback
BASE_URL=http://localhost:3000
```

#### 4. Installation
```bash
npm install razorpay crypto
```

### Testing the Configuration

#### Method 1: Check Server Logs
When you start the server, you should see:
```
[RazorpayPaymentController] Razorpay initialized successfully
```

#### Method 2: Test API Endpoint
```bash
curl -X POST http://localhost:3000/api/paymentsv1/payments/coach-plan/create-order \
  -H "Content-Type: application/json" \
  -d '{"planId": "test", "customerId": "test"}'
```

## API Endpoints

### Admin Product Management

#### Create Admin Product
```http
POST /api/paymentsv1/admin/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Fitness Training Program",
  "description": "Complete fitness program",
  "category": "fitness_training",
  "productType": "digital",
  "basePrice": 2999,
  "currency": "INR",
  "pricingRules": {
    "allowCustomPricing": true,
    "minPrice": 1999,
    "maxPrice": 4999
  },
  "features": [
    {"title": "12-week program", "description": "Structured workout plans"}
  ],
  "commissionSettings": {
    "platformCommissionPercentage": 10,
    "coachCommissionPercentage": 80
  }
}
```

#### Get All Admin Products
```http
GET /api/paymentsv1/admin/products?page=1&limit=20&status=active&category=fitness_training
Authorization: Bearer <admin-token>
```

### Coach Plan Management

#### Create Coach Sellable Plan
```http
POST /api/paymentsv1/coach/plans
Authorization: Bearer <coach-token>
Content-Type: application/json

{
  "adminProductId": "ADMIN_PROD_1234567890_abc123def",
  "title": "Premium Fitness Transformation",
  "description": "My personalized fitness program",
  "price": 3999,
  "additionalFeatures": [
    {"title": "Personal coaching calls", "description": "Weekly 1-on-1 sessions"}
  ],
  "customTermsAndConditions": "30-day money-back guarantee"
}
```

#### Get Coach's Plans
```http
GET /api/paymentsv1/coach/plans?page=1&limit=20&status=active
Authorization: Bearer <coach-token>
```

### Payment Processing

#### Create Coach Plan Order
```http
POST /api/paymentsv1/payments/coach-plan/create-order
Content-Type: application/json

{
  "planId": "COACH_PLAN_1234567890_abc123def",
  "customerId": "customer_123",
  "customerEmail": "customer@example.com",
  "customerPhone": "+919876543210"
}
```

#### Create Subscription Order
```http
POST /api/paymentsv1/payments/subscription/create-order
Content-Type: application/json

{
  "coachId": "coach_123",
  "subscriptionPlan": "professional",
  "amount": 999,
  "billingCycle": "monthly",
  "customerEmail": "coach@example.com",
  "customerPhone": "+919876543210"
}
```

#### Verify Payment
```http
POST /api/paymentsv1/payments/verify
Content-Type: application/json

{
  "razorpay_order_id": "order_123",
  "razorpay_payment_id": "pay_123",
  "razorpay_signature": "signature_123"
}
```

#### Process Refund
```http
POST /api/paymentsv1/payments/{paymentId}/refund
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "amount": 1999,
  "reason": "Customer requested refund"
}
```

### Checkout Page System

#### Get Coach Plan Checkout Data
```http
GET /api/paymentsv1/checkout/coach-plan/{planId}?customerId=customer_123&customerEmail=customer@example.com&customerPhone=+919876543210
```

#### Get Subscription Checkout Data
```http
GET /api/paymentsv1/checkout/subscription?coachId=coach_123&subscriptionPlan=professional&billingCycle=monthly&amount=999
```

#### Process Checkout Completion
```http
POST /api/paymentsv1/checkout/complete
Content-Type: application/json

{
  "orderId": "order_123",
  "paymentId": "pay_123",
  "signature": "signature_123",
  "planId": "COACH_PLAN_1234567890_abc123def",
  "customerId": "customer_123",
  "businessType": "coach_plan_purchase"
}
```

### Webhook Handling

#### Razorpay Webhook
```http
POST /api/paymentsv1/payments/webhook
Content-Type: application/json
X-Razorpay-Signature: <signature>

{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_123",
        "amount": 399900,
        "currency": "INR",
        "status": "captured",
        "method": "card"
      }
    }
  }
}
```

## Frontend Integration

### Payment Page Setup

#### Option 1: Create Frontend Route (Recommended)

**For Next.js:**
1. Create file: `pages/checkout/payment.js`
2. Copy content from `documents/frontend-payment-page-example.jsx`
3. Add your Razorpay key to environment variables

**For React Router:**
1. Create file: `src/pages/checkout/payment.jsx`
2. Add route: `<Route path="/checkout/payment" component={PaymentPage} />`
3. Copy content from `documents/frontend-payment-page-example.jsx`

**For Vue.js:**
1. Create file: `src/views/checkout/payment.vue`
2. Add route: `{ path: '/checkout/payment', component: PaymentPage }`
3. Adapt the React example to Vue syntax

#### Option 2: Simple HTML File (Quick Test)

1. Create file: `public/checkout/payment.html`
2. Copy content from `documents/simple-payment-page.html`
3. Replace `RAZORPAY_KEY_ID` with your actual key
4. Access via: `http://localhost:8080/checkout/payment.html`

### Payment Redirect Implementation

#### Direct Redirect
```javascript
// After creating order
const response = await fetch('/api/paymentsv1/razorpay/create-coach-plan-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    planId: '68bf0641c89e4507d10888f6',
    customerId: 'test_customer_123',
    customerEmail: 'customer@example.com',
    customerPhone: '+919876543210'
  })
});

const data = await response.json();

if (data.success) {
  // Redirect to payment page
  window.location.href = data.data.redirectUrl;
}
```

#### React Component
```jsx
import React, { useState } from 'react';

const PaymentButton = ({ planId, amount }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/paymentsv1/razorpay/create-coach-plan-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          planId,
          customerId: 'test_customer_123',
          customerEmail: 'customer@example.com',
          customerPhone: '+919876543210'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.data.redirectUrl;
      }
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      className="pay-button"
    >
      {loading ? 'Creating Order...' : `Pay ₹${amount}`}
    </button>
  );
};
```

### URL Parameters

#### Coach Plan Payment URL
```
/checkout/payment?orderId=order_abc123&planId=68bf0641c89e4507d10888f6&amount=3500&currency=INR
```

**Parameters:**
- `orderId`: Razorpay order ID
- `planId`: Coach plan MongoDB ID
- `amount`: Payment amount in paise
- `currency`: Currency code (INR, USD, etc.)

#### Subscription Payment URL
```
/checkout/subscription?orderId=order_def456&plan=premium&billingCycle=monthly&amount=999&currency=INR
```

**Parameters:**
- `orderId`: Razorpay order ID
- `plan`: Subscription plan name
- `billingCycle`: Billing frequency (monthly, yearly)
- `amount`: Payment amount in paise
- `currency`: Currency code

## Testing Guide

### Test Environment Setup

#### Prerequisites
- Valid coach/admin account with authentication token
- Test database configured
- All required schemas and services available
- Razorpay test account with test keys

#### Test Data Setup
```javascript
// Sample test data for campaigns
const testCampaignData = {
    name: "Test Fitness Campaign",
    objective: "CONVERSIONS",
    dailyBudget: 25,
    targetAudience: "Fitness enthusiasts, 25-45, interested in personal training",
    productInfo: "Personal fitness coaching program with meal plans and workout routines"
};

const testCoachData = {
    coachId: "test_coach_123",
    metaBusinessAccountId: "test_business_account",
    metaAdAccountId: "act_test123456",
    facebookPageId: "test_page_id",
    instagramAccountId: "test_instagram_id"
};
```

### Test Cases

#### 1. Authentication Tests

**Valid Authentication**
```bash
curl -X GET "http://localhost:3000/api/paymentsv1/admin/products" \
  -H "Authorization: Bearer <valid_coach_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "products": []
  }
}
```

**Invalid Authentication**
```bash
curl -X GET "http://localhost:3000/api/paymentsv1/admin/products" \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

#### 2. Product Management Tests

**Create Admin Product**
```bash
curl -X POST "http://localhost:3000/api/paymentsv1/admin/products" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test product description",
    "category": "fitness_training",
    "productType": "digital",
    "basePrice": 2999,
    "currency": "INR"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "productId": "ADMIN_PROD_1234567890_abc123def",
    "name": "Test Product",
    "description": "Test product description",
    "category": "fitness_training",
    "productType": "digital",
    "basePrice": 2999,
    "currency": "INR",
    "status": "active"
  }
}
```

#### 3. Payment Processing Tests

**Create Coach Plan Order**
```bash
curl -X POST "http://localhost:3000/api/paymentsv1/payments/coach-plan/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "COACH_PLAN_1234567890_abc123def",
    "customerId": "customer_123",
    "customerEmail": "customer@example.com",
    "customerPhone": "+919876543210"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order_abc123",
    "amount": 3500,
    "currency": "INR",
    "key": "rzp_test_...",
    "redirectUrl": "https://yourdomain.com/checkout/payment?orderId=order_abc123&planId=68bf0641c89e4507d10888f6&amount=3500&currency=INR",
    "plan": {
      "_id": "68bf0641c89e4507d10888f6",
      "title": "My Custom Fitness Plan",
      "price": 3500,
      "currency": "INR",
      "coach": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  }
}
```

#### 4. Error Handling Tests

**Invalid Product Data**
```bash
curl -X POST "http://localhost:3000/api/paymentsv1/admin/products" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "basePrice": -100
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid product data",
  "errors": [
    "Product name is required",
    "Base price must be positive"
  ]
}
```

### Performance Tests

#### Load Testing
```bash
# Test with 10 concurrent product creation requests
for i in {1..10}; do
  curl -X POST "http://localhost:3000/api/paymentsv1/admin/products" \
    -H "Authorization: Bearer <admin_token>" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Load Test Product $i\",
      \"description\": \"Test product $i\",
      \"category\": \"fitness_training\",
      \"productType\": \"digital\",
      \"basePrice\": 2999,
      \"currency\": \"INR\"
    }" &
done
wait
```

#### Response Time Testing
```bash
# Test response time for product creation
time curl -X POST "http://localhost:3000/api/paymentsv1/admin/products" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Response Time Test",
    "description": "Test product",
    "category": "fitness_training",
    "productType": "digital",
    "basePrice": 2999,
    "currency": "INR"
  }'
```

**Expected Response Times:**
- Product creation: < 2 seconds
- Payment processing: < 3 seconds
- Order verification: < 1 second
- Refund processing: < 5 seconds

## Troubleshooting

### Common Issues

#### 1. Razorpay Configuration Issues

**"key_id is mandatory" Error**
- **Solution**: Make sure `RAZORPAY_KEY_ID` is set in your `.env` file

**"key_secret is mandatory" Error**
- **Solution**: Make sure `RAZORPAY_KEY_SECRET` is set in your `.env` file

**Environment Variables Not Loading**
- **Solution**: 
  1. Make sure `.env` file is in the project root directory
  2. Restart your server after adding environment variables
  3. Check that `require('dotenv').config()` is called in your main.js

**Wrong Key Format**
- **Solution**: 
  - Test keys should start with `rzp_test_`
  - Live keys should start with `rzp_live_`
  - Make sure there are no extra spaces or quotes around the values

#### 2. Payment Page Issues

**404 Error on Payment Page**
- **Solution**: Create frontend route handler for `/checkout/payment`
- **Quick Fix**: Use static HTML file in `public/checkout/payment.html`

**Razorpay Not Loading**
- **Solution**: 
  - Verify Razorpay key is correct
  - Check if Razorpay script is loaded
  - Ensure HTTPS in production

**Payment Verification Failing**
- **Solution**: 
  - Check if `/api/paymentsv1/razorpay/verify-payment` endpoint exists
  - Verify backend is running
  - Check CORS settings

#### 3. API Connection Issues

**Meta API Connection Issues**
```bash
# Check Meta access token
curl -X GET "https://graph.facebook.com/v19.0/me?access_token=YOUR_TOKEN"

# Verify permissions
curl -X GET "https://graph.facebook.com/v19.0/me/permissions?access_token=YOUR_TOKEN"
```

**Database Connection Issues**
```bash
# Check database connection
curl -X GET "http://localhost:3000/api/paymentsv1/health"
```

### Debug Information

#### Enable Debug Logging
```bash
DEBUG=payment:*,razorpay:*,checkout:*
NODE_ENV=development
```

#### Monitor API Calls
```bash
# Monitor Razorpay API calls
curl -X POST "http://localhost:3000/api/paymentsv1/payments/coach-plan/create-order" \
  -H "Content-Type: application/json" \
  -d '{"planId": "test"}' \
  -v
```

### Error Codes

#### Razorpay API Errors
```javascript
{
    "190": "Invalid access token - Regenerate token",
    "100": "Invalid parameter - Check input data",
    "1487749": "Ad account disabled - Contact Meta support",
    "1487748": "Campaign limit reached - Upgrade account"
}
```

#### System Errors
```javascript
{
    "PAYMENT_CREATION_FAILED": "Failed to create payment order",
    "INVALID_PLAN_ID": "Coach plan not found",
    "INSUFFICIENT_PERMISSIONS": "User lacks required permissions",
    "PAYMENT_VERIFICATION_FAILED": "Payment signature verification failed"
}
```

## Best Practices

### 1. Security

#### Webhook Signature Verification
All webhooks are verified using Razorpay's signature verification:
```javascript
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(body)
  .digest('hex');
```

#### Input Validation
All inputs are validated using Mongoose schemas and custom validation rules.

#### Authentication
All admin and coach endpoints require proper authentication tokens.

#### Rate Limiting
Consider implementing rate limiting for payment endpoints to prevent abuse.

### 2. Error Handling

The system provides comprehensive error handling with appropriate HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error (server errors)

### 3. Monitoring and Logging

The system includes comprehensive logging using the logger utility:
- Payment creation and verification
- Webhook processing
- Error tracking
- Performance monitoring

### 4. Performance Optimization

#### Database Indexing
Ensure proper indexes on frequently queried fields:
```javascript
// Example indexes
db.razorpaypayments.createIndex({ "coachId": 1, "status": 1 })
db.coachsellableplans.createIndex({ "coachId": 1, "status": 1 })
db.adminproducts.createIndex({ "status": 1, "isAvailableForCoaches": 1 })
```

#### Caching
Implement caching for frequently accessed data:
- Product information
- Coach plan details
- Commission settings

### 5. Testing

#### Unit Testing
- Test individual functions and methods
- Mock external API calls
- Validate error handling

#### Integration Testing
- Test complete payment flows
- Verify webhook processing
- Test error scenarios

#### Load Testing
- Test with multiple concurrent requests
- Monitor response times
- Check system stability under load

## Future Enhancements

### Planned Features

1. **Multiple Payment Gateways**
   - Stripe integration
   - PayPal integration
   - Local payment methods

2. **Advanced Analytics**
   - Sales analytics dashboard
   - Revenue tracking
   - Commission reports

3. **Subscription Management**
   - Recurring payments
   - Subscription lifecycle management
   - Proration handling

4. **Mobile SDK**
   - React Native integration
   - Flutter SDK
   - Mobile-optimized checkout

5. **AI-Powered Features**
   - Dynamic pricing optimization
   - Customer behavior analysis
   - Fraud detection

### Technical Improvements

1. **Performance Optimization**
   - Database query optimization
   - Caching layer implementation
   - CDN integration

2. **Real-time Features**
   - WebSocket integration for live updates
   - Real-time payment status updates
   - Live analytics dashboard

3. **Advanced Security**
   - Multi-factor authentication
   - Advanced fraud detection
   - PCI DSS compliance

4. **Scalability**
   - Horizontal scaling capabilities
   - Microservices architecture
   - Load balancing

## Support

For technical support or questions about the Payment System, please refer to:

- API documentation: `/api/paymentsv1/health`
- Test script: `test-payment-system.js`
- Checkout page: `/checkout.html`

## Changelog

### Version 1.0.0
- Initial release
- Admin product management
- Coach sellable plans
- Razorpay integration
- Checkout page system
- MLM commission handling
- Platform subscription support
- Comprehensive testing suite
- Frontend integration examples
- Complete documentation

---

*Last Updated: January 2024*
*Version: 1.0.0*
