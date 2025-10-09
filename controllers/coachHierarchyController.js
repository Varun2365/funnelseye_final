const { 
    User, 
    Coach, 
    CoachHierarchyLevel, 
    AdminRequest, 
    ExternalSponsor 
} = require('../schema');

// @desc    Get all hierarchy levels
// @route   GET /api/coach-hierarchy/levels
// @access  Public
const getHierarchyLevels = async (req, res) => {
    try {
        const levels = await CoachHierarchyLevel.find({ isActive: true })
            .sort({ level: 1 })
            .select('level name description');
        
        res.status(200).json({
            success: true,
            data: levels
        });
    } catch (error) {
        console.error('Error fetching hierarchy levels:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching hierarchy levels'
        });
    }
};

// @desc    Generate unique coach ID
// @route   POST /api/coach-hierarchy/generate-coach-id
// @access  Public
const generateCoachId = async (req, res) => {
    try {
        let coachId;
        let isUnique = false;
        
        while (!isUnique) {
            // Generate format: COACH-YYYY-XXXX (e.g., COACH-2024-0001)
            const year = new Date().getFullYear();
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            coachId = `COACH-${year}-${randomNum}`;
            
            // Check if this ID already exists
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
            data: { coachId }
        });
    } catch (error) {
        console.error('Error generating coach ID:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating coach ID'
        });
    }
};

// @desc    Search for sponsor by name or ID
// @route   GET /api/coach-hierarchy/search-sponsor
// @access  Public
const searchSponsor = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        // Search in digital system users
        const digitalSponsors = await User.find({
            role: 'coach',
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { 'selfCoachId': { $regex: query, $options: 'i' } }
            ]
        }).select('_id name email selfCoachId currentLevel');
        
        // Search in external sponsors
        const externalSponsors = await ExternalSponsor.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('_id name phone email');
        
        res.status(200).json({
            success: true,
            data: {
                digitalSponsors,
                externalSponsors
            }
        });
    } catch (error) {
        console.error('Error searching sponsors:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching sponsors'
        });
    }
};

// @desc    Create external sponsor
// @route   POST /api/coach-hierarchy/external-sponsor
// @access  Public
const createExternalSponsor = async (req, res) => {
    try {
        const { name, phone, email, notes } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Sponsor name is required'
            });
        }
        
        const externalSponsor = new ExternalSponsor({
            name,
            phone,
            email,
            notes,
            createdBy: req.user ? req.coachId : null
        });
        
        await externalSponsor.save();
        
        res.status(201).json({
            success: true,
            message: 'External sponsor created successfully',
            data: externalSponsor
        });
    } catch (error) {
        console.error('Error creating external sponsor:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating external sponsor'
        });
    }
};

// @desc    Coach signup with hierarchy details
// @route   POST /api/coach-hierarchy/signup
// @access  Public
const coachSignupWithHierarchy = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            selfCoachId,
            currentLevel,
            sponsorId,
            externalSponsorId,
            teamRankName,
            presidentTeamRankName
        } = req.body;
        
        // Validate required fields
        if (!name || !email || !password || !selfCoachId || !currentLevel) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, email, password, selfCoachId, currentLevel'
            });
        }
        
        // Validate level range
        if (currentLevel < 1 || currentLevel > 12) {
            return res.status(400).json({
                success: false,
                message: 'Current level must be between 1 and 12'
            });
        }
        
        // Check if coach ID already exists
        const existingCoachId = await User.findOne({ 
            'selfCoachId': selfCoachId,
            role: 'coach'
        });
        
        if (existingCoachId) {
            return res.status(400).json({
                success: false,
                message: 'Coach ID already exists'
            });
        }
        
        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        // Validate sponsor if provided
        if (sponsorId) {
            const sponsor = await User.findById(sponsorId);
            if (!sponsor || sponsor.role !== 'coach') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid sponsor ID'
                });
            }
        }
        
        // Validate external sponsor if provided
        if (externalSponsorId) {
            const externalSponsor = await ExternalSponsor.findById(externalSponsorId);
            if (!externalSponsor) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid external sponsor ID'
                });
            }
        }
        
        // Create new coach with hierarchy details
        const newCoach = new User({
            name,
            email,
            password,
            role: 'coach',
            selfCoachId,
            currentLevel,
            sponsorId: sponsorId || null,
            externalSponsorId: externalSponsorId || null,
            teamRankName: teamRankName || '',
            presidentTeamRankName: presidentTeamRankName || '',
            hierarchyLocked: false,
            isVerified: false
        });
        
        await newCoach.save();
        
        res.status(201).json({
            success: true,
            message: 'Coach registered successfully with hierarchy details',
            data: {
                coachId: newCoach._id,
                selfCoachId: newCoach.selfCoachId,
                currentLevel: newCoach.currentLevel,
                sponsorId: newCoach.sponsorId,
                externalSponsorId: newCoach.externalSponsorId
            }
        });
        
    } catch (error) {
        console.error('Error during coach signup with hierarchy:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during coach registration'
        });
    }
};

// @desc    Lock hierarchy after first login
// @route   POST /api/coach-hierarchy/lock
// @access  Private
const lockHierarchy = async (req, res) => {
    try {
        const coachId = req.coachId;
        
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }
        
        if (coach.hierarchyLocked) {
            return res.status(400).json({
                success: false,
                message: 'Hierarchy is already locked'
            });
        }
        
        coach.hierarchyLocked = true;
        coach.hierarchyLockedAt = new Date();
        await coach.save();
        
        res.status(200).json({
            success: true,
            message: 'Hierarchy locked successfully',
            data: {
                hierarchyLocked: coach.hierarchyLocked,
                hierarchyLockedAt: coach.hierarchyLockedAt
            }
        });
        
    } catch (error) {
        console.error('Error locking hierarchy:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while locking hierarchy'
        });
    }
};

// @desc    Submit admin request for hierarchy change
// @route   POST /api/coach-hierarchy/admin-request
// @access  Private
const submitAdminRequest = async (req, res) => {
    try {
        const coachId = req.coachId;
        const { requestType, requestedData, reason } = req.body;
        
        if (!requestType || !requestedData || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide requestType, requestedData, and reason'
            });
        }
        
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }
        
        // Get current hierarchy data
        const currentData = {
            selfCoachId: coach.selfCoachId,
            currentLevel: coach.currentLevel,
            sponsorId: coach.sponsorId,
            externalSponsorId: coach.externalSponsorId,
            teamRankName: coach.teamRankName,
            presidentTeamRankName: coach.presidentTeamRankName
        };
        
        const adminRequest = new AdminRequest({
            coachId,
            requestType,
            currentData,
            requestedData,
            reason
        });
        
        await adminRequest.save();
        
        res.status(201).json({
            success: true,
            message: 'Admin request submitted successfully',
            data: {
                requestId: adminRequest._id,
                status: adminRequest.status
            }
        });
        
    } catch (error) {
        console.error('Error submitting admin request:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting admin request'
        });
    }
};

// @desc    Get coach hierarchy details
// @route   GET /api/coach-hierarchy/details
// @access  Private
const getHierarchyDetails = async (req, res) => {
    try {
        const coachId = req.coachId;
        
        const coach = await User.findById(coachId)
            .populate('sponsorId', 'name email selfCoachId currentLevel')
            .populate('externalSponsorId', 'name phone email');
        
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }
        
        // Get level name
        const levelInfo = await CoachHierarchyLevel.findOne({ level: coach.currentLevel });
        
        const hierarchyData = {
            selfCoachId: coach.selfCoachId,
            currentLevel: coach.currentLevel,
            levelName: levelInfo ? levelInfo.name : 'Unknown',
            sponsorId: coach.sponsorId,
            externalSponsorId: coach.externalSponsorId,
            teamRankName: coach.teamRankName,
            presidentTeamRankName: coach.presidentTeamRankName,
            hierarchyLocked: coach.hierarchyLocked,
            hierarchyLockedAt: coach.hierarchyLockedAt
        };
        
        res.status(200).json({
            success: true,
            data: hierarchyData
        });
        
    } catch (error) {
        console.error('Error fetching hierarchy details:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching hierarchy details'
        });
    }
};

// @desc    Get pending admin requests (Admin only)
// @route   GET /api/coach-hierarchy/admin-requests
// @access  Private (Admin)
const getAdminRequests = async (req, res) => {
    try {
        const requests = await AdminRequest.find({ status: 'pending' })
            .populate('coachId', 'name email selfCoachId')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: requests
        });
        
    } catch (error) {
        console.error('Error fetching admin requests:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching admin requests'
        });
    }
};

// @desc    Process admin request (Admin only)
// @route   PUT /api/coach-hierarchy/admin-request/:requestId
// @access  Private (Admin)
const processAdminRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, adminNotes } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either approved or rejected'
            });
        }
        
        const request = await AdminRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Admin request not found'
            });
        }
        
        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Request has already been processed'
            });
        }
        
        request.status = status;
        request.adminNotes = adminNotes;
        request.processedBy = req.coachId;
        request.processedAt = new Date();
        
        // If approved, update coach hierarchy
        if (status === 'approved') {
            const coach = await User.findById(request.coachId);
            if (coach) {
                Object.assign(coach, request.requestedData);
                await coach.save();
            }
        }
        
        await request.save();
        
        res.status(200).json({
            success: true,
            message: `Admin request ${status} successfully`,
            data: request
        });
        
    } catch (error) {
        console.error('Error processing admin request:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing admin request'
        });
    }
};

module.exports = {
    getHierarchyLevels,
    generateCoachId,
    searchSponsor,
    createExternalSponsor,
    coachSignupWithHierarchy,
    lockHierarchy,
    submitAdminRequest,
    getHierarchyDetails,
    getAdminRequests,
    processAdminRequest
};
