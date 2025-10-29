const { User } = require('../schema'); // Import your User model (adjust path if needed, e.g., ../schema/User)
const jwt = require('jsonwebtoken'); // For verifying JWT tokens

// @desc    Protect routes - Middleware to check for valid JWT
const protect = async (req, res, next) => {
    // Allow OPTIONS requests (preflight) to pass through for CORS
    if (req.method === 'OPTIONS') {
        return next();
    }

    let token;

    // 1) Check if token exists in the Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]; // Extract token from "Bearer <token>"
    }
    // 2) Alternatively, check if token is in a cookie (if you set it that way)
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Check if token is provided
    if (!token) {
  
        // If no token, the user is not authenticated
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route, no token provided.'
        });
    }

    try {
        // Verify token
        // This decodes the token using the secret and checks for expiration
       
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
     
        // Find user by the ID extracted from the token's payload
        // For staff users, we need to ensure discriminator fields are loaded
        const user = await User.findById(decoded.id);
        //console.log('🔑 [Protect Middleware] User:', user);
        
        // Debug logging for staff users
        if (user && user.role === 'staff') {
            
        }
        if (!user) {
            // If user associated with the token is not found (e.g., user deleted)
            return res.status(401).json({
                success: false,
                message: 'User belonging to this token no longer exists.'
            });
        }

        // Check subscription status for coaches
        if (user.role === 'coach') {
            // Import CoachSubscription model for subscription check
            const CoachSubscription = require('../schema/CoachSubscription');
            
            // Check subscription in CoachSubscription collection (single source of truth)
            const subscription = await CoachSubscription.findOne({ 
                coachId: user._id,
                status: { $in: ['active', 'pending_renewal'] }
            }).populate('planId');

       

            // Allow access to subscription management routes even if subscription is expired
            const subscriptionRoutes = [
                '/api/subscriptions/renew',
                '/api/subscriptions/cancel',
                '/api/subscriptions/my-subscription',
                '/api/subscriptions/subscribe',
                '/api/subscriptions/plans',
                '/api/subscriptions/current',
                '/api/subscriptions/create-order',
                '/api/subscriptions/verify-payment',
                '/api/subscriptions/history'
            ];
            
            const isSubscriptionRoute = subscriptionRoutes.some(route => 
                req.originalUrl.includes(route)
            );

            // Check if coach has any active subscription
            if (!subscription || subscription.status !== 'active') {
                // Allow access to subscription routes even without subscription
                if (isSubscriptionRoute) {
                    //console.log(`⚠️ [Protect Middleware] Coach ${user._id} accessing subscription route without active subscription`);
                    req.subscription = subscription;
                    req.subscriptionWarning = {
                        message: subscription ? `Your subscription is currently ${subscription.status}. Please renew to continue using the platform.` : 'No subscription found. Please set up your subscription to continue.',
                        code: subscription ? `SUBSCRIPTION_${subscription.status.toUpperCase()}` : 'NO_SUBSCRIPTION'
                    };
                } else {
                    // BLOCK ACCESS TO ALL OTHER ROUTES - This is the key fix!
                    const status = subscription ? subscription.status : 'none';
                    const message = subscription ? 
                        `Your subscription is currently ${status}. Please ensure your subscription is active to continue using the platform.` :
                        'No subscription found. Please set up your subscription to continue using the platform.';
                    
                    //console.log(`🚫 [Protect Middleware] Coach ${user._id} blocked from accessing ${req.originalUrl} - Subscription status: ${status}`);
                    return res.status(403).json({
                        success: false,
                        message: message,
                        code: subscription ? 'SUBSCRIPTION_NOT_ACTIVE' : 'NO_SUBSCRIPTION',
                        subscriptionStatus: status,
                        isEnabled: subscription?.accountStatus?.isEnabled || false,
                        blockedRoute: req.originalUrl
                    });
                }
            } else {
                // Check if subscription end date has passed
                if (subscription.currentPeriod && subscription.currentPeriod.endDate) {
                    const now = new Date();
                    const endDate = new Date(subscription.currentPeriod.endDate);
                    
                    if (endDate < now) {
                        // Allow access to subscription routes even if period ended
                        if (isSubscriptionRoute) {
                            //console.log(`⚠️ [Protect Middleware] Coach ${user._id} accessing subscription route with ended subscription period`);
                            req.subscription = subscription;
                            req.subscriptionWarning = {
                                message: 'Your subscription period has ended. Please renew to continue using the platform.',
                                code: 'SUBSCRIPTION_PERIOD_ENDED',
                                daysOverdue: Math.ceil((now - endDate) / (1000 * 60 * 60 * 24))
                            };
                        } else {
                            // BLOCK ACCESS TO ALL OTHER ROUTES
                            //console.log(`🚫 [Protect Middleware] Coach ${user._id} blocked from accessing ${req.originalUrl} - Subscription period ended`);
                            return res.status(403).json({
                                success: false,
                                message: 'Your subscription period has ended. Please renew to continue using the platform.',
                                code: 'SUBSCRIPTION_PERIOD_ENDED',
                                subscriptionStatus: subscription.status,
                                endDate: subscription.currentPeriod.endDate,
                                daysOverdue: Math.ceil((now - endDate) / (1000 * 60 * 60 * 24)),
                                blockedRoute: req.originalUrl
                            });
                        }
                    }
                }

                // Add subscription info to request for potential use in routes
                req.subscription = subscription;
                console.log(`✅ [Protect Middleware] Subscription check passed for coach ${user._id}. Status: ${subscription.status}`);
            }
        } else {
            // Non-coach roles don't need subscription checks
            //console.log(`🔒 [Protect Middleware] User ${user._id} has role ${user.role}, skipping subscription check`);
        }

        // Attach the user's ID and role to the request object
        // This makes the user's ID and role available in subsequent route handlers
        // If staff, set coachId to their owning coach for resource scoping
        req.userId = user._id; // Set userId for staff controllers
        req.coachId = user.role === 'staff' && user.coachId ? user.coachId : user._id;
        req.role = user.role;
        req.user = user; // Optionally attach the full user object (excluding password)

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
        
        // If you need to restrict by roles (e.g., only 'admin' or 'coach' can access)
        if (roles.length > 0 && !roles.includes(req.role)) {
            return res.status(403).json({
                success: false,
                message: `User role (${req.role}) is not authorized to access this route.`
            });
        }

        // Ownership check: Only apply to coaches, not admins
        // Admins can view any coach's data, coaches can only view their own
        if (req.role === 'coach' && req.coachId && req.params.coachId && req.coachId.toString() !== req.params.coachId.toString()) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: You are not authorized to access this resource for Coach ID ${req.params.coachId}.`
            });
        }

        // Additional ownership check for sponsorId parameter (used in downline routes)
        if (req.role === 'coach' && req.coachId && req.params.sponsorId && req.coachId.toString() !== req.params.sponsorId.toString()) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: You are not authorized to access downline data for Coach ID ${req.params.sponsorId}.`
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
    // Check if user has admin role
    if (req.role == 'admin' || req.role == 'super_admin') {
        return next();
    }
    
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