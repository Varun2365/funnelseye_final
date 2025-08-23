const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { updateLastActive } = require('../middleware/activityMiddleware'); // Your new middleware

// --- Public Routes (No authentication required) ---

// Signup route: Register a new user and send OTP for verification
// POST /api/auth/signup
// Required Body Fields: { "name": "string", "email": "string", "password": "string", "role": "string" }
router.post('/signup', authController.signup);

// Verify OTP route: Confirm user's email with OTP
// POST /api/auth/verify-otp
// Required Body Fields: { "email": "string", "otp": "string" }
router.post('/verify-otp', authController.verifyOtp);

// Login route: Authenticate user and issue JWT
// POST /api/auth/login
// Required Body Fields: { "email": "string", "password": "string" }
router.post('/login', authController.login);

// Forgot password route: Send reset password email
// POST /api/auth/forgot-password
// Required Body Fields: { "email": "string" }
router.post('/forgot-password', authController.forgotPassword);

// Reset password route: Reset password with token
// POST /api/auth/reset-password
// Required Body Fields: { "token": "string", "password": "string" }
router.post('/reset-password', authController.resetPassword);

// Resend OTP route: Resend OTP for email verification
// POST /api/auth/resend-otp
// Required Body Fields: { "email": "string" }
router.post('/resend-otp', authController.resendOtp);


// --- Private Routes (Authentication required via JWT) ---

// Use router.use() to apply both the authentication and activity tracking middleware
// to ALL subsequent routes in this file.
router.use(protect, updateLastActive);

// Get current logged-in user's details
// GET /api/auth/me
// Required Body Fields: None (relies on JWT sent in Authorization header)
router.get('/me', authController.getMe);

// Log out user / Clear token cookie
// GET /api/auth/logout
// Required Body Fields: None (relies on JWT sent in Authorization header, primarily clears server-set cookie)
router.get('/logout', authController.logout);


module.exports = router;