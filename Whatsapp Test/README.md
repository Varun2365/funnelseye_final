# WhatsApp Baileys Client

A professional WhatsApp client built with Baileys library, featuring MongoDB integration for message storage and conversation management.

## Features

- 🔐 **Device Management**: Initialize and manage multiple WhatsApp devices
- 📱 **QR Code Authentication**: Elegant horizontal QR code page for device pairing
- 💬 **Message Handling**: Send and receive text, media, and other message types
- 📊 **Inbox Management**: View conversations and message history
- 🗄️ **MongoDB Integration**: Persistent storage for messages, conversations, and devices
- 🔄 **Real-time Updates**: Auto-refreshing QR page and status updates
- 📈 **Statistics**: Message and conversation analytics

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Copy the configuration file and update with your MongoDB connection:

```bash
cp config.env .env
```

Edit `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/whatsapp_client
PORT=3000
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or start your local MongoDB service
```

### 4. Run the Server

```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:3000`

## API Usage

### Initialize a WhatsApp Device

```bash
curl -X POST http://localhost:3000/api/whatsapp/init
```

Response:
```json
{
  "success": true,
  "message": "Device initialization started",
  "deviceId": "device_1703123456789_abc123def",
  "qrUrl": "/api/whatsapp/qr/device_1703123456789_abc123def"
}
```

### Access QR Code Page

Open the QR URL in your browser (use the deviceId from the init response):
```
http://localhost:3000/api/whatsapp/qr/device_1703123456789_abc123def
```

Scan the QR code with your WhatsApp mobile app to connect the device.

### Send a Message

```bash
curl -X POST http://localhost:3000/api/whatsapp/send/my-device-1 \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890@s.whatsapp.net",
    "message": "Hello from WhatsApp API!",
    "type": "text"
  }'
```

### Get Inbox (Conversations)

```bash
curl http://localhost:3000/api/whatsapp/inbox/my-device-1?limit=20&offset=0
```

### Get Messages for a Conversation

```bash
curl http://localhost:3000/api/whatsapp/messages/my-device-1/1234567890@s.whatsapp.net
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/whatsapp/init` | Initialize WhatsApp device (generates unique deviceId) |
| GET | `/api/whatsapp/qr/:deviceId` | Get QR code page |
| GET | `/api/whatsapp/status/:deviceId` | Get device status |
| POST | `/api/whatsapp/send/:deviceId` | Send message |
| GET | `/api/whatsapp/inbox/:deviceId` | Get inbox conversations |
| GET | `/api/whatsapp/messages/:deviceId/:participant` | Get messages for conversation |
| GET | `/api/whatsapp/devices` | Get all devices |
| POST | `/api/whatsapp/disconnect/:deviceId` | Disconnect device |
| GET | `/api/whatsapp/stats/:deviceId` | Get message statistics |
| GET | `/health` | Health check |
| GET | `/api/docs` | API documentation |

## Message Types Supported

- **text**: Plain text messages
- **image**: Images with optional captions
- **video**: Videos with optional captions
- **audio**: Audio messages
- **document**: Document files with optional captions
- **location**: Location sharing
- **contact**: Contact sharing
- **sticker**: Sticker messages

## Database Schema

### WhatsAppDevice
- `deviceId`: Unique device identifier
- `phoneNumber`: Connected phone number
- `name`: Device name
- `status`: Connection status (disconnected, connecting, connected, qr_required)
- `qrCode`: Base64 QR code data
- `sessionData`: Baileys session data
- `lastSeen`: Last activity timestamp
- `isActive`: Device active status

### WhatsAppMessage
- `messageId`: Unique message identifier
- `deviceId`: Associated device ID
- `from`: Sender phone number
- `to`: Recipient phone number
- `type`: Message type
- `content`: Message content (text, media, etc.)
- `timestamp`: Message timestamp
- `status`: Delivery status
- `direction`: inbound/outbound
- `conversationId`: Reference to conversation

### WhatsAppConversation
- `deviceId`: Associated device ID
- `participant`: Contact phone number
- `participantName`: Contact name
- `lastMessage`: Reference to last message
- `lastMessageTime`: Last message timestamp
- `unreadCount`: Number of unread messages
- `isArchived`: Archive status
- `isMuted`: Mute status
- `messageCount`: Total message count

## Project Structure

```
├── models/                 # MongoDB schemas
│   ├── WhatsAppDevice.js
│   ├── WhatsAppMessage.js
│   └── WhatsAppConversation.js
├── services/               # Business logic
│   └── whatsappService.js
├── routes/                 # API routes
│   └── whatsappRoutes.js
├── auth/                   # Baileys session storage
├── server.js              # Main server file
├── package.json           # Dependencies
├── config.env             # Environment configuration
└── README.md              # This file
```

## Development

### Running in Development Mode

```bash
npm run dev
```

This will start the server with nodemon for auto-restart on file changes.

### Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in config.env
   - Verify network connectivity

2. **QR Code Not Showing**
   - Check device status: `GET /api/whatsapp/status/:deviceId`
   - Ensure device is in 'qr_required' status
   - Try reinitializing the device

3. **Messages Not Sending**
   - Verify device is connected (status: 'connected')
   - Check phone number format (include country code)
   - Ensure recipient number is valid WhatsApp number

4. **Session Issues**
   - Clear auth directory and reinitialize
   - Check file permissions on auth directory
   - Restart the server

### Logs

The server provides detailed logging for debugging:
- Connection status updates
- Message handling events
- Error messages with stack traces

## License

ISC License - see package.json for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation at `/api/docs`
3. Check server logs for error details
4. Create an issue with detailed information
