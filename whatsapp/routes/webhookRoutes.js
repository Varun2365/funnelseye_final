const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { protect } = require('../../middleware/auth');

// Webhook routes (public - no authentication required)
router.route('/')
    .get(webhookController.verifyWebhook)
    .post(webhookController.handleWebhook);

router.route('/baileys')
    .post(webhookController.handleBaileysWebhook);

// Protected webhook routes
router.use(protect);

router.route('/status')
    .get(webhookController.getWebhookStatus);

router.route('/test')
    .post(webhookController.testWebhook);

module.exports = router;
