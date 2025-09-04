const axios = require('axios');
const logger = require('../../utils/logger');

class MetaWhatsAppService {
    constructor() {
        this.baseUrl = 'https://graph.facebook.com/v18.0';
    }

    async sendMessage(phoneNumberId, accessToken, messageData) {
        try {
            const url = `${this.baseUrl}/${phoneNumberId}/messages`;
            
            const response = await axios.post(url, messageData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                messageId: response.data.messages?.[0]?.id,
                status: 'sent'
            };

        } catch (error) {
            logger.error(`[MetaWhatsAppService] Error sending message:`, error.response?.data || error.message);
            throw error;
        }
    }

    async sendTextMessage(phoneNumberId, accessToken, to, text) {
        const messageData = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'text',
            text: {
                preview_url: false,
                body: text
            }
        };

        return await this.sendMessage(phoneNumberId, accessToken, messageData);
    }

    async sendTemplateMessage(phoneNumberId, accessToken, to, templateName, language = 'en', components = []) {
        const messageData = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'template',
            template: {
                name: templateName,
                language: {
                    code: language
                },
                components: components
            }
        };

        return await this.sendMessage(phoneNumberId, accessToken, messageData);
    }

    async sendMediaMessage(phoneNumberId, accessToken, to, mediaType, mediaUrl, caption = '') {
        const messageData = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: mediaType,
            [mediaType]: {
                link: mediaUrl,
                caption: caption
            }
        };

        return await this.sendMessage(phoneNumberId, accessToken, messageData);
    }

    async sendInteractiveMessage(phoneNumberId, accessToken, to, interactiveData) {
        const messageData = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'interactive',
            interactive: interactiveData
        };

        return await this.sendMessage(phoneNumberId, accessToken, messageData);
    }

    async sendButtonMessage(phoneNumberId, accessToken, to, bodyText, buttons) {
        const interactiveData = {
            type: 'button',
            body: {
                text: bodyText
            },
            action: {
                buttons: buttons
            }
        };

        return await this.sendInteractiveMessage(phoneNumberId, accessToken, to, interactiveData);
    }

    async sendListMessage(phoneNumberId, accessToken, to, bodyText, buttonText, sections) {
        const interactiveData = {
            type: 'list',
            body: {
                text: bodyText
            },
            action: {
                button: buttonText,
                sections: sections
            }
        };

        return await this.sendInteractiveMessage(phoneNumberId, accessToken, to, interactiveData);
    }

    async getMessageStatus(messageId, accessToken) {
        try {
            const url = `${this.baseUrl}/${messageId}`;
            
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return response.data;

        } catch (error) {
            logger.error(`[MetaWhatsAppService] Error getting message status:`, error.response?.data || error.message);
            throw error;
        }
    }

    async getPhoneNumberInfo(phoneNumberId, accessToken) {
        try {
            const url = `${this.baseUrl}/${phoneNumberId}`;
            
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return response.data;

        } catch (error) {
            logger.error(`[MetaWhatsAppService] Error getting phone number info:`, error.response?.data || error.message);
            throw error;
        }
    }

    async getBusinessAccountInfo(businessAccountId, accessToken) {
        try {
            const url = `${this.baseUrl}/${businessAccountId}`;
            
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return response.data;

        } catch (error) {
            logger.error(`[MetaWhatsAppService] Error getting business account info:`, error.response?.data || error.message);
            throw error;
        }
    }

    async getTemplates(businessAccountId, accessToken) {
        try {
            const url = `${this.baseUrl}/${businessAccountId}/message_templates`;
            
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return response.data;

        } catch (error) {
            logger.error(`[MetaWhatsAppService] Error getting templates:`, error.response?.data || error.message);
            throw error;
        }
    }

    async createTemplate(businessAccountId, accessToken, templateData) {
        try {
            const url = `${this.baseUrl}/${businessAccountId}/message_templates`;
            
            const response = await axios.post(url, templateData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;

        } catch (error) {
            logger.error(`[MetaWhatsAppService] Error creating template:`, error.response?.data || error.message);
            throw error;
        }
    }

    async updateTemplate(templateId, accessToken, templateData) {
        try {
            const url = `${this.baseUrl}/${templateId}`;
            
            const response = await axios.post(url, templateData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;

        } catch (error) {
            logger.error(`[MetaWhatsAppService] Error updating template:`, error.response?.data || error.message);
            throw error;
        }
    }

    async deleteTemplate(templateId, accessToken) {
        try {
            const url = `${this.baseUrl}/${templateId}`;
            
            const response = await axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return response.data;

        } catch (error) {
            logger.error(`[MetaWhatsAppService] Error deleting template:`, error.response?.data || error.message);
            throw error;
        }
    }

    async verifyWebhook(mode, token, challenge) {
        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            return challenge;
        }
        throw new Error('Invalid webhook verification');
    }

    async handleWebhook(body) {
        try {
            const { object, entry } = body;

            if (object !== 'whatsapp_business_account') {
                return { success: false, message: 'Invalid webhook object' };
            }

            const results = [];

            for (const webhookEntry of entry) {
                const { changes } = webhookEntry;

                for (const change of changes) {
                    const { value } = change;

                    if (value.messages) {
                        for (const message of value.messages) {
                            const result = await this.processIncomingMessage(message, value);
                            results.push(result);
                        }
                    }

                    if (value.message_statuses) {
                        for (const status of value.message_statuses) {
                            const result = await this.processMessageStatus(status);
                            results.push(result);
                        }
                    }
                }
            }

            return { success: true, results };

        } catch (error) {
            logger.error(`[MetaWhatsAppService] Error handling webhook:`, error);
            throw error;
        }
    }

    async processIncomingMessage(message, webhookValue) {
        const { WhatsAppMessage, WhatsAppConversation } = require('../schemas');
        
        try {
            const messageData = {
                deviceId: webhookValue.metadata.phone_number_id,
                direction: 'inbound',
                messageType: this.getMessageType(message),
                from: message.from,
                to: webhookValue.metadata.phone_number_id,
                content: this.extractMessageContent(message),
                messageId: message.id,
                conversationId: message.from,
                status: 'delivered',
                statusTimestamp: new Date(message.timestamp * 1000)
            };

            // Save message to database
            const savedMessage = await WhatsAppMessage.create(messageData);

            // Update or create conversation
            await this.updateConversation(messageData);

            // Emit event for automation rules
            const eventEmitter = require('../../utils/eventEmitter');
            if (eventEmitter) {
                eventEmitter.emit('whatsapp_message_received', {
                    deviceId: messageData.deviceId,
                    messageId: savedMessage._id,
                    from: messageData.from,
                    content: messageData.content,
                    timestamp: new Date()
                });
            }

            return { success: true, messageId: savedMessage._id };

        } catch (error) {
            logger.error(`[MetaWhatsAppService] Error processing incoming message:`, error);
            return { success: false, error: error.message };
        }
    }

    async processMessageStatus(status) {
        const { WhatsAppMessage } = require('../schemas');
        
        try {
            const update = {
                status: this.getStatusFromMeta(status.status),
                statusTimestamp: new Date(status.timestamp * 1000)
            };

            await WhatsAppMessage.findOneAndUpdate(
                { messageId: status.id },
                update
            );

            return { success: true, messageId: status.id };

        } catch (error) {
            logger.error(`[MetaWhatsAppService] Error processing message status:`, error);
            return { success: false, error: error.message };
        }
    }

    async updateConversation(messageData) {
        const { WhatsAppConversation } = require('../schemas');
        
        try {
            await WhatsAppConversation.findOneAndUpdate(
                { 
                    deviceId: messageData.deviceId,
                    conversationId: messageData.conversationId 
                },
                {
                    $set: {
                        lastMessageAt: new Date(),
                        lastMessageContent: messageData.content.text || 'Media message',
                        lastMessageDirection: messageData.direction,
                        unreadCount: messageData.direction === 'inbound' ? 1 : 0
                    },
                    $inc: { totalMessages: 1 }
                },
                { 
                    upsert: true,
                    new: true 
                }
            );

        } catch (error) {
            logger.error(`[MetaWhatsAppService] Error updating conversation:`, error);
        }
    }

    getMessageType(message) {
        if (message.text) return 'text';
        if (message.image) return 'image';
        if (message.video) return 'video';
        if (message.audio) return 'audio';
        if (message.document) return 'document';
        if (message.location) return 'location';
        if (message.contacts) return 'contact';
        if (message.sticker) return 'sticker';
        if (message.template) return 'template';
        return 'text';
    }

    extractMessageContent(message) {
        const content = {};

        if (message.text) {
            content.text = message.text.body;
        } else if (message.image) {
            content.media = {
                url: message.image.link,
                mimeType: message.image.mime_type,
                fileName: message.image.filename,
                fileSize: message.image.file_size
            };
        } else if (message.video) {
            content.media = {
                url: message.video.link,
                mimeType: message.video.mime_type,
                fileName: message.video.filename,
                fileSize: message.video.file_size
            };
        } else if (message.audio) {
            content.media = {
                url: message.audio.link,
                mimeType: message.audio.mime_type,
                fileName: message.audio.filename,
                fileSize: message.audio.file_size
            };
        } else if (message.document) {
            content.media = {
                url: message.document.link,
                mimeType: message.document.mime_type,
                fileName: message.document.filename,
                fileSize: message.document.file_size
            };
        } else if (message.location) {
            content.location = {
                latitude: message.location.latitude,
                longitude: message.location.longitude,
                name: message.location.name,
                address: message.location.address
            };
        } else if (message.contacts) {
            content.contact = {
                name: message.contacts[0].name?.formatted_name,
                phoneNumber: message.contacts[0].phones?.[0]?.wa_id
            };
        }

        return content;
    }

    getStatusFromMeta(status) {
        switch (status) {
            case 'sent': return 'sent';
            case 'delivered': return 'delivered';
            case 'read': return 'read';
            case 'failed': return 'failed';
            default: return 'pending';
        }
    }
}

module.exports = new MetaWhatsAppService();
