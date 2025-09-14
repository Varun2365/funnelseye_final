const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');
const { WhatsAppDevice, WhatsAppMessage, WhatsAppConversation, WhatsAppTemplate } = require('../whatsapp/schemas');
const unifiedService = require('../whatsapp/services/unifiedWhatsAppService');
const baileysMicroserviceClient = require('../services/baileysMicroserviceClient');
const metaService = require('../whatsapp/services/metaWhatsAppService');
const centralWhatsAppService = require('../services/centralWhatsAppService');
const { Coach, Staff } = require('../schema');
const AdminSystemSettings = require('../schema/AdminSystemSettings');
const WhatsAppCredit = require('../schema/WhatsAppCredit');
const logger = require('../utils/logger');

// Utility function to validate device ID
function validateDeviceId(deviceId) {
    if (!deviceId || deviceId === 'null' || deviceId === 'undefined') {
        return { isValid: false, message: 'Invalid device ID' };
    }
    
    if (!/^[0-9a-fA-F]{24}$/.test(deviceId)) {
        return { isValid: false, message: 'Invalid device ID format' };
    }
    
    return { isValid: true };
}

// ===== DEBUG ENDPOINTS =====

// @desc    Debug endpoint to test QR setup page
// @route   GET /api/messagingv1/debug/qr-setup/:deviceId
// @access  Public (for debugging)
exports.debugQRSetup = asyncHandler(async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        console.log('🔍 [DEBUG] QR Setup Debug - Device ID:', deviceId);
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message,
                debug: {
                    deviceId,
                    validation: deviceValidation
                }
            });
        }
        
        // Check if device exists
        const device = await WhatsAppDevice.findOne({ _id: deviceId });
        
        return res.status(200).json({
            success: true,
            message: 'Debug info',
            data: {
                deviceId,
                deviceExists: !!device,
                device: device ? {
                    id: device._id,
                    name: device.deviceName,
                    type: device.deviceType,
                    phone: device.phoneNumber,
                    isActive: device.isActive,
                    sessionId: device.sessionId
                } : null,
                qrSetupUrl: `/whatsapp-qr-setup.html?device=${deviceId}`,
                qrApiUrl: `/api/messagingv1/baileys/qr/${deviceId}`
            }
        });
        
    } catch (error) {
        console.error('❌ [DEBUG] debugQRSetup - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug error',
            error: error.message
        });
    }
});

// ===== COACH WHATSAPP SETTINGS MANAGEMENT =====

// @desc    Get coach WhatsApp settings
// @route   GET /api/messagingv1/settings
// @access  Private (Coach)
const getCoachWhatsAppSettings = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getCoachWhatsAppSettings - Starting...');
        
        const coachId = req.user.id;
        
        // Get coach's WhatsApp devices
        const devices = await WhatsAppDevice.find({ coachId }).sort({ isDefault: -1, createdAt: -1 });
        
        // Get admin system settings for central WhatsApp
        const adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
        const centralWhatsAppEnabled = adminSettings?.whatsApp?.isEnabled || false;
        
        // Get coach's messaging credits
        const coach = await Coach.findOne({ selfCoachId: req.user.selfCoachId });
        const messagingCredits = coach?.messagingCredits || 0;
        
        // Get credit pricing from admin settings
        const creditPrice = adminSettings?.whatsApp?.creditPrice || 0.01;
        
        console.log('✅ [UNIFIED_MESSAGING] getCoachWhatsAppSettings - Success');
        res.status(200).json({
            success: true,
            data: {
                centralWhatsApp: {
                    enabled: centralWhatsAppEnabled,
                    available: centralWhatsAppEnabled
                },
                devices: devices.map(device => ({
                    id: device._id,
                    name: device.deviceName,
                    type: device.deviceType,
                    phoneNumber: device.phoneNumber,
                    isConnected: device.isConnected,
                    isDefault: device.isDefault,
                    isActive: device.isActive,
                    creditsPerMessage: device.creditsPerMessage,
                    messagesSentThisMonth: device.messagesSentThisMonth,
                    monthlyMessageLimit: device.monthlyMessageLimit,
                    lastConnected: device.lastConnected,
                    settings: device.settings
                })),
                credits: {
                    balance: messagingCredits,
                    pricePerCredit: creditPrice,
                    autoRecharge: adminSettings?.whatsApp?.autoRecharge || false,
                    rechargeThreshold: adminSettings?.whatsApp?.rechargeThreshold || 10
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getCoachWhatsAppSettings - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get WhatsApp settings',
            error: error.message
        });
    }
});

// @desc    Set coach WhatsApp settings
// @route   POST /api/messagingv1/settings
// @access  Private (Coach)
exports.setCoachWhatsAppSettings = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] setCoachWhatsAppSettings - Starting...');
        
        const coachId = req.user.id;
        const { 
            useCentralWhatsApp, 
            baileysSettings, 
            emailSettings,
            autoReplySettings 
        } = req.body;
        
        // Update coach's WhatsApp preference
        await Coach.findOneAndUpdate(
            { selfCoachId: req.user.selfCoachId },
            { 
                $set: {
                    'whatsAppSettings.useCentralWhatsApp': useCentralWhatsApp,
                    'whatsAppSettings.emailSettings': emailSettings,
                    'whatsAppSettings.autoReplySettings': autoReplySettings
                }
            }
        );
        
        // If setting up Baileys WhatsApp
        if (!useCentralWhatsApp && baileysSettings) {
            const { deviceName, phoneNumber } = baileysSettings;
            
            // Create new device or update existing
            const device = await WhatsAppDevice.findOneAndUpdate(
                { coachId, deviceType: 'baileys', phoneNumber },
                {
                    coachId,
                    deviceName: deviceName || 'My WhatsApp Device',
                    deviceType: 'baileys',
                    phoneNumber,
                    isActive: true,
                    isDefault: true,
                    creditsPerMessage: 1
                },
                { upsert: true, new: true }
            );
            
            // Initialize Baileys session
            const sessionId = `session_${device._id}`;
            await device.updateOne({ sessionId });
            
            const initResult = await newBaileysService.initializeDevice(device._id.toString(), coachId);
            
            console.log('✅ [UNIFIED_MESSAGING] setCoachWhatsAppSettings - Success');
            console.log('Device created/updated:', {
                deviceId: device._id,
                deviceName: device.deviceName,
                phoneNumber: device.phoneNumber,
                sessionId: sessionId
            });
            
            res.status(200).json({
                success: true,
                message: 'WhatsApp settings updated successfully',
                data: {
                    deviceId: device._id,
                    qrSetupUrl: `/whatapp-qr?device=${device._id}`,
                    sessionStatus: initResult.success ? 'initialized' : 'failed'
                }
            });
        } else {
            console.log('✅ [UNIFIED_MESSAGING] setCoachWhatsAppSettings - Success');
            res.status(200).json({
                success: true,
                message: 'WhatsApp settings updated successfully',
                data: {
                    useCentralWhatsApp: true
                }
            });
        }
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] setCoachWhatsAppSettings - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update WhatsApp settings',
            error: error.message
        });
    }
});

// ===== UNIFIED MESSAGING ENDPOINTS =====

// @desc    Send message via unified endpoint
// @route   POST /api/messagingv1/send
// @access  Private (Coach)
exports.sendMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] sendMessage - Starting...');
        
        const coachId = req.user.id;
        
        // Check credits before sending message
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        if (!credits.canSendMessage()) {
            return res.status(402).json({
                success: false,
                message: 'Insufficient credits to send messages',
                data: {
                    balance: credits.balance,
                    status: credits.status,
                    required: 1,
                    suggestion: 'Please purchase more credits to continue sending messages'
                }
            });
        }
        const { 
            to, 
            message, 
            templateId, 
            deviceId, 
            type = 'text',
            mediaUrl,
            caption
        } = req.body;
        
        // Get coach's WhatsApp preference
        const coach = await Coach.findOne({ selfCoachId: req.user.selfCoachId });
        const useCentralWhatsApp = coach?.whatsAppSettings?.useCentralWhatsApp || false;
        
        let result;
        let deviceUsed;
        
        if (useCentralWhatsApp) {
            // Use central Meta WhatsApp
            try {
                // Initialize central WhatsApp service
                await centralWhatsAppService.initialize();
                
                // Send via Central WhatsApp service
                if (templateId) {
                    // Send template message
                    const template = await WhatsAppTemplate.findById(templateId);
                    if (!template) {
                        return res.status(400).json({
                            success: false,
                            message: 'Template not found'
                        });
                    }
                    
                    result = await centralWhatsAppService.sendTemplateMessage(
                        to,
                        template.name,
                        template.language || 'en',
                        req.body.templateParams || [],
                        coachId
                    );
                } else if (type === 'image' || type === 'video' || type === 'document') {
                    // Send media message
                    result = await centralWhatsAppService.sendMediaMessage(
                        to,
                        type,
                        mediaUrl,
                        caption,
                        coachId
                    );
                } else {
                    // Send text message
                    result = await centralWhatsAppService.sendTextMessage(to, message, coachId);
                }
                
                deviceUsed = 'central';
                
            } catch (centralError) {
                console.error('❌ [CENTRAL_WHATSAPP] Error:', centralError.message);
                return res.status(500).json({
                    success: false,
                    message: 'Central WhatsApp service error',
                    error: centralError.message
                });
            }
        } else {
            // Use coach's Baileys WhatsApp
            let device;
            if (deviceId) {
                device = await WhatsAppDevice.findById(deviceId);
            } else {
                device = await WhatsAppDevice.findOne({ coachId, isDefault: true, isActive: true });
            }
            
            if (!device) {
                return res.status(400).json({
                    success: false,
                    message: 'No active WhatsApp device found'
                });
            }
            
            // Credits are already checked at the beginning of this method using WhatsAppCredit system
            
            // Send via Baileys microservice
            const messageToSend = templateId ? await getTemplateMessage(templateId, req.body.templateParams) : message;
            result = await baileysMicroserviceClient.sendMessage(device._id.toString(), to, messageToSend, type);
            
            deviceUsed = device._id;
            
            // Deduct credits
            await Coach.findOneAndUpdate(
                { selfCoachId: req.user.selfCoachId },
                { $inc: { messagingCredits: -device.creditsPerMessage } }
            );
            
            // Update device message count
            await WhatsAppDevice.findByIdAndUpdate(device._id, {
                $inc: { messagesSentThisMonth: 1 }
            });
        }
        
        // Save message to database
        const messageRecord = new WhatsAppMessage({
            coachId,
            deviceId: deviceUsed,
            to,
            message: result.message || message,
            type,
            status: result.success ? 'sent' : 'failed',
            templateId,
            creditsUsed: deviceUsed !== 'central' ? (await WhatsAppDevice.findById(deviceUsed))?.creditsPerMessage || 1 : 0
        });
        
        await messageRecord.save();
        
        console.log('✅ [UNIFIED_MESSAGING] sendMessage - Success');
        res.status(200).json({
            success: result.success,
            message: result.success ? 'Message sent successfully' : 'Failed to send message',
            data: {
                messageId: messageRecord._id,
                status: result.success ? 'sent' : 'failed',
                deviceUsed,
                creditsUsed: messageRecord.creditsUsed
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] sendMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// @desc    Get inbox messages
// @route   GET /api/messagingv1/inbox
// @access  Private (Coach)
exports.getInboxMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getInboxMessages - Starting...');
        
        const coachId = req.user.id;
        const { page = 1, limit = 20, contact } = req.query;
        
        // Build query
        const query = { coachId, direction: 'inbound' };
        if (contact) {
            query.from = new RegExp(contact, 'i');
        }
        
        // Get messages with pagination
        const messages = await WhatsAppMessage.find(query)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('deviceId', 'deviceName deviceType phoneNumber');
        
        const total = await WhatsAppMessage.countDocuments(query);
        
        // Also get real-time messages from microservice for Baileys devices
        try {
            const baileysDevices = await WhatsAppDevice.find({ 
                coachId, 
                deviceType: 'baileys',
                isActive: true 
            });
            
            for (const device of baileysDevices) {
                try {
                    const microserviceInbox = await baileysMicroserviceClient.getInbox(
                        device._id.toString(), 
                        limit, 
                        (page - 1) * limit
                    );
                    
                    if (microserviceInbox.success && microserviceInbox.data.messages) {
                        // Merge microservice messages with database messages
                        messages.push(...microserviceInbox.data.messages);
                    }
                } catch (error) {
                    console.log(`Could not fetch microservice inbox for device ${device._id}:`, error.message);
                }
            }
            
            // Sort merged messages by timestamp
            messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            console.log('Could not fetch microservice inbox:', error.message);
        }
        
        // Get conversations summary
        const conversations = await WhatsAppMessage.aggregate([
            { $match: { coachId, direction: 'inbound' } },
            { $group: {
                _id: '$from',
                lastMessage: { $max: '$timestamp' },
                messageCount: { $sum: 1 },
                unreadCount: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
            }},
            { $sort: { lastMessage: -1 } },
            { $limit: 10 }
        ]);
        
        console.log('✅ [UNIFIED_MESSAGING] getInboxMessages - Success');
        res.status(200).json({
            success: true,
            data: {
                messages,
                conversations,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getInboxMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get inbox messages',
            error: error.message
        });
    }
});

// ===== MESSAGE TEMPLATE MANAGEMENT =====

// @desc    Get message templates
// @route   GET /api/messagingv1/templates
// @access  Private (Coach)
exports.getMessageTemplates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getMessageTemplates - Starting...');
        
        const coachId = req.user.id;
        const { category, status } = req.query;
        
        // Get coach's custom templates
        const coachTemplates = await WhatsAppTemplate.find({
            coachId,
            ...(category && { category }),
            ...(status && { status })
        }).sort({ createdAt: -1 });
        
        // Get admin global templates
        const adminSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
        const globalTemplates = adminSettings?.whatsApp?.messageTemplates || [];
        
        console.log('✅ [UNIFIED_MESSAGING] getMessageTemplates - Success');
        res.status(200).json({
            success: true,
            data: {
                custom: coachTemplates,
                global: globalTemplates
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getMessageTemplates - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get message templates',
            error: error.message
        });
    }
});

// @desc    Create message template
// @route   POST /api/messagingv1/templates
// @access  Private (Coach)
exports.createMessageTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] createMessageTemplate - Starting...');
        
        const coachId = req.user.id;
        const { name, content, category, language = 'en_US', variables } = req.body;
        
        const template = new WhatsAppTemplate({
            coachId,
            name,
            content,
            category,
            language,
            variables: variables || [],
            status: 'active'
        });
        
        await template.save();
        
        console.log('✅ [UNIFIED_MESSAGING] createMessageTemplate - Success');
        res.status(201).json({
            success: true,
            message: 'Template created successfully',
            data: template
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] createMessageTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create template',
            error: error.message
        });
    }
});

// ===== STAFF WHATSAPP INTEGRATION =====

// @desc    Get staff WhatsApp devices under coach
// @route   GET /api/messagingv1/staff/devices
// @access  Private (Coach)
exports.getStaffDevices = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getStaffDevices - Starting...');
        
        const coachId = req.user.id;
        
        // Get all staff under this coach
        const staffMembers = await Staff.find({ coachId }).select('_id name email phone');
        
        // Get WhatsApp devices for all staff
        const staffIds = staffMembers.map(staff => staff._id);
        const staffDevices = await WhatsAppDevice.find({ 
            coachId: { $in: staffIds },
            deviceType: 'baileys'
        }).populate('coachId', 'name email phone');
        
        console.log('✅ [UNIFIED_MESSAGING] getStaffDevices - Success');
        res.status(200).json({
            success: true,
            data: {
                staff: staffMembers,
                devices: staffDevices.map(device => ({
                    id: device._id,
                    staffName: device.coachId?.name,
                    staffEmail: device.coachId?.email,
                    deviceName: device.deviceName,
                    phoneNumber: device.phoneNumber,
                    isConnected: device.isConnected,
                    isActive: device.isActive,
                    lastConnected: device.lastConnected
                }))
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getStaffDevices - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get staff devices',
            error: error.message
        });
    }
});

// ===== MESSAGING STATISTICS =====

// @desc    Get messaging statistics
// @route   GET /api/messagingv1/stats
// @access  Private (Coach)
exports.getMessagingStats = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getMessagingStats - Starting...');
        
        const coachId = req.user.id;
        const { period = '30d' } = req.query;
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        if (period === '7d') {
            startDate.setDate(endDate.getDate() - 7);
        } else if (period === '30d') {
            startDate.setDate(endDate.getDate() - 30);
        } else if (period === '90d') {
            startDate.setDate(endDate.getDate() - 90);
        }
        
        // Get message statistics
        const messageStats = await WhatsAppMessage.aggregate([
            { $match: { 
                coachId, 
                timestamp: { $gte: startDate, $lte: endDate } 
            }},
            { $group: {
                _id: null,
                totalSent: { $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] } },
                totalReceived: { $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] } },
                totalCreditsUsed: { $sum: '$creditsUsed' },
                successfulSent: { $sum: { $cond: [{ $and: [{ $eq: ['$direction', 'outbound'] }, { $eq: ['$status', 'sent'] }] }, 1, 0] } },
                failedSent: { $sum: { $cond: [{ $and: [{ $eq: ['$direction', 'outbound'] }, { $eq: ['$status', 'failed'] }] }, 1, 0] } }
            }}
        ]);
        
        // Get daily message counts
        const dailyStats = await WhatsAppMessage.aggregate([
            { $match: { 
                coachId, 
                timestamp: { $gte: startDate, $lte: endDate } 
            }},
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                sent: { $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] } },
                received: { $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] } }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        // Get device statistics
        const deviceStats = await WhatsAppDevice.aggregate([
            { $match: { coachId } },
            { $lookup: {
                from: 'whatsappmessages',
                localField: '_id',
                foreignField: 'deviceId',
                as: 'messages',
                pipeline: [
                    { $match: { 
                        timestamp: { $gte: startDate, $lte: endDate },
                        direction: 'outbound'
                    }}
                ]
            }},
            { $project: {
                deviceName: 1,
                deviceType: 1,
                isConnected: 1,
                messagesSent: { $size: '$messages' }
            }}
        ]);
        
        const stats = messageStats[0] || {
            totalSent: 0,
            totalReceived: 0,
            totalCreditsUsed: 0,
            successfulSent: 0,
            failedSent: 0
        };
        
        console.log('✅ [UNIFIED_MESSAGING] getMessagingStats - Success');
        res.status(200).json({
            success: true,
            data: {
                period,
                overview: {
                    totalSent: stats.totalSent,
                    totalReceived: stats.totalReceived,
                    totalCreditsUsed: stats.totalCreditsUsed,
                    successRate: stats.totalSent > 0 ? (stats.successfulSent / stats.totalSent * 100).toFixed(2) : 0
                },
                dailyStats,
                deviceStats
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getMessagingStats - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get messaging statistics',
            error: error.message
        });
    }
});

// ===== CONTACT MANAGEMENT =====

// @desc    Get contacts
// @route   GET /api/messagingv1/contacts
// @access  Private (Coach)
exports.getContacts = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getContacts - Starting...');
        
        const coachId = req.user.id;
        const { page = 1, limit = 50, search } = req.query;
        
        // Get unique contacts from messages
        const contacts = await WhatsAppMessage.aggregate([
            { $match: { coachId } },
            { $group: {
                _id: { $ifNull: ['$from', '$to'] },
                lastMessage: { $max: '$timestamp' },
                messageCount: { $sum: 1 },
                unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ['$direction', 'inbound'] }, { $eq: ['$isRead', false] }] }, 1, 0] } },
                lastMessageText: { $last: '$message' },
                direction: { $last: '$direction' }
            }},
            ...(search ? [{ $match: { _id: new RegExp(search, 'i') } }] : []),
            { $sort: { lastMessage: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        ]);
        
        const total = await WhatsAppMessage.aggregate([
            { $match: { coachId } },
            { $group: { _id: { $ifNull: ['$from', '$to'] } } },
            { $count: 'total' }
        ]);
        
        console.log('✅ [UNIFIED_MESSAGING] getContacts - Success');
        res.status(200).json({
            success: true,
            data: {
                contacts,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil((total[0]?.total || 0) / limit),
                    total: total[0]?.total || 0,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getContacts - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contacts',
            error: error.message
        });
    }
});

// ===== HELPER FUNCTIONS =====

async function getTemplateMessage(templateId, params = {}) {
    try {
        const template = await WhatsAppTemplate.findById(templateId);
        if (!template) {
            throw new Error('Template not found');
        }
        
        let message = template.content;
        
        // Replace variables in template
        template.variables.forEach(variable => {
            const value = params[variable.name] || variable.defaultValue || `{${variable.name}}`;
            message = message.replace(new RegExp(`{${variable.name}}`, 'g'), value);
        });
        
        return message;
    } catch (error) {
        logger.error('[UNIFIED_MESSAGING] Error getting template message:', error);
        throw error;
    }
}

// @desc    Update message template
// @route   PUT /api/messagingv1/templates/:templateId
// @access  Private (Coach)
exports.updateMessageTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] updateMessageTemplate - Starting...');
        
        const coachId = req.user.id;
        const { templateId } = req.params;
        const { name, content, category, language, variables } = req.body;
        
        const template = await WhatsAppTemplate.findOneAndUpdate(
            { _id: templateId, coachId },
            { name, content, category, language, variables },
            { new: true }
        );
        
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        
        console.log('✅ [UNIFIED_MESSAGING] updateMessageTemplate - Success');
        res.status(200).json({
            success: true,
            message: 'Template updated successfully',
            data: template
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] updateMessageTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update template',
            error: error.message
        });
    }
});

// @desc    Delete message template
// @route   DELETE /api/messagingv1/templates/:templateId
// @access  Private (Coach)
exports.deleteMessageTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] deleteMessageTemplate - Starting...');
        
        const coachId = req.user.id;
        const { templateId } = req.params;
        
        const template = await WhatsAppTemplate.findOneAndDelete({ _id: templateId, coachId });
        
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        
        console.log('✅ [UNIFIED_MESSAGING] deleteMessageTemplate - Success');
        res.status(200).json({
            success: true,
            message: 'Template deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] deleteMessageTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete template',
            error: error.message
        });
    }
});

// @desc    Create a new WhatsApp device
// @route   POST /api/messagingv1/devices
// @access  Private (Coach)
exports.createWhatsAppDevice = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] createWhatsAppDevice - Starting...');
        
        const coachId = req.user.id;
        const { deviceName, deviceType = 'baileys', phoneNumber, description } = req.body;
        
        // Validate required fields
        if (!deviceName) {
            return res.status(400).json({
                success: false,
                message: 'Device name is required'
            });
        }
        
        if (!['baileys', 'meta'].includes(deviceType)) {
            return res.status(400).json({
                success: false,
                message: 'Device type must be either "baileys" or "meta"'
            });
        }
        
        // For Baileys, phone number is optional (will be set after QR scan)
        // For Meta, phone number is required
        if (deviceType === 'meta' && !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required for Meta WhatsApp devices'
            });
        }
        
        // Check if coach already has a default device
        const existingDefaultDevice = await WhatsAppDevice.findOne({ 
            coachId, 
            isDefault: true 
        });
        
        // Create new device
        const device = new WhatsAppDevice({
            coachId,
            deviceName,
            deviceType,
            phoneNumber: phoneNumber || (deviceType === 'baileys' ? `pending_${Date.now()}` : ''),
            description: description || '',
            isDefault: !existingDefaultDevice, // Set as default if no default device exists
            isActive: true,
            isConnected: false
        });
        
        await device.save();
        
        console.log('✅ [UNIFIED_MESSAGING] createWhatsAppDevice - Success');
        res.status(201).json({
            success: true,
            message: 'WhatsApp device created successfully',
            data: {
                deviceId: device._id,
                deviceName: device.deviceName,
                deviceType: device.deviceType,
                phoneNumber: device.phoneNumber,
                description: device.description,
                isDefault: device.isDefault,
                isActive: device.isActive,
                isConnected: device.isConnected,
                nextStep: deviceType === 'baileys' ? 'Initialize Baileys connection' : 'Configure Meta credentials',
                createdAt: device.createdAt
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] createWhatsAppDevice - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create WhatsApp device',
            error: error.message
        });
    }
});

// @desc    Get all WhatsApp devices for coach
// @route   GET /api/messagingv1/devices
// @access  Private (Coach)
exports.getCoachWhatsAppDevices = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getCoachWhatsAppDevices - Starting...');
        
        const coachId = req.user.id;
        
        const devices = await WhatsAppDevice.find({ coachId }).sort({ isDefault: -1, createdAt: -1 });
        
        console.log('✅ [UNIFIED_MESSAGING] getCoachWhatsAppDevices - Success');
        res.status(200).json({
            success: true,
            data: devices
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getCoachWhatsAppDevices - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get WhatsApp devices',
            error: error.message
        });
    }
});

// ===== DEVICE MANAGEMENT =====

// @desc    Create a new WhatsApp device
// @route   POST /api/messagingv1/devices
// @access  Private (Coach)
exports.createWhatsAppDevice = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] createWhatsAppDevice - Starting...');
        
        const coachId = req.user.id;
        const { deviceName, deviceType = 'baileys', phoneNumber, description } = req.body;
        
        // Validate required fields
        if (!deviceName) {
            return res.status(400).json({
                success: false,
                message: 'Device name is required'
            });
        }
        
        if (!['baileys', 'meta'].includes(deviceType)) {
            return res.status(400).json({
                success: false,
                message: 'Device type must be either "baileys" or "meta"'
            });
        }
        
        // For Baileys, phone number is optional (will be set after QR scan)
        // For Meta, phone number is required
        if (deviceType === 'meta' && !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required for Meta WhatsApp devices'
            });
        }
        
        // Check if coach already has a default device
        const existingDefaultDevice = await WhatsAppDevice.findOne({ 
            coachId, 
            isDefault: true 
        });
        
        // Create new device
        const device = new WhatsAppDevice({
            coachId,
            deviceName,
            deviceType,
            phoneNumber: phoneNumber || (deviceType === 'baileys' ? `pending_${Date.now()}` : ''),
            description: description || '',
            isDefault: !existingDefaultDevice, // Set as default if no default device exists
            isActive: true,
            isConnected: false
        });
        
        await device.save();
        
        console.log('✅ [UNIFIED_MESSAGING] createWhatsAppDevice - Success');
        res.status(201).json({
            success: true,
            message: 'WhatsApp device created successfully',
            data: {
                deviceId: device._id,
                deviceName: device.deviceName,
                deviceType: device.deviceType,
                phoneNumber: device.phoneNumber,
                description: device.description,
                isDefault: device.isDefault,
                isActive: device.isActive,
                isConnected: device.isConnected,
                nextStep: deviceType === 'baileys' ? 'Initialize Baileys connection' : 'Configure Meta credentials',
                createdAt: device.createdAt
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] createWhatsAppDevice - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create WhatsApp device',
            error: error.message
        });
    }
});

// @desc    Get all WhatsApp devices for coach
// @route   GET /api/messagingv1/devices
// @access  Private (Coach)
exports.getCoachWhatsAppDevices = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getCoachWhatsAppDevices - Starting...');
        
        const coachId = req.user.id;
        
        const devices = await WhatsAppDevice.find({ coachId }).sort({ isDefault: -1, createdAt: -1 });
        
        console.log('✅ [UNIFIED_MESSAGING] getCoachWhatsAppDevices - Success');
        res.status(200).json({
            success: true,
            data: devices
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getCoachWhatsAppDevices - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get WhatsApp devices',
            error: error.message
        });
    }
});

// @desc    Update WhatsApp device
// @route   PUT /api/messagingv1/devices/:deviceId
// @access  Private (Coach)
exports.updateWhatsAppDevice = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] updateWhatsAppDevice - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        const { deviceName, description, isDefault, isActive } = req.body;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // If setting as default, unset other default devices
        if (isDefault && !device.isDefault) {
            await WhatsAppDevice.updateMany(
                { coachId, _id: { $ne: deviceId } },
                { isDefault: false }
            );
        }
        
        // Update device
        const updatedDevice = await WhatsAppDevice.findByIdAndUpdate(
            deviceId,
            { deviceName, description, isDefault, isActive },
            { new: true }
        );
        
        console.log('✅ [UNIFIED_MESSAGING] updateWhatsAppDevice - Success');
        res.status(200).json({
            success: true,
            message: 'Device updated successfully',
            data: updatedDevice
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] updateWhatsAppDevice - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update device',
            error: error.message
        });
    }
});

// @desc    Delete WhatsApp device
// @route   DELETE /api/messagingv1/devices/:deviceId
// @access  Private (Coach)
exports.deleteWhatsAppDevice = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] deleteWhatsAppDevice - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // Disconnect device if it's a Baileys device
        if (device.deviceType === 'baileys') {
            try {
                await baileysMicroserviceClient.disconnectDevice(deviceId);
            } catch (error) {
                console.log('Could not disconnect device from microservice:', error.message);
            }
        }
        
        // Delete device
        await WhatsAppDevice.findByIdAndDelete(deviceId);
        
        console.log('✅ [UNIFIED_MESSAGING] deleteWhatsAppDevice - Success');
        res.status(200).json({
            success: true,
            message: 'Device deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] deleteWhatsAppDevice - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete device',
            error: error.message
        });
    }
});

// ===== DEVICE STATUS MANAGEMENT =====

// @desc    Get device status
// @route   GET /api/messagingv1/devices/:deviceId/status
// @access  Private (Coach)
exports.getDeviceStatus = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getDeviceStatus - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        let status = 'disconnected';
        
        // Get status from Baileys microservice for Baileys devices
        if (device.deviceType === 'baileys') {
            try {
                const statusResponse = await baileysMicroserviceClient.getConnectionStatus(deviceId);
                status = statusResponse.success ? statusResponse.data : 'disconnected';
            } catch (error) {
                console.log('Could not get status from microservice:', error.message);
                status = 'disconnected';
            }
        } else if (device.deviceType === 'meta') {
            // For Meta devices, assume connected if credentials are valid
            status = device.isActive ? 'connected' : 'disconnected';
        }
        
        console.log('✅ [UNIFIED_MESSAGING] getDeviceStatus - Success');
        res.status(200).json({
            success: true,
            data: {
                deviceId,
                deviceName: device.deviceName,
                deviceType: device.deviceType,
                phoneNumber: device.phoneNumber,
                status,
                isConnected: device.isConnected,
                isActive: device.isActive,
                lastConnected: device.lastConnected,
                sessionId: device.sessionId
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getDeviceStatus - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get device status',
            error: error.message
        });
    }
});

// @desc    Switch WhatsApp device (set as default)
// @route   POST /api/messagingv1/devices/:deviceId/switch
// @access  Private (Coach)
exports.switchWhatsAppDevice = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] switchWhatsAppDevice - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // Unset all other default devices
        await WhatsAppDevice.updateMany(
            { coachId, _id: { $ne: deviceId } },
            { isDefault: false }
        );
        
        // Set this device as default
        await WhatsAppDevice.findByIdAndUpdate(deviceId, { isDefault: true });
        
        console.log('✅ [UNIFIED_MESSAGING] switchWhatsAppDevice - Success');
        res.status(200).json({
            success: true,
            message: 'Device switched successfully',
            data: {
                deviceId,
                deviceName: device.deviceName,
                isDefault: true
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] switchWhatsAppDevice - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to switch device',
            error: error.message
        });
    }
});

// ===== INBOX AND MESSAGE HISTORY =====

// @desc    Get inbox messages with advanced filtering
// @route   GET /api/messagingv1/inbox
// @access  Private (Coach)
exports.getInboxMessages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getInboxMessages - Starting...');
        
        const coachId = req.user.id;
        const { 
            page = 1, 
            limit = 20, 
            contact, 
            deviceId, 
            status = 'all',
            dateFrom,
            dateTo,
            unreadOnly = false
        } = req.query;
        
        // Build query
        const query = { coachId, direction: 'inbound' };
        
        if (contact) {
            query.from = new RegExp(contact, 'i');
        }
        
        if (deviceId) {
            query.deviceId = deviceId;
        }
        
        if (status !== 'all') {
            query.status = status;
        }
        
        if (unreadOnly === 'true') {
            query.isRead = false;
        }
        
        if (dateFrom || dateTo) {
            query.timestamp = {};
            if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
            if (dateTo) query.timestamp.$lte = new Date(dateTo);
        }
        
        // Get messages with pagination
        const messages = await WhatsAppMessage.find(query)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('deviceId', 'deviceName deviceType phoneNumber');
        
        const total = await WhatsAppMessage.countDocuments(query);
        
        // Get conversations summary
        const conversations = await WhatsAppMessage.aggregate([
            { $match: { coachId, direction: 'inbound' } },
            { $group: {
                _id: '$from',
                lastMessage: { $max: '$timestamp' },
                messageCount: { $sum: 1 },
                unreadCount: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
                lastMessageText: { $last: '$message' },
                deviceId: { $last: '$deviceId' }
            }},
            { $sort: { lastMessage: -1 } },
            { $limit: 10 }
        ]);
        
        // Get unread count
        const unreadCount = await WhatsAppMessage.countDocuments({
            coachId,
            direction: 'inbound',
            isRead: false
        });
        
        console.log('✅ [UNIFIED_MESSAGING] getInboxMessages - Success');
        res.status(200).json({
            success: true,
            data: {
                messages,
                conversations,
                unreadCount,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getInboxMessages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get inbox messages',
            error: error.message
        });
    }
});

// @desc    Get message history for a specific contact
// @route   GET /api/messagingv1/messages/:contact
// @access  Private (Coach)
exports.getMessageHistory = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getMessageHistory - Starting...');
        
        const coachId = req.user.id;
        const { contact } = req.params;
        const { page = 1, limit = 50, deviceId } = req.query;
        
        // Build query
        const query = { 
            coachId,
            $or: [
                { from: contact },
                { to: contact }
            ]
        };
        
        if (deviceId) {
            query.deviceId = deviceId;
        }
        
        // Get messages with pagination
        const messages = await WhatsAppMessage.find(query)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('deviceId', 'deviceName deviceType phoneNumber');
        
        const total = await WhatsAppMessage.countDocuments(query);
        
        // Mark messages as read
        await WhatsAppMessage.updateMany(
            { coachId, from: contact, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        
        console.log('✅ [UNIFIED_MESSAGING] getMessageHistory - Success');
        res.status(200).json({
            success: true,
            data: {
                contact,
                messages: messages.reverse(), // Show oldest first
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getMessageHistory - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get message history',
            error: error.message
        });
    }
});

// @desc    Mark messages as read
// @route   PUT /api/messagingv1/messages/mark-read
// @access  Private (Coach)
exports.markMessagesAsRead = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] markMessagesAsRead - Starting...');
        
        const coachId = req.user.id;
        const { messageIds, contact } = req.body;
        
        let query = { coachId, isRead: false };
        
        if (messageIds && Array.isArray(messageIds)) {
            query._id = { $in: messageIds };
        } else if (contact) {
            query.from = contact;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either messageIds or contact is required'
            });
        }
        
        const result = await WhatsAppMessage.updateMany(query, {
            isRead: true,
            readAt: new Date()
        });
        
        console.log('✅ [UNIFIED_MESSAGING] markMessagesAsRead - Success');
        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} messages marked as read`,
            data: {
                modifiedCount: result.modifiedCount
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] markMessagesAsRead - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read',
            error: error.message
        });
    }
});

// ===== BAILEYS SPECIFIC OPERATIONS =====

// @desc    Get QR code for Baileys WhatsApp setup
// @route   GET /api/messagingv1/baileys/qr/:deviceId
// @access  Public (No auth required for QR display)
exports.getBaileysQR = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getBaileysQR - Starting...');
        
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Find device by ID (no auth required for QR display)
        const device = await WhatsAppDevice.findOne({ _id: deviceId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // Get QR code from Baileys microservice
        console.log('Getting QR code for device:', deviceId);
        const qrResponse = await baileysMicroserviceClient.getQRCode(deviceId);
        console.log('QR response:', JSON.stringify(qrResponse, null, 2));
        console.log('QR data received:', qrResponse.success ? 'Available' : 'Not available');
        
        if (!qrResponse.success || !qrResponse.data) {
            return res.status(404).json({
                success: false,
                message: qrResponse.message || 'QR code not available. Please initialize the device first.',
                data: null
            });
        }
        
        console.log('✅ [UNIFIED_MESSAGING] getBaileysQR - Success');
        res.status(200).json({
            success: true,
            message: qrResponse.message || 'QR code retrieved successfully',
            data: {
                qrCode: qrResponse.data, // QR data URL is directly in qrResponse.data
                deviceId,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getBaileysQR - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get QR code',
            error: error.message
        });
    }
});

// @desc    Initialize Baileys connection
// @route   POST /api/messagingv1/baileys/connect/:deviceId
// @access  Private (Coach)
exports.initializeBaileysConnection = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] initializeBaileysConnection - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // For Baileys devices, if phoneNumber is still pending, we'll update it after QR scan
        // The phone number should already be set during device creation
        
        // Check if there's an existing session for this device and disconnect it
        try {
            await baileysMicroserviceClient.disconnectDevice(deviceId);
            console.log(`🔄 [UNIFIED_MESSAGING] Disconnected existing session for device ${deviceId}`);
        } catch (error) {
            console.log(`ℹ️ [UNIFIED_MESSAGING] No existing session found for device ${deviceId}`);
        }
        
        // Initialize Baileys session via microservice
        const sessionId = device.sessionId || `session_${device._id}`;
        if (!device.sessionId) {
            await device.updateOne({ sessionId });
        }
        
        console.log(`[UNIFIED_MESSAGING] Calling microservice to initialize device ${deviceId} for coach ${device.coachId}`);
        const result = await baileysMicroserviceClient.initializeDevice(deviceId, device.coachId);
        
        if (result.success) {
            // Update device status
            await device.updateOne({ 
                isActive: true,
                lastConnected: new Date()
            });
            
            // Wait longer for QR generation, then get QR data
            console.log('🔄 [UNIFIED_MESSAGING] Waiting for QR generation...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Get QR code data with retry logic
            let qrResponse = await baileysMicroserviceClient.getQRCode(deviceId);
            console.log('🔄 [UNIFIED_MESSAGING] QR response:', qrResponse.success ? 'Available' : 'Not available');
            
            // If QR not available, wait a bit more and try again
            if (!qrResponse.success) {
                console.log('🔄 [UNIFIED_MESSAGING] QR not ready, waiting more and retrying...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                qrResponse = await baileysMicroserviceClient.getQRCode(deviceId);
                console.log('🔄 [UNIFIED_MESSAGING] QR retry response:', qrResponse.success ? 'Available' : 'Still not available');
            }
            
            console.log('✅ [UNIFIED_MESSAGING] initializeBaileysConnection - Success');
            res.status(200).json({
                success: result.success,
                message: result.success ? 'Connection initialized successfully' : 'Failed to initialize connection',
                data: {
                    deviceId,
                    sessionId,
                    status: result.success ? 'initialized' : 'failed',
                    qrSetupUrl: `/whatsapp-qr-setup.html?device=${deviceId}`,
                    qrCode: qrResponse.success ? qrResponse.data : null,
                    qrMessage: qrResponse.message || (qrResponse.success ? 'QR code generated successfully' : 'QR code not available yet')
                }
            });
        } else {
            console.log('❌ [UNIFIED_MESSAGING] initializeBaileysConnection - Failed');
            res.status(200).json({
                success: result.success,
                message: 'Failed to initialize connection',
                data: {
                    deviceId,
                    sessionId,
                    status: 'failed',
                    qrSetupUrl: `/whatsapp-qr-setup.html?device=${deviceId}`,
                    qrCode: null,
                    qrMessage: 'Device initialization failed'
                }
            });
        }
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] initializeBaileysConnection - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize connection',
            error: error.message
        });
    }
});

// @desc    Disconnect Baileys WhatsApp
// @route   DELETE /api/messagingv1/baileys/disconnect/:deviceId
// @access  Private (Coach)
exports.disconnectBaileys = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] disconnectBaileys - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // Disconnect from Baileys microservice
        await baileysMicroserviceClient.disconnectDevice(deviceId);
        
        // Update device status
        await device.updateOne({ 
            isConnected: false,
            isActive: false,
            qrCode: null,
            qrCodeExpiry: null
        });
        
        console.log('✅ [UNIFIED_MESSAGING] disconnectBaileys - Success');
        res.status(200).json({
            success: true,
            message: 'WhatsApp disconnected successfully',
            data: {
                deviceId,
                status: 'disconnected'
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] disconnectBaileys - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disconnect WhatsApp',
            error: error.message
        });
    }
});

// @desc    Get Baileys connection status
// @route   GET /api/messagingv1/baileys/status/:deviceId
// @access  Private (Coach)
exports.getBaileysStatus = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] getBaileysStatus - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // Get status from Baileys microservice
        const statusResponse = await baileysMicroserviceClient.getConnectionStatus(deviceId);
        const status = statusResponse.success ? statusResponse.data : null;
        
        console.log('✅ [UNIFIED_MESSAGING] getBaileysStatus - Success');
        res.status(200).json({
            success: true,
            data: {
                deviceId,
                deviceName: device.deviceName,
                deviceType: device.deviceType,
                phoneNumber: device.phoneNumber,
                status: status || 'disconnected',
                isConnected: device.isConnected,
                isActive: device.isActive,
                lastConnected: device.lastConnected,
                sessionId: device.sessionId
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] getBaileysStatus - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get connection status',
            error: error.message
        });
    }
});

// @desc    Force QR code generation
// @route   POST /api/messagingv1/baileys/force-qr/:deviceId
// @access  Private (Coach)
exports.forceQRGeneration = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [UNIFIED_MESSAGING] forceQRGeneration - Starting...');
        
        const coachId = req.user.id;
        const { deviceId } = req.params;
        
        // Validate deviceId
        const deviceValidation = validateDeviceId(deviceId);
        if (!deviceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: deviceValidation.message
            });
        }
        
        // Verify device belongs to coach
        const device = await WhatsAppDevice.findOne({ _id: deviceId, coachId });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }
        
        // Force QR generation via microservice
        const result = await baileysMicroserviceClient.forceQRGeneration(deviceId);
        
        // Update device with new session ID if provided
        if (result.success && result.sessionId) {
            await device.updateOne({ sessionId: result.sessionId });
            console.log(`Updated device ${deviceId} with new session ID: ${result.sessionId}`);
        }
        
        console.log('✅ [UNIFIED_MESSAGING] forceQRGeneration - Success');
        res.status(200).json({
            success: true,
            message: 'QR generation forced successfully',
            data: {
                deviceId,
                result
            }
        });
        
    } catch (error) {
        console.error('❌ [UNIFIED_MESSAGING] forceQRGeneration - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to force QR generation',
            error: error.message
        });
    }
});

module.exports = {
    // Debug endpoints
    debugQRSetup: exports.debugQRSetup,
    
    // Coach settings
    getCoachWhatsAppSettings,
    setCoachWhatsAppSettings: exports.setCoachWhatsAppSettings,
    
    // Messaging
    sendMessage: exports.sendMessage,
    getInboxMessages: exports.getInboxMessages,
    
    // Templates
    getMessageTemplates: exports.getMessageTemplates,
    createMessageTemplate: exports.createMessageTemplate,
    updateMessageTemplate: exports.updateMessageTemplate,
    deleteMessageTemplate: exports.deleteMessageTemplate,
    
    // Staff integration
    getStaffDevices: exports.getStaffDevices,
    
    // Statistics and contacts
    getMessagingStats: exports.getMessagingStats,
    getContacts: exports.getContacts,
    
    // Device Management
    createWhatsAppDevice: exports.createWhatsAppDevice,
    getCoachWhatsAppDevices: exports.getCoachWhatsAppDevices,
    updateWhatsAppDevice: exports.updateWhatsAppDevice,
    deleteWhatsAppDevice: exports.deleteWhatsAppDevice,
    
    // Device Status Management
    getDeviceStatus: exports.getDeviceStatus,
    switchWhatsAppDevice: exports.switchWhatsAppDevice,
    
    // Message History and Inbox
    getMessageHistory: exports.getMessageHistory,
    markMessagesAsRead: exports.markMessagesAsRead,
    
    // Baileys WhatsApp (Core Operations Only)
    getBaileysQR: exports.getBaileysQR,
    initializeBaileysConnection: exports.initializeBaileysConnection,
    disconnectBaileys: exports.disconnectBaileys,
    getBaileysStatus: exports.getBaileysStatus,
    forceQRGeneration: exports.forceQRGeneration
};
