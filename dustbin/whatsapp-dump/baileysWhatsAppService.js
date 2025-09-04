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
const WebSocket = require('ws');

const { WhatsAppIntegration } = require('../schema');
const globalSettingsService = require('./globalSettingsService');

class BaileysWhatsAppService {
    constructor() {
        this.sessions = new Map();
        this.qrSessions = new Map();
        this.wss = null;
        this.setupGlobalErrorHandlers();
    }

    /**
     * Setup global error handlers to prevent server crashes
     */
    setupGlobalErrorHandlers() {
        process.on('uncaughtException', (error) => {
            console.error(`[BaileysService] 🚨 UNCAUGHT EXCEPTION:`, error.message);
            console.error(`[BaileysService] Stack:`, error.stack);
            
            // Log additional context
            console.error(`[BaileysService] 🚨 Active sessions count:`, this.sessions.size);
            console.error(`[BaileysService] 🚨 QR sessions count:`, this.qrSessions.size);
            
            // Don't exit the process, just log the error
            // This prevents server crashes from Baileys errors
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error(`[BaileysService] 🚨 UNHANDLED REJECTION at:`, promise);
            console.error(`[BaileysService] Reason:`, reason);
            
            // Log additional context
            console.error(`[BaileysService] 🚨 Active sessions count:`, this.sessions.size);
            console.error(`[BaileysService] 🚨 QR sessions count:`, this.qrSessions.size);
            
            // Don't exit the process, just log the error
            // This prevents server crashes from Baileys errors
        });

        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log(`[BaileysService] 🛑 Received SIGINT, cleaning up...`);
            await this.cleanupAllSessions();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log(`[BaileysService] 🛑 Received SIGTERM, cleaning up...`);
            await this.cleanupAllSessions();
            process.exit(0);
        });
    }

    /**
     * Cleanup all active sessions on shutdown
     */
    async cleanupAllSessions() {
        try {
            console.log(`[BaileysService] 🧹 Cleaning up all active sessions...`);
            
            const sessionKeys = Array.from(this.sessions.keys());
            console.log(`[BaileysService] 📊 Found ${sessionKeys.length} active sessions to cleanup`);
            
            for (const sessionKey of sessionKeys) {
                try {
                    const [userId, userType] = sessionKey.split('_');
                    await this.cleanupSession(userId, userType);
                    console.log(`[BaileysService] ✅ Cleaned up session: ${sessionKey}`);
                } catch (error) {
                    console.error(`[BaileysService] ❌ Error cleaning up session ${sessionKey}:`, error);
                }
            }
            
            console.log(`[BaileysService] 🎉 All sessions cleaned up successfully`);
            
        } catch (error) {
            console.error(`[BaileysService] 🚨 Error during global cleanup:`, error);
        }
    }

    /**
     * Initialize WebSocket server for QR code streaming
     */
    async initializeWebSocketServer(server) {
        try {
            const settings = await globalSettingsService.getSettings();
            const baileysConfig = settings.getWhatsAppBaileysConfig();

            this.wss = new WebSocket.Server({
                server,
                path: '/api/whatsapp/baileys/qr'
            });

            this.wss.on('connection', (ws, req) => {
                console.log(`[BaileysService] 🔌 WebSocket connection established`);

                ws.on('message', (message) => {
                    try {
                        const data = JSON.parse(message);
                        this.handleWebSocketMessage(ws, data);
                    } catch (error) {
                        console.error(`[BaileysService] Error handling WebSocket message:`, error);
                    }
                });

                ws.on('close', () => {
                    console.log(`[BaileysService] 🔌 WebSocket connection closed`);
                });

                ws.on('error', (error) => {
                    console.error(`[BaileysService] WebSocket error:`, error);
                });
            });

            console.log(`[BaileysService] 🚀 WebSocket server initialized on /api/whatsapp/baileys/qr`);
        } catch (error) {
            console.error(`[BaileysService] Error initializing WebSocket server:`, error);
            throw error;
        }
    }

    /**
     * Handle WebSocket messages
     */
    handleWebSocketMessage(ws, data) {
        const { type, userId, userType } = data;

        switch (type) {
            case 'subscribe_qr':
                this.subscribeToQR(ws, userId, userType);
                break;
            case 'unsubscribe_qr':
                this.unsubscribeFromQR(ws, userId, userType);
                break;
            default:
                console.log(`[BaileysService] Unknown WebSocket message type: ${type}`);
        }
    }

    /**
     * Subscribe to QR code updates
     */
    subscribeToQR(ws, userId, userType) {
        const sessionKey = `${userId}_${userType}`;

        if (!this.qrSessions.has(sessionKey)) {
            this.qrSessions.set(sessionKey, new Set());
        }

        this.qrSessions.get(sessionKey).add(ws);

        // Send current QR if exists
        const session = this.sessions.get(sessionKey);
        if (session && session.qrCode) {
            ws.send(JSON.stringify({
                type: 'qr_update',
                qrCode: session.qrCode,
                expiresAt: session.qrExpiresAt
            }));
        }

        console.log(`[BaileysService] 📱 User ${userId} subscribed to QR updates`);
    }

    /**
     * Unsubscribe from QR code updates
     */
    unsubscribeFromQR(ws, userId, userType) {
        const sessionKey = `${userId}_${userType}`;

        if (this.qrSessions.has(sessionKey)) {
            this.qrSessions.get(sessionKey).delete(ws);

            if (this.qrSessions.get(sessionKey).size === 0) {
                this.qrSessions.delete(sessionKey);
            }
        }

        console.log(`[BaileysService] 📱 User ${userId} unsubscribed from QR updates`);
    }

    /**
     * Broadcast QR code to all subscribed clients
     */
    broadcastQR(userId, userType, qrCode, expiresAt) {
        const sessionKey = `${userId}_${userType}`;

        if (this.qrSessions.has(sessionKey)) {
            const message = JSON.stringify({
                type: 'qr_update',
                qrCode,
                expiresAt
            });

            this.qrSessions.get(sessionKey).forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(message);
                }
            });
        }
    }

    /**
     * Broadcast connection status to all subscribed clients
     */
    broadcastConnectionStatus(userId, userType, status, phoneNumber = null) {
        console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_START: Starting broadcast for user ${userId}, status: ${status}, phone: ${phoneNumber}`);
        
        console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP1: Creating session key`);
        const sessionKey = `${userId}_${userType}`;
        console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP2: Session key created: ${sessionKey}`);

        console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP3: Checking if qrSessions has the session key`);
        const hasSession = this.qrSessions.has(sessionKey);
        console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP4: Session key exists in qrSessions: ${hasSession}`);

        if (this.qrSessions.has(sessionKey)) {
            console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP5: Session found, creating message`);
            const message = JSON.stringify({
                type: 'connection_status',
                status,
                phoneNumber
            });
            console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP6: Message created:`, message);

            console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP7: Getting WebSocket clients for session`);
            const clients = this.qrSessions.get(sessionKey);
            console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP8: Number of WebSocket clients: ${clients.size}`);

            console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP9: Starting to broadcast to each client`);
            let clientIndex = 0;
            this.qrSessions.get(sessionKey).forEach(ws => {
                clientIndex++;
                console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP10_${clientIndex}: Processing client ${clientIndex}, readyState: ${ws.readyState}`);
                
                if (ws.readyState === WebSocket.OPEN) {
                    console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP11_${clientIndex}: Client ${clientIndex} is OPEN, sending message`);
                    try {
                        ws.send(message);
                        console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP12_${clientIndex}: Message sent successfully to client ${clientIndex}`);
                    } catch (sendError) {
                        console.error(`[BaileysService] 🚨 BROADCAST_CONNECTION_STATUS_SEND_ERROR_${clientIndex}: Error sending to client ${clientIndex}:`, sendError);
                    }
                } else {
                    console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP11_${clientIndex}: Client ${clientIndex} is not OPEN (readyState: ${ws.readyState}), skipping`);
                }
            });
            
            console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP13: Broadcasting completed for all clients`);
        } else {
            console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_STEP5: No WebSocket clients found for session key: ${sessionKey}`);
        }
        
        console.log(`[BaileysService] 📡 BROADCAST_CONNECTION_STATUS_COMPLETE: Broadcast completed for user ${userId}, status: ${status}`);
    }

    /**
     * Initialize Baileys session and get QR code
     */
    async initializeSession(userId, userType) {
        try {
            console.log(`[BaileysService] 🚀 Starting Baileys initialization for ${userType} ${userId}`);
            console.log(`[BaileysService] 📊 Current sessions count: ${this.sessions.size}`);

            // Get global settings
            console.log(`[BaileysService] 🔧 Fetching global settings...`);
            const settings = await globalSettingsService.getSettings();
            const baileysConfig = settings.getWhatsAppBaileysConfig();
            console.log(`[BaileysService] ⚙️ Baileys config:`, {
                enabled: baileysConfig.enabled,
                maxSessions: baileysConfig.maxSessions,
                sessionTimeout: baileysConfig.sessionTimeout,
                qrCodeTimeout: baileysConfig.qrCodeTimeout,
                autoReconnect: baileysConfig.autoReconnect,
                browser: baileysConfig.browser,
                platform: baileysConfig.platform
            });

            if (!baileysConfig.enabled) {
                throw new Error('Baileys integration is disabled in global settings');
            }

            // Check if integration exists
            console.log(`[BaileysService] 🔍 Checking WhatsApp integration for user ${userId}...`);
            const integration = await WhatsAppIntegration.findOne({
                userId,
                userType,
                integrationType: 'baileys_personal'
            });

            if (!integration) {
                console.log(`[BaileysService] ❌ Integration not found, creating new one...`);
                // Create integration if not exists
                const newIntegration = new WhatsAppIntegration({
                    userId,
                    userType,
                    integrationType: 'baileys_personal',
                    isActive: false,
                    connectionStatus: 'disconnected',
                    settings: {
                        autoReconnect: true,
                        maxRetries: 3,
                        retryDelay: 5000
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                await newIntegration.save();
                console.log(`[BaileysService] ✅ New integration created: ${newIntegration._id}`);
            } else {
                console.log(`[BaileysService] ✅ Integration found: ${integration._id}`);
            }

            const sessionKey = `${userId}_${userType}`;
            console.log(`[BaileysService] 🔑 Session key: ${sessionKey}`);

            // Clean up any existing session in memory
            if (this.sessions.has(sessionKey)) {
                console.log(`[BaileysService] 🧹 Cleaning up existing session in memory for user ${userId}`);
                await this.cleanupSession(userId, userType);
            }

            // Clean up existing session files from disk
            console.log(`[BaileysService] 🗂️ Cleaning up existing session files for user ${userId}`);
            await this.cleanupSessionFiles(userId, userType);

            // Check session limit
            if (this.sessions.size >= baileysConfig.maxSessions) {
                throw new Error(`Maximum number of Baileys sessions (${baileysConfig.maxSessions}) reached`);
            }

            // Create session directory
            const sessionDir = path.join(__dirname, '../baileys_auth', userId.toString());
            console.log(`[BaileysService] 📁 Creating session directory: ${sessionDir}`);
            await fs.mkdir(sessionDir, { recursive: true });
            console.log(`[BaileysService] ✅ Session directory created successfully`);

            // Load or create auth state
            console.log(`[BaileysService] 🔐 Loading authentication state...`);
            const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
            console.log(`[BaileysService] ✅ Auth state loaded:`, {
                credsExists: !!state.creds,
                keysCount: Object.keys(state.keys).length,
                sessionDir: sessionDir
            });

            // Get Baileys version
            console.log(`[BaileysService] 📦 Fetching latest Baileys version...`);
            const { version } = await fetchLatestBaileysVersion();
            console.log(`[BaileysService] 📦 Baileys version: ${version}`);

            // Create WhatsApp socket with enhanced configuration
            console.log(`[BaileysService] 🔌 Creating WhatsApp socket with configuration...`);
            const socketConfig = {
                version: baileysConfig.version === 'latest' ? version : baileysConfig.version,
                auth: state,
                logger: pino({ level: 'silent' }),
                browser: Browsers[baileysConfig.platform.toLowerCase()](baileysConfig.browser),
                connectTimeoutMs: baileysConfig.connectTimeoutMs,
                keepAliveIntervalMs: baileysConfig.keepAliveIntervalMs,
                markOnlineOnConnect: baileysConfig.markOnlineOnConnect,
                emitOwnEvents: baileysConfig.emitOwnEvents,
                // Enhanced connection settings
                retryRequestDelayMs: 3000,
                maxRetries: 5,
                shouldIgnoreJid: jid => jid.includes('@broadcast'),
                // Additional stability settings
                fireInitQueries: true,
                // Connection stability
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 30000,
                // Browser settings
                browser: ['Chrome (Linux)', '', ''],
                // Additional options for stability
                printQRInTerminal: false,
                auth: {
                    creds: state.creds,
                    keys: state.keys
                }
            };
            console.log(`[BaileysService] ⚙️ Socket config:`, {
                version: socketConfig.version,
                browser: socketConfig.browser,
                connectTimeoutMs: socketConfig.connectTimeoutMs,
                keepAliveIntervalMs: socketConfig.keepAliveIntervalMs,
                retryRequestDelayMs: socketConfig.retryRequestDelayMs,
                maxRetries: socketConfig.maxRetries
            });

            const sock = makeWASocket(socketConfig);

            // Validate socket creation
            if (!sock || !sock.ev) {
                throw new Error('Failed to create WhatsApp socket - invalid socket object');
            }

            console.log(`[BaileysService] ✅ WhatsApp socket created successfully for user ${userId}`);
            console.log(`[BaileysService] 📊 Socket properties:`, {
                hasEv: !!sock.ev,
                hasUser: !!sock.user,
                hasEnd: typeof sock.end === 'function',
                hasLogout: typeof sock.logout === 'function'
            });

            // Store session data
            const sessionData = {
                sock,
                saveCreds,
                sessionDir,
                integration: integration || newIntegration,
                isConnected: false,
                phoneNumber: null,
                qrCode: null,
                qrExpiresAt: null,
                connectionStartTime: Date.now(),
                config: baileysConfig
            };

            this.sessions.set(sessionKey, sessionData);
            console.log(`[BaileysService] 💾 Session stored in memory: ${sessionKey}`);

            // Setup event handlers
            console.log(`[BaileysService] 🎧 Setting up event handlers...`);
            this.setupEventHandlers(sock, userId, userType, saveCreds);

            // Start QR code generation
            console.log(`[BaileysService] 📱 Starting QR code generation...`);
            await this.startQRCodeGeneration(sock, userId, userType);

            console.log(`[BaileysService] ✅ Session initialization completed successfully`);
            return {
                success: true,
                message: 'Baileys session initialized successfully',
                sessionId: sessionKey,
                qrCodeUrl: `/api/whatsapp/baileys/qr?userId=${userId}&userType=${userType}`
            };

        } catch (error) {
            console.error(`[BaileysService] ❌ Error initializing Baileys session:`, error);
            
            // Clean up any partial session data
            try {
                await this.cleanupSession(userId, userType);
                await this.cleanupSessionFiles(userId, userType);
            } catch (cleanupError) {
                console.error(`[BaileysService] Error during cleanup after failed initialization:`, cleanupError);
            }
            
            throw error;
        }
    }

    /**
     * Setup event handlers for Baileys socket
     */
    setupEventHandlers(sock, userId, userType, saveCreds) {
        const sessionKey = `${userId}_${userType}`;
        const session = this.sessions.get(sessionKey);

        // Connection updates
        sock.ev.on('connection.update', async (update) => {
            try {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    console.log(`[BaileysService] 📱 QR Code received for user ${userId}`);
                    await this.handleQRCode(qr, userId, userType).catch(error => {
                        console.error(`[BaileysService] Error handling QR code for user ${userId}:`, error);
                    });
                }

                if (connection) {
                    console.log(`[BaileysService] 🔌 Connection update for user ${userId}: ${connection}`);
                    await this.handleConnectionUpdate(connection, userId, userType).catch(error => {
                        console.error(`[BaileysService] Error handling connection update for user ${userId}:`, error);
                    });
                }

                if (lastDisconnect) {
                    console.log(`[BaileysService] 🔌 Disconnection for user ${userId}:`, lastDisconnect);
                    await this.handleDisconnection(lastDisconnect, userId, userType).catch(error => {
                        console.error(`[BaileysService] Error handling disconnection for user ${userId}:`, error);
                    });
                }
            } catch (error) {
                console.error(`[BaileysService] 🚨 Critical error in connection.update handler for user ${userId}:`, error);
                // Don't let this crash the server
            }
        });

        // Credentials update
        sock.ev.on('creds.update', async () => {
            try {
                await saveCreds();
                console.log(`[BaileysService] 💾 Credentials saved for user ${userId}`);
            } catch (error) {
                console.error(`[BaileysService] Error saving credentials for user ${userId}:`, error);
                // Don't let this crash the server
            }
        });

        // Messages
        sock.ev.on('messages.upsert', async (m) => {
            try {
                console.log(`[BaileysService] 📨 Message received for user ${userId}`);
                // Handle incoming messages here
            } catch (error) {
                console.error(`[BaileysService] Error handling message for user ${userId}:`, error);
                // Don't let this crash the server
            }
        });

        // Message updates
        sock.ev.on('messages.update', async (m) => {
            try {
                console.log(`[BaileysService] 📨 Message update for user ${userId}`);
                // Handle message updates here
            } catch (error) {
                console.error(`[BaileysService] Error handling message update for user ${userId}:`, error);
                // Don't let this crash the server
            }
        });

        // Add error handler for the socket itself
        sock.ev.on('error', (error) => {
            console.error(`[BaileysService] 🚨 Socket error for user ${userId}:`, error);
            // Don't let socket errors crash the server
        });
    }

    /**
     * Handle QR code generation
     */
    async handleQRCode(qr, userId, userType) {
        try {
            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_START: Starting QR code handling for user ${userId}`);
            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP1: Raw QR code received:`, qr);
            
            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP2: Creating session key`);
            const sessionKey = `${userId}_${userType}`;
            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP3: Session key created: ${sessionKey}`);
            
            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP4: Getting session from sessions map`);
            const session = this.sessions.get(sessionKey);
            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP5: Session retrieved, exists: ${!!session}`);

            if (!session) {
                console.log(`[BaileysService] 📱 HANDLE_QR_CODE_ERROR: Session not found for user ${userId}`);
                return;
            }

            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP6: Session found, processing QR code`);
            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP7: About to convert QR to data URL`);
            
            // Generate QR code image
            const qrCodeDataUrl = await qrcode.toDataURL(qr);
            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP8: QR code converted to data URL, length: ${qrCodeDataUrl.length}`);

            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP9: About to calculate expiration time`);
            // Calculate expiration time
            const expiresAt = Date.now() + session.config.qrCodeTimeout;
            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP10: Expiration time calculated: ${expiresAt}`);

            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP11: About to set QR code in session`);
            // Update session
            session.qrCode = qrCodeDataUrl;
            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP12: QR code set in session`);
            
            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP13: About to set QR expiration time in session`);
            session.qrExpiresAt = expiresAt;
            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP14: QR expiration time set in session`);

            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP15: About to broadcast QR code`);
            // Broadcast to WebSocket clients
            this.broadcastQR(userId, userType, qrCodeDataUrl, expiresAt);
            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP16: broadcastQR called successfully`);

            console.log(`[BaileysService] 📱 HANDLE_QR_CODE_STEP17: All operations completed successfully`);
            console.log(`[BaileysService] 📱 QR Code generated for user ${userId}, expires at ${new Date(expiresAt).toISOString()}`);

        } catch (error) {
            console.error(`[BaileysService] 🚨 HANDLE_QR_CODE_CRITICAL_ERROR: CRITICAL ERROR in handleQRCode for user ${userId}:`, error);
            console.error(`[BaileysService] 🚨 HANDLE_QR_CODE_CRITICAL_ERROR_STACK: Error stack:`, error.stack);
            console.error(`[BaileysService] 🚨 HANDLE_QR_CODE_CRITICAL_ERROR_DETAILS: Error details:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
            // Don't let this crash the server
        }
    }

    /**
     * Execute database operation with timeout
     */
    async executeWithTimeout(operation, timeoutMs = 10000) {
        console.log(`[BaileysService] ⏱️ EXECUTE_WITH_TIMEOUT_START: Starting timeout wrapper with ${timeoutMs}ms timeout`);
        
        return new Promise(async (resolve, reject) => {
            console.log(`[BaileysService] ⏱️ EXECUTE_WITH_TIMEOUT_STEP1: Creating timeout promise`);
            
            const timeout = setTimeout(() => {
                console.log(`[BaileysService] ⏱️ EXECUTE_WITH_TIMEOUT_TIMEOUT: Operation timed out after ${timeoutMs}ms`);
                reject(new Error(`Database operation timed out after ${timeoutMs}ms`));
            }, timeoutMs);
            
            console.log(`[BaileysService] ⏱️ EXECUTE_WITH_TIMEOUT_STEP2: Timeout set, about to execute operation`);

            try {
                console.log(`[BaileysService] ⏱️ EXECUTE_WITH_TIMEOUT_STEP3: Calling the operation function`);
                const result = await operation();
                console.log(`[BaileysService] ⏱️ EXECUTE_WITH_TIMEOUT_STEP4: Operation completed successfully, result:`, result);
                
                console.log(`[BaileysService] ⏱️ EXECUTE_WITH_TIMEOUT_STEP5: Clearing timeout`);
                clearTimeout(timeout);
                console.log(`[BaileysService] ⏱️ EXECUTE_WITH_TIMEOUT_STEP6: Timeout cleared, resolving promise`);
                resolve(result);
            } catch (error) {
                console.log(`[BaileysService] ⏱️ EXECUTE_WITH_TIMEOUT_STEP7: Operation failed with error:`, error.message);
                console.log(`[BaileysService] ⏱️ EXECUTE_WITH_TIMEOUT_STEP8: Clearing timeout due to error`);
                clearTimeout(timeout);
                console.log(`[BaileysService] ⏱️ EXECUTE_WITH_TIMEOUT_STEP9: Timeout cleared, rejecting promise`);
                reject(error);
            }
        });
    }

    /**
     * Handle connection updates
     */
    async handleConnectionUpdate(connection, userId, userType) {
        try {
            console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_START: Starting connection update handling for user ${userId}, status: ${connection}`);
            
            console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP1: Creating session key`);
            const sessionKey = `${userId}_${userType}`;
            console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP2: Session key created: ${sessionKey}`);
            
            console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP3: Getting session from sessions map`);
            const session = this.sessions.get(sessionKey);
            console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP4: Session retrieved, exists: ${!!session}`);

            if (!session) {
                console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_ERROR: Session not found for user ${userId}`);
                return;
            }

            console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP5: Session found, processing connection: ${connection}`);
            console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP6: Session object keys:`, Object.keys(session));

            console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP7: Starting switch statement for connection: ${connection}`);
            switch (connection) {
                case 'open':
                    console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP8: Handling 'open' connection for user ${userId}`);
                    try {
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP9: Setting session.isConnected = true`);
                        session.isConnected = true;
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP10: Session marked as connected for user ${userId}`);
                        
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP11: About to extract phone number from session.sock.user`);
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP12: session.sock exists: ${!!session.sock}`);
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP13: session.sock.user exists: ${!!session.sock?.user}`);
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP14: session.sock.user.id exists: ${!!session.sock?.user?.id}`);
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP15: session.sock.user.id value:`, session.sock?.user?.id);
                        
                        session.phoneNumber = session.sock.user?.id?.split('@')[0] || null;
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP16: Phone number extracted for user ${userId}: ${session.phoneNumber}`);

                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP17: About to clear QR code`);
                        session.qrCode = null;
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP18: QR code cleared`);
                        session.qrExpiresAt = null;
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP19: QR expires at cleared`);
                        console.log(`[BaileysService] 🧹 QR code cleared for user ${userId}`);

                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP20: About to update integration status in database`);
                        try {
                            console.log(`[BaileysService] 💾 HANDLE_CONNECTION_UPDATE_STEP21: Updating integration status for user ${userId}`);
                            console.log(`[BaileysService] 💾 HANDLE_CONNECTION_UPDATE_STEP22: About to call executeWithTimeout with database update`);
                            
                            await this.executeWithTimeout(async () => {
                                console.log(`[BaileysService] 💾 HANDLE_CONNECTION_UPDATE_STEP23: Inside executeWithTimeout, about to call findOneAndUpdate`);
                                const result = await WhatsAppIntegration.findOneAndUpdate(
                                    { userId, userType },
                                    {
                                        isActive: true,
                                        connectionStatus: 'connected',
                                        phoneNumber: session.phoneNumber,
                                        lastConnectedAt: new Date()
                                    }
                                );
                                console.log(`[BaileysService] 💾 HANDLE_CONNECTION_UPDATE_STEP24: findOneAndUpdate completed, result:`, result);
                                return result;
                            });
                            
                            console.log(`[BaileysService] 💾 HANDLE_CONNECTION_UPDATE_STEP25: executeWithTimeout completed successfully`);
                            console.log(`[BaileysService] 💾 Integration status updated successfully for user ${userId}`);
                        } catch (dbError) {
                            console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_DB_ERROR: Database error updating integration for user ${userId}:`, dbError);
                            console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_DB_ERROR_STACK: Database error stack:`, dbError.stack);
                            // Don't let database errors crash the connection
                        }

                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP26: About to broadcast connection status`);
                        try {
                            console.log(`[BaileysService] 📡 HANDLE_CONNECTION_UPDATE_STEP27: Broadcasting connection status for user ${userId}`);
                            console.log(`[BaileysService] 📡 HANDLE_CONNECTION_UPDATE_STEP28: About to call broadcastConnectionStatus`);
                            this.broadcastConnectionStatus(userId, userType, 'connected', session.phoneNumber);
                            console.log(`[BaileysService] 📡 HANDLE_CONNECTION_UPDATE_STEP29: broadcastConnectionStatus completed successfully`);
                            console.log(`[BaileysService] 📡 Connection status broadcasted successfully for user ${userId}`);
                        } catch (broadcastError) {
                            console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_BROADCAST_ERROR: Error broadcasting connection status for user ${userId}:`, broadcastError);
                            console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_BROADCAST_ERROR_STACK: Broadcast error stack:`, broadcastError.stack);
                            // Don't let broadcast errors crash the connection
                        }

                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP30: All operations completed successfully`);
                        console.log(`[BaileysService] ✅ Connection 'open' handled successfully for user ${userId}, phone: ${session.phoneNumber}`);
                    } catch (openError) {
                        console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_OPEN_ERROR: CRITICAL ERROR handling 'open' connection for user ${userId}:`, openError);
                        console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_OPEN_ERROR_STACK: Open error stack:`, openError.stack);
                        console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_OPEN_ERROR_DETAILS: Open error details:`, JSON.stringify(openError, Object.getOwnPropertyNames(openError)));
                        // Don't let connection open errors crash the server
                    }
                    break;

                case 'close':
                    console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP31: Handling 'close' connection for user ${userId}`);
                    try {
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP32: Setting session.isConnected = false`);
                        session.isConnected = false;
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP33: Session marked as disconnected for user ${userId}`);

                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP34: About to update integration status in database`);
                        try {
                            console.log(`[BaileysService] 💾 HANDLE_CONNECTION_UPDATE_STEP35: Updating integration status for user ${userId}`);
                            console.log(`[BaileysService] 💾 HANDLE_CONNECTION_UPDATE_STEP36: About to call executeWithTimeout with database update`);
                            
                            await this.executeWithTimeout(async () => {
                                console.log(`[BaileysService] 💾 HANDLE_CONNECTION_UPDATE_STEP37: Inside executeWithTimeout, about to call findOneAndUpdate`);
                                const result = await WhatsAppIntegration.findOneAndUpdate(
                                    { userId, userType },
                                    {
                                        isActive: false,
                                        connectionStatus: 'disconnected',
                                        lastDisconnectedAt: new Date()
                                    }
                                );
                                console.log(`[BaileysService] 💾 HANDLE_CONNECTION_UPDATE_STEP38: findOneAndUpdate completed, result:`, result);
                                return result;
                            });
                            
                            console.log(`[BaileysService] 💾 HANDLE_CONNECTION_UPDATE_STEP39: executeWithTimeout completed successfully`);
                            console.log(`[BaileysService] 💾 Integration status updated successfully for user ${userId}`);
                        } catch (dbError) {
                            console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_DB_ERROR: Database error updating integration for user ${userId}:`, dbError);
                            console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_DB_ERROR_STACK: Database error stack:`, dbError.stack);
                            // Don't let database errors crash the connection
                        }

                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP40: About to broadcast disconnection status`);
                        try {
                            console.log(`[BaileysService] 📡 HANDLE_CONNECTION_UPDATE_STEP41: Broadcasting disconnection status for user ${userId}`);
                            console.log(`[BaileysService] 📡 HANDLE_CONNECTION_UPDATE_STEP42: About to call broadcastConnectionStatus`);
                            this.broadcastConnectionStatus(userId, userType, 'disconnected');
                            console.log(`[BaileysService] 📡 HANDLE_CONNECTION_UPDATE_STEP43: broadcastConnectionStatus completed successfully`);
                            console.log(`[BaileysService] 📡 Disconnection status broadcasted successfully for user ${userId}`);
                        } catch (broadcastError) {
                            console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_BROADCAST_ERROR: Error broadcasting disconnection status for user ${userId}:`, broadcastError);
                            console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_BROADCAST_ERROR_STACK: Broadcast error stack:`, broadcastError.stack);
                            // Don't let broadcast errors crash the connection
                        }

                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP44: All operations completed successfully`);
                        console.log(`[BaileysService] ✅ Connection 'close' handled successfully for user ${userId}`);
                    } catch (closeError) {
                        console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_CLOSE_ERROR: CRITICAL ERROR handling 'close' connection for user ${userId}:`, closeError);
                        console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_CLOSE_ERROR_STACK: Close error stack:`, closeError.stack);
                        console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_CLOSE_ERROR_DETAILS: Close error details:`, JSON.stringify(closeError, Object.getOwnPropertyNames(closeError)));
                        // Don't let connection close errors crash the server
                    }
                    break;

                case 'connecting':
                    console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP45: Handling 'connecting' status for user ${userId}`);
                    try {
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP46: Setting session.isConnected = false`);
                        session.isConnected = false;
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP47: About to call broadcastConnectionStatus`);
                        this.broadcastConnectionStatus(userId, userType, 'connecting');
                        console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP48: broadcastConnectionStatus completed successfully`);
                        console.log(`[BaileysService] ✅ Connection 'connecting' handled successfully for user ${userId}`);
                    } catch (connectingError) {
                        console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_CONNECTING_ERROR: CRITICAL ERROR handling 'connecting' status for user ${userId}:`, connectingError);
                        console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_CONNECTING_ERROR_STACK: Connecting error stack:`, connectingError.stack);
                        console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_CONNECTING_ERROR_DETAILS: Connecting error details:`, JSON.stringify(connectingError, Object.getOwnPropertyNames(connectingError)));
                        // Don't let connecting errors crash the server
                    }
                    break;

                default:
                    console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP49: Unknown connection status for user ${userId}: ${connection}`);
                    break;
            }

            console.log(`[BaileysService] 🔌 HANDLE_CONNECTION_UPDATE_STEP50: Switch statement completed`);
            console.log(`[BaileysService] 🔌 Connection update handling completed for user ${userId}, status: ${connection}`);

        } catch (error) {
            console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_CRITICAL_ERROR: CRITICAL ERROR in handleConnectionUpdate for user ${userId}:`, error);
            console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_CRITICAL_ERROR_STACK: Error stack:`, error.stack);
            console.error(`[BaileysService] 🚨 HANDLE_CONNECTION_UPDATE_CRITICAL_ERROR_DETAILS: Error details:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
            // Don't let this crash the server
        }
    }

    /**
     * Handle disconnection
     */
    async handleDisconnection(lastDisconnect, userId, userType) {
        try {
            console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_START: Starting disconnection handling for user ${userId}`);
            console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP1: lastDisconnect object:`, JSON.stringify(lastDisconnect, null, 2));
            
            console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP2: Creating session key`);
            const sessionKey = `${userId}_${userType}`;
            console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP3: Session key created: ${sessionKey}`);
            
            console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP4: Getting session from sessions map`);
            const session = this.sessions.get(sessionKey);
            console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP5: Session retrieved, exists: ${!!session}`);

            if (!session) {
                console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_ERROR: Session not found for user ${userId}`);
                return;
            }

            console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP6: Session found, processing disconnection`);
            console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP7: Setting session.isConnected = false`);
            session.isConnected = false;
            console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP8: Session marked as disconnected for user ${userId}`);

            console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP9: About to update integration status in database`);
            try {
                console.log(`[BaileysService] 💾 HANDLE_DISCONNECTION_STEP10: Updating integration status for user ${userId}`);
                console.log(`[BaileysService] 💾 HANDLE_DISCONNECTION_STEP11: About to call executeWithTimeout with database update`);
                
                await this.executeWithTimeout(async () => {
                    console.log(`[BaileysService] 💾 HANDLE_DISCONNECTION_STEP12: Inside executeWithTimeout, about to call findOneAndUpdate`);
                    const result = await WhatsAppIntegration.findOneAndUpdate(
                        { userId, userType },
                        {
                            isActive: false,
                            connectionStatus: 'disconnected',
                            lastDisconnectedAt: new Date()
                        }
                    );
                    console.log(`[BaileysService] 💾 HANDLE_DISCONNECTION_STEP13: findOneAndUpdate completed, result:`, result);
                    return result;
                });
                
                console.log(`[BaileysService] 💾 HANDLE_DISCONNECTION_STEP14: executeWithTimeout completed successfully`);
                console.log(`[BaileysService] 💾 Integration status updated successfully for user ${userId}`);
            } catch (dbError) {
                console.error(`[BaileysService] 🚨 HANDLE_DISCONNECTION_DB_ERROR: Database error updating integration for user ${userId}:`, dbError);
                console.error(`[BaileysService] 🚨 HANDLE_DISCONNECTION_DB_ERROR_STACK: Database error stack:`, dbError.stack);
                // Don't let database errors crash the disconnection
            }

            console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP15: About to broadcast disconnection status`);
            try {
                console.log(`[BaileysService] 📡 HANDLE_DISCONNECTION_STEP16: Broadcasting disconnection status for user ${userId}`);
                console.log(`[BaileysService] 📡 HANDLE_DISCONNECTION_STEP17: About to call broadcastConnectionStatus`);
                this.broadcastConnectionStatus(userId, userType, 'disconnected');
                console.log(`[BaileysService] 📡 HANDLE_DISCONNECTION_STEP18: broadcastConnectionStatus completed successfully`);
                console.log(`[BaileysService] 📡 Disconnection status broadcasted successfully for user ${userId}`);
            } catch (broadcastError) {
                console.error(`[BaileysService] 🚨 HANDLE_DISCONNECTION_BROADCAST_ERROR: Error broadcasting disconnection status for user ${userId}:`, broadcastError);
                console.error(`[BaileysService] 🚨 HANDLE_DISCONNECTION_BROADCAST_ERROR_STACK: Broadcast error stack:`, broadcastError.stack);
                // Don't let broadcast errors crash the disconnection
            }

            console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP19: About to attempt reconnection`);
            try {
                console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP20: About to call executeWithTimeout with reconnectSession`);
                await this.executeWithTimeout(async () => {
                    console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP21: Inside executeWithTimeout, about to call reconnectSession`);
                    await this.reconnectSession(userId, userType);
                    console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP22: reconnectSession completed successfully`);
                });
                console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP23: executeWithTimeout completed successfully`);
                console.log(`[BaileysService] 🔌 Reconnection attempted successfully for user ${userId}`);
            } catch (reconnectError) {
                console.error(`[BaileysService] 🚨 HANDLE_DISCONNECTION_RECONNECT_ERROR: Error during reconnection for user ${userId}:`, reconnectError);
                console.error(`[BaileysService] 🚨 HANDLE_DISCONNECTION_RECONNECT_ERROR_STACK: Reconnect error stack:`, reconnectError.stack);
                // Don't let reconnection errors crash the disconnection
            }

            console.log(`[BaileysService] 🔌 HANDLE_DISCONNECTION_STEP24: All operations completed successfully`);
            console.log(`[BaileysService] ✅ Disconnection handled successfully for user ${userId}`);

        } catch (error) {
            console.error(`[BaileysService] 🚨 HANDLE_DISCONNECTION_CRITICAL_ERROR: CRITICAL ERROR in handleDisconnection for user ${userId}:`, error);
            console.error(`[BaileysService] 🚨 HANDLE_DISCONNECTION_CRITICAL_ERROR_STACK: Error stack:`, error.stack);
            console.error(`[BaileysService] 🚨 HANDLE_DISCONNECTION_CRITICAL_ERROR_DETAILS: Error details:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
            // Don't let this crash the server
        }
    }

    /**
     * Start QR code generation
     */
    async startQRCodeGeneration(sock, userId, userType) {
        try {
            console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_START: Starting QR code generation for user ${userId}`);
            
            console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP1: Creating session key`);
            const sessionKey = `${userId}_${userType}`;
            console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP2: Session key created: ${sessionKey}`);
            
            console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP3: Getting session from sessions map`);
            const session = this.sessions.get(sessionKey);
            console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP4: Session retrieved, exists: ${!!session}`);

            if (!session) {
                console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_ERROR: Session not found for user ${userId}`);
                return;
            }

            console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP5: Session found, starting QR generation`);
            console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP6: About to wait for QR code from event handler`);
            
            // Wait for QR code to be generated by the event handler
            let attempts = 0;
            const maxAttempts = 30; // Wait up to 30 seconds
            
            console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP7: Starting QR code wait loop, max attempts: ${maxAttempts}`);
            
            while (!session.qrCode && attempts < maxAttempts) {
                attempts++;
                console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP8_${attempts}: Wait attempt ${attempts}/${maxAttempts}, session.qrCode exists: ${!!session.qrCode}`);
                
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP9_${attempts}: Waited 1 second, checking again`);
            }

            if (session.qrCode) {
                console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP10: QR code received after ${attempts} attempts`);
                console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP11: QR code length: ${session.qrCode.length}`);
                console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP12: QR expires at: ${session.qrExpiresAt}`);
                console.log(`[BaileysService] 📱 QR Code generation completed successfully for user ${userId}`);
            } else {
                console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP10: QR code not received after ${maxAttempts} attempts`);
                console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP11: QR generation timed out for user ${userId}`);
                console.log(`[BaileysService] 📱 QR Code generation timed out for user ${userId}`);
            }

            console.log(`[BaileysService] 📱 START_QR_CODE_GENERATION_STEP12: All operations completed successfully`);

        } catch (error) {
            console.error(`[BaileysService] 🚨 START_QR_CODE_GENERATION_CRITICAL_ERROR: CRITICAL ERROR in startQRCodeGeneration for user ${userId}:`, error);
            console.error(`[BaileysService] 🚨 START_QR_CODE_GENERATION_CRITICAL_ERROR_STACK: Error stack:`, error.stack);
            console.error(`[BaileysService] 🚨 START_QR_CODE_GENERATION_CRITICAL_ERROR_DETAILS: Error details:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
            // Don't let this crash the server
        }
    }

    /**
     * Get QR code for a user
     */
    async getQRCode(userId, userType) {
        try {
            const sessionKey = `${userId}_${userType}`;
            const session = this.sessions.get(sessionKey);

            if (!session) {
                throw new Error('Baileys session not found. Please initialize the session first.');
            }

            if (!session.qrCode) {
                throw new Error('QR code not available. Please wait for QR code generation or reinitialize the session.');
            }

            // Check if QR code has expired
            if (session.qrExpiresAt && new Date() > session.qrExpiresAt) {
                // Clear expired QR code
                session.qrCode = null;
                session.qrExpiresAt = null;
                throw new Error('QR code has expired. Please reinitialize the session.');
            }

            return {
                success: true,
                qrCode: session.qrCode,
                expiresAt: session.qrExpiresAt,
                sessionKey: sessionKey
            };

        } catch (error) {
            console.error(`[BaileysService] Error getting QR code:`, error);
            return {
                success: false,
                message: error.message,
                error: error.message
            };
        }
    }

    /**
     * Refresh QR code for a user
     */
    async refreshQRCode(userId, userType) {
        try {
            const sessionKey = `${userId}_${userType}`;
            const session = this.sessions.get(sessionKey);

            if (!session) {
                throw new Error('Baileys session not found. Please initialize the session first.');
            }

            if (!session.sock) {
                throw new Error('WhatsApp socket not available. Please reinitialize the session.');
            }

            console.log(`[BaileysService] 🔄 Refreshing QR code for user ${userId}`);

            // Clear existing QR code
            session.qrCode = null;
            session.qrExpiresAt = null;

            // Generate new QR code
            const newQRCode = await this.startQRCodeGeneration(session.sock, userId, userType);

            return {
                success: true,
                qrCode: newQRCode,
                expiresAt: session.qrExpiresAt,
                message: 'QR code refreshed successfully'
            };

        } catch (error) {
            console.error(`[BaileysService] Error refreshing QR code:`, error);
            return {
                success: false,
                message: error.message,
                error: error.message
            };
        }
    }

    /**
     * Reconnect session
     */
    async reconnectSession(userId, userType) {
        try {
            console.log(`[BaileysService] 🔄 Reconnecting session for user ${userId}`);

            // Clean up existing session
            await this.cleanupSession(userId, userType);

            // Reinitialize session
            await this.initializeSession(userId, userType);

            console.log(`[BaileysService] ✅ Session reconnected for user ${userId}`);

        } catch (error) {
            console.error(`[BaileysService] Error reconnecting session:`, error);
            throw error;
        }
    }

    /**
     * Clean up session files from disk
     */
    async cleanupSessionFiles(userId, userType) {
        try {
            const sessionDir = path.join(__dirname, '../baileys_auth', userId.toString());
            console.log(`[BaileysService] 🗂️ Checking for existing session files in: ${sessionDir}`);

            // Check if session directory exists
            try {
                const stats = await fs.stat(sessionDir);
                if (stats.isDirectory()) {
                    console.log(`[BaileysService] 📁 Found existing session directory, cleaning up...`);
                    
                    // Read all files in the directory
                    const files = await fs.readdir(sessionDir);
                    console.log(`[BaileysService] 📄 Found ${files.length} session files to clean up`);

                    // Delete all session files
                    for (const file of files) {
                        const filePath = path.join(sessionDir, file);
                        try {
                            await fs.unlink(filePath);
                            console.log(`[BaileysService] 🗑️ Deleted session file: ${file}`);
                        } catch (fileError) {
                            console.warn(`[BaileysService] ⚠️ Could not delete file ${file}:`, fileError.message);
                        }
                    }

                    // Remove the directory itself
                    try {
                        await fs.rmdir(sessionDir);
                        console.log(`[BaileysService] 🗑️ Removed session directory: ${sessionDir}`);
                    } catch (dirError) {
                        console.warn(`[BaileysService] ⚠️ Could not remove directory ${sessionDir}:`, dirError.message);
                    }
                }
            } catch (error) {
                if (error.code === 'ENOENT') {
                    console.log(`[BaileysService] ℹ️ No existing session directory found for user ${userId}`);
                } else {
                    console.warn(`[BaileysService] ⚠️ Error checking session directory:`, error.message);
                }
            }
        } catch (error) {
            console.error(`[BaileysService] Error cleaning up session files:`, error);
            // Don't throw error here as we want to continue with session initialization
        }
    }

    /**
     * Cleanup session
     */
    async cleanupSession(userId, userType) {
        try {
            const sessionKey = `${userId}_${userType}`;
            const session = this.sessions.get(sessionKey);

            if (!session) {
                return;
            }

            // Disconnect socket
            if (session.sock) {
                try {
                    session.sock.end();
                    console.log(`[BaileysService] 🔌 Socket disconnected for user ${userId}`);
                } catch (socketError) {
                    console.warn(`[BaileysService] ⚠️ Error disconnecting socket:`, socketError.message);
                }
            }

            // Clear QR sessions
            if (this.qrSessions.has(sessionKey)) {
                this.qrSessions.get(sessionKey).forEach(ws => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    }
                });
                this.qrSessions.delete(sessionKey);
                console.log(`[BaileysService] 🔌 QR sessions cleared for user ${userId}`);
            }

            // Remove from sessions map
            this.sessions.delete(sessionKey);
            console.log(`[BaileysService] 🧹 Session removed from memory for user ${userId}`);

            // Clean up session files from disk
            await this.cleanupSessionFiles(userId, userType);

            console.log(`[BaileysService] 🧹 Session cleanup completed for user ${userId}`);

        } catch (error) {
            console.error(`[BaileysService] Error cleaning up session:`, error);
        }
    }

    /**
     * Get session status
     */
    getSessionStatus(userId, userType) {
        const sessionKey = `${userId}_${userType}`;
        const session = this.sessions.get(sessionKey);

        if (!session) {
            return {
                exists: false,
                isConnected: false,
                phoneNumber: null,
                qrCode: null,
                qrExpiresAt: null
            };
        }

        return {
            exists: true,
            isConnected: session.isConnected,
            phoneNumber: session.phoneNumber,
            qrCode: session.qrCode,
            qrExpiresAt: session.qrExpiresAt,
            connectionStartTime: session.connectionStartTime
        };
    }

    /**
     * Get all sessions (for admin purposes)
     */
    getAllSessions() {
        const sessions = {};

        for (const [sessionKey, session] of this.sessions) {
            sessions[sessionKey] = {
                isConnected: session.isConnected,
                phoneNumber: session.phoneNumber,
                connectionStartTime: session.connectionStartTime,
                integration: session.integration
            };
        }

        return sessions;
    }

    /**
     * Get session file information for debugging
     */
    async getSessionFileInfo(userId, userType) {
        try {
            const sessionDir = path.join(__dirname, '../baileys_auth', userId.toString());
            
            try {
                const stats = await fs.stat(sessionDir);
                if (stats.isDirectory()) {
                    const files = await fs.readdir(sessionDir);
                    const fileInfo = [];
                    
                    for (const file of files) {
                        try {
                            const filePath = path.join(sessionDir, file);
                            const fileStats = await fs.stat(filePath);
                            fileInfo.push({
                                name: file,
                                size: fileStats.size,
                                modified: fileStats.mtime,
                                isDirectory: fileStats.isDirectory()
                            });
                        } catch (fileError) {
                            fileInfo.push({
                                name: file,
                                error: fileError.message
                            });
                        }
                    }
                    
                    return {
                        exists: true,
                        directory: sessionDir,
                        fileCount: files.length,
                        files: fileInfo,
                        directoryStats: {
                            created: stats.birthtime,
                            modified: stats.mtime,
                            size: stats.size
                        }
                    };
                }
            } catch (error) {
                if (error.code === 'ENOENT') {
                    return {
                        exists: false,
                        directory: sessionDir,
                        fileCount: 0,
                        files: [],
                        message: 'Session directory does not exist'
                    };
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error(`[BaileysService] Error getting session file info:`, error);
            throw error;
        }
    }

    /**
     * Force cleanup all session files for a user (admin operation)
     */
    async forceCleanupUserSessions(userId, userType) {
        try {
            console.log(`[BaileysService] 🧹 Force cleaning up all sessions for user ${userId}`);
            
            // Clean up session in memory
            await this.cleanupSession(userId, userType);
            
            // Force clean up session files from disk
            await this.cleanupSessionFiles(userId, userType);
            
            console.log(`[BaileysService] ✅ Force cleanup completed for user ${userId}`);
            return { success: true, message: 'All sessions and files cleaned up successfully' };
            
        } catch (error) {
            console.error(`[BaileysService] Error during force cleanup:`, error);
            throw error;
        }
    }

    /**
     * Send message via Baileys
     */
    async sendMessage(userId, userType, to, message, options = {}) {
        try {
            const sessionKey = `${userId}_${userType}`;
            const session = this.sessions.get(sessionKey);

            if (!session) {
                throw new Error('Baileys session not found');
            }

            if (!session.isConnected) {
                throw new Error('Baileys session not connected');
            }

            const settings = await globalSettingsService.getSettings();
            const generalConfig = settings.getWhatsAppGeneralConfig();

            // Validate message length
            if (message.length > generalConfig.maxMessageLength) {
                throw new Error(`Message too long. Maximum length is ${generalConfig.maxMessageLength} characters`);
            }

            // Format phone number
            const formattedNumber = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;

            // Send message
            const result = await session.sock.sendMessage(formattedNumber, message, options);

            console.log(`[BaileysService] 📨 Message sent successfully for user ${userId}`);

            return {
                success: true,
                messageId: result.key.id,
                timestamp: result.key.timestamp
            };

        } catch (error) {
            console.error(`[BaileysService] Error sending message:`, error);
            throw error;
        }
    }

    /**
     * Get QR code for a user
     */
    async getQRCode(userId, userType) {
        try {
            const sessionKey = `${userId}_${userType}`;
            const session = this.sessions.get(sessionKey);

            if (!session) {
                throw new Error('Baileys session not found. Please initialize the session first.');
            }

            if (!session.qrCode) {
                throw new Error('QR code not available. Please wait for QR code generation or reinitialize the session.');
            }

            // Check if QR code has expired
            if (session.qrExpiresAt && new Date() > session.qrExpiresAt) {
                // Clear expired QR code
                session.qrCode = null;
                session.qrExpiresAt = null;
                throw new Error('QR code has expired. Please reinitialize the session.');
            }

            return {
                success: true,
                qrCode: session.qrCode,
                expiresAt: session.qrExpiresAt,
                sessionKey: sessionKey
            };

        } catch (error) {
            console.error(`[BaileysService] Error getting QR code:`, error);
            return {
                success: false,
                message: error.message,
                error: error.message
            };
        }
    }

    /**
     * Refresh QR code for a user
     */
    async refreshQRCode(userId, userType) {
        try {
            const sessionKey = `${userId}_${userType}`;
            const session = this.sessions.get(sessionKey);

            if (!session) {
                throw new Error('Baileys session not found. Please initialize the session first.');
            }

            if (!session.sock) {
                throw new Error('WhatsApp socket not available. Please reinitialize the session.');
            }

            console.log(`[BaileysService] 🔄 Refreshing QR code for user ${userId}`);

            // Clear existing QR code
            session.qrCode = null;
            session.qrExpiresAt = null;

            // Generate new QR code
            const newQRCode = await this.startQRCodeGeneration(session.sock, userId, userType);

            return {
                success: true,
                qrCode: newQRCode,
                expiresAt: session.qrExpiresAt,
                message: 'QR code refreshed successfully'
            };

        } catch (error) {
            console.error(`[BaileysService] Error refreshing QR code:`, error);
            return {
                success: false,
                message: error.message,
                error: error.message
            };
        }
    }

    /**
     * Disconnect session
     */
    async disconnectSession(userId, userType) {
        try {
            console.log(`[BaileysService] 🔌 Disconnecting session for user ${userId}`);

            await this.cleanupSession(userId, userType);

            // Update integration status
            await WhatsAppIntegration.findOneAndUpdate(
                { userId, userType },
                {
                    isActive: false,
                    connectionStatus: 'disconnected',
                    lastDisconnectedAt: new Date()
                }
            );

            console.log(`[BaileysService] ✅ Session disconnected for user ${userId}`);

        } catch (error) {
            console.error(`[BaileysService] Error disconnecting session:`, error);
            throw error;
        }
    }
}

module.exports = new BaileysWhatsAppService();
