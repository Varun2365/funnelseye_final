const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { protect } = require('../../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Device management routes
router.route('/')
    .post(deviceController.createDevice)
    .get(deviceController.getDevices);

router.route('/:id')
    .get(deviceController.getDevice)
    .put(deviceController.updateDevice)
    .delete(deviceController.deleteDevice);

// Device connection routes
router.route('/:id/initialize')
    .post(deviceController.initializeDevice);

router.route('/:id/qr')
    .get(deviceController.getQRCode);

router.route('/:id/disconnect')
    .post(deviceController.disconnectDevice);

router.route('/:id/set-default')
    .post(deviceController.setDefaultDevice);

router.route('/:id/stats')
    .get(deviceController.getDeviceStats);

router.route('/:id/settings')
    .put(deviceController.updateDeviceSettings);

module.exports = router;
