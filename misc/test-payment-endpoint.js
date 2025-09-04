const axios = require('axios');

// Test the payment endpoint
async function testPaymentEndpoint() {
    try {
        console.log('🧪 Testing payment endpoint...');
        
        const testPaymentData = {
            sourceType: 'coach_plan_purchase',
            customerId: '507f1f77bcf86cd799439011', // Mock ObjectId
            coachId: '507f1f77bcf86cd799439012', // Mock ObjectId
            planId: '507f1f77bcf86cd799439013', // Mock ObjectId
            amount: 99.99,
            currency: 'USD',
            billingCycle: 'one_time',
            planType: 'fitness_training'
        };

        console.log('📤 Sending test payment request...');
        console.log('Request data:', JSON.stringify(testPaymentData, null, 2));

        const response = await axios.post('http://localhost:3000/api/payments', testPaymentData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('\n✅ Payment endpoint working!');
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));

        if (response.data.success && response.data.data.transactionId) {
            console.log('\n🔗 Payment URL:', `http://localhost:3000/api/payments/process/${response.data.data.transactionId}`);
        }

    } catch (error) {
        console.error('\n❌ Payment endpoint test failed:');
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        
        console.log('\n💡 Troubleshooting tips:');
        console.log('1. Make sure the server is running on port 3000');
        console.log('2. Make sure you have run test-payment-system.js first');
        console.log('3. Check that AdminSystemSettings exists in the database');
        console.log('4. Verify all routes are properly mounted in main.js');
    }
}

// Run the test
testPaymentEndpoint();
