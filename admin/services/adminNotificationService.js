const AdminNotification = require('../schemas/AdminNotification');
const { io } = require('../../main'); // We'll need to set this up properly

class AdminNotificationService {
    constructor() {
        this.io = null;
    }

    // Set Socket.IO instance
    setIoInstance(ioInstance) {
        this.io = ioInstance;
    }

    // Create and broadcast notification
    async createNotification(notificationData) {
        try {
            const notification = await AdminNotification.create(notificationData);
            
            // Broadcast to appropriate users based on target audience
            await this.broadcastNotification(notification);
            
            return notification;
        } catch (error) {
            console.error('Error creating admin notification:', error);
            throw error;
        }
    }

    // Broadcast notification to appropriate users
    async broadcastNotification(notification) {
        if (!this.io) {
            console.warn('Socket.IO not initialized, skipping broadcast');
            return;
        }

        try {
            switch (notification.targetAudience) {
                case 'admin_only':
                    // Broadcast to all admin users
                    this.io.to('admin-room').emit('admin-notification', notification);
                    break;
                
                case 'all_coaches':
                    // Broadcast to all coach users
                    this.io.to('coach-room').emit('coach-notification', notification);
                    break;
                
                case 'specific_coaches':
                    // Broadcast to specific coach users
                    if (notification.targetUsers && notification.targetUsers.length > 0) {
                        notification.targetUsers.forEach(userId => {
                            this.io.to(`user-${userId}`).emit('coach-notification', notification);
                        });
                    }
                    break;
                
                case 'all_users':
                    // Broadcast to all users
                    this.io.emit('global-notification', notification);
                    break;
            }

            // Also emit to admin dashboard for real-time updates
            this.io.to('admin-room').emit('notification-update', {
                type: 'new',
                notification
            });

        } catch (error) {
            console.error('Error broadcasting notification:', error);
        }
    }

    // Create system notification
    async createSystemNotification(data) {
        return await this.createNotification({
            ...data,
            createdBy: 'system',
            isGlobal: true,
            targetAudience: 'admin_only'
        });
    }

    // Create payment failure notification
    async createPaymentFailureNotification(paymentData) {
        return await this.createNotification({
            title: 'Payment Failure Alert',
            message: `Payment failed for ${paymentData.userEmail || 'user'} - Amount: ${paymentData.currency} ${paymentData.amount}`,
            type: 'error',
            category: 'payment',
            priority: 'high',
            targetAudience: 'admin_only',
            actionRequired: true,
            actionUrl: `/admin/payments/${paymentData._id}`,
            actionText: 'Review Payment',
            metadata: {
                source: 'payment_gateway',
                relatedEntity: 'payment',
                entityId: paymentData._id,
                additionalData: paymentData
            }
        });
    }

    // Create system health alert
    async createSystemHealthAlert(healthData) {
        const isCritical = healthData.status === 'critical';
        
        return await this.createNotification({
            title: 'System Health Alert',
            message: `System health status: ${healthData.status} - ${healthData.message || 'Check system logs for details'}`,
            type: isCritical ? 'critical' : 'warning',
            category: 'system',
            priority: isCritical ? 'urgent' : 'high',
            targetAudience: 'admin_only',
            actionRequired: true,
            actionUrl: '/admin/system/health',
            actionText: 'View System Health',
            metadata: {
                source: 'system_monitor',
                relatedEntity: 'system',
                additionalData: healthData
            }
        });
    }

    // Create coach registration notification
    async createCoachRegistrationNotification(coachData) {
        return await this.createNotification({
            title: 'New Coach Registration',
            message: `New coach registered: ${coachData.name} (${coachData.email})`,
            type: 'info',
            category: 'coach',
            priority: 'medium',
            targetAudience: 'admin_only',
            actionRequired: true,
            actionUrl: `/admin/coaches/${coachData._id}`,
            actionText: 'Review Coach',
            metadata: {
                source: 'coach_registration',
                relatedEntity: 'user',
                entityId: coachData._id,
                additionalData: coachData
            }
        });
    }

    // Create commission payout notification
    async createCommissionPayoutNotification(payoutData) {
        return await this.createNotification({
            title: 'Commission Payout Processed',
            message: `Commission payout processed for ${payoutData.coachName} - Amount: ${payoutData.currency} ${payoutData.amount}`,
            type: 'success',
            category: 'mlm',
            priority: 'medium',
            targetAudience: 'admin_only',
            actionRequired: false,
            actionUrl: `/admin/commissions/${payoutData._id}`,
            actionText: 'View Details',
            metadata: {
                source: 'commission_system',
                relatedEntity: 'commission',
                entityId: payoutData._id,
                additionalData: payoutData
            }
        });
    }

    // Mark notification as read
    async markAsRead(notificationId, userId) {
        try {
            const notification = await AdminNotification.findById(notificationId);
            if (!notification) {
                throw new Error('Notification not found');
            }

            // Check if already read by this user
            const alreadyRead = notification.readBy.some(read => read.userId.toString() === userId.toString());
            if (!alreadyRead) {
                notification.readBy.push({
                    userId,
                    readAt: new Date()
                });
                await notification.save();
            }

            // Broadcast read status update
            if (this.io) {
                this.io.to('admin-room').emit('notification-update', {
                    type: 'read',
                    notificationId,
                    userId
                });
            }

            return notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Dismiss notification
    async dismissNotification(notificationId, userId) {
        try {
            const notification = await AdminNotification.findById(notificationId);
            if (!notification) {
                throw new Error('Notification not found');
            }

            notification.isDismissed = true;
            notification.dismissedBy.push({
                userId,
                dismissedAt: new Date()
            });
            await notification.save();

            // Broadcast dismiss status update
            if (this.io) {
                this.io.to('admin-room').emit('notification-update', {
                    type: 'dismissed',
                    notificationId,
                    userId
                });
            }

            return notification;
        } catch (error) {
            console.error('Error dismissing notification:', error);
            throw error;
        }
    }

    // Get unread notifications for user
    async getUnreadNotifications(userId, targetAudience = 'admin_only') {
        try {
            const query = {
                isRead: false,
                isDismissed: false,
                $or: [
                    { targetAudience: 'admin_only' },
                    { targetAudience: 'all_users' },
                    { targetAudience: 'all_coaches' },
                    { targetAudience: 'specific_coaches', targetUsers: userId }
                ]
            };

            // Add expiration filter
            query.$or.push({ expiresAt: { $exists: false } });
            query.$or.push({ expiresAt: { $gt: new Date() } });

            const notifications = await AdminNotification.find(query)
                .sort({ createdAt: -1 })
                .limit(50);

            return notifications;
        } catch (error) {
            console.error('Error getting unread notifications:', error);
            throw error;
        }
    }

    // Clean up expired notifications
    async cleanupExpiredNotifications() {
        try {
            const result = await AdminNotification.updateMany(
                { expiresAt: { $lt: new Date() } },
                { isDismissed: true }
            );

            console.log(`Cleaned up ${result.modifiedCount} expired notifications`);
            return result.modifiedCount;
        } catch (error) {
            console.error('Error cleaning up expired notifications:', error);
            throw error;
        }
    }
}

module.exports = new AdminNotificationService();
