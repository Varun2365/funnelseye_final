# 🧪 **API Testing - Section 4: Automation Rules**

## **📋 Prerequisites:**
- ✅ Coach logged in (use login endpoint from previous section)
- ✅ Store `coachId` and `authToken` in Postman variables
- ✅ Ensure you have a valid coach account
- ✅ WhatsApp integration should be set up (from previous section)

---

## **🔧 Base URL & Headers:**
```
Base URL: {{your_server_url}}/api/automation-rules
Headers: 
  Authorization: Bearer {{authToken}}
  Content-Type: application/json
```

---

## **🎯 1. Automation Rules Management Testing**

### **1.1 Create Automation Rule - Lead Created + WhatsApp Message**
```http
POST {{your_server_url}}/api/automation-rules
```
**Payload:**
```json
{
  "name": "Welcome WhatsApp for New Leads",
  "coachId": "{{coachId}}",
  "triggerEvent": "lead_created",
  "triggerCondition": {
    "source": "any",
    "leadType": "any"
  },
  "actions": [
    {
      "type": "send_whatsapp_message",
      "config": {
        "messageTemplate": "Welcome! Thank you for your interest. I'm excited to help you on your fitness journey. When would be a good time for a quick call?",
        "delayMinutes": 5,
        "useMessageTemplate": false
      }
    },
    {
      "type": "add_lead_tag",
      "config": {
        "tag": "automated_welcome_sent"
      }
    },
    {
      "type": "create_task",
      "config": {
        "title": "Follow up with new lead",
        "description": "New lead {{lead.name}} joined. Send personalized message within 24 hours.",
        "dueDate": "{{lead.createdAt + 24h}}",
        "priority": "high"
      }
    }
  ]
}
```

**Expected Response:**
```json
{
  "_id": "rule_id_here",
  "name": "Welcome WhatsApp for New Leads",
  "coachId": "{{coachId}}",
  "triggerEvent": "lead_created",
  "triggerCondition": {
    "source": "any",
    "leadType": "any"
  },
  "actions": [
    {
      "type": "send_whatsapp_message",
      "config": {
        "messageTemplate": "Welcome! Thank you for your interest...",
        "delayMinutes": 5,
        "useMessageTemplate": false
      }
    }
  ],
  "isActive": true,
  "createdBy": "{{coachId}}",
  "createdAt": "2024-01-XX...",
  "updatedAt": "2024-01-XX..."
}
```

### **1.2 Create Another Rule - Lead Status Changed**
```http
POST {{your_server_url}}/api/automation-rules
```
**Payload:**
```json
{
  "name": "Hot Lead Follow Up",
  "coachId": "{{coachId}}",
  "triggerEvent": "lead_temperature_changed",
  "triggerCondition": {
    "newTemperature": "hot",
    "previousTemperature": "warm"
  },
  "actions": [
    {
      "type": "send_whatsapp_message",
      "config": {
        "messageTemplate": "Great news! Your lead score has increased. This is the perfect time to reach out personally.",
        "delayMinutes": 0,
        "useMessageTemplate": false
      }
    },
    {
      "type": "create_calendar_event",
      "config": {
        "title": "Priority Lead Follow Up",
        "description": "Follow up with hot lead {{lead.name}}",
        "duration": 30,
        "reminderMinutes": 15
      }
    }
  ]
}
```

### **1.3 Get All Automation Rules**
```http
GET {{your_server_url}}/api/automation-rules
```

**Expected Response:**
```json
[
  {
    "_id": "rule_id_1",
    "name": "Welcome WhatsApp for New Leads",
    "triggerEvent": "lead_created",
    "isActive": true
  },
  {
    "_id": "rule_id_2", 
    "name": "Hot Lead Follow Up",
    "triggerEvent": "lead_temperature_changed",
    "isActive": true
  }
]
```

### **1.4 Get Specific Rule by ID**
```http
GET {{your_server_url}}/api/automation-rules/{{ruleId}}
```

**Expected Response:**
```json
{
  "_id": "{{ruleId}}",
  "name": "Welcome WhatsApp for New Leads",
  "coachId": "{{coachId}}",
  "triggerEvent": "lead_created",
  "actions": [...],
  "isActive": true
}
```

### **1.5 Update Automation Rule**
```http
PUT {{your_server_url}}/api/automation-rules/{{ruleId}}
```
**Payload:**
```json
{
  "name": "Updated Welcome WhatsApp for New Leads",
  "actions": [
    {
      "type": "send_whatsapp_message",
      "config": {
        "messageTemplate": "Updated welcome message! We're excited to have you on board.",
        "delayMinutes": 10,
        "useMessageTemplate": false
      }
    }
  ]
}
```

### **1.6 Delete Automation Rule**
```http
DELETE {{your_server_url}}/api/automation-rules/{{ruleId}}
```

**Expected Response:**
```json
{
  "message": "Rule deleted successfully"
}
```

---

## **🧪 2. Testing Automation Rule Execution**

### **2.1 Test Lead Created Trigger**
Now let's test if the automation rule actually works by creating a lead:

```http
POST {{your_server_url}}/api/leads
```
**Payload:**
```json
{
  "name": "Test Lead for Automation",
  "email": "testlead@example.com",
  "phone": "+1234567890",
  "source": "website",
  "coachId": "{{coachId}}",
  "leadType": "fitness",
  "message": "I'm interested in your fitness program"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "lead_id_here",
    "name": "Test Lead for Automation",
    "email": "testlead@example.com",
    "phone": "+1234567890",
    "coachId": "{{coachId}}",
    "status": "new",
    "createdAt": "2024-01-XX..."
  }
}
```

### **2.2 Check Console Logs**
After creating the lead, check your server console for:
- `[AutomationRuleController] New automation rule created...`
- `[ActionExecutor] WhatsApp message sent to...`
- `[MetaWhatsAppService] Message sent successfully...`
- `[ActionExecutor] Task created successfully...`

### **2.3 Verify WhatsApp Message**
Check if the WhatsApp message was actually sent to the phone number.

---

## **📊 3. Advanced Automation Testing**

### **3.1 Create Rule with Multiple Actions**
```http
POST {{your_server_url}}/api/automation-rules
```
**Payload:**
```json
{
  "name": "Comprehensive Lead Onboarding",
  "coachId": "{{coachId}}",
  "triggerEvent": "lead_created",
  "triggerCondition": {
    "source": "website",
    "leadType": "fitness"
  },
  "actions": [
    {
      "type": "send_whatsapp_message",
      "config": {
        "messageTemplate": "Welcome! Here's your fitness assessment form: {{assessmentLink}}",
        "delayMinutes": 0
      }
    },
    {
      "type": "add_lead_tag",
      "config": {
        "tag": "onboarding_started"
      }
    },
    {
      "type": "create_task",
      "config": {
        "title": "Send Welcome Package",
        "description": "Send welcome email and resources to {{lead.name}}",
        "dueDate": "{{lead.createdAt + 2h}}",
        "priority": "medium"
      }
    },
    {
      "type": "schedule_drip_sequence",
      "config": {
        "sequenceName": "New Lead Welcome",
        "startDelay": 60
      }
    }
  ]
}
```

### **3.2 Test Different Trigger Events**
Create rules for other trigger events:

**Appointment Booked:**
```json
{
  "name": "Appointment Confirmation",
  "coachId": "{{coachId}}",
  "triggerEvent": "appointment_booked",
  "actions": [
    {
      "type": "send_whatsapp_message",
      "config": {
        "messageTemplate": "Your appointment is confirmed for {{appointment.date}} at {{appointment.time}}. Zoom link: {{zoomLink}}",
        "delayMinutes": 0
      }
    }
  ]
}
```

**Payment Successful:**
```json
{
  "name": "Payment Confirmation",
  "coachId": "{{coachId}}",
  "triggerEvent": "payment_successful",
  "actions": [
    {
      "type": "send_whatsapp_message",
      "config": {
        "messageTemplate": "Payment received! Welcome to the program. Your first session details will be sent shortly.",
        "delayMinutes": 0
      }
    }
  ]
}
```

---

## **✅ Testing Checklist:**

### **Basic CRUD Operations:**
- [ ] Create automation rule
- [ ] Get all rules
- [ ] Get specific rule by ID
- [ ] Update rule
- [ ] Delete rule

### **Rule Execution Testing:**
- [ ] Create lead to trigger automation
- [ ] Verify WhatsApp message sent
- [ ] Check console logs for automation flow
- [ ] Verify lead tags added
- [ ] Verify tasks created

### **Advanced Features:**
- [ ] Test multiple actions in one rule
- [ ] Test different trigger events
- [ ] Test conditional triggers
- [ ] Test delayed actions

### **Error Handling:**
- [ ] Try to create rule with invalid trigger event
- [ ] Try to create rule with invalid action type
- [ ] Try to access rule from another coach

---

## **🔍 Important Notes:**

1. **Trigger Events Available:**
   - `lead_created`, `lead_status_changed`, `lead_temperature_changed`
   - `appointment_booked`, `appointment_cancelled`
   - `payment_successful`, `payment_failed`
   - `form_submitted`, `funnel_stage_entered`

2. **Action Types Available:**
   - `send_whatsapp_message`, `create_email_message`
   - `add_lead_tag`, `update_lead_score`
   - `create_task`, `create_calendar_event`
   - `call_webhook`, `trigger_another_automation`

3. **Automation Flow:**
   - Lead created → Event published to RabbitMQ
   - Rules engine processes event → Finds matching rules
   - Actions executed → WhatsApp sent, tags added, tasks created

4. **Testing Tips:**
   - Check server console for automation logs
   - Verify WhatsApp messages are actually sent
   - Test with different phone numbers
   - Monitor RabbitMQ for event publishing

---

## **📱 Next Section:**
After completing automation rules testing, we'll move to **Lead Management & CRM** testing.
