const asyncHandler = require('../../middleware/async');
const { WhatsAppDevice, WhatsAppMessage, WhatsAppConversation } = require('../schemas');
const unifiedWhatsAppService = require('../services/unifiedWhatsAppService');
const logger = require('../../utils/logger');

// @desc    Send a WhatsApp message
// @route   POST /api/whatsapp/messages/send
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const {
        deviceId,
        to,
        content,
        options = {}
    } = req.body;

    // Validate required fields
    if (!deviceId || !to || !content) {
        return res.status(400).json({
            success: false,
            message: 'Device ID, recipient, and content are required'
        });
    }

    // Validate content
    if (!content.text && !content.media && !content.template) {
        return res.status(400).json({
            success: false,
            message: 'Message content must include text, media, or template'
        });
    }

    // Check if device exists and belongs to coach
    const device = await WhatsAppDevice.findOne({
        _id: deviceId,
        coachId
    });

    if (!device) {
        return res.status(404).json({
            success: false,
            message: 'Device not found'
        });
    }

    if (!device.isActive) {
        return res.status(400).json({
            success: false,
            message: 'Device is not active'
        });
    }

    // Send message
    const result = await unifiedWhatsAppService.sendMessage(deviceId, to, content, options);

    res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        data: result
    });
});

// @desc    Send message using default device
// @route   POST /api/whatsapp/messages/send-default
// @access  Private
exports.sendMessageDefault = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { to, content, options = {} } = req.body;

    // Get default device
    const device = await WhatsAppDevice.findOne({
        coachId,
        isDefault: true,
        isActive: true
    });

    if (!device) {
        return res.status(400).json({
            success: false,
            message: 'No default device found. Please set a default device first.'
        });
    }

    // Send message
    const result = await unifiedWhatsAppService.sendMessage(device._id, to, content, options);

    res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        data: result
    });
});

// @desc    Get conversations for a device
// @route   GET /api/whatsapp/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { deviceId, page = 1, limit = 20, status = 'active' } = req.query;

    // If no deviceId provided, get default device
    let targetDeviceId = deviceId;
    if (!targetDeviceId) {
        const defaultDevice = await WhatsAppDevice.findOne({
            coachId,
            isDefault: true
        });
        if (defaultDevice) {
            targetDeviceId = defaultDevice._id;
        }
    }

    if (!targetDeviceId) {
        return res.status(400).json({
            success: false,
            message: 'No device specified and no default device found'
        });
    }

    // Verify device belongs to coach
    const device = await WhatsAppDevice.findOne({
        _id: targetDeviceId,
        coachId
    });

    if (!device) {
        return res.status(404).json({
            success: false,
            message: 'Device not found'
        });
    }

    const result = await unifiedWhatsAppService.getConversations(targetDeviceId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status
    });

    res.status(200).json({
        success: true,
        data: result
    });
});

// @desc    Get messages for a conversation
// @route   GET /api/whatsapp/conversations/:conversationId/messages
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify conversation belongs to coach's device
    const conversation = await WhatsAppConversation.findOne({
        conversationId,
        coachId
    });

    if (!conversation) {
        return res.status(404).json({
            success: false,
            message: 'Conversation not found'
        });
    }

    const result = await unifiedWhatsAppService.getMessages(conversationId, {
        page: parseInt(page),
        limit: parseInt(limit)
    });

    res.status(200).json({
        success: true,
        data: result
    });
});

// @desc    Mark conversation as read
// @route   POST /api/whatsapp/conversations/:conversationId/read
// @access  Private
exports.markConversationAsRead = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { conversationId } = req.params;

    // Verify conversation belongs to coach
    const conversation = await WhatsAppConversation.findOne({
        conversationId,
        coachId
    });

    if (!conversation) {
        return res.status(404).json({
            success: false,
            message: 'Conversation not found'
        });
    }

    const result = await unifiedWhatsAppService.markConversationAsRead(conversationId);

    res.status(200).json({
        success: true,
        message: 'Conversation marked as read',
        data: result
    });
});

// @desc    Get message history
// @route   GET /api/whatsapp/messages
// @access  Private
exports.getMessageHistory = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { 
        deviceId, 
        page = 1, 
        limit = 50, 
        direction, 
        messageType,
        startDate,
        endDate 
    } = req.query;

    const query = { coachId };

    // Filter by device
    if (deviceId) {
        query.deviceId = deviceId;
    }

    // Filter by direction
    if (direction && ['inbound', 'outbound'].includes(direction)) {
        query.direction = direction;
    }

    // Filter by message type
    if (messageType) {
        query.messageType = messageType;
    }

    // Filter by date range
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            query.createdAt.$lte = new Date(endDate);
        }
    }

    const messages = await WhatsAppMessage.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('deviceId', 'deviceName deviceType');

    const total = await WhatsAppMessage.countDocuments(query);

    res.status(200).json({
        success: true,
        data: messages,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get message statistics
// @route   GET /api/whatsapp/messages/stats
// @access  Private
exports.getMessageStats = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { deviceId, period = '30d' } = req.query;

    const query = { coachId };
    if (deviceId) {
        query.deviceId = deviceId;
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    switch (period) {
        case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    query.createdAt = { $gte: startDate };

    const stats = await WhatsAppMessage.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                totalMessages: { $sum: 1 },
                sentMessages: { $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] } },
                receivedMessages: { $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] } },
                totalCreditsUsed: { $sum: '$creditsUsed' },
                deliveredMessages: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
                readMessages: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
                failedMessages: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
            }
        }
    ]);

    // Get message type breakdown
    const typeStats = await WhatsAppMessage.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$messageType',
                count: { $sum: 1 }
            }
        }
    ]);

    // Get daily message count for chart
    const dailyStats = await WhatsAppMessage.aggregate([
        { $match: query },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$createdAt'
                    }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            summary: stats[0] || {
                totalMessages: 0,
                sentMessages: 0,
                receivedMessages: 0,
                totalCreditsUsed: 0,
                deliveredMessages: 0,
                readMessages: 0,
                failedMessages: 0
            },
            typeBreakdown: typeStats,
            dailyStats: dailyStats,
            period
        }
    });
});

// @desc    Resend failed message
// @route   POST /api/whatsapp/messages/:messageId/resend
// @access  Private
exports.resendMessage = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { messageId } = req.params;

    const message = await WhatsAppMessage.findOne({
        _id: messageId,
        coachId
    });

    if (!message) {
        return res.status(404).json({
            success: false,
            message: 'Message not found'
        });
    }

    if (message.direction !== 'outbound') {
        return res.status(400).json({
            success: false,
            message: 'Only outbound messages can be resent'
        });
    }

    if (message.status !== 'failed') {
        return res.status(400).json({
            success: false,
            message: 'Only failed messages can be resent'
        });
    }

    // Resend the message
    const result = await unifiedWhatsAppService.sendMessage(
        message.deviceId,
        message.to,
        message.content,
        {}
    );

    // Update message status
    await WhatsAppMessage.findByIdAndUpdate(messageId, {
        status: result.success ? 'sent' : 'failed',
        statusTimestamp: new Date(),
        errorDetails: result.success ? null : {
            code: 'RESEND_FAILED',
            message: result.error || 'Resend failed',
            timestamp: new Date()
        }
    });

    res.status(200).json({
        success: true,
        message: 'Message resent successfully',
        data: result
    });
});

// @desc    Delete message
// @route   DELETE /api/whatsapp/messages/:messageId
// @access  Private
exports.deleteMessage = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { messageId } = req.params;

    const message = await WhatsAppMessage.findOne({
        _id: messageId,
        coachId
    });

    if (!message) {
        return res.status(404).json({
            success: false,
            message: 'Message not found'
        });
    }

    await WhatsAppMessage.findByIdAndDelete(messageId);

    res.status(200).json({
        success: true,
        message: 'Message deleted successfully'
    });
});
