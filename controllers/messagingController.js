const asyncHandler = require('../middleware/async');
const WhatsAppMessage = require('../schema/WhatsAppMessage');
const Lead = require('../schema/Lead');
const MessageTemplate = require('../schema/MessageTemplate');
const WhatsAppCredit = require('../schema/WhatsAppCredit');
const centralWhatsAppService = require('../services/centralWhatsAppService');
const templateService = require('../services/templateService');
const { SECTIONS } = require('../utils/sectionPermissions');

// @desc    Send single message
// @route   POST /api/messaging/send
// @access  Private (Coach)
exports.sendMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [MESSAGING] sendMessage - Starting...');
        
        const coachId = req.user.id;
        const { 
            to, 
            message, 
            templateId, 
            templateParameters = {},
            type = 'text',
            mediaUrl,
            caption,
            leadId
        } = req.body;
        
        // Validate required fields
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Recipient phone number is required'
            });
        }
        
        if (type === 'text' && !message) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required for text messages'
            });
        }
        
        if (type === 'template' && !templateId) {
            return res.status(400).json({
                success: false,
                message: 'Template ID is required for template messages'
            });
        }
        
        // Check credits
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        if (!credits.canSendMessage()) {
            return res.status(402).json({
                success: false,
                message: 'Insufficient credits to send messages',
                data: {
                    balance: credits.balance,
                    required: 1
                }
            });
        }
        
        let messageContent = message;
        let templateName = null;
        
        // Handle template messages
        if (type === 'template' && templateId) {
            const template = await MessageTemplate.findById(templateId);
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found'
                });
            }
            
            // Get lead data for template parameters
            let leadData = {};
            if (leadId) {
                const lead = await Lead.findById(leadId);
                if (lead) {
                    leadData = templateService.extractLeadData(lead);
                }
            }
            
            // Merge template parameters with lead data
            const allParameters = { ...leadData, ...templateParameters };
            
            // Render template
            const renderedTemplate = template.renderTemplate(allParameters);
            messageContent = renderedTemplate.body;
            templateName = template.name;
        }
        
        // Send message via Central WhatsApp
        const messageData = {
            to: to,
            message: messageContent,
            type: type,
            templateName: templateName,
            mediaUrl: mediaUrl,
            caption: caption
        };
        
        const result = await centralWhatsAppService.sendMessage(messageData);
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send message',
                error: result.error
            });
        }
        
        // Create message record
        const conversationId = WhatsAppMessage.createConversationId(coachId, to);
        const messageRecord = new WhatsAppMessage({
            messageId: result.messageId,
            wamid: result.wamid,
            senderId: coachId,
            senderType: 'coach',
            recipientPhone: to,
            messageType: type,
            content: {
                text: messageContent,
                templateName: templateName,
                templateParameters: templateParameters,
                mediaUrl: mediaUrl,
                mediaType: mediaUrl ? 'image' : undefined,
                caption: caption
            },
            conversationId: conversationId,
            leadId: leadId,
            creditsUsed: 1
        });
        
        await messageRecord.save();
        
        // Deduct credits
        await credits.useCredits(1, 'message_sent', `Message sent to ${to}`);
        
        console.log('✅ [MESSAGING] sendMessage - Success');
        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            data: {
                messageId: result.messageId,
                wamid: result.wamid,
                status: 'sent',
                creditsUsed: 1,
                remainingCredits: credits.balance - 1
            }
        });
        
    } catch (error) {
        console.error('❌ [MESSAGING] sendMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// @desc    Send bulk messages
// @route   POST /api/messaging/send-bulk
// @access  Private (Coach)
exports.sendBulkMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [MESSAGING] sendBulkMessages - Starting...');
        
        const coachId = req.user.id;
        const { 
            contacts, 
            message, 
            templateId, 
            templateParameters = {},
            type = 'text',
            mediaUrl,
            caption,
            delay = 1000 // Delay between messages in ms
        } = req.body;
        
        // Validate required fields
        if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Contacts array is required and must not be empty'
            });
        }
        
        if (type === 'text' && !message) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required for text messages'
            });
        }
        
        if (type === 'template' && !templateId) {
            return res.status(400).json({
                success: false,
                message: 'Template ID is required for template messages'
            });
        }
        
        // Check credits
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        const requiredCredits = contacts.length;
        
        if (!credits.canSendMessage(requiredCredits)) {
            return res.status(402).json({
                success: false,
                message: 'Insufficient credits to send bulk messages',
                data: {
                    balance: credits.balance,
                    required: requiredCredits
                }
            });
        }
        
        // Get template if needed
        let template = null;
        if (type === 'template' && templateId) {
            template = await MessageTemplate.findById(templateId);
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found'
                });
            }
        }
        
        const results = [];
        const errors = [];
        
        // Send messages with delay
        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            
            try {
                let messageContent = message;
                let templateName = null;
                
                // Handle template messages
                if (type === 'template' && template) {
                    // Get lead data for template parameters
                    let leadData = {};
                    if (contact.leadId) {
                        const lead = await Lead.findById(contact.leadId);
                        if (lead) {
                            leadData = templateService.extractLeadData(lead);
                        }
                    }
                    
                    // Merge template parameters with lead data
                    const allParameters = { ...leadData, ...templateParameters };
                    
                    // Render template
                    const renderedTemplate = template.renderTemplate(allParameters);
                    messageContent = renderedTemplate.body;
                    templateName = template.name;
                }
                
                // Send message via Central WhatsApp
                const messageData = {
                    to: contact.phone || contact.to,
                    message: messageContent,
                    type: type,
                    templateName: templateName,
                    mediaUrl: mediaUrl,
                    caption: caption
                };
                
                const result = await centralWhatsAppService.sendMessage(messageData);
                
                if (result.success) {
                    // Create message record
                    const conversationId = WhatsAppMessage.createConversationId(coachId, contact.phone || contact.to);
                    const messageRecord = new WhatsAppMessage({
                        messageId: result.messageId,
                        wamid: result.wamid,
                        senderId: coachId,
                        senderType: 'coach',
                        recipientPhone: contact.phone || contact.to,
                        recipientName: contact.name,
                        messageType: type,
                        content: {
                            text: messageContent,
                            templateName: templateName,
                            templateParameters: templateParameters,
                            mediaUrl: mediaUrl,
                            mediaType: mediaUrl ? 'image' : undefined,
                            caption: caption
                        },
                        conversationId: conversationId,
                        leadId: contact.leadId,
                        creditsUsed: 1
                    });
                    
                    await messageRecord.save();
                    
                    results.push({
                        contact: contact.phone || contact.to,
                        success: true,
                        messageId: result.messageId
                    });
                } else {
                    errors.push({
                        contact: contact.phone || contact.to,
                        success: false,
                        error: result.error
                    });
                }
                
                // Add delay between messages
                if (i < contacts.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                
            } catch (error) {
                console.error(`❌ [MESSAGING] Error sending to ${contact.phone || contact.to}:`, error);
                errors.push({
                    contact: contact.phone || contact.to,
                    success: false,
                    error: error.message
                });
            }
        }
        
        // Deduct credits for successful messages
        const successfulMessages = results.length;
        if (successfulMessages > 0) {
            await credits.useCredits(successfulMessages, 'bulk_message_sent', `Bulk message sent to ${successfulMessages} contacts`);
        }
        
        console.log('✅ [MESSAGING] sendBulkMessages - Success');
        res.status(200).json({
            success: true,
            message: `Bulk messages sent. ${successfulMessages} successful, ${errors.length} failed.`,
            data: {
                total: contacts.length,
                successful: successfulMessages,
                failed: errors.length,
                results: results,
                errors: errors,
                creditsUsed: successfulMessages,
                remainingCredits: credits.balance - successfulMessages
            }
        });
        
    } catch (error) {
        console.error('❌ [MESSAGING] sendBulkMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk messages',
            error: error.message
        });
    }
});

// @desc    Send message as admin
// @route   POST /api/messaging/admin/send
// @access  Private (Admin)
exports.sendAdminMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [MESSAGING] sendAdminMessage - Starting...');
        
        const adminId = req.admin.id;
        const { 
            to, 
            message, 
            templateId, 
            templateParameters = {},
            type = 'text',
            mediaUrl,
            caption,
            leadId,
            coachId // Optional: specify which coach this message is for
        } = req.body;
        
        // Validate required fields
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Recipient phone number is required'
            });
        }
        
        if (type === 'text' && !message) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required for text messages'
            });
        }
        
        if (type === 'template' && !templateId) {
            return res.status(400).json({
                success: false,
                message: 'Template ID is required for template messages'
            });
        }
        
        let messageContent = message;
        let templateName = null;
        
        // Handle template messages
        if (type === 'template' && templateId) {
            const template = await MessageTemplate.findById(templateId);
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found'
                });
            }
            
            // Get lead data for template parameters
            let leadData = {};
            if (leadId) {
                const lead = await Lead.findById(leadId);
                if (lead) {
                    leadData = templateService.extractLeadData(lead);
                }
            }
            
            // Merge template parameters with lead data
            const allParameters = { ...leadData, ...templateParameters };
            
            // Render template
            const renderedTemplate = template.renderTemplate(allParameters);
            messageContent = renderedTemplate.body;
            templateName = template.name;
        }
        
        // Send message via Central WhatsApp
        const messageData = {
            to: to,
            message: messageContent,
            type: type,
            templateName: templateName,
            mediaUrl: mediaUrl,
            caption: caption
        };
        
        const result = await centralWhatsAppService.sendMessage(messageData);
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send message',
                error: result.error
            });
        }
        
        // Create message record
        const conversationId = WhatsAppMessage.createConversationId(adminId, to);
        const messageRecord = new WhatsAppMessage({
            messageId: result.messageId,
            wamid: result.wamid,
            senderId: adminId,
            senderType: 'admin',
            recipientPhone: to,
            messageType: type,
            content: {
                text: messageContent,
                templateName: templateName,
                templateParameters: templateParameters,
                mediaUrl: mediaUrl,
                mediaType: mediaUrl ? 'image' : undefined,
                caption: caption
            },
            conversationId: conversationId,
            leadId: leadId,
            creditsUsed: 0 // Admin messages don't use credits
        });
        
        await messageRecord.save();
        
        console.log('✅ [MESSAGING] sendAdminMessage - Success');
        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            data: {
                messageId: result.messageId,
                wamid: result.wamid,
                status: 'sent',
                senderType: 'admin'
            }
        });
        
    } catch (error) {
        console.error('❌ [MESSAGING] sendAdminMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// @desc    Send bulk messages as admin
// @route   POST /api/messaging/admin/send-bulk
// @access  Private (Admin)
exports.sendAdminBulkMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [MESSAGING] sendAdminBulkMessages - Starting...');
        
        const adminId = req.admin.id;
        const { 
            contacts, 
            message, 
            templateId, 
            templateParameters = {},
            type = 'text',
            mediaUrl,
            caption,
            delay = 1000
        } = req.body;
        
        // Validate required fields
        if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Contacts array is required and must not be empty'
            });
        }
        
        if (type === 'text' && !message) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required for text messages'
            });
        }
        
        if (type === 'template' && !templateId) {
            return res.status(400).json({
                success: false,
                message: 'Template ID is required for template messages'
            });
        }
        
        // Get template if needed
        let template = null;
        if (type === 'template' && templateId) {
            template = await MessageTemplate.findById(templateId);
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found'
                });
            }
        }
        
        const results = [];
        const errors = [];
        
        // Send messages with delay
        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            
            try {
                let messageContent = message;
                let templateName = null;
                
                // Handle template messages
                if (type === 'template' && template) {
                    // Get lead data for template parameters
                    let leadData = {};
                    if (contact.leadId) {
                        const lead = await Lead.findById(contact.leadId);
                        if (lead) {
                            leadData = templateService.extractLeadData(lead);
                        }
                    }
                    
                    // Merge template parameters with lead data
                    const allParameters = { ...leadData, ...templateParameters };
                    
                    // Render template
                    const renderedTemplate = template.renderTemplate(allParameters);
                    messageContent = renderedTemplate.body;
                    templateName = template.name;
                }
                
                // Send message via Central WhatsApp
                const messageData = {
                    to: contact.phone || contact.to,
                    message: messageContent,
                    type: type,
                    templateName: templateName,
                    mediaUrl: mediaUrl,
                    caption: caption
                };
                
                const result = await centralWhatsAppService.sendMessage(messageData);
                
                if (result.success) {
                    // Create message record
                    const conversationId = WhatsAppMessage.createConversationId(adminId, contact.phone || contact.to);
                    const messageRecord = new WhatsAppMessage({
                        messageId: result.messageId,
                        wamid: result.wamid,
                        senderId: adminId,
                        senderType: 'admin',
                        recipientPhone: contact.phone || contact.to,
                        recipientName: contact.name,
                        messageType: type,
                        content: {
                            text: messageContent,
                            templateName: templateName,
                            templateParameters: templateParameters,
                            mediaUrl: mediaUrl,
                            mediaType: mediaUrl ? 'image' : undefined,
                            caption: caption
                        },
                        conversationId: conversationId,
                        leadId: contact.leadId,
                        creditsUsed: 0 // Admin messages don't use credits
                    });
                    
                    await messageRecord.save();
                    
                    results.push({
                        contact: contact.phone || contact.to,
                        success: true,
                        messageId: result.messageId
                    });
                } else {
                    errors.push({
                        contact: contact.phone || contact.to,
                        success: false,
                        error: result.error
                    });
                }
                
                // Add delay between messages
                if (i < contacts.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                
            } catch (error) {
                console.error(`❌ [MESSAGING] Error sending to ${contact.phone || contact.to}:`, error);
                errors.push({
                    contact: contact.phone || contact.to,
                    success: false,
                    error: error.message
                });
            }
        }
        
        console.log('✅ [MESSAGING] sendAdminBulkMessages - Success');
        res.status(200).json({
            success: true,
            message: `Bulk messages sent. ${results.length} successful, ${errors.length} failed.`,
            data: {
                total: contacts.length,
                successful: results.length,
                failed: errors.length,
                results: results,
                errors: errors,
                senderType: 'admin'
            }
        });
        
    } catch (error) {
        console.error('❌ [MESSAGING] sendAdminBulkMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk messages',
            error: error.message
        });
    }
});

// @desc    Get messaging statistics for coach
// @route   GET /api/messaging/stats
// @access  Private (Coach)
exports.getMessagingStats = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [MESSAGING] getMessagingStats - Starting...');
        
        const coachId = req.user.id;
        
        // Get message statistics
        const totalMessages = await WhatsAppMessage.countDocuments({ senderId: coachId });
        const sentMessages = await WhatsAppMessage.countDocuments({ 
            senderId: coachId, 
            status: 'sent' 
        });
        const deliveredMessages = await WhatsAppMessage.countDocuments({ 
            senderId: coachId, 
            status: 'delivered' 
        });
        const readMessages = await WhatsAppMessage.countDocuments({ 
            senderId: coachId, 
            status: 'read' 
        });
        const failedMessages = await WhatsAppMessage.countDocuments({ 
            senderId: coachId, 
            status: 'failed' 
        });
        
        // Get recent activity
        const recentMessages = await WhatsAppMessage.find({ senderId: coachId })
            .sort({ sentAt: -1 })
            .limit(10)
            .select('recipientPhone content.text sentAt status');
        
        // Get credit information
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        
        console.log('✅ [MESSAGING] getMessagingStats - Success');
        res.status(200).json({
            success: true,
            data: {
                totalMessages,
                sentMessages,
                deliveredMessages,
                readMessages,
                failedMessages,
                successRate: totalMessages > 0 ? ((deliveredMessages + readMessages) / totalMessages * 100).toFixed(2) : 0,
                recentMessages,
                credits: {
                    balance: credits.balance,
                    status: credits.status,
                    totalUsed: credits.usage.creditsUsed
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [MESSAGING] getMessagingStats - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get messaging statistics',
            error: error.message
        });
    }
});

// @desc    Get system-wide messaging statistics
// @route   GET /api/messaging/admin/stats
// @access  Private (Admin)
exports.getAdminMessagingStats = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [MESSAGING] getAdminMessagingStats - Starting...');
        
        // Get system-wide message statistics
        const totalMessages = await WhatsAppMessage.countDocuments();
        const sentMessages = await WhatsAppMessage.countDocuments({ status: 'sent' });
        const deliveredMessages = await WhatsAppMessage.countDocuments({ status: 'delivered' });
        const readMessages = await WhatsAppMessage.countDocuments({ status: 'read' });
        const failedMessages = await WhatsAppMessage.countDocuments({ status: 'failed' });
        
        // Get messages by sender type
        const coachMessages = await WhatsAppMessage.countDocuments({ senderType: 'coach' });
        const adminMessages = await WhatsAppMessage.countDocuments({ senderType: 'admin' });
        
        // Get recent activity
        const recentMessages = await WhatsAppMessage.find()
            .sort({ sentAt: -1 })
            .limit(20)
            .populate('senderId', 'name email')
            .select('senderId senderType recipientPhone content.text sentAt status');
        
        // Get top coaches by message count
        const topCoaches = await WhatsAppMessage.aggregate([
            { $match: { senderType: 'coach' } },
            { $group: { _id: '$senderId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'coach' } },
            { $unwind: '$coach' },
            { $project: { coachName: '$coach.name', coachEmail: '$coach.email', messageCount: '$count' } }
        ]);
        
        console.log('✅ [MESSAGING] getAdminMessagingStats - Success');
        res.status(200).json({
            success: true,
            data: {
                totalMessages,
                sentMessages,
                deliveredMessages,
                readMessages,
                failedMessages,
                successRate: totalMessages > 0 ? ((deliveredMessages + readMessages) / totalMessages * 100).toFixed(2) : 0,
                coachMessages,
                adminMessages,
                recentMessages,
                topCoaches
            }
        });
        
    } catch (error) {
        console.error('❌ [MESSAGING] getAdminMessagingStats - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get admin messaging statistics',
            error: error.message
        });
    }
});

// @desc    Get messages for specific coach
// @route   GET /api/messaging/admin/coaches/:coachId/messages
// @access  Private (Admin)
exports.getCoachMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [MESSAGING] getCoachMessages - Starting...');
        
        const { coachId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        // Get messages for specific coach
        const messages = await WhatsAppMessage.find({ senderId: coachId })
            .sort({ sentAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('leadId', 'name email phone')
            .select('recipientPhone content.text sentAt status deliveryStatus');
        
        const total = await WhatsAppMessage.countDocuments({ senderId: coachId });
        
        console.log('✅ [MESSAGING] getCoachMessages - Success');
        res.status(200).json({
            success: true,
            data: {
                messages,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [MESSAGING] getCoachMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get coach messages',
            error: error.message
        });
    }
});

module.exports = exports;
