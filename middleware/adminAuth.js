const jwt = require('jsonwebtoken');
const AdminUser = require('../schema/AdminUser');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

module.exports = async function(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = auth.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await AdminUser.findById(decoded.id);
        if (!admin) return res.status(401).json({ success: false, message: 'Invalid token' });
        req.admin = admin;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
