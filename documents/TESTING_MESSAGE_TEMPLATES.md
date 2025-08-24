# 🧪 **API Testing - Section 2: Message Templates & Zoom Integration**

## **📋 Prerequisites:**
- ✅ Login completed (you should have `{{authToken}}` and `{{coachId}}` stored)
- Server running on `http://localhost:8080`
- MongoDB connected

---

## **💬 1. Message Templates Testing**

### **1.1 Get Pre-built Templates**
```bash
GET /api/message-templates/pre-built
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Welcome Message",
      "type": "whatsapp",
      "category": "welcome",
      "isPreBuilt": true
    }
  ]
}
```

### **1.2 Get Template Categories**
```bash
GET /api/message-templates/categories
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    "welcome", "follow_up", "appointment", 
    "reminder", "marketing", "support", "custom"
  ]
}
```

### **1.3 Get Template Types**
```bash
GET /api/message-templates/types
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": ["whatsapp", "email", "universal"]
}
```

### **1.4 Get Common Variables**
```bash
GET /api/message-templates/variables
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "lead.name",
      "description": "Lead's first name",
      "example": "John"
    }
  ]
}
```

### **1.5 Create Custom Template**
```bash
POST /api/message-templates
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "name": "My Custom Template",
  "description": "A personalized welcome message",
  "type": "whatsapp",
  "category": "welcome",
  "content": {
    "body": "Hi {{lead.name}}! Welcome to {{coach.name}}'s fitness program! 🎯"
  },
  "availableVariables": [
    {
      "name": "lead.name",
      "description": "Lead's first name",
      "example": "John",
      "required": true
    },
    {
      "name": "coach.name",
      "description": "Coach's name",
      "example": "Sarah",
      "required": true
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "template_id_here",
    "name": "My Custom Template",
    "type": "whatsapp",
    "category": "welcome"
  }
}
```

### **1.6 Get All Coach Templates**
```bash
GET /api/message-templates
Authorization: Bearer {{authToken}}
```

### **1.7 Render Template with Variables**
```bash
POST /api/message-templates/{{templateId}}/render
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "variables": {
    "lead.name": "John",
    "coach.name": "Sarah"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "renderedContent": "Hi John! Welcome to Sarah's fitness program! 🎯"
  }
}
```

### **1.8 Update Template**
```bash
PUT /api/message-templates/{{templateId}}
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "name": "Updated Custom Template",
  "description": "Updated description"
}
```

### **1.9 Duplicate Template**
```bash
POST /api/message-templates/{{templateId}}/duplicate
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "newName": "Copy of My Template"
}
```

### **1.10 Delete Template**
```bash
DELETE /api/message-templates/{{templateId}}
Authorization: Bearer {{authToken}}
```

---

## **📹 2. Zoom Integration Testing (OAuth-Based)**

### **2.1 Setup Zoom Integration**
```bash
POST /api/zoom-integration/setup
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "clientId": "1YBr3PCLQYCpqUt7wmulQ",
  "clientSecret": "saYY0yviT6EfFePrL0kfIVyyv6Ajeidl",
  "zoomEmail": "your-zoom-email@example.com",
  "zoomAccountId": "Cbzdab7JT5iLd_3nD4WR1w",
  "meetingSettings": {
    "defaultDuration": 60,
    "defaultType": "scheduled",
    "settings": {
      "hostVideo": true,
      "participantVideo": true,
      "joinBeforeHost": false,
      "muteUponEntry": true,
      "waitingRoom": true,
      "autoRecording": "none"
    }
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Zoom integration setup successfully",
  "data": {
    "integrationId": "integration_id_here",
    "zoomAccountId": "Cbzdab7JT5iLd_3nD4WR1w",
    "zoomEmail": "your-zoom-email@example.com",
    "isActive": true
  }
}
```

### **2.2 Get Zoom Integration Status**
```bash
GET /api/zoom-integration/status
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "isConnected": true,
    "isActive": true,
    "lastSync": {
      "timestamp": "2024-01-15T10:00:00.000Z",
      "status": "success"
    },
    "accountInfo": {
      "zoomAccountId": "Cbzdab7JT5iLd_3nD4WR1w",
      "zoomEmail": "your-zoom-email@example.com"
    }
  }
}
```

### **2.3 Test Zoom Connection**
```bash
POST /api/zoom-integration/test
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Connection successful",
  "user": {
    "id": "user_id_here",
    "first_name": "Coach",
    "last_name": "Name",
    "email": "coach@example.com",
    "type": 2,
    "verified": 1
  }
}
```

### **2.4 Get Zoom Usage Stats**
```bash
GET /api/zoom-integration/usage
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "usage": {
    "totalMeetings": 0,
    "totalParticipants": 0,
    "totalDuration": 0,
    "lastMeetingCreated": null
  },
  "lastSync": {
    "timestamp": "2024-01-15T10:00:00.000Z",
    "status": "success"
  }
}
```

### **2.5 Create Meeting Template**
```bash
POST /api/zoom-integration/meeting-templates
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "name": "Standard Fitness Session",
  "description": "60-minute fitness consultation",
  "duration": 60,
  "settings": {
    "host_video": true,
    "participant_video": true,
    "join_before_host": false,
    "mute_upon_entry": true,
    "waiting_room": true,
    "auto_recording": "none"
  },
  "isDefault": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Meeting template created successfully"
}
```

### **2.6 Get Meeting Templates**
```bash
GET /api/zoom-integration/meeting-templates
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Standard Fitness Session",
      "description": "60-minute fitness consultation",
      "duration": 60,
      "settings": {
        "host_video": true,
        "participant_video": true,
        "join_before_host": false,
        "mute_upon_entry": true,
        "waiting_room": true,
        "auto_recording": "none"
      },
      "isDefault": true
    }
  ]
}
```

### **2.7 Get Zoom Integration Details**
```bash
GET /api/zoom-integration
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "integration_id_here",
    "zoomAccountId": "Cbzdab7JT5iLd_3nD4WR1w",
    "zoomEmail": "your-zoom-email@example.com",
    "isActive": true,
    "meetingSettings": {
      "defaultDuration": 60,
      "defaultType": "scheduled",
      "settings": {
        "hostVideo": true,
        "participantVideo": true,
        "joinBeforeHost": false,
        "muteUponEntry": true,
        "waitingRoom": true,
        "autoRecording": "none"
      },
      "templates": []
    },
    "lastSync": {
      "timestamp": "2024-01-15T10:00:00.000Z",
      "status": "success"
    },
    "usageStats": {
      "totalMeetings": 0,
      "totalParticipants": 0,
      "totalDuration": 0,
      "lastMeetingCreated": null
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### **2.8 Update Zoom Integration Settings**
```bash
PUT /api/zoom-integration
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "meetingSettings": {
    "defaultDuration": 90,
    "settings": {
      "waitingRoom": false,
      "muteUponEntry": false
    }
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Zoom integration updated successfully",
  "data": {
    "meetingSettings": {
      "defaultDuration": 90,
      "defaultType": "scheduled",
      "settings": {
        "hostVideo": true,
        "participantVideo": true,
        "joinBeforeHost": false,
        "muteUponEntry": false,
        "waitingRoom": false,
        "autoRecording": "none"
      }
    },
    "isActive": true
  }
}
```

### **2.9 Delete Zoom Integration**
```bash
DELETE /api/zoom-integration
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Zoom integration deleted successfully"
}
```

---

## **🎯 Testing Checklist:**

### **Message Templates:**
- [ ] Get pre-built templates
- [ ] Get categories and types
- [ ] Get common variables
- [ ] Create custom template
- [ ] Get all templates
- [ ] Render template with variables
- [ ] Update template
- [ ] Duplicate template
- [ ] Delete template

### **Zoom Integration:**
- [ ] Setup integration
- [ ] Check status
- [ ] Test connection
- [ ] Get usage stats
- [ ] Create meeting template
- [ ] Get meeting templates
- [ ] Get integration details
- [ ] Update integration settings
- [ ] Delete integration

---

## **❓ What to Look For:**

- ✅ All endpoints return proper HTTP status codes
- ✅ JWT authentication works correctly
- ✅ Templates are created and stored in database
- ✅ Variable replacement works properly
- ✅ Zoom integration stores credentials securely
- ✅ Error handling for invalid inputs
- ✅ CRUD operations work correctly

---

## **🚀 Ready to Test?**

Start with **Message Templates** first since they don't require external API credentials. Test each endpoint one by one and check off the checklist!

**Copy-paste the commands above into your testing tool (Postman/cURL).**
