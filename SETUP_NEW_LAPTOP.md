# 🚀 Running AI Healthcare Assistant on Another Laptop

This guide contains everything you need to run this project on any Windows, macOS, or Linux laptop.

---

## 📋 1. Prerequisites (Must be installed on the new laptop)

1. **Node.js** (v18.0.0 or higher)  
   - Download: [https://nodejs.org](https://nodejs.org) (LTS version recommended)
   - Verify by typing in terminal: `node -v` and `npm -v`

2. **MySQL Server 8.0+** (or MySQL Workbench / XAMPP / WampServer)  
   - Download MySQL Community Server: [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)  
   - Or install via XAMPP: [https://www.apachefriends.org](https://www.apachefriends.org) (start MySQL module)

3. **Code Editor** (Optional but recommended)  
   - Visual Studio Code: [https://code.visualstudio.com](https://code.visualstudio.com)

---

## ⚡ 2. Quick Setup (1-Click Automated)

### On Windows:
1. Extract `AI-Healthcare-Assistant.zip` to any folder on your laptop.
2. Open the extracted folder.
3. Open `backend/.env` in Notepad or VS Code and set your MySQL password:
   ```env
   DB_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
   ```
4. Double-click **`setup-new-laptop.bat`**  
   *(or open PowerShell in the project directory and run `.\setup-new-laptop.ps1`)*.
5. Once setup finishes, double-click **`start-all.bat`** *(or run `.\start-all.ps1`)*!

---

## 🛠️ 3. Manual Step-by-Step Setup

If you prefer installing manually from the command line:

### Step 1: Extract the Zip File
Extract `AI-Healthcare-Assistant.zip` to your chosen location, e.g. `C:\Projects\AI-Healthcare-Assistant`.

### Step 2: Configure Database Password
Open `backend/.env` (or copy `backend/.env.example` to `backend/.env`):
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=healthcare_db
DB_PORT=3306
JWT_SECRET=super_secret_healthcare_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Step 3: Setup Backend & Database
Open a terminal in the project directory:
```powershell
cd backend
npm install
npm run seed
```
*(The `npm run seed` command automatically creates the `healthcare_db` database, creates all 26 tables from `database/schema.sql`, and inserts all seed data from `database/seed.sql`!)*

### Step 4: Setup Frontend
In another terminal (or navigate back to root):
```powershell
cd frontend
npm install
```

---

## 🌟 4. Running the Application

### Option A: 1-Click Launch
In PowerShell:
```powershell
.\start-all.ps1
```
*(or double-click `start-all.bat`)*

### Option B: Separate Terminals

#### Terminal 1 — Backend:
```powershell
cd backend
npm run dev
```
- API will run at: **http://localhost:5000**
- Health Check: **http://localhost:5000/api/health**

#### Terminal 2 — Frontend:
```powershell
cd frontend
npm run dev
```
- Web Application will run at: **http://localhost:5173**

---

## 🔑 5. Pre-Seeded Demo Login Credentials

| Portal | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Patient Portal** | `patient@healthai.com` | `Patient@123` | Patient Dashboard, Symptom Checker, Appointments, Vitals |
| **Doctor Portal** | `doctor@healthai.com` | `Doctor@123` | Doctor Queue, Consultation Room, Prescription Writer |
| **Admin Portal** | `admin@healthai.com` | `Admin@123` | System Analytics, User Accounts, Hospital & Doctor Management |

---

## ❓ 6. Troubleshooting Common Issues

1. **"Access denied for user 'root'@'localhost'"**:
   - Open `backend/.env` and ensure `DB_PASSWORD` matches your local MySQL root password.
   - If MySQL has no password (common in XAMPP), set: `DB_PASSWORD=`

2. **"Port 5000 or 5173 already in use"**:
   - Close any other Node.js windows or processes running on ports 5000/5173.

3. **Check registered database users anytime**:
   ```powershell
   cd backend
   npm run users
   ```
