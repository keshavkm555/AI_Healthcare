const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { pool } = require('../config/db');

// Patient Registration
const register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, role = 'patient' } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required fields.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered. Please log in.'
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [full_name.trim(), cleanEmail, password_hash, role, phone || null]
    );

    const userId = result.insertId;

    // If patient, initialize patient_profile record
    if (role === 'patient') {
      await pool.query(
        'INSERT INTO patient_profiles (user_id, profile_completed_percentage) VALUES (?, 20)',
        [userId]
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email: cleanEmail, role, full_name },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    // Audit log
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId, 'USER_REGISTER', 'users', userId, `Registered new account with role ${role}`]
    );

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: userId,
        full_name,
        email: cleanEmail,
        role,
        phone: phone || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query user
    const [users] = await pool.query(
      'SELECT id, full_name, email, password_hash, role, phone, is_active FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    // Fetch patient profile if patient
    let profile = null;
    if (user.role === 'patient') {
      const [profiles] = await pool.query(
        'SELECT * FROM patient_profiles WHERE user_id = ?',
        [user.id]
      );
      profile = profiles[0] || null;
    }

    // Log login
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [user.id, 'USER_LOGIN', 'users', user.id, `User logged in from ${req.ip || 'local'}`]
    );

    return res.json({
      success: true,
      message: `Welcome back, ${user.full_name}!`,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// Current authenticated user
const getMe = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, full_name, email, role, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];
    let profile = null;
    if (user.role === 'patient') {
      const [profiles] = await pool.query('SELECT * FROM patient_profiles WHERE user_id = ?', [user.id]);
      profile = profiles[0] || null;
    }

    return res.json({
      success: true,
      user: {
        ...user,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout
const logout = async (req, res) => {
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
};

// Forgot Password Request
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const [users] = await pool.query('SELECT id, full_name, email FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    
    // Always return safe success message to prevent user enumeration
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'If the provided email is registered, password reset instructions have been dispatched.'
      });
    }

    // In demo environment, generate a reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    return res.json({
      success: true,
      message: 'Password reset code generated. For demo verification, please use code below or contact admin.',
      demo_reset_code: resetCode
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Valid email and a new password with at least 8 characters are required.'
      });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [password_hash, email.toLowerCase().trim()]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    return res.json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword
};
