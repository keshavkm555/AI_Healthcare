const { pool } = require('../config/db');

function generatePackageReference() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PKG-${year}-${rand}`;
}

// Get all preventive health packages
const getAllPackages = async (req, res, next) => {
  try {
    const [packages] = await pool.query('SELECT * FROM health_packages WHERE is_active = 1 ORDER BY sample_price ASC');
    return res.json({
      success: true,
      count: packages.length,
      packages
    });
  } catch (error) {
    next(error);
  }
};

// Book a health package
const bookPackage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { package_id, hospital_id, booking_date, booking_time } = req.body;

    if (!package_id || !hospital_id || !booking_date || !booking_time) {
      return res.status(400).json({
        success: false,
        message: 'Package, hospital centre, date, and time are required.'
      });
    }

    const [pkgs] = await pool.query('SELECT * FROM health_packages WHERE id = ?', [package_id]);
    if (pkgs.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    const [hospitals] = await pool.query('SELECT hospital_name FROM hospitals WHERE id = ?', [hospital_id]);
    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    const pkg = pkgs[0];
    const hospital = hospitals[0];
    const reference = generatePackageReference();

    const [result] = await pool.query(`
      INSERT INTO package_bookings (booking_reference, user_id, package_id, hospital_id, booking_date, booking_time, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')
    `, [reference, userId, package_id, hospital_id, booking_date, booking_time]);

    // Record in medical history
    await pool.query(`
      INSERT INTO medical_records (user_id, record_type, title, description, reference_id, doctor_or_facility, record_date)
      VALUES (?, 'Clinical Note', ?, ?, ?, ?, ?)
    `, [
      userId,
      `Package: ${pkg.package_name}`,
      `Booked at ${hospital.hospital_name}. Included tests: ${pkg.included_tests}`,
      reference,
      hospital.hospital_name,
      booking_date
    ]);

    return res.status(201).json({
      success: true,
      message: 'Health package booked successfully!',
      booking: {
        id: result.insertId,
        reference,
        package_name: pkg.package_name,
        hospital_name: hospital.hospital_name,
        price: pkg.sample_price,
        booking_date,
        booking_time,
        preparation: pkg.preparation_instructions
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's package bookings
const getMyPackageBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [bookings] = await pool.query(`
      SELECT pb.*, hp.package_name, hp.tagline, hp.sample_price, hp.included_tests, hp.preparation_instructions,
             h.hospital_name, h.address as hospital_address, h.phone as hospital_phone
      FROM package_bookings pb
      JOIN health_packages hp ON pb.package_id = hp.id
      JOIN hospitals h ON pb.hospital_id = h.id
      WHERE pb.user_id = ?
      ORDER BY pb.booking_date DESC
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

module.exports = {
  getAllPackages,
  bookPackage,
  getMyPackageBookings
};
