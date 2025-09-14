const mongoose = require('mongoose');
const crypto = require('crypto');

const coachMarketingCredentialsSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // Meta/Facebook Ads Credentials
    metaAds: {
        accessToken: {
            type: String,
            required: false,
            select: false // Don't include in queries by default
        },
        appId: {
            type: String,
            trim: true,
            required: false
        },
        appSecret: {
            type: String,
            required: false,
            select: false
        },
        businessAccountId: {
            type: String,
            trim: true,
            required: false
        },
        adAccountId: {
            type: String,
            trim: true,
            required: false
        },
        facebookPageId: {
            type: String,
            trim: true,
            required: false
        },
        instagramAccountId: {
            type: String,
            trim: true,
            required: false
        },
        isConnected: {
            type: Boolean,
            default: false
        },
        lastVerified: {
            type: Date,
            default: null
        },
        permissions: [{
            type: String,
            enum: ['ads_management', 'pages_manage_posts', 'pages_read_engagement', 'instagram_basic', 'instagram_content_publish']
        }]
    },

    // OpenAI Credentials (for AI content generation)
    openAI: {
        apiKey: {
            type: String,
            required: false,
            select: false
        },
        isConnected: {
            type: Boolean,
            default: false
        },
        lastVerified: {
            type: Date,
            default: null
        },
        modelPreference: {
            type: String,
            enum: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo-preview'],
            default: 'gpt-4'
        }
    },

    // Marketing Preferences
    preferences: {
        autoPublish: {
            type: Boolean,
            default: false
        },
        requireApproval: {
            type: Boolean,
            default: true
        },
        defaultBudget: {
            type: Number,
            default: 25,
            min: 1
        },
        defaultDuration: {
            type: Number,
            default: 7, // days
            min: 1,
            max: 30
        },
        timezone: {
            type: String,
            default: 'UTC'
        },
        language: {
            type: String,
            default: 'en'
        }
    },

    // Security and Audit
    encryptionKey: {
        type: String,
        required: true,
        select: false
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, {
    timestamps: true
});

// Encrypt sensitive data before saving
coachMarketingCredentialsSchema.pre('save', function(next) {
    if (this.isModified('metaAds.accessToken') && this.metaAds.accessToken) {
        this.metaAds.accessToken = this.encrypt(this.metaAds.accessToken);
    }
    if (this.isModified('metaAds.appSecret') && this.metaAds.appSecret) {
        this.metaAds.appSecret = this.encrypt(this.metaAds.appSecret);
    }
    if (this.isModified('openAI.apiKey') && this.openAI.apiKey) {
        this.openAI.apiKey = this.encrypt(this.openAI.apiKey);
    }
    next();
});

// Decrypt sensitive data when retrieving
coachMarketingCredentialsSchema.methods.decrypt = function(encryptedData) {
    if (!encryptedData) return null;
    
    try {
        const algorithm = 'aes-256-cbc';
        const key = Buffer.from(this.encryptionKey, 'hex');
        const iv = Buffer.from(encryptedData.substring(0, 32), 'hex');
        const encrypted = encryptedData.substring(32);
        
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

// Encrypt sensitive data
coachMarketingCredentialsSchema.methods.encrypt = function(data) {
    if (!data) return null;
    
    try {
        const algorithm = 'aes-256-cbc';
        const key = Buffer.from(this.encryptionKey, 'hex');
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return iv.toString('hex') + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
};

// Generate encryption key
coachMarketingCredentialsSchema.methods.generateEncryptionKey = function() {
    return crypto.randomBytes(32).toString('hex');
};

// Get decrypted access token
coachMarketingCredentialsSchema.methods.getDecryptedAccessToken = function() {
    return this.decrypt(this.metaAds.accessToken);
};

// Get decrypted app secret
coachMarketingCredentialsSchema.methods.getDecryptedAppSecret = function() {
    return this.decrypt(this.metaAds.appSecret);
};

// Get decrypted OpenAI API key
coachMarketingCredentialsSchema.methods.getDecryptedOpenAIKey = function() {
    return this.decrypt(this.openAI.apiKey);
};

// Verify Meta credentials
coachMarketingCredentialsSchema.methods.verifyMetaCredentials = async function() {
    try {
        const accessToken = this.getDecryptedAccessToken();
        if (!accessToken) return false;

        const axios = require('axios');
        const response = await axios.get(`https://graph.facebook.com/v19.0/me?access_token=${accessToken}`);
        
        this.metaAds.isConnected = true;
        this.metaAds.lastVerified = new Date();
        await this.save();
        
        return true;
    } catch (error) {
        this.metaAds.isConnected = false;
        await this.save();
        return false;
    }
};

// Verify OpenAI credentials
coachMarketingCredentialsSchema.methods.verifyOpenAICredentials = async function() {
    try {
        const apiKey = this.getDecryptedOpenAIKey();
        if (!apiKey) return false;

        const axios = require('axios');
        const response = await axios.get('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        
        this.openAI.isConnected = true;
        this.openAI.lastVerified = new Date();
        await this.save();
        
        return true;
    } catch (error) {
        this.openAI.isConnected = false;
        await this.save();
        return false;
    }
};

module.exports = mongoose.model('CoachMarketingCredentials', coachMarketingCredentialsSchema);

