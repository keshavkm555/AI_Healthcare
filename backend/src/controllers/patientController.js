const { pool } = require('../config/db');

// Helper to calculate BMI and category
function calculateBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return { bmi: null, category: null };
  }
  const heightM = heightCm / 100;
  const bmiVal = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'Normal weight';
  if (bmiVal < 18.5) category = 'Underweight';
  else if (bmiVal >= 25 && bmiVal < 29.9) category = 'Overweight';
  else if (bmiVal >= 30) category = 'Obesity';

  return { bmi: bmiVal, category };
}

// Calculate profile completion percentage
function calculateCompletionPercentage(profile, user) {
  const fields = [
    user.full_name,
    user.email,
    user.phone,
    profile.date_of_birth || profile.age,
    profile.gender,
    profile.blood_group,
    profile.height_cm,
    profile.weight_kg,
    profile.allergies,
    profile.existing_conditions,
    profile.emergency_contact_name,
    profile.emergency_contact_phone,
    profile.insurance_provider
  ];

  const filledCount = fields.filter(f => f !== null && f !== undefined && f !== '').length;
  return Math.round((filledCount / fields.length) * 100);
}

// Get Patient Profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const [profiles] = await pool.query(
      'SELECT * FROM patient_profiles WHERE user_id = ?',
      [userId]
    );

    const profile = profiles[0] || {};

    return res.json({
      success: true,
      user: users[0],
      profile
    });
  } catch (error) {
    next(error);
  }
};

// Update Patient Profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      phone,
      date_of_birth,
      age,
      gender,
      blood_group,
      height_cm,
      weight_kg,
      allergies,
      existing_conditions,
      current_medications,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
      insurance_provider,
      insurance_policy_number
    } = req.body;

    // Update basic user info
    if (full_name || phone) {
      await pool.query(
        'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?',
        [full_name || null, phone || null, userId]
      );
    }

    // Calculate BMI
    const { bmi, category } = calculateBMI(height_cm, weight_kg);

    // Upsert patient profile
    const [existing] = await pool.query('SELECT id FROM patient_profiles WHERE user_id = ?', [userId]);

    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO patient_profiles (
          user_id, date_of_birth, age, gender, blood_group, height_cm, weight_kg,
          bmi, bmi_category, allergies, existing_conditions, current_medications,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
          insurance_provider, insurance_policy_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, date_of_birth || null, age || null, gender || null, blood_group || null,
          height_cm || null, weight_kg || null, bmi, category, allergies || null,
          existing_conditions || null, current_medications || null,
          emergency_contact_name || null, emergency_contact_phone || null, emergency_contact_relation || null,
          insurance_provider || null, insurance_policy_number || null
        ]
      );
    } else {
      await pool.query(
        `UPDATE patient_profiles SET
          date_of_birth = ?, age = ?, gender = ?, blood_group = ?,
          height_cm = ?, weight_kg = ?, bmi = ?, bmi_category = ?,
          allergies = ?, existing_conditions = ?, current_medications = ?,
          emergency_contact_name = ?, emergency_contact_phone = ?, emergency_contact_relation = ?,
          insurance_provider = ?, insurance_policy_number = ?
        WHERE user_id = ?`,
        [
          date_of_birth || null, age || null, gender || null, blood_group || null,
          height_cm || null, weight_kg || null, bmi, category,
          allergies || null, existing_conditions || null, current_medications || null,
          emergency_contact_name || null, emergency_contact_phone || null, emergency_contact_relation || null,
          insurance_provider || null, insurance_policy_number || null,
          userId
        ]
      );
    }

    // Refresh and recalculate completion percentage
    const [updatedProfiles] = await pool.query('SELECT * FROM patient_profiles WHERE user_id = ?', [userId]);
    const [updatedUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

    const completion = calculateCompletionPercentage(updatedProfiles[0], updatedUsers[0]);
    await pool.query('UPDATE patient_profiles SET profile_completed_percentage = ? WHERE user_id = ?', [completion, userId]);

    return res.json({
      success: true,
      message: 'Health profile updated successfully!',
      profile: {
        ...updatedProfiles[0],
        profile_completed_percentage: completion
      }
    });
  } catch (error) {
    next(error);
  }
};

// Aggregated Patient Dashboard Overview
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Patient profile & basic user details
    const [users] = await pool.query('SELECT id, full_name, email, phone FROM users WHERE id = ?', [userId]);
    const [profiles] = await pool.query('SELECT * FROM patient_profiles WHERE user_id = ?', [userId]);
    const user = users[0] || {};
    const profile = profiles[0] || {};

    // 2. Upcoming appointments
    const [appointments] = await pool.query(`
      SELECT a.*, h.hospital_name, h.address as hospital_address, d.name as doctor_name, s.name as specialty_name
      FROM appointments a
      JOIN hospitals h ON a.hospital_id = h.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      WHERE a.user_id = ? AND a.status IN ('Confirmed', 'Pending')
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
      LIMIT 5
    `, [userId]);

    // 3. Upcoming lab test bookings
    const [labBookings] = await pool.query(`
      SELECT lb.*, lt.name as test_name, lt.category, lt.turnaround_time
      FROM lab_bookings lb
      JOIN lab_tests lt ON lb.lab_test_id = lt.id
      WHERE lb.user_id = ?
      ORDER BY lb.booking_date DESC
      LIMIT 3
    `, [userId]);

    // 4. Upcoming scan bookings
    const [scanBookings] = await pool.query(`
      SELECT sb.*, ss.name as scan_name, ss.modality, h.hospital_name
      FROM scan_bookings sb
      JOIN scan_services ss ON sb.scan_service_id = ss.id
      JOIN hospitals h ON sb.hospital_id = h.id
      WHERE sb.user_id = ?
      ORDER BY sb.booking_date DESC
      LIMIT 3
    `, [userId]);

    // 5. Today's Medicine Reminders
    const [reminders] = await pool.query(`
      SELECT mr.*, pm.instructions
      FROM medicine_reminders mr
      LEFT JOIN prescription_medicines pm ON mr.prescription_medicine_id = pm.id
      WHERE mr.user_id = ? AND mr.reminder_date = CURRENT_DATE()
      ORDER BY mr.reminder_time ASC
    `, [userId]);

    // 6. Recent Health Assessments
    const [assessments] = await pool.query(`
      SELECT id, symptoms, recommended_specialist, emergency_alert, created_at
      FROM health_assessments
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 3
    `, [userId]);

    // 7. Latest Vital Signs
    const [vitals] = await pool.query(`
      SELECT * FROM vital_signs
      WHERE user_id = ?
      ORDER BY recorded_at DESC
      LIMIT 1
    `, [userId]);

    // 8. Follow-up Reminders
    const [followUps] = await pool.query(`
      SELECT * FROM follow_up_reminders
      WHERE user_id = ? AND status = 'Pending'
      ORDER BY due_date ASC
      LIMIT 3
    `, [userId]);

    // Calculate total counts
    const [[counts]] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM appointments WHERE user_id = ?) as total_appointments,
        (SELECT COUNT(*) FROM medical_records WHERE user_id = ?) as total_records,
        (SELECT COUNT(*) FROM prescriptions WHERE user_id = ?) as total_prescriptions
    `, [userId, userId, userId]);

    return res.json({
      success: true,
      data: {
        user,
        profile,
        stats: counts,
        upcomingAppointments: appointments,
        recentLabBookings: labBookings,
        recentScanBookings: scanBookings,
        todayMedicineReminders: reminders,
        recentAssessments: assessments,
        latestVitals: vitals[0] || null,
        followUpReminders: followUps
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getDashboardData
};
