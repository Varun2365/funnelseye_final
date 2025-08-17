const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.getUsers);
router.put('/:id', adminController.updateUser);
router.patch('/:id/status', adminController.updateUserStatus);

module.exports = router;
