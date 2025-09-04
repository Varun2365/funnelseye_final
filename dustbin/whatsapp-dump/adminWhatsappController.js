const asyncHandler = require('../middleware/async');
const { AdminSystemSettings } = require('../schema');
const metaWhatsAppService = require('../services/metaWhatsAppService');

// ===== CENTRAL WHATSAPP SETTINGS MANAGEMENT =====

/**
 * @desc    Get central WhatsApp settings
 * @route   GET /api/admin/whatsapp/settings
 * @access  Private (Admin)
 */
exports.getCentralWhatsAppSettings = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne().select('whatsApp');
        
        if (!settings || !settings.whatsApp) {
            return res.status(200).json({
                success: true,
                data: {
                    isEnabled: false,
                    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v19.0',
                    centralApiToken: '',
                    centralPhoneNumberId: '',
                    centralBusinessAccountId: '',
                    webhookVerifyToken: '',
                    webhookUrl: '',
                    creditPrice: 0.01,
                    autoRecharge: false,
                    rechargeThreshold: 10,
                    rechargeAmount: 100,
                    messageTemplates: [],
                    globalSettings: {
                        autoReply: false,
                        autoReplyMessage: '',
                        businessHours: {
                            enabled: false,
                            timezone: 'UTC+05:30',
                            hours: {
                                monday: { start: '09:00', end: '17:00', enabled: true },
                                tuesday: { start: '09:00', end: '17:00', enabled: true },
                                wednesday: { start: '09:00', end: '17:00', enabled: true },
                                thursday: { start: '09:00', end: '17:00', enabled: true },
                                friday: { start: '09:00', end: '17:00', enabled: true },
                                saturday: { start: '10:00', end: '15:00', enabled: true },
                                sunday: { start: '10:00', end: '15:00', enabled: false }
                            }
                        }
                    }
                }
            });
        }

        res.status(200).json({
            success: true,
            data: settings.whatsApp
        });
    } catch (error) {
        console.error('Error getting central WhatsApp settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving WhatsApp settings',
            error: error.message
        });
    }
});

/**
 * @desc    Update central WhatsApp settings
 * @route   PUT /api/admin/whatsapp/settings
 * @access  Private (Admin)
 */
exports.updateCentralWhatsAppSettings = asyncHandler(async (req, res) => {
    try {
        const {
            isEnabled,
            centralApiToken,
            centralPhoneNumberId,
            centralBusinessAccountId,
            webhookVerifyToken,
            webhookUrl,
            creditPrice,
            autoRecharge,
            rechargeThreshold,
            rechargeAmount,
            globalSettings
        } = req.body;

        // Validate required fields if enabling
        if (isEnabled) {
            if (!centralApiToken || !centralPhoneNumberId || !centralBusinessAccountId) {
                return res.status(400).json({
                    success: false,
                    message: 'API token, phone number ID, and business account ID are required when enabling WhatsApp'
                });
            }
        }

        // Update or create settings
        const settings = await AdminSystemSettings.findOneAndUpdate(
            {},
            {
                $set: {
                    'whatsApp.isEnabled': isEnabled,
                    'whatsApp.apiUrl': process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v19.0',
                    'whatsApp.centralApiToken': centralApiToken,
                    'whatsApp.centralPhoneNumberId': centralPhoneNumberId,
                    'whatsApp.centralBusinessAccountId': centralBusinessAccountId,
                    'whatsApp.webhookVerifyToken': webhookVerifyToken,
                    'whatsApp.webhookUrl': webhookUrl,
                    'whatsApp.creditPrice': creditPrice || 0.01,
                    'whatsApp.autoRecharge': autoRecharge || false,
                    'whatsApp.rechargeThreshold': rechargeThreshold || 10,
                    'whatsApp.rechargeAmount': rechargeAmount || 100,
                    'whatsApp.globalSettings': globalSettings || {},
                    'whatsApp.updatedAt': new Date()
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Central WhatsApp settings updated successfully',
            data: settings.whatsApp
        });
    } catch (error) {
        console.error('Error updating central WhatsApp settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating WhatsApp settings',
            error: error.message
        });
    }
});

/**
 * @desc    Test central WhatsApp integration
 * @route   POST /api/admin/whatsapp/test
 * @access  Private (Admin)
 */
exports.testCentralWhatsAppIntegration = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne().select('whatsApp');
        
        if (!settings || !settings.whatsApp || !settings.whatsApp.isEnabled) {
            return res.status(400).json({
                success: false,
                message: 'WhatsApp integration is not enabled or configured'
            });
        }

        const { centralApiToken, centralPhoneNumberId } = settings.whatsApp;

        // Test API connection
        const testResult = await metaWhatsAppService.testConnection(centralApiToken, centralPhoneNumberId);

        res.status(200).json({
            success: true,
            message: 'WhatsApp integration test completed',
            data: testResult
        });
    } catch (error) {
        console.error('Error testing WhatsApp integration:', error);
        res.status(500).json({
            success: false,
            message: 'Error testing WhatsApp integration',
            error: error.message
        });
    }
});

/**
 * @desc    Get WhatsApp usage analytics
 * @route   GET /api/admin/whatsapp/analytics
 * @access  Private (Admin)
 */
exports.getWhatsAppAnalytics = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30 } = req.query;
        
        // This would typically calculate from actual usage data
        const analytics = {
            overview: {
                totalMessages: 0,
                totalCreditsUsed: 0,
                totalRevenue: 0,
                activeUsers: 0
            },
            usage: {
                dailyMessages: [],
                creditConsumption: [],
                revenueTrend: []
            },
            performance: {
                deliveryRate: 0,
                responseRate: 0,
                averageResponseTime: 0
            },
            topUsers: [],
            recentActivity: []
        };

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error getting WhatsApp analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving WhatsApp analytics',
            error: error.message
        });
    }
});

/**
 * @desc    Get all WhatsApp integrations across platform
 * @route   GET /api/admin/whatsapp/integrations
 * @access  Private (Admin)
 */
exports.getAllWhatsAppIntegrations = asyncHandler(async (req, res) => {
    try {
        // This would typically fetch from WhatsAppIntegration schema
        const integrations = [];

        res.status(200).json({
            success: true,
            data: integrations
        });
    } catch (error) {
        console.error('Error getting WhatsApp integrations:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving WhatsApp integrations',
            error: error.message
        });
    }
});

/**
 * @desc    Get WhatsApp message templates
 * @route   GET /api/admin/whatsapp/templates
 * @access  Private (Admin)
 */
exports.getWhatsAppTemplates = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne().select('whatsApp');
        
        if (!settings || !settings.whatsApp || !settings.whatsApp.isEnabled) {
            return res.status(400).json({
                success: false,
                message: 'WhatsApp integration is not enabled'
            });
        }

        const { centralApiToken, centralPhoneNumberId } = settings.whatsApp;
        
        // Fetch templates from Meta API
        const templates = await metaWhatsAppService.getAvailableTemplates(centralApiToken, centralPhoneNumberId);

        res.status(200).json({
            success: true,
            data: templates
        });
    } catch (error) {
        console.error('Error getting WhatsApp templates:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving WhatsApp templates',
            error: error.message
        });
    }
});

/**
 * @desc    Create WhatsApp message template
 * @route   POST /api/admin/whatsapp/templates
 * @access  Private (Admin)
 */
exports.createWhatsAppTemplate = asyncHandler(async (req, res) => {
    try {
        const { name, category, language, components } = req.body;

        if (!name || !category || !language) {
            return res.status(400).json({
                success: false,
                message: 'Name, category, and language are required'
            });
        }

        const settings = await AdminSystemSettings.findOne().select('whatsApp');
        
        if (!settings || !settings.whatsApp || !settings.whatsApp.isEnabled) {
            return res.status(400).json({
                success: false,
                message: 'WhatsApp integration is not enabled'
            });
        }

        // This would typically create template via Meta API
        const newTemplate = {
            id: `template_${Date.now()}`,
            name,
            category,
            language,
            components: components || [],
            status: 'pending_approval',
            createdAt: new Date()
        };

        res.status(201).json({
            success: true,
            message: 'WhatsApp template created successfully',
            data: newTemplate
        });
    } catch (error) {
        console.error('Error creating WhatsApp template:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating WhatsApp template',
            error: error.message
        });
    }
});

/**
 * @desc    Get WhatsApp webhook configuration
 * @route   GET /api/admin/whatsapp/webhook
 * @access  Private (Admin)
 */
exports.getWebhookConfiguration = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne().select('whatsApp');
        
        if (!settings || !settings.whatsApp) {
            return res.status(200).json({
                success: true,
                data: {
                    webhookUrl: '',
                    verifyToken: '',
                    isConfigured: false
                }
            });
        }

        const { webhookUrl, webhookVerifyToken } = settings.whatsApp;

        res.status(200).json({
            success: true,
            data: {
                webhookUrl: webhookUrl || '',
                verifyToken: webhookVerifyToken || '',
                isConfigured: !!(webhookUrl && webhookVerifyToken)
            }
        });
    } catch (error) {
        console.error('Error getting webhook configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving webhook configuration',
            error: error.message
        });
    }
});

/**
 * @desc    Update webhook configuration
 * @route   PUT /api/admin/whatsapp/webhook
 * @access  Private (Admin)
 */
exports.updateWebhookConfiguration = asyncHandler(async (req, res) => {
    try {
        const { webhookUrl, verifyToken } = req.body;

        if (!webhookUrl || !verifyToken) {
            return res.status(400).json({
                success: false,
                message: 'Webhook URL and verify token are required'
            });
        }

        const settings = await AdminSystemSettings.findOneAndUpdate(
            {},
            {
                $set: {
                    'whatsApp.webhookUrl': webhookUrl,
                    'whatsApp.webhookVerifyToken': verifyToken,
                    'whatsApp.updatedAt': new Date()
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Webhook configuration updated successfully',
            data: {
                webhookUrl: settings.whatsApp.webhookUrl,
                verifyToken: settings.whatsApp.webhookVerifyToken,
                isConfigured: true
            }
        });
    } catch (error) {
        console.error('Error updating webhook configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating webhook configuration',
            error: error.message
        });
    }
});
