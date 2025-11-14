// PRJ_YCT_Final/schema/AutomationRule.js

const mongoose = require('mongoose');

// Sub-schema for trigger conditions
const TriggerConditionSchema = new mongoose.Schema({
    field: {
        type: String,
        required: true
    },
    operator: {
        type: String,
        required: true,
        enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty', 'in', 'not_in']
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, { _id: false });

// Sub-schema for individual actions within an automation rule
const AutomationActionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            // Lead Data & Funnel Actions
            'update_lead_score',
            'add_lead_tag',
            'remove_lead_tag',
            'add_to_funnel',
            'move_to_funnel_stage',
            'remove_from_funnel',
            'update_lead_field',
            'update_lead_status',
            'assign_lead_to_staff',
            'create_deal',

            // Communication Actions
            'send_whatsapp_message',
            'send_email_message',
            'send_sms_message',
            'send_internal_notification',
            'send_push_notification',
            'schedule_drip_sequence',

            // Task & Workflow Actions
            'create_task',
            'create_multiple_tasks',
            'create_calendar_event',
            'add_note_to_lead',
            'add_followup_date',

            // Zoom Integration Actions
            'create_zoom_meeting',

            // Payment Actions
            'create_invoice',
            'issue_refund',

            // System Actions
            'call_webhook',
            'trigger_another_automation',
            'wait_delay'
        ]
    },
    config: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    delay: {
        type: Number,
        default: 0,
        description: 'Delay in seconds before executing this action'
    },
    order: {
        type: Number,
        default: 0,
        description: 'Order of execution for this action'
    }
}, { _id: false });

// Main schema for an automation rule
const AutomationRuleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    triggerEvent: {
        type: String,
        required: true,
        enum: [
            // Lead & Customer Lifecycle
            'lead_created',
            'lead_status_changed',
            'lead_temperature_changed',
            'lead_converted_to_client',
            'lead_updated',
            'lead_tag_added',
            'lead_tag_removed',

            // Funnel & Conversion
            'form_submitted',
            'funnel_stage_entered',
            'funnel_stage_exited',
            'funnel_completed',
            'funnel_page_viewed',

            // Appointment & Calendar
            'appointment_booked',
            'appointment_rescheduled',
            'appointment_cancelled',
            'appointment_reminder_time',
            'appointment_finished',
            'appointment_no_show',

            // Communication
            'content_consumed',
            'email_opened',
            'email_clicked',
            'email_bounced',
            'whatsapp_message_received',
            'whatsapp_message_sent',
            'sms_received',
            'sms_sent',

            // Task & System
            'task_created',
            'task_completed',
            'task_overdue',
            'task_assigned',

            // Payment & Subscription
            'payment_successful',
            'payment_failed',
            'payment_link_clicked',
            'payment_abandoned',
            'invoice_paid',
            'invoice_sent',
            'invoice_overdue',
            'subscription_created',
            'subscription_renewed',
            'subscription_cancelled',
            'subscription_expired',
            'card_expired',
            'refund_issued'
        ]
    },
    triggerConditions: {
        type: [TriggerConditionSchema],
        default: []
    },
    triggerConditionLogic: {
        type: String,
        enum: ['AND', 'OR'],
        default: 'AND',
        description: 'Logic operator for multiple conditions (AND = all must match, OR = any can match)'
    },
    actions: {
        type: [AutomationActionSchema],
        required: true,
        default: []
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const AutomationRule = mongoose.models.AutomationRule || mongoose.model('AutomationRule', AutomationRuleSchema);

module.exports = AutomationRule;