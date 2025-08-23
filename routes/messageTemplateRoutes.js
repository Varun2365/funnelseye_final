const express = require('express');
const router = express.Router();
const {
    createTemplate,
    getCoachTemplates,
    getPreBuiltTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    renderTemplate,
    seedPreBuiltTemplates,
    getTemplateCategories,
    getTemplateTypes,
    getCommonVariables
} = require('../controllers/messageTemplateController');

const { protect, authorizeCoach } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply authentication and activity tracking to all routes
router.use(protect, updateLastActive);

// ===== TEMPLATE MANAGEMENT =====

// Create a new message template
router.post('/', authorizeCoach(), createTemplate);

// Get all templates for the authenticated coach
router.get('/', authorizeCoach(), getCoachTemplates);

// Get pre-built templates
router.get('/pre-built', authorizeCoach(), getPreBuiltTemplates);

// Get template categories
router.get('/categories', authorizeCoach(), getTemplateCategories);

// Get template types
router.get('/types', authorizeCoach(), getTemplateTypes);

// Get common template variables
router.get('/variables', authorizeCoach(), getCommonVariables);

// Seed pre-built templates for the coach
router.post('/seed', authorizeCoach(), seedPreBuiltTemplates);

// ===== INDIVIDUAL TEMPLATE OPERATIONS =====

// Get a specific template by ID
router.get('/:id', authorizeCoach(), getTemplateById);

// Update a template
router.put('/:id', authorizeCoach(), updateTemplate);

// Delete a template
router.delete('/:id', authorizeCoach(), deleteTemplate);

// Duplicate a template
router.post('/:id/duplicate', authorizeCoach(), duplicateTemplate);

// Render a template with variables
router.post('/:id/render', authorizeCoach(), renderTemplate);

module.exports = router;
