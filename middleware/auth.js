const { User } = require('../schema'); // Import your User model (adjust path if needed, e.g., ../schema/User)
const jwt = require('jsonwebtoken'); // For verifying JWT tokens

// @desc    Protect routes - Middleware to check for valid JWT
const protect = async (req, res, next) => {
    console.log("🔒 protect middleware executing...");
    
    let token;

    // 1) Check if token exists in the Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]; // Extract token from "Bearer <token>"
        console.log("🔒 Token found in Authorization header");
    }
    // 2) Alternatively, check if token is in a cookie (if you set it that way)
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Check if token is provided
    if (!token) {
        console.log("🔒 No token provided");
        // If no token, the user is not authenticated
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route, no token provided.'
        });
    }

    try {
        console.log("🔒 Verifying token...");
        // Verify token
        // This decodes the token using the secret and checks for expiration
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("🔒 Token verified, decoded ID:", decoded.id);

        // Find user by the ID extracted from the token's payload
        // .select('-password') is implicitly handled by `select: false` in User model
        const user = await User.findById(decoded.id);
        console.log("🔒 User found:", user ? user._id : 'undefined');

        if (!user) {
            console.log("🔒 User not found");
            // If user associated with the token is not found (e.g., user deleted)
            return res.status(401).json({
                success: false,
                message: 'User belonging to this token no longer exists.'
            });
        }

        // Attach the user's ID and role to the request object
        // This makes the user's ID and role available in subsequent route handlers
        // If staff, set coachId to their owning coach for resource scoping
        req.coachId = user.role === 'staff' && user.coachId ? user.coachId : user._id;
        req.role = user.role;
        req.user = user; // Optionally attach the full user object (excluding password)
        
        console.log("🔒 User authenticated successfully, role:", req.role);
        console.log("🔒 protect middleware completed, calling next()");

        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        console.error('🔒 Error in protect middleware:', error.message);
        // Handle different JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route, invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route, token has expired.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error in authentication process.'
        });
    }
};

// @desc    Authorize specific roles - Middleware to check user roles
// @params  ...roles (e.g., 'admin', 'coach')
const authorizeCoach = (...roles) => {
    // This returns another middleware function

    return (req, res, next) => {
        // req.role is set by the 'protect' middleware
        // Check if the user's role is included in the allowed roles for this route
        // If req.coachId is meant to verify *ownership*, this middleware needs to compare req.coachId with req.params.coachId.
        // The current implementation is for general role-based access control.
        // If it's for ownership, consider renaming to authorizeOwnership or similar.
        // For example, to ensure coach only accesses their own funnels:
        if (req.coachId && req.params.coachId && req.coachId.toString() !== req.params.coachId.toString()) {
             return res.status(403).json({
                 success: false,
                 message: `Forbidden: You are not authorized to access this resource for Coach ID ${req.params.coachId}.`
             });
        }

        // If you need to restrict by roles (e.g., only 'admin' or 'coach' can access)
        if (roles.length > 0 && !roles.includes(req.role)) {
            return res.status(403).json({
                success: false,
                message: `User role (${req.role}) is not authorized to access this route.`
            });
        }

        next(); // User is authorized, proceed
    };
};

// @desc    Authorize staff access - Middleware to check if user is staff or has staff access
const authorizeStaff = (...roles) => {
    return (req, res, next) => {
        // Check if user is staff or has staff access
        if (req.role === 'staff') {
            // Staff can access their own dashboard
            return next();
        }
        
        // If specific roles are provided, check if user has those roles
        if (roles.length > 0 && roles.includes(req.role)) {
            return next();
        }
        
        // If no roles specified, allow coach and admin to access staff data
        if (req.role === 'coach' || req.role === 'admin' || req.role === 'super_admin') {
            return next();
        }
        
        return res.status(403).json({
            success: false,
            message: `User role (${req.role}) is not authorized to access staff dashboard.`
        });
    };
};

// @desc    Authorize admin access - Middleware to check if user has admin privileges
const authorizeAdmin = (req, res, next) => {
    console.log("🔐 authorizeAdmin middleware executing...");
    console.log("🔐 req.role:", req.role);
    console.log("🔐 req.user:", req.user ? req.user._id : 'undefined');
    
    // Check if user has admin role
    if (req.role == 'admin' || req.role == 'super_admin') {
        console.log("🔐 User has admin role, proceeding...");
        return next();
    }
    
    console.log("🔐 User not authorized, sending 403...");
    return res.status(403).json({
        success: false,
        message: `User role (${req.role}) is not authorized to access admin functions. Admin privileges required.`
    });
};


module.exports = {
    protect,
    authorizeCoach,
    authorizeStaff,
    authorizeAdmin
};