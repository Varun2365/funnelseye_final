const mongoose = require('mongoose');

const adminRequestSchema = new mongoose.Schema({
    requestId: {
        type: String,
        required: true,
        unique: true
    },
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestType: {
        type: String,
        required: true,
        enum: ['level_change', 'sponsor_change', 'team_rank_change', 'president_team_rank_change']
    },
    requestedData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        trim: true,
        default: ''
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: {
        type: Date
    },
    supportingDocuments: [{
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes for efficient querying
adminRequestSchema.index({ coachId: 1 });
adminRequestSchema.index({ status: 1 });
adminRequestSchema.index({ requestType: 1 });
adminRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.models.AdminRequest || mongoose.model('AdminRequest', adminRequestSchema);
