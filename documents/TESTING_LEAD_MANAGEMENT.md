# 🧪 **API Testing - Section 3: Lead Management & CRM**

## **📋 Prerequisites:**
- ✅ Login completed (you should have `{{authToken}}` and `{{coachId}}` stored)
- ✅ Server running on `http://localhost:8080`
- ✅ MongoDB connected
- ✅ Zoom integration working (optional, for testing)

---

## **👥 1. Lead Management Testing**

### **1.1 Create a New Lead**
```bash
POST /api/leads
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "source": "website",
  "status": "new",
  "priority": "high",
  "tags": ["fitness", "weight-loss"],
  "notes": "Interested in personal training program",
  "leadScore": 85,
  "budget": 500,
  "timeline": "immediate",
  "goals": ["lose weight", "build muscle"],
  "preferredContact": "whatsapp",
  "timezone": "America/New_York"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "lead_id_here",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "source": "website",
    "status": "new",
    "priority": "high",
    "leadScore": 85,
    "coachId": "{{coachId}}",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### **1.2 Get All Leads for Coach**
```bash
GET /api/leads
Authorization: Bearer {{authToken}}
```

**Query Parameters:**
- `?status=new` - Filter by status
- `?priority=high` - Filter by priority
- `?source=website` - Filter by source
- `?page=1&limit=10` - Pagination
- `?sortBy=createdAt&sortOrder=desc` - Sorting

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "lead_id_here",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "status": "new",
      "priority": "high",
      "leadScore": 85,
      "source": "website",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### **1.3 Get Lead by ID**
```bash
GET /api/leads/{{leadId}}
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "lead_id_here",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "source": "website",
    "status": "new",
    "priority": "high",
    "tags": ["fitness", "weight-loss"],
    "notes": "Interested in personal training program",
    "leadScore": 85,
    "budget": 500,
    "timeline": "immediate",
    "goals": ["lose weight", "build muscle"],
    "preferredContact": "whatsapp",
    "timezone": "America/New_York",
    "coachId": "{{coachId}}",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### **1.4 Update Lead**
```bash
PUT /api/leads/{{leadId}}
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "status": "contacted",
  "priority": "medium",
  "notes": "Called on 2024-01-15, interested in consultation",
  "leadScore": 90,
  "nextAction": "Schedule consultation call",
  "nextActionDate": "2024-01-20"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": {
    "_id": "lead_id_here",
    "status": "contacted",
    "priority": "medium",
    "leadScore": 90,
    "nextAction": "Schedule consultation call",
    "nextActionDate": "2024-01-20",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### **1.5 Delete Lead**
```bash
DELETE /api/leads/{{leadId}}
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

### **1.6 Bulk Lead Operations**
```bash
POST /api/leads/bulk
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "action": "updateStatus",
  "leadIds": ["lead_id_1", "lead_id_2"],
  "data": {
    "status": "qualified",
    "priority": "high"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bulk operation completed successfully",
  "data": {
    "updated": 2,
    "failed": 0
  }
}
```

---

## **📊 2. Lead Scoring & Tracking Testing**

### **2.1 Get Lead Scoring Rules**
```bash
GET /api/lead-scoring/rules
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "rule": "Email engagement",
      "points": 10,
      "description": "Lead opens emails or clicks links"
    },
    {
      "rule": "Website visit",
      "points": 5,
      "description": "Lead visits website multiple times"
    },
    {
      "rule": "Form submission",
      "points": 20,
      "description": "Lead fills out contact form"
    }
  ]
}
```

### **2.2 Update Lead Score**
```bash
POST /api/lead-scoring/update
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "leadId": "{{leadId}}",
  "action": "email_opened",
  "points": 10,
  "notes": "Welcome email opened"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lead score updated successfully",
  "data": {
    "leadId": "{{leadId}}",
    "newScore": 95,
    "previousScore": 85,
    "pointsAdded": 10,
    "action": "email_opened"
  }
}
```

### **2.3 Get Lead Score History**
```bash
GET /api/lead-scoring/history/{{leadId}}
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "action": "email_opened",
      "points": 10,
      "notes": "Welcome email opened",
      "timestamp": "2024-01-15T10:00:00.000Z"
    },
    {
      "action": "form_submission",
      "points": 20,
      "notes": "Contact form submitted",
      "timestamp": "2024-01-15T09:00:00.000Z"
    }
  ]
}
```

---

## **🎯 3. Daily Priority Feed Testing**

### **3.1 Get Daily Priority Feed**
```bash
GET /api/daily-priority-feed
Authorization: Bearer {{authToken}}
```

**Query Parameters:**
- `?date=2024-01-15` - Specific date
- `?priority=high` - Filter by priority
- `?category=follow-up` - Filter by category

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "totalTasks": 5,
    "highPriority": 2,
    "mediumPriority": 2,
    "lowPriority": 1,
    "tasks": [
      {
        "type": "lead_follow_up",
        "priority": "high",
        "title": "Follow up with John Doe",
        "description": "Schedule consultation call",
        "dueDate": "2024-01-15",
        "leadId": "{{leadId}}",
        "leadName": "John Doe",
        "leadScore": 95,
        "recommendedAction": "Call to schedule consultation"
      },
      {
        "type": "lead_nurturing",
        "priority": "medium",
        "title": "Send nurture email to Sarah Smith",
        "description": "Day 3 of welcome sequence",
        "dueDate": "2024-01-15",
        "leadId": "lead_id_2",
        "leadName": "Sarah Smith",
        "leadScore": 75
      }
    ]
  }
}
```

### **3.2 Mark Task as Completed**
```bash
POST /api/daily-priority-feed/complete
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "taskId": "task_id_here",
  "completionNotes": "Called John Doe, consultation scheduled for tomorrow",
  "nextAction": "Prepare consultation materials"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task marked as completed",
  "data": {
    "taskId": "task_id_here",
    "completedAt": "2024-01-15T10:00:00.000Z",
    "completionNotes": "Called John Doe, consultation scheduled for tomorrow",
    "nextAction": "Prepare consultation materials"
  }
}
```

---

## **🧲 4. Lead Magnets Testing**

### **4.1 Create Lead Magnet**
```bash
POST /api/lead-magnets
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "name": "Free Fitness Assessment",
  "description": "Get your personalized fitness assessment and workout plan",
  "type": "pdf",
  "category": "fitness",
  "tags": ["assessment", "workout", "free"],
  "content": {
    "headline": "Transform Your Fitness in 30 Days",
    "subheadline": "Get your personalized plan based on your goals",
    "benefits": [
      "Custom workout routines",
      "Nutrition guidelines",
      "Progress tracking tools"
    ]
  },
  "deliveryMethod": "email",
  "isActive": true,
  "conversionGoal": 100
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "magnet_id_here",
    "name": "Free Fitness Assessment",
    "type": "pdf",
    "category": "fitness",
    "isActive": true,
    "conversionGoal": 100,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### **4.2 Get All Lead Magnets**
```bash
GET /api/lead-magnets
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "magnet_id_here",
      "name": "Free Fitness Assessment",
      "type": "pdf",
      "category": "fitness",
      "isActive": true,
      "conversionGoal": 100,
      "conversions": 0,
      "conversionRate": 0,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### **4.3 Get Lead Magnet Analytics**
```bash
GET /api/lead-magnets/{{magnetId}}/analytics
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "magnetId": "{{magnetId}}",
    "name": "Free Fitness Assessment",
    "totalViews": 150,
    "totalConversions": 25,
    "conversionRate": 16.67,
    "conversionGoal": 100,
    "goalProgress": 25,
    "dailyStats": [
      {
        "date": "2024-01-15",
        "views": 15,
        "conversions": 3
      }
    ]
  }
}
```

---

## **📈 5. CRM Analytics Testing**

### **5.1 Get Lead Pipeline Overview**
```bash
GET /api/leads/analytics/pipeline
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalLeads": 150,
    "newLeads": 45,
    "contactedLeads": 30,
    "qualifiedLeads": 25,
    "convertedLeads": 20,
    "lostLeads": 30,
    "conversionRate": 13.33,
    "averageLeadScore": 78.5,
    "topSources": [
      { "source": "website", "count": 60, "percentage": 40 },
      { "source": "social_media", "count": 45, "percentage": 30 },
      { "source": "referral", "count": 30, "percentage": 20 }
    ]
  }
}
```

### **5.2 Get Lead Source Performance**
```bash
GET /api/leads/analytics/sources
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "source": "website",
      "totalLeads": 60,
      "convertedLeads": 12,
      "conversionRate": 20,
      "averageLeadScore": 82.3,
      "averageTimeToConvert": 15.5
    },
    {
      "source": "social_media",
      "totalLeads": 45,
      "convertedLeads": 6,
      "conversionRate": 13.33,
      "averageLeadScore": 75.8,
      "averageTimeToConvert": 22.1
    }
  ]
}
```

---

## **🎯 Testing Checklist:**

### **Lead Management:**
- [ ] Create new lead
- [ ] Get all leads with filters
- [ ] Get lead by ID
- [ ] Update lead information
- [ ] Delete lead
- [ ] Bulk operations

### **Lead Scoring:**
- [ ] Get scoring rules
- [ ] Update lead score
- [ ] Get score history

### **Daily Priority Feed:**
- [ ] Get priority feed
- [ ] Mark tasks as completed
- [ ] Filter by priority/category

### **Lead Magnets:**
- [ ] Create lead magnet
- [ ] Get all magnets
- [ ] Get analytics

### **CRM Analytics:**
- [ ] Pipeline overview
- [ ] Source performance
- [ ] Conversion metrics

---

## **❓ What to Look For:**

- ✅ All endpoints return proper HTTP status codes
- ✅ JWT authentication works correctly
- ✅ Lead creation and updates work properly
- ✅ Scoring system calculates correctly
- ✅ Priority feed shows relevant tasks
- ✅ Analytics provide accurate data
- ✅ Error handling for invalid inputs
- ✅ CRUD operations work correctly
- ✅ Pagination and filtering work
- ✅ Data relationships are maintained

---

## **🚀 Ready to Test?**

Start with **Lead Management** first since it's the foundation. Test each endpoint one by one and check off the checklist!

**Copy-paste the commands above into your testing tool (Postman/cURL).**

**Next Steps:**
1. Test Lead Management endpoints
2. Test Lead Scoring system
3. Test Daily Priority Feed
4. Test Lead Magnets
5. Test CRM Analytics
6. Let me know how the testing goes
7. When ready, ask to proceed to the next section
