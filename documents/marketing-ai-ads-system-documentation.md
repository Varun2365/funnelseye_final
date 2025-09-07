# Marketing AI & Ads System Documentation

## Overview

The Marketing AI & Ads System is a comprehensive platform that combines Facebook/Meta Ads management with AI-powered optimization, content generation, and performance analytics. The system provides coaches with intelligent tools to create, manage, and optimize their advertising campaigns with minimal manual effort.

## Current Status

### ✅ **FULLY IMPLEMENTED**

#### Core Ads Management
1. **Meta/Facebook Ads Integration** - Complete API integration with Meta Ads
2. **Campaign Management** - Create, update, pause, resume campaigns
3. **Ad Set Management** - Target audience and budget management
4. **Ad Creative Management** - Image and text content management
5. **Performance Analytics** - Real-time campaign insights and metrics
6. **Campaign Synchronization** - Sync campaigns between Meta and local database

#### AI-Powered Features
1. **AI Ad Copy Generation** - Generate compelling ad copy using GPT-4
2. **Targeting Recommendations** - AI-powered audience targeting suggestions
3. **Performance Optimization** - Automatic budget allocation and campaign optimization
4. **Anomaly Detection** - Identify performance issues and anomalies
5. **Ad Variations** - Generate multiple ad versions for A/B testing
6. **Social Media Integration** - Generate posts for Instagram and other platforms

#### Advanced Features
1. **Complete URL Campaign Creation** - One-click campaign setup
2. **Image Generation** - AI-powered poster and creative generation
3. **Marketing Headlines** - Generate engaging headlines and hashtags
4. **Social Media Campaigns** - End-to-end social media campaign packages
5. **Performance Insights** - Detailed analytics and recommendations
6. **Bulk Operations** - Optimize multiple campaigns simultaneously

## System Architecture

### Core Components

#### 1. Ads Management (`/api/ads`)
- **Campaign CRUD Operations**
- **Ad Set Management**
- **Creative Management**
- **Performance Analytics**
- **Campaign Synchronization**

#### 2. AI Ads System (`/api/ai-ads`)
- **AI Content Generation**
- **Performance Optimization**
- **Targeting Recommendations**
- **Anomaly Detection**
- **Social Media Integration**

#### 3. Services Layer
- **`metaAdsService.js`** - Meta/Facebook API integration
- **`aiAdsAgentService.js`** - AI-powered optimization and content generation
- **`coachDashboardService.js`** - Marketing data integration

## Coach Setup Guide

### Prerequisites

#### 1. Meta Business Account Setup
```bash
# Required Meta Business Account components:
- Meta Business Manager Account
- Facebook Ad Account
- Facebook Page
- Instagram Business Account (optional)
- Meta App ID and Secret
```

#### 2. API Access Requirements
```bash
# Environment Variables Needed:
META_ADS_ACCESS_TOKEN=your_meta_access_token
OPENAI_API_KEY=your_openai_api_key
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
```

#### 3. Coach Account Requirements
```javascript
// Coach must have:
- Valid coach account in the system
- Meta Business Account ID
- Facebook Ad Account ID
- Sufficient permissions for ad creation
```

### Step-by-Step Setup Process

#### Step 1: Meta Business Account Configuration

**1.1 Create Meta Business Manager Account**
```bash
# Visit: https://business.facebook.com/
# Create a new Business Manager account
# Add your Facebook page and Instagram account
```

**1.2 Set Up Ad Account**
```bash
# In Business Manager:
# 1. Go to "Ad Accounts" section
# 2. Create new ad account or claim existing one
# 3. Note down the Ad Account ID (format: act_XXXXXXXXXX)
```

**1.3 Configure API Access**
```bash
# 1. Go to "System Users" in Business Manager
# 2. Create a new system user
# 3. Assign permissions: Ads Management, Pages Management
# 4. Generate access token with required permissions
```

#### Step 2: System Integration

**2.1 Update Coach Profile**
```bash
POST /api/coach-profile/update
{
    "metaBusinessAccountId": "your_business_account_id",
    "metaAdAccountId": "act_XXXXXXXXXX",
    "facebookPageId": "your_page_id",
    "instagramAccountId": "your_instagram_id"
}
```

**2.2 Verify API Connection**
```bash
GET /api/ads/sync
# This will sync existing campaigns and verify API access
```

#### Step 3: AI Configuration

**3.1 Enable AI Features**
```bash
# AI features are automatically enabled when:
# - OpenAI API key is configured
# - Coach has valid Meta account setup
```

**3.2 Configure AI Preferences**
```bash
POST /api/ai-ads/configure
{
    "autoOptimization": true,
    "contentGeneration": true,
    "anomalyDetection": true,
    "targetingRecommendations": true
}
```

### Usage Workflows

#### Workflow 1: Quick Campaign Creation

**1.1 Basic Campaign Setup**
```bash
POST /api/ads/create
{
    "coachMetaAccountId": "act_XXXXXXXXXX",
    "campaignData": {
        "name": "Fitness Coaching Campaign",
        "objective": "CONVERSIONS",
        "dailyBudget": 50,
        "targetAudience": "Fitness enthusiasts, 25-45, interested in personal training",
        "productInfo": "Personal fitness coaching program with meal plans and workout routines"
    },
    "useAI": true
}
```

**1.2 AI-Generated Content**
```json
{
    "success": true,
    "data": {
        "campaign": {
            "id": "campaign_id",
            "name": "Fitness Coaching Campaign",
            "status": "PAUSED"
        },
        "aiContent": {
            "primaryHeadline": "Transform Your Fitness Journey",
            "secondaryHeadline": "Personal Coaching That Works",
            "adCopy": "Ready to achieve your fitness goals? Get personalized coaching, meal plans, and workout routines designed just for you.",
            "callToAction": "Get Started",
            "variations": [
                {
                    "headline": "Lose Weight & Build Muscle",
                    "copy": "Stop struggling with generic workouts. Get a personalized plan that fits your lifestyle and goals.",
                    "cta": "Start Today"
                }
            ]
        },
        "targetingRecommendations": {
            "ageRange": "25-45",
            "interests": ["Fitness", "Personal Training", "Weight Loss"],
            "locations": ["United States"],
            "behaviors": ["Frequent travelers", "Health conscious"]
        }
    }
}
```

#### Workflow 2: AI-Optimized Campaign Creation

**2.1 Create Optimized Campaign**
```bash
POST /api/ai-ads/create-optimized-campaign
{
    "name": "AI-Optimized Fitness Campaign",
    "objective": "LEAD_GENERATION",
    "targetAudience": "Busy professionals wanting to get fit",
    "budget": 100,
    "productInfo": "Online fitness coaching with personalized meal plans",
    "coachMetaAccountId": "act_XXXXXXXXXX"
}
```

**2.2 Campaign Optimization**
```bash
POST /api/ai-ads/optimize-budget/campaign_id
# AI will analyze performance and suggest budget reallocation
```

#### Workflow 3: Social Media Integration

**3.1 Generate Social Media Content**
```bash
POST /api/ai-ads/generate-social-post
{
    "coachName": "John Fitness Coach",
    "niche": "Weight Loss & Muscle Building",
    "offer": "30-Day Transformation Program",
    "targetAudience": "Busy moms wanting to lose weight",
    "platform": "Instagram"
}
```

**3.2 Create Complete Campaign Package**
```bash
POST /api/ai-ads/generate-campaign
{
    "coachName": "John Fitness Coach",
    "niche": "Weight Loss & Muscle Building",
    "offer": "30-Day Transformation Program",
    "targetAudience": "Busy moms wanting to lose weight",
    "campaignDuration": 14,
    "dailyBudget": 75,
    "postFrequency": 2,
    "coachMetaAccountId": "act_XXXXXXXXXX"
}
```

### Available Endpoints

#### Ads Management (`/api/ads`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all campaigns |
| `POST` | `/create` | Create new campaign |
| `POST` | `/sync` | Sync campaigns with Meta |
| `PUT` | `/:campaignId` | Update campaign |
| `POST` | `/:campaignId/pause` | Pause campaign |
| `POST` | `/:campaignId/resume` | Resume campaign |
| `GET` | `/:campaignId/analytics` | Get campaign analytics |
| `POST` | `/create-url-campaign` | Create complete campaign from URL |

#### AI Ads System (`/api/ai-ads`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/generate-copy` | Generate AI ad copy |
| `POST` | `/optimize-budget/:campaignId` | Optimize budget allocation |
| `POST` | `/auto-optimize/:campaignId` | Auto-optimize campaign |
| `GET` | `/detect-anomalies/:campaignId` | Detect performance anomalies |
| `POST` | `/targeting-recommendations` | Get targeting recommendations |
| `POST` | `/create-optimized-campaign` | Create AI-optimized campaign |
| `GET` | `/dashboard` | Get AI dashboard data |
| `POST` | `/generate-variations` | Generate ad variations |
| `POST` | `/generate-poster` | Generate AI poster image |
| `POST` | `/generate-headlines` | Generate marketing headlines |
| `POST` | `/generate-social-post` | Generate social media post |
| `POST` | `/upload-to-instagram` | Upload to Instagram |
| `POST` | `/generate-campaign` | Generate complete campaign package |

### Performance Monitoring

#### Key Metrics Tracked
```javascript
{
    "campaignPerformance": {
        "impressions": 10000,
        "clicks": 500,
        "conversions": 25,
        "spend": 250,
        "ctr": 5.0, // Click-through rate
        "cpc": 0.50, // Cost per click
        "cpm": 25.0, // Cost per thousand impressions
        "roas": 4.0 // Return on ad spend
    },
    "aiInsights": {
        "optimizationScore": 85,
        "anomalies": [
            {
                "type": "high_cpc",
                "severity": "medium",
                "recommendation": "Consider adjusting targeting to reduce CPC"
            }
        ],
        "recommendations": [
            {
                "type": "budget_reallocation",
                "description": "Move budget from underperforming ad sets to top performers"
            }
        ]
    }
}
```

### Best Practices

#### 1. Campaign Setup
- **Start with AI-generated content** for better performance
- **Use multiple ad variations** for A/B testing
- **Set realistic budgets** and monitor performance
- **Review AI recommendations** before implementing

#### 2. Optimization
- **Monitor campaigns daily** for the first week
- **Use AI anomaly detection** to identify issues early
- **Implement AI recommendations** for better performance
- **Test different targeting options** suggested by AI

#### 3. Content Strategy
- **Use AI-generated headlines** for better engagement
- **Create consistent brand messaging** across all ads
- **Test different content formats** (images, videos, carousels)
- **Leverage social media integration** for broader reach

### Troubleshooting

#### Common Issues

**1. API Connection Errors**
```bash
# Check Meta access token validity
GET /api/ads/sync
# Verify token has required permissions
```

**2. AI Content Generation Failures**
```bash
# Verify OpenAI API key
# Check API quota limits
# Ensure proper input data format
```

**3. Campaign Creation Issues**
```bash
# Verify Meta account permissions
# Check budget settings
# Ensure targeting parameters are valid
```

#### Error Resolution

**Meta API Errors**
```javascript
// Common error codes and solutions:
{
    "190": "Invalid access token - Regenerate token",
    "100": "Invalid parameter - Check input data",
    "1487749": "Ad account disabled - Contact Meta support",
    "1487748": "Campaign limit reached - Upgrade account"
}
```

**AI Service Errors**
```javascript
// OpenAI API errors:
{
    "rate_limit_exceeded": "Wait and retry",
    "invalid_api_key": "Check API key configuration",
    "insufficient_quota": "Upgrade OpenAI plan"
}
```

### Integration with Coach Dashboard

#### Dashboard Integration
```javascript
// Marketing data appears in coach dashboard:
{
    "marketingSection": {
        "activeCampaigns": 5,
        "totalSpend": 1250,
        "totalConversions": 45,
        "averageROAS": 3.2,
        "aiOptimizationScore": 87,
        "recentOptimizations": [
            {
                "campaign": "Fitness Campaign",
                "optimization": "Budget reallocation",
                "impact": "+15% conversions"
            }
        ]
    }
}
```

### Future Enhancements

#### Planned Features
1. **Multi-Platform Support** - Google Ads, TikTok Ads integration
2. **Advanced AI Models** - Custom-trained models for specific niches
3. **Predictive Analytics** - Forecast campaign performance
4. **Automated Bidding** - AI-powered bid optimization
5. **Creative Testing** - Automated A/B testing for creatives
6. **Audience Insights** - Deep audience analysis and recommendations

## Conclusion

The Marketing AI & Ads System provides coaches with a comprehensive, AI-powered advertising solution that significantly reduces the complexity of campaign management while improving performance through intelligent optimization. The system is production-ready and provides coaches with enterprise-level advertising capabilities with minimal setup requirements.

### Quick Start Checklist

- [ ] Meta Business Account created
- [ ] Ad Account configured
- [ ] API access token generated
- [ ] Coach profile updated with Meta account details
- [ ] OpenAI API key configured
- [ ] First AI-optimized campaign created
- [ ] Performance monitoring set up
- [ ] Social media integration configured

The system is designed to be intuitive and requires minimal technical knowledge while providing powerful AI-driven optimization capabilities.
