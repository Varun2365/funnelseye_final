// D:\PRJ_YCT_Final\setupZoomAutomation.js

/**
 * Script to set up default automation rule for Zoom meeting generation
 * Run this script after setting up Zoom integration to enable automatic Zoom link generation
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const AutomationRule = require('./schema/AutomationRule');
const User = require('./schema/User');

async function setupZoomAutomation() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database');

        // Find a coach user to set as the creator
        const coach = await User.findOne({ role: 'coach' });
        if (!coach) {
            console.log('❌ No coach found. Please create a coach user first.');
            return;
        }

        // Check if automation rule already exists
        const existingRule = await AutomationRule.findOne({ 
            name: 'Auto-Generate Zoom Links for Appointments' 
        });

        if (existingRule) {
            console.log('✅ Zoom automation rule already exists');
            return;
        }

        // Create the automation rule
        const zoomAutomationRule = new AutomationRule({
            name: 'Auto-Generate Zoom Links for Appointments',
            coachId: coach._id, // Add coachId field
            triggerEvent: 'appointment_booked',
            actions: [
                {
                    type: 'create_zoom_meeting',
                    config: {
                        // No additional config needed - uses appointment data
                    }
                }
            ],
            isActive: true,
            createdBy: coach._id
        });

        await zoomAutomationRule.save();
        console.log('✅ Zoom automation rule created successfully!');
        console.log('📋 Rule Details:');
        console.log(`   - Name: ${zoomAutomationRule.name}`);
        console.log(`   - Trigger: ${zoomAutomationRule.triggerEvent}`);
        console.log(`   - Action: ${zoomAutomationRule.actions[0].type}`);
        console.log(`   - Status: ${zoomAutomationRule.isActive ? 'Active' : 'Inactive'}`);

        console.log('\n🎯 Now when appointments are booked:');
        console.log('   1. The system will automatically create a Zoom meeting');
        console.log('   2. The Zoom link will be added to the appointment');
        console.log('   3. Leads can join using the generated link');

    } catch (error) {
        console.error('❌ Error setting up Zoom automation:', error.message);
    } finally {
 
        console.log('🔌 Disconnected from database');
    }
}

// Run the setup
if (require.main === module) {
    setupZoomAutomation();
}

module.exports = setupZoomAutomation;
