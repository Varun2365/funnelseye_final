const newBaileysService = require('./newBaileysWhatsAppService');
const metaService = require('./metaWhatsAppService');
const { WhatsAppDevice, WhatsAppMessage, WhatsAppConversation } = require('../schemas');
const logger = require('../../utils/logger');

class UnifiedWhatsAppService {
    constructor() {
        this.activeDevices = new Map();
    }

    async initializeDevice(deviceId) {
        try {
            const device = await WhatsAppDevice.findById(deviceId);
            if (!device) {
                throw new Error('Device not found');
            }

            if (device.deviceType === 'baileys') {
                return await this.initializeBaileysDevice(device);
            } else if (device.deviceType === 'meta') {
                return await this.initializeMetaDevice(device);
            } else {
                throw new Error('Invalid device type');
            }

        } catch (error) {
            logger.error(`[UnifiedWhatsAppService] Error initializing device ${deviceId}:`, error);
            throw error;
        }
    }

    async initializeBaileysDevice(device) {
        try {
            const sessionId = device.sessionId || `session_${device._id}`;
            
            // Update device with session ID if not set
            if (!device.sessionId) {
                await WhatsAppDevice.findByIdAndUpdate(device._id, { sessionId });
            }

            const result = await newBaileysService.initializeDevice(device._id.toString(), coachId);
            
            if (result.success) {
                this.activeDevices.set(device._id.toString(), {
                    device,
                    service: 'baileys',
                    status: 'initializing'
                });
            }

            return result;

        } catch (error) {
            logger.error(`[UnifiedWhatsAppService] Error initializing Baileys device:`, error);
            throw error;
        }
    }

    async initializeMetaDevice(device) {
        try {
            // For Meta devices, we just need to verify the credentials
            const phoneInfo = await metaService.getPhoneNumberInfo(
                device.phoneNumberId,
                device.accessToken
            );

            this.activeDevices.set(device._id.toString(), {
                device,
                service: 'meta',
                status: 'connected'
            });

            return {
                success: true,
                message: 'Meta device initialized successfully',
                deviceId: device._id.toString(),
                phoneInfo
            };

        } catch (error) {
            logger.error(`[UnifiedWhatsAppService] Error initializing Meta device:`, error);
            throw error;
        }
    }

    async sendMessage(deviceId, to, content, options = {}) {
        try {
            const device = await WhatsAppDevice.findById(deviceId);
            if (!device) {
                throw new Error('Device not found');
            }

            if (!device.isActive) {
                throw new Error('Device is not active');
            }

            // Check credits
            const coach = await this.getCoach(device.coachId);
            const requiredCredits = device.creditsPerMessage;
            
            if (coach.credits < requiredCredits) {
                throw new Error('Insufficient credits');
            }

            let result;

            if (device.deviceType === 'baileys') {
                result = await newBaileysService.sendMessage(deviceId, { to, message: content, type: options.type || 'text' });
            } else if (device.deviceType === 'meta') {
                result = await this.sendMetaMessage(device, to, content, options);
            } else {
                throw new Error('Invalid device type');
            }

            if (result.success) {
                // Deduct credits
                await this.deductCredits(device.coachId, requiredCredits);
                
                // Update device message count
                await WhatsAppDevice.findByIdAndUpdate(deviceId, {
                    $inc: { messagesSentThisMonth: 1 }
                });

                // Save message to database
                await this.saveMessage(deviceId, to, content, result.messageId, 'outbound');
            }

            return result;

        } catch (error) {
            logger.error(`[UnifiedWhatsAppService] Error sending message:`, error);
            throw error;
        }
    }

    async sendMetaMessage(device, to, content, options = {}) {
        try {
            if (content.text) {
                return await metaService.sendTextMessage(
                    device.phoneNumberId,
                    device.accessToken,
                    to,
                    content.text
                );
            } else if (content.media) {
                return await metaService.sendMediaMessage(
                    device.phoneNumberId,
                    device.accessToken,
                    to,
                    content.media.type || 'image',
                    content.media.url,
                    content.media.caption
                );
            } else if (content.template) {
                return await metaService.sendTemplateMessage(
                    device.phoneNumberId,
                    device.accessToken,
                    to,
                    content.template.name,
                    content.template.language,
                    content.template.components
                );
            } else {
                throw new Error('Invalid message content');
            }

        } catch (error) {
            logger.error(`[UnifiedWhatsAppService] Error sending Meta message:`, error);
            throw error;
        }
    }

    async saveMessage(deviceId, to, content, messageId, direction) {
        try {
            const device = await WhatsAppDevice.findById(deviceId);
            if (!device) return;

            const messageData = {
                coachId: device.coachId,
                deviceId,
                direction,
                messageType: this.getMessageType(content),
                from: direction === 'outbound' ? device.phoneNumber : to,
                to: direction === 'outbound' ? to : device.phoneNumber,
                content,
                messageId,
                conversationId: to,
                status: 'sent',
                statusTimestamp: new Date(),
                creditsUsed: device.creditsPerMessage
            };

            await WhatsAppMessage.create(messageData);
            await this.updateConversation(deviceId, messageData);

        } catch (error) {
            logger.error(`[UnifiedWhatsAppService] Error saving message:`, error);
        }
    }

    getMessageType(content) {
        if (content.text) return 'text';
        if (content.media) return content.media.type || 'image';
        if (content.template) return 'template';
        if (content.location) return 'location';
        if (content.contact) return 'contact';
        return 'text';
    }

    async updateConversation(deviceId, messageData) {
        try {
            await WhatsAppConversation.findOneAndUpdate(
                { 
                    deviceId,
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
            logger.error(`[UnifiedWhatsAppService] Error updating conversation:`, error);
        }
    }

    async getQRCode(deviceId) {
        try {
            const device = await WhatsAppDevice.findById(deviceId);
            if (!device || device.deviceType !== 'baileys') {
                throw new Error('Device not found or not a Baileys device');
            }

            return newBaileysService.getQRCode(deviceId);

        } catch (error) {
            logger.error(`[UnifiedWhatsAppService] Error getting QR code:`, error);
            throw error;
        }
    }

    async getConnectionStatus(deviceId) {
        try {
            const device = await WhatsAppDevice.findById(deviceId);
            if (!device) {
                throw new Error('Device not found');
            }

            if (device.deviceType === 'baileys') {
                return newBaileysService.getConnectionStatus(deviceId);
            } else if (device.deviceType === 'meta') {
                // For Meta devices, we assume they're always connected if credentials are valid
                return 'connected';
            }

        } catch (error) {
            logger.error(`[UnifiedWhatsAppService] Error getting connection status:`, error);
            throw error;
        }
    }

    async disconnectDevice(deviceId) {
        try {
            const device = await WhatsAppDevice.findById(deviceId);
            if (!device) {
                throw new Error('Device not found');
            }

            if (device.deviceType === 'baileys') {
                await newBaileysService.disconnectDevice(deviceId);
            }

            this.activeDevices.delete(deviceId);
            
            await WhatsAppDevice.findByIdAndUpdate(deviceId, {
                isConnected: false,
                lastConnected: new Date()
            });

            return { success: true, message: 'Device disconnected successfully' };

        } catch (error) {
            logger.error(`[UnifiedWhatsAppService] Error disconnecting device:`, error);
            throw error;
        }
    }

    async deleteDevice(deviceId) {
        try {
            const device = await WhatsAppDevice.findById(deviceId);
            if (!device) {
                throw new Error('Device not found');
            }

            if (device.deviceType === 'baileys') {
                // Session cleanup is handled by disconnectDevice
            }

            this.activeDevices.delete(deviceId);
            await WhatsAppDevice.findByIdAndDelete(deviceId);

            return { success: true, message: 'Device deleted successfully' };

        } catch (error) {
            logger.error(`[UnifiedWhatsAppService] Error deleting device:`, error);
            throw error;
        }
    }

    async getCoach(coachId) {
        const Coach = require('../../schema/coachSchema');
        return await Coach.findById(coachId).select('credits');
    }

    async deductCredits(coachId, amount) {
        const Coach = require('../../schema/coachSchema');
        await Coach.findByIdAndUpdate(coachId, {
            $inc: { credits: -amount }
        });
    }

    async getConversations(deviceId, options = {}) {
        try {
            const { page = 1, limit = 20, status = 'active' } = options;
            const skip = (page - 1) * limit;

            const query = { deviceId };
            if (status !== 'all') {
                query.status = status;
            }

            const conversations = await WhatsAppConversation.find(query)
                .sort({ lastMessageAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('leadId', 'name email phone');

            const total = await WhatsAppConversation.countDocuments(query);

            return {
                conversations,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            logger.error(`[UnifiedWhatsAppService] Error getting conversations:`, error);
            throw error;
        }
    }

    async getMessages(conversationId, options = {}) {
        try {
            const { page = 1, limit = 50 } = options;
            const skip = (page - 1) * limit;

            const messages = await WhatsAppMessage.find({ conversationId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await WhatsAppMessage.countDocuments({ conversationId });

            return {
                messages: messages.reverse(), // Show oldest first
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            logger.error(`[UnifiedWhatsAppService] Error getting messages:`, error);
            throw error;
        }
    }

    async markConversationAsRead(conversationId) {
        try {
            await WhatsAppConversation.findOneAndUpdate(
                { conversationId },
                { unreadCount: 0 }
            );

            return { success: true, message: 'Conversation marked as read' };

        } catch (error) {
            logger.error(`[UnifiedWhatsAppService] Error marking conversation as read:`, error);
            throw error;
        }
    }

    async getDeviceStats(deviceId) {
        try {
            const device = await WhatsAppDevice.findById(deviceId);
            if (!device) {
                throw new Error('Device not found');
            }

            const stats = await WhatsAppMessage.aggregate([
                { $match: { deviceId: device._id } },
                {
                    $group: {
                        _id: null,
                        totalMessages: { $sum: 1 },
                        sentMessages: { $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] } },
                        receivedMessages: { $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] } },
                        totalCreditsUsed: { $sum: '$creditsUsed' }
                    }
                }
            ]);

            return {
                device,
                stats: stats[0] || {
                    totalMessages: 0,
                    sentMessages: 0,
                    receivedMessages: 0,
                    totalCreditsUsed: 0
                }
            };

        } catch (error) {
            logger.error(`[UnifiedWhatsAppService] Error getting device stats:`, error);
            throw error;
        }
    }
}

module.exports = new UnifiedWhatsAppService();
