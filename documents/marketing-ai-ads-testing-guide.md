# Marketing AI & Ads System Testing Guide

## Overview

This comprehensive testing guide covers all aspects of the Marketing AI & Ads system, including Meta/Facebook Ads integration, AI-powered content generation, campaign optimization, and social media integration. The guide provides step-by-step testing procedures, expected results, and troubleshooting information.

## Test Environment Setup

### Prerequisites

#### 1. Test Accounts Required
```bash
# Meta Business Account
- Meta Business Manager Account (test environment)
- Facebook Ad Account (test mode)
- Facebook Page
- Instagram Business Account (optional)

# API Access
- Meta Ads Access Token (with test permissions)
- OpenAI API Key (for AI features)
- Meta App ID and Secret

# Test Data
- Sample product/service information
- Target audience descriptions
- Budget ranges for testing
- Image assets for creatives
```

#### 2. Environment Variables
```bash
# Required environment variables for testing
META_ADS_ACCESS_TOKEN=your_test_meta_access_token
OPENAI_API_KEY=your_openai_api_key
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
NODE_ENV=test
```

#### 3. Test Data Setup
```javascript
// Sample test data for campaigns
const testCampaignData = {
    name: "Test Fitness Campaign",
    objective: "CONVERSIONS",
    dailyBudget: 25,
    targetAudience: "Fitness enthusiasts, 25-45, interested in personal training",
    productInfo: "Personal fitness coaching program with meal plans and workout routines"
};

const testCoachData = {
    coachId: "test_coach_123",
    metaBusinessAccountId: "test_business_account",
    metaAdAccountId: "act_test123456",
    facebookPageId: "test_page_id",
    instagramAccountId: "test_instagram_id"
};
```

## Test Categories

### 1. Authentication & Authorization Tests

#### 1.1 Valid Authentication
**Test Case:** TC-AUTH-001
```bash
curl -X GET "http://localhost:3000/api/ads" \
  -H "Authorization: Bearer <valid_coach_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "campaigns": []
  }
}
```

#### 1.2 Invalid Authentication
**Test Case:** TC-AUTH-002
```bash
curl -X GET "http://localhost:3000/api/ads" \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

#### 1.3 Missing Authentication
**Test Case:** TC-AUTH-003
```bash
curl -X GET "http://localhost:3000/api/ads" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 2. Meta Ads Integration Tests

#### 2.1 Campaign Creation
**Test Case:** TC-META-001
```bash
curl -X POST "http://localhost:3000/api/ads/create" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "coachMetaAccountId": "act_test123456",
    "campaignData": {
      "name": "Test Campaign",
      "objective": "CONVERSIONS",
      "dailyBudget": 25,
      "status": "PAUSED"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "campaign_test_id",
      "name": "Test Campaign",
      "status": "PAUSED",
      "objective": "CONVERSIONS",
      "dailyBudget": 25
    }
  }
}
```

#### 2.2 Campaign Sync
**Test Case:** TC-META-002
```bash
curl -X POST "http://localhost:3000/api/ads/sync" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Campaigns synced successfully",
  "data": {
    "syncedCampaigns": 5,
    "newCampaigns": 2,
    "updatedCampaigns": 3
  }
}
```

#### 2.3 Campaign Analytics
**Test Case:** TC-META-003
```bash
curl -X GET "http://localhost:3000/api/ads/campaign_id/analytics" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "campaignId": "campaign_id",
    "impressions": 10000,
    "clicks": 500,
    "conversions": 25,
    "spend": 250,
    "ctr": 5.0,
    "cpc": 0.50,
    "cpm": 25.0,
    "roas": 4.0
  }
}
```

### 3. AI Content Generation Tests

#### 3.1 AI Ad Copy Generation
**Test Case:** TC-AI-001
```bash
curl -X POST "http://localhost:3000/api/ai-ads/generate-copy" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "targetAudience": "Fitness enthusiasts, 25-45, interested in personal training",
    "productInfo": "Personal fitness coaching program with meal plans and workout routines",
    "campaignObjective": "CONVERSIONS"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "primaryHeadline": "Transform Your Fitness Journey",
    "secondaryHeadline": "Personal Coaching That Works",
    "adCopy": "Ready to achieve your fitness goals? Get personalized coaching, meal plans, and workout routines designed just for you.",
    "callToAction": "Get Started",
    "variations": [
      {
        "id": 1,
        "headline": "Lose Weight & Build Muscle",
        "copy": "Stop struggling with generic workouts. Get a personalized plan that fits your lifestyle and goals.",
        "cta": "Start Today"
      }
    ]
  }
}
```

#### 3.2 Targeting Recommendations
**Test Case:** TC-AI-002
```bash
curl -X POST "http://localhost:3000/api/ai-ads/targeting-recommendations" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "targetAudience": "Fitness enthusiasts, 25-45",
    "budget": 50
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "ageRanges": ["25-34", "35-44", "45-54"],
    "interests": ["Fitness", "Health and wellness", "Nutrition"],
    "behaviors": ["Frequent travelers", "Small business owners"],
    "lookalikeAudiences": ["Fitness enthusiasts", "Health-conscious consumers"],
    "customAudiences": ["Website visitors", "Email subscribers"],
    "placements": ["Facebook Feed", "Instagram Stories", "Instagram Feed"]
  }
}
```

#### 3.3 AI Poster Generation
**Test Case:** TC-AI-003
```bash
curl -X POST "http://localhost:3000/api/ai-ads/generate-poster" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "coachName": "John Fitness Coach",
    "niche": "Weight Loss & Muscle Building",
    "offer": "30-Day Transformation Program",
    "targetAudience": "weight_loss",
    "style": "modern",
    "colorScheme": "blue_green"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "backgroundImage": "https://example.com/generated-image.jpg",
    "textContent": {
      "headline": "Transform Your Life",
      "subheadline": "30-Day Guaranteed Results",
      "benefits": ["Lose Weight", "Build Muscle", "Boost Energy"],
      "cta": "Start Today"
    }
  }
}
```

### 4. Campaign Optimization Tests

#### 4.1 Budget Optimization
**Test Case:** TC-OPT-001
```bash
curl -X POST "http://localhost:3000/api/ai-ads/optimize-budget/campaign_id" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Budget allocation optimized",
    "allocation": [
      {
        "adSetId": "adset123",
        "adSetName": "High Performing Ad Set",
        "performanceScore": 0.85,
        "allocatedBudget": 75.50,
        "previousBudget": 50.00
      }
    ]
  }
}
```

#### 4.2 Anomaly Detection
**Test Case:** TC-OPT-002
```bash
curl -X GET "http://localhost:3000/api/ai-ads/detect-anomalies/campaign_id" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "type": "LOW_CTR",
      "adSetId": "adset123",
      "adSetName": "Target Audience",
      "currentValue": 0.008,
      "threshold": 0.02,
      "severity": "HIGH",
      "recommendation": "Consider updating ad creative or targeting"
    },
    {
      "type": "HIGH_CPC",
      "adSetId": "adset456",
      "adSetName": "Broad Audience",
      "currentValue": 3.50,
      "threshold": 2.0,
      "severity": "MEDIUM",
      "recommendation": "Consider refining targeting to reduce CPC"
    }
  ]
}
```

#### 4.3 Auto Optimization
**Test Case:** TC-OPT-003
```bash
curl -X POST "http://localhost:3000/api/ai-ads/auto-optimize/campaign_id" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Campaign auto-optimized successfully",
    "optimizations": [
      {
        "type": "budget_reallocation",
        "description": "Moved budget from underperforming ad sets to top performers",
        "impact": "+15% expected conversions"
      },
      {
        "type": "targeting_refinement",
        "description": "Narrowed audience targeting based on performance data",
        "impact": "-20% expected CPC"
      }
    ]
  }
}
```

### 5. Social Media Integration Tests

#### 5.1 Social Media Post Generation
**Test Case:** TC-SOCIAL-001
```bash
curl -X POST "http://localhost:3000/api/ai-ads/generate-social-post" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "coachName": "John Fitness Coach",
    "niche": "Weight Loss & Muscle Building",
    "offer": "30-Day Transformation Program",
    "targetAudience": "weight_loss",
    "postType": "motivational",
    "includeCallToAction": true,
    "tone": "professional"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "post": {
      "caption": "Transform your life with our proven 30-day program...",
      "callToAction": "DM me to get started!",
      "hashtags": ["#fitness", "#weightloss", "#transformation"],
      "emojis": ["💪", "🔥", "✨"],
      "fullPost": "Complete post content..."
    }
  }
}
```

#### 5.2 Instagram Upload
**Test Case:** TC-SOCIAL-002
```bash
curl -X POST "http://localhost:3000/api/ai-ads/upload-to-instagram" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/poster.jpg",
    "caption": "Transform your body!",
    "hashtags": ["#fitness", "#weightloss"],
    "callToAction": "DM me to start!",
    "targetAudience": "weight_loss",
    "budget": 50,
    "duration": 7
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Instagram post uploaded successfully",
  "data": {
    "campaignId": "campaign123",
    "adSetId": "adset456",
    "creativeId": "creative789",
    "adId": "ad101",
    "imageHash": "image_hash_123",
    "status": "PAUSED",
    "reviewRequired": true
  }
}
```

### 6. Complete Campaign Package Tests

#### 6.1 AI-Optimized Campaign Creation
**Test Case:** TC-CAMPAIGN-001
```bash
curl -X POST "http://localhost:3000/api/ai-ads/create-optimized-campaign" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI-Optimized Fitness Campaign",
    "objective": "LEAD_GENERATION",
    "targetAudience": "Busy professionals wanting to get fit",
    "budget": 100,
    "productInfo": "Online fitness coaching with personalized meal plans",
    "coachMetaAccountId": "act_test123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "AI-optimized campaign created successfully",
  "data": {
    "campaign": {
      "id": "campaign_id",
      "name": "AI-Optimized Fitness Campaign",
      "status": "PAUSED",
      "objective": "LEAD_GENERATION",
      "dailyBudget": 100,
      "aiGenerated": true
    },
    "adCopy": {
      "primaryHeadline": "Transform Your Fitness Journey",
      "secondaryHeadline": "Personal Coaching That Works",
      "adCopy": "Ready to achieve your fitness goals?",
      "callToAction": "Get Started"
    },
    "targeting": {
      "ageRanges": ["25-34", "35-44"],
      "interests": ["Fitness", "Health and wellness"],
      "behaviors": ["Frequent travelers"]
    }
  }
}
```

#### 6.2 Social Media Campaign Package
**Test Case:** TC-CAMPAIGN-002
```bash
curl -X POST "http://localhost:3000/api/ai-ads/generate-campaign" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "coachName": "John Fitness Coach",
    "niche": "Weight Loss & Muscle Building",
    "offer": "30-Day Transformation Program",
    "targetAudience": "Busy moms wanting to lose weight",
    "campaignDuration": 14,
    "dailyBudget": 75,
    "postFrequency": 2,
    "coachMetaAccountId": "act_test123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "campaign_id",
      "name": "30-Day Transformation Social Campaign",
      "status": "PAUSED"
    },
    "socialPosts": [
      {
        "day": 1,
        "platform": "Instagram",
        "content": "Day 1: Your transformation starts today...",
        "image": "generated_image_url_1"
      },
      {
        "day": 2,
        "platform": "Facebook",
        "content": "Day 2: Building momentum...",
        "image": "generated_image_url_2"
      }
    ],
    "adSets": [
      {
        "name": "Instagram Feed",
        "targeting": "Instagram users interested in fitness",
        "budget": 35
      },
      {
        "name": "Facebook Feed",
        "targeting": "Facebook users interested in weight loss",
        "budget": 40
      }
    ]
  }
}
```

### 7. Performance Analytics Tests

#### 7.1 AI Dashboard Data
**Test Case:** TC-ANALYTICS-001
```bash
curl -X GET "http://localhost:3000/api/ai-ads/dashboard" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCampaigns": 8,
      "activeCampaigns": 5,
      "pausedCampaigns": 3,
      "totalSpend": 1250,
      "averageROAS": 3.2
    },
    "performanceData": [
      {
        "campaignId": "campaign_1",
        "campaignName": "Fitness Campaign",
        "performance": {
          "impressions": 10000,
          "clicks": 500,
          "conversions": 25,
          "ctr": 5.0,
          "cpc": 0.50,
          "roas": 4.0
        }
      }
    ],
    "recentOptimizations": [
      {
        "campaign": "Fitness Campaign",
        "optimization": "Budget reallocation",
        "impact": "+15% conversions",
        "date": "2024-01-19T10:00:00.000Z"
      }
    ],
    "recommendations": [
      {
        "type": "targeting_refinement",
        "description": "Consider narrowing audience targeting",
        "priority": "high"
      }
    ]
  }
}
```

#### 7.2 Performance Insights
**Test Case:** TC-ANALYTICS-002
```bash
curl -X GET "http://localhost:3000/api/ai-ads/performance-insights/campaign_id" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "campaignId": "campaign_id",
    "campaignName": "Fitness Campaign",
    "totalAdSets": 3,
    "performanceData": [
      {
        "adSetId": "adset123",
        "adSetName": "Target Audience",
        "impressions": 10000,
        "clicks": 200,
        "spend": 500,
        "ctr": 0.02,
        "cpc": 2.5,
        "roas": 3.2
      }
    ],
    "recommendations": [
      {
        "type": "LOW_CTR",
        "adSetId": "adset123",
        "adSetName": "Target Audience",
        "recommendation": "Consider updating ad creative or targeting"
      }
    ]
  }
}
```

### 8. Error Handling Tests

#### 8.1 Invalid Campaign Data
**Test Case:** TC-ERROR-001
```bash
curl -X POST "http://localhost:3000/api/ads/create" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "coachMetaAccountId": "invalid_account",
    "campaignData": {
      "name": "",
      "objective": "INVALID_OBJECTIVE",
      "dailyBudget": -10
    }
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid campaign data",
  "errors": [
    "Campaign name is required",
    "Invalid objective: INVALID_OBJECTIVE",
    "Daily budget must be positive"
  ]
}
```

#### 8.2 Meta API Errors
**Test Case:** TC-ERROR-002
```bash
curl -X POST "http://localhost:3000/api/ads/create" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "coachMetaAccountId": "act_invalid",
    "campaignData": {
      "name": "Test Campaign",
      "objective": "CONVERSIONS",
      "dailyBudget": 25
    }
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Meta API Error",
  "error": {
    "code": 190,
    "message": "Invalid access token"
  }
}
```

#### 8.3 AI Service Errors
**Test Case:** TC-ERROR-003
```bash
curl -X POST "http://localhost:3000/api/ai-ads/generate-copy" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "targetAudience, productInfo, and campaignObjective are required"
}
```

### 9. Bulk Operations Tests

#### 9.1 Bulk Campaign Optimization
**Test Case:** TC-BULK-001
```bash
curl -X POST "http://localhost:3000/api/ai-ads/bulk-optimize" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignIds": ["campaign_1", "campaign_2", "campaign_3"],
    "optimizationType": "budget_allocation"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Bulk optimization completed",
    "results": [
      {
        "campaignId": "campaign_1",
        "status": "optimized",
        "changes": {
          "budgetReallocation": "+20% to top performers"
        }
      },
      {
        "campaignId": "campaign_2",
        "status": "optimized",
        "changes": {
          "targetingRefinement": "Narrowed audience"
        }
      }
    ]
  }
}
```

### 10. Integration Tests

#### 10.1 End-to-End Campaign Creation
**Test Case:** TC-INTEGRATION-001
```bash
# Step 1: Generate AI content
curl -X POST "http://localhost:3000/api/ai-ads/generate-copy" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "targetAudience": "Fitness enthusiasts",
    "productInfo": "Personal training program",
    "campaignObjective": "CONVERSIONS"
  }'

# Step 2: Create campaign with AI content
curl -X POST "http://localhost:3000/api/ads/create" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "coachMetaAccountId": "act_test123456",
    "campaignData": {
      "name": "AI-Generated Campaign",
      "objective": "CONVERSIONS",
      "dailyBudget": 50
    },
    "useAI": true
  }'

# Step 3: Optimize campaign
curl -X POST "http://localhost:3000/api/ai-ads/optimize-budget/campaign_id" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json"
```

#### 10.2 Social Media Integration Flow
**Test Case:** TC-INTEGRATION-002
```bash
# Step 1: Generate social media content
curl -X POST "http://localhost:3000/api/ai-ads/generate-social-post" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "coachName": "John Fitness Coach",
    "niche": "Weight Loss",
    "offer": "30-Day Program",
    "targetAudience": "Busy moms"
  }'

# Step 2: Generate poster image
curl -X POST "http://localhost:3000/api/ai-ads/generate-poster" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "coachName": "John Fitness Coach",
    "niche": "Weight Loss",
    "offer": "30-Day Program",
    "targetAudience": "weight_loss"
  }'

# Step 3: Upload to Instagram
curl -X POST "http://localhost:3000/api/ai-ads/upload-to-instagram" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "generated_image_url",
    "caption": "Generated caption",
    "hashtags": ["#fitness", "#weightloss"]
  }'
```

## Performance Testing

### 1. Load Testing

#### 1.1 Concurrent Campaign Creation
```bash
# Test with 10 concurrent campaign creation requests
for i in {1..10}; do
  curl -X POST "http://localhost:3000/api/ads/create" \
    -H "Authorization: Bearer <coach_token>" \
    -H "Content-Type: application/json" \
    -d "{
      \"coachMetaAccountId\": \"act_test123456\",
      \"campaignData\": {
        \"name\": \"Load Test Campaign $i\",
        \"objective\": \"CONVERSIONS\",
        \"dailyBudget\": 25
      }
    }" &
done
wait
```

#### 1.2 AI Content Generation Load
```bash
# Test AI content generation with multiple concurrent requests
for i in {1..5}; do
  curl -X POST "http://localhost:3000/api/ai-ads/generate-copy" \
    -H "Authorization: Bearer <coach_token>" \
    -H "Content-Type: application/json" \
    -d "{
      \"targetAudience\": \"Fitness enthusiasts $i\",
      \"productInfo\": \"Personal training program $i\",
      \"campaignObjective\": \"CONVERSIONS\"
    }" &
done
wait
```

### 2. Response Time Testing

#### 2.1 Expected Response Times
```javascript
const expectedResponseTimes = {
    "campaign_creation": 2000,    // 2 seconds
    "ai_content_generation": 5000, // 5 seconds
    "campaign_analytics": 1000,   // 1 second
    "optimization": 3000,         // 3 seconds
    "social_media_generation": 4000, // 4 seconds
    "bulk_operations": 10000      // 10 seconds
};
```

#### 2.2 Response Time Validation
```bash
# Test response time for campaign creation
time curl -X POST "http://localhost:3000/api/ads/create" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "coachMetaAccountId": "act_test123456",
    "campaignData": {
      "name": "Response Time Test",
      "objective": "CONVERSIONS",
      "dailyBudget": 25
    }
  }'
```

## Security Testing

### 1. Input Validation

#### 1.1 SQL Injection Prevention
```bash
curl -X GET "http://localhost:3000/api/ads?name='; DROP TABLE campaigns; --" \
  -H "Authorization: Bearer <coach_token>"
```

#### 1.2 XSS Prevention
```bash
curl -X POST "http://localhost:3000/api/ai-ads/generate-copy" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "targetAudience": "<script>alert(\"XSS\")</script>",
    "productInfo": "Test product",
    "campaignObjective": "CONVERSIONS"
  }'
```

### 2. Data Access Control

#### 2.1 Cross-Coach Data Access
```bash
# Attempt to access another coach's campaigns
curl -X GET "http://localhost:3000/api/ads/campaign_id" \
  -H "Authorization: Bearer <different_coach_token>"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied"
}
```

## Test Data Management

### 1. Test Data Setup
```javascript
// Setup test campaigns
const setupTestCampaigns = async () => {
    const campaigns = [
        {
            name: "Test Campaign 1",
            objective: "CONVERSIONS",
            dailyBudget: 25,
            status: "ACTIVE"
        },
        {
            name: "Test Campaign 2",
            objective: "LEAD_GENERATION",
            dailyBudget: 50,
            status: "PAUSED"
        }
    ];

    for (const campaign of campaigns) {
        await AdCampaign.create({
            ...campaign,
            coachId: "test_coach_123",
            campaignId: `test_campaign_${Date.now()}`,
            metaRaw: { id: `test_campaign_${Date.now()}` }
        });
    }
};
```

### 2. Test Data Cleanup
```javascript
// Cleanup test data
const cleanupTestData = async () => {
    await AdCampaign.deleteMany({ coachId: "test_coach_123" });
    await AdSet.deleteMany({ coachId: "test_coach_123" });
    await AdCreative.deleteMany({ coachId: "test_coach_123" });
    await Ad.deleteMany({ coachId: "test_coach_123" });
};
```

## Test Execution Checklist

### Pre-Test Setup
- [ ] Test environment configured
- [ ] Meta test account setup
- [ ] OpenAI API key configured
- [ ] Test data prepared
- [ ] Authentication tokens obtained

### Test Execution
- [ ] Authentication tests passed
- [ ] Meta Ads integration tests passed
- [ ] AI content generation tests passed
- [ ] Campaign optimization tests passed
- [ ] Social media integration tests passed
- [ ] Performance analytics tests passed
- [ ] Error handling tests passed
- [ ] Security tests passed
- [ ] Integration tests passed
- [ ] Performance tests passed

### Post-Test Cleanup
- [ ] Test data cleaned up
- [ ] Performance metrics recorded
- [ ] Test results documented
- [ ] Issues logged for resolution

## Troubleshooting Guide

### Common Issues

#### 1. Meta API Connection Issues
```bash
# Check Meta access token
curl -X GET "https://graph.facebook.com/v19.0/me?access_token=YOUR_TOKEN"

# Verify permissions
curl -X GET "https://graph.facebook.com/v19.0/me/permissions?access_token=YOUR_TOKEN"
```

#### 2. OpenAI API Issues
```bash
# Test OpenAI connection
curl -X POST "https://api.openai.com/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_OPENAI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

#### 3. Database Connection Issues
```bash
# Check database connection
curl -X GET "http://localhost:3000/api/ads" \
  -H "Authorization: Bearer <coach_token>"
```

### Debug Information

#### Enable Debug Logging
```bash
DEBUG=ai-ads:*,meta-ads:*,marketing:*
NODE_ENV=test
```

#### Monitor API Calls
```bash
# Monitor Meta API calls
curl -X GET "http://localhost:3000/api/ads/sync" \
  -H "Authorization: Bearer <coach_token>" \
  -v

# Monitor AI API calls
curl -X POST "http://localhost:3000/api/ai-ads/generate-copy" \
  -H "Authorization: Bearer <coach_token>" \
  -H "Content-Type: application/json" \
  -d '{"targetAudience": "test"}' \
  -v
```

## Conclusion

This comprehensive testing guide covers all aspects of the Marketing AI & Ads system. The guide provides detailed test cases, expected results, and troubleshooting information to ensure the system functions correctly and securely. Regular testing using this guide will help maintain system reliability and performance.

### Key Testing Areas Covered:
- ✅ Authentication & Authorization
- ✅ Meta Ads Integration
- ✅ AI Content Generation
- ✅ Campaign Optimization
- ✅ Social Media Integration
- ✅ Performance Analytics
- ✅ Error Handling
- ✅ Security Testing
- ✅ Integration Testing
- ✅ Performance Testing

The system is designed to be robust and reliable, with comprehensive error handling and security measures in place.
