const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

// Import schemas
const WhatsAppDevice = require('../schemas/WhatsAppDevice');
const WhatsAppMessage = require('../schemas/WhatsAppMessage');
const WhatsAppConversation = require('../schemas/WhatsAppConversation');

class BaileysService {
    constructor() {
        this.sockets = new Map();
        this.deviceStates = new Map();
        this.qrCodes = new Map();
        this.connectionStates = new Map();
        
        console.log('🚀 BaileysService initialized');
    }

    async initializeDevice(deviceId, coachId) {
        try {
            console.log(`[BaileysService] Initializing device ${deviceId} for coach ${coachId}`);
            
            // Check if device exists (should be created by main application)
            const device = await WhatsAppDevice.findById(deviceId);
            
            if (!device) {
                throw new Error(`Device ${deviceId} not found. Device must be created through the main application first.`);
            }
            
            console.log(`[BaileysService] Found existing device: ${device.deviceName} (${device.deviceType})`);

            // Create auth directory for this device
            const authDir = path.join(__dirname, '..', 'auth', deviceId);
            
            // Delete existing session files to force fresh QR generation
            if (fs.existsSync(authDir)) {
                console.log(`[BaileysService] Deleting existing session files for fresh QR generation...`);
                try {
                    fs.rmSync(authDir, { recursive: true, force: true });
                    console.log(`[BaileysService] ✅ Deleted existing session files`);
                } catch (deleteError) {
                    console.warn(`[BaileysService] ⚠️ Could not delete session files:`, deleteError.message);
                }
            }
            
            // Create fresh auth directory
            fs.mkdirSync(authDir, { recursive: true });
            console.log(`[BaileysService] Created fresh auth directory: ${authDir}`);

            // Use multi-file auth state
            const { state, saveCreds } = await useMultiFileAuthState(authDir);
            console.log(`[BaileysService] Auth state loaded for device ${deviceId}`);

            // Create socket with stable configuration
            let socket;
            try {
                socket = makeWASocket({
                    auth: state,
                    printQRInTerminal: false,
                    browser: ['WhatsApp Client', 'Chrome', '1.0.0'],
                    // Add connection stability options
                    connectTimeoutMs: 60000,
                    keepAliveIntervalMs: 30000,
                    retryRequestDelayMs: 250,
                    maxMsgRetryCount: 5,
                    // Handle WhatsApp's connection patterns
                    defaultQueryTimeoutMs: 60000,
                    // Reduce aggressive reconnection
                    shouldIgnoreJid: (jid) => false
                    // Removed custom logger to prevent errors
                });
                console.log(`[BaileysService] Socket created successfully for device ${deviceId}`);
            } catch (socketError) {
                console.error(`[BaileysService] Error creating socket for device ${deviceId}:`, socketError);
                throw new Error(`Failed to create WhatsApp socket: ${socketError.message}`);
            }

            // Store socket and device state
            this.sockets.set(deviceId, socket);
            this.deviceStates.set(deviceId, { device, saveCreds, authDir });
            this.connectionStates.set(deviceId, 'initializing');

            // Update device status (skip validation to prevent schema conflicts)
            try {
                await WhatsAppDevice.findByIdAndUpdate(deviceId, {
                    isConnected: false,
                    lastConnected: new Date()
                }, { 
                    new: true,
                    runValidators: false // Skip validation to prevent schema conflicts
                });
                console.log(`[BaileysService] Device ${deviceId} status updated in database`);
            } catch (dbError) {
                console.warn(`[BaileysService] Could not update device ${deviceId} in database:`, dbError.message);
                // Continue with initialization even if DB update fails
            }

            // Set up event handlers (simplified like working version)
            socket.ev.on('connection.update', async (update) => {
                try {
                    await this.handleConnectionUpdate(deviceId, update);
                } catch (error) {
                    console.error(`[BaileysService] Error in connection.update handler for device ${deviceId}:`, error);
                }
            });

            socket.ev.on('creds.update', (creds) => {
                try {
                    saveCreds(creds);
                    console.log(`[BaileysService] Credentials updated for device ${deviceId}`);
                } catch (error) {
                    console.error(`[BaileysService] Error saving credentials for device ${deviceId}:`, error);
                }
            });

            socket.ev.on('messages.upsert', async (m) => {
                try {
                    await this.handleIncomingMessages(deviceId, m);
                } catch (error) {
                    console.error(`[BaileysService] Error in messages.upsert handler for device ${deviceId}:`, error);
                }
            });

            socket.ev.on('messages.update', async (updates) => {
                try {
                    await this.handleMessageUpdates(deviceId, updates);
                } catch (error) {
                    console.error(`[BaileysService] Error in messages.update handler for device ${deviceId}:`, error);
                }
            });

            socket.ev.on('error', (error) => {
                console.error(`[BaileysService] Socket error for device ${deviceId}:`, error);
            });

            // Wait longer for QR generation and verify it's available
            console.log(`[BaileysService] Waiting for QR generation...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Check if QR was generated
            const qrData = this.qrCodes.get(deviceId);
            if (qrData && qrData.expiresAt > Date.now()) {
                console.log(`[BaileysService] ✅ QR code generated successfully for device ${deviceId}`);
            } else {
                console.log(`[BaileysService] ⚠️ QR code not yet available for device ${deviceId}, will be generated on first connection attempt`);
            }

            console.log(`[BaileysService] Device ${deviceId} initialized successfully`);

            return {
                success: true,
                message: 'Device initialized successfully',
                deviceId,
                sessionId: `session_${deviceId}`,
                qrAvailable: qrData ? true : false
            };

        } catch (error) {
            console.error(`[BaileysService] Error initializing device ${deviceId}:`, error);
            // Clean up on error
            this.cleanupDevice(deviceId);
            throw error;
        }
    }

    async handleConnectionUpdate(deviceId, update) {
        const deviceState = this.deviceStates.get(deviceId);
        if (!deviceState) {
            console.warn(`[BaileysService] No device state found for ${deviceId}`);
            return;
        }

        const { device } = deviceState;
        const { connection, lastDisconnect, qr } = update;

        console.log(`[BaileysService] Connection update for device ${deviceId}:`, {
            connection,
            hasQR: !!qr,
            lastDisconnect: lastDisconnect ? { error: lastDisconnect.error?.message } : null
        });

        if (connection === 'close') {
            // Check if this is a stream error (normal WhatsApp behavior)
            const isStreamError = lastDisconnect?.error?.message?.includes('Stream Errored') || 
                                lastDisconnect?.error?.message?.includes('restart required');
            
            const shouldReconnect = lastDisconnect?.error instanceof Boom &&
                lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;

            // Update device status (skip validation to prevent schema conflicts)
            try {
                await WhatsAppDevice.findByIdAndUpdate(deviceId, {
                    isConnected: false,
                    qrCode: null
                }, { 
                    new: true,
                    runValidators: false
                });
                console.log(`[BaileysService] Device ${deviceId} status updated (disconnected)`);
            } catch (dbError) {
                console.warn(`[BaileysService] Could not update device ${deviceId}:`, dbError.message);
            }

            this.connectionStates.set(deviceId, 'disconnected');

            if (isStreamError) {
                console.log(`[BaileysService] Stream error detected for device ${deviceId} - this is normal WhatsApp behavior`);
                console.log(`[BaileysService] Device ${deviceId} will reconnect automatically when needed`);
                // Don't auto-reconnect for stream errors - let WhatsApp handle it
            } else if (shouldReconnect) {
                console.log(`[BaileysService] Reconnecting device ${deviceId} in 5 seconds...`);
                // Use setTimeout with proper error handling to prevent server crashes
                setTimeout(() => {
                    try {
                        this.initializeDevice(deviceId, device.coachId);
                    } catch (error) {
                        console.error(`[BaileysService] Error during reconnection for device ${deviceId}:`, error);
                    }
                }, 5000);
            } else {
                console.log(`[BaileysService] Device ${deviceId} logged out, cleaning up`);
                this.cleanupDevice(deviceId);
            }
        } else if (connection === 'open') {
            device.isConnected = true;
            device.qrCode = null;
            device.lastConnected = new Date();
            
            // Update device status (skip validation to prevent schema conflicts)
            try {
                const updateData = {
                    isConnected: true,
                    qrCode: null,
                    lastConnected: new Date()
                };
                
                // Get phone number from socket
                const socket = this.sockets.get(deviceId);
                if (socket && socket.user) {
                    updateData.phoneNumber = socket.user.id.split(':')[0];
                    updateData.sessionId = `session_${deviceId}`;
                }
                
                await WhatsAppDevice.findByIdAndUpdate(deviceId, updateData, { 
                    new: true,
                    runValidators: false
                });
                console.log(`[BaileysService] Device ${deviceId} status updated (connected)`);
            } catch (dbError) {
                console.warn(`[BaileysService] Could not update device ${deviceId}:`, dbError.message);
            }
            this.connectionStates.set(deviceId, 'connected');
            console.log(`[BaileysService] Device ${deviceId} connected! Phone: ${device.phoneNumber}`);
        } else if (qr) {
            device.isConnected = false;
            try {
                console.log(`[BaileysService] Generating QR code for device ${deviceId}...`);
                const qrCodeDataUrl = await QRCode.toDataURL(qr);
                
                // Update device with QR code (skip validation to prevent schema conflicts)
                try {
                    await WhatsAppDevice.findByIdAndUpdate(deviceId, {
                        qrCode: qrCodeDataUrl,
                        isConnected: false
                    }, { 
                        new: true,
                        runValidators: false
                    });
                    console.log(`[BaileysService] Device ${deviceId} QR code updated in database`);
                } catch (dbError) {
                    console.warn(`[BaileysService] Could not update device ${deviceId} QR code:`, dbError.message);
                }
                
                // Store QR code in memory for quick access
                this.qrCodes.set(deviceId, {
                    qr: qrCodeDataUrl,
                    timestamp: Date.now(),
                    expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
                });
                
                this.connectionStates.set(deviceId, 'qr_ready');
                console.log(`[BaileysService] ✅ QR code generated for device ${deviceId}`);
                console.log(`[BaileysService] QR code length: ${qrCodeDataUrl.length} characters`);
            } catch (error) {
                console.error(`[BaileysService] ❌ Error generating QR code for device ${deviceId}:`, error);
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

                console.log(`[BaileysService] Incoming message saved for device ${deviceId}: ${messageData.messageId}`);
            }
        } catch (error) {
            console.error(`[BaileysService] Error handling incoming messages for device ${deviceId}:`, error);
        }
    }

    async handleMessageUpdates(deviceId, updates) {
        try {
            for (const update of updates) {
                await WhatsAppMessage.findOneAndUpdate(
                    { messageId: update.key.id, deviceId },
                    { status: this.getStatusFromUpdate(update) }
                );
            }
        } catch (error) {
            console.error(`[BaileysService] Error handling message updates for device ${deviceId}:`, error);
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
        return 'text';
    }

    extractMessageContent(message) {
        const content = {};

        if (message.message?.conversation) {
            content.text = message.message.conversation;
        } else if (message.message?.imageMessage) {
            content.caption = message.message.imageMessage.caption;
            content.mediaType = 'image';
        } else if (message.message?.videoMessage) {
            content.caption = message.message.videoMessage.caption;
            content.mediaType = 'video';
        } else if (message.message?.audioMessage) {
            content.mediaType = 'audio';
        } else if (message.message?.documentMessage) {
            content.caption = message.message.documentMessage.caption;
            content.mediaType = 'document';
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
                number: message.message.contactMessage.vcard
            };
        }

        return content;
    }

    getStatusFromUpdate(update) {
        if (update.status === 'read') return 'read';
        if (update.status === 'delivered') return 'delivered';
        return 'sent';
    }

    async updateConversation(deviceId, participant, lastMessageId) {
        try {
            const conversation = await WhatsAppConversation.findOneAndUpdate(
                { deviceId, participant },
                {
                    $inc: { unreadCount: 1, messageCount: 1 },
                    lastMessage: lastMessageId,
                    lastMessageTime: new Date()
                },
                { upsert: true, new: true }
            );

            return conversation;
        } catch (error) {
            console.error(`[BaileysService] Error updating conversation:`, error);
        }
    }

    async sendMessage(deviceId, to, message, type = 'text') {
        try {
            console.log(`[BaileysService] Attempting to send message from device: ${deviceId}`);
            
            const socket = this.sockets.get(deviceId);
            if (!socket) {
                console.log(`[BaileysService] Socket not found for device: ${deviceId}`);
                throw new Error('Device not connected');
            }

            // Check if socket is actually connected
            if (!socket.user) {
                console.log(`[BaileysService] Socket user not found for device: ${deviceId}`);
                throw new Error('Device not authenticated');
            }

            // Double-check device status in database
            const device = await WhatsAppDevice.findById(deviceId);
            if (!device || device.status !== 'connected') {
                console.log(`[BaileysService] Device status check failed: ${device?.status || 'unknown'}`);
                throw new Error(`Device status is ${device?.status || 'unknown'}, not connected`);
            }

            console.log(`[BaileysService] All checks passed, sending message to: ${to}`);

            let messageContent;
            
            switch (type) {
                case 'text':
                    messageContent = { text: message };
                    break;
                case 'image':
                    messageContent = { image: { url: message }, caption: message.caption };
                    break;
                case 'video':
                    messageContent = { video: { url: message }, caption: message.caption };
                    break;
                case 'audio':
                    messageContent = { audio: { url: message } };
                    break;
                case 'document':
                    messageContent = { document: { url: message }, caption: message.caption };
                    break;
                default:
                    messageContent = { text: message };
            }

            const sentMessage = await socket.sendMessage(to, messageContent);
            
            // Save outgoing message
            const messageData = {
                messageId: sentMessage.key.id,
                deviceId,
                from: sentMessage.key.remoteJid,
                to,
                type,
                content: messageContent,
                timestamp: new Date(),
                direction: 'outbound',
                status: 'sent'
            };

            const savedMessage = new WhatsAppMessage(messageData);
            await savedMessage.save();

            // Update conversation
            await this.updateConversation(deviceId, to, savedMessage._id);

            return { success: true, messageId: sentMessage.key.id };

        } catch (error) {
            console.error(`[BaileysService] Error sending message:`, error);
            throw error;
        }
    }

    async sendBatchMessages(deviceId, messages) {
        try {
            console.log(`[BaileysService] Sending batch messages from device: ${deviceId}`);
            
            const socket = this.sockets.get(deviceId);
            if (!socket) {
                console.log(`[BaileysService] Socket not found for device: ${deviceId}`);
                throw new Error('Device not connected');
            }

            const results = [];
            
            for (const messageData of messages) {
                try {
                    const { to, message, type = 'text' } = messageData;
                    
                    if (!to || !message) {
                        results.push({
                            success: false,
                            message: 'Recipient and message are required',
                            to: to || 'unknown'
                        });
                        continue;
                    }

                    const result = await this.sendMessage(deviceId, to, message, type);
                    results.push({
                        success: true,
                        message: 'Message sent successfully',
                        to,
                        data: result
                    });
                    
                } catch (error) {
                    console.error(`[BaileysService] Error sending individual message:`, error);
                    results.push({
                        success: false,
                        message: error.message,
                        to: messageData.to || 'unknown'
                    });
                }
            }

            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            return {
                success: true,
                message: `Batch send completed: ${successful} successful, ${failed} failed`,
                data: {
                    total: messages.length,
                    successful,
                    failed,
                    results
                }
            };

        } catch (error) {
            console.error(`[BaileysService] Error sending batch messages:`, error);
            throw error;
        }
    }

    async getQRCode(deviceId) {
        try {
            console.log(`[BaileysService] Getting QR code for device ${deviceId}...`);
            
            // Check memory first
            const qrData = this.qrCodes.get(deviceId);
            if (qrData && qrData.expiresAt > Date.now()) {
                console.log(`[BaileysService] ✅ QR code found in memory for device ${deviceId}`);
                return {
                    success: true,
                    data: qrData.qr,
                    message: 'QR code retrieved from cache'
                };
            }

            // Check if device is initialized
            const socket = this.sockets.get(deviceId);
            if (!socket) {
                console.log(`[BaileysService] Device ${deviceId} not initialized, initializing now...`);
                // Try to initialize the device first
                try {
                    const device = await WhatsAppDevice.findById(deviceId);
                    if (!device) {
                        return {
                            success: false,
                            message: 'Device not found. Please create the device first.',
                            data: null
                        };
                    }
                    
                    // Initialize the device
                    await this.initializeDevice(deviceId, device.coachId);
                    
                    // Wait longer for QR generation
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    
                    // Check again after initialization
                    const newQrData = this.qrCodes.get(deviceId);
                    if (newQrData && newQrData.expiresAt > Date.now()) {
                        console.log(`[BaileysService] ✅ QR code generated after initialization for device ${deviceId}`);
                        return {
                            success: true,
                            data: newQrData.qr,
                            message: 'QR code generated successfully'
                        };
                    }
                } catch (initError) {
                    console.error(`[BaileysService] Error initializing device for QR:`, initError);
                }
            } else {
                // Device is initialized but QR might not be ready yet
                // Wait a bit more and check again
                console.log(`[BaileysService] Device ${deviceId} is initialized, waiting for QR...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const qrDataAfterWait = this.qrCodes.get(deviceId);
                if (qrDataAfterWait && qrDataAfterWait.expiresAt > Date.now()) {
                    console.log(`[BaileysService] ✅ QR code found after waiting for device ${deviceId}`);
                    return {
                        success: true,
                        data: qrDataAfterWait.qr,
                        message: 'QR code retrieved successfully'
                    };
                }
            }

            // Check database
            const device = await WhatsAppDevice.findById(deviceId);
            if (device && device.qrCode) {
                // Store in memory for quick access
                this.qrCodes.set(deviceId, {
                    qr: device.qrCode,
                    timestamp: Date.now(),
                    expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
                });
                console.log(`[BaileysService] ✅ QR code found in database for device ${deviceId}`);
                return {
                    success: true,
                    data: device.qrCode,
                    message: 'QR code retrieved from database'
                };
            }

            console.log(`[BaileysService] ❌ No QR code available for device ${deviceId}`);
            return {
                success: false,
                message: 'QR code not available. Please initialize the device first.',
                data: null
            };
        } catch (error) {
            console.error(`[BaileysService] Error getting QR code for device ${deviceId}:`, error);
            return {
                success: false,
                message: 'Error retrieving QR code: ' + error.message,
                data: null
            };
        }
    }

    async getConnectionStatus(deviceId) {
        try {
            const device = await WhatsAppDevice.findById(deviceId);
            const connectionState = this.connectionStates.get(deviceId);
            
            return {
                deviceId,
                isConnected: device?.isConnected || false,
                connectionState: connectionState || 'unknown',
                phoneNumber: device?.phoneNumber || null,
                lastConnected: device?.lastConnected || null,
                hasQR: !!device?.qrCode
            };
        } catch (error) {
            console.error(`[BaileysService] Error getting connection status for device ${deviceId}:`, error);
            throw error;
        }
    }

    async disconnectDevice(deviceId) {
        try {
            console.log(`[BaileysService] Disconnecting device ${deviceId}`);
            
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
                    console.warn(`[BaileysService] Error during logout for device ${deviceId}:`, logoutError);
                    // Continue with cleanup even if logout fails
                }
                
                this.sockets.delete(deviceId);
                this.deviceStates.delete(deviceId);
                this.qrCodes.delete(deviceId);
                this.connectionStates.delete(deviceId);
            }

            // Update device status in database
            try {
                await WhatsAppDevice.findByIdAndUpdate(deviceId, {
                    isConnected: false,
                    qrCode: null,
                    lastDisconnected: new Date()
                }, { 
                    new: true,
                    runValidators: false // Skip validation to prevent schema conflicts
                });
                console.log(`[BaileysService] Device ${deviceId} status updated in database`);
            } catch (dbError) {
                console.warn(`[BaileysService] Could not update device ${deviceId} in database:`, dbError.message);
                // Continue with cleanup even if DB update fails
            }

            console.log(`[BaileysService] Device ${deviceId} disconnected successfully`);
            return { success: true };
        } catch (error) {
            console.error(`[BaileysService] Error disconnecting device ${deviceId}:`, error);
            // Don't throw error - just log and return success to prevent server crashes
            return { success: true, message: 'Device disconnected (with warnings)' };
        }
    }

    cleanupDevice(deviceId) {
        try {
            console.log(`[BaileysService] Cleaning up device ${deviceId}`);
            
            // Remove from all maps
            this.sockets.delete(deviceId);
            this.deviceStates.delete(deviceId);
            this.qrCodes.delete(deviceId);
            this.connectionStates.delete(deviceId);
            
            console.log(`[BaileysService] Device ${deviceId} cleaned up successfully`);
        } catch (error) {
            console.error(`[BaileysService] Error cleaning up device ${deviceId}:`, error);
        }
    }

    async forceQRGeneration(deviceId) {
        try {
            console.log(`[BaileysService] Forcing QR generation for device ${deviceId}`);
            
            const deviceState = this.deviceStates.get(deviceId);
            
            if (deviceState) {
                // Disconnect current session
                const socket = this.sockets.get(deviceId);
                if (socket) {
                    try {
                        await socket.logout();
                        console.log(`[BaileysService] Socket logged out for device ${deviceId}`);
                    } catch (logoutError) {
                        console.warn(`[BaileysService] Error during logout:`, logoutError.message);
                    }
                }

                // Clean up auth directory completely
                if (deviceState.authDir && fs.existsSync(deviceState.authDir)) {
                    fs.rmSync(deviceState.authDir, { recursive: true, force: true });
                    console.log(`[BaileysService] Removed auth directory: ${deviceState.authDir}`);
                }
            }

            // Clean up device state
            this.cleanupDevice(deviceId);

            // Clear QR code from database (skip validation to prevent schema conflicts)
            try {
                await WhatsAppDevice.findByIdAndUpdate(deviceId, {
                    qrCode: null,
                    isConnected: false
                }, { 
                    new: true,
                    runValidators: false
                });
                console.log(`[BaileysService] Cleared QR code and connection status for device ${deviceId}`);
            } catch (dbError) {
                console.warn(`[BaileysService] Could not clear device ${deviceId} status:`, dbError.message);
            }

            // Wait a moment before reinitializing
            await new Promise(resolve => setTimeout(resolve, 3000));

            if (!device) {
                throw new Error('Device not found');
            }

            console.log(`[BaileysService] Reinitializing device ${deviceId} after force QR`);
            
            const result = await this.initializeDevice(deviceId, device.coachId);
            
            // Wait a bit more for QR generation
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            return result;
            
        } catch (error) {
            console.error(`[BaileysService] Error forcing QR generation for device ${deviceId}:`, error);
            throw error;
        }
    }
}

module.exports = new BaileysService();
