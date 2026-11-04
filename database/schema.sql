-- ============================================================
-- HealthAI - Full Stack AI Healthcare Assistant Database Schema
-- Compatible with MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS healthcare_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE healthcare_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS helplines;
DROP TABLE IF EXISTS emergency_events;
DROP TABLE IF EXISTS blood_donors;
DROP TABLE IF EXISTS blood_banks;
DROP TABLE IF EXISTS package_bookings;
DROP TABLE IF EXISTS health_packages;
DROP TABLE IF EXISTS scan_bookings;
DROP TABLE IF EXISTS scan_services;
DROP TABLE IF EXISTS lab_bookings;
DROP TABLE IF EXISTS lab_tests;
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS follow_up_reminders;
DROP TABLE IF EXISTS medicine_reminders;
DROP TABLE IF EXISTS prescription_medicines;
DROP TABLE IF EXISTS prescriptions;
DROP TABLE IF EXISTS vital_signs;
DROP TABLE IF EXISTS health_assessments;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctor_availability;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS hospitals;
DROP TABLE IF EXISTS specialties;
DROP TABLE IF EXISTS patient_profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS prediction_history;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table (Patients, Doctors, Admins)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('patient', 'doctor', 'admin') NOT NULL DEFAULT 'patient',
  phone VARCHAR(25) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- 2. Patient Profiles
CREATE TABLE IF NOT EXISTS patient_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  date_of_birth DATE NULL,
  age INT NULL,
  gender ENUM('Male', 'Female', 'Other', 'Prefer not to say') NULL,
  blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NULL,
  height_cm DECIMAL(5, 2) NULL,
  weight_kg DECIMAL(5, 2) NULL,
  bmi DECIMAL(4, 1) NULL,
  bmi_category VARCHAR(50) NULL,
  allergies TEXT NULL,
  existing_conditions TEXT NULL,
  current_medications TEXT NULL,
  emergency_contact_name VARCHAR(150) NULL,
  emergency_contact_phone VARCHAR(25) NULL,
  emergency_contact_relation VARCHAR(50) NULL,
  insurance_provider VARCHAR(150) NULL,
  insurance_policy_number VARCHAR(100) NULL,
  profile_completed_percentage INT NOT NULL DEFAULT 25,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Medical Specialties
CREATE TABLE IF NOT EXISTS specialties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  icon VARCHAR(50) NULL DEFAULT 'Stethoscope'
) ENGINE=InnoDB;

-- 4. Hospitals Directory
CREATE TABLE IF NOT EXISTS hospitals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Bengaluru',
  state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
  phone VARCHAR(35) NULL,
  email VARCHAR(150) NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  facilities TEXT NULL,
  emergency_available BOOLEAN NOT NULL DEFAULT TRUE,
  rating DECIMAL(2, 1) NOT NULL DEFAULT 4.5,
  total_beds INT NOT NULL DEFAULT 250,
  available_beds INT NOT NULL DEFAULT 42,
  image_url VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hospitals_city (city)
) ENGINE=InnoDB;

-- 5. Doctors Directory
CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL UNIQUE,
  hospital_id INT NOT NULL,
  specialty_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  qualification VARCHAR(100) NOT NULL,
  experience_years INT NOT NULL DEFAULT 5,
  consultation_fee DECIMAL(8, 2) NOT NULL DEFAULT 500.00,
  phone VARCHAR(25) NULL,
  email VARCHAR(150) NULL,
  bio TEXT NULL,
  rating DECIMAL(2, 1) NOT NULL DEFAULT 4.8,
  available_days VARCHAR(120) NOT NULL DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat',
  teleconsult_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_doctor_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
  CONSTRAINT fk_doctor_specialty FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE CASCADE,
  INDEX idx_doctors_specialty (specialty_id),
  INDEX idx_doctors_hospital (hospital_id)
) ENGINE=InnoDB;

-- 6. Doctor Availability Slots
CREATE TABLE IF NOT EXISTS doctor_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INT NOT NULL DEFAULT 30,
  CONSTRAINT fk_avail_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Appointments (OPD and Video Consultations)
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_reference VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  hospital_id INT NOT NULL,
  doctor_id INT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_type ENUM('OPD In-Person', 'Video Teleconsultation') NOT NULL DEFAULT 'OPD In-Person',
  reason TEXT NOT NULL,
  status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled') NOT NULL DEFAULT 'Confirmed',
  consultation_notes TEXT NULL,
  meeting_link VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_apt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_apt_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
  CONSTRAINT fk_apt_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
  INDEX idx_apt_user (user_id),
  INDEX idx_apt_date (appointment_date),
  INDEX idx_apt_ref (booking_reference)
) ENGINE=InnoDB;

-- 8. AI Health & Symptom Assessments
CREATE TABLE IF NOT EXISTS health_assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  symptoms TEXT NOT NULL,
  duration VARCHAR(100) NULL,
  severity ENUM('Mild', 'Moderate', 'Severe') NOT NULL DEFAULT 'Mild',
  age INT NULL,
  medical_history TEXT NULL,
  allergies TEXT NULL,
  possible_conditions JSON NULL,
  recommended_specialist VARCHAR(100) NULL,
  self_care_advice TEXT NULL,
  emergency_alert BOOLEAN NOT NULL DEFAULT FALSE,
  emergency_guidance TEXT NULL,
  ai_model_used VARCHAR(60) NOT NULL DEFAULT 'HealthAI Clinical Engine',
  disclaimer_acknowledged BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_assess_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_assess_user (user_id)
) ENGINE=InnoDB;

-- 9. Patient Vital Signs & BMI History
CREATE TABLE IF NOT EXISTS vital_signs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  systolic_bp INT NULL,
  diastolic_bp INT NULL,
  heart_rate INT NULL,
  spo2_percent INT NULL,
  temperature_f DECIMAL(4, 1) NULL,
  blood_glucose_mg_dl INT NULL,
  notes VARCHAR(255) NULL,
  source ENUM('User Entered', 'Manual Entry', 'Clinical Device') NOT NULL DEFAULT 'User Entered',
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vitals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_vitals_user (user_id),
  INDEX idx_vitals_date (recorded_at)
) ENGINE=InnoDB;

-- 10. Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  doctor_id INT NULL,
  hospital_id INT NULL,
  doctor_name VARCHAR(150) NOT NULL,
  diagnosis VARCHAR(255) NOT NULL,
  notes TEXT NULL,
  issued_date DATE NOT NULL,
  valid_until DATE NULL,
  source_type ENUM('Doctor Prescribed', 'Patient Logged') NOT NULL DEFAULT 'Doctor Prescribed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_presc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_presc_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
  CONSTRAINT fk_presc_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
  INDEX idx_presc_user (user_id)
) ENGINE=InnoDB;

-- 11. Prescription Medicines
CREATE TABLE IF NOT EXISTS prescription_medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prescription_id INT NOT NULL,
  medicine_name VARCHAR(150) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  timing ENUM('Before Food', 'After Food', 'With Food', 'Anytime') NOT NULL DEFAULT 'After Food',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  instructions TEXT NULL,
  CONSTRAINT fk_pmed_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Medicine Reminders & Tracker
CREATE TABLE IF NOT EXISTS medicine_reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  prescription_medicine_id INT NULL,
  medicine_name VARCHAR(150) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  reminder_time TIME NOT NULL,
  day_phase ENUM('Morning', 'Afternoon', 'Evening', 'Night') NOT NULL,
  is_taken BOOLEAN NOT NULL DEFAULT FALSE,
  taken_at TIMESTAMP NULL,
  reminder_date DATE NOT NULL,
  CONSTRAINT fk_remind_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_remind_pmed FOREIGN KEY (prescription_medicine_id) REFERENCES prescription_medicines(id) ON DELETE SET NULL,
  INDEX idx_remind_user (user_id),
  INDEX idx_remind_date (reminder_date)
) ENGINE=InnoDB;

-- 13. Follow-up Reminders
CREATE TABLE IF NOT EXISTS follow_up_reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  due_date DATE NOT NULL,
  notes TEXT NULL,
  status ENUM('Pending', 'Completed', 'Dismissed') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fup_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. Comprehensive Medical Records (EHR)
CREATE TABLE IF NOT EXISTS medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  record_type ENUM('Health Assessment', 'Lab Report', 'Imaging Scan', 'Prescription', 'Discharge Summary', 'Clinical Note') NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  file_path VARCHAR(255) NULL,
  reference_id VARCHAR(100) NULL,
  doctor_or_facility VARCHAR(150) NULL,
  record_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_medrec_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_medrec_user (user_id)
) ENGINE=InnoDB;

-- 15. Laboratory Tests Catalog
CREATE TABLE IF NOT EXISTS lab_tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  sample_type VARCHAR(50) NOT NULL DEFAULT 'Blood',
  description TEXT NOT NULL,
  preparation_instructions TEXT NOT NULL,
  turnaround_time VARCHAR(50) NOT NULL DEFAULT '24 Hours',
  sample_price DECIMAL(8, 2) NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 16. Laboratory Bookings
CREATE TABLE IF NOT EXISTS lab_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_reference VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  lab_test_id INT NOT NULL,
  collection_type ENUM('Home Sample Collection', 'Laboratory Visit') NOT NULL DEFAULT 'Home Sample Collection',
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  patient_address TEXT NULL,
  status ENUM('Confirmed', 'Sample Collected', 'Processing', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
  result_summary TEXT NULL,
  result_pdf_url VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_labbook_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_labbook_test FOREIGN KEY (lab_test_id) REFERENCES lab_tests(id) ON DELETE CASCADE,
  INDEX idx_labbook_user (user_id)
) ENGINE=InnoDB;

-- 17. Medical Scans & Imaging Services
CREATE TABLE IF NOT EXISTS scan_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  modality ENUM('X-ray', 'CT scan', 'MRI', 'Ultrasound', 'ECG', 'Echocardiography', 'Mammography', 'PET-CT', 'DEXA', 'Endoscopy') NOT NULL,
  description TEXT NOT NULL,
  preparation_instructions TEXT NOT NULL,
  sample_price DECIMAL(8, 2) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  is_available BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 18. Medical Scan Bookings
CREATE TABLE IF NOT EXISTS scan_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_reference VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  scan_service_id INT NOT NULL,
  hospital_id INT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status ENUM('Confirmed', 'Scan In Progress', 'Report Ready', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
  report_summary TEXT NULL,
  report_pdf_url VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_scanbook_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_scanbook_service FOREIGN KEY (scan_service_id) REFERENCES scan_services(id) ON DELETE CASCADE,
  CONSTRAINT fk_scanbook_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
  INDEX idx_scanbook_user (user_id)
) ENGINE=InnoDB;

-- 19. Preventive Health Packages
CREATE TABLE IF NOT EXISTS health_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_name VARCHAR(150) NOT NULL,
  tagline VARCHAR(200) NULL,
  description TEXT NOT NULL,
  included_tests TEXT NOT NULL,
  sample_price DECIMAL(8, 2) NOT NULL,
  original_price DECIMAL(8, 2) NULL,
  preparation_instructions TEXT NOT NULL,
  recommended_for VARCHAR(150) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 20. Package Bookings
CREATE TABLE IF NOT EXISTS package_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_reference VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  package_id INT NOT NULL,
  hospital_id INT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status ENUM('Confirmed', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pkgbook_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_pkgbook_pkg FOREIGN KEY (package_id) REFERENCES health_packages(id) ON DELETE CASCADE,
  CONSTRAINT fk_pkgbook_hosp FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
  INDEX idx_pkgbook_user (user_id)
) ENGINE=InnoDB;

-- 21. Blood Banks Directory
CREATE TABLE IF NOT EXISTS blood_banks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Bengaluru',
  contact_number VARCHAR(35) NOT NULL,
  operating_hours VARCHAR(100) NOT NULL DEFAULT '24/7',
  stock_summary JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 22. Voluntary Blood Donors Directory
CREATE TABLE IF NOT EXISTS blood_donors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  city VARCHAR(100) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  email VARCHAR(150) NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  consent_given BOOLEAN NOT NULL DEFAULT TRUE,
  last_donated_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_donors_blood (blood_group),
  INDEX idx_donors_city (city)
) ENGINE=InnoDB;

-- 23. Emergency SOS Events Log
CREATE TABLE IF NOT EXISTS emergency_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  caller_name VARCHAR(150) NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  action_taken VARCHAR(255) NOT NULL,
  emergency_type VARCHAR(100) NOT NULL DEFAULT 'General SOS',
  status VARCHAR(60) NOT NULL DEFAULT 'Logged Demo Event',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_emg_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 24. 24/7 Emergency Helplines
CREATE TABLE IF NOT EXISTS helplines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  phone_number VARCHAR(35) NOT NULL,
  description VARCHAR(255) NOT NULL,
  available_hours VARCHAR(60) NOT NULL DEFAULT '24/7',
  is_toll_free BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 25. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(60) NOT NULL,
  entity_id INT NULL,
  details TEXT NULL,
  ip_address VARCHAR(60) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action)
) ENGINE=InnoDB;

-- 26. In-App Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('appointment', 'reminder', 'lab', 'system', 'emergency') NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id)
) ENGINE=InnoDB;
