// D:\\PRJ_YCT_Final\\middleware\\activityMiddleware.js

const User = require('../schema/User'); // Import the base User model

exports.updateLastActive = async (req, res, next) => {
    console.log("🔄 updateLastActive middleware executing...");
    console.log("🔄 req.user:", req.user ? req.user._id : 'undefined');
    console.log("🔄 req.role:", req.role);
    
    // This assumes your authentication middleware sets the user's ID on req.user.id
    if (req.user && req.user.id) {
        try {
            console.log("🔄 Updating last active timestamp...");
            // Use a timeout to prevent hanging
            const updatePromise = User.findByIdAndUpdate(req.user.id, { lastActiveAt: Date.now() });
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Update timeout')), 5000)
            );
            
            await Promise.race([updatePromise, timeoutPromise]);
            console.log("🔄 Last active timestamp updated successfully");
        } catch (err) {
            console.error('🔄 Error updating last active timestamp:', err.message);
            // Don't block the request if this fails
        }
    } else {
        console.log("🔄 No user found, skipping last active update");
    }
    
    console.log("🔄 updateLastActive middleware completed, calling next()");
    next();
};