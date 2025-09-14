const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: './config.env' });

// Import routes
const whatsappRoutes = require('./routes/whatsappRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create necessary directories
const authDir = path.join(__dirname, 'auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp_client', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Routes
app.use('/api/whatsapp', whatsappRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'WhatsApp Baileys Client API',
    version: '1.0.0',
    endpoints: {
      'POST /api/whatsapp/init': 'Initialize WhatsApp device (generates unique deviceId)',
      'GET /api/whatsapp/qr/:deviceId': 'Get QR code page',
      'GET /api/whatsapp/status/:deviceId': 'Get device status',
      'POST /api/whatsapp/send/:deviceId': 'Send message',
      'GET /api/whatsapp/inbox/:deviceId': 'Get inbox conversations',
      'GET /api/whatsapp/messages/:deviceId/:participant': 'Get messages for conversation',
      'GET /api/whatsapp/devices': 'Get all devices',
      'POST /api/whatsapp/disconnect/:deviceId': 'Disconnect device',
      'GET /api/whatsapp/stats/:deviceId': 'Get message statistics',
      'GET /health': 'Health check',
      'GET /api/docs': 'API documentation'
    },
    examples: {
      initializeDevice: {
        method: 'POST',
        url: '/api/whatsapp/init',
        response: {
          success: true,
          message: 'Device initialization started',
          deviceId: 'device_1703123456789_abc123def',
          qrUrl: '/api/whatsapp/qr/device_1703123456789_abc123def'
        }
      },
      sendMessage: {
        method: 'POST',
        url: '/api/whatsapp/send/my-device-1',
        body: {
          to: '1234567890@s.whatsapp.net',
          message: 'Hello from WhatsApp API!',
          type: 'text'
        },
        response: {
          success: true,
          messageId: 'message-id-here'
        }
      },
      getInbox: {
        method: 'GET',
        url: '/api/whatsapp/inbox/my-device-1?limit=20&offset=0',
        response: {
          success: true,
          conversations: []
        }
      }
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /api/docs',
      'POST /api/whatsapp/init/:deviceId',
      'GET /api/whatsapp/qr/:deviceId',
      'GET /api/whatsapp/status/:deviceId',
      'POST /api/whatsapp/send/:deviceId',
      'GET /api/whatsapp/inbox/:deviceId',
      'GET /api/whatsapp/messages/:deviceId/:participant',
      'GET /api/whatsapp/devices',
      'POST /api/whatsapp/disconnect/:deviceId',
      'GET /api/whatsapp/stats/:deviceId'
    ]
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Baileys Client Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api/docs`);
  console.log(`🔗 Initialize device: POST http://localhost:${PORT}/api/whatsapp/init`);
  console.log(`📱 QR Code page: http://localhost:${PORT}/api/whatsapp/qr/{generated-device-id}`);
});
