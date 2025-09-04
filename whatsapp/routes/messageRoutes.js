const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Message sending routes
router.route('/send')
    .post(messageController.sendMessage);

router.route('/send-default')
    .post(messageController.sendMessageDefault);

// Message history and statistics
router.route('/')
    .get(messageController.getMessageHistory);

router.route('/stats')
    .get(messageController.getMessageStats);

// Message management
router.route('/:messageId/resend')
    .post(messageController.resendMessage);

router.route('/:messageId')
    .delete(messageController.deleteMessage);

module.exports = router;
