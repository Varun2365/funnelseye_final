const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const logger = require('../../utils/logger');

// Import schemas
const WhatsAppDevice = require('../schemas/WhatsAppDevice');
const WhatsAppMessage = require('../schemas/WhatsAppMessage');
const WhatsAppConversation = require('../schemas/WhatsAppConversation');

class NewBaileysWhatsAppService {
    constructor() {
        this.sockets = new Map();
        this.deviceStates = new Map();
        this.qrCodes = new Map();
        this.connectionStates = new Map();
        
        // Set up global error handling to prevent server crashes
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        // Handle uncaught exceptions in this service
        process.on('uncaughtException', (error) => {
            if (error.message && error.message.includes('Baileys')) {
                logger.error('[NewBaileysWhatsAppService] Uncaught Baileys exception:', error);
                // Don't exit process - just log and continue
            }
        });

        process.on('unhandledRejection', (reason, promise) => {
            if (reason && reason.message && reason.message.includes('Baileys')) {
                logger.error('[NewBaileysWhatsAppService] Unhandled Baileys rejection:', reason);
                // Don't exit process - just log and continue
            }
        });
    }

    async initializeDevice(deviceId, coachId) {
        try {
            logger.info(`[NewBaileysWhatsAppService] Initializing device ${deviceId} for coach ${coachId}`);
            
            // Check if device already exists in our system (using _id instead of deviceId field)
            let device = await WhatsAppDevice.findById(deviceId);
            
            if (!device) {
                // Create new device record
                device = new WhatsAppDevice({
                    _id: deviceId,
                    coachId,
                    deviceName: `Baileys Device ${deviceId}`,
                    deviceType: 'baileys',
                    phoneNumber: `pending_${deviceId}`,
                    isConnected: false,
                    isActive: true,
                    isDefault: false
                });
                await device.save();
                logger.info(`[NewBaileysWhatsAppService] Created new device record for ${deviceId}`);
            } else {
                logger.info(`[NewBaileysWhatsAppService] Found existing device record for ${deviceId}`);
            }

            // Create auth directory for this device
            const authDir = path.join(__dirname, '../../baileys_auth', `session_${deviceId}`);
            if (!fs.existsSync(authDir)) {
                fs.mkdirSync(authDir, { recursive: true });
                logger.info(`[NewBaileysWhatsAppService] Created auth directory: ${authDir}`);
            }

            // Use multi-file auth state
            const { state, saveCreds } = await useMultiFileAuthState(authDir);
            logger.info(`[NewBaileysWhatsAppService] Auth state loaded for device ${deviceId}`);

            // Create socket with simple configuration (matching working version)
            let socket;
            try {
                socket = makeWASocket({
                    auth: state,
                    printQRInTerminal: false,
                    browser: ['WhatsApp Client', 'Chrome', '1.0.0']
                });
                logger.info(`[NewBaileysWhatsAppService] Socket created successfully for device ${deviceId}`);
            } catch (socketError) {
                logger.error(`[NewBaileysWhatsAppService] Error creating socket for device ${deviceId}:`, socketError);
                throw new Error(`Failed to create WhatsApp socket: ${socketError.message}`);
            }

            // Store socket and device state
            this.sockets.set(deviceId, socket);
            this.deviceStates.set(deviceId, { device, saveCreds, authDir });
            this.connectionStates.set(deviceId, 'initializing');

            // Update device status
            device.isConnected = false;
            await device.save();

            // Set up event handlers (simplified like working version)
            socket.ev.on('connection.update', async (update) => {
                try {
                    await this.handleConnectionUpdate(deviceId, update);
                } catch (error) {
                    logger.error(`[NewBaileysWhatsAppService] Error in connection.update handler for device ${deviceId}:`, error);
                }
            });

            socket.ev.on('creds.update', (creds) => {
                try {
                    saveCreds(creds);
                    logger.info(`[NewBaileysWhatsAppService] Credentials updated for device ${deviceId}`);
                } catch (error) {
                    logger.error(`[NewBaileysWhatsAppService] Error saving credentials for device ${deviceId}:`, error);
                }
            });

            socket.ev.on('messages.upsert', async (m) => {
                try {
                    await this.handleIncomingMessages(deviceId, m);
                } catch (error) {
                    logger.error(`[NewBaileysWhatsAppService] Error in messages.upsert handler for device ${deviceId}:`, error);
                }
            });

            socket.ev.on('messages.update', async (updates) => {
                try {
                    await this.handleMessageUpdates(deviceId, updates);
                } catch (error) {
                    logger.error(`[NewBaileysWhatsAppService] Error in messages.update handler for device ${deviceId}:`, error);
                }
            });

            socket.ev.on('error', (error) => {
                logger.error(`[NewBaileysWhatsAppService] Socket error for device ${deviceId}:`, error);
            });

            logger.info(`[NewBaileysWhatsAppService] Device ${deviceId} initialized successfully`);

            return {
                success: true,
                message: 'Device initialized successfully',
                deviceId,
                sessionId: `session_${deviceId}`
            };

        } catch (error) {
            logger.error(`[NewBaileysWhatsAppService] Error initializing device ${deviceId}:`, error);
            // Clean up on error
            this.cleanupDevice(deviceId);
            throw error;
        }
    }


    async handleConnectionUpdate(deviceId, update) {
        const deviceState = this.deviceStates.get(deviceId);
        if (!deviceState) {
            logger.warn(`[NewBaileysWhatsAppService] No device state found for ${deviceId}`);
            return;
        }

        const { device } = deviceState;
        const { connection, lastDisconnect, qr } = update;

        logger.info(`[NewBaileysWhatsAppService] Connection update for device ${deviceId}:`, {
            connection,
            hasQR: !!qr,
            lastDisconnect: lastDisconnect ? { error: lastDisconnect.error?.message } : null
        });

        // Additional console logging for debugging
        console.log(`[NewBaileysWhatsAppService] Connection update for device ${deviceId}:`, {
            connection,
            hasQR: !!qr,
            lastDisconnect: lastDisconnect ? { error: lastDisconnect.error?.message } : null
        });

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error instanceof Boom &&
                lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;

            device.isConnected = false;
            device.qrCode = null;
            await device.save();

            this.connectionStates.set(deviceId, 'disconnected');

            if (shouldReconnect) {
                logger.info(`[NewBaileysWhatsAppService] Reconnecting device ${deviceId} in 5 seconds...`);
                // Use setTimeout with proper error handling to prevent server crashes
                setTimeout(() => {
                    try {
                        this.initializeDevice(deviceId, device.coachId);
                    } catch (error) {
                        logger.error(`[NewBaileysWhatsAppService] Error during reconnection for device ${deviceId}:`, error);
                    }
                }, 5000);
            } else {
                logger.info(`[NewBaileysWhatsAppService] Device ${deviceId} logged out, cleaning up`);
                this.cleanupDevice(deviceId);
            }
        } else if (connection === 'open') {
            device.isConnected = true;
            device.qrCode = null;
            device.lastConnected = new Date();
            
            // Get phone number from socket
            const socket = this.sockets.get(deviceId);
            if (socket && socket.user) {
                device.phoneNumber = socket.user.id.split(':')[0];
                device.sessionId = `session_${deviceId}`;
            }
            
            await device.save();
            this.connectionStates.set(deviceId, 'connected');
            logger.info(`[NewBaileysWhatsAppService] Device ${deviceId} connected! Phone: ${device.phoneNumber}`);
        } else if (qr) {
            device.isConnected = false;
            try {
                const qrCodeDataUrl = await QRCode.toDataURL(qr);
                device.qrCode = qrCodeDataUrl;
                await device.save();
                
                // Store QR code in memory for quick access
                this.qrCodes.set(deviceId, {
                    qr: qrCodeDataUrl,
                    timestamp: Date.now(),
                    expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
                });
                
                this.connectionStates.set(deviceId, 'qr_ready');
                logger.info(`[NewBaileysWhatsAppService] QR code generated for device ${deviceId}`);
                console.log(`[NewBaileysWhatsAppService] QR code generated for device ${deviceId}`); // Additional console log
            } catch (error) {
                logger.error(`[NewBaileysWhatsAppService] Error generating QR code for device ${deviceId}:`, error);
                console.error(`[NewBaileysWhatsAppService] Error generating QR code for device ${deviceId}:`, error); // Additional console log
            }
        }
    }

    async handleIncomingMessages(deviceId, m) {
        try {
            for (const message of m.messages) {
                if (message.key.fromMe) continue; // Skip outgoing messages

                const messageData = {
                    coachId: this.deviceStates.get(deviceId)?.device.coachId,
                    deviceId,
                    direction: 'inbound',
                    messageType: this.getMessageType(message),
                    from: message.key.remoteJid,
                    to: message.key.participant || message.key.remoteJid,
                    content: this.extractMessageContent(message),
                    messageId: message.key.id,
                    conversationId: message.key.remoteJid,
                    status: 'delivered',
                    statusTimestamp: new Date()
                };

                // Save message to database
                const savedMessage = await WhatsAppMessage.create(messageData);

                // Update conversation
                await this.updateConversation(deviceId, message.key.remoteJid, savedMessage._id);

                logger.info(`[NewBaileysWhatsAppService] Incoming message saved for device ${deviceId}: ${messageData.messageId}`);
            }
        } catch (error) {
            logger.error(`[NewBaileysWhatsAppService] Error handling incoming messages for device ${deviceId}:`, error);
        }
    }

    async handleMessageUpdates(deviceId, updates) {
        try {
            for (const update of updates) {
                await WhatsAppMessage.findOneAndUpdate(
                    { messageId: update.key.id, deviceId },
                    { 
                        status: this.getStatusFromUpdate(update),
                        statusTimestamp: new Date()
                    }
                );
            }
        } catch (error) {
            logger.error(`[NewBaileysWhatsAppService] Error handling message updates for device ${deviceId}:`, error);
        }
    }

    getMessageType(message) {
        if (message.message?.conversation) return 'text';
        if (message.message?.imageMessage) return 'image';
        if (message.message?.videoMessage) return 'video';
        if (message.message?.audioMessage) return 'audio';
        if (message.message?.documentMessage) return 'document';
        if (message.message?.locationMessage) return 'location';
        if (message.message?.contactMessage) return 'contact';
        if (message.message?.stickerMessage) return 'sticker';
        if (message.message?.templateMessage) return 'template';
        return 'text';
    }

    extractMessageContent(message) {
        const content = {};

        if (message.message?.conversation) {
            content.text = message.message.conversation;
        } else if (message.message?.extendedTextMessage) {
            content.text = message.message.extendedTextMessage.text;
        } else if (message.message?.imageMessage) {
            content.media = {
                url: message.message.imageMessage.url,
                mimeType: message.message.imageMessage.mimetype,
                fileName: message.message.imageMessage.fileName,
                fileSize: message.message.imageMessage.fileLength
            };
            content.text = message.message.imageMessage.caption || '';
        } else if (message.message?.videoMessage) {
            content.media = {
                url: message.message.videoMessage.url,
                mimeType: message.message.videoMessage.mimetype,
                fileName: message.message.videoMessage.fileName,
                fileSize: message.message.videoMessage.fileLength
            };
            content.text = message.message.videoMessage.caption || '';
        } else if (message.message?.audioMessage) {
            content.media = {
                url: message.message.audioMessage.url,
                mimeType: message.message.audioMessage.mimetype,
                fileName: message.message.audioMessage.fileName,
                fileSize: message.message.audioMessage.fileLength
            };
        } else if (message.message?.documentMessage) {
            content.media = {
                url: message.message.documentMessage.url,
                mimeType: message.message.documentMessage.mimetype,
                fileName: message.message.documentMessage.fileName,
                fileSize: message.message.documentMessage.fileLength
            };
            content.text = message.message.documentMessage.caption || '';
        } else if (message.message?.locationMessage) {
            content.location = {
                latitude: message.message.locationMessage.degreesLatitude,
                longitude: message.message.locationMessage.degreesLongitude,
                name: message.message.locationMessage.name,
                address: message.message.locationMessage.address
            };
        } else if (message.message?.contactMessage) {
            content.contact = {
                name: message.message.contactMessage.displayName,
                phoneNumber: message.message.contactMessage.vcard
            };
        }

        return content;
    }

    getStatusFromUpdate(update) {
        if (update.status === 'read') return 'read';
        if (update.status === 'delivered') return 'delivered';
        if (update.status === 'sent') return 'sent';
        return 'pending';
    }

    async updateConversation(deviceId, participant, lastMessageId) {
        try {
            const deviceState = this.deviceStates.get(deviceId);
            if (!deviceState) return;

            const conversation = await WhatsAppConversation.findOneAndUpdate(
                { 
                    deviceId,
                    conversationId: participant 
                },
                {
                    $set: {
                        lastMessageAt: new Date(),
                        lastMessageContent: 'Message received',
                        lastMessageDirection: 'inbound',
                        unreadCount: 1
                    },
                    $inc: { totalMessages: 1 }
                },
                { 
                    upsert: true,
                    new: true 
                }
            );

            return conversation;
        } catch (error) {
            logger.error(`[NewBaileysWhatsAppService] Error updating conversation for device ${deviceId}:`, error);
        }
    }

    async sendMessage(deviceId, messageData) {
        try {
            logger.info(`[NewBaileysWhatsAppService] Attempting to send message from device: ${deviceId}`);
            
            const socket = this.sockets.get(deviceId);
            if (!socket) {
                logger.warn(`[NewBaileysWhatsAppService] Socket not found for device: ${deviceId}`);
                throw new Error('Device not connected');
            }

            // Check if socket is actually connected
            if (!socket.user) {
                logger.warn(`[NewBaileysWhatsAppService] Socket user not found for device: ${deviceId}`);
                throw new Error('Device not authenticated');
            }

            // Check device status
            const device = await WhatsAppDevice.findOne({ deviceId });
            if (!device || !device.isConnected) {
                logger.warn(`[NewBaileysWhatsAppService] Device not connected: ${device?.isConnected || false}`);
                throw new Error('Device not connected');
            }

            const { to, message, type = 'text', mediaUrl, caption } = messageData;
            let messageId;

            logger.info(`[NewBaileysWhatsAppService] Sending ${type} message to: ${to}`);

            if (type === 'text') {
                messageId = await socket.sendMessage(to, { text: message });
            } else if (type === 'image' && mediaUrl) {
                messageId = await socket.sendMessage(to, {
                    image: { url: mediaUrl },
                    caption: caption || ''
                });
            } else if (type === 'video' && mediaUrl) {
                messageId = await socket.sendMessage(to, {
                    video: { url: mediaUrl },
                    caption: caption || ''
                });
            } else if (type === 'document' && mediaUrl) {
                messageId = await socket.sendMessage(to, {
                    document: { url: mediaUrl },
                    caption: caption || ''
                });
            } else {
                // Default to text message
                messageId = await socket.sendMessage(to, { text: message });
            }

            // Save outgoing message
            await this.saveOutgoingMessage(deviceId, to, { text: message, media: mediaUrl ? { url: mediaUrl } : null }, messageId);

            return {
                success: true,
                messageId,
                message,
                status: 'sent'
            };

        } catch (error) {
            logger.error(`[NewBaileysWhatsAppService] Error sending message from device ${deviceId}:`, error);
            return {
                success: false,
                error: error.message,
                status: 'failed'
            };
        }
    }

    async saveOutgoingMessage(deviceId, to, content, messageId) {
        try {
            const deviceState = this.deviceStates.get(deviceId);
            if (!deviceState) return;

            const messageData = {
                coachId: deviceState.device.coachId,
                deviceId,
                direction: 'outbound',
                messageType: content.text ? 'text' : 'media',
                from: this.sockets.get(deviceId).user.id,
                to,
                content,
                messageId,
                conversationId: to,
                status: 'sent',
                statusTimestamp: new Date()
            };

            await WhatsAppMessage.create(messageData);
            await this.updateConversation(deviceId, to, messageId);

        } catch (error) {
            logger.error(`[NewBaileysWhatsAppService] Error saving outgoing message for device ${deviceId}:`, error);
        }
    }

    getQRCode(deviceId) {
        const qrData = this.qrCodes.get(deviceId);
        
        if (!qrData) {
            logger.info(`[NewBaileysWhatsAppService] No QR data found for device ${deviceId}`);
            return null;
        }

        // Check if QR code is expired
        if (Date.now() > qrData.expiresAt) {
            this.qrCodes.delete(deviceId);
            logger.info(`[NewBaileysWhatsAppService] QR code expired for device ${deviceId}`);
            return null;
        }

        return qrData;
    }

    getConnectionStatus(deviceId) {
        return this.connectionStates.get(deviceId) || 'disconnected';
    }

    async getDeviceStatus(deviceId) {
        try {
            const device = await WhatsAppDevice.findOne({ deviceId });
            return device;
        } catch (error) {
            logger.error(`[NewBaileysWhatsAppService] Error getting device status for ${deviceId}:`, error);
            return null;
        }
    }

    async disconnectDevice(deviceId) {
        try {
            logger.info(`[NewBaileysWhatsAppService] Disconnecting device ${deviceId}`);
            
            const socket = this.sockets.get(deviceId);
            if (socket) {
                try {
                    // Use timeout to prevent hanging
                    await Promise.race([
                        socket.logout(),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Logout timeout')), 10000)
                        )
                    ]);
                } catch (logoutError) {
                    logger.warn(`[NewBaileysWhatsAppService] Error during logout for device ${deviceId}:`, logoutError);
                    // Continue with cleanup even if logout fails
                }
                
                this.sockets.delete(deviceId);
                this.deviceStates.delete(deviceId);
                this.qrCodes.delete(deviceId);
                this.connectionStates.delete(deviceId);
            }

            const device = await WhatsAppDevice.findById(deviceId);
            if (device) {
                device.isConnected = false;
                device.qrCode = null;
                await device.save();
            }

            logger.info(`[NewBaileysWhatsAppService] Device ${deviceId} disconnected successfully`);
            return { success: true };
        } catch (error) {
            logger.error(`[NewBaileysWhatsAppService] Error disconnecting device ${deviceId}:`, error);
            // Don't throw error - just log and return success to prevent server crashes
            return { success: true, message: 'Device disconnected (with warnings)' };
        }
    }

    cleanupDevice(deviceId) {
        try {
            logger.info(`[NewBaileysWhatsAppService] Cleaning up device ${deviceId}`);
            
            // Remove from all maps
            this.sockets.delete(deviceId);
            this.deviceStates.delete(deviceId);
            this.qrCodes.delete(deviceId);
            this.connectionStates.delete(deviceId);
            
            logger.info(`[NewBaileysWhatsAppService] Device ${deviceId} cleaned up successfully`);
        } catch (error) {
            logger.error(`[NewBaileysWhatsAppService] Error cleaning up device ${deviceId}:`, error);
        }
    }

    async forceQRGeneration(deviceId) {
        try {
            logger.info(`[NewBaileysWhatsAppService] Forcing QR generation for device ${deviceId}`);
            console.log(`[NewBaileysWhatsAppService] Forcing QR generation for device ${deviceId}`);
            
            const deviceState = this.deviceStates.get(deviceId);
            
            if (deviceState) {
                // Disconnect current session
                const socket = this.sockets.get(deviceId);
                if (socket) {
                    try {
                        await socket.logout();
                    } catch (logoutError) {
                        logger.warn(`[NewBaileysWhatsAppService] Error during logout:`, logoutError.message);
                    }
                }

                // Clean up auth directory
                if (deviceState.authDir && fs.existsSync(deviceState.authDir)) {
                    fs.rmSync(deviceState.authDir, { recursive: true, force: true });
                    logger.info(`[NewBaileysWhatsAppService] Removed auth directory: ${deviceState.authDir}`);
                }

                // Clean up device state
                this.cleanupDevice(deviceId);
            }

            // Reinitialize device
            const device = await WhatsAppDevice.findOne({ deviceId });
            if (device) {
                const result = await this.initializeDevice(deviceId, device.coachId);
                logger.info(`[NewBaileysWhatsAppService] QR generation forced for device ${deviceId}`);
                return result;
            } else {
                throw new Error('Device not found');
            }

        } catch (error) {
            logger.error(`[NewBaileysWhatsAppService] Error forcing QR generation for device ${deviceId}:`, error);
            throw error;
        }
    }

    cleanupDevice(deviceId) {
        this.sockets.delete(deviceId);
        this.deviceStates.delete(deviceId);
        this.qrCodes.delete(deviceId);
        this.connectionStates.delete(deviceId);
        logger.info(`[NewBaileysWhatsAppService] Cleaned up device ${deviceId}`);
    }

    // Get all active devices for a coach
    async getCoachDevices(coachId) {
        try {
            const devices = await WhatsAppDevice.find({ coachId, deviceType: 'baileys' });
            return devices.map(device => ({
                deviceId: device.deviceId,
                deviceName: device.deviceName,
                phoneNumber: device.phoneNumber,
                isConnected: device.isConnected,
                lastConnected: device.lastConnected,
                status: this.getConnectionStatus(device.deviceId)
            }));
        } catch (error) {
            logger.error(`[NewBaileysWhatsAppService] Error getting coach devices for ${coachId}:`, error);
            return [];
        }
    }
}

module.exports = new NewBaileysWhatsAppService();
