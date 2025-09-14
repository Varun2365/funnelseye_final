const mongoose = require('mongoose');
const GlobalPaymentSettings = require('./schema/GlobalPaymentSettings');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/FunnelsEye', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function setupRazorpayConfig() {
    try {
        console.log('🔧 Setting up Razorpay configuration...');
        
        // Check if settings already exist
        let settings = await GlobalPaymentSettings.findOne();
        
        if (!settings) {
            console.log('📝 Creating new GlobalPaymentSettings document...');
            settings = new GlobalPaymentSettings({
                // Basic platform settings
                platformFee: {
                    percentage: 10,
                    fixedAmount: 0,
                    isPercentageBased: true
                },
                commission: {
                    directCommission: {
                        percentage: 70
                    }
                },
                payout: {
                    monthlyPayout: {
                        isEnabled: true,
                        dayOfMonth: 1,
                        minimumThreshold: 1000
                    }
                }
            });
        }
        
        // Update Razorpay configuration
        settings.razorpay = {
            keyId: 'YOUR_RAZORPAY_KEY_ID', // Replace with your actual Razorpay Key ID
            keySecret: 'YOUR_RAZORPAY_KEY_SECRET', // Replace with your actual Razorpay Key Secret
            accountNumber: undefined, // Optional: Replace with your RazorpayX account number
            isActive: true,
            webhookSecret: undefined // Optional: Replace with your webhook secret
        };
        
        await settings.save();
        
        console.log('✅ Razorpay configuration saved successfully!');
        console.log('📋 Next steps:');
        console.log('1. Replace the placeholder values in the database with your actual Razorpay credentials');
        console.log('2. Make sure you have RazorpayX enabled on your Razorpay account');
        console.log('3. Test the setup with: POST /api/paymentsv1/sending/setup-razorpay-coach/:coachId');
        
        // Show current settings (without sensitive data)
        console.log('\n📊 Current Razorpay Settings:');
        console.log(`- Key ID: ${settings.razorpay.keyId}`);
        console.log(`- Account Number: ${settings.razorpay.accountNumber}`);
        console.log(`- Is Active: ${settings.razorpay.isActive}`);
        
    } catch (error) {
        console.error('❌ Error setting up Razorpay configuration:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the setup
setupRazorpayConfig();
