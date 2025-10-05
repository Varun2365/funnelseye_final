// D:\PRJ_YCT_Final\services\automationProcessor.js
const funnelseyeEventEmitter = require('./eventEmitterService');
const AutomationRule = require('../schema/AutomationRule'); // Needed to find rules
// WhatsApp manager moved to dustbin/whatsapp-dump/
const { parseTemplateString } = require('../utils/templateParser'); // The utility we just created
const Lead = require('../schema/Lead'); // Needed for UPDATE_LEAD_STATUS action
const { emailService, smsService, internalNotificationService, aiService } = require('./actionExecutorService');
const centralWhatsAppService = require('./centralWhatsAppService');

const evaluateConditions = (conditions, eventData) => {
    // Simple example: all conditions must be true
    if (!conditions) return true;
    return conditions.every(cond => {
        // Example: { field: 'leadTemperature', op: 'eq', value: 'Hot' }
        if (cond.op === 'eq') return eventData[cond.field] === cond.value;
        if (cond.op === 'ne') return eventData[cond.field] !== cond.value;
        if (cond.op === 'gt') return eventData[cond.field] > cond.value;
        if (cond.op === 'lt') return eventData[cond.field] < cond.value;
        return false;
    });
};

/**
 * Executes a single automation action based on its type and configuration.
 * This is where the actual work for each action (like sending a WhatsApp message) happens.
 *
 * @param {object} action - The action object from an AutomationRule (e.g., { type: 'SEND_WHATSAPP', config: { ... } }).
 * @param {object} eventData - The full event payload that triggered the automation (e.g., { eventType: 'LEAD_CREATED', leadData: { ... }, coachId: '...' }).
 */
const executeAutomationAction = async (action, eventData) => {
    try {
        if (action.conditions && !evaluateConditions(action.conditions, eventData)) {
            console.log('Rule conditions not met. Skipping rule.');
            return;
        }

        // AI-enhanced action execution
        switch (action.type) {
            case 'send_whatsapp_message':
                console.log(`[AutomationProcessor] Executing WhatsApp message action for lead: ${eventData.leadId}`);
                try {
                    // WhatsApp service removed - using centralWhatsAppService only
                    // const unifiedWhatsAppService = require('../whatsapp/services/unifiedWhatsAppService');
                    
                    // Get the coach's default device
                    const WhatsAppDevice = require('../schema/WhatsAppDevice');
                    const device = await WhatsAppDevice.findOne({
                        coachId: eventData.coachId,
                        isDefault: true,
                        isActive: true
                    });

                    if (!device) {
                        console.warn(`[AutomationProcessor] No default WhatsApp device found for coach ${eventData.coachId}`);
                        return;
                    }

                    // Parse template variables
                    const messageContent = parseTemplateString(action.config.message, {
                        name: eventData.name || eventData.leadData?.name,
                        email: eventData.email || eventData.leadData?.email,
                        phone: eventData.phone || eventData.leadData?.phone,
                        company: eventData.company || eventData.leadData?.company
                    });

                    // Send the message using central WhatsApp service
                    await centralWhatsAppService.sendMessage({
                        to: eventData.phone || eventData.leadData?.phone,
                        message: messageContent,
                        type: 'text',
                        senderType: 'automation',
                        senderId: eventData.ruleId,
                        coachId: eventData.coachId
                    });

                    console.log(`[AutomationProcessor] WhatsApp message sent successfully to ${eventData.phone || eventData.leadData?.phone}`);
                } catch (error) {
                    console.error(`[AutomationProcessor] Error sending WhatsApp message:`, error);
                }
                break;

            case 'CREATE_TASK':
                console.log(`[AutomationProcessor] Simulating creating task for lead: ${eventData.leadId}`);
                // Placeholder: In a real application, you'd add logic here to create a task in your database.
                // This would typically involve:
                // - Importing your Task model or a Task service.
                // - Extracting details like `taskTitle`, `description`, `assigneeId`, `priority` from `action.config`.
                // - Using `parseTemplateString` for dynamic task descriptions.
                // - Saving the new task to your database.
                break;

            case 'UPDATE_LEAD_STATUS':
                console.log(`[AutomationProcessor] Attempting to update lead status for lead: ${eventData.leadId}`);
                if (!eventData.leadId || !action.config.newStatus) {
                    console.warn(`[AutomationProcessor] UPDATE_LEAD_STATUS: Missing leadId in eventData or 'newStatus' in action config. Skipping.`);
                    return;
                }
                try {
                    const updatedLead = await Lead.findByIdAndUpdate(
                        eventData.leadId,
                        { status: action.config.newStatus },
                        { new: true, runValidators: true } // 'new: true' returns the updated doc; 'runValidators' ensures schema validation
                    );
                    if (updatedLead) {
                        console.log(`[AutomationProcessor] Successfully updated lead ${eventData.leadId} status to "${action.config.newStatus}".`);
                        // If this update itself should trigger other automations, you'd emit another event here:
                        // funnelseyeEventEmitter.emit('trigger', {
                        //     eventType: 'LEAD_STATUS_CHANGED',
                        //     leadId: updatedLead._id.toString(),
                        //     leadData: updatedLead.toObject(),
                        //     coachId: updatedLead.coachId.toString(),
                        //     previousStatus: eventData.leadData.status // Pass previous status if known
                        // });
                    } else {
                        console.warn(`[AutomationProcessor] UPDATE_LEAD_STATUS: Lead with ID ${eventData.leadId} not found. Status not updated.`);
                    }
                } catch (updateError) {
                    console.error(`[AutomationProcessor] Error updating lead status for ${eventData.leadId}:`, updateError.message);
                }
                break;

            case 'CREATE_EMAIL_MESSAGE':
                await emailService.sendEmail({
                    to: eventData.email,
                    subject: action.config.subject,
                    body: action.config.body
                });
                break;

            case 'CREATE_SMS_MESSAGE':
                await smsService.sendSMS({
                    to: eventData.phone,
                    message: action.config.message
                });
                break;

            case 'ASSIGN_LEAD_TO_COACH':
                console.log(`[AutomationProcessor] Simulating assigning lead ${eventData.leadId} to coach ${action.config.newCoachId}`);
                // Placeholder: Logic to update the lead's assigned coach.
                break;

            case 'SEND_NOTIFICATION':
                await internalNotificationService.sendNotification({
                    recipientId: eventData.userId,
                    message: action.config.message
                });
                break;

            case 'AI_GENERATE_COPY':
                const copyResult = await aiService.generateMarketingCopy(
                    action.config.prompt || 'Generate marketing copy',
                    action.config.options || {}
                );
                
                if (copyResult.success) {
                    // Store generated copy or use it in subsequent actions
                    eventData.generatedCopy = copyResult.content;
                }
                break;

            case 'AI_DETECT_SENTIMENT':
                if (eventData.message) {
                    const sentiment = await aiService.analyzeSentiment(eventData.message);
                    eventData.detectedSentiment = sentiment;
                }
                break;

            case 'AI_SCORE_LEAD':
                if (eventData.leadData) {
                    const insights = await aiService.generateLeadInsights(eventData.leadData);
                    if (insights.success) {
                        eventData.leadInsights = insights.content;
                    }
                }
                break;

            default:
                console.warn(`[AutomationProcessor] Unknown action type: ${action.type}. No action performed.`);
        }
    } catch (error) {
        console.error(`[AutomationProcessor] CRITICAL ERROR executing action ${action.type}:`, error);
    }
};

/**
 * Initializes the automation processor. This function sets up the event listener
 * that will react to events emitted by other parts of your application.
 */
const initAutomationProcessor = () => {
    console.log('[AutomationProcessor] Initializing. Listening for generic "trigger" events...');

    // The 'trigger' event is designed as a universal entry point for all automations.
    // When any part of your app emits 'trigger' with an eventType, this listener activates.
    funnelseyeEventEmitter.on('trigger', async (payload) => {
        const eventName = payload.eventType; // e.g., 'LEAD_CREATED', 'LEAD_STATUS_CHANGED'
        const eventData = payload; // This is the full context data passed with the event

        if (!eventName) {
            console.warn('[AutomationProcessor] Received a "trigger" event without an "eventType" field in its payload. Skipping.');
            return;
        }

        console.log(`\n[AutomationProcessor] Generic 'trigger' event received. Specific eventType: ${eventName}`);

        try {
            // Find all active automation rules that are configured to trigger on this specific eventName.
            const matchingRules = await AutomationRule.find({
                triggerEvent: eventName,
                isActive: true // Only process active rules
            });

            if (matchingRules.length === 0) {
                console.log(`[AutomationProcessor] No active automation rules found for eventType: ${eventName}`);
                return;
            }

            console.log(`[AutomationProcessor] Found ${matchingRules.length} matching rules for eventType: ${eventName}`);

            // Iterate through each rule that matches the triggered event.
            for (const rule of matchingRules) {
                console.log(`[AutomationProcessor] Processing Rule: "${rule.name}" (ID: ${rule._id})`);

                // TODO: (Future Enhancement) Implement 'conditions' evaluation here.
                // If your AutomationRule schema has a 'conditions' field, you'd evaluate them here.
                // If conditions are not met, you would 'continue' to the next rule.
                // Example: if (!evaluateConditions(rule.conditions, eventData)) { console.log('Rule conditions not met. Skipping rule.'); continue; }

                // For each matching rule, execute all its defined actions.
                for (const action of rule.actions) {
                    await executeAutomationAction(action, eventData);
                }
                console.log(`[AutomationProcessor] Finished processing Rule: "${rule.name}".`);
            }
        } catch (error) {
            console.error(`[AutomationProcessor] CRITICAL ERROR during automation rule processing for eventType ${eventName}:`, error);
        }
    });

    console.log(`[AutomationProcessor] Automation processor is ready to process events.`);
};

module.exports = {
    initAutomationProcessor
};