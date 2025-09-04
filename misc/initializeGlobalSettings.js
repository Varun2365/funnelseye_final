// misc/initializeGlobalSettings.js
// Script to initialize global system settings with default values

const mongoose = require('mongoose');
const AdminSystemSettings = require('../schema/AdminSystemSettings');
require('dotenv').config();

const initializeGlobalSettings = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye';
        await mongoose.connect(mongoURI, {
            maxPoolSize: 10,
            socketTimeoutMS: 0,
            connectTimeoutMS: 30000,
            serverSelectionTimeoutMS: 30000,
            heartbeatFrequencyMS: 10000
        });

        console.log('✅ Connected to MongoDB');

        // Check if settings already exist
        const existingSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
        
        if (existingSettings) {
            console.log('⚠️ Global settings already exist. Updating with new fields...');
            
            // Update existing settings with any new fields
            const defaultSettings = new AdminSystemSettings({ settingId: 'global' });
            const defaultObj = defaultSettings.toObject();
            
            // Merge new fields into existing settings
            let hasUpdates = false;
            for (const [key, value] of Object.entries(defaultObj)) {
                if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
                    if (!existingSettings[key] || JSON.stringify(existingSettings[key]) !== JSON.stringify(value)) {
                        existingSettings[key] = value;
                        hasUpdates = true;
                    }
                }
            }
            
            if (hasUpdates) {
                existingSettings.systemStatus.lastUpdated = new Date();
                await existingSettings.save();
                console.log('✅ Updated existing global settings with new fields');
            } else {
                console.log('✅ Global settings are already up to date');
            }
        } else {
            // Create new settings
            const globalSettings = new AdminSystemSettings({
                settingId: 'global',
                systemStatus: {
                    isActive: true,
                    lastUpdated: new Date(),
                    version: '1.0.0',
                    maintenanceMode: false,
                    maintenanceMessage: ''
                }
            });

            await globalSettings.save();
            console.log('✅ Created new global settings');
        }

        // Display summary
        const settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        console.log('\n📊 Global Settings Summary:');
        console.log('============================');
        console.log(`Platform: ${settings.platformConfig.platformName} v${settings.platformConfig.platformVersion}`);
        console.log(`Environment: ${settings.platformConfig.environment}`);
        console.log(`Maintenance Mode: ${settings.platformConfig.maintenanceMode ? 'ON' : 'OFF'}`);
        console.log(`Max Users: ${settings.platformConfig.maxUsers.toLocaleString()}`);
        console.log(`Max Coaches: ${settings.platformConfig.maxCoaches.toLocaleString()}`);
        console.log(`Max Leads: ${settings.platformConfig.maxLeads.toLocaleString()}`);
        console.log(`System Timezone: ${settings.platformConfig.systemTimezone}`);
        console.log(`Debug Mode: ${settings.platformConfig.debugMode ? 'ON' : 'OFF'}`);
        console.log(`Log Level: ${settings.platformConfig.logLevel}`);
        
        console.log('\n🔧 Features Status:');
        console.log('===================');
        // console.log(`WhatsApp: ${settings.whatsApp.isEnabled ? '✅ Enabled' : '❌ Disabled'}`); // WhatsApp functionality moved to dustbin/whatsapp-dump/
        console.log(`Zoom: ${settings.integrations.zoom.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`Calendar: ${settings.integrations.calendar.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`RabbitMQ: ${settings.integrations.rabbitmq.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`Meta Ads: ${settings.integrations.metaAds.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`OpenAI: ${settings.aiServices.openai.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`OpenRouter: ${settings.aiServices.openrouter.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`Email: ${settings.notifications.email.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`SMS: ${settings.notifications.sms.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`Push: ${settings.notifications.push.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        
        console.log('\n💰 Payment System:');
        console.log('==================');
        console.log(`Default Platform Fee: ${settings.paymentSystem.platformFees.defaultPercentage}%`);
        console.log(`Minimum Amount: $${settings.paymentSystem.platformFees.minimumAmount}`);
        console.log(`Payout Frequency: ${settings.paymentSystem.payoutSettings.frequency}`);
        console.log(`Minimum Payout: $${settings.paymentSystem.payoutSettings.minimumPayoutAmount}`);
        console.log(`Maximum Payout: $${settings.paymentSystem.payoutSettings.maximumPayoutAmount}`);
        
        console.log('\n🔒 Security Settings:');
        console.log('=====================');
        console.log(`Password Min Length: ${settings.security.passwordPolicy.minLength}`);
        console.log(`Max Login Attempts: ${settings.security.passwordPolicy.maxLoginAttempts}`);
        console.log(`Session Timeout: ${settings.security.sessionSettings.sessionTimeout} hours`);
        console.log(`Rate Limit (per minute): ${settings.security.apiSecurity.rateLimitPerMinute}`);
        
        console.log('\n📈 MLM System:');
        console.log('==============');
        console.log(`Max Downline Levels: ${settings.mlmSystem.maxDownlineLevels}`);
        console.log(`Level 1 Commission: ${settings.paymentSystem.mlmCommissionStructure.level1}%`);
        console.log(`Level 2 Commission: ${settings.paymentSystem.mlmCommissionStructure.level2}%`);
        console.log(`Level 3 Commission: ${settings.paymentSystem.mlmCommissionStructure.level3}%`);
        
        console.log('\n🎯 Lead Management:');
        console.log('===================');
        console.log(`Hot Lead Threshold: ${settings.leadManagement.temperatureThresholds.hot.minScore}%`);
        console.log(`Warm Lead Threshold: ${settings.leadManagement.temperatureThresholds.warm.minScore}%`);
        console.log(`Max Sequence Length: ${settings.leadManagement.nurturingSettings.maxSequenceLength}`);
        
        console.log('\n👨‍💼 Coach Availability:');
        console.log('========================');
        console.log(`Default Duration: ${settings.coachAvailability.defaultAppointmentDuration} minutes`);
        console.log(`Buffer Time: ${settings.coachAvailability.defaultBufferTime} minutes`);
        console.log(`Max Advance Booking: ${settings.coachAvailability.maxAdvanceBooking} days`);
        console.log(`Min Advance Booking: ${settings.coachAvailability.minAdvanceBooking} hours`);
        
        console.log('\n📱 CORS Configuration:');
        console.log('======================');
        console.log(`Allowed Origins: ${settings.corsConfig.allowedOrigins.length} configured`);
        console.log(`Allowed Methods: ${settings.corsConfig.allowedMethods.join(', ')}`);
        console.log(`Credentials: ${settings.corsConfig.credentials ? 'Enabled' : 'Disabled'}`);
        console.log(`Max Age: ${settings.corsConfig.maxAge} seconds`);
        
        console.log('\n✅ Global settings initialization completed successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing global settings:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Run the initialization
if (require.main === module) {
    initializeGlobalSettings()
        .then(() => {
            console.log('🎉 Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script failed:', error);
            process.exit(1);
        });
}

module.exports = initializeGlobalSettings;
