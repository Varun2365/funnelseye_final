const mongoose = require('mongoose');

const SequenceLogSchema = new mongoose.Schema({
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    sequence: { type: mongoose.Schema.Types.ObjectId, ref: 'NurturingSequence', required: true },
    step: { type: mongoose.Schema.Types.ObjectId, ref: 'NurturingStep', required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed', 'skipped'], default: 'pending' },
    sentAt: { type: Date },
    error: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.SequenceLog || mongoose.model('SequenceLog', SequenceLogSchema);
