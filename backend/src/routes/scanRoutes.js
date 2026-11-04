const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { authenticateToken } = require('../middleware/auth');

router.get('/services', scanController.getScanServices);
router.post('/book', authenticateToken, scanController.bookScan);
router.get('/my-bookings', authenticateToken, scanController.getMyScanBookings);
router.put('/bookings/:id/cancel', authenticateToken, scanController.cancelScanBooking);

module.exports = router;
