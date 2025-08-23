// D:\PRJ_YCT_Final\schema\index.js

const mongoose = require('mongoose');

// Import all models in dependency order
const User = require('./User');
// Import schemas that will become discriminators
const coachSchema = require('./coachSchema');
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
const CoachPerformance = require('./CoachPerformance');
const CoachReport = require('./CoachReport');
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

// Create discriminator models after base models are loaded
let Coach;

try {
    // Create Coach as discriminator of User
    if (User && mongoose.models.User) {
        console.log('Creating Coach as discriminator of User model');
        Coach = User.discriminator('coach', coachSchema);
        console.log('✅ Coach discriminator model created successfully');
    } else {
        console.warn('⚠️ User model not available, creating standalone Coach model');
        Coach = mongoose.model('Coach', coachSchema);
    }
} catch (error) {
    console.error('❌ Error creating Coach model:', error.message);
    // Fallback to standalone model
    Coach = mongoose.model('Coach', coachSchema);
}

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
    CoachPerformance,
    CoachReport,
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
        console.log(`✅ Model ${name} loaded successfully (${typeof model})`);
    }
});

// Log discriminator information
if (Coach && User) {
    console.log(`🔗 Coach is discriminator of User: ${Coach.modelName === 'User'}`);
    console.log(`📊 Coach collection: ${Coach.collection.name}`);
    console.log(`📊 User collection: ${User.collection.name}`);
}

module.exports = models;
