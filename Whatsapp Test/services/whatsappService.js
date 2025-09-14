// const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
// const { Boom } = require('@hapi/boom');
// const fs = require('fs');
// const path = require('path');
// const QRCode = require('qrcode');
// const WhatsAppDevice = require('../models/WhatsAppDevice');
// const WhatsAppMessage = require('../models/WhatsAppMessage');
// const WhatsAppConversation = require('../models/WhatsAppConversation');

// class WhatsAppService {
//   constructor() {
//     this.sockets = new Map();
//     this.deviceStates = new Map();
//   }

//   async initializeDevice(deviceId) {
//     try {
//       // Check if device already exists
//       let device = await WhatsAppDevice.findOne({ deviceId });
      
//       if (!device) {
//         device = new WhatsAppDevice({
//           deviceId,
//           phoneNumber: '',
//           name: `Device ${deviceId}`,
//           status: 'connecting'
//         });
//         await device.save();
//       }

//       // Create auth directory for this device
//       const authDir = path.join(__dirname, '..', 'auth', deviceId);
//       if (!fs.existsSync(authDir)) {
//         fs.mkdirSync(authDir, { recursive: true });
//       }

//       // Use multi-file auth state
//       const { state, saveCreds } = await useMultiFileAuthState(authDir);

//       // Create socket
//       const socket = makeWASocket({
//         auth: state,
//         printQRInTerminal: false,
//         browser: ['WhatsApp Client', 'Chrome', '1.0.0']
//       });

//       // Store socket and device state
//       this.sockets.set(deviceId, socket);
//       this.deviceStates.set(deviceId, { device, saveCreds });

//       // Handle connection updates
//       socket.ev.on('connection.update', async (update) => {
//         await this.handleConnectionUpdate(deviceId, update);
//       });

//       // Handle credentials update
//       socket.ev.on('creds.update', saveCreds);

//       // Handle incoming messages
//       socket.ev.on('messages.upsert', async (m) => {
//         await this.handleIncomingMessages(deviceId, m);
//       });

//       // Handle message status updates
//       socket.ev.on('messages.update', async (updates) => {
//         await this.handleMessageUpdates(deviceId, updates);
//       });

//       return { success: true, deviceId };

//     } catch (error) {
//       console.error('Error initializing device:', error);
//       throw error;
//     }
//   }

//   async handleConnectionUpdate(deviceId, update) {
//     const deviceState = this.deviceStates.get(deviceId);
//     if (!deviceState) return;

//     const { device } = deviceState;

//     if (update.connection === 'close') {
//       const shouldReconnect = update.lastDisconnect?.error instanceof Boom &&
//         update.lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;

//       device.status = shouldReconnect ? 'connecting' : 'disconnected';
//       device.qrCode = null;
//       await device.save();

//       if (shouldReconnect) {
//         console.log('Reconnecting device:', deviceId);
//         setTimeout(() => this.initializeDevice(deviceId), 5000);
//       }
//     } else if (update.connection === 'open') {
//       device.status = 'connected';
//       device.qrCode = null;
//       device.lastSeen = new Date();
      
//       // Get phone number from socket
//       const socket = this.sockets.get(deviceId);
//       if (socket && socket.user) {
//         device.phoneNumber = socket.user.id.split(':')[0];
//         device.name = socket.user.name || `Device ${deviceId}`;
//       }
      
//       await device.save();
//       console.log('Device connected:', deviceId, 'Phone:', device.phoneNumber);
//     } else if (update.qr) {
//       device.status = 'qr_required';
//       device.qrCode = await QRCode.toDataURL(update.qr);
//       await device.save();
//       console.log('QR code generated for device:', deviceId);
//     }
//   }

//   async handleIncomingMessages(deviceId, m) {
//     try {
//       for (const message of m.messages) {
//         if (message.key.fromMe) continue; // Skip outgoing messages

//         const messageData = {
//           messageId: message.key.id,
//           deviceId,
//           from: message.key.remoteJid,
//           to: message.key.participant || message.key.remoteJid,
//           type: this.getMessageType(message),
//           content: this.extractMessageContent(message),
//           timestamp: new Date(message.messageTimestamp * 1000),
//           direction: 'inbound',
//           status: 'delivered'
//         };

//         // Save message
//         const savedMessage = new WhatsAppMessage(messageData);
//         await savedMessage.save();

//         // Update conversation
//         await this.updateConversation(deviceId, message.key.remoteJid, savedMessage._id);

//         console.log('Incoming message saved:', messageData.messageId);
//       }
//     } catch (error) {
//       console.error('Error handling incoming messages:', error);
//     }
//   }

//   async handleMessageUpdates(deviceId, updates) {
//     try {
//       for (const update of updates) {
//         await WhatsAppMessage.findOneAndUpdate(
//           { messageId: update.key.id, deviceId },
//           { status: this.getStatusFromUpdate(update) }
//         );
//       }
//     } catch (error) {
//       console.error('Error handling message updates:', error);
//     }
//   }

//   getMessageType(message) {
//     if (message.message?.conversation) return 'text';
//     if (message.message?.imageMessage) return 'image';
//     if (message.message?.videoMessage) return 'video';
//     if (message.message?.audioMessage) return 'audio';
//     if (message.message?.documentMessage) return 'document';
//     if (message.message?.locationMessage) return 'location';
//     if (message.message?.contactMessage) return 'contact';
//     if (message.message?.stickerMessage) return 'sticker';
//     return 'text';
//   }

//   extractMessageContent(message) {
//     const content = {};

//     if (message.message?.conversation) {
//       content.text = message.message.conversation;
//     } else if (message.message?.imageMessage) {
//       content.caption = message.message.imageMessage.caption;
//       content.mediaType = 'image';
//     } else if (message.message?.videoMessage) {
//       content.caption = message.message.videoMessage.caption;
//       content.mediaType = 'video';
//     } else if (message.message?.audioMessage) {
//       content.mediaType = 'audio';
//     } else if (message.message?.documentMessage) {
//       content.caption = message.message.documentMessage.caption;
//       content.mediaType = 'document';
//     } else if (message.message?.locationMessage) {
//       content.location = {
//         latitude: message.message.locationMessage.degreesLatitude,
//         longitude: message.message.locationMessage.degreesLongitude,
//         name: message.message.locationMessage.name,
//         address: message.message.locationMessage.address
//       };
//     } else if (message.message?.contactMessage) {
//       content.contact = {
//         name: message.message.contactMessage.displayName,
//         number: message.message.contactMessage.vcard
//       };
//     }

//     return content;
//   }

//   getStatusFromUpdate(update) {
//     if (update.status === 'read') return 'read';
//     if (update.status === 'delivered') return 'delivered';
//     return 'sent';
//   }

//   async updateConversation(deviceId, participant, lastMessageId) {
//     try {
//       const conversation = await WhatsAppConversation.findOneAndUpdate(
//         { deviceId, participant },
//         {
//           $inc: { unreadCount: 1, messageCount: 1 },
//           lastMessage: lastMessageId,
//           lastMessageTime: new Date()
//         },
//         { upsert: true, new: true }
//       );

//       return conversation;
//     } catch (error) {
//       console.error('Error updating conversation:', error);
//     }
//   }

//   async sendMessage(deviceId, to, message, type = 'text') {
//     try {
//       console.log(`Attempting to send message from device: ${deviceId}`);
      
//       const socket = this.sockets.get(deviceId);
//       if (!socket) {
//         console.log(`Socket not found for device: ${deviceId}`);
//         throw new Error('Device not connected');
//       }

//       // Check if socket is actually connected
//       if (!socket.user) {
//         console.log(`Socket user not found for device: ${deviceId}`);
//         throw new Error('Device not authenticated');
//       }

//       // Double-check device status in database
//       const device = await WhatsAppDevice.findOne({ deviceId });
//       if (!device || device.status !== 'connected') {
//         console.log(`Device status check failed: ${device?.status || 'unknown'}`);
//         throw new Error(`Device status is ${device?.status || 'unknown'}, not connected`);
//       }

//       console.log(`All checks passed, sending message to: ${to}`);

//       let messageContent;
      
//       switch (type) {
//         case 'text':
//           messageContent = { text: message };
//           break;
//         case 'image':
//           messageContent = { image: { url: message }, caption: message.caption };
//           break;
//         case 'video':
//           messageContent = { video: { url: message }, caption: message.caption };
//           break;
//         case 'audio':
//           messageContent = { audio: { url: message } };
//           break;
//         case 'document':
//           messageContent = { document: { url: message }, caption: message.caption };
//           break;
//         default:
//           messageContent = { text: message };
//       }

//       const sentMessage = await socket.sendMessage(to, messageContent);
      
//       // Save outgoing message
//       const messageData = {
//         messageId: sentMessage.key.id,
//         deviceId,
//         from: sentMessage.key.remoteJid,
//         to,
//         type,
//         content: messageContent,
//         timestamp: new Date(),
//         direction: 'outbound',
//         status: 'sent'
//       };

//       const savedMessage = new WhatsAppMessage(messageData);
//       await savedMessage.save();

//       // Update conversation
//       await this.updateConversation(deviceId, to, savedMessage._id);

//       return { success: true, messageId: sentMessage.key.id };

//     } catch (error) {
//       console.error('Error sending message:', error);
//       throw error;
//     }
//   }

//   async getInbox(deviceId, limit = 50, offset = 0) {
//     try {
//       const conversations = await WhatsAppConversation.find({ deviceId })
//         .populate('lastMessage')
//         .sort({ lastMessageTime: -1 })
//         .limit(limit)
//         .skip(offset);

//       return conversations;
//     } catch (error) {
//       console.error('Error getting inbox:', error);
//       throw error;
//     }
//   }

//   async getMessages(deviceId, participant, limit = 50, offset = 0) {
//     try {
//       const conversation = await WhatsAppConversation.findOne({ deviceId, participant });
//       if (!conversation) {
//         return [];
//       }

//       const messages = await WhatsAppMessage.find({ conversationId: conversation._id })
//         .sort({ timestamp: -1 })
//         .limit(limit)
//         .skip(offset);

//       return messages.reverse();
//     } catch (error) {
//       console.error('Error getting messages:', error);
//       throw error;
//     }
//   }

//   async getDeviceStatus(deviceId) {
//     try {
//       const device = await WhatsAppDevice.findOne({ deviceId });
//       return device;
//     } catch (error) {
//       console.error('Error getting device status:', error);
//       throw error;
//     }
//   }

//   async disconnectDevice(deviceId) {
//     try {
//       const socket = this.sockets.get(deviceId);
//       if (socket) {
//         await socket.logout();
//         this.sockets.delete(deviceId);
//         this.deviceStates.delete(deviceId);
//       }

//       const device = await WhatsAppDevice.findOne({ deviceId });
//       if (device) {
//         device.status = 'disconnected';
//         device.qrCode = null;
//         await device.save();
//       }

//       return { success: true };
//     } catch (error) {
//       console.error('Error disconnecting device:', error);
//       throw error;
//     }
//   }
// }

// module.exports = new WhatsAppService();
