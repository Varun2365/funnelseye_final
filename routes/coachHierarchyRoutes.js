const express = require('express');
const router = express.Router();
const { 
    getHierarchyLevels,
    generateCoachId,
    searchSponsor,
    createExternalSponsor,
    coachSignupWithHierarchy,
    lockHierarchy,
    submitAdminRequest,
    getHierarchyDetails,
    getAdminRequests,
    processAdminRequest
} = require('../controllers/coachHierarchyController');

const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const { protect } = require('../middleware/auth');

// ===== PUBLIC ROUTES =====

// Get all hierarchy levels
router.get('/levels', getHierarchyLevels);

// Generate unique coach ID
router.post('/generate-coach-id', generateCoachId);

// Search for sponsors (digital system + external)
router.get('/search-sponsor', searchSponsor);

// Create external sponsor
router.post('/external-sponsor', createExternalSponsor);

// Coach signup with hierarchy details
router.post('/signup', coachSignupWithHierarchy);

// ===== PRIVATE ROUTES (Coach Only) =====

// Lock hierarchy after first login
router.post('/lock', unifiedCoachAuth(), updateLastActive, requirePermission('coach:manage'), lockHierarchy);

// Submit admin request for hierarchy change
router.post('/admin-request', unifiedCoachAuth(), updateLastActive, requirePermission('coach:manage'), submitAdminRequest);

// Get coach hierarchy details
router.get('/details', unifiedCoachAuth(), updateLastActive, requirePermission('coach:read'), getHierarchyDetails);

// ===== ADMIN ROUTES =====

// Get pending admin requests (Admin only)
router.get('/admin-requests', protect, updateLastActive, getAdminRequests);

// Process admin request (Admin only)
router.put('/admin-request/:requestId', protect, updateLastActive, processAdminRequest);

module.exports = router;
