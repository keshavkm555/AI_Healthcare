const { pool } = require('../config/db');

// Record a new set of vital signs
const recordVitals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      systolic_bp,
      diastolic_bp,
      heart_rate,
      spo2_percent,
      temperature_f,
      blood_glucose_mg_dl,
      notes,
      source = 'User Entered'
    } = req.body;

    // Validate that at least one measurement is provided
    if (
      !systolic_bp && !diastolic_bp && !heart_rate &&
      !spo2_percent && !temperature_f && !blood_glucose_mg_dl
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one vital sign measurement.'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO vital_signs (
        user_id, systolic_bp, diastolic_bp, heart_rate,
        spo2_percent, temperature_f, blood_glucose_mg_dl, notes, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      systolic_bp || null,
      diastolic_bp || null,
      heart_rate || null,
      spo2_percent || null,
      temperature_f || null,
      blood_glucose_mg_dl || null,
      notes || null,
      source
    ]);

    return res.status(201).json({
      success: true,
      message: 'Vital signs logged successfully!',
      vitalId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

// Get vital signs history for charts and table
const getVitalsHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 30 } = req.query;

    const [records] = await pool.query(`
      SELECT * FROM vital_signs
      WHERE user_id = ?
      ORDER BY recorded_at ASC
      LIMIT ?
    `, [userId, parseInt(limit, 10)]);

    return res.json({
      success: true,
      count: records.length,
      vitals: records
    });
  } catch (error) {
    next(error);
  }
};

// Get latest vital signs
const getLatestVitals = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [records] = await pool.query(`
      SELECT * FROM vital_signs
      WHERE user_id = ?
      ORDER BY recorded_at DESC
      LIMIT 1
    `, [userId]);

    return res.json({
      success: true,
      vitals: records[0] || null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordVitals,
  getVitalsHistory,
  getLatestVitals
};
