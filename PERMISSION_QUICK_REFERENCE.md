# 🎯 Staff Permissions - Quick Reference Card

## 📊 All 21 Permissions

### **Always Granted (2)**
```
✅ dashboard
✅ profile
```

### **Simple Sections - Full Access (12)**
```
funnels
messaging
calendar
marketing
automation
mlm
zoom
payment_gateway
domains
templates
courses
staff_management
```

### **Fine-Grained Lead Permissions (7)**
```
leads:view          → View assigned leads
leads:create        → Create new leads
leads:update        → Update leads
leads:delete        → Delete leads
leads:assign        → Assign leads to staff
leads:export        → Export lead data
leads:manage_all    → See ALL coach leads + all permissions
```

### **Always Blocked (1)**
```
❌ subscription
```

---

## 🎯 Quick Permission Guide

### **What Each Lead Permission Grants:**

| Permission | View Assigned | View All | Create | Update | Delete | Assign | Export |
|------------|:-------------:|:--------:|:------:|:------:|:------:|:------:|:------:|
| `leads:view` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `leads:create` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `leads:update` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `leads:delete` | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `leads:assign` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `leads:export` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `leads:manage_all` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🎨 Permission Presets

### **Sales Representative**
```json
["dashboard", "leads:view", "leads:create", "leads:update", "funnels", "calendar", "messaging", "profile"]
```

### **Lead Manager**
```json
["dashboard", "leads:view", "leads:create", "leads:update", "leads:delete", "leads:assign", "leads:export", "funnels", "calendar", "messaging", "profile"]
```

### **Senior Lead Manager**
```json
["dashboard", "leads:view", "leads:create", "leads:update", "leads:delete", "leads:assign", "leads:export", "leads:manage_all", "funnels", "calendar", "messaging", "profile"]
```

### **Team Lead**
```json
["dashboard", "leads:view", "leads:create", "leads:update", "leads:delete", "leads:assign", "leads:export", "leads:manage_all", "funnels", "calendar", "messaging", "marketing", "automation", "templates", "staff_management", "profile"]
```

---

## 🔧 API Endpoints

### **Get All Permissions**
```http
GET /api/coach/staff/sections
```

### **Create Staff**
```http
POST /api/coach/staff
Body: {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "permissions": ["leads:view", "leads:create", "funnels"]
}
```

### **Update Permissions**
```http
PUT /api/coach/staff/:staffId/sections
Body: {
    "sections": ["leads:view", "leads:create", "leads:update", "funnels", "calendar"]
}
```

### **Assign Preset**
```http
POST /api/coach/staff/:staffId/section-preset
Body: {
    "presetName": "Lead Manager"
}
```

---

## 📋 Common Scenarios

### **Junior Sales Staff**
```json
["leads:view", "leads:create", "funnels", "calendar"]
```
Can: View assigned leads, create leads, manage funnels, manage calendar

### **Senior Sales Staff**
```json
["leads:view", "leads:create", "leads:update", "leads:delete", "leads:assign", "funnels", "calendar", "messaging"]
```
Can: Full lead management (assigned only), funnels, calendar, messaging

### **Sales Manager**
```json
["leads:manage_all", "funnels", "calendar", "messaging", "marketing"]
```
Can: See ALL leads, manage funnels, calendar, messaging, marketing

### **Operations Staff**
```json
["leads:view", "leads:update", "calendar", "messaging", "templates"]
```
Can: View/update assigned leads, manage calendar, messaging, templates

### **Marketing Staff**
```json
["leads:view", "leads:create", "marketing", "automation", "templates"]
```
Can: View/create leads, manage marketing, automation, templates

### **Technical Staff**
```json
["zoom", "payment_gateway", "domains", "automation"]
```
Can: Manage all technical integrations and settings

---

## ⚡ Quick Tips

### **Lead Permissions:**
- Use `leads:view` for read-only access
- Use `leads:manage_all` for managers who need to see all leads
- Without `leads:manage_all`, staff only see their assigned leads

### **Section Permissions:**
- Granting a section gives FULL access to that section
- No need for read/write/update permissions
- Simple and easy to manage

### **Always Remember:**
- `dashboard` and `profile` are auto-granted
- `subscription` is always blocked for staff
- `leads:manage_all` grants ALL lead permissions

---

## 🎯 Permission Formula

```
Total Permissions = 21
├── Always Granted: 2 (dashboard, profile)
├── Simple Sections: 12 (full access)
├── Lead Permissions: 7 (fine-grained)
└── Always Blocked: 1 (subscription)
```

---

*For complete documentation, see `STAFF_PERMISSIONS_TESTING_GUIDE.md`*

