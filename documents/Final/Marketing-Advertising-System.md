# Marketing & Advertising System Documentation

## Overview
The Marketing & Advertising System provides comprehensive ad campaign management with AI-powered optimization, creative generation, budget allocation, and performance analytics. The system integrates with Meta/Facebook Ads API and includes intelligent anomaly detection and automated optimization recommendations.

## System Architecture

### Core Components
- **AI Ads Agent** - Creative generation and optimization
- **Budget Allocation Engine** - Intelligent spend distribution
- **Anomaly Alert System** - Performance monitoring and warnings
- **Campaign Analytics** - ROI tracking and optimization
- **Meta Ads Integration** - Facebook/Instagram advertising
- **Creative Management** - Ad creative generation and testing
- **Performance Optimization** - Automated campaign improvements

### Database Schema

#### AdCampaign Schema
```javascript
{
  coachId: ObjectId,               // Reference to User (Coach) - Required
  campaignId: String,              // Meta/Facebook campaign ID - Required
  name: String,                    // Campaign name - Required
  status: String,                  // 'ACTIVE', 'PAUSED', 'COMPLETED', 'DRAFT'
  objective: String,               // Campaign objective
  budget: Number,                  // Campaign budget
  spend: Number,                   // Amount spent (default: 0)
  currency: String,                // Currency (default: 'USD')
  startDate: Date,                 // Campaign start date
  endDate: Date,                   // Campaign end date
  targeting: Mixed,                // Targeting parameters
  results: Mixed,                  // Performance results
  analytics: Mixed,                // Analytics data
  lastSynced: Date,                // Last sync with Meta
  metaRaw: Mixed,                  // Raw Meta API response
  aiGenerated: Boolean,            // AI-generated campaign
  aiContent: Mixed,                // AI-generated content
  targetingRecommendations: Mixed, // AI targeting recommendations
  createdAt: Date,
  updatedAt: Date
}
```

#### AdSet Schema
```javascript
{
  campaignId: ObjectId,           // Reference to AdCampaign
  adSetId: String,                // Meta ad set ID
  name: String,                   // Ad set name
  status: String,                 // 'ACTIVE', 'PAUSED', 'COMPLETED'
  budget: Number,                  // Ad set budget
  bidStrategy: String,            // Bidding strategy
  targeting: Mixed,                // Targeting criteria
  placement: [String],             // Ad placements
  optimizationGoal: String,        // Optimization goal
  performance: Mixed,             // Performance metrics
  createdAt: Date,
  updatedAt: Date
}
```

#### AdCreative Schema
```javascript
{
  adSetId: ObjectId,              // Reference to AdSet
  creativeId: String,             // Meta creative ID
  name: String,                   // Creative name
  type: String,                   // 'image', 'video', 'carousel'
  headline: String,               // Ad headline
  description: String,            // Ad description
  callToAction: String,           // CTA button text
  mediaUrl: String,               // Media file URL
  thumbnailUrl: String,           // Thumbnail URL
  aiGenerated: Boolean,           // AI-generated creative
  performance: Mixed,              // Performance metrics
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Base URL: `/api/ads`

### 1. Campaign Management

#### List Campaigns
**GET** `/`
- **Description**: Get all campaigns for coach
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345a",
      "coachId": "65a1b2c3d4e5f6789012345b",
      "campaignId": "123456789",
      "name": "Weight Loss Program - Q1 2025",
      "status": "ACTIVE",
      "objective": "CONVERSIONS",
      "budget": 1000,
      "spend": 450.75,
      "currency": "USD",
      "startDate": "2025-01-01T00:00:00Z",
      "endDate": "2025-03-31T23:59:59Z",
      "targeting": {
        "age": "25-45",
        "gender": "all",
        "interests": ["fitness", "weight loss", "health"],
        "locations": ["United States"]
      },
      "results": {
        "impressions": 125000,
        "clicks": 2500,
        "conversions": 45,
        "ctr": 2.0,
        "cpc": 0.18,
        "cpm": 3.61,
        "roas": 4.2
      },
      "analytics": {
        "dailySpend": 15.02,
        "conversionRate": 1.8,
        "costPerConversion": 10.02,
        "revenue": 1890
      },
      "aiGenerated": true,
      "aiContent": {
        "primaryHeadline": "Transform Your Body in 30 Days",
        "secondaryHeadline": "Join 10,000+ Success Stories",
        "adCopy": "Ready to finally lose weight and keep it off? Our proven program has helped thousands achieve lasting results.",
        "callToAction": "Start Your Journey",
        "variations": [
          "Lose 20+ Pounds in 30 Days",
          "The Weight Loss Program That Works",
          "Join Our Success Stories Today"
        ]
      },
      "targetingRecommendations": {
        "suggestedInterests": ["intermittent fasting", "keto diet", "workout"],
        "ageOptimization": "28-42",
        "locationOptimization": ["California", "Texas", "Florida"],
        "budgetRecommendation": 1200
      },
      "lastSynced": "2025-01-20T10:00:00Z",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-20T10:00:00Z"
    }
  ]
}
```

#### Create Campaign
**POST** `/create`
- **Description**: Create new campaign with AI optimization
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "coachMetaAccountId": "act_123456789",
  "campaignData": {
    "name": "Weight Loss Program - Q1 2025",
    "objective": "CONVERSIONS",
    "dailyBudget": 50,
    "targetAudience": {
      "age": "25-45",
      "gender": "all",
      "interests": ["fitness", "weight loss"],
      "locations": ["United States"]
    },
    "productInfo": "30-day weight loss transformation program with meal plans and workout routines",
    "campaignObjective": "Lead generation for fitness coaching program"
  },
  "useAI": true
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "123456789",
    "name": "Weight Loss Program - Q1 2025",
    "status": "PAUSED",
    "objective": "CONVERSIONS",
    "dailyBudget": 50,
    "campaign": {
      "_id": "65a1b2c3d4e5f6789012345a",
      "campaignId": "123456789",
      "coachId": "65a1b2c3d4e5f6789012345b",
      "name": "Weight Loss Program - Q1 2025",
      "status": "PAUSED",
      "objective": "CONVERSIONS",
      "dailyBudget": 50,
      "aiGenerated": true,
      "aiContent": {
        "primaryHeadline": "Transform Your Body in 30 Days",
        "secondaryHeadline": "Join 10,000+ Success Stories",
        "adCopy": "Ready to finally lose weight and keep it off? Our proven program has helped thousands achieve lasting results.",
        "callToAction": "Start Your Journey",
        "variations": [
          "Lose 20+ Pounds in 30 Days",
          "The Weight Loss Program That Works",
          "Join Our Success Stories Today"
        ]
      },
      "targetingRecommendations": {
        "suggestedInterests": ["intermittent fasting", "keto diet", "workout"],
        "ageOptimization": "28-42",
        "locationOptimization": ["California", "Texas", "Florida"],
        "budgetRecommendation": 60
      }
    },
    "aiEnhanced": true
  }
}
```

#### Update Campaign
**PUT** `/:campaignId`
- **Description**: Update campaign settings
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "name": "Updated Weight Loss Program",
  "dailyBudget": 75,
  "status": "ACTIVE",
  "targeting": {
    "age": "28-42",
    "interests": ["intermittent fasting", "keto diet", "workout"],
    "locations": ["California", "Texas", "Florida"]
  }
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "123456789",
    "name": "Updated Weight Loss Program",
    "dailyBudget": 75,
    "status": "ACTIVE",
    "updatedAt": "2025-01-20T11:00:00Z"
  }
}
```

#### Pause Campaign
**POST** `/:campaignId/pause`
- **Description**: Pause campaign
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "123456789",
    "status": "PAUSED",
    "pausedAt": "2025-01-20T11:00:00Z"
  }
}
```

#### Resume Campaign
**POST** `/:campaignId/resume`
- **Description**: Resume paused campaign
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "123456789",
    "status": "ACTIVE",
    "resumedAt": "2025-01-20T11:00:00Z"
  }
}
```

### 2. Campaign Analytics

#### Get Campaign Analytics
**GET** `/:campaignId/analytics`
- **Description**: Get detailed campaign analytics with AI insights
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "campaignId": "123456789",
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-20",
      "days": 20
    },
    "performance": {
      "impressions": 125000,
      "clicks": 2500,
      "conversions": 45,
      "spend": 450.75,
      "revenue": 1890,
      "ctr": 2.0,
      "cpc": 0.18,
      "cpm": 3.61,
      "roas": 4.2,
      "conversionRate": 1.8,
      "costPerConversion": 10.02
    },
    "trends": {
      "dailySpend": [15.2, 18.5, 22.1, 19.8, 16.3],
      "dailyConversions": [2, 3, 4, 2, 3],
      "dailyCTR": [1.8, 2.1, 2.3, 1.9, 2.0],
      "dailyROAS": [3.8, 4.2, 4.5, 4.0, 4.1]
    },
    "breakdown": {
      "byAge": [
        { "age": "25-34", "conversions": 18, "spend": 180.25, "roas": 4.5 },
        { "age": "35-44", "conversions": 22, "spend": 220.50, "roas": 4.0 },
        { "age": "45-54", "conversions": 5, "spend": 50.00, "roas": 3.2 }
      ],
      "byGender": [
        { "gender": "female", "conversions": 28, "spend": 280.00, "roas": 4.3 },
        { "gender": "male", "conversions": 17, "spend": 170.75, "roas": 4.0 }
      ],
      "byLocation": [
        { "location": "California", "conversions": 15, "spend": 150.00, "roas": 4.8 },
        { "location": "Texas", "conversions": 12, "spend": 120.00, "roas": 4.2 },
        { "location": "Florida", "conversions": 10, "spend": 100.00, "roas": 4.0 }
      ]
    },
    "aiInsights": {
      "anomalies": [
        {
          "type": "high_cpc",
          "severity": "medium",
          "description": "CPC increased by 25% in the last 3 days",
          "recommendation": "Consider adjusting bid strategy or targeting",
          "adSetName": "Weight Loss - Women 25-35",
          "detectedAt": "2025-01-20T10:00:00Z"
        },
        {
          "type": "low_ctr",
          "severity": "high",
          "description": "CTR dropped below 1.5% threshold",
          "recommendation": "Refresh ad creatives or adjust targeting",
          "adSetName": "Weight Loss - Men 35-45",
          "detectedAt": "2025-01-19T15:30:00Z"
        }
      ],
      "recommendations": [
        {
          "type": "budget_reallocation",
          "priority": "high",
          "description": "Increase budget for California audience (ROAS 4.8)",
          "action": "Increase daily budget by 30% for California ad set",
          "expectedImpact": "15% increase in conversions"
        },
        {
          "type": "creative_refresh",
          "priority": "medium",
          "description": "Refresh ad creatives for better engagement",
          "action": "Create new ad variations with updated copy",
          "expectedImpact": "20% improvement in CTR"
        },
        {
          "type": "targeting_optimization",
          "priority": "medium",
          "description": "Expand targeting to similar audiences",
          "action": "Add lookalike audiences based on converters",
          "expectedImpact": "25% increase in reach"
        }
      ],
      "optimizationScore": 78,
      "performanceGrade": "B+",
      "nextActions": [
        "Increase budget for high-performing ad sets",
        "Refresh creatives for low-performing ad sets",
        "Test new audience segments"
      ]
    }
  }
}
```

### 3. AI-Powered Features

#### Generate Ad Copy
**POST** `/ai/generate-copy`
- **Description**: Generate AI-powered ad copy
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "targetAudience": "Women aged 25-35 interested in fitness and weight loss",
  "productInfo": "30-day transformation program with meal plans and workouts",
  "campaignObjective": "CONVERSIONS",
  "tone": "motivational",
  "includeEmojis": true,
  "maxVariations": 5
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "primaryHeadline": "Transform Your Body in 30 Days",
    "secondaryHeadline": "Join 10,000+ Success Stories",
    "adCopy": "Ready to finally lose weight and keep it off? Our proven program has helped thousands achieve lasting results. Start your transformation today! 💪",
    "callToAction": "Start Your Journey",
    "variations": [
      {
        "headline": "Lose 20+ Pounds in 30 Days",
        "copy": "Stop struggling with diets that don't work. Our science-backed program delivers real results. Join thousands who've transformed their lives! 🔥",
        "cta": "Get Started Now"
      },
      {
        "headline": "The Weight Loss Program That Works",
        "copy": "Finally, a program that fits your lifestyle. No extreme diets, no impossible workouts. Just real results you can maintain! ✨",
        "cta": "Learn More"
      },
      {
        "headline": "Join Our Success Stories Today",
        "copy": "From Sarah who lost 25 lbs to Mike who gained confidence. Your transformation story starts here. What are you waiting for? 🌟",
        "cta": "Start Today"
      }
    ],
    "targetingSuggestions": [
      "intermittent fasting",
      "keto diet",
      "workout motivation",
      "healthy lifestyle",
      "fitness transformation"
    ],
    "generatedAt": "2025-01-20T12:00:00Z"
  }
}
```

#### Generate Targeting Recommendations
**POST** `/ai/targeting-recommendations`
- **Description**: Get AI-powered targeting recommendations
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "targetAudience": "Women aged 25-35 interested in fitness",
  "budget": 50,
  "objective": "CONVERSIONS",
  "excludeAudiences": ["men", "teens"],
  "includeLookalikes": true
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "recommendedInterests": [
      {
        "interest": "intermittent fasting",
        "confidence": 0.92,
        "reason": "High conversion rate for fitness programs"
      },
      {
        "interest": "keto diet",
        "confidence": 0.88,
        "reason": "Strong engagement with weight loss content"
      },
      {
        "interest": "workout motivation",
        "confidence": 0.85,
        "reason": "Active fitness community"
      }
    ],
    "ageOptimization": {
      "recommended": "28-42",
      "reason": "Higher conversion rate and engagement",
      "confidence": 0.89
    },
    "locationOptimization": [
      {
        "location": "California",
        "confidence": 0.91,
        "reason": "High fitness awareness and disposable income"
      },
      {
        "location": "Texas",
        "confidence": 0.87,
        "reason": "Growing fitness market"
      },
      {
        "location": "Florida",
        "confidence": 0.84,
        "reason": "Health-conscious population"
      }
    ],
    "lookalikeAudiences": [
      {
        "name": "Fitness Enthusiasts Lookalike 1%",
        "source": "converted_customers",
        "confidence": 0.93,
        "expectedReach": 500000
      },
      {
        "name": "Weight Loss Success Lookalike 2%",
        "source": "high_value_customers",
        "confidence": 0.89,
        "expectedReach": 1200000
      }
    ],
    "budgetRecommendation": {
      "suggested": 75,
      "reason": "Optimal spend for recommended targeting",
      "expectedROAS": 4.2
    },
    "generatedAt": "2025-01-20T12:00:00Z"
  }
}
```

#### Detect Anomalies
**POST** `/ai/detect-anomalies`
- **Description**: Detect performance anomalies in campaigns
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "campaignId": "123456789",
  "timeRange": "7_days",
  "thresholds": {
    "ctr": 0.015,
    "cpc": 2.0,
    "roas": 3.0
  }
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "campaignId": "123456789",
    "analysisPeriod": "7_days",
    "anomalies": [
      {
        "type": "high_cpc",
        "severity": "high",
        "description": "CPC increased by 35% compared to previous period",
        "currentValue": 2.45,
        "previousValue": 1.82,
        "change": "+35%",
        "adSetName": "Weight Loss - Women 25-35",
        "detectedAt": "2025-01-20T10:00:00Z",
        "recommendation": "Consider adjusting bid strategy or refreshing creatives",
        "expectedImpact": "Reduce CPC by 15-20%"
      },
      {
        "type": "low_ctr",
        "severity": "medium",
        "description": "CTR dropped below threshold for 3 consecutive days",
        "currentValue": 1.2,
        "threshold": 1.5,
        "change": "-20%",
        "adSetName": "Weight Loss - Men 35-45",
        "detectedAt": "2025-01-19T15:30:00Z",
        "recommendation": "Refresh ad creatives or adjust targeting",
        "expectedImpact": "Improve CTR by 25-30%"
      }
    ],
    "summary": {
      "totalAnomalies": 2,
      "highSeverity": 1,
      "mediumSeverity": 1,
      "lowSeverity": 0,
      "requiresImmediateAction": true
    },
    "recommendations": [
      {
        "priority": "high",
        "action": "Pause underperforming ad sets",
        "description": "Temporarily pause ad sets with CPC > $2.50",
        "expectedSavings": "$50-75/day"
      },
      {
        "priority": "medium",
        "action": "Refresh creatives",
        "description": "Create new ad variations for low CTR ad sets",
        "expectedImprovement": "20-25% CTR increase"
      }
    ],
    "analyzedAt": "2025-01-20T12:00:00Z"
  }
}
```

### 4. Creative Management

#### Upload Image
**POST** `/upload-image`
- **Description**: Upload image for ad creative
- **Authentication**: Coach required
- **Request Body**: FormData with image file
- **Response**:
```json
{
  "success": true,
  "data": {
    "imageId": "img_123456789",
    "url": "https://cdn.example.com/images/img_123456789.jpg",
    "thumbnailUrl": "https://cdn.example.com/thumbnails/img_123456789.jpg",
    "dimensions": {
      "width": 1200,
      "height": 630
    },
    "fileSize": 245760,
    "format": "jpg",
    "uploadedAt": "2025-01-20T12:00:00Z"
  }
}
```

#### Create Ad Set
**POST** `/:campaignId/ad-sets`
- **Description**: Create ad set for campaign
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "name": "Weight Loss - Women 25-35",
  "budget": 25,
  "bidStrategy": "LOWEST_COST_PER_CONVERSION",
  "targeting": {
    "age": "25-35",
    "gender": "female",
    "interests": ["fitness", "weight loss", "healthy lifestyle"],
    "locations": ["United States"]
  },
  "placement": ["facebook_feed", "instagram_feed"],
  "optimizationGoal": "CONVERSIONS"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "adSetId": "ads_123456789",
    "name": "Weight Loss - Women 25-35",
    "budget": 25,
    "bidStrategy": "LOWEST_COST_PER_CONVERSION",
    "targeting": {
      "age": "25-35",
      "gender": "female",
      "interests": ["fitness", "weight loss", "healthy lifestyle"],
      "locations": ["United States"]
    },
    "placement": ["facebook_feed", "instagram_feed"],
    "optimizationGoal": "CONVERSIONS",
    "status": "ACTIVE",
    "createdAt": "2025-01-20T12:00:00Z"
  }
}
```

#### Create Ad Creative
**POST** `/:campaignId/creatives`
- **Description**: Create ad creative
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "name": "Transform Your Body Creative",
  "type": "image",
  "headline": "Transform Your Body in 30 Days",
  "description": "Ready to finally lose weight and keep it off? Our proven program has helped thousands achieve lasting results.",
  "callToAction": "Start Your Journey",
  "mediaUrl": "https://cdn.example.com/images/img_123456789.jpg",
  "thumbnailUrl": "https://cdn.example.com/thumbnails/img_123456789.jpg",
  "aiGenerated": true
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "creativeId": "cre_123456789",
    "name": "Transform Your Body Creative",
    "type": "image",
    "headline": "Transform Your Body in 30 Days",
    "description": "Ready to finally lose weight and keep it off? Our proven program has helped thousands achieve lasting results.",
    "callToAction": "Start Your Journey",
    "mediaUrl": "https://cdn.example.com/images/img_123456789.jpg",
    "thumbnailUrl": "https://cdn.example.com/thumbnails/img_123456789.jpg",
    "aiGenerated": true,
    "status": "ACTIVE",
    "createdAt": "2025-01-20T12:00:00Z"
  }
}
```

#### Create Ad
**POST** `/:campaignId/ads`
- **Description**: Create ad using ad set and creative
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "name": "Weight Loss Ad - Women 25-35",
  "adSetId": "ads_123456789",
  "creativeId": "cre_123456789",
  "status": "ACTIVE"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "adId": "ad_123456789",
    "name": "Weight Loss Ad - Women 25-35",
    "adSetId": "ads_123456789",
    "creativeId": "cre_123456789",
    "status": "ACTIVE",
    "createdAt": "2025-01-20T12:00:00Z"
  }
}
```

### 5. Complete Campaign Creation

#### Create URL Campaign
**POST** `/create-url-campaign`
- **Description**: Create complete campaign with URL in one request
- **Authentication**: Coach required
- **Request Body**:
```json
{
  "coachMetaAccountId": "act_123456789",
  "campaignData": {
    "name": "Complete Weight Loss Campaign",
    "objective": "CONVERSIONS",
    "dailyBudget": 100,
    "targetAudience": {
      "age": "25-45",
      "gender": "all",
      "interests": ["fitness", "weight loss"],
      "locations": ["United States"]
    },
    "landingPageUrl": "https://coach.example.com/weight-loss-program",
    "productInfo": "30-day transformation program"
  },
  "useAI": true,
  "createAdSets": true,
  "createCreatives": true,
  "createAds": true
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "123456789",
      "name": "Complete Weight Loss Campaign",
      "status": "ACTIVE"
    },
    "adSets": [
      {
        "id": "ads_123456789",
        "name": "Weight Loss - Women 25-35",
        "budget": 50
      },
      {
        "id": "ads_123456790",
        "name": "Weight Loss - Men 35-45",
        "budget": 50
      }
    ],
    "creatives": [
      {
        "id": "cre_123456789",
        "name": "Transform Your Body Creative",
        "type": "image"
      }
    ],
    "ads": [
      {
        "id": "ad_123456789",
        "name": "Weight Loss Ad - Women 25-35",
        "status": "ACTIVE"
      }
    ],
    "aiEnhanced": true,
    "totalBudget": 100,
    "createdAt": "2025-01-20T12:00:00Z"
  }
}
```

### 6. Performance Monitoring

#### Sync Campaigns
**POST** `/sync`
- **Description**: Sync campaign data with Meta API
- **Authentication**: Coach required
- **Response**:
```json
{
  "success": true,
  "data": {
    "syncedCampaigns": 5,
    "updatedMetrics": {
      "impressions": 500000,
      "clicks": 10000,
      "conversions": 200,
      "spend": 2000
    },
    "lastSync": "2025-01-20T12:00:00Z"
  }
}
```

## AI Optimization Features

### Performance Thresholds
- **CTR Threshold**: 2.0% (Good), 1.5% (Warning), 1.0% (Critical)
- **CPC Threshold**: $2.00 (Good), $3.00 (Warning), $5.00 (Critical)
- **ROAS Threshold**: 3:1 (Good), 2:1 (Warning), 1:1 (Critical)

### Optimization Score Calculation
```javascript
// Base score: 50 points
// CTR > 2%: +20 points
// CPC < $2: +15 points
// ROAS > 3: +15 points
// Total possible: 100 points
```

### Anomaly Detection Types
1. **High CPC**: CPC increased significantly
2. **Low CTR**: CTR dropped below threshold
3. **Low ROAS**: Return on ad spend decreased
4. **Spend Spike**: Unusual increase in daily spend
5. **Conversion Drop**: Significant decrease in conversions

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "code": "ERROR_CODE"
}
```

## Authentication

All endpoints require coach authentication.

## Rate Limiting

- **Campaign Management**: 100 requests per hour
- **Analytics Endpoints**: 200 requests per hour
- **AI Features**: 50 requests per hour
- **Creative Management**: 100 requests per hour

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **429**: Rate Limited
- **500**: Internal Server Error
