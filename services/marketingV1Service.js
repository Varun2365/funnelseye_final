// D:\PRJ_YCT_Final\services\marketingV1Service.js

const axios = require('axios');
const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');
const { AdCampaign, AdSet, AdCreative, Ad } = require('../schema');
const crypto = require('crypto');

const META_ADS_API_BASE = 'https://graph.facebook.com/v19.0';

// ===== CREDENTIALS MANAGEMENT =====

/**
 * Setup Meta API credentials for a coach
 */
async function setupMetaCredentials(coachId, credentials) {
    const {
        accessToken,
        appId,
        appSecret,
        businessAccountId,
        adAccountId,
        facebookPageId,
        instagramAccountId
    } = credentials;

    // Check if credentials already exist
    let coachCredentials = await CoachMarketingCredentials.findOne({ coachId });
    
    if (!coachCredentials) {
        // Create new credentials record
        const encryptionKey = crypto.randomBytes(32).toString('hex');
        coachCredentials = new CoachMarketingCredentials({
            coachId,
            encryptionKey,
            updatedBy: coachId
        });
    }

    // Update Meta credentials
    coachCredentials.metaAds = {
        accessToken,
        appId,
        appSecret,
        businessAccountId,
        adAccountId,
        facebookPageId,
        instagramAccountId,
        isConnected: false,
        lastVerified: null,
        permissions: []
    };

    // Verify credentials
    const isValid = await verifyMetaCredentials(coachId);
    
    if (isValid) {
        coachCredentials.metaAds.isConnected = true;
        coachCredentials.metaAds.lastVerified = new Date();
    }

    await coachCredentials.save();

    return {
        isConnected: coachCredentials.metaAds.isConnected,
        lastVerified: coachCredentials.metaAds.lastVerified,
        businessAccountId: coachCredentials.metaAds.businessAccountId,
        adAccountId: coachCredentials.metaAds.adAccountId
    };
}

/**
 * Verify Meta API credentials
 */
async function verifyMetaCredentials(coachId) {
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            return { isValid: false, error: 'No Meta credentials found' };
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        // Test API access
        const response = await axios.get(`${META_ADS_API_BASE}/me`, {
            params: { access_token: accessToken }
        });

        if (response.status === 200) {
            // Update verification status
            credentials.metaAds.isConnected = true;
            credentials.metaAds.lastVerified = new Date();
            await credentials.save();

            return { 
                isValid: true, 
                userInfo: response.data,
                lastVerified: credentials.metaAds.lastVerified
            };
        }

        return { isValid: false, error: 'Invalid access token' };
    } catch (error) {
        return { 
            isValid: false, 
            error: error.response?.data?.error?.message || error.message 
        };
    }
}

/**
 * Get Meta account information
 */
async function getMetaAccountInfo(coachId) {
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        // Get user info
        const userResponse = await axios.get(`${META_ADS_API_BASE}/me`, {
            params: { access_token: accessToken }
        });

        // Get ad accounts
        const adAccountsResponse = await axios.get(`${META_ADS_API_BASE}/me/adaccounts`, {
            params: { 
                access_token: accessToken,
                fields: 'id,name,account_status,currency,timezone_name'
            }
        });

        // Get business accounts
        const businessAccountsResponse = await axios.get(`${META_ADS_API_BASE}/me/businesses`, {
            params: { 
                access_token: accessToken,
                fields: 'id,name,primary_page'
            }
        });

        return {
            user: userResponse.data,
            adAccounts: adAccountsResponse.data.data,
            businessAccounts: businessAccountsResponse.data.data,
            connectedAccount: {
                businessAccountId: credentials.metaAds.businessAccountId,
                adAccountId: credentials.metaAds.adAccountId,
                facebookPageId: credentials.metaAds.facebookPageId,
                instagramAccountId: credentials.metaAds.instagramAccountId
            }
        };
    } catch (error) {
        throw new Error(`Failed to get Meta account info: ${error.message}`);
    }
}

/**
 * Setup OpenAI credentials
 */
async function setupOpenAICredentials(coachId, credentials) {
    const { apiKey, modelPreference } = credentials;

    let coachCredentials = await CoachMarketingCredentials.findOne({ coachId });
    
    if (!coachCredentials) {
        const encryptionKey = crypto.randomBytes(32).toString('hex');
        coachCredentials = new CoachMarketingCredentials({
            coachId,
            encryptionKey,
            updatedBy: coachId
        });
    }

    coachCredentials.openAI = {
        apiKey,
        modelPreference,
        isConnected: false,
        lastVerified: null
    };

    // Verify credentials
    const isValid = await verifyOpenAICredentials(coachId);
    
    if (isValid) {
        coachCredentials.openAI.isConnected = true;
        coachCredentials.openAI.lastVerified = new Date();
    }

    await coachCredentials.save();

    return {
        isConnected: coachCredentials.openAI.isConnected,
        lastVerified: coachCredentials.openAI.lastVerified,
        modelPreference: coachCredentials.openAI.modelPreference
    };
}

/**
 * Verify OpenAI credentials
 */
async function verifyOpenAICredentials(coachId) {
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+openAI.apiKey +encryptionKey');
        
        if (!credentials || !credentials.openAI.apiKey) {
            return { isValid: false, error: 'No OpenAI credentials found' };
        }

        const apiKey = credentials.getDecryptedOpenAIKey();
        
        const response = await axios.get('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (response.status === 200) {
            credentials.openAI.isConnected = true;
            credentials.openAI.lastVerified = new Date();
            await credentials.save();

            return { 
                isValid: true, 
                models: response.data.data,
                lastVerified: credentials.openAI.lastVerified
            };
        }

        return { isValid: false, error: 'Invalid API key' };
    } catch (error) {
        return { 
            isValid: false, 
            error: error.response?.data?.error?.message || error.message 
        };
    }
}

/**
 * Get credentials status
 */
async function getCredentialsStatus(coachId) {
    const credentials = await CoachMarketingCredentials.findOne({ coachId });
    
    if (!credentials) {
        return {
            meta: { isConnected: false, hasCredentials: false },
            openai: { isConnected: false, hasCredentials: false },
            setupComplete: false
        };
    }

    return {
        meta: {
            isConnected: credentials.metaAds.isConnected,
            hasCredentials: !!credentials.metaAds.accessToken,
            lastVerified: credentials.metaAds.lastVerified,
            businessAccountId: credentials.metaAds.businessAccountId,
            adAccountId: credentials.metaAds.adAccountId
        },
        openai: {
            isConnected: credentials.openAI.isConnected,
            hasCredentials: !!credentials.openAI.apiKey,
            lastVerified: credentials.openAI.lastVerified,
            modelPreference: credentials.openAI.modelPreference
        },
        setupComplete: credentials.metaAds.isConnected && credentials.openAI.isConnected
    };
}

// ===== CAMPAIGN ANALYSIS & MANAGEMENT =====

/**
 * Get comprehensive campaign analysis
 */
async function getCampaignAnalysis(coachId, options) {
    const { dateRange, campaignIds, includeInsights, includeRecommendations } = options;
    
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        const adAccountId = credentials.metaAds.adAccountId;
        
        if (!adAccountId) {
            throw new Error('Ad account ID not configured');
        }

        // Get campaigns
        const campaignsResponse = await axios.get(`${META_ADS_API_BASE}/act_${adAccountId}/campaigns`, {
            params: {
                access_token: accessToken,
                fields: 'id,name,status,objective,created_time,updated_time',
                limit: 100
            }
        });

        const campaigns = campaignsResponse.data.data;
        const filteredCampaigns = campaignIds.length > 0 
            ? campaigns.filter(c => campaignIds.includes(c.id))
            : campaigns;

        // Get insights for each campaign
        const analysis = {
            summary: {
                totalCampaigns: filteredCampaigns.length,
                activeCampaigns: filteredCampaigns.filter(c => c.status === 'ACTIVE').length,
                pausedCampaigns: filteredCampaigns.filter(c => c.status === 'PAUSED').length,
                dateRange
            },
            campaigns: []
        };

        for (const campaign of filteredCampaigns) {
            const campaignData = {
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                objective: campaign.objective,
                createdTime: campaign.created_time,
                updatedTime: campaign.updated_time
            };

            if (includeInsights) {
                try {
                    const insightsResponse = await axios.get(`${META_ADS_API_BASE}/${campaign.id}/insights`, {
                        params: {
                            access_token: accessToken,
                            date_preset: dateRange,
                            fields: 'impressions,clicks,spend,ctr,cpc,cpm,conversions,conversion_rate'
                        }
                    });

                    campaignData.insights = insightsResponse.data.data[0] || {};
                } catch (error) {
                    campaignData.insights = null;
                    campaignData.insightsError = error.message;
                }
            }

            analysis.campaigns.push(campaignData);
        }

        // Calculate overall performance metrics
        const campaignsWithInsights = analysis.campaigns.filter(c => c.insights);
        if (campaignsWithInsights.length > 0) {
            analysis.summary.overallMetrics = {
                totalImpressions: campaignsWithInsights.reduce((sum, c) => sum + (parseInt(c.insights.impressions) || 0), 0),
                totalClicks: campaignsWithInsights.reduce((sum, c) => sum + (parseInt(c.insights.clicks) || 0), 0),
                totalSpend: campaignsWithInsights.reduce((sum, c) => sum + (parseFloat(c.insights.spend) || 0), 0),
                averageCTR: campaignsWithInsights.reduce((sum, c) => sum + (parseFloat(c.insights.ctr) || 0), 0) / campaignsWithInsights.length,
                averageCPC: campaignsWithInsights.reduce((sum, c) => sum + (parseFloat(c.insights.cpc) || 0), 0) / campaignsWithInsights.length
            };
        }

        return analysis;
    } catch (error) {
        throw new Error(`Failed to get campaign analysis: ${error.message}`);
    }
}

/**
 * Get detailed campaign insights
 */
async function getCampaignInsights(coachId, campaignId, options) {
    const { dateRange, breakdown, includeDemographics, includePlacements } = options;
    
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        // Get basic insights
        const insightsResponse = await axios.get(`${META_ADS_API_BASE}/${campaignId}/insights`, {
            params: {
                access_token: accessToken,
                date_preset: dateRange,
                level: breakdown,
                fields: 'impressions,clicks,spend,ctr,cpc,cpm,conversions,conversion_rate,reach,frequency'
            }
        });

        const insights = {
            basic: insightsResponse.data.data[0] || {},
            demographics: null,
            placements: null
        };

        // Get demographic insights if requested
        if (includeDemographics) {
            try {
                const demographicsResponse = await axios.get(`${META_ADS_API_BASE}/${campaignId}/insights`, {
                    params: {
                        access_token: accessToken,
                        date_preset: dateRange,
                        breakdowns: 'age,gender',
                        fields: 'impressions,clicks,spend,ctr,cpc,cpm,conversions'
                    }
                });
                insights.demographics = demographicsResponse.data.data;
            } catch (error) {
                insights.demographicsError = error.message;
            }
        }

        // Get placement insights if requested
        if (includePlacements) {
            try {
                const placementsResponse = await axios.get(`${META_ADS_API_BASE}/${campaignId}/insights`, {
                    params: {
                        access_token: accessToken,
                        date_preset: dateRange,
                        breakdowns: 'publisher_platform,placement',
                        fields: 'impressions,clicks,spend,ctr,cpc,cpm,conversions'
                    }
                });
                insights.placements = placementsResponse.data.data;
            } catch (error) {
                insights.placementsError = error.message;
            }
        }

        return insights;
    } catch (error) {
        throw new Error(`Failed to get campaign insights: ${error.message}`);
    }
}

/**
 * Get campaign metrics
 */
async function getCampaignMetrics(coachId, campaignId, options) {
    const { dateRange, metrics } = options;
    
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        const response = await axios.get(`${META_ADS_API_BASE}/${campaignId}/insights`, {
            params: {
                access_token: accessToken,
                date_preset: dateRange,
                fields: metrics.join(',')
            }
        });

        return {
            campaignId,
            dateRange,
            metrics: response.data.data[0] || {},
            timestamp: new Date()
        };
    } catch (error) {
        throw new Error(`Failed to get campaign metrics: ${error.message}`);
    }
}

/**
 * Get campaign audience insights
 */
async function getCampaignAudienceInsights(coachId, campaignId, options) {
    const { dateRange } = options;
    
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        // Get audience insights
        const response = await axios.get(`${META_ADS_API_BASE}/${campaignId}/insights`, {
            params: {
                access_token: accessToken,
                date_preset: dateRange,
                breakdowns: 'age,gender,country,region',
                fields: 'impressions,clicks,spend,ctr,cpc,cpm,conversions'
            }
        });

        return {
            campaignId,
            dateRange,
            audienceInsights: response.data.data,
            timestamp: new Date()
        };
    } catch (error) {
        throw new Error(`Failed to get audience insights: ${error.message}`);
    }
}

/**
 * Get campaign recommendations
 */
async function getCampaignRecommendations(coachId, campaignId, options) {
    const { includeAIRecommendations } = options;
    
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        // Get campaign insights for recommendations
        const insightsResponse = await axios.get(`${META_ADS_API_BASE}/${campaignId}/insights`, {
            params: {
                access_token: accessToken,
                date_preset: 'last_30d',
                fields: 'impressions,clicks,spend,ctr,cpc,cpm,conversions,conversion_rate'
            }
        });

        const insights = insightsResponse.data.data[0] || {};
        
        // Generate basic recommendations based on performance
        const recommendations = [];
        
        if (insights.ctr && parseFloat(insights.ctr) < 1.0) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                title: 'Low Click-Through Rate',
                description: 'Your CTR is below 1%. Consider improving ad creative or targeting.',
                action: 'Review ad creative and audience targeting'
            });
        }

        if (insights.cpc && parseFloat(insights.cpc) > 2.0) {
            recommendations.push({
                type: 'cost',
                priority: 'medium',
                title: 'High Cost Per Click',
                description: 'Your CPC is above $2. Consider optimizing bidding strategy.',
                action: 'Review bidding strategy and audience targeting'
            });
        }

        if (insights.conversion_rate && parseFloat(insights.conversion_rate) < 2.0) {
            recommendations.push({
                type: 'conversion',
                priority: 'high',
                title: 'Low Conversion Rate',
                description: 'Your conversion rate is below 2%. Consider improving landing page or targeting.',
                action: 'Review landing page and audience targeting'
            });
        }

        const result = {
            campaignId,
            recommendations,
            insights,
            timestamp: new Date()
        };

        // Add AI recommendations if requested and OpenAI is available
        if (includeAIRecommendations) {
            try {
                const aiMarketingService = require('./aiMarketingService');
                const aiRecommendations = await aiMarketingService.generateCampaignRecommendations(coachId, campaignId, insights);
                result.aiRecommendations = aiRecommendations;
            } catch (error) {
                result.aiRecommendationsError = error.message;
            }
        }

        return result;
    } catch (error) {
        throw new Error(`Failed to get campaign recommendations: ${error.message}`);
    }
}

// ===== CAMPAIGN CREATION & MANAGEMENT =====

/**
 * Create new campaign
 */
async function createCampaign(coachId, campaignData) {
    const {
        name,
        objective,
        budget,
        targetAudience,
        productInfo,
        useAI,
        autoOptimize,
        schedule
    } = campaignData;

    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        const adAccountId = credentials.metaAds.adAccountId;
        
        if (!adAccountId) {
            throw new Error('Ad account ID not configured');
        }

        // Prepare campaign data for Meta API
        const metaCampaignData = {
            name,
            objective,
            status: 'PAUSED', // Start paused for review
            daily_budget: budget * 100 // Convert to cents
        };

        // Create campaign via Meta API
        const campaignResponse = await axios.post(`${META_ADS_API_BASE}/act_${adAccountId}/campaigns`, {
            ...metaCampaignData,
            access_token: accessToken
        });

        const metaCampaign = campaignResponse.data;

        // Save to local database
        const campaign = new AdCampaign({
            campaignId: metaCampaign.id,
            coachId,
            name,
            objective,
            status: 'PAUSED',
            dailyBudget: budget,
            aiGenerated: useAI,
            metaRaw: metaCampaign,
            createdAt: new Date()
        });

        await campaign.save();

        // Generate AI content if requested
        let aiContent = null;
        if (useAI) {
            try {
                const aiMarketingService = require('./aiMarketingService');
                aiContent = await aiMarketingService.generateCampaignContent(coachId, {
                    campaignData,
                    metaCampaignId: metaCampaign.id
                });
                
                campaign.aiContent = aiContent;
                await campaign.save();
            } catch (error) {
                console.error('AI content generation failed:', error.message);
            }
        }

        return {
            campaign: campaign.toObject(),
            metaCampaign,
            aiContent,
            message: 'Campaign created successfully. Review and activate when ready.'
        };
    } catch (error) {
        throw new Error(`Failed to create campaign: ${error.message}`);
    }
}

/**
 * Update campaign
 */
async function updateCampaign(coachId, campaignId, updateData) {
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        // Update via Meta API
        const metaUpdateData = {};
        if (updateData.name) metaUpdateData.name = updateData.name;
        if (updateData.status) metaUpdateData.status = updateData.status;
        if (updateData.dailyBudget) metaUpdateData.daily_budget = updateData.dailyBudget * 100;

        if (Object.keys(metaUpdateData).length > 0) {
            await axios.post(`${META_ADS_API_BASE}/${campaignId}`, {
                ...metaUpdateData,
                access_token: accessToken
            });
        }

        // Update local database
        const campaign = await AdCampaign.findOneAndUpdate(
            { campaignId, coachId },
            updateData,
            { new: true }
        );

        if (!campaign) {
            throw new Error('Campaign not found');
        }

        return campaign;
    } catch (error) {
        throw new Error(`Failed to update campaign: ${error.message}`);
    }
}

/**
 * Pause campaign
 */
async function pauseCampaign(coachId, campaignId) {
    return updateCampaign(coachId, campaignId, { status: 'PAUSED' });
}

/**
 * Resume campaign
 */
async function resumeCampaign(coachId, campaignId) {
    return updateCampaign(coachId, campaignId, { status: 'ACTIVE' });
}

/**
 * Delete campaign
 */
async function deleteCampaign(coachId, campaignId) {
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            throw new Error('Meta credentials not found');
        }

        const accessToken = credentials.getDecryptedAccessToken();
        
        // Delete from Meta API
        await axios.delete(`${META_ADS_API_BASE}/${campaignId}`, {
            params: { access_token: accessToken }
        });

        // Delete from local database
        await AdCampaign.findOneAndDelete({ campaignId, coachId });

        return { success: true };
    } catch (error) {
        throw new Error(`Failed to delete campaign: ${error.message}`);
    }
}

/**
 * Duplicate campaign
 */
async function duplicateCampaign(coachId, campaignId, options) {
    const { newName, modifications = {} } = options;
    
    try {
        // Get original campaign
        const originalCampaign = await AdCampaign.findOne({ campaignId, coachId });
        if (!originalCampaign) {
            throw new Error('Original campaign not found');
        }

        // Create new campaign with modifications
        const newCampaignData = {
            name: newName || `${originalCampaign.name} (Copy)`,
            objective: originalCampaign.objective,
            budget: modifications.budget || originalCampaign.dailyBudget,
            targetAudience: modifications.targetAudience || originalCampaign.targetAudience,
            productInfo: modifications.productInfo || originalCampaign.productInfo,
            useAI: modifications.useAI !== undefined ? modifications.useAI : originalCampaign.aiGenerated,
            autoOptimize: modifications.autoOptimize !== undefined ? modifications.autoOptimize : false
        };

        return await createCampaign(coachId, newCampaignData);
    } catch (error) {
        throw new Error(`Failed to duplicate campaign: ${error.message}`);
    }
}

// ===== DASHBOARD & ANALYTICS =====

/**
 * Get marketing dashboard data
 */
async function getMarketingDashboard(coachId, options) {
    const { dateRange, includeAIInsights, includeRecommendations } = options;
    
    try {
        // Get campaign analysis
        const campaignAnalysis = await getCampaignAnalysis(coachId, {
            dateRange,
            campaignIds: [],
            includeInsights: true,
            includeRecommendations
        });

        // Get credentials status
        const credentialsStatus = await getCredentialsStatus(coachId);

        const dashboard = {
            credentials: credentialsStatus,
            campaigns: campaignAnalysis,
            timestamp: new Date()
        };

        // Add AI insights if requested
        if (includeAIInsights) {
            try {
                const aiMarketingService = require('./aiMarketingService');
                const aiInsights = await aiMarketingService.generateDashboardInsights(coachId, campaignAnalysis);
                dashboard.aiInsights = aiInsights;
            } catch (error) {
                dashboard.aiInsightsError = error.message;
            }
        }

        return dashboard;
    } catch (error) {
        throw new Error(`Failed to get marketing dashboard: ${error.message}`);
    }
}

/**
 * Get campaign performance summary
 */
async function getCampaignPerformanceSummary(coachId, options) {
    const { dateRange, campaignIds, includeComparisons } = options;
    
    try {
        const analysis = await getCampaignAnalysis(coachId, {
            dateRange,
            campaignIds,
            includeInsights: true,
            includeRecommendations: false
        });

        const summary = {
            totalCampaigns: analysis.summary.totalCampaigns,
            activeCampaigns: analysis.summary.activeCampaigns,
            pausedCampaigns: analysis.summary.pausedCampaigns,
            overallMetrics: analysis.summary.overallMetrics,
            topPerformers: analysis.campaigns
                .filter(c => c.insights)
                .sort((a, b) => parseFloat(b.insights.ctr) - parseFloat(a.insights.ctr))
                .slice(0, 5),
            timestamp: new Date()
        };

        if (includeComparisons) {
            // Add comparison with previous period
            const previousAnalysis = await getCampaignAnalysis(coachId, {
                dateRange: 'previous_period',
                campaignIds,
                includeInsights: true,
                includeRecommendations: false
            });

            summary.comparison = {
                impressions: {
                    current: analysis.summary.overallMetrics?.totalImpressions || 0,
                    previous: previousAnalysis.summary.overallMetrics?.totalImpressions || 0
                },
                clicks: {
                    current: analysis.summary.overallMetrics?.totalClicks || 0,
                    previous: previousAnalysis.summary.overallMetrics?.totalClicks || 0
                },
                spend: {
                    current: analysis.summary.overallMetrics?.totalSpend || 0,
                    previous: previousAnalysis.summary.overallMetrics?.totalSpend || 0
                }
            };
        }

        return summary;
    } catch (error) {
        throw new Error(`Failed to get performance summary: ${error.message}`);
    }
}

/**
 * Export campaign data
 */
async function exportCampaignData(coachId, options) {
    const { format, dateRange, campaignIds, includeInsights } = options;
    
    try {
        const analysis = await getCampaignAnalysis(coachId, {
            dateRange,
            campaignIds,
            includeInsights,
            includeRecommendations: false
        });

        if (format === 'csv') {
            // Convert to CSV format
            const csvData = analysis.campaigns.map(campaign => ({
                'Campaign ID': campaign.id,
                'Campaign Name': campaign.name,
                'Status': campaign.status,
                'Objective': campaign.objective,
                'Impressions': campaign.insights?.impressions || 0,
                'Clicks': campaign.insights?.clicks || 0,
                'Spend': campaign.insights?.spend || 0,
                'CTR': campaign.insights?.ctr || 0,
                'CPC': campaign.insights?.cpc || 0,
                'CPM': campaign.insights?.cpm || 0,
                'Conversions': campaign.insights?.conversions || 0
            }));

            return {
                format: 'csv',
                data: csvData,
                filename: `campaign_data_${new Date().toISOString().split('T')[0]}.csv`
            };
        }

        return {
            format,
            data: analysis,
            timestamp: new Date()
        };
    } catch (error) {
        throw new Error(`Failed to export campaign data: ${error.message}`);
    }
}

// ===== AUTOMATION & SCHEDULING =====

/**
 * Schedule campaign
 */
async function scheduleCampaign(coachId, campaignId, scheduleData) {
    const { startDate, endDate, timezone, budgetSchedule } = scheduleData;
    
    try {
        // Update campaign with schedule information
        const updateData = {
            scheduledStart: new Date(startDate),
            scheduledEnd: endDate ? new Date(endDate) : null,
            timezone,
            budgetSchedule
        };

        return await updateCampaign(coachId, campaignId, updateData);
    } catch (error) {
        throw new Error(`Failed to schedule campaign: ${error.message}`);
    }
}

/**
 * Setup campaign automation
 */
async function setupCampaignAutomation(coachId, campaignId, automationData) {
    const { rules, notifications, autoOptimize } = automationData;
    
    try {
        // Update campaign with automation rules
        const updateData = {
            automationRules: rules,
            automationNotifications: notifications,
            autoOptimize
        };

        return await updateCampaign(coachId, campaignId, updateData);
    } catch (error) {
        throw new Error(`Failed to setup campaign automation: ${error.message}`);
    }
}

/**
 * Get automation status
 */
async function getAutomationStatus(coachId, campaignId) {
    try {
        const campaign = await AdCampaign.findOne({ campaignId, coachId });
        
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        return {
            campaignId,
            hasAutomation: !!(campaign.automationRules && campaign.automationRules.length > 0),
            automationRules: campaign.automationRules || [],
            notifications: campaign.automationNotifications || false,
            autoOptimize: campaign.autoOptimize || false,
            lastAutomationRun: campaign.lastAutomationRun || null
        };
    } catch (error) {
        throw new Error(`Failed to get automation status: ${error.message}`);
    }
}

module.exports = {
    // Credentials Management
    setupMetaCredentials,
    verifyMetaCredentials,
    getMetaAccountInfo,
    setupOpenAICredentials,
    verifyOpenAICredentials,
    getCredentialsStatus,
    
    // Campaign Analysis
    getCampaignAnalysis,
    getCampaignInsights,
    getCampaignMetrics,
    getCampaignAudienceInsights,
    getCampaignRecommendations,
    
    // Campaign Management
    createCampaign,
    updateCampaign,
    pauseCampaign,
    resumeCampaign,
    deleteCampaign,
    duplicateCampaign,
    
    // Dashboard & Analytics
    getMarketingDashboard,
    getCampaignPerformanceSummary,
    exportCampaignData,
    
    // Automation & Scheduling
    scheduleCampaign,
    setupCampaignAutomation,
    getAutomationStatus
};
