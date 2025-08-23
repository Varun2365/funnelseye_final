const leadMagnetsService = require('../services/leadMagnetsService');
const asyncHandler = require('../middleware/async');

// Get all lead magnets for a coach
exports.getCoachLeadMagnets = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const leadMagnets = await leadMagnetsService.getCoachLeadMagnets(coachId);

    res.json({
        success: true,
        data: leadMagnets
    });
});

// Update coach's lead magnet settings
exports.updateCoachLeadMagnets = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { leadMagnetSettings } = req.body;

    const updatedLeadMagnets = await leadMagnetsService.updateCoachLeadMagnets(
        coachId, 
        leadMagnetSettings
    );

    res.json({
        success: true,
        data: updatedLeadMagnets,
        message: 'Lead magnet settings updated successfully'
    });
});

// Generate AI Diet Plan via WhatsApp
exports.generateAIDietPlan = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { leadId, userPreferences } = req.body;

    // Validate leadId
    if (!leadId) {
        return res.status(400).json({
            success: false,
            message: 'leadId is required'
        });
    }

    // Validate leadId format (should be a valid MongoDB ObjectId)
    if (!leadId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid leadId format'
        });
    }

    console.log(`[generateAIDietPlan] Generating diet plan for leadId: ${leadId}, coachId: ${coachId}`);

    try {
        const dietPlan = await leadMagnetsService.generateAIDietPlan(
            coachId,
            leadId,
            userPreferences
        );

        res.json({
            success: true,
            data: dietPlan,
            message: 'AI diet plan generated successfully'
        });
    } catch (error) {
        console.error('[generateAIDietPlan] Error:', error);
        
        if (error.message === 'Lead not found') {
            return res.status(404).json({
                success: false,
                message: 'Lead not found',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error generating AI diet plan',
            error: error.message
        });
    }
});

// Calculate BMI and get recommendations
exports.calculateBMIAndRecommendations = asyncHandler(async (req, res, next) => {
    const { weight, height, age, gender, activityLevel } = req.body;

    const bmiResults = await leadMagnetsService.calculateBMIAndRecommendations(
        weight,
        height,
        age,
        gender,
        activityLevel
    );

    res.json({
        success: true,
        data: bmiResults,
        message: 'BMI calculated successfully'
    });
});

// Generate e-book content
exports.generateEbookContent = asyncHandler(async (req, res, next) => {
    const { ebookType, userData } = req.body;

    const ebookContent = await leadMagnetsService.generateEbookContent(
        ebookType,
        userData
    );

    res.json({
        success: true,
        data: ebookContent,
        message: 'E-book content generated successfully'
    });
});

// Calculate workout metrics
exports.calculateWorkoutMetrics = asyncHandler(async (req, res, next) => {
    const { age, weight, height, gender, activityLevel, exerciseData } = req.body;

    const workoutMetrics = leadMagnetsService.calculateWorkoutMetrics(
        age,
        weight,
        height,
        gender,
        activityLevel,
        exerciseData
    );

    res.json({
        success: true,
        data: workoutMetrics,
        message: 'Workout metrics calculated successfully'
    });
});

// Track progress
exports.trackProgress = asyncHandler(async (req, res, next) => {
    const { leadId, progressData } = req.body;

    const progressResults = await leadMagnetsService.trackProgress(
        leadId,
        progressData
    );

    res.json({
        success: true,
        data: progressResults,
        message: 'Progress tracked successfully'
    });
});

// Analyze sleep quality
exports.analyzeSleepQuality = asyncHandler(async (req, res, next) => {
    const { sleepData } = req.body;

    const sleepAnalysis = await leadMagnetsService.analyzeSleepQuality(sleepData);

    res.json({
        success: true,
        data: sleepAnalysis,
        message: 'Sleep quality analyzed successfully'
    });
});

// Assess stress level
exports.assessStressLevel = asyncHandler(async (req, res, next) => {
    const { stressResponses } = req.body;

    const stressAssessment = await leadMagnetsService.assessStressLevel(stressResponses);

    res.json({
        success: true,
        data: stressAssessment,
        message: 'Stress level assessed successfully'
    });
});

// Get available lead magnets
exports.getAvailableLeadMagnets = asyncHandler(async (req, res, next) => {
    const availableMagnets = Object.keys(leadMagnetsService.availableLeadMagnets).map(magnetId => ({
        id: magnetId,
        ...leadMagnetsService.availableLeadMagnets[magnetId]
    }));

    res.json({
        success: true,
        data: availableMagnets,
        message: 'Available lead magnets retrieved successfully'
    });
});

// Get lead magnet analytics
exports.getLeadMagnetAnalytics = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { timeRange = 30 } = req.query;

    // This would typically fetch analytics from the database
    // For now, returning placeholder data
    const analytics = {
        totalInteractions: 150,
        mostPopularMagnet: 'ai_diet_planner',
        conversionRate: 0.25,
        averageEngagementTime: 8.5,
        topPerformingMagnets: [
            { id: 'ai_diet_planner', interactions: 45, conversions: 12 },
            { id: 'bmi_calculator', interactions: 38, conversions: 8 },
            { id: 'fitness_ebook', interactions: 32, conversions: 6 }
        ],
        interactionsByDay: [
            { date: '2024-01-01', interactions: 5 },
            { date: '2024-01-02', interactions: 8 },
            { date: '2024-01-03', interactions: 12 }
        ]
    };

    res.json({
        success: true,
        data: analytics,
        message: 'Lead magnet analytics retrieved successfully'
    });
});

// Get lead magnet interaction history for a lead
exports.getLeadMagnetHistory = asyncHandler(async (req, res, next) => {
    const { leadId } = req.params;

    // This would typically fetch from the Lead schema
    // For now, returning placeholder data
    const interactionHistory = [
        {
            type: 'ai_diet_planner',
            timestamp: new Date('2024-01-01T10:00:00Z'),
            data: { preferences: { goals: 'weight_loss' } }
        },
        {
            type: 'bmi_calculator',
            timestamp: new Date('2024-01-02T14:30:00Z'),
            data: { bmi: 24.5, category: 'Normal weight' }
        }
    ];

    res.json({
        success: true,
        data: interactionHistory,
        message: 'Lead magnet history retrieved successfully'
    });
});

// Mark lead magnet interaction as converted (when lead actually signs up)
exports.markConversion = asyncHandler(async (req, res, next) => {
    const { leadId, interactionType } = req.body;
    const coachId = req.user.id;

    if (!leadId || !interactionType) {
        return res.status(400).json({
            success: false,
            error: 'Lead ID and interaction type are required'
        });
    }

    try {
        const result = await leadMagnetsService.markLeadMagnetConversion(leadId, interactionType);
        
        res.json({
            success: true,
            message: 'Lead magnet conversion marked successfully',
            data: {
                leadId,
                interactionType,
                newScore: result.score,
                scoreExplanation: result.explanation
            }
        });
    } catch (error) {
        console.error('Error marking lead magnet conversion:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark conversion'
        });
    }
});

// Get lead magnet interaction analytics
exports.getInteractionAnalytics = asyncHandler(async (req, res, next) => {
    const coachId = req.user.id;
    const { timeRange = 30 } = req.query;

    try {
        const analytics = await leadMagnetsService.getInteractionAnalytics(coachId, parseInt(timeRange));
        
        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error getting interaction analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get analytics'
        });
    }
});
