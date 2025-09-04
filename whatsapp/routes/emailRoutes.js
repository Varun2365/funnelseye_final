const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { protect } = require('../../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Email configuration routes
router.route('/configs')
    .post(emailController.createEmailConfig)
    .get(emailController.getEmailConfigs);

router.route('/providers')
    .get(emailController.getEmailProviders);

router.route('/configs/:id')
    .get(emailController.getEmailConfig)
    .put(emailController.updateEmailConfig)
    .delete(emailController.deleteEmailConfig);

router.route('/configs/:id/test')
    .post(emailController.testEmailConfig);

router.route('/configs/:id/set-default')
    .post(emailController.setDefaultEmailConfig);

router.route('/configs/:id/stats')
    .get(emailController.getEmailConfigStats);

// Email sending routes
router.route('/send')
    .post(emailController.sendEmail);

router.route('/send-bulk')
    .post(emailController.sendBulkEmail);

router.route('/send-template')
    .post(emailController.sendTemplateEmail);

module.exports = router;
