const axios = require('axios');
const { AdCampaign, AdSet, AdCreative, Ad } = require('../schema');
const CoachMarketingCredentials = require('../schema/CoachMarketingCredentials');

const META_ADS_API_BASE = 'https://graph.facebook.com/v19.0';

// Helper function to get coach's Meta Ads access token
async function getCoachAccessToken(coachId) {
    const credentials = await CoachMarketingCredentials.findOne({ coachId })
        .select('+metaAds.accessToken +encryptionKey');
    
    if (!credentials || !credentials.metaAds.accessToken) {
        throw new Error('Meta Ads access token not found for this coach');
    }
    
    return credentials.getDecryptedAccessToken();
}

// Helper function to get coach's Meta Ads account info
async function getCoachMetaAccountInfo(coachId) {
    const credentials = await CoachMarketingCredentials.findOne({ coachId })
        .select('metaAds.businessAccountId metaAds.adAccountId');
    
    if (!credentials) {
        throw new Error('Meta Ads account information not found for this coach');
    }
    
    return {
        businessAccountId: credentials.metaAds.businessAccountId,
        adAccountId: credentials.metaAds.adAccountId
    };
}

async function fetchCampaigns(coachId, coachMetaAccountId) {
    // Fetch campaigns for a given Meta Ad Account
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/act_${coachMetaAccountId}/campaigns?access_token=${accessToken}`;
    const { data } = await axios.get(url);
    return data;
}

async function fetchCampaignInsights(coachId, campaignId) {
    // Fetch analytics/insights for a campaign
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/${campaignId}/insights?access_token=${accessToken}`;
    const { data } = await axios.get(url);
    return data;
}

async function createCampaign(coachId, coachMetaAccountId, campaignData) {
    // Create a new campaign
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/act_${coachMetaAccountId}/campaigns?access_token=${accessToken}`;
    const { data } = await axios.post(url, campaignData);
    return data;
}

async function updateCampaign(coachId, campaignId, updateData) {
    // Update campaign settings
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/${campaignId}?access_token=${accessToken}`;
    const { data } = await axios.post(url, updateData);
    return data;
}

async function pauseCampaign(coachId, campaignId) {
    return updateCampaign(coachId, campaignId, { status: 'PAUSED' });
}

async function resumeCampaign(coachId, campaignId) {
    return updateCampaign(coachId, campaignId, { status: 'ACTIVE' });
}

// New methods for complete URL campaign creation
async function createAdSet(coachId, campaignId, adSetData) {
    // Create an ad set for targeting and budget
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/act_${campaignId}/adsets?access_token=${accessToken}`;
    const { data } = await axios.post(url, adSetData);
    return data;
}

async function createAdCreative(coachId, campaignId, creativeData) {
    // Create an ad creative with image and text
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/act_${campaignId}/adcreatives?access_token=${accessToken}`;
    const { data } = await axios.post(url, creativeData);
    return data;
}

async function createAd(coachId, campaignId, adData) {
    // Create an ad that combines ad set and creative
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/act_${campaignId}/ads?access_token=${accessToken}`;
    const { data } = await axios.post(url, adData);
    return data;
}

async function uploadImage(coachId, imageUrl) {
    // Upload image to Meta and get image hash
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/me/adimages?access_token=${accessToken}`;
    const { data } = await axios.post(url, { url: imageUrl });
    return data;
}

async function fetchAdSets(coachId, campaignId) {
    // Fetch ad sets for a campaign
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/${campaignId}/adsets?access_token=${accessToken}`;
    const { data } = await axios.get(url);
    return data;
}

async function fetchAdCreatives(coachId, campaignId) {
    // Fetch ad creatives for a campaign
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/${campaignId}/adcreatives?access_token=${accessToken}`;
    const { data } = await axios.get(url);
    return data;
}

async function fetchAds(coachId, campaignId) {
    // Fetch ads for a campaign
    const accessToken = await getCoachAccessToken(coachId);
    const url = `${META_ADS_API_BASE}/${campaignId}/ads?access_token=${accessToken}`;
    const { data } = await axios.get(url);
    return data;
}

async function syncCampaignsToDB(coachId, coachMetaAccountId) {
    // Fetch and upsert all campaigns for a coach
    const campaigns = await fetchCampaigns(coachId, coachMetaAccountId);
    for (const c of campaigns.data) {
        await AdCampaign.findOneAndUpdate(
            { campaignId: c.id, coachId },
            { name: c.name, status: c.status, objective: c.objective, lastSynced: new Date(), metaRaw: c },
            { upsert: true, new: true }
        );
    }
    return campaigns.data.length;
}

// New method for complete URL campaign creation
async function createCompleteUrlCampaign(coachId, campaignData, adSetData, creativeData, adData) {
    try {
        // Step 1: Create campaign
        const campaign = await createCampaign(coachId, campaignData.coachMetaAccountId, campaignData);
        
        // Step 2: Create ad set
        const adSet = await createAdSet(coachId, campaign.id, adSetData);
        
        // Step 3: Create ad creative
        const creative = await createAdCreative(coachId, campaign.id, creativeData);
        
        // Step 4: Create ad
        const ad = await createAd(coachId, campaign.id, {
            ...adData,
            adset_id: adSet.id,
            creative: { creative_id: creative.id }
        });
        
        return {
            campaign,
            adSet,
            creative,
            ad
        };
    } catch (error) {
        throw new Error(`Failed to create complete URL campaign: ${error.message}`);
    }
}

// Verify coach's Meta Ads credentials
async function verifyCoachCredentials(coachId) {
    try {
        const credentials = await CoachMarketingCredentials.findOne({ coachId })
            .select('+metaAds.accessToken +encryptionKey');
        
        if (!credentials || !credentials.metaAds.accessToken) {
            return false;
        }
        
        const accessToken = credentials.getDecryptedAccessToken();
        const response = await axios.get(`${META_ADS_API_BASE}/me?access_token=${accessToken}`);
        
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

module.exports = {
    fetchCampaigns,
    fetchCampaignInsights,
    createCampaign,
    updateCampaign,
    pauseCampaign,
    resumeCampaign,
    createAdSet,
    createAdCreative,
    createAd,
    uploadImage,
    fetchAdSets,
    fetchAdCreatives,
    fetchAds,
    syncCampaignsToDB,
    createCompleteUrlCampaign,
    verifyCoachCredentials,
    getCoachAccessToken,
    getCoachMetaAccountInfo
};
