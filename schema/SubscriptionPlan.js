const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'USD',
            enum: ['USD', 'EUR', 'GBP', 'INR']
        },
        billingCycle: {
            type: String,
            required: true,
            enum: ['monthly', 'quarterly', 'yearly']
        }
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
    isActive: {
        type: Boolean,
        default: true
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: true
    }
}, {
    timestamps: true
});

// Indexes
subscriptionPlanSchema.index({ isActive: 1, sortOrder: 1 });
subscriptionPlanSchema.index({ 'price.billingCycle': 1, 'price.amount': 1 });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
