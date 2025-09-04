const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { protect } = require('../../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Template management routes
router.route('/')
    .post(templateController.createTemplate)
    .get(templateController.getTemplates);

router.route('/categories')
    .get(templateController.getTemplateCategories);

router.route('/variables')
    .get(templateController.getTemplateVariables);

router.route('/stats')
    .get(templateController.getTemplateStats);

router.route('/search')
    .get(templateController.searchTemplates);

router.route('/:id')
    .get(templateController.getTemplate)
    .put(templateController.updateTemplate)
    .delete(templateController.deleteTemplate);

router.route('/:id/duplicate')
    .post(templateController.duplicateTemplate);

router.route('/:id/use')
    .post(templateController.useTemplate);

module.exports = router;
