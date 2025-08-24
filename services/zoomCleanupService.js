const Appointment = require('../schema/Appointment');
const logger = require('../utils/logger') || console;

/**
 * Zoom Cleanup Service
 * Automatically removes Zoom meeting data for appointments older than specified days
 */
class ZoomCleanupService {
    constructor() {
        this.cleanupInterval = null;
        this.defaultRetentionDays = 2; // Default: delete meetings older than 2 days
    }

    /**
     * Start the automatic cleanup process
     * @param {number} retentionDays - Number of days to keep Zoom meeting data
     * @param {string} interval - Cleanup interval ('daily', 'weekly', 'manual')
     */
    startCleanup(retentionDays = this.defaultRetentionDays, interval = 'daily') {
        if (this.cleanupInterval) {
            this.stopCleanup();
        }

        const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
        
        if (interval === 'daily') {
            // Run cleanup daily at 2 AM
            this.cleanupInterval = setInterval(() => {
                const now = new Date();
                const twoAM = new Date(now);
                twoAM.setHours(2, 0, 0, 0);
                
                if (now >= twoAM) {
                    this.performCleanup(retentionMs);
                }
            }, 60 * 60 * 1000); // Check every hour
            
            // Also run immediately if it's past 2 AM
            const now = new Date();
            const twoAM = new Date(now);
            twoAM.setHours(2, 0, 0, 0);
            
            if (now >= twoAM) {
                this.performCleanup(retentionMs);
            }
        } else if (interval === 'weekly') {
            // Run cleanup weekly on Sunday at 2 AM
            this.cleanupInterval = setInterval(() => {
                const now = new Date();
                const isSunday = now.getDay() === 0;
                const twoAM = new Date(now);
                twoAM.setHours(2, 0, 0, 0);
                
                if (isSunday && now >= twoAM) {
                    this.performCleanup(retentionMs);
                }
            }, 24 * 60 * 60 * 1000); // Check daily
        }

        logger.info(`[ZoomCleanup] Started automatic cleanup with ${retentionDays} days retention, interval: ${interval}`);
    }

    /**
     * Stop the automatic cleanup process
     */
    stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            logger.info('[ZoomCleanup] Stopped automatic cleanup');
        }
    }

    /**
     * Perform the actual cleanup operation
     * @param {number} retentionMs - Retention period in milliseconds
     */
    async performCleanup(retentionMs) {
        try {
            const cutoffDate = new Date(Date.now() - retentionMs);
            
            logger.info(`[ZoomCleanup] Starting cleanup for meetings older than ${cutoffDate.toISOString()}`);
            
            // Find appointments with Zoom meetings older than retention period
            const oldAppointments = await Appointment.find({
                'zoomMeeting.createdAt': { $lt: cutoffDate },
                'zoomMeeting.meetingId': { $exists: true }
            }).select('_id zoomMeeting startTime leadId coachId');

            if (oldAppointments.length === 0) {
                logger.info('[ZoomCleanup] No old Zoom meetings found to clean up');
                return;
            }

            logger.info(`[ZoomCleanup] Found ${oldAppointments.length} appointments with old Zoom meetings`);

            let cleanedCount = 0;
            let errorCount = 0;

            for (const appointment of oldAppointments) {
                try {
                    // Remove Zoom meeting data but keep the appointment
                    await Appointment.updateOne(
                        { _id: appointment._id },
                        { 
                            $unset: { 
                                'zoomMeeting.meetingId': 1,
                                'zoomMeeting.joinUrl': 1,
                                'zoomMeeting.startUrl': 1,
                                'zoomMeeting.password': 1,
                                'zoomMeeting.createdAt': 1
                            }
                        }
                    );

                    cleanedCount++;
                    logger.debug(`[ZoomCleanup] Cleaned Zoom data for appointment ${appointment._id}`);
                } catch (error) {
                    errorCount++;
                    logger.error(`[ZoomCleanup] Error cleaning appointment ${appointment._id}:`, error.message);
                }
            }

            logger.info(`[ZoomCleanup] Cleanup completed: ${cleanedCount} meetings cleaned, ${errorCount} errors`);

        } catch (error) {
            logger.error('[ZoomCleanup] Error during cleanup process:', error.message);
        }
    }

    /**
     * Manual cleanup for specific retention period
     * @param {number} retentionDays - Number of days to keep Zoom meeting data
     * @returns {Object} Cleanup results
     */
    async manualCleanup(retentionDays = this.defaultRetentionDays) {
        const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
        
        logger.info(`[ZoomCleanup] Manual cleanup initiated for meetings older than ${retentionDays} days`);
        
        await this.performCleanup(retentionMs);
        
        return {
            success: true,
            message: `Manual cleanup completed for meetings older than ${retentionDays} days`,
            timestamp: new Date()
        };
    }

    /**
     * Get cleanup statistics
     * @returns {Object} Cleanup statistics
     */
    async getCleanupStats() {
        try {
            const now = new Date();
            const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));
            const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

            const stats = {
                totalMeetings: await Appointment.countDocuments({ 'zoomMeeting.meetingId': { $exists: true } }),
                meetingsOlderThan2Days: await Appointment.countDocuments({ 'zoomMeeting.createdAt': { $lt: twoDaysAgo } }),
                meetingsOlderThan1Week: await Appointment.countDocuments({ 'zoomMeeting.createdAt': { $lt: oneWeekAgo } }),
                meetingsOlderThan1Month: await Appointment.countDocuments({ 'zoomMeeting.createdAt': { $lt: oneMonthAgo } }),
                lastCleanup: this.lastCleanupTime || null,
                isRunning: !!this.cleanupInterval
            };

            return stats;
        } catch (error) {
            logger.error('[ZoomCleanup] Error getting cleanup stats:', error.message);
            throw error;
        }
    }

    /**
     * Update retention period
     * @param {number} retentionDays - New retention period in days
     */
    updateRetentionPeriod(retentionDays) {
        if (retentionDays < 1) {
            throw new Error('Retention period must be at least 1 day');
        }
        
        this.defaultRetentionDays = retentionDays;
        logger.info(`[ZoomCleanup] Updated retention period to ${retentionDays} days`);
        
        // Restart cleanup with new retention period if running
        if (this.cleanupInterval) {
            this.stopCleanup();
            this.startCleanup(retentionDays);
        }
    }
}

// Create singleton instance
const zoomCleanupService = new ZoomCleanupService();

module.exports = zoomCleanupService;
