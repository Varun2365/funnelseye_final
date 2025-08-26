const mongoose = require('mongoose');

const creditPackageSchema = new mongoose.Schema({
    packageId: {
        type: String,
        required: true,
        unique: true,
        default: () => `CREDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['ai', 'whatsapp', 'email', 'bundle'],
        default: 'ai'
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    credits: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'INR',
            enum: ['INR', 'USD', 'EUR']
        },
        originalPrice: {
            type: Number,
            min: 0
        },
        discountPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }
    },
    validity: {
        days: {
            type: Number,
            required: true,
            min: 1,
            default: 365
        },
        expiresAt: {
            type: Date
        }
    },
    features: {
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'premium'],
            default: 'medium'
        },
        support: {
            type: String,
            enum: ['basic', 'priority', 'dedicated'],
            default: 'basic'
        },
        customFeatures: [String]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    isAutoPurchase: {
        type: Boolean,
        default: false
    },
    autoPurchaseThreshold: {
        type: Number,
        min: 0
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    metadata: {
        stripePriceId: String,
        razorpayPlanId: String,
        usageInstructions: String,
        restrictions: [String]
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
creditPackageSchema.index({ type: 1, isActive: 1 });
creditPackageSchema.index({ isPopular: 1 });
creditPackageSchema.index({ sortOrder: 1 });
creditPackageSchema.index({ 'price.amount': 1 });
creditPackageSchema.index({ isAutoPurchase: 1 });

// Virtual for discounted price
creditPackageSchema.virtual('discountedPrice').get(function() {
    if (this.price.discountPercentage > 0) {
        return this.price.amount - (this.price.amount * this.price.discountPercentage / 100);
    }
    return this.price.amount;
});

// Virtual for price per credit
creditPackageSchema.virtual('pricePerCredit').get(function() {
    return this.price.amount / this.credits;
});

// Pre-save middleware to set expiration date
creditPackageSchema.pre('save', function(next) {
    if (this.validity.days && !this.validity.expiresAt) {
        this.validity.expiresAt = new Date(Date.now() + this.validity.days * 24 * 60 * 60 * 1000);
    }
    next();
});

// Ensure virtual fields are serialized
creditPackageSchema.set('toJSON', { virtuals: true });
creditPackageSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.CreditPackage || mongoose.model('CreditPackage', creditPackageSchema);
