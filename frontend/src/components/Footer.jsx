import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldAlert, Phone, Mail, MapPin, Lock, Clock, BadgeCheck } from 'lucide-react';

const serviceLinks = [
  { to: '/symptom-checker', label: 'AI Disease Prediction' },
  { to: '/book-appointment', label: 'Book OPD Appointment' },
  { to: '/hospitals', label: 'Hospital Locator & Beds' },
  { to: '/doctors', label: 'Specialist Directory' },
  { to: '/video-consult', label: 'Video Teleconsultation' },
];

const wellnessLinks = [
  { to: '/lab-tests', label: 'Lab Tests at Home' },
  { to: '/scans', label: 'Imaging & Scans' },
  { to: '/health-packages', label: 'Preventive Checkups' },
  { to: '/blood-bank', label: 'Blood Banks & Donors' },
  { to: '/first-aid', label: 'First Aid Guides' },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 bg-[#0b1f29] text-slate-300 overflow-hidden">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-40 left-1/4 w-[32rem] h-[32rem] rounded-full bg-teal-500/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-40 right-0 w-[28rem] h-[28rem] rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* Trust strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">
          {[
            { icon: Lock, title: 'Secure & Private', text: 'Encrypted sessions with JWT authentication' },
            { icon: Clock, title: '24/7 Assistance', text: 'Emergency helplines and SOS anytime' },
            { icon: BadgeCheck, title: 'Verified Providers', text: 'Accredited hospitals and specialists' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-teal-400/10 text-teal-300 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="text-xs text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#087f8c] via-[#0aa2b0] to-indigo-500 text-white flex items-center justify-center">
                <Activity className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Health<span className="text-teal-300">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              AI-driven healthcare assistant empowering patients with intelligent triage, hospital discovery,
              OPD scheduling and electronic health records, all in one place.
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-teal-300" /> support@healthai.com</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-teal-300" /> Bengaluru, India</p>
            </div>
          </div>

          {/* Patient Services */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-white mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {serviceLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-slate-400 hover:text-teal-300 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Diagnostics */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-white mb-4">Diagnostics & Wellness</h4>
            <ul className="space-y-2.5 text-sm">
              {wellnessLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-slate-400 hover:text-teal-300 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Box */}
          <div className="md:col-span-3">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/15 to-red-500/5 border border-rose-400/20">
              <div className="flex items-center gap-2 text-rose-300 font-bold mb-2">
                <ShieldAlert className="w-5 h-5" />
                <span>In an emergency?</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                This app gives guidance only and does not replace emergency services. Dial
                <span className="text-white font-bold"> 108 </span>or<span className="text-white font-bold"> 112 </span>immediately.
              </p>
              <Link
                to="/emergency"
                className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-rose-600 to-red-500 hover:brightness-110 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                Open Emergency SOS Hub
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-6 mt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} HealthAI · AI-Driven Healthcare Assistant. All rights reserved.</p>
          <p>Built for safer, smarter healthcare access.</p>
        </div>
      </div>
    </footer>
  );
}
