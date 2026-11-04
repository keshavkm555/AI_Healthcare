const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, appointmentController.bookAppointment);
router.get('/my-appointments', authenticateToken, appointmentController.getMyAppointments);
router.get('/:id', authenticateToken, appointmentController.getAppointmentById);
router.put('/:id/cancel', authenticateToken, appointmentController.cancelAppointment);
router.put('/:id/reschedule', authenticateToken, appointmentController.rescheduleAppointment);

module.exports = router;
