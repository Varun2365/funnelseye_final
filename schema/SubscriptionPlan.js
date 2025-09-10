const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        default: 'INR'
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly'],
        required: true
    },
    duration: {
        type: Number, // in months
        required: true
    },
    features: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        included: {
            type: Boolean,
            default: true
        }
    }],
    limits: {
        maxCoaches: {
            type: Number,
            default: -1 // -1 means unlimited
        },
        maxStudents: {
            type: Number,
            default: -1
        },
        maxPlans: {
            type: Number,
            default: -1
        },
        maxStorage: {
            type: Number, // in GB
            default: -1
        }
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    trialDays: {
        type: Number,
        default: 0
    },
    setupFee: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
subscriptionPlanSchema.index({ isActive: 1, sortOrder: 1 });
subscriptionPlanSchema.index({ billingCycle: 1 });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);