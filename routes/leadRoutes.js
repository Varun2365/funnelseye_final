// D:\\PRJ_YCT_Final\\routes\\leads.js

const express = require('express');
const {
    createLead,
    getLeads,
    getLead,
    updateLead,
    addFollowUpNote,
    getUpcomingFollowUps,
    deleteLead,
    assignNurturingSequence,
    advanceNurturingStep,
    getNurturingProgress,
    aiQualifyLead,
    generateNurturingSequence,
    generateFollowUpMessage,
    submitQuestionResponses,
    getQuestionTypes
} = require('../controllers/leadController');

const { protect, authorizeCoach } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const StaffPermissionMiddleware = require('../middleware/staffPermissionMiddleware');

const router = express.Router();

// --- Public Route for creating a Lead ---
router.route('/').post(createLead);

// --- PUBLIC ROUTE: Update Lead (No Auth Required) ---
router.route('/:leadId').put(updateLead);

// --- PUBLIC ROUTE: Submit Question Responses (No Auth Required) ---
router.post('/question-responses', submitQuestionResponses);

// --- PUBLIC ROUTE: Get Question Types (No Auth Required) ---
router.get('/question-types', getQuestionTypes);

// --- All Subsequent Routes require Authentication ---
router.use(protect, updateLastActive, authorizeCoach(), StaffPermissionMiddleware.ensureCoachDataAccess());

router.route('/').get(StaffPermissionMiddleware.checkLeadPermission('read'), getLeads);
router.route('/:leadId')
    .get(StaffPermissionMiddleware.checkLeadPermission('read'), getLead)
    .delete(StaffPermissionMiddleware.checkLeadPermission('delete'), deleteLead);
// AI rescore endpoint (protected)
router.post('/:leadId/ai-rescore', StaffPermissionMiddleware.checkAIPermission('write'), require('../controllers/leadController').aiRescore);
router.route('/:leadId/followup')
    .post(StaffPermissionMiddleware.checkLeadPermission('update'), addFollowUpNote);
router.route('/followups/upcoming')
    .get(StaffPermissionMiddleware.checkLeadPermission('read'), getUpcomingFollowUps);
// Assign a nurturing sequence to a lead
router.post('/assign-nurturing-sequence', StaffPermissionMiddleware.checkLeadPermission('manage'), assignNurturingSequence);
// Advance a lead to the next nurturing step
router.post('/advance-nurturing-step', StaffPermissionMiddleware.checkLeadPermission('update'), advanceNurturingStep);
// Get nurturing sequence progress for a lead
router.get('/:leadId/nurturing-progress', StaffPermissionMiddleware.checkLeadPermission('read'), getNurturingProgress);

// AI-powered lead management endpoints
router.get('/:leadId/ai-qualify', StaffPermissionMiddleware.checkAIPermission('read'), aiQualifyLead);
router.post('/:leadId/generate-nurturing-sequence', StaffPermissionMiddleware.checkAIPermission('write'), generateNurturingSequence);
router.post('/:leadId/generate-followup-message', StaffPermissionMiddleware.checkAIPermission('write'), generateFollowUpMessage);

module.exports = router;