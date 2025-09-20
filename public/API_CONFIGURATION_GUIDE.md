# API Configuration Guide

This guide explains how to manage API URLs across different environments in the admin panel and staff dashboard.

## 🎯 Quick Setup

### For Development (localhost:8080)
No changes needed! The system automatically detects localhost and uses `http://localhost:8080`.

### For Production (api.funnelseye.com)
The system automatically detects production environment and uses `https://api.funnelseye.com`.

## 📁 Configuration Files

### Main Admin Panel
- **Environment Config**: `public/src/config/environment.js`
- **API Config**: `public/src/config/apiConfig.js`

### Staff Dashboard
- **Environment Config**: `public/staff-dashboard/src/config/environment.js`
- **API Config**: `public/staff-dashboard/src/config/apiConfig.js`

## 🔧 How to Change API URL

### Method 1: Automatic Environment Detection (Recommended)
The system automatically detects the environment based on the hostname:

- `localhost` or `127.0.0.1` → Development (`http://localhost:8080`)
- Contains `staging` or `test` → Staging (`https://staging-api.funnelseye.com`)
- Everything else → Production (`https://api.funnelseye.com`)

### Method 2: Manual Override (For Testing)
You can manually override the API URL in the browser console:

```javascript
// For Admin Panel
window.setApiUrl("http://localhost:8080");
window.setApiUrl("https://api.funnelseye.com");

// For Staff Dashboard
window.setStaffApiUrl("http://localhost:8080");
window.setStaffApiUrl("https://api.funnelseye.com");
```

### Method 3: Global Variable Override
Set a global variable before the page loads:

```javascript
// Set this before loading the page
window.MANUAL_API_URL = "http://localhost:8080";
```

## 🚀 Usage in Code

### Admin Panel
```javascript
import apiConfig from '../config/apiConfig.js';

// Get API URL for an endpoint
const url = apiConfig.getApiUrl('/admin/users');

// Get WebSocket URL
const wsUrl = apiConfig.getWebSocketUrl();

// Get upload URL
const uploadUrl = apiConfig.getUploadUrl();
```

### Staff Dashboard
```javascript
import staffApiConfig from '../config/apiConfig.js';

// Get API URL for an endpoint
const url = staffApiConfig.getApiUrl('/staff/dashboard');

// Get WebSocket URL
const wsUrl = staffApiConfig.getWebSocketUrl();
```

## 🔄 Migration from Hardcoded URLs

All hardcoded URLs have been replaced with centralized configuration:

### Before:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
const response = await fetch(`${API_BASE_URL}/admin/users`);
```

### After:
```javascript
import apiConfig from '../config/apiConfig.js';
const response = await fetch(apiConfig.getApiUrl('/admin/users'));
```

## 📊 Environment Detection

The system logs the detected environment and API URL:

```
🌍 [Config] Detected environment: development
🔗 [Config] Using development API URL: http://localhost:8080
📡 [Config] API Base URL: http://localhost:8080/api
```

## 🛠️ Troubleshooting

### Check Current Configuration
```javascript
// Admin Panel
console.log(window.API_CONFIG);

// Staff Dashboard
console.log(window.STAFF_API_CONFIG);
```

### Force Environment
```javascript
// Force development
window.MANUAL_API_URL = "http://localhost:8080";

// Force production
window.MANUAL_API_URL = "https://api.funnelseye.com";
```

## 📝 Files Updated

The following files have been updated to use centralized configuration:

### Admin Panel:
- `public/src/services/adminApiService.js`
- `public/src/contexts/AuthContext.jsx`

### Staff Dashboard:
- `public/staff-dashboard/src/services/apiService.js`

### New Configuration Files:
- `public/src/config/environment.js`
- `public/src/config/apiConfig.js`
- `public/staff-dashboard/src/config/environment.js`
- `public/staff-dashboard/src/config/apiConfig.js`

## ✅ Benefits

1. **Single Point of Control**: Change API URL in one place
2. **Environment Detection**: Automatic environment-based configuration
3. **Easy Testing**: Manual override for testing different environments
4. **Consistent URLs**: All API calls use the same base URL
5. **Future-Proof**: Easy to add new environments or change URLs
