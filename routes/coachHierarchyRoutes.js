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

const { protect, authorizeCoach } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');

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
router.post('/lock', protect, updateLastActive, authorizeCoach('coach'), lockHierarchy);

// Submit admin request for hierarchy change
router.post('/admin-request', protect, updateLastActive, authorizeCoach('coach'), submitAdminRequest);

// Get coach hierarchy details
router.get('/details', protect, updateLastActive, authorizeCoach('coach'), getHierarchyDetails);

// ===== ADMIN ROUTES =====

// Get pending admin requests (Admin only)
router.get('/admin-requests', protect, updateLastActive, getAdminRequests);

// Process admin request (Admin only)
router.put('/admin-request/:requestId', protect, updateLastActive, processAdminRequest);

module.exports = router;
