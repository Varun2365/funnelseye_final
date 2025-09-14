# Unified Messaging System Setup Guide

## 🚀 Quick Start

### 1. Import Postman Collection
- Import `Unified_Messaging_API_Collection.json` into Postman
- Set up environment variables:
  - `base_url`: Your server URL (e.g., `http://localhost:3000`)
  - `coach_token`: JWT token from coach login
  - `staff_token`: JWT token from staff login  
  - `admin_token`: JWT token from admin login

### 2. Authentication Flow
1. **Coach Login**: Use `/api/auth/login` to get coach token
2. **Staff Login**: Use `/api/staffv2/auth/login` to get staff token
3. **Admin Login**: Use `/api/admin/auth/login` to get admin token

### 3. Testing Coach Features

#### Setup WhatsApp Device
```bash
# 1. Get coach settings
GET /api/messagingv1/settings

# 2. Set up Baileys WhatsApp
POST /api/messagingv1/settings
{
  "useCentralWhatsApp": false,
  "baileysSettings": {
    "deviceName": "My WhatsApp Device",
    "phoneNumber": "+1234567890"
  }
}

# 3. Initialize Baileys connection
POST /api/messagingv1/baileys/connect/{deviceId}

# 4. Get QR code for setup
GET /api/messagingv1/baileys/qr/{deviceId}

# 5. Open QR setup page
GET /whatsapp-qr-setup.html?device={deviceId}
```

#### Send Messages
```bash
# Send text message
POST /api/messagingv1/send
{
  "to": "+1234567890",
  "message": "Hello from FunnelsEye!",
  "type": "text"
}

# Send media message
POST /api/messagingv1/send
{
  "to": "+1234567890",
  "message": "Check this out!",
  "type": "image",
  "mediaUrl": "https://example.com/image.jpg",
  "caption": "Sample image"
}
```

#### Template Management
```bash
# Create template
POST /api/messagingv1/templates
{
  "name": "Appointment Reminder",
  "content": "Hi {name}, your appointment is on {date} at {time}.",
  "category": "appointment",
  "variables": [
    {
      "name": "name",
      "type": "text",
      "required": true
    },
    {
      "name": "date", 
      "type": "date",
      "required": true
    },
    {
      "name": "time",
      "type": "text", 
      "required": true
    }
  ]
}

# Send template message
POST /api/messagingv1/send
{
  "to": "+1234567890",
  "templateId": "template_id_here",
  "templateParams": {
    "name": "John Doe",
    "date": "2024-01-15",
    "time": "10:00 AM"
  }
}
```

### 4. Testing Staff Features

#### Staff WhatsApp Setup
```bash
# Set staff WhatsApp settings
POST /api/messagingv1/staff/settings
{
  "deviceName": "Staff Device",
  "phoneNumber": "+1234567890"
}

# Initialize staff Baileys connection
POST /api/messagingv1/staff/baileys/connect

# Send message as staff
POST /api/messagingv1/staff/send
{
  "to": "+1234567890",
  "message": "Hello from staff!",
  "type": "text"
}
```

### 5. Testing Admin Features

#### System Management
```bash
# Get system overview
GET /api/messagingv1/admin/overview

# Get all devices
GET /api/messagingv1/admin/devices

# Get all messages
GET /api/messagingv1/admin/messages

# Send broadcast message
POST /api/messagingv1/admin/broadcast
{
  "message": "System maintenance tonight at 2 AM",
  "recipients": ["+1234567890", "+0987654321"]
}
```

#### Credit Management
```bash
# Update credit rates
PUT /api/messagingv1/admin/credit-rates
{
  "creditPrice": 0.02,
  "autoRecharge": true,
  "rechargeThreshold": 50,
  "rechargeAmount": 500
}
```

#### Global Templates
```bash
# Create global template
POST /api/messagingv1/admin/templates
{
  "name": "Welcome Message",
  "category": "greeting",
  "components": [
    {
      "type": "BODY",
      "text": "Welcome to FunnelsEye!"
    }
  ]
}
```

## 📱 WhatsApp Setup Process

### For Baileys WhatsApp (Coach/Staff Own Device)

1. **Initialize Connection**
   - Call the connect endpoint to start the session
   - This generates a QR code

2. **Scan QR Code**
   - Open the QR setup page: `/whatsapp-qr-setup.html?device={deviceId}`
   - Use your phone to scan the QR code
   - The page will show connection status

3. **Verify Connection**
   - Check status endpoint to confirm connection
   - Start sending messages

### For Central Meta WhatsApp (Admin Setup)

1. **Admin Configuration**
   - Admin sets up Meta WhatsApp Business API
   - Configures templates and webhooks

2. **Coach Usage**
   - Coach sets `useCentralWhatsApp: true` in settings
   - Uses admin-configured templates
   - Messages sent via central Meta API

## 🔧 Configuration Requirements

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/funnelseye

# JWT
JWT_SECRET=your_jwt_secret

# Meta WhatsApp (for central messaging)
META_WHATSAPP_ACCESS_TOKEN=your_access_token
META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
META_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

### Admin System Settings
The admin needs to configure:
- Central WhatsApp API credentials
- Credit pricing
- Global message templates
- Auto-recharge settings

## 🧪 Testing Scenarios

### Basic Flow
1. ✅ Coach login and setup
2. ✅ Create WhatsApp device
3. ✅ Generate and scan QR code
4. ✅ Send test message
5. ✅ Check inbox
6. ✅ Create and use template

### Advanced Flow
1. ✅ Staff setup under coach
2. ✅ Admin system overview
3. ✅ Broadcast messaging
4. ✅ Credit management
5. ✅ Analytics and statistics

### Error Scenarios
1. ✅ Invalid device ID
2. ✅ Insufficient credits
3. ✅ WhatsApp not connected
4. ✅ Template not found
5. ✅ Permission denied

## 📊 Analytics & Monitoring

### Coach Analytics
- Messages sent/received
- Credit usage
- Device status
- Template performance

### Admin Analytics
- System-wide statistics
- Coach usage patterns
- Device health monitoring
- Credit consumption trends

## 🚨 Troubleshooting

### Common Issues

1. **QR Code Not Generating**
   - Check Baileys service status
   - Verify device initialization
   - Check session storage

2. **Messages Not Sending**
   - Verify WhatsApp connection
   - Check credit balance
   - Validate phone number format

3. **Template Variables Not Replacing**
   - Check variable names match exactly
   - Verify required parameters provided
   - Test with simple templates first

4. **Staff Access Denied**
   - Verify staff is assigned to coach
   - Check staff permissions
   - Confirm authentication token

### Debug Endpoints
- `GET /api/messagingv1/baileys/status/{deviceId}` - Check connection status
- `GET /api/messagingv1/admin/health` - System health check
- `GET /api/messagingv1/stats` - Messaging statistics

## 📝 Notes

- All phone numbers should include country code (e.g., +1234567890)
- QR codes expire after 5 minutes
- Templates support variables with `{variable_name}` syntax
- Credits are deducted per message for Baileys devices
- Central Meta WhatsApp doesn't use credits (admin managed)
- Staff devices inherit coach's messaging permissions
