const asyncHandler = require('../../middleware/async');
const { WhatsAppDevice } = require('../schemas');
const unifiedWhatsAppService = require('../services/unifiedWhatsAppService');
const logger = require('../../utils/logger');

// @desc    Create a new WhatsApp device
// @route   POST /api/whatsapp/devices
// @access  Private
exports.createDevice = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const {
        deviceName,
        deviceType,
        phoneNumber,
        creditsPerMessage = 1,
        monthlyMessageLimit = 1000,
        settings = {}
    } = req.body;

    // Validate device type
    if (!['baileys', 'meta'].includes(deviceType)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid device type. Must be either "baileys" or "meta"'
        });
    }

    // Check if device name already exists for this coach
    const existingDevice = await WhatsAppDevice.findOne({
        coachId,
        deviceName
    });

    if (existingDevice) {
        return res.status(400).json({
            success: false,
            message: 'Device name already exists'
        });
    }

    // Create device
    const device = await WhatsAppDevice.create({
        coachId,
        deviceName,
        deviceType,
        phoneNumber,
        creditsPerMessage,
        monthlyMessageLimit,
        settings
    });

    // If it's the first device, make it default
    const deviceCount = await WhatsAppDevice.countDocuments({ coachId });
    if (deviceCount === 1) {
        await WhatsAppDevice.findByIdAndUpdate(device._id, { isDefault: true });
    }

    res.status(201).json({
        success: true,
        message: 'Device created successfully',
        data: device
    });
});

// @desc    Get all devices for a coach
// @route   GET /api/whatsapp/devices
// @access  Private
exports.getDevices = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { coachId };
    if (status) {
        query.isActive = status === 'active';
    }

    const devices = await WhatsAppDevice.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await WhatsAppDevice.countDocuments(query);

    res.status(200).json({
        success: true,
        data: devices,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get single device
// @route   GET /api/whatsapp/devices/:id
// @access  Private
exports.getDevice = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const deviceId = req.params.id;

    const device = await WhatsAppDevice.findOne({
        _id: deviceId,
        coachId
    });

    if (!device) {
        return res.status(404).json({
            success: false,
            message: 'Device not found'
        });
    }

    // Get connection status
    const connectionStatus = await unifiedWhatsAppService.getConnectionStatus(deviceId);

    res.status(200).json({
        success: true,
        data: {
            ...device.toObject(),
            connectionStatus
        }
    });
});

// @desc    Update device
// @route   PUT /api/whatsapp/devices/:id
// @access  Private
exports.updateDevice = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const deviceId = req.params.id;
    const updateData = req.body;

    const device = await WhatsAppDevice.findOne({
        _id: deviceId,
        coachId
    });

    if (!device) {
        return res.status(404).json({
            success: false,
            message: 'Device not found'
        });
    }

    // Don't allow changing device type after creation
    if (updateData.deviceType && updateData.deviceType !== device.deviceType) {
        return res.status(400).json({
            success: false,
            message: 'Device type cannot be changed after creation'
        });
    }

    // Check if device name already exists (if being changed)
    if (updateData.deviceName && updateData.deviceName !== device.deviceName) {
        const existingDevice = await WhatsAppDevice.findOne({
            coachId,
            deviceName: updateData.deviceName,
            _id: { $ne: deviceId }
        });

        if (existingDevice) {
            return res.status(400).json({
                success: false,
                message: 'Device name already exists'
            });
        }
    }

    const updatedDevice = await WhatsAppDevice.findByIdAndUpdate(
        deviceId,
        updateData,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Device updated successfully',
        data: updatedDevice
    });
});

// @desc    Delete device
// @route   DELETE /api/whatsapp/devices/:id
// @access  Private
exports.deleteDevice = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const deviceId = req.params.id;

    const device = await WhatsAppDevice.findOne({
        _id: deviceId,
        coachId
    });

    if (!device) {
        return res.status(404).json({
            success: false,
            message: 'Device not found'
        });
    }

    // Delete device from service
    await unifiedWhatsAppService.deleteDevice(deviceId);

    res.status(200).json({
        success: true,
        message: 'Device deleted successfully'
    });
});

// @desc    Initialize device connection
// @route   POST /api/whatsapp/devices/:id/initialize
// @access  Private
exports.initializeDevice = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const deviceId = req.params.id;

    const device = await WhatsAppDevice.findOne({
        _id: deviceId,
        coachId
    });

    if (!device) {
        return res.status(404).json({
            success: false,
            message: 'Device not found'
        });
    }

    if (!device.isActive) {
        return res.status(400).json({
            success: false,
            message: 'Device is not active'
        });
    }

    const result = await unifiedWhatsAppService.initializeDevice(deviceId);

    res.status(200).json({
        success: true,
        message: 'Device initialized successfully',
        data: result
    });
});

// @desc    Get QR code for Baileys device
// @route   GET /api/whatsapp/devices/:id/qr
// @access  Private
exports.getQRCode = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const deviceId = req.params.id;

    const device = await WhatsAppDevice.findOne({
        _id: deviceId,
        coachId
    });

    if (!device) {
        return res.status(404).json({
            success: false,
            message: 'Device not found'
        });
    }

    if (device.deviceType !== 'baileys') {
        return res.status(400).json({
            success: false,
            message: 'QR code is only available for Baileys devices'
        });
    }

    const qrCode = await unifiedWhatsAppService.getQRCode(deviceId);

    if (!qrCode) {
        return res.status(404).json({
            success: false,
            message: 'QR code not available. Please initialize the device first.'
        });
    }

    res.status(200).json({
        success: true,
        data: {
            qrCode,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        }
    });
});

// @desc    Disconnect device
// @route   POST /api/whatsapp/devices/:id/disconnect
// @access  Private
exports.disconnectDevice = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const deviceId = req.params.id;

    const device = await WhatsAppDevice.findOne({
        _id: deviceId,
        coachId
    });

    if (!device) {
        return res.status(404).json({
            success: false,
            message: 'Device not found'
        });
    }

    const result = await unifiedWhatsAppService.disconnectDevice(deviceId);

    res.status(200).json({
        success: true,
        message: 'Device disconnected successfully',
        data: result
    });
});

// @desc    Set device as default
// @route   POST /api/whatsapp/devices/:id/set-default
// @access  Private
exports.setDefaultDevice = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const deviceId = req.params.id;

    const device = await WhatsAppDevice.findOne({
        _id: deviceId,
        coachId
    });

    if (!device) {
        return res.status(404).json({
            success: false,
            message: 'Device not found'
        });
    }

    // Update all devices to not default
    await WhatsAppDevice.updateMany(
        { coachId },
        { isDefault: false }
    );

    // Set this device as default
    await WhatsAppDevice.findByIdAndUpdate(deviceId, { isDefault: true });

    res.status(200).json({
        success: true,
        message: 'Default device updated successfully'
    });
});

// @desc    Get device statistics
// @route   GET /api/whatsapp/devices/:id/stats
// @access  Private
exports.getDeviceStats = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const deviceId = req.params.id;

    const device = await WhatsAppDevice.findOne({
        _id: deviceId,
        coachId
    });

    if (!device) {
        return res.status(404).json({
            success: false,
            message: 'Device not found'
        });
    }

    const stats = await unifiedWhatsAppService.getDeviceStats(deviceId);

    res.status(200).json({
        success: true,
        data: stats
    });
});

// @desc    Update device settings
// @route   PUT /api/whatsapp/devices/:id/settings
// @access  Private
exports.updateDeviceSettings = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const deviceId = req.params.id;
    const { settings } = req.body;

    const device = await WhatsAppDevice.findOne({
        _id: deviceId,
        coachId
    });

    if (!device) {
        return res.status(404).json({
            success: false,
            message: 'Device not found'
        });
    }

    const updatedDevice = await WhatsAppDevice.findByIdAndUpdate(
        deviceId,
        { settings },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Device settings updated successfully',
        data: updatedDevice
    });
});
