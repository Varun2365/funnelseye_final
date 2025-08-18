# Social Media Integration Setup Guide

## Quick Setup

### 1. Environment Variables
Add these to your `.env` file:

```bash
# OpenAI API for AI content generation
OPENAI_API_KEY=your_openai_api_key_here

# Meta Ads API for Instagram uploads
META_ADS_ACCESS_TOKEN=your_meta_ads_access_token_here

# Coach website URL for Instagram links
COACH_WEBSITE_URL=https://yourcoachwebsite.com
```

### 2. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy and paste into your `.env` file

### 3. Get Meta Ads Access Token
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add Meta Ads API product
4. Generate access token with required permissions:
   - `ads_management`
   - `ads_read`
   - `business_management`
   - `instagram_basic`
   - `instagram_content_publish`

### 4. Test the Integration
Run the test script:

```bash
# Install axios if not already installed
npm install axios

# Update the test script with your JWT token
# Then run:
node test_social_media_integration.js
```

## Required Permissions

### Meta Ads API Permissions
- **Campaign Management**: Create, read, update campaigns
- **Ad Set Management**: Manage targeting and budgets
- **Creative Management**: Upload images and create ad creatives
- **Ad Management**: Create and manage ads
- **Instagram Integration**: Post to Instagram accounts

### OpenAI API Usage
- **DALL-E 3**: Image generation (HD quality)
- **GPT-4**: Text generation for headlines and posts
- **Rate Limits**: Monitor usage to avoid hitting limits

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check API key validity
   - Verify account has credits
   - Check rate limits

2. **Meta Ads Integration Issues**
   - Verify access token permissions
   - Check Meta Ads account status
   - Ensure Instagram account is connected

3. **Authentication Errors**
   - Verify JWT token is valid
   - Check token expiration
   - Ensure proper Authorization header

### Support Resources
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Meta Ads API Documentation](https://developers.facebook.com/docs/marketing-apis/)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api/)

## Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive data
- Regularly rotate access tokens
- Monitor API usage and costs
- Implement rate limiting in production

## Cost Considerations

### OpenAI Costs
- **DALL-E 3**: $0.040 per image (1024x1024)
- **GPT-4**: $0.03 per 1K input tokens, $0.06 per 1K output tokens

### Meta Ads Costs
- **API Calls**: Free (within rate limits)
- **Ad Spend**: Based on your campaign budgets
- **Image Storage**: Free (within Meta's limits)

## Production Deployment

1. **Environment Variables**: Set in production environment
2. **Rate Limiting**: Implement proper rate limiting
3. **Error Monitoring**: Add error tracking and logging
4. **Cost Monitoring**: Track API usage and costs
5. **Backup Plans**: Have fallback content generation methods

---

**Ready to start?** Update your `.env` file and run the test script to verify everything is working!
