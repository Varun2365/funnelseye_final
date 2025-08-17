const AdminUser = require('../schema/AdminUser');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const JWT_EXPIRES = '7d';

// POST /api/admin/login
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorResponse('Email and password are required', 400));
    }
    const admin = await AdminUser.findOne({ email: email.toLowerCase() });
    if (!admin) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }
    const token = jwt.sign({ id: admin._id, email: admin.email, name: admin.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.status(200).json({ success: true, token });
});

// GET /api/admin/me
const me = asyncHandler(async (req, res, next) => {
    if (!req.admin) {
        return next(new ErrorResponse('Not authenticated', 401));
    }
    res.status(200).json({
        success: true,
        data: {
            id: req.admin._id,
            email: req.admin.email,
            name: req.admin.name,
            createdAt: req.admin.createdAt
        }
    });
});

// POST /api/admin/logout (frontend only)
const logout = asyncHandler(async (req, res, next) => {
    res.status(200).json({ success: true, message: 'Logged out' });
});

module.exports = { login, me, logout };
