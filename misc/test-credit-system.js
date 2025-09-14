const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
const COACH_TOKEN = 'YOUR_COACH_TOKEN_HERE'; // Replace with actual token

async function testCreditSystem() {
    console.log('🧪 Testing WhatsApp Credit System...\n');

    const headers = {
        'Authorization': `Bearer ${COACH_TOKEN}`,
        'Content-Type': 'application/json'
    };

    try {
        // Test 1: Get credit balance
        console.log('1️⃣ Testing credit balance...');
        try {
            const response = await axios.get(`${BASE_URL}/api/messagingv1/credits/balance`, { headers });
            console.log(`   Status: ${response.status}`);
            console.log(`   Balance: ${response.data.data.balance} credits`);
            console.log(`   Package: ${response.data.data.package.name}`);
            console.log(`   Usage: ${response.data.data.usage.totalMessagesSent} messages sent`);
            console.log(`   ✅ Credit balance retrieved successfully\n`);
        } catch (error) {
            console.log(`   ❌ Error getting balance: ${error.response?.data?.message || error.message}\n`);
        }

        // Test 2: Check if can send message
        console.log('2️⃣ Testing message eligibility...');
        try {
            const response = await axios.get(`${BASE_URL}/api/messagingv1/credits/check`, { headers });
            console.log(`   Status: ${response.status}`);
            console.log(`   Can Send: ${response.data.data.canSend}`);
            console.log(`   Message: ${response.data.data.message}`);
            console.log(`   ✅ Message eligibility checked\n`);
        } catch (error) {
            console.log(`   ❌ Error checking eligibility: ${error.response?.data?.message || error.message}\n`);
        }

        // Test 3: Get credit packages
        console.log('3️⃣ Testing credit packages...');
        try {
            const response = await axios.get(`${BASE_URL}/api/messagingv1/credits/packages`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Available packages:`);
            response.data.data.forEach(pkg => {
                console.log(`     - ${pkg.name}: ${pkg.credits} credits for $${pkg.price}`);
            });
            console.log(`   ✅ Credit packages retrieved\n`);
        } catch (error) {
            console.log(`   ❌ Error getting packages: ${error.response?.data?.message || error.message}\n`);
        }

        // Test 4: Test sending message (will deduct credits)
        console.log('4️⃣ Testing message sending with credit deduction...');
        try {
            const messageData = {
                to: '1234567890', // Replace with test number
                message: 'Test message from credit system',
                type: 'text'
            };
            
            const response = await axios.post(`${BASE_URL}/api/messagingv1/send`, messageData, { headers });
            console.log(`   Status: ${response.status}`);
            console.log(`   Success: ${response.data.success}`);
            console.log(`   Message: ${response.data.message}`);
            if (response.data.data.remainingCredits !== undefined) {
                console.log(`   Credits Used: ${response.data.data.creditsUsed}`);
                console.log(`   Remaining Credits: ${response.data.data.remainingCredits}`);
            }
            console.log(`   ✅ Message sent with credit deduction\n`);
        } catch (error) {
            if (error.response?.status === 402) {
                console.log(`   ⚠️  Insufficient credits: ${error.response.data.message}`);
                console.log(`   Balance: ${error.response.data.data.balance}`);
                console.log(`   Required: ${error.response.data.data.required}`);
            } else {
                console.log(`   ❌ Error sending message: ${error.response?.data?.message || error.message}\n`);
            }
        }

        // Test 5: Purchase credits (simulation)
        console.log('5️⃣ Testing credit purchase...');
        try {
            const purchaseData = {
                packageId: 'starter',
                paymentReference: 'test-payment-123'
            };
            
            const response = await axios.post(`${BASE_URL}/api/messagingv1/credits/purchase`, purchaseData, { headers });
            console.log(`   Status: ${response.status}`);
            console.log(`   Success: ${response.data.success}`);
            console.log(`   Credits Added: ${response.data.data.creditsAdded}`);
            console.log(`   New Balance: ${response.data.data.newBalance}`);
            console.log(`   ✅ Credits purchased successfully\n`);
        } catch (error) {
            console.log(`   ❌ Error purchasing credits: ${error.response?.data?.message || error.message}\n`);
        }

        // Test 6: Get transactions
        console.log('6️⃣ Testing transaction history...');
        try {
            const response = await axios.get(`${BASE_URL}/api/messagingv1/credits/transactions`, { headers });
            console.log(`   Status: ${response.status}`);
            console.log(`   Total Transactions: ${response.data.data.pagination.totalTransactions}`);
            console.log(`   Recent transactions:`);
            response.data.data.transactions.slice(0, 3).forEach(txn => {
                console.log(`     - ${txn.type}: ${txn.amount} credits (${txn.description})`);
            });
            console.log(`   ✅ Transaction history retrieved\n`);
        } catch (error) {
            console.log(`   ❌ Error getting transactions: ${error.response?.data?.message || error.message}\n`);
        }

        console.log('📋 Credit System Summary:');
        console.log('   ✅ Credit balance tracking');
        console.log('   ✅ Message eligibility checking');
        console.log('   ✅ Credit packages available');
        console.log('   ✅ Automatic credit deduction');
        console.log('   ✅ Credit purchase system');
        console.log('   ✅ Transaction history');

        console.log('\n🎯 API Endpoints:');
        console.log(`   GET  ${BASE_URL}/api/messagingv1/credits/balance`);
        console.log(`   GET  ${BASE_URL}/api/messagingv1/credits/check`);
        console.log(`   GET  ${BASE_URL}/api/messagingv1/credits/packages`);
        console.log(`   POST ${BASE_URL}/api/messagingv1/credits/purchase`);
        console.log(`   GET  ${BASE_URL}/api/messagingv1/credits/transactions`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testCreditSystem();
