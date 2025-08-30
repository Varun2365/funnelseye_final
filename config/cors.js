// config/cors.js
// Unified CORS configuration for all routes - consolidated from scattered pieces

const corsOptions = {
    origin: function (origin, callback) {
        // List of allowed origins - easily add/remove URLs here
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
            
            // Custom domains (for coach websites)
            // Add coach custom domains here as needed
        ];

        // Allow requests with no origin (like mobile apps, Postman, or server-to-server calls)
        if (!origin) {
            return callback(null, true);
        }

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow custom domains (for coach websites) - check if it contains funnelseye.com
        if (origin && origin.includes('funnelseye.com')) {
            return callback(null, true);
        }

        // Allow localhost:5000 for all routes (development priority)
        if (origin === 'http://localhost:5000' || origin === 'http://127.0.0.1:5000') {
            return callback(null, true);
        }

        // Log blocked origins for debugging
        console.log(`[CORS] Blocked origin: ${origin}`);
        
        // Block the request
        return callback(new Error('Not allowed by CORS'), false);
    },
    
    // Allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    
    // Allowed headers - comprehensive list for all routes
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With', 
        'Accept', 
        'Origin',
        'X-API-Key',
        'X-Client-Version',
        'Cache-Control',
        'Pragma',
        'Expires',
        'x-coach-id',           // Coach identification header
        'X-Coach-ID',           // Alternative case
        'x-user-id',            // User identification header
        'X-User-ID',            // Alternative case
        'x-session-id',         // Session identification
        'X-Session-ID',         // Alternative case
        'x-request-id',         // Request tracking
        'X-Request-ID',         // Alternative case
        'x-forwarded-for',      // Proxy forwarding
        'X-Forwarded-For',      // Alternative case
        'x-real-ip',            // Real IP address
        'X-Real-IP',            // Alternative case
        'x-custom-domain',      // Custom domain header
        'X-Custom-Domain',      // Alternative case
        'x-auth-token',         // Auth token header
        'X-Auth-Token',         // Alternative case
        'x-refresh-token',      // Refresh token header
        'X-Refresh-Token',      // Alternative case
        'x-tenant-id',          // Tenant identification
        'X-Tenant-ID',          // Alternative case
        'x-version',            // API version header
        'X-Version'             // Alternative case
    ],
    
    // Exposed headers (headers that browsers are allowed to access)
    exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'X-Current-Page',
        'X-Coach-ID',
        'X-User-ID',
        'X-Session-ID'
    ],
    
    // Allow credentials (cookies, authorization headers, etc.)
    credentials: true,
    
    // Preflight response status
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    
    // Cache preflight request for 24 hours
    maxAge: 86400,
    
    // Additional security options
    preflightContinue: false,
    
    // Handle preflight requests
    preflight: true
};

// Export both the options and a function for dynamic configuration
module.exports = {
    corsOptions,
    
    // Function to get CORS options with custom origins (for admin settings)
    getCorsOptions: function(customOrigins = []) {
        const options = { ...corsOptions };
        
        if (customOrigins && customOrigins.length > 0) {
            const originalOriginFunction = options.origin;
            options.origin = function(origin, callback) {
                // First check custom origins
                if (customOrigins.includes(origin)) {
                    return callback(null, true);
                }
                // Then fall back to default logic
                return originalOriginFunction(origin, callback);
            };
        }
        
        return options;
    },
    
    // Function to validate if an origin is allowed
    isOriginAllowed: function(origin) {
        if (!origin) return true;
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5000',
            'https://funnelseye.com',
            'https://www.funnelseye.com',
            'https://app.funnelseye.com',
            'https://admin.funnelseye.com',
            'https://api.funnelseye.com'
        ];
        
        return allowedOrigins.includes(origin) || 
               origin.includes('funnelseye.com') ||
               origin === 'http://localhost:5000' ||
               origin === 'http://127.0.0.1:5000';
    }
};
