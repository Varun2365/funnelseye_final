const mongoose = require('mongoose');

const mlmCommissionDistributionSchema = new mongoose.Schema({
    distributionId: {
        type: String,
        required: true,
        unique: true
    },
    
    // Source Transaction
    sourceTransactionId: {
        type: String,
        required: true
    },
    
    sourceTransaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CentralPaymentHandler',
        required: true
    },
    
    // Commission Period
    commissionPeriod: {
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },
        year: {
            type: Number,
            required: true
        }
    },
    
    // Commission Structure (Admin Configurable)
    commissionStructure: {
        level1: {
            percentage: { type: Number, required: true, min: 0, max: 100 },
            maxAmount: { type: Number, min: 0 },
            description: { type: String, default: 'Direct Referral Commission' }
        },
        level2: {
            percentage: { type: Number, required: true, min: 0, max: 100 },
            maxAmount: { type: Number, min: 0 },
            description: { type: String, default: 'Second Level Commission' }
        },
        level3: {
            percentage: { type: Number, required: true, min: 0, max: 100 },
            maxAmount: { type: Number, min: 0 },
            description: { type: String, default: 'Third Level Commission' }
        },
        level4: {
            percentage: { type: Number, required: true, min: 0, max: 100 },
            maxAmount: { type: Number, min: 0 },
            description: { type: String, default: 'Fourth Level Commission' }
        },
        level5: {
            percentage: { type: Number, required: true, min: 0, max: 100 },
            maxAmount: { type: Number, min: 0 },
            description: { type: String, default: 'Fifth Level Commission' }
        },
        level6: {
            percentage: { type: Number, required: true, min: 0, max: 100 },
            maxAmount: { type: Number, min: 0 },
            description: { type: String, default: 'Sixth Level Commission' }
        },
        level7: {
            percentage: { type: Number, required: true, min: 0, max: 100 },
            maxAmount: { type: Number, min: 0 },
            description: { type: String, default: 'Seventh Level Commission' }
        },
        level8: {
            percentage: { type: Number, required: true, min: 0, max: 100 },
            maxAmount: { type: Number, min: 0 },
            description: { type: String, default: 'Eighth Level Commission' }
        },
        level9: {
            percentage: { type: Number, required: true, min: 0, max: 100 },
            maxAmount: { type: Number, min: 0 },
            description: { type: String, default: 'Ninth Level Commission' }
        },
        level10: {
            percentage: { type: Number, required: true, min: 0, max: 100 },
            maxAmount: { type: Number, min: 0 },
            description: { type: String, default: 'Tenth Level Commission' }
        }
    },
    
    // Individual Commission Entries
    commissionEntries: [{
        coachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        
        coachEmail: {
            type: String,
            required: true
        },
        
        coachName: {
            type: String,
            required: true
        },
        
        level: {
            type: Number,
            required: true,
            min: 1,
            max: 10
        },
        
        sponsorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        
        sponsorEmail: {
            type: String
        },
        
        sponsorName: {
            type: String
        },
        
        // Commission Calculation
        baseAmount: {
            type: Number,
            required: true,
            min: 0
        },
        
        commissionPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        
        commissionAmount: {
            type: Number,
            required: true,
            min: 0
        },
        
        maxCommissionAmount: {
            type: Number,
            min: 0
        },
        
        finalCommissionAmount: {
            type: Number,
            required: true,
            min: 0
        },
        
        // Commission Status
        status: {
            type: String,
            enum: ['pending', 'approved', 'paid', 'cancelled', 'expired'],
            default: 'pending'
        },
        
        // Payout Information
        payoutMethod: {
            type: String,
            enum: ['bank_transfer', 'paypal', 'stripe_connect', 'wallet', 'other']
        },
        
        payoutDate: {
            type: Date
        },
        
        payoutReference: {
            type: String,
            trim: true
        },
        
        payoutStatus: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        },
        
        // Notes and Metadata
        notes: {
            type: String,
            trim: true
        },
        
        eligibilityReason: {
            type: String,
            trim: true
        },
        
        disqualificationReason: {
            type: String,
            trim: true
        }
    }],
    
    // Summary Statistics
    summary: {
        totalEligibleCoaches: {
            type: Number,
            default: 0
        },
        
        totalCommissionAmount: {
            type: Number,
            default: 0
        },
        
        totalPaidAmount: {
            type: Number,
            default: 0
        },
        
        totalPendingAmount: {
            type: Number,
            default: 0
        },
        
        averageCommissionPerCoach: {
            type: Number,
            default: 0
        },
        
        highestCommissionAmount: {
            type: Number,
            default: 0
        },
        
        lowestCommissionAmount: {
            type: Number,
            default: 0
        }
    },
    
    // Processing Information
    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    
    processedAt: {
        type: Date
    },
    
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Approval Information
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'auto_approved'],
        default: 'pending'
    },
    
    approvedAt: {
        type: Date
    },
    
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    approvalNotes: {
        type: String,
        trim: true
    },
    
    // Payout Schedule
    payoutSchedule: {
        type: String,
        enum: ['instant', 'daily', 'weekly', 'monthly', 'manual'],
        default: 'monthly'
    },
    
    nextPayoutDate: {
        type: Date
    },
    
    lastPayoutDate: {
        type: Date
    },
    
    // Metadata
    description: {
        type: String,
        trim: true
    },
    
    tags: [{
        type: String,
        trim: true
    }],
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
mlmCommissionDistributionSchema.index({ 'commissionPeriod.month': 1, 'commissionPeriod.year': 1 });
mlmCommissionDistributionSchema.index({ 'commissionEntries.coachId': 1 });
mlmCommissionDistributionSchema.index({ 'commissionEntries.status': 1 });
mlmCommissionDistributionSchema.index({ processingStatus: 1 });
mlmCommissionDistributionSchema.index({ approvalStatus: 1 });
mlmCommissionDistributionSchema.index({ payoutSchedule: 1 });
mlmCommissionDistributionSchema.index({ createdAt: 1 });

// Update the updatedAt field on save
mlmCommissionDistributionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for total commission amount
mlmCommissionDistributionSchema.virtual('totalCommissionAmount').get(function() {
    return this.commissionEntries.reduce((total, entry) => {
        return total + entry.finalCommissionAmount;
    }, 0);
});

// Virtual for pending commission amount
mlmCommissionDistributionSchema.virtual('pendingCommissionAmount').get(function() {
    return this.commissionEntries
        .filter(entry => entry.status === 'pending')
        .reduce((total, entry) => {
            return total + entry.finalCommissionAmount;
        }, 0);
});

// Virtual for paid commission amount
mlmCommissionDistributionSchema.virtual('paidCommissionAmount').get(function() {
    return this.commissionEntries
        .filter(entry => entry.status === 'paid')
        .reduce((total, entry) => {
            return total + entry.finalCommissionAmount;
        }, 0);
});

// Method to calculate summary statistics
mlmCommissionDistributionSchema.methods.calculateSummary = function() {
    const entries = this.commissionEntries;
    
    this.summary = {
        totalEligibleCoaches: entries.length,
        totalCommissionAmount: entries.reduce((sum, entry) => sum + entry.finalCommissionAmount, 0),
        totalPaidAmount: entries
            .filter(entry => entry.status === 'paid')
            .reduce((sum, entry) => sum + entry.finalCommissionAmount, 0),
        totalPendingAmount: entries
            .filter(entry => entry.status === 'pending')
            .reduce((sum, entry) => sum + entry.finalCommissionAmount, 0),
        averageCommissionPerCoach: entries.length > 0 ? 
            entries.reduce((sum, entry) => sum + entry.finalCommissionAmount, 0) / entries.length : 0,
        highestCommissionAmount: Math.max(...entries.map(entry => entry.finalCommissionAmount), 0),
        lowestCommissionAmount: Math.min(...entries.map(entry => entry.finalCommissionAmount), 0)
    };
    
    return this.summary;
};

module.exports = mongoose.models.MlmCommissionDistribution || mongoose.model('MlmCommissionDistribution', mlmCommissionDistributionSchema);
