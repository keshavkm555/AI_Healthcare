import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Stethoscope,
  CalendarPlus,
  CalendarCheck,
  Building2,
  UserCheck,
  Video,
  TestTube,
  Scan,
  Package,
  Pill,
  FileText,
  Activity,
  HeartHandshake,
  ShieldAlert,
  PhoneCall,
  User,
  ShieldCheck,
  BriefcaseMedical
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Patient Dashboard', icon: LayoutDashboard },
    { to: '/symptom-checker', label: 'AI Symptom Checker', icon: Stethoscope },
    { to: '/book-appointment', label: 'Book OPD Slot', icon: CalendarPlus },
    { to: '/appointments', label: 'My Appointments', icon: CalendarCheck },
    { to: '/hospitals', label: 'Hospitals & Map', icon: Building2 },
    { to: '/doctors', label: 'Doctor Directory', icon: UserCheck },
    { to: '/video-consult', label: 'Video Teleconsult', icon: Video },
    { to: '/lab-tests', label: 'Diagnostic Lab Tests', icon: TestTube },
    { to: '/scans', label: 'Scans & Imaging', icon: Scan },
    { to: '/health-packages', label: 'Health Packages', icon: Package },
    { to: '/prescriptions', label: 'Medicine & Reminders', icon: Pill },
    { to: '/medical-records', label: 'Electronic Records', icon: FileText },
    { to: '/vitals', label: 'Vitals & BMI History', icon: Activity },
    { to: '/first-aid', label: 'Emergency First Aid', icon: HeartHandshake },
    { to: '/emergency', label: 'Emergency SOS Hub', icon: ShieldAlert, badge: 'SOS' },
    { to: '/blood-bank', label: 'Blood Banks & Donors', icon: Activity },
    { to: '/helplines', label: '24/7 Helplines', icon: PhoneCall },
    { to: '/profile', label: 'Patient Profile', icon: User },
  ];

  if (user?.role === 'doctor') {
    links.push({ to: '/doctor-portal', label: 'Doctor Clinical Desk', icon: BriefcaseMedical, badge: 'Doctor' });
  }

  if (user?.role === 'admin') {
    links.push({ to: '/admin', label: 'Admin Management', icon: ShieldCheck, badge: 'Admin' });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden lg:flex shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Healthcare Navigation
        </div>

        <nav className="space-y-0.5">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-[#087f8c] font-semibold border-r-2 border-[#087f8c]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0 text-[#087f8c]" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    item.badge === 'SOS' 
                      ? 'bg-red-100 text-red-700' 
                      : item.badge === 'Admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Mini Summary */}
      {user && (
        <div className="pt-4 border-t border-slate-200 mt-4 px-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-100 text-[#087f8c] font-bold flex items-center justify-center text-sm">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">{user.full_name}</p>
              <p className="text-[11px] text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
