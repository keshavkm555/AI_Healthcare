-- ============================================================
-- HealthAI - Full Stack AI Healthcare Assistant Seed Data
-- ============================================================

USE healthcare_db;

-- 1. Specialties Seed
INSERT INTO specialties (name, description, icon) VALUES
('Cardiology', 'Heart, blood vessels, and cardiovascular conditions', 'HeartPulse'),
('Neurology', 'Brain, spinal cord, and nervous system disorders', 'Brain'),
('Dermatology', 'Skin, hair, nails, and cutaneous health issues', 'Sparkles'),
('General Medicine', 'Comprehensive primary care and internal medicine', 'Stethoscope'),
('Orthopedics', 'Musculoskeletal system, bones, joints, and ligaments', 'Bone'),
('Pediatrics', 'Infant, child, and adolescent healthcare', 'Baby'),
('Pulmonology', 'Lungs, respiratory tract, and breathing disorders', 'Wind'),
('Gastroenterology', 'Digestive tract, stomach, liver, and intestines', 'Apple'),
('ENT (Otolaryngology)', 'Ear, nose, throat, and balance conditions', 'Ear'),
('Psychiatry', 'Mental health, anxiety, depression, and well-being', 'Smile')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Hospitals Seed (Bengaluru Hub)
INSERT INTO hospitals (hospital_name, address, city, state, phone, email, latitude, longitude, facilities, emergency_available, rating, total_beds, available_beds) VALUES
('City General Hospital', '14 MG Road, Central Business District', 'Bengaluru', 'Karnataka', '+91 80 2299 1001', 'info@citygeneral.org', 12.9716, 77.5946, 'Emergency 24x7, ICU, Blood Bank, Advanced Imaging, Dialysis, Pharmacy', 1, 4.8, 350, 48),
('Apollo Super Specialty Hospital', '154/11 Bannerghatta Road, Opp. IIMB', 'Bengaluru', 'Karnataka', '+91 80 2630 4050', 'support@apolloblr.com', 12.8953, 77.5983, 'Cardiac Catheterization, Robotic Surgery, 24x7 Trauma, Helipad, PET-CT', 1, 4.9, 500, 72),
('Manipal Hospital', '98 HAL Old Airport Road, Kodihalli', 'Bengaluru', 'Karnataka', '+91 80 2502 4444', 'helpdesk@manipal.edu', 12.9592, 77.6534, 'Comprehensive Oncology, Organ Transplant, Neonatal ICU, 24x7 Ambulance', 1, 4.7, 600, 65),
('Fortis Hospital', '14 Cunningham Road, Vasanth Nagar', 'Bengaluru', 'Karnataka', '+91 80 4199 4444', 'reachus@fortisblr.com', 12.9866, 77.5944, 'Interventional Cardiology, Ortho Joint Replacement, Neuro Care, Daycare', 1, 4.6, 280, 39),
('Victoria Government Medical Centre', 'Fort Road, Near City Market, Kalasipalya', 'Bengaluru', 'Karnataka', '+91 80 2670 1150', 'enquiry@victoriablr.gov.in', 12.9629, 77.5753, 'Subsidized Healthcare, 24x7 Trauma, Burns Unit, Regional Blood Bank', 1, 4.3, 800, 110),
('Narayana Institute of Cardiac Sciences', '258/A Bommasandra Industrial Area, Hosur Road', 'Bengaluru', 'Karnataka', '+91 80 7122 2222', 'care@narayanahealth.org', 12.8124, 77.6938, 'Pediatric Cardiology, Adult Heart Surgeries, Cardiac ICU, Tele-Cardiology', 1, 4.9, 450, 56)
ON DUPLICATE KEY UPDATE hospital_name=VALUES(hospital_name);

-- 3. Users Seed
-- Pre-hashed passwords generated via bcryptjs (10 rounds):
-- Patient@123 -> $2a$10$7zD1EwhT9a3PzWp5dE0.9ebgOq/pTfZGkL4Z14U9rZtzYqQ3jFmG2
-- Doctor@123  -> $2a$10$P24e.Qc3uGj3wX8yN/oD9.2S0n1aT8t/mD.eK4U2r7a6fF9jKmC1K
-- Admin@123   -> $2a$10$y5O7iU3pWbQ3eE7.9eAgxeV1K5iKqU6vD9rP5.r2N3aY5fE8gH9m.

INSERT INTO users (id, full_name, email, password_hash, role, phone, is_active) VALUES
(101, 'Alex Mercer (Demo Patient)', 'patient@healthai.com', '$2a$10$hKrOFlut53quSvSjj9WoY.0Yp1bkKQ5hBFVAt5U.J31VMg17PB1ja', 'patient', '+91 98765 43210', 1),
(102, 'Dr. Ananya Sharma, MD (AIIMS)', 'doctor@healthai.com', '$2a$10$cQpfolI0QOfeM4A9fpDBGuaz2SCXF2hKh81fGO.aH.6BUtHGI0Fe.', 'doctor', '+91 98800 11223', 1),
(103, 'Dr. Rajesh Kumar, DM (NIMHANS)', 'neurologist@healthai.com', '$2a$10$cQpfolI0QOfeM4A9fpDBGuaz2SCXF2hKh81fGO.aH.6BUtHGI0Fe.', 'doctor', '+91 98800 33445', 1),
(104, 'HealthAI System Administrator', 'admin@healthai.com', '$2a$10$XV.5/x7MgSOLhbnk09/fOulA25jYK8h7XGbsZKRrQx9SLGlthKrU.', 'admin', '+91 80 4455 6677', 1)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), password_hash=VALUES(password_hash), role=VALUES(role);

-- 4. Patient Profile Seed for Alex Mercer
INSERT INTO patient_profiles (user_id, date_of_birth, age, gender, blood_group, height_cm, weight_kg, bmi, bmi_category, allergies, existing_conditions, current_medications, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, insurance_provider, insurance_policy_number, profile_completed_percentage) VALUES
(101, '1996-05-14', 29, 'Male', 'O+', 175.00, 71.50, 23.3, 'Normal weight', 'Penicillin, Dust mites', 'Mild Seasonal Asthma, Hypertension (borderline)', 'Montelukast 10mg (as needed)', 'Sarah Mercer', '+91 98765 43219', 'Spouse', 'Star Health Comprehensive Gold', 'SHI-2026-984421', 95)
ON DUPLICATE KEY UPDATE age=VALUES(age), bmi=VALUES(bmi);

-- 5. Doctors Directory Seed
INSERT INTO doctors (id, user_id, hospital_id, specialty_id, name, qualification, experience_years, consultation_fee, phone, email, bio, rating, available_days, teleconsult_available) VALUES
(1, 102, 2, 1, 'Dr. Ananya Sharma', 'MBBS, MD (Medicine), DM (Cardiology) - AIIMS', 14, 850.00, '+91 98800 11223', 'dr.ananya@apolloblr.com', 'Senior Interventional Cardiologist specializing in preventive heart health, coronary interventions, and cardiac arrhythmia management.', 4.9, 'Mon,Tue,Wed,Thu,Fri', 1),
(2, 103, 3, 2, 'Dr. Rajesh Kumar', 'MBBS, MD, DM (Neurology) - NIMHANS', 16, 950.00, '+91 98800 33445', 'dr.rajesh@manipal.edu', 'Distinguished Neurologist with extensive research in migraine disorders, neurovascular management, and peripheral neuropathy.', 4.8, 'Mon,Wed,Fri,Sat', 1),
(3, NULL, 1, 4, 'Dr. Priya Nambiar', 'MBBS, MD (Internal Medicine)', 11, 500.00, '+91 98800 55667', 'priya.n@citygeneral.org', 'Lead Physician at City General Hospital treating acute febrile illnesses, lifestyle metabolic disorders, and primary diagnostics.', 4.7, 'Mon,Tue,Wed,Thu,Fri,Sat', 1),
(4, NULL, 4, 3, 'Dr. Vikramaditya Rao', 'MBBS, MD (Dermatology, Venereology & Leprosy)', 9, 650.00, '+91 98800 77889', 'vikram.rao@fortisblr.com', 'Board-certified clinical and aesthetic dermatologist with focused experience in eczema, psoriasis, acne therapy, and dermatosurgery.', 4.8, 'Tue,Thu,Sat', 1),
(5, NULL, 1, 5, 'Dr. Arvind Swaminathan', 'MBBS, MS (Orthopedics), MCh (Ortho - UK)', 15, 800.00, '+91 98800 99001', 'arvind.ortho@citygeneral.org', 'Orthopedic surgeon focusing on sports injuries, arthroscopic reconstruction, and minimally invasive joint care.', 4.6, 'Mon,Tue,Thu,Fri', 1),
(6, NULL, 2, 6, 'Dr. Meera Chandrasekhar', 'MBBS, DCH, MD (Pediatrics)', 12, 600.00, '+91 98800 22334', 'meera.ped@apolloblr.com', 'Compassionate pediatrician focusing on childhood immunization, growth milestones, and pediatric asthma management.', 4.9, 'Mon,Tue,Wed,Thu,Fri', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 6. Doctor Availability
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes) VALUES
(1, 'Monday', '09:00:00', '13:00:00', 30),
(1, 'Monday', '15:00:00', '18:00:00', 30),
(1, 'Wednesday', '09:00:00', '13:00:00', 30),
(1, 'Friday', '10:00:00', '14:00:00', 30),
(2, 'Tuesday', '10:00:00', '14:00:00', 30),
(2, 'Thursday', '14:00:00', '18:00:00', 30),
(3, 'Monday', '08:30:00', '12:30:00', 20),
(3, 'Tuesday', '08:30:00', '12:30:00', 20),
(3, 'Wednesday', '08:30:00', '12:30:00', 20),
(3, 'Thursday', '08:30:00', '12:30:00', 20),
(3, 'Friday', '08:30:00', '12:30:00', 20)
ON DUPLICATE KEY UPDATE slot_duration_minutes=VALUES(slot_duration_minutes);

-- 7. Diagnostic Lab Tests Catalog
INSERT INTO lab_tests (name, category, sample_type, description, preparation_instructions, turnaround_time, sample_price) VALUES
('Complete Blood Count (CBC) with ESR', 'Hematology', 'Blood', 'Measures red & white blood cells, hemoglobin, hematocrit, platelets to evaluate overall health, anemia, or infections.', 'No fasting required. Stay well hydrated.', '12 Hours', 350.00),
('Comprehensive Metabolic Panel (CMP / LFT & KFT)', 'Biochemistry', 'Blood', 'Evaluates kidney and liver functions, blood glucose, electrolyte balance, and systemic proteins.', '10 to 12 hours overnight fasting mandatory. Water permitted.', '24 Hours', 890.00),
('Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)', 'Cardiovascular', 'Blood', 'Assesses blood cholesterol fractions to calculate cardiovascular risk and atherogenic index.', '12 hours strict fasting required prior to blood draw.', '12 Hours', 600.00),
('Glycated Hemoglobin (HbA1c)', 'Diabetes', 'Blood', 'Measures average blood sugar levels over the past 2 to 3 months for diabetes diagnosis and tracking.', 'No fasting required. Can be done anytime during the day.', '8 Hours', 450.00),
('Thyroid Profile Total (T3, T4, TSH)', 'Endocrinology', 'Blood', 'Evaluates thyroid gland physiology and screens for hypothyroidism or hyperthyroidism.', 'Morning blood sample preferred before taking any thyroid medication.', '12 Hours', 550.00),
('Vitamin D3 (25-Hydroxycholecalciferol)', 'Vitamins & Minerals', 'Blood', 'Measures active circulating vitamin D to evaluate bone mineral density, fatigue, and immunity.', 'No fasting required.', '24 Hours', 950.00),
('Vitamin B12 (Cyanocobalamin)', 'Vitamins & Minerals', 'Blood', 'Essential test for nerve function, neurological symptoms, memory support, and megaloblastic anemia.', 'Fasting for 8 hours recommended.', '24 Hours', 750.00),
('Urine Routine & Microscopic Examination', 'Clinical Pathology', 'Urine', 'Screens for urinary tract infections (UTI), kidney disease, proteinuria, and metabolic markers.', 'First morning mid-stream clean-catch urine sample in sterile container provided.', '6 Hours', 250.00),
('High Sensitivity C-Reactive Protein (hs-CRP)', 'Inflammation & Cardiac', 'Blood', 'Sensitive biomarker detecting low-grade systemic vascular inflammation and coronary risk.', 'No fasting required.', '12 Hours', 650.00),
('Dengue Serology (NS1 Antigen, IgM & IgG Antibodies)', 'Infectious Diseases', 'Blood', 'Differential testing for acute or secondary dengue viral fever with rapid platelet correlation.', 'No fasting required. Immediate processing advised.', '6 Hours', 800.00)
ON DUPLICATE KEY UPDATE sample_price=VALUES(sample_price);

-- 8. Medical Scans and Imaging Services
INSERT INTO scan_services (name, modality, description, preparation_instructions, sample_price, duration_minutes) VALUES
('Chest X-Ray (PA View)', 'X-ray', 'Digital high-resolution radiograph of chest cavity, lungs, cardiac silhouette, and thoracic skeleton.', 'Remove metal jewelry and metallic accessories from the neck and chest.', 400.00, 15),
('Computed Tomography (CT) Brain (Plain)', 'CT scan', 'Multi-slice cross-sectional imaging for headaches, head trauma, stroke evaluation, and intracranial lesions.', 'Remove head hairpins, eyeglasses, dentures, and earrings.', 2200.00, 20),
('Magnetic Resonance Imaging (MRI) Lumbar Spine', 'MRI', 'Detailed non-ionizing magnetic resonance imaging of lumbar intervertebral discs, thecal sac, and nerve roots.', 'Inform staff of any pacemakers, aneurysm clips, or metallic implants. Fast 3 hours prior.', 4800.00, 40),
('Ultrasound Whole Abdomen & Pelvis (USG)', 'Ultrasound', 'High frequency sound wave imaging of liver, gallbladder, spleen, pancreas, kidneys, urinary bladder, and prostate/uterus.', 'Fast for 6 hours; drink 1 liter of plain water 1 hour prior and hold urine for full bladder.', 1400.00, 25),
('12-Lead Electrocardiogram (ECG)', 'ECG', 'Electro-physiological recording of electrical conduction through the myocardium to detect ischemia or arrhythmias.', 'Avoid caffeinated beverages 2 hours prior. Wear loose-fitting top.', 300.00, 10),
('2D Echocardiography with Color Doppler', 'Echocardiography', 'Ultrasound imaging evaluating heart chambers, myocardial contractility, ejection fraction, and cardiac valve function.', 'No special preparation needed. Bring previous ECG reports if available.', 1950.00, 30),
('Digital Bilateral Screening Mammography', 'Mammography', 'Low-dose X-ray examination for early detection of breast lesions, micro-calcifications, and tissue changes.', 'Do not apply deodorant, antiperspirants, talcum powder, or lotions under the arms.', 1800.00, 25),
('Whole Body PET-CT Oncology Scan', 'PET-CT', 'Advanced molecular imaging combining Positron Emission Tomography with CT for metabolic lesion visualization.', 'Fasting 6 hours. Blood glucose must be under 160 mg/dL before radiotracer administration.', 18500.00, 120),
('Dual-Energy X-ray Absorptiometry (DEXA) Bone Density', 'DEXA', 'Gold standard measurement of Bone Mineral Density (BMD) at hip and spine to screen for osteoporosis.', 'Stop calcium supplements 24 hours prior to scan.', 1700.00, 20),
('Diagnostic Upper Gastrointestinal Endoscopy (OGD)', 'Endoscopy', 'Direct fiberoptic video visualization of esophagus, gastric mucosa, and duodenum for ulcers or reflux.', 'Strict fasting for at least 8 hours. Local anesthetic spray provided.', 3200.00, 30)
ON DUPLICATE KEY UPDATE sample_price=VALUES(sample_price);

-- 9. Health Packages Seed
INSERT INTO health_packages (package_name, tagline, description, included_tests, sample_price, original_price, preparation_instructions, recommended_for) VALUES
('Basic Health Check', 'Essential annual baseline health screening', 'Ideal for young adults to track routine physiological biomarkers, blood counts, and kidney filtration indices.', 'Complete Blood Count (CBC), Fasting Blood Glucose, Serum Creatinine, Urine Routine, Doctor Consultation', 999.00, 1600.00, 'Overnight fasting of 8-10 hours. Plain water is permitted.', 'Individuals aged 18 to 35 years'),
('Full Body Comprehensive Check', 'In-depth head-to-toe preventive screening', 'Extensive profile screening 62 vital parameters including liver, kidneys, cardiovascular lipid risk, thyroid, and vitamin status.', 'CBC, Lipid Profile, LFT, KFT, HbA1c, Thyroid Profile, Vitamin D3, Vitamin B12, Urine Routine, ECG, Chest X-ray, Physician Consultation', 2499.00, 5200.00, 'Strict overnight fasting of 10-12 hours. Collect first morning urine sample upon arrival.', 'All adults aged 25+ years'),
('Advanced Heart Care Package', 'Targeted cardiac wellness and coronary evaluation', 'Dedicated cardiovascular diagnostic regimen evaluating lipid fractions, cardiac anatomy, functional reserve, and ischemia risk.', 'Lipid Profile, hs-CRP, 12-Lead ECG, 2D Echocardiography with Doppler, Treadmill Stress Test (TMT), Cardiologist Consultation', 3499.00, 6800.00, 'Fast 8 hours. Wear comfortable walking shoes for treadmill test. Avoid tea/coffee morning of test.', 'Adults with family history of heart disease, hypertension, or high stress'),
('Diabetes Wellness & Reversal Package', 'Comprehensive metabolic control and organ safety', 'Formulated for diabetic and prediabetic individuals to track glycemic metrics and safeguard renal and retinal health.', 'Fasting Blood Sugar, Postprandial Blood Sugar, HbA1c, Lipid Profile, Serum Creatinine, Urine Microalbumin, Fundus Eye Screening', 1499.00, 3100.00, 'Report in fasting state. Second blood sample collected exactly 2 hours after breakfast.', 'Prediabetic and diabetic patients'),
('Women Complete Health Package', 'Hormonal, bone density, and wellness evaluation', 'Holistic healthcare checkup crafted specifically for women addressing hormonal balance, cervical safety, and bone integrity.', 'CBC, Thyroid Profile, Fasting Sugar, Pelvic USG, Digital Mammography / Breast Ultrasound, Pap Smear, DEXA Bone Density, Gynecologist Consult', 3999.00, 7800.00, 'Overnight fasting. Schedule between day 7 and 14 of menstrual cycle if applicable.', 'Women aged 30 years and above'),
('Senior Citizen Platinum Health Check', 'Active aging, vital organs, and geriatric wellness', 'Specialized geriatric panel checking cognitive markers, bone strength, cardiac endurance, renal efficiency, and electrolyte balance.', 'Full Body Chemistry, Cardiac ECG, DEXA Bone Mineral Density, Electrolytes (Na/K/Cl), PSA (for men) / CA-125 (for women), Geriatrician Consult', 2999.00, 6200.00, 'Overnight fasting 10 hours. Bring all current medications and eyeglasses.', 'Seniors aged 60 years and above')
ON DUPLICATE KEY UPDATE sample_price=VALUES(sample_price);

-- 10. Blood Banks Seed
INSERT INTO blood_banks (name, address, city, contact_number, operating_hours, stock_summary) VALUES
('Rotary Bangalore Blood Centre', '12 Brigade Road, Shivaji Nagar', 'Bengaluru', '+91 80 2558 3444', '24/7', '{"A+": 18, "A-": 6, "B+": 24, "B-": 8, "AB+": 12, "AB-": 4, "O+": 32, "O-": 10}'),
('Indian Red Cross Society Blood Bank', '26 Red Cross Bhavan, Race Course Road', 'Bengaluru', '+91 80 2226 4205', '24/7', '{"A+": 14, "A-": 4, "B+": 28, "B-": 5, "AB+": 9, "AB-": 3, "O+": 22, "O-": 7}'),
('Rashtrotthana Blood Centre', '93 Gavipuram Extension, Kempegowda Nagar', 'Bengaluru', '+91 80 2661 2730', '24/7', '{"A+": 20, "A-": 7, "B+": 30, "B-": 9, "AB+": 15, "AB-": 5, "O+": 40, "O-": 12}'),
('Victoria Hospital Blood Bank', 'Fort Road, Near City Market', 'Bengaluru', '+91 80 2670 1150', '24/7', '{"A+": 25, "A-": 9, "B+": 35, "B-": 11, "AB+": 16, "AB-": 6, "O+": 45, "O-": 14}'),
('Narayana Hrudayalaya Blood Centre', '258/A Bommasandra, Hosur Road', 'Bengaluru', '+91 80 7122 2222', '24/7', '{"A+": 16, "A-": 5, "B+": 22, "B-": 6, "AB+": 10, "AB-": 3, "O+": 28, "O-": 8}')
ON DUPLICATE KEY UPDATE contact_number=VALUES(contact_number);

-- 11. Blood Donors Seed (Demo Data with Explicit Consent Simulation)
INSERT INTO blood_donors (full_name, blood_group, city, phone, email, is_available, consent_given, last_donated_date) VALUES
('Karthik Varma', 'O+', 'Bengaluru', '+91 98450 11221', 'karthik.v@demo.mail', 1, 1, '2026-06-15'),
('Sneha Deshmukh', 'A+', 'Bengaluru', '+91 98450 33442', 'sneha.d@demo.mail', 1, 1, '2026-07-20'),
('Mohammed Rizwan', 'B+', 'Bengaluru', '+91 98450 55663', 'rizwan.m@demo.mail', 1, 1, '2026-08-10'),
('David John', 'O-', 'Bengaluru', '+91 98450 77884', 'david.j@demo.mail', 1, 1, '2026-05-18'),
('Pooja Hegde', 'AB+', 'Bengaluru', '+91 98450 99005', 'pooja.h@demo.mail', 1, 1, '2026-04-12'),
('Aditya Nair', 'B-', 'Bengaluru', '+91 98450 22336', 'aditya.n@demo.mail', 1, 1, '2026-06-30')
ON DUPLICATE KEY UPDATE is_available=VALUES(is_available);

-- 12. 24/7 Verified Emergency Helplines
INSERT INTO helplines (service_name, category, phone_number, description, available_hours, is_toll_free) VALUES
('National Emergency Services', 'Emergency Response', '112', 'Single unified emergency helpline for police, fire, and immediate medical dispatch across India.', '24/7', 1),
('Ambulance Medical Emergency', 'Medical Dispatch', '108', 'Toll-free emergency medical response service for rapid ambulance dispatch and on-site paramedic support.', '24/7', 1),
('Tele-MANAS Mental Health Support', 'Mental Health & Crisis', '14416', 'Government of India national tele-mental health helpline providing certified psychological counselors.', '24/7', 1),
('Women Emergency Helpline', 'Safety & Support', '1091', 'Round-the-clock helpline providing immediate assistance, distress support, and rescue for women.', '24/7', 1),
('National Childline', 'Child Welfare', '1098', 'Free, emergency phone outreach service for children in need of medical attention, care, and protection.', '24/7', 1),
('National Poison Information Centre', 'Toxicology & Poisoning', '1800-116-117', 'Specialized toxicology advisory service at AIIMS for acute chemical, pesticide, or drug poisoning emergencies.', '24/7', 1),
('Elder Line (Senior Citizens Helpline)', 'Elderly Support', '14567', 'National helpline extending physical, legal, medical guidance, and emotional support to senior citizens.', '24/7', 1)
ON DUPLICATE KEY UPDATE phone_number=VALUES(phone_number);

-- 13. Sample Appointments for Demo Patient (Alex Mercer)
INSERT INTO appointments (booking_reference, user_id, hospital_id, doctor_id, appointment_date, appointment_time, appointment_type, reason, status) VALUES
('APT-2026-8841', 101, 2, 1, '2026-10-28', '10:30:00', 'OPD In-Person', 'Routine cardiology review and resting blood pressure monitoring.', 'Confirmed'),
('APT-2026-7294', 101, 3, 2, '2026-11-04', '15:00:00', 'Video Teleconsultation', 'Follow-up consultation regarding tension headaches and screen fatigue.', 'Confirmed'),
('APT-2026-3112', 101, 1, 3, '2026-09-12', '11:00:00', 'OPD In-Person', 'Seasonal allergic rhinitis and dry cough assessment.', 'Completed')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 14. Sample Prescriptions for Demo Patient
INSERT INTO prescriptions (id, user_id, doctor_id, hospital_id, doctor_name, diagnosis, notes, issued_date, valid_until, source_type) VALUES
(1, 101, 1, 2, 'Dr. Ananya Sharma', 'Stage 1 Essential Hypertension & Borderline Dyslipidemia', 'Advised 30 minutes daily aerobic brisk walk, reduced dietary sodium intake (<2g/day), and hydration.', '2026-10-15', '2026-12-15', 'Doctor Prescribed')
ON DUPLICATE KEY UPDATE diagnosis=VALUES(diagnosis);

INSERT INTO prescription_medicines (prescription_id, medicine_name, dosage, frequency, timing, start_date, end_date, instructions) VALUES
(1, 'Telmisartan Tablets', '40 mg', 'Once daily', 'Before Food', '2026-10-15', '2026-12-15', 'Take every morning before breakfast. Monitor BP weekly.'),
(1, 'Atorvastatin Tablets', '10 mg', 'Once daily', 'After Food', '2026-10-15', '2026-12-15', 'Take once at night after dinner.')
ON DUPLICATE KEY UPDATE dosage=VALUES(dosage);

-- 15. Active Medicine Reminders for Demo Patient
INSERT INTO medicine_reminders (user_id, prescription_medicine_id, medicine_name, dosage, reminder_time, day_phase, is_taken, reminder_date) VALUES
(101, 1, 'Telmisartan Tablets', '40 mg', '08:00:00', 'Morning', 1, CURRENT_DATE()),
(101, 2, 'Atorvastatin Tablets', '10 mg', '21:30:00', 'Night', 0, CURRENT_DATE())
ON DUPLICATE KEY UPDATE reminder_time=VALUES(reminder_time);

-- 16. Sample Lab & Scan Bookings for Demo Patient
INSERT INTO lab_bookings (booking_reference, user_id, lab_test_id, collection_type, booking_date, booking_time, patient_address, status, result_summary) VALUES
('LAB-2026-1049', 101, 3, 'Home Sample Collection', '2026-10-18', '07:30:00', 'Flat 402, Green Glen Layout, Bellandur, Bengaluru', 'Completed', 'Total Cholesterol: 198 mg/dL (Desirable), HDL: 48 mg/dL, LDL: 124 mg/dL, Triglycerides: 145 mg/dL. Cardiovascular profile within controlled parameters.')
ON DUPLICATE KEY UPDATE status=VALUES(status);

INSERT INTO scan_bookings (booking_reference, user_id, scan_service_id, hospital_id, booking_date, booking_time, status, report_summary) VALUES
('SCN-2026-5521', 101, 5, 2, '2026-10-18', '09:00:00', 'Completed', 'Normal sinus rhythm, heart rate 72 bpm, no ST-T segment elevation or acute ischemic changes detected.')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 17. Sample Vital Signs History for Alex Mercer
INSERT INTO vital_signs (user_id, systolic_bp, diastolic_bp, heart_rate, spo2_percent, temperature_f, blood_glucose_mg_dl, notes, source, recorded_at) VALUES
(101, 126, 82, 74, 98, 98.4, 96, 'Morning resting vitals recorded at home', 'User Entered', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(101, 124, 80, 72, 99, 98.6, 102, 'Post workout vitals', 'User Entered', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(101, 122, 78, 70, 98, 98.2, 94, 'Routine checkup prior to breakfast', 'User Entered', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(101, 120, 78, 68, 99, 98.4, 92, 'Resting evening measurement', 'User Entered', NOW())
ON DUPLICATE KEY UPDATE systolic_bp=VALUES(systolic_bp);

-- 18. Medical Records Timeline for Demo Patient
INSERT INTO medical_records (user_id, record_type, title, description, reference_id, doctor_or_facility, record_date) VALUES
(101, 'Prescription', 'Cardiology Outpatient Prescription', 'Prescribed Telmisartan 40mg and Atorvastatin 10mg for blood pressure and lipid optimization.', 'RX-2026-001', 'Dr. Ananya Sharma (Apollo Hospitals)', '2026-10-15'),
(101, 'Lab Report', 'Lipid Panel Report', 'Total Cholesterol: 198 mg/dL, Triglycerides: 145 mg/dL, HDL: 48 mg/dL, LDL: 124 mg/dL.', 'LAB-2026-1049', 'Apollo Diagnostics Hub', '2026-10-18'),
(101, 'Imaging Scan', '12-Lead ECG Report', 'Sinus rhythm within standard limits. Ejection fraction and intervals normal.', 'SCN-2026-5521', 'Apollo Super Specialty Hospital', '2026-10-18')
ON DUPLICATE KEY UPDATE title=VALUES(title);
