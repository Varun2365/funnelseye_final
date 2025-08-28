const { WhatsAppIntegration, WhatsAppConversation, WhatsAppMessage, WhatsAppContact } = require('../schema');
const unifiedWhatsAppService = require('../services/unifiedWhatsAppService');
const baileysWhatsAppService = require('../services/baileysWhatsAppService');
const metaWhatsAppService = require('../services/metaWhatsAppService');

/**
 * Setup WhatsApp integration for a user (coach or staff)
 */
const setupIntegration = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const integrationData = req.body;

        // Determine user type
        const userType = role === 'coach' ? 'coach' : 'staff';

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
        const result = await unifiedWhatsAppService.setupIntegration(userId, userType, integrationData);

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
        const { userId, role } = req.user;
        const { integrationType } = req.body;

        const userType = role === 'coach' ? 'coach' : 'staff';

        if (!integrationType || !['meta_official', 'baileys_personal', 'central_fallback'].includes(integrationType)) {
            return res.status(400).json({
                success: false,
                message: 'Valid integration type is required'
            });
        }

        const result = await unifiedWhatsAppService.switchIntegration(userId, userType, integrationType);

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
 * Get user's WhatsApp integrations
 */
const getIntegrations = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const userType = role === 'coach' ? 'coach' : 'staff';

        const integrations = await unifiedWhatsAppService.getUserIntegrations(userId, userType);

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
 * Get all coach integrations (visible to all users)
 */
const getAllCoachIntegrations = async (req, res) => {
    try {
        const integrations = await unifiedWhatsAppService.getAllCoachIntegrations();

        res.status(200).json({
            success: true,
            data: integrations
        });

    } catch (error) {
        console.error('[WhatsAppController] Error getting all coach integrations:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting coach integrations',
            error: error.message
        });
    }
};

/**
 * Test integration connection
 */
const testIntegration = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const userType = role === 'coach' ? 'coach' : 'staff';

        const result = await unifiedWhatsAppService.testIntegration(userId, userType);

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
 * Get integration health status
 */
const getIntegrationHealth = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const userType = role === 'coach' ? 'coach' : 'staff';

        const result = await unifiedWhatsAppService.getIntegrationHealth(userId, userType);

        res.status(200).json({
            success: true,
            data: result
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

/**
 * Send WhatsApp message
 */
const sendMessage = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const { recipientPhone, messageContent, messageType, useTemplate } = req.body;

        const userType = role === 'coach' ? 'coach' : 'staff';

        if (!recipientPhone || !messageContent) {
            return res.status(400).json({
                success: false,
                message: 'Recipient phone and message content are required'
            });
        }

        const options = {
            messageType: messageType || 'text',
            useTemplate: useTemplate || false
        };

        const result = await unifiedWhatsAppService.sendMessage(
            userId, 
            userType, 
            recipientPhone, 
            messageContent, 
            options
        );

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
        const { userId, role } = req.user;
        const { recipientPhone, templateName, language, components } = req.body;

        const userType = role === 'coach' ? 'coach' : 'staff';

        if (!recipientPhone || !templateName) {
            return res.status(400).json({
                success: false,
                message: 'Recipient phone and template name are required'
            });
        }

        const options = {
            useTemplate: true,
            templateName,
            language: language || 'en',
            components: components || []
        };

        const result = await unifiedWhatsAppService.sendMessage(
            userId, 
            userType, 
            recipientPhone, 
            templateName, 
            options
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
 * Initialize Baileys session
 */
const initializeBaileysSession = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const userType = role === 'coach' ? 'coach' : 'staff';

        const result = await unifiedWhatsAppService.initializeBaileysIntegration(userId, userType);

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
        const { userId, role } = req.user;
        const userType = role === 'coach' ? 'coach' : 'staff';

        const result = await unifiedWhatsAppService.getBaileysQRCode(userId, userType);

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
        const { userId, role } = req.user;
        const userType = role === 'coach' ? 'coach' : 'staff';

        const result = await unifiedWhatsAppService.getBaileysSessionStatus(userId, userType);

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
        const { userId, role } = req.user;
        const userType = role === 'coach' ? 'coach' : 'staff';

        const result = await unifiedWhatsAppService.disconnectBaileysSession(userId, userType);

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
 * Get inbox conversations
 */
const getInboxConversations = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const { limit = 20 } = req.query;
        const userType = role === 'coach' ? 'coach' : 'staff';

        const conversations = await unifiedWhatsAppService.getUserConversations(userId, userType, parseInt(limit));

        res.status(200).json({
            success: true,
            data: conversations
        });

    } catch (error) {
        console.error('[WhatsAppController] Error getting inbox conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting conversations',
            error: error.message
        });
    }
};

/**
 * Get messages for a conversation
 */
const getConversationMessages = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const { contactPhone } = req.params;
        const { limit = 50 } = req.query;
        const userType = role === 'coach' ? 'coach' : 'staff';

        const messages = await unifiedWhatsAppService.getConversationHistory(
            userId, 
            userType, 
            contactPhone, 
            parseInt(limit)
        );

        res.status(200).json({
            success: true,
            data: messages
        });

    } catch (error) {
        console.error('[WhatsAppController] Error getting conversation messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting messages',
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

        // Update all unread messages in the conversation
        await WhatsAppMessage.updateMany(
            { conversationId, readStatus: 'unread' },
            { readStatus: 'read', readAt: new Date() }
        );

        res.status(200).json({
            success: true,
            message: 'Conversation marked as read'
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
        const { action } = req.body; // 'archive' or 'unarchive'

        const conversation = await WhatsAppConversation.findOne({ conversationId });
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        conversation.status = action === 'archive' ? 'archived' : 'active';
        await conversation.save();

        res.status(200).json({
            success: true,
            message: `Conversation ${action}d successfully`,
            data: { status: conversation.status }
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

        const conversation = await WhatsAppConversation.findOne({ conversationId });
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        conversation.isPinned = !conversation.isPinned;
        await conversation.save();

        res.status(200).json({
            success: true,
            message: `Conversation ${conversation.isPinned ? 'pinned' : 'unpinned'} successfully`,
            data: { isPinned: conversation.isPinned }
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
 * Search conversations and messages
 */
const searchInbox = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const { searchTerm, searchType = 'conversations', limit = 20 } = req.query;
        const userType = role === 'coach' ? 'coach' : 'staff';

        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                message: 'Search term is required'
            });
        }

        let results;
        if (searchType === 'conversations') {
            results = await WhatsAppConversation.find({
                userId,
                userType,
                $or: [
                    { contactName: { $regex: searchTerm, $options: 'i' } },
                    { contactNumber: { $regex: searchTerm, $options: 'i' } }
                ]
            }).limit(parseInt(limit));
        } else {
            results = await WhatsAppMessage.find({
                userId,
                userType,
                $or: [
                    { content: { $regex: searchTerm, $options: 'i' } },
                    { from: { $regex: searchTerm, $options: 'i' } },
                    { to: { $regex: searchTerm, $options: 'i' } }
                ]
            }).limit(parseInt(limit));
        }

        res.status(200).json({
            success: true,
            data: results
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
 * Get inbox statistics
 */
const getInboxStats = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const userType = role === 'coach' ? 'coach' : 'staff';

        const [conversationCount, messageCount, unreadCount] = await Promise.all([
            WhatsAppConversation.countDocuments({ userId, userType }),
            WhatsAppMessage.countDocuments({ userId, userType }),
            WhatsAppMessage.countDocuments({ userId, userType, readStatus: 'unread' })
        ]);

        const stats = {
            conversations: conversationCount,
            messages: messageCount,
            unread: unreadCount
        };

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
 * Get all contacts for a user
 */
const getContacts = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const userType = role === 'coach' ? 'coach' : 'staff';

        const contacts = await WhatsAppContact.find({ userId, userType })
            .sort({ lastInteractionAt: -1 });

        res.status(200).json({
            success: true,
            data: contacts
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

        const contact = await WhatsAppContact.findOneAndUpdate(
            { _id: contactId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Contact updated successfully',
            data: contact
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
 * Toggle contact block status
 */
const toggleContactBlock = async (req, res) => {
    try {
        const { contactId } = req.params;

        const contact = await WhatsAppContact.findById(contactId);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        contact.isBlocked = !contact.isBlocked;
        await contact.save();

        res.status(200).json({
            success: true,
            message: `Contact ${contact.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            data: { isBlocked: contact.isBlocked }
        });

    } catch (error) {
        console.error('[WhatsAppController] Error toggling contact block:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling contact block',
            error: error.message
        });
    }
};

module.exports = {
    setupIntegration,
    switchIntegration,
    getIntegrations,
    getAllCoachIntegrations,
    testIntegration,
    getIntegrationHealth,
    sendMessage,
    sendTemplateMessage,
    initializeBaileysSession,
    getBaileysQRCode,
    getBaileysSessionStatus,
    disconnectBaileysSession,
    getInboxConversations,
    getConversationMessages,
    markConversationAsRead,
    archiveConversation,
    togglePinConversation,
    searchInbox,
    getInboxStats,
    getContacts,
    updateContact,
    toggleContactBlock
};
