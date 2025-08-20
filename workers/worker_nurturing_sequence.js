const mongoose = require('mongoose');
const Lead = require('../schema/Lead');
const nurturingService = require('../services/nurturingService');

// Connect to DB (assume config elsewhere)
// mongoose.connect(...)

async function processNurturingSequences() {
    // Find leads with active nurturing sequences
    const leads = await Lead.find({ nurturingSequence: { $ne: null } });
    for (const lead of leads) {
        // TODO: Check delay since last step (for now, just progress)
        await nurturingService.progressLeadStep(lead);
    }
}

// Run every 5 minutes
setInterval(processNurturingSequences, 5 * 60 * 1000);

// For immediate run (for testing)
processNurturingSequences();
