const asyncHandler = require('../../middleware/async');
const { EmailConfig } = require('../schemas');
const emailService = require('../services/emailService');
const logger = require('../../utils/logger');

// @desc    Create a new email configuration
// @route   POST /api/whatsapp/email/configs
// @access  Private
exports.createEmailConfig = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const {
        name,
        provider,
        smtp,
        from,
        replyTo,
        dailyLimit = 1000,
        settings = {}
    } = req.body;

    // Validate required fields
    if (!name || !provider || !smtp || !from) {
        return res.status(400).json({
            success: false,
            message: 'Name, provider, SMTP settings, and from details are required'
        });
    }

    // Check if config name already exists for this coach
    const existingConfig = await EmailConfig.findOne({
        coachId,
        name
    });

    if (existingConfig) {
        return res.status(400).json({
            success: false,
            message: 'Configuration name already exists'
        });
    }

    // Create email configuration
    const config = await EmailConfig.create({
        coachId,
        name,
        provider,
        smtp,
        from,
        replyTo,
        dailyLimit,
        settings
    });

    // If it's the first config, make it default
    const configCount = await EmailConfig.countDocuments({ coachId });
    if (configCount === 1) {
        await EmailConfig.findByIdAndUpdate(config._id, { isDefault: true });
    }

    res.status(201).json({
        success: true,
        message: 'Email configuration created successfully',
        data: config
    });
});

// @desc    Get all email configurations for a coach
// @route   GET /api/whatsapp/email/configs
// @access  Private
exports.getEmailConfigs = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { coachId };
    if (status) {
        query.isActive = status === 'active';
    }

    const configs = await EmailConfig.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-smtp.auth.pass'); // Don't return password

    const total = await EmailConfig.countDocuments(query);

    res.status(200).json({
        success: true,
        data: configs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get single email configuration
// @route   GET /api/whatsapp/email/configs/:id
// @access  Private
exports.getEmailConfig = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const configId = req.params.id;

    const config = await EmailConfig.findOne({
        _id: configId,
        coachId
    });

    if (!config) {
        return res.status(404).json({
            success: false,
            message: 'Email configuration not found'
        });
    }

    res.status(200).json({
        success: true,
        data: config
    });
});

// @desc    Update email configuration
// @route   PUT /api/whatsapp/email/configs/:id
// @access  Private
exports.updateEmailConfig = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const configId = req.params.id;
    const updateData = req.body;

    const config = await EmailConfig.findOne({
        _id: configId,
        coachId
    });

    if (!config) {
        return res.status(404).json({
            success: false,
            message: 'Email configuration not found'
        });
    }

    // Check if config name already exists (if being changed)
    if (updateData.name && updateData.name !== config.name) {
        const existingConfig = await EmailConfig.findOne({
            coachId,
            name: updateData.name,
            _id: { $ne: configId }
        });

        if (existingConfig) {
            return res.status(400).json({
                success: false,
                message: 'Configuration name already exists'
            });
        }
    }

    const updatedConfig = await EmailConfig.findByIdAndUpdate(
        configId,
        updateData,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Email configuration updated successfully',
        data: updatedConfig
    });
});

// @desc    Delete email configuration
// @route   DELETE /api/whatsapp/email/configs/:id
// @access  Private
exports.deleteEmailConfig = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const configId = req.params.id;

    const config = await EmailConfig.findOne({
        _id: configId,
        coachId
    });

    if (!config) {
        return res.status(404).json({
            success: false,
            message: 'Email configuration not found'
        });
    }

    // Delete transporter if exists
    await emailService.deleteTransporter(configId);

    await EmailConfig.findByIdAndDelete(configId);

    res.status(200).json({
        success: true,
        message: 'Email configuration deleted successfully'
    });
});

// @desc    Test email configuration
// @route   POST /api/whatsapp/email/configs/:id/test
// @access  Private
exports.testEmailConfig = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const configId = req.params.id;
    const { testEmail } = req.body;

    const config = await EmailConfig.findOne({
        _id: configId,
        coachId
    });

    if (!config) {
        return res.status(404).json({
            success: false,
            message: 'Email configuration not found'
        });
    }

    if (!testEmail) {
        return res.status(400).json({
            success: false,
            message: 'Test email address is required'
        });
    }

    // Test connection
    const connectionTest = await emailService.testConnection(configId);

    if (!connectionTest.success) {
        return res.status(400).json({
            success: false,
            message: 'Connection test failed',
            error: connectionTest.error
        });
    }

    // Send test email
    const testEmailData = {
        to: testEmail,
        subject: 'Test Email from Funnelseye',
        text: 'This is a test email to verify your email configuration is working correctly.',
        html: '<h1>Test Email</h1><p>This is a test email to verify your email configuration is working correctly.</p>'
    };

    const result = await emailService.sendEmail(configId, testEmailData);

    res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
        data: {
            connectionTest,
            emailResult: result
        }
    });
});

// @desc    Set email configuration as default
// @route   POST /api/whatsapp/email/configs/:id/set-default
// @access  Private
exports.setDefaultEmailConfig = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const configId = req.params.id;

    const config = await EmailConfig.findOne({
        _id: configId,
        coachId
    });

    if (!config) {
        return res.status(404).json({
            success: false,
            message: 'Email configuration not found'
        });
    }

    // Update all configs to not default
    await EmailConfig.updateMany(
        { coachId },
        { isDefault: false }
    );

    // Set this config as default
    await EmailConfig.findByIdAndUpdate(configId, { isDefault: true });

    res.status(200).json({
        success: true,
        message: 'Default email configuration updated successfully'
    });
});

// @desc    Send email
// @route   POST /api/whatsapp/email/send
// @access  Private
exports.sendEmail = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const {
        configId,
        to,
        subject,
        text,
        html,
        options = {}
    } = req.body;

    // Validate required fields
    if (!to || !subject || (!text && !html)) {
        return res.status(400).json({
            success: false,
            message: 'Recipient, subject, and content (text or html) are required'
        });
    }

    // If no configId provided, use default config
    let targetConfigId = configId;
    if (!targetConfigId) {
        const defaultConfig = await EmailConfig.findOne({
            coachId,
            isDefault: true,
            isActive: true
        });
        if (defaultConfig) {
            targetConfigId = defaultConfig._id;
        }
    }

    if (!targetConfigId) {
        return res.status(400).json({
            success: false,
            message: 'No email configuration specified and no default configuration found'
        });
    }

    // Verify config belongs to coach
    const config = await EmailConfig.findOne({
        _id: targetConfigId,
        coachId
    });

    if (!config) {
        return res.status(404).json({
            success: false,
            message: 'Email configuration not found'
        });
    }

    if (!config.isActive) {
        return res.status(400).json({
            success: false,
            message: 'Email configuration is not active'
        });
    }

    const emailData = {
        to,
        subject,
        text,
        html
    };

    const result = await emailService.sendEmail(targetConfigId, emailData);

    res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        data: result
    });
});

// @desc    Send bulk email
// @route   POST /api/whatsapp/email/send-bulk
// @access  Private
exports.sendBulkEmail = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const {
        configId,
        emails,
        options = {}
    } = req.body;

    // Validate required fields
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Emails array is required and must not be empty'
        });
    }

    // Validate each email
    for (const email of emails) {
        if (!email.to || !email.subject || (!email.text && !email.html)) {
            return res.status(400).json({
                success: false,
                message: 'Each email must have recipient, subject, and content (text or html)'
            });
        }
    }

    // If no configId provided, use default config
    let targetConfigId = configId;
    if (!targetConfigId) {
        const defaultConfig = await EmailConfig.findOne({
            coachId,
            isDefault: true,
            isActive: true
        });
        if (defaultConfig) {
            targetConfigId = defaultConfig._id;
        }
    }

    if (!targetConfigId) {
        return res.status(400).json({
            success: false,
            message: 'No email configuration specified and no default configuration found'
        });
    }

    // Verify config belongs to coach
    const config = await EmailConfig.findOne({
        _id: targetConfigId,
        coachId
    });

    if (!config) {
        return res.status(404).json({
            success: false,
            message: 'Email configuration not found'
        });
    }

    if (!config.isActive) {
        return res.status(400).json({
            success: false,
            message: 'Email configuration is not active'
        });
    }

    const result = await emailService.sendBulkEmail(targetConfigId, emails);

    res.status(200).json({
        success: true,
        message: 'Bulk email sent successfully',
        data: result
    });
});

// @desc    Send template email
// @route   POST /api/whatsapp/email/send-template
// @access  Private
exports.sendTemplateEmail = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const {
        configId,
        template,
        variables = {},
        emailData,
        options = {}
    } = req.body;

    // Validate required fields
    if (!template || !emailData || !emailData.to) {
        return res.status(400).json({
            success: false,
            message: 'Template, email data, and recipient are required'
        });
    }

    // If no configId provided, use default config
    let targetConfigId = configId;
    if (!targetConfigId) {
        const defaultConfig = await EmailConfig.findOne({
            coachId,
            isDefault: true,
            isActive: true
        });
        if (defaultConfig) {
            targetConfigId = defaultConfig._id;
        }
    }

    if (!targetConfigId) {
        return res.status(400).json({
            success: false,
            message: 'No email configuration specified and no default configuration found'
        });
    }

    // Verify config belongs to coach
    const config = await EmailConfig.findOne({
        _id: targetConfigId,
        coachId
    });

    if (!config) {
        return res.status(404).json({
            success: false,
            message: 'Email configuration not found'
        });
    }

    const result = await emailService.sendTemplateEmail(targetConfigId, template, variables, emailData);

    res.status(200).json({
        success: true,
        message: 'Template email sent successfully',
        data: result
    });
});

// @desc    Get email configuration statistics
// @route   GET /api/whatsapp/email/configs/:id/stats
// @access  Private
exports.getEmailConfigStats = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const configId = req.params.id;

    const config = await EmailConfig.findOne({
        _id: configId,
        coachId
    });

    if (!config) {
        return res.status(404).json({
            success: false,
            message: 'Email configuration not found'
        });
    }

    const stats = await emailService.getConfigStats(configId);

    res.status(200).json({
        success: true,
        data: stats
    });
});

// @desc    Get email provider configurations
// @route   GET /api/whatsapp/email/providers
// @access  Private
exports.getEmailProviders = asyncHandler(async (req, res, next) => {
    const providers = [
        {
            name: 'gmail',
            displayName: 'Gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requiresAuth: true
        },
        {
            name: 'outlook',
            displayName: 'Outlook/Hotmail',
            host: 'smtp-mail.outlook.com',
            port: 587,
            secure: false,
            requiresAuth: true
        },
        {
            name: 'yahoo',
            displayName: 'Yahoo Mail',
            host: 'smtp.mail.yahoo.com',
            port: 587,
            secure: false,
            requiresAuth: true
        },
        {
            name: 'sendgrid',
            displayName: 'SendGrid',
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            requiresAuth: true
        },
        {
            name: 'mailgun',
            displayName: 'Mailgun',
            host: 'smtp.mailgun.org',
            port: 587,
            secure: false,
            requiresAuth: true
        },
        {
            name: 'aws-ses',
            displayName: 'Amazon SES',
            host: 'email-smtp.us-east-1.amazonaws.com',
            port: 587,
            secure: false,
            requiresAuth: true
        },
        {
            name: 'custom',
            displayName: 'Custom SMTP',
            host: '',
            port: 587,
            secure: false,
            requiresAuth: true
        }
    ];

    res.status(200).json({
        success: true,
        data: providers
    });
});
