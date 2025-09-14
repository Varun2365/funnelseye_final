const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queues = {
            MESSAGE_QUEUE: 'whatsapp_messages',
            STATUS_QUEUE: 'whatsapp_status',
            QR_QUEUE: 'whatsapp_qr',
            RESPONSE_QUEUE: 'whatsapp_responses'
        };
        this.callbacks = new Map();
        this.isConnected = false;
    }

    async connect() {
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
            console.log(`[RabbitMQ] Connecting to ${rabbitmqUrl}`);
            
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();
            
            // Declare queues
            await this.declareQueues();
            
            // Setup response queue for RPC calls
            await this.setupResponseQueue();
            
            this.isConnected = true;
            console.log('[RabbitMQ] ✅ Connected successfully');
            
            // Handle connection close
            this.connection.on('close', () => {
                console.log('[RabbitMQ] Connection closed, attempting to reconnect...');
                this.isConnected = false;
                setTimeout(() => this.connect(), 5000);
            });
            
            this.connection.on('error', (error) => {
                console.error('[RabbitMQ] Connection error:', error);
                this.isConnected = false;
            });
            
        } catch (error) {
            console.error('[RabbitMQ] Connection failed:', error);
            this.isConnected = false;
            // Retry connection after 5 seconds
            setTimeout(() => this.connect(), 5000);
        }
    }

    async declareQueues() {
        const queues = Object.values(this.queues);
        
        for (const queueName of queues) {
            await this.channel.assertQueue(queueName, {
                durable: true,
                persistent: true
            });
            console.log(`[RabbitMQ] Queue declared: ${queueName}`);
        }
    }

    async setupResponseQueue() {
        const responseQueue = await this.channel.assertQueue('', {
            exclusive: true,
            autoDelete: true
        });
        
        this.responseQueueName = responseQueue.queue;
        
        await this.channel.consume(this.responseQueueName, (msg) => {
            if (msg) {
                const correlationId = msg.properties.correlationId;
                const callback = this.callbacks.get(correlationId);
                
                if (callback) {
                    callback(JSON.parse(msg.content.toString()));
                    this.callbacks.delete(correlationId);
                }
                
                this.channel.ack(msg);
            }
        });
    }

    async publishMessage(queueName, message, options = {}) {
        if (!this.isConnected) {
            throw new Error('RabbitMQ not connected');
        }

        try {
            const messageBuffer = Buffer.from(JSON.stringify(message));
            
            await this.channel.sendToQueue(queueName, messageBuffer, {
                persistent: true,
                timestamp: Date.now(),
                ...options
            });
            
            console.log(`[RabbitMQ] Message published to ${queueName}:`, message.type || 'message');
            return true;
            
        } catch (error) {
            console.error(`[RabbitMQ] Failed to publish to ${queueName}:`, error);
            throw error;
        }
    }

    async publishRPC(queueName, message, timeout = 10000) {
        if (!this.isConnected) {
            throw new Error('RabbitMQ not connected');
        }

        return new Promise((resolve, reject) => {
            const correlationId = uuidv4();
            const timer = setTimeout(() => {
                this.callbacks.delete(correlationId);
                console.log(`[RabbitMQ] RPC timeout for ${queueName}, correlationId: ${correlationId}`);
                reject(new Error('RPC timeout - no response received'));
            }, timeout);

            this.callbacks.set(correlationId, (response) => {
                clearTimeout(timer);
                resolve(response);
            });

            try {
                const messageBuffer = Buffer.from(JSON.stringify(message));
                
                this.channel.sendToQueue(queueName, messageBuffer, {
                    persistent: true,
                    correlationId,
                    replyTo: this.responseQueueName,
                    timestamp: Date.now()
                });
                
                console.log(`[RabbitMQ] RPC request sent to ${queueName}:`, message.type || 'request', 'correlationId:', correlationId);
                
            } catch (error) {
                clearTimeout(timer);
                this.callbacks.delete(correlationId);
                console.error(`[RabbitMQ] Error sending RPC request:`, error);
                reject(error);
            }
        });
    }

    async consumeMessages(queueName, callback) {
        if (!this.isConnected) {
            throw new Error('RabbitMQ not connected');
        }

        try {
            await this.channel.consume(queueName, async (msg) => {
                if (msg) {
                    try {
                        const message = JSON.parse(msg.content.toString());
                        await callback(message, msg);
                        this.channel.ack(msg);
                    } catch (error) {
                        console.error(`[RabbitMQ] Error processing message from ${queueName}:`, error);
                        this.channel.nack(msg, false, false); // Reject and don't requeue
                    }
                }
            });
            
            console.log(`[RabbitMQ] Started consuming from ${queueName}`);
            
        } catch (error) {
            console.error(`[RabbitMQ] Failed to consume from ${queueName}:`, error);
            throw error;
        }
    }

    // Specific methods for WhatsApp operations
    async publishMessageRequest(deviceId, to, message, type = 'text') {
        return await this.publishRPC(this.queues.MESSAGE_QUEUE, {
            type: 'send_message',
            deviceId,
            to,
            message,
            messageType: type,
            timestamp: Date.now()
        });
    }

    // Removed unused methods - RabbitMQ only used for messaging now

    // Batch operations for scalability
    async publishBatchMessages(messages) {
        const batchPromises = messages.map(msg => 
            this.publishMessage(this.queues.MESSAGE_QUEUE, {
                type: 'send_message',
                ...msg,
                timestamp: Date.now()
            })
        );
        
        return await Promise.allSettled(batchPromises);
    }

    async getConnectionStatus() {
        return {
            connected: this.isConnected,
            queues: Object.keys(this.queues),
            pendingCallbacks: this.callbacks.size
        };
    }

    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.isConnected = false;
            console.log('[RabbitMQ] Connection closed');
        } catch (error) {
            console.error('[RabbitMQ] Error closing connection:', error);
        }
    }
}

module.exports = new RabbitMQService();
