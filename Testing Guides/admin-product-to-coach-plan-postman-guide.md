# Complete Admin Product → Coach Plan Creation Guide (Postman)

## Overview
This guide walks you through the complete process of:
1. **Admin creates a product** → 2. **Coach creates a plan based on that product**

## Prerequisites
- Postman installed
- Server running on `http://localhost:3000`
- Admin user created (run: `node misc/seedAdmin.js`)

---

## Step 1: Get Admin Token

### Request: Admin Login
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/admin/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "admin@funnelseye.com",
    "password": "Admin@123",
    "rememberMe": false
  }
  ```

### Expected Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "68ac969ebbce83d73a465c36",
      "email": "admin@funnelseye.com",
      "role": "super_admin"
    }
  }
}
```

### ⚠️ Important:
- **Copy the `token` value** - you'll need it for all admin requests
- **Set it as a variable:** In Postman, go to Tests tab and add:
  ```javascript
  pm.environment.set("admin_token", pm.response.json().data.token);
  ```

---

## Step 2: Create Admin Product

### Request: Create Admin Product
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/paymentsv1/admin/products`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{admin_token}}
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "Premium Fitness Transformation Program",
    "description": "A comprehensive 12-week fitness program designed for complete body transformation. Includes workout plans, nutrition guides, and progress tracking.",
    "shortDescription": "Complete fitness transformation in 12 weeks",
    "category": "fitness_training",
    "productType": "digital",
    "basePrice": 2999,
    "currency": "INR",
    "pricingRules": {
      "allowCustomPricing": true,
      "minPrice": 1999,
      "maxPrice": 4999,
      "suggestedMarkup": 20
    },
    "features": [
      {
        "title": "12-Week Structured Program",
        "description": "Progressive workout plans for all fitness levels",
        "icon": "calendar"
      },
      {
        "title": "Nutrition Guidance",
        "description": "Complete meal plans and recipes",
        "icon": "food"
      },
      {
        "title": "Video Demonstrations",
        "description": "HD video tutorials for all exercises",
        "icon": "play"
      },
      {
        "title": "Progress Tracking",
        "description": "Built-in tools to track your transformation",
        "icon": "chart"
      }
    ],
    "contentFiles": [
      {
        "fileName": "workout-plan.pdf",
        "fileUrl": "/uploads/workout-plan.pdf",
        "fileSize": 2048000,
        "fileType": "application/pdf",
        "isDownloadable": true
      }
    ],
    "videoContent": [
      {
        "title": "Program Introduction",
        "videoUrl": "/uploads/intro-video.mp4",
        "duration": 300,
        "thumbnail": "/uploads/intro-thumbnail.jpg"
      }
    ],
    "termsAndConditions": "By purchasing this program, you agree to follow the workout plans safely and consult a healthcare provider if needed.",
    "refundPolicy": "Full refund available within 7 days of purchase.",
    "commissionSettings": {
      "platformCommissionPercentage": 10,
      "coachCommissionPercentage": 80
    }
  }
  ```

### Expected Response:
```json
{
  "success": true,
  "message": "Admin product created successfully",
  "data": {
    "productId": "ADMIN_PROD_1757349441305_qw0l9yxu2",
    "_id": "68bf0641c89e4507d10888ee",
    "name": "Premium Fitness Transformation Program",
    "status": "draft",
    "note": "Use the _id field when creating coach sellable plans"
  }
}
```

### ⚠️ Important:
- **Copy the `_id` value** - coaches will use this to create their plans
- **Set it as a variable:** In Tests tab, add:
  ```javascript
  pm.environment.set("admin_product_id", pm.response.json().data._id);
  ```

---

## Step 3: Activate Admin Product

### Request: Update Product Status
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/paymentsv1/admin/products/{{admin_product_id}}/status`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{admin_token}}
  ```
- **Body (raw JSON):**
  ```json
  {
    "status": "active"
  }
  ```

### Expected Response:
```json
{
  "success": true,
  "message": "Product status updated successfully",
  "data": {
    "_id": "68bf0641c89e4507d10888ee",
    "status": "active",
    "isAvailableForCoaches": true
  }
}
```

---

## Step 4: Create Test User (Coach)

### Request: Register Test User
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/register`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "Test Coach",
    "email": "test@example.com",
    "password": "password123",
    "role": "coach"
  }
  ```

### Expected Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "name": "Test Coach",
      "email": "test@example.com",
      "role": "coach"
    }
  }
}
```

---

## Step 5: Get Coach Token

### Request: Coach Login
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

### Expected Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68bf0641c89e4507d10888f5",
    "name": "Test Coach",
    "email": "test@example.com",
    "role": "coach"
  }
}
```

### ⚠️ Important:
- **Copy the `token` value** - you'll need it for coach requests
- **Set it as a variable:** In Tests tab, add:
  ```javascript
  pm.environment.set("coach_token", pm.response.json().token);
  ```

---

## Step 6: Coach Creates Plan Based on Admin Product

### Request: Create Coach Sellable Plan
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/paymentsv1/coach/plans`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{coach_token}}
  ```
- **Body (raw JSON):**
  ```json
  {
    "adminProductId": "{{admin_product_id}}",
    "title": "My Custom Fitness Transformation",
    "description": "A personalized version of the premium fitness program, tailored for busy professionals who want to transform their body in just 12 weeks.",
    "shortDescription": "12-week fitness transformation for busy professionals",
    "price": 3500,
    "currency": "INR",
    "originalPrice": 3999,
    "discountPercentage": 12,
    "additionalFeatures": [
      {
        "title": "Personal Consultation",
        "description": "One-on-one consultation with the coach"
      }
    ],
    "additionalContentFiles": [
      {
        "fileName": "bonus-nutrition-guide.pdf",
        "fileUrl": "/uploads/bonus-nutrition-guide.pdf",
        "fileSize": 1024000,
        "fileType": "application/pdf",
        "isDownloadable": true
      }
    ],
    "customTermsAndConditions": "This plan includes personalized coaching support. Refunds available within 14 days.",
    "customRefundPolicy": "Extended 14-day refund policy with personalized support."
  }
  ```

### Expected Response:
```json
{
  "success": true,
  "message": "Coach sellable plan created successfully",
  "data": {
    "planId": "COACH_PLAN_1757349500000_abc123def",
    "_id": "68bf0641c89e4507d10888f6",
    "title": "My Custom Fitness Transformation",
    "price": 3500,
    "currency": "INR",
    "status": "draft",
    "coachId": "68bf0641c89e4507d10888f5",
    "adminProductId": "68bf0641c89e4507d10888ee"
  }
}
```

---

## Step 7: Verify Coach Plan Creation

### Request: Get Coach Plans
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/paymentsv1/coach/plans`
- **Headers:**
  ```
  Authorization: Bearer {{coach_token}}
  ```

### Expected Response:
```json
{
  "success": true,
  "data": [
    {
      "planId": "COACH_PLAN_1757349500000_abc123def",
      "title": "My Custom Fitness Transformation",
      "price": 3500,
      "status": "draft",
      "adminProduct": {
        "name": "Premium Fitness Transformation Program",
        "category": "fitness_training"
      }
    }
  ]
}
```

---

## Step 8: Activate Coach Plan

### Request: Update Coach Plan Status
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/paymentsv1/coach/plans/{{coach_plan_id}}`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{coach_token}}
  ```
- **Body (raw JSON):**
  ```json
  {
    "status": "active",
    "isPublic": true
  }
  ```

---

## Postman Environment Variables

Create these variables in your Postman environment:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `admin_token` | Admin authentication token | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `coach_token` | Coach authentication token | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `admin_product_id` | MongoDB _id of admin product | `68bf0641c89e4507d10888ee` |
| `coach_plan_id` | MongoDB _id of coach plan | `68bf0641c89e4507d10888f6` |

---

## Common Issues & Solutions

### Issue 1: "Cannot read properties of undefined (reading '_id')"
- **Cause:** Wrong token type (using admin token for coach endpoints)
- **Solution:** Use `coach_token` for coach endpoints

### Issue 2: "Cast to ObjectId failed"
- **Cause:** Using `productId` string instead of MongoDB `_id`
- **Solution:** Use the `_id` field from admin product response

### Issue 3: "Admin product not found"
- **Cause:** Product status is not 'active'
- **Solution:** Activate the product first (Step 3)

### Issue 4: "Invalid token"
- **Cause:** Token expired or invalid
- **Solution:** Re-login and get fresh tokens

---

## Quick Test Script

You can also run this automated test:
```bash
node test-coach-plan-creation.js
```

This script will perform all the above steps automatically and show you the results.
