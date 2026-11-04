const { pool } = require('../config/db');

// Get all hospitals with optional query filtering & live location distance calculation
const getAllHospitals = async (req, res, next) => {
  try {
    const { search, city, emergencyOnly, latitude, longitude } = req.query;

    let selectFields = 'hospitals.*';
    let orderBy = 'rating DESC, hospital_name ASC';
    const params = [];

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    const hasCoords = !isNaN(userLat) && !isNaN(userLng);

    if (hasCoords) {
      selectFields += `, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance_km`;
      params.push(userLat, userLng, userLat);
      orderBy = 'distance_km ASC, rating DESC';
    }

    let query = `SELECT ${selectFields} FROM hospitals WHERE 1=1`;

    if (search) {
      query += ' AND (hospital_name LIKE ? OR facilities LIKE ? OR address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    if (emergencyOnly === 'true') {
      query += ' AND emergency_available = 1';
    }

    query += ` ORDER BY ${orderBy}`;

    const [hospitals] = await pool.query(query, params);

    return res.json({
      success: true,
      count: hospitals.length,
      userLocation: hasCoords ? { latitude: userLat, longitude: userLng } : null,
      hospitals
    });
  } catch (error) {
    next(error);
  }
};

// Get single hospital with its doctors
const getHospitalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [hospitals] = await pool.query('SELECT * FROM hospitals WHERE id = ?', [id]);
    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    const hospital = hospitals[0];

    // Fetch doctors at this hospital
    const [doctors] = await pool.query(`
      SELECT d.*, s.name as specialty_name
      FROM doctors d
      JOIN specialties s ON d.specialty_id = s.id
      WHERE d.hospital_id = ?
      ORDER BY d.rating DESC
    `, [id]);

    return res.json({
      success: true,
      hospital: {
        ...hospital,
        doctors
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create Hospital (Admin)
const createHospital = async (req, res, next) => {
  try {
    const {
      hospital_name,
      address,
      city = 'Bengaluru',
      state = 'Karnataka',
      phone,
      email,
      latitude,
      longitude,
      facilities,
      emergency_available = true,
      rating = 4.5,
      total_beds = 200,
      available_beds = 30
    } = req.body;

    if (!hospital_name || !address) {
      return res.status(400).json({ success: false, message: 'Hospital name and address are required.' });
    }

    const [result] = await pool.query(`
      INSERT INTO hospitals (hospital_name, address, city, state, phone, email, latitude, longitude, facilities, emergency_available, rating, total_beds, available_beds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [hospital_name, address, city, state, phone, email, latitude || null, longitude || null, facilities, emergency_available ? 1 : 0, rating, total_beds, available_beds]);

    return res.status(201).json({
      success: true,
      message: 'Hospital created successfully.',
      hospitalId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

// Update Hospital (Admin)
const updateHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [existing] = await pool.query('SELECT id FROM hospitals WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    await pool.query('UPDATE hospitals SET ? WHERE id = ?', [updates, id]);

    return res.json({
      success: true,
      message: 'Hospital details updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Delete Hospital (Admin)
const deleteHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM hospitals WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    return res.json({
      success: true,
      message: 'Hospital removed from directory.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital
};
