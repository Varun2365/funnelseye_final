# 🔄 Section-Based Permissions Migration Guide

## 📋 Overview

This document outlines the migration from fine-grained permissions (e.g., `leads:read`, `leads:write`) to simplified section-based permissions (e.g., `leads`, `funnels`). With section-based permissions, staff members get **full access** to all features within a section once granted access.

---

## 🎯 Key Changes

### **Before (Fine-Grained Permissions)**
```javascript
// Staff had granular permissions
staff.permissions = [
    'leads:read',
    'leads:write',
    'leads:update',
    'funnels:read',
    'calendar:manage'
];

// Routes checked specific actions
requirePermission('leads:write')
requirePermission('funnels:update')
```

### **After (Section-Based Permissions)**
```javascript
// Staff has section access
staff.permissions = [
    'leads',      // Full access to all lead features
    'funnels',    // Full access to all funnel features
    'calendar'    // Full access to all calendar features
];

// Routes check section access only
requireSection('leads')
requireSection('funnels')
```

---

## 📊 Available Sections

### **Core Sections**
| Section | Description | Always Accessible |
|---------|-------------|-------------------|
| `dashboard` | Staff dashboard with tasks and overview | ✅ Yes |
| `profile` | Staff profile management | ✅ Yes |

### **Sales & Marketing**
| Section | Description |
|---------|-------------|
| `leads` | Lead management, lead magnets, lead generation |
| `funnels` | Funnel creation, editing, publishing, analytics |
| `marketing` | Marketing campaigns, ads, analytics |

### **Communication**
| Section | Description |
|---------|-------------|
| `messaging` | WhatsApp, email, unified messaging |
| `templates` | Message template creation and management |

### **Operations**
| Section | Description |
|---------|-------------|
| `calendar` | Appointments, scheduling, availability |
| `automation` | Automation rules, AI tools, sequences |

### **Network & Finance**
| Section | Description |
|---------|-------------|
| `mlm` | MLM network, downline, commissions |
| `payment_gateway` | Payment gateway setup and configuration |

### **Content & Integrations**
| Section | Description |
|---------|-------------|
| `courses` | Course creation, management, and selling |
| `zoom` | Zoom integration and meeting settings |
| `domains` | Custom domain management |

### **Admin (Coach Only)**
| Section | Description | Staff Access |
|---------|-------------|--------------|
| `subscription` | Subscription plans and billing | ❌ Blocked |
| `staff_management` | Manage other staff members | ⚠️ Admin staff only |

---

## 🛠️ Implementation Files

### **New Files Created**

#### 1. **`utils/sectionPermissions.js`**
- Defines all section constants
- Section metadata (names, descriptions, icons)
- Section-to-route mapping
- Permission presets for common roles
- Validation functions

#### 2. **`middleware/sectionAuth.js`**
- `unifiedSectionAuth()` - Unified authentication middleware
- `requireSection(section)` - Require specific section access
- `filterBySection()` - Auto-detect and filter by section
- `blockSubscriptionForStaff()` - Block subscription for staff
- Helper functions for section checking

#### 3. **`services/sectionService.js`**
- Helper functions for controllers
- `getCoachIdForQuery(req)` - Get coach ID for queries
- `hasSectionAccess(req, section)` - Check section access
- `filterResponseData(req, data, section)` - Filter responses
- `logStaffAction(req, action, details)` - Audit logging
- Response formatting helpers

---

## 🔧 Migration Steps

### **Step 1: Update Routes**

#### **Before:**
```javascript
const { protect, updateLastActive } = require('../middleware/auth');
const { requirePermission } = require('../middleware/unifiedCoachAuth');

router.use(protect, updateLastActive);

router.get('/', requirePermission('leads:read'), getLeads);
router.post('/', requirePermission('leads:write'), createLead);
router.put('/:id', requirePermission('leads:update'), updateLead);
router.delete('/:id', requirePermission('leads:delete'), deleteLead);
```

#### **After:**
```javascript
const { unifiedSectionAuth, requireSection } = require('../middleware/sectionAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const { SECTIONS } = require('../utils/sectionPermissions');

router.use(unifiedSectionAuth(), updateLastActive);

// All lead routes use single section check
router.get('/', requireSection(SECTIONS.LEADS), getLeads);
router.post('/', requireSection(SECTIONS.LEADS), createLead);
router.put('/:id', requireSection(SECTIONS.LEADS), updateLead);
router.delete('/:id', requireSection(SECTIONS.LEADS), deleteLead);
```

### **Step 2: Update Controllers**

#### **Before:**
```javascript
const CoachStaffService = require('../services/coachStaffService');

exports.getLeads = async (req, res) => {
    const coachId = CoachStaffService.getCoachIdForQuery(req);
    const userContext = CoachStaffService.getUserContext(req);
    
    // Check specific permission
    if (userContext.isStaff && !CoachStaffService.hasPermission(req, 'leads:read')) {
        return res.status(403).json({ message: 'Permission denied' });
    }
    
    const leads = await Lead.find({ coachId });
    
    const filteredData = CoachStaffService.filterResponseData(
        req, 
        leads, 
        'leads:read'
    );
    
    res.json({ success: true, data: filteredData });
};
```

#### **After:**
```javascript
const SectionService = require('../services/sectionService');
const { SECTIONS } = require('../utils/sectionPermissions');

exports.getLeads = async (req, res) => {
    const coachId = SectionService.getCoachIdForQuery(req);
    const userContext = SectionService.getUserContext(req);
    
    // No need to check permission - middleware already did it
    // Just get data and filter if needed
    
    const leads = await Lead.find({ coachId });
    
    // Log staff action
    if (userContext.isStaff) {
        await SectionService.logStaffAction(req, 'view_leads', { count: leads.length });
    }
    
    res.json({ 
        success: true, 
        data: leads,
        userContext 
    });
};
```

### **Step 3: Update Staff Schema (Optional)**

The `Staff` schema already has a `permissions` field that stores an array of strings. No schema changes needed - we'll just store section names instead of fine-grained permissions.

```javascript
// Staff.permissions field can store section names directly
staff.permissions = ['leads', 'funnels', 'calendar'];
```

---

## 📝 Route-by-Route Migration Checklist

### **✅ Dashboard Routes** (`/api/coach/dashboard`)
- [ ] Replace `unifiedCoachAuth()` with `unifiedSectionAuth()`
- [ ] Replace `requirePermission('dashboard:read')` with `requireSection(SECTIONS.DASHBOARD)`
- [ ] Update controller to use `SectionService`

### **✅ Lead Routes** (`/api/leads`, `/api/lead-magnets`)
- [ ] Replace authentication middleware
- [ ] Use `requireSection(SECTIONS.LEADS)` for all lead routes
- [ ] Update controllers to use `SectionService`

### **✅ Funnel Routes** (`/api/funnels`)
- [ ] Replace authentication middleware
- [ ] Use `requireSection(SECTIONS.FUNNELS)` for all funnel routes
- [ ] Update controllers to use `SectionService`

### **✅ Messaging Routes** (`/api/whatsapp`, `/api/unified-messaging`)
- [ ] Replace authentication middleware
- [ ] Use `requireSection(SECTIONS.MESSAGING)` for messaging routes
- [ ] Update controllers to use `SectionService`

### **✅ Calendar Routes** (`/api/coach/availability`, `/api/staff-calendar`)
- [ ] Replace authentication middleware
- [ ] Use `requireSection(SECTIONS.CALENDAR)` for calendar routes
- [ ] Update controllers to use `SectionService`

### **✅ Marketing Routes** (`/api/marketing`, `/api/ads`)
- [ ] Replace authentication middleware
- [ ] Use `requireSection(SECTIONS.MARKETING)` for marketing routes
- [ ] Update controllers to use `SectionService`

### **✅ Automation Routes** (`/api/automation-rules`, `/api/nurturing-sequence`)
- [ ] Replace authentication middleware
- [ ] Use `requireSection(SECTIONS.AUTOMATION)` for automation routes
- [ ] Update controllers to use `SectionService`

### **✅ MLM Routes** (`/api/mlm`, `/api/coach/hierarchy`)
- [ ] Replace authentication middleware
- [ ] Use `requireSection(SECTIONS.MLM)` for MLM routes
- [ ] Update controllers to use `SectionService`

### **✅ Zoom Routes** (`/api/zoom`)
- [ ] Replace authentication middleware
- [ ] Use `requireSection(SECTIONS.ZOOM)` for Zoom routes
- [ ] Update controllers to use `SectionService`

### **✅ Payment Gateway Routes** (`/api/coach/payment`)
- [ ] Replace authentication middleware
- [ ] Use `requireSection(SECTIONS.PAYMENT_GATEWAY)` for payment routes
- [ ] Update controllers to use `SectionService`

### **✅ Domain Routes** (`/api/custom-domain`)
- [ ] Replace authentication middleware
- [ ] Use `requireSection(SECTIONS.DOMAINS)` for domain routes
- [ ] Update controllers to use `SectionService`

### **✅ Template Routes** (`/api/message-templates`)
- [ ] Replace authentication middleware
- [ ] Use `requireSection(SECTIONS.TEMPLATES)` for template routes
- [ ] Update controllers to use `SectionService`

### **✅ Course Routes** (`/api/courses`, `/api/paymentsv1`)
- [ ] Replace authentication middleware
- [ ] Use `requireSection(SECTIONS.COURSES)` for course routes
- [ ] Update controllers to use `SectionService`

### **✅ Subscription Routes** (`/api/subscription`) - SPECIAL
- [ ] Replace authentication middleware
- [ ] Use `blockSubscriptionForStaff()` middleware
- [ ] Return "Permission not found" for staff

### **✅ Staff Management Routes** (`/api/coach/staff`)
- [ ] Replace authentication middleware
- [ ] Use `requireSection(SECTIONS.STAFF_MANAGEMENT)` for staff routes
- [ ] Update controllers to use `SectionService`

---

## 🎨 Staff Dashboard Design

### **Dashboard Sections for Staff**

The staff dashboard should show:

#### **1. Quick Stats**
- Assigned leads count
- Today's appointments
- Pending tasks
- Recent activities

#### **2. Today's Priority**
- Upcoming appointments (next 3 hours)
- High-priority leads
- Overdue tasks
- Pending follow-ups

#### **3. Recent Activity**
- Recent lead interactions
- Completed tasks
- Sent messages
- Booked appointments

#### **4. Accessible Sections**
- Show cards/buttons for sections staff has access to
- Gray out sections without access
- Show "Request Access" button for locked sections

#### **5. Performance Metrics** (if has access)
- Leads converted this week
- Appointments booked
- Messages sent
- Tasks completed

---

## 🔐 Permission Presets

### **Pre-defined Staff Roles**

#### **Sales Representative**
```javascript
sections: ['dashboard', 'leads', 'funnels', 'calendar', 'messaging', 'profile']
```

#### **Marketing Manager**
```javascript
sections: ['dashboard', 'marketing', 'leads', 'automation', 'templates', 'profile']
```

#### **Operations Manager**
```javascript
sections: ['dashboard', 'calendar', 'leads', 'messaging', 'templates', 'profile']
```

#### **Content Manager**
```javascript
sections: ['dashboard', 'courses', 'templates', 'profile']
```

#### **Technical Manager**
```javascript
sections: ['dashboard', 'zoom', 'payment_gateway', 'domains', 'automation', 'profile']
```

#### **Team Lead**
```javascript
sections: [
    'dashboard', 'leads', 'funnels', 'calendar', 'messaging',
    'marketing', 'automation', 'templates', 'staff_management', 'profile'
]
```

---

## 📡 API Changes

### **New Endpoint: Get All Sections**
```
GET /api/coach/staff/sections
```

**Response:**
```json
{
    "success": true,
    "data": {
        "sections": {
            "Core": [
                {
                    "section": "dashboard",
                    "name": "Dashboard",
                    "description": "Access to staff dashboard",
                    "icon": "📊",
                    "alwaysAccessible": true
                }
            ],
            "Sales & Marketing": [
                {
                    "section": "leads",
                    "name": "Lead Management",
                    "description": "Manage leads and lead magnets",
                    "icon": "👥"
                }
            ]
        },
        "presets": {
            "Sales Representative": ["dashboard", "leads", "funnels", "calendar", "messaging", "profile"],
            "Marketing Manager": ["dashboard", "marketing", "leads", "automation", "templates", "profile"]
        },
        "totalSections": 16,
        "userContext": {
            "isStaff": true,
            "sections": ["leads", "calendar"]
        }
    }
}
```

### **Updated Endpoint: Assign Sections to Staff**
```
PUT /api/coach/staff/:staffId/sections
```

**Body:**
```json
{
    "sections": ["leads", "funnels", "calendar", "messaging"]
}
```

**Response:**
```json
{
    "success": true,
    "message": "Staff sections updated successfully",
    "data": {
        "staffId": "staff_id_here",
        "sections": ["leads", "funnels", "calendar", "messaging"],
        "updatedAt": "2025-10-09T10:30:00Z"
    }
}
```

---

## 🧪 Testing Strategy

### **Test Cases**

#### **1. Section Access**
- ✅ Staff with `leads` section can access all lead routes
- ✅ Staff without `leads` section gets 403 on lead routes
- ✅ Coach can access all sections

#### **2. Subscription Blocking**
- ✅ Staff accessing subscription routes gets "Permission not found"
- ✅ Coach can access subscription routes normally

#### **3. Dashboard Access**
- ✅ Staff always have dashboard access
- ✅ Staff dashboard shows only accessible sections
- ✅ Staff dashboard shows appropriate data

#### **4. Data Filtering**
- ✅ Staff only see their coach's data
- ✅ Cross-coach data access is blocked
- ✅ "No data found" for sections without access

#### **5. Audit Logging**
- ✅ All staff actions are logged
- ✅ Logs include section, action, and details
- ✅ Coach can view staff activity logs

---

## 🚀 Rollout Plan

### **Phase 1: Setup (Week 1)**
- ✅ Create new permission files
- ✅ Create middleware and services
- ✅ Create migration documentation
- [ ] Test new system in development

### **Phase 2: Migration (Week 2)**
- [ ] Update all route files
- [ ] Update all controller files
- [ ] Update staff management endpoints
- [ ] Create section management API

### **Phase 3: Frontend (Week 3)**
- [ ] Update frontend to use section-based permissions
- [ ] Create staff dashboard
- [ ] Update permission management UI
- [ ] Add section selection interface

### **Phase 4: Testing (Week 4)**
- [ ] Comprehensive testing
- [ ] Performance testing
- [ ] Security testing
- [ ] User acceptance testing

### **Phase 5: Deployment (Week 5)**
- [ ] Deploy to staging
- [ ] Final testing
- [ ] Deploy to production
- [ ] Monitor and fix issues

---

## 📊 Migration Script

### **Convert Existing Permissions to Sections**

```javascript
// migration/convertToSections.js

const Staff = require('../schema/Staff');

// Mapping from old permissions to new sections
const permissionToSectionMap = {
    'leads:read': 'leads',
    'leads:write': 'leads',
    'leads:update': 'leads',
    'leads:delete': 'leads',
    'leads:manage': 'leads',
    
    'funnels:read': 'funnels',
    'funnels:write': 'funnels',
    'funnels:update': 'funnels',
    'funnels:delete': 'funnels',
    'funnels:manage': 'funnels',
    'funnels:view_analytics': 'funnels',
    'funnels:edit_stages': 'funnels',
    'funnels:manage_stages': 'funnels',
    'funnels:publish': 'funnels',
    'funnels:unpublish': 'funnels',
    
    'calendar:read': 'calendar',
    'calendar:write': 'calendar',
    'calendar:update': 'calendar',
    'calendar:delete': 'calendar',
    'calendar:manage': 'calendar',
    'calendar:book': 'calendar',
    
    'marketing:read': 'marketing',
    'marketing:manage': 'marketing',
    
    'ads:read': 'marketing',
    'ads:write': 'marketing',
    'ads:update': 'marketing',
    'ads:delete': 'marketing',
    'ads:manage': 'marketing',
    'ads:analytics': 'marketing',
    
    'automation:read': 'automation',
    'automation:write': 'automation',
    'automation:update': 'automation',
    'automation:delete': 'automation',
    'automation:manage': 'automation',
    'automation:execute': 'automation',
    
    'whatsapp:read': 'messaging',
    'whatsapp:write': 'messaging',
    'whatsapp:send': 'messaging',
    'whatsapp:manage': 'messaging',
    'whatsapp:templates': 'messaging',
    
    'templates:read': 'templates',
    'templates:write': 'templates',
    'templates:update': 'templates',
    'templates:delete': 'templates',
    
    'mlm:read': 'mlm',
    'mlm:manage': 'mlm',
    
    'staff:read': 'staff_management',
    'staff:write': 'staff_management',
    'staff:update': 'staff_management',
    'staff:delete': 'staff_management',
    'staff:manage': 'staff_management',
    
    'payment:read': 'payment_gateway',
    'payment:manage': 'payment_gateway',
    
    'plan:read': 'courses',
    'plan:write': 'courses',
    'plan:update': 'courses',
    'plan:delete': 'courses'
};

async function convertPermissionsToSections() {
    try {
        const allStaff = await Staff.find({});
        
        console.log(`Found ${allStaff.length} staff members to migrate`);
        
        for (const staff of allStaff) {
            const oldPermissions = staff.permissions || [];
            const newSections = new Set();
            
            // Convert old permissions to sections
            for (const permission of oldPermissions) {
                const section = permissionToSectionMap[permission];
                if (section) {
                    newSections.add(section);
                }
            }
            
            // Always add dashboard and profile
            newSections.add('dashboard');
            newSections.add('profile');
            
            // Update staff with new sections
            staff.permissions = Array.from(newSections);
            await staff.save();
            
            console.log(`✅ Migrated staff ${staff._id}: ${oldPermissions.length} permissions → ${newSections.size} sections`);
        }
        
        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

module.exports = { convertPermissionsToSections };
```

---

## 🎯 Success Criteria

The migration is considered successful when:

- ✅ All routes use section-based authentication
- ✅ All controllers use `SectionService`
- ✅ Staff can access sections they're granted
- ✅ Staff cannot access restricted sections
- ✅ Subscription is blocked for staff
- ✅ Dashboard shows appropriate data
- ✅ Audit logging works correctly
- ✅ Performance is maintained
- ✅ All tests pass

---

## 📞 Support & Troubleshooting

### **Common Issues**

#### **Issue: Staff can't access any routes**
**Solution**: Check if staff has `dashboard` section assigned (should be automatic)

#### **Issue: "Permission not found" on all routes**
**Solution**: Verify middleware order - `unifiedSectionAuth()` must come before `requireSection()`

#### **Issue: Coach sees permission errors**
**Solution**: Ensure `req.role === 'coach'` check bypasses section checks

#### **Issue: Old permissions still in database**
**Solution**: Run migration script to convert old permissions to sections

---

*This migration guide will be updated as implementation progresses.*

