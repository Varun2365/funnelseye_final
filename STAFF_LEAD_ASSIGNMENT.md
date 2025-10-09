# 🎯 Staff Lead Assignment System

## 📋 Overview

Staff members can only see and work with **leads that are assigned to them**, not all of the coach's leads. This ensures proper lead distribution and accountability.

---

## 🔑 Key Concept

### **Coach Access**
```javascript
// Coach sees ALL their leads
GET /api/leads
→ Returns all leads where coachId = coach's ID
```

### **Staff Access**
```javascript
// Staff sees ONLY their assigned leads
GET /api/leads
→ Returns leads where:
   - coachId = staff's assigned coach ID
   - assignedTo = staff's user ID
```

---

## 📊 Lead Schema

The `Lead` schema already has the `assignedTo` field:

```javascript
assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
}
```

This field stores the User ID of the staff member (or coach) to whom the lead is assigned.

---

## 🔧 How It Works

### **1. Automatic Filtering in Service**

The `SectionService.buildLeadFilter()` function automatically filters leads:

```javascript
/**
 * Build lead-specific filter
 * Staff only see leads assigned to them
 */
function buildLeadFilter(req, additionalFilters = {}) {
    const baseFilter = {
        coachId: req.coachId,
        ...additionalFilters
    };

    // Staff only see their assigned leads
    if (req.role === 'staff') {
        baseFilter.assignedTo = req.userId;
    }

    return baseFilter;
}
```

### **2. Usage in Controllers**

Controllers should use `buildLeadFilter()` for all lead queries:

```javascript
const SectionService = require('../services/sectionService');

exports.getLeads = async (req, res) => {
    try {
        // Build filter - automatically adds assignedTo for staff
        const filter = SectionService.buildLeadFilter(req);
        
        // Query with filter
        const leads = await Lead.find(filter);
        
        // Coach gets all their leads
        // Staff gets only their assigned leads
        
        res.json({
            success: true,
            data: leads,
            count: leads.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
```

### **3. Additional Filters**

You can add more filters while maintaining lead assignment:

```javascript
// Filter by status and assignment
const filter = SectionService.buildLeadFilter(req, {
    status: 'Hot',
    leadTemperature: 'Warm'
});

// For coach: { coachId: X, status: 'Hot', leadTemperature: 'Warm' }
// For staff: { coachId: X, assignedTo: Y, status: 'Hot', leadTemperature: 'Warm' }
```

---

## 📝 Lead Assignment Flow

### **Scenario 1: Coach Assigns Lead to Staff**

```javascript
// Coach assigns lead to staff member
PUT /api/leads/:leadId
Body: {
    assignedTo: "staff_user_id_here"
}

// Lead is now assigned to staff
// Staff can now see this lead in their lead list
```

### **Scenario 2: Auto-Assignment via Calendar**

```javascript
// When appointment is assigned to staff, lead is also assigned
POST /api/staff-appointments/assign
Body: {
    appointmentId: "appointment_id",
    staffId: "staff_user_id"
}

// System automatically:
// 1. Assigns appointment to staff
// 2. Assigns related lead to staff
// 3. Staff can now see lead and appointment
```

### **Scenario 3: Bulk Assignment**

```javascript
// Coach assigns multiple leads to staff
POST /api/leads/bulk-assign
Body: {
    leadIds: ["lead1", "lead2", "lead3"],
    assignedTo: "staff_user_id"
}

// All specified leads are assigned to staff
```

---

## 🎯 Example Scenarios

### **Example 1: Coach Views Leads**

```javascript
// Coach token
GET /api/leads

// Request context:
req.role = 'coach'
req.coachId = 'coach123'
req.userId = 'coach123'

// Filter built:
{
    coachId: 'coach123'
}

// Returns: ALL leads for coach123 (100 leads)
```

### **Example 2: Staff Views Leads**

```javascript
// Staff token
GET /api/leads

// Request context:
req.role = 'staff'
req.coachId = 'coach123'  // Staff's assigned coach
req.userId = 'staff456'    // Staff's own ID

// Filter built:
{
    coachId: 'coach123',
    assignedTo: 'staff456'
}

// Returns: ONLY leads assigned to staff456 (15 leads)
```

### **Example 3: Staff Views Specific Lead**

```javascript
// Staff token
GET /api/leads/lead789

// System checks:
1. Does lead exist?
2. Is lead.coachId = staff's coach?
3. Is lead.assignedTo = staff's user ID?

// If all true: ✅ Return lead
// If any false: ❌ 404 Not Found
```

---

## 🔐 Security Implications

### **1. Data Isolation**
- Staff can **only** see leads assigned to them
- Staff **cannot** see other staff members' leads
- Staff **cannot** see unassigned leads
- Coach sees **all** leads

### **2. Cross-Staff Access Prevention**
```javascript
// Staff A tries to access Staff B's lead
GET /api/leads/lead_assigned_to_staff_b

// Filter: { coachId: X, assignedTo: staff_a_id }
// Lead has: { coachId: X, assignedTo: staff_b_id }
// Result: ❌ Not found (filtered out)
```

### **3. Unassigned Leads**
```javascript
// Staff tries to see unassigned leads
GET /api/leads

// Filter: { coachId: X, assignedTo: staff_id }
// Unassigned leads have: { coachId: X, assignedTo: null }
// Result: ❌ Not visible to staff
```

---

## 📊 Dashboard Implications

### **Coach Dashboard**
```javascript
GET /api/coach-dashboard/overview

// Shows:
- Total leads: 100
- Assigned leads: 60
- Unassigned leads: 40
- Leads by staff member
- Lead distribution chart
```

### **Staff Dashboard**
```javascript
GET /api/coach-dashboard/overview

// Shows:
- My assigned leads: 15
- My hot leads: 5
- My follow-ups today: 3
- My conversion rate: 20%
- Cannot see other staff's data
- Cannot see unassigned leads
```

---

## 🎨 Frontend Implications

### **Lead List View**

#### **Coach View:**
```javascript
// Lead list shows all leads with assignment status
[
    { id: 1, name: "John Doe", assignedTo: "Staff A", status: "Hot" },
    { id: 2, name: "Jane Smith", assignedTo: "Staff B", status: "Warm" },
    { id: 3, name: "Bob Wilson", assignedTo: null, status: "Cold" },  // Unassigned
    { id: 4, name: "Alice Brown", assignedTo: "Staff A", status: "Hot" }
]

// Coach can:
- View all leads
- Assign/reassign leads
- See which staff has which leads
- Filter by assigned staff
```

#### **Staff View:**
```javascript
// Lead list shows only assigned leads
[
    { id: 1, name: "John Doe", assignedTo: "Me", status: "Hot" },
    { id: 4, name: "Alice Brown", assignedTo: "Me", status: "Hot" }
]

// Staff can:
- View only their assigned leads
- Work with their leads
- Cannot see unassigned leads
- Cannot see other staff's leads
```

---

## 🔄 Lead Assignment API

### **1. Assign Lead to Staff**
```http
PUT /api/leads/:leadId/assign
Authorization: Bearer <coach_token>
Content-Type: application/json

{
    "assignedTo": "staff_user_id"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Lead assigned successfully",
    "data": {
        "leadId": "lead123",
        "assignedTo": "staff456",
        "assignedAt": "2025-10-09T10:30:00Z"
    }
}
```

### **2. Unassign Lead**
```http
PUT /api/leads/:leadId/unassign
Authorization: Bearer <coach_token>
```

**Response:**
```json
{
    "success": true,
    "message": "Lead unassigned successfully",
    "data": {
        "leadId": "lead123",
        "assignedTo": null
    }
}
```

### **3. Bulk Assign Leads**
```http
POST /api/leads/bulk-assign
Authorization: Bearer <coach_token>
Content-Type: application/json

{
    "leadIds": ["lead1", "lead2", "lead3"],
    "assignedTo": "staff_user_id"
}
```

**Response:**
```json
{
    "success": true,
    "message": "3 leads assigned successfully",
    "data": {
        "assignedCount": 3,
        "assignedTo": "staff456"
    }
}
```

### **4. Get Staff's Assigned Leads**
```http
GET /api/leads?assignedTo=staff_user_id
Authorization: Bearer <coach_token>
```

**Response:**
```json
{
    "success": true,
    "data": [
        { "id": "lead1", "name": "John Doe", "status": "Hot" },
        { "id": "lead2", "name": "Alice Brown", "status": "Warm" }
    ],
    "count": 2
}
```

---

## 🎯 Other Resources with Assignment

The same assignment pattern applies to other resources:

### **Tasks**
```javascript
// Tasks schema already has assignedTo field
assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
}

// Staff only see tasks assigned to them
```

### **Appointments**
```javascript
// Appointments schema has assignedStaffId field
assignedStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: false
}

// Staff only see appointments assigned to them
```

### **Funnels**
```javascript
// Funnels are NOT assigned to individual staff
// Staff with 'funnels' section see ALL coach's funnels
// This is because funnels are shared resources
```

---

## 📋 Implementation Checklist

### **For Lead Controllers:**

- [ ] Import `SectionService`
- [ ] Replace direct queries with `buildLeadFilter()`
- [ ] Update all lead list endpoints
- [ ] Update lead detail endpoints
- [ ] Update lead update endpoints
- [ ] Update lead delete endpoints
- [ ] Add lead assignment endpoints

### **Example Update:**

#### **Before:**
```javascript
exports.getLeads = async (req, res) => {
    const coachId = req.coachId;
    const leads = await Lead.find({ coachId });
    res.json({ success: true, data: leads });
};
```

#### **After:**
```javascript
exports.getLeads = async (req, res) => {
    const filter = SectionService.buildLeadFilter(req);
    const leads = await Lead.find(filter);
    
    // Log staff action
    if (SectionService.isStaff(req)) {
        await SectionService.logStaffAction(req, 'view_leads', {
            count: leads.length
        });
    }
    
    res.json({ success: true, data: leads });
};
```

---

## 🚀 Benefits

### **1. Clear Ownership**
- Each lead has a clear owner
- No confusion about who's responsible
- Better accountability

### **2. Performance**
- Staff queries are faster (fewer leads)
- Better database indexing
- Reduced data transfer

### **3. Privacy**
- Staff don't see each other's leads
- Competitive environment maintained
- Data privacy ensured

### **4. Better Management**
- Coach can distribute leads evenly
- Track staff performance individually
- Identify bottlenecks

---

## 📊 Summary

**Key Points:**
1. ✅ **Staff see only their assigned leads**
2. ✅ **Coach sees all leads**
3. ✅ **Automatic filtering in service layer**
4. ✅ **Lead schema already has `assignedTo` field**
5. ✅ **Use `buildLeadFilter()` in all lead queries**
6. ✅ **Same pattern for tasks and appointments**
7. ✅ **Funnels remain shared (not assigned)**

**This ensures proper lead distribution and data isolation between staff members!** 🎯

