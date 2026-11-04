const { pool } = require('../config/db');

function generateScanReference() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SCN-${year}-${rand}`;
}

// Get all scan services
const getScanServices = async (req, res, next) => {
  try {
    const { modality } = req.query;

    let query = 'SELECT * FROM scan_services WHERE is_available = 1';
    const params = [];

    if (modality) {
      query += ' AND modality = ?';
      params.push(modality);
    }

    query += ' ORDER BY modality ASC, name ASC';

    const [services] = await pool.query(query, params);

    return res.json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    next(error);
  }
};

// Book a scan
const bookScan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      scan_service_id,
      hospital_id,
      booking_date,
      booking_time
    } = req.body;

    if (!scan_service_id || !hospital_id || !booking_date || !booking_time) {
      return res.status(400).json({
        success: false,
        message: 'Scan service, hospital centre, date, and time are required.'
      });
    }

    const [scans] = await pool.query('SELECT * FROM scan_services WHERE id = ?', [scan_service_id]);
    if (scans.length === 0) {
      return res.status(404).json({ success: false, message: 'Scan service not found.' });
    }

    const [hospitals] = await pool.query('SELECT hospital_name FROM hospitals WHERE id = ?', [hospital_id]);
    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    const scan = scans[0];
    const hospital = hospitals[0];
    const reference = generateScanReference();

    const [result] = await pool.query(`
      INSERT INTO scan_bookings (
        booking_reference, user_id, scan_service_id, hospital_id,
        booking_date, booking_time, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')
    `, [reference, userId, scan_service_id, hospital_id, booking_date, booking_time]);

    // Medical records
    await pool.query(`
      INSERT INTO medical_records (user_id, record_type, title, description, reference_id, doctor_or_facility, record_date)
      VALUES (?, 'Imaging Scan', ?, ?, ?, ?, ?)
    `, [
      userId,
      `Scan: ${scan.name} (${scan.modality})`,
      `Scheduled at ${hospital.hospital_name}. Preparation: ${scan.preparation_instructions}`,
      reference,
      hospital.hospital_name,
      booking_date
    ]);

    return res.status(201).json({
      success: true,
      message: 'Scan booking confirmed successfully!',
      booking: {
        id: result.insertId,
        reference,
        scan_name: scan.name,
        modality: scan.modality,
        hospital_name: hospital.hospital_name,
        price: scan.sample_price,
        booking_date,
        booking_time,
        preparation: scan.preparation_instructions
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's scan bookings
const getMyScanBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [bookings] = await pool.query(`
      SELECT sb.*, ss.name as scan_name, ss.modality, ss.sample_price, ss.preparation_instructions,
             h.hospital_name, h.address as hospital_address, h.phone as hospital_phone
      FROM scan_bookings sb
      JOIN scan_services ss ON sb.scan_service_id = ss.id
      JOIN hospitals h ON sb.hospital_id = h.id
      WHERE sb.user_id = ?
      ORDER BY sb.booking_date DESC
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

// Cancel scan booking
const cancelScanBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query('SELECT * FROM scan_bookings WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scan booking not found.' });
    }

    if (req.user.role === 'patient' && rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await pool.query('UPDATE scan_bookings SET status = "Cancelled" WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Scan appointment cancelled successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getScanServices,
  bookScan,
  getMyScanBookings,
  cancelScanBooking
};
