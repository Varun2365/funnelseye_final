# 📅 PRIORITY FEED & CALENDAR TESTING GUIDE

## **Base URL:** `{{your_server_url}}/api/coach`

**Note:** The available slots route is now **public** (no authentication required) for lead booking purposes.

---

## 🔐 **1. AUTHENTICATION SETUP**

First, you'll need to login and get your coach token:

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

## 📊 **2. DAILY PRIORITY FEED**

### **Get Daily Priority Feed**
```bash
curl -X GET {{your_server_url}}/api/coach/daily-feed \
  -H "Authorization: Bearer {{coach_token}}"
```

**Expected Response:** List of prioritized tasks, leads, and actions for the day

---

## ⏰ **3. COACH AVAILABILITY MANAGEMENT**

### **Get Coach Availability Settings**
```bash
curl -X GET {{your_server_url}}/api/coach/{{coach_id}}/availability
```

**Expected Response:** Current availability settings (working hours, timezone, etc.)

### **Set Coach Availability**
```bash
curl -X POST {{your_server_url}}/api/coach/availability \
  -H "Authorization: Bearer {{coach_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "timeZone": "Asia/Kolkata",
    "workingHours": [
      {
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "dayOfWeek": 2,
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ],
    "slotDuration": 30,
    "bufferTime": 0
  }'
```

**Expected Response:** Updated availability settings

---

## 📅 **4. AVAILABLE SLOTS & CALENDAR**

### **Get Available Booking Slots**
```bash
curl -X GET {{your_server_url}}/api/coach/{{coach_id}}/available-slots
```

**Expected Response:** Available time slots for booking

### **Get Coach Calendar**
```bash
curl -X GET {{your_server_url}}/api/coach/{{coach_id}}/calendar
```

**Expected Response:** Calendar view with appointments and availability

---

## 📝 **5. APPOINTMENT BOOKING**

### **Book New Appointment**
```bash
curl -X POST {{your_server_url}}/api/coach/{{coach_id}}/book \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "{{lead_id}}",
    "startTime": "2025-01-25T10:00:00Z",
    "duration": 30,
    "notes": "Initial consultation call",
    "timeZone": "Asia/Kolkata"
  }'
```

**Expected Response:** Created appointment details

---

## 🔄 **6. APPOINTMENT MANAGEMENT**

### **Reschedule Appointment**
```bash
curl -X PUT {{your_server_url}}/api/coach/appointments/{{appointment_id}}/reschedule \
  -H "Authorization: Bearer {{coach_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "newStartTime": "2025-01-25T14:00:00Z",
    "newDuration": 45
  }'
```

**Expected Response:** Updated appointment details

### **Cancel Appointment**
```bash
curl -X DELETE {{your_server_url}}/api/coach/appointments/{{appointment_id}} \
  -H "Authorization: Bearer {{coach_token}}"
```

**Expected Response:** Success message

---

## 🚀 **7. BOOKING RECOVERY**

### **Initiate Booking Recovery**
```bash
curl -X POST {{your_server_url}}/api/coach/booking-recovery/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "{{lead_id}}",
    "funnelId": "{{funnel_id}}"
  }'
```

**Expected Response:** Recovery session details

### **Cancel Booking Recovery**
```bash
curl -X POST {{your_server_url}}/api/coach/booking-recovery/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "recoveryId": "{{recovery_id}}"
  }'
```

**Expected Response:** Success message

---

## 📋 **TESTING CHECKLIST**

- [ ] **Daily Priority Feed** - Get prioritized tasks
- [ ] **Get Availability** - View current settings
- [ ] **Set Availability** - Update working hours
- [ ] **Get Available Slots** - View bookable times
- [ ] **Get Calendar** - View calendar layout
- [ ] **Book Appointment** - Create new appointment
- [ ] **Reschedule Appointment** - Change appointment time
- [ ] **Cancel Appointment** - Remove appointment
- [ ] **Initiate Recovery** - Start recovery session
- [ ] **Cancel Recovery** - End recovery session

---

## 🚨 **IMPORTANT NOTES**

1. **Authentication Required:** Most endpoints need the `Authorization: Bearer {{coach_token}}` header
2. **Coach ID:** Use `{{coach_id}}` from your login response
3. **Lead ID:** You'll need a valid lead ID for appointment booking
4. **Time Format:** Use ISO 8601 format for dates (e.g., `2025-01-25T10:00:00Z`)
5. **Timezone:** Set to your local timezone (e.g., `Asia/Kolkata`)

---

## 🎯 **READY TO START?**

**Step 1:** Login and get your coach token
**Step 2:** Test the daily priority feed
**Step 3:** Set up your availability
**Step 4:** Test calendar and available slots
**Step 5:** Book an appointment (if you have a lead)
**Step 6:** Test reschedule/cancel functionality
**Step 7:** Test booking recovery features

---

## 🔍 **TROUBLESHOOTING**

- **401 Unauthorized:** Check your token and make sure it's valid
- **404 Not Found:** Verify the coach ID and endpoint URLs
- **400 Bad Request:** Check the request body format and required fields
- **500 Server Error:** Check server logs for detailed error information

---

## 📱 **POSTMAN COLLECTION VARIABLES**

Set these variables in Postman:
- `{{your_server_url}}` - Your server base URL
- `{{coach_token}}` - JWT token from login
- `{{coach_id}}` - Your coach user ID
- `{{lead_id}}` - A valid lead ID for testing
- `{{funnel_id}}` - A valid funnel ID for testing
- `{{appointment_id}}` - Appointment ID after booking
- `{{recovery_id}}` - Recovery session ID after initiation
