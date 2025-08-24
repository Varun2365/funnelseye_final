# 🔗 ZOOM INTEGRATION WITH APPOINTMENTS TESTING GUIDE

## **Base URL:** `{{your_server_url}}/api`

**Note:** This guide tests the complete flow from Zoom setup to automatic Zoom link generation when appointments are booked.

---

## 🔐 **1. PREREQUISITES**

### **1.1 Update Appointment Schema (One-time setup)**
If you have existing appointments, update them to include the new `appointmentType` field:

```bash
# Update existing appointments to have appointmentType: 'online'
node updateExistingAppointments.js
```

**Expected Output:** All existing appointments updated successfully

### **1.2 Coach Authentication**
First, login as a coach to get your token:

```bash
# Login as coach
curl -X POST {{your_server_url}}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_coach_email@example.com",
    "password": "your_password"
  }'
```

**Save the response:**
- `token` → Set as `{{coach_token}}`
- `user._id` → Set as `{{coach_id}}`

### **1.2 Create a Lead (Required for Appointment Testing)**
```bash
# Create a test lead
curl -X POST {{your_server_url}}/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "coachId": "{{coach_id}}",
    "funnelId": "{{funnel_id}}",
    "name": "Test Lead for Zoom",
    "email": "testlead@example.com",
    "phone": "+1234567890",
    "source": "Testing"
  }'
```

**Save:** `_id` → Set as `{{lead_id}}`

---

## 🚀 **2. ZOOM INTEGRATION SETUP**

### **2.1 Setup Zoom API Integration**
```bash
curl -X POST {{your_server_url}}/api/zoom-integration/setup \
  -H "Authorization: Bearer {{coach_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "your_zoom_client_id",
    "clientSecret": "your_zoom_client_secret",
    "zoomEmail": "your_zoom_email@example.com",
    "zoomAccountId": "your_zoom_account_id"
  }'
```

**Expected Response:** Zoom integration details with status

### **2.2 Test Zoom Connection**
```bash
curl -X POST {{your_server_url}}/api/zoom-integration/test \
  -H "Authorization: Bearer {{coach_token}}"
```

**Expected Response:** Connection test results

---

## ⚙️ **3. SETUP AUTOMATION RULE**

### **3.1 Run the Setup Script**
```bash
# Run this script to create the automation rule
node setupZoomAutomation.js
```

**Expected Output:** Automation rule created successfully

### **3.2 Verify Automation Rule**
```bash
curl -X GET {{your_server_url}}/api/automation-rules \
  -H "Authorization: Bearer {{coach_token}}"
```

**Look for:** Rule with name "Auto-Generate Zoom Links for Appointments"

---

## 📅 **4. TEST APPOINTMENT BOOKING WITH ZOOM**

### **4.1 Set Coach Availability**
```bash
curl -X POST {{your_server_url}}/api/coach/availability \
  -H "Authorization: Bearer {{coach_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "timeZone": "UTC",
    "workingHours": [
      {
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ],
    "defaultAppointmentDuration": 30,
    "bufferTime": 0
  }'
```

### **4.2 Book an Appointment**
```bash
curl -X POST {{your_server_url}}/api/coach/{{coach_id}}/book \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "{{lead_id}}",
    "startTime": "2025-01-25T10:00:00Z",
    "duration": 30,
    "notes": "Test appointment with Zoom integration",
    "timeZone": "UTC"
  }'
```

**Expected Response:** Appointment created with appointment ID

**Note:** The appointment will automatically have `appointmentType: "online"` set, which is required for Zoom integration.

**Save:** `appointmentDetails._id` → Set as `{{appointment_id}}`

### **4.3 Check if Zoom Meeting was Created**
```bash
curl -X GET {{your_server_url}}/api/coach/appointments/{{appointment_id}} \
  -H "Authorization: Bearer {{coach_token}}"
```

**Look for:** `zoomMeeting` object with meeting details

---

## 🔍 **5. VERIFY AUTOMATION FLOW**

### **5.1 Check Automation Logs**
Look at your server console for these messages:
```
[ActionExecutor] Received action: create_zoom_meeting
[ActionExecutor] Dispatching action: create_zoom_meeting
[ActionExecutor] Zoom meeting created successfully for appointment [ID]: [meeting_id]
```

### **5.2 Check RabbitMQ Events**
The system should have published:
- `appointment_booked` event
- `create_zoom_meeting` action

---

## 📱 **6. TEST ZOOM MEETING DETAILS**

### **6.1 Get Meeting Information**
```bash
curl -X GET {{your_server_url}}/api/zoom-integration/meetings/{{meeting_id}} \
  -H "Authorization: Bearer {{coach_token}}"
```

### **6.2 Test Meeting Join URL**
The appointment should now have a `zoomMeeting.joinUrl` that leads can use to join.

---

## 🧪 **7. COMPLETE TESTING SCENARIOS**

### **7.1 New Appointment Booking**
- [ ] Coach sets availability
- [ ] Lead books appointment
- [ ] Automation rule triggers
- [ ] Zoom meeting created
- [ ] Appointment updated with Zoom details

### **7.2 Appointment Rescheduling**
```bash
curl -X PUT {{your_server_url}}/api/coach/appointments/{{appointment_id}}/reschedule \
  -H "Authorization: Bearer {{coach_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "newStartTime": "2025-01-25T14:00:00Z",
    "newDuration": 45
  }'
```

**Check:** Zoom meeting should be updated with new time

### **7.3 Appointment Cancellation**
```bash
curl -X DELETE {{your_server_url}}/api/coach/appointments/{{appointment_id}} \
  -H "Authorization: Bearer {{coach_token}}"
```

**Check:** Zoom meeting should be deleted

---

## 🚨 **8. TROUBLESHOOTING**

### **8.1 Zoom Meeting Not Created**
**Check:**
1. Zoom integration is active
2. Automation rule exists and is active
3. RabbitMQ workers are running
4. Server logs for errors

### **8.2 Common Error Messages**
- **"Zoom integration not found"** → Run Zoom setup first
- **"Automation rule not found"** → Run `setupZoomAutomation.js`
- **"Action executor failed"** → Check Zoom API credentials
- **"Appointment is not online type"** → Run `updateExistingAppointments.js` to fix existing appointments

### **8.3 Debug Steps**
1. Check Zoom integration status
2. Verify automation rule exists
3. Test Zoom API connection
4. Check server logs
5. Verify RabbitMQ workers

---

## 📋 **9. TESTING CHECKLIST**

- [ ] **Zoom Integration Setup** - API credentials configured
- [ ] **Connection Test** - Zoom API accessible
- [ ] **Automation Rule** - Rule created and active
- [ ] **Coach Availability** - Working hours set
- [ ] **Lead Creation** - Test lead exists
- [ ] **Appointment Booking** - Appointment created
- [ ] **Zoom Meeting Generation** - Meeting automatically created
- [ ] **Meeting Details** - Join URL and password available
- [ ] **Rescheduling** - Zoom meeting updates correctly
- [ ] **Cancellation** - Zoom meeting deleted

---

## 🎯 **10. EXPECTED RESULTS**

After successful testing, you should have:

1. **Automatic Zoom Link Generation** - Every new appointment gets a Zoom meeting
2. **Seamless Integration** - No manual steps required
3. **Professional Experience** - Leads receive Zoom links automatically
4. **Error Handling** - Graceful fallbacks if Zoom creation fails

---

## 🚀 **READY TO TEST?**

**Step 1:** Setup Zoom integration
**Step 2:** Create automation rule
**Step 3:** Book test appointment
**Step 4:** Verify Zoom meeting creation
**Step 5:** Test complete workflow

**The system should now automatically generate Zoom links for every appointment!** 🎉
