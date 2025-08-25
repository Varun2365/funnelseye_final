const mongoose = require('mongoose');
const { WhatsAppIntegration, WhatsAppConversation, WhatsAppMessage, WhatsAppContact } = require('../schema');
const metaWhatsAppService = require('./metaWhatsAppService');
const baileysWhatsAppService = require('./baileysWhatsAppService');
const { publishEvent } = require('./rabbitmqProducer');

class UnifiedWhatsAppService {
    constructor() {
        this.activeIntegrations = new Map(); // Track active integration per coach
        this.inboxCache = new Map(); // Cache inbox data for performance
    }

    /**
     * Get the active integration for a coach
     */
    async getActiveIntegration(coachId) {
        try {
            // Check cache first
            if (this.activeIntegrations.has(coachId)) {
                return this.activeIntegrations.get(coachId);
            }

            // Get active integration from database
            const integration = await WhatsAppIntegration.findOne({
                coachId,
                isActive: true
            });

            if (integration) {
                this.activeIntegrations.set(coachId, integration);
            }

            return integration;
        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error getting active integration:`, error);
            throw error;
        }
    }

    /**
     * Switch integration type for a coach
     */
    async switchIntegration(coachId, integrationType) {
        try {
            console.log(`[UnifiedWhatsApp] Switching integration for coach ${coachId} to ${integrationType}`);

            // Deactivate current integration
            await WhatsAppIntegration.updateMany(
                { coachId, isActive: true },
                { isActive: false }
            );

            // Activate new integration
            const integration = await WhatsAppIntegration.findOneAndUpdate(
                { coachId, integrationType },
                { isActive: true },
                { new: true }
            );

            if (!integration) {
                throw new Error(`Integration of type ${integrationType} not found for this coach`);
            }

            // Update cache
            this.activeIntegrations.set(coachId, integration);

            // Initialize Baileys session if switching to personal account
            if (integrationType === 'baileys_personal') {
                try {
                    await baileysWhatsAppService.initializeSession(coachId);
                } catch (error) {
                    console.error(`[UnifiedWhatsApp] Error initializing Baileys session:`, error);
                    // Don't throw error, allow integration switch to complete
                }
            }

            // Clear inbox cache
            this.inboxCache.delete(coachId);

            console.log(`[UnifiedWhatsApp] Integration switched successfully for coach ${coachId}`);
            return { success: true, integration: integration.getPublicDetails() };

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error switching integration:`, error);
            throw error;
        }
    }

    /**
     * Send message through appropriate integration
     */
    async sendMessage(coachId, recipientNumber, content, options = {}) {
        try {
            const integration = await this.getActiveIntegration(coachId);
            if (!integration) {
                throw new Error('No active WhatsApp integration found');
            }

            let result;
            if (integration.integrationType === 'meta_official') {
                // Send via Meta API
                result = await metaWhatsAppService.sendMessageByCoach(
                    coachId,
                    recipientNumber,
                    content,
                    options.useTemplate || false
                );
            } else {
                // Send via Baileys
                result = await baileysWhatsAppService.sendMessage(
                    coachId,
                    recipientNumber,
                    content,
                    options
                );
            }

            // Create unified message record
            await this.createUnifiedMessageRecord(coachId, recipientNumber, content, 'outbound', integration.integrationType, options);

            return result;

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error sending message:`, error);
            throw error;
        }
    }

    /**
     * Send template message
     */
    async sendTemplateMessage(coachId, recipientNumber, templateName, language = 'en', components = []) {
        try {
            const integration = await this.getActiveIntegration(coachId);
            if (!integration) {
                throw new Error('No active WhatsApp integration found');
            }

            if (integration.integrationType === 'meta_official') {
                // Meta API supports templates natively
                return await metaWhatsAppService.sendTemplateMessage(
                    coachId,
                    recipientNumber,
                    templateName,
                    language,
                    components
                );
            } else {
                // For Baileys, we'll send a formatted message
                const templateContent = await this.getTemplateContent(templateName, language, components);
                return await baileysWhatsAppService.sendMessage(
                    coachId,
                    recipientNumber,
                    templateContent
                );
            }

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error sending template message:`, error);
            throw error;
        }
    }

    /**
     * Get inbox conversations for a coach
     */
    async getInboxConversations(coachId, filters = {}) {
        try {
            // Check cache first
            const cacheKey = `${coachId}_${JSON.stringify(filters)}`;
            if (this.inboxCache.has(cacheKey)) {
                const cached = this.inboxCache.get(cacheKey);
                if (Date.now() - cached.timestamp < 30000) { // 30 second cache
                    return cached.data;
                }
            }

            // Get conversations from database
            const conversations = await WhatsAppConversation.findByCoach(coachId, filters);
            
            // Enrich with contact information
            const enrichedConversations = await Promise.all(
                conversations.map(async (conv) => {
                    const contact = await WhatsAppContact.findOne({
                        coachId,
                        contactNumber: conv.contactNumber
                    });

                    return {
                        ...conv.toObject(),
                        contact: contact ? contact.summary : null,
                        integrationType: conv.integrationType
                    };
                })
            );

            // Cache the result
            this.inboxCache.set(cacheKey, {
                data: enrichedConversations,
                timestamp: Date.now()
            });

            return enrichedConversations;

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error getting inbox conversations:`, error);
            throw error;
        }
    }

    /**
     * Get messages for a conversation
     */
    async getConversationMessages(conversationId, options = {}) {
        try {
            const messages = await WhatsAppMessage.findByConversation(conversationId, options);
            return messages.map(msg => msg.summary);
        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error getting conversation messages:`, error);
            throw error;
        }
    }

    /**
     * Mark conversation as read
     */
    async markConversationAsRead(conversationId) {
        try {
            const conversation = await WhatsAppConversation.findOne({ conversationId });
            if (!conversation) {
                throw new Error('Conversation not found');
            }

            await conversation.markAsRead();

            // Mark all messages as read
            await WhatsAppMessage.updateMany(
                { conversationId, readStatus: 'unread' },
                { readStatus: 'read' }
            );

            // Clear cache
            this.clearInboxCache(conversation.coachId);

            return { success: true };

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error marking conversation as read:`, error);
            throw error;
        }
    }

    /**
     * Archive conversation
     */
    async archiveConversation(conversationId) {
        try {
            const conversation = await WhatsAppConversation.findOne({ conversationId });
            if (!conversation) {
                throw new Error('Conversation not found');
            }

            await conversation.archive();

            // Clear cache
            this.clearInboxCache(conversation.coachId);

            return { success: true };

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error archiving conversation:`, error);
            throw error;
        }
    }

    /**
     * Pin/unpin conversation
     */
    async togglePinConversation(conversationId) {
        try {
            const conversation = await WhatsAppConversation.findOne({ conversationId });
            if (!conversation) {
                throw new Error('Conversation not found');
            }

            await conversation.togglePin();

            // Clear cache
            this.clearInboxCache(conversation.coachId);

            return { success: true, isPinned: conversation.isPinned };

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error toggling conversation pin:`, error);
            throw error;
        }
    }

    /**
     * Search conversations and messages
     */
    async searchInbox(coachId, searchTerm, searchType = 'conversations') {
        try {
            if (searchType === 'conversations') {
                // Search conversations
                const conversations = await WhatsAppConversation.find({
                    coachId,
                    $or: [
                        { contactName: { $regex: searchTerm, $options: 'i' } },
                        { contactNumber: { $regex: searchTerm, $options: 'i' } },
                        { lastMessageContent: { $regex: searchTerm, $options: 'i' } }
                    ]
                }).sort({ lastMessageAt: -1 });

                return conversations.map(conv => conv.summary);

            } else {
                // Search messages
                const messages = await WhatsAppMessage.find({
                    coachId,
                    $or: [
                        { content: { $regex: searchTerm, $options: 'i' } },
                        { contactNumber: { $regex: searchTerm, $options: 'i' } }
                    ]
                }).sort({ timestamp: -1 });

                return messages.map(msg => msg.summary);
            }

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error searching inbox:`, error);
            throw error;
        }
    }

    /**
     * Get inbox statistics
     */
    async getInboxStats(coachId) {
        try {
            const [conversationStats, messageStats, contactStats] = await Promise.all([
                WhatsAppConversation.getStats(coachId),
                WhatsAppMessage.getStats(coachId),
                WhatsAppContact.getStats(coachId)
            ]);

            return {
                conversations: conversationStats[0] || {},
                messages: messageStats[0] || {},
                contacts: contactStats[0] || {}
            };

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error getting inbox stats:`, error);
            throw error;
        }
    }

    /**
     * Create unified message record
     */
    async createUnifiedMessageRecord(coachId, recipientNumber, content, direction, integrationType, options = {}) {
        try {
            // Get or create conversation
            const conversation = await this.getOrCreateConversation(coachId, recipientNumber, integrationType);

            // Create message record
            const message = new WhatsAppMessage({
                messageId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                conversationId: conversation.conversationId,
                coachId,
                direction,
                messageType: options.mediaUrl ? options.mediaType : 'text',
                content,
                mediaUrl: options.mediaUrl,
                mediaType: options.mediaType,
                timestamp: new Date(),
                deliveryStatus: 'sent',
                readStatus: direction === 'outbound' ? 'read' : 'unread',
                integrationType,
                leadId: conversation.leadId
            });

            await message.save();

            // Update conversation
            await conversation.addMessage({
                timestamp: message.timestamp,
                content,
                direction
            });

            // Update integration stats
            await this.updateIntegrationStats(coachId, direction === 'outbound' ? 'sent' : 'received');

            return message;

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error creating unified message record:`, error);
            throw error;
        }
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
            console.error(`[UnifiedWhatsApp] Error getting/creating conversation:`, error);
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
            console.error(`[UnifiedWhatsApp] Error creating/updating contact:`, error);
        }
    }

    /**
     * Update integration statistics
     */
    async updateIntegrationStats(coachId, type) {
        try {
            const update = type === 'sent' 
                ? { $inc: { totalMessagesSent: 1 }, lastMessageAt: new Date() }
                : { $inc: { totalMessagesReceived: 1 }, lastMessageAt: new Date() };

            await WhatsAppIntegration.findOneAndUpdate(
                { coachId, isActive: true },
                update
            );
        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error updating integration stats:`, error);
        }
    }

    /**
     * Get template content (for Baileys when templates aren't supported)
     */
    async getTemplateContent(templateName, language, components) {
        // This would typically fetch from a template database
        // For now, return a simple formatted message
        return `[${templateName.toUpperCase()}] ${components.map(c => c.text).join(' ')}`;
    }

    /**
     * Clear inbox cache for a coach
     */
    clearInboxCache(coachId) {
        for (const [key] of this.inboxCache) {
            if (key.startsWith(`${coachId}_`)) {
                this.inboxCache.delete(key);
            }
        }
    }

    /**
     * Get integration health status
     */
    async getIntegrationHealth(coachId) {
        try {
            const integration = await this.getActiveIntegration(coachId);
            if (!integration) {
                return { status: 'no_integration', message: 'No WhatsApp integration found' };
            }

            if (integration.integrationType === 'meta_official') {
                // Check Meta API health
                try {
                    await metaWhatsAppService.testConnection(coachId);
                    return { status: 'healthy', integration: 'meta_official' };
                } catch (error) {
                    return { status: 'unhealthy', integration: 'meta_official', error: error.message };
                }
            } else {
                // Check Baileys health
                try {
                    const status = await baileysWhatsAppService.getSessionStatus(coachId);
                    return {
                        status: status.isConnected ? 'healthy' : 'unhealthy',
                        integration: 'baileys_personal',
                        details: status
                    };
                } catch (error) {
                    return { status: 'unhealthy', integration: 'baileys_personal', error: error.message };
                }
            }

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error getting integration health:`, error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * Handle incoming message from any integration
     */
    async handleIncomingMessage(coachId, messageData, integrationType) {
        try {
            // Create unified message record
            const message = await this.createUnifiedMessageRecord(
                coachId,
                messageData.contactNumber,
                messageData.content,
                'inbound',
                integrationType,
                messageData
            );

            // Check for auto-reply
            await this.checkAutoReply(coachId, message);

            // Trigger automation events
            await this.triggerAutomationEvents(coachId, message);

            return message;

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error handling incoming message:`, error);
            throw error;
        }
    }

    /**
     * Check and send auto-reply
     */
    async checkAutoReply(coachId, message) {
        try {
            const integration = await this.getActiveIntegration(coachId);
            if (!integration?.autoReplyEnabled || !integration.autoReplyMessage) {
                return;
            }

            // Send auto-reply
            await this.sendMessage(
                coachId,
                message.contactNumber,
                integration.autoReplyMessage
            );

            console.log(`[UnifiedWhatsApp] Auto-reply sent for coach ${coachId}`);

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error sending auto-reply:`, error);
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
                    integrationType: message.integrationType
                },
                relatedDoc: { messageId: message._id, coachId },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error triggering automation events:`, error);
        }
    }

    /**
     * Get all integrations for a coach
     */
    async getCoachIntegrations(coachId) {
        try {
            const integrations = await WhatsAppIntegration.find({ coachId });
            return integrations.map(integration => integration.getPublicDetails());
        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error getting coach integrations:`, error);
            throw error;
        }
    }

    /**
     * Setup new integration
     */
    async setupIntegration(coachId, integrationData) {
        try {
            // Deactivate existing integrations
            await WhatsAppIntegration.updateMany(
                { coachId, isActive: true },
                { isActive: false }
            );

            // Create or update integration
            const integration = await WhatsAppIntegration.findOneAndUpdate(
                { coachId, integrationType: integrationData.integrationType },
                { ...integrationData, isActive: true },
                { upsert: true, new: true }
            );

            // Update cache
            this.activeIntegrations.set(coachId, integration);

            // Initialize Baileys if needed
            if (integrationData.integrationType === 'baileys_personal') {
                try {
                    await baileysWhatsAppService.initializeSession(coachId);
                } catch (error) {
                    console.error(`[UnifiedWhatsApp] Error initializing Baileys session:`, error);
                }
            }

            return { success: true, integration: integration.getPublicDetails() };

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error setting up integration:`, error);
            throw error;
        }
    }

    /**
     * Test integration connection
     */
    async testIntegration(coachId) {
        try {
            const integration = await this.getActiveIntegration(coachId);
            if (!integration) {
                throw new Error('No active integration found');
            }

            if (integration.integrationType === 'meta_official') {
                return await metaWhatsAppService.testConnection(coachId);
            } else {
                const status = await baileysWhatsAppService.getSessionStatus(coachId);
                return {
                    success: status.isConnected,
                    message: status.isConnected ? 'Baileys session connected' : 'Baileys session not connected',
                    details: status
                };
            }

        } catch (error) {
            console.error(`[UnifiedWhatsApp] Error testing integration:`, error);
            throw error;
        }
    }
}

module.exports = new UnifiedWhatsAppService();
