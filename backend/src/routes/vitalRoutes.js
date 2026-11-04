const express = require('express');
const router = express.Router();
const vitalController = require('../controllers/vitalController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, vitalController.recordVitals);
router.get('/history', authenticateToken, vitalController.getVitalsHistory);
router.get('/latest', authenticateToken, vitalController.getLatestVitals);

module.exports = router;
