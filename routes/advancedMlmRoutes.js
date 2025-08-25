const express = require('express');
const router = express.Router();

const { 
    // Hierarchy Level Management
    getHierarchyLevels,
    generateCoachId,
    
    // Sponsor Management
    searchSponsor,
    createExternalSponsor,
    
    // Coach Signup
    coachSignupWithHierarchy,
    
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
    
    // ===== INTEGRATED EXISTING MLM FUNCTIONALITY =====
    addDownline,
    getDownline,
    getDownlineHierarchy,
    getTeamPerformance,
    generateTeamReport,
    getReports,
    getReportDetail
} = require('../controllers/advancedMlmController');

const { protect, authorizeCoach, authorizeStaff, authorizeAdmin } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// ===== PUBLIC ROUTES (No Authentication Required) =====

// Route 1: Get all hierarchy levels
router.get('/hierarchy-levels', getHierarchyLevels);

// Route 2: Generate unique coach ID
router.post('/generate-coach-id', generateCoachId);

// Route 3: Search for sponsors (digital system users and external)
router.get('/search-sponsor', searchSponsor);

// Route 4: Create external sponsor
router.post('/external-sponsor', createExternalSponsor);

// Route 5: Coach signup with hierarchy details
router.post('/signup', coachSignupWithHierarchy);

// ===== PRIVATE ROUTES (Coach Authentication Required) =====

// Route 6: Lock hierarchy after first login
router.post('/lock-hierarchy', protect, updateLastActive, authorizeCoach('coach'), lockHierarchy);

// Route 7: Submit admin request for hierarchy changes
router.post('/admin-request', protect, updateLastActive, authorizeCoach('coach'), submitAdminRequest);

// Route 8: Get admin requests for a specific coach
router.get('/admin-requests/:coachId', protect, updateLastActive, authorizeCoach('coach'), getCoachAdminRequests);

// Route 9: Get coach commissions
router.get('/commissions/:coachId', protect, updateLastActive, authorizeCoach('coach'), getCoachCommissions);

// ===== ADMIN ROUTES (Admin Authentication Required) =====

// Route 10: Get all pending admin requests
router.get('/admin/pending-requests', protect, updateLastActive, authorizeAdmin, getPendingAdminRequests);

// Route 11: Process admin request (approve/reject)
router.put('/admin/process-request/:requestId', protect, updateLastActive, authorizeAdmin, processAdminRequest);

// Route 12: Change coach upline
router.put('/admin/change-upline', protect, updateLastActive, authorizeAdmin, changeCoachUpline);

// Route 13: Get commission settings
router.get('/admin/commission-settings', protect, updateLastActive, authorizeAdmin, getCommissionSettings);

// Route 14: Update commission settings
router.put('/admin/commission-settings', protect, updateLastActive, authorizeAdmin, updateCommissionSettings);

// Route 15: Calculate and create commission for subscription
router.post('/admin/calculate-commission', protect, updateLastActive, authorizeAdmin, calculateCommission);

// Route 16: Process monthly commission payments
router.post('/admin/process-monthly-commissions', protect, updateLastActive, authorizeAdmin, processMonthlyCommissions);

// ===== INTEGRATED EXISTING MLM FUNCTIONALITY =====

// Route 17: Add a new coach to downline
router.post('/downline', protect, updateLastActive, authorizeCoach('coach'), addDownline);

// Route 18: Get direct downline for a specific sponsor
router.get('/downline/:sponsorId', protect, updateLastActive, authorizeCoach('coach'), getDownline);

// Route 19: Get complete downline hierarchy
router.get('/hierarchy/:coachId', protect, updateLastActive, authorizeCoach('coach'), getDownlineHierarchy);

// Route 20: Get team performance summary
router.get('/team-performance/:sponsorId', protect, updateLastActive, authorizeCoach('coach'), getTeamPerformance);

// Route 21: Generate comprehensive team report
router.post('/generate-report', protect, updateLastActive, authorizeCoach('coach'), generateTeamReport);

// Route 22: Get list of generated reports
router.get('/reports/:sponsorId', protect, updateLastActive, authorizeCoach('coach'), getReports);

// Route 23: Get specific report details
router.get('/reports/detail/:reportId', protect, updateLastActive, authorizeCoach('coach'), getReportDetail);

module.exports = router;
