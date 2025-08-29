const mongoose = require('mongoose');

const coachSubscriptionSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'suspended', 'pending_renewal'],
        default: 'active'
    },
    currentPeriod: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        }
    },
    billing: {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'USD'
        },
        billingCycle: {
            type: String,
            required: true,
            enum: ['monthly', 'quarterly', 'yearly']
        },
        nextBillingDate: {
            type: Date,
            required: true
        },
        lastPaymentDate: {
            type: Date
        },
        paymentMethod: {
            type: String,
            default: 'stripe' // Will be configurable later
        },
        paymentStatus: {
            type: String,
            enum: ['paid', 'pending', 'failed', 'refunded'],
            default: 'pending'
        }
    },
    reminders: {
        sevenDaysBefore: {
            sent: {
                type: Boolean,
                default: false
            },
            sentAt: Date,
            emailSent: {
                type: Boolean,
                default: false
            },
            whatsappSent: {
                type: Boolean,
                default: false
            }
        },
        threeDaysBefore: {
            sent: {
                type: Boolean,
                default: false
            },
            sentAt: Date,
            emailSent: {
                type: Boolean,
                default: false
            },
            whatsappSent: {
                type: Boolean,
                default: false
            }
        },
        oneDayBefore: {
            sent: {
                type: Boolean,
                default: false
            },
            sentAt: Date,
            emailSent: {
                type: Boolean,
                default: false
            },
            whatsappSent: {
                type: Boolean,
                default: false
            }
        },
        onExpiry: {
            sent: {
                type: Boolean,
                default: false
            },
            sentAt: Date,
            emailSent: {
                type: Boolean,
                default: false
            },
            whatsappSent: {
                type: Boolean,
                default: false
            }
        }
    },
    accountStatus: {
        isEnabled: {
            type: Boolean,
            default: true
        },
        disabledAt: Date,
        disabledReason: String,
        reEnabledAt: Date
    },
    features: {
        maxFunnels: {
            type: Number,
            default: 5
        },
        maxLeads: {
            type: Number,
            default: 1000
        },
        maxStaff: {
            type: Number,
            default: 3
        },
        maxAutomationRules: {
            type: Number,
            default: 10
        },
        aiFeatures: {
            type: Boolean,
            default: false
        },
        advancedAnalytics: {
            type: Boolean,
            default: false
        },
        prioritySupport: {
            type: Boolean,
            default: false
        },
        customDomain: {
            type: Boolean,
            default: false
        }
    },
    usage: {
        currentFunnels: {
            type: Number,
            default: 0
        },
        currentLeads: {
            type: Number,
            default: 0
        },
        currentStaff: {
            type: Number,
            default: 0
        },
        currentAutomationRules: {
            type: Number,
            default: 0
        }
    },
    autoRenew: {
        enabled: {
            type: Boolean,
            default: true
        },
        nextPlanId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubscriptionPlan'
        }
    },
    cancellation: {
        cancelledAt: Date,
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String,
        effectiveDate: Date
    },
    notes: [{
        text: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
coachSubscriptionSchema.index({ coachId: 1 });
coachSubscriptionSchema.index({ status: 1 });
coachSubscriptionSchema.index({ 'currentPeriod.endDate': 1 });
coachSubscriptionSchema.index({ 'billing.nextBillingDate': 1 });
coachSubscriptionSchema.index({ 'accountStatus.isEnabled': 1 });

// Virtual for days until expiry
coachSubscriptionSchema.virtual('daysUntilExpiry').get(function() {
    if (!this.currentPeriod.endDate) return null;
    const now = new Date();
    const endDate = new Date(this.currentPeriod.endDate);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Virtual for isExpired
coachSubscriptionSchema.virtual('isExpired').get(function() {
    if (!this.currentPeriod.endDate) return false;
    return new Date() > this.currentPeriod.endDate;
});

// Virtual for isExpiringSoon (7 days or less)
coachSubscriptionSchema.virtual('isExpiringSoon').get(function() {
    if (!this.currentPeriod.endDate) return false;
    const daysUntilExpiry = this.daysUntilExpiry;
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
});

// Virtual for isOverdue (past expiry date)
coachSubscriptionSchema.virtual('isOverdue').get(function() {
    if (!this.currentPeriod.endDate) return false;
    const daysUntilExpiry = this.daysUntilExpiry;
    return daysUntilExpiry < 0;
});

// Pre-save middleware to update status based on dates
coachSubscriptionSchema.pre('save', function(next) {
    const now = new Date();
    
    // Update status based on dates
    if (this.currentPeriod.endDate && now > this.currentPeriod.endDate) {
        if (this.status === 'active') {
            this.status = 'expired';
        }
        
        // If expired for more than 7 days, suspend account
        const daysOverdue = Math.abs(this.daysUntilExpiry);
        if (daysOverdue >= 7 && this.accountStatus.isEnabled) {
            this.accountStatus.isEnabled = false;
            this.accountStatus.disabledAt = now;
            this.accountStatus.disabledReason = 'Subscription expired for more than 7 days';
        }
    }
    
    next();
});

module.exports = mongoose.model('CoachSubscription', coachSubscriptionSchema);
