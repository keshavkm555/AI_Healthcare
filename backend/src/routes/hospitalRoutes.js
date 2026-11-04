const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', hospitalController.getAllHospitals);
router.get('/:id', hospitalController.getHospitalById);
router.post('/', authenticateToken, requireRole('admin'), hospitalController.createHospital);
router.put('/:id', authenticateToken, requireRole('admin'), hospitalController.updateHospital);
router.delete('/:id', authenticateToken, requireRole('admin'), hospitalController.deleteHospital);

module.exports = router;
