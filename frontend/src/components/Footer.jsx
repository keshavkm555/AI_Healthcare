import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldAlert, Phone, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#203743] text-slate-300 mt-16 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide">HealthAI</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-Driven Healthcare Assistant platform empowering patients with intelligent clinical triage, hospital discovery, OPD appointment scheduling, and electronic records management.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Patient Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/symptom-checker" className="hover:text-teal-400 transition-colors">AI Disease Prediction</Link></li>
              <li><Link to="/book-appointment" className="hover:text-teal-400 transition-colors">Book OPD Appointment</Link></li>
              <li><Link to="/hospitals" className="hover:text-teal-400 transition-colors">Hospital Locator & Beds</Link></li>
              <li><Link to="/doctors" className="hover:text-teal-400 transition-colors">Specialist Directory</Link></li>
              <li><Link to="/video-consult" className="hover:text-teal-400 transition-colors">Video Teleconsultation</Link></li>
            </ul>
          </div>

          {/* Diagnostics */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Diagnostics & Wellness</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/lab-tests" className="hover:text-teal-400 transition-colors">Lab Tests at Home</Link></li>
              <li><Link to="/scans" className="hover:text-teal-400 transition-colors">Imaging & Scans</Link></li>
              <li><Link to="/health-packages" className="hover:text-teal-400 transition-colors">Preventive Checkup Packages</Link></li>
              <li><Link to="/blood-bank" className="hover:text-teal-400 transition-colors">Blood Banks & Donors</Link></li>
              <li><Link to="/first-aid" className="hover:text-teal-400 transition-colors">Emergency First Aid Guides</Link></li>
            </ul>
          </div>

          {/* Emergency Box */}
          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
              <ShieldAlert className="w-5 h-5" />
              <span>Emergency Disclaimer</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              This application provides clinical decision guidance and does not replace emergency 911/108 services. For acute crises, dial emergency services immediately.
            </p>
            <Link
              to="/emergency"
              className="inline-flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Open Emergency SOS Hub
            </Link>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="pt-8 mt-8 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 HealthAI | AI-Driven Healthcare Assistant. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for safer, smarter healthcare access
          </p>
        </div>
      </div>
    </footer>
  );
}
