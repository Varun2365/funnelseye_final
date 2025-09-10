# Complete Order Flow Setup Guide

## 🚀 Full Implementation: Landing Page → Order Creation → Payment → Success

This guide implements the complete order flow as requested:

1. **Landing Page** - Product showcase with "Buy Now" button
2. **Order Creation** - Backend creates order + redirect URL
3. **Payment Page** - Razorpay checkout integration
4. **Success Page** - Payment confirmation with next steps

## 📁 File Structure

```
your-frontend/
├── public/
│   ├── landing-page.html          # Product landing page
│   ├── checkout/
│   │   ├── payment.html           # Payment page
│   │   ├── success.html           # Success page
│   │   └── failure.html           # Failure page
│   └── index.html                 # Home page
├── .env                           # Environment variables
└── server.js                      # Express server (optional)
```

## 🛠️ Setup Instructions

### Step 1: Create Frontend Files

1. **Landing Page:**
   ```bash
   # Copy documents/landing-page-example.html to public/landing-page.html
   cp documents/landing-page-example.html public/landing-page.html
   ```

2. **Payment Pages:**
   ```bash
   mkdir -p public/checkout
   cp documents/payment-page.html public/checkout/payment.html
   cp documents/payment-success-page.html public/checkout/success.html
   cp documents/payment-failure-page.html public/checkout/failure.html
   ```

### Step 2: Configure Environment Variables

Create `.env` file:
```bash
# Frontend URL
FRONTEND_URL=http://localhost:8080

# Backend API URL
API_URL=http://localhost:3000/api/paymentsv1

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_... # Replace with your key
RAZORPAY_KEY_SECRET=... # Replace with your secret

# MongoDB
MONGODB_URI=mongodb://localhost:27017/FunnelsEye
```

### Step 3: Update Configuration

In `landing-page.html`, update:
```javascript
const CONFIG = {
    planId: '68bf0641c89e4507d10888f6', // Replace with actual plan ID
    baseUrl: 'http://localhost:8080',
    apiUrl: 'http://localhost:3000/api/paymentsv1'
};
```

In `payment-page.html`, update:
```javascript
const CONFIG = {
    razorpayKey: 'rzp_test_...', // Replace with your Razorpay key
    apiUrl: 'http://localhost:3000/api/paymentsv1'
};
```

### Step 4: Create Express Server (Optional)

Create `server.js` for serving static files:
```javascript
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files
app.use(express.static('public'));

// Route handlers
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing-page.html'));
});

app.get('/checkout/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'checkout', 'payment.html'));
});

app.get('/payment/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'checkout', 'success.html'));
});

app.get('/payment/failure', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'checkout', 'failure.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server running on http://localhost:${PORT}`);
});
```

## 🔄 Complete Flow Testing

### 1. Start Servers
```bash
# Terminal 1: Backend
npm start

# Terminal 2: Frontend (if using Express)
node server.js

# Or use any static file server
npx serve public -p 8080
```

### 2. Test the Flow

1. **Visit Landing Page:**
   ```
   http://localhost:8080/landing-page.html
   ```

2. **Click "Buy Now":**
   - Should create order
   - Should redirect to payment page

3. **Complete Payment:**
   - Should open Razorpay checkout
   - Should redirect to success page

4. **Verify Success:**
   - Should show payment details
   - Should have action buttons

## 🎯 Flow Details

### Landing Page (`/landing-page.html`)
- **Purpose:** Showcase product with "Buy Now" button
- **Action:** Creates order via API call
- **Redirect:** Takes user to payment page

### Payment Page (`/checkout/payment`)
- **Purpose:** Handle Razorpay checkout
- **Features:** Order details, payment button, error handling
- **Redirect:** Success or failure page

### Success Page (`/payment/success`)
- **Purpose:** Confirm successful payment
- **Features:** Payment details, next steps, action buttons
- **Actions:** Dashboard, programs, home

### Failure Page (`/payment/failure`)
- **Purpose:** Handle payment failures
- **Features:** Error details, retry options, support info
- **Actions:** Retry, home, contact support

## 🔧 Customization

### Update Product Details
Edit `landing-page.html`:
```html
<h1>Your Product Name</h1>
<p class="subtitle">Your product description</p>
<div class="price-tag">₹Your Price</div>
```

### Update Coach Information
Edit coach section in `landing-page.html`:
```html
<div class="coach-avatar">JD</div>
<h4>Your Coach Name</h4>
<p>Your coach description</p>
```

### Update Company Branding
Replace "Your Company Name" in:
- `payment-page.html`
- `payment-success-page.html`
- `payment-failure-page.html`

## 🚨 Troubleshooting

### Common Issues

1. **404 on Payment Page:**
   - Check if files exist in correct locations
   - Verify server is serving static files

2. **Order Creation Fails:**
   - Check backend API is running
   - Verify plan ID exists
   - Check CORS settings

3. **Razorpay Not Loading:**
   - Verify Razorpay key is correct
   - Check if Razorpay script loads
   - Ensure HTTPS in production

4. **Payment Verification Fails:**
   - Check backend verify endpoint
   - Verify Razorpay webhook settings
   - Check environment variables

### Debug Steps

1. **Check Browser Console:**
   - Look for JavaScript errors
   - Check network requests

2. **Check Backend Logs:**
   - Verify order creation
   - Check payment verification

3. **Test API Endpoints:**
   ```bash
   # Test order creation
   curl -X POST http://localhost:3000/api/paymentsv1/razorpay/create-coach-plan-order \
     -H "Content-Type: application/json" \
     -d '{"planId":"68bf0641c89e4507d10888f6","customerId":"test123"}'
   ```

## 🎉 Success!

Once everything is set up, you'll have a complete order flow:

1. ✅ **Landing Page** - Beautiful product showcase
2. ✅ **Order Creation** - Backend handles order + redirect
3. ✅ **Payment Page** - Razorpay integration
4. ✅ **Success Page** - Payment confirmation
5. ✅ **Failure Handling** - Error recovery

The complete flow is now ready for production! 🚀
