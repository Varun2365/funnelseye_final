const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { WhatsAppIntegration } = require('../schema');
const fs = require('fs').promises;
const path = require('path');
const {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');

async function debugBaileysData() {
    try {
        await connectDB();
        
        const userId = '68a9c82a753a3d12e696ec3d';
        const userType = 'coach';
        
        console.log(`🔍 Debugging Baileys data for user ${userId}...`);
        console.log(`===============================================`);
        
        // 1. Check WhatsApp Integration
        console.log(`\n📋 1. WhatsApp Integration Data:`);
        const integration = await WhatsAppIntegration.findOne({
            userId,
            userType,
            integrationType: 'baileys_personal'
        });
        
        if (integration) {
            console.log(`✅ Integration found:`, {
                id: integration._id,
                userId: integration.userId,
                userType: integration.userType,
                integrationType: integration.integrationType,
                isActive: integration.isActive,
                connectionStatus: integration.connectionStatus,
                phoneNumber: integration.phoneNumber,
                createdAt: integration.createdAt,
                updatedAt: integration.updatedAt,
                settings: integration.settings
            });
        } else {
            console.log(`❌ No integration found`);
        }
        
        // 2. Check Session Directory
        console.log(`\n📁 2. Session Directory Data:`);
        const sessionDir = path.join(__dirname, '../baileys_auth', userId.toString());
        
        try {
            const files = await fs.readdir(sessionDir);
            console.log(`✅ Session directory exists: ${sessionDir}`);
            console.log(`📄 Files in directory:`, files);
            
            // Check each file
            for (const file of files) {
                const filePath = path.join(sessionDir, file);
                const stats = await fs.stat(filePath);
                console.log(`  - ${file}: ${stats.size} bytes, ${stats.isFile() ? 'file' : 'directory'}`);
                
                if (file.endsWith('.json')) {
                    try {
                        const content = await fs.readFile(filePath, 'utf8');
                        const data = JSON.parse(content);
                        console.log(`    Content keys:`, Object.keys(data));
                    } catch (e) {
                        console.log(`    Error reading file:`, e.message);
                    }
                }
            }
        } catch (error) {
            console.log(`❌ Session directory error:`, error.message);
        }
        
        // 3. Try to load auth state
        console.log(`\n🔐 3. Authentication State Data:`);
        try {
            const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
            
            console.log(`✅ Auth state loaded successfully`);
            console.log(`📊 Credentials:`, {
                exists: !!state.creds,
                me: state.creds?.me ? {
                    id: state.creds.me.id,
                    name: state.creds.me.name,
                    verifiedName: state.creds.me.verifiedName
                } : null,
                noiseKey: !!state.creds?.noiseKey,
                signedIdentityKey: !!state.creds?.signedIdentityKey,
                signedPreKey: !!state.creds?.signedPreKey,
                registrationId: state.creds?.registrationId,
                advSignedIdentityKey: !!state.creds?.advSignedIdentityKey,
                processedHistoryMessages: state.creds?.processedHistoryMessages?.length || 0,
                nextPreKeyId: state.creds?.nextPreKeyId,
                firstUnuploadedPreKeyId: state.creds?.firstUnuploadedPreKeyId,
                account: state.creds?.account ? {
                    deviceType: state.creds.account.deviceType,
                    businessName: state.creds.account.businessName,
                    verifiedName: state.creds.account.verifiedName
                } : null
            });
            
            console.log(`🔑 Keys:`, {
                count: Object.keys(state.keys).length,
                keyTypes: Object.keys(state.keys)
            });
            
        } catch (error) {
            console.log(`❌ Error loading auth state:`, error.message);
            console.log(`📍 Error stack:`, error.stack);
        }
        
        // 4. Check Baileys version
        console.log(`\n📦 4. Baileys Version Data:`);
        try {
            const { version } = await fetchLatestBaileysVersion();
            console.log(`✅ Latest Baileys version: ${version}`);
        } catch (error) {
            console.log(`❌ Error fetching Baileys version:`, error.message);
        }
        
        // 5. Check browser configuration
        console.log(`\n🌐 5. Browser Configuration:`);
        try {
            const browserConfig = Browsers['ubuntu']('Chrome');
            console.log(`✅ Browser config:`, browserConfig);
        } catch (error) {
            console.log(`❌ Error creating browser config:`, error.message);
        }
        
        // 6. Check global settings
        console.log(`\n⚙️ 6. Global Settings:`);
        try {
            const globalSettingsService = require('../services/globalSettingsService');
            const settings = await globalSettingsService.getSettings();
            const baileysConfig = settings.getWhatsAppBaileysConfig();
            
            console.log(`✅ Baileys global config:`, {
                enabled: baileysConfig.enabled,
                sessionTimeout: baileysConfig.sessionTimeout,
                qrCodeTimeout: baileysConfig.qrCodeTimeout,
                maxSessions: baileysConfig.maxSessions,
                autoReconnect: baileysConfig.autoReconnect,
                reconnectInterval: baileysConfig.reconnectInterval,
                browser: baileysConfig.browser,
                platform: baileysConfig.platform,
                version: baileysConfig.version,
                markOnlineOnConnect: baileysConfig.markOnlineOnConnect,
                emitOwnEvents: baileysConfig.emitOwnEvents,
                connectTimeoutMs: baileysConfig.connectTimeoutMs,
                keepAliveIntervalMs: baileysConfig.keepAliveIntervalMs
            });
        } catch (error) {
            console.log(`❌ Error loading global settings:`, error.message);
        }
        
        console.log(`\n===============================================`);
        console.log(`🔍 Debug complete!`);
        
        await mongoose.connection.close();
        
    } catch (error) {
        console.error('❌ Debug error:', error);
        process.exit(1);
    }
}

debugBaileysData();
