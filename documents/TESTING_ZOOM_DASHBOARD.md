# 🔗 ZOOM DASHBOARD & LEAD NOTIFICATIONS TESTING GUIDE

## **Base URL:** `{{your_server_url}}/api`

**Note:** This guide tests the complete Zoom dashboard access and automatic lead notification system.

---

## 🔐 **1. PREREQUISITES**

### **1.1 Complete Zoom Integration Setup**
Make sure you have:
- ✅ Zoom integration configured
- ✅ Automation rule created (`node setupZoomAutomation.js`)
- ✅ At least one appointment with Zoom meeting created

### **1.2 Coach Authentication**
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

---

## 📊 **2. ZOOM DASHBOARD ACCESS**

### **2.1 Get All Zoom Meetings for Coach**
```bash
curl -X GET {{your_server_url}}/api/coach-dashboard/zoom-meetings \
  -H "Authorization: Bearer {{coach_token}}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "meetings": [
      {
        "meetingId": "123456789",
        "joinUrl": "https://zoom.us/j/123456789",
        "startUrl": "https://zoom.us/s/123456789",
        "password": "ABC123",
        "appointment": {
          "id": "appointment_id",
          "startTime": "2025-01-25T10:00:00.000Z",
          "duration": 30,
          "leadName": "John Doe",
          "leadEmail": "john@example.com",
          "status": "scheduled"
        }
      }
    ],
    "total": 1
  }
}
```

### **2.2 Get Zoom Meeting Details for Specific Appointment**
```bash
curl -X GET {{your_server_url}}/api/coach-dashboard/zoom-meetings/appointment/{{appointment_id}} \
  -H "Authorization: Bearer {{coach_token}}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "meeting": {
      "meetingId": "123456789",
      "joinUrl": "https://zoom.us/j/123456789",
      "startUrl": "https://zoom.us/s/123456789",
      "password": "ABC123",
      "createdAt": "2025-01-23T15:30:00.000Z"
    },
    "appointment": {
      "id": "appointment_id",
      "startTime": "2025-01-25T10:00:00.000Z",
      "duration": 30,
      "leadName": "John Doe",
      "status": "scheduled",
      "appointmentType": "online"
    }
  }
}
```

---

## 📱 **3. ZOOM INTEGRATION DIRECT ACCESS**

### **3.1 Get All Zoom Meetings (Direct API)**
```bash
curl -X GET {{your_server_url}}/api/zoom-integration/meetings \
  -H "Authorization: Bearer {{coach_token}}"
```

### **3.2 Get Meeting for Specific Appointment (Direct API)**
```bash
curl -X GET {{your_server_url}}/api/zoom-integration/meetings/appointment/{{appointment_id}} \
  -H "Authorization: Bearer {{coach_token}}"
```

---

## 🔔 **4. AUTOMATIC LEAD NOTIFICATIONS**

### **4.1 Test Lead Notification Flow**
1. **Book a new appointment** (this triggers the automation)
2. **Check server logs** for notification messages
3. **Verify lead receives** WhatsApp message and/or email

### **4.2 Expected Server Logs**
```
[ActionExecutor] Zoom meeting created successfully for appointment [ID]: [meeting_id]
[ActionExecutor] Zoom meeting notification sent to lead for appointment [ID]
[ActionExecutor] WhatsApp message sent to [phone]: [message]
[ActionExecutor] Email sent to [email]: [subject]
```

### **4.3 WhatsApp Message Content**
The lead should receive a WhatsApp message with:
- ✅ Meeting date and time
- ✅ Coach name
- ✅ Duration
- ✅ **Zoom join link**
- ✅ **Meeting password**
- ✅ Instructions to join 5 minutes early

### **4.4 Email Content**
The lead should receive an email with:
- ✅ Professional HTML formatting
- ✅ Meeting details in organized sections
- ✅ **Clickable Zoom join link**
- ✅ **Meeting password**
- ✅ Professional styling and branding

---

## 🎯 **5. DASHBOARD INTEGRATION TESTING**

### **5.1 Coach Dashboard Widget**
Test if Zoom meetings appear in the main dashboard:
```bash
curl -X GET {{your_server_url}}/api/coach-dashboard/data \
  -H "Authorization: Bearer {{coach_token}}"
```

**Look for:** Zoom meetings data in the response

### **5.2 Calendar Integration**
Test if Zoom meetings are visible in calendar view:
```bash
curl -X GET {{your_server_url}}/api/coach-dashboard/calendar \
  -H "Authorization: Bearer {{coach_token}}"
```

**Look for:** Appointments with Zoom meeting details

---

## 🧪 **6. COMPLETE WORKFLOW TESTING**

### **6.1 End-to-End Test**
1. **Setup:** Zoom integration + automation rule
2. **Create:** Lead and appointment
3. **Verify:** Zoom meeting automatically created
4. **Check:** Lead receives notifications
5. **Access:** Meeting details in dashboard
6. **Test:** Zoom links work correctly

### **6.2 Expected Results**
- ✅ **Automatic Zoom creation** when appointment booked
- ✅ **Lead notifications** via WhatsApp and email
- ✅ **Dashboard access** to all Zoom meetings
- ✅ **Meeting details** easily accessible
- ✅ **Professional communication** with leads

---

## 🚨 **7. TROUBLESHOOTING**

### **7.1 Lead Notifications Not Working**
**Check:**
1. WhatsApp service is running
2. Email service is configured
3. Lead has valid phone/email
4. Server logs for errors

### **7.2 Dashboard Not Showing Meetings**
**Check:**
1. Zoom integration is active
2. Appointments have `appointmentType: "online"`
3. Zoom meetings were created successfully
4. API endpoints are accessible

### **7.3 Common Issues**
- **"No Zoom meeting found"** → Check if appointment has Zoom meeting
- **"Unauthorized access"** → Verify coach owns the appointment
- **"Integration not found"** → Setup Zoom integration first

---

## 📋 **8. TESTING CHECKLIST**

- [ ] **Zoom Dashboard Access** - Can view all meetings
- [ ] **Meeting Details** - Can access specific meeting info
- [ ] **Lead Notifications** - WhatsApp messages sent
- [ ] **Email Notifications** - Professional emails sent
- [ ] **Dashboard Integration** - Meetings visible in main dashboard
- [ ] **Calendar Integration** - Zoom meetings in calendar view
- [ ] **Link Accessibility** - Zoom links work correctly
- [ ] **Password Sharing** - Meeting passwords included
- [ ] **Professional Formatting** - Messages look professional
- [ ] **Error Handling** - Graceful fallbacks work

---

## 🎉 **9. SUCCESS INDICATORS**

### **9.1 For Coaches:**
- ✅ **Easy Access** - All Zoom meetings visible in dashboard
- ✅ **Quick Management** - Meeting details at fingertips
- ✅ **Professional Setup** - Automated meeting creation

### **9.2 For Leads:**
- ✅ **Instant Notification** - Get Zoom details immediately
- ✅ **Professional Communication** - Well-formatted messages
- ✅ **Easy Access** - Clickable links and clear instructions

### **9.3 For System:**
- ✅ **Automated Workflow** - No manual intervention needed
- ✅ **Error Handling** - Graceful fallbacks if issues occur
- ✅ **Scalable Design** - Works for multiple coaches/leads

---

## 🚀 **READY TO TEST?**

**The system now provides:**
1. **Complete Zoom Dashboard Access** - View all meetings easily
2. **Automatic Lead Notifications** - Professional WhatsApp + email
3. **Seamless Integration** - Everything works together automatically

**Test the complete workflow and enjoy your automated Zoom coaching system!** 🎉
