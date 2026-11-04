const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  secret: process.env.JWT_SECRET || 'fallback_healthcare_secret_key_change_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
