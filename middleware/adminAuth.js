const jwt = require('jsonwebtoken');
const { AdminUser } = require('../schema');

// ===== ADMIN AUTHENTICATION MIDDLEWARE =====

// Verify admin JWT token
const verifyAdminToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Check if token is for admin
        if (decoded.type !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type. Admin token required.'
            });
        }

        // Get admin user
        const admin = await AdminUser.findById(decoded.adminId).select('-password -passwordHistory');
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found.'
            });
        }

        // Check if admin is active
        if (admin.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Admin account is not active.'
            });
        }

        // Check if admin is locked
        if (admin.isLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Admin account is temporarily locked.'
            });
        }

        // Add admin to request object
        req.admin = admin;
        next();

    } catch (error) {
        console.error('Admin token verification error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Token verification failed.'
        });
    }
};

// Check admin permissions
const checkAdminPermission = (permission) => {
    return (req, res, next) => {
        try {
            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin authentication required.'
                });
            }

            // Super admin has all permissions
            if (req.admin.role === 'super_admin') {
                return next();
            }

            // Check specific permission
            if (!req.admin.hasPermission(permission)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required permission: ${permission}`
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Permission check failed.'
            });
        }
    };
};

// Check admin role
const checkAdminRole = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin authentication required.'
                });
            }

            const allowedRoles = Array.isArray(roles) ? roles : [roles];
            
            if (!allowedRoles.includes(req.admin.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
                });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Role check failed.'
            });
        }
    };
};

// Rate limiting middleware for admin routes
const adminRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();

    return (req, res, next) => {
        const adminId = req.admin?.id || req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old entries
        for (const [key, data] of requests.entries()) {
            if (data.windowStart < windowStart) {
                requests.delete(key);
            }
        }

        // Get or create request data for this admin
        if (!requests.has(adminId)) {
            requests.set(adminId, {
                count: 0,
                windowStart: now
            });
        }

        const requestData = requests.get(adminId);

        // Reset window if needed
        if (requestData.windowStart < windowStart) {
            requestData.count = 0;
            requestData.windowStart = now;
        }

        // Check rate limit
        if (requestData.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((requestData.windowStart + windowMs - now) / 1000)
            });
        }

        // Increment counter
        requestData.count++;
        requests.set(adminId, requestData);

        next();
    };
};

// Log admin activity
const logAdminActivity = (action, category = 'SYSTEM_MANAGEMENT') => {
    return async (req, res, next) => {
        try {
            // Store original res.json
            const originalJson = res.json;

            // Override res.json to log after response
            res.json = function(data) {
                // Log the activity
                if (req.admin) {
                    const { AdminAuditLog } = require('../schema');
                    
                    // Generate logId manually
                    const logId = `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                    
                    // Map invalid actions to valid ones
                    const validAction = action === 'VIEW_DASHBOARD' ? 'VIEW_SENSITIVE_DATA' : action;
                    
                    AdminAuditLog.create({
                        logId,
                        adminId: req.admin.id,
                        adminEmail: req.admin.email,
                        adminRole: req.admin.role,
                        action: validAction,
                        category,
                        description: `${validAction} - ${req.method} ${req.originalUrl}`,
                        severity: 'low',
                        ipAddress: req.ip || req.connection.remoteAddress,
                        userAgent: req.get('User-Agent'),
                        endpoint: req.originalUrl,
                        method: req.method,
                        status: data.success ? 'success' : 'failed',
                        errorMessage: data.success ? null : data.message
                    }).catch(err => console.error('Error logging admin activity:', err));
                }

                // Call original json method
                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            console.error('Error in logAdminActivity middleware:', error);
            next();
        }
    };
};

// Validate admin session
const validateAdminSession = async (req, res, next) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin authentication required.'
            });
        }

        // Check if admin session is still valid
        const admin = await AdminUser.findById(req.admin.id);
        
        if (!admin || admin.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Admin session is no longer valid.'
            });
        }

        // Update last activity
        admin.security.lastLogin = new Date();
        await admin.save();

        next();
    } catch (error) {
        console.error('Session validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Session validation failed.'
        });
    }
};

module.exports = {
    verifyAdminToken,
    checkAdminPermission,
    checkAdminRole,
    adminRateLimit,
    logAdminActivity,
    validateAdminSession
};