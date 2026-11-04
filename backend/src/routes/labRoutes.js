const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { authenticateToken } = require('../middleware/auth');

router.get('/tests', labController.getLabTests);
router.post('/book', authenticateToken, labController.bookLabTest);
router.get('/my-bookings', authenticateToken, labController.getMyLabBookings);
router.put('/bookings/:id/cancel', authenticateToken, labController.cancelLabBooking);

module.exports = router;
