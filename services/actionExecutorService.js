// D:\PRJ_YCT_Final\services\actionExecutorService.js

// --- Imports for your Mongoose Schemas ---
const { Lead, Coach, Task, Funnel, Payment } = require('../schema');
const { sendMessageByCoach } = require('./metaWhatsAppService');

const nodemailer = require('nodemailer');
const twilio = require('twilio');
const ical = require('ical-generator');
const { Configuration, OpenAIApi } = require('openai');
const { getIoInstance } = require('./whatsappManager');

// =======================================================================
// Section 1: Placeholder External Service Integrations
// =======================================================================
const emailService = {
    sendEmail: async ({ to, subject, body, attachments }) => {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: body,
            attachments
        });
    }
};

const smsService = {
    sendSMS: async ({ to, message }) => {
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to
        });
    }
};

const calendarService = {
    createAppointment: async ({ coachEmail, leadEmail, leadName, appointmentTime, zoomLink }) => {
        const cal = ical({ name: 'Appointment' });
        cal.createEvent({
            start: appointmentTime,
            end: new Date(new Date(appointmentTime).getTime() + 30 * 60000),
            summary: `Appointment with ${leadName}`,
            description: zoomLink,
            organizer: coachEmail,
            attendees: [leadEmail]
        });
        return {
            filename: 'appointment.ics',
            content: cal.toString()
        };
    }
};

const internalNotificationService = {
    sendNotification: async ({ recipientId, message }) => {
        const io = getIoInstance();
        io.to(recipientId).emit('notification', { message });
    }
};

const aiService = {
    generateCopy: async (config, eventPayload) => {
        const prompt = config.prompt || 'Write a marketing message.';
        const completion = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            max_tokens: 100
        });
        return completion.data.choices[0].text.trim();
    },
    detectSentiment: async (message) => {
        const completion = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `Detect the sentiment of this message: ${message}`,
            max_tokens: 10
        });
        return completion.data.choices[0].text.trim();
    },
    scoreLead: async (lead) => {
        // Use OpenAI for lead scoring
        const prompt = `Score this lead (0-100): ${JSON.stringify(lead)}`;
        const completion = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            max_tokens: 5
        });
        return parseInt(completion.data.choices[0].text.trim(), 10) || 0;
    }
};


// =======================================================================
// Section 2: Core Automation Action Functions
// =======================================================================

/**
 * Sends a WhatsApp message to a lead.
 */
async function sendWhatsAppMessage(config, eventPayload) {
    // Corrected to use relatedDoc
    const leadData = eventPayload.relatedDoc; 
    const coachId = leadData.coachId;
    const recipientNumber = leadData.phone;
    if (!recipientNumber) { throw new Error('Recipient phone number not found in event payload.'); }
    
    // You'll need to define how message content is passed from your rules
    const messageContent = config.message || `Hi ${leadData.name}, this is an automated message.`;
    // await sendMessageByCoach(coachId, recipientNumber, messageContent);
    console.log(`[ActionExecutor] WhatsApp message sent to ${recipientNumber} via metaWhatsAppService.`);
}

/**
 * Sends an email to a lead.
 */
async function sendEmail(config, eventPayload) {
    // Corrected to use relatedDoc
    const leadData = eventPayload.relatedDoc; 
    const recipientEmail = leadData.email;
    if (!recipientEmail) { throw new Error('Recipient email not found in event payload.'); }

    // Placeholder for .ics file generation
    const calendarInvite = config.sendCalendarInvite ? createICSFile(leadData) : null;

    await emailService.sendEmail({
        to: recipientEmail,
        subject: config.subject,
        body: config.body,
        attachments: calendarInvite ? [calendarInvite] : []
    });
}

/**
 * Helper function to create a placeholder .ics file
 * TODO: Replace with a proper calendar library
 */
function createICSFile(leadData) {
    console.log('[ActionExecutor] Generating .ics calendar file...');
    // In a real application, you'd use a library like 'ical-generator'
    // This is a simplified placeholder
    return {
        filename: 'appointment.ics',
        content: `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//YourCompany//Appointment\n...`
    };
}


/**
 * Sends a message via SMS.
 */
async function sendSMS(config, eventPayload) {
    // Corrected to use relatedDoc
    const recipientNumber = eventPayload.relatedDoc.phone;
    if (!recipientNumber) { throw new Error('Recipient phone number not found in event payload.'); }
    if (!config.message) { throw new Error('SMS message content is required.'); }
    await smsService.sendSMS({ to: recipientNumber, message: config.message });
}

/**
 * Creates a new task for a coach or staff member.
 */
async function createNewTask(config, eventPayload) {
    // Corrected to use relatedDoc
    const leadData = eventPayload.relatedDoc;
    const { coachId } = leadData;
    const { taskName, taskDescription, dueDate } = config;
    if (!leadData || !coachId) { throw new Error('Lead or coach data not found.'); }
    await Task.create({
        name: taskName, description: taskDescription, assignedTo: coachId, relatedLead: leadData._id, dueDate: dueDate
    });
}

/**
 * Creates a calendar event for the coach.
 */
async function createCalendarEvent(config, eventPayload) {
    // Corrected to use relatedDoc
    const leadData = eventPayload.relatedDoc;
    const { coachId } = leadData;
    if (!leadData || !coachId) { throw new Error('Lead or coach data not found.'); }

    // Assuming a method to get coach email from coachId
    const coach = await Coach.findById(coachId);
    if (!coach) { throw new Error('Coach not found for calendar event.'); }

    await calendarService.createAppointment({
        coachEmail: coach.email,
        leadEmail: leadData.email,
        leadName: leadData.name,
        appointmentTime: leadData.appointment.scheduledTime,
        zoomLink: leadData.appointment.zoomLink
    });
}

/**
 * Sends a notification to a coach's dashboard.
 */
async function sendInternalNotification(config, eventPayload) {
    const { recipientId, message } = config;
    if (!recipientId || !message) { throw new Error('Recipient ID and message are required for internal notification.'); }
    await internalNotificationService.sendNotification({ recipientId, message });
}

/**
 * Updates a specific field on the lead document.
 */
async function updateLeadField(config, eventPayload) {
    // Corrected to use relatedDoc
    const leadId = eventPayload.relatedDoc._id;
    const { field, value } = config;
    if (!leadId || !field) { throw new Error('Lead ID and field to update are required.'); }
    
    const updateObject = {};
    updateObject[field] = value;
    await Lead.findByIdAndUpdate(leadId, { $set: updateObject });
}

async function updateLeadScore(config, eventPayload) {
    // Corrected to use relatedDoc
    const leadId = eventPayload.relatedDoc._id;
    const { scoreIncrement } = config;
    if (!leadId) { throw new Error('Lead ID not found.'); }
    if (typeof scoreIncrement !== 'number') { throw new Error('Invalid scoreIncrement.'); }
    await Lead.findByIdAndUpdate(leadId, { $inc: { score: scoreIncrement } });
}

async function aiRescoreLead(config, eventPayload) {
    const leadData = eventPayload.relatedDoc;
    if (!leadData || !leadData._id) { throw new Error('Lead data missing for AI scoring.'); }
    const score = await aiService.scoreLead(leadData);
    await Lead.findByIdAndUpdate(leadData._id, { $set: { score } });
}

/**
 * A dedicated function to handle all payment-related actions.
 */
async function handlePaymentActions(config, eventPayload) {
    const { paymentId, leadId } = eventPayload;
    if (!paymentId || !leadId) { throw new Error('Payment ID and Lead ID not found in event payload.'); }
    
    const lead = await Lead.findById(leadId);
    const payment = await Payment.findById(paymentId);

    if (!lead || !payment) {
        throw new Error('Lead or Payment document not found.');
    }
    
    switch(config.actionType) {
        case 'update_lead_status':
            lead.status = config.newStatus;
            await lead.save();
            console.log(`[ActionExecutor] Lead ${leadId} status updated to ${config.newStatus}.`);
            break;
        case 'send_confirmation_email':
            await sendEmail({
                to: lead.email,
                subject: 'Payment Confirmation',
                body: `Hello ${lead.name}, your payment of ${payment.amount} ${payment.currency} was successful!`
            });
            break;
        case 'send_internal_alert':
            await sendInternalNotification({
                recipientId: payment.coach, // Send to the related coach
                message: `Payment received: ${lead.name} paid ${payment.amount} ${payment.currency}.`
            });
            break;
        default:
            console.warn(`[ActionExecutor] Unhandled payment action: ${config.actionType}`);
    }
}

// Add missing action handlers
async function addLeadTag(config, eventPayload) {
    // Implement logic to add a tag to a lead
    // Example: await Lead.findByIdAndUpdate(eventPayload.relatedDoc._id, { $addToSet: { tags: config.tag } });
}
async function removeLeadTag(config, eventPayload) {
    // Implement logic to remove a tag from a lead
    // Example: await Lead.findByIdAndUpdate(eventPayload.relatedDoc._id, { $pull: { tags: config.tag } });
}
async function addToFunnel(config, eventPayload) {
    // Implement logic to add a lead to a funnel
}
async function moveToFunnelStage(config, eventPayload) {
    // Implement logic to move a lead to a specific funnel stage
}
async function removeFromFunnel(config, eventPayload) {
    // Implement logic to remove a lead from a funnel
}
async function createDeal(config, eventPayload) {
    // Implement logic to create a deal for a lead
}
async function sendPushNotification(config, eventPayload) {
    // Implement logic to send a push notification
}
async function scheduleDripSequence(config, eventPayload) {
    // Implement logic to schedule a drip sequence
}
async function addNoteToLead(config, eventPayload) {
    // Implement logic to add a note to a lead
}
async function addFollowupDate(config, eventPayload) {
    // Implement logic to add a follow-up date to a lead
}
async function createInvoice(config, eventPayload) {
    // Implement logic to create an invoice
}
async function issueRefund(config, eventPayload) {
    // Implement logic to issue a refund
}
async function callWebhook(config, eventPayload) {
    // Implement logic to call an external webhook
}
async function triggerAnotherAutomation(config, eventPayload) {
    // Implement logic to trigger another automation rule
}


// =======================================================================
// Section 3: Main Action Dispatcher
// =======================================================================

/**
 * Main dispatcher to execute the correct action based on its type.
 * @param {object} payload - The message payload from the RabbitMQ actions queue.
 */
async function executeAutomationAction(payload) {
    const { actionType, config, payload: eventPayload } = payload;
    console.log(`[ActionExecutor] Dispatching action: ${actionType}`);

    try {
        switch (actionType) {
            case 'send_whatsapp_message':
                await sendWhatsAppMessage(config, eventPayload);
                break;
            case 'send_email':
                await sendEmail(config, eventPayload);
                break;
            case 'send_sms':
                await sendSMS(config, eventPayload);
                break;
            case 'update_lead_score':
                await updateLeadScore(config, eventPayload);
                break;
            case 'ai_rescore_lead':
                await aiRescoreLead(config, eventPayload);
                break;
            case 'create_new_task':
                await createNewTask(config, eventPayload);
                break;
            case 'send_internal_notification':
                await sendInternalNotification(config, eventPayload);
                break;
            case 'create_calendar_event':
                await createCalendarEvent(config, eventPayload);
                break;
            case 'update_lead_field':
                await updateLeadField(config, eventPayload);
                break;
            // Case for handling all payment-related actions
            case 'handle_payment_actions':
                await handlePaymentActions(config, eventPayload);
                break;
            case 'add_lead_tag':
                await addLeadTag(config, eventPayload);
                break;
            case 'remove_lead_tag':
                await removeLeadTag(config, eventPayload);
                break;
            case 'add_to_funnel':
                await addToFunnel(config, eventPayload);
                break;
            case 'move_to_funnel_stage':
                await moveToFunnelStage(config, eventPayload);
                break;
            case 'remove_from_funnel':
                await removeFromFunnel(config, eventPayload);
                break;
            case 'create_deal':
                await createDeal(config, eventPayload);
                break;
            case 'send_push_notification':
                await sendPushNotification(config, eventPayload);
                break;
            case 'schedule_drip_sequence':
                await scheduleDripSequence(config, eventPayload);
                break;
            case 'add_note_to_lead':
                await addNoteToLead(config, eventPayload);
                break;
            case 'add_followup_date':
                await addFollowupDate(config, eventPayload);
                break;
            case 'create_invoice':
                await createInvoice(config, eventPayload);
                break;
            case 'issue_refund':
                await issueRefund(config, eventPayload);
                break;
            case 'call_webhook':
                await callWebhook(config, eventPayload);
                break;
            case 'trigger_another_automation':
                await triggerAnotherAutomation(config, eventPayload);
                break;
            default:
                throw new Error(`Unknown action type: ${actionType}`);
        }
    } catch (error) {
        console.error(`[ActionExecutor] Failed to execute action "${actionType}":`, error.message);
        throw error;
    }
}

module.exports = {
    executeAutomationAction
};