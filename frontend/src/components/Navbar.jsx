import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Activity,
  AlertCircle,
  Menu,
  X,
  User,
  LogOut,
  Calendar,
  Stethoscope,
  ShieldAlert,
  PhoneCall
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#087f8c] group-hover:bg-[#087f8c] group-hover:text-white transition-all duration-300 shadow-xs">
              <Activity className="w-6 h-6 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-[#087f8c]">HealthAI</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200/60">
                Assistant
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                isActive('/') ? 'text-[#087f8c]' : 'text-slate-600 hover:text-[#087f8c]'
              }`}
            >
              Home
            </Link>
            <Link
              to="/symptom-checker"
              className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                isActive('/symptom-checker') ? 'text-[#087f8c]' : 'text-slate-600 hover:text-[#087f8c]'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-[#087f8c]" />
              AI Symptom Check
            </Link>
            <Link
              to="/hospitals"
              className={`text-sm font-semibold transition-colors ${
                isActive('/hospitals') ? 'text-[#087f8c]' : 'text-slate-600 hover:text-[#087f8c]'
              }`}
            >
              Hospitals & Map
            </Link>
            <Link
              to="/doctors"
              className={`text-sm font-semibold transition-colors ${
                isActive('/doctors') ? 'text-[#087f8c]' : 'text-slate-600 hover:text-[#087f8c]'
              }`}
            >
              Doctors
            </Link>
            <Link
              to="/helplines"
              className={`text-sm font-semibold flex items-center gap-1 transition-colors ${
                isActive('/helplines') ? 'text-[#087f8c]' : 'text-slate-600 hover:text-[#087f8c]'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
              Helplines
            </Link>
          </nav>

          {/* Emergency SOS & User Controls */}
          <div className="flex items-center gap-3">
            {/* Emergency SOS Trigger Button */}
            <Link
              to="/emergency"
              className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all animate-pulse"
              title="Emergency SOS Hub"
            >
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span className="hidden sm:inline">EMERGENCY SOS</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200/70 text-[#087f8c] hover:bg-teal-100 transition-colors text-sm font-semibold"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline max-w-[120px] truncate">{user.full_name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-[#087f8c] px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs sm:text-sm py-2 px-3.5 shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-teal-50 hover:text-[#087f8c]"
          >
            Home
          </Link>
          <Link
            to="/symptom-checker"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-teal-50 hover:text-[#087f8c]"
          >
            🩺 AI Disease Prediction
          </Link>
          <Link
            to="/hospitals"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-teal-50 hover:text-[#087f8c]"
          >
            🏥 Hospitals & Maps
          </Link>
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-teal-50 hover:text-[#087f8c]"
          >
            👨‍⚕️ Doctors Directory
          </Link>
          <Link
            to="/book-appointment"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-teal-50 hover:text-[#087f8c]"
          >
            📅 Book OPD Appointment
          </Link>
          <Link
            to="/lab-tests"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-teal-50 hover:text-[#087f8c]"
          >
            🧪 Laboratory Tests
          </Link>
          <Link
            to="/scans"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-teal-50 hover:text-[#087f8c]"
          >
            🩻 Imaging & Scans
          </Link>
          <Link
            to="/health-packages"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-teal-50 hover:text-[#087f8c]"
          >
            🎁 Health Packages
          </Link>
          <Link
            to="/blood-bank"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-teal-50 hover:text-[#087f8c]"
          >
            🩸 Blood Banks & Donors
          </Link>
          <Link
            to="/first-aid"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-teal-50 hover:text-[#087f8c]"
          >
            🩹 First Aid Guidance
          </Link>
          <Link
            to="/helplines"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-teal-50 hover:text-[#087f8c]"
          >
            📞 24/7 Helplines
          </Link>

          {user && (
            <div className="pt-3 border-t border-slate-200 space-y-1">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-semibold text-[#087f8c] bg-teal-50"
              >
                📊 My Dashboard
              </Link>
              <Link
                to="/appointments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700"
              >
                📑 My Appointments
              </Link>
              <Link
                to="/prescriptions"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700"
              >
                💊 Prescriptions & Medicines
              </Link>
              <Link
                to="/medical-records"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700"
              >
                📂 Medical Records (EHR)
              </Link>
              <Link
                to="/vitals"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700"
              >
                📈 Vitals & BMI Tracker
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700"
              >
                👤 Health Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
