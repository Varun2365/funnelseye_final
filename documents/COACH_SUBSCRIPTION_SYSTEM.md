# 🚀 **COACH SUBSCRIPTION SYSTEM - FUNNELSEYE**

## 📋 **OVERVIEW**

The Coach Subscription System is a comprehensive platform management solution that handles coach subscriptions, automated reminders, account management, and feature access control. It ensures coaches maintain active subscriptions to access FunnelsEye features while providing automated communication and account management.

---

## 🏗️ **SYSTEM ARCHITECTURE**

### **Core Components**
1. **Subscription Plans** - Admin-created plans with features and pricing
2. **Coach Subscriptions** - Individual coach subscription records
3. **Automated Tasks** - Daily reminder sending and account management
4. **Middleware** - Subscription status and feature access validation
5. **API Endpoints** - Complete CRUD operations for subscriptions

### **Database Schema**
- `SubscriptionPlan` - Plan definitions with features and pricing
- `CoachSubscription` - Individual subscription records with metadata
- `User` - Enhanced with subscription reference fields

---

## 📊 **SUBSCRIPTION PLANS**

### **Plan Structure**
```javascript
{
    name: "Professional",
    description: "Ideal for growing coaches",
    price: {
        amount: 79,
        currency: "USD",
        billingCycle: "monthly" // monthly, quarterly, yearly
    },
    features: {
        maxFunnels: 10,
        maxLeads: 2000,
        maxStaff: 3,
        maxAutomationRules: 15,
        aiFeatures: true,
        advancedAnalytics: true,
        prioritySupport: false,
        customDomain: true
    }
}
```

### **Default Plans**
- **Starter** - $29/month - Basic features for beginners
- **Professional** - $79/month - Most popular plan with AI features
- **Business** - $149/month - Advanced features for established coaches
- **Enterprise** - $299/month - Custom solutions for large organizations
- **Annual Variants** - 2 months free with yearly billing

---

## 🔄 **SUBSCRIPTION LIFECYCLE**

### **1. Subscription Creation**
```javascript
POST /api/subscription/subscribe
{
    "planId": "plan_id_here",
    "paymentData": {
        "status": "paid",
        "method": "stripe"
    }
}
```

### **2. Active Period**
- Subscription is active and all features are accessible
- Usage tracking is maintained
- Regular health checks are performed

### **3. Expiry Reminders**
- **7 days before** - First reminder (Email + WhatsApp)
- **3 days before** - Second reminder (Email + WhatsApp)
- **1 day before** - Urgent reminder (Email + WhatsApp)
- **On expiry** - Final notification (Email + WhatsApp)

### **4. Account Management**
- **0-7 days after expiry** - Account remains active with warnings
- **7+ days after expiry** - Account automatically disabled
- **All campaigns, funnels, and events are temporarily disabled**

### **5. Renewal Process**
- Coach receives renewal links via email/WhatsApp
- Payment processing (placeholder for future implementation)
- Account re-enabled upon successful renewal

---

## 📧 **AUTOMATED COMMUNICATION**

### **Email Templates**
- Professional HTML templates with branding
- Clear subscription details and renewal instructions
- Mobile-responsive design

### **WhatsApp Messages**
- Formatted text messages with subscription info
- Direct renewal links
- Professional tone with urgency indicators

### **Reminder Schedule**
```javascript
// Daily at 9:00 AM UTC
cron.schedule('0 9 * * *', dailySubscriptionCheck);

// Daily at 11:00 PM UTC  
cron.schedule('0 23 * * *', disableExpiredSubscriptions);

// Every 6 hours
cron.schedule('0 */6 * * *', checkUrgentReminders);
```

---

## 🛡️ **SECURITY & ACCESS CONTROL**

### **Subscription Status Middleware**
```javascript
// Check if subscription is active
app.use('/api/protected-route', checkSubscriptionStatus);

// Check specific feature access
app.use('/api/ai-features', checkFeatureAccess('aiFeatures'));

// Check usage limits
app.use('/api/create-funnel', checkUsageLimit('maxFunnels'));
```

### **Access Levels**
- **Active Subscription** - Full access to plan features
- **Expired (0-7 days)** - Read-only access with renewal prompts
- **Expired (7+ days)** - Account disabled, no access
- **Cancelled** - No access until renewal

---

## 📈 **USAGE TRACKING**

### **Tracked Metrics**
- **Funnels** - Number of active funnels
- **Leads** - Total leads in system
- **Staff** - Number of active staff members
- **Automation Rules** - Active automation rules

### **Limit Enforcement**
```javascript
// Example: Creating a new funnel
if (currentUsage >= maxLimit) {
    return res.status(403).json({
        message: `Usage limit reached for ${limitType}`,
        currentUsage,
        maxLimit
    });
}
```

---

## 🔧 **ADMIN MANAGEMENT**

### **Plan Management**
```javascript
// Create new plan
POST /api/subscription/plans

// Update existing plan
PUT /api/subscription/plans/:id

// Delete plan (if no active subscriptions)
DELETE /api/subscription/plans/:id
```

### **Subscription Oversight**
```javascript
// View all subscriptions
GET /api/subscription/all

// Get specific coach subscription
GET /api/subscription/coach/:coachId

// View analytics
GET /api/subscription/analytics
```

### **Manual Operations**
```javascript
// Force send reminders
POST /api/subscription/send-reminders

// Force disable expired subscriptions
POST /api/subscription/disable-expired
```

---

## 🚀 **API ENDPOINTS**

### **Public Endpoints**
- `GET /api/subscription/plans` - View available plans

### **Coach Endpoints**
- `POST /api/subscription/subscribe` - Subscribe to a plan
- `POST /api/subscription/renew` - Renew subscription
- `POST /api/subscription/cancel` - Cancel subscription
- `GET /api/subscription/my-subscription` - View own subscription

### **Admin Endpoints**
- `POST /api/subscription/plans` - Create subscription plan
- `PUT /api/subscription/plans/:id` - Update plan
- `DELETE /api/subscription/plans/:id` - Delete plan
- `GET /api/subscription/all` - View all subscriptions
- `GET /api/subscription/analytics` - View analytics

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Core System** ✅
- [x] Database schemas created
- [x] Subscription service implemented
- [x] API controllers and routes
- [x] Basic middleware for access control

### **Phase 2: Automation** ✅
- [x] Automated reminder system
- [x] Account disable/enable logic
- [x] Scheduled tasks implementation
- [x] Email and WhatsApp templates

### **Phase 3: Integration** 🔄
- [ ] Payment gateway integration
- [ ] Email service integration
- [ ] WhatsApp service integration
- [ ] Frontend subscription management UI

### **Phase 4: Advanced Features** 📋
- [ ] Usage analytics dashboard
- [ ] Automated plan recommendations
- [ ] Bulk operations for admins
- [ ] Advanced reporting

---

## 🧪 **TESTING**

### **Manual Testing**
```bash
# Seed sample subscription plans
node misc/seedSubscriptionPlans.js

# Test subscription creation
curl -X POST /api/subscription/subscribe \
  -H "Authorization: Bearer <token>" \
  -d '{"planId": "plan_id", "paymentData": {"status": "paid"}}'

# Test reminder sending
curl -X POST /api/subscription/send-reminders \
  -H "Authorization: Bearer <admin_token>"
```

### **Automated Testing**
- Unit tests for subscription service
- Integration tests for API endpoints
- Middleware validation tests
- Automated task testing

---

## 🔮 **FUTURE ENHANCEMENTS**

### **Payment Integration**
- Stripe/PayPal integration
- Multiple payment methods
- Subscription management portal
- Invoice generation

### **Advanced Analytics**
- Revenue forecasting
- Churn prediction
- Usage pattern analysis
- Performance metrics

### **Customer Success**
- Automated onboarding sequences
- Feature adoption tracking
- Success milestone celebrations
- Proactive support alerts

---

## 📞 **SUPPORT & MAINTENANCE**

### **Monitoring**
- Daily task execution logs
- Reminder delivery status
- Account disable/enable events
- Error tracking and alerting

### **Troubleshooting**
- Check subscription status
- Verify reminder delivery
- Review automated task logs
- Monitor database performance

### **Regular Maintenance**
- Clean up old reminder records
- Optimize database queries
- Update reminder templates
- Review and adjust schedules

---

## 🎯 **CONCLUSION**

The Coach Subscription System provides a robust foundation for managing coach access to FunnelsEye features. It ensures:

1. **Revenue Protection** - Automated subscription management
2. **User Experience** - Clear communication and renewal processes  
3. **System Security** - Proper access control and feature limits
4. **Operational Efficiency** - Automated tasks and monitoring
5. **Scalability** - Flexible plan structure and usage tracking

The system is designed to be maintainable, extensible, and user-friendly while providing comprehensive subscription lifecycle management.

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Maintainer:** FunnelsEye Development Team
