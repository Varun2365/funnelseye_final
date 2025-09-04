const asyncHandler = require('../../middleware/async');
const { WhatsAppTemplate } = require('../schemas');
const logger = require('../../utils/logger');

// @desc    Create a new WhatsApp template
// @route   POST /api/whatsapp/templates
// @access  Private
exports.createTemplate = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const {
        name,
        category = 'custom',
        language = 'en',
        content,
        variables = [],
        tags = []
    } = req.body;

    // Validate required fields
    if (!name || !content || !content.body) {
        return res.status(400).json({
            success: false,
            message: 'Name and content body are required'
        });
    }

    // Check if template name already exists for this coach
    const existingTemplate = await WhatsAppTemplate.findOne({
        coachId,
        name
    });

    if (existingTemplate) {
        return res.status(400).json({
            success: false,
            message: 'Template name already exists'
        });
    }

    // Create template
    const template = await WhatsAppTemplate.create({
        coachId,
        name,
        category,
        language,
        content,
        variables,
        tags
    });

    res.status(201).json({
        success: true,
        message: 'Template created successfully',
        data: template
    });
});

// @desc    Get all templates for a coach
// @route   GET /api/whatsapp/templates
// @access  Private
exports.getTemplates = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { 
        page = 1, 
        limit = 10, 
        category, 
        status = 'all',
        isActive = true 
    } = req.query;

    const query = { coachId };

    // Filter by category
    if (category) {
        query.category = category;
    }

    // Filter by status
    if (status !== 'all') {
        query.status = status;
    }

    // Filter by active status
    if (isActive !== 'all') {
        query.isActive = isActive === 'true';
    }

    const templates = await WhatsAppTemplate.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await WhatsAppTemplate.countDocuments(query);

    res.status(200).json({
        success: true,
        data: templates,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get single template
// @route   GET /api/whatsapp/templates/:id
// @access  Private
exports.getTemplate = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const templateId = req.params.id;

    const template = await WhatsAppTemplate.findOne({
        _id: templateId,
        coachId
    });

    if (!template) {
        return res.status(404).json({
            success: false,
            message: 'Template not found'
        });
    }

    res.status(200).json({
        success: true,
        data: template
    });
});

// @desc    Update template
// @route   PUT /api/whatsapp/templates/:id
// @access  Private
exports.updateTemplate = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const templateId = req.params.id;
    const updateData = req.body;

    const template = await WhatsAppTemplate.findOne({
        _id: templateId,
        coachId
    });

    if (!template) {
        return res.status(404).json({
            success: false,
            message: 'Template not found'
        });
    }

    // Check if template name already exists (if being changed)
    if (updateData.name && updateData.name !== template.name) {
        const existingTemplate = await WhatsAppTemplate.findOne({
            coachId,
            name: updateData.name,
            _id: { $ne: templateId }
        });

        if (existingTemplate) {
            return res.status(400).json({
                success: false,
                message: 'Template name already exists'
            });
        }
    }

    const updatedTemplate = await WhatsAppTemplate.findByIdAndUpdate(
        templateId,
        updateData,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Template updated successfully',
        data: updatedTemplate
    });
});

// @desc    Delete template
// @route   DELETE /api/whatsapp/templates/:id
// @access  Private
exports.deleteTemplate = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const templateId = req.params.id;

    const template = await WhatsAppTemplate.findOne({
        _id: templateId,
        coachId
    });

    if (!template) {
        return res.status(404).json({
            success: false,
            message: 'Template not found'
        });
    }

    await WhatsAppTemplate.findByIdAndDelete(templateId);

    res.status(200).json({
        success: true,
        message: 'Template deleted successfully'
    });
});

// @desc    Get template categories
// @route   GET /api/whatsapp/templates/categories
// @access  Private
exports.getTemplateCategories = asyncHandler(async (req, res, next) => {
    const categories = [
        {
            value: 'marketing',
            label: 'Marketing',
            description: 'Promotional and marketing messages'
        },
        {
            value: 'support',
            label: 'Support',
            description: 'Customer support and help messages'
        },
        {
            value: 'appointment',
            label: 'Appointment',
            description: 'Booking and scheduling messages'
        },
        {
            value: 'reminder',
            label: 'Reminder',
            description: 'Reminder and follow-up messages'
        },
        {
            value: 'welcome',
            label: 'Welcome',
            description: 'Welcome and onboarding messages'
        },
        {
            value: 'custom',
            label: 'Custom',
            description: 'Custom templates for specific use cases'
        }
    ];

    res.status(200).json({
        success: true,
        data: categories
    });
});

// @desc    Get template variables
// @route   GET /api/whatsapp/templates/variables
// @access  Private
exports.getTemplateVariables = asyncHandler(async (req, res, next) => {
    const variables = [
        {
            name: '{{name}}',
            description: 'Customer/Lead name',
            example: 'John Doe'
        },
        {
            name: '{{email}}',
            description: 'Customer/Lead email',
            example: 'john@example.com'
        },
        {
            name: '{{phone}}',
            description: 'Customer/Lead phone number',
            example: '+1234567890'
        },
        {
            name: '{{company}}',
            description: 'Company name',
            example: 'Funnelseye'
        },
        {
            name: '{{date}}',
            description: 'Current date',
            example: '2024-01-15'
        },
        {
            name: '{{time}}',
            description: 'Current time',
            example: '14:30'
        },
        {
            name: '{{appointment_date}}',
            description: 'Appointment date',
            example: '2024-01-20'
        },
        {
            name: '{{appointment_time}}',
            description: 'Appointment time',
            example: '15:00'
        },
        {
            name: '{{booking_link}}',
            description: 'Booking/calendar link',
            example: 'https://calendly.com/...'
        },
        {
            name: '{{website}}',
            description: 'Website URL',
            example: 'https://funnelseye.com'
        },
        {
            name: '{{coach_name}}',
            description: 'Coach name',
            example: 'Sarah Johnson'
        },
        {
            name: '{{coach_email}}',
            description: 'Coach email',
            example: 'sarah@funnelseye.com'
        },
        {
            name: '{{coach_phone}}',
            description: 'Coach phone number',
            example: '+1234567890'
        }
    ];

    res.status(200).json({
        success: true,
        data: variables
    });
});

// @desc    Duplicate template
// @route   POST /api/whatsapp/templates/:id/duplicate
// @access  Private
exports.duplicateTemplate = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const templateId = req.params.id;
    const { newName } = req.body;

    const template = await WhatsAppTemplate.findOne({
        _id: templateId,
        coachId
    });

    if (!template) {
        return res.status(404).json({
            success: false,
            message: 'Template not found'
        });
    }

    if (!newName) {
        return res.status(400).json({
            success: false,
            message: 'New name is required'
        });
    }

    // Check if new name already exists
    const existingTemplate = await WhatsAppTemplate.findOne({
        coachId,
        name: newName
    });

    if (existingTemplate) {
        return res.status(400).json({
            success: false,
            message: 'Template name already exists'
        });
    }

    // Create duplicate template
    const duplicateTemplate = await WhatsAppTemplate.create({
        coachId,
        name: newName,
        category: template.category,
        language: template.language,
        content: template.content,
        variables: template.variables,
        tags: template.tags,
        status: 'draft' // Always start as draft
    });

    res.status(201).json({
        success: true,
        message: 'Template duplicated successfully',
        data: duplicateTemplate
    });
});

// @desc    Update template usage count
// @route   POST /api/whatsapp/templates/:id/use
// @access  Private
exports.useTemplate = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const templateId = req.params.id;

    const template = await WhatsAppTemplate.findOne({
        _id: templateId,
        coachId
    });

    if (!template) {
        return res.status(404).json({
            success: false,
            message: 'Template not found'
        });
    }

    if (!template.isActive) {
        return res.status(400).json({
            success: false,
            message: 'Template is not active'
        });
    }

    // Update usage count and last used date
    await WhatsAppTemplate.findByIdAndUpdate(templateId, {
        $inc: { usageCount: 1 },
        lastUsed: new Date()
    });

    res.status(200).json({
        success: true,
        message: 'Template usage updated',
        data: {
            usageCount: template.usageCount + 1,
            lastUsed: new Date()
        }
    });
});

// @desc    Get template statistics
// @route   GET /api/whatsapp/templates/stats
// @access  Private
exports.getTemplateStats = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;

    const stats = await WhatsAppTemplate.aggregate([
        { $match: { coachId } },
        {
            $group: {
                _id: null,
                totalTemplates: { $sum: 1 },
                activeTemplates: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
                draftTemplates: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
                approvedTemplates: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
                totalUsage: { $sum: '$usageCount' }
            }
        }
    ]);

    // Get category breakdown
    const categoryStats = await WhatsAppTemplate.aggregate([
        { $match: { coachId } },
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
                usage: { $sum: '$usageCount' }
            }
        }
    ]);

    // Get most used templates
    const mostUsedTemplates = await WhatsAppTemplate.find({ coachId })
        .sort({ usageCount: -1 })
        .limit(5)
        .select('name category usageCount lastUsed');

    res.status(200).json({
        success: true,
        data: {
            summary: stats[0] || {
                totalTemplates: 0,
                activeTemplates: 0,
                draftTemplates: 0,
                approvedTemplates: 0,
                totalUsage: 0
            },
            categoryBreakdown: categoryStats,
            mostUsedTemplates
        }
    });
});

// @desc    Search templates
// @route   GET /api/whatsapp/templates/search
// @access  Private
exports.searchTemplates = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { q, category, status } = req.query;

    const query = { coachId };

    // Text search
    if (q) {
        query.$or = [
            { name: { $regex: q, $options: 'i' } },
            { 'content.body': { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
        ];
    }

    // Filter by category
    if (category) {
        query.category = category;
    }

    // Filter by status
    if (status) {
        query.status = status;
    }

    const templates = await WhatsAppTemplate.find(query)
        .sort({ usageCount: -1, createdAt: -1 })
        .limit(20);

    res.status(200).json({
        success: true,
        data: templates
    });
});
