// D:\PRJ_YCT_Final\schema\index.js

// Import all models in dependency order
const User = require('./User');
const Coach = require('./coachSchema');
const Staff = require('./Staff');
const Lead = require('./Lead');
const Task = require('./Task');
const AdCampaign = require('./AdCampaign');
const AdSet = require('./AdSet');
const AdCreative = require('./AdCreative');
const Ad = require('./Ad');
const Payment = require('./Payment');
const Subscription = require('./Subscription');
const Cart = require('./Cart');
const Funnel = require('./Funnel');
const FunnelEvent = require('./FunnelEvent');
const NurturingSequence = require('./NurturingSequence');
const NurturingStep = require('./NurturingStep');
const AutomationRule = require('./AutomationRule');
const CoachAvailability = require('./CoachAvailability');
const Appointment = require('./Appointment');
const CustomDomain = require('./CustomDomain');
const File = require('./File');
const FormSubmissionMessage = require('./FormSubmissionMessage');
const Message = require('./Message');
const Otp = require('./Otp');
const ScoreLog = require('./ScoreLog');
const SequenceLog = require('./SequenceLog');
const SystemLog = require('./SystemLog');
const WhatsAppMessage = require('./whatsappMessageSchema');
const MessageTemplate = require('./MessageTemplate');
const ZoomIntegration = require('./ZoomIntegration');

// Export all models
const models = {
    User,
    Coach,
    Staff,
    Lead,
    Task,
    AdCampaign,
    AdSet,
    AdCreative,
    Ad,
    Payment,
    Subscription,
    Cart,
    Funnel,
    FunnelEvent,
    NurturingSequence,
    NurturingStep,
    AutomationRule,
    CoachAvailability,
    Appointment,
    CustomDomain,
    File,
    FormSubmissionMessage,
    Message,
    Otp,
    ScoreLog,
    SequenceLog,
    SystemLog,
    WhatsAppMessage,
    MessageTemplate,
    ZoomIntegration
};

// Validate all models are properly loaded
Object.entries(models).forEach(([name, model]) => {
    if (!model) {
        console.warn(`⚠️ Warning: Model ${name} is undefined`);
    } else if (typeof model !== 'function') {
        console.warn(`⚠️ Warning: Model ${name} is not a function:`, typeof model);
    } else {
        console.log(`✅ Model ${name} loaded successfully`);
    }
});

module.exports = models;
