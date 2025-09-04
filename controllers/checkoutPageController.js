const CheckoutPage = require('../schema/CheckoutPage');
const UnifiedPaymentTransaction = require('../schema/UnifiedPaymentTransaction');
const logger = require('../utils/logger');

class CheckoutPageController {

    /**
     * Create checkout page
     * POST /api/checkout-pages
     */
    async createCheckoutPage(req, res) {
        try {
            logger.info('[CheckoutPageController] Creating checkout page');

            const {
                pageId,
                name,
                description,
                category,
                configuration,
                businessLogic,
                status,
                isPublic,
                accessControl,
                analytics,
                seo
            } = req.body;

            // Validate required fields
            if (!pageId || !name || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: pageId, name, category'
                });
            }

            // Check if pageId already exists
            const existingPage = await CheckoutPage.findOne({ pageId });
            if (existingPage) {
                return res.status(400).json({
                    success: false,
                    message: 'Page ID already exists'
                });
            }

            // Create checkout page
            const checkoutPage = new CheckoutPage({
                pageId,
                name,
                description,
                category,
                configuration,
                businessLogic,
                status,
                isPublic,
                accessControl,
                analytics,
                seo,
                createdBy: req.user.id
            });

            await checkoutPage.save();

            logger.info(`[CheckoutPageController] Checkout page created: ${pageId}`);

            res.status(201).json({
                success: true,
                message: 'Checkout page created successfully',
                data: checkoutPage
            });

        } catch (error) {
            logger.error('[CheckoutPageController] Error creating checkout page:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating checkout page',
                error: error.message
            });
        }
    }

    /**
     * Get checkout page by ID
     * GET /api/checkout-pages/:pageId
     */
    async getCheckoutPage(req, res) {
        try {
            const { pageId } = req.params;

            const checkoutPage = await CheckoutPage.findOne({ pageId })
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email');

            if (!checkoutPage) {
                return res.status(404).json({
                    success: false,
                    message: 'Checkout page not found'
                });
            }

            // Check access control
            if (!checkoutPage.isPublic && checkoutPage.createdBy._id.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Checkout page retrieved successfully',
                data: checkoutPage
            });

        } catch (error) {
            logger.error('[CheckoutPageController] Error getting checkout page:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting checkout page',
                error: error.message
            });
        }
    }

    /**
     * Get all checkout pages (with filters)
     * GET /api/checkout-pages
     */
    async getAllCheckoutPages(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                category, 
                status, 
                createdBy,
                search 
            } = req.query;

            const filter = {};

            // Apply filters
            if (category) filter.category = category;
            if (status) filter.status = status;
            if (createdBy) filter.createdBy = createdBy;

            // Search functionality
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { pageId: { $regex: search, $options: 'i' } }
                ];
            }

            // If not admin, only show user's pages or public pages
            if (!req.user.isAdmin) {
                filter.$or = [
                    { createdBy: req.user.id },
                    { isPublic: true, status: 'active' }
                ];
            }

            const skip = (page - 1) * limit;

            const checkoutPages = await CheckoutPage.find(filter)
                .populate('createdBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await CheckoutPage.countDocuments(filter);

            res.status(200).json({
                success: true,
                message: 'Checkout pages retrieved successfully',
                data: {
                    checkoutPages,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });

        } catch (error) {
            logger.error('[CheckoutPageController] Error getting checkout pages:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting checkout pages',
                error: error.message
            });
        }
    }

    /**
     * Update checkout page
     * PUT /api/checkout-pages/:pageId
     */
    async updateCheckoutPage(req, res) {
        try {
            logger.info('[CheckoutPageController] Updating checkout page');

            const { pageId } = req.params;
            const updateData = req.body;

            const checkoutPage = await CheckoutPage.findOne({ pageId });

            if (!checkoutPage) {
                return res.status(404).json({
                    success: false,
                    message: 'Checkout page not found'
                });
            }

            // Check permissions
            if (checkoutPage.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Update checkout page
            updateData.updatedBy = req.user.id;
            updateData.updatedAt = new Date();

            const updatedPage = await CheckoutPage.findOneAndUpdate(
                { pageId },
                updateData,
                { new: true }
            ).populate('createdBy', 'name email')
             .populate('updatedBy', 'name email');

            logger.info(`[CheckoutPageController] Checkout page updated: ${pageId}`);

            res.status(200).json({
                success: true,
                message: 'Checkout page updated successfully',
                data: updatedPage
            });

        } catch (error) {
            logger.error('[CheckoutPageController] Error updating checkout page:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating checkout page',
                error: error.message
            });
        }
    }

    /**
     * Delete checkout page
     * DELETE /api/checkout-pages/:pageId
     */
    async deleteCheckoutPage(req, res) {
        try {
            logger.info('[CheckoutPageController] Deleting checkout page');

            const { pageId } = req.params;

            const checkoutPage = await CheckoutPage.findOne({ pageId });

            if (!checkoutPage) {
                return res.status(404).json({
                    success: false,
                    message: 'Checkout page not found'
                });
            }

            // Check permissions
            if (checkoutPage.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Check if page is being used in transactions
            const transactionCount = await UnifiedPaymentTransaction.countDocuments({
                'checkoutPage.pageId': pageId
            });

            if (transactionCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete checkout page. It is being used in ${transactionCount} transactions.`
                });
            }

            await CheckoutPage.findOneAndDelete({ pageId });

            logger.info(`[CheckoutPageController] Checkout page deleted: ${pageId}`);

            res.status(200).json({
                success: true,
                message: 'Checkout page deleted successfully'
            });

        } catch (error) {
            logger.error('[CheckoutPageController] Error deleting checkout page:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting checkout page',
                error: error.message
            });
        }
    }

    /**
     * Duplicate checkout page
     * POST /api/checkout-pages/:pageId/duplicate
     */
    async duplicateCheckoutPage(req, res) {
        try {
            logger.info('[CheckoutPageController] Duplicating checkout page');

            const { pageId } = req.params;
            const { newPageId, newName } = req.body;

            if (!newPageId || !newName) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: newPageId, newName'
                });
            }

            const originalPage = await CheckoutPage.findOne({ pageId });

            if (!originalPage) {
                return res.status(404).json({
                    success: false,
                    message: 'Original checkout page not found'
                });
            }

            // Check if new pageId already exists
            const existingPage = await CheckoutPage.findOne({ pageId: newPageId });
            if (existingPage) {
                return res.status(400).json({
                    success: false,
                    message: 'New page ID already exists'
                });
            }

            // Create duplicate
            const duplicatedPage = new CheckoutPage({
                ...originalPage.toObject(),
                _id: undefined,
                pageId: newPageId,
                name: newName,
                status: 'draft',
                isPublic: false,
                createdBy: req.user.id,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await duplicatedPage.save();

            logger.info(`[CheckoutPageController] Checkout page duplicated: ${pageId} -> ${newPageId}`);

            res.status(201).json({
                success: true,
                message: 'Checkout page duplicated successfully',
                data: duplicatedPage
            });

        } catch (error) {
            logger.error('[CheckoutPageController] Error duplicating checkout page:', error);
            res.status(500).json({
                success: false,
                message: 'Error duplicating checkout page',
                error: error.message
            });
        }
    }

    /**
     * Get checkout page statistics
     * GET /api/checkout-pages/:pageId/stats
     */
    async getCheckoutPageStats(req, res) {
        try {
            const { pageId } = req.params;

            const checkoutPage = await CheckoutPage.findOne({ pageId });
            if (!checkoutPage) {
                return res.status(404).json({
                    success: false,
                    message: 'Checkout page not found'
                });
            }

            // Get transaction statistics
            const stats = await UnifiedPaymentTransaction.aggregate([
                { $match: { 'checkoutPage.pageId': pageId } },
                {
                    $group: {
                        _id: null,
                        totalTransactions: { $sum: 1 },
                        totalAmount: { $sum: '$grossAmount' },
                        successfulTransactions: {
                            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                        },
                        failedTransactions: {
                            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                        },
                        pendingTransactions: {
                            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                        }
                    }
                }
            ]);

            const conversionRate = stats[0]?.totalTransactions > 0 
                ? (stats[0].successfulTransactions / stats[0].totalTransactions) * 100 
                : 0;

            res.status(200).json({
                success: true,
                message: 'Checkout page statistics retrieved successfully',
                data: {
                    pageId,
                    pageName: checkoutPage.name,
                    category: checkoutPage.category,
                    status: checkoutPage.status,
                    stats: {
                        totalTransactions: stats[0]?.totalTransactions || 0,
                        totalAmount: stats[0]?.totalAmount || 0,
                        successfulTransactions: stats[0]?.successfulTransactions || 0,
                        failedTransactions: stats[0]?.failedTransactions || 0,
                        pendingTransactions: stats[0]?.pendingTransactions || 0,
                        conversionRate: Math.round(conversionRate * 100) / 100
                    }
                }
            });

        } catch (error) {
            logger.error('[CheckoutPageController] Error getting checkout page stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting checkout page statistics',
                error: error.message
            });
        }
    }

    /**
     * Get checkout page categories
     * GET /api/checkout-pages/categories
     */
    async getCheckoutPageCategories(req, res) {
        try {
            const categories = [
                {
                    value: 'selling',
                    label: 'Product/Course Selling',
                    description: 'For selling products, courses, or digital goods'
                },
                {
                    value: 'subscription',
                    label: 'Platform Subscription',
                    description: 'For platform subscription payments'
                },
                {
                    value: 'donation',
                    label: 'Donation/Charity',
                    description: 'For donation or charity payments'
                },
                {
                    value: 'membership',
                    label: 'Membership Fees',
                    description: 'For membership or access fees'
                },
                {
                    value: 'service',
                    label: 'Service Payments',
                    description: 'For service-based payments'
                },
                {
                    value: 'event',
                    label: 'Event Registration',
                    description: 'For event registration payments'
                },
                {
                    value: 'custom',
                    label: 'Custom',
                    description: 'For custom payment scenarios'
                }
            ];

            res.status(200).json({
                success: true,
                message: 'Checkout page categories retrieved successfully',
                data: categories
            });

        } catch (error) {
            logger.error('[CheckoutPageController] Error getting categories:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting checkout page categories',
                error: error.message
            });
        }
    }
}

module.exports = new CheckoutPageController();
