# Marketing and Campaign API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Meta Ads Campaign Management](#meta-ads-campaign-management)
4. [AI-Powered Advertising](#ai-powered-advertising)
5. [Lead Magnets & Funnel Management](#lead-magnets--funnel-management)
6. [Lead Management & Scoring](#lead-management--scoring)
7. [Social Media Integration](#social-media-integration)
8. [Error Handling](#error-handling)
9. [Rate Limits](#rate-limits)

## Overview

This API provides comprehensive marketing and campaign management capabilities, including:
- **Meta Ads Integration**: Full Facebook/Meta advertising campaign management
- **AI-Powered Optimization**: Automated ad copy generation, budget optimization, and performance insights
- **Lead Generation**: Lead magnets, funnel creation, and lead scoring
- **Social Media**: Instagram integration and social media campaign generation
- **Analytics**: Real-time performance tracking and AI-powered insights

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## Meta Ads Campaign Management

### Base URL: `/api/ads`

#### 1. List Campaigns
**GET** `/api/ads`

Retrieve all campaigns for the authenticated coach.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Summer Fitness Challenge",
      "objective": "CONVERSIONS",
      "status": "ACTIVE",
      "dailyBudget": 50,
      "spend": 125.50,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 2. Create Campaign
**POST** `/api/ads/create`

Create a new advertising campaign with optional AI optimization.

**Request Body:**
```json
{
  "coachMetaAccountId": "act_123456789",
  "useAI": true,
  "campaignData": {
    "name": "Summer Fitness Challenge",
    "objective": "CONVERSIONS",
    "dailyBudget": 50,
    "targetAudience": {
      "age_min": 25,
      "age_max": 45,
      "genders": ["1", "2"],
      "locations": ["US", "CA"],
      "interests": ["fitness", "health", "weight loss"]
    },
    "productInfo": {
      "name": "12-Week Transformation Program",
      "price": 297,
      "benefits": ["weight loss", "muscle gain", "energy boost"]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123456789",
    "name": "Summer Fitness Challenge",
    "aiEnhanced": true,
    "campaign": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "aiGenerated": true,
      "aiContent": {
        "headlines": ["Transform Your Body in 12 Weeks"],
        "descriptions": ["Join thousands who've achieved their fitness goals"],
        "callToAction": "Start Your Journey"
      },
      "targetingRecommendations": {
        "audienceSize": "2.5M",
        "estimatedReach": "45K",
        "optimizationTips": ["Focus on mobile users", "Test video ads"]
      }
    }
  }
}
```

#### 3. Update Campaign
**PUT** `/api/ads/:campaignId`

Update an existing campaign.

**Request Body:**
```json
{
  "name": "Updated Campaign Name",
  "dailyBudget": 75,
  "status": "ACTIVE"
}
```

#### 4. Pause/Resume Campaign
**POST** `/api/ads/:campaignId/pause`
**POST** `/api/ads/:campaignId/resume`

Control campaign status.

#### 5. Campaign Analytics
**GET** `/api/ads/:campaignId/analytics`

Get comprehensive campaign performance data with AI insights.

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "campaign_id": "123456789",
        "campaign_name": "Summer Fitness Challenge",
        "impressions": 15000,
        "clicks": 450,
        "ctr": "0.03",
        "cpc": "1.25",
        "spend": "562.50",
        "conversions": 25,
        "cpa": "22.50"
      }
    ],
    "aiInsights": {
      "anomalies": [
        {
          "type": "high_cpc",
          "severity": "medium",
          "recommendation": "Consider adjusting targeting to reduce cost per click",
          "adSetName": "Primary Audience"
        }
      ],
      "recommendations": [
        {
          "type": "budget_optimization",
          "recommendation": "Increase budget for top-performing ad sets",
          "priority": "high"
        }
      ],
      "optimizationScore": 75
    }
  }
}
```

#### 6. Sync Campaigns
**POST** `/api/ads/sync`

Sync campaigns from Meta to local database.

**Request Body:**
```json
{
  "coachMetaAccountId": "act_123456789"
}
```

### Advanced Campaign Creation

#### 7. Upload Image
**POST** `/api/ads/upload-image`

Upload image for ad creative.

**Request Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg"
}
```

#### 8. Create Ad Set
**POST** `/api/ads/:campaignId/ad-sets`

Create targeting and budget configuration.

**Request Body:**
```json
{
  "adSetData": {
    "name": "Primary Audience",
    "targeting": {
      "age_min": 25,
      "age_max": 45,
      "genders": ["1", "2"],
      "locations": ["US", "CA"],
      "interests": ["fitness", "health"]
    },
    "daily_budget": 25,
    "billing_event": "IMPRESSIONS",
    "optimization_goal": "CONVERSIONS"
  }
}
```

#### 9. Create Ad Creative
**POST** `/api/ads/:campaignId/creatives`

Create ad creative with image and text.

**Request Body:**
```json
{
  "creativeData": {
    "name": "Summer Challenge Creative",
    "object_story_spec": {
      "link_data": {
        "image_hash": "abc123def456",
        "link": "https://yourwebsite.com/offer",
        "message": "Transform your body in 12 weeks!",
        "call_to_action": {
          "type": "LEARN_MORE"
        }
      }
    }
  }
}
```

#### 10. Create Ad
**POST** `/api/ads/:campaignId/ads`

Create the final ad combining ad set and creative.

**Request Body:**
```json
{
  "adData": {
    "name": "Summer Challenge Ad",
    "adset_id": "123456789",
    "creative": {
      "creative_id": "987654321"
    },
    "status": "ACTIVE"
  }
}
```

#### 11. All-in-One Campaign Creation
**POST** `/api/ads/create-url-campaign`

Create complete campaign in one request.

**Request Body:**
```json
{
  "coachMetaAccountId": "act_123456789",
  "campaignData": {
    "name": "Complete Campaign",
    "objective": "CONVERSIONS",
    "dailyBudget": 50
  },
  "adSetData": {
    "name": "Target Audience",
    "targeting": { "age_min": 25, "age_max": 45 },
    "daily_budget": 25
  },
  "creativeData": {
    "name": "Ad Creative",
    "object_story_spec": { "link_data": { "message": "Your message" } }
  },
  "adData": {
    "name": "Final Ad",
    "status": "ACTIVE"
  }
}
```

---

## AI-Powered Advertising

### Base URL: `/api/ai-ads`

#### 1. Generate Ad Copy
**POST** `/api/ai-ads/generate-copy`

Generate AI-powered ad copy based on target audience and product.

**Request Body:**
```json
{
  "targetAudience": "Fitness enthusiasts aged 25-45",
  "productInfo": "12-week transformation program",
  "campaignObjective": "CONVERSIONS"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "headlines": [
      "Transform Your Body in Just 12 Weeks",
      "Join 10,000+ Success Stories",
      "The Ultimate Fitness Challenge"
    ],
    "descriptions": [
      "Proven system that works for busy professionals",
      "Personalized meal plans and workout routines",
      "24/7 support and accountability"
    ],
    "callToAction": "Start Your Transformation",
    "socialProof": "Join 10,000+ members who've transformed their lives"
  }
}
```

#### 2. Budget Optimization
**POST** `/api/ai-ads/optimize-budget/:campaignId`

Get AI recommendations for budget allocation.

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "adSetId": "123456789",
        "currentBudget": 25,
        "recommendedBudget": 40,
        "reason": "High conversion rate (3.2%) and low CPA ($18.50)",
        "expectedROI": "Increase by 35%"
      }
    ],
    "totalBudget": 100,
    "optimizationScore": 85
  }
}
```

#### 3. Anomaly Detection
**GET** `/api/ai-ads/detect-anomalies/:campaignId`

Detect performance anomalies and get recommendations.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "type": "spike_in_cpc",
      "severity": "high",
      "description": "Cost per click increased by 45% in last 24 hours",
      "recommendation": "Review targeting settings and consider pausing underperforming ad sets",
      "adSetName": "Secondary Audience",
      "timestamp": "2024-01-15T14:30:00Z"
    }
  ]
}
```

#### 4. Auto-Optimize Campaign
**POST** `/api/ai-ads/auto-optimize/:campaignId`

Automatically optimize campaign based on AI analysis.

**Response:**
```json
{
  "success": true,
  "data": {
    "optimizationsApplied": [
      "Increased budget for top-performing ad set by 30%",
      "Paused underperforming ad set",
      "Updated targeting for better audience quality"
    ],
    "expectedImprovement": "25% increase in conversions",
    "nextReviewDate": "2024-01-22T10:00:00Z"
  }
}
```

#### 5. Targeting Recommendations
**POST** `/api/ai-ads/targeting-recommendations`

Get AI-powered targeting suggestions.

**Request Body:**
```json
{
  "targetAudience": "Fitness enthusiasts",
  "budget": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audienceSize": "3.2M",
    "estimatedReach": "65K",
    "targetingOptions": [
      {
        "interest": "Fitness",
        "subInterests": ["Weight Training", "Cardio", "Yoga"],
        "estimatedReach": "1.2M"
      },
      {
        "demographic": "Age 25-45",
        "reason": "Highest conversion rate for fitness products",
        "estimatedReach": "2.1M"
      }
    ],
    "exclusionRecommendations": [
      "Exclude users interested in 'get rich quick' schemes",
      "Exclude users who recently purchased fitness products"
    ]
  }
}
```

#### 6. AI Dashboard
**GET** `/api/ai-ads/dashboard`

Get comprehensive AI insights dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCampaigns": 8,
      "activeCampaigns": 6,
      "aiOptimizedCampaigns": 5,
      "averageOptimizationScore": 78
    },
    "performance": {
      "topPerformingCampaign": "Summer Challenge",
      "improvementThisWeek": "23%",
      "costSavings": "$450"
    },
    "recommendations": [
      {
        "priority": "high",
        "action": "Increase budget for 'Winter Program' campaign",
        "expectedImpact": "35% more conversions"
      }
    ]
  }
}
```

---

## Lead Magnets & Funnel Management

### Base URL: `/api/funnels`

#### 1. Create Funnel
**POST** `/api/funnels/:coachId`

Create a new marketing funnel.

**Request Body:**
```json
{
  "name": "Weight Loss Challenge",
  "description": "12-week transformation program funnel",
  "funnelUrl": "weight-loss-challenge",
  "targetAudience": "customer",
  "stages": [
    {
      "name": "Landing Page",
      "type": "Landing",
      "html": "<div>Your landing page content</div>",
      "isEnabled": true
    },
    {
      "name": "Lead Capture",
      "type": "Form",
      "fields": ["name", "email", "phone"],
      "isEnabled": true
    },
    {
      "name": "Thank You",
      "type": "ThankYou",
      "html": "<div>Thank you for joining!</div>",
      "isEnabled": true
    }
  ]
}
```

#### 2. Get Funnels
**GET** `/api/funnels/:coachId`

Retrieve all funnels for a coach.

#### 3. Update Funnel
**PUT** `/api/funnels/:funnelId`

Update funnel configuration.

#### 4. Delete Funnel
**DELETE** `/api/funnels/:funnelId`

Remove a funnel.

### Lead Magnets

#### 1. AI Diet Planner
**POST** `/api/lead-magnets/ai-diet-planner`

Generate personalized meal plans via WhatsApp.

**Request Body:**
```json
{
  "leadId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "preferences": {
    "dietType": "vegetarian",
    "allergies": ["nuts"],
    "goals": "weight loss",
    "activityLevel": "moderate"
  }
}
```

#### 2. BMI Calculator
**POST** `/api/lead-magnets/bmi-calculator`

Calculate BMI with health recommendations.

**Request Body:**
```json
{
  "height": 175,
  "weight": 70,
  "age": 30,
  "gender": "male"
}
```

#### 3. Fitness E-Book
**POST** `/api/lead-magnets/fitness-ebook`

Provide downloadable fitness guides.

---

## Lead Management & Scoring

### Base URL: `/api/leads`

#### 1. Create Lead
**POST** `/api/leads`

Create a new lead from form submission.

**Request Body:**
```json
{
  "coachId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "funnelId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "source": "Facebook Ad",
  "targetAudience": "client",
  "clientQuestions": {
    "watchedVideo": "Yes",
    "readyToStart": "Yes",
    "willingToInvest": "Yes",
    "seriousnessScale": 9
  }
}
```

#### 2. Get Leads
**GET** `/api/leads`

Retrieve leads with filtering and pagination.

**Query Parameters:**
- `status`: Lead status (New, Qualified, Converted, etc.)
- `temperature`: Lead temperature (Cold, Warm, Hot)
- `source`: Lead source
- `assignedTo`: Assigned staff member
- `nextFollowUpAt[lte]`: Follow-up due date
- `sort`: Sort field
- `page`: Page number
- `limit`: Results per page

#### 3. AI Lead Qualification
**GET** `/api/leads/:id/ai-qualify`

Get AI-powered lead qualification and recommendations.

**Response:**
```json
{
  "success": true,
  "data": {
    "lead": {
      "score": 85,
      "temperature": "Hot",
      "qualification": "Highly Qualified"
    },
    "aiInsights": {
      "content": "This is a hot lead with high conversion potential",
      "confidence": 92
    },
    "aiRecommendations": {
      "nextAction": "Immediate follow-up",
      "priority": "High",
      "bestApproach": "Direct offer presentation"
    }
  }
}
```

### Lead Scoring Tracking

#### 1. Email Open Tracking
**GET** `/api/leads/track/email-opened?leadId=:leadId`

Track email opens for lead scoring.

#### 2. Link Click Tracking
**GET** `/api/leads/track/link-clicked?leadId=:leadId&target=:target`

Track link clicks for lead scoring.

#### 3. WhatsApp Reply Tracking
**POST** `/api/leads/track/whatsapp-replied`

Track WhatsApp responses for lead scoring.

**Request Body:**
```json
{
  "leadId": "64f1a2b3c4d5e6f7a8b9c0d1"
}
```

---

## Social Media Integration

### Base URL: `/api/ai-ads`

#### 1. Generate Poster Image
**POST** `/api/ai-ads/generate-poster`

Generate AI-powered poster images.

**Request Body:**
```json
{
  "theme": "fitness motivation",
  "style": "modern minimalist",
  "colors": ["blue", "white"],
  "text": "Transform Your Life Today"
}
```

#### 2. Generate Social Media Post
**POST** `/api/ai-ads/generate-social-post`

Create engaging social media content.

**Request Body:**
```json
{
  "platform": "instagram",
  "topic": "fitness tips",
  "tone": "motivational",
  "hashtags": true
}
```

#### 3. Upload to Instagram
**POST** `/api/ai-ads/upload-to-instagram`

Automatically post to Instagram.

**Request Body:**
```json
{
  "imageUrl": "https://example.com/poster.jpg",
  "caption": "Your motivational caption",
  "hashtags": ["#fitness", "#motivation"]
}
```

#### 4. Generate Social Media Campaign
**POST** `/api/ai-ads/generate-campaign`

Create complete social media campaign.

**Request Body:**
```json
{
  "platform": "instagram",
  "campaignType": "product_launch",
  "duration": 7,
  "postsPerDay": 2,
  "theme": "fitness transformation"
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limits

- **Standard endpoints**: 100 requests per minute
- **AI-powered endpoints**: 20 requests per minute
- **Image uploads**: 10 requests per minute
- **Campaign creation**: 5 requests per minute

---

## Best Practices

### Campaign Creation
1. **Start with AI**: Use `useAI: true` for initial campaigns to get optimized content
2. **Test targeting**: Start with broad targeting, then narrow based on performance
3. **Monitor closely**: Check analytics daily for the first week
4. **Use A/B testing**: Create multiple ad variations to test performance

### Lead Generation
1. **Qualify leads**: Use the AI qualification system to prioritize follow-ups
2. **Nurture sequences**: Set up automated nurturing for warm leads
3. **Track everything**: Use all tracking endpoints to build comprehensive lead profiles
4. **Optimize funnels**: Regularly review and update funnel performance

### AI Optimization
1. **Review recommendations**: Check AI insights weekly
2. **Apply optimizations**: Use auto-optimize for routine improvements
3. **Monitor anomalies**: Set up alerts for performance issues
4. **Learn from data**: Use AI insights to improve future campaigns

---

## Support

For technical support or questions about the API:
- **Documentation**: Check this guide and inline code comments
- **Error logs**: Review server logs for detailed error information
- **Rate limits**: Monitor response headers for rate limit information
- **Meta Ads**: Ensure your Meta account has proper permissions

---

*Last updated: January 2024*
*Version: 1.0*
