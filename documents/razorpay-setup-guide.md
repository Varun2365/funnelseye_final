# Razorpay Setup Guide

## Issue: Payment Verification Failing

The payment system is showing "Payment Failed" even when payments are successful because the Razorpay credentials are not configured.

## Solution: Configure Razorpay Credentials

### Step 1: Create .env File

Create a `.env` file in the project root with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/FunnelsEye

# Server Configuration
PORT=8080
NODE_ENV=development
BASE_URL=http://localhost:8080
FRONTEND_URL=http://localhost:8080

# Razorpay Configuration
# Replace with your actual Razorpay credentials
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# WhatsApp Configuration (Optional)
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_TOKEN=your_whatsapp_token

# Other Configuration
SESSION_SECRET=your_session_secret_here
```

### Step 2: Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in to your account
3. Go to Settings > API Keys
4. Generate Test API Keys (for development) or Live API Keys (for production)
5. Copy the Key ID and Key Secret

### Step 3: Update .env File

Replace the placeholder values in your `.env` file:

```env
RAZORPAY_KEY_ID=rzp_test_1234567890abcdef
RAZORPAY_KEY_SECRET=your_actual_key_secret_here
```

### Step 4: Restart the Server

After updating the `.env` file, restart your Node.js server:

```bash
npm start
# or
node main.js
```

## Testing the Fix

1. Create a coach plan using the API
2. Try to make a payment through the checkout page
3. The payment verification should now work correctly

## Additional Notes

- Make sure to use Test API Keys for development
- Never commit your `.env` file to version control
- The `.env` file should be added to `.gitignore`

## Troubleshooting

If you're still experiencing issues:

1. Check that the Razorpay credentials are correctly set in the `.env` file
2. Verify that the server has been restarted after updating the `.env` file
3. Check the server logs for any Razorpay-related errors
4. Ensure your Razorpay account is active and has the necessary permissions
