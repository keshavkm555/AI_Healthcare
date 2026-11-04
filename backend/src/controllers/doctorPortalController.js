const { pool } = require('../config/db');

// Get appointments assigned to the logged-in doctor
const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctorUserId = req.user.id;

    // Find doctor record linked to this user_id
    const [doctors] = await pool.query('SELECT id, name FROM doctors WHERE user_id = ?', [doctorUserId]);
    if (doctors.length === 0) {
      return res.status(403).json({ success: false, message: 'No doctor profile linked to this account.' });
    }

    const doctorId = doctors[0].id;

    const [appointments] = await pool.query(`
      SELECT a.*, 
             u.full_name as patient_name, u.email as patient_email, u.phone as patient_phone,
             pp.blood_group, pp.age, pp.gender, pp.allergies, pp.existing_conditions,
             h.hospital_name
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
      JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.doctor_id = ?
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `, [doctorId]);

    return res.json({
      success: true,
      doctor: doctors[0],
      count: appointments.length,
      appointments
    });
  } catch (error) {
    next(error);
  }
};

// Update consultation notes / status by doctor
const updateConsultation = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { status = 'Completed', consultation_notes } = req.body;

    const [result] = await pool.query(`
      UPDATE appointments SET status = ?, consultation_notes = ? WHERE id = ?
    `, [status, consultation_notes || null, appointmentId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    return res.json({
      success: true,
      message: 'Consultation notes updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorAppointments,
  updateConsultation
};
