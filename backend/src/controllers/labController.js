const { pool } = require('../config/db');

function generateLabReference() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LAB-${year}-${rand}`;
}

// Get all lab tests with search & category filter
const getLabTests = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    let query = 'SELECT * FROM lab_tests WHERE is_available = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name ASC';

    const [tests] = await pool.query(query, params);

    return res.json({
      success: true,
      count: tests.length,
      tests
    });
  } catch (error) {
    next(error);
  }
};

// Book a lab test
const bookLabTest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      lab_test_id,
      collection_type = 'Home Sample Collection',
      booking_date,
      booking_time,
      patient_address
    } = req.body;

    if (!lab_test_id || !booking_date || !booking_time) {
      return res.status(400).json({
        success: false,
        message: 'Lab test, appointment date, and time are required.'
      });
    }

    const [tests] = await pool.query('SELECT * FROM lab_tests WHERE id = ?', [lab_test_id]);
    if (tests.length === 0) {
      return res.status(404).json({ success: false, message: 'Lab test not found.' });
    }

    const test = tests[0];
    const reference = generateLabReference();

    const [result] = await pool.query(`
      INSERT INTO lab_bookings (
        booking_reference, user_id, lab_test_id, collection_type,
        booking_date, booking_time, patient_address, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed')
    `, [
      reference, userId, lab_test_id, collection_type,
      booking_date, booking_time, patient_address || null
    ]);

    // Add to medical records
    await pool.query(`
      INSERT INTO medical_records (user_id, record_type, title, description, reference_id, doctor_or_facility, record_date)
      VALUES (?, 'Lab Report', ?, ?, ?, 'HealthAI Diagnostic Labs', ?)
    `, [
      userId,
      `Lab Booking: ${test.name}`,
      `Collection: ${collection_type}. Sample: ${test.sample_type}. Turnaround: ${test.turnaround_time}.`,
      reference,
      booking_date
    ]);

    return res.status(201).json({
      success: true,
      message: 'Lab test booked successfully!',
      booking: {
        id: result.insertId,
        reference,
        test_name: test.name,
        price: test.sample_price,
        collection_type,
        booking_date,
        booking_time,
        preparation: test.preparation_instructions
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's lab bookings
const getMyLabBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [bookings] = await pool.query(`
      SELECT lb.*, lt.name as test_name, lt.category, lt.sample_type, lt.sample_price,
             lt.preparation_instructions, lt.turnaround_time
      FROM lab_bookings lb
      JOIN lab_tests lt ON lb.lab_test_id = lt.id
      WHERE lb.user_id = ?
      ORDER BY lb.booking_date DESC
    `, [userId]);

    return res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// Cancel lab booking
const cancelLabBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query('SELECT * FROM lab_bookings WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lab booking not found.' });
    }

    if (req.user.role === 'patient' && rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await pool.query('UPDATE lab_bookings SET status = "Cancelled" WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Lab booking cancelled successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLabTests,
  bookLabTest,
  getMyLabBookings,
  cancelLabBooking
};
