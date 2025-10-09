/**
 * Section-Based Staff Permissions System
 * Simplified permission structure where staff get full access to a section if granted
 * No fine-grained permissions like read/write/update - just section access
 */

// ===== SECTION PERMISSIONS =====
const SECTIONS = {
    // Dashboard - Staff gets their own custom dashboard
    DASHBOARD: 'dashboard',
    
    // Funnel Management - Full access to funnel creation, editing, publishing
    FUNNELS: 'funnels',
    
    // Lead Management - Fine-grained permissions available
    LEADS: {
        VIEW: 'leads:view',           // View assigned leads
        CREATE: 'leads:create',       // Create new leads
        UPDATE: 'leads:update',       // Update lead information
        DELETE: 'leads:delete',       // Delete leads
        ASSIGN: 'leads:assign',       // Assign leads to other staff
        EXPORT: 'leads:export',       // Export lead data
        MANAGE_ALL: 'leads:manage_all' // View and manage all coach leads (not just assigned)
    },
    
    // Central WhatsApp & Email System - Full messaging access
    MESSAGING: 'messaging',
    
    // Calendar - Appointments, scheduling, availability management
    CALENDAR: 'calendar',
    
    // Marketing & Ads - Campaign management, ad creation, analytics
    MARKETING: 'marketing',
    
    // AI & Automation - Automation rules, AI tools, sequences
    AUTOMATION: 'automation',
    
    // MLM Network - Downline management, commissions, hierarchy
    MLM: 'mlm',
    
    // Staff Profile - Own profile management (always accessible)
    PROFILE: 'profile',
    
    // Subscription - Blocked for staff (coaches only)
    SUBSCRIPTION: 'subscription',
    
    // Zoom Settings - Full Zoom integration management
    ZOOM: 'zoom',
    
    // Payment Gateway - Payment setup and configuration
    PAYMENT_GATEWAY: 'payment_gateway',
    
    // Custom Domains - Domain management and configuration
    DOMAINS: 'domains',
    
    // Message Templates - Template creation and management
    TEMPLATES: 'templates',
    
    // Course Creation & Selling - Course management and sales
    COURSES: 'courses',
    
    // Staff Management - Manage other staff (admin-level)
    STAFF_MANAGEMENT: 'staff_management'
};

// ===== SECTION METADATA =====
const SECTION_METADATA = {
    [SECTIONS.DASHBOARD]: {
        name: 'Dashboard',
        description: 'Access to staff dashboard with assigned tasks and overview',
        icon: '📊',
        alwaysAccessible: true, // Staff always have dashboard access
        category: 'Core'
    },
    [SECTIONS.FUNNELS]: {
        name: 'Funnel Management',
        description: 'Create, edit, and manage sales funnels',
        icon: '🔄',
        category: 'Sales & Marketing'
    },
    // Lead permissions - fine-grained
    [SECTIONS.LEADS.VIEW]: {
        name: 'View Leads',
        description: 'View assigned leads and their information',
        icon: '👁️',
        category: 'Lead Management',
        parentSection: 'leads'
    },
    [SECTIONS.LEADS.CREATE]: {
        name: 'Create Leads',
        description: 'Create new leads',
        icon: '➕',
        category: 'Lead Management',
        parentSection: 'leads'
    },
    [SECTIONS.LEADS.UPDATE]: {
        name: 'Update Leads',
        description: 'Update lead information and status',
        icon: '✏️',
        category: 'Lead Management',
        parentSection: 'leads'
    },
    [SECTIONS.LEADS.DELETE]: {
        name: 'Delete Leads',
        description: 'Delete leads from the system',
        icon: '🗑️',
        category: 'Lead Management',
        parentSection: 'leads'
    },
    [SECTIONS.LEADS.ASSIGN]: {
        name: 'Assign Leads',
        description: 'Assign leads to other staff members',
        icon: '👤',
        category: 'Lead Management',
        parentSection: 'leads'
    },
    [SECTIONS.LEADS.EXPORT]: {
        name: 'Export Leads',
        description: 'Export lead data to CSV/Excel',
        icon: '📤',
        category: 'Lead Management',
        parentSection: 'leads'
    },
    [SECTIONS.LEADS.MANAGE_ALL]: {
        name: 'Manage All Leads',
        description: 'View and manage all coach leads (not just assigned ones)',
        icon: '👥',
        category: 'Lead Management',
        parentSection: 'leads',
        isAdvanced: true
    },
    [SECTIONS.MESSAGING]: {
        name: 'WhatsApp & Email',
        description: 'Send messages, manage conversations, and email campaigns',
        icon: '💬',
        category: 'Communication'
    },
    [SECTIONS.CALENDAR]: {
        name: 'Calendar & Appointments',
        description: 'Manage appointments, scheduling, and availability',
        icon: '📅',
        category: 'Operations'
    },
    [SECTIONS.MARKETING]: {
        name: 'Marketing & Ads',
        description: 'Create and manage marketing campaigns and advertisements',
        icon: '📢',
        category: 'Sales & Marketing'
    },
    [SECTIONS.AUTOMATION]: {
        name: 'AI & Automation',
        description: 'Set up automation rules, AI tools, and sequences',
        icon: '🤖',
        category: 'Automation'
    },
    [SECTIONS.MLM]: {
        name: 'MLM Network',
        description: 'View and manage MLM downline and commissions',
        icon: '🌳',
        category: 'Network'
    },
    [SECTIONS.PROFILE]: {
        name: 'Staff Profile',
        description: 'Manage your own profile and settings',
        icon: '👤',
        alwaysAccessible: true, // Staff always have profile access
        category: 'Core'
    },
    [SECTIONS.SUBSCRIPTION]: {
        name: 'Subscription',
        description: 'Subscription plans and billing (Coach only)',
        icon: '💳',
        coachOnly: true, // Blocked for staff
        category: 'Admin'
    },
    [SECTIONS.ZOOM]: {
        name: 'Zoom Settings',
        description: 'Configure Zoom integration and meeting settings',
        icon: '🎥',
        category: 'Integrations'
    },
    [SECTIONS.PAYMENT_GATEWAY]: {
        name: 'Payment Gateway',
        description: 'Setup and configure payment gateways',
        icon: '💰',
        category: 'Finance'
    },
    [SECTIONS.DOMAINS]: {
        name: 'Custom Domains',
        description: 'Manage custom domain configurations',
        icon: '🌐',
        category: 'Settings'
    },
    [SECTIONS.TEMPLATES]: {
        name: 'Message Templates',
        description: 'Create and manage message templates',
        icon: '📝',
        category: 'Communication'
    },
    [SECTIONS.COURSES]: {
        name: 'Courses',
        description: 'Create, manage, and sell courses',
        icon: '📚',
        category: 'Content'
    },
    [SECTIONS.STAFF_MANAGEMENT]: {
        name: 'Staff Management',
        description: 'Manage staff members and their permissions',
        icon: '👨‍💼',
        category: 'Admin'
    }
};

// ===== SECTION TO ROUTE MAPPING =====
// Maps sections to their corresponding route patterns
const SECTION_ROUTES = {
    [SECTIONS.DASHBOARD]: [
        '/api/coach/dashboard',
        '/api/coach/daily-feed'
    ],
    [SECTIONS.FUNNELS]: [
        '/api/funnels',
        '/api/funnel'
    ],
    // Lead routes - map to lead parent section
    'leads': [
        '/api/leads',
        '/api/lead',
        '/api/lead-magnets',
        '/api/lead-magnet-management',
        '/api/lead-scoring'
    ],
    [SECTIONS.MESSAGING]: [
        '/api/whatsapp',
        '/api/unified-messaging',
        '/api/inbox',
        '/api/messaging'
    ],
    [SECTIONS.CALENDAR]: [
        '/api/coach/availability',
        '/api/staff-calendar',
        '/api/staff-appointments',
        '/api/coach/daily-feed' // Calendar-related endpoints
    ],
    [SECTIONS.MARKETING]: [
        '/api/marketing',
        '/api/ads',
        '/api/ai-ads',
        '/api/coach/marketing-credentials'
    ],
    [SECTIONS.AUTOMATION]: [
        '/api/automation-rules',
        '/api/nurturing-sequence',
        '/api/workflow',
        '/api/ai'
    ],
    [SECTIONS.MLM]: [
        '/api/mlm',
        '/api/coach/hierarchy',
        '/api/advanced-mlm'
    ],
    [SECTIONS.PROFILE]: [
        '/api/staff/profile'
    ],
    [SECTIONS.SUBSCRIPTION]: [
        '/api/subscription',
        '/api/coach/subscription-limits'
    ],
    [SECTIONS.ZOOM]: [
        '/api/zoom'
    ],
    [SECTIONS.PAYMENT_GATEWAY]: [
        '/api/coach/payment',
        '/api/central-payment'
    ],
    [SECTIONS.DOMAINS]: [
        '/api/custom-domain'
    ],
    [SECTIONS.TEMPLATES]: [
        '/api/message-templates'
    ],
    [SECTIONS.COURSES]: [
        '/api/courses',
        '/api/course-management',
        '/api/paymentsv1' // Course purchase routes
    ],
    [SECTIONS.STAFF_MANAGEMENT]: [
        '/api/coach/staff'
    ]
};

// ===== PERMISSION PRESETS =====
// Common permission combinations for different staff roles
const PERMISSION_PRESETS = {
    'Sales Representative': [
        SECTIONS.DASHBOARD,
        SECTIONS.LEADS.VIEW,
        SECTIONS.LEADS.CREATE,
        SECTIONS.LEADS.UPDATE,
        SECTIONS.FUNNELS,
        SECTIONS.CALENDAR,
        SECTIONS.MESSAGING,
        SECTIONS.PROFILE
    ],
    'Lead Manager': [
        SECTIONS.DASHBOARD,
        SECTIONS.LEADS.VIEW,
        SECTIONS.LEADS.CREATE,
        SECTIONS.LEADS.UPDATE,
        SECTIONS.LEADS.DELETE,
        SECTIONS.LEADS.ASSIGN,
        SECTIONS.LEADS.EXPORT,
        SECTIONS.FUNNELS,
        SECTIONS.CALENDAR,
        SECTIONS.MESSAGING,
        SECTIONS.PROFILE
    ],
    'Senior Lead Manager': [
        SECTIONS.DASHBOARD,
        SECTIONS.LEADS.VIEW,
        SECTIONS.LEADS.CREATE,
        SECTIONS.LEADS.UPDATE,
        SECTIONS.LEADS.DELETE,
        SECTIONS.LEADS.ASSIGN,
        SECTIONS.LEADS.EXPORT,
        SECTIONS.LEADS.MANAGE_ALL,
        SECTIONS.FUNNELS,
        SECTIONS.CALENDAR,
        SECTIONS.MESSAGING,
        SECTIONS.PROFILE
    ],
    'Marketing Manager': [
        SECTIONS.DASHBOARD,
        SECTIONS.MARKETING,
        SECTIONS.LEADS.VIEW,
        SECTIONS.LEADS.CREATE,
        SECTIONS.AUTOMATION,
        SECTIONS.TEMPLATES,
        SECTIONS.PROFILE
    ],
    'Operations Manager': [
        SECTIONS.DASHBOARD,
        SECTIONS.CALENDAR,
        SECTIONS.LEADS.VIEW,
        SECTIONS.LEADS.UPDATE,
        SECTIONS.MESSAGING,
        SECTIONS.TEMPLATES,
        SECTIONS.PROFILE
    ],
    'Content Manager': [
        SECTIONS.DASHBOARD,
        SECTIONS.COURSES,
        SECTIONS.TEMPLATES,
        SECTIONS.PROFILE
    ],
    'Technical Manager': [
        SECTIONS.DASHBOARD,
        SECTIONS.ZOOM,
        SECTIONS.PAYMENT_GATEWAY,
        SECTIONS.DOMAINS,
        SECTIONS.AUTOMATION,
        SECTIONS.PROFILE
    ],
    'Team Lead': [
        SECTIONS.DASHBOARD,
        SECTIONS.LEADS.VIEW,
        SECTIONS.LEADS.CREATE,
        SECTIONS.LEADS.UPDATE,
        SECTIONS.LEADS.DELETE,
        SECTIONS.LEADS.ASSIGN,
        SECTIONS.LEADS.EXPORT,
        SECTIONS.LEADS.MANAGE_ALL,
        SECTIONS.FUNNELS,
        SECTIONS.CALENDAR,
        SECTIONS.MESSAGING,
        SECTIONS.MARKETING,
        SECTIONS.AUTOMATION,
        SECTIONS.TEMPLATES,
        SECTIONS.STAFF_MANAGEMENT,
        SECTIONS.PROFILE
    ],
    'Full Access': [
        SECTIONS.DASHBOARD,
        SECTIONS.LEADS.VIEW,
        SECTIONS.LEADS.CREATE,
        SECTIONS.LEADS.UPDATE,
        SECTIONS.LEADS.DELETE,
        SECTIONS.LEADS.ASSIGN,
        SECTIONS.LEADS.EXPORT,
        SECTIONS.LEADS.MANAGE_ALL,
        SECTIONS.FUNNELS,
        SECTIONS.MESSAGING,
        SECTIONS.CALENDAR,
        SECTIONS.MARKETING,
        SECTIONS.AUTOMATION,
        SECTIONS.MLM,
        SECTIONS.PROFILE,
        SECTIONS.ZOOM,
        SECTIONS.PAYMENT_GATEWAY,
        SECTIONS.DOMAINS,
        SECTIONS.TEMPLATES,
        SECTIONS.COURSES,
        SECTIONS.STAFF_MANAGEMENT
        // Subscription excluded
    ]
};

// ===== VALIDATION FUNCTIONS =====

/**
 * Get all valid permission strings (flattened)
 * @returns {string[]} - Array of all valid permissions
 */
function getAllValidPermissions() {
    const permissions = [];
    
    function flattenSections(obj) {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                permissions.push(obj[key]);
            } else if (typeof obj[key] === 'object') {
                flattenSections(obj[key]);
            }
        }
    }
    
    flattenSections(SECTIONS);
    return permissions;
}

/**
 * Check if a section permission is valid
 * @param {string} section - Section to validate
 * @returns {boolean} - True if valid
 */
function isValidSection(section) {
    const allPermissions = getAllValidPermissions();
    return allPermissions.includes(section);
}

/**
 * Validate an array of section permissions
 * @param {string[]} sections - Array of sections to validate
 * @returns {Object} - { valid: boolean, invalid: string[] }
 */
function validateSections(sections) {
    if (!Array.isArray(sections)) {
        return { valid: false, invalid: [], error: 'Sections must be an array' };
    }
    
    const invalid = sections.filter(s => !isValidSection(s));
    return {
        valid: invalid.length === 0,
        invalid,
        error: invalid.length > 0 ? `Invalid sections: ${invalid.join(', ')}` : null
    };
}

/**
 * Check if staff has access to a section
 * @param {string[]} staffSections - Staff's section permissions array
 * @param {string} requiredSection - Required section
 * @returns {boolean} - True if staff has access
 */
function hasSection(staffSections, requiredSection) {
    if (!Array.isArray(staffSections)) return false;
    
    // Check if section is always accessible
    const metadata = SECTION_METADATA[requiredSection];
    if (metadata && metadata.alwaysAccessible) return true;
    
    return staffSections.includes(requiredSection);
}

/**
 * Check if staff has access to any of the required sections
 * @param {string[]} staffSections - Staff's section permissions array
 * @param {string[]} requiredSections - Array of required sections (any one)
 * @returns {boolean} - True if staff has at least one section
 */
function hasAnySection(staffSections, requiredSections) {
    if (!Array.isArray(staffSections) || !Array.isArray(requiredSections)) return false;
    return requiredSections.some(section => hasSection(staffSections, section));
}

/**
 * Check if staff has access to all required sections
 * @param {string[]} staffSections - Staff's section permissions array
 * @param {string[]} requiredSections - Array of required sections (all)
 * @returns {boolean} - True if staff has all sections
 */
function hasAllSections(staffSections, requiredSections) {
    if (!Array.isArray(staffSections) || !Array.isArray(requiredSections)) return false;
    return requiredSections.every(section => hasSection(staffSections, section));
}

/**
 * Get section for a route path
 * @param {string} routePath - Route path to check
 * @returns {string|null} - Section name or null if not found
 */
function getSectionForRoute(routePath) {
    for (const [section, routes] of Object.entries(SECTION_ROUTES)) {
        if (routes.some(route => routePath.startsWith(route))) {
            return section;
        }
    }
    return null;
}

/**
 * Check if section is blocked for staff
 * @param {string} section - Section to check
 * @returns {boolean} - True if blocked for staff
 */
function isCoachOnly(section) {
    const metadata = SECTION_METADATA[section];
    return metadata && metadata.coachOnly === true;
}

/**
 * Get all available sections
 * @param {boolean} includeCoachOnly - Include coach-only sections
 * @returns {string[]} - Array of all sections
 */
function getAllSections(includeCoachOnly = false) {
    const sections = Object.values(SECTIONS);
    if (includeCoachOnly) return sections;
    return sections.filter(section => !isCoachOnly(section));
}

/**
 * Get sections by category
 * @param {string} category - Category name
 * @returns {string[]} - Array of sections in category
 */
function getSectionsByCategory(category) {
    return Object.entries(SECTION_METADATA)
        .filter(([_, metadata]) => metadata.category === category)
        .map(([section, _]) => section);
}

/**
 * Get all categories
 * @returns {string[]} - Array of unique categories
 */
function getCategories() {
    return [...new Set(Object.values(SECTION_METADATA).map(m => m.category))];
}

/**
 * Get sections grouped by category
 * @returns {Object} - Object with categories as keys and sections as values
 */
function getSectionsGroupedByCategory() {
    const grouped = {};
    for (const [section, metadata] of Object.entries(SECTION_METADATA)) {
        const category = metadata.category;
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push({
            section,
            ...metadata
        });
    }
    return grouped;
}

/**
 * Get permission preset by name
 * @param {string} presetName - Name of preset
 * @returns {string[]} - Array of sections in preset
 */
function getPermissionPreset(presetName) {
    return PERMISSION_PRESETS[presetName] || [];
}

/**
 * Get available permission presets
 * @returns {string[]} - Array of available preset names
 */
function getAvailablePresets() {
    return Object.keys(PERMISSION_PRESETS);
}

/**
 * Check if staff has a specific lead permission
 * @param {string[]} staffPermissions - Staff's permission array
 * @param {string} requiredPermission - Required lead permission
 * @returns {boolean} - True if staff has permission
 */
function hasLeadPermission(staffPermissions, requiredPermission) {
    if (!Array.isArray(staffPermissions)) return false;
    
    // Check if staff has the specific permission
    if (staffPermissions.includes(requiredPermission)) {
        return true;
    }
    
    // Check if staff has MANAGE_ALL which grants all lead permissions
    if (staffPermissions.includes(SECTIONS.LEADS.MANAGE_ALL)) {
        return true;
    }
    
    return false;
}

/**
 * Check if staff can view all leads (not just assigned)
 * @param {string[]} staffPermissions - Staff's permission array
 * @returns {boolean} - True if staff can view all leads
 */
function canViewAllLeads(staffPermissions) {
    if (!Array.isArray(staffPermissions)) return false;
    return staffPermissions.includes(SECTIONS.LEADS.MANAGE_ALL);
}

/**
 * Get lead permissions for staff
 * @param {string[]} staffPermissions - Staff's permission array
 * @returns {Object} - Object with boolean flags for each lead permission
 */
function getLeadPermissions(staffPermissions) {
    if (!Array.isArray(staffPermissions)) {
        return {
            canView: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canAssign: false,
            canExport: false,
            canManageAll: false
        };
    }
    
    return {
        canView: hasLeadPermission(staffPermissions, SECTIONS.LEADS.VIEW),
        canCreate: hasLeadPermission(staffPermissions, SECTIONS.LEADS.CREATE),
        canUpdate: hasLeadPermission(staffPermissions, SECTIONS.LEADS.UPDATE),
        canDelete: hasLeadPermission(staffPermissions, SECTIONS.LEADS.DELETE),
        canAssign: hasLeadPermission(staffPermissions, SECTIONS.LEADS.ASSIGN),
        canExport: hasLeadPermission(staffPermissions, SECTIONS.LEADS.EXPORT),
        canManageAll: staffPermissions.includes(SECTIONS.LEADS.MANAGE_ALL)
    };
}

module.exports = {
    SECTIONS,
    SECTION_METADATA,
    SECTION_ROUTES,
    PERMISSION_PRESETS,
    isValidSection,
    validateSections,
    hasSection,
    hasAnySection,
    hasAllSections,
    getSectionForRoute,
    isCoachOnly,
    getAllSections,
    getSectionsByCategory,
    getCategories,
    getSectionsGroupedByCategory,
    getPermissionPreset,
    getAvailablePresets,
    getAllValidPermissions,
    hasLeadPermission,
    canViewAllLeads,
    getLeadPermissions
};

