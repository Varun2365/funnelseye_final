# 🧪 Staff Permissions System - Complete Testing Guide

## 📋 Overview

This guide covers testing the **section-based permission system** with **fine-grained lead permissions**. The system uses simple section permissions for most features, but provides granular control for lead management.

---

## 🎯 Permission System Structure

### **Section-Based Permissions** (Simple - Full Access)
Most features use simple section permissions where granting access gives **full access** to that section:

- `dashboard` - Dashboard access (always granted)
- `funnels` - Full funnel management
- `messaging` - Full messaging access
- `calendar` - Full calendar access
- `marketing` - Full marketing access
- `automation` - Full automation access
- `mlm` - Full MLM access
- `zoom` - Full Zoom settings access
- `payment_gateway` - Full payment gateway access
- `domains` - Full domain management
- `templates` - Full template management
- `courses` - Full course management
- `profile` - Profile access (always granted)
- `staff_management` - Staff management access
- `subscription` - **BLOCKED for staff**

### **Fine-Grained Lead Permissions** (Granular Control)
Lead management has **7 specific permissions**:

1. **`leads:view`** - View assigned leads
2. **`leads:create`** - Create new leads
3. **`leads:update`** - Update lead information
4. **`leads:delete`** - Delete leads
5. **`leads:assign`** - Assign leads to other staff
6. **`leads:export`** - Export lead data
7. **`leads:manage_all`** - View and manage ALL coach leads (not just assigned)

---

## 📊 Complete Permission Enum List

### **All Available Permissions:**

```javascript
// Core Sections (Always Accessible)
'dashboard'
'profile'

// Simple Section Permissions
'funnels'
'messaging'
'calendar'
'marketing'
'automation'
'mlm'
'zoom'
'payment_gateway'
'domains'
'templates'
'courses'
'staff_management'

// Fine-Grained Lead Permissions
'leads:view'
'leads:create'
'leads:update'
'leads:delete'
'leads:assign'
'leads:export'
'leads:manage_all'

// Blocked for Staff
'subscription' // Always blocked
```

**Total: 21 permissions** (2 always granted, 12 simple sections, 7 lead permissions)

---

## 🔧 Staff Management API Endpoints

### **Base URL:** `/api/coach/staff`

All endpoints require coach authentication or staff with `staff_management` permission.

---

### **1. Get All Sections & Permissions**

```http
GET /api/coach/staff/sections
Authorization: Bearer <coach_or_staff_token>
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
                    "description": "Staff dashboard with tasks",
                    "icon": "📊",
                    "alwaysAccessible": true,
                    "category": "Core"
                }
            ],
            "Lead Management": [
                {
                    "section": "leads:view",
                    "name": "View Leads",
                    "description": "View assigned leads",
                    "icon": "👁️",
                    "category": "Lead Management",
                    "parentSection": "leads"
                },
                {
                    "section": "leads:create",
                    "name": "Create Leads",
                    "description": "Create new leads",
                    "icon": "➕",
                    "category": "Lead Management",
                    "parentSection": "leads"
                }
                // ... all 7 lead permissions
            ],
            "Sales & Marketing": [
                {
                    "section": "funnels",
                    "name": "Funnel Management",
                    "description": "Create and manage funnels",
                    "icon": "🔄",
                    "category": "Sales & Marketing"
                }
            ]
            // ... all other sections
        },
        "presets": {
            "Sales Representative": ["dashboard", "leads:view", "leads:create", "leads:update", "funnels", "calendar", "messaging", "profile"],
            "Lead Manager": ["dashboard", "leads:view", "leads:create", "leads:update", "leads:delete", "leads:assign", "leads:export", "funnels", "calendar", "messaging", "profile"],
            "Senior Lead Manager": ["dashboard", "leads:view", "leads:create", "leads:update", "leads:delete", "leads:assign", "leads:export", "leads:manage_all", "funnels", "calendar", "messaging", "profile"]
            // ... all presets
        },
        "totalCategories": 8,
        "totalSections": 21
    }
}
```

---

### **2. Create Staff Member**

```http
POST /api/coach/staff
Authorization: Bearer <coach_token>
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "permissions": ["dashboard", "leads:view", "leads:create", "funnels", "profile"]
}
```

**Response:**
```json
{
    "success": true,
    "message": "Staff member created successfully",
    "data": {
        "staffId": "staff_id_here",
        "name": "John Doe",
        "email": "john@example.com",
        "permissions": ["dashboard", "leads:view", "leads:create", "funnels", "profile"],
        "isActive": true,
        "createdAt": "2025-10-09T10:30:00Z"
    }
}
```

---

### **3. Update Staff Permissions**

```http
PUT /api/coach/staff/:staffId/sections
Authorization: Bearer <coach_token>
Content-Type: application/json

{
    "sections": ["leads:view", "leads:create", "leads:update", "leads:delete", "funnels", "calendar"]
}
```

**Response:**
```json
{
    "success": true,
    "message": "Staff sections updated successfully",
    "data": {
        "staffId": "staff_id_here",
        "sections": ["dashboard", "leads:view", "leads:create", "leads:update", "leads:delete", "funnels", "calendar", "profile"],
        "updatedAt": "2025-10-09T11:00:00Z"
    }
}
```

**Note:** `dashboard` and `profile` are automatically added!

---

### **4. Assign Permission Preset**

```http
POST /api/coach/staff/:staffId/section-preset
Authorization: Bearer <coach_token>
Content-Type: application/json

{
    "presetName": "Lead Manager"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Preset 'Lead Manager' assigned successfully",
    "data": {
        "staffId": "staff_id_here",
        "presetName": "Lead Manager",
        "sections": ["dashboard", "leads:view", "leads:create", "leads:update", "leads:delete", "leads:assign", "leads:export", "funnels", "calendar", "messaging", "profile"],
        "updatedAt": "2025-10-09T11:15:00Z"
    }
}
```

---

### **5. Get All Staff Members**

```http
GET /api/coach/staff
Authorization: Bearer <coach_token>
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "staffId": "staff1",
            "name": "John Doe",
            "email": "john@example.com",
            "permissions": ["dashboard", "leads:view", "leads:create", "funnels", "profile"],
            "isActive": true,
            "createdAt": "2025-10-09T10:30:00Z"
        },
        {
            "staffId": "staff2",
            "name": "Jane Smith",
            "email": "jane@example.com",
            "permissions": ["dashboard", "leads:view", "leads:create", "leads:update", "leads:delete", "leads:assign", "leads:export", "leads:manage_all", "funnels", "profile"],
            "isActive": true,
            "createdAt": "2025-10-08T09:00:00Z"
        }
    ],
    "count": 2
}
```

---

### **6. Get Staff Member Details**

```http
GET /api/coach/staff/:staffId
Authorization: Bearer <coach_token>
```

**Response:**
```json
{
    "success": true,
    "data": {
        "staffId": "staff_id_here",
        "name": "John Doe",
        "email": "john@example.com",
        "permissions": ["dashboard", "leads:view", "leads:create", "funnels", "profile"],
        "leadPermissions": {
            "canView": true,
            "canCreate": true,
            "canUpdate": false,
            "canDelete": false,
            "canAssign": false,
            "canExport": false,
            "canManageAll": false
        },
        "isActive": true,
        "createdAt": "2025-10-09T10:30:00Z"
    }
}
```

---

### **7. Update Staff Member**

```http
PUT /api/coach/staff/:staffId
Authorization: Bearer <coach_token>
Content-Type: application/json

{
    "name": "John Doe Updated",
    "isActive": true
}
```

---

### **8. Delete Staff Member**

```http
DELETE /api/coach/staff/:staffId
Authorization: Bearer <coach_token>
```

---

## 🎯 Permission Presets

### **1. Sales Representative**
```javascript
Permissions: [
    'dashboard',
    'leads:view',
    'leads:create',
    'leads:update',
    'funnels',
    'calendar',
    'messaging',
    'profile'
]
```
**Best For:** Entry-level sales staff who handle leads and appointments

---

### **2. Lead Manager**
```javascript
Permissions: [
    'dashboard',
    'leads:view',
    'leads:create',
    'leads:update',
    'leads:delete',
    'leads:assign',
    'leads:export',
    'funnels',
    'calendar',
    'messaging',
    'profile'
]
```
**Best For:** Mid-level staff who manage leads and can assign them to others

---

### **3. Senior Lead Manager**
```javascript
Permissions: [
    'dashboard',
    'leads:view',
    'leads:create',
    'leads:update',
    'leads:delete',
    'leads:assign',
    'leads:export',
    'leads:manage_all',  // Can see ALL coach leads!
    'funnels',
    'calendar',
    'messaging',
    'profile'
]
```
**Best For:** Senior staff who need visibility into all leads, not just assigned ones

---

### **4. Marketing Manager**
```javascript
Permissions: [
    'dashboard',
    'marketing',
    'leads:view',
    'leads:create',
    'automation',
    'templates',
    'profile'
]
```
**Best For:** Marketing team managing campaigns

---

### **5. Operations Manager**
```javascript
Permissions: [
    'dashboard',
    'calendar',
    'leads:view',
    'leads:update',
    'messaging',
    'templates',
    'profile'
]
```
**Best For:** Operations team managing appointments and communications

---

### **6. Content Manager**
```javascript
Permissions: [
    'dashboard',
    'courses',
    'templates',
    'profile'
]
```
**Best For:** Content creators managing courses

---

### **7. Technical Manager**
```javascript
Permissions: [
    'dashboard',
    'zoom',
    'payment_gateway',
    'domains',
    'automation',
    'profile'
]
```
**Best For:** Technical staff managing integrations

---

### **8. Team Lead**
```javascript
Permissions: [
    'dashboard',
    'leads:view',
    'leads:create',
    'leads:update',
    'leads:delete',
    'leads:assign',
    'leads:export',
    'leads:manage_all',
    'funnels',
    'calendar',
    'messaging',
    'marketing',
    'automation',
    'templates',
    'staff_management',
    'profile'
]
```
**Best For:** Senior staff who manage other team members

---

### **9. Full Access**
```javascript
Permissions: [All permissions except 'subscription']
```
**Best For:** Senior managers with full operational access

---

## 🧪 Testing Scenarios

### **Test 1: Basic Lead Permissions**

#### **Setup:**
Create staff with only `leads:view` permission

```http
POST /api/coach/staff
Body: {
    "name": "Test Staff",
    "email": "test@example.com",
    "password": "Test123!",
    "permissions": ["leads:view"]
}
```

#### **Tests:**

| Action | Endpoint | Expected Result |
|--------|----------|-----------------|
| View leads | `GET /api/leads` | ✅ Success - sees assigned leads only |
| Create lead | `POST /api/leads` | ❌ 403 Forbidden |
| Update lead | `PUT /api/leads/:id` | ❌ 403 Forbidden |
| Delete lead | `DELETE /api/leads/:id` | ❌ 403 Forbidden |
| Export leads | `GET /api/leads/export` | ❌ 403 Forbidden |

---

### **Test 2: Full Lead Permissions (except MANAGE_ALL)**

#### **Setup:**
Create staff with all lead permissions except `leads:manage_all`

```http
POST /api/coach/staff
Body: {
    "permissions": ["leads:view", "leads:create", "leads:update", "leads:delete", "leads:assign", "leads:export"]
}
```

#### **Tests:**

| Action | Endpoint | Expected Result |
|--------|----------|-----------------|
| View leads | `GET /api/leads` | ✅ Success - sees only assigned leads (15 leads) |
| Create lead | `POST /api/leads` | ✅ Success |
| Update lead | `PUT /api/leads/:id` | ✅ Success (only assigned leads) |
| Delete lead | `DELETE /api/leads/:id` | ✅ Success (only assigned leads) |
| Assign lead | `PUT /api/leads/:id/assign` | ✅ Success |
| Export leads | `GET /api/leads/export` | ✅ Success (only assigned leads) |
| View all leads | `GET /api/leads` | ✅ Success - but still only sees assigned leads |

---

### **Test 3: MANAGE_ALL Permission**

#### **Setup:**
Create staff with `leads:manage_all` permission

```http
POST /api/coach/staff
Body: {
    "permissions": ["leads:view", "leads:manage_all"]
}
```

#### **Tests:**

| Action | Endpoint | Expected Result |
|--------|----------|-----------------|
| View leads | `GET /api/leads` | ✅ Success - sees ALL coach leads (100 leads) |
| View unassigned leads | `GET /api/leads?assignedTo=null` | ✅ Success - can see unassigned |
| View other staff's leads | `GET /api/leads?assignedTo=staff_b` | ✅ Success - can see other staff leads |
| Create lead | `POST /api/leads` | ✅ Success (has MANAGE_ALL) |
| Update any lead | `PUT /api/leads/:id` | ✅ Success (has MANAGE_ALL) |
| Delete any lead | `DELETE /api/leads/:id` | ✅ Success (has MANAGE_ALL) |

**Note:** `leads:manage_all` grants ALL lead permissions!

---

### **Test 4: Section-Based Permissions**

#### **Setup:**
Create staff with various section permissions

```http
POST /api/coach/staff
Body: {
    "permissions": ["funnels", "calendar", "messaging"]
}
```

#### **Tests:**

| Section | Endpoint | Expected Result |
|---------|----------|-----------------|
| Funnels | `GET /api/funnels` | ✅ Full access to all funnel operations |
| Funnels | `POST /api/funnels` | ✅ Can create funnels |
| Funnels | `PUT /api/funnels/:id` | ✅ Can update funnels |
| Funnels | `DELETE /api/funnels/:id` | ✅ Can delete funnels |
| Calendar | `GET /api/staff-calendar` | ✅ Full calendar access |
| Calendar | `POST /api/staff-calendar` | ✅ Can create events |
| Messaging | `GET /api/whatsapp/v1/inbox` | ✅ Full messaging access |
| Messaging | `POST /api/whatsapp/v1/send` | ✅ Can send messages |
| Leads | `GET /api/leads` | ❌ 403 Forbidden (no lead permissions) |
| Marketing | `GET /api/ads` | ❌ 403 Forbidden (no marketing permission) |

---

### **Test 5: Subscription Blocking**

#### **Setup:**
Create staff with full access preset

```http
POST /api/coach/staff/:staffId/section-preset
Body: {
    "presetName": "Full Access"
}
```

#### **Tests:**

| Action | Endpoint | Expected Result |
|--------|----------|-----------------|
| View subscription | `GET /api/subscriptions` | ❌ "Permission not found" |
| Update subscription | `PUT /api/subscriptions` | ❌ "Permission not found" |
| View limits | `GET /api/coach/subscription-limits` | ❌ "Permission not found" |

**All subscription routes are ALWAYS blocked for staff!**

---

### **Test 6: Permission Preset Assignment**

#### **Test Each Preset:**

```http
POST /api/coach/staff/:staffId/section-preset
Body: { "presetName": "Sales Representative" }
```

**Verify:**
- Staff gets correct permissions
- `dashboard` and `profile` are auto-added
- Staff can access granted sections
- Staff cannot access non-granted sections

---

### **Test 7: Lead Assignment & Visibility**

#### **Setup:**
- Coach has 100 leads
- 30 leads assigned to Staff A
- 25 leads assigned to Staff B
- 45 leads unassigned

#### **Test Staff A (without MANAGE_ALL):**
```http
GET /api/leads
Authorization: Bearer <staff_a_token>
```
**Expected:** Returns only 30 leads (assigned to Staff A)

#### **Test Staff B (with MANAGE_ALL):**
```http
GET /api/leads
Authorization: Bearer <staff_b_token>
```
**Expected:** Returns all 100 leads (can see everything)

#### **Test Coach:**
```http
GET /api/leads
Authorization: Bearer <coach_token>
```
**Expected:** Returns all 100 leads

---

## 📊 Permission Testing Matrix

### **Lead Permissions Matrix:**

| Permission | View Assigned | View All | Create | Update | Delete | Assign | Export |
|------------|---------------|----------|--------|--------|--------|--------|--------|
| `leads:view` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `leads:create` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `leads:update` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `leads:delete` | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `leads:assign` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `leads:export` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `leads:manage_all` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Note:** Each permission includes all permissions above it + its own capability!

---

## 🔄 Testing Workflow

### **Complete Test Flow:**

1. **Get Available Sections**
   ```http
   GET /api/coach/staff/sections
   ```

2. **Create Staff Member**
   ```http
   POST /api/coach/staff
   Body: { permissions: ["leads:view", "funnels"] }
   ```

3. **Test Staff Access**
   ```http
   GET /api/leads (with staff token)
   GET /api/funnels (with staff token)
   GET /api/marketing (with staff token) // Should fail
   ```

4. **Update Permissions**
   ```http
   PUT /api/coach/staff/:staffId/sections
   Body: { sections: ["leads:view", "leads:create", "leads:update", "funnels", "calendar"] }
   ```

5. **Test Updated Access**
   ```http
   POST /api/leads (with staff token) // Now works
   GET /api/calendar (with staff token) // Now works
   ```

6. **Assign Preset**
   ```http
   POST /api/coach/staff/:staffId/section-preset
   Body: { presetName: "Lead Manager" }
   ```

7. **Verify Preset Applied**
   ```http
   GET /api/coach/staff/:staffId
   // Check permissions match preset
   ```

---

## 🎯 Success Criteria

The permission system is working correctly when:

- ✅ Staff with `leads:view` can only view assigned leads
- ✅ Staff with `leads:manage_all` can view all coach leads
- ✅ Staff with section permission have full access to that section
- ✅ Staff without permission get 403 Forbidden
- ✅ Subscription is always blocked for staff
- ✅ `dashboard` and `profile` are always accessible
- ✅ Permission presets apply correctly
- ✅ Lead permissions are granular and work independently
- ✅ Section permissions are simple and grant full access

---

## 📞 Troubleshooting

### **Issue: Staff can't access anything**
**Solution:** Check if `dashboard` permission is granted (should be automatic)

### **Issue: Staff sees all leads despite not having MANAGE_ALL**
**Solution:** Check if `leads:manage_all` is in permissions array

### **Issue: Staff can't create leads despite having `leads:view`**
**Solution:** Grant `leads:create` permission explicitly

### **Issue: Permission preset doesn't apply**
**Solution:** Verify preset name is correct (case-sensitive)

### **Issue: Staff can access subscription**
**Solution:** This should never happen - check middleware

---

## 📊 Summary

**Permission System:**
- **21 total permissions**
- **7 fine-grained lead permissions**
- **12 simple section permissions**
- **2 always-granted permissions** (dashboard, profile)
- **9 pre-defined role presets**
- **1 always-blocked section** (subscription)

**Key Features:**
- ✅ Simple section permissions for most features
- ✅ Granular lead permissions for precise control
- ✅ Lead assignment with visibility control
- ✅ `MANAGE_ALL` permission for senior staff
- ✅ Pre-defined role presets for quick setup
- ✅ Automatic `dashboard` and `profile` access

**The system is ready for production testing!** 🚀

