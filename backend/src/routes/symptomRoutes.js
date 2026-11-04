const express = require('express');
const router = express.Router();
const symptomController = require('../controllers/symptomController');
const { authenticateToken } = require('../middleware/auth');

// Optional auth for assessment so guest users on landing page can check symptoms too
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateToken(req, res, next);
  }
  req.user = null;
  next();
};

router.post('/assess', optionalAuth, symptomController.checkSymptoms);
router.post('/save', authenticateToken, symptomController.saveAssessment);
router.get('/my-history', authenticateToken, symptomController.getMyAssessments);
router.get('/:id', authenticateToken, symptomController.getAssessmentById);

module.exports = router;
