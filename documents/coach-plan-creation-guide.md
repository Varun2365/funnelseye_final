# Coach Sellable Plan Creation Guide

## Important: Use MongoDB _id

When creating coach sellable plans, you **MUST** use the MongoDB `_id` field from the admin product. The system now uses only MongoDB `_id` for all product references.

## Step-by-Step Process

### 1. Create Admin Product (Admin Only)

**Endpoint:** `POST /api/paymentsv1/admin/products`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Premium Fitness Program",
  "description": "A comprehensive fitness transformation program",
  "category": "fitness_training",
  "productType": "digital",
  "basePrice": 2999,
  "currency": "INR",
  "features": [
    {
      "title": "12-Week Program",
      "description": "Structured workout plans"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin product created successfully",
  "data": {
    "_id": "68bf0641c89e4507d10888ee",  // ✅ USE THIS MongoDB _id
    "name": "Premium Fitness Program",
    "status": "draft"
  }
}
```

### 2. Activate Admin Product (Admin Only)

**Endpoint:** `PUT /api/paymentsv1/admin/products/:productId/status`

**Request Body:**
```json
{
  "status": "active"
}
```

### 3. Create Coach Sellable Plan (Coach Only)

**Endpoint:** `POST /api/paymentsv1/coach/plans`

**Headers:**
```
Authorization: Bearer YOUR_USER_TOKEN  // Not admin token!
Content-Type: application/json
```

**Request Body:**
```json
{
  "adminProductId": "68bf0641c89e4507d10888ee",  // ✅ Use MongoDB _id
  "title": "My Custom Fitness Plan",
  "description": "A personalized fitness program",
  "price": 3500,
  "currency": "INR"
}
```

## Common Mistakes

### ❌ Wrong: Using Invalid ObjectId
```json
{
  "adminProductId": "invalid-id"  // This will fail!
}
```

**Error:** `Cast to ObjectId failed for value "invalid-id"`

### ✅ Correct: Using MongoDB _id
```json
{
  "adminProductId": "68bf0641c89e4507d10888ee"  // This works!
}
```

## Authentication Requirements

- **Admin Product Creation:** Requires admin token (`Bearer YOUR_ADMIN_TOKEN`)
- **Coach Plan Creation:** Requires user token (`Bearer YOUR_USER_TOKEN`)

## Testing Scripts

### Get Admin Token
```bash
node get-admin-token.js
```

### Create Test User
```bash
node create-test-user.js
```

### Test Complete Flow
```bash
node test-coach-plan-creation.js
```

## API Endpoints Summary

| Action | Endpoint | Auth Required | Token Type |
|--------|----------|---------------|------------|
| Create Admin Product | `POST /api/paymentsv1/admin/products` | Yes | Admin |
| Activate Product | `PUT /api/paymentsv1/admin/products/:productId/status` | Yes | Admin |
| Create Coach Plan | `POST /api/paymentsv1/coach/plans` | Yes | User |
| Get Coach Plans | `GET /api/paymentsv1/coach/plans` | Yes | User |

## Troubleshooting

### Error: "Cast to ObjectId failed"
- **Cause:** Using `productId` string instead of MongoDB `_id`
- **Solution:** Use the `_id` field from the admin product response

### Error: "Admin product not found"
- **Cause:** Product status is not 'active' or `isAvailableForCoaches` is false
- **Solution:** Activate the product first using the admin endpoint

### Error: "Cannot read properties of undefined (reading '_id')"
- **Cause:** Using admin token for coach endpoints or vice versa
- **Solution:** Use correct token type for each endpoint

## Example cURL Commands

### Create Admin Product
```bash
curl -X POST http://localhost:3000/api/paymentsv1/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "category": "fitness_training",
    "productType": "digital",
    "basePrice": 1000,
    "currency": "INR"
  }'
```

### Create Coach Plan
```bash
curl -X POST http://localhost:3000/api/paymentsv1/coach/plans \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "adminProductId": "68bf0641c89e4507d10888ee",
    "title": "My Plan",
    "description": "My description",
    "price": 1200,
    "currency": "INR"
  }'
```
