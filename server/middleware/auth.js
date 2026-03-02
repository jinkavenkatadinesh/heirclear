const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'You are not logged in.',
                action: 'Please log in to continue.'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                message: 'Your session is no longer valid.',
                action: 'Please log in again.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Your session has expired.',
                action: 'Please log in again to continue.'
            });
        }
        return res.status(401).json({
            message: 'Authentication failed.',
            action: 'Please log in again.'
        });
    }
};

// Check if user is admin
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'You do not have permission to access this page.',
            action: 'This area is restricted to administrators only.'
        });
    }
    next();
};

module.exports = { auth, adminOnly };
