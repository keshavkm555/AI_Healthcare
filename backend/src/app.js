const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const teleconsultRoutes = require('./routes/teleconsultRoutes');
const labRoutes = require('./routes/labRoutes');
const scanRoutes = require('./routes/scanRoutes');
const packageRoutes = require('./routes/packageRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const vitalRoutes = require('./routes/vitalRoutes');
const recordRoutes = require('./routes/recordRoutes');
const bloodBankRoutes = require('./routes/bloodBankRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorPortalRoutes = require('./routes/doctorPortalRoutes');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow frontend dev server and production clients
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to /api
app.use('/api', apiLimiter);

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'HealthAI Full-Stack Healthcare Assistant API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/teleconsult', teleconsultRoutes);
app.use('/api/lab-tests', labRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/health-packages', packageRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/medical-records', recordRoutes);
app.use('/api/blood-banks', bloodBankRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor-portal', doctorPortalRoutes);

// 404 Route Catch-All
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
