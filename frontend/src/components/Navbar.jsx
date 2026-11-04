import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Menu,
  X,
  LogOut,
  Stethoscope,
  ShieldAlert,
  PhoneCall,
  Building2,
  UserCheck,
  Home,
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  TestTube,
  Scan,
  Package,
  Droplets,
  HeartHandshake,
  Pill,
  FileText,
  LineChart,
  User,
  ChevronDown
} from 'lucide-react';

const primaryLinks = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/symptom-checker', label: 'AI Symptom Check', icon: Stethoscope },
  { to: '/hospitals', label: 'Hospitals', icon: Building2 },
  { to: '/doctors', label: 'Doctors', icon: UserCheck },
  { to: '/helplines', label: 'Helplines', icon: PhoneCall },
];

const mobileServiceLinks = [
  { to: '/book-appointment', label: 'Book OPD Appointment', icon: CalendarPlus },
  { to: '/lab-tests', label: 'Laboratory Tests', icon: TestTube },
  { to: '/scans', label: 'Imaging & Scans', icon: Scan },
  { to: '/health-packages', label: 'Health Packages', icon: Package },
  { to: '/blood-bank', label: 'Blood Banks & Donors', icon: Droplets },
  { to: '/first-aid', label: 'First Aid Guidance', icon: HeartHandshake },
];

const mobileAccountLinks = [
  { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { to: '/appointments', label: 'My Appointments', icon: CalendarCheck },
  { to: '/prescriptions', label: 'Prescriptions & Medicines', icon: Pill },
  { to: '/medical-records', label: 'Medical Records', icon: FileText },
  { to: '/vitals', label: 'Vitals & BMI Tracker', icon: LineChart },
  { to: '/profile', label: 'Health Profile', icon: User },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Stronger shadow once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const initials = (user?.full_name || 'U')
    .replace(/^(Dr\.?\s+)/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const desktopLinkClass = ({ isActive }) =>
    `relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'text-[#087f8c] bg-teal-50'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
      isActive ? 'bg-teal-50 text-[#087f8c]' : 'text-slate-700 hover:bg-slate-50'
    }`;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_8px_30px_-12px_rgba(16,24,40,0.18)]'
          : 'bg-white/60 backdrop-blur-xl border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#087f8c] via-[#0aa2b0] to-indigo-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
              <Activity className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="leading-none">
              <span className="block text-xl font-extrabold tracking-tight text-slate-900">
                Health<span className="text-gradient">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mt-1">
                Care Assistant
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/60 border border-slate-200/60">
            {primaryLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={desktopLinkClass}>
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{label}</span>
                <span className="lg:hidden">{label.split(' ')[0]}</span>
              </NavLink>
            ))}
          </nav>

          {/* Emergency SOS & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/emergency"
              className="group relative inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-[0_6px_18px_-6px_rgba(225,29,72,0.7)] hover:-translate-y-0.5 transition-all"
              title="Emergency SOS Hub"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline tracking-wide">SOS</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to={user.role === 'admin' ? '/admin' : user.role === 'doctor' ? '/doctor-portal' : '/dashboard'}
                  className="flex items-center gap-2 pl-1 pr-2 sm:pr-3 py-1 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm transition-all"
                >
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 text-[#087f8c] font-bold text-xs flex items-center justify-center">
                    {initials}
                  </span>
                  <span className="hidden lg:flex flex-col leading-tight text-left">
                    <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">{user.full_name}</span>
                    <span className="text-[10px] font-semibold text-slate-400 capitalize">{user.role}</span>
                  </span>
                  <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400" />
                </Link>
                <button
                  onClick={logout}
                  className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-[#087f8c] px-3 py-2 rounded-xl hover:bg-slate-100/70 transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-xl px-4 pt-4 pb-6 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in">
          <div className="space-y-1">
            {primaryLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={mobileLinkClass}>
                <Icon className="w-4 h-4 text-[#087f8c]" />
                {label}
              </NavLink>
            ))}
          </div>

          <p className="px-3 pt-5 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Services</p>
          <div className="space-y-1">
            {mobileServiceLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={mobileLinkClass}>
                <Icon className="w-4 h-4 text-[#087f8c]" />
                {label}
              </NavLink>
            ))}
          </div>

          {user ? (
            <>
              <p className="px-3 pt-5 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">My Account</p>
              <div className="space-y-1">
                {mobileAccountLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={mobileLinkClass}>
                    <Icon className="w-4 h-4 text-[#087f8c]" />
                    {label}
                  </NavLink>
                ))}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-5">
              <Link to="/login" className="btn-secondary py-2.5">Sign In</Link>
              <Link to="/register" className="btn-primary py-2.5">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
