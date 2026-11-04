const { pool } = require('../config/db');

// Get all medical records timeline
const getMedicalRecords = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    let query = 'SELECT * FROM medical_records WHERE user_id = ?';
    const params = [userId];

    if (type) {
      query += ' AND record_type = ?';
      params.push(type);
    }

    query += ' ORDER BY record_date DESC, created_at DESC';

    const [records] = await pool.query(query, params);

    return res.json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    next(error);
  }
};

// Generate comprehensive patient Health Summary (for printing or exporting EHR)
const getComprehensiveHealthSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. User & Profile
    const [users] = await pool.query('SELECT id, full_name, email, phone, created_at FROM users WHERE id = ?', [userId]);
    const [profiles] = await pool.query('SELECT * FROM patient_profiles WHERE user_id = ?', [userId]);

    // 2. Prescriptions
    const [prescriptions] = await pool.query('SELECT * FROM prescriptions WHERE user_id = ? ORDER BY issued_date DESC LIMIT 5', [userId]);
    for (const p of prescriptions) {
      const [meds] = await pool.query('SELECT * FROM prescription_medicines WHERE prescription_id = ?', [p.id]);
      p.medicines = meds;
    }

    // 3. Appointments
    const [appointments] = await pool.query(`
      SELECT a.*, h.hospital_name, d.name as doctor_name
      FROM appointments a
      JOIN hospitals h ON a.hospital_id = h.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE a.user_id = ?
      ORDER BY a.appointment_date DESC
      LIMIT 10
    `, [userId]);

    // 4. Lab Tests
    const [labs] = await pool.query(`
      SELECT lb.*, lt.name as test_name, lt.category
      FROM lab_bookings lb
      JOIN lab_tests lt ON lb.lab_test_id = lt.id
      WHERE lb.user_id = ?
      ORDER BY lb.booking_date DESC
      LIMIT 10
    `, [userId]);

    // 5. Scans
    const [scans] = await pool.query(`
      SELECT sb.*, ss.name as scan_name, ss.modality, h.hospital_name
      FROM scan_bookings sb
      JOIN scan_services ss ON sb.scan_service_id = ss.id
      JOIN hospitals h ON sb.hospital_id = h.id
      WHERE sb.user_id = ?
      ORDER BY sb.booking_date DESC
      LIMIT 10
    `, [userId]);

    // 6. Recent Vitals
    const [vitals] = await pool.query('SELECT * FROM vital_signs WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 5', [userId]);

    // 7. Recent Assessments
    const [assessments] = await pool.query('SELECT * FROM health_assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [userId]);

    return res.json({
      success: true,
      reportGeneratedAt: new Date().toISOString(),
      patient: users[0],
      profile: profiles[0] || {},
      prescriptions,
      appointments,
      labReports: labs,
      scanReports: scans,
      vitals,
      assessments
    });
  } catch (error) {
    next(error);
  }
};

// Add a manual health record entry
const addMedicalRecord = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      record_type,
      title,
      description,
      doctor_or_facility,
      record_date = new Date().toISOString().slice(0, 10),
      reference_id
    } = req.body;

    if (!record_type || !title) {
      return res.status(400).json({ success: false, message: 'Record type and title are required.' });
    }

    const [result] = await pool.query(`
      INSERT INTO medical_records (user_id, record_type, title, description, reference_id, doctor_or_facility, record_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      record_type,
      title.trim(),
      description || null,
      reference_id || `REC-${Date.now()}`,
      doctor_or_facility || 'Self-Reported Entry',
      record_date
    ]);

    return res.status(201).json({
      success: true,
      message: 'Medical record entry added successfully.',
      recordId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicalRecords,
  getComprehensiveHealthSummary,
  addMedicalRecord
};
