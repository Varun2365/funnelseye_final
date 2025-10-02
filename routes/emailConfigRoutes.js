const express = require('express');
const router = express.Router();
const emailConfigController = require('../controllers/emailConfigController');
const { verifyAdminToken } = require('../middleware/adminAuth');

// Apply admin authentication to all routes
router.use(verifyAdminToken);

// Email configuration routes
router.route('/config')
    .get(emailConfigController.getEmailConfig);

router.route('/setup')
    .post(emailConfigController.setupEmailConfig);

router.route('/test-config')
    .post(emailConfigController.testEmailConfig);

router.route('/status')
    .get(emailConfigController.getEmailStatus);

router.route('/send-test')
    .post(emailConfigController.sendTestEmail);

module.exports = router;
