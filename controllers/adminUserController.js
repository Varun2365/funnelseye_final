const { AdminUser, AdminAuditLog, User, Lead, CoachPlan } = require('../schema');

// ===== ADMIN USER MANAGEMENT CONTROLLER =====

class AdminUserController {

    // Create audit log
    async createAuditLog(adminId, action, details, req) {
        try {
            const admin = await AdminUser.findById(adminId);
            if (!admin) return;

            await AdminAuditLog.create({
                adminId,
                adminEmail: admin.email,
                adminRole: admin.role,
                action,
                category: 'USER_MANAGEMENT',
                description: details.description,
                severity: details.severity || 'medium',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                endpoint: req.originalUrl,
                method: req.method,
                status: details.status || 'success',
                errorMessage: details.errorMessage,
                changes: details.changes
            });
        } catch (error) {
            console.error('Error creating audit log:', error);
        }
    }

    // @desc    Get all users with filtering and pagination
    // @route   GET /api/admin/users
    // @access  Private (Admin)
    async getUsers(req, res) {
        try {
            const { 
                page = 1, 
                limit = 50, 
                role, 
                status, 
                search,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                startDate,
                endDate
            } = req.query;

            const query = {};
            
            if (role) query.role = role;
            if (status) query.status = status;
            if (search) {
                query.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ];
            }
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const users = await User.find(query)
                .sort(sortOptions)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .select('-password -passwordHistory')
                .populate('coachId', 'firstName lastName email');

            const total = await User.countDocuments(query);

            // Get user statistics
            const stats = await User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]);

            const roleStats = stats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {});

            res.json({
                success: true,
                message: 'Users retrieved successfully',
                data: {
                    users,
                    pagination: {
                        current: page,
                        pages: Math.ceil(total / limit),
                        total
                    },
                    stats: {
                        total,
                        byRole: roleStats
                    }
                }
            });

        } catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve users',
                error: error.message
            });
        }
    }

    // @desc    Get user by ID
    // @route   GET /api/admin/users/:id
    // @access  Private (Admin)
    async getUserById(req, res) {
        try {
            const { id } = req.params;

            const user = await User.findById(id)
                .select('-password -passwordHistory')
                .populate('coachId', 'firstName lastName email');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get user's leads
            const userLeads = await Lead.find({ userId: id })
                .sort({ createdAt: -1 })
                .limit(10)
                .select('firstName lastName email phone status createdAt');

            // Get user's coach plans (if user is a coach)
            let userPlans = [];
            if (user.role === 'coach') {
                userPlans = await CoachPlan.find({ coachId: id })
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .select('title price currency status totalSales totalRevenue');
            }

            // Get user's payment history
            const paymentHistory = await Payment.find({ customerId: id })
                .sort({ createdAt: -1 })
                .limit(10)
                .select('amount currency status createdAt');

            res.json({
                success: true,
                message: 'User retrieved successfully',
                data: {
                    user,
                    leads: userLeads,
                    plans: userPlans,
                    paymentHistory
                }
            });

        } catch (error) {
            console.error('Error getting user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user',
                error: error.message
            });
        }
    }

    // @desc    Update user
    // @route   PUT /api/admin/users/:id
    // @access  Private (Admin)
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const adminId = req.admin.id;

            // Remove sensitive fields that shouldn't be updated directly
            delete updateData.password;
            delete updateData.passwordHistory;
            delete updateData._id;
            delete updateData.createdAt;
            delete updateData.updatedAt;

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Store previous data for audit
            const previousData = JSON.parse(JSON.stringify(user.toObject()));

            // Update user
            const updatedUser = await User.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            ).select('-password -passwordHistory');

            // Create audit log
            const changedFields = Object.keys(updateData);
            await this.createAuditLog(adminId, 'UPDATE_USER', {
                description: `User updated: ${user.email}`,
                severity: 'medium',
                status: 'success',
                targetType: 'user',
                targetId: id,
                targetEmail: user.email,
                changes: {
                    before: previousData,
                    after: updatedUser.toObject(),
                    fieldsChanged: changedFields
                }
            }, req);

            res.json({
                success: true,
                message: 'User updated successfully',
                data: updatedUser
            });

        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user',
                error: error.message
            });
        }
    }

    // @desc    Update user status
    // @route   PATCH /api/admin/users/:id/status
    // @access  Private (Admin)
    async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;
            const adminId = req.admin.id;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }

            const validStatuses = ['active', 'inactive', 'suspended', 'pending'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status'
                });
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const previousStatus = user.status;

            // Update user status
            const updatedUser = await User.findByIdAndUpdate(
                id,
                { 
                    status,
                    statusReason: reason,
                    statusUpdatedAt: new Date(),
                    statusUpdatedBy: adminId
                },
                { new: true, runValidators: true }
            ).select('-password -passwordHistory');

            // Create audit log
            await this.createAuditLog(adminId, 'UPDATE_USER_STATUS', {
                description: `User status changed from ${previousStatus} to ${status}: ${user.email}`,
                severity: status === 'suspended' ? 'high' : 'medium',
                status: 'success',
                targetType: 'user',
                targetId: id,
                targetEmail: user.email,
                changes: {
                    before: { status: previousStatus },
                    after: { status, reason },
                    fieldsChanged: ['status', 'statusReason']
                }
            }, req);

            res.json({
                success: true,
                message: 'User status updated successfully',
                data: updatedUser
            });

        } catch (error) {
            console.error('Error updating user status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user status',
                error: error.message
            });
        }
    }

    // @desc    Delete user
    // @route   DELETE /api/admin/users/:id
    // @access  Private (Admin)
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const adminId = req.admin.id;

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if user has any important data
            const hasLeads = await Lead.countDocuments({ userId: id });
            const hasPlans = await CoachPlan.countDocuments({ coachId: id });
            const hasPayments = await Payment.countDocuments({ customerId: id });

            if (hasLeads > 0 || hasPlans > 0 || hasPayments > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete user with existing data. Consider deactivating instead.',
                    data: {
                        hasLeads,
                        hasPlans,
                        hasPayments
                    }
                });
            }

            // Soft delete - mark as deleted instead of actually deleting
            const deletedUser = await User.findByIdAndUpdate(
                id,
                { 
                    status: 'deleted',
                    deletedAt: new Date(),
                    deletedBy: adminId,
                    deleteReason: reason
                },
                { new: true, runValidators: true }
            ).select('-password -passwordHistory');

            // Create audit log
            await this.createAuditLog(adminId, 'DELETE_USER', {
                description: `User deleted: ${user.email}`,
                severity: 'high',
                status: 'success',
                targetType: 'user',
                targetId: id,
                targetEmail: user.email,
                changes: {
                    before: user.toObject(),
                    after: deletedUser.toObject(),
                    fieldsChanged: ['status', 'deletedAt', 'deletedBy', 'deleteReason']
                }
            }, req);

            res.json({
                success: true,
                message: 'User deleted successfully',
                data: deletedUser
            });

        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user',
                error: error.message
            });
        }
    }

    // @desc    Get user analytics
    // @route   GET /api/admin/users/analytics
    // @access  Private (Admin)
    async getUserAnalytics(req, res) {
        try {
            const { period = '30' } = req.query;
            const days = parseInt(period);
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            // User growth analytics
            const userGrowth = await User.aggregate([
                {
                    $match: { createdAt: { $gte: startDate } }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
            ]);

            // User role distribution
            const roleDistribution = await User.aggregate([
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // User status distribution
            const statusDistribution = await User.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Active users (logged in within last 7 days)
            const activeUsers = await User.countDocuments({
                lastActiveAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            });

            // New users this period
            const newUsers = await User.countDocuments({
                createdAt: { $gte: startDate }
            });

            // Total users
            const totalUsers = await User.countDocuments();

            // User engagement metrics
            const engagementMetrics = {
                activeUsers,
                newUsers,
                totalUsers,
                engagementRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0,
                growthRate: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0
            };

            res.json({
                success: true,
                message: 'User analytics retrieved successfully',
                data: {
                    userGrowth,
                    roleDistribution,
                    statusDistribution,
                    engagementMetrics,
                    period: days
                }
            });

        } catch (error) {
            console.error('Error getting user analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user analytics',
                error: error.message
            });
        }
    }

    // @desc    Bulk update users
    // @route   POST /api/admin/users/bulk-update
    // @access  Private (Admin)
    async bulkUpdateUsers(req, res) {
        try {
            const { userIds, updateData, reason } = req.body;
            const adminId = req.admin.id;

            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'User IDs array is required'
                });
            }

            if (!updateData || Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Update data is required'
                });
            }

            // Remove sensitive fields
            delete updateData.password;
            delete updateData.passwordHistory;

            // Update users
            const result = await User.updateMany(
                { _id: { $in: userIds } },
                { 
                    ...updateData,
                    lastModifiedBy: adminId,
                    bulkUpdateReason: reason
                }
            );

            // Create audit log
            await this.createAuditLog(adminId, 'BULK_UPDATE_USERS', {
                description: `Bulk updated ${result.modifiedCount} users`,
                severity: 'medium',
                status: 'success',
                changes: {
                    userIds,
                    updateData,
                    reason,
                    modifiedCount: result.modifiedCount
                }
            }, req);

            res.json({
                success: true,
                message: `Successfully updated ${result.modifiedCount} users`,
                data: {
                    modifiedCount: result.modifiedCount,
                    matchedCount: result.matchedCount
                }
            });

        } catch (error) {
            console.error('Error bulk updating users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to bulk update users',
                error: error.message
            });
        }
    }

    // @desc    Export users data
    // @route   GET /api/admin/users/export
    // @access  Private (Admin)
    async exportUsers(req, res) {
        try {
            const { format = 'json', role, status, startDate, endDate } = req.query;
            const adminId = req.admin.id;

            const query = {};
            if (role) query.role = role;
            if (status) query.status = status;
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            const users = await User.find(query)
                .select('-password -passwordHistory')
                .sort({ createdAt: -1 });

            // Create audit log
            await this.createAuditLog(adminId, 'EXPORT_USERS', {
                description: `Exported ${users.length} users in ${format} format`,
                severity: 'medium',
                status: 'success',
                changes: {
                    format,
                    userCount: users.length,
                    filters: { role, status, startDate, endDate }
                }
            }, req);

            if (format === 'csv') {
                // Convert to CSV format
                const csvData = this.convertToCSV(users);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
                res.send(csvData);
            } else {
                res.json({
                    success: true,
                    message: 'Users exported successfully',
                    data: users
                });
            }

        } catch (error) {
            console.error('Error exporting users:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to export users',
                error: error.message
            });
        }
    }

    // Helper method to convert data to CSV
    convertToCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0].toObject());
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(item => {
            const values = headers.map(header => {
                const value = item[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') return JSON.stringify(value);
                return `"${value}"`;
            });
            return values.join(',');
        });

        return [csvHeaders, ...csvRows].join('\n');
    }
}

module.exports = new AdminUserController();
