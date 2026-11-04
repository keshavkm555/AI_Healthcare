const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('🚀 Starting HealthAI Assistant Backend...');

  // Test MySQL Connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('⚠️ Warning: MySQL connection could not be established. Ensure MySQL is running on port 3306.');
  }

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🩺 HealthAI Backend REST API is live!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`======================================================\n`);
  });
}

startServer();
