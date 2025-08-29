/**
 * Staff Permissions System
 * Defines all available permissions, permission groups, and validation functions
 */

// ===== PERMISSION CONSTANTS =====
const PERMISSIONS = {
    // Lead Management
    LEADS: {
        READ: 'leads:read',
        WRITE: 'leads:write', 
        UPDATE: 'leads:update',
        DELETE: 'leads:delete',
        MANAGE: 'leads:manage'
    },
    
    // Funnel Management
    FUNNELS: {
        READ: 'funnels:read',
        WRITE: 'funnels:write',
        UPDATE: 'funnels:update',
        DELETE: 'funnels:delete',
        MANAGE: 'funnels:manage'
    },
    
    // Task Management
    TASKS: {
        READ: 'tasks:read',
        WRITE: 'tasks:write',
        UPDATE: 'tasks:update',
        DELETE: 'tasks:delete',
        MANAGE: 'tasks:manage',
        ASSIGN: 'tasks:assign'
    },
    
    // Calendar Management
    CALENDAR: {
        READ: 'calendar:read',
        WRITE: 'calendar:write',
        UPDATE: 'calendar:update',
        DELETE: 'calendar:delete',
        MANAGE: 'calendar:manage',
        BOOK: 'calendar:book'
    },
    
    // Staff Management
    STAFF: {
        READ: 'staff:read',
        WRITE: 'staff:write',
        UPDATE: 'staff:update',
        DELETE: 'staff:delete',
        MANAGE: 'staff:manage'
    },
    
    // Performance & Analytics
    PERFORMANCE: {
        READ: 'performance:read',
        WRITE: 'performance:write',
        MANAGE: 'performance:manage'
    },
    
    // File Management
    FILES: {
        READ: 'files:read',
        WRITE: 'files:write',
        DELETE: 'files:delete',
        MANAGE: 'files:manage'
    },
    
    // AI Services
    AI: {
        READ: 'ai:read',
        WRITE: 'ai:write',
        MANAGE: 'ai:manage'
    },
    
    // WhatsApp Management
    WHATSAPP: {
        READ: 'whatsapp:read',
        WRITE: 'whatsapp:write',
        MANAGE: 'whatsapp:manage'
    },
    
    // Automation Rules
    AUTOMATION: {
        READ: 'automation:read',
        WRITE: 'automation:write',
        MANAGE: 'automation:manage'
    }
};

// ===== PERMISSION GROUPS =====
const PERMISSION_GROUPS = {
    'Lead Manager': [
        PERMISSIONS.LEADS.READ,
        PERMISSIONS.LEADS.WRITE,
        PERMISSIONS.LEADS.UPDATE,
        PERMISSIONS.LEADS.MANAGE
    ],
    
    'Funnel Manager': [
        PERMISSIONS.FUNNELS.READ,
        PERMISSIONS.FUNNELS.WRITE,
        PERMISSIONS.FUNNELS.UPDATE,
        PERMISSIONS.FUNNELS.MANAGE
    ],
    
    'Task Manager': [
        PERMISSIONS.TASKS.READ,
        PERMISSIONS.TASKS.WRITE,
        PERMISSIONS.TASKS.UPDATE,
        PERMISSIONS.TASKS.MANAGE,
        PERMISSIONS.TASKS.ASSIGN
    ],
    
    'Calendar Manager': [
        PERMISSIONS.CALENDAR.READ,
        PERMISSIONS.CALENDAR.WRITE,
        PERMISSIONS.CALENDAR.UPDATE,
        PERMISSIONS.CALENDAR.MANAGE,
        PERMISSIONS.CALENDAR.BOOK
    ],
    
    'Staff Manager': [
        PERMISSIONS.STAFF.READ,
        PERMISSIONS.STAFF.WRITE,
        PERMISSIONS.STAFF.UPDATE,
        PERMISSIONS.STAFF.MANAGE
    ],
    
    'Analytics Manager': [
        PERMISSIONS.PERFORMANCE.READ,
        PERMISSIONS.PERFORMANCE.WRITE,
        PERMISSIONS.PERFORMANCE.MANAGE
    ],
    
    'Content Manager': [
        PERMISSIONS.FILES.READ,
        PERMISSIONS.FILES.WRITE,
        PERMISSIONS.FILES.MANAGE,
        PERMISSIONS.AI.READ,
        PERMISSIONS.AI.WRITE
    ],
    
    'Communication Manager': [
        PERMISSIONS.WHATSAPP.READ,
        PERMISSIONS.WHATSAPP.WRITE,
        PERMISSIONS.WHATSAPP.MANAGE,
        PERMISSIONS.AUTOMATION.READ,
        PERMISSIONS.AUTOMATION.WRITE
    ],
    
    'Full Access': Object.values(PERMISSIONS).flatMap(group => 
        Object.values(group)
    )
};

// ===== PERMISSION VALIDATION FUNCTIONS =====

/**
 * Check if a permission string is valid
 * @param {string} permission - Permission to validate
 * @returns {boolean} - True if valid
 */
function isValidPermission(permission) {
    return Object.values(PERMISSIONS).some(group => 
        Object.values(group).includes(permission)
    );
}

/**
 * Validate an array of permissions
 * @param {string[]} permissions - Array of permissions to validate
 * @returns {Object} - { valid: boolean, invalid: string[] }
 */
function validatePermissions(permissions) {
    if (!Array.isArray(permissions)) {
        return { valid: false, invalid: [], error: 'Permissions must be an array' };
    }
    
    const invalid = permissions.filter(p => !isValidPermission(p));
    return {
        valid: invalid.length === 0,
        invalid,
        error: invalid.length > 0 ? `Invalid permissions: ${invalid.join(', ')}` : null
    };
}

/**
 * Check if staff has a specific permission
 * @param {string[]} staffPermissions - Staff's permission array
 * @param {string} requiredPermission - Required permission
 * @returns {boolean} - True if staff has permission
 */
function hasPermission(staffPermissions, requiredPermission) {
    if (!Array.isArray(staffPermissions)) return false;
    return staffPermissions.includes(requiredPermission);
}

/**
 * Check if staff has any of the required permissions
 * @param {string[]} staffPermissions - Staff's permission array
 * @param {string[]} requiredPermissions - Array of required permissions (any one)
 * @returns {boolean} - True if staff has at least one permission
 */
function hasAnyPermission(staffPermissions, requiredPermissions) {
    if (!Array.isArray(staffPermissions) || !Array.isArray(requiredPermissions)) return false;
    return requiredPermissions.some(permission => staffPermissions.includes(permission));
}

/**
 * Check if staff has all required permissions
 * @param {string[]} staffPermissions - Staff's permission array
 * @param {string[]} requiredPermissions - Array of required permissions (all)
 * @returns {boolean} - True if staff has all permissions
 */
function hasAllPermissions(staffPermissions, requiredPermissions) {
    if (!Array.isArray(staffPermissions) || !Array.isArray(requiredPermissions)) return false;
    return requiredPermissions.every(permission => staffPermissions.includes(permission));
}

/**
 * Get all available permissions
 * @returns {string[]} - Array of all permissions
 */
function getAllPermissions() {
    return Object.values(PERMISSIONS).flatMap(group => Object.values(group));
}

/**
 * Get permissions by group
 * @param {string} groupName - Name of permission group
 * @returns {string[]} - Array of permissions in group
 */
function getPermissionsByGroup(groupName) {
    return PERMISSION_GROUPS[groupName] || [];
}

/**
 * Get available permission groups
 * @returns {string[]} - Array of available group names
 */
function getAvailableGroups() {
    return Object.keys(PERMISSION_GROUPS);
}

module.exports = {
    PERMISSIONS,
    PERMISSION_GROUPS,
    isValidPermission,
    validatePermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getAllPermissions,
    getPermissionsByGroup,
    getAvailableGroups
};
