# Configuration Guide

## CORS Configuration (`cors.js`)

The `cors.js` file contains a **unified and consolidated CORS configuration** that manages all CORS settings in one place. This eliminates scattered CORS configurations across the codebase.

### 🎯 **Key Features**

- **Centralized Configuration**: All CORS settings are now in one file
- **Development Priority**: `http://localhost:5000` is **explicitly allowed for all routes**
- **Flexible Origin Management**: Easy to add/remove allowed origins
- **Custom Domain Support**: Automatically allows coach custom domains
- **Enhanced Security**: Comprehensive header and method validation

### 🚀 **Quick Setup**

To add a new allowed origin, simply add it to the `allowedOrigins` array in `config/cors.js`:

```javascript
const allowedOrigins = [
    // Development & Local Testing
    'http://localhost:3000',
    'http://localhost:5000',        // Primary development port
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',       // Primary development port
    
    // Production domains
    'https://funnelseye.com',
    'https://www.funnelseye.com',
    'https://app.funnelseye.com',
    'https://admin.funnelseye.com',
    
    // API domains
    'https://api.funnelseye.com',
    
    // Add your new domain here
    'https://yourdomain.com'
];
```

### 🔧 **Configuration Options**

The consolidated CORS configuration includes:

- **Origin Validation**: Smart origin checking with priority for localhost:5000
- **Method Support**: GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Header Management**: Comprehensive allowed and exposed headers
- **Security Features**: Credentials support, preflight handling, rate limiting
- **Custom Origins**: Dynamic origin validation for admin settings

### 🧪 **Testing CORS**

To test if CORS is working correctly:

1. **Run the test script**:
   ```bash
   node misc/test_cors.js
   ```

2. **Verify localhost:5000 access**:
   - Should show "✅ PRIORITY ALLOWED" for localhost:5000
   - All routes should accept requests from localhost:5000

3. **Check browser console** for CORS errors

### 🌐 **Environment Variables**

The CORS configuration respects the `FRONTEND_URL` environment variable if you need to add additional origins dynamically.

### 📋 **What Was Consolidated**

Previously scattered CORS configurations have been moved to `config/cors.js`:

- ✅ Main application CORS settings
- ✅ Admin settings CORS configuration  
- ✅ Custom domain CORS handling
- ✅ Development environment CORS rules

### 🔒 **Security Considerations**

- CORS is applied globally to all API routes
- localhost:5000 has priority access for development
- Custom domains are automatically validated
- Blocked origins are logged for debugging
- Consider implementing rate limiting for CORS preflight requests

### 📁 **File Structure**

```
config/
├── cors.js          # 🎯 Consolidated CORS configuration
├── db.js            # Database configuration
└── README.md        # This file
```

### 🚨 **Important Notes**

- **localhost:5000 is now explicitly allowed for ALL routes**
- All CORS configuration is centralized in one file
- No more scattered CORS settings across the codebase
- Easy to maintain and update CORS policies
