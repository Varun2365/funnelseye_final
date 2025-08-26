# 🚀 **UNIFIED WHATSAPP INTEGRATION TESTING GUIDE**

## 📋 **Overview**
This guide covers testing the complete unified WhatsApp integration system that allows coaches to seamlessly switch between Meta Official API and Baileys Personal accounts while maintaining a unified inbox experience.

---

## 🔧 **Prerequisites**
- ✅ Coach account created and logged in
- ✅ `coachId` and `authToken` stored in Postman variables
- ✅ Meta WhatsApp Business API credentials (for official integration)
- ✅ WhatsApp mobile app (for Baileys personal integration)

---

## 🎯 **TESTING ROADMAP**

### **Phase 1: Integration Setup & Management**
### **Phase 2: Meta Official API Integration**
### **Phase 3: Baileys Personal Integration**
### **Phase 4: Unified Inbox & Messaging**
### **Phase 5: Contact Management**
### **Phase 6: Automation Integration**

---

## 🚀 **PHASE 1: INTEGRATION SETUP & MANAGEMENT**

### **1.1 Setup WhatsApp Integration (Meta Official)**

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/integration/setup`

**Headers:**
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "integrationType": "meta_official",
    "metaApiToken": "YOUR_META_API_TOKEN",
    "phoneNumberId": "YOUR_PHONE_NUMBER_ID",
    "whatsAppBusinessAccountId": "YOUR_BUSINESS_ACCOUNT_ID",
    "autoReplyEnabled": true,
    "autoReplyMessage": "Thanks for your message! I'll get back to you soon.",
    "businessHours": {
        "enabled": true,
        "startTime": "09:00",
        "endTime": "17:00",
        "timezone": "UTC"
    }
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "WhatsApp integration setup successfully",
    "data": {
        "success": true,
        "integration": {
            "coachId": "{{coachId}}",
            "integrationType": "meta_official",
            "isActive": true,
            "statusSummary": "active",
            "phoneNumberId": "YOUR_PHONE_NUMBER_ID",
            "autoReplyEnabled": true
        }
    }
}
```

**Test Cases:**
- ✅ Valid Meta API credentials
- ❌ Invalid API token
- ❌ Missing required fields
- ❌ Invalid integration type

---

### **1.2 Setup WhatsApp Integration (Baileys Personal)**

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/integration/setup`

**Headers:**
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "integrationType": "baileys_personal",
    "autoReplyEnabled": true,
    "autoReplyMessage": "Thanks for your message! I'll get back to you soon.",
    "businessHours": {
        "enabled": true,
        "startTime": "09:00",
        "endTime": "17:00",
        "timezone": "UTC"
    }
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "WhatsApp integration setup successfully",
    "data": {
        "success": true,
        "integration": {
            "coachId": "{{coachId}}",
            "integrationType": "baileys_personal",
            "isActive": true,
            "statusSummary": "connecting",
            "autoReplyEnabled": true
        }
    }
}
```

---

### **1.3 Get Coach Integrations**

**Endpoint:** `GET {{baseUrl}}/api/whatsapp/integration/list`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
    "success": true,
    "data": [
        {
            "coachId": "{{coachId}}",
            "integrationType": "meta_official",
            "isActive": true,
            "statusSummary": "active",
            "phoneNumberId": "YOUR_PHONE_NUMBER_ID"
        },
        {
            "coachId": "{{coachId}}",
            "integrationType": "baileys_personal",
            "isActive": false,
            "statusSummary": "inactive"
        }
    ]
}
```

---

### **1.4 Switch Integration Type**

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/integration/switch`

**Headers:**
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "integrationType": "baileys_personal"
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Integration switched successfully",
    "data": {
        "success": true,
        "integration": {
            "coachId": "{{coachId}}",
            "integrationType": "baileys_personal",
            "isActive": true,
            "statusSummary": "connecting"
        }
    }
}
```

---

### **1.5 Test Integration Connection**

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/integration/test`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Expected Response (Meta Official):**
```json
{
    "success": true,
    "data": {
        "success": true,
        "message": "Meta API connection successful"
    }
}
```

**Expected Response (Baileys):**
```json
{
    "success": true,
    "data": {
        "success": true,
        "message": "Baileys session connected",
        "details": {
            "isConnected": true,
            "phoneNumber": "+1234567890"
        }
    }
}
```

---

### **1.6 Get Integration Health**

**Endpoint:** `GET {{baseUrl}}/api/whatsapp/integration/health`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
    "success": true,
    "data": {
        "status": "healthy",
        "integration": "meta_official"
    }
}
```

---

## 🚀 **PHASE 2: META OFFICIAL API INTEGRATION**

### **2.1 Send WhatsApp Message (Meta API)**

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/message/send`

**Headers:**
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "recipientNumber": "+1234567890",
    "content": "Hello! This is a test message from Meta API.",
    "options": {
        "useTemplate": false
    }
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Message sent successfully",
    "data": {
        "success": true,
        "messageId": "msg_123456789"
    }
}
```

---

### **2.2 Send Template Message (Meta API)**

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/message/template`

**Headers:**
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "recipientNumber": "+1234567890",
    "templateName": "hello_world",
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

**Expected Response:**
```json
{
    "success": true,
    "message": "Template message sent successfully",
    "data": {
        "success": true,
        "messageId": "msg_123456789"
    }
}
```

---

## 🚀 **PHASE 3: BAILEYS PERSONAL INTEGRATION**

### **3.1 Initialize Baileys Session**

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/baileys/session/init`

**Headers:**
```
Authorization: Bearer {{authToken}}
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

---

### **3.2 Get Baileys QR Code**

**Endpoint:** `GET {{baseUrl}}/api/whatsapp/baileys/session/qr`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
    "success": true,
    "data": {
        "success": true,
        "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
}
```

**Testing Steps:**
1. ✅ Get QR code
2. ✅ Scan with WhatsApp mobile app
3. ✅ Verify session status

---

### **3.3 Get Baileys Session Status**

**Endpoint:** `GET {{baseUrl}}/api/whatsapp/baileys/session/status`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Expected Response (Connecting):**
```json
{
    "success": true,
    "data": {
        "success": true,
        "isConnected": false,
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
        "success": true,
        "isConnected": true,
        "phoneNumber": "+1234567890",
        "hasQRCode": false,
        "qrCode": null
    }
}
```

---

### **3.4 Send Message via Baileys**

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/message/send`

**Headers:**
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "recipientNumber": "+1234567890",
    "content": "Hello! This is a test message from Baileys.",
    "options": {
        "mediaUrl": "https://example.com/image.jpg",
        "mediaType": "image"
    }
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Message sent successfully",
    "data": {
        "success": true,
        "messageId": "msg_123456789"
    }
}
```

---

### **3.5 Disconnect Baileys Session**

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/baileys/session/disconnect`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Baileys session disconnected",
    "data": {
        "success": true,
        "message": "Session disconnected"
    }
}
```

---

## 🚀 **PHASE 4: UNIFIED INBOX & MESSAGING**

### **4.1 Get Inbox Conversations**

**Endpoint:** `GET {{baseUrl}}/api/whatsapp/inbox/conversations`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Query Parameters:**
```
?status=active&category=lead&page=1&limit=20
```

**Expected Response:**
```json
{
    "success": true,
    "data": {
        "conversations": [
            {
                "conversationId": "conv_123",
                "contactName": "John Doe",
                "contactNumber": "+1234567890",
                "lastMessage": "Hello there!",
                "lastMessageAt": "2025-01-20T10:00:00Z",
                "unreadCount": 2,
                "status": "active",
                "isPinned": false,
                "category": "lead",
                "integrationType": "meta_official"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalConversations": 1,
            "hasNextPage": false,
            "hasPrevPage": false
        }
    }
}
```

---

### **4.2 Get Conversation Messages**

**Endpoint:** `GET {{baseUrl}}/api/whatsapp/inbox/conversations/{{conversationId}}/messages`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Query Parameters:**
```
?page=1&limit=50
```

**Expected Response:**
```json
{
    "success": true,
    "data": {
        "messages": [
            {
                "messageId": "msg_123",
                "conversationId": "conv_123",
                "direction": "inbound",
                "messageType": "text",
                "content": "Hello there!",
                "timestamp": "2025-01-20T10:00:00Z",
                "deliveryStatus": "delivered",
                "readStatus": "unread",
                "hasMedia": false
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalMessages": 1,
            "hasNextPage": false
        }
    }
}
```

---

### **4.3 Mark Conversation as Read**

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/inbox/conversations/{{conversationId}}/read`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Conversation marked as read",
    "data": {
        "success": true
    }
}
```

---

### **4.4 Archive Conversation**

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/inbox/conversations/{{conversationId}}/archive`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Conversation archived successfully",
    "data": {
        "success": true
    }
}
```

---

### **4.5 Toggle Conversation Pin**

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/inbox/conversations/{{conversationId}}/pin`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Conversation pinned successfully",
    "data": {
        "success": true,
        "isPinned": true
    }
}
```

---

### **4.6 Get Inbox Statistics**

**Endpoint:** `GET {{baseUrl}}/api/whatsapp/inbox/stats`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
    "success": true,
    "data": {
        "conversations": {
            "totalConversations": 5,
            "activeConversations": 3,
            "unreadTotal": 7,
            "totalMessages": 25
        },
        "messages": {
            "totalMessages": 25,
            "inboundMessages": 15,
            "outboundMessages": 10,
            "deliveredMessages": 23,
            "readMessages": 18
        },
        "contacts": {
            "totalContacts": 5,
            "activeContacts": 4,
            "leadContacts": 3,
            "clientContacts": 1,
            "averageEngagementScore": 75.5
        }
    }
}
```

---

### **4.7 Search Inbox**

**Endpoint:** `GET {{baseUrl}}/api/whatsapp/inbox/search`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Query Parameters:**
```
?q=john&type=conversations
```

**Expected Response:**
```json
{
    "success": true,
    "data": {
        "results": [
            {
                "conversationId": "conv_123",
                "contactName": "John Doe",
                "contactNumber": "+1234567890",
                "lastMessage": "Hello there!",
                "lastMessageAt": "2025-01-20T10:00:00Z",
                "unreadCount": 0,
                "status": "active",
                "isPinned": false,
                "category": "lead"
            }
        ],
        "searchTerm": "john",
        "searchType": "conversations",
        "totalResults": 1
    }
}
```

---

## 🚀 **PHASE 5: CONTACT MANAGEMENT**

### **5.1 Get All Contacts**

**Endpoint:** `GET {{baseUrl}}/api/whatsapp/contacts`

**Headers:**
```
Authorization: Bearer {{authToken}}
```

**Query Parameters:**
```
?status=active&category=lead&page=1&limit=20
```

**Expected Response:**
```json
{
    "success": true,
    "data": {
        "contacts": [
            {
                "contactNumber": "+1234567890",
                "contactName": "John Doe",
                "category": "lead",
                "status": "active",
                "lastInteractionAt": "2025-01-20T10:00:00Z",
                "engagementScore": 75,
                "hasProfilePicture": false
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalContacts": 1,
            "hasNextPage": false,
            "hasPrevPage": false
        }
    }
}
```

---

### **5.2 Update Contact Information**

**Endpoint:** `PUT {{baseUrl}}/api/whatsapp/contacts/{{contactId}}`

**Headers:**
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "contactName": "John Smith",
    "notes": "VIP customer - interested in premium package",
    "category": "client",
    "tags": ["vip", "premium"],
    "businessName": "Smith Enterprises"
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Contact updated successfully",
    "data": {
        "contactNumber": "+1234567890",
        "contactName": "John Smith",
        "category": "client",
        "status": "active",
        "lastInteractionAt": "2025-01-20T10:00:00Z",
        "engagementScore": 75,
        "hasProfilePicture": false
    }
}
```

---

### **5.3 Block/Unblock Contact**

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/contacts/{{contactId}}/block`

**Headers:**
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Body:**
```json
{
    "action": "block"
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Contact blocked successfully",
    "data": {
        "contactNumber": "+1234567890",
        "contactName": "John Smith",
        "category": "client",
        "status": "blocked",
        "lastInteractionAt": "2025-01-20T10:00:00Z",
        "engagementScore": 75,
        "hasProfilePicture": false
    }
}
```

---

## 🚀 **PHASE 6: AUTOMATION INTEGRATION**

### **6.1 Test WhatsApp Automation Trigger**

**Setup:**
1. ✅ Create automation rule with `whatsapp_message_received` trigger
2. ✅ Send message to coach's WhatsApp number
3. ✅ Verify automation execution

**Expected Behavior:**
- ✅ Incoming message triggers automation
- ✅ Message stored in unified inbox
- ✅ Automation actions executed
- ✅ Auto-reply sent (if enabled)

---

### **6.2 Test Cross-Integration Switching**

**Test Scenario:**
1. ✅ Send message via Meta API
2. ✅ Switch to Baileys integration
3. ✅ Send message via Baileys
4. ✅ Verify both messages in unified inbox

**Expected Behavior:**
- ✅ Messages from both integrations appear in same inbox
- ✅ Contact information unified
- ✅ Conversation threading maintained
- ✅ Integration switching seamless

---

## 🔍 **TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **1. Meta API Integration Issues**
- **Error:** `Invalid access token`
  - **Solution:** Verify API token and permissions
- **Error:** `Phone number ID not found`
  - **Solution:** Check phone number ID in Meta Business Manager

#### **2. Baileys Integration Issues**
- **Error:** `Session not found`
  - **Solution:** Initialize session first
- **Error:** `QR code not available`
  - **Solution:** Wait for QR generation or check connection status

#### **3. Inbox Issues**
- **Error:** `Conversation not found`
  - **Solution:** Verify conversation ID and coach ownership
- **Error:** `Message not sent`
  - **Solution:** Check integration status and permissions

---

## 📊 **PERFORMANCE METRICS**

### **Expected Response Times**
- **Integration Setup:** < 2 seconds
- **Message Sending:** < 3 seconds
- **Inbox Loading:** < 1 second
- **Contact Search:** < 500ms

### **Scalability Tests**
- ✅ 100+ conversations
- ✅ 1000+ messages
- ✅ Multiple integrations per coach
- ✅ Concurrent message sending

---

## 🎯 **SUCCESS CRITERIA**

### **Phase 1: ✅ Integration Setup**
- [ ] Meta Official integration setup successful
- [ ] Baileys Personal integration setup successful
- [ ] Integration switching works seamlessly

### **Phase 2: ✅ Meta API Integration**
- [ ] Messages sent successfully via Meta API
- [ ] Template messages working
- [ ] Webhook handling functional

### **Phase 3: ✅ Baileys Integration**
- [ ] Session initialization successful
- [ ] QR code generation working
- [ ] Messages sent via Baileys
- [ ] Session management functional

### **Phase 4: ✅ Unified Inbox**
- [ ] Conversations from both integrations visible
- [ ] Message threading maintained
- [ ] Search and filtering working
- [ ] Statistics accurate

### **Phase 5: ✅ Contact Management**
- [ ] Contact creation and updates working
- [ ] Blocking/unblocking functional
- [ ] Contact categorization working

### **Phase 6: ✅ Automation Integration**
- [ ] WhatsApp triggers working
- [ ] Cross-integration automation functional
- [ ] Existing automation rules maintained

---

## 🚀 **NEXT STEPS**

After completing all phases:

1. **Performance Testing:** Load testing with high message volumes
2. **Security Testing:** Penetration testing for webhook endpoints
3. **Integration Testing:** Test with existing automation workflows
4. **User Acceptance Testing:** Coach feedback and usability testing
5. **Production Deployment:** Gradual rollout to production environment

---

## 📞 **SUPPORT**

For technical issues or questions:
- **Documentation:** Check API documentation in main.js
- **Logs:** Monitor server logs for detailed error information
- **Testing:** Use Postman collection for systematic testing
- **Debugging:** Enable debug logging in WhatsApp services

---

**🎉 Congratulations! You've successfully tested the complete unified WhatsApp integration system!**
