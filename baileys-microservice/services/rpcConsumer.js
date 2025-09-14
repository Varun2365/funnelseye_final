const rabbitmqService = require('./rabbitmqService');
const baileysService = require('./baileysService');

class RPCConsumer {
    constructor() {
        this.isConsuming = false;
    }

    async startConsuming() {
        if (this.isConsuming) {
            console.log('[RPCConsumer] Already consuming messages');
            return;
        }

        try {
            console.log('[RPCConsumer] Starting RPC consumers...');
            
            // Only consume message queue (RabbitMQ only for messaging)
            await rabbitmqService.consumeMessages('whatsapp_messages', async (message, msg) => {
                await this.handleMessageRequest(message, msg);
            });

            this.isConsuming = true;
            console.log('[RPCConsumer] ✅ RPC consumers started successfully (messages only)');

        } catch (error) {
            console.error('[RPCConsumer] Error starting consumers:', error);
            throw error;
        }
    }

    async handleMessageRequest(message, msg) {
        try {
            const { type, deviceId, messages, correlationId } = message;
            console.log(`[RPCConsumer] Handling message request: ${type} for device ${deviceId}, correlationId: ${correlationId}`);

            let result;

            switch (type) {
                case 'send_message':
                    result = await baileysService.sendMessage(deviceId, messages);
                    break;
                
                case 'batch_messages':
                    result = await baileysService.sendBatchMessages(deviceId, messages);
                    break;
                
                default:
                    result = { success: false, message: 'Unknown message request type' };
            }

            // Send response back
            await this.sendResponse(correlationId, result);

        } catch (error) {
            console.error('[RPCConsumer] Error handling message request:', error);
            const errorResponse = {
                success: false,
                message: 'Error processing message request',
                error: error.message
            };
            await this.sendResponse(message.correlationId, errorResponse);
        }
    }

    async sendResponse(correlationId, result) {
        try {
            if (!correlationId) {
                console.log('[RPCConsumer] No correlation ID, skipping response');
                return;
            }

            if (!rabbitmqService.channel) {
                console.log('[RPCConsumer] No RabbitMQ channel available, skipping response');
                return;
            }

            if (!rabbitmqService.responseQueueName) {
                console.log('[RPCConsumer] No response queue name available, skipping response');
                return;
            }

            const responseBuffer = Buffer.from(JSON.stringify(result));
            
            await rabbitmqService.channel.sendToQueue(
                rabbitmqService.responseQueueName,
                responseBuffer,
                {
                    correlationId,
                    persistent: true
                }
            );

            console.log(`[RPCConsumer] Response sent for correlationId: ${correlationId}`);

        } catch (error) {
            console.error('[RPCConsumer] Error sending response:', error);
        }
    }

    async stopConsuming() {
        this.isConsuming = false;
        console.log('[RPCConsumer] Stopped consuming messages');
    }
}

module.exports = new RPCConsumer();