const express = require('express');
const router = express.Router();
const doctorPortalController = require('../controllers/doctorPortalController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken, requireRole('doctor', 'admin'));

router.get('/appointments', doctorPortalController.getDoctorAppointments);
router.put('/appointments/:appointmentId/consultation', doctorPortalController.updateConsultation);

module.exports = router;
