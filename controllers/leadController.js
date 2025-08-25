// D:\PRJ_YCT_Final\controllers/leadController.js

const { Lead, Funnel, NurturingSequence } = require('../schema');
const { publishEvent } = require('../services/rabbitmqProducer');
const { scheduleFutureEvent } = require('../services/automationSchedulerService');
const leadScoringService = require('../services/leadScoringService');
const aiService = require('../services/aiService');

// Lead qualification logic (integrated)
const qualifyClientLead = (clientQuestions) => {
    let score = 0;
    const maxScore = 100;
    const insights = [];
    
    // Basic engagement (20 points)
    if (clientQuestions.watchedVideo === 'Yes') {
        score += 20;
        insights.push('Watched full video - high engagement');
    } else if (clientQuestions.watchedVideo === 'I plan to watch it soon') {
        score += 10;
        insights.push('Plans to watch video - moderate engagement');
    }
    
    // Readiness to start (25 points)
    if (clientQuestions.readyToStart === 'Yes') {
        score += 25;
        insights.push('Ready to start within 7 days - high urgency');
    } else if (clientQuestions.readyToStart === 'Not sure') {
        score += 10;
        insights.push('Uncertain about timeline - needs nurturing');
    }
    
    // Investment willingness (25 points)
    if (clientQuestions.willingToInvest === 'Yes') {
        score += 25;
        insights.push('Willing to invest - high conversion potential');
    } else if (clientQuestions.willingToInvest === 'Need a flexible option') {
        score += 15;
        insights.push('Open to investment with flexibility - moderate potential');
    }
    
    // Seriousness scale (20 points)
    if (clientQuestions.seriousnessScale >= 8) {
        score += 20;
        insights.push('High seriousness level (8-10) - strong commitment');
    } else if (clientQuestions.seriousnessScale >= 6) {
        score += 15;
        insights.push('Moderate seriousness level (6-7) - good potential');
    } else if (clientQuestions.seriousnessScale >= 4) {
        score += 10;
        insights.push('Lower seriousness level (4-5) - needs motivation');
    }
    
    // Activity level bonus (10 points)
    if (clientQuestions.activityLevel === 'Very active') {
        score += 10;
        insights.push('Very active lifestyle - likely to follow through');
    } else if (clientQuestions.activityLevel === 'Moderately active') {
        score += 5;
        insights.push('Moderately active - good foundation');
    }
    
    return { score, maxScore, insights };
};

const qualifyCoachLead = (coachQuestions) => {
    let score = 0;
    const maxScore = 100;
    const insights = [];
    
    // Video engagement (20 points)
    if (coachQuestions.watchedVideo === 'Yes, 100%') {
        score += 20;
        insights.push('Watched full video - high engagement');
    } else if (coachQuestions.watchedVideo === 'Partially') {
        score += 10;
        insights.push('Watched partially - moderate engagement');
    }
    
    // Business readiness (30 points)
    if (coachQuestions.readiness === '100% ready') {
        score += 30;
        insights.push('100% ready to start business - high conversion');
    } else if (coachQuestions.readiness === 'Curious but exploring') {
        score += 20;
        insights.push('Curious and exploring - good potential');
    }
    
    // Commitment level (25 points)
    if (coachQuestions.commitment === 'Yes, fully committed') {
        score += 25;
        insights.push('Fully committed - high success probability');
    } else if (coachQuestions.commitment === 'Maybe, depends on the plan') {
        score += 15;
        insights.push('Conditional commitment - needs convincing');
    }
    
    // Time availability (15 points)
    if (coachQuestions.timeCommitment === '3-4 hours/day') {
        score += 15;
        insights.push('High time commitment - serious about business');
    } else if (coachQuestions.timeCommitment === '1-2 hours/day') {
        score += 10;
        insights.push('Moderate time commitment - realistic approach');
    }
    
    // Understanding (10 points)
    if (coachQuestions.understandsOpportunity === 'Yes') {
        score += 10;
        insights.push('Understands business opportunity - informed decision');
    }
    
    return { score, maxScore, insights };
};

const getQualificationSummary = (qualification) => {
    const { score, maxScore, insights } = qualification;
    const percentage = Math.round((score / maxScore) * 100);
    
    let temperature = 'Cold';
    if (percentage >= 80) temperature = 'Hot';
    else if (percentage >= 50) temperature = 'Warm';
    
    const recommendations = [];
    
    if (temperature === 'Hot') {
        recommendations.push('High priority follow-up within 24 hours');
        recommendations.push('Send detailed program information');
        recommendations.push('Schedule discovery call immediately');
    } else if (temperature === 'Warm') {
        recommendations.push('Follow up within 48-72 hours');
        recommendations.push('Send nurturing content and testimonials');
        recommendations.push('Offer free consultation to build trust');
    } else {
        recommendations.push('Add to nurturing sequence');
        recommendations.push('Send educational content regularly');
        recommendations.push('Re-engage after 1-2 weeks');
    }
    
    return { temperature, percentage, recommendations };
};

// @desc    Create a new Lead
// @route   POST /api/leads
// @access  Public - Triggered by a public form submission
const createLead = async (req, res) => {
    try {
        const { 
            coachId, 
            funnelId, 
            targetAudience,
            clientQuestions,
            coachQuestions,
            ...otherLeadData 
        } = req.body;

        if (!coachId || !funnelId) {
            return res.status(400).json({
                success: false,
                message: 'Both coachId and funnelId are required to create a new lead.'
            });
        }

        const funnel = await Funnel.findOne({ _id: funnelId, coachId });

        if (!funnel) {
            return res.status(404).json({
                success: false,
                message: `Funnel not found or does not belong to the specified coach.`
            });
        }

        // Prepare lead data
        const leadData = {
            ...otherLeadData,
            coachId,
            funnelId,
            targetAudience: targetAudience || 'client'
        };

        // Add booking form questions based on target audience
        if (targetAudience === 'client' && clientQuestions) {
            leadData.clientQuestions = clientQuestions;
        } else if (targetAudience === 'coach' && coachQuestions) {
            leadData.coachQuestions = coachQuestions;
        }

        // Automatically qualify the lead if booking form questions are provided
        if (clientQuestions || coachQuestions) {
            let qualification;
            
            if (targetAudience === 'client' && clientQuestions) {
                qualification = qualifyClientLead(clientQuestions);
            } else if (targetAudience === 'coach' && coachQuestions) {
                qualification = qualifyCoachLead(coachQuestions);
            }
            
            if (qualification) {
                const summary = getQualificationSummary(qualification);
                
                // Update lead data with qualification results
                leadData.score = qualification.score;
                leadData.maxScore = qualification.maxScore;
                leadData.leadTemperature = summary.temperature;
                leadData.qualificationInsights = qualification.insights;
                leadData.recommendations = summary.recommendations;
                
                // Add qualification note
                const qualificationNote = `\n\n--- AUTOMATIC QUALIFICATION ---\nScore: ${qualification.score}/${qualification.maxScore} (${summary.percentage}%)\nTemperature: ${summary.temperature}\nInsights: ${qualification.insights.join(', ')}\nRecommendations: ${summary.recommendations.join(', ')}`;
                leadData.notes = leadData.notes ? leadData.notes + qualificationNote : `Lead qualified via booking form${qualificationNote}`;
            }
        }

        const lead = await Lead.create(leadData);

        // --- Publish event to RabbitMQ ---
        const eventName = 'lead_created';
        const eventPayload = {
            eventName: eventName,
            payload: {
                leadId: lead._id,
                leadData: lead.toObject(),
                coachId: lead.coachId,
                funnelId: lead.funnelId,
            }
        };

        publishEvent(eventName, eventPayload)
            .then(() => console.log(`[Controller] Published event: ${eventName}`))
            .catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
        // --- End of event publishing ---

        await leadScoringService.updateLeadScore(lead._id, 'form_submitted');

        // Auto-assign nurturing sequence if funnel is provided
        if (funnelId) {
            try {
                const nurturingService = require('../services/nurturingService');
                await nurturingService.autoAssignSequenceToLead(lead._id, funnelId);
            } catch (nurturingError) {
                console.error('Error auto-assigning nurturing sequence:', nurturingError);
                // Don't fail the lead creation if nurturing fails
            }
        }

        res.status(201).json({
            success: true,
            data: lead
        });
    } catch (error) {
        console.error("Error creating lead:", error);
        res.status(500).json({
            success: false,
            message: "Error creating lead",
            error: error.message
        });
    }
};

// @desc    Get all Leads for the authenticated coach with filtering, sorting, and pagination
// @route   GET /api/leads?status=New&temperature=Hot&assignedTo=userId&nextFollowUpAt[lte]=date&sortBy=-createdAt&page=1&limit=10
// @access  Private (Coaches/Admins)
const getLeads = async (req, res) => {
    try {
        const coachId = req.user.id;
        let query;

        const reqQuery = { ...req.query };

        const removeFields = ['select', 'sort', 'page', 'limit', 'nextFollowUpAt'];
        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        if (req.query.nextFollowUpAt) {
            const nextFollowUpAtFilter = JSON.parse(req.query.nextFollowUpAt);
            if (nextFollowUpAtFilter.lte) {
                nextFollowUpAtFilter.lte = new Date(nextFollowUpAtFilter.lte);
            }
            if (nextFollowUpAtFilter.gte) {
                nextFollowUpAtFilter.gte = new Date(nextFollowUpAtFilter.gte);
            }
            queryStr = JSON.stringify({ ...JSON.parse(queryStr), nextFollowUpAt: nextFollowUpAtFilter });
        }

        query = Lead.find({ ...JSON.parse(queryStr), coachId });

        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Lead.countDocuments({ coachId });

        query = query.skip(startIndex).limit(limit);

        query = query.populate('funnelId', 'name');
        query = query.populate('assignedTo', 'name');

        const leads = await query;

        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: leads.length,
            total,
            pagination,
            data: leads
        });
    } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({
            success: false,
            message: 'Server Error. Could not retrieve leads.'
        });
    }
};

// @desc    Get single Lead by ID for the authenticated coach
// @route   GET /api/leads/:id
// @access  Private (Coaches/Admins)
const getLead = async (req, res) => {
    try {
        const lead = await Lead.findOne({ _id: req.params.leadId, coachId: req.coachId })
            .populate('funnelId', 'name')
            .populate('assignedTo', 'name')
            .populate('followUpHistory.createdBy', 'name')

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: `Lead not found or you do not own this lead.`
            });
        }

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (error) {
        console.error("Error fetching single lead:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid Lead ID format.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error. Could not retrieve lead.'
        });
    }
};

// @desc    Update Lead for the authenticated coach
// @route   PUT /api/leads/:id
// @access  Private (Coaches/Admins)
const updateLead = async (req, res) => {
    try {
        const existingLead = await Lead.findOne({ _id: req.params.leadId, coachId: req.coachId });

        if (!existingLead) {
            return res.status(404).json({
                success: false,
                message: `Lead not found or you do not own this lead.`
            });
        }

        const oldStatus = existingLead.status;
        const oldTemperature = existingLead.leadTemperature;
        const oldAssignedTo = existingLead.assignedTo ? existingLead.assignedTo.toString() : null;

        const updatedLead = await Lead.findOneAndUpdate({ _id: req.params.leadId, coachId: req.coachId }, req.body, {
            new: true,
            runValidators: true
        });

        // --- Publish events based on changes to RabbitMQ ---
        if (updatedLead.status !== oldStatus) {
            const eventName = 'lead_status_changed';
            const eventPayload = {
                eventName: eventName,
                payload: {
                    leadId: updatedLead._id,
                    leadData: updatedLead.toObject(),
                    oldStatus: oldStatus,
                    newStatus: updatedLead.status,
                    coachId: req.user.id,
                }
            };
            publishEvent(eventName, eventPayload).catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
        }

        if (updatedLead.leadTemperature !== oldTemperature) {
            const eventName = 'lead_temperature_changed';
            const eventPayload = {
                eventName: eventName,
                payload: {
                    leadId: updatedLead._id,
                    leadData: updatedLead.toObject(),
                    oldTemperature: oldTemperature,
                    newTemperature: updatedLead.leadTemperature,
                    coachId: req.user.id,
                }
            };
            publishEvent(eventName, eventPayload).catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
        }

        const newAssignedTo = updatedLead.assignedTo ? updatedLead.assignedTo.toString() : null;
        if (newAssignedTo && newAssignedTo !== oldAssignedTo) {
            const eventName = 'assign_lead_to_coach';
            const eventPayload = {
                eventName: eventName,
                payload: {
                    leadId: updatedLead._id,
                    leadData: updatedLead.toObject(),
                    oldAssignedTo: oldAssignedTo,
                    newAssignedTo: newAssignedTo,
                    coachId: req.user.id,
                }
            };
            publishEvent(eventName, eventPayload).catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
        }
        // --- End of event publishing ---

        res.status(200).json({
            success: true,
            data: updatedLead
        });
    } catch (error) {
        console.error("Error updating lead:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid Lead ID format.'
            });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error. Could not update lead.'
        });
    }
};

// @desc    Add a follow-up note to a Lead
// @route   POST /api/leads/:id/followup
// @access  Private (Coaches/Admins)
const addFollowUpNote = async (req, res) => {
    try {
        let lead = await Lead.findOne({ _id: req.params.leadId, coachId: req.coachId });

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: `Lead not found or you do not own this lead.`
            });
        }

        const { note, nextFollowUpAt } = req.body;

        if (!note || note.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Follow-up note is required.'
            });
        }

        const oldNextFollowUpAt = lead.nextFollowUpAt ? lead.nextFollowUpAt.toISOString() : null;

        lead.followUpHistory.push({
            note: note,
            createdBy: req.user.id,
            followUpDate: Date.now()
        });
        lead.lastFollowUpAt = Date.now();

        if (nextFollowUpAt) {
            const nextDate = new Date(nextFollowUpAt);
            if (isNaN(nextDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid next follow-up date provided.'
                });
            }
            lead.nextFollowUpAt = nextDate;
        } else {
            lead.nextFollowUpAt = undefined;
        }

        await lead.save();

        await leadScoringService.updateLeadScore(lead._id, 'followup_added');

        lead = await Lead.findOne({ _id: req.params.leadId, coachId: req.coachId })
            .populate('funnelId', 'name')
            .populate('assignedTo', 'name')
            .populate('followUpHistory.createdBy', 'name');

        const newNextFollowUpAt = lead.nextFollowUpAt ? lead.nextFollowUpAt.toISOString() : null;
        if (newNextFollowUpAt !== oldNextFollowUpAt) {
            const eventName = 'lead_followup_scheduled_or_updated';
            const eventPayload = {
                eventName: eventName,
                payload: {
                    leadId: lead._id,
                    leadData: lead.toObject(),
                    oldNextFollowUpAt: oldNextFollowUpAt,
                    newNextFollowUpAt: newNextFollowUpAt,
                    coachId: req.user.id,
                }
            };
            publishEvent(eventName, eventPayload).catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
        }

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (error) {
        console.error("Error adding follow-up note:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid Lead ID format.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error. Could not add follow-up note.'
        });
    }
};

// @desc    Get Leads for upcoming follow-ups
// @route   GET /api/leads/followups/upcoming?days=7
// @access  Private (Coaches/Admins)
const getUpcomingFollowUps = async (req, res) => {
    try {
        const coachId = req.coachId;
        const days = parseInt(req.query.days, 10) || 7;
        const includeOverdue = req.query.includeOverdue === 'true';

        const now = new Date();
        const futureDate = new Date(now);
        futureDate.setDate(now.getDate() + days);

        let matchQuery = {
            coachId,
            nextFollowUpAt: { $ne: null }
        };

        if (includeOverdue) {
            matchQuery.nextFollowUpAt.$lte = futureDate;
        } else {
            matchQuery.nextFollowUpAt.$gte = now;
            matchQuery.nextFollowUpAt.$lte = futureDate;
        }

        const leads = await Lead.find(matchQuery)
            .sort('nextFollowUpAt')
            .populate('funnelId', 'name')
            .populate('assignedTo', 'name');

        res.status(200).json({
            success: true,
            count: leads.length,
            data: leads
        });
    } catch (error) {
        console.error("Error fetching upcoming follow-ups:", error);
        res.status(500).json({
            success: false,
            message: 'Server Error. Could not retrieve upcoming follow-ups.'
        });
    }
};

// @desc    Delete Lead for the authenticated coach
// @route   DELETE /api/leads/:id
// @access  Private (Coaches/Admins)
const deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findOne({ _id: req.params.leadId, coachId: req.coachId });

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: `Lead not found or you do not own this lead.`
            });
        }

        await lead.deleteOne();

        // --- Publish event to RabbitMQ ---
        const eventName = 'lead_deleted';
        const eventPayload = {
            eventName: eventName,
            payload: {
                leadId: lead._id,
                coachId: req.user.id,
            }
        };
        publishEvent(eventName, eventPayload).catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
        // --- End of event publishing ---

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error("Error deleting lead:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid Lead ID format.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error. Could not delete lead.'
        });
    }
};

// --- Basic lead scoring function with explanation ---
function calculateLeadScore(lead) {
    let score = 0;
    let explanation = [];
    
    // --- Basic Lead Scoring ---
    if (lead.leadTemperature === 'Hot') {
        score += 30;
        explanation.push('Hot lead temperature: +30');
    }
    if (lead.source) {
        score += 5;
        explanation.push('Lead source present: +5');
    }
    if (lead.email && lead.phone) {
        score += 15;
        explanation.push('Both email and phone provided: +15');
    } else if (lead.email || lead.phone) {
        score += 5;
        explanation.push('Either email or phone provided: +5');
    }
    if (lead.nextFollowUpAt) {
        score += 10;
        explanation.push('Next follow-up scheduled: +10');
    }
    
    // --- NEW: Lead Magnet Interaction Scoring ---
    if (lead.leadMagnetInteractions && lead.leadMagnetInteractions.length > 0) {
        const interactionCount = lead.leadMagnetInteractions.length;
        const conversionCount = lead.leadMagnetInteractions.filter(interaction => interaction.conversion).length;
        
        // Points for each interaction (shows engagement)
        const interactionPoints = interactionCount * 8;
        score += interactionPoints;
        explanation.push(`Lead magnet interactions (${interactionCount}): +${interactionPoints}`);
        
        // Bonus points for conversions (shows high intent)
        const conversionPoints = conversionCount * 15;
        score += conversionPoints;
        if (conversionCount > 0) {
            explanation.push(`Lead magnet conversions (${conversionCount}): +${conversionPoints}`);
        }
        
        // Bonus for multiple interactions (shows sustained interest)
        if (interactionCount >= 3) {
            score += 20;
            explanation.push('Multiple lead magnet interactions (3+): +20');
        }
        
        // Bonus for recent interactions (shows current engagement)
        const recentInteractions = lead.leadMagnetInteractions.filter(interaction => {
            const daysSince = (Date.now() - new Date(interaction.timestamp).getTime()) / (1000 * 60 * 60 * 24);
            return daysSince <= 7; // Last 7 days
        });
        if (recentInteractions.length > 0) {
            score += 10;
            explanation.push(`Recent lead magnet activity (last 7 days): +10`);
        }
    }
    
    // --- Progress Tracking Bonus ---
    if (lead.progressTracking && lead.progressTracking.length > 0) {
        const progressEntries = lead.progressTracking.length;
        const progressPoints = Math.min(progressEntries * 5, 25); // Max 25 points for progress tracking
        score += progressPoints;
        explanation.push(`Progress tracking entries (${progressEntries}): +${progressPoints}`);
    }
    
    score = Math.min(100, score);
    return { score, explanation };
}

// Helper to trigger automation for a nurturing step
async function triggerNurturingStepAction(lead, step) {
    const actionType = step.actionType;
    const config = step.actionConfig || {};
    const eventPayload = {
        leadId: lead._id,
        coachId: lead.coachId,
        stepIndex: lead.nurturingStepIndex,
        actionType,
        config,
        leadData: lead.toObject()
    };
    await publishEvent('funnelseye_actions', 'lead.nurture', {
        actionType,
        config,
        payload: eventPayload
    });
}

// Assign a nurturing sequence to a lead
const assignNurturingSequence = async (req, res) => {
    try {
        const { leadId, sequenceId } = req.body;
        const lead = await Lead.findById(leadId);
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
        const sequence = await NurturingSequence.findById(sequenceId);
        if (!sequence) return res.status(404).json({ success: false, message: 'Nurturing sequence not found' });
        lead.nurturingSequence = sequenceId;
        lead.nurturingStepIndex = 0;
        await lead.save();
        res.status(200).json({ success: true, message: 'Nurturing sequence assigned', data: lead });
    } catch (e) {
        console.error('Assign nurturing sequence error:', e);
        res.status(500).json({ success: false, message: 'Server error during assignment.' });
    }
};

// Advance a lead to the next nurturing step (now uses automation system)
const advanceNurturingStep = async (req, res) => {
    try {
        const { leadId } = req.body;
        const lead = await Lead.findById(leadId).populate('nurturingSequence');
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
        if (!lead.nurturingSequence) return res.status(400).json({ success: false, message: 'No nurturing sequence assigned' });
        const sequence = lead.nurturingSequence;
        if (lead.nurturingStepIndex >= sequence.steps.length) {
            return res.status(400).json({ success: false, message: 'Lead has completed the nurturing sequence' });
        }
        const step = sequence.steps[lead.nurturingStepIndex];
        // Schedule or trigger the action
        if (step.delayDays && step.delayDays > 0) {
            const scheduledTime = new Date(Date.now() + step.delayDays * 24 * 60 * 60 * 1000);
            await scheduleFutureEvent(scheduledTime, 'funnelseye_actions', 'lead.nurture', {
                actionType: step.actionType,
                config: step.actionConfig || {},
                payload: {
                    leadId: lead._id,
                    coachId: lead.coachId,
                    stepIndex: lead.nurturingStepIndex,
                    actionType: step.actionType,
                    config: step.actionConfig || {},
                    leadData: lead.toObject()
                }
            });
        } else {
            await triggerNurturingStepAction(lead, step);
        }
        lead.nurturingStepIndex += 1;
        await lead.save();
        res.status(200).json({ success: true, message: 'Advanced to next nurturing step and published automation event', data: lead });
    } catch (e) {
        console.error('Advance nurturing step error:', e);
        res.status(500).json({ success: false, message: 'Server error during step advancement.' });
    }
};

// Get nurturing sequence progress for a lead
const getNurturingProgress = async (req, res) => {
    try {
        const { leadId } = req.params;
        const lead = await Lead.findById(leadId).populate('nurturingSequence');
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
        if (!lead.nurturingSequence) return res.status(200).json({ success: true, data: { progress: null, message: 'No nurturing sequence assigned' } });
        const sequence = lead.nurturingSequence;
        const currentStep = sequence.steps[lead.nurturingStepIndex] || null;
        res.status(200).json({ success: true, data: { sequence, currentStep, stepIndex: lead.nurturingStepIndex } });
    } catch (e) {
        console.error('Get nurturing progress error:', e);
        res.status(500).json({ success: false, message: 'Server error during progress fetch.' });
    }
};

// Example: After converting a lead to a client
const convertLeadToClient = async (req, res) => {
    try {
        const { leadId } = req.body;
        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
        // Conversion logic here...
        lead.status = 'Client';
        await lead.save();
        // Publish automation event
        const eventName = 'lead_converted_to_client';
        const eventPayload = {
            eventName,
            payload: {
                leadId: lead._id,
                leadData: lead.toObject(),
                coachId: lead.coachId,
            }
        };
        publishEvent(eventName, eventPayload).catch(err => console.error(`[Controller] Failed to publish event: ${eventName}`, err));
        await leadScoringService.updateLeadScore(leadId, 'lead_magnet_converted');
        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during lead conversion.' });
    }
};

// AI-powered lead qualification
const aiQualifyLead = async (req, res) => {
    try {
        const { leadId } = req.params;
        const lead = await Lead.findById(leadId).populate('coachId');
        
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        // Generate AI insights for the lead
        const leadInsights = await aiService.generateLeadInsights({
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            source: lead.source,
            score: lead.score,
            status: lead.status,
            notes: lead.notes,
            followUpHistory: lead.followUpHistory,
            appointment: lead.appointment
        });

        // Generate personalized follow-up message
        const followUpMessage = await aiService.generateContextualResponse(
            `Lead ${lead.name} from ${lead.source} with score ${lead.score}`,
            'interested',
            {
                leadStage: lead.status,
                coachName: lead.coachId?.name || 'Coach',
                niche: lead.coachId?.niche || 'Fitness',
                offer: lead.coachId?.offer || 'Transformation Program'
            }
        );

        // Generate marketing copy for this lead
        const marketingCopy = await aiService.generateMarketingCopy(
            `Create compelling follow-up message for ${lead.name}, a ${lead.source} lead with ${lead.score}/100 score. 
            Coach: ${lead.coachId?.name || 'Coach'}, Niche: ${lead.coachId?.niche || 'Fitness'}, 
            Offer: ${lead.coachId?.offer || 'Transformation Program'}. 
            Lead status: ${lead.status}, Previous follow-ups: ${lead.followUpHistory?.length || 0}`
        );

        res.json({
            success: true,
            data: {
                leadInsights: leadInsights.content,
                followUpMessage: followUpMessage.content,
                marketingCopy: marketingCopy.content,
                aiRecommendations: {
                    nextAction: leadInsights.content.includes('hot') ? 'Immediate follow-up' : 'Scheduled follow-up',
                    priority: lead.score > 70 ? 'High' : lead.score > 40 ? 'Medium' : 'Low',
                    bestApproach: leadInsights.content.includes('objection') ? 'Address concerns first' : 'Direct offer'
                }
            }
        });

    } catch (error) {
        console.error('AI lead qualification error:', error);
        res.status(500).json({ success: false, message: 'Error in AI qualification' });
    }
};

// Helper function to convert AI content to structured nurturing steps
function generateSequenceSteps(aiContent, sequenceType, lead) {
    const steps = [];
    let stepNumber = 1;
    
    // Define action types based on sequence type
    const actionTypes = {
        'warm_lead': ['send_email', 'send_whatsapp_message', 'create_task'],
        'cold_lead': ['send_email', 'send_whatsapp_message', 'send_email', 'create_task', 'send_whatsapp_message'],
        'objection_handling': ['send_whatsapp_message', 'send_email', 'create_task', 'send_whatsapp_message'],
        'follow_up': ['send_whatsapp_message', 'send_email', 'create_task'],
        'reactivation': ['send_email', 'send_whatsapp_message', 'create_task', 'send_whatsapp_message']
    };
    
    const sequenceActions = actionTypes[sequenceType] || actionTypes['warm_lead'];
    
    // Generate steps based on action types
    sequenceActions.forEach((actionType, index) => {
        let actionConfig = {};
        let stepName = '';
        let stepDescription = '';
        
        switch (actionType) {
            case 'send_email':
                stepName = `Email ${stepNumber}`;
                stepDescription = `Send personalized email to ${lead.name}`;
                actionConfig = {
                    subject: `Follow-up from your coach`,
                    body: `Hi ${lead.name}, this is a personalized follow-up message.`
                };
                break;
                
            case 'send_whatsapp_message':
                stepName = `WhatsApp ${stepNumber}`;
                stepDescription = `Send WhatsApp message to ${lead.name}`;
                actionConfig = {
                    message: `Hi ${lead.name}, how are you doing with your fitness journey?`
                };
                break;
                
            case 'create_task':
                stepName = `Follow-up Task ${stepNumber}`;
                stepDescription = `Create manual follow-up task for ${lead.name}`;
                actionConfig = {
                    title: `Follow up with ${lead.name}`,
                    description: `Check progress and answer questions`,
                    priority: 'medium'
                };
                break;
        }
        
        steps.push({
            stepNumber: stepNumber,
            name: stepName,
            description: stepDescription,
            actionType: actionType,
            actionConfig: actionConfig,
            delayDays: index === 0 ? 0 : Math.floor(index / 2), // First step immediate, others spaced out
            delayHours: index === 0 ? 0 : (index % 2) * 12, // Alternate between 0 and 12 hours
            isActive: true
        });
        
        stepNumber++;
    });
    
    return steps;
}

// AI-powered lead nurturing sequence generation
const generateNurturingSequence = async (req, res) => {
    try {
        const { sequenceType } = req.body;
        const leadId = req.params.leadId; // Get leadId from URL parameters
        const lead = await Lead.findById(leadId).populate('coachId');
        
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        let sequencePrompt = '';
        switch (sequenceType) {
            case 'warm_lead':
                sequencePrompt = `Create a 5-step nurturing sequence for ${lead.name}, a warm lead (score: ${lead.score}) 
                interested in ${lead.coachId?.offer || 'fitness transformation'}. 
                Target audience: ${lead.source} leads, Goal: Convert to client`;
                break;
            case 'cold_lead':
                sequencePrompt = `Create a 7-step nurturing sequence for ${lead.name}, a cold lead (score: ${lead.score}) 
                from ${lead.source}. Goal: Warm up and engage before offering ${lead.coachId?.offer || 'fitness program'}`;
                break;
            case 'objection_handling':
                sequencePrompt = `Create a 4-step nurturing sequence to handle objections for ${lead.name}. 
                Lead concerns: ${lead.notes || 'General hesitation'}. 
                Goal: Address concerns and convert to ${lead.coachId?.offer || 'client'}`;
                break;
            default:
                sequencePrompt = `Create a nurturing sequence for ${lead.name} (score: ${lead.score}) 
                from ${lead.source}. Goal: Convert to client for ${lead.coachId?.offer || 'fitness program'}`;
        }

        // Generate AI content for the sequence
        const aiSequenceContent = await aiService.generateMarketingCopy(sequencePrompt, {
            temperature: 0.7,
            maxTokens: 800
        });

        // Convert AI content to proper nurturing sequence format
        const sequenceSteps = generateSequenceSteps(aiSequenceContent.content, sequenceType, lead);

        res.json({
            success: true,
            data: {
                sequence: aiSequenceContent.content,
                type: sequenceType,
                leadId: lead._id,
                recommendedSteps: 5,
                // Add the structured sequence for easy creation
                structuredSequence: {
                    name: `${sequenceType.replace('_', ' ').toUpperCase()} Sequence for ${lead.name}`,
                    description: `AI-generated nurturing sequence for ${lead.name} (${sequenceType})`,
                    category: sequenceType,
                    steps: sequenceSteps
                }
            }
        });

    } catch (error) {
        console.error('AI nurturing sequence generation error:', error);
        res.status(500).json({ success: false, message: 'Error generating nurturing sequence' });
    }
};

// AI-powered follow-up message generation
const generateFollowUpMessage = async (req, res) => {
    try {
        const { followUpType, context } = req.body;
        const leadId = req.params.leadId; // Get leadId from URL parameters
        const lead = await Lead.findById(leadId).populate('coachId');
        
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        let prompt = '';
        switch (followUpType) {
            case 'first_followup':
                prompt = `Generate a first follow-up message for ${lead.name} who signed up from ${lead.source}. 
                Coach: ${lead.coachId?.name || 'Coach'}, Offer: ${lead.coachId?.offer || 'Fitness Program'}. 
                Make it personal, engaging, and include a clear next step.`;
                break;
            case 'reminder':
                prompt = `Generate a reminder follow-up for ${lead.name} who hasn't responded to previous messages. 
                Lead score: ${lead.score}, Previous follow-ups: ${lead.followUpHistory?.length || 0}. 
                Be persistent but not pushy, offer value, and create urgency.`;
                break;
            case 'offer':
                prompt = `Generate an offer presentation message for ${lead.name} (score: ${lead.score}). 
                Coach: ${lead.coachId?.name || 'Coach'}, Offer: ${lead.coachId?.offer || 'Fitness Program'}. 
                Include social proof, benefits, and a compelling call-to-action.`;
                break;
            default:
                prompt = `Generate a follow-up message for ${lead.name} (${followUpType}). 
                Context: ${context || 'General follow-up'}. 
                Make it relevant to their situation and lead score (${lead.score}).`;
        }

        const followUpMessage = await aiService.generateMarketingCopy(prompt, {
            temperature: 0.8,
            maxTokens: 300
        });

        res.json({
            success: true,
            data: {
                message: followUpMessage.content,
                type: followUpType,
                leadId: lead._id,
                recommendedTiming: followUpType === 'first_followup' ? '24 hours' : '3-5 days'
            }
        });

    } catch (error) {
        console.error('AI follow-up generation error:', error);
        res.status(500).json({ success: false, message: 'Error generating follow-up message' });
    }
};

// Export all functions
module.exports = {
    createLead,
    getLeads,
    getLead,
    updateLead,
    addFollowUpNote,
    getUpcomingFollowUps,
    deleteLead,
    // simple AI rescore endpoint handler
    aiRescore: async (req, res) => {
        try {
            const lead = await Lead.findOne({ _id: req.params.leadId, coachId: req.coachId });
            if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
            const { score, explanation } = calculateLeadScore(lead);
            lead.score = score;
            await lead.save();
            return res.status(200).json({ success: true, data: { leadId: lead._id, score, explanation } });
        } catch (e) {
            console.error('AI rescore error:', e);
            return res.status(500).json({ success: false, message: 'Server error during AI rescore.' });
        }
    },
    assignNurturingSequence,
    advanceNurturingStep,
    getNurturingProgress,
    convertLeadToClient,
    aiQualifyLead,
    generateNurturingSequence,
    generateFollowUpMessage,
};