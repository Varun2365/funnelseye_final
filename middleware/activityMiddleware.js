// D:\\PRJ_YCT_Final\\middleware\\activityMiddleware.js

const User = require('../schema/User'); // Import the base User model

exports.updateLastActive = async (req, res, next) => {

    
    // This assumes your authentication middleware sets the user's ID on req.user.id
    if (req.user && req.user.id) {
        try {
            
            // Use a timeout to prevent hanging
            const updatePromise = User.findByIdAndUpdate(req.user.id, { lastActiveAt: Date.now() });
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Update timeout')), 5000)
            );
            
            await Promise.race([updatePromise, timeoutPromise]);

        } catch (err) {
            console.error('🔄 Error updating last active timestamp:', err.message);
            // Don't block the request if this fails
        }
    } else {

    }
    

    next();
};