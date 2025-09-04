const asyncHandler = require('../../middleware/async');
const metaService = require('../services/metaWhatsAppService');
const logger = require('../../utils/logger');

// @desc    Handle Meta WhatsApp webhook verification
// @route   GET /api/whatsapp/webhook
// @access  Public
exports.verifyWebhook = asyncHandler(async (req, res, next) => {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;

    try {
        const result = await metaService.verifyWebhook(mode, token, challenge);
        res.status(200).send(result);
    } catch (error) {
        logger.error(`[WebhookController] Webhook verification failed:`, error);
        res.status(403).send('Forbidden');
    }
});

// @desc    Handle Meta WhatsApp webhook events
// @route   POST /api/whatsapp/webhook
// @access  Public
exports.handleWebhook = asyncHandler(async (req, res, next) => {
    try {
        const result = await metaService.handleWebhook(req.body);
        
        if (result.success) {
            logger.info(`[WebhookController] Webhook processed successfully:`, {
                resultsCount: result.results?.length || 0
            });
        } else {
            logger.warn(`[WebhookController] Webhook processing failed:`, result.message);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        logger.error(`[WebhookController] Error processing webhook:`, error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// @desc    Handle Baileys WhatsApp webhook events (if needed)
// @route   POST /api/whatsapp/baileys-webhook
// @access  Public
exports.handleBaileysWebhook = asyncHandler(async (req, res, next) => {
    try {
        // Baileys doesn't use webhooks in the same way as Meta
        // This endpoint can be used for any Baileys-specific webhook handling
        logger.info(`[WebhookController] Baileys webhook received:`, req.body);
        
        res.status(200).json({ success: true });
    } catch (error) {
        logger.error(`[WebhookController] Error processing Baileys webhook:`, error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// @desc    Get webhook status
// @route   GET /api/whatsapp/webhook/status
// @access  Private
exports.getWebhookStatus = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;

    // Get webhook configuration from global settings or coach settings
    const webhookUrl = `${req.protocol}://${req.get('host')}/api/whatsapp/webhook`;
    
    const status = {
        webhookUrl,
        isConfigured: true,
        lastReceived: new Date(),
        totalReceived: 0, // This would need to be tracked in a separate collection
        status: 'active'
    };

    res.status(200).json({
        success: true,
        data: status
    });
});

// @desc    Test webhook endpoint
// @route   POST /api/whatsapp/webhook/test
// @access  Private
exports.testWebhook = asyncHandler(async (req, res, next) => {
    const { deviceId, testData } = req.body;

    try {
        // Simulate a webhook event for testing
        const mockWebhookData = {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: 'test-entry-id',
                    changes: [
                        {
                            value: {
                                messaging_product: 'whatsapp',
                                metadata: {
                                    display_phone_number: '+1234567890',
                                    phone_number_id: deviceId
                                },
                                contacts: [
                                    {
                                        profile: {
                                            name: 'Test User'
                                        },
                                        wa_id: '+1234567890'
                                    }
                                ],
                                messages: [
                                    {
                                        from: '+1234567890',
                                        id: 'test-message-id',
                                        timestamp: Math.floor(Date.now() / 1000),
                                        text: {
                                            body: testData?.message || 'Test message from webhook'
                                        },
                                        type: 'text'
                                    }
                                ]
                            },
                            field: 'messages'
                        }
                    ]
                }
            ]
        };

        const result = await metaService.handleWebhook(mockWebhookData);

        res.status(200).json({
            success: true,
            message: 'Test webhook processed successfully',
            data: result
        });
    } catch (error) {
        logger.error(`[WebhookController] Error testing webhook:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to process test webhook'
        });
    }
});
