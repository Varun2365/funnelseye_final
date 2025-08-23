const axios = require('axios');
const crypto = require('crypto');
const ZoomIntegration = require('../schema/ZoomIntegration');
const Appointment = require('../schema/Appointment');

/**
 * Zoom Integration Service
 * Handles Zoom API operations, meeting creation, and automatic link generation
 */
class ZoomService {
    constructor() {
        this.baseURL = 'https://api.zoom.us/v2';
        this.zoomAccountId = process.env.ZOOM_ACCOUNT_ID;
        this.zoomClientId = process.env.ZOOM_CLIENT_ID;
        this.zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;
    }

    /**
     * Generate JWT token for Zoom API authentication
     */
    generateJWT(apiKey, apiSecret) {
        const payload = {
            iss: apiKey,
            exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
        };

        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };

        const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
        
        const signature = crypto
            .createHmac('sha256', apiSecret)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64url');

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    /**
     * Get Zoom integration for a coach
     */
    async getCoachIntegration(coachId) {
        try {
            const integration = await ZoomIntegration.findOne({ 
                coachId, 
                isActive: true 
            });

            if (!integration) {
                throw new Error('Zoom integration not found or inactive');
            }

            return integration;
        } catch (error) {
            console.error(`[ZoomService] Error getting coach integration:`, error);
            throw error;
        }
    }

    /**
     * Create a Zoom meeting for an appointment
     */
    async createMeetingForAppointment(appointmentId) {
        try {
            console.log(`[ZoomService] Creating Zoom meeting for appointment: ${appointmentId}`);

            // Get appointment details
            const appointment = await Appointment.findById(appointmentId)
                .populate('coachId')
                .populate('leadId');

            if (!appointment) {
                throw new Error('Appointment not found');
            }

            // Check if appointment is online
            if (appointment.appointmentType !== 'online') {
                throw new Error('Appointment is not online type');
            }

            // Get coach's Zoom integration
            const integration = await this.getCoachIntegration(appointment.coachId._id);

            // Generate JWT token
            const token = this.generateJWT(integration.apiKey, integration.apiSecret);

            // Prepare meeting data
            const meetingData = {
                topic: `Session with ${appointment.leadId?.name || 'Client'}`,
                type: 2, // Scheduled meeting
                start_time: appointment.startTime.toISOString(),
                duration: appointment.duration || 60,
                timezone: appointment.timezone || 'UTC',
                password: this.generateMeetingPassword(),
                settings: {
                    host_video: integration.meetingSettings.settings.hostVideo,
                    participant_video: integration.meetingSettings.settings.participantVideo,
                    join_before_host: integration.meetingSettings.settings.joinBeforeHost,
                    mute_upon_entry: integration.meetingSettings.settings.muteUponEntry,
                    watermark: integration.meetingSettings.settings.watermark,
                    use_pmi: integration.meetingSettings.settings.usePersonalMeetingId,
                    waiting_room: integration.meetingSettings.settings.waitingRoom,
                    auto_recording: integration.meetingSettings.settings.autoRecording
                }
            };

            // Create meeting via Zoom API
            const response = await axios.post(
                `${this.baseURL}/users/me/meetings`,
                meetingData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const zoomMeeting = response.data;

            // Update appointment with Zoom meeting details
            appointment.zoomMeeting = {
                meetingId: zoomMeeting.id,
                joinUrl: zoomMeeting.join_url,
                startUrl: zoomMeeting.start_url,
                password: zoomMeeting.password,
                zoomMeetingId: zoomMeeting.id
            };

            await appointment.save();

            // Update Zoom integration usage stats
            await integration.updateUsageStats({
                participants: 1,
                duration: appointment.duration || 60
            });

            console.log(`[ZoomService] Successfully created Zoom meeting: ${zoomMeeting.id}`);

            return {
                success: true,
                meetingId: zoomMeeting.id,
                joinUrl: zoomMeeting.join_url,
                startUrl: zoomMeeting.start_url,
                password: zoomMeeting.password
            };

        } catch (error) {
            console.error(`[ZoomService] Error creating meeting:`, error);
            throw error;
        }
    }

    /**
     * Generate a secure meeting password
     */
    generateMeetingPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    /**
     * Update an existing Zoom meeting
     */
    async updateMeeting(appointmentId, updates) {
        try {
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment || !appointment.zoomMeeting) {
                throw new Error('Appointment or Zoom meeting not found');
            }

            const integration = await this.getCoachIntegration(appointment.coachId);
            const token = this.generateJWT(integration.apiKey, integration.apiSecret);

            const meetingData = {
                topic: updates.topic || appointment.zoomMeeting.topic,
                start_time: updates.startTime ? updates.startTime.toISOString() : appointment.startTime.toISOString(),
                duration: updates.duration || appointment.duration || 60,
                timezone: updates.timezone || appointment.timezone || 'UTC'
            };

            const response = await axios.patch(
                `${this.baseURL}/meetings/${appointment.zoomMeeting.meetingId}`,
                meetingData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update appointment if needed
            if (updates.startTime) appointment.startTime = updates.startTime;
            if (updates.duration) appointment.duration = updates.duration;
            if (updates.timezone) appointment.timezone = updates.timezone;

            await appointment.save();

            return {
                success: true,
                message: 'Meeting updated successfully'
            };

        } catch (error) {
            console.error(`[ZoomService] Error updating meeting:`, error);
            throw error;
        }
    }

    /**
     * Delete a Zoom meeting
     */
    async deleteMeeting(appointmentId) {
        try {
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment || !appointment.zoomMeeting) {
                throw new Error('Appointment or Zoom meeting not found');
            }

            const integration = await this.getCoachIntegration(appointment.coachId);
            const token = this.generateJWT(integration.apiKey, integration.apiSecret);

            await axios.delete(
                `${this.baseURL}/meetings/${appointment.zoomMeeting.meetingId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Remove Zoom meeting details from appointment
            appointment.zoomMeeting = undefined;
            await appointment.save();

            return {
                success: true,
                message: 'Meeting deleted successfully'
            };

        } catch (error) {
            console.error(`[ZoomService] Error deleting meeting:`, error);
            throw error;
        }
    }

    /**
     * Get meeting details
     */
    async getMeetingDetails(meetingId, coachId) {
        try {
            const integration = await this.getCoachIntegration(coachId);
            const token = this.generateJWT(integration.apiKey, integration.apiSecret);

            const response = await axios.get(
                `${this.baseURL}/meetings/${meetingId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                success: true,
                meeting: response.data
            };

        } catch (error) {
            console.error(`[ZoomService] Error getting meeting details:`, error);
            throw error;
        }
    }

    /**
     * Get meeting participants
     */
    async getMeetingParticipants(meetingId, coachId) {
        try {
            const integration = await this.getCoachIntegration(coachId);
            const token = this.generateJWT(integration.apiKey, integration.apiSecret);

            const response = await axios.get(
                `${this.baseURL}/meetings/${meetingId}/participants`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                success: true,
                participants: response.data.participants || []
            };

        } catch (error) {
            console.error(`[ZoomService] Error getting meeting participants:`, error);
            throw error;
        }
    }

    /**
     * Test Zoom integration connection
     */
    async testConnection(coachId) {
        try {
            const integration = await this.getCoachIntegration(coachId);
            const token = this.generateJWT(integration.apiKey, integration.apiSecret);

            // Test API connection by getting user profile
            const response = await axios.get(
                `${this.baseURL}/users/me`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                success: true,
                message: 'Connection successful',
                user: response.data
            };

        } catch (error) {
            console.error(`[ZoomService] Connection test failed:`, error);
            return {
                success: false,
                message: 'Connection failed',
                error: error.message
            };
        }
    }

    /**
     * Get Zoom account usage statistics
     */
    async getAccountUsage(coachId) {
        try {
            const integration = await this.getCoachIntegration(coachId);
            
            return {
                success: true,
                usage: integration.usageStats,
                lastSync: integration.lastSync
            };

        } catch (error) {
            console.error(`[ZoomService] Error getting usage stats:`, error);
            throw error;
        }
    }
}

module.exports = new ZoomService();
