const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/my-prescriptions', authenticateToken, prescriptionController.getMyPrescriptions);
router.get('/:id', authenticateToken, prescriptionController.getPrescriptionById);
router.post('/', authenticateToken, requireRole('doctor', 'admin'), prescriptionController.createPrescription);

// Medicine Reminders
router.get('/reminders/today', authenticateToken, prescriptionController.getMedicineReminders);
router.put('/reminders/:id/toggle', authenticateToken, prescriptionController.toggleReminderTaken);
router.post('/reminders/custom', authenticateToken, prescriptionController.addPatientMedicineReminder);

module.exports = router;
