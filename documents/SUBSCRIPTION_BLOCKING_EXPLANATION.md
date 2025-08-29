# Subscription Blocking in Protect Middleware

## Overview
The `protect` middleware now includes comprehensive subscription checking for coaches. This ensures that coaches without active subscriptions cannot access any platform features except subscription management.

## How It Works

### 1. **Role-Based Check**
- **Coaches**: Full subscription validation required
- **Admin/Staff**: No subscription checks (bypass completely)
- **Other roles**: No subscription checks

### 2. **Subscription Status Validation**
The middleware checks the following subscription states:

#### ✅ **ACTIVE** - Full Access Granted
- Can access ALL routes
- No restrictions

#### ❌ **NO SUBSCRIPTION** - Limited Access
- **ALLOWED**: Subscription management routes only
- **BLOCKED**: All other routes (leads, dashboard, funnels, etc.)
- **Response**: 403 with `NO_SUBSCRIPTION` code

#### ❌ **EXPIRED** - Limited Access
- **ALLOWED**: Subscription management routes only
- **BLOCKED**: All other routes
- **Response**: 403 with `SUBSCRIPTION_EXPIRED` code

#### ❌ **SUSPENDED** - Limited Access
- **ALLOWED**: Subscription management routes only
- **BLOCKED**: All other routes
- **Response**: 403 with `SUBSCRIPTION_SUSPENDED` code

#### ❌ **CANCELLED** - Limited Access
- **ALLOWED**: Subscription management routes only
- **BLOCKED**: All other routes
- **Response**: 403 with `SUBSCRIPTION_CANCELLED` code

#### ⚠️ **PENDING RENEWAL** - Full Access with Warning
- Can access ALL routes
- Warning added to request object
- No blocking

### 3. **Allowed Subscription Routes**
Coaches can always access these routes regardless of subscription status:
- `/api/subscription/renew`
- `/api/subscription/cancel`
- `/api/subscription/my-subscription`
- `/api/subscription/subscribe`
- `/api/subscription/plans`

### 4. **Blocked Routes Examples**
Coaches without active subscriptions are blocked from:
- `/api/leads/manage` - Lead management
- `/api/dashboard/analytics` - Dashboard analytics
- `/api/funnels/create` - Funnel creation
- `/api/coaches/profile` - Profile management
- Any other non-subscription route

## Response Format

### Blocked Access Response
```json
{
  "success": false,
  "message": "Your subscription has expired. Please renew to continue using the platform.",
  "code": "SUBSCRIPTION_EXPIRED",
  "subscriptionStatus": "expired",
  "isEnabled": false,
  "blockedRoute": "/api/leads/manage"
}
```

### Warning Response (for subscription routes)
```json
{
  "success": true,
  "data": {...},
  "subscriptionWarning": {
    "message": "Your subscription is pending renewal...",
    "code": "SUBSCRIPTION_PENDING_RENEWAL",
    "daysUntilExpiry": 5
  }
}
```

## Implementation Details

### 1. **Middleware Location**
- File: `middleware/auth.js`
- Function: `protect`
- Applied to: All coach routes automatically

### 2. **Database Population**
```javascript
const user = await User.findById(decoded.id).populate('subscription.planId');
```

### 3. **Route Detection**
```javascript
const subscriptionRoutes = [
    '/api/subscription/renew',
    '/api/subscription/cancel',
    '/api/subscription/my-subscription',
    '/api/subscription/subscribe',
    '/api/subscription/plans'
];

const isSubscriptionRoute = subscriptionRoutes.some(route => 
    req.originalUrl.includes(route)
);
```

### 4. **Critical Check**
```javascript
// CRITICAL CHECK: Only allow access to non-subscription routes if subscription is ACTIVE
if (user.subscription.status !== 'active' && !isSubscriptionRoute) {
    return res.status(403).json({
        success: false,
        message: `Your subscription is currently ${user.subscription.status}...`,
        code: 'SUBSCRIPTION_NOT_ACTIVE',
        subscriptionStatus: user.subscription.status,
        isEnabled: user.subscription.isEnabled,
        blockedRoute: req.originalUrl
    });
}
```

## Testing

### Test Script
Run the test script to verify blocking logic:
```bash
node misc/test_subscription_blocking.js
```

### Manual Testing
1. **Coach with no subscription**:
   - Try to access `/api/leads/manage` → Should be blocked
   - Try to access `/api/subscription/plans` → Should be allowed

2. **Coach with expired subscription**:
   - Try to access `/api/dashboard/analytics` → Should be blocked
   - Try to access `/api/subscription/renew` → Should be allowed

3. **Coach with active subscription**:
   - Try to access any route → Should be allowed

4. **Admin user**:
   - Try to access any route → Should be allowed (no subscription check)

## Benefits

1. **Security**: Prevents unauthorized access to platform features
2. **Revenue Protection**: Ensures only paying coaches can use the platform
3. **User Experience**: Clear error messages guide coaches to subscription management
4. **Automatic Enforcement**: No need to add subscription checks to individual routes
5. **Flexibility**: Coaches can always manage their subscriptions

## Future Enhancements

1. **Feature-Level Access**: Check specific features within plans
2. **Usage Limits**: Enforce plan-based usage restrictions
3. **Grace Periods**: Allow temporary access during payment processing
4. **Trial Periods**: Special handling for trial subscriptions
5. **Payment Gateway Integration**: Automatic status updates from payment providers
