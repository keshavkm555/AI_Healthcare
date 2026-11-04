/**
 * Automated Test Suite for HealthAI Backend APIs & Business Logic
 */
const http = require('http');
const app = require('../app');
const { testConnection } = require('../config/db');

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

async function makeRequest(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (body) {
      reqOptions.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting HealthAI Automated Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  // Start temporary test server
  server = app.listen(PORT);

  try {
    // 1. Health Endpoint
    const health = await makeRequest('/health');
    assert(health.status === 200 && health.body.status === 'online', 'System Health Check responds online');

    // 2. Symptom Checker - Routine Symptoms
    const routineAssess = await makeRequest('/symptoms/assess', { method: 'POST' }, {
      symptoms: 'fever, headache, runny nose',
      duration: '3 days',
      severity: 'Mild'
    });
    assert(routineAssess.status === 200 && routineAssess.body.success === true, 'Symptom Checker processes routine symptoms');
    assert(routineAssess.body.assessment.emergency_alert === false, 'Routine symptoms do NOT trigger emergency flag');
    assert(routineAssess.body.assessment.possible_conditions.length > 0, 'Symptom matching identifies potential conditions');

    // 3. Symptom Checker - Emergency Red Flag
    const emergencyAssess = await makeRequest('/symptoms/assess', { method: 'POST' }, {
      symptoms: 'severe chest pain radiating to left arm and shortness of breath'
    });
    assert(emergencyAssess.status === 200, 'Emergency triage processes critical symptoms');
    assert(emergencyAssess.body.assessment.emergency_alert === true, 'Critical symptoms trigger emergency_alert flag');

    // 4. Hospitals List
    const hospitals = await makeRequest('/hospitals');
    assert(hospitals.status === 200 && hospitals.body.hospitals.length >= 3, 'Hospitals list retrieved from MySQL');

    // 5. Doctors Directory & Specialties
    const doctors = await makeRequest('/doctors');
    assert(doctors.status === 200 && doctors.body.doctors.length >= 3, 'Doctors directory retrieved from MySQL');

    const specialties = await makeRequest('/doctors/specialties');
    assert(specialties.status === 200 && specialties.body.specialties.length >= 5, 'Medical specialties retrieved');

    // 6. User Authentication - Login Demo Patient
    const loginRes = await makeRequest('/auth/login', { method: 'POST' }, {
      email: 'patient@healthai.com',
      password: 'Patient@123'
    });
    assert(loginRes.status === 200 && loginRes.body.success === true, 'Demo Patient login verifies bcrypt password');
    assert(loginRes.body.token !== undefined, 'Login generates JWT authentication token');

    const patientToken = loginRes.body.token;

    // 7. Protected Route - Patient Profile
    const profileRes = await makeRequest('/patients/profile', {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    assert(profileRes.status === 200 && profileRes.body.user.email === 'patient@healthai.com', 'Protected route accesses patient profile');

    // 8. Patient Dashboard
    const dashboardRes = await makeRequest('/patients/dashboard', {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    assert(dashboardRes.status === 200 && dashboardRes.body.data.upcomingAppointments !== undefined, 'Patient dashboard aggregates services & appointments');

    // 9. Helplines & Emergency
    const helplines = await makeRequest('/emergency/helplines');
    assert(helplines.status === 200 && helplines.body.helplines.length >= 5, 'Emergency helplines retrieved');

    // 10. Lab Tests & Scans Catalog
    const labTests = await makeRequest('/lab-tests/tests');
    assert(labTests.status === 200 && labTests.body.tests.length >= 5, 'Lab tests catalog retrieved');

    const scans = await makeRequest('/scans/services');
    assert(scans.status === 200 && scans.body.services.length >= 5, 'Scan imaging services retrieved');

    // 11. Health Packages
    const packages = await makeRequest('/health-packages');
    assert(packages.status === 200 && packages.body.packages.length >= 4, 'Health checkup packages retrieved');

    // 12. Blood Banks
    const bloodBanks = await makeRequest('/blood-banks');
    assert(bloodBanks.status === 200 && bloodBanks.body.bloodBanks.length >= 3, 'Blood banks list retrieved');

    console.log(`\n======================================================`);
    console.log(`📊 TEST RESULTS: ${passed}/${total} assertions passed.`);
    if (passed === total) {
      console.log(`🎉 ALL AUTOMATED TESTS COMPLETED SUCCESSFULLY!`);
    } else {
      console.warn(`⚠️ Some tests failed.`);
    }
    console.log(`======================================================\n`);

  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    if (server) server.close();
  }
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
