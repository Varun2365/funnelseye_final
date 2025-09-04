const mongoose = require('mongoose');

const centralPaymentHandlerSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    
    // Payment Source
    sourceType: {
        type: String,
        required: true,
        enum: [
            'coach_plan_purchase',    // Client buying coach plan
            'subscription_payment',    // Platform subscription
            'commission_payout',       // MLM commission payout
            'refund',                 // Refund to customer
            'platform_fee',           // Platform fee collection
            'other'
        ]
    },
    
    // Customer/Client Information
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    
    customerEmail: {
        type: String,
        required: true,
        trim: true
    },
    
    customerPhone: {
        type: String,
        trim: true
    },
    
    // Coach Information (if applicable)
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    coachEmail: {
        type: String,
        trim: true
    },
    
    // Plan Information (if applicable)
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CoachPlan'
    },
    
    planTitle: {
        type: String,
        trim: true
    },
    
    // Payment Details
    grossAmount: {
        type: Number,
        required: true,
        min: 0
    },
    
    currency: {
        type: String,
        required: true,
        enum: ['USD', 'INR', 'EUR', 'GBP'],
        default: 'USD'
    },
    
    // Fee Breakdown
    platformFee: {
        type: Number,
        required: true,
        min: 0
    },
    
    platformFeePercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    
    gatewayFee: {
        type: Number,
        default: 0
    },
    
    gatewayFeePercentage: {
        type: Number,
        default: 0
    },
    
    netAmount: {
        type: Number,
        required: true,
        min: 0
    },
    
    // Commission Distribution (for MLM)
    commissionDistribution: [{
        coachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        coachEmail: {
            type: String,
            required: true
        },
        level: {
            type: Number,
            required: true,
            min: 1
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
        status: {
            type: String,
            enum: ['pending', 'approved', 'paid', 'cancelled'],
            default: 'pending'
        },
        payoutDate: {
            type: Date
        }
    }],
    
    // Payment Gateway Information
    paymentGateway: {
        type: String,
        required: true,
        enum: ['stripe', 'paypal', 'razorpay', 'bank_transfer', 'other']
    },
    
    gatewayTransactionId: {
        type: String,
        trim: true
    },
    
    gatewayResponse: {
        type: mongoose.Schema.Types.Mixed
    },
    
    // Payment Status
    status: {
        type: String,
        required: true,
        enum: [
            'pending',           // Payment initiated
            'processing',        // Payment being processed
            'successful',        // Payment completed
            'failed',            // Payment failed
            'refunded',          // Payment refunded
            'partially_refunded', // Partial refund
            'cancelled',         // Payment cancelled
            'expired'            // Payment expired
        ],
        default: 'pending'
    },
    
    // Refund Information
    refundInfo: {
        refundAmount: {
            type: Number,
            default: 0
        },
        refundReason: {
            type: String,
            trim: true
        },
        refundDate: {
            type: Date
        },
        refundStatus: {
            type: String,
            enum: ['pending', 'processed', 'completed', 'failed'],
            default: 'pending'
        }
    },
    
    // Payout Information
    payoutInfo: {
        payoutAmount: {
            type: Number,
            default: 0
        },
        payoutDate: {
            type: Date
        },
        payoutMethod: {
            type: String,
            enum: ['bank_transfer', 'paypal', 'stripe_connect', 'other']
        },
        payoutStatus: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        },
        payoutReference: {
            type: String,
            trim: true
        }
    },
    
    // Tax Information (handled by coaches as requested)
    taxInfo: {
        taxAmount: {
            type: Number,
            default: 0
        },
        taxPercentage: {
            type: Number,
            default: 0
        },
        taxHandledBy: {
            type: String,
            enum: ['coach', 'platform'],
            default: 'coach'
        }
    },
    
    // Metadata
    description: {
        type: String,
        trim: true
    },
    
    notes: {
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
    },
    
    processedAt: {
        type: Date
    },
    
    paidAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
centralPaymentHandlerSchema.index({ customerId: 1 });
centralPaymentHandlerSchema.index({ coachId: 1 });
centralPaymentHandlerSchema.index({ planId: 1 });
centralPaymentHandlerSchema.index({ status: 1 });
centralPaymentHandlerSchema.index({ sourceType: 1 });
centralPaymentHandlerSchema.index({ createdAt: 1 });
centralPaymentHandlerSchema.index({ paymentGateway: 1 });
centralPaymentHandlerSchema.index({ 'commissionDistribution.coachId': 1 });
centralPaymentHandlerSchema.index({ 'commissionDistribution.status': 1 });

// Update the updatedAt field on save
centralPaymentHandlerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for total commission amount
centralPaymentHandlerSchema.virtual('totalCommissionAmount').get(function() {
    return this.commissionDistribution.reduce((total, commission) => {
        return total + commission.commissionAmount;
    }, 0);
});

// Virtual for platform profit
centralPaymentHandlerSchema.virtual('platformProfit').get(function() {
    return this.platformFee - this.gatewayFee;
});

// Virtual for isRefundable
centralPaymentHandlerSchema.virtual('isRefundable').get(function() {
    return this.status === 'successful' && this.refundInfo.refundAmount < this.grossAmount;
});

module.exports = mongoose.models.CentralPaymentHandler || mongoose.model('CentralPaymentHandler', centralPaymentHandlerSchema);
