const mongoose = require('mongoose');

const paymentGatewaySchema = new mongoose.Schema({
    gatewayId: {
        type: String,
        required: true,
        unique: true,
        default: () => `GATEWAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    name: {
        type: String,
        required: true,
        trim: true,
        enum: ['razorpay', 'stripe', 'paypal', 'custom']
    },
    displayName: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 0
    },
    credentials: {
        apiKey: {
            type: String,
            required: true
        },
        secretKey: {
            type: String,
            required: true
        },
        webhookSecret: String,
        merchantId: String,
        accountId: String
    },
    settings: {
        testMode: {
            type: Boolean,
            default: false
        },
        supportedCurrencies: [{
            type: String,
            enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']
        }],
        defaultCurrency: {
            type: String,
            default: 'INR'
        },
        supportedPaymentMethods: [{
            type: String,
            enum: ['card', 'netbanking', 'upi', 'wallet', 'emi', 'paylater']
        }],
        minimumAmount: {
            type: Number,
            min: 0,
            default: 1
        },
        maximumAmount: {
            type: Number,
            min: 0
        }
    },
    fees: {
        percentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        fixed: {
            type: Number,
            min: 0,
            default: 0
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },
    markup: {
        enabled: {
            type: Boolean,
            default: false
        },
        percentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        fixed: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    webhooks: {
        enabled: {
            type: Boolean,
            default: true
        },
        url: String,
        events: [{
            type: String,
            enum: ['payment.success', 'payment.failed', 'refund.processed', 'subscription.created', 'subscription.cancelled']
        }],
        retryAttempts: {
            type: Number,
            min: 0,
            max: 10,
            default: 3
        }
    },
    limits: {
        dailyTransactionLimit: {
            type: Number,
            min: 0
        },
        monthlyTransactionLimit: {
            type: Number,
            min: 0
        },
        perTransactionLimit: {
            type: Number,
            min: 0
        }
    },
    status: {
        lastTested: Date,
        isHealthy: {
            type: Boolean,
            default: true
        },
        errorCount: {
            type: Number,
            default: 0
        },
        lastError: {
            message: String,
            timestamp: Date
        }
    },
    metadata: {
        description: String,
        documentation: String,
        supportEmail: String,
        notes: String
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
paymentGatewaySchema.index({ name: 1 });
paymentGatewaySchema.index({ isActive: 1, isDefault: 1 });
paymentGatewaySchema.index({ priority: 1 });
paymentGatewaySchema.index({ 'status.isHealthy': 1 });

// Virtual for total fee calculation
paymentGatewaySchema.virtual('totalFeePercentage').get(function() {
    return this.fees.percentage + (this.markup.enabled ? this.markup.percentage : 0);
});

// Virtual for total fee amount
paymentGatewaySchema.virtual('totalFeeAmount').get(function() {
    return this.fees.fixed + (this.markup.enabled ? this.markup.fixed : 0);
});

// Pre-save middleware to ensure only one default gateway
paymentGatewaySchema.pre('save', async function(next) {
    if (this.isDefault) {
        // Remove default from other gateways
        await this.constructor.updateMany(
            { _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

// Ensure virtual fields are serialized
paymentGatewaySchema.set('toJSON', { virtuals: true });
paymentGatewaySchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.PaymentGateway || mongoose.model('PaymentGateway', paymentGatewaySchema);
