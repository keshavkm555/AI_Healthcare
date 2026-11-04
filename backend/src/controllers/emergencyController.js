const { pool } = require('../config/db');

// Get all verified emergency helplines
const getHelplines = async (req, res, next) => {
  try {
    const [helplines] = await pool.query('SELECT * FROM helplines ORDER BY id ASC');
    return res.json({
      success: true,
      count: helplines.length,
      helplines
    });
  } catch (error) {
    next(error);
  }
};

// Log an emergency event
const logEmergencyEvent = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const {
      caller_name,
      latitude,
      longitude,
      action_taken = 'User initiated Emergency SOS trigger',
      emergency_type = 'General Emergency'
    } = req.body;

    const [result] = await pool.query(`
      INSERT INTO emergency_events (user_id, caller_name, latitude, longitude, action_taken, emergency_type, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Logged Demo Event - Phone Call Direct Link Active')
    `, [
      userId,
      caller_name || (req.user ? req.user.full_name : 'Anonymous User'),
      latitude || null,
      longitude || null,
      action_taken,
      emergency_type
    ]);

    // Fetch nearest hospitals to user if coordinates available
    let nearestHospitals = [];
    if (latitude && longitude) {
      // Haversine formula approximation in MySQL
      const [hospRows] = await pool.query(`
        SELECT id, hospital_name, address, phone, latitude, longitude,
          (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance_km
        FROM hospitals
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        ORDER BY distance_km ASC
        LIMIT 3
      `, [latitude, longitude, latitude]);
      nearestHospitals = hospRows;
    }

    return res.status(201).json({
      success: true,
      message: 'Emergency event recorded. Direct call links provided.',
      eventId: result.insertId,
      disclaimer: 'DEMO SAFETY NOTICE: This web application provides quick-dial telephony links and directions. It does not replace 108/112 emergency dispatchers. In an actual life-threatening crisis, call 108 or 112 immediately.',
      nearestHospitals
    });
  } catch (error) {
    next(error);
  }
};

// Get emergency event history
const getEmergencyHistory = async (req, res, next) => {
  try {
    const [events] = await pool.query(`
      SELECT ee.*, u.full_name as user_name, u.email as user_email
      FROM emergency_events ee
      LEFT JOIN users u ON ee.user_id = u.id
      ORDER BY ee.created_at DESC
      LIMIT 20
    `);

    return res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHelplines,
  logEmergencyEvent,
  getEmergencyHistory
};
