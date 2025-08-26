const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    planId: {
        type: String,
        required: true,
        unique: true,
        default: () => `PLAN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['basic', 'pro', 'enterprise', 'custom'],
        default: 'basic'
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    price: {
        monthly: {
            type: Number,
            required: true,
            min: 0
        },
        yearly: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'INR',
            enum: ['INR', 'USD', 'EUR']
        }
    },
    features: {
        aiCredits: {
            monthly: { type: Number, default: 0 },
            yearly: { type: Number, default: 0 }
        },
        whatsappCredits: {
            monthly: { type: Number, default: 0 },
            yearly: { type: Number, default: 0 }
        },
        emailCredits: {
            monthly: { type: Number, default: 0 },
            yearly: { type: Number, default: 0 }
        },
        maxLeads: { type: Number, default: 1000 },
        maxStaff: { type: Number, default: 5 },
        maxFunnels: { type: Number, default: 10 },
        customDomains: { type: Number, default: 1 },
        prioritySupport: { type: Boolean, default: false },
        advancedAnalytics: { type: Boolean, default: false },
        apiAccess: { type: Boolean, default: false }
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
    metadata: {
        stripePriceId: String,
        razorpayPlanId: String,
        featuresList: [String],
        limitations: mongoose.Schema.Types.Mixed
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
planSchema.index({ isActive: 1, type: 1 });
planSchema.index({ sortOrder: 1 });
planSchema.index({ 'price.monthly': 1 });
planSchema.index({ 'price.yearly': 1 });

// Virtual for yearly discount
planSchema.virtual('yearlyDiscount').get(function() {
    if (this.price.monthly && this.price.yearly) {
        const monthlyTotal = this.price.monthly * 12;
        return Math.round(((monthlyTotal - this.price.yearly) / monthlyTotal) * 100);
    }
    return 0;
});

// Ensure virtual fields are serialized
planSchema.set('toJSON', { virtuals: true });
planSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.Plan || mongoose.model('Plan', planSchema);
