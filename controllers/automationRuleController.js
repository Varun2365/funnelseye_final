// D:\PRJ_YCT_Final\controllers\automationRuleController.js

const AutomationRule = require('../schema/AutomationRule');
// The publishEvent function is not needed here
// const { publishEvent } = require('../services/rabbitmqProducer');

/**
 * @desc Create a new automation rule.
 * @route POST /api/automation-rules
 * @access Private (Protected by auth middleware)
 */
exports.createRule = async (req, res) => {
    try {
        const { name, coachId, triggerEvent, triggerCondition, actions } = req.body;

        if (!coachId) {
            return res.status(400).json({ 
                success: false,
                message: 'coachId is required' 
            });
        }

        // Check subscription limits for automation rule creation
        const SubscriptionLimitsMiddleware = require('../middleware/subscriptionLimits');
        const subscriptionData = await SubscriptionLimitsMiddleware.getCoachSubscription(coachId);
        
        if (!subscriptionData) {
            return res.status(403).json({
                success: false,
                message: 'No active subscription found. Please subscribe to a plan to create automation rules.',
                error: 'SUBSCRIPTION_REQUIRED',
                subscriptionRequired: true
            });
        }

        const { features } = subscriptionData;
        const maxAutomationRules = features.maxAutomationRules || features.automationRules || 10;
        
        if (maxAutomationRules !== -1) {
            const currentRuleCount = await AutomationRule.countDocuments({ coachId });
            
            if (currentRuleCount >= maxAutomationRules) {
                const { sendLimitError } = require('../utils/subscriptionLimitErrors');
                return sendLimitError(res, 'AUTOMATION_RULE', 'Automation rule limit reached', currentRuleCount, maxAutomationRules, true);
            }
        }

        // Get the createdBy ID from the authenticated user
        const createdBy = req.user.id;
        
        // Create the new rule in MongoDB
        const newRule = new AutomationRule({ name, coachId, triggerEvent, triggerCondition, actions, createdBy });
        await newRule.save();

        console.log(`[AutomationRuleController] New automation rule created: "${newRule.name}" (ID: ${newRule._id}) by coach ${newRule.coachId}.`);
        
        res.status(201).json(newRule);
    } catch (error) {
        console.error('Error creating automation rule:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @desc Get all automation rules
 * @route GET /api/automation-rules
 * @access Private
 */
exports.getRules = async (req, res) => {
    try {
        const rules = await AutomationRule.find({});
        res.status(200).json(rules);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @desc Get a single automation rule by ID
 * @route GET /api/automation-rules/:id
 * @access Private
 */
exports.getRuleById = async (req, res) => {
    try {
        const rule = await AutomationRule.findById(req.params.id);
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }
        res.status(200).json(rule);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @desc Update an existing automation rule
 * @route PUT /api/automation-rules/:id
 * @access Private
 */
exports.updateRule = async (req, res) => {
    try {
        const rule = await AutomationRule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }
        res.status(200).json(rule);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @desc Delete an automation rule
 * @route DELETE /api/automation-rules/:id
 * @access Private
 */
exports.deleteRule = async (req, res) => {
    try {
        const rule = await AutomationRule.findByIdAndDelete(req.params.id);
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }
        res.status(200).json({ message: 'Rule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @desc Get all available automation events and actions
 * @route GET /api/automation-rules/events-actions
 * @access Public
 */
exports.getEventsAndActions = async (req, res) => {
    try {
        // Extract available events from the AutomationRule schema
        const availableEvents = [
            // Lead & Customer Lifecycle
            {
                value: 'lead_created',
                label: 'Lead Created',
                category: 'Lead & Customer Lifecycle',
                description: 'Triggered when a new lead is created'
            },
            {
                value: 'lead_status_changed',
                label: 'Lead Status Changed',
                category: 'Lead & Customer Lifecycle',
                description: 'Triggered when a lead\'s status is updated'
            },
            {
                value: 'lead_temperature_changed',
                label: 'Lead Temperature Changed',
                category: 'Lead & Customer Lifecycle',
                description: 'Triggered when a lead\'s temperature (hot/warm/cold) changes'
            },
            {
                value: 'lead_converted_to_client',
                label: 'Lead Converted to Client',
                category: 'Lead & Customer Lifecycle',
                description: 'Triggered when a lead becomes a paying client'
            },

            // Funnel & Conversion
            {
                value: 'form_submitted',
                label: 'Form Submitted',
                category: 'Funnel & Conversion',
                description: 'Triggered when a form is submitted'
            },
            {
                value: 'funnel_stage_entered',
                label: 'Funnel Stage Entered',
                category: 'Funnel & Conversion',
                description: 'Triggered when a lead enters a new funnel stage'
            },
            {
                value: 'funnel_stage_exited',
                label: 'Funnel Stage Exited',
                category: 'Funnel & Conversion',
                description: 'Triggered when a lead exits a funnel stage'
            },
            {
                value: 'funnel_completed',
                label: 'Funnel Completed',
                category: 'Funnel & Conversion',
                description: 'Triggered when a lead completes the entire funnel'
            },

            // Appointment & Calendar
            {
                value: 'appointment_booked',
                label: 'Appointment Booked',
                category: 'Appointment & Calendar',
                description: 'Triggered when an appointment is booked'
            },
            {
                value: 'appointment_rescheduled',
                label: 'Appointment Rescheduled',
                category: 'Appointment & Calendar',
                description: 'Triggered when an appointment is rescheduled'
            },
            {
                value: 'appointment_cancelled',
                label: 'Appointment Cancelled',
                category: 'Appointment & Calendar',
                description: 'Triggered when an appointment is cancelled'
            },
            {
                value: 'appointment_reminder_time',
                label: 'Appointment Reminder Time',
                category: 'Appointment & Calendar',
                description: 'Triggered at the scheduled reminder time before an appointment'
            },
            {
                value: 'appointment_finished',
                label: 'Appointment Finished',
                category: 'Appointment & Calendar',
                description: 'Triggered when an appointment is completed'
            },

            // Communication
            {
                value: 'content_consumed',
                label: 'Content Consumed',
                category: 'Communication',
                description: 'Triggered when a lead consumes content (views, downloads, etc.)'
            },

            // Task & System
            {
                value: 'task_created',
                label: 'Task Created',
                category: 'Task & System',
                description: 'Triggered when a new task is created'
            },
            {
                value: 'task_completed',
                label: 'Task Completed',
                category: 'Task & System',
                description: 'Triggered when a task is marked as completed'
            },
            {
                value: 'task_overdue',
                label: 'Task Overdue',
                category: 'Task & System',
                description: 'Triggered when a task becomes overdue'
            },

            // Payment & Subscription
            {
                value: 'payment_successful',
                label: 'Payment Successful',
                category: 'Payment & Subscription',
                description: 'Triggered when a payment is successfully processed'
            },
            {
                value: 'payment_failed',
                label: 'Payment Failed',
                category: 'Payment & Subscription',
                description: 'Triggered when a payment fails'
            },
            {
                value: 'payment_link_clicked',
                label: 'Payment Link Clicked',
                category: 'Payment & Subscription',
                description: 'Triggered when a payment link is clicked'
            },
            {
                value: 'payment_abandoned',
                label: 'Payment Abandoned',
                category: 'Payment & Subscription',
                description: 'Triggered when a payment process is abandoned'
            },
            {
                value: 'invoice_paid',
                label: 'Invoice Paid',
                category: 'Payment & Subscription',
                description: 'Triggered when an invoice is paid'
            },
            {
                value: 'subscription_created',
                label: 'Subscription Created',
                category: 'Payment & Subscription',
                description: 'Triggered when a new subscription is created'
            },
            {
                value: 'subscription_cancelled',
                label: 'Subscription Cancelled',
                category: 'Payment & Subscription',
                description: 'Triggered when a subscription is cancelled'
            },
            {
                value: 'card_expired',
                label: 'Card Expired',
                category: 'Payment & Subscription',
                description: 'Triggered when a payment card expires'
            }
        ];

        // Extract available actions from the AutomationAction schema
        const availableActions = [
            // Lead Data & Funnel Actions
            {
                value: 'update_lead_score',
                label: 'Update Lead Score',
                category: 'Lead Data & Funnel Actions',
                description: 'Update the score of a lead',
                configFields: ['score', 'reason']
            },
            {
                value: 'add_lead_tag',
                label: 'Add Lead Tag',
                category: 'Lead Data & Funnel Actions',
                description: 'Add a tag to a lead',
                configFields: ['tag']
            },
            {
                value: 'remove_lead_tag',
                label: 'Remove Lead Tag',
                category: 'Lead Data & Funnel Actions',
                description: 'Remove a tag from a lead',
                configFields: ['tag']
            },
            {
                value: 'add_to_funnel',
                label: 'Add to Funnel',
                category: 'Lead Data & Funnel Actions',
                description: 'Add a lead to a specific funnel',
                configFields: ['funnelId', 'stageId']
            },
            {
                value: 'move_to_funnel_stage',
                label: 'Move to Funnel Stage',
                category: 'Lead Data & Funnel Actions',
                description: 'Move a lead to a different funnel stage',
                configFields: ['funnelId', 'stageId']
            },
            {
                value: 'remove_from_funnel',
                label: 'Remove from Funnel',
                category: 'Lead Data & Funnel Actions',
                description: 'Remove a lead from a funnel',
                configFields: ['funnelId']
            },
            {
                value: 'update_lead_field',
                label: 'Update Lead Field',
                category: 'Lead Data & Funnel Actions',
                description: 'Update a specific field of a lead',
                configFields: ['field', 'value']
            },
            {
                value: 'create_deal',
                label: 'Create Deal',
                category: 'Lead Data & Funnel Actions',
                description: 'Create a new deal for a lead',
                configFields: ['dealName', 'amount', 'stage']
            },

            // Communication Actions
            {
                value: 'send_whatsapp_message',
                label: 'Send WhatsApp Message',
                category: 'Communication Actions',
                description: 'Send a WhatsApp message to a lead',
                configFields: ['message', 'templateId']
            },
            {
                value: 'create_email_message',
                label: 'Create Email Message',
                category: 'Communication Actions',
                description: 'Create and send an email message',
                configFields: ['subject', 'body', 'templateId']
            },
            {
                value: 'send_internal_notification',
                label: 'Send Internal Notification',
                category: 'Communication Actions',
                description: 'Send an internal notification to team members',
                configFields: ['message', 'recipients']
            },
            {
                value: 'send_push_notification',
                label: 'Send Push Notification',
                category: 'Communication Actions',
                description: 'Send a push notification to a lead',
                configFields: ['title', 'body', 'data']
            },
            {
                value: 'schedule_drip_sequence',
                label: 'Schedule Drip Sequence',
                category: 'Communication Actions',
                description: 'Schedule a drip sequence for a lead',
                configFields: ['sequenceId', 'delay']
            },

            // Task & Workflow Actions
            {
                value: 'create_task',
                label: 'Create Task',
                category: 'Task & Workflow Actions',
                description: 'Create a new task',
                configFields: ['title', 'description', 'assignee', 'dueDate']
            },
            {
                value: 'create_calendar_event',
                label: 'Create Calendar Event',
                category: 'Task & Workflow Actions',
                description: 'Create a calendar event',
                configFields: ['title', 'startTime', 'endTime', 'attendees']
            },
            {
                value: 'add_note_to_lead',
                label: 'Add Note to Lead',
                category: 'Task & Workflow Actions',
                description: 'Add a note to a lead\'s record',
                configFields: ['note', 'noteType']
            },
            {
                value: 'add_followup_date',
                label: 'Add Follow-up Date',
                category: 'Task & Workflow Actions',
                description: 'Schedule a follow-up date for a lead',
                configFields: ['followupDate', 'notes']
            },

            // Zoom Integration Actions
            {
                value: 'create_zoom_meeting',
                label: 'Create Zoom Meeting',
                category: 'Zoom Integration Actions',
                description: 'Create a Zoom meeting',
                configFields: ['topic', 'startTime', 'duration', 'attendees']
            },

            // Payment Actions
            {
                value: 'create_invoice',
                label: 'Create Invoice',
                category: 'Payment Actions',
                description: 'Create an invoice for a lead',
                configFields: ['amount', 'description', 'dueDate']
            },
            {
                value: 'issue_refund',
                label: 'Issue Refund',
                category: 'Payment Actions',
                description: 'Issue a refund for a payment',
                configFields: ['amount', 'reason', 'paymentId']
            },

            // System Actions
            {
                value: 'call_webhook',
                label: 'Call Webhook',
                category: 'System Actions',
                description: 'Call an external webhook',
                configFields: ['url', 'method', 'headers', 'payload']
            },
            {
                value: 'trigger_another_automation',
                label: 'Trigger Another Automation',
                category: 'System Actions',
                description: 'Trigger another automation rule',
                configFields: ['automationRuleId', 'delay']
            }
        ];

        res.status(200).json({
            success: true,
            data: {
                events: availableEvents,
                actions: availableActions,
                categories: {
                    events: [...new Set(availableEvents.map(e => e.category))],
                    actions: [...new Set(availableActions.map(a => a.category))]
                }
            }
        });
    } catch (error) {
        console.error('Error getting automation events and actions:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};