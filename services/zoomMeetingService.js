// D:\PRJ_YCT_Final\services\zoomMeetingService.js

const axios = require('axios');
const ZoomIntegration = require('../schema/ZoomIntegration');
const Appointment = require('../schema/Appointment');

/**
 * Zoom Meeting Service
 * Handles automatic Zoom meeting creation for appointments
 */

class ZoomMeetingService {
    /**
     * Create Zoom meeting for an appointment using assignee's credentials
     * @param {String} appointmentId - Appointment ID
     * @param {String} userId - User ID (coach or staff) whose Zoom credentials to use
     * @returns {Object} - Zoom meeting details
     */
    async createMeetingForAppointment(appointmentId, userId) {
        try {
            const appointment = await Appointment.findById(appointmentId)
                .populate('leadId', 'name email')
                .populate('coachId', 'name email');

            if (!appointment) {
                throw new Error('Appointment not found');
            }

            // Get Zoom integration for the user
            const zoomIntegration = await ZoomIntegration.findOne({ 
                userId: userId,
                isActive: true
            });

            if (!zoomIntegration) {
                throw new Error('Zoom integration not found for this user');
            }

            // Check if access token is expired
            if (new Date() >= zoomIntegration.expiresAt) {
                // Attempt to refresh token
                await this.refreshAccessToken(zoomIntegration);
            }

            // Prepare meeting data
            const meetingData = {
                topic: appointment.summary || `Appointment with ${appointment.leadId.name}`,
                type: 2, // Scheduled meeting
                start_time: appointment.startTime.toISOString(),
                duration: appointment.duration,
                timezone: appointment.timeZone || 'Asia/Kolkata',
                agenda: appointment.notes || `Meeting with ${appointment.leadId.name}`,
                settings: {
                    host_video: true,
                    participant_video: true,
                    join_before_host: true,
                    mute_upon_entry: false,
                    watermark: false,
                    use_pmi: false,
                    approval_type: 0, // Automatically approve
                    audio: 'both',
                    auto_recording: 'none',
                    waiting_room: true
                }
            };

            // Create meeting via Zoom API
            const response = await axios.post(
                'https://api.zoom.us/v2/users/me/meetings',
                meetingData,
                {
                    headers: {
                        'Authorization': `Bearer ${zoomIntegration.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const meetingDetails = response.data;

            // Update appointment with Zoom meeting details
            appointment.zoomMeeting = {
                meetingId: meetingDetails.id.toString(),
                joinUrl: meetingDetails.join_url,
                startUrl: meetingDetails.start_url,
                password: meetingDetails.password,
                createdAt: new Date()
            };

            // Set meeting host permissions for staff
            if (appointment.assignedStaffId) {
                appointment.meetingHostPermissions = {
                    hasHostAccess: true,
                    canStartMeeting: true,
                    canManageParticipants: true,
                    canShareScreen: true,
                    canRecordMeeting: true,
                    transferredFromCoach: userId.toString() !== appointment.assignedStaffId.toString(),
                    originalCoachId: appointment.coachId
                };
            }

            await appointment.save();

            console.log(`[Zoom] Meeting created for appointment ${appointmentId} using ${userId}'s credentials`);

            return {
                success: true,
                meetingDetails: {
                    meetingId: meetingDetails.id,
                    joinUrl: meetingDetails.join_url,
                    startUrl: meetingDetails.start_url,
                    password: meetingDetails.password,
                    startTime: meetingDetails.start_time,
                    duration: meetingDetails.duration
                }
            };
        } catch (error) {
            console.error('[Zoom] Error creating meeting:', error.message);
            if (error.response) {
                console.error('[Zoom] API Error:', error.response.data);
            }
            
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Refresh Zoom access token
     * @param {Object} zoomIntegration - Zoom integration document
     */
    async refreshAccessToken(zoomIntegration) {
        try {
            const response = await axios.post(
                'https://zoom.us/oauth/token',
                null,
                {
                    params: {
                        grant_type: 'refresh_token',
                        refresh_token: zoomIntegration.refreshToken
                    },
                    auth: {
                        username: process.env.ZOOM_CLIENT_ID,
                        password: process.env.ZOOM_CLIENT_SECRET
                    }
                }
            );

            const { access_token, refresh_token, expires_in } = response.data;

            // Update integration with new tokens
            zoomIntegration.accessToken = access_token;
            zoomIntegration.refreshToken = refresh_token;
            zoomIntegration.expiresAt = new Date(Date.now() + expires_in * 1000);
            await zoomIntegration.save();

            console.log(`[Zoom] Access token refreshed for user ${zoomIntegration.userId}`);
        } catch (error) {
            console.error('[Zoom] Error refreshing token:', error.message);
            throw new Error('Failed to refresh Zoom access token');
        }
    }

    /**
     * Check if user has valid Zoom integration
     * @param {String} userId - User ID
     * @returns {Boolean} - Whether user has valid Zoom credentials
     */
    async hasValidZoomIntegration(userId) {
        try {
            const zoomIntegration = await ZoomIntegration.findOne({ 
                userId: userId,
                isActive: true
            });

            if (!zoomIntegration) {
                return false;
            }

            // Check if token is expired
            if (new Date() >= zoomIntegration.expiresAt) {
                // Try to refresh
                try {
                    await this.refreshAccessToken(zoomIntegration);
                    return true;
                } catch (error) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('[Zoom] Error checking integration:', error.message);
            return false;
        }
    }

    /**
     * Delete Zoom meeting
     * @param {String} appointmentId - Appointment ID
     * @param {String} userId - User ID whose credentials to use
     */
    async deleteMeeting(appointmentId, userId) {
        try {
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment || !appointment.zoomMeeting) {
                return { success: true, message: 'No meeting to delete' };
            }

            const zoomIntegration = await ZoomIntegration.findOne({ 
                userId: userId,
                isActive: true
            });

            if (!zoomIntegration) {
                console.log('[Zoom] No integration found, skipping meeting deletion');
                return { success: true, message: 'No integration found' };
            }

            // Delete meeting via Zoom API
            await axios.delete(
                `https://api.zoom.us/v2/meetings/${appointment.zoomMeeting.meetingId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${zoomIntegration.accessToken}`
                    }
                }
            );

            // Clear meeting details from appointment
            appointment.zoomMeeting = undefined;
            await appointment.save();

            console.log(`[Zoom] Meeting deleted for appointment ${appointmentId}`);

            return { success: true, message: 'Meeting deleted successfully' };
        } catch (error) {
            console.error('[Zoom] Error deleting meeting:', error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new ZoomMeetingService();


