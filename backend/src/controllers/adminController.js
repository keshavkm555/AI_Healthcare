const { pool } = require('../config/db');

// Overall System Statistics for Admin Dashboard
const getSystemStats = async (req, res, next) => {
  try {
    const [[userCount]] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [[patientCount]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "patient"');
    const [[doctorCount]] = await pool.query('SELECT COUNT(*) as count FROM doctors');
    const [[hospitalCount]] = await pool.query('SELECT COUNT(*) as count FROM hospitals');
    const [[appointmentCount]] = await pool.query('SELECT COUNT(*) as count FROM appointments');
    const [[assessmentCount]] = await pool.query('SELECT COUNT(*) as count FROM health_assessments');
    const [[labBookingCount]] = await pool.query('SELECT COUNT(*) as count FROM lab_bookings');
    const [[scanBookingCount]] = await pool.query('SELECT COUNT(*) as count FROM scan_bookings');
    const [[emergencyCount]] = await pool.query('SELECT COUNT(*) as count FROM emergency_events');

    // Recent activity audit logs
    const [recentLogs] = await pool.query(`
      SELECT al.*, u.full_name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    return res.json({
      success: true,
      stats: {
        totalUsers: userCount.count,
        totalPatients: patientCount.count,
        totalDoctors: doctorCount.count,
        totalHospitals: hospitalCount.count,
        totalAppointments: appointmentCount.count,
        totalAssessments: assessmentCount.count,
        totalLabBookings: labBookingCount.count,
        totalScanBookings: scanBookingCount.count,
        totalEmergencyEvents: emergencyCount.count
      },
      recentLogs
    });
  } catch (error) {
    next(error);
  }
};

// Manage Users: List with search and role filter
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    let query = 'SELECT id, full_name, email, role, phone, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (full_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await pool.query(query, params);

    return res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// Toggle User Status (Activate / Deactivate)
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query('SELECT id, is_active FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const newStatus = users[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

    // Audit log
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'USER_STATUS_CHANGE', 'users', id, `Changed is_active to ${newStatus}`]
    );

    return res.json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully.`,
      is_active: Boolean(newStatus)
    });
  } catch (error) {
    next(error);
  }
};

// Get all appointments for admin view
const getAllAppointments = async (req, res, next) => {
  try {
    const { status, hospitalId } = req.query;

    let query = `
      SELECT a.*, 
             u.full_name as patient_name, u.email as patient_email, u.phone as patient_phone,
             h.hospital_name, d.name as doctor_name
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN hospitals h ON a.hospital_id = h.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (hospitalId) {
      query += ' AND a.hospital_id = ?';
      params.push(hospitalId);
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

// Update Appointment Status (Admin)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, consultation_notes } = req.body;

    const validStatuses = ['Confirmed', 'Completed', 'Cancelled', 'Rescheduled', 'Pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment status.' });
    }

    await pool.query(`
      UPDATE appointments SET status = ?, consultation_notes = COALESCE(?, consultation_notes) WHERE id = ?
    `, [status, consultation_notes || null, id]);

    return res.json({
      success: true,
      message: `Appointment updated to ${status}.`
    });
  } catch (error) {
    next(error);
  }
};

// Create a Doctor (Admin)
const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      hospital_id,
      specialty_id,
      qualification,
      experience_years = 5,
      consultation_fee = 500,
      phone,
      email,
      bio,
      rating = 4.8,
      available_days = 'Mon,Tue,Wed,Thu,Fri',
      teleconsult_available = true
    } = req.body;

    if (!name || !hospital_id || !specialty_id || !qualification) {
      return res.status(400).json({ success: false, message: 'Doctor name, hospital, specialty, and qualification are required.' });
    }

    const [result] = await pool.query(`
      INSERT INTO doctors (
        name, hospital_id, specialty_id, qualification, experience_years,
        consultation_fee, phone, email, bio, rating, available_days, teleconsult_available
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, hospital_id, specialty_id, qualification, experience_years,
      consultation_fee, phone, email, bio, rating, available_days, teleconsult_available ? 1 : 0
    ]);

    return res.status(201).json({
      success: true,
      message: 'Doctor added successfully.',
      doctorId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemStats,
  getUsers,
  toggleUserStatus,
  getAllAppointments,
  updateAppointmentStatus,
  createDoctor
};
