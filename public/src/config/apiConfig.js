/**
 * Centralized API Configuration
 * This file manages all API endpoints and base URLs for the application
 * 
 * Usage:
 * - For development: Set BASE_URL to 'http://localhost:8080'
 * - For production: Set BASE_URL to 'https://api.funnelseye.com'
 */

import environmentConfig from './environment.js';

class ApiConfig {
    constructor() {
        this.environment = environmentConfig.ENVIRONMENT;
        this.baseUrl = environmentConfig.API_BASE_URL;
        this.apiBaseUrl = environmentConfig.API_ENDPOINT;
        
        console.log(`🌍 [ApiConfig] Environment: ${this.environment}`);
        console.log(`🔗 [ApiConfig] Base URL: ${this.baseUrl}`);
        console.log(`📡 [ApiConfig] API Base URL: ${this.apiBaseUrl}`);
    }

    /**
     * Get the full API URL for an endpoint
     */
    getApiUrl(endpoint) {
        return environmentConfig.getApiUrl(endpoint);
    }

    /**
     * Get WebSocket URL
     */
    getWebSocketUrl() {
        return environmentConfig.getWebSocketUrl();
    }

    /**
     * Get file upload URL
     */
    getUploadUrl() {
        return environmentConfig.getUploadUrl();
    }

    /**
     * Get static assets URL
     */
    getAssetsUrl() {
        return `${this.baseUrl}/public`;
    }

    /**
     * Update base URL dynamically (useful for testing)
     */
    setBaseUrl(newBaseUrl) {
        environmentConfig.setApiUrl(newBaseUrl);
        this.baseUrl = environmentConfig.API_BASE_URL;
        this.apiBaseUrl = environmentConfig.API_ENDPOINT;
        console.log(`🔄 [ApiConfig] Base URL updated to: ${this.baseUrl}`);
    }

    /**
     * Get all configuration as an object
     */
    getConfig() {
        return {
            environment: this.environment,
            baseUrl: this.baseUrl,
            apiBaseUrl: this.apiBaseUrl,
            webSocketUrl: this.getWebSocketUrl(),
            uploadUrl: this.getUploadUrl(),
            assetsUrl: this.getAssetsUrl()
        };
    }
}

// Create singleton instance
const apiConfig = new ApiConfig();

// Export both the class and instance
export default apiConfig;
export { ApiConfig };

// For backward compatibility, also export as window global
if (typeof window !== 'undefined') {
    window.ApiConfig = apiConfig;
}
