const express = require('express');
const router = express.Router();
const { protect, authorizeCoach } = require('../middleware/auth');
const nurturingSequenceController = require('../controllers/nurturingSequenceController');

// Apply authentication middleware to all routes
router.use(protect);

// ===== CRUD OPERATIONS =====
router.post('/', nurturingSequenceController.createSequence);
router.get('/', nurturingSequenceController.getSequences);
router.get('/:id', nurturingSequenceController.getSequence);
router.put('/:id', nurturingSequenceController.updateSequence);
router.delete('/:id', nurturingSequenceController.deleteSequence);

// ===== SEQUENCE MANAGEMENT =====
router.post('/:id/duplicate', nurturingSequenceController.duplicateSequence);
router.put('/:id/toggle', nurturingSequenceController.toggleActive);
router.get('/:id/stats', nurturingSequenceController.getSequenceStats);

// ===== FUNNEL ASSIGNMENTS =====
router.post('/assign-to-funnel', nurturingSequenceController.assignToFunnel);
router.post('/remove-from-funnel', nurturingSequenceController.removeFromFunnel);
router.post('/bulk-assign', nurturingSequenceController.bulkAssignToFunnels);
router.get('/:id/funnel-assignments', nurturingSequenceController.getFunnelAssignments);

// ===== CATEGORY & TESTING =====
router.get('/category/:category', nurturingSequenceController.getSequencesByCategory);
router.post('/:id/test', nurturingSequenceController.testSequence);

module.exports = router;
