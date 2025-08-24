# 🧹 ZOOM MEETING CLEANUP TESTING GUIDE

## **Base URL:** `{{your_server_url}}/api`

**Note:** This guide tests the new automatic Zoom meeting cleanup feature that removes old Zoom meeting data from the database.

---

## 🔐 **1. PREREQUISITES**

### **1.1 Coach Authentication**
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

### **1.2 Zoom Integration Setup**
Make sure you have Zoom integration configured:

```bash
# Check if Zoom integration exists
curl -X GET {{your_server_url}}/api/zoom-integration \
  -H "Authorization: Bearer {{coach_token}}"
```

If no integration exists, set it up first using the Zoom integration testing guide.

### **1.3 Create Test Appointments with Zoom Meetings**
Create some appointments with Zoom meetings to test the cleanup:

```bash
# Book an appointment (this will automatically create a Zoom meeting)
curl -X POST {{your_server_url}}/api/coach/{{coach_id}}/book \
  -H "Authorization: Bearer {{coach_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "{{lead_id}}",
    "startTime": "2025-01-20T10:00:00Z",
    "duration": 30,
    "notes": "Test appointment for cleanup",
    "timeZone": "Asia/Kolkata"
  }'
```

---

## 🧹 **2. ZOOM CLEANUP MANAGEMENT**

### **2.1 Start Automatic Cleanup**
Start the automatic cleanup process:

```bash
# Start daily cleanup with 2 days retention
curl -X POST {{your_server_url}}/api/zoom-integration/cleanup/start \
  -H "Authorization: Bearer {{coach_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "retentionDays": 2,
    "interval": "daily"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Zoom cleanup started with 2 days retention, interval: daily",
  "data": {
    "retentionDays": 2,
    "interval": "daily",
    "isRunning": true
  }
}
```

**Alternative Intervals:**
```bash
# Weekly cleanup (Sundays at 2 AM)
curl -X POST {{your_server_url}}/api/zoom-integration/cleanup/start \
  -H "Authorization: Bearer {{coach_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "retentionDays": 3,
    "interval": "weekly"
  }'

# Manual only (no automatic cleanup)
curl -X POST {{your_server_url}}/api/zoom-integration/cleanup/start \
  -H "Authorization: Bearer {{coach_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "retentionDays": 1,
    "interval": "manual"
  }'
```

### **2.2 Get Cleanup Statistics**
Check the current cleanup status and statistics:

```bash
curl -X GET {{your_server_url}}/api/zoom-integration/cleanup/stats \
  -H "Authorization: Bearer {{coach_token}}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalMeetings": 5,
    "meetingsOlderThan2Days": 2,
    "meetingsOlderThan1Week": 1,
    "meetingsOlderThan1Month": 0,
    "lastCleanup": null,
    "isRunning": true
  }
}
```

### **2.3 Update Retention Period**
Change how long Zoom meeting data is kept:

```bash
# Change retention to 3 days
curl -X PUT {{your_server_url}}/api/zoom-integration/cleanup/retention \
  -H "Authorization: Bearer {{coach_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "retentionDays": 3
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Retention period updated to 3 days",
  "data": {
    "retentionDays": 3,
    "isRunning": true
  }
}
```

### **2.4 Manual Cleanup**
Perform immediate cleanup without waiting for the scheduled time:

```bash
# Clean up meetings older than 1 day
curl -X POST {{your_server_url}}/api/zoom-integration/cleanup/manual \
  -H "Authorization: Bearer {{coach_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "retentionDays": 1
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Manual cleanup completed for meetings older than 1 day",
  "data": {
    "success": true,
    "message": "Manual cleanup completed for meetings older than 1 day",
    "timestamp": "2025-01-23T15:30:00.000Z"
  }
}
```

### **2.5 Stop Automatic Cleanup**
Stop the automatic cleanup process:

```bash
curl -X POST {{your_server_url}}/api/zoom-integration/cleanup/stop \
  -H "Authorization: Bearer {{coach_token}}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Zoom cleanup stopped successfully",
  "data": {
    "isRunning": false
  }
}
```

---

## 🧪 **3. TESTING CLEANUP FUNCTIONALITY**

### **3.1 Verify Cleanup Results**
After running cleanup, check if old Zoom meeting data was removed:

```bash
# Get all Zoom meetings
curl -X GET {{your_server_url}}/api/zoom-integration/meetings \
  -H "Authorization: Bearer {{coach_token}}"
```

**Expected Behavior:**
- Meetings older than retention period should have Zoom data removed
- Appointments still exist but without `zoomMeeting` details
- Only recent meetings (within retention period) should show Zoom data

### **3.2 Check Cleanup Statistics Again**
Verify the cleanup statistics were updated:

```bash
curl -X GET {{your_server_url}}/api/zoom-integration/cleanup/stats \
  -H "Authorization: Bearer {{coach_token}}"
```

**Expected Changes:**
- `totalMeetings` should decrease
- `meetingsOlderThan2Days` should decrease
- `lastCleanup` should show recent timestamp

---

## ⚙️ **4. ADVANCED CONFIGURATION**

### **4.1 Different Retention Periods**
Test various retention periods:

```bash
# 1 day retention (aggressive cleanup)
curl -X POST {{your_server_url}}/api/zoom-integration/cleanup/start \
  -H "Authorization: Bearer {{coach_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "retentionDays": 1,
    "interval": "daily"
  }'

# 7 days retention (weekly cleanup)
curl -X POST {{your_server_url}}/api/zoom-integration/cleanup/start \
  -H "Authorization: Bearer {{coach_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "retentionDays": 7,
    "interval": "weekly"
  }'

# 30 days retention (monthly cleanup)
curl -X POST {{your_server_url}}/api/zoom-integration/cleanup/start \
  -H "Authorization: Bearer {{coach_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "retentionDays": 30,
    "interval": "weekly"
  }'
```

### **4.2 Server Restart Behavior**
The cleanup service automatically starts when the server starts. Test this:

1. **Stop the server** (Ctrl+C)
2. **Start the server again**
3. **Check if cleanup is running:**

```bash
curl -X GET {{your_server_url}}/api/zoom-integration/cleanup/stats \
  -H "Authorization: Bearer {{coach_token}}"
```

**Expected:** `isRunning: true` should show the service restarted automatically.

---

## 🚨 **5. TROUBLESHOOTING**

### **5.1 Common Issues**

**"Retention period must be at least 1 day"**
- **Cause:** Trying to set retention to 0 or negative
- **Solution:** Use minimum value of 1

**"Invalid interval"**
- **Cause:** Using unsupported interval value
- **Solution:** Use only 'daily', 'weekly', or 'manual'

**Cleanup not running automatically**
- **Cause:** Service may have stopped
- **Solution:** Check server logs and restart cleanup manually

### **5.2 Debug Steps**

1. **Check server logs** for cleanup service messages
2. **Verify cleanup is running:**
   ```bash
   curl -X GET {{your_server_url}}/api/zoom-integration/cleanup/stats \
     -H "Authorization: Bearer {{coach_token}}"
   ```
3. **Check appointment data** to see if Zoom meeting data was removed
4. **Verify database** that old Zoom meeting fields are unset

---

## 📋 **6. TESTING CHECKLIST**

- [ ] **Start Cleanup Service** - Can start with different retention periods
- [ ] **Update Retention** - Can change retention period dynamically
- [ ] **Manual Cleanup** - Can perform immediate cleanup
- [ ] **Statistics** - Can view cleanup statistics and status
- [ ] **Stop Service** - Can stop automatic cleanup
- [ ] **Data Removal** - Old Zoom meeting data is properly removed
- [ ] **Appointment Preservation** - Appointments remain after cleanup
- [ ] **Auto-restart** - Service restarts when server restarts
- [ ] **Different Intervals** - Daily and weekly intervals work
- [ ] **Error Handling** - Invalid inputs are properly rejected

---

## 🎉 **7. SUCCESS INDICATORS**

### **7.1 For Coaches:**
- ✅ **Automatic Cleanup** - Old Zoom data is removed automatically
- ✅ **Configurable Retention** - Can set how long to keep meeting data
- ✅ **Manual Control** - Can trigger cleanup immediately when needed
- ✅ **Clean Database** - No accumulation of old Zoom meeting data

### **7.2 For System:**
- ✅ **Efficient Storage** - Database doesn't grow unnecessarily large
- ✅ **Scheduled Operations** - Cleanup runs at optimal times (2 AM)
- ✅ **Error Handling** - Graceful handling of cleanup failures
- ✅ **Logging** - Complete audit trail of cleanup operations

---

## 🚀 **READY TO TEST?**

**The Zoom cleanup system now provides:**
1. **Automatic Cleanup** - Removes old Zoom meeting data daily/weekly
2. **Configurable Retention** - Set how long to keep meeting data (1-30+ days)
3. **Manual Control** - Trigger cleanup immediately when needed
4. **Statistics & Monitoring** - Track cleanup performance and status
5. **Smart Scheduling** - Runs during low-usage hours (2 AM)

**Test the complete cleanup workflow and enjoy a clean, efficient database!** 🎉
