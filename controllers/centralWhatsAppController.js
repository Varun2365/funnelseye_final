const asyncHandler = require('../middleware/async');
const CentralWhatsApp = require('../schema/CentralWhatsApp');
const centralWhatsAppService = require('../services/centralWhatsAppService');
const WhatsAppCredit = require('../schema/WhatsAppCredit');
const logger = require('../utils/logger');

// @desc    Setup Central WhatsApp Configuration
// @route   POST /api/admin/central-whatsapp/setup
// @access  Private (Admin)
exports.setupCentralWhatsApp = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] setupCentralWhatsApp - Starting...');
        
        const {
            phoneNumberId,
            accessToken
        } = req.body;
        
        // Validate required fields (only essential Meta API fields)
        if (!phoneNumberId || !accessToken) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: phoneNumberId, accessToken'
            });
        }
        
        // Check if central WhatsApp already exists
        const existingConfig = await CentralWhatsApp.findOne({ isActive: true });
        if (existingConfig) {
            return res.status(400).json({
                success: false,
                message: 'Central WhatsApp is already configured. Use update endpoint to modify existing configuration.'
            });
        }
        
        // Test the configuration by making a direct API call
        try {
            const axios = require('axios');
            const testUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}`;
            const testResponse = await axios.get(testUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ [CENTRAL_WHATSAPP] Configuration test successful');
        } catch (testError) {
            console.error('❌ [CENTRAL_WHATSAPP] Configuration test failed:', testError.message);
            return res.status(400).json({
                success: false,
                message: 'Invalid WhatsApp Business API credentials. Please check your phoneNumberId and accessToken.',
                error: testError.response?.data?.error?.message || testError.message
            });
        }
        
        // Create central WhatsApp configuration (only essential fields)
        const centralWhatsApp = new CentralWhatsApp({
            phoneNumberId,
            accessToken,
            isActive: true,
            isDefault: true,
            configuredBy: req.admin.id
        });
        
        await centralWhatsApp.save();
        
        // Initialize the service with new config
        await centralWhatsAppService.initialize();
        
        // Sync templates from Meta
        try {
            await centralWhatsAppService.syncTemplates();
            console.log('✅ [CENTRAL_WHATSAPP] Templates synced successfully');
        } catch (syncError) {
            console.warn('⚠️ [CENTRAL_WHATSAPP] Template sync failed:', syncError.message);
        }
        
        console.log('✅ [CENTRAL_WHATSAPP] setupCentralWhatsApp - Success');
        res.status(201).json({
            success: true,
            message: 'Central WhatsApp configured successfully',
            data: {
                id: centralWhatsApp._id,
                phoneNumberId: centralWhatsApp.phoneNumberId,
                isActive: centralWhatsApp.isActive,
                templatesCount: centralWhatsApp.templates.length,
                contactsCount: centralWhatsApp.contacts.length,
                configuredAt: centralWhatsApp.createdAt
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] setupCentralWhatsApp - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to setup Central WhatsApp',
            error: error.message
        });
    }
});

// @desc    Get Central WhatsApp Configuration
// @route   GET /api/admin/central-whatsapp/config
// @access  Private (Admin)
exports.getCentralWhatsAppConfig = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getCentralWhatsAppConfig - Starting...');
        
        const config = await CentralWhatsApp.findOne({ isActive: true })
            .select('-accessToken') // Don't expose access token
            .populate('configuredBy', 'name email');
        
        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Central WhatsApp not configured'
            });
        }
        
        console.log('✅ [CENTRAL_WHATSAPP] getCentralWhatsAppConfig - Success');
        res.status(200).json({
            success: true,
            data: config
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getCentralWhatsAppConfig - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get Central WhatsApp configuration',
            error: error.message
        });
    }
});

// @desc    Update Central WhatsApp Configuration
// @route   PUT /api/admin/central-whatsapp/config
// @access  Private (Admin)
exports.updateCentralWhatsAppConfig = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] updateCentralWhatsAppConfig - Starting...');
        
        const {
            dailyLimit,
            monthlyLimit
        } = req.body;
        
        const config = await CentralWhatsApp.findOne({ isActive: true });
        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Central WhatsApp not configured'
            });
        }
        
        // Update fields (only statistics limits - business info managed by Meta)
        if (dailyLimit) config.statistics.dailyLimit = dailyLimit;
        if (monthlyLimit) config.statistics.monthlyLimit = monthlyLimit;
        
        await config.save();
        
        console.log('✅ [CENTRAL_WHATSAPP] updateCentralWhatsAppConfig - Success');
        res.status(200).json({
            success: true,
            message: 'Central WhatsApp configuration updated successfully',
            data: config
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] updateCentralWhatsAppConfig - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update Central WhatsApp configuration',
            error: error.message
        });
    }
});

// @desc    Create WhatsApp Template
// @route   POST /api/admin/central-whatsapp/templates
// @access  Private (Admin)
exports.createTemplate = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] createTemplate - Starting...');
        
        const { name, category, language, components } = req.body;
        
        // Validate required fields
        if (!name || !category || !components) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, category, components'
            });
        }
        
        // Validate category
        const validCategories = ['AUTHENTICATION', 'MARKETING', 'UTILITY', 'OTP'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }
        
        const result = await centralWhatsAppService.createTemplate({
            name,
            category,
            language: language || 'en',
            components
        });
        
        console.log('✅ [CENTRAL_WHATSAPP] createTemplate - Success');
        res.status(201).json({
            success: true,
            message: 'Template created successfully and submitted for approval',
            data: result
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] createTemplate - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create template',
            error: error.response?.data?.error?.message || error.message
        });
    }
});

// @desc    Get All Templates
// @route   GET /api/admin/central-whatsapp/templates
// @access  Private (Admin)
exports.getTemplates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getTemplates - Starting...');
        
        const result = await centralWhatsAppService.getTemplates();
        
        console.log('✅ [CENTRAL_WHATSAPP] getTemplates - Success');
        res.status(200).json({
            success: true,
            data: result.templates
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getTemplates - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get templates',
            error: error.message
        });
    }
});

// @desc    Sync Templates from Meta
// @route   POST /api/admin/central-whatsapp/templates/sync
// @access  Private (Admin)
exports.syncTemplates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] syncTemplates - Starting...');
        
        const result = await centralWhatsAppService.syncTemplates();
        
        console.log('✅ [CENTRAL_WHATSAPP] syncTemplates - Success');
        res.status(200).json({
            success: true,
            message: 'Templates synced successfully',
            data: result
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] syncTemplates - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync templates',
            error: error.message
        });
    }
});

// @desc    Get Contacts
// @route   GET /api/admin/central-whatsapp/contacts
// @access  Private (Admin)
exports.getContacts = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getContacts - Starting...');
        
        const { limit = 100, offset = 0 } = req.query;
        
        const result = await centralWhatsAppService.getContacts(
            parseInt(limit),
            parseInt(offset)
        );
        
        console.log('✅ [CENTRAL_WHATSAPP] getContacts - Success');
        res.status(200).json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getContacts - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contacts',
            error: error.message
        });
    }
});

// @desc    Health Check
// @route   GET /api/admin/central-whatsapp/health
// @access  Private (Admin)
exports.healthCheck = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] healthCheck - Starting...');
        
        const result = await centralWhatsAppService.healthCheck();
        
        console.log('✅ [CENTRAL_WHATSAPP] healthCheck - Success');
        res.status(200).json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] healthCheck - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
});

// @desc    Send Test Message
// @route   POST /api/admin/central-whatsapp/test-message
// @access  Private (Admin)
exports.sendTestMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] sendTestMessage - Starting...');
        
        const { to, message, templateName, parameters } = req.body;
        
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Recipient phone number is required'
            });
        }
        
        let result;
        if (templateName) {
            // Send template message
            result = await centralWhatsAppService.sendTemplateMessage(
                to,
                templateName,
                'en',
                parameters || []
            );
        } else if (message) {
            // Send text message
            result = await centralWhatsAppService.sendTextMessage(to, message);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either message or templateName is required'
            });
        }
        
        console.log('✅ [CENTRAL_WHATSAPP] sendTestMessage - Success');
        res.status(200).json({
            success: true,
            message: 'Test message sent successfully',
            data: result
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] sendTestMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test message',
            error: error.response?.data?.error?.message || error.message
        });
    }
});

// ===== COACH WHATSAPP METHODS =====

// @desc    Send WhatsApp Message (Coach)
// @route   POST /api/centralwhatsapp/send-message
// @access  Private (Coach)
exports.sendCoachMessage = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] sendCoachMessage - Starting...');
        
        const coachId = req.user.id;
        const { to, message, templateName, parameters, mediaUrl, mediaType } = req.body;
        
        // Validate required fields
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Recipient phone number is required'
            });
        }
        
        if (!message && !templateName && !mediaUrl) {
            return res.status(400).json({
                success: false,
                message: 'Either message, templateName, or mediaUrl is required'
            });
        }
        
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
        
        // Initialize central WhatsApp service
        await centralWhatsAppService.initialize();
        
        let result;
        
        if (templateName) {
            // Send template message
            result = await centralWhatsAppService.sendTemplateMessage(
                to,
                templateName,
                'en',
                parameters || [],
                coachId
            );
        } else if (mediaUrl) {
            // Send media message
            result = await centralWhatsAppService.sendMediaMessage(
                to,
                mediaType || 'image',
                mediaUrl,
                message || null,
                coachId
            );
        } else {
            // Send plain text message
            result = await centralWhatsAppService.sendTextMessage(to, message, coachId);
        }
        
        // Deduct credits after successful send
        await credits.deductCredits(1, 'WhatsApp message sent via Central WhatsApp');
        
        console.log('✅ [CENTRAL_WHATSAPP] sendCoachMessage - Success');
        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            data: {
                messageId: result.messageId,
                recipient: result.recipient,
                status: result.status,
                creditsUsed: 1,
                remainingCredits: credits.balance - 1
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] sendCoachMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.response?.data?.error?.message || error.message
        });
    }
});

// @desc    Get Available Templates (Coach)
// @route   GET /api/centralwhatsapp/templates
// @access  Private (Coach)
exports.getCoachTemplates = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getCoachTemplates - Starting...');
        
        const result = await centralWhatsAppService.getTemplates();
        
        // Filter only approved templates for coaches
        const approvedTemplates = result.templates.filter(template => 
            template.status === 'APPROVED'
        );
        
        console.log('✅ [CENTRAL_WHATSAPP] getCoachTemplates - Success');
        res.status(200).json({
            success: true,
            data: approvedTemplates
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getCoachTemplates - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get templates',
            error: error.message
        });
    }
});

// @desc    Get Coach's Contacts
// @route   GET /api/centralwhatsapp/contacts
// @access  Private (Coach)
exports.getCoachContacts = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getCoachContacts - Starting...');
        
        const { limit = 50, offset = 0, search } = req.query;
        
        const result = await centralWhatsAppService.getContacts(
            parseInt(limit),
            parseInt(offset)
        );
        
        // Filter contacts based on search if provided
        let filteredContacts = result.contacts;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredContacts = result.contacts.filter(contact => 
                contact.phoneNumber.includes(search) ||
                (contact.name && contact.name.toLowerCase().includes(searchLower)) ||
                (contact.profileName && contact.profileName.toLowerCase().includes(searchLower))
            );
        }
        
        console.log('✅ [CENTRAL_WHATSAPP] getCoachContacts - Success');
        res.status(200).json({
            success: true,
            data: {
                contacts: filteredContacts,
                total: result.total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                search: search || null
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getCoachContacts - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contacts',
            error: error.message
        });
    }
});

// @desc    Get Central WhatsApp Status (Coach)
// @route   GET /api/centralwhatsapp/status
// @access  Private (Coach)
exports.getCoachStatus = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [CENTRAL_WHATSAPP] getCoachStatus - Starting...');
        
        const coachId = req.user.id;
        
        // Get coach's credit status
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        
        // Get central WhatsApp health status
        const healthStatus = await centralWhatsAppService.healthCheck();
        
        // Get basic config info
        const config = await CentralWhatsApp.findOne({ isActive: true })
            .select('phoneNumberId statistics templates contacts');
        
        console.log('✅ [CENTRAL_WHATSAPP] getCoachStatus - Success');
        res.status(200).json({
            success: true,
            data: {
                centralWhatsApp: {
                    isActive: healthStatus.success,
                    phoneNumberId: config?.phoneNumberId || 'Not configured',
                    status: healthStatus.status,
                    templatesCount: config?.templates?.length || 0,
                    contactsCount: config?.contacts?.length || 0
                },
                credits: {
                    balance: credits.balance,
                    status: credits.status,
                    canSendMessage: credits.canSendMessage()
                },
                limits: {
                    dailyLimit: config?.statistics?.dailyLimit || 1000,
                    monthlyLimit: config?.statistics?.monthlyLimit || 25000
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [CENTRAL_WHATSAPP] getCoachStatus - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get status',
            error: error.message
        });
    }
});
