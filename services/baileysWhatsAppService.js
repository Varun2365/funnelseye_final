const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');

const { WhatsAppIntegration } = require('../schema');

class BaileysWhatsAppService {
    constructor() {
        this.sessions = new Map();
        this.setupGlobalErrorHandlers();
    }

    /**
     * Setup global error handlers to prevent server crashes
     */
    setupGlobalErrorHandlers() {
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error(`[BaileysService] 🚨 UNCAUGHT EXCEPTION:`, error.message);
            console.error(`[BaileysService] Stack:`, error.stack);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error(`[BaileysService] 🚨 UNHANDLED REJECTION at:`, promise);
            console.error(`[BaileysService] Reason:`, reason);
        });
    }

    /**
     * Initialize Baileys session and get QR code
     */
    async initializeSession(userId, userType) {
        try {
            console.log(`[BaileysService] 🚀 Starting Baileys initialization for ${userType} ${userId}`);
            
            // Check if integration exists
            const integration = await WhatsAppIntegration.findOne({ 
                userId, 
                userType,
                integrationType: 'baileys_personal' 
            });
            
            if (!integration) {
                throw new Error('Baileys integration not found. Please setup integration first.');
            }

            // Clean up any existing session
            if (this.sessions.has(userId)) {
                console.log(`[BaileysService] 🧹 Cleaning up existing session for user ${userId}`);
                await this.cleanupSession(userId);
            }

            // Create session directory
            const sessionDir = path.join(__dirname, '../baileys_auth', userId.toString());
            await fs.mkdir(sessionDir, { recursive: true });

            console.log(`[BaileysService] 📁 Session directory created: ${sessionDir}`);

            // Load or create auth state
            const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

            // Create WhatsApp socket with minimal configuration
            const { version } = await fetchLatestBaileysVersion();
            const sock = makeWASocket({
                version,
                auth: state,
                logger: pino({ level: 'silent' }), // Use proper pino logger
                browser: Browsers.ubuntu('Chrome'),
                connectTimeoutMs: 30_000,
                keepAliveIntervalMs: 15_000,
                markOnlineOnConnect: false,
                emitOwnEvents: false
            });

            // Validate socket creation
            if (!sock || !sock.ev) {
                throw new Error('Failed to create WhatsApp socket - invalid socket object');
            }

            console.log(`[BaileysService] 🔌 WhatsApp socket created successfully for user ${userId}`);
            console.log(`[BaileysService] 🔌 Socket events available:`, Object.keys(sock.ev));

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
                userType,
                createdAt: new Date()
            };

            this.sessions.set(userId, sessionData);

            // Setup event handlers
            try {
                this.setupEventHandlers(userId, sock);
                console.log(`[BaileysService] ✅ Event handlers setup successfully for user ${userId}`);
            } catch (error) {
                console.error(`[BaileysService] ❌ Error setting up event handlers:`, error.message);
                throw new Error(`Failed to setup event handlers: ${error.message}`);
            }

            // Wait for QR code (max 20 seconds)
            console.log(`[BaileysService] ⏳ Waiting for QR code generation...`);
            
            const qrCode = await this.waitForQRCode(userId, 20000);
            
            if (qrCode) {
                console.log(`[BaileysService] ✅ QR code generated successfully for user ${userId}`);
                console.log(`[BaileysService] 📱 QR Code Data URL: ${qrCode.substring(0, 100)}...`);
                
                // Update integration status
                await this.updateIntegrationStatus(userId, userType, 'qr_generated');
                
                return {
                    success: true,
                    qrCode: qrCode,
                    message: 'QR code generated successfully. Scan with WhatsApp to connect.',
                    sessionId: `session_${userId}`
                };
            } else {
                throw new Error('QR code generation timeout. Please try again.');
            }

        } catch (error) {
            console.error(`[BaileysService] ❌ Error initializing session for ${userType} ${userId}:`, error.message);
            console.error(`[BaileysService] ❌ Error stack:`, error.stack);
            await this.cleanupSession(userId);
            throw error;
        }
    }

    /**
     * Wait for QR code generation with timeout
     */
    async waitForQRCode(userId, timeoutMs) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            let attempts = 0;
            
            const checkInterval = setInterval(() => {
                attempts++;
                const session = this.sessions.get(userId);
                const elapsed = Date.now() - startTime;
                
                if (session && session.qrCode) {
                    clearInterval(checkInterval);
                    console.log(`[BaileysService] 🎯 QR code found after ${elapsed}ms (${attempts} attempts)`);
                    resolve(session.qrCode);
                    return;
                }
                
                if (elapsed > timeoutMs) {
                    clearInterval(checkInterval);
                    console.log(`[BaileysService] ⏰ QR code generation timeout after ${elapsed}ms`);
                    resolve(null);
                    return;
                }
                
                // Show progress every 2 seconds
                if (attempts % 4 === 0) {
                    const remaining = Math.ceil((timeoutMs - elapsed) / 1000);
                    console.log(`[BaileysService] ⏳ Waiting for QR code... ${remaining}s remaining`);
                }
            }, 500);
        });
    }

    /**
     * Setup event handlers for WhatsApp connection
     */
    setupEventHandlers(userId, sock) {
        try {
            const sessionData = this.sessions.get(userId);
            if (!sessionData) {
                console.error(`[BaileysService] ❌ No session data found for user ${userId}`);
                return;
            }

            if (!sock || !sock.ev) {
                console.error(`[BaileysService] ❌ Invalid socket for user ${userId}`);
                return;
            }

            console.log(`[BaileysService] 🔧 Setting up event handlers for user ${userId}`);
            console.log(`[BaileysService] 🔧 Available events:`, Object.keys(sock.ev));

            // Connection update handler
            sock.ev.on('connection.update', async (update) => {
                try {
                    const { connection, lastDisconnect, qr } = update;

                    if (qr) {
                        console.log(`[BaileysService] 🔍 QR code received for user ${userId}`);
                        
                        try {
                            const qrDataUrl = await qrcode.toDataURL(qr);
                            sessionData.qrCode = qrDataUrl;
                            
                            console.log(`[BaileysService] 🎯 QR code converted to data URL for user ${userId}`);
                            console.log(`[BaileysService] 📱 QR Code Length: ${qrDataUrl.length} characters`);
                            
                            // Also print QR code in terminal for easy scanning
                            console.log(`\n[BaileysService] 📱 SCAN THIS QR CODE WITH WHATSAPP:`);
                            console.log(`[BaileysService] ${qr}`);
                            console.log(`[BaileysService] 📱 END QR CODE\n`);
                            
                        } catch (error) {
                            console.error(`[BaileysService] ❌ Error converting QR to data URL:`, error.message);
                        }
                    }

                    if (connection === 'close') {
                        console.log(`[BaileysService] 🔌 Connection closed for user ${userId}`);
                        
                        const shouldReconnect = (lastDisconnect?.error instanceof Error) && 
                            lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut;
                        
                        if (shouldReconnect) {
                            console.log(`[BaileysService] 🔄 Connection closed unexpectedly, will attempt reconnection`);
                        } else {
                            console.log(`[BaileysService] 🚪 User logged out, cleaning up session`);
                            await this.cleanupSession(userId);
                        }
                    }

                    if (connection === 'open') {
                        console.log(`[BaileysService] 🎉 CONNECTION ESTABLISHED for user ${userId}`);
                        
                        sessionData.isConnected = true;
                        sessionData.qrCode = null; // Clear QR code
                        
                        // Get phone number
                        const phoneNumber = sock.user?.id;
                        if (phoneNumber) {
                            sessionData.phoneNumber = phoneNumber;
                            console.log(`[BaileysService] 📱 Phone number detected: ${phoneNumber}`);
                            
                            // Update integration status
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
                            
                            console.log(`[BaileysService] ✅ Integration updated successfully`);
                        }
                        
                        console.log(`[BaileysService] 🎯 Session ${userId} is now fully connected and ready!`);
                    }
                    
                } catch (error) {
                    console.error(`[BaileysService] ❌ Error in connection update handler:`, error.message);
                }
            });

            // Message handler
            sock.ev.on('messages.upsert', async (m) => {
                try {
                    const msg = m.messages[0];
                    if (!msg.key.fromMe && msg.message) {
                        console.log(`[BaileysService] 📨 Incoming message from ${msg.key.remoteJid} to user ${userId}`);
                    }
                } catch (error) {
                    console.error(`[BaileysService] ❌ Error handling message:`, error.message);
                }
            });

            // Credentials update handler
            sock.ev.on('creds.update', async () => {
                try {
                    if (sessionData.saveCreds) {
                        await sessionData.saveCreds();
                        console.log(`[BaileysService] 💾 Credentials saved for user ${userId}`);
                    }
                } catch (error) {
                    console.error(`[BaileysService] ❌ Error saving credentials:`, error.message);
                }
            });

        } catch (error) {
            console.error(`[BaileysService] ❌ Error setting up event handlers:`, error.message);
        }
    }

    /**
     * Send WhatsApp message
     */
    async sendMessage(userId, userType, recipientPhone, messageContent) {
        try {
            const sessionData = this.sessions.get(userId);
            if (!sessionData || !sessionData.isConnected) {
                throw new Error('WhatsApp session not connected');
            }

            const jid = recipientPhone.includes('@s.whatsapp.net') ? 
                recipientPhone : `${recipientPhone}@s.whatsapp.net`;

            const sentMessage = await sessionData.sock.sendMessage(jid, { text: messageContent });
            
            console.log(`[BaileysService] ✅ Message sent successfully to ${recipientPhone}`);
            return { success: true, messageId: sentMessage.key.id };

        } catch (error) {
            console.error(`[BaileysService] ❌ Error sending message:`, error.message);
            throw error;
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
            qrCode: sessionData.qrCode,
            sessionExists: true,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Update integration status
     */
    async updateIntegrationStatus(userId, userType, status) {
        try {
            await WhatsAppIntegration.findOneAndUpdate(
                { userId, userType },
                { 
                    connectionStatus: status,
                    lastConnectionAt: new Date()
                }
            );
            console.log(`[BaileysService] 📊 Integration status updated to: ${status}`);
        } catch (error) {
            console.error(`[BaileysService] ❌ Error updating integration status:`, error.message);
        }
    }

    /**
     * Cleanup session
     */
    async cleanupSession(userId) {
        try {
            const sessionData = this.sessions.get(userId);
            if (!sessionData) return;

            console.log(`[BaileysService] 🧹 Cleaning up session for user ${userId}`);

            if (sessionData.sock) {
                try {
                    sessionData.sock.end();
                    console.log(`[BaileysService] 🔌 Socket ended for user ${userId}`);
                } catch (error) {
                    console.error(`[BaileysService] ❌ Error ending socket:`, error.message);
                }
            }

            // Remove from sessions map
            this.sessions.delete(userId);
            console.log(`[BaileysService] 🗑️ Session cleaned up for user ${userId}`);

        } catch (error) {
            console.error(`[BaileysService] ❌ Error cleaning up session:`, error.message);
        }
    }

    /**
     * Disconnect session
     */
    async disconnectSession(userId) {
        try {
            await this.cleanupSession(userId);
            await this.updateIntegrationStatus(userId, 'disconnected');
            return { success: true, message: 'Session disconnected successfully' };
        } catch (error) {
            console.error(`[BaileysService] ❌ Error disconnecting session:`, error.message);
            throw error;
        }
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
                hasQRCode: !!sessionData.qrCode,
                createdAt: sessionData.createdAt
            });
        }
        return sessions;
    }
}

module.exports = new BaileysWhatsAppService();
