# 🚀 UNIFIED WHATSAPP TESTING GUIDE
## Complete Testing Guide for Implemented WhatsApp Integration Features

---

## 📋 **TABLE OF CONTENTS**
1. [Integration Setup & Management](#integration-setup--management)
2. [Messaging & Communication](#messaging--communication)
3. [Inbox Management](#inbox-management)
4. [Contact Management](#contact-management)
5. [Baileys Personal Account Management](#baileys-personal-account-management)
6. [Integration Health & Testing](#integration-health--testing)
7. [Staff Member Testing](#staff-member-testing)
8. [Error Handling & Edge Cases](#error-handling--edge-cases)

---

## 🔧 **PREREQUISITES**
- Valid JWT token for authenticated endpoints
- WhatsApp Business API credentials (Meta) - Optional
- Test phone numbers for messaging
- Environment variables configured for WhatsApp services

## 🎯 **NEW WORKFLOW FOR BAILEYS INTEGRATION**

### **Step 1: Setup Integration (Database Only)**
```http
POST {{baseUrl}}/api/whatsapp/integration/setup
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "integrationType": "baileys_personal"
}
```
- ✅ Creates database record only
- ✅ No QR code generated
- ✅ No session created
- ✅ Fast response

### **Step 2: Initialize Baileys Service (Get QR Code)**
```http
POST {{baseUrl}}/api/whatsapp/baileys/initialize
Authorization: Bearer {{jwt_token}}
```
- ✅ Creates Baileys session
- ✅ Generates QR code
- ✅ Returns QR code in response
- ✅ Manages session lifecycle
- ✅ **Prints QR code in console for debugging**

**Why This Separation?**
- **Setup**: Fast database operation, no waiting
- **Initialize**: Generates QR code when user is ready
- **No Hanging**: Setup endpoint never gets stuck
- **Better UX**: User controls when to start Baileys
- **No Server Crashes**: Simplified error handling prevents restarts

---

## 🌐 **ENVIRONMENT SETUP**

### **Required Environment Variables:**
```bash
# Meta WhatsApp Business API (Optional)
WHATSAPP_API_URL=https://graph.facebook.com/v19.0
WHATSAPP_CENTRAL_API_TOKEN=your_central_token
WHATSAPP_CENTRAL_PHONE_NUMBER_ID=your_central_phone_id
WHATSAPP_CENTRAL_BUSINESS_ACCOUNT_ID=your_central_business_id

# Baileys Configuration
BAILEYS_SESSION_PATH=./baileys_auth
BAILEYS_MAX_SESSIONS=10

# Webhook Verification
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_token
```

---

## 1. 🔌 **INTEGRATION SETUP & MANAGEMENT**

### **1.1 Setup New WhatsApp Integration**
```http
POST {{baseUrl}}/api/whatsapp/integration/setup
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "integrationType": "baileys_personal"
}
```

**Supported Integration Types:**
- `meta_official` - Meta WhatsApp Business API
- `baileys_personal` - Personal WhatsApp via Baileys
- `central_fallback` - Central FunnelsEye account

**Important:** 
- **Setup only creates the database record** - no QR code is generated
- **For Baileys**: Use `/api/whatsapp/baileys/initialize` separately to get QR code
- **For Meta**: Credentials are validated during setup

**Test Cases:**
- ✅ Setup Baileys integration (creates record only)
- ✅ Setup Meta Official API integration (with credentials)
- ✅ Setup central fallback integration
- ✅ Validate required fields for each integration type
- ✅ Test with invalid credentials (should fail gracefully)
- ✅ Test with missing required fields
- ✅ Verify integration is marked as active
- ✅ Verify no QR code is generated during setup

### **1.2 Switch Active Integration**
```http
PUT {{baseUrl}}/api/whatsapp/integration/switch
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "integrationType": "baileys_personal"
}
```

**Test Cases:**
- ✅ Switch between different integration types
- ✅ Validate integration type exists
- ✅ Test switching to already active integration
- ✅ Test with invalid integration type
- ✅ Verify old integration is deactivated
- ✅ Verify new integration is activated

### **1.3 Get User Integrations**
```http
GET {{baseUrl}}/api/whatsapp/integration/list
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Retrieve all integrations for current user
- ✅ Verify integration details are correct
- ✅ Check active integration is marked properly
- ✅ Test with user having no integrations
- ✅ Verify user type (coach/staff) is correct

### **1.4 Test Integration Connection**
```http
POST {{baseUrl}}/api/whatsapp/integration/test
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Test Meta API connection
- ✅ Test Baileys session status
- ✅ Test central fallback connection
- ✅ Verify response includes connection details
- ✅ Test with disconnected/invalid integration
- ✅ Verify health status is updated

### **1.5 Get Integration Health Status**
```http
GET {{baseUrl}}/api/whatsapp/integration/health
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Check Meta API health
- ✅ Check Baileys session health
- ✅ Check central fallback health
- ✅ Verify response includes status indicators
- ✅ Test with various integration states
- ✅ Verify error count and last error details

---

## 2. 💬 **MESSAGING & COMMUNICATION**

### **2.1 Send WhatsApp Message**
```http
POST {{baseUrl}}/api/whatsapp/message/send
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "recipientPhone": "+1234567890",
  "messageContent": "Hello! This is a test message.",
  "messageType": "text",
  "useTemplate": false
}
```

**Test Cases:**
- ✅ Send text message via Meta API
- ✅ Send text message via Baileys
- ✅ Send text message via central fallback
- ✅ Test with different phone number formats
- ✅ Test with invalid phone numbers
- ✅ Test message length limits
- ✅ Test fallback to central account when personal integration fails
- ✅ Verify message is stored in database
- ✅ Verify message statistics are updated

### **2.2 Send Template Message**
```http
POST {{baseUrl}}/api/whatsapp/message/template
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "recipientPhone": "+1234567890",
  "templateName": "welcome_message",
  "language": "en",
  "components": [
    {
      "type": "body",
      "parameters": [
        {
          "type": "text",
          "text": "John"
        }
      ]
    }
  ]
}
```

**Test Cases:**
- ✅ Send approved template message
- ✅ Test with different template names
- ✅ Test with various language codes
- ✅ Test template parameter substitution
- ✅ Test with invalid template names
- ✅ Verify template message is sent via Meta API
- ✅ Verify message delivery status

---

## 3. 📥 **INBOX MANAGEMENT**

### **3.1 Get Inbox Conversations**
```http
GET {{baseUrl}}/api/whatsapp/inbox/conversations?limit=20&offset=0
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Retrieve conversations with pagination
- ✅ Test pagination limits
- ✅ Verify conversation metadata is complete
- ✅ Test with empty inbox
- ✅ Verify conversations are sorted by last message
- ✅ Test with high conversation volume

### **3.2 Get Conversation Messages**
```http
GET {{baseUrl}}/api/whatsapp/inbox/conversations/{{contactPhone}}/messages?limit=50
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Retrieve messages for specific conversation
- ✅ Test message pagination
- ✅ Verify message ordering (chronological)
- ✅ Test with non-existent contact
- ✅ Test message limit boundaries
- ✅ Verify message content and metadata

### **3.3 Mark Conversation as Read**
```http
POST {{baseUrl}}/api/whatsapp/inbox/conversations/{{conversationId}}/read
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Mark conversation as read
- ✅ Verify unread count decreases
- ✅ Test with invalid conversation ID
- ✅ Test with already read conversation
- ✅ Verify read timestamp is updated

### **3.4 Archive/Unarchive Conversation**
```http
POST {{baseUrl}}/api/whatsapp/inbox/conversations/{{conversationId}}/archive
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "action": "archive"
}
```

**Test Cases:**
- ✅ Archive conversation
- ✅ Unarchive conversation
- ✅ Verify conversation appears in correct list
- ✅ Test with invalid action values
- ✅ Test with non-existent conversation
- ✅ Verify archive status is persisted

### **3.5 Toggle Conversation Pin**
```http
POST {{baseUrl}}/api/whatsapp/inbox/conversations/{{conversationId}}/pin
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Pin conversation
- ✅ Unpin conversation
- ✅ Verify pinned conversations appear first
- ✅ Test with non-existent conversation
- ✅ Verify pin status is persisted

### **3.6 Search Inbox**
```http
GET {{baseUrl}}/api/whatsapp/inbox/search?query=john&limit=20&offset=0
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Search conversations by contact name
- ✅ Search messages by content
- ✅ Test search result pagination
- ✅ Test with empty search query
- ✅ Test with special characters
- ✅ Test search result relevance

### **3.7 Get Inbox Statistics**
```http
GET {{baseUrl}}/api/whatsapp/inbox/stats
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Retrieve inbox statistics
- ✅ Verify counts are accurate
- ✅ Test with empty inbox
- ✅ Test with high message volume
- ✅ Verify real-time updates
- ✅ Verify statistics include conversations, messages, and unread counts

---

## 4. 👥 **CONTACT MANAGEMENT**

### **4.1 Get All Contacts**
```http
GET {{baseUrl}}/api/whatsapp/contacts
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Retrieve contacts
- ✅ Test contact pagination
- ✅ Verify contact metadata is complete
- ✅ Test with no contacts
- ✅ Verify contacts are sorted by last interaction
- ✅ Test with high contact volume

### **4.2 Update Contact Information**
```http
PUT {{baseUrl}}/api/whatsapp/contacts/{{contactId}}
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "contactName": "John Doe Updated",
  "notes": "VIP customer - high priority",
  "category": "client",
  "tags": ["vip", "fitness"]
}
```

**Test Cases:**
- ✅ Update contact name
- ✅ Update contact notes and category
- ✅ Add/remove contact tags
- ✅ Test with invalid contact ID
- ✅ Test with empty update data
- ✅ Verify changes are persisted

### **4.3 Toggle Contact Block Status**
```http
POST {{baseUrl}}/api/whatsapp/contacts/{{contactId}}/block
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "action": "block"
}
```

**Test Cases:**
- ✅ Block contact
- ✅ Unblock contact
- ✅ Verify blocked contacts can't receive messages
- ✅ Test with invalid action values
- ✅ Test with non-existent contact
- ✅ Verify block status is persisted

---

## 5. 📱 **BAILEYS PERSONAL ACCOUNT MANAGEMENT**

### **5.1 Initialize Baileys Session (Get QR Code)**
```http
POST {{baseUrl}}/api/whatsapp/baileys/initialize
Authorization: Bearer {{jwt_token}}
```

**Important:** 
- **Prerequisite**: Must have Baileys integration setup first
- **Purpose**: Generates QR code for WhatsApp Web authentication
- **Response**: Returns QR code data URL directly
- **Session**: Creates and manages Baileys session
- **Console Output**: QR code is printed in server console for debugging

**What Happens**:
1. **Session Creation**: Creates new Baileys session
2. **QR Generation**: Waits for QR code (max 15 seconds)
3. **Console Output**: Prints QR code in server console for debugging
4. **Response**: Returns QR code data URL to client

**Test Cases:**
- ✅ Initialize Baileys session for coach (after setup)
- ✅ Initialize Baileys session for staff (after setup)
- ✅ Test with invalid user credentials
- ✅ Test with non-existent integration (should fail)
- ✅ Verify QR code generation and return
- ✅ Verify session state management
- ✅ Test session reconnection logic
- ✅ Test session cleanup on disconnect
- ✅ Verify no duplicate sessions created
- ✅ **Verify no server crashes or restarts**
- ✅ **Verify simplified error handling**

### **5.2 Get Baileys QR Code**
```http
GET {{baseUrl}}/api/whatsapp/baileys/qr
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Retrieve QR code for scanning
- ✅ Verify QR code format (data URL)
- ✅ Test QR code expiration
- ✅ Test with non-existent session
- ✅ Verify QR code is unique per session
- ✅ Test QR code regeneration

### **5.3 Get Baileys Session Status**
```http
GET {{baseUrl}}/api/whatsapp/baileys/status
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Check session connection status
- ✅ Verify status includes connection details
- ✅ Test with disconnected session
- ✅ Test with expired session
- ✅ Verify real-time status updates
- ✅ Verify phone number is displayed when connected

### **5.4 Disconnect Baileys Session**
```http
POST {{baseUrl}}/api/whatsapp/baileys/disconnect
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Disconnect active session
- ✅ Verify session is properly closed
- ✅ Test with already disconnected session
- ✅ Test with non-existent session
- ✅ Verify session cleanup
- ✅ Verify session status is updated

---

## 6. 🧪 **INTEGRATION HEALTH & TESTING**

### **6.1 Test Integration End-to-End**
```http
GET {{baseUrl}}/api/whatsapp/integration/test
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Test Meta API connectivity
- ✅ Test Baileys session health
- ✅ Test central fallback connectivity
- ✅ Verify message sending capability
- ✅ Verify database operations
- ✅ Test error handling
- ✅ Verify health status updates

### **6.2 Monitor Integration Health**
```http
GET {{baseUrl}}/api/whatsapp/integration/health
Authorization: Bearer {{jwt_token}}
```

**Test Cases:**
- ✅ Check API response times
- ✅ Verify database connectivity
- ✅ Test external service health
- ✅ Monitor error rates
- ✅ Verify uptime statistics
- ✅ Verify error details are logged

---

## 7. 👨‍💼 **STAFF MEMBER TESTING**

### **7.1 Staff WhatsApp Integration Setup**
```http
POST {{baseUrl}}/api/whatsapp/integration/setup
Authorization: Bearer {{staff_jwt_token}}
Content-Type: application/json

{
  "integrationType": "meta_official",
  "metaApiToken": "staff_meta_token",
  "phoneNumberId": "staff_phone_id"
}
```

**Test Cases:**
- ✅ Staff can setup WhatsApp integration
- ✅ Staff integration is isolated from coach
- ✅ Staff can send messages independently
- ✅ Staff integration appears in coach dashboard
- ✅ Test staff permission restrictions
- ✅ Verify staff user type is correctly set

### **7.2 Staff Message Sending**
```http
POST {{baseUrl}}/api/whatsapp/message/send
Authorization: Bearer {{staff_jwt_token}}
Content-Type: application/json

{
  "recipientPhone": "+1234567890",
  "messageContent": "Hello from staff member"
}
```

**Test Cases:**
- ✅ Staff can send messages
- ✅ Messages are attributed to staff member
- ✅ Staff can access their own inbox
- ✅ Test staff message limits
- ✅ Verify staff activity tracking
- ✅ Verify staff messages are stored correctly

---

## 8. ⚠️ **ERROR HANDLING & EDGE CASES**

### **8.1 Invalid Integration Type**
```http
POST {{baseUrl}}/api/whatsapp/integration/setup
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "integrationType": "invalid_type"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid integration type. Supported types: meta_official, baileys_personal, central_fallback"
}
```

### **8.2 Missing Required Fields**
```http
POST {{baseUrl}}/api/whatsapp/integration/setup
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "integrationType": "meta_official"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Meta API token and phone number ID are required for official integration"
}
```

### **8.3 Invalid Phone Number Format**
```http
POST {{baseUrl}}/api/whatsapp/message/send
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "recipientPhone": "invalid_phone",
  "messageContent": "Test message"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid phone number format"
}
```

### **8.4 Rate Limiting**
```http
POST {{baseUrl}}/api/whatsapp/message/send
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "recipientPhone": "+1234567890",
  "messageContent": "Rate limit test"
}
```

**Test Cases:**
- ✅ Send multiple messages rapidly
- ✅ Verify rate limiting is enforced
- ✅ Test rate limit recovery
- ✅ Verify rate limit headers
- ✅ Test with different integration types

---

## 🔍 **TESTING CHECKLIST**

### **Integration Setup**
- [ ] Meta API integration setup
- [ ] Baileys personal account setup
- [ ] Central fallback integration setup
- [ ] Integration switching
- [ ] Integration testing
- [ ] Health monitoring

### **Messaging**
- [ ] Text message sending
- [ ] Template message sending
- [ ] Message delivery status
- [ ] Rate limiting
- [ ] Error handling
- [ ] Fallback system

### **Inbox Management**
- [ ] Conversation retrieval
- [ ] Message history
- [ ] Conversation actions (read, archive, pin)
- [ ] Search functionality
- [ ] Statistics
- [ ] Pagination

### **Contact Management**
- [ ] Contact retrieval
- [ ] Contact updates
- [ ] Contact blocking
- [ ] Contact categorization

### **Baileys Features**
- [ ] Session initialization
- [ ] QR code generation
- [ ] Session status monitoring
- [ ] Session disconnection
- [ ] Session cleanup

### **Staff Features**
- [ ] Staff integration setup
- [ ] Staff message sending
- [ ] Coach dashboard visibility
- [ ] Permission validation
- [ ] Data isolation

### **Error Handling**
- [ ] Invalid inputs
- [ ] Network failures
- [ ] API rate limits
- [ ] Database errors
- [ ] Permission errors

---

## 📱 **TESTING TOOLS & RESOURCES**

### **Phone Numbers for Testing**
- **Meta API Testing**: Use WhatsApp Business API test numbers
- **Baileys Testing**: Use personal WhatsApp numbers
- **Webhook Testing**: Use ngrok or similar for local testing

### **Test Scenarios**
1. **Happy Path**: Normal message sending and receiving
2. **Error Handling**: Invalid inputs and edge cases
3. **Performance**: High volume message testing
4. **Security**: Permission validation and data isolation
5. **Integration**: Cross-feature functionality testing
6. **Fallback**: Primary integration failure scenarios

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Environment Variables**
```bash
# Meta WhatsApp Business API
WHATSAPP_META_API_TOKEN=your_token
WHATSAPP_META_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_META_BUSINESS_ACCOUNT_ID=your_business_id

# Central Fallback Account
WHATSAPP_CENTRAL_API_TOKEN=central_token
WHATSAPP_CENTRAL_PHONE_NUMBER_ID=central_phone_id

# Webhook Verification
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_token

# Baileys Configuration
BAILEYS_SESSION_PATH=./baileys_auth
BAILEYS_MAX_SESSIONS=10
```

### **Database Setup**
- Ensure WhatsApp schemas are migrated
- Verify indexes are created
- Test database connectivity

### **External Services**
- Meta WhatsApp Business API access
- Central fallback account setup
- Webhook endpoint accessibility

---

## 📊 **MONITORING & ANALYTICS**

### **Key Metrics to Track**
- Message delivery success rate
- Integration uptime
- Response times
- Error rates
- User engagement
- Fallback usage

### **Alerting**
- Integration failures
- High error rates
- Rate limit violations
- Webhook failures
- Session disconnections

---

## 🔧 **TROUBLESHOOTING GUIDE**

### **Common Issues**

#### **1. Meta API Integration Fails**
- Verify API token is valid
- Check phone number ID is correct
- Ensure business account is approved
- Verify webhook is configured

#### **2. Baileys Session Issues**
- Check session initialization
- Verify QR code is scanned
- Check session storage path
- Verify session limits

#### **3. Message Sending Fails**
- Check integration status
- Verify phone number format
- Check rate limits
- Verify fallback configuration

#### **4. Database Errors**
- Check database connectivity
- Verify schema migrations
- Check indexes
- Verify user permissions

---

This comprehensive testing guide covers all implemented WhatsApp integration endpoints and provides a structured approach to testing the complete system. Use this guide to ensure all features work correctly before deploying to production.
