// Test Script for Social Media Integration
// This script demonstrates how to use the new social media integration endpoints

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const AUTH_TOKEN = 'your_jwt_token_here'; // Replace with actual token

// Headers for authenticated requests
const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
};

// Test data
const testCoachData = {
    coachName: "John Doe",
    niche: "Weight Loss & Nutrition",
    offer: "12-Week Transformation Program",
    targetAudience: "weight_loss",
    style: "Modern and motivational",
    colorScheme: "Energetic blue and orange",
    additionalElements: "Before/after transformation visuals"
};

const testPostData = {
    coachName: "John Doe",
    niche: "Weight Loss & Nutrition",
    offer: "12-Week Transformation Program",
    targetAudience: "weight_loss",
    postType: "motivational",
    includeCallToAction: true,
    tone: "professional"
};

const testHeadlineData = {
    coachName: "John Doe",
    niche: "Weight Loss & Nutrition",
    offer: "12-Week Transformation Program",
    targetAudience: "weight_loss",
    tone: "Motivational and urgent",
    headlineCount: 5,
    includeHashtags: true
};

const testUploadData = {
    imageUrl: "https://example.com/generated-poster.jpg", // Replace with actual generated image URL
    caption: "Transform your body in 12 weeks!",
    hashtags: ["#WeightLoss", "#Fitness", "#Transformation"],
    callToAction: "DM me 'TRANSFORM' to get started!",
    targetAudience: "weight_loss",
    budget: 50,
    duration: 7,
    coachMetaAccountId: "act_123456789" // Replace with actual Meta Ads account ID
};

const testCampaignData = {
    coachName: "John Doe",
    niche: "Weight Loss & Nutrition",
    offer: "12-Week Transformation Program",
    targetAudience: "weight_loss",
    campaignDuration: 7,
    dailyBudget: 50,
    postFrequency: 1,
    coachMetaAccountId: "act_123456789" // Replace with actual Meta Ads account ID
};

// Test functions
async function testGeneratePoster() {
    try {
        console.log('🎨 Testing Poster Generation...');
        const response = await axios.post(`${BASE_URL}/ai-ads/generate-poster`, testCoachData, { headers });
        
        if (response.data.success) {
            console.log('✅ Poster generated successfully!');
            console.log('📸 Image URL:', response.data.data.imageUrl);
            console.log('📝 Prompt:', response.data.data.prompt);
            return response.data.data.imageUrl; // Return for use in upload test
        } else {
            console.log('❌ Poster generation failed:', response.data.message);
        }
    } catch (error) {
        console.error('❌ Error generating poster:', error.response?.data || error.message);
    }
}

async function testGenerateHeadlines() {
    try {
        console.log('\n📝 Testing Headline Generation...');
        const response = await axios.post(`${BASE_URL}/ai-ads/generate-headlines`, testHeadlineData, { headers });
        
        if (response.data.success) {
            console.log('✅ Headlines generated successfully!');
            console.log(`📊 Total headlines: ${response.data.data.totalHeadlines}`);
            response.data.data.headlines.forEach((headline, index) => {
                console.log(`${index + 1}. ${headline.headline}`);
                if (headline.hashtags.length > 0) {
                    console.log(`   Hashtags: ${headline.hashtags.join(' ')}`);
                }
            });
        } else {
            console.log('❌ Headline generation failed:', response.data.message);
        }
    } catch (error) {
        console.error('❌ Error generating headlines:', error.response?.data || error.message);
    }
}

async function testGenerateSocialPost() {
    try {
        console.log('\n📱 Testing Social Media Post Generation...');
        const response = await axios.post(`${BASE_URL}/ai-ads/generate-social-post`, testPostData, { headers });
        
        if (response.data.success) {
            console.log('✅ Social media post generated successfully!');
            const post = response.data.data.post;
            console.log('📝 Caption:', post.caption);
            console.log('🎯 Call to Action:', post.callToAction);
            console.log('🏷️ Hashtags:', post.hashtags.join(' '));
            console.log('😊 Emojis:', post.emojis.join(' '));
        } else {
            console.log('❌ Social media post generation failed:', response.data.message);
        }
    } catch (error) {
        console.error('❌ Error generating social media post:', error.response?.data || error.message);
    }
}

async function testUploadToInstagram(imageUrl) {
    try {
        console.log('\n🚀 Testing Instagram Upload...');
        
        // Update test data with actual generated image URL
        const uploadData = { ...testUploadData, imageUrl: imageUrl || testUploadData.imageUrl };
        
        const response = await axios.post(`${BASE_URL}/ai-ads/upload-to-instagram`, uploadData, { headers });
        
        if (response.data.success) {
            console.log('✅ Instagram upload successful!');
            const data = response.data.data.data;
            console.log('📊 Campaign ID:', data.campaignId);
            console.log('📊 Ad Set ID:', data.adSetId);
            console.log('📊 Creative ID:', data.creativeId);
            console.log('📊 Ad ID:', data.adId);
            console.log('📊 Status:', data.status);
            console.log('📊 Review Required:', data.reviewRequired);
        } else {
            console.log('❌ Instagram upload failed:', response.data.message);
        }
    } catch (error) {
        console.error('❌ Error uploading to Instagram:', error.response?.data || error.message);
    }
}

async function testGenerateCampaign() {
    try {
        console.log('\n🎯 Testing Campaign Generation...');
        const response = await axios.post(`${BASE_URL}/ai-ads/generate-campaign`, testCampaignData, { headers });
        
        if (response.data.success) {
            console.log('✅ Campaign generated successfully!');
            const campaign = response.data.data.data;
            console.log(`📅 Duration: ${campaign.duration} days`);
            console.log(`💰 Daily Budget: $${campaign.dailyBudget}`);
            console.log(`📊 Total Posts: ${campaign.posts.length}`);
            
            campaign.posts.forEach((post, index) => {
                console.log(`\n📝 Post ${index + 1}:`);
                console.log(`   📅 Scheduled: ${new Date(post.scheduledDate).toLocaleDateString()}`);
                console.log(`   📊 Status: ${post.uploadStatus}`);
                if (post.error) {
                    console.log(`   ❌ Error: ${post.error}`);
                }
            });
        } else {
            console.log('❌ Campaign generation failed:', response.data.message);
        }
    } catch (error) {
        console.error('❌ Error generating campaign:', error.response?.data || error.message);
    }
}

async function testGetHistory() {
    try {
        console.log('\n📚 Testing History Retrieval...');
        const response = await axios.get(`${BASE_URL}/ai-ads/social-media-history?page=1&limit=5`, { headers });
        
        if (response.data.success) {
            console.log('✅ History retrieved successfully!');
            const history = response.data.data;
            console.log(`📊 Total Items: ${history.totalItems}`);
            console.log(`📄 Current Page: ${history.currentPage}`);
            console.log(`📋 Items Per Page: ${history.itemsPerPage}`);
            console.log(`💬 Message: ${history.message}`);
        } else {
            console.log('❌ History retrieval failed:', response.data.message);
        }
    } catch (error) {
        console.error('❌ Error retrieving history:', error.response?.data || error.message);
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Social Media Integration Tests...\n');
    
    // Test 1: Generate Poster
    const generatedImageUrl = await testGeneratePoster();
    
    // Test 2: Generate Headlines
    await testGenerateHeadlines();
    
    // Test 3: Generate Social Media Post
    await testGenerateSocialPost();
    
    // Test 4: Upload to Instagram (if poster was generated)
    if (generatedImageUrl) {
        await testUploadToInstagram(generatedImageUrl);
    } else {
        console.log('\n🚀 Skipping Instagram upload test (no image generated)');
    }
    
    // Test 5: Generate Campaign
    await testGenerateCampaign();
    
    // Test 6: Get History
    await testGetHistory();
    
    console.log('\n✨ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
    // Check if auth token is provided
    if (AUTH_TOKEN === 'your_jwt_token_here') {
        console.log('❌ Please update AUTH_TOKEN in the script with your actual JWT token');
        console.log('💡 You can get this token by logging in to your application');
        process.exit(1);
    }
    
    runAllTests().catch(console.error);
}

module.exports = {
    testGeneratePoster,
    testGenerateHeadlines,
    testGenerateSocialPost,
    testUploadToInstagram,
    testGenerateCampaign,
    testGetHistory,
    runAllTests
};
