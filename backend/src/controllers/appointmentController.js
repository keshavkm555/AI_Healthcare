const { pool, withTransaction } = require('../config/db');

// Helper to generate reference: APT-2026-XXXX
function generateBookingReference() {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `APT-${year}-${randomDigits}`;
}

// Book an appointment with concurrency protection & transaction
const bookAppointment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      hospital_id,
      doctor_id,
      appointment_date,
      appointment_time,
      appointment_type = 'OPD In-Person',
      reason
    } = req.body;

    if (!hospital_id || !appointment_date || !appointment_time || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Hospital, appointment date, time, and reason are required.'
      });
    }

    // Safeguard using transaction
    const bookingResult = await withTransaction(async (connection) => {
      // 1. Check if hospital exists
      const [hospRows] = await connection.query('SELECT hospital_name FROM hospitals WHERE id = ?', [hospital_id]);
      if (hospRows.length === 0) {
        throw { statusCode: 404, message: 'Selected hospital does not exist.' };
      }

      // 2. If doctor selected, check if doctor exists and prevent double booking
      let doctorName = 'Hospital Resident Physician';
      if (doctor_id) {
        const [docRows] = await connection.query('SELECT name FROM doctors WHERE id = ?', [doctor_id]);
        if (docRows.length === 0) {
          throw { statusCode: 404, message: 'Selected doctor does not exist.' };
        }
        doctorName = docRows[0].name;

        // Check if doctor is already booked at that exact date and time (excluding cancelled ones)
        const [existing] = await connection.query(
          `SELECT id FROM appointments 
           WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? 
             AND status NOT IN ('Cancelled') 
           FOR UPDATE`,
          [doctor_id, appointment_date, appointment_time]
        );

        if (existing.length > 0) {
          throw {
            statusCode: 409,
            message: `This time slot (${appointment_time}) on ${appointment_date} is already booked for ${doctorName}. Please select another time slot.`
          };
        }
      }

      // 3. Generate unique booking reference
      let reference = generateBookingReference();
      let isUnique = false;
      while (!isUnique) {
        const [refCheck] = await connection.query('SELECT id FROM appointments WHERE booking_reference = ?', [reference]);
        if (refCheck.length === 0) isUnique = true;
        else reference = generateBookingReference();
      }

      // 4. Meeting link if teleconsultation
      let meetingLink = null;
      if (appointment_type === 'Video Teleconsultation') {
        meetingLink = `/video-consult?room=${reference}`;
      }

      // 5. Insert Appointment
      const [result] = await connection.query(
        `INSERT INTO appointments (
          booking_reference, user_id, hospital_id, doctor_id,
          appointment_date, appointment_time, appointment_type,
          reason, status, meeting_link
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?)`,
        [
          reference, userId, hospital_id, doctor_id || null,
          appointment_date, appointment_time, appointment_type,
          reason.trim(), meetingLink
        ]
      );

      // 6. Log in medical records timeline
      await connection.query(
        `INSERT INTO medical_records (user_id, record_type, title, description, reference_id, doctor_or_facility, record_date)
         VALUES (?, 'Clinical Note', ?, ?, ?, ?, ?)`,
        [
          userId,
          `Appointment: ${appointment_type} (${hospRows[0].hospital_name})`,
          `Reason: ${reason}. Doctor: ${doctorName}. Status: Confirmed.`,
          reference,
          hospRows[0].hospital_name,
          appointment_date
        ]
      );

      // 7. Insert Notification for user
      await connection.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, ?, ?, 'appointment')`,
        [
          userId,
          'Appointment Confirmed',
          `Your appointment (${reference}) at ${hospRows[0].hospital_name} on ${appointment_date} at ${appointment_time} is confirmed.`
        ]
      );

      return {
        appointment_id: result.insertId,
        booking_reference: reference,
        hospital_name: hospRows[0].hospital_name,
        doctor_name: doctorName,
        appointment_date,
        appointment_time,
        appointment_type,
        meeting_link: meetingLink
      };
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      booking: bookingResult
    });

  } catch (error) {
    next(error);
  }
};

// Get current user's appointments
const getMyAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, type } = req.query;

    let query = `
      SELECT a.*, 
             h.hospital_name, h.address as hospital_address, h.phone as hospital_phone,
             d.name as doctor_name, d.qualification as doctor_qualification,
             s.name as specialty_name
      FROM appointments a
      JOIN hospitals h ON a.hospital_id = h.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      WHERE a.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND a.appointment_type = ?';
      params.push(type);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const [appointments] = await pool.query(query, params);

    return res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Appointment (with printable slip details)
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT a.*,
             u.full_name as patient_name, u.email as patient_email, u.phone as patient_phone,
             pp.blood_group, pp.age, pp.gender,
             h.hospital_name, h.address as hospital_address, h.phone as hospital_phone,
             d.name as doctor_name, d.qualification as doctor_qualification, d.consultation_fee,
             s.name as specialty_name
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
      JOIN hospitals h ON a.hospital_id = h.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      WHERE a.id = ? OR a.booking_reference = ?
    `, [id, id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const appointment = rows[0];

    // Authorization check
    if (req.user.role === 'patient' && appointment.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.json({
      success: true,
      appointment
    });
  } catch (error) {
    next(error);
  }
};

// Cancel Appointment
const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check appointment
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const appointment = rows[0];

    if (req.user.role === 'patient' && appointment.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled.' });
    }

    await pool.query('UPDATE appointments SET status = "Cancelled" WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Appointment has been cancelled successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Reschedule Appointment
const rescheduleAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { new_date, new_time } = req.body;
    const userId = req.user.id;

    if (!new_date || !new_time) {
      return res.status(400).json({ success: false, message: 'New date and time are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const apt = rows[0];
    if (req.user.role === 'patient' && apt.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Prevent double booking for doctor
    if (apt.doctor_id) {
      const [conflicts] = await pool.query(
        `SELECT id FROM appointments 
         WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND id != ? AND status != 'Cancelled'`,
        [apt.doctor_id, new_date, new_time, id]
      );
      if (conflicts.length > 0) {
        return res.status(409).json({ success: false, message: 'The chosen slot is already booked for this doctor.' });
      }
    }

    await pool.query(
      'UPDATE appointments SET appointment_date = ?, appointment_time = ?, status = "Rescheduled" WHERE id = ?',
      [new_date, new_time, id]
    );

    return res.json({
      success: true,
      message: 'Appointment rescheduled successfully!'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment
};
