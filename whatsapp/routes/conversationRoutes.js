const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Conversation routes
router.route('/')
    .get(messageController.getConversations);

router.route('/:conversationId/read')
    .post(messageController.markConversationAsRead);

router.route('/:conversationId/messages')
    .get(messageController.getMessages);

module.exports = router;
