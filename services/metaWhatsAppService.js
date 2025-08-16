// D:\PRJ_YCT_Final\services\metaWhatsAppService.js

const axios = require('axios');
const Coach = require('../schema/coachSchema');
const WhatsAppMessage = require('../schema/whatsappMessageSchema');
const Lead = require('../schema/Lead');

// Meta API configuration from environment variables
const META_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v19.0';
const CENTRAL_API_TOKEN = process.env.WHATSAPP_CENTRAL_API_TOKEN;
const CENTRAL_PHONE_NUMBER_ID = process.env.WHATSAPP_CENTRAL_PHONE_NUMBER_ID;
const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

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
 * @param {string} coachId The coach ID
 * @param {string} phoneNumber The phone number to check
 * @returns {boolean} True if contact exists, false otherwise
 */
async function contactExists(coachId, phoneNumber) {
    try {
        const lead = await Lead.findOne({ coachId, phone: phoneNumber });
        if (!lead) return false;
        
        // Check if there are any inbound messages from this contact
        const inboundMessage = await WhatsAppMessage.findOne({
            lead: lead._id,
            direction: 'inbound'
        });
        
        return !!inboundMessage;
    } catch (error) {
        console.error('Error checking contact existence:', error);
        return false;
    }
}

/**
 * Sends a WhatsApp message using either the central or a coach's personal account.
 * This function first checks if the coach has credits, deducts one if they do,
 * and then sends the message via the Meta API. A record of the message is saved
 * to the database upon successful delivery.
 * @param {string} coachId The ID of the coach sending the message.
 * @param {string} recipientPhoneNumber The recipient's phone number.
 * @param {string} messageContent The content of the message.
 * @param {boolean} useTemplate Whether to use a message template (for first-time contacts).
 */
async function sendMessageByCoach(coachId, recipientPhoneNumber, messageContent, useTemplate = false) {
    try {
        // Fetch the coach document, explicitly selecting the hidden fields needed.
        const coach = await Coach.findById(coachId).select('+whatsApp.whatsAppApiToken credits whatsApp.useCentralAccount whatsApp.phoneNumberId');
        if (!coach) {
            throw new Error('Coach not found.');
        }

        // 1. Check for available credits
        if (coach.credits <= 0) {
            console.warn(`Coach ${coachId} attempted to send a message but has insufficient credits.`);
            throw new Error('Insufficient credits. Please top up your account.');
        }

        // 2. Determine which WhatsApp API credentials to use
        let apiToken, phoneNumberId;
        if (coach.whatsApp.useCentralAccount) {
            console.log('Using central account');
            apiToken = CENTRAL_API_TOKEN;
            phoneNumberId = CENTRAL_PHONE_NUMBER_ID;
        } else {
            apiToken = coach.whatsApp.whatsAppApiToken;
            phoneNumberId = coach.whatsApp.phoneNumberId;
        }

        if (!apiToken || !phoneNumberId) {
            throw new Error('WhatsApp API credentials not configured for this coach.');
        }

        // 3. Auto-determine if we should use template (if not explicitly set)
        if (useTemplate === false) {
            const hasContact = await contactExists(coachId, recipientPhoneNumber);
            if (!hasContact) {
                console.log('Contact does not exist, switching to template message');
                useTemplate = true;
            }
        }

        // 4. Construct the message payload based on whether to use template or text
        let payload;
        if (useTemplate) {
            // Check available templates first
            const availableTemplates = await getAvailableTemplates(apiToken, phoneNumberId);
            console.log('Available templates:', availableTemplates.map(t => t.name));
            
            // Find a suitable template
            let templateName = 'hello_world';
            const hasHelloWorld = availableTemplates.some(t => t.name === 'hello_world');
            
            if (!hasHelloWorld && availableTemplates.length > 0) {
                // Use the first available template
                templateName = availableTemplates[0].name;
                console.log(`hello_world template not found, using ${templateName} instead`);
            } else if (availableTemplates.length === 0) {
                console.log('No templates available, falling back to text message');
                useTemplate = false;
            }
            
            if (useTemplate) {
                payload = {
                    messaging_product: 'whatsapp',
                    to: recipientPhoneNumber,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: {
                            code: 'en_US'
                        }
                    }
                };
            }
        }
        
        // If not using template or template failed, use text message
        if (!useTemplate) {
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
            
            // 5. Deduct one credit from the coach's balance
            coach.credits -= 1;
            await coach.save();
            console.log(`Credit deducted. Coach ${coachId} now has ${coach.credits} credits.`);

            // 6. Find the lead and save a record of the outbound message
            const lead = await Lead.findOne({ coachId: coachId, phone: recipientPhoneNumber });
            if (lead) {
                const newMessage = new WhatsAppMessage({
                    coach: coach._id,
                    lead: lead._id,
                    messageId: response.data.messages[0].id,
                    from: phoneNumberId, // The sender's phone number ID
                    to: recipientPhoneNumber,
                    content: useTemplate ? 'Template: hello_world' : messageContent,
                    direction: 'outbound',
                    timestamp: new Date(),
                    type: useTemplate ? 'template' : 'text'
                });
                await newMessage.save();
                console.log('Outbound message saved to database.');
            }

            return response.data;

        } catch (apiError) {
            console.error('WhatsApp API Error Details:');
            console.error('Status:', apiError.response?.status);
            console.error('Status Text:', apiError.response?.statusText);
            console.error('Error Data:', JSON.stringify(apiError.response?.data, null, 2));
            console.error('Request URL:', apiError.config?.url);
            console.error('Request Payload:', JSON.stringify(apiError.config?.data, null, 2));
            
            // If template fails, try with text message as fallback
            if (useTemplate && apiError.response?.status === 400) {
                console.log('Template message failed, trying with text message as fallback...');
                
                const fallbackPayload = {
                    messaging_product: 'whatsapp',
                    to: recipientPhoneNumber,
                    type: 'text',
                    text: { body: messageContent }
                };

                const fallbackResponse = await axios.post(
                    `${META_API_URL}/${phoneNumberId}/messages`,
                    fallbackPayload,
                    { headers }
                );

                // Save the fallback message
                const lead = await Lead.findOne({ coachId: coachId, phone: recipientPhoneNumber });
                if (lead) {
                    const newMessage = new WhatsAppMessage({
                        coach: coach._id,
                        lead: lead._id,
                        messageId: fallbackResponse.data.messages[0].id,
                        from: phoneNumberId,
                        to: recipientPhoneNumber,
                        content: messageContent,
                        direction: 'outbound',
                        timestamp: new Date(),
                        type: 'text'
                    });
                    await newMessage.save();
                    console.log('Fallback text message saved to database.');
                }

                return fallbackResponse.data;
            }
            
            throw apiError;
        }

    } catch (error) {
        // Log the error and re-throw it so it can be handled by the calling function/route.
        console.error('Error in sendMessageByCoach:', error.response ? error.response.data : error.message);
        throw error;
    }
}

/**
 * Handles incoming webhook messages from the Meta API.
 * This function is responsible for parsing the webhook payload, identifying the
 * lead and coach, and saving the incoming message to the database.
 * NOTE: The implementation of this function should be from our previous conversations
 * and is not included here for brevity.


/**
 * Handles incoming messages and status updates from the Meta Webhook.
 */
async function handleWebhook(req, res) {
    // Webhook verification (GET request from Meta)
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
        console.log('Webhook verified!');
        return res.status(200).send(challenge);
    } else if (mode === 'subscribe') {
        console.warn('Webhook verification failed: Invalid token.');
        return res.sendStatus(403);
    }

    // Process incoming message payload (POST request)
    const body = req.body;
    if (body.object) {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
            const messageData = body.entry[0].changes[0].value.messages[0];
            const senderPhoneNumber = messageData.from; // The user's phone number
            const recipientPhoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id; // Your phone number ID

            // Extract the message content based on its type
            let messageContent = '';
            let messageType = messageData.type;

            if (messageData.type === 'text') {
                messageContent = messageData.text.body;
            }
            // Add more cases for other message types (image, video, etc.) as needed
            // else if (messageData.type === 'image') { ... }

            if (messageContent) {
                // Find the coach associated with this phone number ID
                const coach = await Coach.findOne({ 'whatsApp.phoneNumberId': recipientPhoneNumberId });

                if (coach) {
                    // Find or create the lead based on the sender's phone number
                    let lead = await Lead.findOne({ coachId: coach._id, phone: senderPhoneNumber });
                    if (!lead) {
                        // Create a new lead if one doesn't exist
                        lead = new Lead({
                            coachId: coach._id,
                            phone: senderPhoneNumber,
                            name: senderPhoneNumber, // Use the number as a temporary name
                            status: 'New',
                            source: 'WhatsApp'
                        });
                        await lead.save();
                    }

                    // Save the incoming message to the database
                    const newMessage = new WhatsAppMessage({
                        coach: coach._id,
                        lead: lead._id,
                        messageId: messageData.id,
                        from: senderPhoneNumber,
                        to: recipientPhoneNumberId,
                        content: messageContent,
                        direction: 'inbound',
                        timestamp: new Date(messageData.timestamp * 1000), // Meta sends a Unix timestamp in seconds
                        type: messageType
                    });

                    await newMessage.save();
                    console.log(`Saved new inbound message from ${senderPhoneNumber}`);
                }
            }
        }
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
}

module.exports = {
    sendMessageByCoach,
    handleWebhook,
    contactExists,
    getAvailableTemplates
};