const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Optional auth for emergency event logging
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateToken(req, res, next);
  }
  req.user = null;
  next();
};

router.get('/helplines', emergencyController.getHelplines);
router.post('/log-event', optionalAuth, emergencyController.logEmergencyEvent);
router.get('/history', authenticateToken, requireRole('admin'), emergencyController.getEmergencyHistory);

module.exports = router;
