const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { WhatsAppIntegration } = require('../schema');

async function checkAndCreateIntegration() {
    try {
        await connectDB();
        
        const userId = '68a9c82a753a3d12e696ec3d';
        const userType = 'coach';
        
        console.log(`🔍 Checking WhatsApp integration for user ${userId}...`);
        
        // Check if integration exists
        let integration = await WhatsAppIntegration.findOne({
            userId,
            userType,
            integrationType: 'baileys_personal'
        });
        
        if (!integration) {
            console.log(`📝 Creating WhatsApp integration for user ${userId}...`);
            
            integration = new WhatsAppIntegration({
                userId,
                userType,
                integrationType: 'baileys_personal',
                isActive: false,
                connectionStatus: 'disconnected',
                settings: {
                    autoReconnect: true,
                    maxRetries: 3,
                    retryDelay: 5000
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            await integration.save();
            console.log(`✅ WhatsApp integration created successfully`);
        } else {
            console.log(`✅ WhatsApp integration already exists`);
        }
        
        console.log(`📊 Integration details:`, {
            id: integration._id,
            userId: integration.userId,
            userType: integration.userType,
            integrationType: integration.integrationType,
            isActive: integration.isActive,
            connectionStatus: integration.connectionStatus
        });
        
        await mongoose.connection.close();
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkAndCreateIntegration();
