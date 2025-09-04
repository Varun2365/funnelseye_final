# WhatsApp Microservice

A comprehensive unified WhatsApp and Email microservice for Funnelseye, supporting both Baileys WhatsApp Web and Meta WhatsApp Business API, along with SMTP email functionality.

## Features

### WhatsApp Integration
- **Baileys WhatsApp Web**: Connect personal WhatsApp accounts via QR code scanning
- **Meta WhatsApp Business API**: Connect business WhatsApp accounts via API credentials
- **Unified Interface**: Single API for both WhatsApp services
- **Multiple Devices**: Support for multiple WhatsApp devices per coach
- **Message Templates**: Create and manage reusable message templates
- **Conversation Management**: Full inbox functionality with conversation threads
- **Message History**: Complete message history and statistics
- **Credits System**: Per-message credit deduction system

### Email Integration
- **Multiple SMTP Providers**: Support for Gmail, Outlook, Yahoo, SendGrid, Mailgun, AWS SES, and custom SMTP
- **Email Templates**: Variable-based email templates
- **Bulk Email**: Send bulk emails with tracking
- **Daily Limits**: Configurable daily email limits
- **Email Tracking**: Open and click tracking capabilities

### Advanced Features
- **Webhook Support**: Meta WhatsApp webhook handling
- **QR Code Management**: Automatic QR code generation and expiration
- **Session Management**: Automatic session handling for Baileys
- **Error Handling**: Comprehensive error handling and retry mechanisms
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Security**: Authentication and authorization middleware

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/funnelseye

# WhatsApp
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Server
PORT=3001
NODE_ENV=development
```

## API Endpoints

### WhatsApp Devices

#### Create Device
```http
POST /api/whatsapp/devices
Content-Type: application/json
Authorization: Bearer <token>

{
  "deviceName": "My WhatsApp",
  "deviceType": "baileys",
  "phoneNumber": "+1234567890",
  "creditsPerMessage": 1,
  "monthlyMessageLimit": 1000
}
```

#### Get Devices
```http
GET /api/whatsapp/devices?page=1&limit=10&status=active
Authorization: Bearer <token>
```

#### Initialize Device
```http
POST /api/whatsapp/devices/:id/initialize
Authorization: Bearer <token>
```

#### Get QR Code
```http
GET /api/whatsapp/devices/:id/qr
Authorization: Bearer <token>
```

### WhatsApp Messages

#### Send Message
```http
POST /api/whatsapp/messages/send
Content-Type: application/json
Authorization: Bearer <token>

{
  "deviceId": "device_id",
  "to": "+1234567890",
  "content": {
    "text": "Hello from Funnelseye!"
  }
}
```

#### Send with Default Device
```http
POST /api/whatsapp/messages/send-default
Content-Type: application/json
Authorization: Bearer <token>

{
  "to": "+1234567890",
  "content": {
    "text": "Hello from Funnelseye!"
  }
}
```

### WhatsApp Conversations

#### Get Conversations
```http
GET /api/whatsapp/conversations?deviceId=device_id&page=1&limit=20
Authorization: Bearer <token>
```

#### Get Messages
```http
GET /api/whatsapp/conversations/:conversationId/messages?page=1&limit=50
Authorization: Bearer <token>
```

### WhatsApp Templates

#### Create Template
```http
POST /api/whatsapp/templates
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Welcome Message",
  "category": "welcome",
  "content": {
    "body": "Welcome {{name}}! Thank you for joining us."
  },
  "variables": [
    {
      "name": "name",
      "description": "Customer name",
      "required": true
    }
  ]
}
```

### Email Configuration

#### Create Email Config
```http
POST /api/whatsapp/email/configs
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Gmail Account",
  "provider": "gmail",
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "your_email@gmail.com",
      "pass": "your_app_password"
    }
  },
  "from": {
    "name": "Your Name",
    "email": "your_email@gmail.com"
  }
}
```

#### Send Email
```http
POST /api/whatsapp/email/send
Content-Type: application/json
Authorization: Bearer <token>

{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "text": "This is a test email",
  "html": "<h1>Test Email</h1><p>This is a test email</p>"
}
```

### Webhooks

#### Meta WhatsApp Webhook
```http
GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=token&hub.challenge=challenge
```

```http
POST /api/whatsapp/webhook
Content-Type: application/json

{
  "object": "whatsapp_business_account",
  "entry": [...]
}
```

## Database Schema

### WhatsAppDevice
```javascript
{
  coachId: ObjectId,
  deviceName: String,
  deviceType: String, // 'baileys' or 'meta'
  phoneNumber: String,
  isActive: Boolean,
  isDefault: Boolean,
  creditsPerMessage: Number,
  monthlyMessageLimit: Number,
  messagesSentThisMonth: Number,
  settings: {
    autoReply: Boolean,
    businessHours: Object
  }
}
```

### WhatsAppMessage
```javascript
{
  coachId: ObjectId,
  deviceId: ObjectId,
  direction: String, // 'inbound' or 'outbound'
  messageType: String,
  from: String,
  to: String,
  content: Object,
  messageId: String,
  conversationId: String,
  status: String,
  creditsUsed: Number
}
```

### EmailConfig
```javascript
{
  coachId: ObjectId,
  name: String,
  provider: String,
  smtp: Object,
  from: Object,
  dailyLimit: Number,
  emailsSentToday: Number,
  settings: Object
}
```

## Usage Examples

### Connecting Baileys WhatsApp

1. Create a device:
```javascript
const device = await fetch('/api/whatsapp/devices', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    deviceName: 'My WhatsApp',
    deviceType: 'baileys',
    phoneNumber: '+1234567890'
  })
});
```

2. Initialize the device:
```javascript
await fetch(`/api/whatsapp/devices/${deviceId}/initialize`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

3. Get QR code URL:
```javascript
const qrUrl = `/whatsapp/qr.html?deviceId=${deviceId}`;
```

### Sending Messages

```javascript
// Send text message
await fetch('/api/whatsapp/messages/send-default', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    to: '+1234567890',
    content: {
      text: 'Hello from Funnelseye!'
    }
  })
});

// Send media message
await fetch('/api/whatsapp/messages/send-default', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    to: '+1234567890',
    content: {
      media: {
        type: 'image',
        url: 'https://example.com/image.jpg',
        caption: 'Check out this image!'
      }
    }
  })
});
```

### Email Setup

```javascript
// Create Gmail configuration
await fetch('/api/whatsapp/email/configs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Gmail Account',
    provider: 'gmail',
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_app_password'
      }
    },
    from: {
      name: 'Your Name',
      email: 'your_email@gmail.com'
    }
  })
});

// Send email
await fetch('/api/whatsapp/email/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Welcome to Funnelseye',
    text: 'Welcome to our platform!',
    html: '<h1>Welcome to Funnelseye</h1><p>We\'re excited to have you on board!</p>'
  })
});
```

## Integration with Main Application

To integrate this microservice with your main Funnelseye application:

1. Add the routes to your main `main.js`:
```javascript
const whatsappRoutes = require('./whatsapp/routes');
app.use('/api/whatsapp', whatsappRoutes);
```

2. Serve the QR code page:
```javascript
app.use('/whatsapp', express.static(path.join(__dirname, 'whatsapp/public')));
```

3. Update your automation rules to include WhatsApp actions:
```javascript
// In your automation processor
case 'send_whatsapp_message':
  await unifiedWhatsAppService.sendMessage(
    action.deviceId,
    action.to,
    action.content
  );
  break;
```

## Security Considerations

1. **Authentication**: All endpoints require valid authentication tokens
2. **Rate Limiting**: Built-in rate limiting to prevent abuse
3. **Input Validation**: Comprehensive input validation on all endpoints
4. **Error Handling**: Secure error handling without exposing sensitive information
5. **Webhook Verification**: Meta webhook verification to ensure legitimate requests

## Monitoring and Logging

The service includes comprehensive logging for:
- Message sending/receiving
- Device connections/disconnections
- Error tracking
- Performance metrics
- Webhook events

## Support

For support and questions, please refer to the main Funnelseye documentation or contact the development team.
