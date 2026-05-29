const User = require('../models/User');

const adminAuthMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: 'Access denied. No user ID found.' });
    }
    
    const user = await User.findById(req.user.id);
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
  } catch (err) {
    console.error('Admin Auth Error:', err);
    res.status(500).json({ message: 'Server Error verifying admin role' });
  }
};

module.exports = adminAuthMiddleware;
