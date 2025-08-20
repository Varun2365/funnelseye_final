const mongoose = require('mongoose');

const NurturingSequenceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    steps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NurturingStep' }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.models.NurturingSequence || mongoose.model('NurturingSequence', NurturingSequenceSchema);
