const express = require('express');
const router = express.Router();

// Import all admin route modules
const adminDashboardRoutes = require('./adminDashboardRoutes');
const adminFinancialRoutes = require('./adminFinancialRoutes');
const adminCoachRoutes = require('./adminCoachRoutes');

// Mount admin routes
router.use('/dashboard', adminDashboardRoutes);
router.use('/financial', adminFinancialRoutes);
router.use('/coaches', adminCoachRoutes);

// Admin home route
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'FunnelsEye Admin API',
        version: '1.0.0',
        endpoints: {
            dashboard: '/api/admin/dashboard',
            financial: '/api/admin/financial',
            coaches: '/api/admin/coaches'
        },
        documentation: '/api-docs'
    });
});

module.exports = router;
