const bcrypt = require('bcryptjs');
const { User, Coach, Otp } = require('../schema'); // New import for the Coach discriminator model
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'varun.kumar.sharma.2365@gmail.com',
        pass: 'ymrj rltp fyrn ernm'
    }
});

// --- Helper Functions ---

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtp = async (email, otp) => {
    try {
        const mailOptions = {
            from: '"FunnelsEye" <varun.kumar.sharma.2365@gmail.com>',
            to: email,
            subject: 'FunnelsEye: Your One-Time Password (OTP)',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7fa; padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
                        <div style="position: relative; height: 120px; background-color: #6a1b9a; padding-top: 20px; text-align: center;">
                            <h1 style="color: #ffffff; font-size: 32px; margin: 0; padding-bottom: 10px;">FunnelsEye</h1>
                            <p style="color: #ffffff; font-size: 16px; margin: 0;">Your Path to Growth</p>
                            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 60px; fill: #f4f7fa;">
                                <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path>
                            </svg>
                        </div>
                        <div style="padding: 30px; text-align: center;">
                            <h2 style="color: #0056b3; font-size: 24px; margin-bottom: 20px;">Email Verification</h2>
                            <p style="font-size: 16px; margin-bottom: 25px;">Dear User,</p>
                            <p style="font-size: 18px; margin-bottom: 30px;">To complete your verification, please use the following One-Time Password (OTP):</p>
                            <div style="background-color: #e0f2f7; border: 1px solid #b3e5fc; border-radius: 10px; padding: 18px 30px; display: inline-block; margin-bottom: 30px;">
                                <h3 style="font-size: 38px; color: #e91e63; margin: 0; font-weight: bold; letter-spacing: 3px;">${otp}</h3>
                            </div>
                            <p style="font-size: 14px; color: #777; margin-top: 0;">This OTP is valid for 5 minutes. Please ensure you use it promptly.</p>
                            <p style="font-size: 14px; color: #777; margin-top: 15px;">If you did not request this OTP, please disregard this email.</p>
                            <p style="font-size: 16px; font-weight: bold; margin-top: 30px; color: #555;">Thank you,<br/>The FunnelsEye Team</p>
                        </div>
                        <div style="position: relative; height: 80px; background-color: #6a1b9a; padding: 10px 0; text-align: center;">
                            <p style="color: #ffffff; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} FunnelsEye. All rights reserved.</p>
                            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 60px; fill: #ffffff; transform: rotateX(180deg);">
                                <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error(`Error sending OTP to ${email}:`, error.message);
        return false;
    }
};

const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: '"FunnelsEye" <varun.kumar.sharma.2365@gmail.com>',
            to: email,
            subject: 'FunnelsEye: Password Reset Request',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7fa; padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
                        <div style="position: relative; height: 120px; background-color: #6a1b9a; padding-top: 20px; text-align: center;">
                            <h1 style="color: #ffffff; font-size: 32px; margin: 0; padding-bottom: 10px;">FunnelsEye</h1>
                            <p style="color: #ffffff; font-size: 16px; margin: 0;">Your Path to Growth</p>
                            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 60px; fill: #f4f7fa;">
                                <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path>
                            </svg>
                        </div>
                        <div style="padding: 30px; text-align: center;">
                            <h2 style="color: #0056b3; font-size: 24px; margin-bottom: 20px;">Password Reset Request</h2>
                            <p style="font-size: 16px; margin-bottom: 25px;">Dear User,</p>
                            <p style="font-size: 18px; margin-bottom: 30px;">You requested a password reset for your FunnelsEye account. Click the button below to reset your password:</p>
                            <div style="margin-bottom: 30px;">
                                <a href="${resetUrl}" style="display: inline-block; background-color: #6a1b9a; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
                            </div>
                            <p style="font-size: 14px; color: #777; margin-top: 0;">This link is valid for 1 hour. If you did not request this password reset, please ignore this email.</p>
                            <p style="font-size: 14px; color: #777; margin-top: 15px;">For security reasons, this link will expire automatically.</p>
                            <p style="font-size: 16px; font-weight: bold; margin-top: 30px; color: #555;">Thank you,<br/>The FunnelsEye Team</p>
                        </div>
                        <div style="position: relative; height: 80px; background-color: #6a1b9a; padding: 10px 0; text-align: center;">
                            <p style="color: #ffffff; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} FunnelsEye. All rights reserved.</p>
                            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 60px; fill: #ffffff; transform: rotateX(180deg);">
                                <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error(`Error sending password reset email to ${email}:`, error.message);
        return false;
    }
};

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    user.password = undefined;

    res.status(statusCode)
       .cookie('token', token, options)
       .json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                profilePictureUrl: user.profilePictureUrl
            }
        });
};


// --- Authentication Controllers ---

const signup = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Please enter all required fields: name, email, password, and role.' });
    }
    if (!['coach', 'admin', 'client', 'super_admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            if (!user.isVerified) {
                await Otp.deleteMany({ email });
                const otp = generateOtp();
                await Otp.create({ email, otp });
                const otpSent = await sendOtp(email, otp);
                if (otpSent) {
                    return res.status(200).json({ success: true, message: 'User already exists but is not verified. A new OTP has been sent to your email.' });
                } else {
                    return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
                }
            }
            return res.status(400).json({ success: false, message: 'User with this email already exists and is verified.' });
        }

        // Always use User model - the role field will automatically create the right discriminator
        newUser = await User.create({
            name,
            email,
            password,
            role,
            isVerified: false,
            ...(role === 'coach' && { 
                sponsorId: null,
                selfCoachId: null, // Will be set during hierarchy setup
                currentLevel: 1, // Default to level 1
                hierarchyLocked: false
            }) // Only add hierarchy fields for coaches
        });
        
        const otp = generateOtp();
        await Otp.create({ email, otp, createdAt: new Date(), expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

        const otpSent = await sendOtp(email, otp);

        if (otpSent) {
            res.status(201).json({
                success: true,
                message: 'User registered successfully. An OTP has been sent to your email for verification.',
                userId: newUser._id,
                email: newUser.email,
                role: newUser.role
            });
        } else {
            res.status(500).json({ success: false, message: 'User registered, but failed to send OTP. Please try logging in and re-requesting OTP.' });
        }

    } catch (error) {
        console.error('Error during signup:', error.message);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'User with this email already exists.' });
        }
        res.status(500).json({ success: false, message: 'Server error during signup.' });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required for verification.' });
    }
    try {
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found for this email.' });
        }
        user.isVerified = true;
        await user.save();
        await Otp.deleteOne({ email });
        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Error during OTP verification:', error.message);
        res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
    }
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }
        if (!user.isVerified) {
            return res.status(403).json({ 
                success: false, 
                message: 'Please verify your email first. Use the resend OTP endpoint to get a new verification code.',
                needsVerification: true,
                email: user.email
            });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }
        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.coachId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({ success: true, user });
    } catch (err) {
        console.error("GetMe error:", err);
        res.status(500).json({ success: false, message: 'Server Error fetching user data.' });
    }
};

const logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address.'
            });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email address.'
            });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset url
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password/${resetToken}`;

        try {
            await sendPasswordResetEmail(email, resetToken);
            
            res.status(200).json({
                success: true,
                message: 'Password reset email sent successfully.'
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please try again.'
            });
        }
    } catch (error) {
        console.error('Error in forgot password:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset request.'
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.body.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token.'
            });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Send token response
        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Error in reset password:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset.'
        });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address.'
            });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email address.'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'User is already verified.'
            });
        }

        // Delete existing OTP
        await Otp.deleteMany({ email });

        // Generate new OTP
        const otp = generateOtp();
        await Otp.create({ 
            email, 
            otp, 
            createdAt: new Date(), 
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) 
        });

        // Send new OTP
        const otpSent = await sendOtp(email, otp);
        
        if (otpSent) {
            res.status(200).json({
                success: true,
                message: 'New OTP sent successfully to your email.'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again.'
            });
        }
    } catch (error) {
        console.error('Error in resend OTP:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP resend.'
        });
    }
};


module.exports = {
    signup,
    verifyOtp,
    login,
    getMe,
    logout,
    forgotPassword,
    resetPassword,
    resendOtp,
    // Helper functions for other controllers
    generateOtp,
    sendOtp
};