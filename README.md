# 🏥 AI Healthcare Assistant — Full-Stack Web Application

An enterprise-grade, full-stack AI Healthcare Assistant web platform built with **React (Vite)**, **Node.js (Express)**, and **MySQL**. Developed as an end-to-end transformation of an interactive healthcare prototype into a complete, secure, database-backed clinical portal.

---

## 🌟 Key Highlights & Modules

1. **Patient Registration & JWT Authentication**:
   - Secure bcrypt password hashing (10 salt rounds).
   - Stateless JWT tokens with role-based authorization (`patient`, `doctor`, `admin`).
   - Profile completion tracking, BMI auto-calculation, medical history, emergency contacts.

2. **AI Health Assessment & Symptom Checker**:
   - Natural language symptom query processing.
   - Dual-mode AI architecture:
     - **Configurable Google Gemini API** integration for generative dialogue.
     - **Deterministic Clinical Rule Engine** with 45 detailed disease profiles, matching probabilities, differential analysis, recommended clinical specialist, and practical self-care guidelines.
   - **Critical Red-Flag Emergency Triage**: Instant detection of cardiac arrests, acute coronary syndrome, ischemic stroke (FAST), anaphylaxis, respiratory distress, and severe trauma with immediate redirection to 108 / 112 emergency services.
   - Assessment history tracking, PDF report generation, and direct doctor booking integration.

3. **OPD Doctor Appointment Booking**:
   - Searchable doctor directory filtered by hospital, clinical specialty, and consultation fee.
   - Slot-level database concurrency protection via MySQL ACID transactions to strictly prevent double bookings.
   - Unique booking reference generation (`BK-XXXXXX`) and real-time status management (`CONFIRMED`, `COMPLETED`, `CANCELLED`).

4. **Teleconsultation (Video Consultation)**:
   - Video consultation scheduling with licensed specialists.
   - Interactive consultation room with simulated live media streams, device controls (camera/microphone toggles), appointment notes, and WebRTC-ready architecture.

5. **Hospital Discovery & Geolocation**:
   - Curated directory of tertiary care hospitals and trauma centres.
   - Interactive OpenStreetMap / Leaflet embedded maps with pinpoint coordinates.
   - Real-time Haversine distance calculation using browser GPS coordinates.

6. **Laboratory Tests & Home Collection**:
   - Catalog of 10+ diagnostic tests (CBC, Lipid Panel, HbA1c, Thyroid, Liver Function, etc.).
   - Choice between lab visit or doorstep home sample collection.
   - Preparation fasting guides, time-slot selection, and authorized test results access.

7. **Medical Scans & Imaging Services**:
   - 10 scan categories (MRI, CT Scan, Ultrasound, X-Ray, ECG, Echo, Mammography, PET-CT, DEXA, Endoscopy).
   - Preparation instructions, contraindication notices, and digital radiologic reports.

8. **Preventive Health Checkup Packages**:
   - Comprehensive preventive packages (Basic, Comprehensive Full Body, Cardiac Health, Diabetes Care, Women's Wellness, Senior Citizen Health).
   - Included test breakdown, package comparison, and multi-test booking workflows.

9. **Smart Prescription Management & Pill Reminders**:
   - Authorized digital prescription management issued by doctors.
   - Daily medication schedules (morning, afternoon, evening, night).
   - Interactive "Mark as Taken" tracking with adherence logs.

10. **Digital Medical Records & Health Wallet**:
    - Centralized repository of patient health history: clinical assessments, appointment slips, lab reports, imaging records, and prescriptions.
    - Export and print functionality for consultations.

11. **Vital Signs Monitoring & Health Analytics**:
    - Tracking of Blood Pressure (Systolic/Diastolic), Heart Rate, Blood Sugar (Fasting/Post-Prandial), SpO2, Temperature, and Weight.
    - Interactive visual charts powered by **Recharts** highlighting normal vs. abnormal ranges.

12. **Emergency SOS & 24/7 Helplines**:
    - One-click SOS dispatcher with automatic GPS geolocation capture.
    - Verified direct-dial national emergency helplines (112 National Emergency, 108 Ambulance, 102 Women Helpline, 14416 Tele-MANAS Mental Health, 1075 National Health Helpline, 104 Blood Bank Directory).

13. **First Aid & Clinical Emergency Guides**:
    - Step-by-step CPR protocols, choking relief (Heimlich maneuver), burns treatment, fracture stabilization, snake bites, and stroke recognition.

14. **Blood Bank Directory & Donor Network**:
    - City-wide blood bank registry with live blood group inventory levels (A+, A-, B+, B-, O+, O-, AB+, AB-).
    - Voluntary donor registration system for prospective blood donors.

15. **Specialized Portals**:
    - **Doctor Portal**: Dedicated dashboard for licensed physicians to view scheduled patient consultations, conduct appointments, and prescribe medications.
    - **Admin Dashboard**: System metrics, user role management, hospital directory administration, and appointment monitoring.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React, Recharts |
| **Backend** | Node.js, Express.js (REST API), CORS, Helmet, Morgan, Express Rate Limit |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, Input validation (`express-validator`) |
| **Database** | MySQL 8.0, `mysql2/promise` connection pooling, ACID transaction wrappers |
| **Mapping & Location** | OpenStreetMap, Leaflet / Custom Map Markers, Browser Geolocation API |
| **AI Decision Support**| Google Gemini API (`@google/genai` or standard REST endpoint) + Fallback Rule Engine (45 profiles) |

---

## 📁 System Architecture & Directory Layout

```
ai-healthcare-assistant/
├── database/
│   ├── schema.sql                 # 26 normalized relational tables with foreign keys and indexes
│   └── seed.sql                   # Realistic sample data (Hospitals, Doctors, Labs, Scans, Packages, Helplines)
├── backend/
│   ├── .env                       # Backend environment configuration
│   ├── .env.example               # Template environment configuration
│   ├── package.json
│   └── src/
│       ├── server.js              # Server entry point
│       ├── app.js                 # Express app configuration & middleware
│       ├── config/
│       │   ├── db.js              # MySQL connection pool & transaction helper
│       │   ├── jwt.js             # JWT signer & secret configuration
│       │   └── runSeed.js         # Automated database seeder script
│       ├── middleware/
│       │   ├── auth.js            # JWT verification & RBAC middleware
│       │   ├── errorHandler.js    # Centralized API error handling
│       │   └── rateLimiter.js     # API rate limiter
│       ├── services/
│       │   └── aiService.js       # AI symptom matcher & emergency red-flag triager
│       ├── routes/                # 17 REST API route modules
│       ├── controllers/           # 17 Controller modules
│       └── tests/
│           └── test_api.js        # Automated 18-step integration test suite
├── frontend/
│   ├── .env                       # Frontend environment configuration
│   ├── index.html                 # Main HTML template
│   ├── package.json
│   ├── vite.config.js             # Vite config with API proxy
│   ├── tailwind.config.js         # Healthcare Teal Theme configuration
│   └── src/
│       ├── main.jsx               # React DOM entry
│       ├── App.jsx                # Route declarations & navigation setup
│       ├── context/
│       │   └── AuthContext.jsx    # Authentication & User state provider
│       ├── services/
│       │   └── api.js             # Axios client with automatic Bearer token injection
│       ├── components/
│       │   ├── Navbar.jsx         # Global top navigation bar
│       │   ├── Sidebar.jsx        # Responsive collapsible dashboard sidebar
│       │   ├── Footer.jsx         # Clinical disclaimer footer
│       │   └── ProtectedRoute.jsx # Role-based route guard
│       ├── layouts/
│       │   └── AppLayout.jsx      # Master layout with sidebar & content area
│       └── pages/                 # 24 Functional React Pages
└── README.md
```

---

## 🔑 Demo User Accounts

The database comes pre-seeded with test accounts for each role. All passwords are encrypted with bcrypt:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@healthai.com` | `Patient@123` | Patient Dashboard, Symptom Checker, Appointments, Vitals, Prescriptions, Records, SOS |
| **Doctor** | `doctor@healthai.com` | `Doctor@123` | Doctor Portal, Patient Queue, Consultation Notes, Prescription Writer |
| **Admin** | `admin@healthai.com` | `Admin@123` | Admin Portal, User Management, Hospital & Doctor Directory Management, System Logs |

---

## 🚀 Step-by-Step Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MySQL Server**: v8.0 or higher (running on port `3306`)

---

### Step 1: Database Setup
1. Open MySQL Command Line or MySQL Workbench:
   ```sql
   CREATE DATABASE healthcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Import the schema and seed files directly or execute the automated Node seeder:
   ```powershell
   cd "C:\Users\CHANDAN G P\.gemini\antigravity\scratch\ai-healthcare-assistant\backend"
   npm run seed
   ```
   *Alternatively, in MySQL CLI:*
   ```powershell
   mysql -u root -p healthcare_db < ..\database\schema.sql
   mysql -u root -p healthcare_db < ..\database\seed.sql
   ```

---

### Step 2: Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=healthcare_db
DB_PORT=3306
JWT_SECRET=super_secret_healthcare_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 3: Run the Application

#### Terminal 1 — Start Backend Server:
```powershell
cd "C:\Users\CHANDAN G P\.gemini\antigravity\scratch\ai-healthcare-assistant\backend"
npm run dev
```
*Backend runs at:* `http://localhost:5000`  
*(Healthcheck: `http://localhost:5000/api/health`)*

#### Terminal 2 — Start Frontend Application:
```powershell
cd "C:\Users\CHANDAN G P\.gemini\antigravity\scratch\ai-healthcare-assistant\frontend"
npm run dev
```
*Frontend runs at:* `http://localhost:5173`

---

## 🧪 Testing the APIs

An automated integration test script is included to verify all backend REST endpoints:

```powershell
cd "C:\Users\CHANDAN G P\.gemini\antigravity\scratch\ai-healthcare-assistant\backend"
node src/tests/test_api.js
```

### Verified Test Suite (18/18 Passing):
- `GET /api/health` — Server health check
- `POST /api/symptoms/assess` — Symptom evaluation & differential matching
- `POST /api/symptoms/assess` — Red-flag cardiac emergency detection & triage
- `GET /api/hospitals` — Hospital listings
- `GET /api/doctors` — Doctor directory
- `POST /api/auth/login` — Patient authentication & JWT issuance
- `GET /api/auth/profile` — Protected profile retrieval with Bearer token
- `GET /api/patients/dashboard` — Aggregated patient dashboard data
- `GET /api/emergency/helplines` — Emergency telephone directory
- `GET /api/labs/tests` — Diagnostic laboratory catalog
- `GET /api/scans/services` — Imaging and radiological services
- `GET /api/packages` — Preventive health packages
- `GET /api/blood-banks` — Blood bank inventory and donors

---

## 🛡️ Medical Safety & Ethical AI Notice

1. **Non-Diagnostic Nature**: The AI symptom checker is strictly an informational clinical decision support tool. It does not issue official medical diagnoses.
2. **Deterministic Red-Flag Escalation**: High-risk medical symptoms (such as acute chest pain, neurological deficits, severe shortness of breath, anaphylaxis, or acute poisoning) bypass standard matching and trigger an immediate emergency alert advising the user to contact emergency services (108 / 112) or proceed to the nearest trauma centre.
3. **No Automated Prescriptions**: Prescription drugs (including antibiotics, controlled substances, and cardiovascular medications) are never automatically prescribed by the AI engine. Prescriptions can only be issued by verified, licensed medical doctors through the Doctor Portal.
4. **Transparent AI Offline Fallback**: In the absence of an external LLM API key, the system automatically falls back to its deterministic 45-profile clinical knowledge base without disruption or degraded reliability.

---

## 📜 License & Academic Usage

This project was developed for final-year engineering / computer science project presentation and demonstration purposes. All seed hospitals and doctor records in Bengaluru are illustrative samples designed for academic review.
