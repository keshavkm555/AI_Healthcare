const { pool } = require('./db');

async function inspectUsers() {
  try {
    console.log('\n========================================================================================');
    console.log('👥 REGISTERED USERS & CREDENTIALS AUDIT (MySQL Database: healthcare_db -> `users` table)');
    console.log('========================================================================================\n');

    const [users] = await pool.query(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.role,
        IF(u.is_active = 1, 'Active', 'Disabled') as status,
        DATE_FORMAT(u.created_at, '%Y-%m-%d %H:%i') as registered_at,
        p.gender,
        p.blood_group,
        p.emergency_contact_phone
      FROM users u
      LEFT JOIN patient_profiles p ON u.id = p.user_id
      ORDER BY u.id ASC
    `);

    console.table(users);

    console.log('\n🔐 PASSWORD ENCRYPTION & SECURITY:');
    console.log('  • Passwords in `users.password_hash` are secured with bcrypt (10 salt rounds).');
    console.log('  • Plaintext passwords are NEVER stored in the database.');
    console.log('\n🔑 DEMO ACCOUNTS (ready to test):');
    console.log('  1. Patient Portal:  email: "patient@healthai.com"  | password: "Patient@123"');
    console.log('  2. Doctor Portal:   email: "doctor@healthai.com"   | password: "Doctor@123"');
    console.log('  3. Admin Portal:    email: "admin@healthai.com"    | password: "Admin@123"');
    console.log('========================================================================================\n');
  } catch (err) {
    console.error('Error querying users:', err.message);
  } finally {
    process.exit(0);
  }
}

inspectUsers();
