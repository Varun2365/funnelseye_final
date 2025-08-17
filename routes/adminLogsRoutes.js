const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.getSystemLogs);
router.delete('/', adminController.clearSystemLogs);

module.exports = router;
