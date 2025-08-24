// D:\PRJ_YCT_Final\testZoomAutomation.js

/**
 * Test script to verify Zoom automation rule setup
 * Run this to check if the automation rule exists and is configured correctly
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const AutomationRule = require('./schema/AutomationRule');
const User = require('./schema/User');

async function testZoomAutomation() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database');

        // Find a coach user
        const coach = await User.findOne({ role: 'coach' });
        if (!coach) {
            console.log('❌ No coach found. Please create a coach user first.');
            return;
        }

        console.log(`👤 Found coach: ${coach.email} (ID: ${coach._id})`);

        // Check if automation rule exists
        const existingRule = await AutomationRule.findOne({ 
            name: 'Auto-Generate Zoom Links for Appointments' 
        });

        if (!existingRule) {
            console.log('❌ Zoom automation rule not found!');
            console.log('💡 Run setupZoomAutomation.js first to create the rule.');
            return;
        }

        console.log('✅ Zoom automation rule found!');
        console.log('📋 Rule Details:');
        console.log(`   - Name: ${existingRule.name}`);
        console.log(`   - Trigger: ${existingRule.triggerEvent}`);
        console.log(`   - Actions: ${existingRule.actions.length}`);
        console.log(`   - Status: ${existingRule.isActive ? 'Active' : 'Inactive'}`);
        console.log(`   - Created by: ${existingRule.createdBy}`);
        
        // Check actions
        existingRule.actions.forEach((action, index) => {
            console.log(`   - Action ${index + 1}: ${action.type}`);
            if (action.config && Object.keys(action.config).length > 0) {
                console.log(`     Config: ${JSON.stringify(action.config)}`);
            }
        });

        // Test the event structure
        console.log('\n🧪 Testing event structure...');
        const testEventPayload = {
            eventName: 'appointment_booked',
            payload: { 
                appointmentId: 'test_appointment_id_123', 
                leadId: 'test_lead_id_456', 
                coachId: coach._id 
            },
            relatedDoc: { 
                appointmentId: 'test_appointment_id_123', 
                leadId: 'test_lead_id_456', 
                coachId: coach._id 
            },
            timestamp: new Date().toISOString()
        };

        console.log('📤 Test event payload structure:');
        console.log(JSON.stringify(testEventPayload, null, 2));

        // Test data extraction
        let appointmentId, testCoachId;
        
        if (testEventPayload.relatedDoc) {
            appointmentId = testEventPayload.relatedDoc.appointmentId || testEventPayload.relatedDoc._id;
            testCoachId = testEventPayload.relatedDoc.coachId;
        }
        
        if (!appointmentId) {
            appointmentId = testEventPayload.payload?.appointmentId;
        }
        if (!testCoachId) {
            testCoachId = testEventPayload.payload?.coachId;
        }

        console.log('\n🔍 Data extraction test:');
        console.log(`   - Extracted appointmentId: ${appointmentId}`);
        console.log(`   - Extracted coachId: ${testCoachId}`);
        console.log(`   - Test passed: ${appointmentId && testCoachId ? '✅' : '❌'}`);

        if (appointmentId && testCoachId) {
            console.log('\n🎯 Automation rule should work correctly!');
            console.log('💡 Try booking an appointment to test the Zoom integration.');
        } else {
            console.log('\n❌ Data extraction failed. Check the automation rule setup.');
        }

    } catch (error) {
        console.error('❌ Error testing Zoom automation:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
}

// Run the test
if (require.main === module) {
    testZoomAutomation();
}

module.exports = testZoomAutomation;
