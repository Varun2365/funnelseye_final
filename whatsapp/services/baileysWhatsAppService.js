const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const logger = require('../../utils/logger');

// Create a proper logger for Baileys
const createBaileysLogger = () => {
    return {
        level: 'silent',
        child: () => createBaileysLogger(),
        trace: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        fatal: () => {},
        // Additional properties that Baileys might expect
        isLevelEnabled: () => false,
        isTraceEnabled: () => false,
        isDebugEnabled: () => false,
        isInfoEnabled: () => false,
        isWarnEnabled: () => false,
        isErrorEnabled: () => false,
        isFatalEnabled: () => false
    };
};

class BaileysWhatsAppService {
    constructor() {
        this.sessions = new Map();
        this.qrCodes = new Map();
        this.connectionStates = new Map();
        this.reconnectionAttempts = new Map();
    }

    async initializeSession(deviceId, sessionId) {
        try {
            const sessionDir = path.join(__dirname, '../../baileys_auth', sessionId);
            
            // Create session directory if it doesn't exist
            if (!fs.existsSync(sessionDir)) {
                fs.mkdirSync(sessionDir, { recursive: true });
            }

            const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
            const { version } = await fetchLatestBaileysVersion();

            const sock = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false,
                logger: createBaileysLogger()
            });

            // Store session info
            this.sessions.set(deviceId, {
                sock,
                saveCreds,
                sessionId,
                sessionDir
            });

            // Set up event handlers
            this.setupEventHandlers(deviceId, sock, saveCreds);

            return {
                success: true,
                message: 'Session initialized successfully',
                deviceId
            };

        } catch (error) {
            logger.error(`[BaileysWhatsAppService] Error initializing session for device ${deviceId}:`, error);
            throw error;
        }
    }

    setupEventHandlers(deviceId, sock, saveCreds) {
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                // Generate QR code
                try {
                    const qrCodeDataUrl = await qrcode.toDataURL(qr);
                    this.qrCodes.set(deviceId, {
                        qr: qrCodeDataUrl,
                        timestamp: Date.now(),
                        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
                    });
                    
                    this.connectionStates.set(deviceId, 'qr_ready');
                    logger.info(`[BaileysWhatsAppService] QR code generated for device ${deviceId}`);
                } catch (error) {
                    logger.error(`[BaileysWhatsAppService] Error generating QR code for device ${deviceId}:`, error);
                }
            }

            if (connection) {
                const previousState = this.connectionStates.get(deviceId);
                this.connectionStates.set(deviceId, connection);
                
                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                    
                    if (shouldReconnect && previousState !== 'close') {
                        // Check if we're not already reconnecting
                        const isReconnecting = this.connectionStates.get(deviceId) === 'reconnecting';
                        if (!isReconnecting) {
                            this.connectionStates.set(deviceId, 'reconnecting');
                            logger.info(`[BaileysWhatsAppService] Reconnecting device ${deviceId}...`);
                            await this.reconnectSession(deviceId);
                        }
                    } else if (!shouldReconnect) {
                        logger.info(`[BaileysWhatsAppService] Device ${deviceId} logged out`);
                        this.cleanupSession(deviceId);
                    }
                } else if (connection === 'open') {
                    logger.info(`[BaileysWhatsAppService] Device ${deviceId} connected successfully`);
                    // Clear QR code once connected
                    this.qrCodes.delete(deviceId);
                    // Reset reconnection attempts on successful connection
                    this.reconnectionAttempts.delete(deviceId);
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('messages.upsert', async (m) => {
            const { messages } = m;
            
            for (const message of messages) {
                if (message.key.fromMe) continue; // Skip own messages
                
                try {
                    await this.handleIncomingMessage(deviceId, message);
                } catch (error) {
                    logger.error(`[BaileysWhatsAppService] Error handling incoming message for device ${deviceId}:`, error);
                }
            }
        });

        sock.ev.on('messages.update', async (m) => {
            const { messages } = m;
            
            for (const message of messages) {
                try {
                    await this.handleMessageUpdate(deviceId, message);
                } catch (error) {
                    logger.error(`[BaileysWhatsAppService] Error handling message update for device ${deviceId}:`, error);
                }
            }
        });
    }

    async handleIncomingMessage(deviceId, message) {
        const { WhatsAppMessage, WhatsAppConversation } = require('../schemas');
        
        try {
            const session = this.sessions.get(deviceId);
            if (!session) return;

            const messageData = {
                deviceId,
                direction: 'inbound',
                messageType: this.getMessageType(message),
                from: message.key.remoteJid,
                to: session.sock.user.id,
                content: this.extractMessageContent(message),
                messageId: message.key.id,
                conversationId: message.key.remoteJid,
                status: 'delivered',
                statusTimestamp: new Date()
            };

            // Save message to database
            const savedMessage = await WhatsAppMessage.create(messageData);

            // Update or create conversation
            await this.updateConversation(deviceId, messageData);

            logger.info(`[BaileysWhatsAppService] Incoming message saved for device ${deviceId}`);

            // Emit event for automation rules
            const eventEmitter = require('../../utils/eventEmitter');
            if (eventEmitter) {
                eventEmitter.emit('whatsapp_message_received', {
                    deviceId,
                    messageId: savedMessage._id,
                    from: messageData.from,
                    content: messageData.content,
                    timestamp: new Date()
                });
            }

        } catch (error) {
            logger.error(`[BaileysWhatsAppService] Error handling incoming message:`, error);
        }
    }

    async handleMessageUpdate(deviceId, message) {
        const { WhatsAppMessage } = require('../schemas');
        
        try {
            const update = {
                status: this.getStatusFromUpdate(message),
                statusTimestamp: new Date()
            };

            await WhatsAppMessage.findOneAndUpdate(
                { messageId: message.key.id },
                update
            );

        } catch (error) {
            logger.error(`[BaileysWhatsAppService] Error handling message update:`, error);
        }
    }

    async updateConversation(deviceId, messageData) {
        const { WhatsAppConversation } = require('../schemas');
        
        try {
            const conversation = await WhatsAppConversation.findOneAndUpdate(
                { 
                    deviceId,
                    conversationId: messageData.conversationId 
                },
                {
                    $set: {
                        lastMessageAt: new Date(),
                        lastMessageContent: messageData.content.text || 'Media message',
                        lastMessageDirection: messageData.direction,
                        unreadCount: messageData.direction === 'inbound' ? 1 : 0
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
            logger.error(`[BaileysWhatsAppService] Error updating conversation:`, error);
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
        } else if (message.message?.videoMessage) {
            content.media = {
                url: message.message.videoMessage.url,
                mimeType: message.message.videoMessage.mimetype,
                fileName: message.message.videoMessage.fileName,
                fileSize: message.message.videoMessage.fileLength
            };
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

    getStatusFromUpdate(message) {
        if (message.update.status === 'PENDING') return 'pending';
        if (message.update.status === 'SENT') return 'sent';
        if (message.update.status === 'DELIVERED') return 'delivered';
        if (message.update.status === 'READ') return 'read';
        return 'pending';
    }

    async sendMessage(deviceId, to, content, options = {}) {
        try {
            const session = this.sessions.get(deviceId);
            if (!session) {
                throw new Error('Session not found');
            }

            if (this.connectionStates.get(deviceId) !== 'open') {
                throw new Error('WhatsApp not connected');
            }

            const { sock } = session;
            let messageId;

            if (content.text) {
                messageId = await sock.sendMessage(to, { text: content.text });
            } else if (content.media) {
                const mediaMessage = await this.prepareMediaMessage(content.media);
                messageId = await sock.sendMessage(to, mediaMessage);
            } else if (content.template) {
                messageId = await sock.sendMessage(to, {
                    template: {
                        text: content.template.name,
                        components: content.template.components
                    }
                });
            }

            // Save message to database
            await this.saveOutgoingMessage(deviceId, to, content, messageId);

            return {
                success: true,
                messageId,
                status: 'sent'
            };

        } catch (error) {
            logger.error(`[BaileysWhatsAppService] Error sending message:`, error);
            throw error;
        }
    }

    async prepareMediaMessage(media) {
        // This would need to be implemented based on the media type
        // For now, returning a basic structure
        return {
            image: { url: media.url },
            caption: media.caption || ''
        };
    }

    async saveOutgoingMessage(deviceId, to, content, messageId) {
        const { WhatsAppMessage, WhatsAppConversation } = require('../schemas');
        
        try {
            const session = this.sessions.get(deviceId);
            if (!session) return;

            const messageData = {
                deviceId,
                direction: 'outbound',
                messageType: content.text ? 'text' : 'media',
                from: session.sock.user.id,
                to,
                content,
                messageId,
                conversationId: to,
                status: 'sent',
                statusTimestamp: new Date()
            };

            await WhatsAppMessage.create(messageData);
            await this.updateConversation(deviceId, messageData);

        } catch (error) {
            logger.error(`[BaileysWhatsAppService] Error saving outgoing message:`, error);
        }
    }

    getQRCode(deviceId) {
        const qrData = this.qrCodes.get(deviceId);
        if (!qrData) return null;

        // Check if QR code is expired
        if (Date.now() > qrData.expiresAt) {
            this.qrCodes.delete(deviceId);
            return null;
        }

        return qrData.qr;
    }

    getConnectionStatus(deviceId) {
        return this.connectionStates.get(deviceId) || 'disconnected';
    }

    async disconnectSession(deviceId) {
        try {
            const session = this.sessions.get(deviceId);
            if (session) {
                await session.sock.logout();
                this.cleanupSession(deviceId);
            }
        } catch (error) {
            logger.error(`[BaileysWhatsAppService] Error disconnecting session:`, error);
        }
    }

    async reconnectSession(deviceId) {
        try {
            const attempts = this.reconnectionAttempts.get(deviceId) || 0;
            
            // Limit reconnection attempts to prevent infinite loops
            if (attempts >= 5) {
                logger.warn(`[BaileysWhatsAppService] Max reconnection attempts reached for device ${deviceId}`);
                this.cleanupSession(deviceId);
                return;
            }
            
            const session = this.sessions.get(deviceId);
            if (session) {
                // Increment reconnection attempts
                this.reconnectionAttempts.set(deviceId, attempts + 1);
                
                // Clean up old session first
                this.cleanupSession(deviceId);
                
                // Wait a bit before reconnecting to avoid rapid reconnection loops
                const waitTime = Math.min(2000 * (attempts + 1), 10000); // Exponential backoff, max 10 seconds
                await new Promise(resolve => setTimeout(resolve, waitTime));
                
                // Reinitialize the session
                await this.initializeSession(deviceId, session.sessionId);
            }
        } catch (error) {
            logger.error(`[BaileysWhatsAppService] Error reconnecting session:`, error);
        }
    }

    cleanupSession(deviceId) {
        this.sessions.delete(deviceId);
        this.qrCodes.delete(deviceId);
        this.connectionStates.delete(deviceId);
        this.reconnectionAttempts.delete(deviceId);
    }

    async deleteSession(deviceId) {
        try {
            const session = this.sessions.get(deviceId);
            if (session) {
                await session.sock.logout();
                
                // Delete session files
                if (fs.existsSync(session.sessionDir)) {
                    fs.rmSync(session.sessionDir, { recursive: true, force: true });
                }
                
                this.cleanupSession(deviceId);
            }
        } catch (error) {
            logger.error(`[BaileysWhatsAppService] Error deleting session:`, error);
        }
    }
}

module.exports = new BaileysWhatsAppService();
