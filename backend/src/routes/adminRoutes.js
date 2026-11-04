const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All admin routes strictly require admin role
router.use(authenticateToken, requireRole('admin'));

router.get('/stats', adminController.getSystemStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/appointments', adminController.getAllAppointments);
router.put('/appointments/:id/status', adminController.updateAppointmentStatus);
router.post('/doctors', adminController.createDoctor);

module.exports = router;
