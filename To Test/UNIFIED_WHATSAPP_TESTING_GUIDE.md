# 📱 UNIFIED WHATSAPP INTEGRATION TESTING GUIDE

## 📋 **Overview**
This guide covers testing of the complete Unified WhatsApp Integration system that handles both Meta API and Baileys personal account integrations, including setup, messaging, inbox management, and automation features.

---

## 🔑 **PREREQUISITES**
- Server running on localhost:3000
- Postman or similar API testing tool
- Test database with sample data
- Valid authentication tokens (coach)
- Meta API credentials (for Meta integration testing)
- Baileys session setup (for personal account testing)

---

## 📊 **TESTING SEQUENCE**

### **Phase 1: Integration Setup & Management**
### **Phase 2: Messaging & Communication**
### **Phase 3: Inbox Management & Conversations**
### **Phase 4: Contact Management & Automation**
### **Phase 5: Baileys Personal Account Features**

---

## 🔧 **PHASE 1: INTEGRATION SETUP & MANAGEMENT**

### **1.1 Setup WhatsApp Integration (Meta API)**
```http
POST /api/whatsapp/integration/setup
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "integrationType": "meta_official",
  "metaApiToken": "EAA...",
  "phoneNumberId": "123456789",
  "businessAccountId": "act_123456789",
  "webhookUrl": "https://yourdomain.com/api/whatsapp/webhook",
  "coachId": "coach_123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "int_123",
    "integrationType": "meta_official",
    "status": "active",
    "phoneNumberId": "123456789",
    "businessAccountId": "act_123456789",
    "webhookUrl": "https://yourdomain.com/api/whatsapp/webhook",
    "coachId": "coach_123",
    "createdAt": "2025-01-20T10:00:00Z"
  }
}
```

**Test Cases:**
- ✅ Should create Meta API integration
- ✅ Should validate API credentials
- ✅ Should require coach authentication
- ✅ Should set webhook URL

---

### **1.2 Setup WhatsApp Integration (Baileys Personal)**
```http
POST /api/whatsapp/integration/setup
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "integrationType": "baileys_personal",
  "phoneNumber": "+1234567890",
  "sessionName": "coach_123_session",
  "coachId": "coach_123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "int_124",
    "integrationType": "baileys_personal",
    "status": "initializing",
    "phoneNumber": "+1234567890",
    "sessionName": "coach_123_session",
    "coachId": "coach_123",
    "createdAt": "2025-01-20T10:05:00Z"
  }
}
```

**Test Cases:**
- ✅ Should create Baileys personal integration
- ✅ Should initialize session
- ✅ Should require coach authentication
- ✅ Should generate unique session name

---

### **1.3 Switch Between Integration Types**
```http
POST /api/whatsapp/integration/switch
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "integrationType": "baileys_personal",
  "coachId": "coach_123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Integration switched successfully",
    "previousType": "meta_official",
    "newType": "baileys_personal",
    "switchedAt": "2025-01-20T10:10:00Z"
  }
}
```

**Test Cases:**
- ✅ Should switch integration type
- ✅ Should deactivate previous integration
- ✅ Should require coach authentication
- ✅ Should maintain data integrity

---

### **1.4 List All Integrations for Coach**
```http
GET /api/whatsapp/integration/list?coachId=coach_123
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "int_123",
      "integrationType": "meta_official",
      "status": "active",
      "phoneNumberId": "123456789",
      "businessAccountId": "act_123456789",
      "createdAt": "2025-01-20T10:00:00Z"
    },
    {
      "id": "int_124",
      "integrationType": "baileys_personal",
      "status": "active",
      "phoneNumber": "+1234567890",
      "sessionName": "coach_123_session",
      "createdAt": "2025-01-20T10:05:00Z"
    }
  ]
}
```

**Test Cases:**
- ✅ Should return all coach integrations
- ✅ Should include integration status
- ✅ Should require coach authentication
- ✅ Should filter by coach ID

---

### **1.5 Test Integration Connection**
```http
POST /api/whatsapp/integration/test
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "integrationId": "int_123",
  "coachId": "coach_123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Integration test successful",
    "integrationId": "int_123",
    "status": "connected",
    "testedAt": "2025-01-20T10:15:00Z",
    "responseTime": "150ms"
  }
}
```

**Test Cases:**
- ✅ Should test integration connection
- ✅ Should return connection status
- ✅ Should require coach authentication
- ✅ Should measure response time

---

### **1.6 Get Integration Health Status**
```http
GET /api/whatsapp/integration/health?coachId=coach_123
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "coachId": "coach_123",
    "integrations": [
      {
        "id": "int_123",
        "type": "meta_official",
        "status": "healthy",
        "lastChecked": "2025-01-20T10:20:00Z",
        "uptime": "99.8%",
        "messageCount": 1250
      },
      {
        "id": "int_124",
        "type": "baileys_personal",
        "status": "healthy",
        "lastChecked": "2025-01-20T10:20:00Z",
        "uptime": "99.9%",
        "messageCount": 890
      }
    ],
    "overallHealth": "healthy"
  }
}
```

**Test Cases:**
- ✅ Should return integration health status
- ✅ Should include uptime and message counts
- ✅ Should require coach authentication
- ✅ Should show overall health

---

## 💬 **PHASE 2: MESSAGING & COMMUNICATION**

### **2.1 Send WhatsApp Message**
```http
POST /api/whatsapp/message/send
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "recipientNumber": "+1234567890",
  "content": "Hello! How can I help you today?",
  "integrationId": "int_123",
  "options": {
    "mediaUrl": "https://example.com/image.jpg",
    "mediaType": "image",
    "caption": "Check out our latest offer!"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_123",
    "recipientNumber": "+1234567890",
    "status": "sent",
    "sentAt": "2025-01-20T10:25:00Z",
    "integrationId": "int_123"
  }
}
```

**Test Cases:**
- ✅ Should send WhatsApp message
- ✅ Should support media attachments
- ✅ Should require coach authentication
- ✅ Should return message ID

---

### **2.2 Send Template Message**
```http
POST /api/whatsapp/message/template
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "recipientNumber": "+1234567890",
  "templateName": "welcome_message",
  "language": "en",
  "integrationId": "int_123",
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

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_124",
    "recipientNumber": "+1234567890",
    "templateName": "welcome_message",
    "status": "sent",
    "sentAt": "2025-01-20T10:30:00Z"
  }
}
```

**Test Cases:**
- ✅ Should send template message
- ✅ Should support dynamic parameters
- ✅ Should require coach authentication
- ✅ Should validate template format

---

## 📥 **PHASE 3: INBOX MANAGEMENT & CONVERSATIONS**

### **3.1 Get Inbox Conversations**
```http
GET /api/whatsapp/inbox/conversations?coachId=coach_123&status=active&category=lead&search=john&page=1&limit=20
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_123",
        "contactId": "contact_123",
        "contactName": "John Doe",
        "phoneNumber": "+1234567890",
        "lastMessage": "I'm interested in your program",
        "lastMessageTime": "2025-01-20T10:00:00Z",
        "status": "active",
        "category": "lead",
        "unreadCount": 2,
        "priority": "high"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    },
    "filters": {
      "status": "active",
      "category": "lead",
      "search": "john"
    }
  }
}
```

**Test Cases:**
- ✅ Should return filtered conversations
- ✅ Should include pagination
- ✅ Should support search and filters
- ✅ Should require coach authentication

---

### **3.2 Get Messages for Conversation**
```http
GET /api/whatsapp/inbox/conversations/conv_123/messages?page=1&limit=50
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_123",
    "contactId": "contact_123",
    "messages": [
      {
        "id": "msg_123",
        "type": "incoming",
        "content": "Hi, I'm interested in your fitness program",
        "timestamp": "2025-01-20T09:30:00Z",
        "status": "delivered",
        "mediaUrl": null
      },
      {
        "id": "msg_124",
        "type": "outgoing",
        "content": "Hello! Great to hear that. Let me tell you more about our program.",
        "timestamp": "2025-01-20T09:35:00Z",
        "status": "sent",
        "mediaUrl": null
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 50
    }
  }
}
```

**Test Cases:**
- ✅ Should return conversation messages
- ✅ Should include message details
- ✅ Should support pagination
- ✅ Should require coach authentication

---

### **3.3 Mark Conversation as Read**
```http
POST /api/whatsapp/inbox/conversations/conv_123/read
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Conversation marked as read",
    "conversationId": "conv_123",
    "readAt": "2025-01-20T10:35:00Z",
    "unreadCount": 0
  }
}
```

**Test Cases:**
- ✅ Should mark conversation as read
- ✅ Should update unread count
- ✅ Should require coach authentication
- ✅ Should return updated status

---

### **3.4 Archive Conversation**
```http
POST /api/whatsapp/inbox/conversations/conv_123/archive
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Conversation archived successfully",
    "conversationId": "conv_123",
    "archivedAt": "2025-01-20T10:40:00Z",
    "status": "archived"
  }
}
```

**Test Cases:**
- ✅ Should archive conversation
- ✅ Should update conversation status
- ✅ Should require coach authentication
- ✅ Should maintain message history

---

### **3.5 Toggle Conversation Pin**
```http
POST /api/whatsapp/inbox/conversations/conv_123/pin
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Conversation pinned successfully",
    "conversationId": "conv_123",
    "pinnedAt": "2025-01-20T10:45:00Z",
    "isPinned": true
  }
}
```

**Test Cases:**
- ✅ Should toggle conversation pin
- ✅ Should update pin status
- ✅ Should require coach authentication
- ✅ Should support pin/unpin

---

### **3.6 Get Inbox Statistics**
```http
GET /api/whatsapp/inbox/stats?coachId=coach_123&period=monthly
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "coachId": "coach_123",
    "period": "monthly",
    "stats": {
      "totalConversations": 150,
      "activeConversations": 45,
      "archivedConversations": 105,
      "totalMessages": 1250,
      "incomingMessages": 800,
      "outgoingMessages": 450,
      "responseRate": 0.85,
      "averageResponseTime": "2.5 minutes"
    },
    "trends": {
      "conversationsGrowth": "+15%",
      "messagesGrowth": "+22%",
      "responseRateChange": "+5%"
    }
  }
}
```

**Test Cases:**
- ✅ Should return inbox statistics
- ✅ Should include growth trends
- ✅ Should require coach authentication
- ✅ Should support period filtering

---

### **3.7 Search Inbox**
```http
GET /api/whatsapp/inbox/search?q=john&type=conversations&coachId=coach_123
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "query": "john",
    "type": "conversations",
    "results": [
      {
        "id": "conv_123",
        "contactName": "John Doe",
        "phoneNumber": "+1234567890",
        "lastMessage": "I'm interested in your program",
        "relevanceScore": 0.95
      }
    ],
    "totalResults": 1,
    "searchTime": "45ms"
  }
}
```

**Test Cases:**
- ✅ Should search conversations
- ✅ Should return relevant results
- ✅ Should include relevance scores
- ✅ Should require coach authentication

---

## 👥 **PHASE 4: CONTACT MANAGEMENT & AUTOMATION**

### **4.1 Get All Contacts**
```http
GET /api/whatsapp/contacts?coachId=coach_123&status=active&category=lead&search=john&page=1&limit=20
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "contact_123",
        "name": "John Doe",
        "phoneNumber": "+1234567890",
        "email": "john@example.com",
        "status": "active",
        "category": "lead",
        "lastContact": "2025-01-20T10:00:00Z",
        "tags": ["fitness", "interested"]
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20
    }
  }
}
```

**Test Cases:**
- ✅ Should return filtered contacts
- ✅ Should include contact details
- ✅ Should support search and filters
- ✅ Should require coach authentication

---

### **4.2 Update Contact Information**
```http
PUT /api/whatsapp/contacts/contact_123
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "contactName": "John Smith",
  "notes": "VIP customer - high priority",
  "category": "client",
  "tags": ["fitness", "vip", "active"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "contact_123",
    "contactName": "John Smith",
    "notes": "VIP customer - high priority",
    "category": "client",
    "tags": ["fitness", "vip", "active"],
    "updatedAt": "2025-01-20T10:50:00Z"
  }
}
```

**Test Cases:**
- ✅ Should update contact information
- ✅ Should modify tags and category
- ✅ Should require coach authentication
- ✅ Should validate input data

---

### **4.3 Block/Unblock Contact**
```http
POST /api/whatsapp/contacts/contact_123/block
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "action": "block",
  "reason": "Spam messages"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Contact blocked successfully",
    "contactId": "contact_123",
    "action": "block",
    "reason": "Spam messages",
    "blockedAt": "2025-01-20T10:55:00Z"
  }
}
```

**Test Cases:**
- ✅ Should block/unblock contact
- ✅ Should record block reason
- ✅ Should require coach authentication
- ✅ Should prevent message sending

---

## 🔐 **PHASE 5: BAILEYS PERSONAL ACCOUNT FEATURES**

### **5.1 Initialize Baileys Session**
```http
POST /api/whatsapp/baileys/session/init
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "sessionName": "coach_123_session",
  "coachId": "coach_123",
  "phoneNumber": "+1234567890"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "sessionName": "coach_123_session",
    "status": "initializing",
    "message": "Session initialization started. Check QR code endpoint for next steps.",
    "nextStep": "get_qr_code"
  }
}
```

**Test Cases:**
- ✅ Should initialize Baileys session
- ✅ Should create session directory
- ✅ Should require coach authentication
- ✅ Should provide next steps

---

### **5.2 Get Baileys QR Code**
```http
GET /api/whatsapp/baileys/session/qr?sessionName=coach_123_session
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "sessionName": "coach_123_session",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "expiresAt": "2025-01-20T11:05:00Z",
    "status": "waiting_for_scan"
  }
}
```

**Test Cases:**
- ✅ Should return QR code image
- ✅ Should include expiration time
- ✅ Should require coach authentication
- ✅ Should show scan status

---

### **5.3 Get Baileys Session Status**
```http
GET /api/whatsapp/baileys/session/status?sessionName=coach_123_session
Authorization: Bearer {coach_token}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "sessionName": "coach_123_session",
    "status": "connected",
    "phoneNumber": "+1234567890",
    "deviceInfo": {
      "platform": "android",
      "version": "2.23.2.78"
    },
    "lastSeen": "2025-01-20T11:00:00Z",
    "connectionQuality": "excellent"
  }
}
```

**Test Cases:**
- ✅ Should return session status
- ✅ Should include device information
- ✅ Should require coach authentication
- ✅ Should show connection quality

---

### **5.4 Disconnect Baileys Session**
```http
POST /api/whatsapp/baileys/session/disconnect
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "sessionName": "coach_123_session",
  "coachId": "coach_123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Session disconnected successfully",
    "sessionName": "coach_123_session",
    "disconnectedAt": "2025-01-20T11:10:00Z"
  }
}
```

**Test Cases:**
- ✅ Should disconnect Baileys session
- ✅ Should maintain session data
- ✅ Should require coach authentication
- ✅ Should allow reconnection

---

### **5.5 Delete Baileys Session Data**
```http
DELETE /api/whatsapp/baileys/session
Authorization: Bearer {coach_token}
```

**Request Body:**
```json
{
  "sessionName": "coach_123_session",
  "coachId": "coach_123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Session data deleted successfully",
    "sessionName": "coach_123_session",
    "deletedAt": "2025-01-20T11:15:00Z"
  }
}
```

**Test Cases:**
- ✅ Should delete session data
- ✅ Should remove session files
- ✅ Should require coach authentication
- ✅ Should confirm deletion

---

## 🌐 **PHASE 6: WEBHOOKS & PUBLIC ENDPOINTS**

### **6.1 Webhook Verification (Meta API)**
```http
GET /api/whatsapp/webhook?hub.mode=subscribe&hub.challenge=CHALLENGE_ACCEPTED&hub.verify_token=YOUR_VERIFY_TOKEN
```

**Expected Response:**
```
CHALLENGE_ACCEPTED
```

**Test Cases:**
- ✅ Should verify webhook subscription
- ✅ Should return challenge response
- ✅ Should validate verify token
- ✅ Should be publicly accessible

---

### **6.2 Handle Incoming WhatsApp Messages (Meta API)**
```http
POST /api/whatsapp/webhook
Content-Type: application/json
```

**Request Body:**
```json
{
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messages": [
              {
                "from": "911234567890",
                "text": {
                  "body": "Hi, I'm interested in your program"
                },
                "type": "text",
                "timestamp": "1642672800"
              }
            ],
            "metadata": {
              "phone_number_id": "123456789"
            }
          }
        }
      ]
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Webhook processed successfully",
    "processedMessages": 1,
    "processedAt": "2025-01-20T11:20:00Z"
  }
}
```

**Test Cases:**
- ✅ Should process incoming messages
- ✅ Should validate webhook signature
- ✅ Should create conversation records
- ✅ Should trigger automations

---

## 🧪 **TESTING CHECKLIST**

### **Integration Setup:**
- [ ] Setup Meta API integration
- [ ] Setup Baileys personal integration
- [ ] Switch between integration types
- [ ] List all integrations
- [ ] Test integration connection
- [ ] Get integration health status

### **Messaging:**
- [ ] Send WhatsApp message
- [ ] Send template message
- [ ] Test media attachments
- [ ] Validate message delivery

### **Inbox Management:**
- [ ] Get inbox conversations
- [ ] Get conversation messages
- [ ] Mark conversation as read
- [ ] Archive conversation
- [ ] Toggle conversation pin
- [ ] Get inbox statistics
- [ ] Search inbox

### **Contact Management:**
- [ ] Get all contacts
- [ ] Update contact information
- [ ] Block/unblock contact
- [ ] Test contact filters

### **Baileys Features:**
- [ ] Initialize Baileys session
- [ ] Get QR code
- [ ] Check session status
- [ ] Disconnect session
- [ ] Delete session data

### **Webhooks:**
- [ ] Verify webhook subscription
- [ ] Process incoming messages
- [ ] Test webhook security

---

## 🚨 **ERROR HANDLING TESTS**

### **Authentication Errors:**
- [ ] Test without token
- [ ] Test with invalid token
- [ ] Test with expired token

### **Integration Errors:**
- [ ] Test with invalid API credentials
- [ ] Test with expired tokens
- [ ] Test with network failures
- [ ] Test with rate limiting

### **Message Errors:**
- [ ] Test with invalid phone numbers
- [ ] Test with blocked contacts
- [ ] Test with template errors
- [ ] Test with media upload failures

---

## 📊 **PERFORMANCE TESTS**

### **Load Testing:**
- [ ] Test with 100+ concurrent messages
- [ ] Test with 1000+ contacts
- [ ] Test webhook processing under load

### **Response Time:**
- [ ] Message sending < 2 seconds
- [ ] Inbox queries < 1 second
- [ ] Contact searches < 500ms
- [ ] Webhook processing < 100ms

---

## 🔍 **DEBUGGING TIPS**

### **Common Issues:**
1. **Integration Not Connecting** - Check API credentials and permissions
2. **Messages Not Sending** - Verify phone number format and status
3. **Webhook Not Receiving** - Check webhook URL and verification
4. **Baileys Session Issues** - Check session files and permissions

### **Meta API Issues:**
- Verify webhook subscription
- Check app permissions
- Validate phone number ID
- Monitor rate limits

### **Baileys Issues:**
- Check session directory permissions
- Verify QR code scanning
- Monitor connection stability
- Check device compatibility

---

## ✅ **COMPLETION CHECKLIST**

- [ ] All integration setup routes tested
- [ ] All messaging routes tested
- [ ] All inbox management routes tested
- [ ] All contact management routes tested
- [ ] All Baileys features tested
- [ ] All webhook endpoints tested
- [ ] Error handling verified
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Issues logged and resolved

---

**🎯 Ready to start testing! Begin with Phase 1 (Integration Setup) and work through systematically.**

**Remember: Test both Meta API and Baileys integrations thoroughly to ensure the unified system works seamlessly with both platforms.**
