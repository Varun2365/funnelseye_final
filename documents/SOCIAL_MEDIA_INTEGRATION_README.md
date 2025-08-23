# Social Media Integration - AI-Powered Content Generation & Instagram Uploads

## Overview
This system provides comprehensive social media integration for coaches, allowing AI to generate automated poster images, marketing headlines, and complete social media posts, then automatically upload them to Instagram via Meta Ads.

## Features

### 🎨 AI-Generated Poster Images
- **DALL-E 3 Integration**: High-quality, professional fitness marketing posters
- **Customizable Parameters**: Style, color scheme, target audience, coach branding
- **Instagram Optimized**: Perfect dimensions for social media platforms
- **Professional Design**: Conversion-focused visuals with space for text overlays

### 📝 AI-Generated Marketing Headlines
- **Multiple Variations**: Generate 5+ compelling headlines per request
- **Hashtag Integration**: Automatic relevant hashtag suggestions
- **Tone Customization**: Motivational, professional, or casual tones
- **Conversion Focused**: Designed to drive engagement and clicks

### 📱 Complete Social Media Posts
- **Full Content Generation**: Captions, CTAs, hashtags, and emoji suggestions
- **Post Type Variety**: Motivational, educational, testimonial, and promotional
- **Audience Targeting**: Tailored content for specific demographics
- **Engagement Optimization**: Designed to maximize social media performance

### 🚀 Instagram Auto-Upload via Meta Ads
- **Meta Ads Integration**: Seamless upload to Instagram through Facebook Ads Manager
- **Campaign Management**: Automatic campaign, ad set, and creative creation
- **Targeting Optimization**: AI-powered audience targeting based on fitness interests
- **Budget Control**: Configurable daily budgets and campaign duration
- **Review System**: Posts start paused for coach review before going live

## API Endpoints

### 1. Generate Poster Image
```http
POST /api/ai-ads/generate-poster
```

**Request Body:**
```json
{
  "coachName": "John Doe",
  "niche": "Weight Loss & Nutrition",
  "offer": "12-Week Transformation Program",
  "targetAudience": "weight_loss",
  "style": "Modern and motivational",
  "colorScheme": "Energetic blue and orange",
  "additionalElements": "Before/after transformation visuals",
  "heroImage": "https://example.com/hero.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
    "prompt": "Generated DALL-E prompt...",
    "metadata": {
      "coachId": "coach123",
      "coachName": "John Doe",
      "niche": "Weight Loss & Nutrition",
      "generatedAt": "2024-01-15T10:30:00.000Z",
      "model": "dall-e-3"
    }
  }
}
```

### 2. Generate Marketing Headlines
```http
POST /api/ai-ads/generate-headlines
```

**Request Body:**
```json
{
  "coachName": "John Doe",
  "niche": "Weight Loss & Nutrition",
  "offer": "12-Week Transformation Program",
  "targetAudience": "weight_loss",
  "tone": "Motivational and urgent",
  "headlineCount": 5,
  "includeHashtags": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "headlines": [
      {
        "id": 1,
        "headline": "Transform Your Body in 12 Weeks - Guaranteed Results!",
        "hashtags": ["#WeightLoss", "#Fitness", "#Transformation", "#Results"]
      }
    ],
    "totalHeadlines": 5
  }
}
```

### 3. Generate Social Media Post
```http
POST /api/ai-ads/generate-social-post
```

**Request Body:**
```json
{
  "coachName": "John Doe",
  "niche": "Weight Loss & Nutrition",
  "offer": "12-Week Transformation Program",
  "targetAudience": "weight_loss",
  "postType": "motivational",
  "includeCallToAction": true,
  "tone": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "post": {
      "caption": "Are you ready to finally achieve the body you've always wanted?",
      "callToAction": "DM me 'TRANSFORM' to get started today!",
      "hashtags": ["#WeightLoss", "#Fitness", "#Transformation"],
      "emojis": ["💪", "🔥", "✨"],
      "fullPost": "Complete generated content..."
    }
  }
}
```

### 4. Upload to Instagram
```http
POST /api/ai-ads/upload-to-instagram
```

**Request Body:**
```json
{
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "caption": "Transform your body in 12 weeks!",
  "hashtags": ["#WeightLoss", "#Fitness", "#Transformation"],
  "callToAction": "DM me 'TRANSFORM' to get started!",
  "targetAudience": "weight_loss",
  "budget": 50,
  "duration": 7,
  "coachMetaAccountId": "act_123456789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Instagram post uploaded successfully",
    "data": {
      "campaignId": "123456789",
      "adSetId": "987654321",
      "creativeId": "456789123",
      "adId": "789123456",
      "status": "PAUSED",
      "reviewRequired": true
    }
  }
}
```

### 5. Generate Complete Campaign
```http
POST /api/ai-ads/generate-campaign
```

**Request Body:**
```json
{
  "coachName": "John Doe",
  "niche": "Weight Loss & Nutrition",
  "offer": "12-Week Transformation Program",
  "targetAudience": "weight_loss",
  "campaignDuration": 7,
  "dailyBudget": 50,
  "postFrequency": 1,
  "coachMetaAccountId": "act_123456789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Social media campaign package generated successfully",
    "data": {
      "coachId": "coach123",
      "duration": 7,
      "dailyBudget": 50,
      "posts": [
        {
          "postNumber": 1,
          "scheduledDate": "2024-01-16T10:30:00.000Z",
          "poster": { "imageUrl": "...", "metadata": {...} },
          "headlines": { "headlines": [...], "totalHeadlines": 3 },
          "postContent": { "post": {...} },
          "uploadStatus": "pending"
        }
      ]
    }
  }
}
```

### 6. Get Generation History
```http
GET /api/ai-ads/social-media-history?page=1&limit=10&type=posters
```

## Environment Variables Required

```bash
# OpenAI API for AI content generation
OPENAI_API_KEY=your_openai_api_key

# Meta Ads API for Instagram uploads
META_ADS_ACCESS_TOKEN=your_meta_ads_access_token

# Coach website URL for Instagram links
COACH_WEBSITE_URL=https://yourcoachwebsite.com
```

## Target Audience Options

### Client Types
- `weight_loss` - Weight loss and dieting
- `muscle_gain` - Muscle building and strength training
- `general_health` - Overall wellness and healthy lifestyle
- `busy_professionals` - Time-constrained professionals
- `students` - College students and recent graduates

### Content Styles
- `Motivational` - Inspirational and encouraging
- `Educational` - Informative and knowledge-based
- `Professional` - Business-focused and authoritative
- `Casual` - Friendly and approachable

### Color Schemes
- `Energetic` - High-energy colors (blues, oranges, reds)
- `Professional` - Corporate colors (blues, grays, whites)
- `Warm` - Comforting colors (yellows, greens, browns)
- `Modern` - Contemporary colors (blacks, whites, accent colors)

## Workflow Example

### 1. Generate Content
```javascript
// Generate poster image
const poster = await fetch('/api/ai-ads/generate-poster', {
  method: 'POST',
  body: JSON.stringify({
    coachName: "John Doe",
    niche: "Weight Loss & Nutrition",
    offer: "12-Week Transformation Program",
    targetAudience: "weight_loss"
  })
});

// Generate headlines
const headlines = await fetch('/api/ai-ads/generate-headlines', {
  method: 'POST',
  body: JSON.stringify({
    coachName: "John Doe",
    niche: "Weight Loss & Nutrition",
    offer: "12-Week Transformation Program",
    targetAudience: "weight_loss"
  })
});

// Generate complete post
const post = await fetch('/api/ai-ads/generate-social-post', {
  method: 'POST',
  body: JSON.stringify({
    coachName: "John Doe",
    niche: "Weight Loss & Nutrition",
    offer: "12-Week Transformation Program",
    targetAudience: "weight_loss"
  })
});
```

### 2. Upload to Instagram
```javascript
// Upload generated content to Instagram
const upload = await fetch('/api/ai-ads/upload-to-instagram', {
  method: 'POST',
  body: JSON.stringify({
    imageUrl: poster.data.imageUrl,
    caption: post.data.post.caption,
    hashtags: post.data.post.hashtags,
    callToAction: post.data.post.callToAction,
    targetAudience: "weight_loss",
    budget: 50,
    duration: 7,
    coachMetaAccountId: "act_123456789"
  })
});
```

### 3. Generate Complete Campaign
```javascript
// Generate 7-day campaign with daily posts
const campaign = await fetch('/api/ai-ads/generate-campaign', {
  method: 'POST',
  body: JSON.stringify({
    coachName: "John Doe",
    niche: "Weight Loss & Nutrition",
    offer: "12-Week Transformation Program",
    targetAudience: "weight_loss",
    campaignDuration: 7,
    dailyBudget: 50,
    postFrequency: 1,
    coachMetaAccountId: "act_123456789"
  })
});
```

## Benefits

### For Coaches
- **Time Savings**: Automatically generate professional content
- **Consistency**: Maintain brand voice across all posts
- **Scalability**: Create multiple posts and campaigns quickly
- **Professional Quality**: AI-generated content that converts
- **Automated Distribution**: Direct upload to Instagram via Meta Ads

### For Business
- **Increased Engagement**: AI-optimized content for better performance
- **Cost Efficiency**: Reduce content creation costs
- **Data-Driven**: AI learns from performance to improve future content
- **Multi-Platform**: Easy expansion to other social media platforms
- **ROI Tracking**: Full campaign performance monitoring

## Security & Privacy

- **Authentication Required**: All endpoints protected with JWT authentication
- **Coach Isolation**: Coaches can only access their own content
- **Meta Ads Integration**: Secure API integration with Facebook's platform
- **Content Review**: All posts start paused for manual review
- **Audit Trail**: Complete history of generated and uploaded content

## Error Handling

The system includes comprehensive error handling for:
- **API Rate Limits**: OpenAI and Meta Ads API limitations
- **Image Generation Failures**: DALL-E API errors
- **Upload Failures**: Meta Ads integration issues
- **Validation Errors**: Invalid input parameters
- **Authentication Errors**: Invalid or expired tokens

## Future Enhancements

- **Multi-Platform Support**: Facebook, Twitter, LinkedIn, TikTok
- **Content Scheduling**: Automated posting at optimal times
- **Performance Analytics**: Detailed engagement and conversion metrics
- **A/B Testing**: Automated testing of different content variations
- **Content Templates**: Pre-built templates for common post types
- **Collaboration Tools**: Team content creation and approval workflows

## Support & Troubleshooting

### Common Issues
1. **OpenAI API Errors**: Check API key and rate limits
2. **Meta Ads Integration**: Verify access token and account permissions
3. **Image Generation Failures**: Review prompt content and API quotas
4. **Upload Failures**: Check Meta Ads account status and targeting settings

### Best Practices
1. **Start Small**: Begin with single posts before scaling to campaigns
2. **Review Content**: Always review AI-generated content before publishing
3. **Test Targeting**: Experiment with different audience segments
4. **Monitor Performance**: Track engagement and adjust content strategy
5. **Budget Management**: Start with lower budgets and scale based on performance

---

**Note**: This system integrates seamlessly with your existing AI ads infrastructure and follows the same authentication and error handling patterns. All generated content is stored temporarily and can be reviewed before publication to ensure quality and brand alignment.
