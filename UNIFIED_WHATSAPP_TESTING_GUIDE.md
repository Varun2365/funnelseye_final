# 🚀 Unified WhatsApp Integration Testing Guide v2.0

## 📋 **Table of Contents**
- [🎯 Quick Start Checklist](#-quick-start-checklist)
- [⏱️ Time Estimates](#️-time-estimates)
- [🔧 Prerequisites](#-prerequisites)
- [🏗️ Integration Setup Testing](#️-integration-setup-testing)
- [📱 Baileys Personal Account Testing](#-baileys-personal-account-testing)
- [🌐 Meta Official API Testing](#-meta-official-api-testing)
- [🔄 Central Fallback Testing](#-central-fallback-testing)
- [👥 Staff Member Testing](#-staff-member-testing)
- [💬 Messaging Testing](#-messaging-testing)
- [📥 Inbox Management Testing](#-inbox-management-testing)
- [🔒 Security & Access Control Testing](#-security--access-control-testing)
- [🧪 Integration Testing](#-integration-testing)
- [🚨 Troubleshooting Guide](#-troubleshooting-guide)

---

## 🎯 **Quick Start Checklist**

### **Phase 1: Setup & Configuration (45 mins)**
- [ ] ✅ Setup WhatsApp integration for coaches
- [ ] ✅ Setup WhatsApp integration for staff members
- [ ] ✅ Configure Meta Official API integration
- [ ] ✅ Configure Baileys personal account integration
- [ ] ✅ Configure Central Fallback integration

### **Phase 2: Core Functionality (60 mins)**
- [ ] ✅ Test Baileys QR code generation and scanning
- [ ] ✅ Test Meta API message sending
- [ ] ✅ Test Central Fallback functionality
- [ ] ✅ Test staff member integrations
- [ ] ✅ Test message delivery and storage

### **Phase 3: Advanced Features (45 mins)**
- [ ] ✅ Test inbox management
- [ ] ✅ Test conversation handling
- [ ] ✅ Test search and filtering
- [ ] ✅ Test integration switching
- [ ] ✅ Test health monitoring

---

## ⏱️ **Time Estimates**

| **Testing Phase** | **Estimated Time** | **Priority** |
|-------------------|-------------------|--------------|
| **Setup & Configuration** | 45 minutes | 🔴 High |
| **Core Functionality** | 60 minutes | 🔴 High |
| **Advanced Features** | 45 minutes | 🟡 Medium |
| **Integration Testing** | 30 minutes | 🟡 Medium |
| **Total Estimated Time** | **3 hours** | - |

---

## 🔧 **Prerequisites**

### **Required Tools:**
- **API Testing Tool:** Postman, Insomnia, or similar
- **WhatsApp Mobile App:** For scanning Baileys QR codes
- **Database Access:** MongoDB connection (optional)
- **Admin Account:** Verified admin user with JWT token
- **Coach Account:** Verified coach user with JWT token
- **Staff Account:** Verified staff user with JWT token

### **Environment Setup:**
- **Base URL:** `http://localhost:3000/api` (adjust as needed)
- **Authentication:** JWT tokens in Authorization header
- **WhatsApp Business API:** Meta Developer Account (optional)
- **Central WhatsApp Credentials:** Environment variables configured

### **Environment Variables Required:**
```bash
# Central FunnelsEye WhatsApp Account
WHATSAPP_CENTRAL_API_TOKEN=your_central_token
WHATSAPP_CENTRAL_PHONE_NUMBER_ID=your_central_phone_id
WHATSAPP_CENTRAL_BUSINESS_ACCOUNT_ID=your_central_business_id

# Meta API Configuration
WHATSAPP_API_URL=https://graph.facebook.com/v19.0
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_token
```

---

## 🏗️ **Integration Setup Testing**

### **Test 1: Setup WhatsApp Integration for Coach**

**Endpoint:** `POST /api/whatsapp/integration/setup`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Body (Meta Official API):**
```json
{
  "integrationType": "meta_official",
  "metaApiToken": "your_meta_api_token",
  "phoneNumberId": "your_phone_number_id",
  "whatsAppBusinessAccountId": "your_business_account_id",
  "autoReplyEnabled": true,
  "autoReplyMessage": "Thanks for your message! I'll get back to you soon."
}
```

**Body (Baileys Personal Account):**
```json
{
  "integrationType": "baileys_personal",
  "personalPhoneNumber": "+1234567890",
  "autoReplyEnabled": true,
  "autoReplyMessage": "Thanks for your message! I'll get back to you soon."
}
```

**Body (Central Fallback):**
```json
{
  "integrationType": "central_fallback",
  "useCentralFallback": true,
  "centralAccountCredits": 100
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "WhatsApp integration setup successfully",
  "data": {
    "userId": "coach_id",
    "userType": "coach",
    "integrationType": "meta_official",
    "isActive": true,
    "statusSummary": "active",
    "autoReplyEnabled": true
  }
}
```

**Test Cases:**
- [ ] ✅ Coach can setup Meta Official API integration
- [ ] ✅ Coach can setup Baileys personal account integration
- [ ] ✅ Coach can setup Central Fallback integration
- [ ] ✅ All required fields are validated
- [ ] ✅ Integration is activated after setup
- [ ] ✅ Auto-reply settings are saved correctly

---

### **Test 2: Setup WhatsApp Integration for Staff Member**

**Endpoint:** `POST /api/whatsapp/integration/setup`

**Headers:**
```http
Authorization: Bearer STAFF_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "integrationType": "baileys_personal",
  "personalPhoneNumber": "+1234567890",
  "autoReplyEnabled": false
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "WhatsApp integration setup successfully",
  "data": {
    "userId": "staff_id",
    "userType": "staff",
    "integrationType": "baileys_personal",
    "isActive": true,
    "statusSummary": "connecting"
  }
}
```

**Test Cases:**
- [ ] ✅ Staff member can setup WhatsApp integration
- [ ] ✅ Staff integration is separate from coach integration
- [ ] ✅ Staff can use Baileys personal account
- [ ] ✅ Staff integration is visible to coaches
- [ ] ✅ Proper user type is assigned

---

### **Test 3: Switch Integration Types**

**Endpoint:** `POST /api/whatsapp/integration/switch`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "integrationType": "central_fallback"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Integration switched successfully",
  "data": {
    "userId": "coach_id",
    "userType": "coach",
    "integrationType": "central_fallback",
    "isActive": true,
    "useCentralFallback": true
  }
}
```

**Test Cases:**
- [ ] ✅ Coach can switch from Meta API to Central Fallback
- [ ] ✅ Coach can switch from Baileys to Meta API
- [ ] ✅ Previous integration is deactivated
- [ ] ✅ New integration is activated
- [ ] ✅ Settings are preserved where applicable

---

## 📱 **Baileys Personal Account Testing**

### **Test 4: Initialize Baileys Session**

**Endpoint:** `POST /api/whatsapp/baileys/initialize`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Baileys session initialized",
  "data": {
    "success": true,
    "sessionId": "default"
  }
}
```

**Test Cases:**
- [ ] ✅ Baileys session is initialized successfully
- [ ] ✅ Session directory is created in baileys_auth folder
- [ ] ✅ Integration status is updated to 'connecting'
- [ ] ✅ Event handlers are set up correctly
- [ ] ✅ Session data is stored in memory

---

### **Test 5: Get Baileys QR Code**

**Endpoint:** `GET /api/whatsapp/baileys/qr-code`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "status": "qr_ready"
  }
}
```

**Test Cases:**
- [ ] ✅ QR code is generated as data URL
- [ ] ✅ QR code is stored in session data
- [ ] ✅ QR code is accessible via API
- [ ] ✅ QR code format is correct (PNG base64)
- [ ] ✅ QR code can be scanned by WhatsApp mobile app

---

### **Test 6: Monitor Baileys Connection Status**

**Endpoint:** `GET /api/whatsapp/baileys/status`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response (Connecting):**
```json
{
  "success": true,
  "data": {
    "status": "connecting",
    "phoneNumber": null,
    "hasQRCode": true,
    "qrCode": "data:image/png;base64,..."
  }
}
```

**Expected Response (Connected):**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "phoneNumber": "1234567890@s.whatsapp.net",
    "hasQRCode": false,
    "qrCode": null
  }
}
```

**Test Cases:**
- [ ] ✅ Status changes from 'connecting' to 'connected'
- [ ] ✅ Phone number is captured after connection
- [ ] ✅ QR code is cleared after successful connection
- [ ] ✅ Connection timestamp is recorded
- [ ] ✅ Integration status is updated in database

---

### **Test 7: Disconnect Baileys Session**

**Endpoint:** `POST /api/whatsapp/baileys/disconnect`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Baileys session disconnected",
  "data": {
    "success": true,
    "message": "Session disconnected successfully"
  }
}
```

**Test Cases:**
- [ ] ✅ Session is properly disconnected
- [ ] ✅ Socket connection is closed
- [ ] ✅ Session data is cleaned up from memory
- [ ] ✅ Integration status is updated to 'disconnected'
- [ ] ✅ Session can be reinitialized after disconnect

---

## 🌐 **Meta Official API Testing**

### **Test 8: Test Meta API Connection**

**Endpoint:** `POST /api/whatsapp/integration/test`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Meta API connection successful",
    "data": {
      "templatesCount": 5,
      "phoneNumberId": "123456789"
    }
  }
}
```

**Test Cases:**
- [ ] ✅ Meta API credentials are validated
- [ ] ✅ API connection is tested successfully
- [ ] ✅ Available templates are retrieved
- [ ] ✅ Phone number ID is verified
- [ ] ✅ Health status is updated to 'healthy'

---

### **Test 9: Send Message via Meta API**

**Endpoint:** `POST /api/whatsapp/message/send`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "recipientPhone": "+1234567890",
  "messageContent": "Hello! This is a test message from FunnelsEye.",
  "messageType": "text",
  "useTemplate": false
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "success": true,
    "messageId": "wamid.123456789",
    "status": "sent",
    "viaCentralAccount": false
  }
}
```

**Test Cases:**
- [ ] ✅ Message is sent via Meta API successfully
- [ ] ✅ Message ID is returned from Meta
- [ ] ✅ Message is saved to database
- [ ] ✅ Credit is deducted from coach account
- [ ] ✅ Message statistics are updated

---

### **Test 10: Send Template Message via Meta API**

**Endpoint:** `POST /api/whatsapp/message/template`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "recipientPhone": "+1234567890",
  "templateName": "hello_world",
  "language": "en_US",
  "components": []
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Template message sent successfully",
  "data": {
    "success": true,
    "messageId": "wamid.123456789",
    "status": "sent",
    "templateName": "hello_world"
  }
}
```

**Test Cases:**
- [ ] ✅ Template message is sent successfully
- [ ] ✅ Template name is validated
- [ ] ✅ Language code is supported
- [ ] ✅ Message is saved with template type
- [ ] ✅ Template components are processed correctly

---

## 🔄 **Central Fallback Testing**

### **Test 11: Test Central Fallback Integration**

**Endpoint:** `POST /api/whatsapp/integration/test`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Central fallback connection successful",
    "data": {
      "templatesCount": 10
    }
  }
}
```

**Test Cases:**
- [ ] ✅ Central credentials are validated
- [ ] ✅ Central API connection is tested
- [ ] ✅ Templates are accessible via central account
- [ ] ✅ Health status is updated correctly
- [ ] ✅ Central account credits are available

---

### **Test 12: Send Message via Central Fallback**

**Endpoint:** `POST /api/whatsapp/message/send`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "recipientPhone": "+1234567890",
  "messageContent": "Hello! This message is sent via central fallback.",
  "messageType": "text"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "success": true,
    "messageId": "wamid.123456789",
    "status": "sent",
    "viaCentralAccount": true
  }
}
```

**Test Cases:**
- [ ] ✅ Message is sent via central account
- [ ] ✅ Central credentials are used
- [ ] ✅ Message is delivered successfully
- [ ] ✅ Central account credit is deducted
- [ ] ✅ Message is marked as sent via central account

---

### **Test 13: Automatic Fallback on Primary Integration Failure**

**Test Scenario:** Primary integration fails, automatic fallback to central account

**Steps:**
1. Setup Meta API integration with invalid credentials
2. Attempt to send message
3. Verify automatic fallback to central account
4. Check message delivery via central account

**Expected Results:**
- [ ] ✅ Primary integration fails gracefully
- [ ] ✅ Automatic fallback is triggered
- [ ] ✅ Message is sent via central account
- [ ] ✅ Error is logged appropriately
- [ ] ✅ User is notified of fallback usage

---

## 👥 **Staff Member Testing**

### **Test 14: Staff Member Integration Setup**

**Endpoint:** `POST /api/whatsapp/integration/setup`

**Headers:**
```http
Authorization: Bearer STAFF_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "integrationType": "baileys_personal",
  "personalPhoneNumber": "+1234567890",
  "autoReplyEnabled": true,
  "autoReplyMessage": "Hi! I'm a staff member. I'll assist you shortly."
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "WhatsApp integration setup successfully",
  "data": {
    "userId": "staff_id",
    "userType": "staff",
    "integrationType": "baileys_personal",
    "isActive": true,
    "statusSummary": "connecting"
  }
}
```

**Test Cases:**
- [ ] ✅ Staff member can setup WhatsApp integration
- [ ] ✅ Staff integration is separate from coach integration
- [ ] ✅ Staff can use all integration types
- [ ] ✅ Staff integration is visible to coaches
- [ ] ✅ Proper user type assignment

---

### **Test 15: Staff Member Message Sending**

**Endpoint:** `POST /api/whatsapp/message/send`

**Headers:**
```http
Authorization: Bearer STAFF_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "recipientPhone": "+1234567890",
  "messageContent": "Hello! I'm here to help you with your inquiry.",
  "messageType": "text"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "success": true,
    "messageId": "msg_123456789",
    "status": "sent"
  }
}
```

**Test Cases:**
- [ ] ✅ Staff member can send messages
- [ ] ✅ Messages are delivered successfully
- [ ] ✅ Messages are saved to database
- [ ] ✅ Staff user type is recorded correctly
- [ ] ✅ Message statistics are updated

---

### **Test 16: Coach Visibility of Staff Integrations**

**Endpoint:** `GET /api/whatsapp/integration/coaches`

**Headers:** None required (public endpoint)

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "coach_id",
      "userType": "coach",
      "integrationType": "meta_official",
      "isActive": true,
      "coachName": "John Doe",
      "coachEmail": "john@example.com",
      "selfCoachId": "W1234567",
      "currentLevel": 1
    },
    {
      "userId": "staff_id",
      "userType": "staff",
      "integrationType": "baileys_personal",
      "isActive": true
    }
  ]
}
```

**Test Cases:**
- [ ] ✅ All coach integrations are visible
- [ ] ✅ Staff integrations are visible to coaches
- [ ] ✅ Coach details are populated correctly
- [ ] ✅ Integration status is accurate
- [ ] ✅ User types are properly identified

---

## 💬 **Messaging Testing**

### **Test 17: Send Text Message**

**Endpoint:** `POST /api/whatsapp/message/send`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "recipientPhone": "+1234567890",
  "messageContent": "Hello! How can I help you today?",
  "messageType": "text"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "success": true,
    "messageId": "msg_123456789",
    "status": "sent"
  }
}
```

**Test Cases:**
- [ ] ✅ Text message is sent successfully
- [ ] ✅ Message content is preserved
- [ ] ✅ Message type is recorded correctly
- [ ] ✅ Message is saved to database
- [ ] ✅ Message statistics are updated

---

### **Test 18: Send Media Message**

**Endpoint:** `POST /api/whatsapp/message/send`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "recipientPhone": "+1234567890",
  "messageContent": "https://example.com/image.jpg",
  "messageType": "image"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "success": true,
    "messageId": "msg_123456789",
    "status": "sent"
  }
}
```

**Test Cases:**
- [ ] ✅ Media message is sent successfully
- [ ] ✅ Media URL is processed correctly
- [ ] ✅ Message type is set to 'image'
- [ ] ✅ Media content is accessible
- [ ] ✅ Message is delivered with media

---

### **Test 19: Auto-Reply Functionality**

**Test Scenario:** Test automatic reply when auto-reply is enabled

**Steps:**
1. Setup integration with auto-reply enabled
2. Send message to trigger auto-reply
3. Verify auto-reply is sent automatically
4. Check auto-reply message content

**Expected Results:**
- [ ] ✅ Auto-reply is triggered automatically
- [ ] ✅ Auto-reply message content is correct
- [ ] ✅ Auto-reply is sent via correct integration
- [ ] ✅ Auto-reply is saved to database
- [ ] ✅ Auto-reply doesn't trigger infinite loop

---

## 📥 **Inbox Management Testing**

### **Test 20: Get Inbox Conversations**

**Endpoint:** `GET /api/whatsapp/inbox/conversations?limit=20`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "contact_phone_number",
      "lastMessage": {
        "userId": "coach_id",
        "userType": "coach",
        "messageId": "msg_123",
        "from": "+1234567890",
        "to": null,
        "content": "Hello!",
        "direction": "inbound",
        "timestamp": "2024-01-15T10:30:00Z",
        "type": "text"
      },
      "messageCount": 5
    }
  ]
}
```

**Test Cases:**
- [ ] ✅ Conversations are retrieved correctly
- [ ] ✅ Last message details are included
- [ ] ✅ Message count is accurate
- [ ] ✅ Conversations are sorted by timestamp
- [ ] ✅ Limit parameter is respected

---

### **Test 21: Get Conversation Messages**

**Endpoint:** `GET /api/whatsapp/inbox/conversations/+1234567890/messages?limit=50`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "coach_id",
      "userType": "coach",
      "messageId": "msg_123",
      "from": "+1234567890",
      "to": null,
      "content": "Hello!",
      "direction": "inbound",
      "timestamp": "2024-01-15T10:30:00Z",
      "type": "text"
    }
  ]
}
```

**Test Cases:**
- [ ] ✅ Messages for specific contact are retrieved
- [ ] ✅ Messages are in chronological order
- [ ] ✅ Message details are complete
- [ ] ✅ Limit parameter is respected
- [ ] ✅ Only user's messages are returned

---

### **Test 22: Mark Conversation as Read**

**Endpoint:** `POST /api/whatsapp/inbox/conversations/:conversationId/read`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Conversation marked as read"
}
```

**Test Cases:**
- [ ] ✅ Conversation is marked as read
- [ ] ✅ All unread messages are updated
- [ ] ✅ Read timestamp is recorded
- [ ] ✅ Database is updated correctly
- [ ] ✅ Response confirms success

---

### **Test 23: Archive Conversation**

**Endpoint:** `POST /api/whatsapp/inbox/conversations/:conversationId/archive`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "action": "archive"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Conversation archived successfully",
  "data": {
    "status": "archived"
  }
}
```

**Test Cases:**
- [ ] ✅ Conversation is archived successfully
- [ ] ✅ Status is updated to 'archived'
- [ ] ✅ Unarchive action works correctly
- [ ] ✅ Status toggle functions properly
- [ ] ✅ Database is updated correctly

---

### **Test 24: Toggle Conversation Pin**

**Endpoint:** `POST /api/whatsapp/inbox/conversations/:conversationId/pin`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Conversation pinned successfully",
  "data": {
    "isPinned": true
  }
}
```

**Test Cases:**
- [ ] ✅ Conversation pin toggle works
- [ ] ✅ Pin status is updated correctly
- [ ] ✅ Multiple conversations can be pinned
- [ ] ✅ Pin status persists after refresh
- [ ] ✅ Database is updated correctly

---

### **Test 25: Search Inbox**

**Endpoint:** `GET /api/whatsapp/inbox/search?searchTerm=hello&searchType=messages&limit=20`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "coach_id",
      "userType": "coach",
      "messageId": "msg_123",
      "content": "Hello! How can I help?",
      "direction": "outbound",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Test Cases:**
- [ ] ✅ Search term is processed correctly
- [ ] ✅ Search type parameter works (messages/conversations)
- [ ] ✅ Results are filtered appropriately
- [ ] ✅ Limit parameter is respected
- [ ] ✅ Search is case-insensitive

---

### **Test 26: Get Inbox Statistics**

**Endpoint:** `GET /api/whatsapp/inbox/stats`

**Headers:**
```http
Authorization: Bearer COACH_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "conversations": 15,
    "messages": 150,
    "unread": 5
  }
}
```

**Test Cases:**
- [ ] ✅ Conversation count is accurate
- [ ] ✅ Message count is accurate
- [ ] ✅ Unread count is accurate
- [ ] ✅ Statistics are real-time
- [ ] ✅ Only user's data is counted

---

## 🔒 **Security & Access Control Testing**

### **Test 27: Authentication Required**

**Test Scenario:** Access protected endpoints without authentication

**Expected Results:**
- [ ] ✅ All protected endpoints return 401 Unauthorized
- [ ] ✅ JWT token validation is enforced
- [ ] ✅ Expired tokens are rejected
- [ ] ✅ Invalid tokens are rejected
- [ ] ✅ Token format is validated

---

### **Test 28: User Type Validation**

**Test Scenario:** Test access control for different user types

**Expected Results:**
- [ ] ✅ Coaches can access coach-specific endpoints
- [ ] ✅ Staff can access staff-specific endpoints
- [ ] ✅ Coaches can see staff integrations
- [ ] ✅ Staff cannot access coach-only features
- [ ] ✅ Admin can access all endpoints

---

### **Test 29: Data Isolation**

**Test Scenario:** Verify users can only access their own data

**Expected Results:**
- [ ] ✅ Users can only see their own integrations
- [ ] ✅ Users can only see their own messages
- [ ] ✅ Users can only see their own conversations
- [ ] ✅ Cross-user data access is prevented
- [ ] ✅ Admin can access all user data

---

## 🧪 **Integration Testing**

### **Test 30: Complete WhatsApp Flow**

**Test Scenario:** End-to-end WhatsApp integration testing

**Steps:**
1. Setup Meta API integration for coach
2. Setup Baileys integration for staff
3. Send messages via both integrations
4. Receive and process incoming messages
5. Test auto-reply functionality
6. Test central fallback
7. Verify message storage and retrieval

**Expected Results:**
- [ ] ✅ All integrations work correctly
- [ ] ✅ Messages are delivered successfully
- [ ] ✅ Incoming messages are processed
- [ ] ✅ Auto-replies work as expected
- [ ] ✅ Central fallback functions properly
- [ ] ✅ Data is stored and retrieved correctly

---

### **Test 31: Integration Switching**

**Test Scenario:** Test switching between different integration types

**Steps:**
1. Start with Meta API integration
2. Switch to Baileys personal account
3. Switch to Central Fallback
4. Switch back to Meta API
5. Verify each switch works correctly

**Expected Results:**
- [ ] ✅ Integration switching works smoothly
- [ ] ✅ Previous integration is deactivated
- [ ] ✅ New integration is activated
- [ ] ✅ Settings are preserved where applicable
- [ ] ✅ No data loss during switching

---

### **Test 32: Error Handling and Recovery**

**Test Scenario:** Test system behavior during integration failures

**Steps:**
1. Simulate Meta API failure
2. Test automatic fallback to central account
3. Simulate Baileys connection loss
4. Test reconnection functionality
5. Verify error logging and monitoring

**Expected Results:**
- [ ] ✅ Failures are handled gracefully
- [ ] ✅ Automatic fallback works correctly
- [ ] ✅ Reconnection attempts are made
- [ ] ✅ Errors are logged appropriately
- [ ] ✅ System remains stable during failures

---

### **Test 33: Performance and Load Testing**

**Test Scenario:** Test system performance under load

**Steps:**
1. Send multiple messages simultaneously
2. Test with multiple concurrent users
3. Monitor system resource usage
4. Test database performance
5. Verify response times

**Expected Results:**
- [ ] ✅ System handles concurrent requests
- [ ] ✅ Response times remain acceptable
- [ ] ✅ Database performance is stable
- [ ] ✅ Memory usage is optimized
- [ ] ✅ No resource leaks occur

---

## 🚨 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **Issue 1: Baileys QR Code Not Generated**
**Symptoms:** QR code endpoint returns "QR code not generated yet"
**Solution:** 
1. Ensure Baileys session is initialized first
2. Wait for connection event to generate QR code
3. Check session directory permissions
4. Verify Baileys dependencies are installed

#### **Issue 2: Meta API Authentication Failed**
**Symptoms:** 401 Unauthorized errors from Meta API
**Solution:**
1. Verify API token is valid and not expired
2. Check phone number ID is correct
3. Ensure WhatsApp Business Account is active
4. Verify webhook verification token matches

#### **Issue 3: Central Fallback Not Working**
**Symptoms:** Central fallback integration fails
**Solution:**
1. Check environment variables are set correctly
2. Verify central account has sufficient credits
3. Ensure central account is active
4. Check API rate limits

#### **Issue 4: Messages Not Being Delivered**
**Symptoms:** Messages appear sent but not delivered
**Solution:**
1. Check recipient phone number format
2. Verify integration is active and healthy
3. Check for API rate limiting
4. Verify webhook configuration

#### **Issue 5: Session Management Issues**
**Symptoms:** Baileys sessions not persisting or reconnecting
**Solution:**
1. Check session directory permissions
2. Verify session data is being saved
3. Check for memory leaks in session storage
4. Ensure proper cleanup on disconnect

#### **Issue 6: Staff Integration Not Visible**
**Symptoms:** Staff integrations not showing to coaches
**Solution:**
1. Verify staff user type is set correctly
2. Check integration is active
3. Ensure proper database indexing
4. Verify API endpoint permissions

#### **Issue 7: Auto-Reply Not Working**
**Symptoms:** Auto-reply messages not being sent
**Solution:**
1. Check auto-reply is enabled in integration
2. Verify auto-reply message content
3. Ensure integration is active
4. Check for infinite loop prevention

---

## 📝 **Testing Notes**

### **Key Features Tested:**
1. **Multi-User Support:** Coaches and staff members can both use WhatsApp integration
2. **Multiple Integration Types:** Meta Official API, Baileys Personal Account, Central Fallback
3. **QR Code Generation:** Baileys integration provides QR codes for WhatsApp Web authentication
4. **Automatic Fallback:** System automatically falls back to central account when primary integration fails
5. **Central Account Usage:** Central FunnelsEye account can be used with credit tracking
6. **Inbox Management:** Complete conversation and message management system
7. **Security:** Proper authentication and data isolation between users
8. **Performance:** System handles concurrent requests and maintains performance
9. **Error Handling:** Graceful failure handling and recovery mechanisms
10. **Integration Switching:** Seamless switching between different integration types

### **Testing Priorities:**
- 🔴 **High Priority:** Core integration setup, message sending, Baileys QR code
- 🟡 **Medium Priority:** Inbox management, integration switching, error handling
- 🟢 **Low Priority:** Advanced features, performance testing, edge cases

---

## 🎯 **Success Criteria**

### **All Tests Must Pass:**
- [ ] ✅ WhatsApp integration setup works for both coaches and staff
- [ ] ✅ Baileys QR code generation and scanning works correctly
- [ ] ✅ Meta API integration functions properly
- [ ] ✅ Central fallback system works automatically
- [ ] ✅ Message sending and receiving works across all integrations
- [ ] ✅ Inbox management system functions correctly
- [ ] ✅ Security and access control are properly enforced
- [ ] ✅ Error handling and recovery work as expected
- [ ] ✅ Integration switching works smoothly
- [ ] ✅ Data storage and retrieval are accurate
- [ ] ✅ Performance remains acceptable under load
- [ ] ✅ All 33 test scenarios pass successfully

---

**Last Updated:** January 2024  
**Version:** 2.0  
**Status:** Ready for Testing

## 🔗 **Quick Reference Links**

### **Core Endpoints:**
- **Integration Setup:** `POST /api/whatsapp/integration/setup`
- **Baileys QR Code:** `GET /api/whatsapp/baileys/qr-code`
- **Send Message:** `POST /api/whatsapp/message/send`
- **Get Conversations:** `GET /api/whatsapp/inbox/conversations`

### **Environment Variables:**
- `WHATSAPP_CENTRAL_API_TOKEN`
- `WHATSAPP_CENTRAL_PHONE_NUMBER_ID`
- `WHATSAPP_CENTRAL_BUSINESS_ACCOUNT_ID`

### **Integration Types:**
- `meta_official` - Meta WhatsApp Business API
- `baileys_personal` - Personal WhatsApp account via Baileys
- `central_fallback` - Central FunnelsEye account fallback

### **Total Test Cases: 33**
This comprehensive testing guide covers all implemented features and provides thorough testing coverage for the unified WhatsApp integration system.
