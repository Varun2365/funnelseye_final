// D:\PRJ_YCT_Final\services\aiAdsAgentService.js

const OpenAI = require('openai');
const AdCampaign = require('../schema/AdCampaign');
const AdSet = require('../schema/AdSet');
const AdCreative = require('../schema/AdCreative');
const Ad = require('../schema/Ad');
const metaAdsService = require('./metaAdsService');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class AIAdsAgent {
    constructor() {
        this.optimizationHistory = new Map();
        this.performanceThresholds = {
            ctr: 0.02, // 2% CTR threshold
            cpc: 2.0,  // $2 CPC threshold
            roas: 3.0  // 3:1 ROAS threshold
        };
    }

    /**
     * Generate AI-powered ad copy and creatives
     */
    async generateAdCopy(coachId, targetAudience, productInfo, campaignObjective) {
        try {
            const prompt = `
                Create compelling Facebook ad copy for a fitness coach targeting ${targetAudience}.
                
                Product/Service: ${productInfo}
                Campaign Objective: ${campaignObjective}
                
                Generate:
                1. Primary Headline (40 characters max)
                2. Secondary Headline (40 characters max)
                3. Ad Copy (125 characters max)
                4. Call-to-Action
                5. 3-5 ad variations for A/B testing
                
                Make it engaging, benefit-focused, and include urgency/emotion.
            `;

            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 500
            });

            const generatedContent = completion.choices[0].message.content;
            return this.parseGeneratedContent(generatedContent);
        } catch (error) {
            console.error('Error generating ad copy:', error);
            throw new Error('Failed to generate ad copy');
        }
    }

    /**
     * Parse AI-generated content into structured format
     */
    parseGeneratedContent(content) {
        const lines = content.split('\n').filter(line => line.trim());
        const result = {
            primaryHeadline: '',
            secondaryHeadline: '',
            adCopy: '',
            callToAction: '',
            variations: []
        };

        let currentSection = '';
        let variationIndex = 0;

        for (const line of lines) {
            if (line.includes('Primary Headline:')) {
                currentSection = 'primaryHeadline';
                result.primaryHeadline = line.split(':')[1]?.trim() || '';
            } else if (line.includes('Secondary Headline:')) {
                currentSection = 'secondaryHeadline';
                result.secondaryHeadline = line.split(':')[1]?.trim() || '';
            } else if (line.includes('Ad Copy:')) {
                currentSection = 'adCopy';
                result.adCopy = line.split(':')[1]?.trim() || '';
            } else if (line.includes('Call-to-Action:')) {
                currentSection = 'callToAction';
                result.callToAction = line.split(':')[1]?.trim() || '';
            } else if (line.includes('Variation') || line.includes('variation')) {
                currentSection = 'variation';
                variationIndex++;
                result.variations.push({
                    id: variationIndex,
                    headline: '',
                    copy: '',
                    cta: ''
                });
            } else if (currentSection === 'variation' && result.variations.length > 0) {
                const currentVariation = result.variations[result.variations.length - 1];
                if (line.includes('Headline:')) {
                    currentVariation.headline = line.split(':')[1]?.trim() || '';
                } else if (line.includes('Copy:')) {
                    currentVariation.copy = line.split(':')[1]?.trim() || '';
                } else if (line.includes('CTA:')) {
                    currentVariation.cta = line.split(':')[1]?.trim() || '';
                }
            }
        }

        return result;
    }

    /**
     * Intelligent budget allocation based on performance
     */
    async optimizeBudgetAllocation(coachId, campaignId) {
        try {
            const campaign = await AdCampaign.findOne({ _id: campaignId, coachId });
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            const adSets = await AdSet.find({ campaignId });
            const performanceData = await this.getAdSetPerformance(adSets);

            // Calculate optimal budget distribution
            const totalBudget = campaign.dailyBudget || 100;
            const optimizedAllocation = this.calculateOptimalAllocation(performanceData, totalBudget);

            // Update ad set budgets
            for (const allocation of optimizedAllocation) {
                await AdSet.findByIdAndUpdate(allocation.adSetId, {
                    dailyBudget: allocation.allocatedBudget
                });
            }

            return {
                success: true,
                message: 'Budget allocation optimized',
                allocation: optimizedAllocation
            };
        } catch (error) {
            console.error('Error optimizing budget allocation:', error);
            throw error;
        }
    }

    /**
     * Get performance data for ad sets
     */
    async getAdSetPerformance(adSets) {
        const performanceData = [];

        for (const adSet of adSets) {
            try {
                const insights = await metaAdsService.fetchCampaignInsights(adSet.adSetId);
                const data = insights.data?.[0] || {};

                performanceData.push({
                    adSetId: adSet._id,
                    adSetName: adSet.name,
                    impressions: parseInt(data.impressions) || 0,
                    clicks: parseInt(data.clicks) || 0,
                    spend: parseFloat(data.spend) || 0,
                    ctr: data.ctr ? parseFloat(data.ctr) : 0,
                    cpc: data.cpc ? parseFloat(data.cpc) : 0,
                    roas: data.actions ? this.calculateROAS(data.actions, data.spend) : 0
                });
            } catch (error) {
                console.error(`Error fetching insights for ad set ${adSet.adSetId}:`, error);
            }
        }

        return performanceData;
    }

    /**
     * Calculate ROAS from actions data
     */
    calculateROAS(actions, spend) {
        if (!actions || !spend) return 0;
        
        const purchaseActions = actions.filter(action => 
            action.action_type === 'purchase' || action.action_type === 'offsite_conversion'
        );
        
        const totalRevenue = purchaseActions.reduce((sum, action) => 
            sum + (parseFloat(action.value) || 0), 0
        );
        
        return spend > 0 ? totalRevenue / parseFloat(spend) : 0;
    }

    /**
     * Calculate optimal budget allocation
     */
    calculateOptimalAllocation(performanceData, totalBudget) {
        if (performanceData.length === 0) {
            return [];
        }

        // Calculate performance scores
        const scoredData = performanceData.map(data => ({
            ...data,
            score: this.calculatePerformanceScore(data)
        }));

        // Sort by performance score
        scoredData.sort((a, b) => b.score - a.score);

        // Allocate budget based on performance
        const allocation = [];
        let remainingBudget = totalBudget;

        for (const data of scoredData) {
            const budgetShare = Math.max(0.1, data.score / scoredData.reduce((sum, d) => sum + d.score, 0));
            const allocatedBudget = Math.round(totalBudget * budgetShare * 100) / 100;
            
            allocation.push({
                adSetId: data.adSetId,
                adSetName: data.adSetName,
                performanceScore: data.score,
                allocatedBudget: Math.min(allocatedBudget, remainingBudget)
            });

            remainingBudget -= allocatedBudget;
            if (remainingBudget <= 0) break;
        }

        return allocation;
    }

    /**
     * Calculate performance score based on multiple metrics
     */
    calculatePerformanceScore(data) {
        const ctrScore = Math.min(data.ctr / this.performanceThresholds.ctr, 2);
        const cpcScore = Math.max(0, 1 - (data.cpc / this.performanceThresholds.cpc));
        const roasScore = Math.min(data.roas / this.performanceThresholds.roas, 2);

        return (ctrScore * 0.3 + cpcScore * 0.3 + roasScore * 0.4);
    }

    /**
     * Detect anomalies in campaign performance
     */
    async detectAnomalies(coachId, campaignId) {
        try {
            const campaign = await AdCampaign.findOne({ _id: campaignId, coachId });
            const adSets = await AdSet.find({ campaignId });
            const performanceData = await this.getAdSetPerformance(adSets);

            const anomalies = [];

            for (const data of performanceData) {
                // Check for low CTR
                if (data.ctr < this.performanceThresholds.ctr * 0.5) {
                    anomalies.push({
                        type: 'LOW_CTR',
                        adSetId: data.adSetId,
                        adSetName: data.adSetName,
                        currentValue: data.ctr,
                        threshold: this.performanceThresholds.ctr,
                        severity: 'HIGH',
                        recommendation: 'Consider updating ad creative or targeting'
                    });
                }

                // Check for high CPC
                if (data.cpc > this.performanceThresholds.cpc * 1.5) {
                    anomalies.push({
                        type: 'HIGH_CPC',
                        adSetId: data.adSetId,
                        adSetName: data.adSetName,
                        currentValue: data.cpc,
                        threshold: this.performanceThresholds.cpc,
                        severity: 'MEDIUM',
                        recommendation: 'Review bidding strategy and audience targeting'
                    });
                }

                // Check for low ROAS
                if (data.roas < this.performanceThresholds.roas * 0.7) {
                    anomalies.push({
                        type: 'LOW_ROAS',
                        adSetId: data.adSetId,
                        adSetName: data.adSetName,
                        currentValue: data.roas,
                        threshold: this.performanceThresholds.roas,
                        severity: 'HIGH',
                        recommendation: 'Optimize landing page and offer'
                    });
                }
            }

            return anomalies;
        } catch (error) {
            console.error('Error detecting anomalies:', error);
            throw error;
        }
    }

    /**
     * Generate targeting recommendations
     */
    async generateTargetingRecommendations(coachId, targetAudience, budget) {
        try {
            const prompt = `
                Generate Facebook ad targeting recommendations for a fitness coach.
                
                Target Audience: ${targetAudience}
                Budget: $${budget} per day
                
                Provide:
                1. Age ranges (3-5 options)
                2. Interest targeting (10-15 interests)
                3. Behavior targeting (5-8 behaviors)
                4. Lookalike audience suggestions
                5. Custom audience ideas
                6. Placement recommendations
                
                Focus on fitness, health, and wellness interests.
            `;

            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 800
            });

            return this.parseTargetingRecommendations(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error generating targeting recommendations:', error);
            throw new Error('Failed to generate targeting recommendations');
        }
    }

    /**
     * Parse targeting recommendations
     */
    parseTargetingRecommendations(content) {
        const recommendations = {
            ageRanges: [],
            interests: [],
            behaviors: [],
            lookalikeAudiences: [],
            customAudiences: [],
            placements: []
        };

        const lines = content.split('\n');
        let currentSection = '';

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            if (trimmedLine.includes('Age ranges:') || trimmedLine.includes('Age Ranges:')) {
                currentSection = 'ageRanges';
            } else if (trimmedLine.includes('Interest targeting:') || trimmedLine.includes('Interests:')) {
                currentSection = 'interests';
            } else if (trimmedLine.includes('Behavior targeting:') || trimmedLine.includes('Behaviors:')) {
                currentSection = 'behaviors';
            } else if (trimmedLine.includes('Lookalike audience:') || trimmedLine.includes('Lookalike:')) {
                currentSection = 'lookalikeAudiences';
            } else if (trimmedLine.includes('Custom audience:') || trimmedLine.includes('Custom:')) {
                currentSection = 'customAudiences';
            } else if (trimmedLine.includes('Placement:') || trimmedLine.includes('Placements:')) {
                currentSection = 'placements';
            } else if (trimmedLine.match(/^\d+\./)) {
                const item = trimmedLine.replace(/^\d+\.\s*/, '');
                if (currentSection && recommendations[currentSection]) {
                    recommendations[currentSection].push(item);
                }
            }
        }

        return recommendations;
    }

    /**
     * Auto-optimize campaign based on performance
     */
    async autoOptimizeCampaign(coachId, campaignId) {
        try {
            const anomalies = await this.detectAnomalies(coachId, campaignId);
            
            if (anomalies.length === 0) {
                return { success: true, message: 'No optimization needed' };
            }

            const optimizations = [];

            for (const anomaly of anomalies) {
                switch (anomaly.type) {
                    case 'LOW_CTR':
                        optimizations.push({
                            action: 'UPDATE_CREATIVE',
                            adSetId: anomaly.adSetId,
                            reason: anomaly.recommendation
                        });
                        break;
                    case 'HIGH_CPC':
                        optimizations.push({
                            action: 'ADJUST_BIDDING',
                            adSetId: anomaly.adSetId,
                            reason: anomaly.recommendation
                        });
                        break;
                    case 'LOW_ROAS':
                        optimizations.push({
                            action: 'PAUSE_ADSET',
                            adSetId: anomaly.adSetId,
                            reason: anomaly.recommendation
                        });
                        break;
                }
            }

            return {
                success: true,
                message: 'Campaign optimization completed',
                optimizations,
                anomalies
            };
        } catch (error) {
            console.error('Error auto-optimizing campaign:', error);
            throw error;
        }
    }
}

module.exports = new AIAdsAgent();
