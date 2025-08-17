const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const adminAuth = require('../middleware/adminAuth');

router.post('/login', adminAuthController.login);
router.get('/me', adminAuth, adminAuthController.me);
router.post('/logout', adminAuthController.logout);

module.exports = router;
