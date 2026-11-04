const { pool } = require('../config/db');

// Get all blood banks with search filter
const getBloodBanks = async (req, res, next) => {
  try {
    const { city, search } = req.query;

    let query = 'SELECT * FROM blood_banks WHERE 1=1';
    const params = [];

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    if (search) {
      query += ' AND (name LIKE ? OR address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name ASC';

    const [banks] = await pool.query(query, params);

    // Parse stock summary
    const formatted = banks.map(b => ({
      ...b,
      stock_summary: typeof b.stock_summary === 'string' ? JSON.parse(b.stock_summary) : b.stock_summary
    }));

    return res.json({
      success: true,
      count: formatted.length,
      bloodBanks: formatted
    });
  } catch (error) {
    next(error);
  }
};

// Search voluntary blood donors
const getBloodDonors = async (req, res, next) => {
  try {
    const { bloodGroup, city } = req.query;

    let query = 'SELECT id, full_name, blood_group, city, phone, is_available, last_donated_date FROM blood_donors WHERE consent_given = 1';
    const params = [];

    if (bloodGroup) {
      query += ' AND blood_group = ?';
      params.push(bloodGroup);
    }

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    query += ' ORDER BY is_available DESC, last_donated_date ASC';

    const [donors] = await pool.query(query, params);

    return res.json({
      success: true,
      count: donors.length,
      donors
    });
  } catch (error) {
    next(error);
  }
};

// Register as a voluntary blood donor with consent
const registerDonor = async (req, res, next) => {
  try {
    const {
      full_name,
      blood_group,
      city = 'Bengaluru',
      phone,
      email,
      consent_given,
      last_donated_date
    } = req.body;

    if (!full_name || !blood_group || !phone || !consent_given) {
      return res.status(400).json({
        success: false,
        message: 'Full name, blood group, phone number, and explicit donor consent are required.'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO blood_donors (full_name, blood_group, city, phone, email, is_available, consent_given, last_donated_date)
      VALUES (?, ?, ?, ?, ?, 1, 1, ?)
    `, [
      full_name.trim(),
      blood_group,
      city.trim(),
      phone.trim(),
      email ? email.trim() : null,
      last_donated_date || null
    ]);

    return res.status(201).json({
      success: true,
      message: 'Thank you for registering as a voluntary blood donor! You may save lives in urgent need.',
      donorId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBloodBanks,
  getBloodDonors,
  registerDonor
};
