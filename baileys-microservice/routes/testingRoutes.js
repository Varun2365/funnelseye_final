const express = require('express');
const { makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// In-memory storage for testing (no database dependency)
const testSessions = new Map();
const testQRCodes = new Map();

// @desc    Simple test endpoint (no Baileys)
// @route   GET /testing/ping
// @access  Public
router.get('/ping', (req, res) => {
    res.json({
        success: true,
        message: 'Microservice testing endpoints are working!',
        timestamp: new Date().toISOString(),
        activeSessions: testSessions.size,
        uptime: process.uptime()
    });
});

// Clean up old sessions periodically
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, sessionData] of testSessions.entries()) {
        if (now - sessionData.createdAt > 30 * 60 * 1000) { // 30 minutes
            testSessions.delete(sessionId);
            testQRCodes.delete(sessionId);
            console.log(`[Testing] Cleaned up old session: ${sessionId}`);
        }
    }
}, 5 * 60 * 1000); // Check every 5 minutes

// @desc    Initialize test session
// @route   POST /testing/init
// @access  Public
router.post('/init', async (req, res) => {
    try {
        const { phoneNumber, sessionName } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }
        
        const sessionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sessionDir = path.join(__dirname, '..', 'test_sessions', sessionId);
        
        // Create session directory
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }
        
        console.log(`[Testing] Initializing test session: ${sessionId} for ${phoneNumber}`);
        
        // Initialize Baileys socket
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        
        const socket = makeWASocket({
            auth: state,
            browser: ['Test WhatsApp Client', 'Chrome', '1.0.0'],
            printQRInTerminal: false,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 30000,
            retryRequestDelayMs: 250,
            maxMsgRetryCount: 5,
            markOnlineOnConnect: false
        });
        
        // Set up event handlers
        socket.ev.on('connection.update', async (update) => {
            try {
                const { connection, lastDisconnect, qr } = update;
                
                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                    console.log(`[Testing] Connection closed for ${sessionId}, should reconnect: ${shouldReconnect}`);
                    
                    if (!shouldReconnect) {
                        // Clean up session
                        console.log(`[Testing] Cleaning up session ${sessionId}`);
                        testSessions.delete(sessionId);
                        testQRCodes.delete(sessionId);
                        if (fs.existsSync(sessionDir)) {
                            fs.rmSync(sessionDir, { recursive: true, force: true });
                        }
                    }
                } else if (connection === 'open') {
                    console.log(`[Testing] ✅ Connected successfully for ${sessionId}`);
                    
                    // Update session data
                    const sessionData = testSessions.get(sessionId);
                    if (sessionData) {
                        sessionData.isConnected = true;
                        sessionData.phoneNumber = socket.user?.id?.split(':')[0] || phoneNumber;
                        testSessions.set(sessionId, sessionData);
                    }
                } else if (connection === 'connecting') {
                    console.log(`[Testing] Connecting for ${sessionId}...`);
                } else if (qr) {
                    console.log(`[Testing] Generating QR code for ${sessionId}`);
                    
                    try {
                        const qrCodeDataUrl = await QRCode.toDataURL(qr);
                        testQRCodes.set(sessionId, {
                            qr: qrCodeDataUrl,
                            timestamp: Date.now(),
                            expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
                        });
                        
                        console.log(`[Testing] ✅ QR code generated for ${sessionId}`);
                    } catch (error) {
                        console.error(`[Testing] Error generating QR code for ${sessionId}:`, error);
                    }
                }
            } catch (error) {
                console.error(`[Testing] Error in connection.update for ${sessionId}:`, error);
            }
        });
        
        socket.ev.on('creds.update', saveCreds);
        
        socket.ev.on('messages.upsert', async (m) => {
            try {
                console.log(`[Testing] Received ${m.messages.length} messages for ${sessionId}`);
                for (const message of m.messages) {
                    console.log(`[Testing] Message from ${message.key.remoteJid}: ${message.message?.conversation || 'Media/Other'}`);
                }
            } catch (error) {
                console.error(`[Testing] Error handling messages for ${sessionId}:`, error);
            }
        });
        
        socket.ev.on('error', (error) => {
            console.error(`[Testing] Socket error for ${sessionId}:`, error.message || error);
            
            // Handle specific error types
            if (error.message && error.message.includes('Stream Errored')) {
                console.log(`[Testing] Stream error detected for ${sessionId}, connection may restart automatically`);
            }
        });
        
        // Store session data
        testSessions.set(sessionId, {
            socket,
            phoneNumber,
            sessionName: sessionName || `Test Session ${sessionId}`,
            isConnected: false,
            createdAt: Date.now(),
            sessionDir
        });
        
        // Wait a moment for initial events
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        res.json({
            success: true,
            message: 'Test session initialized successfully',
            data: {
                sessionId,
                phoneNumber,
                qrUrl: `/testing/qr/${sessionId}`,
                statusUrl: `/testing/status/${sessionId}`,
                sendUrl: `/testing/send/${sessionId}`
            }
        });
        
    } catch (error) {
        console.error('[Testing] Error initializing test session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize test session',
            error: error.message
        });
    }
});

// @desc    Get QR code for test session
// @route   GET /testing/qr/:sessionId
// @access  Public
router.get('/qr/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        console.log(`[Testing] Getting QR code for session: ${sessionId}`);
        
        const qrData = testQRCodes.get(sessionId);
        if (!qrData || qrData.expiresAt < Date.now()) {
            return res.json({
                success: false,
                message: 'QR code not available or expired. Please reinitialize the session.',
                data: null
            });
        }
        
        res.json({
            success: true,
            message: 'QR code retrieved successfully',
            data: {
                qrCode: qrData.qr,
                sessionId,
                expiresAt: qrData.expiresAt,
                timestamp: Date.now()
            }
        });
        
    } catch (error) {
        console.error('[Testing] Error getting QR code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get QR code',
            error: error.message
        });
    }
});

// @desc    Get test session status
// @route   GET /testing/status/:sessionId
// @access  Public
router.get('/status/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const sessionData = testSessions.get(sessionId);
        if (!sessionData) {
            return res.json({
                success: false,
                message: 'Session not found',
                data: null
            });
        }
        
        const qrData = testQRCodes.get(sessionId);
        
        res.json({
            success: true,
            message: 'Session status retrieved successfully',
            data: {
                sessionId,
                phoneNumber: sessionData.phoneNumber,
                sessionName: sessionData.sessionName,
                isConnected: sessionData.isConnected,
                hasQR: !!qrData,
                qrExpired: qrData ? qrData.expiresAt < Date.now() : true,
                createdAt: sessionData.createdAt,
                uptime: Date.now() - sessionData.createdAt
            }
        });
        
    } catch (error) {
        console.error('[Testing] Error getting session status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get session status',
            error: error.message
        });
    }
});

// @desc    Send test message
// @route   POST /testing/send/:sessionId
// @access  Public
router.post('/send/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { to, message } = req.body;
        
        if (!to || !message) {
            return res.status(400).json({
                success: false,
                message: 'Recipient (to) and message are required'
            });
        }
        
        const sessionData = testSessions.get(sessionId);
        if (!sessionData) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        
        if (!sessionData.isConnected) {
            return res.status(400).json({
                success: false,
                message: 'Session is not connected. Please scan QR code first.'
            });
        }
        
        console.log(`[Testing] Sending message from ${sessionId} to ${to}: ${message}`);
        
        // Send message
        const result = await sessionData.socket.sendMessage(to, { text: message });
        
        console.log(`[Testing] ✅ Message sent successfully: ${result.key.id}`);
        
        res.json({
            success: true,
            message: 'Message sent successfully',
            data: {
                messageId: result.key.id,
                to,
                message,
                timestamp: Date.now()
            }
        });
        
    } catch (error) {
        console.error('[Testing] Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// @desc    Disconnect test session
// @route   DELETE /testing/disconnect/:sessionId
// @access  Public
router.delete('/disconnect/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const sessionData = testSessions.get(sessionId);
        if (!sessionData) {
            return res.json({
                success: false,
                message: 'Session not found'
            });
        }
        
        console.log(`[Testing] Disconnecting session: ${sessionId}`);
        
        // Logout socket
        try {
            await sessionData.socket.logout();
        } catch (error) {
            console.warn(`[Testing] Error during logout:`, error.message);
        }
        
        // Clean up session directory
        if (fs.existsSync(sessionData.sessionDir)) {
            fs.rmSync(sessionData.sessionDir, { recursive: true, force: true });
        }
        
        // Remove from memory
        testSessions.delete(sessionId);
        testQRCodes.delete(sessionId);
        
        res.json({
            success: true,
            message: 'Session disconnected successfully',
            data: {
                sessionId,
                timestamp: Date.now()
            }
        });
        
    } catch (error) {
        console.error('[Testing] Error disconnecting session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disconnect session',
            error: error.message
        });
    }
});

// @desc    List active test sessions
// @route   GET /testing/sessions
// @access  Public
router.get('/sessions', async (req, res) => {
    try {
        const sessions = Array.from(testSessions.entries()).map(([sessionId, data]) => ({
            sessionId,
            phoneNumber: data.phoneNumber,
            sessionName: data.sessionName,
            isConnected: data.isConnected,
            createdAt: data.createdAt,
            uptime: Date.now() - data.createdAt
        }));
        
        res.json({
            success: true,
            message: 'Active sessions retrieved successfully',
            data: {
                sessions,
                count: sessions.length
            }
        });
        
    } catch (error) {
        console.error('[Testing] Error listing sessions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list sessions',
            error: error.message
        });
    }
});

module.exports = router;
