const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers,
    downloadMediaMessage,
    jidDecode
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');
const { Boom } = require('@hapi/boom');
const mimeTypes = require('mime-types');
const mongoose = require('mongoose');

const { WhatsAppIntegration, WhatsAppConversation, WhatsAppMessage, WhatsAppContact } = require('../schema');
const { publishEvent } = require('./rabbitmqProducer');

class BaileysWhatsAppService {
    constructor() {
        this.sessions = new Map(); // Store active sessions by userId
        this.connectionStatus = new Map(); // Track connection status
        this.messageHandlers = new Map(); // Store message handlers
        this.autoReplyHandlers = new Map(); // Store auto-reply handlers
        this.qrCodes = new Map(); // Store QR codes for each user
    }

    /**
     * Initialize Baileys session for a user (coach or staff)
     */
    async initializeSession(userId, userType, sessionName = 'default') {
        try {
            console.log(`[BaileysService] Initializing session for ${userType} ${userId}`);
            
            // Check if integration exists
            const integration = await WhatsAppIntegration.findOne({ 
                userId, 
                userType,
                integrationType: 'baileys_personal' 
            });
            
            if (!integration) {
                throw new Error('Baileys integration not found for this user');
            }

            // Create session directory
            const sessionDir = path.join(__dirname, '../baileys_auth', userId.toString());
            await fs.mkdir(sessionDir, { recursive: true });

            // Load or create auth state
            const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

            // Create WhatsApp socket
            const { version } = await fetchLatestBaileysVersion();
            const sock = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: 'silent' }),
                browser: Browsers.ubuntu('Chrome'),
                connectTimeoutMs: 60_000,
                keepAliveIntervalMs: 30_000,
                markOnlineOnConnect: false,
                emitOwnEvents: false,
                shouldIgnoreJid: jid => jid.includes('@broadcast'),
                getMessage: async () => {
                    return { conversation: 'hello' };
                }
            });

            // Store session data
            const sessionData = {
                sock,
                saveCreds,
                sessionDir,
                integration,
                isConnected: false,
                phoneNumber: null,
                qrCode: null,
                userId,
                userType
            };

            this.sessions.set(userId, sessionData);

            // Set up event handlers
            this.setupEventHandlers(userId, sock);

            // Update integration status
            await this.updateIntegrationStatus(userId, userType, 'connecting');

            console.log(`[BaileysService] Session initialized for ${userType} ${userId}`);
            return { success: true, sessionId: sessionName };

        } catch (error) {
            console.error(`[BaileysService] Error initializing session for ${userType} ${userId}:`, error);
            await this.updateIntegrationStatus(userId, userType, 'error', error.message);
            throw error;
        }
    }

    /**
     * Get QR code for WhatsApp Web authentication
     */
    async getQRCode(userId, userType) {
        try {
            const sessionData = this.sessions.get(userId);
            if (!sessionData) {
                throw new Error('Session not initialized. Please initialize session first.');
            }

            if (sessionData.qrCode) {
                return {
                    success: true,
                    qrCode: sessionData.qrCode,
                    status: 'qr_ready'
                };
            }

            if (sessionData.isConnected) {
                return {
                    success: true,
                    status: 'already_connected',
                    phoneNumber: sessionData.phoneNumber
                };
            }

            return {
                success: false,
                message: 'QR code not generated yet. Please wait for connection event.',
                status: 'waiting'
            };

        } catch (error) {
            console.error(`[BaileysService] Error getting QR code for ${userType} ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Setup event handlers for WhatsApp connection
     */
    setupEventHandlers(userId, sock) {
        const sessionData = this.sessions.get(userId);
        if (!sessionData) return;

        // Connection update handler
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                // Generate QR code as data URL
                try {
                    const qrDataUrl = await qrcode.toDataURL(qr);
                    sessionData.qrCode = qrDataUrl;
                    this.qrCodes.set(userId, qrDataUrl);
                    
                    console.log(`[BaileysService] QR code generated for user ${userId}`);
                    
                    // Publish QR code event
                    await publishEvent('whatsapp.qr_generated', {
                        userId,
                        userType: sessionData.userType,
                        qrCode: qrDataUrl
                    });
                } catch (error) {
                    console.error(`[BaileysService] Error generating QR code:`, error);
                }
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                
                if (shouldReconnect) {
                    console.log(`[BaileysService] Connection closed for user ${userId}, attempting to reconnect...`);
                    await this.reconnectSession(userId);
                } else {
                    console.log(`[BaileysService] Connection logged out for user ${userId}`);
                    await this.cleanupSession(userId);
                }
            }

            if (connection === 'open') {
                console.log(`[BaileysService] Connection opened for user ${userId}`);
                sessionData.isConnected = true;
                sessionData.qrCode = null; // Clear QR code after connection
                this.qrCodes.delete(userId);
                
                // Get phone number
                const phoneNumber = sock.user?.id;
                if (phoneNumber) {
                    sessionData.phoneNumber = phoneNumber;
                    await this.updateIntegrationStatus(userId, sessionData.userType, 'connected');
                    
                    // Update integration with phone number
                    await WhatsAppIntegration.findOneAndUpdate(
                        { userId, userType: sessionData.userType },
                        { 
                            personalPhoneNumber: phoneNumber,
                            connectionStatus: 'connected',
                            lastConnectionAt: new Date()
                        }
                    );
                }

                // Publish connection event
                await publishEvent('whatsapp.connected', {
                    userId,
                    userType: sessionData.userType,
                    phoneNumber: sessionData.phoneNumber
                });
            }
        });

        // Message handler
        sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            if (!msg.key.fromMe && msg.message) {
                await this.handleIncomingMessage(userId, msg);
            }
        });

        // Credentials update handler
        sock.ev.on('creds.update', async () => {
            if (sessionData.saveCreds) {
                await sessionData.saveCreds();
            }
        });
    }

    /**
     * Handle incoming WhatsApp messages
     */
    async handleIncomingMessage(userId, msg) {
        try {
            const sessionData = this.sessions.get(userId);
            if (!sessionData) return;

            const messageContent = this.extractMessageContent(msg);
            const senderPhone = msg.key.remoteJid;
            const messageId = msg.key.id;
            const timestamp = new Date(msg.messageTimestamp * 1000);

            console.log(`[BaileysService] Incoming message from ${senderPhone} to user ${userId}`);

            // Save message to database
            await this.saveIncomingMessage(userId, sessionData.userType, {
                messageId,
                from: senderPhone,
                content: messageContent,
                timestamp,
                type: this.getMessageType(msg)
            });

            // Handle auto-reply if enabled
            if (sessionData.integration.autoReplyEnabled) {
                await this.sendAutoReply(userId, senderPhone, sessionData.integration.autoReplyMessage);
            }

            // Publish message event
            await publishEvent('whatsapp.message_received', {
                userId,
                userType: sessionData.userType,
                senderPhone,
                messageContent,
                timestamp
            });

        } catch (error) {
            console.error(`[BaileysService] Error handling incoming message:`, error);
        }
    }

    /**
     * Extract message content from different message types
     */
    extractMessageContent(msg) {
        if (msg.message?.conversation) {
            return msg.message.conversation;
        } else if (msg.message?.extendedTextMessage?.text) {
            return msg.message.extendedTextMessage.text;
        } else if (msg.message?.imageMessage?.caption) {
            return msg.message.imageMessage.caption;
        } else if (msg.message?.videoMessage?.caption) {
            return msg.message.videoMessage.caption;
        } else if (msg.message?.audioMessage) {
            return '[Audio Message]';
        } else if (msg.message?.documentMessage) {
            return `[Document: ${msg.message.documentMessage.fileName || 'Unknown'}]`;
        }
        return '[Unsupported Message Type]';
    }

    /**
     * Get message type
     */
    getMessageType(msg) {
        if (msg.message?.conversation || msg.message?.extendedTextMessage) return 'text';
        if (msg.message?.imageMessage) return 'image';
        if (msg.message?.videoMessage) return 'video';
        if (msg.message?.audioMessage) return 'audio';
        if (msg.message?.documentMessage) return 'document';
        return 'unknown';
    }

    /**
     * Send WhatsApp message
     */
    async sendMessage(userId, userType, recipientPhone, messageContent, messageType = 'text') {
        try {
            const sessionData = this.sessions.get(userId);
            if (!sessionData || !sessionData.isConnected) {
                throw new Error('WhatsApp session not connected');
            }

            let messagePayload;
            const jid = recipientPhone.includes('@s.whatsapp.net') ? recipientPhone : `${recipientPhone}@s.whatsapp.net`;

            switch (messageType) {
                case 'text':
                    messagePayload = { text: messageContent };
                    break;
                case 'image':
                    // Handle image message
                    messagePayload = { image: { url: messageContent } };
                    break;
                case 'document':
                    // Handle document message
                    messagePayload = { document: { url: messageContent } };
                    break;
                default:
                    messagePayload = { text: messageContent };
            }

            const sentMessage = await sessionData.sock.sendMessage(jid, messagePayload);
            
            // Save outgoing message to database
            await this.saveOutgoingMessage(userId, userType, {
                messageId: sentMessage.key.id,
                to: recipientPhone,
                content: messageContent,
                timestamp: new Date(),
                type: messageType
            });

            // Update integration statistics
            await this.updateMessageStats(userId, userType, 'sent');

            console.log(`[BaileysService] Message sent successfully to ${recipientPhone}`);
            return { success: true, messageId: sentMessage.key.id };

        } catch (error) {
            console.error(`[BaileysService] Error sending message:`, error);
            throw error;
        }
    }

    /**
     * Send auto-reply message
     */
    async sendAutoReply(userId, recipientPhone, replyMessage) {
        try {
            await this.sendMessage(userId, 'text', recipientPhone, replyMessage);
            console.log(`[BaileysService] Auto-reply sent to ${recipientPhone}`);
        } catch (error) {
            console.error(`[BaileysService] Error sending auto-reply:`, error);
        }
    }

    /**
     * Save incoming message to database
     */
    async saveIncomingMessage(userId, userType, messageData) {
        try {
            const message = new WhatsAppMessage({
                userId,
                userType,
                messageId: messageData.messageId,
                from: messageData.from,
                to: null,
                content: messageData.content,
                direction: 'inbound',
                timestamp: messageData.timestamp,
                type: messageData.type,
                isAutomated: false
            });

            await message.save();
            console.log(`[BaileysService] Incoming message saved to database`);
        } catch (error) {
            console.error(`[BaileysService] Error saving incoming message:`, error);
        }
    }

    /**
     * Save outgoing message to database
     */
    async saveOutgoingMessage(userId, userType, messageData) {
        try {
            const message = new WhatsAppMessage({
                userId,
                userType,
                messageId: messageData.messageId,
                from: null,
                to: messageData.to,
                content: messageData.content,
                direction: 'outbound',
                timestamp: messageData.timestamp,
                type: messageData.type,
                isAutomated: false
            });

            await message.save();
            console.log(`[BaileysService] Outgoing message saved to database`);
        } catch (error) {
            console.error(`[BaileysService] Error saving outgoing message:`, error);
        }
    }

    /**
     * Update integration status
     */
    async updateIntegrationStatus(userId, userType, status, errorMessage = null) {
        try {
            const updateData = {
                connectionStatus: status,
                lastConnectionAt: new Date()
            };

            if (status === 'error' && errorMessage) {
                updateData.lastError = {
                    message: errorMessage,
                    timestamp: new Date(),
                    code: 'CONNECTION_ERROR'
                };
                updateData.errorCount = { $inc: 1 };
            }

            await WhatsAppIntegration.findOneAndUpdate(
                { userId, userType },
                updateData
            );

            this.connectionStatus.set(userId, status);
        } catch (error) {
            console.error(`[BaileysService] Error updating integration status:`, error);
        }
    }

    /**
     * Update message statistics
     */
    async updateMessageStats(userId, userType, direction) {
        try {
            const updateField = direction === 'sent' ? 'totalMessagesSent' : 'totalMessagesReceived';
            const updateData = {
                [updateField]: { $inc: 1 },
                lastMessageAt: new Date()
            };

            await WhatsAppIntegration.findOneAndUpdate(
                { userId, userType },
                updateData
            );
        } catch (error) {
            console.error(`[BaileysService] Error updating message stats:`, error);
        }
    }

    /**
     * Reconnect session
     */
    async reconnectSession(userId) {
        try {
            const sessionData = this.sessions.get(userId);
            if (!sessionData) return;

            console.log(`[BaileysService] Attempting to reconnect session for user ${userId}`);
            await this.updateIntegrationStatus(userId, sessionData.userType, 'connecting');

            // Reinitialize session
            await this.initializeSession(userId, sessionData.userType);
        } catch (error) {
            console.error(`[BaileysService] Error reconnecting session:`, error);
            await this.updateIntegrationStatus(userId, 'error', error.message);
        }
    }

    /**
     * Cleanup session
     */
    async cleanupSession(userId) {
        try {
            const sessionData = this.sessions.get(userId);
            if (!sessionData) return;

            if (sessionData.sock) {
                sessionData.sock.end();
            }

            await this.updateIntegrationStatus(userId, sessionData.userType, 'disconnected');
            this.sessions.delete(userId);
            this.qrCodes.delete(userId);
            this.connectionStatus.delete(userId);

            console.log(`[BaileysService] Session cleaned up for user ${userId}`);
        } catch (error) {
            console.error(`[BaileysService] Error cleaning up session:`, error);
        }
    }

    /**
     * Get session status
     */
    getSessionStatus(userId) {
        const sessionData = this.sessions.get(userId);
        if (!sessionData) {
            return { status: 'not_initialized' };
        }

        return {
            status: sessionData.isConnected ? 'connected' : 'connecting',
            phoneNumber: sessionData.phoneNumber,
            hasQRCode: !!sessionData.qrCode,
            qrCode: sessionData.qrCode
        };
    }

    /**
     * Get all active sessions
     */
    getAllSessions() {
        const sessions = [];
        for (const [userId, sessionData] of this.sessions) {
            sessions.push({
                userId,
                userType: sessionData.userType,
                status: sessionData.isConnected ? 'connected' : 'connecting',
                phoneNumber: sessionData.phoneNumber,
                hasQRCode: !!sessionData.qrCode
            });
        }
        return sessions;
    }

    /**
     * Disconnect session
     */
    async disconnectSession(userId) {
        try {
            await this.cleanupSession(userId);
            return { success: true, message: 'Session disconnected successfully' };
        } catch (error) {
            console.error(`[BaileysService] Error disconnecting session:`, error);
            throw error;
        }
    }
}

module.exports = new BaileysWhatsAppService();
