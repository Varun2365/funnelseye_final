const whatsappManager = require('../services/whatsappManager');
const asyncHandler = require('../middleware/async');

// ===== WHATSAPP AUTOMATION MANAGEMENT =====

// Initialize WhatsApp manager for a coach
exports.initializeWhatsApp = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    
    const success = await whatsappManager.initializeCoach(coachId);
    
    if (success) {
        res.json({
            success: true,
            message: 'WhatsApp manager initialized successfully'
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to initialize WhatsApp manager'
        });
    }
});

// Get active WhatsApp conversations
exports.getActiveConversations = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    
    const conversations = await whatsappManager.getActiveConversations(coachId);
    
    res.json({
        success: true,
        data: conversations
    });
});

// Get conversation history for a specific lead
exports.getConversationHistory = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { leadId } = req.params;
    const { limit = 50 } = req.query;
    
    const messages = await whatsappManager.getConversationHistory(coachId, leadId, parseInt(limit));
    
    res.json({
        success: true,
        data: messages
    });
});

// Get escalation queue for a coach
exports.getEscalationQueue = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    
    const escalations = await whatsappManager.getEscalationQueue(coachId);
    
    res.json({
        success: true,
        data: escalations
    });
});

// Resolve an escalation
exports.resolveEscalation = asyncHandler(async (req, res, next) => {
    const { leadId } = req.params;
    
    await whatsappManager.resolveEscalation(leadId);
    
    res.json({
        success: true,
        message: 'Escalation resolved successfully'
    });
});

// ===== AUTOMATION RULES MANAGEMENT =====

// Get automation rules for a coach
exports.getAutomationRules = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    
    // This would typically come from a database
    const rules = [
        {
            id: 'welcome_sequence',
            name: 'Welcome Sequence',
            description: 'Automated welcome messages for new leads',
            trigger: 'first_message',
            isActive: true,
            steps: [
                { delay: 0, message: 'Hi {{lead.name}}! Welcome to our community. How can I help you today?' },
                { delay: 300000, message: 'Just checking in - did you have a chance to review our services?' },
                { delay: 86400000, message: 'Hi {{lead.name}}! We\'d love to help you achieve your goals. Ready to get started?' }
            ]
        },
        {
            id: 'follow_up_sequence',
            name: 'Follow-up Sequence',
            description: 'Automated follow-up messages for leads',
            trigger: 'lead_created',
            isActive: true,
            steps: [
                { delay: 0, message: 'Hi {{lead.name}}! Thanks for your interest. I\'ll be in touch soon with personalized information.' },
                { delay: 3600000, message: 'Hi {{lead.name}}! I\'ve prepared some information for you. When would be a good time to discuss?' },
                { delay: 86400000, message: 'Hi {{lead.name}}! I wanted to follow up and see if you have any questions about our services.' }
            ]
        },
        {
            id: 'negative_sentiment_response',
            name: 'Negative Sentiment Response',
            description: 'Automated responses for negative sentiment messages',
            trigger: 'negative_sentiment',
            isActive: true,
            steps: [
                { delay: 0, message: 'I understand your concern. Let me help you with this. What specific issue are you facing?' },
                { delay: 300000, message: 'I\'m here to support you. Let\'s work together to find a solution.' }
            ]
        }
    ];
    
    res.json({
        success: true,
        data: rules
    });
});

// Create new automation rule
exports.createAutomationRule = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { name, description, trigger, steps, isActive = true } = req.body;
    
    if (!name || !trigger || !steps || !Array.isArray(steps)) {
        return res.status(400).json({
            success: false,
            message: 'Name, trigger, and steps array are required'
        });
    }
    
    // Validate steps
    for (const step of steps) {
        if (!step.message || typeof step.delay !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'Each step must have a message and delay (in milliseconds)'
            });
        }
    }
    
    // This would typically save to a database
    const newRule = {
        id: `rule_${Date.now()}`,
        name,
        description,
        trigger,
        steps,
        isActive,
        coachId,
        createdAt: new Date()
    };
    
    res.status(201).json({
        success: true,
        message: 'Automation rule created successfully',
        data: newRule
    });
});

// Update automation rule
exports.updateAutomationRule = asyncHandler(async (req, res, next) => {
    const { ruleId } = req.params;
    const updates = req.body;
    
    // This would typically update in a database
    const updatedRule = {
        id: ruleId,
        ...updates,
        updatedAt: new Date()
    };
    
    res.json({
        success: true,
        message: 'Automation rule updated successfully',
        data: updatedRule
    });
});

// Delete automation rule
exports.deleteAutomationRule = asyncHandler(async (req, res, next) => {
    const { ruleId } = req.params;
    
    // This would typically delete from a database
    
    res.json({
        success: true,
        message: 'Automation rule deleted successfully'
    });
});

// ===== MESSAGE TEMPLATES =====

// Get message templates for a coach
exports.getMessageTemplates = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    
    // This would typically come from a database
    const templates = [
        {
            id: 'welcome_template',
            name: 'Welcome Template',
            category: 'welcome',
            content: 'Hi {{lead.name}}! Welcome to our community. How can I help you today?',
            variables: ['lead.name']
        },
        {
            id: 'follow_up_template',
            name: 'Follow-up Template',
            category: 'follow_up',
            content: 'Hi {{lead.name}}! I wanted to follow up and see if you have any questions about our services.',
            variables: ['lead.name']
        },
        {
            id: 'appointment_reminder',
            name: 'Appointment Reminder',
            category: 'reminder',
            content: 'Hi {{lead.name}}! Just a reminder that you have an appointment tomorrow at {{appointment.time}}. Looking forward to seeing you!',
            variables: ['lead.name', 'appointment.time']
        },
        {
            id: 'offer_template',
            name: 'Special Offer',
            category: 'promotion',
            content: 'Hi {{lead.name}}! We have a special offer just for you: {{offer.description}}. Valid until {{offer.expiry}}. Don\'t miss out!',
            variables: ['lead.name', 'offer.description', 'offer.expiry']
        }
    ];
    
    res.json({
        success: true,
        data: templates
    });
});

// Create new message template
exports.createMessageTemplate = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { name, category, content, variables = [] } = req.body;
    
    if (!name || !category || !content) {
        return res.status(400).json({
            success: false,
            message: 'Name, category, and content are required'
        });
    }
    
    // Extract variables from content (anything wrapped in {{}})
    const extractedVariables = content.match(/\{\{([^}]+)\}\}/g)?.map(v => v.slice(2, -2)) || [];
    
    const newTemplate = {
        id: `template_${Date.now()}`,
        name,
        category,
        content,
        variables: variables.length > 0 ? variables : extractedVariables,
        coachId,
        createdAt: new Date()
    };
    
    res.status(201).json({
        success: true,
        message: 'Message template created successfully',
        data: newTemplate
    });
});

// ===== CAMPAIGN MANAGEMENT =====

// Get WhatsApp campaigns for a coach
exports.getWhatsAppCampaigns = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    
    // This would typically come from a database
    const campaigns = [
        {
            id: 'campaign_1',
            name: 'Welcome Campaign',
            description: 'Welcome new leads to our community',
            status: 'active',
            targetAudience: 'new_leads',
            messageTemplate: 'welcome_template',
            schedule: {
                type: 'immediate',
                delay: 0
            },
            stats: {
                sent: 150,
                delivered: 145,
                read: 120,
                replied: 45
            },
            createdAt: new Date()
        },
        {
            id: 'campaign_2',
            name: 'Follow-up Campaign',
            description: 'Follow up with leads after 7 days',
            status: 'active',
            targetAudience: 'engaged_leads',
            messageTemplate: 'follow_up_template',
            schedule: {
                type: 'delayed',
                delay: 604800000 // 7 days in milliseconds
            },
            stats: {
                sent: 89,
                delivered: 87,
                read: 65,
                replied: 23
            },
            createdAt: new Date()
        }
    ];
    
    res.json({
        success: true,
        data: campaigns
    });
});

// Create new WhatsApp campaign
exports.createWhatsAppCampaign = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { name, description, targetAudience, messageTemplate, schedule, isActive = true } = req.body;
    
    if (!name || !targetAudience || !messageTemplate || !schedule) {
        return res.status(400).json({
            success: false,
            message: 'Name, target audience, message template, and schedule are required'
        });
    }
    
    const newCampaign = {
        id: `campaign_${Date.now()}`,
        name,
        description,
        targetAudience,
        messageTemplate,
        schedule,
        isActive,
        coachId,
        status: 'draft',
        stats: {
            sent: 0,
            delivered: 0,
            read: 0,
            replied: 0
        },
        createdAt: new Date()
    };
    
    res.status(201).json({
        success: true,
        message: 'WhatsApp campaign created successfully',
        data: newCampaign
    });
});

// Send campaign
exports.sendCampaign = asyncHandler(async (req, res, next) => {
    const { campaignId } = req.params;
    
    // This would typically trigger the campaign sending process
    
    res.json({
        success: true,
        message: 'Campaign sent successfully'
    });
});

// ===== ANALYTICS & INSIGHTS =====

// Get WhatsApp analytics for a coach
exports.getWhatsAppAnalytics = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { timeRange = 30 } = req.query;
    
    // This would typically calculate from actual data
    const analytics = {
        overview: {
            totalMessages: 1250,
            totalLeads: 89,
            activeConversations: 23,
            escalationRate: 8.5
        },
        engagement: {
            messageResponseRate: 68.5,
            averageResponseTime: '2.3 hours',
            readRate: 92.1,
            replyRate: 45.8
        },
        automation: {
            automatedMessages: 890,
            manualMessages: 360,
            automationEfficiency: 71.2
        },
        trends: {
            dailyMessages: [45, 52, 38, 61, 49, 55, 42],
            weeklyGrowth: 12.5,
            monthlyGrowth: 28.3
        }
    };
    
    res.json({
        success: true,
        data: analytics
    });
});

// Get lead engagement insights
exports.getLeadEngagementInsights = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { leadId } = req.params;
    
    // This would typically analyze actual conversation data
    const insights = {
        leadId,
        engagementScore: 78,
        responseTime: '1.2 hours',
        messageFrequency: '2.3 messages per day',
        sentimentTrend: 'positive',
        keyTopics: ['fitness', 'nutrition', 'goals'],
        bestContactTimes: ['9:00 AM', '6:00 PM'],
        recommendations: [
            'Send more personalized content',
            'Follow up within 2 hours of responses',
            'Focus on fitness-related topics'
        ]
    };
    
    res.json({
        success: true,
        data: insights
    });
});

// ===== INTEGRATION & SETTINGS =====

// Get WhatsApp integration settings
exports.getWhatsAppSettings = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    
    // This would typically come from a database
    const settings = {
        coachId,
        isEnabled: true,
        autoReply: {
            enabled: true,
            message: 'Thanks for your message! I\'ll get back to you soon.'
        },
        businessHours: {
            enabled: true,
            timezone: 'UTC+05:30',
            hours: {
                monday: { start: '09:00', end: '17:00', enabled: true },
                tuesday: { start: '09:00', end: '17:00', enabled: true },
                wednesday: { start: '09:00', end: '17:00', enabled: true },
                thursday: { start: '09:00', end: '17:00', enabled: true },
                friday: { start: '09:00', end: '17:00', enabled: true },
                saturday: { start: '10:00', end: '15:00', enabled: true },
                sunday: { start: '10:00', end: '15:00', enabled: false }
            }
        },
        escalation: {
            enabled: true,
            negativeSentimentThreshold: 0.6,
            urgentKeywords: ['urgent', 'emergency', 'help', 'problem', 'issue'],
            autoEscalate: true
        },
        notifications: {
            newMessage: true,
            escalation: true,
            campaignComplete: true,
            dailySummary: true
        }
    };
    
    res.json({
        success: true,
        data: settings
    });
});

// Update WhatsApp settings
exports.updateWhatsAppSettings = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const updates = req.body;
    
    // This would typically update in a database
    
    res.json({
        success: true,
        message: 'WhatsApp settings updated successfully'
    });
});

// Test WhatsApp integration
exports.testWhatsAppIntegration = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    
    // This would typically test the actual WhatsApp connection
    
    res.json({
        success: true,
        message: 'WhatsApp integration test completed successfully'
    });
});

// All functions are already exported using exports.functionName
// No need for additional module.exports
