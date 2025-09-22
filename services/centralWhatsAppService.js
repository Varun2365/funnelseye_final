const axios = require('axios');
const CentralWhatsApp = require('../schema/CentralWhatsApp');
const logger = require('../utils/logger');

class CentralWhatsAppService {
    constructor() {
        this.baseUrl = 'https://graph.facebook.com/v18.0';
        this.centralConfig = null;
    }

    // Initialize the central WhatsApp configuration
    async initialize() {
        try {
            this.centralConfig = await CentralWhatsApp.findOne({ 
                isActive: true, 
                isDefault: true 
            }).select('+accessToken');
            
            if (!this.centralConfig) {
                throw new Error('No active central WhatsApp configuration found');
            }
            
            logger.info(`[CentralWhatsApp] Initialized with phone number: ${this.centralConfig.phoneNumberId}`);
            return this.centralConfig;
        } catch (error) {
            logger.error('[CentralWhatsApp] Initialization failed:', error.message);
            throw error;
        }
    }

    // Get central WhatsApp configuration
    async getConfig() {
        if (!this.centralConfig) {
            await this.initialize();
        }
        return this.centralConfig;
    }

    // Send text message
    async sendTextMessage(to, text, coachId = null) {
        try {
            const config = await this.getConfig();
            
            const messageData = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to,
                type: 'text',
                text: {
                    preview_url: false,
                    body: text
                }
            };

            const response = await this.makeApiCall(
                `/${config.phoneNumberId}/messages`,
                'POST',
                messageData
            );

            // Update statistics
            await config.updateStatistics('sent');
            
            // Add contact if not exists
            await config.addContact(to);

            logger.info(`[CentralWhatsApp] Text message sent to ${to}`);
            return {
                success: true,
                messageId: response.messages?.[0]?.id,
                status: 'sent',
                recipient: to
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error sending text message:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Send template message
    async sendTemplateMessage(to, templateName, language = 'en', parameters = [], coachId = null) {
        try {
            const config = await this.getConfig();
            
            // Get template
            const template = config.getTemplateByName(templateName);
            if (!template) {
                throw new Error(`Template '${templateName}' not found or not approved`);
            }

            const messageData = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: language
                    }
                }
            };

            // Add parameters if provided
            if (parameters.length > 0) {
                messageData.template.components = [{
                    type: 'body',
                    parameters: parameters.map(param => ({
                        type: 'text',
                        text: param
                    }))
                }];
            }

            const response = await this.makeApiCall(
                `/${config.phoneNumberId}/messages`,
                'POST',
                messageData
            );

            // Update statistics
            await config.updateStatistics('sent');
            
            // Add contact if not exists
            await config.addContact(to);

            logger.info(`[CentralWhatsApp] Template message sent to ${to} using template ${templateName}`);
            return {
                success: true,
                messageId: response.messages?.[0]?.id,
                status: 'sent',
                recipient: to,
                template: templateName
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error sending template message:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Send media message
    async sendMediaMessage(to, mediaType, mediaUrl, caption = null, coachId = null) {
        try {
            const config = await this.getConfig();
            
            const messageData = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to,
                type: mediaType,
                [mediaType]: {
                    link: mediaUrl
                }
            };

            if (caption && (mediaType === 'image' || mediaType === 'video')) {
                messageData[mediaType].caption = caption;
            }

            const response = await this.makeApiCall(
                `/${config.phoneNumberId}/messages`,
                'POST',
                messageData
            );

            // Update statistics
            await config.updateStatistics('sent');
            
            // Add contact if not exists
            await config.addContact(to);

            logger.info(`[CentralWhatsApp] Media message sent to ${to}`);
            return {
                success: true,
                messageId: response.messages?.[0]?.id,
                status: 'sent',
                recipient: to,
                mediaType: mediaType
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error sending media message:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Create template
    async createTemplate(templateData) {
        try {
            const config = await this.getConfig();
            
            // First, get the business account ID from the phone number
            const phoneInfo = await this.makeApiCall(
                `/${config.phoneNumberId}`,
                'GET'
            );
            
            console.log('📱 [CentralWhatsApp] Phone info response:', JSON.stringify(phoneInfo, null, 2));
            
            // Try different possible field names for business account ID
            const businessAccountId = phoneInfo.waba_id || 
                                    phoneInfo.business_account_id || 
                                    phoneInfo.whatsapp_business_account_id ||
                                    phoneInfo.business_account?.id;
                                    
            if (!businessAccountId) {
                console.error('❌ [CentralWhatsApp] Available fields in phone info:', Object.keys(phoneInfo));
                throw new Error(`Could not retrieve WhatsApp Business Account ID. Available fields: ${Object.keys(phoneInfo).join(', ')}`);
            }
            
            const templatePayload = {
                name: templateData.name,
                category: templateData.category,
                language: templateData.language || 'en',
                components: templateData.components
            };

            const response = await this.makeApiCall(
                `/${businessAccountId}/message_templates`,
                'POST',
                templatePayload
            );

            // Add template to our database
            config.templates.push({
                templateId: response.id,
                templateName: templateData.name,
                category: templateData.category,
                status: 'PENDING',
                language: templateData.language || 'en',
                components: templateData.components
            });

            await config.save();

            logger.info(`[CentralWhatsApp] Template created: ${templateData.name}`);
            return {
                success: true,
                templateId: response.id,
                templateName: templateData.name,
                status: 'PENDING'
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error creating template:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Get templates
    async getTemplates() {
        try {
            const config = await this.getConfig();
            
            // Use the stored business account ID
            const businessAccountId = config.businessAccountId;
            if (!businessAccountId) {
                throw new Error('WhatsApp Business Account ID not configured');
            }
            
            const response = await this.makeApiCall(
                `/${businessAccountId}/message_templates`,
                'GET'
            );

            // Update our local templates with Meta's status
            for (const metaTemplate of response.data) {
                const localTemplate = config.templates.find(t => t.templateId === metaTemplate.id);
                if (localTemplate) {
                    localTemplate.status = metaTemplate.status;
                    if (metaTemplate.status === 'APPROVED') {
                        localTemplate.approvedAt = new Date();
                    }
                }
            }

            await config.save();

            return {
                success: true,
                templates: config.templates
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error getting templates:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Get business profile
    async getBusinessProfile() {
        try {
            const config = await this.getConfig();
            
            const response = await this.makeApiCall(
                `/${config.phoneNumberId}/whatsapp_business_profile`,
                'GET'
            );

            return {
                success: true,
                profile: response
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error getting business profile:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Update business profile
    async updateBusinessProfile(profileData) {
        try {
            const config = await this.getConfig();
            
            const response = await this.makeApiCall(
                `/${config.phoneNumberId}/whatsapp_business_profile`,
                'POST',
                profileData
            );

            // Update local config (simplified - no business fields to update)
            // Business profile updates are handled by Meta directly
            
            await config.save();

            logger.info(`[CentralWhatsApp] Business profile updated`);
            return {
                success: true,
                profile: response
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error updating business profile:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Get contacts
    async getContacts(limit = 100, offset = 0) {
        try {
            const config = await this.getConfig();
            
            const contacts = config.contacts
                .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
                .slice(offset, offset + limit);

            return {
                success: true,
                contacts: contacts,
                total: config.contacts.length,
                limit: limit,
                offset: offset
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error getting contacts:`, error.message);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        try {
            const config = await this.getConfig();
            
            // Test API connection
            await this.makeApiCall(
                `/${config.phoneNumberId}`,
                'GET'
            );

            // Update last health check
            config.lastHealthCheck = new Date();
            await config.save();

            return {
                success: true,
                status: 'healthy',
                phoneNumberId: config.phoneNumberId,
                lastHealthCheck: config.lastHealthCheck
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Health check failed:`, error.message);
            return {
                success: false,
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    // Make API call to Meta
    async makeApiCall(endpoint, method = 'GET', data = null) {
        try {
            const config = await this.getConfig();
            const url = `${this.baseUrl}${endpoint}`;
            
            const options = {
                method,
                url,
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json'
                }
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                options.data = data;
            }

            const response = await axios(options);
            return response.data;

        } catch (error) {
            logger.error(`[CentralWhatsApp] API call failed:`, error.response?.data || error.message);
            
            // Check for specific error types
            if (error.response?.status === 401) {
                const errorData = error.response.data;
                if (errorData?.error?.code === 190) {
                    // Token expired or invalid
                    const errorMessage = errorData.error.message || 'Access token is invalid or expired';
                    const enhancedError = new Error(`WhatsApp Access Token Error: ${errorMessage}`);
                    enhancedError.code = 'TOKEN_EXPIRED';
                    enhancedError.originalError = errorData;
                    throw enhancedError;
                } else if (errorData?.error?.type === 'OAuthException') {
                    // General OAuth error
                    const errorMessage = errorData.error.message || 'OAuth authentication failed';
                    const enhancedError = new Error(`WhatsApp OAuth Error: ${errorMessage}`);
                    enhancedError.code = 'OAUTH_ERROR';
                    enhancedError.originalError = errorData;
                    throw enhancedError;
                }
            }
            
            throw error;
        }
    }

    // Sync templates from Meta
    async syncTemplates() {
        try {
            const config = await this.getConfig();
            
            // First, get the business account ID from the phone number
            const phoneInfo = await this.makeApiCall(
                `/${config.phoneNumberId}`,
                'GET'
            );
            
            const businessAccountId = phoneInfo.waba_id;
            if (!businessAccountId) {
                throw new Error('Could not retrieve WhatsApp Business Account ID');
            }
            
            const response = await this.makeApiCall(
                `/${businessAccountId}/message_templates`,
                'GET'
            );

            // Update local templates
            for (const metaTemplate of response.data) {
                const existingTemplate = config.templates.find(t => t.templateId === metaTemplate.id);
                
                if (existingTemplate) {
                    // Update existing template
                    existingTemplate.status = metaTemplate.status;
                    existingTemplate.category = metaTemplate.category;
                    existingTemplate.language = metaTemplate.language;
                    if (metaTemplate.status === 'APPROVED') {
                        existingTemplate.approvedAt = new Date();
                    }
                } else {
                    // Add new template
                    config.templates.push({
                        templateId: metaTemplate.id,
                        templateName: metaTemplate.name,
                        category: metaTemplate.category,
                        status: metaTemplate.status,
                        language: metaTemplate.language,
                        components: metaTemplate.components || [],
                        createdAt: new Date(),
                        approvedAt: metaTemplate.status === 'APPROVED' ? new Date() : null
                    });
                }
            }

            config.lastSyncAt = new Date();
            await config.save();

            logger.info(`[CentralWhatsApp] Templates synced successfully`);
            return {
                success: true,
                syncedTemplates: response.data.length,
                totalTemplates: config.templates.length
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error syncing templates:`, error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new CentralWhatsAppService();
