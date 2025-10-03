# 📱 Central Messaging System - Complete Testing Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Authentication Setup](#authentication-setup)
5. [Admin Endpoints Testing](#admin-endpoints-testing)
6. [Coach Endpoints Testing](#coach-endpoints-testing)
7. [Testing Scenarios](#testing-scenarios)
8. [Error Testing](#error-testing)
9. [Performance Testing](#performance-testing)

---

## Overview

This guide covers comprehensive testing for all endpoints in the Central Messaging System, which consolidates all messaging functionality including WhatsApp, email, templates, inbox, and device management.

### System Base URLs
- **Main System**: `http://localhost:5000`
- **Central WhatsApp Admin**: `/api/admin/central-whatsapp`
- **WhatsApp V1**: `/api/whatsapp/v1`
- **Central WhatsApp Coach**: `/api/centralwhatsapp`
- **Unified Messaging**: `/api/messaging`
- **Unified Messaging V1**: `/api/messagingv1`

---

## Prerequisites

### Requirements
- Node.js backend running on port 5000
- Valid admin JWT token
- Valid coach JWT token
- Postman or similar API testing tool
- Sample test data (contacts, templates, etc.)

### Test Data Preparation
```json
{
  "adminCredentials": {
    "email": "admin@example.com",
    "password": "admin_password"
  },
  "coachCredentials": {
    "email": "coach@example.com",
    "password": "coach_password"
  },
  "testContact": {
    "phone": "+1234567890",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "testTemplate": {
    "name": "Test Welcome Message",
    "type": "whatsapp",
    "content": "Hello {{lead.name}}! Welcome to our program."
  }
}
```

---

## Environment Setup

### 1. Start the Application
```bash
# Start the main application
cd D:\PRJ_YCT_Final
npm start
# OR
node main.js

# Verify server is running
curl http://localhost:5000/api/health
```

### 2. Verify Services
```bash
# Check WhatsApp service
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:5000/api/admin/central-whatsapp/health

# Check messaging endpoints
curl -H "Authorization: Bearer <coach_token>" \
  http://localhost:5000/api/messaging/stats
```

---

## Authentication Setup

### Generate Admin Token
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin_password"
  }'
```

### Generate Coach Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach@example.com",
    "password": "coach_password"
  }'
```

### Environment Variables for Testing
```bash
# Set these in your testing environment
export ADMIN_TOKEN="your_admin_jwt_token_here"
export COACH_TOKEN="your_coach_jwt_token_here"
export BASE_URL="http://localhost:5000"
```

---

## Admin Endpoints Testing

### 1. Central WhatsApp Configuration

#### Setup Central WhatsApp
```bash
curl -X POST $BASE_URL/api/admin/central-whatsapp/setup \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "your_whatsapp_access_token",
    "phoneNumberId": "your_phone_number_id",
    "webhookVerifyToken": "your_webhook_token",
    "businessAccountId": "your_business_account_id"
  }'
```

#### Get Central WhatsApp Configuration
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  $BASE_URL/api/admin/central-whatsapp/config
```

#### Update Configuration
```bash
curl -X PUT $BASE_URL/api/admin/central-whatsapp/config \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "updated_token",
    "phoneNumberId": "updated_phone_id"
  }'
```

#### Health Check
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  $BASE_URL/api/admin/central-whatsapp/health
```

### 2. Template Management

#### Create Template
```bash
curl -X POST $BASE_URL/api/admin/central-whatsapp/templates \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome Message",
    "category": "welcome",
    "language": "en_US",
    "components": [
      {
        "type": "BODY",
        "text": "Hello {{lead.name}}, welcome to our program!"
      }
    ]
  }'
```

#### Get All Templates
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  $BASE_URL/api/admin/central-whatsapp/templates
```

#### Sync Templates
```bash
curl -X POST $BASE_URL/api/admin/central-whatsapp/templates/sync \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 3. Contact Management

#### Get All Contacts
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE_URL/api/admin/central-whatsapp/contacts?page=1&limit=20"
```

#### Search Contacts
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE_URL/api/admin/central-whatsapp/contacts/search?q=john"
```

### 4. Message Management

#### Send Test Message
```bash
curl -X POST $BASE_URL/api/admin/central-whatsapp/test-message \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Test message from admin"
  }'
```

#### Send Admin Message
```bash
curl -X POST $BASE_URL/api/admin/central-whatsapp/send-message \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Admin message",
    "leadId": "lead_id_here",
    "coachId": "coach_id_here"
  }'
```

#### Send Bulk Messages
```bash
curl -X POST $BASE_URL/api/admin/central-whatsapp/send-bulk-messages \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contacts": [
      {
        "phone": "+1234567890",
        "name": "John Doe",
        "leadId": "lead_1"
      },
      {
        "phone": "+1987654321",
        "name": "Jane Smith",
        "leadId": "lead_2"
      }
    ],
    "message": "Bulk admin message",
    "delay": 1000
  }'
```

### 5. Analytics and Statistics

#### Get WhatsApp Analytics
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  $BASE_URL/api/whatsapp/v1/analytics
```

#### Get All Messages
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE_URL/api/admin/central-whatsapp/messages?page=1&limit=20"
```

#### Get Coach Messages
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  $BASE_URL/api/admin/central-whatsapp/messages/coach/{coachId}
```

#### Get Lead Messages
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  $BASE_URL/api/admin/central-whatsapp/messages/lead/{leadId}
```

### 6. Settings Management

#### Get Settings Overview
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  $BASE_URL/api/admin/central-whatsapp/settings-overview
```

#### Update Credit Settings
```bash
curl -X PUT $BASE_URL/api/admin/central-whatsapp/credit-settings \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "textMessageRate": 1,
    "mediaMessageRate": 2,
    "templateMessageRate": 1
  }'
```

### 7. AI Knowledge Management

#### Create AI Knowledge Base
```bash
curl -X POST $BASE_URL/api/whatsapp/v1/ai-knowledge \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fitness Knowledge Base",
    "description": "AI responses for fitness coaching",
    "content": [
      {
        "question": "What exercises help with weight loss?",
        "answer": "Cardiovascular exercises like running, cycling, and HIIT workouts are excellent for weight loss..."
      }
    ],
    "isActive": true
  }'
```

#### Get AI Knowledge Bases
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  $BASE_URL/api/whatsapp/v1/ai-knowledge
```

### 8. Email Configuration

#### Get Email Configuration
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  $BASE_URL/api/messaging/admin/email/config
```

#### Setup Email Configuration
```bash
curl -X POST $BASE_URL/api/messaging/admin/email/setup \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "smtpHost": "smtp.gmail.com",
    "smtpPort": 587,
    "username": "your_email@gmail.com",
    "password": "your_app_password",
    "fromEmail": "your_email@gmail.com",
    "useSSL": true
  }'
```

---

## Coach Endpoints Testing

### 1. Basic Messaging

#### Send Single Message
```bash
curl -X POST $BASE_URL/api/messaging/send \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Hello from coach!",
    "type": "text",
    "leadId": "lead_id_here"
  }'
```

#### Send Template Message
```bash
curl -X POST $BASE_URL/api/messaging/send \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "templateId": "template_id",
    "templateParameters": {
      "lead.name": "John Doe",
      "coach.fullName": "Jane Smith"
    },
    "type": "template",
    "leadId": "lead_id_here"
  }'
```

#### Send Bulk Messages
```bash
curl -X POST $BASE_URL/api/messaging/send-bulk \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contacts": [
      {
        "phone": "+1234567890",
        "name": "John Doe",
        "leadId": "lead_1"
      },
      {
        "phone": "+1987654321",
        "name": "Jane Smith",
        "leadId": "lead_2"
      }
    ],
    "message": "Bulk message from coach",
    "type": "text",
    "delay": 2000
  }'
```

### 2. Contact Management

#### Get Coach Contacts
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  "$BASE_URL/api/messaging/contacts?page=1&limit=20"
```

#### Search Contacts
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  "$BASE_URL/api/messaging/contacts/search?q=john"
```

### 3. Template Management

#### Get Coach Templates
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  $BASE_URL/api/messaging/templates
```

#### Get Template Parameters
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  $BASE_URL/api/messaging/templates/parameters
```

#### Preview Template
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  $BASE_URL/api/messaging/templates/{templateId}/preview?leadId=lead_id
```

#### Create Message Template
```bash
curl -X POST $BASE_URL/api/messaging/templates/message-template \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Follow Up Message",
    "type": "whatsapp",
    "category": "follow-up",
    "content": {
      "body": "Hi {{lead.name}}, how did your first session go?"
    },
    "availableVariables": [
      {
        "name": "lead.name",
        "description": "Lead'\''s full name",
        "required": true
      }
    ]
  }'
```

### 4. Inbox Management

#### Get Inbox Messages
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  "$BASE_URL/api/messaging/inbox?page=1&limit=20"
```

#### Get Conversation
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  $BASE_URL/api/messaging/inbox/conversation/{contactId}
```

#### Send from Inbox
```bash
curl -X POST $BASE_URL/api/messaging/inbox/send \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "contact_id",
    "message": "Reply from inbox"
  }'
```

#### Mark as Read
```bash
curl -X PUT $BASE_URL/api/messaging/inbox/messages/{messageId}/read \
  -H "Authorization: Bearer $COACH_TOKEN"
```

### 5. Statistics

#### Get Coach Statistics
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  $BASE_URL/api/messaging/stats
```

### 6. WhatsApp V1 Features

#### Get Coach WhatsApp Settings
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  $BASE_URL/api/messagingv1/settings
```

#### Set Coach WhatsApp Settings
```bash
curl -X POST $BASE_URL/api/messagingv1/settings \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "autoReply": true,
    "autoReplyMessage": "Thanks for contacting! I'\''ll get back to you soon.",
    "businessHours": {
      "start": "09:00",
      "end": "17:00",
      "timezone": "UTC"
    }
  }'
```

#### Create WhatsApp Device
```bash
curl -X POST $BASE_URL/api/messagingv1/devices \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main WhatsApp Device",
    "description": "Primary WhatsApp device for coaching",
    "phoneNumber": "+1234567890",
    "businessProfile": {
      "about": "Fitness Coach",
      "description": "Personal trainer helping clients achieve their fitness goals"
    }
  }'
```

#### Get Coach WhatsApp Devices
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  $BASE_URL/api/messagingv1/devices
```

#### Get Device Status
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  $BASE_URL/api/messagingv1/devices/{deviceId}/status
```

### 7. Credit Management

#### Get Credit Balance
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  $BASE_URL/api/messagingv1/credits/balance
```

#### Check Can Send Message
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  $BASE_URL/api/messagingv1/credits/check
```

#### Get Credit Packages
```bash
curl $BASE_URL/api/messagingv1/credits/packages
```

#### Purchase Credits
```bash
curl -X POST $BASE_URL/api/messagingv1/credits/purchase \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "package": "basic",
    "quantity": 100
  }'
```

#### Get Credit Transactions
```bash ?H "Authorization: Bearer $COACH_TOKEN" \
  "$BASE_URL/api/messagingv1/credits/transactions?page=1&limit=20"
```

---

## Testing Scenarios

### 1. End-to-End Message Flow

#### Scenario: Coach sends welcome message to new lead
1. **Get coach contacts**
2. **Select a lead from contacts**
3. **Choose a welcome template**
4. **Preview template with lead data**
5. **Send message to lead**
6. **Verify message in inbox**
7. **Check message statistics**

### 2. Bulk Messaging Flow

#### Scenario: Coach sends promotional message to multiple leads
1. **Get coach contacts**
2. **Filter contacts by criteria**
3. **Select multiple contacts**
4. **Choose promotional template**
5. **Send bulk messages with delay**
6. **Monitor delivery status**
7. **Review success/failure rates**

### 3. Template Management Flow

#### Scenario: Coach creates and manages templates
1. **Create new template**
2. **Set template parameters**
3. **Test template with sample data**
4. **Use template in messages**
5. **Update template**
6. **Duplicate template**
7. **Delete unused template**

### 4. Admin Oversight Flow

#### Scenario: Admin monitors coach activities
1. **View all coach messages**
2. **Check specific coach statistics**
3. **Review template usage**
4. **Monitor system performance**
5. **Send admin announcements**
6. **Update system settings**

---

## Error Testing

### 1. Authentication Errors

#### Test Invalid Token
```bash
curl -H "Authorization: Bearer invalid_token" \
  $BASE_URL/api/messaging/stats
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied. Invalid token.",
  "error": "Unauthorized"
}
```

#### Test Missing Token
```bash
curl $BASE_URL/api/messaging/stats
```

**Expected Response:**
```json
{
  "success": false,
  "message": "No token, authorization denied"
}
```

### 2. Validation Errors

#### Test Invalid Phone Number
```bash
curl -X POST $BASE_URL/api/messaging/send \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "invalid_phone",
    "message": "Test message",
    "type": "text"
  }'
```

#### Test Missing Required Fields
```bash
curl -X POST $BASE_URL/api/messaging/send \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test message"
  }'
```

### 3. Permission Errors

#### Test Insufficient Permissions
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  $BASE_URL/api/admin/central-whatsapp/setup
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions.",
  "error": "Forbidden"
}
```

### 4. Resource Not Found Errors

#### Test Non-existent Template
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  $BASE_URL/api/messaging/templates/non_existent_id/preview
```

#### Test Non-existent Contact

```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  $BASE_URL/api/messaging/inbox/conversation/non_existent_id
```

### 5. Credit System Errors

#### Test Insufficient Credits
```bash
curl -X POST $BASE_URL/api/messaging/send \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Test message",
    "type": "text"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Insufficient credits to send messages",
  "data": {
    "balance": 0,
    "required": 1,
    "suggestion": "Please purchase more credits to continue sending messages"
  }
}
```

---

## Performance Testing

### 1. Load Testing Endpoints

#### Bulk Message Performance
```bash
# Test sending bulk messages to multiple contacts
curl -X POST $BASE_URL/api/messaging/send-bulk \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contacts": [array_of_50_contacts],
    "message": "Bulk performance test",
    "type": "text",
    "delay": 100
  }'
```

#### Template Rendering Performance
```bash
# Test template preview with complex data
curl -H "Authorization: Bearer $COACH_TOKEN" \
  "$BASE_URL/api/messaging/templates/{templateId}/preview?leadId=lead_id"
```

### 2. Concurrent Request Testing

#### Multiple Simultaneous Messages
```bash
# Run these simultaneously to test concurrency
curl -X POST $BASE_URL/api/messaging/send \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567890", "message": "Concurrent test 1", "type": "text"}' &

curl -X POST $BASE_URL/api/messaging/send \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567891", "message": "Concurrent test 2", "type": "text"}' &

curl -X POST $BASE_URL/api/messaging/send \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567892", "message": "Concurrent test 3", "type": "text"}' &
```

### 3. Memory and Response Time Testing

#### Large Inbox Data
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  "$BASE_URL/api/messaging/inbox?page=1&limit=100"
```

#### Complex Statistics Requests
```bash
curl -H "Authorization: Bearer $COACH_TOKEN" \
  $BASE_URL/api/messaging/stats
```

---

## Manual Testing Checklist

### Admin Features ✅
- [ ] Central WhatsApp setup and configuration
- [ ] Template creation and management
- [ ] Contact management and search
- [ ] Message sending (single and bulk)
- [ ] Analytics and statistics viewing
- [ ] Credit settings management
- [ ] Coach activity monitoring
- [ ] Email configuration setup
- [ ] AI knowledge base management
- [ ] System health monitoring

### Coach Features ✅
- [ ] Single message sending
- [ ] Bulk message sending
- [ ] Template usage and preview
- [ ] Template creation and management
- [ ] Contact management
- [ ] Inbox management
- [ ] Message replies
- [ ] Statistics viewing
- [ ] WhatsApp device management
- [ ] Credit management
- [ ] Settings configuration

### Error Handling ✅
- [ ] Authentication errors
- [ ] Validation errors
- [ ] Permission errors
- [ ] Resource not found errors
- [ ] Credit system errors
- [ ] Network timeout errors
- [ ] Server errors (500)

### Performance ✅
- [ ] Load testing with multiple requests
- [ ] Bulk message performance
- [ ] Template rendering performance
- [ ] Database query performance
- [ ] Memory usage monitoring
- [ ] Response time testing

---

## Troubleshooting Guide

### Common Issues

#### 1. Messages Not Sending
- **Check**: WhatsApp configuration
- **Check**: Credit balance
- **Check**: Phone number format
- **Check**: Template approval status

#### 2. Template Rendering Issues
- **Check**: Template syntax
- **Check**: Variable names
- **Check**: Lead data availability
- **Check**: Template parameters

#### 3. Authentication Issues
- **Check**: Token expiration
- **Check**: Token format
- **Check**: Role permissions
- **Check**: Middleware configuration

#### 4. Performance Issues
- **Check**: Database indexes
- **Check**: Query optimization
- **Check**: API rate limits
- **Check**: Memory usage

### Support Information

#### Debug Endpoints
- Health Check: `GET /api/admin/central-whatsapp/health`
- Debug Auth: `GET /api/admin/central-whatsapp/debug-auth`
- System Overview: `GET /api/messagingv1/admin/overview`

#### Logging
- Check application logs for detailed error messages
- Monitor database logs for query performance
- Review WhatsApp API logs for delivery issues

---

*Documentation Version: 1.0*  
*Last Updated: January 2024*  
*System Version: Central Messaging System v1.0*
