# Baileys WhatsApp Microservice

A dedicated microservice for handling Baileys WhatsApp integration, isolated from the main application to prevent interference.

## Features

- 🚀 **Isolated Service**: Runs independently on port 4444
- 🔒 **Secure**: Full database access with proper error handling
- 📱 **Baileys Integration**: Complete WhatsApp functionality
- 🔄 **Auto-reconnection**: Handles connection drops gracefully
- 📊 **Health Monitoring**: Built-in health check endpoints

## Quick Start

### 1. Install Dependencies
```bash
cd baileys-microservice
npm install
```

### 2. Start the Microservice
```bash
npm start
```

Or use the batch file on Windows:
```bash
start-microservice.bat
```

### 3. Verify Service
Visit: http://localhost:4444/health

## API Endpoints

### Health Check
- **GET** `/health` - Service health status

### Baileys Operations
- **POST** `/api/baileys/initialize/:deviceId` - Initialize device
- **GET** `/api/baileys/qr/:deviceId` - Get QR code
- **GET** `/api/baileys/status/:deviceId` - Get connection status
- **POST** `/api/baileys/send/:deviceId` - Send message
- **POST** `/api/baileys/force-qr/:deviceId` - Force QR generation
- **POST** `/api/baileys/disconnect/:deviceId` - Disconnect device
- **GET** `/api/baileys/inbox/:deviceId` - Get inbox messages

## Configuration

Update `config.js` for your environment:
- `PORT`: Service port (default: 4444)
- `MONGODB_URI`: Database connection string
- `MAIN_APP_URL`: Main application URL

## Integration

The main application now uses `BaileysMicroserviceClient` to communicate with this service:

```javascript
const baileysMicroserviceClient = require('./services/baileysMicroserviceClient');

// Initialize device
const result = await baileysMicroserviceClient.initializeDevice(deviceId, coachId);

// Get QR code
const qrResponse = await baileysMicroserviceClient.getQRCode(deviceId);
```

## Benefits

✅ **No Server Crashes**: Baileys errors are isolated  
✅ **Better Performance**: Dedicated service resources  
✅ **Easy Debugging**: Separate logs and monitoring  
✅ **Scalable**: Can be deployed independently  
✅ **Maintainable**: Clean separation of concerns  

## Troubleshooting

1. **Service won't start**: Check if port 4444 is available
2. **Database errors**: Verify MongoDB connection in config
3. **QR not generating**: Check device initialization logs
4. **Connection issues**: Monitor microservice health endpoint

## Logs

The microservice provides detailed logging for debugging:
- Connection updates
- QR code generation
- Message handling
- Error tracking
