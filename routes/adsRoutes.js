const express = require('express');
const router = express.Router();
const adsController = require('../controllers/adsController');
const { protect } = require('../middleware/auth');
const StaffPermissionMiddleware = require('../middleware/staffPermissionMiddleware');

router.use(protect, StaffPermissionMiddleware.ensureCoachDataAccess());

// Campaign management routes
router.get('/', StaffPermissionMiddleware.checkAdsPermission('read'), adsController.listCampaigns);
router.post('/create', StaffPermissionMiddleware.checkAdsPermission('write'), adsController.createCampaign);
router.post('/sync', StaffPermissionMiddleware.checkAdsPermission('manage'), adsController.syncCampaigns);
router.put('/:campaignId', StaffPermissionMiddleware.checkAdsPermission('update'), adsController.updateCampaign);
router.post('/:campaignId/pause', StaffPermissionMiddleware.checkAdsPermission('manage'), adsController.pauseCampaign);
router.post('/:campaignId/resume', StaffPermissionMiddleware.checkAdsPermission('manage'), adsController.resumeCampaign);
router.get('/:campaignId/analytics', StaffPermissionMiddleware.checkAdsPermission('analytics'), adsController.getCampaignAnalytics);

// New routes for complete URL campaign creation
router.post('/upload-image', StaffPermissionMiddleware.checkAdsPermission('write'), adsController.uploadImage);
router.post('/:campaignId/ad-sets', StaffPermissionMiddleware.checkAdsPermission('write'), adsController.createAdSet);
router.post('/:campaignId/creatives', StaffPermissionMiddleware.checkAdsPermission('write'), adsController.createAdCreative);
router.post('/:campaignId/ads', StaffPermissionMiddleware.checkAdsPermission('write'), adsController.createAd);
router.get('/:campaignId/ad-sets', StaffPermissionMiddleware.checkAdsPermission('read'), adsController.listAdSets);
router.get('/:campaignId/creatives', StaffPermissionMiddleware.checkAdsPermission('read'), adsController.listAdCreatives);
router.get('/:campaignId/ads', StaffPermissionMiddleware.checkAdsPermission('read'), adsController.listAds);

// All-in-one URL campaign creation
router.post('/create-url-campaign', StaffPermissionMiddleware.checkAdsPermission('write'), adsController.createUrlCampaign);

module.exports = router;
