const { WhatsAppIntegration, WhatsAppConversation, WhatsAppMessage, WhatsAppContact } = require('../schema');
const unifiedWhatsAppService = require('../services/unifiedWhatsAppService');
const baileysWhatsAppService = require('../services/baileysWhatsAppService');
const metaWhatsAppService = require('../services/metaWhatsAppService');

/**
 * Setup WhatsApp integration for a coach
 */
const setupIntegration = async (req, res) => {
    try {
        const { coachId } = req.user;
        const integrationData = req.body;

        // Validate required fields
        if (!integrationData.integrationType) {
            return res.status(400).json({
                success: false,
                message: 'Integration type is required'
            });
        }

        // Validate integration type specific fields
        if (integrationData.integrationType === 'meta_official') {
            if (!integrationData.metaApiToken || !integrationData.phoneNumberId) {
                return res.status(400).json({
                    success: false,
                    message: 'Meta API token and phone number ID are required for official integration'
                });
            }
        }

        // Setup integration
        const result = await unifiedWhatsAppService.setupIntegration(coachId, integrationData);

        res.status(200).json({
            success: true,
            message: 'WhatsApp integration setup successfully',
            data: result
        });

    } catch (error) {
        console.error('[WhatsAppController] Error setting up integration:', error);
        res.status(500).json({
            success: false,
            message: 'Error setting up WhatsApp integration',
            error: error.message
        });
    }
};

/**
 * Switch between integration types
 */
const switchIntegration = async (req, res) => {
    try {
        const { coachId } = req.user;
        const { integrationType } = req.body;

        if (!integrationType || !['meta_official', 'baileys_personal'].includes(integrationType)) {
            return res.status(400).json({
                success: false,
                message: 'Valid integration type is required'
            });
        }

        const result = await unifiedWhatsAppService.switchIntegration(coachId, integrationType);

        res.status(200).json({
            success: true,
            message: 'Integration switched successfully',
            data: result
        });

    } catch (error) {
        console.error('[WhatsAppController] Error switching integration:', error);
        res.status(500).json({
            success: false,
            message: 'Error switching integration',
            error: error.message
        });
    }
};

/**
 * Get coach's WhatsApp integrations
 */
const getIntegrations = async (req, res) => {
    try {
        const { coachId } = req.user;

        const integrations = await unifiedWhatsAppService.getCoachIntegrations(coachId);

        res.status(200).json({
            success: true,
            data: integrations
        });

    } catch (error) {
        console.error('[WhatsAppController] Error getting integrations:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting integrations',
            error: error.message
        });
    }
};

/**
 * Test integration connection
 */
const testIntegration = async (req, res) => {
    try {
        const { coachId } = req.user;

        const result = await unifiedWhatsAppService.testIntegration(coachId);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('[WhatsAppController] Error testing integration:', error);
        res.status(500).json({
            success: false,
            message: 'Error testing integration',
            error: error.message
        });
    }
};

/**
 * Send WhatsApp message
 */
const sendMessage = async (req, res) => {
    try {
        const { coachId } = req.user;
        const { recipientNumber, content, options = {} } = req.body;

        if (!recipientNumber || !content) {
            return res.status(400).json({
                success: false,
                message: 'Recipient number and content are required'
            });
        }

        const result = await unifiedWhatsAppService.sendMessage(coachId, recipientNumber, content, options);

        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            data: result
        });

    } catch (error) {
        console.error('[WhatsAppController] Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
};

/**
 * Send template message
 */
const sendTemplateMessage = async (req, res) => {
    try {
        const { coachId } = req.user;
        const { recipientNumber, templateName, language = 'en', components = [] } = req.body;

        if (!recipientNumber || !templateName) {
            return res.status(400).json({
                success: false,
                message: 'Recipient number and template name are required'
            });
        }

        const result = await unifiedWhatsAppService.sendTemplateMessage(
            coachId,
            recipientNumber,
            templateName,
            language,
            components
        );

        res.status(200).json({
            success: true,
            message: 'Template message sent successfully',
            data: result
        });

    } catch (error) {
        console.error('[WhatsAppController] Error sending template message:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending template message',
            error: error.message
        });
    }
};

/**
 * Get inbox conversations
 */
const getInboxConversations = async (req, res) => {
    try {
        const { coachId } = req.user;
        const { status, category, search, page = 1, limit = 20 } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (category) filters.category = category;

        let conversations;
        if (search) {
            conversations = await unifiedWhatsAppService.searchInbox(coachId, search, 'conversations');
        } else {
            conversations = await unifiedWhatsAppService.getInboxConversations(coachId, filters);
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedConversations = conversations.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            data: {
                conversations: paginatedConversations,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(conversations.length / limit),
                    totalConversations: conversations.length,
                    hasNextPage: endIndex < conversations.length,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('[WhatsAppController] Error getting inbox conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting inbox conversations',
            error: error.message
        });
    }
};

/**
 * Get conversation messages
 */
const getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const options = {
            offset: (page - 1) * limit,
            limit: parseInt(limit)
        };

        const messages = await unifiedWhatsAppService.getConversationMessages(conversationId, options);

        res.status(200).json({
            success: true,
            data: {
                messages,
                pagination: {
                    currentPage: parseInt(page),
                    totalMessages: messages.length,
                    hasNextPage: messages.length === limit
                }
            }
        });

    } catch (error) {
        console.error('[WhatsAppController] Error getting conversation messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting conversation messages',
            error: error.message
        });
    }
};

/**
 * Mark conversation as read
 */
const markConversationAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const result = await unifiedWhatsAppService.markConversationAsRead(conversationId);

        res.status(200).json({
            success: true,
            message: 'Conversation marked as read',
            data: result
        });

    } catch (error) {
        console.error('[WhatsAppController] Error marking conversation as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking conversation as read',
            error: error.message
        });
    }
};

/**
 * Archive conversation
 */
const archiveConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const result = await unifiedWhatsAppService.archiveConversation(conversationId);

        res.status(200).json({
            success: true,
            message: 'Conversation archived successfully',
            data: result
        });

    } catch (error) {
        console.error('[WhatsAppController] Error archiving conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Error archiving conversation',
            error: error.message
        });
    }
};

/**
 * Toggle conversation pin
 */
const togglePinConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const result = await unifiedWhatsAppService.togglePinConversation(conversationId);

        res.status(200).json({
            success: true,
            message: `Conversation ${result.isPinned ? 'pinned' : 'unpinned'} successfully`,
            data: result
        });

    } catch (error) {
        console.error('[WhatsAppController] Error toggling conversation pin:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling conversation pin',
            error: error.message
        });
    }
};

/**
 * Get inbox statistics
 */
const getInboxStats = async (req, res) => {
    try {
        const { coachId } = req.user;

        const stats = await unifiedWhatsAppService.getInboxStats(coachId);

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('[WhatsAppController] Error getting inbox stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting inbox stats',
            error: error.message
        });
    }
};

/**
 * Search inbox
 */
const searchInbox = async (req, res) => {
    try {
        const { coachId } = req.user;
        const { q: searchTerm, type = 'conversations' } = req.query;

        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                message: 'Search term is required'
            });
        }

        const results = await unifiedWhatsAppService.searchInbox(coachId, searchTerm, type);

        res.status(200).json({
            success: true,
            data: {
                results,
                searchTerm,
                searchType: type,
                totalResults: results.length
            }
        });

    } catch (error) {
        console.error('[WhatsAppController] Error searching inbox:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching inbox',
            error: error.message
        });
    }
};

/**
 * Get integration health
 */
const getIntegrationHealth = async (req, res) => {
    try {
        const { coachId } = req.user;

        const health = await unifiedWhatsAppService.getIntegrationHealth(coachId);

        res.status(200).json({
            success: true,
            data: health
        });

    } catch (error) {
        console.error('[WhatsAppController] Error getting integration health:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting integration health',
            error: error.message
        });
    }
};

// Baileys specific endpoints

/**
 * Initialize Baileys session
 */
const initializeBaileysSession = async (req, res) => {
    try {
        const { coachId } = req.user;

        const result = await baileysWhatsAppService.initializeSession(coachId);

        res.status(200).json({
            success: true,
            message: 'Baileys session initialized',
            data: result
        });

    } catch (error) {
        console.error('[WhatsAppController] Error initializing Baileys session:', error);
        res.status(500).json({
            success: false,
            message: 'Error initializing Baileys session',
            error: error.message
        });
    }
};

/**
 * Get Baileys QR code
 */
const getBaileysQRCode = async (req, res) => {
    try {
        const { coachId } = req.user;

        const result = await baileysWhatsAppService.getQRCode(coachId);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('[WhatsAppController] Error getting Baileys QR code:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting QR code',
            error: error.message
        });
    }
};

/**
 * Get Baileys session status
 */
const getBaileysSessionStatus = async (req, res) => {
    try {
        const { coachId } = req.user;

        const result = await baileysWhatsAppService.getSessionStatus(coachId);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('[WhatsAppController] Error getting Baileys session status:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting session status',
            error: error.message
        });
    }
};

/**
 * Disconnect Baileys session
 */
const disconnectBaileysSession = async (req, res) => {
    try {
        const { coachId } = req.user;

        const result = await baileysWhatsAppService.disconnectSession(coachId);

        res.status(200).json({
            success: true,
            message: 'Baileys session disconnected',
            data: result
        });

    } catch (error) {
        console.error('[WhatsAppController] Error disconnecting Baileys session:', error);
        res.status(500).json({
            success: false,
            message: 'Error disconnecting session',
            error: error.message
        });
    }
};

/**
 * Delete Baileys session data
 */
const deleteBaileysSession = async (req, res) => {
    try {
        const { coachId } = req.user;

        const result = await baileysWhatsAppService.deleteSession(coachId);

        res.status(200).json({
            success: true,
            message: 'Baileys session data deleted',
            data: result
        });

    } catch (error) {
        console.error('[WhatsAppController] Error deleting Baileys session:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting session data',
            error: error.message
        });
    }
};

/**
 * Get all contacts
 */
const getContacts = async (req, res) => {
    try {
        const { coachId } = req.user;
        const { status, category, search, page = 1, limit = 20 } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (category) filters.category = category;

        let contacts;
        if (search) {
            contacts = await WhatsAppContact.searchContacts(coachId, search);
        } else {
            contacts = await WhatsAppContact.findByCoach(coachId, filters);
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedContacts = contacts.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            data: {
                contacts: paginatedContacts.map(contact => contact.summary),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(contacts.length / limit),
                    totalContacts: contacts.length,
                    hasNextPage: endIndex < contacts.length,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('[WhatsAppController] Error getting contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting contacts',
            error: error.message
        });
    }
};

/**
 * Update contact information
 */
const updateContact = async (req, res) => {
    try {
        const { contactId } = req.params;
        const updateData = req.body;

        const contact = await WhatsAppContact.findById(contactId);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        // Update allowed fields
        const allowedFields = ['contactName', 'notes', 'category', 'tags', 'businessName'];
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                contact[field] = updateData[field];
            }
        });

        await contact.save();

        res.status(200).json({
            success: true,
            message: 'Contact updated successfully',
            data: contact.summary
        });

    } catch (error) {
        console.error('[WhatsAppController] Error updating contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating contact',
            error: error.message
        });
    }
};

/**
 * Block/unblock contact
 */
const toggleContactBlock = async (req, res) => {
    try {
        const { contactId } = req.params;
        const { action } = req.body; // 'block' or 'unblock'

        const contact = await WhatsAppContact.findById(contactId);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        if (action === 'block') {
            await contact.block();
        } else if (action === 'unblock') {
            await contact.unblock();
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Use "block" or "unblock"'
            });
        }

        res.status(200).json({
            success: true,
            message: `Contact ${action}ed successfully`,
            data: contact.summary
        });

    } catch (error) {
        console.error('[WhatsAppController] Error toggling contact block:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating contact status',
            error: error.message
        });
    }
};

module.exports = {
    // Integration management
    setupIntegration,
    switchIntegration,
    getIntegrations,
    testIntegration,
    getIntegrationHealth,

    // Messaging
    sendMessage,
    sendTemplateMessage,

    // Inbox management
    getInboxConversations,
    getConversationMessages,
    markConversationAsRead,
    archiveConversation,
    togglePinConversation,
    getInboxStats,
    searchInbox,

    // Contact management
    getContacts,
    updateContact,
    toggleContactBlock,

    // Baileys specific
    initializeBaileysSession,
    getBaileysQRCode,
    getBaileysSessionStatus,
    disconnectBaileysSession,
    deleteBaileysSession
};
