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
  LineChart,
  HeartHandshake,
  ShieldAlert,
  PhoneCall,
  User,
  ShieldCheck,
  BriefcaseMedical,
  Droplets,
  Sparkles
} from 'lucide-react';

const sections = [
  {
    title: 'Overview',
    links: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/symptom-checker', label: 'AI Symptom Checker', icon: Stethoscope, badge: 'AI' },
    ],
  },
  {
    title: 'Care',
    links: [
      { to: '/book-appointment', label: 'Book OPD Slot', icon: CalendarPlus },
      { to: '/appointments', label: 'My Appointments', icon: CalendarCheck },
      { to: '/hospitals', label: 'Hospitals & Map', icon: Building2 },
      { to: '/doctors', label: 'Doctor Directory', icon: UserCheck },
      { to: '/video-consult', label: 'Video Teleconsult', icon: Video },
    ],
  },
  {
    title: 'Diagnostics',
    links: [
      { to: '/lab-tests', label: 'Lab Tests', icon: TestTube },
      { to: '/scans', label: 'Scans & Imaging', icon: Scan },
      { to: '/health-packages', label: 'Health Packages', icon: Package },
    ],
  },
  {
    title: 'My Health',
    links: [
      { to: '/prescriptions', label: 'Medicines & Reminders', icon: Pill },
      { to: '/medical-records', label: 'Medical Records', icon: FileText },
      { to: '/vitals', label: 'Vitals & BMI', icon: LineChart },
      { to: '/profile', label: 'Health Profile', icon: User },
    ],
  },
  {
    title: 'Emergency',
    links: [
      { to: '/emergency', label: 'Emergency SOS Hub', icon: ShieldAlert, badge: 'SOS' },
      { to: '/first-aid', label: 'First Aid Guides', icon: HeartHandshake },
      { to: '/blood-bank', label: 'Blood Banks & Donors', icon: Droplets },
      { to: '/helplines', label: '24/7 Helplines', icon: PhoneCall },
    ],
  },
];

const badgeStyles = {
  SOS: 'bg-rose-100 text-rose-700',
  AI: 'bg-gradient-to-r from-teal-100 to-indigo-100 text-indigo-700',
  Admin: 'bg-purple-100 text-purple-700',
  Doctor: 'bg-blue-100 text-blue-700',
};

export default function Sidebar() {
  const { user } = useAuth();

  const navSections = [...sections];
  if (user?.role === 'doctor') {
    navSections.unshift({
      title: 'Clinical',
      links: [{ to: '/doctor-portal', label: 'Doctor Clinical Desk', icon: BriefcaseMedical, badge: 'Doctor' }],
    });
  }
  if (user?.role === 'admin') {
    navSections.unshift({
      title: 'Administration',
      links: [{ to: '/admin', label: 'Admin Management', icon: ShieldCheck, badge: 'Admin' }],
    });
  }

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col pt-6 pb-6 pl-4 pr-2">
      <div className="sticky top-[5.5rem] flex flex-col max-h-[calc(100vh-7rem)] rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-soft overflow-hidden">
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.links.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-[#087f8c] to-[#0aa2b0] text-white shadow-glow'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className="flex items-center gap-2.5 truncate">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#087f8c]'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-md ${
                                isActive ? 'bg-white/25 text-white' : badgeStyles[item.badge]
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Upgrade / help card */}
        <div className="p-3 border-t border-slate-100">
          <div className="relative overflow-hidden rounded-xl p-3.5 bg-gradient-to-br from-[#087f8c] via-[#0aa2b0] to-indigo-500 text-white">
            <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/15"></div>
            <Sparkles className="w-4 h-4 mb-1.5" />
            <p className="text-xs font-bold">Not feeling well?</p>
            <p className="text-[11px] text-white/80 mt-0.5 leading-snug">Get an instant AI symptom assessment.</p>
            <NavLink
              to="/symptom-checker"
              className="mt-2.5 inline-flex items-center justify-center w-full text-[11px] font-bold bg-white text-[#087f8c] rounded-lg py-1.5 hover:bg-teal-50 transition-colors"
            >
              Check Symptoms
            </NavLink>
          </div>
        </div>
      </div>
    </aside>
  );
}
