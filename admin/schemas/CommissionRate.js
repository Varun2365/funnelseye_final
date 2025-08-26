const mongoose = require('mongoose');

const commissionRateSchema = new mongoose.Schema({
    rateId: {
        type: String,
        required: true,
        unique: true,
        default: () => `COMM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['unilevel', 'affiliate', 'bonus', 'custom'],
        default: 'unilevel'
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    structure: {
        levels: [{
            level: {
                type: Number,
                required: true,
                min: 1
            },
            percentage: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            },
            qualification: {
                type: String,
                enum: ['none', 'personal_sales', 'team_sales', 'activity'],
                default: 'none'
            },
            qualificationAmount: {
                type: Number,
                min: 0,
                default: 0
            }
        }],
        maxLevels: {
            type: Number,
            min: 1,
            default: 10
        }
    },
    triggers: {
        subscriptionRenewal: {
            type: Boolean,
            default: true
        },
        creditPurchase: {
            type: Boolean,
            default: true
        },
        newCoachSignup: {
            type: Boolean,
            default: true
        },
        customTriggers: [{
            name: String,
            percentage: Number,
            conditions: mongoose.Schema.Types.Mixed
        }]
    },
    qualifications: {
        personalSales: {
            type: Number,
            min: 0,
            default: 0
        },
        teamSales: {
            type: Number,
            min: 0,
            default: 0
        },
        activeDays: {
            type: Number,
            min: 0,
            default: 0
        },
        minimumTeamSize: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    payouts: {
        frequency: {
            type: String,
            enum: ['weekly', 'monthly', 'quarterly'],
            default: 'monthly'
        },
        minimumAmount: {
            type: Number,
            min: 0,
            default: 100
        },
        processingDay: {
            type: Number,
            min: 1,
            max: 31,
            default: 1
        },
        autoPayout: {
            type: Boolean,
            default: true
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    effectiveFrom: {
        type: Date,
        required: true,
        default: Date.now
    },
    effectiveTo: {
        type: Date
    },
    metadata: {
        notes: String,
        specialConditions: [String],
        overrideRules: mongoose.Schema.Types.Mixed
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: true
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    }
}, {
    timestamps: true
});

// Indexes for performance
commissionRateSchema.index({ type: 1, isActive: 1 });
commissionRateSchema.index({ effectiveFrom: 1, effectiveTo: 1 });
commissionRateSchema.index({ 'structure.maxLevels': 1 });

// Virtual for total commission percentage
commissionRateSchema.virtual('totalPercentage').get(function() {
    return this.structure.levels.reduce((total, level) => total + level.percentage, 0);
});

// Virtual for active status
commissionRateSchema.virtual('isCurrentlyActive').get(function() {
    const now = new Date();
    return this.isActive && 
           this.effectiveFrom <= now && 
           (!this.effectiveTo || this.effectiveTo >= now);
});

// Pre-save validation
commissionRateSchema.pre('save', function(next) {
    // Validate that levels are sequential
    const levels = this.structure.levels.map(l => l.level).sort((a, b) => a - b);
    for (let i = 0; i < levels.length; i++) {
        if (levels[i] !== i + 1) {
            return next(new Error('Commission levels must be sequential starting from 1'));
        }
    }
    
    // Validate total percentage doesn't exceed 100%
    if (this.totalPercentage > 100) {
        return next(new Error('Total commission percentage cannot exceed 100%'));
    }
    
    next();
});

// Ensure virtual fields are serialized
commissionRateSchema.set('toJSON', { virtuals: true });
commissionRateSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.CommissionRate || mongoose.model('CommissionRate', commissionRateSchema);
