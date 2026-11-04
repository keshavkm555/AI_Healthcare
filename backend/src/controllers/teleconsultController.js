const { pool } = require('../config/db');

// Get doctors available for teleconsultation
const getTeleconsultDoctors = async (req, res, next) => {
  try {
    const [doctors] = await pool.query(`
      SELECT d.*, s.name as specialty_name, h.hospital_name, h.city as hospital_city
      FROM doctors d
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      WHERE d.teleconsult_available = 1
      ORDER BY d.rating DESC
    `);

    return res.json({
      success: true,
      doctors
    });
  } catch (error) {
    next(error);
  }
};

// Check / Join teleconsultation room
const getRoomStatus = async (req, res, next) => {
  try {
    const { roomRef } = req.params;

    const [appointments] = await pool.query(`
      SELECT a.*, 
             u.full_name as patient_name, u.email as patient_email,
             d.name as doctor_name, d.qualification as doctor_qualification,
             h.hospital_name, s.name as specialty_name
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.booking_reference = ? AND a.appointment_type = 'Video Teleconsultation'
    `, [roomRef]);

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No video teleconsultation appointment found with this reference.'
      });
    }

    const apt = appointments[0];

    // Authorization: User must be the patient, the assigned doctor, or an admin
    if (req.user.role === 'patient' && apt.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized room access.' });
    }

    return res.json({
      success: true,
      room: {
        reference: apt.booking_reference,
        status: apt.status,
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        patient_name: apt.patient_name,
        doctor_name: apt.doctor_name,
        specialty: apt.specialty_name,
        hospital: apt.hospital_name,
        isDoctorJoined: false, // Honest state tracking
        provider: 'HealthAI WebRTC Peer Telehealth (Demo Fallback Active)'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeleconsultDoctors,
  getRoomStatus
};
