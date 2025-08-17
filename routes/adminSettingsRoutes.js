const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.getAdminSettings);
router.put('/', adminController.updateAdminSettings);
router.post('/domains', adminController.addDomain);

module.exports = router;
