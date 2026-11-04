const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

router.get('/specialties', doctorController.getSpecialties);
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);

module.exports = router;
