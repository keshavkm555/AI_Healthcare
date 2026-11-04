const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', packageController.getAllPackages);
router.post('/book', authenticateToken, packageController.bookPackage);
router.get('/my-bookings', authenticateToken, packageController.getMyPackageBookings);

module.exports = router;
