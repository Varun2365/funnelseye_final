const { protect, authorizeCoach } = require('./auth');
const StaffPermissionMiddleware = require('./staffPermissionMiddleware');
const { PERMISSIONS } = require('../utils/permissions');

/**
 * Unified Coach Authentication Middleware
 * Handles both coach and staff access to coach routes with proper permission checking
 * 
 * Flow:
 * 1. Authenticate user (coach or staff)
 * 2. If staff, check permissions and coach context
 * 3. If coach, allow full access
 * 4. Set appropriate context for controllers
 */

/**
 * Main unified authentication middleware
 * This replaces the need for separate coach and staff routes
 */
const unifiedCoachAuth = () => {
    return [
        protect, // Basic authentication
        authorizeCoach('coach', 'staff'), // Allow both coaches and staff
        StaffPermissionMiddleware.ensureCoachDataAccess() // Ensure staff can only access their coach's data
    ];
};

/**
 * Middleware to check specific permissions for staff
 * Coaches bypass permission checks (they have full access)
 * @param {string|string[]} requiredPermissions - Required permissions
 * @param {string} action - Action type (read, write, update, delete, manage)
 */
const requirePermission = (requiredPermissions, action = 'read') => {
    return [
        protect,
        authorizeCoach('coach', 'staff'),
        StaffPermissionMiddleware.ensureCoachDataAccess(),
        StaffPermissionMiddleware.checkPermission(requiredPermissions, action)
    ];
};

/**
 * Check if user can access a specific resource
 * Staff can only access resources belonging to their coach
 * Coaches can access their own resources
 */
const checkResourceOwnership = () => {
    return async (req, res, next) => {
        try {
            // If user is coach, they own all their resources
            if (req.role === 'coach') {
                return next();
            }

            // For staff, ensure they can only access their coach's resources
            if (req.role === 'staff') {
                // The coachId is already set in the auth middleware
                // Additional resource-specific checks can be added here
                return next();
            }

            next();
        } catch (error) {
            console.error('[UnifiedCoachAuth] Error in checkResourceOwnership:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking resource ownership'
            });
        }
    };
};

/**
 * Filter resources based on user permissions and context
 * Staff see only permitted resources, coaches see all their resources
 */
const filterResourcesByPermission = (resourceType) => {
    return async (req, res, next) => {
        try {
            // If user is coach, no filtering needed
            if (req.role === 'coach') {
                return next();
            }

            // For staff, add filtering context to request
            if (req.role === 'staff') {
                req.resourceFilter = {
                    type: resourceType,
                    coachId: req.coachId,
                    staffPermissions: req.staffInfo?.permissions || [],
                    filterByPermission: true
                };
            }

            next();
        } catch (error) {
            console.error('[UnifiedCoachAuth] Error in filterResourcesByPermission:', error);
            return res.status(500).json({
                success: false,
                message: 'Error filtering resources'
            });
        }
    };
};

/**
 * Specific permission checkers for different resource types
 */

// Lead Management
const requireLeadPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? PERMISSIONS.LEADS.READ :
        action === 'write' ? PERMISSIONS.LEADS.WRITE :
        action === 'update' ? PERMISSIONS.LEADS.UPDATE :
        action === 'delete' ? PERMISSIONS.LEADS.DELETE :
        PERMISSIONS.LEADS.MANAGE,
        action
    );
};

// Funnel Management
const requireFunnelPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? PERMISSIONS.FUNNELS.READ :
        action === 'write' ? PERMISSIONS.FUNNELS.WRITE :
        action === 'update' ? PERMISSIONS.FUNNELS.UPDATE :
        action === 'delete' ? PERMISSIONS.FUNNELS.DELETE :
        action === 'publish' ? PERMISSIONS.FUNNELS.PUBLISH :
        action === 'analytics' ? PERMISSIONS.FUNNELS.VIEW_ANALYTICS :
        PERMISSIONS.FUNNELS.MANAGE,
        action
    );
};

// Task Management
const requireTaskPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? PERMISSIONS.TASKS.READ :
        action === 'write' ? PERMISSIONS.TASKS.WRITE :
        action === 'update' ? PERMISSIONS.TASKS.UPDATE :
        action === 'delete' ? PERMISSIONS.TASKS.DELETE :
        action === 'assign' ? PERMISSIONS.TASKS.ASSIGN :
        PERMISSIONS.TASKS.MANAGE,
        action
    );
};

// Ads Management
const requireAdsPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? PERMISSIONS.ADS.READ :
        action === 'write' ? PERMISSIONS.ADS.WRITE :
        action === 'update' ? PERMISSIONS.ADS.UPDATE :
        action === 'delete' ? PERMISSIONS.ADS.DELETE :
        action === 'publish' ? PERMISSIONS.ADS.PUBLISH :
        action === 'analytics' ? PERMISSIONS.ADS.ANALYTICS :
        PERMISSIONS.ADS.MANAGE,
        action
    );
};

// WhatsApp Management
const requireWhatsAppPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? PERMISSIONS.WHATSAPP.READ :
        action === 'write' ? PERMISSIONS.WHATSAPP.WRITE :
        action === 'send' ? PERMISSIONS.WHATSAPP.SEND :
        action === 'templates' ? PERMISSIONS.WHATSAPP.TEMPLATES :
        PERMISSIONS.WHATSAPP.MANAGE,
        action
    );
};

// Automation Management
const requireAutomationPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? PERMISSIONS.AUTOMATION.READ :
        action === 'write' ? PERMISSIONS.AUTOMATION.WRITE :
        action === 'update' ? PERMISSIONS.AUTOMATION.UPDATE :
        action === 'delete' ? PERMISSIONS.AUTOMATION.DELETE :
        action === 'execute' ? PERMISSIONS.AUTOMATION.EXECUTE :
        PERMISSIONS.AUTOMATION.MANAGE,
        action
    );
};

// Calendar/Appointment Management
const requireCalendarPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? PERMISSIONS.CALENDAR.READ :
        action === 'write' ? PERMISSIONS.CALENDAR.WRITE :
        action === 'update' ? PERMISSIONS.CALENDAR.UPDATE :
        action === 'delete' ? PERMISSIONS.CALENDAR.DELETE :
        action === 'book' ? PERMISSIONS.CALENDAR.BOOK :
        PERMISSIONS.CALENDAR.MANAGE,
        action
    );
};

// Performance/Analytics
const requirePerformancePermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? PERMISSIONS.PERFORMANCE.READ :
        action === 'write' ? PERMISSIONS.PERFORMANCE.WRITE :
        PERMISSIONS.PERFORMANCE.MANAGE,
        action
    );
};

// File Management
const requireFilePermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? PERMISSIONS.FILES.READ :
        action === 'write' ? PERMISSIONS.FILES.WRITE :
        action === 'delete' ? PERMISSIONS.FILES.DELETE :
        PERMISSIONS.FILES.MANAGE,
        action
    );
};

// AI Features
const requireAIPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? PERMISSIONS.AI.READ :
        action === 'write' ? PERMISSIONS.AI.WRITE :
        PERMISSIONS.AI.MANAGE,
        action
    );
};

/**
 * Dashboard access permission checker
 * @param {string} section - Dashboard section (overview, leads, funnels, etc.)
 */
const requireDashboardPermission = (section = 'overview') => {
    return [
        protect,
        authorizeCoach('coach', 'staff'),
        StaffPermissionMiddleware.ensureCoachDataAccess(),
        StaffPermissionMiddleware.checkDashboardPermission(section)
    ];
};

/**
 * Get user context for controllers
 * Returns information about whether user is coach or staff with permissions
 */
const getUserContext = (req) => {
    return {
        userId: req.userId,
        coachId: req.coachId,
        role: req.role,
        isCoach: req.role === 'coach',
        isStaff: req.role === 'staff',
        staffInfo: req.staffInfo || null,
        permissions: req.staffInfo?.permissions || [],
        resourceFilter: req.resourceFilter || null
    };
};

/**
 * Helper function to check if staff has specific permission
 * @param {Object} req - Request object
 * @param {string} permission - Permission to check
 * @returns {boolean} - True if staff has permission or user is coach
 */
const hasStaffPermission = (req, permission) => {
    if (req.role === 'coach') return true;
    if (req.role === 'staff') {
        return req.staffInfo?.permissions?.includes(permission) || false;
    }
    return false;
};

/**
 * Helper function to get coach ID for database queries
 * Returns the actual coach ID regardless of whether user is coach or staff
 * @param {Object} req - Request object
 * @returns {string} - Coach ID
 */
const getCoachId = (req) => {
    return req.coachId.toString();
};

module.exports = {
    unifiedCoachAuth,
    requirePermission,
    checkResourceOwnership,
    filterResourcesByPermission,
    
    // Specific permission checkers
    requireLeadPermission,
    requireFunnelPermission,
    requireTaskPermission,
    requireAdsPermission,
    requireWhatsAppPermission,
    requireAutomationPermission,
    requireCalendarPermission,
    requirePerformancePermission,
    requireFilePermission,
    requireAIPermission,
    requireDashboardPermission,
    
    // Helper functions
    getUserContext,
    hasStaffPermission,
    getCoachId
};
