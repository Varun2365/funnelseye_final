// D:\PRJ_YCT_Final\routes\automationRuleRoutes.js

const express = require('express');
const router = express.Router();
// --- CORRECTED: The import name must match the controller's export ---
const { createRule, getRules, getRuleById, updateRule, deleteRule, getEventsAndActions } = require('../controllers/automationRuleController'); 

// Assuming you have an authentication middleware to protect routes
const {protect} = require('../middleware/auth'); // Adjust path as per your project structure
const { updateLastActive } = require('../middleware/activityMiddleware'); // Your new middleware
const StaffPermissionMiddleware = require('../middleware/staffPermissionMiddleware');

// Public route for getting available events and actions (no authentication required)
router.get('/events-actions', getEventsAndActions); // Get all available events and actions

// Use router.use() to apply both the authentication and activity tracking middleware
// to ALL subsequent routes in this file.
router.use(protect, updateLastActive, StaffPermissionMiddleware.ensureCoachDataAccess());

// Route to create a new automation rule
// This route is now protected, and it will update the user's lastActiveAt timestamp
router.post('/', StaffPermissionMiddleware.checkAutomationPermission('write'), createRule); // <--- CORRECTED: Use the correct function name

// You would add more routes here for GET, PUT, DELETE operations later:
router.get('/', StaffPermissionMiddleware.checkAutomationPermission('read'), getRules);
router.get('/:id', StaffPermissionMiddleware.checkAutomationPermission('read'), getRuleById);
router.put('/:id', StaffPermissionMiddleware.checkAutomationPermission('update'), updateRule);
router.delete('/:id', StaffPermissionMiddleware.checkAutomationPermission('delete'), deleteRule);

module.exports = router;