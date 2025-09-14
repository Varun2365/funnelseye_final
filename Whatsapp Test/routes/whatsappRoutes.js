const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');
const WhatsAppDevice = require('../models/WhatsAppDevice');
const WhatsAppMessage = require('../models/WhatsAppMessage');
const WhatsAppConversation = require('../models/WhatsAppConversation');

// Initialize WhatsApp device
router.post('/init', async (req, res) => {
  try {
    // Generate a unique device ID
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await whatsappService.initializeDevice(deviceId);
    
    res.json({
      success: true,
      message: 'Device initialization started',
      deviceId,
      qrUrl: `/api/whatsapp/qr/${deviceId}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to initialize device',
      error: error.message
    });
  }
});

// Get QR code page
router.get('/qr/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const device = await WhatsAppDevice.findOne({ deviceId });
    
    if (!device) {
      return res.status(404).send('Device not found');
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WhatsApp QR Code - ${deviceId}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #2c3e50;
          }
          
          .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            padding: 40px;
            max-width: 800px;
            width: 90%;
            text-align: center;
          }
          
          .header {
            margin-bottom: 30px;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 8px;
          }
          
          .header p {
            color: #7f8c8d;
            font-size: 16px;
          }
          
          .qr-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 40px;
            margin: 40px 0;
          }
          
          .qr-code {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .qr-code img {
            max-width: 200px;
            height: auto;
          }
          
          .instructions {
            flex: 1;
            text-align: left;
          }
          
          .instructions h3 {
            font-size: 20px;
            margin-bottom: 16px;
            color: #2c3e50;
          }
          
          .instructions ol {
            padding-left: 20px;
            line-height: 1.8;
            color: #5a6c7d;
          }
          
          .instructions li {
            margin-bottom: 8px;
          }
          
          .status {
            margin-top: 30px;
            padding: 16px;
            border-radius: 8px;
            font-weight: 500;
          }
          
          .status.connecting {
            background: #e3f2fd;
            color: #1976d2;
            border: 1px solid #bbdefb;
          }
          
          .status.connected {
            background: #e8f5e8;
            color: #2e7d32;
            border: 1px solid #c8e6c9;
          }
          
          .status.qr-required {
            background: #fff3e0;
            color: #f57c00;
            border: 1px solid #ffcc02;
          }
          
          .status.disconnected {
            background: #ffebee;
            color: #c62828;
            border: 1px solid #ffcdd2;
          }
          
          .device-info {
            margin-top: 20px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 14px;
            color: #6c757d;
          }
          
          @media (max-width: 768px) {
            .qr-container {
              flex-direction: column;
              gap: 20px;
            }
            
            .instructions {
              text-align: center;
            }
            
            .container {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>WhatsApp Connection</h1>
            <p>Scan the QR code with your WhatsApp mobile app</p>
          </div>
          
          <div class="qr-container">
            <div class="qr-code">
              ${device.qrCode ? `<img src="${device.qrCode}" alt="QR Code">` : '<div style="width: 200px; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999;">No QR Code Available</div>'}
            </div>
            
            <div class="instructions">
              <h3>How to connect:</h3>
              <ol>
                <li>Open WhatsApp on your mobile device</li>
                <li>Tap the three dots menu (Android) or Settings (iOS)</li>
                <li>Select "Linked Devices" or "WhatsApp Web"</li>
                <li>Tap "Link a Device"</li>
                <li>Scan this QR code with your camera</li>
              </ol>
            </div>
          </div>
          
          <div class="status ${device.status}">
            Status: ${device.status.charAt(0).toUpperCase() + device.status.slice(1).replace('_', ' ')}
          </div>
          
          <div class="device-info">
            Device ID: ${deviceId}<br>
            Last Updated: ${new Date(device.updatedAt).toLocaleString()}
          </div>
        </div>
        
        <script>
          // Auto-refresh every 3 seconds to check for status updates
          setInterval(async () => {
            try {
              const response = await fetch('/api/whatsapp/status/${deviceId}');
              const data = await response.json();
              
              if (data.success) {
                const statusElement = document.querySelector('.status');
                const qrCodeElement = document.querySelector('.qr-code');
                
                statusElement.className = 'status ' + data.device.status;
                statusElement.textContent = 'Status: ' + data.device.status.charAt(0).toUpperCase() + data.device.status.slice(1).replace('_', ' ');
                
                if (data.device.qrCode) {
                  qrCodeElement.innerHTML = '<img src="' + data.device.qrCode + '" alt="QR Code">';
                } else if (data.device.status === 'connected') {
                  qrCodeElement.innerHTML = '<div style="width: 200px; height: 200px; background: #e8f5e8; display: flex; align-items: center; justify-content: center; color: #2e7d32; font-weight: 500;">Connected!</div>';
                }
              }
            } catch (error) {
              console.error('Error checking status:', error);
            }
          }, 3000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Error loading QR page');
  }
});

// Get device status
router.get('/status/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const device = await whatsappService.getDeviceStatus(deviceId);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      device
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get device status',
      error: error.message
    });
  }
});

// Send message
router.post('/send/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { to, message, type = 'text' } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, message'
      });
    }

    const result = await whatsappService.sendMessage(deviceId, to, message, type);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Get inbox (conversations)
router.get('/inbox/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const conversations = await whatsappService.getInbox(deviceId, parseInt(limit), parseInt(offset));
    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get inbox',
      error: error.message
    });
  }
});

// Get messages for a specific conversation
router.get('/messages/:deviceId/:participant', async (req, res) => {
  try {
    const { deviceId, participant } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await whatsappService.getMessages(deviceId, participant, parseInt(limit), parseInt(offset));
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
});

// Get all devices
router.get('/devices', async (req, res) => {
  try {
    const devices = await WhatsAppDevice.find().sort({ updatedAt: -1 });
    res.json({
      success: true,
      devices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get devices',
      error: error.message
    });
  }
});

// Disconnect device
router.post('/disconnect/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const result = await whatsappService.disconnectDevice(deviceId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect device',
      error: error.message
    });
  }
});

// Get message statistics
router.get('/stats/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const totalMessages = await WhatsAppMessage.countDocuments({ deviceId });
    const totalConversations = await WhatsAppConversation.countDocuments({ deviceId });
    const unreadMessages = await WhatsAppConversation.aggregate([
      { $match: { deviceId } },
      { $group: { _id: null, total: { $sum: '$unreadCount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalMessages,
        totalConversations,
        unreadMessages: unreadMessages[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

module.exports = router;
