# Payment System V1 - Quick Test Guide

## 🚀 Quick Start Testing

### Prerequisites
```bash
# Environment variables
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:3000
```

### 1. Health Check
```bash
curl http://localhost:8080/api/paymentsv1/health
```

### 2. Create Admin Product
```bash
curl -X POST http://localhost:8080/api/paymentsv1/admin/products \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Fitness Program",
    "description": "Test program description",
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
      {"title": "Test Feature", "description": "Test feature description"}
    ],
    "commissionSettings": {
      "platformCommissionPercentage": 10,
      "coachCommissionPercentage": 80
    }
  }'
```

### 3. Create Coach Plan
```bash
curl -X POST http://localhost:8080/api/paymentsv1/coach/plans \
  -H "Authorization: Bearer <coach-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "adminProductId": "<product-id-from-step-2>",
    "title": "My Test Plan",
    "description": "My test plan description",
    "price": 3999,
    "additionalFeatures": [
      {"title": "Bonus Feature", "description": "Extra coaching"}
    ]
  }'
```

### 4. Make Plan Public
```bash
curl -X PUT http://localhost:8080/api/paymentsv1/coach/plans/<plan-id>/status \
  -H "Authorization: Bearer <coach-token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'

curl -X PUT http://localhost:8080/api/paymentsv1/coach/plans/<plan-id> \
  -H "Authorization: Bearer <coach-token>" \
  -H "Content-Type: application/json" \
  -d '{"isPublic": true}'
```

### 5. Test Checkout Page
Open browser: `http://localhost:8080/checkout.html?planId=<plan-id>`

### 6. Create Payment Order
```bash
curl -X POST http://localhost:8080/api/paymentsv1/payments/coach-plan/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "<plan-id>",
    "customerId": "test_customer_123",
    "customerEmail": "test@example.com",
    "customerPhone": "+919876543210"
  }'
```

### 7. Test Payment (Use Razorpay Test Card)
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

### 8. Verify Payment
```bash
curl -X POST http://localhost:8080/api/paymentsv1/payments/verify \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "<order-id>",
    "razorpay_payment_id": "<payment-id>",
    "razorpay_signature": "<signature>"
  }'
```

## 🧪 Automated Test Script

Run the automated test script:
```bash
node test-payment-system.js
```

## 📋 Test Checklist

- [ ] Health check passes
- [ ] Admin product created
- [ ] Coach plan created
- [ ] Plan made public
- [ ] Checkout page loads
- [ ] Payment order created
- [ ] Payment processed successfully
- [ ] Commission calculated correctly
- [ ] Payment history updated

## 🐛 Common Issues

1. **401 Unauthorized**: Check token validity
2. **404 Not Found**: Verify plan/product IDs
3. **Payment Failed**: Check Razorpay credentials
4. **Commission Not Calculated**: Verify payment status is "captured"

## 📞 Support

- Check logs: `console.log` in controllers
- Database: Check MongoDB collections
- Razorpay: Check dashboard for orders/payments
- Health endpoint: `/api/paymentsv1/health`
