# WhatsApp Microservice Testing Documentation

This document provides comprehensive testing guidelines for the Unified WhatsApp and Email Microservice, including Meta API integration, Baileys WhatsApp Web setup, and email functionality.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Meta WhatsApp Business API Testing](#meta-whatsapp-business-api-testing)
3. [Baileys WhatsApp Web Testing](#baileys-whatsapp-web-testing)
4. [Email Configuration Testing](#email-configuration-testing)
5. [Message Templates Testing](#message-templates-testing)
6. [Webhook Testing](#webhook-testing)
7. [Automation Integration Testing](#automation-integration-testing)
8. [Error Handling Testing](#error-handling-testing)

## Prerequisites

Before testing, ensure you have:

1. **MongoDB** running and accessible
2. **Node.js** and **npm** installed
3. **Authentication token** for protected routes
4. **Meta WhatsApp Business API** credentials (for Meta testing)
5. **SMTP credentials** (for email testing)

### Base URL
```
{{baseUrl}}/api/whatsapp
```

**Example:** `http://localhost:8080/api/whatsapp`

### Authentication Header
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

---

## Meta WhatsApp Business API Testing

### 1. Create Meta WhatsApp Device

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/devices`

**Request:**
```json
{
  "name": "Business WhatsApp",
  "type": "meta",
  "phoneNumber": "+1234567890",
  "accessToken": "EAA...",
  "phoneNumberId": "123456789012345",
  "businessAccountId": "987654321098765",
  "webhookUrl": "{{baseUrl}}/api/whatsapp/webhook/meta",
  "isDefault": true,
  "settings": {
    "messageTemplate": "Hello {{name}}, welcome to our service!",
    "autoReply": true,
    "autoReplyMessage": "Thank you for your message. We'll get back to you soon."
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Meta WhatsApp device created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "coachId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "name": "Business WhatsApp",
    "type": "meta",
    "phoneNumber": "+1234567890",
    "accessToken": "EAA...",
    "phoneNumberId": "123456789012345",
    "businessAccountId": "987654321098765",
    "webhookUrl": "{{baseUrl}}/api/whatsapp/webhook/meta",
    "isDefault": true,
    "isActive": true,
    "connectionStatus": "connected",
    "creditsUsed": 0,
    "settings": {
      "messageTemplate": "Hello {{name}}, welcome to our service!",
      "autoReply": true,
      "autoReplyMessage": "Thank you for your message. We'll get back to you soon."
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Send Text Message via Meta API

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/messages/send`

**Request:**
```json
{
  "deviceId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "to": "+1234567890",
  "message": {
    "type": "text",
    "text": "Hello! This is a test message from Meta WhatsApp Business API."
  },
  "options": {
    "isAutomated": false,
    "automationRuleId": null
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "wamid.HBgLMTIzNDU2Nzg5MC8...",
    "deviceId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "to": "+1234567890",
    "type": "text",
    "content": "Hello! This is a test message from Meta WhatsApp Business API.",
    "status": "sent",
    "creditsUsed": 1,
    "metaResponse": {
      "messaging_product": "whatsapp",
      "messages": [
        {
          "id": "wamid.HBgLMTIzNDU2Nzg5MC8..."
        }
      ]
    },
    "createdAt": "2024-01-15T10:35:00.000Z"
  }
}
```

### 3. Send Template Message via Meta API

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/messages/send`

**Request:**
```json
{
  "deviceId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "to": "+1234567890",
  "message": {
    "type": "template",
    "template": {
      "name": "welcome_message",
      "language": "en_US",
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
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Template message sent successfully",
  "data": {
    "messageId": "wamid.HBgLMTIzNDU2Nzg5MC8...",
    "deviceId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "to": "+1234567890",
    "type": "template",
    "content": {
      "templateName": "welcome_message",
      "language": "en_US",
      "parameters": ["John"]
    },
    "status": "sent",
    "creditsUsed": 1,
    "createdAt": "2024-01-15T10:40:00.000Z"
  }
}
```

---

## Baileys WhatsApp Web Testing

### 1. Create Baileys WhatsApp Device

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/devices`

**Request:**
```json
{
  "name": "Personal WhatsApp",
  "type": "baileys",
  "phoneNumber": "+1234567890",
  "isDefault": false,
  "settings": {
    "autoReply": true,
    "autoReplyMessage": "I'll get back to you soon!",
    "qrCodeTimeout": 60000
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Baileys WhatsApp device created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "coachId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "name": "Personal WhatsApp",
    "type": "baileys",
    "phoneNumber": "+1234567890",
    "isDefault": false,
    "isActive": false,
    "connectionStatus": "disconnected",
    "creditsUsed": 0,
    "settings": {
      "autoReply": true,
      "autoReplyMessage": "I'll get back to you soon!",
      "qrCodeTimeout": 60000
    },
    "createdAt": "2024-01-15T10:45:00.000Z",
    "updatedAt": "2024-01-15T10:45:00.000Z"
  }
}
```

### 2. Initialize Baileys Session

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/devices/{deviceId}/initialize`

**Request:**
```json
{
  "sessionName": "personal_session"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Baileys session initialized successfully",
  "data": {
    "sessionId": "personal_session",
    "qrCodeUrl": "{{baseUrl}}/whatsapp/qr?sessionId=personal_session",
    "status": "qr_ready",
    "expiresAt": "2024-01-15T10:55:00.000Z"
  }
}
```

### 3. Get QR Code Status

**Endpoint:** `GET {{baseUrl}}/api/whatsapp/devices/{deviceId}/qr-status`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "qr_ready",
    "qrCodeUrl": "{{baseUrl}}/whatsapp/qr?sessionId=personal_session",
    "expiresAt": "2024-01-15T10:55:00.000Z",
    "isConnected": false
  }
}
```

### 4. Send Message via Baileys (After QR Scan)

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/messages/send`

**Request:**
```json
{
  "deviceId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "to": "+1234567890",
  "message": {
    "type": "text",
    "text": "Hello! This is a test message from Baileys WhatsApp Web."
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message sent successfully via Baileys",
  "data": {
    "messageId": "3EB0C767D82B6F8E",
    "deviceId": "64f8a1b2c3d4e5f6a7b8c9d2",
    "to": "+1234567890",
    "type": "text",
    "content": "Hello! This is a test message from Baileys WhatsApp Web.",
    "status": "sent",
    "creditsUsed": 1,
    "baileysResponse": {
      "key": {
        "remoteJid": "1234567890@s.whatsapp.net",
        "fromMe": true,
        "id": "3EB0C767D82B6F8E"
      }
    },
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

## Email Configuration Testing

### 1. Create Gmail Email Configuration

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/email/configs`

**Request:**
```json
{
  "name": "Gmail Business",
  "provider": "gmail",
  "email": "business@gmail.com",
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "username": "business@gmail.com",
  "password": "app_password_here",
  "secure": true,
  "isDefault": true,
  "dailyLimit": 1000,
  "settings": {
    "fromName": "Business Name",
    "replyTo": "support@business.com",
    "trackOpens": true,
    "trackClicks": true
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email configuration created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "coachId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "name": "Gmail Business",
    "provider": "gmail",
    "email": "business@gmail.com",
    "smtpHost": "smtp.gmail.com",
    "smtpPort": 587,
    "username": "business@gmail.com",
    "secure": true,
    "isDefault": true,
    "isActive": true,
    "dailyLimit": 1000,
    "emailsSentToday": 0,
    "settings": {
      "fromName": "Business Name",
      "replyTo": "support@business.com",
      "trackOpens": true,
      "trackClicks": true
    },
    "createdAt": "2024-01-15T11:05:00.000Z",
    "updatedAt": "2024-01-15T11:05:00.000Z"
  }
}
```

### 2. Test Email Configuration

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/email/configs/{configId}/test`

**Request:**
```json
{
  "to": "test@example.com",
  "subject": "Test Email",
  "html": "<h1>Test Email</h1><p>This is a test email from the WhatsApp microservice.</p>"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "data": {
    "messageId": "<test-message-id@example.com>",
    "response": "Message sent: <test-message-id@example.com>"
  }
}
```

### 3. Send Single Email

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/email/send`

**Request:**
```json
{
  "configId": "64f8a1b2c3d4e5f6a7b8c9d3",
  "to": "customer@example.com",
  "subject": "Welcome to Our Service",
  "html": "<h1>Welcome!</h1><p>Thank you for joining our service.</p>",
  "text": "Welcome! Thank you for joining our service.",
  "options": {
    "trackOpens": true,
    "trackClicks": true,
    "replyTo": "support@business.com"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "messageId": "64f8a1b2c3d4e5f6a7b8c9d4",
    "configId": "64f8a1b2c3d4e5f6a7b8c9d3",
    "to": "customer@example.com",
    "subject": "Welcome to Our Service",
    "status": "sent",
    "trackingId": "track_abc123",
    "createdAt": "2024-01-15T11:10:00.000Z"
  }
}
```

### 4. Send Bulk Email

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/email/send-bulk`

**Request:**
```json
{
  "configId": "64f8a1b2c3d4e5f6a7b8c9d3",
  "recipients": [
    {
      "email": "customer1@example.com",
      "name": "John Doe",
      "variables": {
        "firstName": "John",
        "company": "ABC Corp"
      }
    },
    {
      "email": "customer2@example.com",
      "name": "Jane Smith",
      "variables": {
        "firstName": "Jane",
        "company": "XYZ Inc"
      }
    }
  ],
  "subject": "Special Offer for {{firstName}}",
  "htmlTemplate": "<h1>Hello {{firstName}}!</h1><p>Special offer for {{company}}.</p>",
  "textTemplate": "Hello {{firstName}}! Special offer for {{company}}.",
  "options": {
    "trackOpens": true,
    "trackClicks": true,
    "batchSize": 10
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bulk email campaign started",
  "data": {
    "campaignId": "64f8a1b2c3d4e5f6a7b8c9d5",
    "totalRecipients": 2,
    "sentCount": 2,
    "failedCount": 0,
    "status": "completed",
    "createdAt": "2024-01-15T11:15:00.000Z"
  }
}
```

---

## Message Templates Testing

### 1. Create WhatsApp Template

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/templates`

**Request:**
```json
{
  "name": "Welcome Template",
  "category": "welcome",
  "language": "en_US",
  "content": {
    "text": "Hello {{name}}! Welcome to {{company}}. Your account has been created successfully.",
    "variables": ["name", "company"]
  },
  "isActive": true,
  "tags": ["welcome", "onboarding"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Template created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
    "coachId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "name": "Welcome Template",
    "category": "welcome",
    "language": "en_US",
    "content": {
      "text": "Hello {{name}}! Welcome to {{company}}. Your account has been created successfully.",
      "variables": ["name", "company"]
    },
    "isActive": true,
    "usageCount": 0,
    "tags": ["welcome", "onboarding"],
    "createdAt": "2024-01-15T11:20:00.000Z",
    "updatedAt": "2024-01-15T11:20:00.000Z"
  }
}
```

### 2. Send Message Using Template

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/messages/send-template`

**Request:**
```json
{
  "deviceId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "templateId": "64f8a1b2c3d4e5f6a7b8c9d6",
  "to": "+1234567890",
  "variables": {
    "name": "John Doe",
    "company": "ABC Corporation"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Template message sent successfully",
  "data": {
    "messageId": "wamid.HBgLMTIzNDU2Nzg5MC8...",
    "templateId": "64f8a1b2c3d4e5f6a7b8c9d6",
    "deviceId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "to": "+1234567890",
    "content": "Hello John Doe! Welcome to ABC Corporation. Your account has been created successfully.",
    "status": "sent",
    "creditsUsed": 1,
    "createdAt": "2024-01-15T11:25:00.000Z"
  }
}
```

---

## Webhook Testing

### 1. Meta WhatsApp Webhook Verification

**Endpoint:** `GET {{baseUrl}}/api/whatsapp/webhook/meta`

**Query Parameters:**
```
?hub.mode=subscribe&hub.challenge=1234567890&hub.verify_token=your_verify_token
```

**Expected Response:**
```
1234567890
```

### 2. Meta WhatsApp Webhook Event

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/webhook/meta`

**Request:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789012345",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "1234567890",
              "phone_number_id": "123456789012345"
            },
            "contacts": [
              {
                "profile": {
                  "name": "John Doe"
                },
                "wa_id": "1234567890"
              }
            ],
            "messages": [
              {
                "from": "1234567890",
                "id": "wamid.HBgLMTIzNDU2Nzg5MC8...",
                "timestamp": "1705315200",
                "text": {
                  "body": "Hello! This is a test message."
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
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
  "message": "Webhook processed successfully"
}
```

### 3. Test Webhook Status

**Endpoint:** `GET {{baseUrl}}/api/whatsapp/webhook/status`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "meta": {
      "isActive": true,
      "lastEvent": "2024-01-15T11:30:00.000Z",
      "eventCount": 15
    },
    "baileys": {
      "isActive": false,
      "lastEvent": null,
      "eventCount": 0
    }
  }
}
```

---

## Automation Integration Testing

### 1. Test WhatsApp Action in Automation

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/automation/test-whatsapp-action`

**Request:**
```json
{
  "ruleId": "64f8a1b2c3d4e5f6a7b8c9d7",
  "leadData": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "ABC Corp"
  },
  "action": {
    "type": "send_whatsapp_message",
    "config": {
      "message": "Hello {{name}}! Welcome to {{company}}. We're excited to have you on board!"
    }
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "WhatsApp automation action executed successfully",
  "data": {
    "messageId": "wamid.HBgLMTIzNDU2Nzg5MC8...",
    "deviceId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "to": "+1234567890",
    "content": "Hello John Doe! Welcome to ABC Corp. We're excited to have you on board!",
    "status": "sent",
    "creditsUsed": 1,
    "automationRuleId": "64f8a1b2c3d4e5f6a7b8c9d7",
    "createdAt": "2024-01-15T11:35:00.000Z"
  }
}
```

---

## Error Handling Testing

### 1. Invalid Device ID

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/messages/send`

**Request:**
```json
{
  "deviceId": "invalid_device_id",
  "to": "+1234567890",
  "message": {
    "type": "text",
    "text": "Test message"
  }
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Device not found",
  "message": "WhatsApp device with ID invalid_device_id not found"
}
```

### 2. Invalid Phone Number

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/messages/send`

**Request:**
```json
{
  "deviceId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "to": "invalid_phone",
  "message": {
    "type": "text",
    "text": "Test message"
  }
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid phone number",
  "message": "Phone number invalid_phone is not in valid format"
}
```

### 3. Insufficient Credits

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/messages/send`

**Request:**
```json
{
  "deviceId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "to": "+1234567890",
  "message": {
    "type": "text",
    "text": "Test message"
  }
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Insufficient credits",
  "message": "Insufficient credits to send message. Required: 1, Available: 0"
}
```

### 4. Email Configuration Error

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/email/send`

**Request:**
```json
{
  "configId": "invalid_config_id",
  "to": "test@example.com",
  "subject": "Test",
  "html": "<p>Test</p>"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Email configuration not found",
  "message": "Email configuration with ID invalid_config_id not found"
}
```

---

## Performance Testing

### 1. Bulk Message Sending

**Endpoint:** `POST {{baseUrl}}/api/whatsapp/messages/send-bulk`

**Request:**
```json
{
  "deviceId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "recipients": [
    {"phone": "+1234567890", "message": "Hello 1"},
    {"phone": "+1234567891", "message": "Hello 2"},
    {"phone": "+1234567892", "message": "Hello 3"}
  ],
  "options": {
    "batchSize": 5,
    "delayBetweenBatches": 1000
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bulk messages sent successfully",
  "data": {
    "totalRecipients": 3,
    "sentCount": 3,
    "failedCount": 0,
    "totalCreditsUsed": 3,
    "batchResults": [
      {
        "batch": 1,
        "sent": 3,
        "failed": 0
      }
    ],
    "createdAt": "2024-01-15T11:40:00.000Z"
  }
}
```

---

## Testing Checklist

### Meta WhatsApp API
- [ ] Create Meta device
- [ ] Send text message
- [ ] Send template message
- [ ] Send media message
- [ ] Handle webhook events
- [ ] Test error scenarios

### Baileys WhatsApp Web
- [ ] Create Baileys device
- [ ] Initialize session
- [ ] Generate QR code
- [ ] Scan QR code
- [ ] Send message after connection
- [ ] Handle disconnection
- [ ] Test session persistence

### Email Configuration
- [ ] Create Gmail configuration
- [ ] Create Outlook configuration
- [ ] Test SMTP connection
- [ ] Send single email
- [ ] Send bulk email
- [ ] Track email opens/clicks
- [ ] Handle email limits

### Message Templates
- [ ] Create template
- [ ] Use template variables
- [ ] Send template message
- [ ] Track template usage
- [ ] Search templates

### Integration
- [ ] Test automation rules
- [ ] Test webhook processing
- [ ] Test credit system
- [ ] Test conversation management
- [ ] Test inbox functionality

### Error Handling
- [ ] Invalid credentials
- [ ] Network errors
- [ ] Rate limiting
- [ ] Insufficient credits
- [ ] Invalid phone numbers
- [ ] Invalid email addresses

---

## Notes

1. **Environment Variables**: Ensure all required environment variables are set before testing
2. **Database**: Make sure MongoDB is running and accessible
3. **Rate Limits**: Be aware of Meta API and email provider rate limits
4. **Credits**: Monitor credit usage during testing
5. **Webhooks**: Use ngrok or similar for local webhook testing
6. **QR Codes**: Test QR code scanning with actual WhatsApp mobile app
7. **Logs**: Check application logs for detailed error information
8. **Security**: Never commit real API keys or credentials to version control

This testing documentation provides comprehensive coverage of all microservice functionality. Use these examples as a starting point and adapt them to your specific testing needs.
