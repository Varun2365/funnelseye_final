const amqp = require('amqplib');
const logger = require('../utils/logger');

class MessageQueueService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queues = {
            whatsapp: 'whatsapp_messages',
            email: 'email_messages',
            bulk: 'bulk_messages',
            scheduled: 'scheduled_messages'
        };
        this.isConnected = false;
    }

    // Initialize RabbitMQ connection
    async initialize() {
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
            
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();
            
            // Declare queues
            await this.declareQueues();
            
            // Setup error handling
            this.connection.on('error', (err) => {
                logger.error('[MESSAGE_QUEUE] Connection error:', err);
                this.isConnected = false;
            });
            
            this.connection.on('close', () => {
                logger.warn('[MESSAGE_QUEUE] Connection closed');
                this.isConnected = false;
            });
            
            this.isConnected = true;
            logger.info('[MESSAGE_QUEUE] Successfully connected to RabbitMQ');
            
            return true;
        } catch (error) {
            logger.error('[MESSAGE_QUEUE] Failed to initialize:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Declare all required queues
    async declareQueues() {
        const queueOptions = {
            durable: true,
            arguments: {
                'x-message-ttl': 86400000, // 24 hours TTL
                'x-max-retries': 3
            }
        };

        for (const [name, queueName] of Object.entries(this.queues)) {
            await this.channel.assertQueue(queueName, queueOptions);
            logger.info(`[MESSAGE_QUEUE] Queue declared: ${queueName}`);
        }
    }

    // Send message to queue
    async sendMessage(queueName, message, options = {}) {
        try {
            if (!this.isConnected) {
                await this.initialize();
            }

            const messageBuffer = Buffer.from(JSON.stringify(message));
            const publishOptions = {
                persistent: true,
                timestamp: Date.now(),
                ...options
            };

            const success = this.channel.sendToQueue(queueName, messageBuffer, publishOptions);
            
            if (success) {
                logger.info(`[MESSAGE_QUEUE] Message sent to ${queueName}:`, message.type);
                return true;
            } else {
                logger.error(`[MESSAGE_QUEUE] Failed to send message to ${queueName}`);
                return false;
            }
        } catch (error) {
            logger.error(`[MESSAGE_QUEUE] Error sending message:`, error);
            return false;
        }
    }

    // Send WhatsApp message
    async sendWhatsAppMessage(messageData) {
        const message = {
            type: 'whatsapp',
            data: messageData,
            timestamp: new Date(),
            retries: 0
        };

        return await this.sendMessage(this.queues.whatsapp, message);
    }

    // Send email message
    async sendEmailMessage(messageData) {
        const message = {
            type: 'email',
            data: messageData,
            timestamp: new Date(),
            retries: 0
        };

        return await this.sendMessage(this.queues.email, message);
    }

    // Send bulk messages
    async sendBulkMessages(bulkData) {
        const message = {
            type: 'bulk',
            data: bulkData,
            timestamp: new Date(),
            retries: 0
        };

        return await this.sendMessage(this.queues.bulk, message);
    }

    // Schedule message for later delivery
    async scheduleMessage(messageData, delayMs) {
        const message = {
            type: 'scheduled',
            data: messageData,
            scheduledFor: new Date(Date.now() + delayMs),
            timestamp: new Date(),
            retries: 0
        };

        return await this.sendMessage(this.queues.scheduled, message, {
            expiration: delayMs.toString()
        });
    }

    // Consume messages from queue
    async consumeMessages(queueName, callback, options = {}) {
        try {
            if (!this.isConnected) {
                await this.initialize();
            }

            const consumeOptions = {
                noAck: false,
                ...options
            };

            await this.channel.consume(queueName, async (msg) => {
                if (msg) {
                    try {
                        const message = JSON.parse(msg.content.toString());
                        await callback(message, msg);
                    } catch (error) {
                        logger.error(`[MESSAGE_QUEUE] Error processing message:`, error);
                        this.channel.nack(msg, false, false); // Reject and don't requeue
                    }
                }
            }, consumeOptions);

            logger.info(`[MESSAGE_QUEUE] Started consuming from ${queueName}`);
        } catch (error) {
            logger.error(`[MESSAGE_QUEUE] Error setting up consumer:`, error);
        }
    }

    // Setup message processors
    async setupProcessors() {
        // WhatsApp message processor
        await this.consumeMessages(this.queues.whatsapp, async (message, msg) => {
            try {
                await this.processWhatsAppMessage(message.data);
                this.channel.ack(msg);
            } catch (error) {
                logger.error('[MESSAGE_QUEUE] WhatsApp message processing failed:', error);
                this.handleMessageError(message, msg, error);
            }
        });

        // Email message processor
        await this.consumeMessages(this.queues.email, async (message, msg) => {
            try {
                await this.processEmailMessage(message.data);
                this.channel.ack(msg);
            } catch (error) {
                logger.error('[MESSAGE_QUEUE] Email message processing failed:', error);
                this.handleMessageError(message, msg, error);
            }
        });

        // Bulk message processor
        await this.consumeMessages(this.queues.bulk, async (message, msg) => {
            try {
                await this.processBulkMessages(message.data);
                this.channel.ack(msg);
            } catch (error) {
                logger.error('[MESSAGE_QUEUE] Bulk message processing failed:', error);
                this.handleMessageError(message, msg, error);
            }
        });

        // Scheduled message processor
        await this.consumeMessages(this.queues.scheduled, async (message, msg) => {
            try {
                await this.processScheduledMessage(message.data);
                this.channel.ack(msg);
            } catch (error) {
                logger.error('[MESSAGE_QUEUE] Scheduled message processing failed:', error);
                this.handleMessageError(message, msg, error);
            }
        });
    }

    // Process WhatsApp message
    async processWhatsAppMessage(messageData) {
        const centralWhatsAppService = require('./centralWhatsAppService');
        
        if (messageData.templateName) {
            await centralWhatsAppService.sendTemplateMessage(
                messageData.to,
                messageData.templateName,
                messageData.language || 'en_US',
                messageData.parameters || [],
                messageData.coachId
            );
        } else if (messageData.mediaUrl) {
            await centralWhatsAppService.sendMediaMessage(
                messageData.to,
                messageData.mediaType || 'image',
                messageData.mediaUrl,
                messageData.caption,
                messageData.coachId
            );
        } else {
            await centralWhatsAppService.sendTextMessage(
                messageData.to,
                messageData.text,
                messageData.coachId
            );
        }

        logger.info(`[MESSAGE_QUEUE] WhatsApp message processed: ${messageData.to}`);
    }

    // Process email message
    async processEmailMessage(messageData) {
        const emailConfigService = require('./emailConfigService');
        
        await emailConfigService.sendEmail(
            messageData.to,
            messageData.subject,
            messageData.body,
            messageData.coachId
        );

        logger.info(`[MESSAGE_QUEUE] Email message processed: ${messageData.to}`);
    }

    // Process bulk messages
    async processBulkMessages(bulkData) {
        const centralWhatsAppService = require('./centralWhatsAppService');
        
        await centralWhatsAppService.sendBulkMessages(
            bulkData.contacts,
            bulkData.message,
            bulkData.templateName,
            bulkData.parameters,
            bulkData.mediaUrl,
            bulkData.mediaType
        );

        logger.info(`[MESSAGE_QUEUE] Bulk messages processed: ${bulkData.contacts.length} contacts`);
    }

    // Process scheduled message
    async processScheduledMessage(messageData) {
        // Check if it's time to send
        if (new Date() >= new Date(messageData.scheduledFor)) {
            if (messageData.type === 'whatsapp') {
                await this.processWhatsAppMessage(messageData);
            } else if (messageData.type === 'email') {
                await this.processEmailMessage(messageData);
            }
        } else {
            // Re-schedule for later
            const delayMs = new Date(messageData.scheduledFor) - new Date();
            await this.scheduleMessage(messageData, delayMs);
        }
    }

    // Handle message processing errors
    handleMessageError(message, msg, error) {
        message.retries = (message.retries || 0) + 1;
        
        if (message.retries < 3) {
            // Requeue with delay
            setTimeout(() => {
                this.channel.nack(msg, false, true);
            }, Math.pow(2, message.retries) * 1000); // Exponential backoff
        } else {
            // Dead letter queue or log error
            logger.error(`[MESSAGE_QUEUE] Message failed after ${message.retries} retries:`, error);
            this.channel.nack(msg, false, false);
        }
    }

    // Get queue statistics
    async getQueueStats() {
        try {
            const stats = {};
            
            for (const [name, queueName] of Object.entries(this.queues)) {
                const queueInfo = await this.channel.checkQueue(queueName);
                stats[name] = {
                    name: queueName,
                    messageCount: queueInfo.messageCount,
                    consumerCount: queueInfo.consumerCount
                };
            }
            
            return stats;
        } catch (error) {
            logger.error('[MESSAGE_QUEUE] Error getting queue stats:', error);
            return null;
        }
    }

    // Close connection
    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.isConnected = false;
            logger.info('[MESSAGE_QUEUE] Connection closed');
        } catch (error) {
            logger.error('[MESSAGE_QUEUE] Error closing connection:', error);
        }
    }
}

module.exports = new MessageQueueService();
