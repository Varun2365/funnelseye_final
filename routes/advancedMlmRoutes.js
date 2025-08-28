const express = require('express');
const router = express.Router();

const { 
    // Health Check
    mlmHealthCheck,
    
    // Hierarchy Level Management
    getHierarchyLevels,
    generateCoachId,
    setupHierarchyLevels,
    
    // Sponsor Management
    searchSponsor,
    createExternalSponsor,
    
    // Hierarchy Locking
    lockHierarchy,
    
    // Admin Request System
    submitAdminRequest,
    getCoachAdminRequests,
    
    // Admin Functions
    getPendingAdminRequests,
    processAdminRequest,
    changeCoachUpline,
    
    // Commission System
    getCommissionSettings,
    updateCommissionSettings,
    calculateCommission,
    getCoachCommissions,
    processMonthlyCommissions,
    calculateSubscriptionCommission,
    
    // ===== INTEGRATED EXISTING MLM FUNCTIONALITY =====
    addDownline,
    getDownline,
    getDownlineHierarchy,
    getTeamPerformance,
    generateTeamReport,
    getReports,
    getReportDetail,
    
} = require('../controllers/advancedMlmController');

const { protect, authorizeCoach, authorizeStaff, authorizeAdmin } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// ===== PUBLIC ROUTES (No Authentication Required) =====

// Route 0: Health check
router.get('/health', mlmHealthCheck);

// Route 0.1: Test middleware chain (Admin only)
router.get('/test-middleware', protect, updateLastActive, authorizeAdmin, (req, res) => {
    res.json({
        success: true,
        message: 'Middleware chain working correctly',
        user: {
            id: req.user.id,
            role: req.role
        }
    });
});

// Route 0.2: Clean up database - Fix null selfCoachId values (Admin only)
// router.post('/cleanup-database', protect, updateLastActive, authorizeAdmin, cleanupDatabase);

// ===== HIERARCHY LEVEL MANAGEMENT =====

// Route 1: Setup default hierarchy levels (Admin only)
router.post('/setup-hierarchy', protect, updateLastActive, authorizeAdmin, setupHierarchyLevels);

// Route 2: Get all hierarchy levels (Public)
router.get('/hierarchy-levels', getHierarchyLevels);

// Route 3: Generate unique coach ID
router.post('/generate-coach-id', generateCoachId);

// Route 4: Search for sponsors (digital system users and external)
router.get('/search-sponsor', searchSponsor);

// Route 5: Create external sponsor
router.post('/external-sponsor', createExternalSponsor);

// Route 6: Coach signup with hierarchy details
// REMOVED: Now handled by unified signup at /api/auth/signup
// Use /api/auth/signup with role: 'coach' and optional MLM fields

// ===== PRIVATE ROUTES (Coach Authentication Required) =====

// Route 7: Lock hierarchy after first login
router.post('/lock-hierarchy', protect, updateLastActive, authorizeCoach('coach'), lockHierarchy);

// Route 8: Submit admin request for hierarchy changes
router.post('/admin-request', protect, updateLastActive, authorizeCoach('coach'), submitAdminRequest);

// Route 9: Get admin requests for a specific coach
// Admins can view any coach's admin requests, coaches can only view their own
router.get('/admin-requests/:coachId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getCoachAdminRequests);

// ===== COMMISSION SYSTEM =====

// Route 10: Calculate commission only on platform subscriptions (Admin only)
router.post('/calculate-subscription-commission', protect, updateLastActive, authorizeAdmin, calculateSubscriptionCommission);

// Route 10: Get coach commissions
// Admins can view any coach's commissions, coaches can only view their own
router.get('/commissions/:coachId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getCoachCommissions);

// ===== ADMIN ROUTES (Admin Authentication Required) =====

// Route 11: Get all pending admin requests
router.get('/admin/pending-requests', protect, updateLastActive, authorizeAdmin, getPendingAdminRequests);

// Route 12: Process admin request (approve/reject)
router.put('/admin/process-request/:requestId', protect, updateLastActive, authorizeAdmin, processAdminRequest);

// Route 13: Change coach upline
router.put('/admin/change-upline', protect, updateLastActive, authorizeAdmin, changeCoachUpline);

// Route 14: Get commission settings
router.get('/admin/commission-settings', protect, updateLastActive, authorizeAdmin, getCommissionSettings);

// Route 15: Update commission settings
router.put('/admin/commission-settings', protect, updateLastActive, authorizeAdmin, updateCommissionSettings);

// Route 16: Calculate and create commission for subscription
router.post('/admin/calculate-commission', protect, updateLastActive, authorizeAdmin, calculateCommission);

// Route 17: Process monthly commission payments
router.post('/admin/process-monthly-commissions', protect, updateLastActive, authorizeAdmin, processMonthlyCommissions);

// ===== INTEGRATED EXISTING MLM FUNCTIONALITY =====

// Route 18: Add a new coach to downline
router.post('/downline', protect, updateLastActive, authorizeCoach('coach'), addDownline);

// Route 19: Get direct downline for a specific sponsor
// Admins can view any coach's downline, coaches can only view their own
router.get('/downline/:sponsorId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getDownline);

// Route 20: Get complete downline hierarchy
// Admins can view any coach's hierarchy, coaches can only view their own
router.get('/hierarchy/:coachId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getDownlineHierarchy);

// Route 21: Get team performance summary
// Admins can view any coach's team performance, coaches can only view their own
router.get('/team-performance/:sponsorId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getTeamPerformance);

// Route 22: Generate comprehensive team report
router.post('/generate-report', protect, updateLastActive, authorizeCoach('coach'), generateTeamReport);

// Route 23: Get list of generated reports
// Admins can view any coach's reports, coaches can only view their own
router.get('/reports/:sponsorId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getReports);

// Route 24: Get specific report details
// Admins can view any report, coaches can only view their own reports
router.get('/reports/detail/:reportId', protect, updateLastActive, authorizeCoach('coach', 'admin', 'super_admin'), getReportDetail);

module.exports = router;
