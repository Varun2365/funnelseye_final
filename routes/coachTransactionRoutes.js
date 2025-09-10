const express = require('express');
const router = express.Router();

// Import controllers
const coachTransactionController = require('../controllers/coachTransactionController');

// Import middleware
const { protect } = require('../middleware/auth');
const { verifyAdminToken } = require('../middleware/adminAuth');

// ==================== COACH TRANSACTION DASHBOARD ROUTES ====================

/**
 * @route   GET /api/coach-transactions/dashboard/:coachId
 * @desc    Get comprehensive coach transaction dashboard
 * @access  Private (Coach/Admin)
 */
router.get('/dashboard/:coachId', protect, coachTransactionController.getCoachDashboard);

/**
 * @route   GET /api/coach-transactions/history/:coachId
 * @desc    Get coach transaction history with filters
 * @access  Private (Coach/Admin)
 */
router.get('/history/:coachId', protect, coachTransactionController.getTransactionHistory);

/**
 * @route   GET /api/coach-transactions/transaction/:transactionId
 * @desc    Get detailed transaction information
 * @access  Private (Coach/Admin)
 */
router.get('/transaction/:transactionId', protect, coachTransactionController.getTransactionDetails);

/**
 * @route   GET /api/coach-transactions/export/:coachId
 * @desc    Export coach transactions (CSV/JSON)
 * @access  Private (Coach/Admin)
 */
router.get('/export/:coachId', protect, coachTransactionController.exportTransactions);

/**
 * @route   GET /api/coach-transactions/health
 * @desc    Health check for coach transaction system
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Coach Transaction System is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
            dashboard: '/api/coach-transactions/dashboard/:coachId',
            history: '/api/coach-transactions/history/:coachId',
            transaction: '/api/coach-transactions/transaction/:transactionId',
            export: '/api/coach-transactions/export/:coachId'
        }
    });
});

module.exports = router;
