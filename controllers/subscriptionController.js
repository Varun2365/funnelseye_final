const mongoose = require('mongoose');
const SubscriptionPlan = require('../schema/SubscriptionPlan');
const CoachSubscription = require('../schema/CoachSubscription');
const User = require('../schema/User');
const logger = require('../utils/logger');

class SubscriptionController {
    
    /**
     * Get all available subscription plans
     * GET /api/subscriptions/plans
     */
    async getPlans(req, res) {
        try {
            logger.info('[SubscriptionController] Getting subscription plans');
            
            const plans = await SubscriptionPlan.find({ isActive: true })
                .sort({ sortOrder: 1, price: 1 });
            
            res.json({
                success: true,
                data: plans
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error getting plans:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting subscription plans',
                error: error.message
            });
        }
    }
  
    /**
     * Get plan selection page
     * GET /api/subscriptions/select-plan?token=coach_token
     */
    async getSelectPlanPage(req, res) {
        try {
            const { token } = req.query;
            
            let coach = null;
            let hasValidToken = false;
            
            if (token) {
                // Verify the token and get coach info
                const jwt = require('jsonwebtoken');
                const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
                
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    coach = await User.findById(decoded.id);
                    
                    if (coach && coach.role === 'coach') {
                        hasValidToken = true;
                    }
                } catch (error) {
                    // Token is invalid, but we'll still show the page
                    hasValidToken = false;
                }
            }

            // Get active subscription plans
            const plans = await SubscriptionPlan.find({ isActive: true })
                .sort({ sortOrder: 1, price: 1 });

            // Check if coach already has an active subscription (only if valid token)
            let existingSubscription = null;
            if (hasValidToken && coach) {
                existingSubscription = await CoachSubscription.findOne({
                    coachId: coach._id,
                    status: { $in: ['active', 'trial'] }
                });
            }

            // Render the plan selection page
            res.send(this.renderPlanSelectionPage(plans, coach, existingSubscription, token, hasValidToken));
            
        } catch (error) {
            logger.error('[SubscriptionController] Error getting select plan page:', error);
            res.status(500).send(`
                <html>
                    <head><title>Error</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1>Server Error</h1>
                        <p>An error occurred while loading the page.</p>
                    </body>
                </html>
            `);
        }
    }

    /**
     * Render the plan selection page HTML
     */
    renderPlanSelectionPage(plans, coach, existingSubscription, token, hasValidToken) {
        const hasActiveSubscription = !!existingSubscription;
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Select Your Plan - FunnelsEye</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f8f4ff 0%, #e8d5ff 100%);
            min-height: 100vh;
            color: #2d3748;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .header {
            text-align: center;
            padding: 60px 0 40px;
        }
        
        .header .subtitle {
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #8b5cf6;
            margin-bottom: 16px;
        }
        
        .header h1 {
            font-size: 3rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 40px;
            line-height: 1.2;
        }
        
        .billing-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 60px;
        }
        
        .toggle-container {
            background: #f7fafc;
            border-radius: 12px;
            padding: 4px;
            display: flex;
            position: relative;
        }
        
        .toggle-option {
            padding: 12px 24px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 8px;
            position: relative;
            z-index: 2;
        }
        
        .toggle-option.active {
            background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
            color: white;
        }
        
        .toggle-option:not(.active) {
            color: #718096;
        }
        
        .plans-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 24px;
            margin-bottom: 80px;
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .plan-card {
            background: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            position: relative;
            border: 2px solid transparent;
            width: 100%;
            max-width: 350px;
            height: 500px;
            display: flex;
            flex-direction: column;
            margin: 0 auto;
        }
        
        .plan-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }
        
        .plan-card.popular {
            background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
            color: white;
            transform: scale(1.02);
            height: 500px;
        }
        
        .plan-card.popular .plan-name,
        .plan-card.popular .plan-description,
        .plan-card.popular .plan-price,
        .plan-card.popular .plan-billing,
        .plan-card.popular .plan-features li {
            color: white;
        }
        
        .plan-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            color: white;
            font-weight: bold;
            font-size: 1.2rem;
        }
        
        .plan-card.popular .plan-icon {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .plan-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 8px;
        }
        
        .plan-description {
            color: #718096;
            margin-bottom: 24px;
            font-size: 0.95rem;
        }
        
        .plan-price {
            font-size: 3rem;
            font-weight: 800;
            color: #1a202c;
            margin-bottom: 8px;
            line-height: 1;
        }
        
        .plan-billing {
            color: #a0aec0;
            margin-bottom: 32px;
            font-size: 0.9rem;
        }
        
        .plan-features {
            list-style: none;
            margin-bottom: 32px;
            flex-grow: 1;
        }
        
        .plan-features li {
            padding: 8px 0;
            color: #4a5568;
            position: relative;
            padding-left: 24px;
            font-size: 0.95rem;
        }
        
        .plan-features li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #8b5cf6;
            font-weight: bold;
            font-size: 1rem;
        }
        
        .plan-card.popular .plan-features li::before {
            color: white;
        }
        
        .select-btn {
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: none;
            margin-top: auto;
        }
        
        .select-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
        }
        
        .select-btn:disabled {
            background: #e2e8f0;
            color: #a0aec0;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .plan-card.popular .select-btn {
            background: white;
            color: #8b5cf6;
        }
        
        .plan-card.popular .select-btn:hover {
            background: #f7fafc;
            box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
        }
        
        .current-plan {
            background: #f0f8ff;
            border: 2px solid #8b5cf6;
        }
        
        .current-plan .select-btn {
            background: #10b981;
        }
        
        .current-plan .select-btn:hover {
            background: #059669;
        }
        
        .error-dialog {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
        }
        
        .error-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 40px;
            border-radius: 16px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .error-content h2 {
            color: #e53e3e;
            margin-bottom: 20px;
            font-size: 1.5rem;
        }
        
        .error-content p {
            color: #718096;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .error-btn {
            padding: 12px 30px;
            background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .error-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
        }
        
        .loading {
            display: none;
            text-align: center;
            color: #8b5cf6;
            margin-top: 40px;
        }
        
        .spinner {
            border: 3px solid rgba(139, 92, 246, 0.2);
            border-top: 3px solid #8b5cf6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .features-section {
            text-align: center;
            padding: 80px 0;
            background: white;
            margin: 0 -20px;
        }
        
        .features-section .subtitle {
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #8b5cf6;
            margin-bottom: 16px;
        }
        
        .features-section h2 {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 60px;
            line-height: 1.2;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
            max-width: 1000px;
            margin: 0 auto;
        }
        
        .feature-card {
            text-align: center;
            padding: 32px;
        }
        
        .feature-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            color: white;
            font-size: 1.5rem;
        }
        
        .feature-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 16px;
        }
        
        .feature-description {
            color: #718096;
            line-height: 1.6;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2.25rem;
            }
            
            .plans-grid {
                grid-template-columns: 1fr;
                gap: 20px;
                max-width: 400px;
            }
            
            .plan-card {
                padding: 24px;
                max-width: 100%;
                height: 480px;
            }
            
            .features-section h2 {
                font-size: 2rem;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
                gap: 32px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="subtitle">COACHING PLATFORM</div>
            <h1>Select The Best Plan For Your Needs</h1>
            
            <div class="billing-toggle">
                <div class="toggle-container">
                    <div class="toggle-option active" onclick="toggleBilling('monthly')">Monthly Plan</div>
                    <div class="toggle-option" onclick="toggleBilling('yearly')">Yearly Plan</div>
                </div>
            </div>
        </div>
        
        <div class="plans-grid" id="plansGrid">
            ${plans.map(plan => this.renderPlanCard(plan, hasActiveSubscription, hasValidToken)).join('')}
        </div>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Processing your request...</p>
        </div>
    </div>
    
    <div class="features-section">
        <div class="container">
            <div class="subtitle">SCALE YOUR BUSINESS</div>
            <h2>A Platform That Is Designed For Your Business Growth</h2>
            
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <div class="feature-title">Advanced Analytics</div>
                    <div class="feature-description">Track your coaching performance with detailed analytics and insights to optimize your business growth.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔧</div>
                    <div class="feature-title">Powerful Tools</div>
                    <div class="feature-description">Access a comprehensive suite of tools designed specifically for coaches to manage clients and grow their practice.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">👥</div>
                    <div class="feature-title">Dedicated Support</div>
                    <div class="feature-description">Get priority support from our team of experts who understand the unique needs of coaching businesses.</div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="error-dialog" id="errorDialog">
        <div class="error-content">
            <h2>Payment Failed</h2>
            <p>Your payment could not be processed. Please try again or contact support.</p>
            <button class="error-btn" onclick="closeErrorDialog()">OK</button>
        </div>
    </div>
    
    <script>
        const token = '${token || ''}';
        const coachId = '${coach ? coach._id : ''}';
        const hasValidToken = ${hasValidToken};
        
        function selectPlan(planId, planPrice, planName) {
            if (!hasValidToken) {
                alert('Please log in to select a plan. You need a valid authentication token to proceed with the subscription.');
                return;
            }
            
            if (${hasActiveSubscription}) {
                alert('You already have an active subscription. Please contact support to change your plan.');
                return;
            }
            
            document.getElementById('loading').style.display = 'block';
            
            // Create Razorpay order
            fetch('/api/subscriptions/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    planId: planId,
                    amount: planPrice * 100 // Convert to paise
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const options = {
                        key: '${process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890'}',
                        amount: data.order.amount,
                        currency: data.order.currency,
                        name: 'FunnelsEye',
                        description: planName,
                        order_id: data.order.id,
                        handler: function (response) {
                            verifyPayment(response, planId);
                        },
                        prefill: {
                            name: '${coach ? coach.name || '' : ''}',
                            email: '${coach ? coach.email || '' : ''}',
                        },
                        theme: {
                            color: '#667eea'
                        }
                    };
                    
                    const rzp = new Razorpay(options);
                    rzp.open();
                } else {
                    throw new Error(data.message || 'Failed to create order');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorDialog();
            })
            .finally(() => {
                document.getElementById('loading').style.display = 'none';
            });
        }
        
        function verifyPayment(paymentResponse, planId) {
            document.getElementById('loading').style.display = 'block';
            
            fetch('/api/subscriptions/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    paymentId: paymentResponse.razorpay_payment_id,
                    orderId: paymentResponse.razorpay_order_id,
                    signature: paymentResponse.razorpay_signature,
                    planId: planId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Redirect to dashboard
                    window.location.href = 'https://dashboard.funnelseye.com';
                } else {
                    throw new Error(data.message || 'Payment verification failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorDialog();
            })
            .finally(() => {
                document.getElementById('loading').style.display = 'none';
            });
        }
        
        function showErrorDialog() {
            document.getElementById('errorDialog').style.display = 'block';
        }
        
        function closeErrorDialog() {
            document.getElementById('errorDialog').style.display = 'none';
        }
        
        // Close error dialog when clicking outside
        document.getElementById('errorDialog').addEventListener('click', function(e) {
            if (e.target === this) {
                closeErrorDialog();
            }
        });
        
        function toggleBilling(period) {
            // Update toggle UI
            document.querySelectorAll('.toggle-option').forEach(option => {
                option.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Here you can add logic to recalculate prices based on billing period
            // For now, we'll just update the UI
            console.log('Billing period changed to:', period);
        }
    </script>
</body>
</html>
        `;
    }

    /**
     * Render individual plan card
     */
    renderPlanCard(plan, hasActiveSubscription, hasValidToken) {
        const isCurrentPlan = false; // You can add logic to check if this is the current plan
        const price = plan.price;
        const currency = plan.currency || 'INR';
        const billingCycle = plan.billingCycle || 'monthly';
        
        // Get first letter of plan name for icon
        const planIcon = plan.name.charAt(0).toUpperCase();
        
        return `
            <div class="plan-card ${plan.isPopular ? 'popular' : ''} ${isCurrentPlan ? 'current-plan' : ''}">
                <div class="plan-icon">${planIcon}</div>
                <div class="plan-name">${plan.name}</div>
                <div class="plan-description">${plan.description}</div>
                <div class="plan-price">${currency} ${price}</div>
                <div class="plan-billing">per ${billingCycle}</div>
                
                <ul class="plan-features">
                    <li>${plan.features.maxFunnels || 0} Funnels</li>
                    <li>${plan.features.maxStaff || 0} Staff Members</li>
                    <li>${plan.features.maxDevices || 0} Devices</li>
                    <li>${plan.features.storageGB || 0} GB Storage</li>
                    ${plan.features.aiFeatures ? '<li>AI Features</li>' : ''}
                    ${plan.features.advancedAnalytics ? '<li>Advanced Analytics</li>' : ''}
                    ${plan.features.prioritySupport ? '<li>Priority Support</li>' : ''}
                    ${plan.features.customDomain ? '<li>Custom Domain</li>' : ''}
                    ${plan.features.apiAccess ? '<li>API Access</li>' : ''}
                    ${plan.features.whiteLabel ? '<li>White Label</li>' : ''}
                </ul>
                
                <button class="select-btn" 
                        onclick="selectPlan('${plan._id}', ${price}, '${plan.name}')"
                        ${hasActiveSubscription ? 'disabled' : ''}>
                    ${hasActiveSubscription ? 'Already Subscribed' : 'Start Free Trial'}
                </button>
            </div>
        `;
    }
    
    /**
     * Get coach's current subscription
     * GET /api/subscriptions/current
     */
    async getCurrentSubscription(req, res) {
        try {
            const coachId = req.user._id;
            
            logger.info(`[SubscriptionController] Getting current subscription for coach: ${coachId}`);
            
            const subscription = await CoachSubscription.findOne({ 
                coachId, 
                status: { $in: ['active', 'trial'] }
            }).populate('planId');
            
            if (!subscription) {
                return res.json({
                    success: true,
                    data: null,
                    message: 'No active subscription found'
                });
            }
            
            res.json({
                success: true,
                data: subscription
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error getting current subscription:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting current subscription',
                error: error.message
            });
        }
    }
    
    /**
     * Create subscription order
     * POST /api/subscriptions/create-order
     */
    async createOrder(req, res) {
        try {
            const { planId, paymentMethod = 'razorpay' } = req.body;
            const coachId = req.user._id;
            
            logger.info(`[SubscriptionController] Creating subscription order for plan: ${planId}`);
            
            // Validate plan exists and is active
            const plan = await SubscriptionPlan.findOne({ 
                _id: planId, 
                isActive: true 
            });
            
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription plan not found or not available'
                });
            }
            
            // Check if coach already has a subscription (any status)
            const existingSubscription = await CoachSubscription.findOne({
                coachId
            });
            
            if (existingSubscription && existingSubscription.status === 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'You already have an active subscription. Please cancel it before subscribing to a new plan.'
                });
            }
            
            // Calculate dates
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + plan.duration);
            
            let subscription;
            
            if (existingSubscription) {
                // Update existing subscription
                subscription = existingSubscription;
                subscription.planId = plan._id;
                subscription.status = 'active';
                subscription.startDate = startDate;
                subscription.endDate = endDate;
                subscription.nextBillingDate = endDate;
                subscription.autoRenew = true;
                subscription.cancellationDate = null;
                subscription.cancellationReason = null;
                
                await subscription.save();
            } else {
                // Create new subscription record
                subscription = new CoachSubscription({
                    coachId,
                    planId: plan._id,
                    status: 'active',
                    startDate,
                    endDate,
                    nextBillingDate: endDate,
                    autoRenew: true
                });
                
                await subscription.save();
            }
            
            // Create payment order for all subscriptions
            const paymentOrder = await this.createPaymentOrder(plan, subscription);
            
            res.json({
                success: true,
                message: 'Subscription order created successfully',
                data: {
                    subscription: subscription,
                    plan: plan,
                    paymentOrder: paymentOrder
                }
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error creating subscription order:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating subscription order',
                error: error.message
            });
        }
    }
    
    /**
     * Create Razorpay payment order for subscription
     */
    async createPaymentOrder(plan, subscription) {
        try {
            const Razorpay = require('razorpay');
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET
            });
            
            // Create a short receipt (max 40 characters for Razorpay)
            const receipt = `sub_${Date.now()}`.substring(0, 40);
            
            const orderOptions = {
                amount: (plan.price + plan.setupFee) * 100, // Convert to paise
                currency: plan.currency,
                receipt: receipt,
                notes: {
                    subscription_id: subscription._id.toString(),
                    plan_id: plan._id.toString(),
                    coach_id: subscription.coachId.toString(),
                    billing_cycle: plan.billingCycle
                }
            };
            
            const razorpayOrder = await razorpay.orders.create(orderOptions);
            
            return {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                receipt: razorpayOrder.receipt
            };
            
        } catch (error) {
            logger.error('[SubscriptionController] Error creating payment order:', error);
            throw error;
        }
    }
    
    /**
     * Verify subscription payment
     * POST /api/subscriptions/verify-payment
     */
    async verifyPayment(req, res) {
        try {
            const { 
                razorpay_order_id, 
                razorpay_payment_id, 
                razorpay_signature,
                subscription_id 
            } = req.body;
            
            logger.info(`[SubscriptionController] Verifying payment for subscription: ${subscription_id}`);
            
            // Verify Razorpay signature
            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
            hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
            const generatedSignature = hmac.digest('hex');
            
            if (generatedSignature !== razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment signature'
                });
            }
            
            // Update subscription
            const subscription = await CoachSubscription.findById(subscription_id);
            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription not found'
                });
            }
            
            // Add payment to history
            subscription.paymentHistory.push({
                paymentId: razorpay_payment_id,
                amount: subscription.planId.price,
                currency: subscription.planId.currency,
                paymentMethod: 'razorpay',
                paymentDate: new Date(),
                status: 'success',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            });
            
            // Activate subscription
            subscription.status = 'active';
            subscription.startDate = new Date();
            subscription.endDate = new Date();
            subscription.endDate.setMonth(subscription.endDate.getMonth() + subscription.planId.duration);
            subscription.nextBillingDate = subscription.endDate;
            
            await subscription.save();
            
            // Populate plan details for response
            await subscription.populate('planId', 'name price currency billingCycle');
            
            res.json({
                success: true,
                message: 'Payment verified and subscription activated successfully',
                data: {
                    subscription,
                    planName: subscription.planId.name
                }
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error verifying payment:', error);
            res.status(500).json({
                success: false,
                message: 'Error verifying payment',
                error: error.message
            });
        }
    }
    
    /**
     * Cancel subscription
     * POST /api/subscriptions/cancel
     */
    async cancelSubscription(req, res) {
        try {
            const { reason } = req.body;
            const coachId = req.user._id;
            
            logger.info(`[SubscriptionController] Cancelling subscription for coach: ${coachId}`);
            
            const subscription = await CoachSubscription.findOne({
                coachId,
                status: { $in: ['active', 'trial'] }
            });
            
            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    message: 'No active subscription found'
                });
            }
            
            subscription.status = 'cancelled';
            subscription.cancellationDate = new Date();
            subscription.cancellationReason = reason;
            subscription.autoRenew = false;
            
            await subscription.save();
            
            res.json({
                success: true,
                message: 'Subscription cancelled successfully',
                data: subscription
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error cancelling subscription:', error);
            res.status(500).json({
                success: false,
                message: 'Error cancelling subscription',
                error: error.message
            });
        }
    }
    
    /**
     * Get subscription history
     * GET /api/subscriptions/history
     */
    async getSubscriptionHistory(req, res) {
        try {
            const coachId = req.user._id;
            const { page = 1, limit = 10 } = req.query;
            
            logger.info(`[SubscriptionController] Getting subscription history for coach: ${coachId}`);
            
            const skip = (page - 1) * limit;
            const subscriptions = await CoachSubscription.find({ coachId })
                .populate('planId', 'name price currency billingCycle')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
            
            const total = await CoachSubscription.countDocuments({ coachId });
            
            res.json({
                success: true,
                data: subscriptions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalSubscriptions: total,
                    hasNextPage: skip + subscriptions.length < total,
                    hasPrevPage: page > 1
                }
            });
            
        } catch (error) {
            logger.error('[SubscriptionController] Error getting subscription history:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting subscription history',
                error: error.message
            });
        }
    }
}

// Create controller instance and bind all methods
const controller = new SubscriptionController();

module.exports = {
    getPlans: controller.getPlans.bind(controller),
    getSelectPlanPage: controller.getSelectPlanPage.bind(controller),
    getCurrentSubscription: controller.getCurrentSubscription.bind(controller),
    createOrder: controller.createOrder.bind(controller),
    verifyPayment: controller.verifyPayment.bind(controller),
    cancelSubscription: controller.cancelSubscription.bind(controller),
    getSubscriptionHistory: controller.getSubscriptionHistory.bind(controller)
};