# 📱 Messaging System - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [Coach Features](#coach-features)
5. [Admin Features](#admin-features)
6. [Template System](#template-system)
7. [API Reference](#api-reference)
8. [Sample JSON Data](#sample-json-data)
9. [Error Handling](#error-handling)
10. [Testing](#testing)

---

## Overview

The Messaging System provides comprehensive WhatsApp messaging capabilities for coaches and administrators, including single/bulk messaging, template management, contact access control, and inbox functionality.

### Key Features
- ✅ Single & Bulk Message Sending
- ✅ Template System with Dynamic Parameters
- ✅ Contact Access Control (Coach vs Admin)
- ✅ Inbox Management
- ✅ Credit System Integration
- ✅ Real-time Message Tracking
- ✅ Admin Oversight Capabilities

---

## Architecture

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│                 │    │                 │    │                 │
│ - Coach UI      │◄──►│ - Routes        │◄──►│ - WhatsAppMessage│
│ - Admin UI      │    │ - Controllers   │    │ - Lead          │
│ - Templates     │    │ - Services      │    │ - MessageTemplate│
│ - Inbox         │    │ - Middleware    │    │ - WhatsAppCredit │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Central WhatsApp│
                       │ Service         │
                       │ (Meta API)      │
                       └─────────────────┘
```

### Route Structure
- **Coach Routes**: `/api/messaging/*`
- **Admin Routes**: `/api/messaging/admin/*`
- **Base URL**: `http://localhost:5000`

---

## Authentication & Authorization

### Coach Authentication
```javascript
// Required Header
Authorization: Bearer <coach_jwt_token>

// Middleware: protect
// Access: Own leads and templates only
```

### Admin Authentication
```javascript
// Required Header
Authorization: Bearer <admin_jwt_token>

// Middleware: verifyAdminToken + requirePermission('whatsapp_management')
// Access: All system data
```

---

## Coach Features

### 1. Message Sending

#### Single Message
Send individual messages to contacts with support for text, template, and media messages.

#### Bulk Messaging
Send messages to multiple contacts with configurable delays and progress tracking.

#### Template Integration
Use pre-built or custom templates with dynamic parameter replacement.

### 2. Contact Management

#### Contact Access
- View only own leads (filtered by `coachId`)
- Search by name, phone, or email
- Pagination support
- Message count per contact

#### Contact Search
- Real-time search functionality
- Minimum 2 characters required
- Results limited to coach's contacts

### 3. Template System

#### Available Templates
- Personal templates (created by coach)
- Pre-built templates (system-wide)
- Template preview with sample data
- Parameter validation

#### Template Parameters
Access to comprehensive parameter system including:
- Lead information
- Client information
- Coach information
- System information

### 4. Inbox Management

#### Conversation View
- View all conversations
- Group messages by contact
- Unread message tracking
- Message history

#### Message Actions
- Send replies from inbox
- Mark messages as read
- View message status
- Track delivery status

### 5. Statistics & Analytics

#### Messaging Stats
- Total messages sent
- Delivery rates
- Success rates
- Credit usage
- Recent activity

---

## Admin Features

### 1. System Oversight

#### Global Contact Access
- View all contacts across all coaches
- Search system-wide
- Filter by coach
- Contact analytics

#### Message Monitoring
- View all messages system-wide
- Filter by coach
- Message delivery tracking
- System performance metrics

### 2. Template Management

#### Global Template Control
- Create system-wide templates
- Update existing templates
- Delete templates
- Template usage analytics

#### Template Approval
- Review coach-created templates
- Approve for system-wide use
- Template versioning
- Usage statistics

### 3. System Analytics

#### Performance Metrics
- System-wide message statistics
- Coach performance rankings
- Success rates
- Credit usage analytics

#### Administrative Tools
- Coach message history
- System health monitoring
- Error tracking
- Performance optimization

---

## Template System

### Parameter Categories

#### 1. Lead Information
```javascript
{
  "lead.name": "John Doe",
  "lead.email": "john@example.com",
  "lead.phone": "+1234567890",
  "lead.country": "United States",
  "lead.city": "New York",
  "lead.status": "New",
  "lead.temperature": "Warm",
  "lead.source": "Web Form"
}
```

#### 2. Client Information
```javascript
{
  "client.age": "28",
  "client.gender": "Male",
  "client.goal": "Weight Loss",
  "client.experience": "Beginner",
  "client.budget": "$100-200/month",
  "client.timeline": "3-6 months",
  "client.availability": "Evenings",
  "client.preferences": "Online training",
  "client.medical": "None",
  "client.supplements": "Protein powder",
  "client.obstacle": "Time constraints",
  "client.seriousness": "8",
  "client.motivation": "Health improvement"
}
```

#### 3. Coach Information
```javascript
{
  "coach.fullName": "Jane Smith",
  "coach.email": "jane@example.com",
  "coach.whatsapp": "+1987654321",
  "coach.instagram": "@janesmith",
  "coach.profession": "Fitness Trainer",
  "coach.incomeGoal": "$50,000-100,000/month",
  "coach.investment": "$100,000-200,000",
  "coach.timeAvailability": "4-6 hours/day",
  "coach.timeline": "3-6 months",
  "coach.description": "Full-time job",
  "coach.readiness": "100% ready",
  "coach.commitment": "Yes, fully committed",
  "coach.timeCommitment": "3-4 hours/day"
}
```

#### 4. System Information
```javascript
{
  "system.date": "2024-01-15",
  "system.time": "14:30:00",
  "system.datetime": "2024-01-15T14:30:00.000Z",
  "system.company": "FunnelsEye",
  "system.website": "https://funnelseye.com"
}
```

### Template Usage Example
```javascript
// Template Content
"Hello {{lead.name}}! Your goal is {{client.goal}} and you're working with {{coach.fullName}}. Today is {{system.date}}."

// Rendered Output
"Hello John Doe! Your goal is Weight Loss and you're working with Jane Smith. Today is 2024-01-15."
```

---

## API Reference

### Base URL
```
http://localhost:5000/api/messaging
```

### Coach Endpoints

#### Send Single Message
```http
POST /send
Authorization: Bearer <coach_token>
Content-Type: application/json
```

#### Send Bulk Messages
```http
POST /send-bulk
Authorization: Bearer <coach_token>
Content-Type: application/json
```

#### Get Contacts
```http
GET /contacts?page=1&limit=50&search=john&status=New
Authorization: Bearer <coach_token>
```

#### Search Contacts
```http
GET /contacts/search?q=john&limit=20
Authorization: Bearer <coach_token>
```

#### Get Templates
```http
GET /templates?type=whatsapp&category=welcome&search=welcome
Authorization: Bearer <coach_token>
```

#### Preview Template
```http
GET /templates/{templateId}/preview?leadId=lead_id
Authorization: Bearer <coach_token>
```

#### Get Template Parameters
```http
GET /templates/parameters
Authorization: Bearer <coach_token>
```

#### Get Inbox
```http
GET /inbox?page=1&limit=50&unreadOnly=false
Authorization: Bearer <coach_token>
```

#### Get Conversation
```http
GET /inbox/conversation/{contactId}?page=1&limit=50
Authorization: Bearer <coach_token>
```

#### Send from Inbox
```http
POST /inbox/send
Authorization: Bearer <coach_token>
Content-Type: application/json
```

#### Mark as Read
```http
PUT /inbox/messages/{messageId}/read
Authorization: Bearer <coach_token>
```

#### Get Statistics
```http
GET /stats
Authorization: Bearer <coach_token>
```

### Admin Endpoints

#### Get All Contacts
```http
GET /admin/contacts?page=1&limit=50&search=john&status=New&coachId=coach_id
Authorization: Bearer <admin_token>
```

#### Search All Contacts
```http
GET /admin/contacts/search?q=john&limit=20&coachId=coach_id
Authorization: Bearer <admin_token>
```

#### Send as Admin
```http
POST /admin/send
Authorization: Bearer <admin_token>
Content-Type: application/json
```

#### Send Bulk as Admin
```http
POST /admin/send-bulk
Authorization: Bearer <admin_token>
Content-Type: application/json
```

#### Get All Templates
```http
GET /admin/templates?type=whatsapp&category=welcome&search=welcome&coachId=coach_id
Authorization: Bearer <admin_token>
```

#### Create Global Template
```http
POST /admin/templates
Authorization: Bearer <admin_token>
Content-Type: application/json
```

#### Update Global Template
```http
PUT /admin/templates/{templateId}
Authorization: Bearer <admin_token>
Content-Type: application/json
```

#### Delete Global Template
```http
DELETE /admin/templates/{templateId}
Authorization: Bearer <admin_token>
```

#### Get All Inbox Messages
```http
GET /admin/inbox?page=1&limit=50&unreadOnly=false&coachId=coach_id
Authorization: Bearer <admin_token>
```

#### Get Admin Conversation
```http
GET /admin/inbox/conversation/{contactId}?page=1&limit=50
Authorization: Bearer <admin_token>
```

#### Get System Statistics
```http
GET /admin/stats
Authorization: Bearer <admin_token>
```

#### Get Coach Messages
```http
GET /admin/coaches/{coachId}/messages?page=1&limit=50
Authorization: Bearer <admin_token>
```

---

## Sample JSON Data

### Coach API Samples

#### 1. Send Single Message
```json
{
  "to": "+1234567890",
  "message": "Hello! This is a test message.",
  "type": "text",
  "leadId": "lead_id_here"
}
```

#### 2. Send Template Message
```json
{
  "to": "+1234567890",
  "templateId": "template_id_here",
  "templateParameters": {
    "lead.name": "John Doe",
    "client.goal": "Weight Loss",
    "coach.fullName": "Jane Smith"
  },
  "type": "template",
  "leadId": "lead_id_here"
}
```

#### 3. Send Media Message
```json
{
  "to": "+1234567890",
  "message": "Check out this image!",
  "type": "text",
  "mediaUrl": "https://example.com/image.jpg",
  "caption": "This is a sample image",
  "leadId": "lead_id_here"
}
```

#### 4. Send Bulk Messages
```json
{
  "contacts": [
    {
      "phone": "+1234567890",
      "name": "John Doe",
      "leadId": "lead_id_1"
    },
    {
      "phone": "+1987654321",
      "name": "Jane Smith",
      "leadId": "lead_id_2"
    }
  ],
  "message": "Hello everyone! This is a bulk message.",
  "type": "text",
  "delay": 2000
}
```

#### 5. Send Bulk Template Messages
```json
{
  "contacts": [
    {
      "phone": "+1234567890",
      "name": "John Doe",
      "leadId": "lead_id_1"
    },
    {
      "phone": "+1987654321",
      "name": "Jane Smith",
      "leadId": "lead_id_2"
    }
  ],
  "templateId": "welcome_template_id",
  "templateParameters": {
    "system.company": "FunnelsEye"
  },
  "type": "template",
  "delay": 1000
}
```

#### 6. Send from Inbox
```json
{
  "contactId": "contact_id_here",
  "message": "Thanks for your message!",
  "type": "text"
}
```

### Admin API Samples

#### 1. Send as Admin
```json
{
  "to": "+1234567890",
  "message": "Hello from admin!",
  "type": "text",
  "leadId": "lead_id_here",
  "coachId": "coach_id_here"
}
```

#### 2. Send Bulk as Admin
```json
{
  "contacts": [
    {
      "phone": "+1234567890",
      "name": "John Doe",
      "leadId": "lead_id_1"
    },
    {
      "phone": "+1987654321",
      "name": "Jane Smith",
      "leadId": "lead_id_2"
    }
  ],
  "message": "System announcement from admin.",
  "type": "text",
  "delay": 1000
}
```

#### 3. Create Global Template
```json
{
  "name": "Welcome Message",
  "description": "Welcome message for new leads",
  "type": "whatsapp",
  "category": "welcome",
  "content": {
    "body": "Hello {{lead.name}}! Welcome to {{system.company}}. We're excited to help you achieve your {{client.goal}} goal."
  },
  "availableVariables": [
    {
      "name": "lead.name",
      "description": "Lead's full name",
      "example": "John Doe",
      "required": true
    },
    {
      "name": "client.goal",
      "description": "Client's fitness goal",
      "example": "Weight Loss",
      "required": false
    }
  ],
  "tags": ["welcome", "new-lead", "onboarding"]
}
```

#### 4. Update Global Template
```json
{
  "name": "Updated Welcome Message",
  "description": "Updated welcome message for new leads",
  "content": {
    "body": "Hello {{lead.name}}! Welcome to {{system.company}}. We're excited to help you achieve your {{client.goal}} goal. Your coach {{coach.fullName}} will be in touch soon."
  },
  "availableVariables": [
    {
      "name": "lead.name",
      "description": "Lead's full name",
      "example": "John Doe",
      "required": true
    },
    {
      "name": "client.goal",
      "description": "Client's fitness goal",
      "example": "Weight Loss",
      "required": false
    },
    {
      "name": "coach.fullName",
      "description": "Coach's full name",
      "example": "Jane Smith",
      "required": false
    }
  ]
}
```

### Response Samples

#### 1. Successful Message Send
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "msg_123456789",
    "wamid": "wamid_987654321",
    "status": "sent",
    "creditsUsed": 1,
    "remainingCredits": 99
  }
}
```

#### 2. Successful Bulk Send
```json
{
  "success": true,
  "message": "Bulk messages sent. 2 successful, 0 failed.",
  "data": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "results": [
      {
        "contact": "+1234567890",
        "success": true,
        "messageId": "msg_123456789"
      },
      {
        "contact": "+1987654321",
        "success": true,
        "messageId": "msg_987654321"
      }
    ],
    "errors": [],
    "creditsUsed": 2,
    "remainingCredits": 98
  }
}
```

#### 3. Contacts Response
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "_id": "lead_id_1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "status": "New",
        "leadTemperature": "Warm",
        "source": "Web Form",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "messageCount": 5
      },
      {
        "_id": "lead_id_2",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "+1987654321",
        "status": "Contacted",
        "leadTemperature": "Hot",
        "source": "Referral",
        "createdAt": "2024-01-14T15:45:00.000Z",
        "messageCount": 12
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 3,
      "total": 25,
      "limit": 10
    }
  }
}
```

#### 4. Templates Response
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "_id": "template_id_1",
        "name": "Welcome Message",
        "description": "Welcome message for new leads",
        "type": "whatsapp",
        "category": "welcome",
        "content": {
          "body": "Hello {{lead.name}}! Welcome to {{system.company}}."
        },
        "availableVariables": [
          {
            "name": "lead.name",
            "description": "Lead's full name",
            "example": "John Doe",
            "required": true
          }
        ],
        "isPreBuilt": true,
        "usageStats": {
          "totalUses": 45,
          "lastUsed": "2024-01-15T14:30:00.000Z",
          "successRate": 98
        }
      }
    ],
    "total": 1
  }
}
```

#### 5. Template Preview Response
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "template_id_1",
      "name": "Welcome Message",
      "description": "Welcome message for new leads",
      "type": "whatsapp",
      "category": "welcome"
    },
    "sampleData": {
      "lead.name": "John Doe",
      "lead.email": "john@example.com",
      "client.goal": "Weight Loss",
      "system.company": "FunnelsEye"
    },
    "renderedContent": {
      "body": "Hello John Doe! Welcome to FunnelsEye."
    },
    "availableVariables": [
      {
        "name": "lead.name",
        "description": "Lead's full name",
        "example": "John Doe",
        "required": true
      }
    ]
  }
}
```

#### 6. Inbox Response
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "contactPhone": "+1234567890",
        "lastMessage": {
          "_id": "msg_id_1",
          "senderId": "coach_id_1",
          "senderType": "coach",
          "recipientPhone": "+1234567890",
          "content": {
            "text": "Hello! How can I help you?"
          },
          "sentAt": "2024-01-15T14:30:00.000Z",
          "status": "delivered",
          "deliveryStatus": "delivered",
          "isRead": true
        },
        "unreadCount": 0,
        "totalMessages": 5
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 2,
      "total": 15,
      "limit": 10
    }
  }
}
```

#### 7. Conversation Response
```json
{
  "success": true,
  "data": {
    "contact": {
      "id": "lead_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "messages": [
      {
        "_id": "msg_id_1",
        "senderId": "coach_id_1",
        "senderType": "coach",
        "content": {
          "text": "Hello John! Welcome to our program."
        },
        "sentAt": "2024-01-15T10:00:00.000Z",
        "status": "delivered",
        "deliveryStatus": "delivered",
        "isRead": true
      },
      {
        "_id": "msg_id_2",
        "senderId": "lead_id_1",
        "senderType": "lead",
        "content": {
          "text": "Thank you! I'm excited to get started."
        },
        "sentAt": "2024-01-15T10:05:00.000Z",
        "status": "delivered",
        "deliveryStatus": "delivered",
        "isRead": true
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 2,
      "limit": 50
    }
  }
}
```

#### 8. Statistics Response
```json
{
  "success": true,
  "data": {
    "totalMessages": 150,
    "sentMessages": 150,
    "deliveredMessages": 145,
    "readMessages": 120,
    "failedMessages": 5,
    "successRate": "96.67",
    "recentMessages": [
      {
        "_id": "msg_id_1",
        "recipientPhone": "+1234567890",
        "content": {
          "text": "Hello! This is a recent message."
        },
        "sentAt": "2024-01-15T14:30:00.000Z",
        "status": "delivered"
      }
    ],
    "credits": {
      "balance": 95,
      "status": "active",
      "totalUsed": 55
    }
  }
}
```

#### 9. Template Parameters Response
```json
{
  "success": true,
  "data": {
    "parameters": [
      {
        "category": "Lead Information",
        "parameters": [
          {
            "name": "lead.name",
            "description": "Lead's full name",
            "example": "John Doe",
            "field": "name",
            "type": "string"
          },
          {
            "name": "lead.email",
            "description": "Lead's email address",
            "example": "john@example.com",
            "field": "email",
            "type": "string"
          }
        ]
      },
      {
        "category": "Client Information",
        "parameters": [
          {
            "name": "client.goal",
            "description": "Client's fitness goal",
            "example": "Weight Loss",
            "field": "clientQuestions.goal",
            "type": "string"
          }
        ]
      }
    ],
    "total": 50
  }
}
```

---

## Error Handling

### Common Error Responses

#### 1. Authentication Error
```json
{
  "success": false,
  "message": "Access denied. Invalid token.",
  "error": "Unauthorized"
}
```

#### 2. Validation Error
```json
{
  "success": false,
  "message": "Recipient phone number is required",
  "error": "Validation failed"
}
```

#### 3. Insufficient Credits
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

#### 4. Template Not Found
```json
{
  "success": false,
  "message": "Template not found",
  "error": "Template not found"
}
```

#### 5. Contact Not Found
```json
{
  "success": false,
  "message": "Contact not found",
  "error": "Contact not found"
}
```

#### 6. Message Send Failure
```json
{
  "success": false,
  "message": "Failed to send message",
  "error": "WhatsApp API error: Invalid phone number"
}
```

### Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `402` - Payment Required (insufficient credits)
- `500` - Internal Server Error (system errors)

---

## Testing

### Test Script Usage
```bash
# Run the test script
node test-messaging-system.js

# Update tokens in the script
const COACH_TOKEN = 'your_actual_coach_token';
const ADMIN_TOKEN = 'your_actual_admin_token';
```

### Test Coverage
- ✅ Template parameter system
- ✅ Contact access control
- ✅ Message sending (single & bulk)
- ✅ Template management
- ✅ Inbox functionality
- ✅ Statistics and analytics
- ✅ Admin oversight features
- ✅ Error handling
- ✅ Authentication & authorization

### Manual Testing Checklist

#### Coach Features
- [ ] Send single text message
- [ ] Send template message with parameters
- [ ] Send media message
- [ ] Send bulk messages
- [ ] View own contacts
- [ ] Search contacts
- [ ] View available templates
- [ ] Preview template with sample data
- [ ] View inbox conversations
- [ ] Send message from inbox
- [ ] Mark messages as read
- [ ] View messaging statistics

#### Admin Features
- [ ] View all contacts
- [ ] Search all contacts
- [ ] Send message as admin
- [ ] Send bulk messages as admin
- [ ] View all templates
- [ ] Create global template
- [ ] Update global template
- [ ] Delete global template
- [ ] View all inbox messages
- [ ] View admin conversation
- [ ] View system statistics
- [ ] View coach messages

---

## Integration Guide

### Frontend Integration

#### 1. Coach Dashboard
```javascript
// Send message
const sendMessage = async (messageData) => {
  const response = await fetch('/api/messaging/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${coachToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(messageData)
  });
  return response.json();
};

// Get contacts
const getContacts = async (page = 1, limit = 50) => {
  const response = await fetch(`/api/messaging/contacts?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${coachToken}`
    }
  });
  return response.json();
};
```

#### 2. Admin Dashboard
```javascript
// Send as admin
const sendAdminMessage = async (messageData) => {
  const response = await fetch('/api/messaging/admin/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(messageData)
  });
  return response.json();
};

// Get all contacts
const getAllContacts = async (page = 1, limit = 50) => {
  const response = await fetch(`/api/messaging/admin/contacts?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  return response.json();
};
```

### Real-time Updates

#### WebSocket Integration
```javascript
// Listen for message status updates
const socket = io('/messaging');
socket.on('messageStatusUpdate', (data) => {
  console.log('Message status updated:', data);
  // Update UI with new status
});

// Listen for new messages
socket.on('newMessage', (data) => {
  console.log('New message received:', data);
  // Add to inbox
});
```

---

## Security Considerations

### Data Protection
- All sensitive data encrypted in transit
- Phone numbers and personal information protected
- Credit information secured
- Admin access properly restricted

### Rate Limiting
- Message sending rate limits
- API call rate limits
- Bulk message throttling
- Credit-based restrictions

### Audit Trail
- All message activities logged
- Admin actions tracked
- Credit usage monitored
- System performance metrics

---

## Performance Optimization

### Database Indexing
- Message queries optimized
- Contact search indexed
- Template lookups cached
- Statistics pre-calculated

### Caching Strategy
- Template data cached
- Contact lists cached
- Statistics cached
- Parameter definitions cached

### Scalability
- Horizontal scaling support
- Load balancing ready
- Database sharding capable
- Microservice architecture

---

## Maintenance & Monitoring

### Health Checks
- API endpoint monitoring
- Database connection monitoring
- WhatsApp service monitoring
- Credit system monitoring

### Logging
- Comprehensive error logging
- Performance metrics logging
- User activity logging
- System health logging

### Backup & Recovery
- Database backups
- Template backups
- Message history backups
- Configuration backups

---

## Support & Troubleshooting

### Common Issues

#### 1. Message Not Sending
- Check credit balance
- Verify phone number format
- Check WhatsApp service status
- Review error logs

#### 2. Template Not Rendering
- Verify parameter names
- Check lead data availability
- Validate template syntax
- Test with sample data

#### 3. Contact Not Found
- Verify coach access permissions
- Check lead assignment
- Review search parameters
- Validate contact data

### Support Channels
- Technical documentation
- API reference guide
- Error code reference
- Troubleshooting guide

---

## Conclusion

The Messaging System provides a comprehensive solution for WhatsApp messaging with advanced features for both coaches and administrators. The system is designed for scalability, security, and ease of use, with extensive documentation and testing support.

### Key Benefits
- **For Coaches**: Easy-to-use messaging interface with template support
- **For Admins**: Complete system oversight and management capabilities
- **For System**: Scalable, secure, and maintainable architecture
- **For Users**: Reliable messaging with real-time updates and tracking

### Future Enhancements
- Real-time message status updates
- Advanced analytics and reporting
- AI-powered message suggestions
- Multi-language template support
- Advanced automation rules
- Integration with other messaging platforms

---

*Documentation Version: 1.0*  
*Last Updated: January 2024*  
*System Version: Messaging System v1.0*

