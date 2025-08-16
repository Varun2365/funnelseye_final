// D:\PRJ_YCT_Final\controllers/aiAdsController.js

const aiAdsAgentService = require('../services/aiAdsAgentService');
const AdCampaign = require('../schema/AdCampaign');
const AdSet = require('../schema/AdSet');
const AdCreative = require('../schema/AdCreative');
const asyncHandler = require('../middleware/async');

// @desc    Generate AI-powered ad copy
// @route   POST /api/ai-ads/generate-copy
// @access  Private (Coaches)
exports.generateAdCopy = asyncHandler(async (req, res, next) => {
    const { targetAudience, productInfo, campaignObjective } = req.body;
    const coachId = req.user.id;

    if (!targetAudience || !productInfo || !campaignObjective) {
        return res.status(400).json({
            success: false,
            message: 'targetAudience, productInfo, and campaignObjective are required'
        });
    }

    const generatedContent = await aiAdsAgentService.generateAdCopy(
        coachId,
        targetAudience,
        productInfo,
        campaignObjective
    );

    res.status(200).json({
        success: true,
        data: generatedContent
    });
});

// @desc    Optimize budget allocation for a campaign
// @route   POST /api/ai-ads/optimize-budget/:campaignId
// @access  Private (Coaches)
exports.optimizeBudgetAllocation = asyncHandler(async (req, res, next) => {
    const { campaignId } = req.params;
    const coachId = req.user.id;

    const result = await aiAdsAgentService.optimizeBudgetAllocation(coachId, campaignId);

    res.status(200).json({
        success: true,
        data: result
    });
});

// @desc    Detect anomalies in campaign performance
// @route   GET /api/ai-ads/detect-anomalies/:campaignId
// @access  Private (Coaches)
exports.detectAnomalies = asyncHandler(async (req, res, next) => {
    const { campaignId } = req.params;
    const coachId = req.user.id;

    const anomalies = await aiAdsAgentService.detectAnomalies(coachId, campaignId);

    res.status(200).json({
        success: true,
        count: anomalies.length,
        data: anomalies
    });
});

// @desc    Generate targeting recommendations
// @route   POST /api/ai-ads/targeting-recommendations
// @access  Private (Coaches)
exports.generateTargetingRecommendations = asyncHandler(async (req, res, next) => {
    const { targetAudience, budget } = req.body;
    const coachId = req.user.id;

    if (!targetAudience || !budget) {
        return res.status(400).json({
            success: false,
            message: 'targetAudience and budget are required'
        });
    }

    const recommendations = await aiAdsAgentService.generateTargetingRecommendations(
        coachId,
        targetAudience,
        budget
    );

    res.status(200).json({
        success: true,
        data: recommendations
    });
});

// @desc    Auto-optimize campaign
// @route   POST /api/ai-ads/auto-optimize/:campaignId
// @access  Private (Coaches)
exports.autoOptimizeCampaign = asyncHandler(async (req, res, next) => {
    const { campaignId } = req.params;
    const coachId = req.user.id;

    const result = await aiAdsAgentService.autoOptimizeCampaign(coachId, campaignId);

    res.status(200).json({
        success: true,
        data: result
    });
});

// @desc    Get campaign performance insights
// @route   GET /api/ai-ads/performance-insights/:campaignId
// @access  Private (Coaches)
exports.getPerformanceInsights = asyncHandler(async (req, res, next) => {
    const { campaignId } = req.params;
    const coachId = req.user.id;

    const campaign = await AdCampaign.findOne({ _id: campaignId, coachId });
    if (!campaign) {
        return res.status(404).json({
            success: false,
            message: 'Campaign not found'
        });
    }

    const adSets = await AdSet.find({ campaignId });
    const performanceData = await aiAdsAgentService.getAdSetPerformance(adSets);

    const insights = {
        campaignId,
        campaignName: campaign.name,
        totalAdSets: adSets.length,
        performanceData,
        recommendations: []
    };

    // Generate recommendations based on performance
    performanceData.forEach(data => {
        if (data.ctr < 0.01) {
            insights.recommendations.push({
                type: 'LOW_CTR',
                adSetId: data.adSetId,
                adSetName: data.adSetName,
                recommendation: 'Consider updating ad creative or targeting'
            });
        }
        if (data.cpc > 3.0) {
            insights.recommendations.push({
                type: 'HIGH_CPC',
                adSetId: data.adSetId,
                adSetName: data.adSetName,
                recommendation: 'Review bidding strategy and audience targeting'
            });
        }
    });

    res.status(200).json({
        success: true,
        data: insights
    });
});

// @desc    Create AI-optimized campaign
// @route   POST /api/ai-ads/create-optimized-campaign
// @access  Private (Coaches)
exports.createOptimizedCampaign = asyncHandler(async (req, res, next) => {
    const {
        name,
        objective,
        targetAudience,
        budget,
        productInfo,
        coachMetaAccountId
    } = req.body;
    const coachId = req.user.id;

    // Generate ad copy using AI
    const adCopy = await aiAdsAgentService.generateAdCopy(
        coachId,
        targetAudience,
        productInfo,
        objective
    );

    // Generate targeting recommendations
    const targeting = await aiAdsAgentService.generateTargetingRecommendations(
        coachId,
        targetAudience,
        budget
    );

    // Create campaign with AI-generated content
    const campaignData = {
        name,
        objective,
        status: 'PAUSED', // Start paused for review
        dailyBudget: budget,
        targeting: targeting,
        adCopy: adCopy
    };

    const campaign = await AdCampaign.create({
        ...campaignData,
        coachId,
        coachMetaAccountId,
        aiGenerated: true
    });

    res.status(201).json({
        success: true,
        message: 'AI-optimized campaign created successfully',
        data: {
            campaign,
            adCopy,
            targeting
        }
    });
});

// @desc    Get AI ads dashboard data
// @route   GET /api/ai-ads/dashboard
// @access  Private (Coaches)
exports.getAIDashboard = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;

    const campaigns = await AdCampaign.find({ coachId, aiGenerated: true });
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
    const pausedCampaigns = campaigns.filter(c => c.status === 'PAUSED').length;

    // Get performance data for all campaigns
    const performanceData = [];
    for (const campaign of campaigns) {
        const adSets = await AdSet.find({ campaignId: campaign._id });
        const campaignPerformance = await aiAdsAgentService.getAdSetPerformance(adSets);
        
        performanceData.push({
            campaignId: campaign._id,
            campaignName: campaign.name,
            performance: campaignPerformance
        });
    }

    const dashboardData = {
        summary: {
            totalCampaigns,
            activeCampaigns,
            pausedCampaigns,
            totalSpend: 0, // Calculate from performance data
            averageROAS: 0 // Calculate from performance data
        },
        performanceData,
        recentOptimizations: [], // Track recent AI optimizations
        recommendations: [] // AI-generated recommendations
    };

    res.status(200).json({
        success: true,
        data: dashboardData
    });
});

// @desc    Bulk optimize multiple campaigns
// @route   POST /api/ai-ads/bulk-optimize
// @access  Private (Coaches)
exports.bulkOptimizeCampaigns = asyncHandler(async (req, res, next) => {
    const { campaignIds } = req.body;
    const coachId = req.user.id;

    if (!campaignIds || !Array.isArray(campaignIds)) {
        return res.status(400).json({
            success: false,
            message: 'campaignIds array is required'
        });
    }

    const results = [];

    for (const campaignId of campaignIds) {
        try {
            const result = await aiAdsAgentService.autoOptimizeCampaign(coachId, campaignId);
            results.push({
                campaignId,
                success: true,
                result
            });
        } catch (error) {
            results.push({
                campaignId,
                success: false,
                error: error.message
            });
        }
    }

    const successfulOptimizations = results.filter(r => r.success).length;

    res.status(200).json({
        success: true,
        message: `Successfully optimized ${successfulOptimizations} out of ${campaignIds.length} campaigns`,
        data: results
    });
});

// @desc    Get AI-generated ad variations
// @route   POST /api/ai-ads/generate-variations
// @access  Private (Coaches)
exports.generateAdVariations = asyncHandler(async (req, res, next) => {
    const { originalAdCopy, targetAudience, variationCount = 5 } = req.body;
    const coachId = req.user.id;

    if (!originalAdCopy || !targetAudience) {
        return res.status(400).json({
            success: false,
            message: 'originalAdCopy and targetAudience are required'
        });
    }

    // Generate multiple variations using AI
    const variations = [];
    
    for (let i = 0; i < variationCount; i++) {
        try {
            const variation = await aiAdsAgentService.generateAdCopy(
                coachId,
                targetAudience,
                'Variation of existing ad',
                'CONVERSIONS'
            );
            variations.push({
                id: i + 1,
                ...variation
            });
        } catch (error) {
            console.error(`Error generating variation ${i + 1}:`, error);
        }
    }

    res.status(200).json({
        success: true,
        data: {
            originalAdCopy,
            variations,
            totalVariations: variations.length
        }
    });
});
