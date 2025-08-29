const { WhatsAppIntegration, WhatsAppMessage, WhatsAppConversation } = require('../schema');
const baileysWhatsAppService = require('./baileysWhatsAppService');
const metaWhatsAppService = require('./metaWhatsAppService');

// Central FunnelsEye WhatsApp credentials
const CENTRAL_WHATSAPP_CONFIG = {
    apiToken: process.env.WHATSAPP_CENTRAL_API_TOKEN,
    phoneNumberId: process.env.WHATSAPP_CENTRAL_PHONE_NUMBER_ID,
    businessAccountId: process.env.WHATSAPP_CENTRAL_BUSINESS_ACCOUNT_ID
};

class UnifiedWhatsAppService {
    constructor() {
        this.integrationTypes = ['meta_official', 'baileys_personal', 'central_fallback'];
    }

    /**
     * Setup WhatsApp integration for a user (coach or staff)
     */
    async setupIntegration(userId, userType, integrationData) {
        try {
            // Validate user type
            if (!['coach', 'staff'].includes(userType)) {
                throw new Error('Invalid user type. Must be coach or staff.');
            }

            // Validate integration type
            if (!this.integrationTypes.includes(integrationData.integrationType)) {
                throw new Error('Invalid integration type');
            }

            // Check if integration already exists
            let integration = await WhatsAppIntegration.findOne({ userId, userType });
            
            if (integration) {
                // Update existing integration
                integration = await WhatsAppIntegration.findOneAndUpdate(
                    { userId, userType },
                    { ...integrationData, isActive: true },
                    { new: true, runValidators: true }
                );
            } else {
                // Create new integration
                integration = new WhatsAppIntegration({
                    userId,
                    userType,
                    ...integrationData,
                    isActive: true
                });
                await integration.save();
            }

            // Don't initialize Baileys during setup - user must call /api/whatsapp/baileys/initialize separately
            if (integrationData.integrationType === 'baileys_personal') {
                console.log(`[UnifiedWhatsAppService] Baileys integration created. Use /api/whatsapp/baileys/initialize to start the service.`);
            }

            return integration.getPublicDetails();

        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Error setting up integration:`, error);
            throw error;
        }
    }

    /**
     * Switch between integration types
     */
    async switchIntegration(userId, userType, newIntegrationType) {
        try {
            if (!this.integrationTypes.includes(newIntegrationType)) {
                throw new Error('Invalid integration type');
            }

            // Deactivate current integration
            await WhatsAppIntegration.findOneAndUpdate(
                { userId, userType },
                { isActive: false }
            );

            // Setup new integration
            const integrationData = { integrationType: newIntegrationType };
            
            if (newIntegrationType === 'central_fallback') {
                integrationData.useCentralFallback = true;
            }

            return await this.setupIntegration(userId, userType, integrationData);

        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Error switching integration:`, error);
            throw error;
        }
    }

    /**
     * Get user's WhatsApp integrations
     */
    async getUserIntegrations(userId, userType) {
        try {
            console.log(`\n🔍 [UnifiedWhatsAppService] ===== GET USER INTEGRATIONS START =====`);
            console.log(`👤 User ID: ${userId}`);
            console.log(`🏷️  User Type: ${userType}`);
            console.log(`📅 Timestamp: ${new Date().toISOString()}`);
            
            // Try to find integration with exact userType match first
            console.log(`🔍 [UnifiedWhatsAppService] Searching for integration with userId: ${userId}, userType: ${userType}`);
            let integration = await WhatsAppIntegration.findOne({ userId, userType });
            
            console.log(`📊 [UnifiedWhatsAppService] Exact match result:`, integration ? 'FOUND' : 'NOT FOUND');
            if (integration) {
                console.log(`📋 [UnifiedWhatsAppService] Found integration:`, {
                    _id: integration._id,
                    userId: integration.userId,
                    userType: integration.userType,
                    integrationType: integration.integrationType,
                    isActive: integration.isActive
                });
            }
            
            // If not found, try to find any integration for this user (regardless of userType)
            if (!integration) {
                console.log(`🔍 [UnifiedWhatsAppService] No exact match found, searching for ANY integration with userId: ${userId}`);
                integration = await WhatsAppIntegration.findOne({ userId });
                
                if (integration) {
                    console.log(`✅ [UnifiedWhatsAppService] Found integration with different userType:`, {
                        _id: integration._id,
                        userId: integration.userId,
                        userType: integration.userType,
                        integrationType: integration.integrationType,
                        isActive: integration.isActive
                    });
                } else {
                    console.log(`❌ [UnifiedWhatsAppService] No integration found for user ${userId} with any userType`);
                }
            }
            
            if (!integration) {
                console.log(`❌ [UnifiedWhatsAppService] No integration found for user ${userId}`);
                console.log(`✅ [UnifiedWhatsAppService] ===== GET USER INTEGRATIONS END (NULL) =====\n`);
                return null;
            }

            console.log(`🔍 [UnifiedWhatsAppService] Calling getPublicDetails() on integration`);
            const publicDetails = integration.getPublicDetails();
            console.log(`📦 [UnifiedWhatsAppService] Public details:`, JSON.stringify(publicDetails, null, 2));
            
            console.log(`✅ [UnifiedWhatsAppService] ===== GET USER INTEGRATIONS END (SUCCESS) =====\n`);
            return publicDetails;

        } catch (error) {
            console.error(`❌ [UnifiedWhatsAppService] Error getting user integrations:`, error);
            console.error(`❌ [UnifiedWhatsAppService] Error stack:`, error.stack);
            throw error;
        }
    }

    /**
     * Get all integrations for coaches (visible to all users)
     */
    async getAllCoachIntegrations() {
        try {
            const integrations = await WhatsAppIntegration.find({ 
                userType: 'coach', 
                isActive: true 
            }).populate('userId', 'name email selfCoachId currentLevel');

            return integrations.map(integration => ({
                ...integration.getPublicDetails(),
                coachName: integration.userId.name,
                coachEmail: integration.userId.email,
                selfCoachId: integration.userId.selfCoachId,
                currentLevel: integration.userId.currentLevel
            }));

        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Error getting all coach integrations:`, error);
            throw error;
        }
    }

    /**
     * Send WhatsApp message using the best available integration
     */
    async sendMessage(userId, userType, recipientPhone, messageContent, options = {}) {
        try {
            const integration = await WhatsAppIntegration.findOne({ userId, userType });
            
            if (!integration || !integration.isActive) {
                throw new Error('No active WhatsApp integration found');
            }

            let result;

            switch (integration.integrationType) {
                case 'meta_official':
                    result = await this.sendViaMetaAPI(userId, userType, recipientPhone, messageContent, options);
                    break;
                    
                case 'baileys_personal':
                    result = await this.sendViaBaileys(userId, userType, recipientPhone, messageContent, options);
                    break;
                    
                case 'central_fallback':
                    result = await this.sendViaCentralFallback(userId, userType, recipientPhone, messageContent, options);
                    break;
                    
                default:
                    throw new Error('Unsupported integration type');
            }

            // Update message statistics
            await this.updateMessageStats(userId, userType, 'sent');

            return result;

        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Error sending message:`, error);
            
            // If primary integration fails, try central fallback
            if (integration.integrationType !== 'central_fallback') {
                console.log(`[UnifiedWhatsAppService] Trying central fallback for user ${userId}`);
                try {
                    return await this.sendViaCentralFallback(userId, userType, recipientPhone, messageContent, options);
                } catch (fallbackError) {
                    console.error(`[UnifiedWhatsAppService] Central fallback also failed:`, fallbackError);
                }
            }
            
            throw error;
        }
    }

    /**
     * Send message via Meta Official API
     */
    async sendViaMetaAPI(userId, userType, recipientPhone, messageContent, options = {}) {
        try {
            const integration = await WhatsAppIntegration.findOne({ userId, userType });
            
            if (!integration.metaApiToken || !integration.phoneNumberId) {
                throw new Error('Meta API credentials not configured');
            }

            // Use Meta WhatsApp service
            const result = await metaWhatsAppService.sendMessageByCoach(
                userId,
                recipientPhone,
                messageContent,
                options.useTemplate || false
            );

            return result;

        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Meta API error:`, error);
            throw error;
        }
    }

    /**
     * Send message via Baileys personal account
     */
    async sendViaBaileys(userId, userType, recipientPhone, messageContent, options = {}) {
        try {
            const sessionStatus = baileysWhatsAppService.getSessionStatus(userId);
            
            if (sessionStatus.status !== 'connected') {
                throw new Error('Baileys session not connected');
            }

            const result = await baileysWhatsAppService.sendMessage(
                userId,
                userType,
                recipientPhone,
                messageContent,
                options.messageType || 'text'
            );

            return result;

        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Baileys error:`, error);
            throw error;
        }
    }

    /**
     * Send message via Central FunnelsEye account
     */
    async sendViaCentralFallback(userId, userType, recipientPhone, messageContent, options = {}) {
        try {
            if (!CENTRAL_WHATSAPP_CONFIG.apiToken || !CENTRAL_WHATSAPP_CONFIG.phoneNumberId) {
                throw new Error('Central WhatsApp credentials not configured');
            }

            // Check if user has central fallback enabled
            const integration = await WhatsAppIntegration.findOne({ userId, userType });
            if (!integration?.useCentralFallback) {
                throw new Error('Central fallback not enabled for this user');
            }

            // Use central credentials to send message
            const result = await metaWhatsAppService.sendMessageByCoach(
                userId,
                recipientPhone,
                messageContent,
                options.useTemplate || false,
                true // Use central account
            );

            // Deduct credit from central account
            await this.deductCentralCredit(userId, userType);

            return result;

        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Central fallback error:`, error);
            throw error;
        }
    }

    /**
     * Initialize Baileys integration
     */
    async initializeBaileysIntegration(userId, userType) {
        try {
            console.log(`[UnifiedWhatsAppService] 🚀 Initializing Baileys integration for ${userType} ${userId}`);
            
            // Check if session already exists and is active
            const existingSession = baileysWhatsAppService.getSessionStatus(userId);
            if (existingSession.status !== 'not_initialized') {
                console.log(`[UnifiedWhatsAppService] ℹ️ Session already exists for user ${userId}, status: ${existingSession.status}`);
                
                if (existingSession.hasQRCode) {
                    // Return existing QR code
                    return {
                        success: true,
                        sessionId: `session_${userId}`,
                        qrCode: existingSession.qrCode,
                        status: 'qr_ready',
                        message: 'Session already initialized with QR code'
                    };
                } else if (existingSession.status === 'connected') {
                    // Return connected status
                    return {
                        success: true,
                        sessionId: `session_${userId}`,
                        qrCode: null,
                        status: 'connected',
                        message: 'Session already connected'
                    };
                }
            }
            
            // Initialize the Baileys session (this now returns QR code directly)
            const result = await baileysWhatsAppService.initializeSession(userId, userType);
            
            console.log(`[UnifiedWhatsAppService] ✅ Baileys integration initialized successfully for ${userType} ${userId}`);
            return result;

        } catch (error) {
            console.error(`[UnifiedWhatsAppService] ❌ Error initializing Baileys:`, error.message);
            throw error;
        }
    }

    /**
     * Get Baileys QR code
     */
    async getBaileysQRCode(userId, userType) {
        try {
            return await baileysWhatsAppService.getQRCode(userId, userType);
        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Error getting QR code:`, error);
            throw error;
        }
    }

    /**
     * Get Baileys session status
     */
    async getBaileysSessionStatus(userId, userType) {
        try {
            return baileysWhatsAppService.getSessionStatus(userId);
        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Error getting session status:`, error);
            throw error;
        }
    }

    /**
     * Disconnect Baileys session
     */
    async disconnectBaileysSession(userId, userType) {
        try {
            return await baileysWhatsAppService.disconnectSession(userId);
        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Error disconnecting session:`, error);
            throw error;
        }
    }

    /**
     * Test integration connection
     */
    async testIntegration(userId, userType) {
        try {
            const integration = await WhatsAppIntegration.findOne({ userId, userType });
            
            if (!integration || !integration.isActive) {
                throw new Error('No active integration found');
            }

            let testResult;

            switch (integration.integrationType) {
                case 'meta_official':
                    testResult = await this.testMetaAPI(userId, userType);
                    break;
                    
                case 'baileys_personal':
                    testResult = await this.testBaileys(userId, userType);
                    break;
                    
                case 'central_fallback':
                    testResult = await this.testCentralFallback(userId, userType);
                    break;
                    
                default:
                    throw new Error('Unsupported integration type');
            }

            // Update health status
            await WhatsAppIntegration.findOneAndUpdate(
                { userId, userType },
                { 
                    healthStatus: testResult.success ? 'healthy' : 'error',
                    lastHealthCheck: new Date()
                }
            );

            return testResult;

        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Error testing integration:`, error);
            throw error;
        }
    }

    /**
     * Test Meta API integration
     */
    async testMetaAPI(userId, userType) {
        try {
            const integration = await WhatsAppIntegration.findOne({ userId, userType });
            
            if (!integration.metaApiToken || !integration.phoneNumberId) {
                return { success: false, message: 'Meta API credentials not configured' };
            }

            // Test API connection by getting templates
            const templates = await metaWhatsAppService.getAvailableTemplates(
                integration.metaApiToken,
                integration.phoneNumberId
            );

            return { 
                success: true, 
                message: 'Meta API connection successful',
                data: { templatesCount: templates.length }
            };

        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Test Baileys integration
     */
    async testBaileys(userId, userType) {
        try {
            const sessionStatus = baileysWhatsAppService.getSessionStatus(userId);
            
            if (sessionStatus.status === 'connected') {
                return { 
                    success: true, 
                    message: 'Baileys session connected',
                    data: { phoneNumber: sessionStatus.phoneNumber }
                };
            } else if (sessionStatus.hasQRCode) {
                return { 
                    success: false, 
                    message: 'QR code generated, waiting for scan',
                    data: { status: 'qr_ready' }
                };
            } else {
                return { 
                    success: false, 
                    message: 'Baileys session not connected',
                    data: { status: sessionStatus.status }
                };
            }

        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Test Central Fallback integration
     */
    async testCentralFallback(userId, userType) {
        try {
            if (!CENTRAL_WHATSAPP_CONFIG.apiToken || !CENTRAL_WHATSAPP_CONFIG.phoneNumberId) {
                return { success: false, message: 'Central WhatsApp credentials not configured' };
            }

            // Test central API connection
            const templates = await metaWhatsAppService.getAvailableTemplates(
                CENTRAL_WHATSAPP_CONFIG.apiToken,
                CENTRAL_WHATSAPP_CONFIG.phoneNumberId
            );

            return { 
                success: true, 
                message: 'Central fallback connection successful',
                data: { templatesCount: templates.length }
            };

        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Get integration health status
     */
    async getIntegrationHealth(userId, userType) {
        try {
            const integration = await WhatsAppIntegration.findOne({ userId, userType });
            
            if (!integration) {
                return { success: false, message: 'Integration not found' };
            }

            const healthData = {
                ...integration.getPublicDetails(),
                lastHealthCheck: integration.lastHealthCheck,
                errorCount: integration.errorCount,
                lastError: integration.lastError
            };

            return { success: true, data: healthData };

        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Error getting health status:`, error);
            throw error;
        }
    }

    /**
     * Update message statistics
     */
    async updateMessageStats(userId, userType, direction) {
        try {
            const updateField = direction === 'sent' ? 'totalMessagesSent' : 'totalMessagesReceived';
            
            await WhatsAppIntegration.findOneAndUpdate(
                { userId, userType },
                {
                    [updateField]: { $inc: 1 },
                    lastMessageAt: new Date()
                }
            );
        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Error updating message stats:`, error);
        }
    }

    /**
     * Deduct credit from central account
     */
    async deductCentralCredit(userId, userType) {
        try {
            const integration = await WhatsAppIntegration.findOne({ userId, userType });
            
            if (integration?.centralAccountCredits > 0) {
                integration.centralAccountCredits -= 1;
                await integration.save();
            }
        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Error deducting central credit:`, error);
        }
    }

    /**
     * Get conversation history
     */
    async getConversationHistory(userId, userType, contactPhone, limit = 50) {
        try {
            const messages = await WhatsAppMessage.find({
                $or: [
                    { userId, userType, from: contactPhone },
                    { userId, userType, to: contactPhone }
                ]
            })
            .sort({ timestamp: -1 })
            .limit(limit);

            return messages.reverse(); // Return in chronological order

        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Error getting conversation history:`, error);
            return [];
        }
    }

    /**
     * Delete WhatsApp integration
     */
    async deleteIntegration(userId, userType) {
        try {
            console.log(`[UnifiedWhatsAppService] Deleting integration for ${userType} ${userId}`);
            
            // Disconnect Baileys session if active
            try {
                await baileysWhatsAppService.disconnectSession(userId);
            } catch (error) {
                console.log(`[UnifiedWhatsAppService] No active Baileys session to disconnect`);
            }
            
            // Delete integration from database
            const result = await WhatsAppIntegration.findOneAndDelete({ userId, userType });
            
            if (!result) {
                throw new Error('Integration not found');
            }
            
            console.log(`[UnifiedWhatsAppService] Integration deleted successfully`);
            return { success: true, message: 'Integration deleted successfully' };
            
        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Error deleting integration:`, error);
            throw error;
        }
    }

    /**
     * Get all conversations for a user
     */
    async getUserConversations(userId, userType, limit = 20) {
        try {
            const conversations = await WhatsAppMessage.aggregate([
                {
                    $match: {
                        userId: userId,
                        userType: userType
                    }
                },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ['$direction', 'inbound'] },
                                '$from',
                                '$to'
                            ]
                        },
                        lastMessage: { $last: '$$ROOT' },
                        messageCount: { $sum: 1 }
                    }
                },
                {
                    $sort: { 'lastMessage.timestamp': -1 }
                },
                {
                    $limit: limit
                }
            ]);

            return conversations;

        } catch (error) {
            console.error(`[UnifiedWhatsAppService] Error getting conversations:`, error);
            return [];
        }
    }
}

module.exports = new UnifiedWhatsAppService();
