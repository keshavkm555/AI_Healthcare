const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runSeed() {
  console.log('🔄 Initializing HealthAI Database and Seed Data...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../../database/seed.sql');

    if (!fs.existsSync(schemaPath) || !fs.existsSync(seedPath)) {
      throw new Error(`Schema or seed file not found. Checked: ${schemaPath}, ${seedPath}`);
    }

    console.log('📂 Reading schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log('✅ Schema tables executed successfully.');

    console.log('📂 Reading seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await connection.query(seedSql);
    console.log('✅ Seed records inserted successfully.');

    console.log('\n🎉 Database initialization finished successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('1. Patient : patient@healthai.com     / Patient@123');
    console.log('2. Doctor  : doctor@healthai.com      / Doctor@123');
    console.log('3. Doctor  : neurologist@healthai.com / Doctor@123');
    console.log('4. Admin   : admin@healthai.com       / Admin@123');
    console.log('----------------------------------------------------\n');

  } catch (error) {
    console.error('❌ Error during database migration / seed:', error.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
