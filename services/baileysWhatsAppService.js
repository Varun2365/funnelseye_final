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
        this.sessions = new Map(); // Store active sessions by coachId
        this.connectionStatus = new Map(); // Track connection status
        this.messageHandlers = new Map(); // Store message handlers
        this.autoReplyHandlers = new Map(); // Store auto-reply handlers
    }

    /**
     * Initialize Baileys session for a coach
     */
    async initializeSession(coachId, sessionName = 'default') {
        try {
            console.log(`[BaileysService] Initializing session for coach ${coachId}`);
            
            // Check if integration exists
            const integration = await WhatsAppIntegration.findOne({ 
                coachId, 
                integrationType: 'baileys_personal' 
            });
            
            if (!integration) {
                throw new Error('Baileys integration not found for this coach');
            }

            // Create session directory
            const sessionDir = path.join(__dirname, '../sessions', coachId.toString());
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
                qrCode: null
            };

            this.sessions.set(coachId, sessionData);

            // Set up event handlers
            this.setupEventHandlers(coachId, sock);

            // Update integration status
            await this.updateIntegrationStatus(coachId, 'connecting');

            console.log(`[BaileysService] Session initialized for coach ${coachId}`);
            return { success: true, sessionId: sessionName };

        } catch (error) {
            console.error(`[BaileysService] Error initializing session for coach ${coachId}:`, error);
            await this.updateIntegrationStatus(coachId, 'error', error.message);
            throw error;
        }
    }

    /**
     * Set up event handlers for WhatsApp socket
     */
    setupEventHandlers(coachId, sock) {
        const sessionData = this.sessions.get(coachId);

        // Connection updates
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                // Generate QR code for scanning
                try {
                    const qrCodeDataUrl = await qrcode.toDataURL(qr);
                    sessionData.qrCode = qrCodeDataUrl;
                    console.log(`[BaileysService] QR code generated for coach ${coachId}`);
                } catch (error) {
                    console.error(`[BaileysService] Error generating QR code:`, error);
                }
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom) && 
                    lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
                
                if (shouldReconnect) {
                    console.log(`[BaileysService] Connection closed for coach ${coachId}, attempting to reconnect...`);
                    await this.reconnectSession(coachId);
                } else {
                    console.log(`[BaileysService] Connection closed for coach ${coachId}, not reconnecting`);
                    await this.updateIntegrationStatus(coachId, 'disconnected');
                }
            } else if (connection === 'open') {
                console.log(`[BaileysService] Connection established for coach ${coachId}`);
                sessionData.isConnected = true;
                sessionData.phoneNumber = sock.user?.id;
                sessionData.qrCode = null;
                
                // Update integration with phone number
                await this.updateIntegrationPhoneNumber(coachId, sock.user?.id);
                await this.updateIntegrationStatus(coachId, 'connected');
                
                // Save credentials
                if (sessionData.saveCreds) {
                    sessionData.saveCreds();
                }
            }
        });

        // Credentials update
        sock.ev.on('creds.update', async () => {
            if (sessionData.saveCreds) {
                sessionData.saveCreds();
            }
        });

        // Messages
        sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            if (!msg.key.fromMe && msg.message) {
                await this.handleIncomingMessage(coachId, msg);
            }
        });

        // Message updates (delivery status, read receipts)
        sock.ev.on('messages.update', async (updates) => {
            for (const update of updates) {
                await this.handleMessageUpdate(coachId, update);
            }
        });

        // Presence updates
        sock.ev.on('presence.update', async (presence) => {
            // Handle presence updates if needed
        });
    }

    /**
     * Handle incoming messages
     */
    async handleIncomingMessage(coachId, msg) {
        try {
            const sessionData = this.sessions.get(coachId);
            if (!sessionData) return;

            const messageData = await this.extractMessageData(msg);
            const contactNumber = msg.key.participant || msg.key.remoteJid;

            // Create or update conversation
            const conversation = await this.getOrCreateConversation(coachId, contactNumber, 'baileys_personal');
            
            // Create message record
            const message = new WhatsAppMessage({
                messageId: msg.key.id,
                conversationId: conversation.conversationId,
                coachId,
                direction: 'inbound',
                messageType: messageData.type,
                content: messageData.content,
                mediaUrl: messageData.mediaUrl,
                mediaType: messageData.mediaType,
                timestamp: new Date(),
                deliveryStatus: 'delivered',
                readStatus: 'unread',
                integrationType: 'baileys_personal',
                leadId: conversation.leadId
            });

            await message.save();

            // Update conversation
            await conversation.addMessage({
                timestamp: message.timestamp,
                content: message.content,
                direction: 'inbound'
            });

            // Update integration stats
            await this.updateMessageStats(coachId, 'received');

            // Check for auto-reply
            await this.checkAutoReply(coachId, conversation, message);

            // Trigger automation events
            await this.triggerAutomationEvents(coachId, message);

            console.log(`[BaileysService] Incoming message processed for coach ${coachId}`);

        } catch (error) {
            console.error(`[BaileysService] Error handling incoming message:`, error);
        }
    }

    /**
     * Handle message updates (delivery status, read receipts)
     */
    async handleMessageUpdate(coachId, update) {
        try {
            const message = await WhatsAppMessage.findOne({ messageId: update.key.id });
            if (!message) return;

            if (update.update.status) {
                // Update delivery status
                await message.updateDeliveryStatus(update.update.status);
            }

            if (update.update.readStatus) {
                // Update read status
                await message.markAsRead();
            }

        } catch (error) {
            console.error(`[BaileysService] Error handling message update:`, error);
        }
    }

    /**
     * Extract message data from Baileys message
     */
    async extractMessageData(msg) {
        let content = '';
        let type = 'text';
        let mediaUrl = null;
        let mediaType = null;

        if (msg.message?.conversation) {
            content = msg.message.conversation;
        } else if (msg.message?.extendedTextMessage?.text) {
            content = msg.message.extendedTextMessage.text;
        } else if (msg.message?.imageMessage) {
            type = 'image';
            content = msg.message.imageMessage.caption || '';
            mediaType = 'image';
        } else if (msg.message?.videoMessage) {
            type = 'video';
            content = msg.message.videoMessage.caption || '';
            mediaType = 'video';
        } else if (msg.message?.audioMessage) {
            type = 'audio';
            content = 'Audio message';
            mediaType = 'audio';
        } else if (msg.message?.documentMessage) {
            type = 'document';
            content = msg.message.documentMessage.title || 'Document';
            mediaType = 'document';
        }

        return { content, type, mediaUrl, mediaType };
    }

    /**
     * Get or create conversation
     */
    async getOrCreateConversation(coachId, contactNumber, integrationType) {
        try {
            let conversation = await WhatsAppConversation.findOne({
                coachId,
                contactNumber,
                integrationType
            });

            if (!conversation) {
                // Create new conversation
                const conversationId = `${coachId}_${contactNumber}_${Date.now()}`;
                
                conversation = new WhatsAppConversation({
                    conversationId,
                    coachId,
                    contactNumber,
                    contactName: 'Unknown Contact',
                    integrationType,
                    status: 'active',
                    category: 'general'
                });

                await conversation.save();

                // Create contact record
                await this.createOrUpdateContact(coachId, contactNumber, integrationType);
            }

            return conversation;

        } catch (error) {
            console.error(`[BaileysService] Error getting/creating conversation:`, error);
            throw error;
        }
    }

    /**
     * Create or update contact
     */
    async createOrUpdateContact(coachId, contactNumber, integrationType) {
        try {
            let contact = await WhatsAppContact.findOne({
                coachId,
                contactNumber
            });

            if (!contact) {
                contact = new WhatsAppContact({
                    coachId,
                    contactNumber,
                    contactName: 'Unknown Contact',
                    integrationType,
                    source: 'whatsapp'
                });

                await contact.save();
            } else {
                // Update last interaction
                await contact.updateInteraction();
            }

            return contact;

        } catch (error) {
            console.error(`[BaileysService] Error creating/updating contact:`, error);
        }
    }

    /**
     * Send message via Baileys
     */
    async sendMessage(coachId, recipientNumber, content, options = {}) {
        try {
            const sessionData = this.sessions.get(coachId);
            if (!sessionData || !sessionData.isConnected) {
                throw new Error('Baileys session not connected');
            }

            const { sock } = sessionData;
            const messageOptions = {
                ...options,
                quoted: options.replyTo ? { key: { id: options.replyTo }, message: {} } : undefined
            };

            let message;
            if (options.mediaUrl) {
                // Send media message
                const mediaBuffer = await this.downloadMedia(options.mediaUrl);
                const mediaType = options.mediaType || 'image';
                
                switch (mediaType) {
                    case 'image':
                        message = await sock.sendMessage(recipientNumber, {
                            image: mediaBuffer,
                            caption: content
                        }, messageOptions);
                        break;
                    case 'video':
                        message = await sock.sendMessage(recipientNumber, {
                            video: mediaBuffer,
                            caption: content
                        }, messageOptions);
                        break;
                    case 'audio':
                        message = await sock.sendMessage(recipientNumber, {
                            audio: mediaBuffer,
                            ptt: options.ptt || false
                        }, messageOptions);
                        break;
                    case 'document':
                        message = await sock.sendMessage(recipientNumber, {
                            document: mediaBuffer,
                            mimetype: options.mimeType || 'application/octet-stream',
                            fileName: options.fileName || 'document'
                        }, messageOptions);
                        break;
                }
            } else {
                // Send text message
                message = await sock.sendMessage(recipientNumber, {
                    text: content
                }, messageOptions);
            }

            // Create message record
            const conversation = await this.getOrCreateConversation(coachId, recipientNumber, 'baileys_personal');
            
            const messageRecord = new WhatsAppMessage({
                messageId: message.key.id,
                conversationId: conversation.conversationId,
                coachId,
                direction: 'outbound',
                messageType: options.mediaUrl ? options.mediaType : 'text',
                content,
                mediaUrl: options.mediaUrl,
                mediaType: options.mediaType,
                timestamp: new Date(),
                deliveryStatus: 'sent',
                readStatus: 'read',
                integrationType: 'baileys_personal',
                leadId: conversation.leadId
            });

            await messageRecord.save();

            // Update conversation
            await conversation.addMessage({
                timestamp: messageRecord.timestamp,
                content,
                direction: 'outbound'
            });

            // Update integration stats
            await this.updateMessageStats(coachId, 'sent');

            console.log(`[BaileysService] Message sent via Baileys for coach ${coachId}`);
            return { success: true, messageId: message.key.id };

        } catch (error) {
            console.error(`[BaileysService] Error sending message:`, error);
            throw error;
        }
    }

    /**
     * Download media from URL
     */
    async downloadMedia(mediaUrl) {
        try {
            const response = await fetch(mediaUrl);
            return Buffer.from(await response.arrayBuffer());
        } catch (error) {
            console.error(`[BaileysService] Error downloading media:`, error);
            throw error;
        }
    }

    /**
     * Check and send auto-reply
     */
    async checkAutoReply(coachId, conversation, message) {
        try {
            const integration = await WhatsAppIntegration.findOne({ 
                coachId, 
                integrationType: 'baileys_personal' 
            });

            if (integration?.autoReplyEnabled && integration.autoReplyMessage) {
                // Send auto-reply
                await this.sendMessage(coachId, conversation.contactNumber, integration.autoReplyMessage);
                console.log(`[BaileysService] Auto-reply sent for coach ${coachId}`);
            }
        } catch (error) {
            console.error(`[BaileysService] Error sending auto-reply:`, error);
        }
    }

    /**
     * Trigger automation events
     */
    async triggerAutomationEvents(coachId, message) {
        try {
            // Trigger whatsapp_message_received event
            await publishEvent('funnelseye_events', 'whatsapp_message_received', {
                eventName: 'whatsapp_message_received',
                payload: {
                    coachId,
                    messageId: message._id,
                    conversationId: message.conversationId,
                    contactNumber: message.contactNumber,
                    content: message.content,
                    messageType: message.messageType,
                    integrationType: 'baileys_personal'
                },
                relatedDoc: { messageId: message._id, coachId },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error(`[BaileysService] Error triggering automation events:`, error);
        }
    }

    /**
     * Update integration status
     */
    async updateIntegrationStatus(coachId, status, errorMessage = null) {
        try {
            await WhatsAppIntegration.findOneAndUpdate(
                { coachId, integrationType: 'baileys_personal' },
                {
                    connectionStatus: status,
                    lastConnectionAt: new Date(),
                    ...(errorMessage && {
                        lastError: {
                            message: errorMessage,
                            timestamp: new Date(),
                            code: 'CONNECTION_ERROR'
                        }
                    })
                }
            );

            this.connectionStatus.set(coachId, status);
        } catch (error) {
            console.error(`[BaileysService] Error updating integration status:`, error);
        }
    }

    /**
     * Update integration phone number
     */
    async updateIntegrationPhoneNumber(coachId, phoneNumber) {
        try {
            await WhatsAppIntegration.findOneAndUpdate(
                { coachId, integrationType: 'baileys_personal' },
                { personalPhoneNumber: phoneNumber }
            );
        } catch (error) {
            console.error(`[BaileysService] Error updating phone number:`, error);
        }
    }

    /**
     * Update message statistics
     */
    async updateMessageStats(coachId, type) {
        try {
            const update = type === 'sent' 
                ? { $inc: { totalMessagesSent: 1 }, lastMessageAt: new Date() }
                : { $inc: { totalMessagesReceived: 1 }, lastMessageAt: new Date() };

            await WhatsAppIntegration.findOneAndUpdate(
                { coachId, integrationType: 'baileys_personal' },
                update
            );
        } catch (error) {
            console.error(`[BaileysService] Error updating message stats:`, error);
        }
    }

    /**
     * Reconnect session
     */
    async reconnectSession(coachId) {
        try {
            console.log(`[BaileysService] Attempting to reconnect session for coach ${coachId}`);
            await this.updateIntegrationStatus(coachId, 'connecting');
            
            // Wait a bit before reconnecting
            setTimeout(async () => {
                try {
                    await this.initializeSession(coachId);
                } catch (error) {
                    console.error(`[BaileysService] Reconnection failed for coach ${coachId}:`, error);
                    await this.updateIntegrationStatus(coachId, 'error', error.message);
                }
            }, 5000);

        } catch (error) {
            console.error(`[BaileysService] Error during reconnection:`, error);
        }
    }

    /**
     * Get QR code for session
     */
    async getQRCode(coachId) {
        try {
            const sessionData = this.sessions.get(coachId);
            if (!sessionData) {
                throw new Error('Session not found');
            }

            if (sessionData.qrCode) {
                return { success: true, qrCode: sessionData.qrCode };
            } else if (sessionData.isConnected) {
                return { success: true, message: 'Already connected' };
            } else {
                return { success: false, message: 'QR code not available' };
            }
        } catch (error) {
            console.error(`[BaileysService] Error getting QR code:`, error);
            throw error;
        }
    }

    /**
     * Get session status
     */
    async getSessionStatus(coachId) {
        try {
            const sessionData = this.sessions.get(coachId);
            if (!sessionData) {
                return { success: false, message: 'Session not found' };
            }

            return {
                success: true,
                isConnected: sessionData.isConnected,
                phoneNumber: sessionData.phoneNumber,
                hasQRCode: !!sessionData.qrCode,
                qrCode: sessionData.qrCode
            };
        } catch (error) {
            console.error(`[BaileysService] Error getting session status:`, error);
            throw error;
        }
    }

    /**
     * Disconnect session
     */
    async disconnectSession(coachId) {
        try {
            const sessionData = this.sessions.get(coachId);
            if (!sessionData) {
                return { success: false, message: 'Session not found' };
            }

            // Close socket
            if (sessionData.sock) {
                sessionData.sock.end();
            }

            // Remove session data
            this.sessions.delete(coachId);
            this.connectionStatus.delete(coachId);

            // Update integration status
            await this.updateIntegrationStatus(coachId, 'disconnected');

            console.log(`[BaileysService] Session disconnected for coach ${coachId}`);
            return { success: true, message: 'Session disconnected' };

        } catch (error) {
            console.error(`[BaileysService] Error disconnecting session:`, error);
            throw error;
        }
    }

    /**
     * Delete session data
     */
    async deleteSession(coachId) {
        try {
            const sessionData = this.sessions.get(coachId);
            if (sessionData?.sessionDir) {
                // Remove session directory
                await fs.rm(sessionData.sessionDir, { recursive: true, force: true });
            }

            // Disconnect session
            await this.disconnectSession(coachId);

            console.log(`[BaileysService] Session data deleted for coach ${coachId}`);
            return { success: true, message: 'Session data deleted' };

        } catch (error) {
            console.error(`[BaileysService] Error deleting session data:`, error);
            throw error;
        }
    }

    /**
     * Get all active sessions
     */
    getActiveSessions() {
        const activeSessions = [];
        for (const [coachId, sessionData] of this.sessions) {
            activeSessions.push({
                coachId,
                isConnected: sessionData.isConnected,
                phoneNumber: sessionData.phoneNumber
            });
        }
        return activeSessions;
    }

    /**
     * Health check for all sessions
     */
    async healthCheck() {
        const healthStatus = [];
        
        for (const [coachId, sessionData] of this.sessions) {
            try {
                const isHealthy = sessionData.isConnected && sessionData.sock;
                healthStatus.push({
                    coachId,
                    isHealthy,
                    connectionStatus: sessionData.isConnected ? 'connected' : 'disconnected',
                    phoneNumber: sessionData.phoneNumber
                });

                if (!isHealthy) {
                    // Attempt to reconnect unhealthy sessions
                    await this.reconnectSession(coachId);
                }
            } catch (error) {
                console.error(`[BaileysService] Health check error for coach ${coachId}:`, error);
                healthStatus.push({
                    coachId,
                    isHealthy: false,
                    error: error.message
                });
            }
        }

        return healthStatus;
    }
}

module.exports = new BaileysWhatsAppService();
