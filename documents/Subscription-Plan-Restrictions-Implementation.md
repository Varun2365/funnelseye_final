# Subscription Plan Restrictions Implementation

## Overview

This document describes the comprehensive implementation of subscription plan restrictions in the FunnelsEye platform. The system now enforces limits based on the coach's active subscription plan, preventing resource creation when limits are exceeded.

## 🏗️ Architecture

### Core Components

1. **SubscriptionLimitsMiddleware** (`middleware/subscriptionLimits.js`)
   - Central middleware for checking subscription limits
   - Provides methods for checking various resource limits
   - Handles feature access validation

2. **CoachSubscriptionLimitsController** (`controllers/coachSubscriptionLimitsController.js`)
   - API endpoints for coaches to check their limits
   - Provides real-time limit information

3. **Updated Controllers**
   - `funnelController.js` - Funnel creation restrictions
   - `coachStaffManagementController.js` - Staff creation restrictions
   - `leadController.js` - Lead creation restrictions
   - `staffUnifiedDashboardController.js` - Staff dashboard restrictions

## 📊 Supported Limits

### Resource Limits
- **maxFunnels** - Maximum number of funnels allowed
- **maxStaff** - Maximum number of staff members allowed
- **maxDevices** - Maximum number of devices allowed
- **maxLeads** - Maximum number of leads allowed
- **maxAppointments** - Maximum number of appointments allowed
- **maxCampaigns** - Maximum number of campaigns allowed

### Credit Limits
- **automationRules** - Maximum automation rules allowed
- **emailCredits** - Maximum email credits allowed
- **smsCredits** - Maximum SMS credits allowed
- **storageGB** - Maximum storage in GB allowed

### Feature Access
- **aiFeatures** - AI-powered features access
- **advancedAnalytics** - Advanced analytics access
- **prioritySupport** - Priority support access
- **customDomain** - Custom domain access
- **apiAccess** - API access
- **whiteLabel** - White-label features
- **customBranding** - Custom branding features
- **advancedReporting** - Advanced reporting
- **teamCollaboration** - Team collaboration features
- **mobileApp** - Mobile app access
- **webhooks** - Webhook functionality
- **sso** - Single Sign-On access

## 🔧 Implementation Details

### 1. Subscription Limits Middleware

The middleware provides several key methods:

```javascript
// Check funnel limit
const limitCheck = await SubscriptionLimitsMiddleware.checkFunnelLimit(coachId);

// Check staff limit
const limitCheck = await SubscriptionLimitsMiddleware.checkStaffLimit(coachId);

// Check lead limit
const limitCheck = await SubscriptionLimitsMiddleware.checkLeadLimit(coachId);

// Check feature access
const accessCheck = await SubscriptionLimitsMiddleware.checkFeatureAccess(coachId, 'aiFeatures');

// Get comprehensive limits info
const limitsInfo = await SubscriptionLimitsMiddleware.getCoachLimitsInfo(coachId);
```

### 2. API Endpoint Integration

Each resource creation endpoint now includes limit checking:

```javascript
// Example from funnelController.js
const limitCheck = await SubscriptionLimitsMiddleware.checkFunnelLimit(req.coachId);

if (!limitCheck.allowed) {
    return res.status(403).json({
        success: false,
        message: limitCheck.reason,
        error: 'FUNNEL_LIMIT_REACHED',
        currentCount: limitCheck.currentCount,
        maxLimit: limitCheck.maxLimit,
        upgradeRequired: limitCheck.upgradeRequired,
        subscriptionRequired: true
    });
}
```

### 3. Response Format

When limits are exceeded, the API returns a standardized error response:

```json
{
    "success": false,
    "message": "Funnel limit reached",
    "error": "FUNNEL_LIMIT_REACHED",
    "currentCount": 5,
    "maxLimit": 3,
    "upgradeRequired": true,
    "subscriptionRequired": true
}
```

## 🌐 API Endpoints

### Coach Subscription Limits

#### GET /api/coach/subscription-limits
Get comprehensive subscription limits and current usage information.

**Response:**
```json
{
    "success": true,
    "data": {
        "hasActiveSubscription": true,
        "subscription": {
            "status": "active",
            "startDate": "2024-01-01T00:00:00.000Z",
            "endDate": "2024-02-01T00:00:00.000Z",
            "planName": "Professional"
        },
        "limits": {
            "funnels": {
                "current": 2,
                "max": 10,
                "unlimited": false
            },
            "staff": {
                "current": 1,
                "max": 5,
                "unlimited": false
            },
            "leads": {
                "current": 45,
                "max": 1000,
                "unlimited": false
            }
        },
        "features": {
            "aiFeatures": true,
            "customDomain": true,
            "apiAccess": false
        }
    }
}
```

#### POST /api/coach/check-limit
Check specific limit before performing an action.

**Request:**
```json
{
    "limitType": "funnels"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "limitType": "funnels",
        "allowed": true,
        "currentCount": 2,
        "maxLimit": 10
    }
}
```

#### POST /api/coach/check-feature
Check feature access.

**Request:**
```json
{
    "featureName": "aiFeatures"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "featureName": "aiFeatures",
        "allowed": true
    }
}
```

## 🔒 Protected Endpoints

The following endpoints now enforce subscription limits:

### Funnel Management
- `POST /api/funnels/coach/:coachId/funnels` - Funnel creation
- `POST /api/staff-unified/v1/funnels` - Staff funnel creation

### Staff Management
- `POST /api/coach/staff` - Staff member creation

### Lead Management
- `POST /api/leads` - Lead creation
- `POST /api/staff-unified/v1/leads` - Staff lead creation

## 🧪 Testing

A comprehensive test suite is available in `test-subscription-limits.js`:

```bash
node test-subscription-limits.js
```

The test suite verifies:
- Subscription plan creation and management
- Limit checking functionality
- Resource creation restrictions
- Feature access validation
- API endpoint responses

## 📈 Usage Examples

### Frontend Integration

```javascript
// Check limits before showing create buttons
const checkFunnelLimit = async () => {
    const response = await fetch('/api/coach/check-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limitType: 'funnels' })
    });
    
    const data = await response.json();
    
    if (!data.data.allowed) {
        // Show upgrade prompt
        showUpgradeModal(data.data);
    } else {
        // Enable funnel creation
        enableFunnelCreation();
    }
};

// Get comprehensive limits info
const getLimitsInfo = async () => {
    const response = await fetch('/api/coach/subscription-limits');
    const data = await response.json();
    
    updateUIWithLimits(data.data);
};
```

### Error Handling

```javascript
// Handle limit exceeded errors
const createFunnel = async (funnelData) => {
    try {
        const response = await fetch('/api/funnels/coach/123/funnels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(funnelData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            
            if (error.error === 'FUNNEL_LIMIT_REACHED') {
                showUpgradePrompt({
                    message: error.message,
                    currentCount: error.currentCount,
                    maxLimit: error.maxLimit
                });
            }
        }
    } catch (error) {
        console.error('Error creating funnel:', error);
    }
};
```

## 🔄 Migration Notes

### Existing Subscriptions
- All existing coach subscriptions will continue to work
- Limits are enforced based on the current subscription plan
- No data migration is required

### Backward Compatibility
- All existing API endpoints remain functional
- New limit checking is additive and doesn't break existing functionality
- Error responses include additional information for better UX

## 🚀 Future Enhancements

### Planned Features
1. **Real-time Usage Tracking** - Track actual usage of credits and resources
2. **Usage Analytics** - Provide detailed usage reports to coaches
3. **Dynamic Limit Adjustment** - Allow temporary limit increases
4. **Usage Alerts** - Notify coaches when approaching limits
5. **Auto-scaling** - Automatically upgrade plans when limits are consistently reached

### Integration Points
1. **Payment System** - Integrate with subscription upgrades
2. **Notification System** - Send limit warnings and upgrade prompts
3. **Analytics Dashboard** - Display usage metrics
4. **Admin Panel** - Allow admins to override limits temporarily

## 📝 Configuration

### Environment Variables
No additional environment variables are required. The system uses existing database connections and configurations.

### Database Requirements
- `CoachSubscription` collection must be populated with active subscriptions
- `SubscriptionPlan` collection must contain plan definitions with limits
- Resource collections (`Funnel`, `Staff`, `Lead`) must be properly indexed for efficient counting

## 🛠️ Maintenance

### Monitoring
- Monitor API response times for limit checking
- Track limit exceeded errors to identify popular upgrade triggers
- Monitor subscription plan usage patterns

### Updates
- Plan limits can be updated in the `SubscriptionPlan` collection
- New limit types can be added by extending the middleware
- Feature flags can be toggled per plan without code changes

---

## ✅ Implementation Complete

The subscription plan restrictions are now fully implemented and operational. Coaches will be prevented from exceeding their plan limits, and the system provides clear feedback about upgrade requirements.

**Key Benefits:**
- ✅ Prevents resource abuse
- ✅ Encourages plan upgrades
- ✅ Provides clear upgrade paths
- ✅ Maintains system performance
- ✅ Improves user experience with clear error messages
