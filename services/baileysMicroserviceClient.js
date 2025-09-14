const axios = require('axios');

class BaileysMicroserviceClient {
    constructor() {
        this.baseURL = process.env.BAILEYS_MICROSERVICE_URL || 'http://localhost:4444';
        this.timeout = 30000; // 30 seconds timeout
        
        console.log(`[BaileysMicroserviceClient] Initialized with base URL: ${this.baseURL}`);
    }

    async makeRequest(method, endpoint, data = null, params = null) {
        try {
            const config = {
                method,
                url: `${this.baseURL}${endpoint}`,
                timeout: this.timeout,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (data) {
                config.data = data;
            }

            if (params) {
                config.params = params;
            }

            console.log(`[BaileysMicroserviceClient] ${method.toUpperCase()} ${endpoint}`);
            
            const response = await axios(config);
            
            console.log(`[BaileysMicroserviceClient] Response: ${response.status} ${response.statusText}`);
            
            return response.data;
            
        } catch (error) {
            console.error(`[BaileysMicroserviceClient] Error:`, {
                method,
                endpoint,
                error: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            
            if (error.response) {
                throw new Error(`Microservice error: ${error.response.data.message || error.message}`);
            } else if (error.request) {
                throw new Error('Microservice unavailable - connection failed');
            } else {
                throw new Error(`Microservice error: ${error.message}`);
            }
        }
    }

    // Initialize Baileys device
    async initializeDevice(deviceId, coachId) {
        return await this.makeRequest('POST', `/api/baileys/initialize/${deviceId}`, {
            coachId
        });
    }

    // Get QR code
    async getQRCode(deviceId) {
        return await this.makeRequest('GET', `/api/baileys/qr/${deviceId}`);
    }

    // Get connection status
    async getConnectionStatus(deviceId) {
        return await this.makeRequest('GET', `/api/baileys/status/${deviceId}`);
    }

    // Send message
    async sendMessage(deviceId, to, message, type = 'text') {
        return await this.makeRequest('POST', `/api/baileys/send/${deviceId}`, {
            to,
            message,
            type
        });
    }

    // Force QR generation
    async forceQRGeneration(deviceId) {
        return await this.makeRequest('POST', `/api/baileys/force-qr/${deviceId}`);
    }

    // Disconnect device
    async disconnectDevice(deviceId) {
        return await this.makeRequest('POST', `/api/baileys/disconnect/${deviceId}`);
    }

    // Get inbox messages
    async getInbox(deviceId, limit = 50, offset = 0) {
        return await this.makeRequest('GET', `/api/baileys/inbox/${deviceId}`, null, {
            limit,
            offset
        });
    }

    // Health check
    async healthCheck() {
        try {
            return await this.makeRequest('GET', '/health');
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }
}

module.exports = new BaileysMicroserviceClient();
