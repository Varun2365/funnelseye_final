const Lead = require('../schema/Lead');
const NurturingSequence = require('../schema/NurturingSequence');
const NurturingStep = require('../schema/NurturingStep');
const SequenceLog = require('../schema/SequenceLog');

// Assign a nurturing sequence to a lead
async function assignSequenceToLead(leadId, sequenceId) {
    await Lead.findByIdAndUpdate(leadId, {
        nurturingSequence: sequenceId,
        nurturingStepIndex: 0
    });
}

// Progress the lead to the next step in the sequence
async function progressLeadStep(lead) {
    if (!lead.nurturingSequence) return;
    const sequence = await NurturingSequence.findById(lead.nurturingSequence).populate('steps');
    if (!sequence || !sequence.steps || lead.nurturingStepIndex >= sequence.steps.length) return;
    const step = await NurturingStep.findById(sequence.steps[lead.nurturingStepIndex]);
    if (!step) return;
    await sendNurturingStep(lead, step);
    // Log the step
    await SequenceLog.create({
        lead: lead._id,
        sequence: sequence._id,
        step: step._id,
        status: 'sent',
        sentAt: new Date()
    });
    // Move to next step
    await Lead.findByIdAndUpdate(lead._id, { $inc: { nurturingStepIndex: 1 } });
}

// Send the nurturing step (stub for now)
async function sendNurturingStep(lead, step) {
    // Implement actual sending logic (email, WhatsApp, SMS, etc.)
    // For now, just log
    console.log(`Sending ${step.type} to lead ${lead._id}: ${step.content}`);
}

// Get the current sequence status for a lead
async function getLeadSequenceStatus(leadId) {
    const lead = await Lead.findById(leadId).populate('nurturingSequence');
    if (!lead || !lead.nurturingSequence) return null;
    return {
        sequence: lead.nurturingSequence,
        currentStep: lead.nurturingStepIndex
    };
}

module.exports = {
    assignSequenceToLead,
    progressLeadStep,
    sendNurturingStep,
    getLeadSequenceStatus
};
