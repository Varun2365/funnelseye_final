const mongoose = require('mongoose');
const { WhatsAppDevice, WhatsAppMessage, WhatsAppConversation, WhatsAppTemplate, EmailConfig } = require('./schemas');

// Test database connection
async function testDatabaseConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Test schema creation
async function testSchemaCreation() {
    try {
        // Test WhatsApp Device creation
        const testDevice = new WhatsAppDevice({
            coachId: new mongoose.Types.ObjectId(),
            deviceName: 'Test Device',
            deviceType: 'baileys',
            phoneNumber: '+1234567890',
            creditsPerMessage: 1,
            monthlyMessageLimit: 1000
        });
        
        console.log('✅ WhatsApp Device schema test passed');

        // Test WhatsApp Message creation
        const testMessage = new WhatsAppMessage({
            coachId: new mongoose.Types.ObjectId(),
            deviceId: new mongoose.Types.ObjectId(),
            direction: 'outbound',
            messageType: 'text',
            from: '+1234567890',
            to: '+0987654321',
            content: { text: 'Test message' },
            messageId: 'test_message_id',
            conversationId: 'test_conversation_id',
            status: 'sent',
            creditsUsed: 1
        });
        
        console.log('✅ WhatsApp Message schema test passed');

        // Test WhatsApp Conversation creation
        const testConversation = new WhatsAppConversation({
            coachId: new mongoose.Types.ObjectId(),
            deviceId: new mongoose.Types.ObjectId(),
            conversationId: 'test_conversation_id',
            participantPhone: '+0987654321',
            participantName: 'Test User',
            lastMessageAt: new Date(),
            lastMessageContent: 'Test message',
            lastMessageDirection: 'outbound',
            unreadCount: 0,
            totalMessages: 1,
            status: 'active'
        });
        
        console.log('✅ WhatsApp Conversation schema test passed');

        // Test WhatsApp Template creation
        const testTemplate = new WhatsAppTemplate({
            coachId: new mongoose.Types.ObjectId(),
            name: 'Test Template',
            category: 'custom',
            language: 'en',
            content: {
                body: 'Hello {{name}}, welcome to our platform!'
            },
            variables: [
                {
                    name: 'name',
                    description: 'Customer name',
                    required: true
                }
            ]
        });
        
        console.log('✅ WhatsApp Template schema test passed');

        // Test Email Config creation
        const testEmailConfig = new EmailConfig({
            coachId: new mongoose.Types.ObjectId(),
            name: 'Test Email Config',
            provider: 'gmail',
            smtp: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'test@gmail.com',
                    pass: 'test_password'
                }
            },
            from: {
                name: 'Test User',
                email: 'test@gmail.com'
            },
            dailyLimit: 1000
        });
        
        console.log('✅ Email Config schema test passed');

        return true;
    } catch (error) {
        console.error('❌ Schema creation test failed:', error.message);
        return false;
    }
}

// Test service imports
async function testServiceImports() {
    try {
        const baileysService = require('./services/baileysWhatsAppService');
        console.log('✅ Baileys WhatsApp Service imported successfully');

        const metaService = require('./services/metaWhatsAppService');
        console.log('✅ Meta WhatsApp Service imported successfully');

        const unifiedService = require('./services/unifiedWhatsAppService');
        console.log('✅ Unified WhatsApp Service imported successfully');

        const emailService = require('./services/emailService');
        console.log('✅ Email Service imported successfully');

        return true;
    } catch (error) {
        console.error('❌ Service import test failed:', error.message);
        return false;
    }
}

// Test route imports
async function testRouteImports() {
    try {
        const deviceRoutes = require('./routes/deviceRoutes');
        console.log('✅ Device Routes imported successfully');

        const messageRoutes = require('./routes/messageRoutes');
        console.log('✅ Message Routes imported successfully');

        const templateRoutes = require('./routes/templateRoutes');
        console.log('✅ Template Routes imported successfully');

        const emailRoutes = require('./routes/emailRoutes');
        console.log('✅ Email Routes imported successfully');

        const webhookRoutes = require('./routes/webhookRoutes');
        console.log('✅ Webhook Routes imported successfully');

        const mainRoutes = require('./routes');
        console.log('✅ Main Routes imported successfully');

        return true;
    } catch (error) {
        console.error('❌ Route import test failed:', error.message);
        return false;
    }
}

// Test controller imports
async function testControllerImports() {
    try {
        const deviceController = require('./controllers/deviceController');
        console.log('✅ Device Controller imported successfully');

        const messageController = require('./controllers/messageController');
        console.log('✅ Message Controller imported successfully');

        const templateController = require('./controllers/templateController');
        console.log('✅ Template Controller imported successfully');

        const emailController = require('./controllers/emailController');
        console.log('✅ Email Controller imported successfully');

        const webhookController = require('./controllers/webhookController');
        console.log('✅ Webhook Controller imported successfully');

        return true;
    } catch (error) {
        console.error('❌ Controller import test failed:', error.message);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Starting WhatsApp Microservice Tests...\n');

    const tests = [
        { name: 'Database Connection', fn: testDatabaseConnection },
        { name: 'Schema Creation', fn: testSchemaCreation },
        { name: 'Service Imports', fn: testServiceImports },
        { name: 'Route Imports', fn: testRouteImports },
        { name: 'Controller Imports', fn: testControllerImports }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
        console.log(`📋 Running ${test.name} test...`);
        const result = await test.fn();
        if (result) {
            passedTests++;
        }
        console.log('');
    }

    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed! WhatsApp microservice is ready to use.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }

    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };
