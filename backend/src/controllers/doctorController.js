const { pool } = require('../config/db');

// Get all doctors with filters
const getAllDoctors = async (req, res, next) => {
  try {
    const { specialtyId, hospitalId, search, teleconsultOnly } = req.query;

    let query = `
      SELECT d.*, s.name as specialty_name, s.icon as specialty_icon,
             h.hospital_name, h.address as hospital_address, h.city as hospital_city
      FROM doctors d
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      WHERE 1=1
    `;
    const params = [];

    if (specialtyId) {
      query += ' AND d.specialty_id = ?';
      params.push(specialtyId);
    }

    if (hospitalId) {
      query += ' AND d.hospital_id = ?';
      params.push(hospitalId);
    }

    if (teleconsultOnly === 'true') {
      query += ' AND d.teleconsult_available = 1';
    }

    if (search) {
      query += ' AND (d.name LIKE ? OR s.name LIKE ? OR h.hospital_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY d.rating DESC, d.experience_years DESC';

    const [doctors] = await pool.query(query, params);

    return res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    next(error);
  }
};

// Get Doctor by ID with availability slots
const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [doctors] = await pool.query(`
      SELECT d.*, s.name as specialty_name, s.description as specialty_description,
             h.hospital_name, h.address as hospital_address, h.phone as hospital_phone
      FROM doctors d
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      WHERE d.id = ?
    `, [id]);

    if (doctors.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Availability schedule
    const [slots] = await pool.query(`
      SELECT * FROM doctor_availability WHERE doctor_id = ? ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), start_time ASC
    `, [id]);

    return res.json({
      success: true,
      doctor: {
        ...doctors[0],
        availability: slots
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all specialties
const getSpecialties = async (req, res, next) => {
  try {
    const [specialties] = await pool.query('SELECT * FROM specialties ORDER BY name ASC');
    return res.json({
      success: true,
      specialties
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getSpecialties
};
