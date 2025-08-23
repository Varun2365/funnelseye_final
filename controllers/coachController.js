// D:\PRJ_YCT_Final\controllers\coachController.js

const { Coach } = require('../schema');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Update a coach's portfolio information
// @route   PUT /api/coach/:id/profile
// @access  Private (Coach)
exports.updateCoachProfile = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { headline, bio, experienceYears, specializations } = req.body;

    const updatedCoach = await Coach.findByIdAndUpdate(
        id,
        {
            $set: {
                'portfolio.headline': headline,
                'portfolio.bio': bio,
                'portfolio.experienceYears': experienceYears,
                'portfolio.specializations': specializations
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedCoach) {
        return res.status(404).json({ success: false, message: 'Coach not found.' });
    }

    res.status(200).json({
        success: true,
        message: 'Coach profile updated successfully.',
        data: updatedCoach
    });
});

// @desc    Add credits to a coach's account
// @route   POST /api/coach/add-credits/:id
// @access  Private (Coach & Admin)
exports.addCredits = asyncHandler(async (req, res, next) => {
    const { creditsToAdd } = req.body;
    const coachId = req.params.id;

    // 🛡️ Access Control:
    // A coach can only add credits to their own account. An admin can add credits to any account.
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user._id.toString() !== coachId) {
        return res.status(403).json({ success: false, message: 'You are not authorized to add credits to this account.' });
    }

    if (typeof creditsToAdd !== 'number' || creditsToAdd <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid number of credits. Must be a positive number.' });
    }

    const coach = await Coach.findById(coachId);
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found.' });
    }

    // --- 💳 PLACEHOLDER FOR PAYMENT INTEGRATION ---
    // Here, you would integrate a payment gateway.
    // The code would look something like this:
    /*
    const paymentSuccessful = await processPayment(req.user, creditsToAdd, req.body.paymentInfo);

    if (!paymentSuccessful) {
        return res.status(400).json({ success: false, message: 'Payment failed. Credits were not added.' });
    }
    */
    // --- END PAYMENT PLACEHOLDER ---


    // ✅ Add credits to the coach's account
    coach.credits += creditsToAdd;
    await coach.save();

    res.status(200).json({
        success: true,
        message: `${creditsToAdd} credits added to coach ${coach.name}.`,
        newCredits: coach.credits
    });
});

// @desc    Update WhatsApp credentials for a coach
// @route   PUT /api/coach/:id/whatsapp-config
// @access  Private (Coach)
exports.updateWhatsAppConfig = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { useCentralAccount, phoneNumberId, whatsAppBusinessAccountId, whatsAppApiToken } = req.body;

    // Validate that the user is updating their own profile or is an admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user._id.toString() !== id) {
        return res.status(403).json({ success: false, message: 'You are not authorized to update this coach\'s WhatsApp configuration.' });
    }

    const updateData = {};
    
    if (typeof useCentralAccount === 'boolean') {
        updateData['whatsApp.useCentralAccount'] = useCentralAccount;
    }
    
    if (phoneNumberId) {
        updateData['whatsApp.phoneNumberId'] = phoneNumberId;
    }
    
    if (whatsAppBusinessAccountId) {
        updateData['whatsApp.whatsAppBusinessAccountId'] = whatsAppBusinessAccountId;
    }
    
    if (whatsAppApiToken) {
        updateData['whatsApp.whatsAppApiToken'] = whatsAppApiToken;
    }

    const updatedCoach = await Coach.findByIdAndUpdate(
        id,
        { $set: updateData },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedCoach) {
        return res.status(404).json({ success: false, message: 'Coach not found.' });
    }

    res.status(200).json({
        success: true,
        message: 'WhatsApp configuration updated successfully.',
        data: {
            useCentralAccount: updatedCoach.whatsApp.useCentralAccount,
            phoneNumberId: updatedCoach.whatsApp.phoneNumberId,
            whatsAppBusinessAccountId: updatedCoach.whatsApp.whatsAppBusinessAccountId
            // Note: whatsAppApiToken is not returned for security
        }
    });
});

// @desc    Get coach information (including ID)
// @route   GET /api/coach/me
// @access  Private (Coach)
exports.getMyInfo = asyncHandler(async (req, res, next) => {
    const coach = await Coach.findById(req.user._id).select('-whatsApp.whatsAppApiToken');
    
    if (!coach) {
        return res.status(404).json({ success: false, message: 'Coach not found.' });
    }

    res.status(200).json({
        success: true,
        data: {
            id: coach._id,
            name: coach.name,
            email: coach.email,
            credits: coach.credits,
            whatsApp: {
                useCentralAccount: coach.whatsApp.useCentralAccount,
                phoneNumberId: coach.whatsApp.phoneNumberId,
                whatsAppBusinessAccountId: coach.whatsApp.whatsAppBusinessAccountId
            }
        }
    });
});