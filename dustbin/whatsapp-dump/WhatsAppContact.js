const mongoose = require('mongoose');

const WhatsAppContactSchema = new mongoose.Schema({
    contactNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    
    // Support both coaches and staff members
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userType: {
        type: String,
        enum: ['coach', 'staff'],
        required: true
    },
    
    // Contact Information
    contactName: {
        type: String,
        required: true,
        trim: true
    },
    
    profilePicture: {
        type: String,
        default: null
    },
    
    // Contact Status
    status: {
        type: String,
        enum: ['active', 'blocked', 'spam', 'archived'],
        default: 'active',
        index: true
    },
    
    // Contact Categories
    category: {
        type: String,
        enum: ['lead', 'client', 'prospect', 'support', 'general', 'vip'],
        default: 'general',
        index: true
    },
    
    // Tags for Organization
    tags: [{
        type: String,
        trim: true
    }],
    
    // Contact Notes
    notes: {
        type: String,
        maxlength: 2000
    },
    
    // Business Information
    businessName: {
        type: String,
        trim: true
    },
    
    // Contact Preferences
    preferences: {
        language: {
            type: String,
            default: 'en'
        },
        timezone: {
            type: String,
            default: 'UTC'
        },
        communicationStyle: {
            type: String,
            enum: ['formal', 'casual', 'professional', 'friendly'],
            default: 'friendly'
        },
        preferredContactTime: {
            type: String,
            enum: ['morning', 'afternoon', 'evening', 'anytime'],
            default: 'anytime'
        }
    },
    
    // Interaction History
    lastInteractionAt: {
        type: Date,
        default: Date.now
    },
    
    totalInteractions: {
        type: Number,
        default: 0
    },
    
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    
    // Lead Integration
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        default: null
    },
    
    // Contact Source
    source: {
        type: String,
        enum: ['whatsapp', 'lead_magnet', 'referral', 'website', 'social_media', 'manual', 'other'],
        default: 'whatsapp'
    },
    
    // Contact Scoring
    engagementScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
    },
    
    // Integration Details
    integrationType: {
        type: String,
        enum: ['meta_official', 'baileys_personal'],
        required: true
    },
    
    // Contact Metadata
    metaData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
WhatsAppContactSchema.index({ userId: 1, userType: 1, contactNumber: 1 }, { unique: true });
WhatsAppContactSchema.index({ userId: 1, userType: 1, category: 1 });
WhatsAppContactSchema.index({ userId: 1, userType: 1, status: 1 });
WhatsAppContactSchema.index({ userId: 1, userType: 1, lastInteractionAt: -1 });
WhatsAppContactSchema.index({ userId: 1, userType: 1, engagementScore: -1 });
WhatsAppContactSchema.index({ leadId: 1 });

// Virtual for contact summary
WhatsAppContactSchema.virtual('summary').get(function() {
    return {
        contactNumber: this.contactNumber,
        contactName: this.contactName,
        category: this.category,
        status: this.status,
        lastInteractionAt: this.lastInteractionAt,
        engagementScore: this.engagementScore,
        hasProfilePicture: !!this.profilePicture
    };
});

// Method to update interaction
WhatsAppContactSchema.methods.updateInteraction = function() {
    this.lastInteractionAt = new Date();
    this.totalInteractions += 1;
    return this.save();
};

// Method to update engagement score
WhatsAppContactSchema.methods.updateEngagementScore = function(score) {
    this.engagementScore = Math.max(0, Math.min(100, score));
    return this.save();
};

// Method to add tag
WhatsAppContactSchema.methods.addTag = function(tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
    return this.save();
};

// Method to remove tag
WhatsAppContactSchema.methods.removeTag = function(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
};

// Method to block contact
WhatsAppContactSchema.methods.block = function() {
    this.status = 'blocked';
    return this.save();
};

// Method to unblock contact
WhatsAppContactSchema.methods.unblock = function() {
    this.status = 'active';
    return this.save();
};

// Method to archive contact
WhatsAppContactSchema.methods.archive = function() {
    this.status = 'archived';
    return this.save();
};

// Static method to find contacts by user
WhatsAppContactSchema.statics.findByUser = function(userId, userType, filters = {}) {
    const query = { userId, userType, ...filters };
    return this.find(query).sort({ lastInteractionAt: -1 });
};

// Static method to get contact statistics
WhatsAppContactSchema.statics.getStats = function(userId, userType) {
    return this.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId), userType } },
        {
            $group: {
                _id: null,
                totalContacts: { $sum: 1 },
                activeContacts: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                blockedContacts: { $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] } },
                leadContacts: { $sum: { $cond: [{ $eq: ['$category', 'lead'] }, 1, 0] } },
                clientContacts: { $sum: { $cond: [{ $eq: ['$category', 'client'] }, 1, 0] } },
                averageEngagementScore: { $avg: '$engagementScore' }
            }
        }
    ]);
};

// Static method to search contacts
WhatsAppContactSchema.statics.searchContacts = function(userId, userType, searchTerm) {
    return this.find({
        userId,
        userType,
        $or: [
            { contactName: { $regex: searchTerm, $options: 'i' } },
            { contactNumber: { $regex: searchTerm, $options: 'i' } },
            { businessName: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
    }).sort({ lastInteractionAt: -1 });
};

module.exports = mongoose.models.WhatsAppContact || mongoose.model('WhatsAppContact', WhatsAppContactSchema);
