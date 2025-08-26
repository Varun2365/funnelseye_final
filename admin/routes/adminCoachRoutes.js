const express = require('express');
const router = express.Router();
const adminCoachController = require('../controllers/adminCoachController');
const adminAuth = require('../../middleware/adminAuth');

// Apply admin authentication middleware to all routes
router.use(adminAuth);

// ===== COACH MANAGEMENT =====

// Get all coaches with MLM information
router.get('/', adminCoachController.getAllCoaches);

// Get single coach with full details
router.get('/:id', adminCoachController.getCoach);

// Update coach status and permissions
router.put('/:id/status', adminCoachController.updateCoachStatus);

// Update coach MLM information
router.put('/:id/mlm', adminCoachController.updateCoachMLM);

// Generate new coach ID
router.post('/:id/generate-id', adminCoachController.generateNewCoachId);

// Get coach performance analytics
router.get('/:id/performance', adminCoachController.getCoachPerformance);

// ===== MLM OPERATIONS =====

// Get MLM hierarchy overview
router.get('/mlm/overview', adminCoachController.getMLMOverview);

// ===== COACH SUPPORT =====

// Impersonate coach (for support purposes)
router.post('/:id/impersonate', adminCoachController.impersonateCoach);

module.exports = router;
