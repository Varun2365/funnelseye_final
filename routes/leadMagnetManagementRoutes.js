const express = require('express');
const router = express.Router();
const {
    getAvailableMagnets,
    generateShareableUrls,
    getPredefinedChannels,
    createCampaign,
    getAnalytics,
    getInteractions,
    getTopPerformers,
    exportData,
    getTrends
} = require('../controllers/leadMagnetManagementController');

const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication and resource filtering to all routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('leads'));

// @route   GET /api/lead-magnet-management/available
// @desc    Get all available lead magnets for coach
// @access  Private (Coach)
router.get('/available', requirePermission('leads:read'), getAvailableMagnets);

// @route   POST /api/lead-magnet-management/generate-urls
// @desc    Generate shareable URLs for a lead magnet
// @access  Private (Coach)
router.post('/generate-urls', requirePermission('leads:write'), generateShareableUrls);

// @route   GET /api/lead-magnet-management/channels
// @desc    Get predefined channel configurations
// @access  Private (Coach)
router.get('/channels', requirePermission('leads:read'), getPredefinedChannels);

// @route   POST /api/lead-magnet-management/campaigns
// @desc    Create campaign with multiple lead magnets
// @access  Private (Coach)
router.post('/campaigns', requirePermission('leads:manage'), createCampaign);

// @route   GET /api/lead-magnet-management/analytics
// @desc    Get lead magnet analytics
// @access  Private (Coach)
router.get('/analytics', requirePermission('leads:read'), getAnalytics);

// @route   GET /api/lead-magnet-management/interactions
// @desc    Get lead magnet interaction details
// @access  Private (Coach)
router.get('/interactions', requirePermission('leads:read'), getInteractions);

// @route   GET /api/lead-magnet-management/top-performers
// @desc    Get top performing lead magnets
// @access  Private (Coach)
router.get('/top-performers', requirePermission('leads:read'), getTopPerformers);

// @route   GET /api/lead-magnet-management/export
// @desc    Export lead magnet data
// @access  Private (Coach)
router.get('/export', requirePermission('leads:read'), exportData);

// @route   GET /api/lead-magnet-management/trends
// @desc    Get lead magnet performance trends
// @access  Private (Coach)
router.get('/trends', requirePermission('leads:read'), getTrends);

module.exports = router;
