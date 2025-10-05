const axios = require('axios');
const CentralWhatsApp = require('../schema/CentralWhatsApp');
const logger = require('../utils/logger');

class CentralWhatsAppService {
    constructor() {
        this.baseUrl = 'https://graph.facebook.com/v23.0';
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

    // Format components for Meta API v23.0 (based on official Meta documentation)
    formatComponentsForMeta(components) {
        console.log('🔧 [CentralWhatsApp] formatComponentsForMeta called with:', JSON.stringify(components, null, 2));
        
        return components.map((component, index) => {
            console.log(`🔧 [CentralWhatsApp] Processing component ${index}:`, JSON.stringify(component, null, 2));
            
            if (component.type === 'BODY') {
                // Extract variables from text (e.g., {{1}}, {{2}}, {{3}})
                const variables = component.text.match(/\{\{(\d+)\}\}/g) || [];
                const variableCount = variables.length;
                
                let formattedComponent = {
                    type: 'BODY',
                    text: component.text
                };
                
                // Add example if there are variables (as per Meta documentation)
                if (variableCount > 0) {
                    // Create example values array - Meta expects nested array for multiple variables
                    const exampleValues = [];
                    for (let i = 1; i <= variableCount; i++) {
                        exampleValues.push(`sample_value_${i}`);
                    }
                    
                    formattedComponent.example = {
                        body_text: [exampleValues] // Note: nested array as per Meta docs
                    };
                }
                
                console.log(`🔧 [CentralWhatsApp] Formatted BODY component:`, JSON.stringify(formattedComponent, null, 2));
                return formattedComponent;
                
            } else if (component.type === 'HEADER') {
                let formattedComponent = {
                    type: 'HEADER',
                    format: component.format || 'TEXT',
                    text: component.text
                };
                
                // Add example if there are variables (as per Meta documentation)
                const variables = component.text.match(/\{\{(\d+)\}\}/g) || [];
                if (variables.length > 0) {
                    formattedComponent.example = {
                        header_text: [`sample_header_value`]
                    };
                }
                
                console.log(`🔧 [CentralWhatsApp] Formatted HEADER component:`, JSON.stringify(formattedComponent, null, 2));
                return formattedComponent;
                
            } else if (component.type === 'FOOTER') {
                // FOOTER doesn't need example (as per Meta documentation)
                const formattedComponent = {
                    type: 'FOOTER',
                    text: component.text
                };
                console.log(`🔧 [CentralWhatsApp] Formatted FOOTER component:`, JSON.stringify(formattedComponent, null, 2));
                return formattedComponent;
                
            } else if (component.type === 'BUTTONS') {
                const formattedComponent = {
                    type: 'BUTTONS',
                    buttons: component.buttons || []
                };
                console.log(`🔧 [CentralWhatsApp] Formatted BUTTONS component:`, JSON.stringify(formattedComponent, null, 2));
                return formattedComponent;
            }
            
            return component;
        });
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
    async sendTemplateMessage(to, templateName, language = 'en_US', parameters = [], coachId = null) {
        try {
            const config = await this.getConfig();
            
            // Get template
            const template = config.getTemplateByName(templateName);
            if (!template) {
                throw new Error(`Template '${templateName}' not found in local templates`);
            }

            // Check if template is approved
            if (template.status !== 'APPROVED') {
                throw new Error(`Template '${templateName}' is not approved. Current status: ${template.status}`);
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
            
            // Use the stored business account ID from configuration
            const businessAccountId = config.businessAccountId;
            if (!businessAccountId) {
                throw new Error('WhatsApp Business Account ID not configured. Please set up the central WhatsApp configuration first.');
            }
            
            console.log('📱 [CentralWhatsApp] Using stored business account ID:', businessAccountId);
            
            // Meta API v23.0 requires specific component structure (based on official docs)
            const formattedComponents = this.formatComponentsForMeta(templateData.components);
            console.log('🔧 [CentralWhatsApp] Original components:', JSON.stringify(templateData.components, null, 2));
            console.log('🔧 [CentralWhatsApp] Formatted components:', JSON.stringify(formattedComponents, null, 2));
            
            const templatePayload = {
                name: templateData.name,
                category: templateData.category,
                language: templateData.language || 'en_US',
                components: formattedComponents
            };
            
            console.log('🔧 [CentralWhatsApp] Final payload:', JSON.stringify(templatePayload, null, 2));

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

    // Update contact name
    async updateContact(phoneNumber, name) {
        try {
            const config = await this.getConfig();
            
            const contact = config.contacts.find(c => c.phoneNumber === phoneNumber);
            if (!contact) {
                throw new Error('Contact not found');
            }
            
            contact.name = name || null;
            await config.save();
            
            logger.info(`[CentralWhatsApp] Contact updated: ${phoneNumber}`);
            return {
                success: true,
                contact: contact
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error updating contact:`, error.message);
            throw error;
        }
    }

    // Send bulk messages
    async sendBulkMessages(contacts, message, templateName, parameters, mediaUrl, mediaType) {
        try {
            const results = [];
            let sentCount = 0;
            let failedCount = 0;
            
            // Get template language once if sending template messages
            let templateLanguage = 'en_US';
            if (templateName && templateName.trim()) {
                const config = await this.getConfig();
                const template = config.getTemplateByName(templateName);
                templateLanguage = template?.language || 'en_US';
            }
            
            for (const phoneNumber of contacts) {
                try {
                    let result;
                    
                    if (templateName && templateName.trim()) {
                        // Send template message
                        result = await this.sendTemplateMessage(phoneNumber, templateName, templateLanguage, parameters || []);
                    } else if (mediaUrl && mediaUrl.trim()) {
                        // Send media message
                        result = await this.sendMediaMessage(phoneNumber, mediaUrl, mediaType || 'image', message || '');
                    } else {
                        // Send text message
                        result = await this.sendTextMessage(phoneNumber, message);
                    }
                    
                    results.push({
                        phoneNumber,
                        success: true,
                        messageId: result.messageId
                    });
                    sentCount++;
                } catch (error) {
                    results.push({
                        phoneNumber,
                        success: false,
                        error: error.message
                    });
                    failedCount++;
                }
            }
            
            logger.info(`[CentralWhatsApp] Bulk messages sent: ${sentCount} successful, ${failedCount} failed`);
            return {
                success: true,
                sentCount,
                failedCount,
                results
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error sending bulk messages:`, error.message);
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
            
            // Check for template-related errors
            if (error.response?.status === 404) {
                const errorData = error.response.data;
                if (errorData?.error?.code === 132001) {
                    // Template not found or not approved
                    const errorMessage = errorData.error.message || 'Template not found or not approved';
                    const enhancedError = new Error(`WhatsApp Template Error: ${errorMessage}`);
                    enhancedError.code = 'TEMPLATE_NOT_FOUND';
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
            
            // Use the stored business account ID from configuration
            const businessAccountId = config.businessAccountId;
            if (!businessAccountId) {
                throw new Error('WhatsApp Business Account ID not configured. Please set up the central WhatsApp configuration first.');
            }
            
            const response = await this.makeApiCall(
                `/${businessAccountId}/message_templates`,
                'GET'
            );

            // Get template IDs from Meta response
            const metaTemplateIds = new Set(response.data.map(t => t.id));
            
            // Track changes for logging
            let addedCount = 0;
            let updatedCount = 0;
            let removedCount = 0;
            
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
                    updatedCount++;
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
                    addedCount++;
                }
            }
            
            // Remove templates that are no longer in Meta response
            const initialTemplateCount = config.templates.length;
            config.templates = config.templates.filter(template => {
                const existsInMeta = metaTemplateIds.has(template.templateId);
                if (!existsInMeta) {
                    removedCount++;
                    logger.info(`[CentralWhatsApp] Removing template: ${template.templateName} (${template.templateId}) - no longer found in Meta API`);
                }
                return existsInMeta;
            });
            
            logger.info(`[CentralWhatsApp] Template sync completed: +${addedCount} added, ${updatedCount} updated, -${removedCount} removed`);

            config.lastSyncAt = new Date();
            await config.save();

            // Clean up orphaned templates in WhatsAppTemplate collection
            await this.cleanupOrphanedTemplates(config.templates.map(t => t.templateId));

            logger.info(`[CentralWhatsApp] Templates synced successfully`);
            return {
                success: true,
                syncedTemplates: response.data.length,
                totalTemplates: config.templates.length,
                changes: {
                    added: addedCount,
                    updated: updatedCount,
                    removed: removedCount
                },
                summary: `+${addedCount} added, ${updatedCount} updated, -${removedCount} removed`
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error syncing templates:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Clean up orphaned templates from WhatsAppTemplate collection
    async cleanupOrphanedTemplates(validTemplateIds) {
        try {
            const WhatsAppTemplate = require('../schema/WhatsAppTemplate');
            
            // Find templates that are no longer valid
            const orphanedTemplates = await WhatsAppTemplate.find({
                templateId: { $nin: validTemplateIds }
            });
            
            if (orphanedTemplates.length > 0) {
                logger.info(`[CentralWhatsApp] Found ${orphanedTemplates.length} orphaned templates to remove`);
                
                // Log which templates are being removed
                for (const template of orphanedTemplates) {
                    logger.info(`[CentralWhatsApp] Removing orphaned template: ${template.name} (${template.templateId})`);
                }
                
                // Remove orphaned templates
                const deleteResult = await WhatsAppTemplate.deleteMany({
                    templateId: { $nin: validTemplateIds }
                });
                
                logger.info(`[CentralWhatsApp] Cleaned up ${deleteResult.deletedCount} orphaned templates from database`);
                
                return {
                    success: true,
                    removedCount: deleteResult.deletedCount,
                    orphanedTemplates: orphanedTemplates.map(t => ({
                        name: t.name,
                        templateId: t.templateId
                    }))
                };
            }
            
            return {
                success: true,
                removedCount: 0,
                message: 'No orphaned templates found'
            };
            
        } catch (error) {
            logger.error(`[CentralWhatsApp] Error cleaning up orphaned templates:`, error);
            throw error;
        }
    }
}

module.exports = new CentralWhatsAppService();

