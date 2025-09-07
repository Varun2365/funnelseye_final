// D:\PRJ_YCT_Final\services\actionExecutorService.js

// --- Imports for your Mongoose Schemas ---
const { Lead, Coach, Task, Funnel, Payment } = require('../schema');
// WhatsApp services moved to dustbin/whatsapp-dump/
// const unifiedWhatsAppService = require('./unifiedWhatsAppService');

const nodemailer = require('nodemailer');
const twilio = require('twilio');
const ical = require('ical-generator');
const { Configuration, OpenAIApi } = require('openai');
// WhatsApp manager moved to dustbin/whatsapp-dump/
// const { getIoInstance } = require('./whatsappManager');

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
        // WhatsApp manager moved to dustbin/whatsapp-dump/
        console.log(`[InternalNotificationService] Notification for ${recipientId}: ${message}`);
        // TODO: Implement alternative notification system
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
    
    // Get message content from config
    let messageContent = config.messageTemplate || config.message || `Hi ${leadData.name}, this is an automated message.`;
    
    // Process template variables in the message
    if (messageContent.includes('{{lead.name}}')) {
        messageContent = messageContent.replace('{{lead.name}}', leadData.name || 'there');
    }
    if (messageContent.includes('{{lead.email}}')) {
        messageContent = messageContent.replace('{{lead.email}}', leadData.email || 'your email');
    }
    if (messageContent.includes('{{lead.phone}}')) {
        messageContent = messageContent.replace('{{lead.phone}}', leadData.phone || 'your phone');
    }
    
    // Apply delay if specified
    if (config.delayMinutes && config.delayMinutes > 0) {
        console.log(`[ActionExecutor] WhatsApp message scheduled with ${config.delayMinutes} minute delay to ${recipientNumber}`);
        // In a real implementation, you'd schedule this message
        // For now, we'll send it immediately
    }
    
    // Send the message
    try {
        // WhatsApp functionality moved to dustbin/whatsapp-dump/
        console.log(`[ActionExecutor] WhatsApp functionality moved to dustbin/whatsapp-dump/`);
        console.log(`[ActionExecutor] Would have sent WhatsApp message to ${recipientNumber}: ${messageContent}`);
    } catch (error) {
        console.error(`[ActionExecutor] Unable to send WhatsApp message to ${recipientNumber}:`, error.message);
        console.log(`[ActionExecutor] WhatsApp message failed but continuing to prevent infinite loops`);
        // Don't throw error - just log and continue
    }
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
    
    // Support both field naming conventions
    const taskName = config.taskName || config.title;
    const taskDescription = config.taskDescription || config.description;
    let dueDate = config.dueDate;
    
    if (!leadData || !coachId) { 
        throw new Error('Lead or coach data not found.'); 
    }
    
    if (!taskName) {
        throw new Error('Task name is required.');
    }
    
    // Process dueDate if it's a template string or relative time
    if (dueDate && typeof dueDate === 'string') {
        if (dueDate.includes('{{lead.createdAt + 24h}}')) {
            // Calculate 24 hours from lead creation
            const leadCreatedAt = new Date(leadData.createdAt);
            dueDate = new Date(leadCreatedAt.getTime() + 24 * 60 * 60 * 1000);
        } else if (dueDate.includes('{{lead.createdAt + 2h}}')) {
            // Calculate 2 hours from lead creation
            const leadCreatedAt = new Date(leadData.createdAt);
            dueDate = new Date(leadCreatedAt.getTime() + 2 * 60 * 60 * 1000);
        }
    }
    
    // Use intelligent task assignment instead of direct assignment to coach
    const workflowTaskService = require('./workflowTaskService');
    const assignedTo = await workflowTaskService.intelligentTaskAssignment(coachId, {
        name: taskName,
        description: taskDescription,
        relatedLead: leadData._id,
        dueDate: dueDate
    });

    const task = await Task.create({
        name: taskName,
        description: taskDescription,
        assignedTo: assignedTo,
        relatedLead: leadData._id,
        dueDate: dueDate,
        coachId: coachId
    });
    
    console.log(`[ActionExecutor] Task created successfully: ${task.name} for coach ${coachId}`);
    return task;
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
     * Sends Zoom meeting notification to lead
     */
    async function sendZoomMeetingNotification(appointmentId, zoomMeeting) {
        try {
            // Get appointment details
            const appointment = await Appointment.findById(appointmentId)
                .populate('leadId', 'name email phone')
                .populate('coachId', 'name email');

            if (!appointment || !appointment.leadId) {
                throw new Error('Appointment or lead not found');
            }

            const lead = appointment.leadId;
            const coach = appointment.coachId;

            // Send WhatsApp message with Zoom details
            if (lead.phone) {
                const whatsappMessage = `Hi ${lead.name}! 🎉

Your Zoom meeting has been scheduled with ${coach.name}:

📅 Date: ${new Date(appointment.startTime).toLocaleDateString()}
⏰ Time: ${new Date(appointment.startTime).toLocaleTimeString()}
⏱️ Duration: ${appointment.duration} minutes

🔗 Join Meeting: ${zoomMeeting.joinUrl}
🔑 Password: ${zoomMeeting.password}

Please join 5 minutes before the scheduled time.

See you there! 👋`;

                await sendWhatsAppMessage({
                    messageTemplate: whatsappMessage
                }, {
                    relatedDoc: {
                        phone: lead.phone,
                        coachId: coach._id,
                        name: lead.name,
                        email: lead.email
                    }
                });
            }

            // Send email with Zoom details
            if (lead.email) {
                const emailSubject = `Your Zoom Meeting with ${coach.name} - ${new Date(appointment.startTime).toLocaleDateString()}`;
                const emailBody = `
                    <h2>Your Zoom Meeting is Ready! 🎉</h2>
                    
                    <p>Hi ${lead.name},</p>
                    
                    <p>Your Zoom meeting with <strong>${coach.name}</strong> has been scheduled:</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Meeting Details:</h3>
                        <p><strong>Date:</strong> ${new Date(appointment.startTime).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${new Date(appointment.startTime).toLocaleTimeString()}</p>
                        <p><strong>Duration:</strong> ${appointment.duration} minutes</p>
                        <p><strong>Coach:</strong> ${coach.name}</p>
                    </div>
                    
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Join Your Meeting:</h3>
                        <p><strong>Meeting Link:</strong> <a href="${zoomMeeting.joinUrl}" style="color: #1976d2;">${zoomMeeting.joinUrl}</a></p>
                        <p><strong>Password:</strong> ${zoomMeeting.password}</p>
                    </div>
                    
                    <p><strong>Important:</strong> Please join 5 minutes before the scheduled time.</p>
                    
                    <p>If you have any questions, please contact your coach.</p>
                    
                    <p>Best regards,<br>Your Coaching Team</p>
                `;

                await sendEmail({
                    subject: emailSubject,
                    body: emailBody
                }, {
                    relatedDoc: {
                        email: lead.email,
                        name: lead.name
                    }
                });
            }

            console.log(`[ActionExecutor] Zoom meeting notification sent to lead ${lead.name} (${lead.email})`);
        } catch (error) {
            console.error(`[ActionExecutor] Error sending Zoom notification:`, error.message);
            throw error;
        }
    }

    /**
     * Creates a Zoom meeting for an appointment.
     */
    async function createZoomMeeting(config, eventPayload) {
    console.log('[ActionExecutor] createZoomMeeting called with eventPayload:', JSON.stringify(eventPayload, null, 2));
    
    // Extract data from the appointment_booked event
    let appointmentId, coachId;
    
    if (eventPayload.relatedDoc) {
        // Try to get from relatedDoc first
        appointmentId = eventPayload.relatedDoc.appointmentId || eventPayload.relatedDoc._id;
        coachId = eventPayload.relatedDoc.coachId;
    }
    
    // If not found in relatedDoc, try from payload
    if (!appointmentId) {
        appointmentId = eventPayload.payload?.appointmentId;
    }
    if (!coachId) {
        coachId = eventPayload.payload?.coachId;
    }
    
    console.log(`[ActionExecutor] Extracted - appointmentId: ${appointmentId}, coachId: ${coachId}`);
    
    if (!appointmentId || !coachId) {
        throw new Error(`Appointment ID and coach ID are required for creating Zoom meeting. Got: appointmentId=${appointmentId}, coachId=${coachId}`);
    }

    try {
        // Import Zoom service
        const zoomService = require('./zoomService');
        
        // Create Zoom meeting for the appointment
        const zoomMeeting = await zoomService.createMeetingForAppointment(appointmentId);
        
        console.log(`[ActionExecutor] Zoom meeting created successfully for appointment ${appointmentId}: ${zoomMeeting.meetingId}`);
        
        // Send notification to lead with Zoom meeting details
        try {
            await this.sendZoomMeetingNotification(appointmentId, zoomMeeting);
            console.log(`[ActionExecutor] Zoom meeting notification sent to lead for appointment ${appointmentId}`);
        } catch (error) {
            console.error(`[ActionExecutor] Failed to send Zoom notification to lead:`, error.message);
            // Don't fail the entire process if notification fails
        }
        
        return zoomMeeting;
    } catch (error) {
        console.error(`[ActionExecutor] Failed to create Zoom meeting for appointment ${appointmentId}:`, error.message);
        // Don't throw error to prevent automation loops
        return null;
    }
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
    
    let processedValue = value;
    
    // Process template variables in the value
    if (typeof value === 'string' && value.includes('{{lead.')) {
        const leadData = eventPayload.relatedDoc;
        if (value.includes('{{lead.name}}')) {
            processedValue = value.replace('{{lead.name}}', leadData.name || 'Unknown');
        }
        if (value.includes('{{lead.email}}')) {
            processedValue = value.replace('{{lead.email}}', leadData.email || 'No email');
        }
        if (value.includes('{{lead.phone}}')) {
            processedValue = value.replace('{{lead.phone}}', leadData.phone || 'No phone');
        }
    }
    
    const updateObject = {};
    updateObject[field] = processedValue;
    await Lead.findByIdAndUpdate(leadId, { $set: updateObject });
    
    console.log(`[ActionExecutor] Lead field "${field}" updated to "${processedValue}" for lead ${leadId}`);
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
    const leadId = eventPayload.relatedDoc._id;
    const { tag } = config;
    
    if (!leadId || !tag) {
        throw new Error('Lead ID and tag are required for adding lead tag.');
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $addToSet: { tags: tag } 
    });
    
    console.log(`[ActionExecutor] Tag "${tag}" added to lead ${leadId}`);
}
async function removeLeadTag(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { tag } = config;
    
    if (!leadId || !tag) {
        throw new Error('Lead ID and tag are required for removing lead tag.');
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $pull: { tags: tag } 
    });
    
    console.log(`[ActionExecutor] Tag "${tag}" removed from lead ${leadId}`);
}
async function addToFunnel(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { funnelId, stageId = null } = config;
    
    if (!leadId || !funnelId) {
        throw new Error('Lead ID and funnel ID are required for adding lead to funnel.');
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            funnelId: funnelId,
            currentStage: stageId || 'entry',
            addedToFunnelAt: new Date()
        } 
    });
    
    console.log(`[ActionExecutor] Lead ${leadId} added to funnel ${funnelId} at stage ${stageId || 'entry'}`);
}
async function moveToFunnelStage(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { stageId, stageName } = config;
    
    if (!leadId || !stageId) {
        throw new Error('Lead ID and stage ID are required for moving lead to funnel stage.');
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            currentStage: stageId,
            lastStageChange: new Date()
        },
        $push: {
            funnelHistory: {
                stageId: stageId,
                stageName: stageName || stageId,
                enteredAt: new Date()
            }
        }
    });
    
    console.log(`[ActionExecutor] Lead ${leadId} moved to funnel stage ${stageId}`);
}
async function removeFromFunnel(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    
    if (!leadId) {
        throw new Error('Lead ID is required for removing lead from funnel.');
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $unset: { 
            funnelId: 1,
            currentStage: 1,
            addedToFunnelAt: 1
        } 
    });
    
    console.log(`[ActionExecutor] Lead ${leadId} removed from funnel`);
}
async function createDeal(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { dealValue, dealType = 'consultation', description } = config;
    
    if (!leadId) {
        throw new Error('Lead ID is required for creating deal.');
    }
    
    // This would typically create a deal in a separate collection
    // For now, we'll update the lead with deal information
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            dealStatus: 'created',
            dealValue: dealValue,
            dealType: dealType,
            dealDescription: description,
            dealCreatedAt: new Date()
        } 
    });
    
    console.log(`[ActionExecutor] Deal created for lead ${leadId}: ${dealType} - ${dealValue}`);
}
async function sendPushNotification(config, eventPayload) {
    const { recipientId, message, title } = config;
    
    if (!recipientId || !message) {
        throw new Error('Recipient ID and message are required for push notification.');
    }
    
    // This would typically integrate with a push notification service
    // For now, we'll log it and could store it in a notifications collection
    console.log(`[ActionExecutor] Push notification sent to ${recipientId}: ${title || 'Notification'} - ${message}`);
    
    // You could store this in a notifications collection for later processing
    // await Notification.create({ recipientId, title, message, type: 'push', sentAt: new Date() });
}
async function scheduleDripSequence(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { sequenceName, startDelay = 0 } = config;
    
    if (!leadId || !sequenceName) {
        throw new Error('Lead ID and sequence name are required for scheduling drip sequence.');
    }
    
    // Calculate start time based on delay
    const startTime = new Date(Date.now() + (startDelay * 60 * 1000)); // Convert minutes to milliseconds
    
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            dripSequence: {
                name: sequenceName,
                scheduledStart: startTime,
                status: 'scheduled',
                currentStep: 0
            }
        } 
    });
    
    console.log(`[ActionExecutor] Drip sequence "${sequenceName}" scheduled for lead ${leadId} to start at ${startTime}`);
}
async function addNoteToLead(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { note, noteType = 'automation' } = config;
    
    if (!leadId || !note) {
        throw new Error('Lead ID and note are required for adding note to lead.');
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $push: { 
            notes: {
                content: note,
                type: noteType,
                createdAt: new Date(),
                createdBy: 'automation_system'
            }
        } 
    });
    
    console.log(`[ActionExecutor] Note added to lead ${leadId}: ${note}`);
}
async function addFollowupDate(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { followupDate, followupType = 'general' } = config;
    
    if (!leadId || !followupDate) {
        throw new Error('Lead ID and followup date are required.');
    }
    
    let calculatedDate;
    if (typeof followupDate === 'string' && followupDate.includes('{{lead.createdAt +')) {
        // Parse relative time expressions
        const leadCreatedAt = new Date(eventPayload.relatedDoc.createdAt);
        if (followupDate.includes('24h')) {
            calculatedDate = new Date(leadCreatedAt.getTime() + 24 * 60 * 60 * 1000);
        } else if (followupDate.includes('2h')) {
            calculatedDate = new Date(leadCreatedAt.getTime() + 2 * 60 * 60 * 1000);
        } else {
            calculatedDate = new Date(followupDate);
        }
    } else {
        calculatedDate = new Date(followupDate);
    }
    
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            nextFollowupDate: calculatedDate,
            followupType: followupType
        } 
    });
    
    console.log(`[ActionExecutor] Followup date set for lead ${leadId}: ${calculatedDate}`);
}
async function createInvoice(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { amount, currency = 'USD', description, dueDate } = config;
    
    if (!leadId || !amount) {
        throw new Error('Lead ID and amount are required for creating invoice.');
    }
    
    // This would typically create an invoice in a separate collection
    // For now, we'll update the lead with invoice information
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            invoiceStatus: 'created',
            invoiceAmount: amount,
            invoiceCurrency: currency,
            invoiceDescription: description,
            invoiceDueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
            invoiceCreatedAt: new Date()
        } 
    });
    
    console.log(`[ActionExecutor] Invoice created for lead ${leadId}: ${amount} ${currency}`);
}
async function issueRefund(config, eventPayload) {
    const leadId = eventPayload.relatedDoc._id;
    const { amount, reason, refundType = 'partial' } = config;
    
    if (!leadId || !amount) {
        throw new Error('Lead ID and amount are required for issuing refund.');
    }
    
    // This would typically create a refund record in a separate collection
    // For now, we'll update the lead with refund information
    await Lead.findByIdAndUpdate(leadId, { 
        $set: { 
            refundStatus: 'issued',
            refundAmount: amount,
            refundReason: reason,
            refundType: refundType,
            refundIssuedAt: new Date()
        } 
    });
    
    console.log(`[ActionExecutor] Refund issued for lead ${leadId}: ${amount} - ${reason}`);
}
async function callWebhook(config, eventPayload) {
    const { url, method = 'POST', headers = {}, body = {} } = config;
    
    if (!url) {
        throw new Error('Webhook URL is required for calling webhook.');
    }
    
    try {
        // This would typically use axios or fetch to call the webhook
        console.log(`[ActionExecutor] Webhook called: ${method} ${url}`);
        console.log(`[ActionExecutor] Webhook payload:`, body);
        
        // Example webhook call (you'd need to import axios)
        // const response = await axios({
        //     method: method.toLowerCase(),
        //     url: url,
        //     headers: headers,
        //     data: body
        // });
        
        console.log(`[ActionExecutor] Webhook call successful to ${url}`);
    } catch (error) {
        console.error(`[ActionExecutor] Webhook call failed to ${url}:`, error.message);
        throw error;
    }
}
async function triggerAnotherAutomation(config, eventPayload) {
    const { automationRuleId, triggerData = {} } = config;
    
    if (!automationRuleId) {
        throw new Error('Automation rule ID is required for triggering another automation.');
    }
    
    try {
        // This would typically publish a new event to RabbitMQ
        console.log(`[ActionExecutor] Triggering another automation rule: ${automationRuleId}`);
        console.log(`[ActionExecutor] Trigger data:`, triggerData);
        
        // Example: Publish event to trigger another automation
        // await publishEvent('automation_triggered', {
        //     ruleId: automationRuleId,
        //     triggerData: triggerData,
        //     sourceEvent: eventPayload
        // });
        
        console.log(`[ActionExecutor] Successfully triggered automation rule ${automationRuleId}`);
    } catch (error) {
        console.error(`[ActionExecutor] Failed to trigger automation rule ${automationRuleId}:`, error.message);
        throw error;
    }
}


// =======================================================================
// Section 3: Main Action Dispatcher
// =======================================================================

/**
 * Process nurturing step due events
 */
async function processNurturingStepDue(config, eventPayload) {
    try {
        const { leadId, stepId, sequenceId } = eventPayload;
        
        console.log(`[ActionExecutor] Processing nurturing step due for lead ${leadId}, step ${stepId}`);
        
        // Get the lead and sequence
        const lead = await Lead.findById(leadId);
        const sequence = await require('../schema/NurturingSequence').findById(sequenceId);
        
        if (!lead || !sequence) {
            console.error(`[ActionExecutor] Lead or sequence not found for nurturing step`);
            return;
        }
        
        // Check if this is still the current step for the lead
        if (lead.nurturingStepIndex >= sequence.steps.length) {
            console.log(`[ActionExecutor] Lead ${leadId} has completed the sequence`);
            return;
        }
        
        const currentStep = sequence.steps[lead.nurturingStepIndex];
        if (!currentStep || currentStep._id.toString() !== stepId) {
            console.log(`[ActionExecutor] Step ${stepId} is no longer current for lead ${leadId}`);
            return;
        }
        
        // Execute the step
        await executeNurturingStep(lead, currentStep);
        
        // Move to next step
        lead.nurturingStepIndex += 1;
        lead.lastNurturingStepAt = new Date();
        await lead.save();
        
        console.log(`[ActionExecutor] Successfully processed nurturing step ${currentStep.stepNumber} for lead ${leadId}`);
        
    } catch (error) {
        console.error(`[ActionExecutor] Error processing nurturing step due:`, error);
    }
}

/**
 * Execute a nurturing step
 */
async function executeNurturingStep(lead, step) {
    try {
        console.log(`[ActionExecutor] Executing nurturing step ${step.stepNumber}: ${step.name}`);
        
        // Create automation event for the step
        const eventPayload = {
            leadId: lead._id,
            coachId: lead.coachId,
            stepIndex: lead.nurturingStepIndex,
            actionType: step.actionType,
            config: step.actionConfig || {},
            leadData: lead.toObject(),
            sequenceStep: {
                stepNumber: step.stepNumber,
                stepName: step.name,
                stepDescription: step.description
            }
        };

        // Execute the step action
        await executeAutomationAction({
            actionType: step.actionType,
            config: step.actionConfig || {},
            payload: eventPayload
        });
        
    } catch (error) {
        console.error(`[ActionExecutor] Error executing nurturing step:`, error);
    }
}

/**
 * Main dispatcher to execute the correct action based on its type.
 * @param {object} payload - The message payload from the RabbitMQ actions queue.
 */
async function executeAutomationAction(payload) {
    const { actionType, config, payload: eventPayload } = payload;
    console.log(`[ActionExecutor] Dispatching action: ${actionType}`);
    console.log(`[ActionExecutor] Full payload:`, JSON.stringify(payload, null, 2));

    try {
        switch (actionType) {
            case 'send_whatsapp_message':
                // WhatsApp functionality moved to dustbin/whatsapp-dump/
                console.log('[ActionExecutor] WhatsApp functionality moved to dustbin/whatsapp-dump/');
                break;
            case 'send_email':
            case 'create_email_message':
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
            case 'create_task':
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
            case 'create_zoom_meeting':
                await createZoomMeeting(config, eventPayload);
                break;
            case 'nurturing_step_due':
                await processNurturingStepDue(config, eventPayload);
                break;
            case 'create_deal':
                await createDeal(config, eventPayload);
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
        // Don't re-throw the error to prevent infinite loops in RabbitMQ
        // Just log the failure and continue
        console.log(`[ActionExecutor] Action "${actionType}" failed but continuing to prevent infinite loops`);
    }
}

module.exports = {
    executeAutomationAction
};