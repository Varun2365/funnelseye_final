/**
 * Unified Payment Gateway Test Examples
 * This file demonstrates how to integrate with the unified payment gateway
 */

// ============================================================================
// EXAMPLE 1: INITIALIZE PAYMENT FOR COACH PLAN PURCHASE
// ============================================================================

async function testCoachPlanPurchase() {
    console.log('🚀 Testing Coach Plan Purchase Payment...');
    
    try {
        const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentType: 'coach_plan_purchase',
                amount: 99.99,
                currency: 'USD',
                customerId: 'lead_123456',
                coachId: 'coach_789',
                planId: 'plan_premium_fitness',
                description: 'Premium Fitness Coaching Plan - 3 Months',
                redirectUrl: 'https://funnelseye.com/payment-success',
                metadata: {
                    category: 'fitness_training',
                    planType: 'premium',
                    duration: '3_months',
                    includesConsultation: true
                }
            })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Payment initialized successfully!');
            console.log('Transaction ID:', data.data.transactionId);
            console.log('Payment Page URL:', data.data.paymentPageUrl);
            console.log('Platform Fee:', data.data.platformFee);
            console.log('Net Amount:', data.data.netAmount);
            
            // In a real application, redirect to payment page
            // window.location.href = data.data.paymentPageUrl;
            
            return data.data;
        } else {
            console.error('❌ Failed to initialize payment:', data.message);
        }
    } catch (error) {
        console.error('❌ Error initializing payment:', error);
    }
}

// ============================================================================
// EXAMPLE 2: INITIALIZE PLATFORM SUBSCRIPTION PAYMENT
// ============================================================================

async function testPlatformSubscription() {
    console.log('🚀 Testing Platform Subscription Payment...');
    
    try {
        const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentType: 'platform_subscription',
                amount: 29.99,
                currency: 'USD',
                customerId: 'coach_456',
                coachId: 'coach_456',
                description: 'FunnelsEye Pro Monthly Subscription',
                redirectUrl: 'https://funnelseye.com/dashboard',
                metadata: {
                    planType: 'pro',
                    billingCycle: 'monthly',
                    features: ['unlimited_leads', 'advanced_analytics', 'priority_support']
                }
            })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Platform subscription payment initialized!');
            console.log('Transaction ID:', data.data.transactionId);
            console.log('Amount:', data.data.amount);
            console.log('Platform Fee:', data.data.platformFee);
            
            return data.data;
        } else {
            console.error('❌ Failed to initialize platform subscription:', data.message);
        }
    } catch (error) {
        console.error('❌ Error initializing platform subscription:', error);
    }
}

// ============================================================================
// EXAMPLE 3: INITIALIZE CONSULTATION BOOKING PAYMENT
// ============================================================================

async function testConsultationBooking() {
    console.log('🚀 Testing Consultation Booking Payment...');
    
    try {
        const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentType: 'consultation_booking',
                amount: 150.00,
                currency: 'USD',
                customerId: 'lead_789',
                coachId: 'coach_123',
                description: '1-Hour Personal Fitness Consultation',
                redirectUrl: 'https://funnelseye.com/consultation-confirmed',
                metadata: {
                    consultationId: 'consult_456',
                    duration: '60_minutes',
                    consultationType: 'fitness_assessment',
                    scheduledDate: '2024-01-20T14:00:00Z'
                }
            })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Consultation booking payment initialized!');
            console.log('Transaction ID:', data.data.transactionId);
            console.log('Amount:', data.data.amount);
            console.log('Description:', data.data.description);
            
            return data.data;
        } else {
            console.error('❌ Failed to initialize consultation booking:', data.message);
        }
    } catch (error) {
        console.error('❌ Error initializing consultation booking:', error);
    }
}

// ============================================================================
// EXAMPLE 4: CHECK PAYMENT STATUS
// ============================================================================

async function checkPaymentStatus(transactionId) {
    console.log(`🔍 Checking payment status for: ${transactionId}`);
    
    try {
        const response = await fetch(`/api/payments/status/${transactionId}`);
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Payment status retrieved successfully!');
            console.log('Status:', data.data.status);
            console.log('Amount:', data.data.amount);
            console.log('Currency:', data.data.currency);
            console.log('Expires At:', data.data.expiresAt);
            
            return data.data;
        } else {
            console.error('❌ Failed to get payment status:', data.message);
        }
    } catch (error) {
        console.error('❌ Error checking payment status:', error);
    }
}

// ============================================================================
// EXAMPLE 5: GET SUPPORTED PAYMENT TYPES
// ============================================================================

async function getSupportedPaymentTypes() {
    console.log('🔍 Getting supported payment types...');
    
    try {
        const response = await fetch('/api/payments/supported-types');
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Supported payment types retrieved!');
            console.log('Available types:', data.data.paymentTypes.length);
            
            data.data.paymentTypes.forEach(type => {
                console.log(`- ${type.type}: ${type.description}`);
                console.log(`  Required fields: ${type.requiresFields.join(', ')}`);
            });
            
            return data.data;
        } else {
            console.error('❌ Failed to get supported payment types:', data.message);
        }
    } catch (error) {
        console.error('❌ Error getting supported payment types:', error);
    }
}

// ============================================================================
// EXAMPLE 6: GET PAYMENT GATEWAY INFO
// ============================================================================

async function getPaymentGatewayInfo() {
    console.log('🔍 Getting payment gateway information...');
    
    try {
        const response = await fetch('/api/payments/gateways');
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Payment gateway info retrieved!');
            console.log('Available gateways:', data.data.availableGateways);
            console.log('Default gateway:', data.data.defaultGateway);
            console.log('Supported currencies:', data.data.supportedCurrencies);
            console.log('Payment methods:', data.data.supportedPaymentMethods);
            
            return data.data;
        } else {
            console.error('❌ Failed to get payment gateway info:', data.message);
        }
    } catch (error) {
        console.error('❌ Error getting payment gateway info:', error);
    }
}

// ============================================================================
// EXAMPLE 7: PROCESS AUTOMATIC PAYOUTS (ADMIN ONLY)
// ============================================================================

async function processAutomaticPayouts() {
    console.log('🚀 Processing automatic payouts...');
    
    try {
        const response = await fetch('/api/payments/payouts/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_ADMIN_TOKEN' // Replace with actual token
            },
            body: JSON.stringify({
                payoutType: 'commission',
                period: 'current'
            })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Automatic payouts processed successfully!');
            console.log('Total payouts:', data.data.totalPayouts);
            console.log('Total amount:', data.data.totalAmount);
            
            return data.data;
        } else {
            console.error('❌ Failed to process automatic payouts:', data.message);
        }
    } catch (error) {
        console.error('❌ Error processing automatic payouts:', error);
    }
}

// ============================================================================
// EXAMPLE 8: GET PAYOUT ANALYTICS (ADMIN ONLY)
// ============================================================================

async function getPayoutAnalytics() {
    console.log('🔍 Getting payout analytics...');
    
    try {
        const response = await fetch('/api/payments/payouts/analytics?period=current', {
            headers: {
                'Authorization': 'Bearer YOUR_ADMIN_TOKEN' // Replace with actual token
            }
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Payout analytics retrieved!');
            console.log('Period:', data.data.period);
            console.log('Total payouts:', data.data.summary.totalPayouts);
            console.log('Total amount:', data.data.summary.totalAmount);
            console.log('Successful payouts:', data.data.summary.successfulPayouts);
            console.log('Failed payouts:', data.data.summary.failedPayouts);
            
            return data.data;
        } else {
            console.error('❌ Failed to get payout analytics:', data.message);
        }
    } catch (error) {
        console.error('❌ Error getting payout analytics:', error);
    }
}

// ============================================================================
// EXAMPLE 9: COMPLETE PAYMENT FLOW SIMULATION
// ============================================================================

async function simulateCompletePaymentFlow() {
    console.log('🎭 Simulating complete payment flow...');
    
    try {
        // Step 1: Initialize payment
        const paymentData = await testCoachPlanPurchase();
        if (!paymentData) {
            console.error('❌ Payment initialization failed');
            return;
        }
        
        // Step 2: Check payment status
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        await checkPaymentStatus(paymentData.transactionId);
        
        // Step 3: Simulate payment confirmation (in real app, this comes from payment gateway)
        console.log('💳 Simulating payment confirmation...');
        
        const confirmResponse = await fetch('/api/payments/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transactionId: paymentData.transactionId,
                paymentGateway: 'stripe',
                gatewayTransactionId: 'txn_simulated_' + Date.now(),
                paymentStatus: 'successful',
                gatewayResponse: {
                    status: 'succeeded',
                    amount: Math.round(paymentData.amount * 100), // Convert to cents
                    currency: paymentData.currency.toLowerCase()
                }
            })
        });

        const confirmData = await confirmResponse.json();
        
        if (confirmData.success) {
            console.log('✅ Payment confirmed successfully!');
            console.log('Central Payment ID:', confirmData.data.centralPaymentId);
            
            // Step 4: Check final payment status
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            await checkPaymentStatus(paymentData.transactionId);
            
        } else {
            console.error('❌ Payment confirmation failed:', confirmData.message);
        }
        
    } catch (error) {
        console.error('❌ Error in complete payment flow simulation:', error);
    }
}

// ============================================================================
// EXAMPLE 10: FRONTEND INTEGRATION HELPER FUNCTIONS
// ============================================================================

// Helper function to create payment button
function createPaymentButton(paymentData, buttonText = 'Pay Now') {
    const button = document.createElement('button');
    button.textContent = buttonText;
    button.className = 'payment-button';
    button.onclick = () => {
        // Redirect to payment page
        window.location.href = paymentData.paymentPageUrl;
    };
    
    return button;
}

// Helper function to display payment details
function displayPaymentDetails(paymentData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="payment-summary">
            <h3>Payment Summary</h3>
            <div class="payment-row">
                <span>Amount:</span>
                <span>${paymentData.currency} ${paymentData.amount}</span>
            </div>
            <div class="payment-row">
                <span>Platform Fee:</span>
                <span>${paymentData.currency} ${paymentData.platformFee}</span>
            </div>
            <div class="payment-row total">
                <span>Total:</span>
                <span>${paymentData.currency} ${paymentData.totalAmount}</span>
            </div>
            <div class="payment-row">
                <span>Description:</span>
                <span>${paymentData.description}</span>
            </div>
        </div>
    `;
}

// Helper function to handle payment success
function handlePaymentSuccess(transactionId) {
    console.log('🎉 Payment successful! Transaction ID:', transactionId);
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <h3>Payment Successful!</h3>
        <p>Your payment has been processed successfully.</p>
        <p>Transaction ID: ${transactionId}</p>
        <p>You will receive a confirmation email shortly.</p>
    `;
    
    document.body.appendChild(successMessage);
    
    // Redirect after 3 seconds
    setTimeout(() => {
        window.location.href = '/dashboard';
    }, 3000);
}

// Helper function to handle payment failure
function handlePaymentFailure(error) {
    console.error('💥 Payment failed:', error);
    
    // Show error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
        <h3>Payment Failed</h3>
        <p>Sorry, your payment could not be processed.</p>
        <p>Error: ${error.message || 'Unknown error'}</p>
        <p>Please try again or contact support.</p>
    `;
    
    document.body.appendChild(errorMessage);
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runAllTests() {
    console.log('🧪 Starting Unified Payment Gateway Tests...\n');
    
    // Test basic functionality
    await getSupportedPaymentTypes();
    console.log('');
    
    await getPaymentGatewayInfo();
    console.log('');
    
    // Test payment initialization
    await testCoachPlanPurchase();
    console.log('');
    
    await testPlatformSubscription();
    console.log('');
    
    await testConsultationBooking();
    console.log('');
    
    // Test complete flow
    await simulateCompletePaymentFlow();
    console.log('');
    
    console.log('✅ All tests completed!');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testCoachPlanPurchase,
        testPlatformSubscription,
        testConsultationBooking,
        checkPaymentStatus,
        getSupportedPaymentTypes,
        getPaymentGatewayInfo,
        processAutomaticPayouts,
        getPayoutAnalytics,
        simulateCompletePaymentFlow,
        createPaymentButton,
        displayPaymentDetails,
        handlePaymentSuccess,
        handlePaymentFailure,
        runAllTests
    };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    runAllTests().catch(console.error);
} else {
    // Browser environment
    console.log('🌐 Unified Payment Gateway Test Examples loaded in browser');
    console.log('Use the exported functions to test the payment gateway');
}
