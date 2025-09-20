/**
 * Centralized API Configuration for Staff Dashboard
 * This file manages all API endpoints and base URLs for the staff dashboard
 * 
 * Usage:
 * - For development: Set BASE_URL to 'http://localhost:8080'
 * - For production: Set BASE_URL to 'https://api.funnelseye.com'
 */

import environmentConfig from './environment.js';

class StaffApiConfig {
    constructor() {
        this.environment = environmentConfig.ENVIRONMENT;
        this.baseUrl = environmentConfig.API_BASE_URL;
        this.apiBaseUrl = environmentConfig.API_ENDPOINT;
        
        console.log(`🌍 [StaffApiConfig] Environment: ${this.environment}`);
        console.log(`🔗 [StaffApiConfig] Base URL: ${this.baseUrl}`);
        console.log(`📡 [StaffApiConfig] API Base URL: ${this.apiBaseUrl}`);
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
        console.log(`🔄 [StaffApiConfig] Base URL updated to: ${this.baseUrl}`);
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
const staffApiConfig = new StaffApiConfig();

// Export both the class and instance
export default staffApiConfig;
export { StaffApiConfig };

// For backward compatibility, also export as window global
if (typeof window !== 'undefined') {
    window.StaffApiConfig = staffApiConfig;
}
