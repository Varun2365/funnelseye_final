const express = require('express');
const router = express.Router();
const leadNurturingController = require('../controllers/leadNurturingController');

router.post('/assign-sequence', leadNurturingController.assignSequence);
router.post('/progress-step', leadNurturingController.progressStep);
router.get('/status', leadNurturingController.getStatus);

module.exports = router;
