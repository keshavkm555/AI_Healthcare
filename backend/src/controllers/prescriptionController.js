const { pool, withTransaction } = require('../config/db');

// Get all prescriptions for logged in user
const getMyPrescriptions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [prescriptions] = await pool.query(`
      SELECT p.*, h.hospital_name, d.name as doctor_name_rel
      FROM prescriptions p
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      LEFT JOIN doctors d ON p.doctor_id = d.id
      WHERE p.user_id = ?
      ORDER BY p.issued_date DESC
    `, [userId]);

    // Attach medicines to each prescription
    for (const p of prescriptions) {
      const [meds] = await pool.query(
        'SELECT * FROM prescription_medicines WHERE prescription_id = ?',
        [p.id]
      );
      p.medicines = meds;
    }

    return res.json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    next(error);
  }
};

// Get single prescription
const getPrescriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT p.*, h.hospital_name, h.address as hospital_address, h.phone as hospital_phone,
             u.full_name as patient_name, u.email as patient_email,
             pp.blood_group, pp.age, pp.gender
      FROM prescriptions p
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN patient_profiles pp ON u.id = pp.user_id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    const prescription = rows[0];

    // Ownership check
    if (req.user.role === 'patient' && prescription.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [medicines] = await pool.query(
      'SELECT * FROM prescription_medicines WHERE prescription_id = ?',
      [id]
    );
    prescription.medicines = medicines;

    return res.json({
      success: true,
      prescription
    });
  } catch (error) {
    next(error);
  }
};

// Create a prescription (Only authorized doctors or admins)
const createPrescription = async (req, res, next) => {
  try {
    const {
      user_id, // Patient ID
      hospital_id,
      doctor_name,
      diagnosis,
      notes,
      issued_date = new Date().toISOString().slice(0, 10),
      valid_until,
      medicines = []
    } = req.body;

    if (!user_id || !diagnosis || !medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, diagnosis, and at least one medicine are required.'
      });
    }

    const doctorId = req.user.role === 'doctor' ? req.user.id : null;
    const resolvedDoctorName = doctor_name || req.user.full_name;

    const result = await withTransaction(async (conn) => {
      // 1. Insert prescription
      const [pRes] = await conn.query(`
        INSERT INTO prescriptions (
          user_id, doctor_id, hospital_id, doctor_name, diagnosis, notes,
          issued_date, valid_until, source_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Doctor Prescribed')
      `, [
        user_id, doctorId, hospital_id || null, resolvedDoctorName,
        diagnosis, notes || null, issued_date, valid_until || null
      ]);

      const prescriptionId = pRes.insertId;

      // 2. Insert medicines and automatic daily reminders
      for (const med of medicines) {
        const [mRes] = await conn.query(`
          INSERT INTO prescription_medicines (
            prescription_id, medicine_name, dosage, frequency, timing,
            start_date, end_date, instructions
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          prescriptionId, med.medicine_name, med.dosage, med.frequency || 'Once daily',
          med.timing || 'After Food', med.start_date || issued_date,
          med.end_date || issued_date, med.instructions || null
        ]);

        const pMedId = mRes.insertId;

        // Create a morning reminder by default for demonstration
        await conn.query(`
          INSERT INTO medicine_reminders (
            user_id, prescription_medicine_id, medicine_name, dosage,
            reminder_time, day_phase, is_taken, reminder_date
          ) VALUES (?, ?, ?, ?, '09:00:00', 'Morning', 0, CURRENT_DATE())
        `, [user_id, pMedId, med.medicine_name, med.dosage]);
      }

      // 3. Add to medical records timeline
      await conn.query(`
        INSERT INTO medical_records (user_id, record_type, title, description, reference_id, doctor_or_facility, record_date)
        VALUES (?, 'Prescription', ?, ?, ?, ?, ?)
      `, [
        user_id,
        `Prescription: ${diagnosis}`,
        `Prescribed by ${resolvedDoctorName}. ${medicines.length} medication(s).`,
        `RX-${prescriptionId}`,
        resolvedDoctorName,
        issued_date
      ]);

      return prescriptionId;
    });

    return res.status(201).json({
      success: true,
      message: 'Prescription recorded successfully with medication reminders!',
      prescriptionId: result
    });
  } catch (error) {
    next(error);
  }
};

// Medicine Reminders: Get today's reminders
const getMedicineReminders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().slice(0, 10);

    const [reminders] = await pool.query(`
      SELECT mr.*, pm.instructions, pm.timing
      FROM medicine_reminders mr
      LEFT JOIN prescription_medicines pm ON mr.prescription_medicine_id = pm.id
      WHERE mr.user_id = ? AND mr.reminder_date = ?
      ORDER BY mr.reminder_time ASC
    `, [userId, targetDate]);

    // Calculate adherence stats
    const total = reminders.length;
    const taken = reminders.filter(r => r.is_taken).length;
    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 100;

    return res.json({
      success: true,
      date: targetDate,
      reminders,
      adherenceRate
    });
  } catch (error) {
    next(error);
  }
};

// Medicine Reminders: Toggle Mark as Taken
const toggleReminderTaken = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query('SELECT * FROM medicine_reminders WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reminder not found.' });
    }

    if (rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const newStatus = rows[0].is_taken ? 0 : 1;
    const takenAt = newStatus ? new Date() : null;

    await pool.query(
      'UPDATE medicine_reminders SET is_taken = ?, taken_at = ? WHERE id = ?',
      [newStatus, takenAt, id]
    );

    return res.json({
      success: true,
      message: newStatus ? 'Medicine marked as taken! Great job keeping up with your schedule.' : 'Marked as pending.',
      is_taken: Boolean(newStatus)
    });
  } catch (error) {
    next(error);
  }
};

// Add Patient-Entered Medicine Reminder
const addPatientMedicineReminder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      medicine_name,
      dosage,
      reminder_time = '08:00:00',
      day_phase = 'Morning',
      reminder_date = new Date().toISOString().slice(0, 10)
    } = req.body;

    if (!medicine_name || !dosage) {
      return res.status(400).json({ success: false, message: 'Medicine name and dosage are required.' });
    }

    const [result] = await pool.query(`
      INSERT INTO medicine_reminders (user_id, prescription_medicine_id, medicine_name, dosage, reminder_time, day_phase, is_taken, reminder_date)
      VALUES (?, NULL, ?, ?, ?, ?, 0, ?)
    `, [userId, medicine_name.trim(), dosage.trim(), reminder_time, day_phase, reminder_date]);

    return res.status(201).json({
      success: true,
      message: 'Personal medication reminder created.',
      reminderId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyPrescriptions,
  getPrescriptionById,
  createPrescription,
  getMedicineReminders,
  toggleReminderTaken,
  addPatientMedicineReminder
};
