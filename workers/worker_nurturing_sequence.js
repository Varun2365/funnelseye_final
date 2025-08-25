const mongoose = require('mongoose');
const Lead = require('../schema/Lead');
const NurturingSequence = require('../schema/NurturingSequence');
const nurturingService = require('../services/nurturingService');
const { publishEvent } = require('../services/rabbitmqProducer');

/**
 * Nurturing Sequence Worker
 * Processes nurturing sequences and executes immediate steps
 */

async function processNurturingSequences() {
    try {
        console.log('[NurturingWorker] Starting nurturing sequence processing...');
        
        // Find leads with active nurturing sequences
        const leads = await Lead.find({ 
            nurturingSequence: { $ne: null },
            status: { $ne: 'Client' } // Don't process converted leads
        }).populate('nurturingSequence');

        console.log(`[NurturingWorker] Found ${leads.length} leads with nurturing sequences`);

        for (const lead of leads) {
            try {
                await processLeadNurturing(lead);
            } catch (error) {
                console.error(`[NurturingWorker] Error processing lead ${lead._id}:`, error.message);
            }
        }

        console.log('[NurturingWorker] Completed nurturing sequence processing');
    } catch (error) {
        console.error('[NurturingWorker] Error in main processing loop:', error);
    }
}

async function processLeadNurturing(lead) {
    try {
        if (!lead.nurturingSequence || !lead.nurturingSequence.isActive) {
            return;
        }

        const sequence = lead.nurturingSequence;
        
        // Check if lead has completed the sequence
        if (lead.nurturingStepIndex >= sequence.steps.length) {
            console.log(`[NurturingWorker] Lead ${lead._id} completed sequence "${sequence.name}"`);
            return;
        }

        const currentStep = sequence.steps[lead.nurturingStepIndex];
        if (!currentStep || !currentStep.isActive) {
            // Skip inactive steps
            lead.nurturingStepIndex += 1;
            await lead.save();
            return await processLeadNurturing(lead);
        }

        // Check if it's time to execute this step
        if (await shouldExecuteStep(lead, currentStep)) {
            console.log(`[NurturingWorker] Executing step ${currentStep.stepNumber} for lead ${lead._id}`);
            
            // Execute the step immediately
            await executeNurturingStep(lead, currentStep);
            
            // Move to next step
            lead.nurturingStepIndex += 1;
            await lead.save();

            // Schedule next step if it has delay
            if (lead.nurturingStepIndex < sequence.steps.length) {
                const nextStep = sequence.steps[lead.nurturingStepIndex];
                if (nextStep.delayDays > 0 || nextStep.delayHours > 0) {
                    await scheduleNextStep(lead, nextStep);
                }
            }
        }
    } catch (error) {
        console.error(`[NurturingWorker] Error processing lead ${lead._id}:`, error);
    }
}

async function shouldExecuteStep(lead, step) {
    // Immediate execution for 0-delay steps
    if (step.delayDays === 0 && step.delayHours === 0) {
        return true;
    }

    // Check if enough time has passed since the last step
    const lastStepTime = lead.lastNurturingStepAt || lead.updatedAt || lead.createdAt;
    const delayMs = (step.delayDays * 24 * 60 * 60 * 1000) + (step.delayHours * 60 * 60 * 1000);
    const dueTime = new Date(lastStepTime.getTime() + delayMs);

    return new Date() >= dueTime;
}

async function executeNurturingStep(lead, step) {
    try {
        console.log(`[NurturingWorker] Executing step ${step.stepNumber}: ${step.name} for lead ${lead._id}`);

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

        // Publish to automation system
        await publishEvent('funnelseye_actions', 'lead.nurture', {
            actionType: step.actionType,
            config: step.actionConfig || {},
            payload: eventPayload
        });

        // Update last step execution time
        lead.lastNurturingStepAt = new Date();
        await lead.save();

        console.log(`[NurturingWorker] Successfully executed step ${step.stepNumber} for lead ${lead._id}`);
        return true;
    } catch (error) {
        console.error(`[NurturingWorker] Error executing step ${step.stepNumber} for lead ${lead._id}:`, error);
        return false;
    }
}

async function scheduleNextStep(lead, step) {
    try {
        const delayMs = (step.delayDays * 24 * 60 * 60 * 1000) + (step.delayHours * 60 * 60 * 1000);
        const scheduledTime = new Date(Date.now() + delayMs);

        await publishEvent('funnelseye_actions', 'nurturing_step_due', {
            leadId: lead._id,
            stepId: step._id,
            sequenceId: lead.nurturingSequence,
            scheduledTime: scheduledTime
        });

        console.log(`[NurturingWorker] Scheduled step ${step.stepNumber} for lead ${lead._id} at ${scheduledTime}`);
    } catch (error) {
        console.error(`[NurturingWorker] Error scheduling next step for lead ${lead._id}:`, error);
    }
}

/**
 * Initialize the nurturing worker
 * This function is called by main.js to start the worker
 */
function initNurturingWorker() {
    console.log('[NurturingWorker] Initializing nurturing sequence worker...');
    
    // Run every 2 minutes for immediate processing
    setInterval(processNurturingSequences, 2 * 60 * 1000);

    // For immediate run (for testing)
    processNurturingSequences();

    console.log('[NurturingWorker] Nurturing sequence worker started. Processing every 2 minutes.');

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
        console.log('[NurturingWorker] Received SIGTERM. Shutting down gracefully...');
        process.exit(0);
    });

    process.on('SIGINT', () => {
        console.log('[NurturingWorker] Received SIGINT. Shutting down gracefully...');
        process.exit(0);
    });
}

// Export the initialization function
module.exports = initNurturingWorker;
