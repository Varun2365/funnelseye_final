const mongoose = require('mongoose');
const { 
    User, 
    CoachHierarchyLevel, 
    AdminRequest, 
    ExternalSponsor, 
    Commission, 
    CommissionSettings,
    Subscription,
    Payment,
    CoachPerformance,
    Lead,
    Task,
    CoachReport
} = require('../schema');

// ===== HIERARCHY SETUP & INITIALIZATION =====

// @desc    Setup default hierarchy levels (Admin only)
// @route   POST /api/advanced-mlm/setup-hierarchy
// @access  Private (Admin)
const setupHierarchyLevels = async (req, res) => {
    console.log("🔧 Setting up hierarchy levels...");
    console.log("User ID:", req.user.id);
    console.log("User role:", req.role);
    
    // Set a timeout for the response
    const timeout = setTimeout(() => {
        console.log("⚠️ Request timeout - taking too long");
        if (!res.headersSent) {
            res.status(408).json({
                success: false,
                message: 'Request timeout - operation taking too long'
            });
        }
    }, 30000); // 30 seconds timeout
    
    try {
        // First, test database connection
        console.log("Testing database connection...");
        const dbState = mongoose.connection.readyState;
        console.log("Database connection state:", dbState);
        
        if (dbState !== 1) {
            clearTimeout(timeout);
            return res.status(500).json({
                success: false,
                message: 'Database not connected. Please try again.',
                dbState: dbState
            });
        }
        
        // Check if levels already exist
        console.log("Checking for existing levels...");
        const existingLevels = await CoachHierarchyLevel.find({}).lean().maxTimeMS(10000);
        console.log("Found existing levels:", existingLevels.length);
        
        if (existingLevels.length > 0) {
            console.log("Levels already exist, returning existing data");
            clearTimeout(timeout);
            return res.status(400).json({
                success: false,
                message: 'Hierarchy levels already exist. Use update endpoint to modify.',
                data: existingLevels
            });
        }

        // Default hierarchy levels for MLM system
        const defaultLevels = [
            { level: 1, name: 'Bronze', description: 'Entry level coach' },
            { level: 2, name: 'Silver', description: 'Intermediate coach' },
            { level: 3, name: 'Gold', description: 'Advanced coach' },
            { level: 4, name: 'Platinum', description: 'Expert coach' },
            { level: 5, name: 'Diamond', description: 'Master coach' },
            { level: 6, name: 'Double Diamond', description: 'Elite coach' },
            { level: 7, name: 'Triple Diamond', description: 'Premier coach' },
            { level: 8, name: 'Crown Diamond', description: 'Distinguished coach' },
            { level: 9, name: 'Crown Ambassador', description: 'Honored coach' },
            { level: 10, name: 'Royal Crown Ambassador', description: 'Esteemed coach' },
            { level: 11, name: 'Imperial Crown Ambassador', description: 'Legendary coach' },
            { level: 12, name: 'Supreme Crown Ambassador', description: 'Ultimate coach' }
        ];

        console.log("Creating hierarchy levels...");
        
        // Prepare documents for bulk insertion
        const documentsToInsert = defaultLevels.map(levelData => ({
            ...levelData,
            createdBy: req.user.id,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        console.log("Prepared documents for insertion:", documentsToInsert.length);
        console.log("Attempting bulk insertion...");

        // Use bulk insertion for better performance with timeout
        const result = await CoachHierarchyLevel.insertMany(documentsToInsert, { 
            maxTimeMS: 15000 
        });
        
        console.log(`✅ Successfully created ${result.length} hierarchy levels`);
        clearTimeout(timeout);

        res.status(201).json({
            success: true,
            message: 'Hierarchy levels setup completed successfully.',
            data: result
        });

    } catch (err) {
        console.error('❌ Error setting up hierarchy levels:', err);
        clearTimeout(timeout);
        
        // Check if it's a timeout error
        if (err.message && err.message.includes('timeout')) {
            return res.status(408).json({
                success: false,
                message: 'Database operation timed out. Please try again.',
                error: err.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while setting up hierarchy levels',
            error: err.message
        });
    }
};

// @desc    Clean up database - Fix users with null selfCoachId (Admin only)
// @route   POST /api/advanced-mlm/cleanup-database
// @access  Private (Admin)
const cleanupDatabase = async (req, res) => {
    console.log("🧹 Starting database cleanup...");
    
    try {
        // Find all users with null or undefined selfCoachId
        const usersWithNullCoachId = await User.find({
            $or: [
                { selfCoachId: null },
                { selfCoachId: { $exists: false } }
            ]
        });
        
        console.log(`Found ${usersWithNullCoachId.length} users with null selfCoachId`);
        
        if (usersWithNullCoachId.length === 0) {
            return res.json({
                success: true,
                message: 'No cleanup needed. All users have valid selfCoachId values.',
                cleanedCount: 0
            });
        }
        
        // Return information about users that need manual fixing
        res.json({
            success: false,
            message: 'Found users with missing Coach IDs. These need to be fixed manually.',
            details: 'Coaches must provide their own unique Coach ID when upgrading. Cannot auto-generate IDs.',
            usersNeedingFix: usersWithNullCoachId.map(user => ({
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            })),
            totalFound: usersWithNullCoachId.length,
            instructions: [
                '1. Contact each user to provide their desired Coach ID',
                '2. Use the upgrade-to-coach endpoint with their chosen ID',
                '3. Ensure each Coach ID is unique across the system'
            ]
        });
        
    } catch (err) {
        console.error('❌ Error during database cleanup:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during database cleanup',
            error: err.message
        });
    }
};

// @desc    Health check for MLM system
// @route   GET /api/advanced-mlm/health
// @access  Public
const mlmHealthCheck = async (req, res) => {
    try {
        console.log("🏥 MLM Health Check...");
        
        // Check database connection
        const dbState = mongoose.connection.readyState;
        console.log("Database state:", dbState);
        
        // Test basic model operations
        const levelCount = await CoachHierarchyLevel.countDocuments({}).maxTimeMS(5000);
        console.log("Current hierarchy levels:", levelCount);
        
        res.json({
            success: true,
            message: 'MLM system is healthy',
            database: {
                connected: dbState === 1,
                state: dbState,
                hierarchyLevels: levelCount
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('❌ MLM Health Check failed:', err);
        res.status(500).json({
            success: false,
            message: 'MLM system health check failed',
            error: err.message
        });
    }
};

// @desc    Generate unique coach ID
// @route   POST /api/advanced-mlm/generate-coach-id
// @access  Public
const generateCoachId = async (req, res) => {
    try {
        let coachId;
        let isUnique = false;
        
        // Generate unique coach ID with W prefix
        while (!isUnique) {
            const randomNum = Math.floor(Math.random() * 9000000) + 1000000; // 7 digits
            coachId = `W${randomNum}`;
            
            // Check if ID already exists
            const existingCoach = await User.findOne({ 
                'selfCoachId': coachId,
                role: 'coach'
            });
            
            if (!existingCoach) {
                isUnique = true;
            }
        }

        res.status(200).json({
            success: true,
            message: 'Coach ID generated successfully.',
            data: { coachId }
        });
    } catch (err) {
        console.error('Error generating coach ID:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while generating coach ID'
        });
    }
};

// @desc    Get all hierarchy levels
// @route   GET /api/advanced-mlm/hierarchy-levels
// @access  Public
const getHierarchyLevels = async (req, res) => {
    try {
        const levels = await CoachHierarchyLevel.find({ isActive: true }).sort({ level: 1 });
        
        res.status(200).json({
            success: true,
            message: 'Hierarchy levels retrieved successfully.',
            data: levels
        });

    } catch (err) {
        console.error('Error getting hierarchy levels:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving hierarchy levels'
        });
    }
};

// ===== SPONSOR MANAGEMENT =====

// @desc    Search for sponsors (digital system users)
// @route   GET /api/advanced-mlm/search-sponsor
// @access  Public
const searchSponsor = async (req, res) => {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Search query must be at least 2 characters long.'
        });
    }

    try {
        const searchRegex = new RegExp(query, 'i');
        
        // Search in digital system users
        const digitalSponsors = await User.find({
            role: 'coach',
            $or: [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { selfCoachId: searchRegex }
            ],
            isActive: true
        }).select('_id name email phone selfCoachId currentLevel')
          .limit(10);

        // Search in external sponsors
        const externalSponsors = await ExternalSponsor.find({
            $or: [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex }
            ],
            isActive: true
        }).select('_id name email phone company')
          .limit(10);

        res.status(200).json({
            success: true,
            message: 'Sponsor search completed successfully.',
            data: {
                digitalSponsors,
                externalSponsors
            }
        });
    } catch (err) {
        console.error('Error searching sponsors:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while searching sponsors'
        });
    }
};

// @desc    Create external sponsor
// @route   POST /api/advanced-mlm/external-sponsor
// @access  Public
const createExternalSponsor = async (req, res) => {
    const { name, phone, email, company, notes } = req.body;
    
    if (!name || !phone) {
        return res.status(400).json({
            success: false,
            message: 'Name and phone are required fields.'
        });
    }

    try {
        // Check if external sponsor already exists
        const existingSponsor = await ExternalSponsor.findOne({
            $or: [
                { phone: phone },
                { email: email }
            ]
        });

        if (existingSponsor) {
            return res.status(400).json({
                success: false,
                message: 'External sponsor with this phone or email already exists.'
            });
        }

        const externalSponsor = new ExternalSponsor({
            name,
            phone,
            email,
            company,
            notes,
            createdBy: req.user ? req.user._id : null
        });

        await externalSponsor.save();

        res.status(201).json({
            success: true,
            message: 'External sponsor created successfully.',
            data: externalSponsor
        });
    } catch (err) {
        console.error('Error creating external sponsor:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while creating external sponsor'
        });
    }
};

// ===== HIERARCHY LOCKING =====

// @desc    Lock hierarchy after first login
// @route   POST /api/advanced-mlm/lock-hierarchy
// @access  Private (Coach)
const lockHierarchy = async (req, res) => {
    const { coachId } = req.body;
    
    if (!coachId) {
        return res.status(400).json({
            success: false,
            message: 'Coach ID is required.'
        });
    }

    try {
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found.'
            });
        }

        if (coach.hierarchyLocked) {
            return res.status(400).json({
                success: false,
                message: 'Hierarchy is already locked.'
            });
        }

        coach.hierarchyLocked = true;
        coach.hierarchyLockedAt = new Date();
        await coach.save();

        res.status(200).json({
            success: true,
            message: 'Hierarchy locked successfully.',
            data: {
                coachId: coach._id,
                hierarchyLocked: coach.hierarchyLocked,
                hierarchyLockedAt: coach.hierarchyLockedAt
            }
        });
    } catch (err) {
        console.error('Error locking hierarchy:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while locking hierarchy'
        });
    }
};

// ===== ADMIN REQUEST SYSTEM =====

// @desc    Submit admin request for hierarchy changes
// @route   POST /api/advanced-mlm/admin-request
// @access  Private (Coach)
const submitAdminRequest = async (req, res) => {
    const { 
        requestType, 
        requestedData, 
        reason, 
        supportingDocuments 
    } = req.body;
    
    const coachId = req.user._id;

    if (!requestType || !requestedData || !reason) {
        return res.status(400).json({
            success: false,
            message: 'Request type, requested data, and reason are required.'
        });
    }

    try {
        const requestId = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const adminRequest = new AdminRequest({
            requestId,
            coachId,
            requestType,
            requestedData,
            reason,
            supportingDocuments: supportingDocuments || []
        });

        await adminRequest.save();

        res.status(201).json({
            success: true,
            message: 'Admin request submitted successfully.',
            data: {
                requestId: adminRequest.requestId,
                status: adminRequest.status,
                submittedAt: adminRequest.createdAt
            }
        });
    } catch (err) {
        console.error('Error submitting admin request:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting admin request'
        });
    }
};

// @desc    Get admin requests for a coach
// @route   GET /api/advanced-mlm/admin-requests/:coachId
// @access  Private (Coach)
const getCoachAdminRequests = async (req, res) => {
    const { coachId } = req.params;
    
    try {
        const requests = await AdminRequest.find({ coachId })
            .sort({ createdAt: -1 })
            .populate('processedBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Admin requests retrieved successfully.',
            data: requests
        });
    } catch (err) {
        console.error('Error getting admin requests:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving admin requests'
        });
    }
};

// ===== ADMIN FUNCTIONS =====

// @desc    Get all pending admin requests
// @route   GET /api/advanced-mlm/admin/pending-requests
// @access  Private (Admin)
const getPendingAdminRequests = async (req, res) => {
    try {
        const requests = await AdminRequest.find({ status: 'pending' })
            .populate('coachId', 'name email selfCoachId currentLevel')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            message: 'Pending admin requests retrieved successfully.',
            data: requests
        });
    } catch (err) {
        console.error('Error getting pending admin requests:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving pending admin requests'
        });
    }
};

// @desc    Process admin request
// @route   PUT /api/advanced-mlm/admin/process-request/:requestId
// @access  Private (Admin)
const processAdminRequest = async (req, res) => {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user._id;

    if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Valid status (approved or rejected) is required.'
        });
    }

    try {
        const request = await AdminRequest.findOne({ requestId });
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Admin request not found.'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Request has already been processed.'
            });
        }

        request.status = status;
        request.adminNotes = adminNotes || '';
        request.processedBy = adminId;
        request.processedAt = new Date();

        await request.save();

        // If approved, apply the changes
        if (status === 'approved') {
            await applyHierarchyChanges(request);
        }

        res.status(200).json({
            success: true,
            message: `Admin request ${status} successfully.`,
            data: request
        });
    } catch (err) {
        console.error('Error processing admin request:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while processing admin request'
        });
    }
};

// @desc    Change coach upline (admin function)
// @route   PUT /api/advanced-mlm/admin/change-upline
// @access  Private (Admin)
const changeCoachUpline = async (req, res) => {
    const { 
        coachId, 
        newUplineId, 
        newUplineName, 
        isExternalSponsor = false 
    } = req.body;
    
    const adminId = req.user._id;

    if (!coachId || !newUplineName) {
        return res.status(400).json({
            success: false,
            message: 'Coach ID and new upline name are required.'
        });
    }

    try {
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found.'
            });
        }

        let newUplineIdToSet = null;
        let externalSponsorId = null;

        if (isExternalSponsor) {
            // Create or find external sponsor
            let externalSponsor = await ExternalSponsor.findOne({ name: newUplineName });
            
            if (!externalSponsor) {
                externalSponsor = new ExternalSponsor({
                    name: newUplineName,
                    createdBy: adminId
                });
                await externalSponsor.save();
            }
            
            externalSponsorId = externalSponsor._id;
            newUplineIdToSet = null;
        } else {
            // Validate digital system upline
            if (newUplineId) {
                const upline = await User.findById(newUplineId);
                if (!upline || upline.role !== 'coach') {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid upline coach selected.'
                    });
                }
                newUplineIdToSet = newUplineId;
                externalSponsorId = null;
            }
        }

        // Update coach's upline
        coach.sponsorId = newUplineIdToSet;
        coach.externalSponsorId = externalSponsorId;
        await coach.save();

        res.status(200).json({
            success: true,
            message: 'Coach upline changed successfully.',
            data: {
                coachId: coach._id,
                newUplineId: newUplineIdToSet,
                newUplineName,
                isExternalSponsor
            }
        });
    } catch (err) {
        console.error('Error changing coach upline:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while changing coach upline'
        });
    }
};

// ===== COMMISSION SYSTEM =====

// @desc    Get commission settings
// @route   GET /api/advanced-mlm/commission-settings
// @access  Private (Admin)
const getCommissionSettings = async (req, res) => {
    try {
        const settings = await CommissionSettings.findOne({ isActive: true })
            .sort({ effectiveFrom: -1 });

        res.status(200).json({
            success: true,
            message: 'Commission settings retrieved successfully.',
            data: settings
        });
    } catch (err) {
        console.error('Error getting commission settings:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving commission settings'
        });
    }
};

// @desc    Update commission settings
// @route   PUT /api/advanced-mlm/commission-settings
// @access  Private (Admin)
const updateCommissionSettings = async (req, res) => {
    const { 
        commissionPercentage, 
        minimumSubscriptionAmount, 
        maximumCommissionAmount,
        notes 
    } = req.body;
    
    const adminId = req.user._id;

    if (!commissionPercentage || commissionPercentage < 0 || commissionPercentage > 100) {
        return res.status(400).json({
            success: false,
            message: 'Valid commission percentage (0-100) is required.'
        });
    }

    try {
        // Deactivate current settings
        await CommissionSettings.updateMany(
            { isActive: true },
            { 
                isActive: false,
                effectiveTo: new Date(),
                lastModifiedBy: adminId
            }
        );

        // Create new settings
        const newSettings = new CommissionSettings({
            settingId: `SET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            commissionPercentage,
            minimumSubscriptionAmount: minimumSubscriptionAmount || 0,
            maximumCommissionAmount: maximumCommissionAmount || null,
            effectiveFrom: new Date(),
            createdBy: adminId,
            notes: notes || ''
        });

        await newSettings.save();

        res.status(200).json({
            success: true,
            message: 'Commission settings updated successfully.',
            data: newSettings
        });
    } catch (err) {
        console.error('Error updating commission settings:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while updating commission settings'
        });
    }
};

// @desc    Calculate and create commission for subscription
// @route   POST /api/advanced-mlm/calculate-commission
// @access  Private (Admin)
const calculateCommission = async (req, res) => {
    const { subscriptionId, referredBy } = req.body;

    if (!subscriptionId || !referredBy) {
        return res.status(400).json({
            success: false,
            message: 'Subscription ID and referred by coach ID are required.'
        });
    }

    try {
        // Get subscription details
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found.'
            });
        }

        // Get referring coach
        const coach = await User.findById(referredBy);
        if (!coach || coach.role !== 'coach') {
            return res.status(400).json({
                success: false,
                message: 'Invalid referring coach.'
            });
        }

        // Check if coach is active
        if (!coach.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Commission cannot be calculated for inactive coaches.'
            });
        }

        // Get current commission settings
        const settings = await CommissionSettings.findOne({ isActive: true });
        if (!settings) {
            return res.status(400).json({
                success: false,
                message: 'Commission settings not configured.'
            });
        }

        // Check minimum subscription amount
        if (subscription.planDetails.price < settings.minimumSubscriptionAmount) {
            return res.status(400).json({
                success: false,
                message: `Subscription amount must be at least ${settings.minimumSubscriptionAmount} to qualify for commission.`
            });
        }

        // Calculate commission
        let commissionAmount = (subscription.planDetails.price * settings.commissionPercentage) / 100;
        
        // Apply maximum commission limit if set
        if (settings.maximumCommissionAmount && commissionAmount > settings.maximumCommissionAmount) {
            commissionAmount = settings.maximumCommissionAmount;
        }

        // Check if commission already exists
        const existingCommission = await Commission.findOne({
            subscriptionId,
            referredBy
        });

        if (existingCommission) {
            return res.status(400).json({
                success: false,
                message: 'Commission for this subscription has already been calculated.'
            });
        }

        // Create commission record
        const commission = new Commission({
            commissionId: `COM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            coachId: referredBy,
            subscriptionId,
            referredBy,
            subscriptionAmount: subscription.planDetails.price,
            commissionPercentage: settings.commissionPercentage,
            commissionAmount,
            currency: subscription.planDetails.currency,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            status: 'pending'
        });

        await commission.save();

        res.status(201).json({
            success: true,
            message: 'Commission calculated and created successfully.',
            data: {
                commissionId: commission.commissionId,
                commissionAmount,
                status: commission.status
            }
        });
    } catch (err) {
        console.error('Error calculating commission:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while calculating commission'
        });
    }
};

// @desc    Get coach commissions
// @route   GET /api/advanced-mlm/commissions/:coachId
// @access  Private (Coach)
const getCoachCommissions = async (req, res) => {
    const { coachId } = req.params;
    const { status, month, year } = req.query;

    try {
        let query = { coachId };
        
        if (status) query.status = status;
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);

        const commissions = await Commission.find(query)
            .populate('subscriptionId', 'planDetails')
            .sort({ createdAt: -1 });

        // Calculate totals
        const totalEarned = commissions
            .filter(c => c.status === 'paid')
            .reduce((sum, c) => sum + c.commissionAmount, 0);

        const pendingAmount = commissions
            .filter(c => c.status === 'pending')
            .reduce((sum, c) => sum + c.commissionAmount, 0);

        res.status(200).json({
            success: true,
            message: 'Commissions retrieved successfully.',
            data: {
                commissions,
                summary: {
                    totalEarned,
                    pendingAmount,
                    totalCommissions: commissions.length
                }
            }
        });
    } catch (err) {
        console.error('Error getting coach commissions:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving commissions'
        });
    }
};

// @desc    Process monthly commission payments
// @route   POST /api/advanced-mlm/process-monthly-commissions
// @access  Private (Admin)
const processMonthlyCommissions = async (req, res) => {
    const { month, year } = req.body;
    const adminId = req.user._id;

    if (!month || !year) {
        return res.status(400).json({
            success: false,
            message: 'Month and year are required.'
        });
    }

    try {
        // Get all pending commissions for the month
        const pendingCommissions = await Commission.find({
            month: parseInt(month),
            year: parseInt(year),
            status: 'pending'
        }).populate('coachId', 'name email isActive');

        if (pendingCommissions.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No pending commissions found for the specified month.',
                data: { processedCount: 0 }
            });
        }

        let processedCount = 0;
        let platformRevenue = 0;

        for (const commission of pendingCommissions) {
            const coach = commission.coachId;
            
            if (coach.isActive) {
                // Mark commission as approved for active coaches
                commission.status = 'approved';
                commission.paymentDate = new Date();
                await commission.save();
                processedCount++;
            } else {
                // For inactive coaches, transfer commission to platform
                commission.status = 'cancelled';
                commission.notes = 'Commission transferred to platform due to inactive coach';
                await commission.save();
                platformRevenue += commission.commissionAmount;
            }
        }

        res.status(200).json({
            success: true,
            message: 'Monthly commissions processed successfully.',
            data: {
                processedCount,
                platformRevenue,
                totalCommissions: pendingCommissions.length
            }
        });
    } catch (err) {
        console.error('Error processing monthly commissions:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while processing monthly commissions'
        });
    }
};

// ===== INTEGRATED EXISTING MLM FUNCTIONALITY =====

// @desc    Add a new coach to downline
// @route   POST /api/advanced-mlm/downline
// @access  Private
const addDownline = async (req, res) => {
    console.log('[Advanced MLM Controller] Request body:', req.body);
    
    const { name, email, password, sponsorId } = req.body;

    if (!email || !password || !name || !sponsorId) {
        return res.status(400).json({ 
            success: false,
            message: 'Please enter all required fields: name, email, password, and sponsorId.' 
        });
    }

    try {
        const sponsor = await User.findById(sponsorId);
        if (!sponsor) {
            return res.status(404).json({ 
                success: false,
                message: 'Sponsor not found. Cannot add to downline.' 
            });
        }
        
        let coach = await User.findOne({ email, role: 'coach' });
        if (coach) {
            return res.status(400).json({ 
                success: false,
                message: 'Coach with this email already exists.' 
            });
        }

        // Create coach using User model with role discriminator
        const newCoach = new User({
            name,
            email,
            password,
            role: 'coach',
            sponsorId,
            selfCoachId: null, // Will be set during hierarchy setup
            currentLevel: 1, // Default to level 1
            hierarchyLocked: false,
            isVerified: false
        });
        
        await newCoach.save();

        // Initialize performance tracking for new coach
        const performanceRecord = new CoachPerformance({
            coachId: newCoach._id,
            sponsorId: sponsorId
        });
        await performanceRecord.save();

        res.status(201).json({
            success: true,
            message: 'Coach successfully added to downline! Email verification required on first login.',
            data: {
                coachId: newCoach._id,
                sponsorId: newCoach.sponsorId,
                name: newCoach.name,
                email: newCoach.email
            }
        });

    } catch (err) {
        console.error('Error adding downline:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while adding coach to downline'
        });
    }
};

// @desc    Get direct downline of a coach
// @route   GET /api/advanced-mlm/downline/:sponsorId
// @access  Private
const getDownline = async (req, res) => {
    const { sponsorId } = req.params;
    const { includePerformance = 'false' } = req.query;

    try {
        const downline = await User.find({ sponsorId, role: 'coach' }).select('-password -__v');
        
        if (downline.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No downline found for this coach.' 
            });
        }

        let result = { downline };

        // Include performance data if requested
        if (includePerformance === 'true') {
            const performanceData = await CoachPerformance.find({ 
                coachId: { $in: downline.map(d => d._id) } 
            });
            
            result.downlineWithPerformance = downline.map(coach => {
                const performance = performanceData.find(p => p.coachId.toString() === coach._id.toString());
                return {
                    ...coach.toObject(),
                    performance: performance ? {
                        currentLevel: performance.performanceRating.level,
                        performanceScore: performance.performanceRating.score,
                        isActive: performance.isActive,
                        lastActivity: performance.lastActivity,
                        activityStreak: performance.activityStreak
                    } : null
                };
            });
        }

        res.status(200).json({
            success: true,
            message: 'Downline retrieved successfully.',
            data: result
        });

    } catch (err) {
        console.error('Error getting downline:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving downline'
        });
    }
};

// @desc    Get complete downline hierarchy
// @route   GET /api/advanced-mlm/hierarchy/:coachId
// @access  Private
const getDownlineHierarchy = async (req, res) => {
    const { coachId } = req.params;
    const { levels = 5, includePerformance = 'false' } = req.query;

    try {
        const sponsor = await User.findById(coachId);
        if (!sponsor) {
            return res.status(404).json({ 
                success: false,
                message: 'Sponsor not found.' 
            });
        }

        const hierarchy = await User.aggregate([
            { $match: { _id: sponsor._id, role: 'coach' } },
            {
                $graphLookup: {
                    from: 'users',
                    startWith: '$_id',
                    connectFromField: '_id',
                    connectToField: 'sponsorId',
                    as: 'downlineHierarchy',
                    depthField: 'level',
                    maxDepth: parseInt(levels)
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    downlineHierarchy: {
                        $map: {
                            input: "$downlineHierarchy",
                            as: "downlineMember",
                            in: {
                                _id: "$$downlineMember._id",
                                name: "$$downlineMember.name",
                                email: "$$downlineMember.email",
                                level: "$$downlineMember.level",
                                isActive: "$$downlineMember.isActive",
                                lastActiveAt: "$$downlineMember.lastActiveAt"
                            }
                        }
                    }
                }
            }
        ]);

        if (!hierarchy || hierarchy.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No downline hierarchy found.' 
            });
        }

        let result = hierarchy[0];

        // Include performance data if requested
        if (includePerformance === 'true') {
            const downlineIds = result.downlineHierarchy.map(d => d._id);
            const performanceData = await CoachPerformance.find({ 
                coachId: { $in: downlineIds } 
            });

            result.downlineHierarchy = result.downlineHierarchy.map(member => {
                const performance = performanceData.find(p => p.coachId.toString() === member._id.toString());
                return {
                    ...member,
                    performance: performance ? {
                        currentLevel: performance.performanceRating.level,
                        performanceScore: performance.performanceRating.score,
                        isActive: performance.isActive,
                        lastActivity: performance.lastActivity,
                        activityStreak: performance.activityStreak
                    } : null
                };
            });
        }

        res.status(200).json({
            success: true,
            message: 'Downline hierarchy retrieved successfully.',
            data: result
        });

    } catch (err) {
        console.error('Error getting hierarchy:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving hierarchy'
        });
    }
};

// @desc    Get team performance summary
// @route   GET /api/advanced-mlm/team-performance/:sponsorId
// @access  Private
const getTeamPerformance = async (req, res) => {
    const { sponsorId } = req.params;
    const { period = 'monthly', startDate, endDate } = req.query;

    try {
        // Get all downline coaches
        const downline = await User.find({ sponsorId, role: 'coach' }).select('_id name email');
        
        if (downline.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No team members found.'
            });
        }

        const downlineIds = downline.map(d => d._id);

        // Calculate date range
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        } else {
            // Default to current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            dateFilter = {
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            };
        }

        // Get performance data
        const performanceData = await CoachPerformance.find({ 
            coachId: { $in: downlineIds } 
        });

        // Get leads data
        const leadsData = await Lead.aggregate([
            { $match: { coachId: { $in: downlineIds }, ...dateFilter } },
            {
                $group: {
                    _id: '$coachId',
                    totalLeads: { $sum: 1 },
                    qualifiedLeads: { 
                        $sum: { 
                            $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] 
                        } 
                    },
                    convertedLeads: { 
                        $sum: { 
                            $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] 
                        } 
                    }
                }
            }
        ]);

        // Get sales data
        const salesData = await Payment.aggregate([
            { $match: { coachId: { $in: downlineIds }, status: 'completed', ...dateFilter } },
            {
                $group: {
                    _id: '$coachId',
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' },
                    averageDealSize: { $avg: '$amount' }
                }
            }
        ]);

        // Get tasks data
        const tasksData = await Task.aggregate([
            { $match: { assignedTo: { $in: downlineIds }, ...dateFilter } },
            {
                $group: {
                    _id: '$assignedTo',
                    totalTasks: { $sum: 1 },
                    completedTasks: { 
                        $sum: { 
                            $cond: { 
                                if: { $eq: ['$status', 'Done'] }, 
                                then: 1, 
                                else: 0 
                            } 
                        } 
                    }
                }
            }
        ]);

        // Compile team performance summary
        const teamSummary = {
            teamSize: downline.length,
            totalLeads: 0,
            totalSales: 0,
            totalRevenue: 0,
            averageConversionRate: 0,
            topPerformers: [],
            underPerformers: [],
            memberDetails: []
        };

        downline.forEach(member => {
            const leads = leadsData.find(l => l._id.toString() === member._id.toString()) || { totalLeads: 0, qualifiedLeads: 0, convertedLeads: 0 };
            const sales = salesData.find(s => s._id.toString() === member._id.toString()) || { totalSales: 0, totalRevenue: 0, averageDealSize: 0 };
            const tasks = tasksData.find(t => t._id.toString() === member._id.toString()) || { totalTasks: 0, completedTasks: 0 };
            const performance = performanceData.find(p => p.coachId.toString() === member._id.toString());

            const conversionRate = leads.totalLeads > 0 ? (leads.convertedLeads / leads.totalLeads) * 100 : 0;
            const taskCompletionRate = tasks.totalTasks > 0 ? (tasks.completedTasks / tasks.totalTasks) * 100 : 0;

            const memberDetail = {
                coachId: member._id,
                name: member.name,
                email: member.email,
                leads: {
                    total: leads.totalLeads,
                    qualified: leads.qualifiedLeads,
                    converted: leads.convertedLeads,
                    conversionRate: conversionRate
                },
                sales: {
                    total: sales.totalSales,
                    revenue: sales.totalRevenue,
                    averageDealSize: sales.averageDealSize
                },
                tasks: {
                    total: tasks.totalTasks,
                    completed: tasks.completedTasks,
                    completionRate: taskCompletionRate
                },
                performance: performance ? {
                    level: performance.performanceRating.level,
                    score: performance.performanceRating.score,
                    isActive: performance.isActive,
                    lastActivity: performance.lastActivity
                } : null
            };

            teamSummary.memberDetails.push(memberDetail);
            teamSummary.totalLeads += leads.totalLeads;
            teamSummary.totalSales += sales.totalSales;
            teamSummary.totalRevenue += sales.totalRevenue;
        });

        // Calculate averages and identify top/under performers
        teamSummary.averageConversionRate = teamSummary.totalLeads > 0 ? 
            (teamSummary.memberDetails.reduce((sum, m) => sum + m.leads.converted, 0) / teamSummary.totalLeads) * 100 : 0;

        // Sort by performance score for top/under performers
        const sortedMembers = teamSummary.memberDetails.sort((a, b) => 
            (b.performance?.score || 0) - (a.performance?.score || 0)
        );

        teamSummary.topPerformers = sortedMembers.slice(0, 3);
        teamSummary.underPerformers = sortedMembers.slice(-3).reverse();

        res.status(200).json({
            success: true,
            message: 'Team performance summary retrieved successfully.',
            data: {
                period,
                dateRange: dateFilter,
                summary: teamSummary
            }
        });

    } catch (err) {
        console.error('Error getting team performance:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving team performance'
        });
    }
};

// @desc    Generate comprehensive team report
// @route   POST /api/advanced-mlm/generate-report
// @access  Private
const generateTeamReport = async (req, res) => {
    const { sponsorId, reportType, period, startDate, endDate, config } = req.body;

    try {
        const reportId = `REP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create report record
        const report = new CoachReport({
            reportId,
            generatedBy: sponsorId,
            reportType,
            reportPeriod: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                period
            },
            config: config || {}
        });

        await report.save();

        // Generate report data asynchronously
        setTimeout(async () => {
            try {
                await generateReportData(reportId, sponsorId, reportType, startDate, endDate);
                
                // Update report status
                await CoachReport.findOneAndUpdate(
                    { reportId },
                    { status: 'completed' }
                );
            } catch (error) {
                console.error('Error generating report data:', error);
                await CoachReport.findOneAndUpdate(
                    { reportId },
                    { status: 'failed' }
                );
            }
        }, 100);

        res.status(201).json({
            success: true,
            message: 'Report generation started successfully.',
            data: {
                reportId,
                status: 'generating',
                estimatedCompletion: '2-5 minutes'
            }
        });

    } catch (err) {
        console.error('Error generating report:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while generating report'
        });
    }
};

// @desc    Get generated reports
// @route   GET /api/advanced-mlm/reports/:sponsorId
// @access  Private
const getReports = async (req, res) => {
    const { sponsorId } = req.params;
    const { status, reportType, limit = 10 } = req.query;

    try {
        let query = { generatedBy: sponsorId };
        
        if (status) query.status = status;
        if (reportType) query.reportType = reportType;

        const reports = await CoachReport.find(query)
            .sort({ generatedAt: -1 })
            .limit(parseInt(limit))
            .select('-reportData');

        res.status(200).json({
            success: true,
            message: 'Reports retrieved successfully.',
            data: reports
        });

    } catch (err) {
        console.error('Error getting reports:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving reports'
        });
    }
};

// @desc    Get specific report details
// @route   GET /api/advanced-mlm/reports/detail/:reportId
// @access  Private
const getReportDetail = async (req, res) => {
    const { reportId } = req.params;

    try {
        const report = await CoachReport.findOne({ reportId });
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Report details retrieved successfully.',
            data: report
        });

    } catch (err) {
        console.error('Error getting report detail:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving report details'
        });
    }
};

// Helper function to generate report data
async function generateReportData(reportId, sponsorId, reportType, startDate, endDate) {
    // This would contain the logic to generate comprehensive report data
    // Implementation would depend on the specific report type
    console.log(`Generating report data for ${reportId}`);
    
    // Placeholder for actual report generation logic
    const reportData = {
        individualMetrics: {},
        teamMetrics: {},
        comparisons: {},
        trends: {},
        goalProgress: {},
        breakdown: {},
        insights: []
    };

    await CoachReport.findOneAndUpdate(
        { reportId },
        { 
            reportData,
            status: 'completed'
        }
    );
}

// ===== HELPER FUNCTIONS =====

// Apply hierarchy changes when admin request is approved
async function applyHierarchyChanges(request) {
    try {
        const coach = await User.findById(request.coachId);
        if (!coach) return;

        const { requestedData } = request;

        switch (request.requestType) {
            case 'level_change':
                if (requestedData.currentLevel) {
                    coach.currentLevel = requestedData.currentLevel;
                }
                break;
            case 'sponsor_change':
                if (requestedData.sponsorId) {
                    coach.sponsorId = requestedData.sponsorId;
                    coach.externalSponsorId = null;
                }
                if (requestedData.externalSponsorId) {
                    coach.externalSponsorId = requestedData.externalSponsorId;
                    coach.sponsorId = null;
                }
                break;
            case 'team_rank_change':
                if (requestedData.teamRankName !== undefined) {
                    coach.teamRankName = requestedData.teamRankName;
                }
                break;
            case 'president_team_rank_change':
                if (requestedData.presidentTeamRankName !== undefined) {
                    coach.presidentTeamRankName = requestedData.presidentTeamRankName;
                }
                break;
        }

        await coach.save();
    } catch (error) {
        console.error('Error applying hierarchy changes:', error);
    }
}

module.exports = {
    // Health Check
    mlmHealthCheck,
    
    // Hierarchy Level Management
    setupHierarchyLevels,
    getHierarchyLevels,
    generateCoachId,
    cleanupDatabase,
    
    // Sponsor Management
    searchSponsor,
    createExternalSponsor,
    
    // Hierarchy Locking
    lockHierarchy,
    
    // Admin Request System
    submitAdminRequest,
    getCoachAdminRequests,
    
    // Admin Functions
    getPendingAdminRequests,
    processAdminRequest,
    changeCoachUpline,
    
    // Commission System
    getCommissionSettings,
    updateCommissionSettings,
    calculateCommission,
    getCoachCommissions,
    processMonthlyCommissions,
    
    // ===== INTEGRATED EXISTING MLM FUNCTIONALITY =====
    addDownline,
    getDownline,
    getDownlineHierarchy,
    getTeamPerformance,
    generateTeamReport,
    getReports,
    getReportDetail
};
