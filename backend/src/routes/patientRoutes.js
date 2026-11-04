const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken } = require('../middleware/auth');

router.get('/profile', authenticateToken, patientController.getProfile);
router.put('/profile', authenticateToken, patientController.updateProfile);
router.get('/dashboard', authenticateToken, patientController.getDashboardData);

module.exports = router;
