// D:\PRJ_YCT_Final\updateExistingAppointments.js

/**
 * Script to update existing appointments to include appointmentType field
 * Run this after updating the Appointment schema to ensure all existing appointments work with Zoom integration
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Appointment = require('./schema/Appointment');

async function updateExistingAppointments() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database');

        // Find appointments without appointmentType field
        const appointmentsToUpdate = await Appointment.find({
            $or: [
                { appointmentType: { $exists: false } },
                { appointmentType: null }
            ]
        });

        console.log(`📊 Found ${appointmentsToUpdate.length} appointments without appointmentType field`);

        if (appointmentsToUpdate.length === 0) {
            console.log('✅ All appointments already have appointmentType field');
            return;
        }

        // Update all appointments to have appointmentType: 'online'
        const updateResult = await Appointment.updateMany(
            {
                $or: [
                    { appointmentType: { $exists: false } },
                    { appointmentType: null }
                ]
            },
            {
                $set: { appointmentType: 'online' }
            }
        );

        console.log(`✅ Successfully updated ${updateResult.modifiedCount} appointments`);
        console.log('🎯 All appointments now have appointmentType: "online"');

        // Verify the update
        const remainingAppointments = await Appointment.find({
            $or: [
                { appointmentType: { $exists: false } },
                { appointmentType: null }
            ]
        });

        if (remainingAppointments.length === 0) {
            console.log('✅ Verification successful: All appointments now have appointmentType field');
        } else {
            console.log(`⚠️  Warning: ${remainingAppointments.length} appointments still missing appointmentType field`);
        }

        console.log('\n🎉 Now you can test Zoom integration with existing appointments!');

    } catch (error) {
        console.error('❌ Error updating appointments:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
}

// Run the update
if (require.main === module) {
    updateExistingAppointments();
}

module.exports = updateExistingAppointments;
