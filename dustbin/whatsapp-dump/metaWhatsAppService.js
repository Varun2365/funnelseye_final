// D:\PRJ_YCT_Final\services\metaWhatsAppService.js

const axios = require('axios');
const { Coach, Staff } = require('../schema');
const { WhatsAppMessage } = require('../schema');
const { Lead } = require('../schema');

// Meta API configuration from environment variables
const META_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v19.0';
const CENTRAL_API_TOKEN = process.env.WHATSAPP_CENTRAL_API_TOKEN;
const CENTRAL_PHONE_NUMBER_ID = process.env.WHATSAPP_CENTRAL_PHONE_NUMBER_ID;
const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

/**
 * Test connection to Meta WhatsApp API
 * @param {string} apiToken The WhatsApp API token
 * @param {string} phoneNumberId The phone number ID
 * @returns {Object} Connection test result
 */
async function testConnection(apiToken, phoneNumberId) {
    try {
        const headers = {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        };

        // Test by fetching phone number details
        const response = await axios.get(
            `${META_API_URL}/${phoneNumberId}`,
            { headers }
        );

        return {
            success: true,
            message: 'Connection successful',
            data: {
                phoneNumber: response.data.phone_number,
                verifiedName: response.data.verified_name,
                codeVerificationStatus: response.data.code_verification_status,
                qualityRating: response.data.quality_rating
            }
        };
    } catch (error) {
        console.error('Error testing connection:', error.response?.data || error.message);
        return {
            success: false,
            message: 'Connection failed',
            error: error.response?.data?.error?.message || error.message
        };
    }
}

/**
 * Checks available templates for the WhatsApp Business account
 * @param {string} apiToken The WhatsApp API token
 * @param {string} phoneNumberId The phone number ID
 * @returns {Array} Array of available templates
 */
async function getAvailableTemplates(apiToken, phoneNumberId) {
    try {
        const headers = {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        };

        const response = await axios.get(
            `${META_API_URL}/${phoneNumberId}/message_templates`,
            { headers }
        );

        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching templates:', error.response?.data || error.message);
        return [];
    }
}

/**
 * Checks if a contact exists in the database (has received messages before)
 * @param {string} userId The user ID (coach or staff)
 * @param {string} userType The user type ('coach' or 'staff')
 * @param {string} phoneNumber The phone number to check
 * @returns {boolean} True if contact exists, false otherwise
 */
async function contactExists(userId, userType, phoneNumber) {
    try {
        const lead = await Lead.findOne({ 
            [userType === 'coach' ? 'coachId' : 'staffId']: userId, 
            phone: phoneNumber 
        });
        return !!lead;
    } catch (error) {
        console.error('Error checking contact existence:', error);
        return false;
    }
}

/**
 * Sends a WhatsApp message using either the central or a user's personal account.
 * This function first checks if the user has credits, deducts one if they do,
 * and then sends the message via the Meta API. A record of the message is saved
 * to the database upon successful delivery.
 * @param {string} userId The ID of the user sending the message.
 * @param {string} userType The type of user ('coach' or 'staff').
 * @param {string} recipientPhoneNumber The recipient's phone number.
 * @param {string} messageContent The content of the message.
 * @param {boolean} useTemplate Whether to use a message template (for first-time contacts).
 * @param {boolean} useCentralAccount Whether to use central account credentials.
 */
async function sendMessageByUser(userId, userType, recipientPhoneNumber, messageContent, useTemplate = false, useCentralAccount = false) {
    try {
        let apiToken, phoneNumberId, businessAccountId;

        if (useCentralAccount) {
            // Use central FunnelsEye account
            apiToken = CENTRAL_API_TOKEN;
            phoneNumberId = CENTRAL_PHONE_NUMBER_ID;
            businessAccountId = process.env.WHATSAPP_CENTRAL_BUSINESS_ACCOUNT_ID;
            
            if (!apiToken || !phoneNumberId) {
                throw new Error('Central WhatsApp credentials not configured');
            }
        } else {
            // Get user's personal integration
            const UserModel = userType === 'coach' ? Coach : Staff;
            const user = await UserModel.findById(userId).select('+whatsApp.whatsAppApiToken whatsApp.phoneNumberId whatsApp.whatsAppBusinessAccountId credits whatsApp.useCentralAccount');
            
            if (!user) {
                throw new Error('User not found.');
            }

            // Check if user wants to use central fallback
            if (user.whatsApp?.useCentralAccount) {
                apiToken = CENTRAL_API_TOKEN;
                phoneNumberId = CENTRAL_PHONE_NUMBER_ID;
                businessAccountId = process.env.WHATSAPP_CENTRAL_BUSINESS_ACCOUNT_ID;
                
                if (!apiToken || !phoneNumberId) {
                    throw new Error('Central WhatsApp credentials not configured');
                }
            } else {
                // Use user's personal credentials
                apiToken = user.whatsApp?.whatsAppApiToken;
                phoneNumberId = user.whatsApp?.phoneNumberId;
                businessAccountId = user.whatsApp?.whatsAppBusinessAccountId;
                
                if (!apiToken || !phoneNumberId) {
                    throw new Error('WhatsApp API credentials not configured for this user.');
                }
            }

            // Check for available credits (only for personal accounts)
            if (!user.whatsApp?.useCentralAccount && user.credits <= 0) {
                console.warn(`User ${userId} attempted to send a message but has insufficient credits.`);
                throw new Error('Insufficient credits. Please top up your account or enable central fallback.');
            }
        }

        // Auto-determine if we should use template (if not explicitly set)
        if (useTemplate === undefined) {
            const contactExists = await contactExists(userId, userType, recipientPhoneNumber);
            useTemplate = !contactExists;
        }

        let payload;
        if (useTemplate) {
            // Use message template for first-time contacts
            payload = {
                messaging_product: 'whatsapp',
                to: recipientPhoneNumber,
                type: 'template',
                template: {
                    name: 'hello_world',
                    language: {
                        code: 'en_US'
                    }
                }
            };
        } else {
            // Use text message for existing contacts
            payload = {
                messaging_product: 'whatsapp',
                to: recipientPhoneNumber,
                type: 'text',
                text: { body: messageContent }
            };
        }

        const headers = {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        };

        console.log('Sending WhatsApp message with payload:', JSON.stringify(payload, null, 2));
        console.log('Using API URL:', `${META_API_URL}/${phoneNumberId}/messages`);
        console.log('Phone Number ID:', phoneNumberId);

        try {
            const response = await axios.post(
                `${META_API_URL}/${phoneNumberId}/messages`,
                payload,
                { headers }
            );
            
            // Deduct credit if using personal account
            if (!useCentralAccount && userType === 'coach') {
                const user = await Coach.findById(userId);
                if (user && user.credits > 0) {
                    user.credits -= 1;
                    await user.save();
                    console.log(`Credit deducted. User ${userId} now has ${user.credits} credits.`);
                }
            }

            // Find or create the lead and save a record of the outbound message
            const lead = await Lead.findOne({ 
                [userType === 'coach' ? 'coachId' : 'staffId']: userId, 
                phone: recipientPhoneNumber 
            });
            
            if (lead) {
                const newMessage = new WhatsAppMessage({
                    userId,
                    userType,
                    messageId: response.data.messages[0].id,
                    from: null,
                    to: recipientPhoneNumber,
                    content: messageContent,
                    direction: 'outbound',
                    timestamp: new Date(),
                    type: 'text',
                    isAutomated: false,
                    integrationType: 'meta_official'
                });

                await newMessage.save();
                console.log(`Outbound message saved to database for user ${userId}`);
            }

            console.log(`WhatsApp message sent successfully via ${useCentralAccount ? 'central account' : 'personal account'}`);
            return {
                success: true,
                messageId: response.data.messages[0].id,
                status: 'sent',
                viaCentralAccount: useCentralAccount
            };

        } catch (error) {
            console.error('Error sending WhatsApp message:', error.response?.data || error.message);
            throw new Error(`Failed to send WhatsApp message: ${error.response?.data?.error?.message || error.message}`);
        }

    } catch (error) {
        console.error(`Error in sendMessageByUser:`, error);
        throw error;
    }
}

/**
 * Sends a WhatsApp message using a specific template
 * @param {string} userId The ID of the user sending the message
 * @param {string} userType The type of user ('coach' or 'staff')
 * @param {string} recipientPhoneNumber The recipient's phone number
 * @param {string} templateName The name of the template to use
 * @param {Array} components Template components (optional)
 * @param {string} language The language code (default: 'en_US')
 * @param {boolean} useCentralAccount Whether to use central account
 */
async function sendTemplateMessage(userId, userType, recipientPhoneNumber, templateName, components = [], language = 'en_US', useCentralAccount = false) {
    try {
        let apiToken, phoneNumberId;

        if (useCentralAccount) {
            apiToken = CENTRAL_API_TOKEN;
            phoneNumberId = CENTRAL_PHONE_NUMBER_ID;
        } else {
            const UserModel = userType === 'coach' ? Coach : Staff;
            const user = await UserModel.findById(userId).select('+whatsApp.whatsAppApiToken whatsApp.phoneNumberId whatsApp.useCentralAccount');
            
            if (!user) {
                throw new Error('User not found.');
            }

            if (user.whatsApp?.useCentralAccount) {
                apiToken = CENTRAL_API_TOKEN;
                phoneNumberId = CENTRAL_PHONE_NUMBER_ID;
            } else {
                apiToken = user.whatsApp?.whatsAppApiToken;
                phoneNumberId = user.whatsApp?.phoneNumberId;
            }
        }

        if (!apiToken || !phoneNumberId) {
            throw new Error('WhatsApp API credentials not configured');
        }

        const payload = {
            messaging_product: 'whatsapp',
            to: recipientPhoneNumber,
            type: 'template',
            template: {
                name: templateName,
                language: {
                    code: language
                },
                components: components
            }
        };

        const headers = {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        };

        const response = await axios.post(
            `${META_API_URL}/${phoneNumberId}/messages`,
            payload,
            { headers }
        );

        // Save message to database
        const newMessage = new WhatsAppMessage({
            userId,
            userType,
            messageId: response.data.messages[0].id,
            from: null,
            to: recipientPhoneNumber,
            content: `[Template: ${templateName}]`,
            direction: 'outbound',
            timestamp: new Date(),
            type: 'template',
            isAutomated: false,
            integrationType: 'meta_official'
        });

        await newMessage.save();

        return {
            success: true,
            messageId: response.data.messages[0].id,
            status: 'sent',
            templateName: templateName
        };

    } catch (error) {
        console.error('Error sending template message:', error);
        throw error;
    }
}

/**
 * Handles incoming webhook messages from Meta
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 */
async function handleWebhook(req, res) {
    // Webhook verification (GET request from Meta)
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
        console.log('Webhook verified successfully');
        res.status(200).send(challenge);
        return;
    }

    // Handle incoming messages (POST request from Meta)
    if (req.method === 'POST') {
        const body = req.body;

        if (body.object === 'whatsapp_business_account') {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.value.messages && change.value.messages.length > 0) {
                        for (const messageData of change.value.messages) {
                            await processIncomingMessage(messageData, change.value.metadata);
                        }
                    }
                }
            }
            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(404);
    }
}

/**
 * Process incoming WhatsApp message
 * @param {Object} messageData The message data from Meta
 * @param {Object} metadata The metadata from Meta
 */
async function processIncomingMessage(messageData, metadata) {
    try {
        const senderPhoneNumber = messageData.from;
        const recipientPhoneNumberId = metadata.phone_number_id;
        const messageContent = messageData.text?.body || '[Media Message]';
        const messageType = messageData.type || 'text';
        const timestamp = new Date(messageData.timestamp * 1000);

        console.log(`Processing incoming message from ${senderPhoneNumber}`);

        // Find the user associated with this phone number ID
        let user = await Coach.findOne({ 'whatsApp.phoneNumberId': recipientPhoneNumberId });
        let userType = 'coach';

        if (!user) {
            user = await Staff.findOne({ 'whatsApp.phoneNumberId': recipientPhoneNumberId });
            userType = 'staff';
        }

        if (user) {
            // Find or create the lead based on the sender's phone number
            let lead = await Lead.findOne({ 
                [userType === 'coach' ? 'coachId' : 'staffId']: user._id, 
                phone: senderPhoneNumber 
            });
            
            if (!lead) {
                // Create a new lead if one doesn't exist
                lead = new Lead({
                    [userType === 'coach' ? 'coachId' : 'staffId']: user._id,
                    phone: senderPhoneNumber,
                    name: senderPhoneNumber, // Use the number as a temporary name
                    status: 'New',
                    source: 'WhatsApp'
                });
                await lead.save();
            }

            // Save the incoming message to the database
            const newMessage = new WhatsAppMessage({
                userId: user._id,
                userType: userType,
                messageId: messageData.id,
                from: senderPhoneNumber,
                to: recipientPhoneNumberId,
                content: messageContent,
                direction: 'inbound',
                timestamp: timestamp,
                type: messageType,
                isAutomated: false,
                integrationType: 'meta_official'
            });

            await newMessage.save();
            console.log(`Saved new inbound message from ${senderPhoneNumber}`);
        } else {
            console.log(`No user found for phone number ID: ${recipientPhoneNumberId}`);
        }

    } catch (error) {
        console.error('Error processing incoming message:', error);
    }
}

/**
 * Test Meta API connection
 * @param {string} userId The user ID
 * @param {string} userType The user type
 * @returns {Object} Test result
 */
async function testConnection(userId, userType) {
    try {
        const UserModel = userType === 'coach' ? Coach : Staff;
        const user = await UserModel.findById(userId).select('+whatsApp.whatsAppApiToken whatsApp.phoneNumberId');

        if (!user?.whatsApp?.whatsAppApiToken || !user?.whatsApp?.phoneNumberId) {
            return {
                success: false,
                message: 'WhatsApp API credentials not configured'
            };
        }

        // Test by getting available templates
        const templates = await getAvailableTemplates(
            user.whatsApp.whatsAppApiToken,
            user.whatsApp.phoneNumberId
        );

        return {
            success: true,
            message: 'Meta API connection successful',
            data: {
                templatesCount: templates.length,
                phoneNumberId: user.whatsApp.phoneNumberId
            }
        };

    } catch (error) {
        return {
            success: false,
            message: `Connection test failed: ${error.message}`
        };
    }
}

module.exports = {
    sendMessageByUser,
    sendTemplateMessage,
    getAvailableTemplates,
    handleWebhook,
    testConnection,
    contactExists,
    testConnection: testConnection
};