const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, recordController.getMedicalRecords);
router.get('/summary', authenticateToken, recordController.getComprehensiveHealthSummary);
router.post('/', authenticateToken, recordController.addMedicalRecord);

module.exports = router;
