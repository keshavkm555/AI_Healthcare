const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { pool } = require('../config/db');

// Verify JWT token from header
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization token provided.'
      });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Check if user is still active in database
    const [rows] = await pool.query(
      'SELECT id, full_name, email, role, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0 || !rows[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated or does not exist.'
      });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session token has expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid or corrupted authorization token.'
    });
  }
};

// Check for specific roles
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' does not have sufficient permissions.`
      });
    }

    next();
  };
};

// Ensure patient cannot view or modify another patient's data
const requireOwnershipOrPrivilege = (userIdParam = 'userId') => {
  return (req, res, next) => {
    const requestedUserId = parseInt(req.params[userIdParam] || req.body[userIdParam] || req.query[userIdParam], 10);
    
    if (req.user.role === 'admin' || req.user.role === 'doctor') {
      return next();
    }

    if (req.user.id !== requestedUserId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to other patient records.'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnershipOrPrivilege
};
