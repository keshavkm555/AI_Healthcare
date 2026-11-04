import React from 'react';
import { Activity, ShieldCheck, Stethoscope, CalendarCheck, HeartPulse } from 'lucide-react';

const highlights = [
  { icon: Stethoscope, title: 'AI symptom assessment', text: 'Instant, informational triage in seconds' },
  { icon: CalendarCheck, title: 'Book OPD & teleconsults', text: 'Verified hospitals and specialists' },
  { icon: ShieldCheck, title: 'Secure health records', text: 'Your data, encrypted and private' },
];

/**
 * Split-screen layout shared by the Login and Register pages.
 * Left: brand panel (hidden on small screens). Right: the form passed as children.
 */
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="max-w-5xl mx-auto my-4 sm:my-8">
      <div className="grid lg:grid-cols-2 rounded-[2rem] overflow-hidden bg-white border border-slate-200/70 shadow-[0_30px_80px_-30px_rgba(16,24,40,0.3)]">

        {/* Brand panel */}
        <div className="relative hidden lg:flex flex-col justify-between p-10 text-white bg-gradient-to-br from-[#065c66] via-[#087f8c] to-indigo-600 overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 animate-blob"></div>
          <div className="pointer-events-none absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-cyan-300/20 blur-2xl animate-blob delay-300"></div>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '22px 22px',
            }}
          ></div>

          <div className="relative flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
              <Activity className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold tracking-tight">HealthAI</span>
          </div>

          <div className="relative space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold leading-tight">
                Your health,<br />intelligently cared for.
              </h2>
              <p className="text-white/75 text-sm mt-3 max-w-sm leading-relaxed">
                One secure place for symptoms, appointments, prescriptions and medical records.
              </p>
            </div>

            <ul className="space-y-3">
              {highlights.map(({ icon: Icon, title: t, text }) => (
                <li key={t} className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
                  <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{t}</span>
                    <span className="block text-xs text-white/70">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-center gap-3 p-4 rounded-2xl bg-black/15 border border-white/10">
            <HeartPulse className="w-8 h-8 text-rose-200 shrink-0" />
            <div>
              <p className="text-sm font-bold">Privacy first</p>
              <p className="text-xs text-white/80 mt-0.5">Your health data stays protected with secure, token-based sign in.</p>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mb-7">
            <div className="lg:hidden w-11 h-11 rounded-xl bg-gradient-to-br from-[#087f8c] to-indigo-500 text-white flex items-center justify-center mb-4 shadow-glow">
              <Activity className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 mt-1.5">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
