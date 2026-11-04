const express = require('express');
const router = express.Router();
const teleconsultController = require('../controllers/teleconsultController');
const { authenticateToken } = require('../middleware/auth');

router.get('/doctors', teleconsultController.getTeleconsultDoctors);
router.get('/room/:roomRef', authenticateToken, teleconsultController.getRoomStatus);

module.exports = router;
