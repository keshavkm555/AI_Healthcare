import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  Building2,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Activity,
  HeartPulse,
  AlertTriangle,
  PhoneCall,
  Sparkles,
  ExternalLink,
  TestTube,
  Video,
  Scan,
  Package,
  Droplets,
  Pill,
  FileText,
  BedDouble,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  Brain,
  CalendarCheck,
  ShieldCheck,
  Info
} from 'lucide-react';

const services = [
  { to: '/book-appointment', title: 'OPD Booking', text: 'Book outpatient visits with conflict-free time slots.', icon: Calendar, color: 'from-teal-500 to-cyan-500' },
  { to: '/video-consult', title: 'Teleconsultation', text: 'Consult specialists securely from home.', icon: Video, color: 'from-blue-500 to-indigo-500' },
  { to: '/lab-tests', title: 'Diagnostic Labs', text: 'Blood tests with home sample collection.', icon: TestTube, color: 'from-violet-500 to-purple-500' },
  { to: '/scans', title: 'Scans & Imaging', text: 'MRI, CT, X-Ray and ultrasound bookings.', icon: Scan, color: 'from-sky-500 to-blue-500' },
  { to: '/health-packages', title: 'Health Packages', text: 'Preventive full-body checkup bundles.', icon: Package, color: 'from-amber-500 to-orange-500' },
  { to: '/prescriptions', title: 'Medicine Reminders', text: 'Never miss a dose with daily trackers.', icon: Pill, color: 'from-emerald-500 to-teal-500' },
  { to: '/blood-bank', title: 'Blood Banks', text: 'Find blood units and donors near you.', icon: Droplets, color: 'from-rose-500 to-pink-500' },
  { to: '/emergency', title: 'Emergency SOS', text: 'One-tap 108/112, GPS and trauma care.', icon: ShieldAlert, color: 'from-red-500 to-rose-600' },
];

const steps = [
  { icon: Brain, title: 'Describe symptoms', text: 'Tell our AI assistant how you feel in plain words.' },
  { icon: Stethoscope, title: 'Get an assessment', text: 'See possible conditions and self-care guidance instantly.' },
  { icon: CalendarCheck, title: 'Book the right care', text: 'Choose a verified doctor or hospital and book in a click.' },
];

const stats = [
  { value: '24/7', label: 'Emergency support' },
  { value: '15+', label: 'Healthcare services' },
  { value: '108 · 112', label: 'One-tap SOS dialing' },
  { value: 'Free', label: 'For every patient' },
];

export default function LandingPage() {
  const { user } = useAuth();

  // Interactive Symptom Checker on Landing Page
  const [symptomsInput, setSymptomsInput] = useState('');
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictResult, setPredictResult] = useState(null);
  const [predictError, setPredictError] = useState(null);

  // Hospital List preview
  const [hospitals, setHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [hospitalsLoaded, setHospitalsLoaded] = useState(false);

  const quickSymptoms = ['Fever', 'Headache', 'Cough', 'Fatigue', 'Sore throat', 'Body ache'];

  const addQuickSymptom = (s) => {
    const current = symptomsInput.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
    if (current.includes(s.toLowerCase())) return;
    setSymptomsInput(symptomsInput.trim() ? `${symptomsInput.trim().replace(/,$/, '')}, ${s.toLowerCase()}` : s.toLowerCase());
  };

  // Handle symptom check
  const handleCheckSymptoms = async (e) => {
    e.preventDefault();
    if (!symptomsInput.trim()) {
      setPredictError('Please enter your symptoms to explore conditions.');
      return;
    }

    setPredictLoading(true);
    setPredictError(null);
    setPredictResult(null);

    try {
      const res = await api.post('/symptoms/assess', {
        symptoms: symptomsInput.trim(),
        severity: 'Mild'
      });
      if (res.data.success) {
        setPredictResult(res.data.assessment);
      }
    } catch (err) {
      setPredictError(err.response?.data?.message || 'Unable to reach symptom prediction service. Please ensure the backend is running.');
    } finally {
      setPredictLoading(false);
    }
  };

  // Handle load hospitals
  const handleLoadHospitals = async () => {
    setHospitalsLoading(true);
    try {
      const res = await api.get('/hospitals');
      if (res.data.success) {
        setHospitals(res.data.hospitals);
        setHospitalsLoaded(true);
      }
    } catch (err) {
      console.error('Error loading hospitals:', err);
    } finally {
      setHospitalsLoading(false);
    }
  };

  return (
    <div className="space-y-24">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#04363d] via-[#087f8c] to-indigo-700 text-white px-6 py-12 sm:px-12 sm:py-16 lg:py-20 shadow-[0_40px_80px_-30px_rgba(8,127,140,0.55)]">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-cyan-300/20 blur-3xl animate-blob"></div>
        <div className="pointer-events-none absolute -bottom-40 -left-24 w-[30rem] h-[30rem] rounded-full bg-indigo-400/25 blur-3xl animate-blob delay-300"></div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
        ></div>

        <div className="relative grid lg:grid-cols-12 gap-12 items-center">
          {/* Copy */}
          <div className="lg:col-span-7 space-y-7 animate-fade-up">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Your AI-powered personal healthcare assistant
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08]">
              Smarter healthcare,
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-teal-100 to-amber-200">
                better living.
              </span>
            </h1>

            <p className="text-lg text-white/80 max-w-xl leading-relaxed">
              Check symptoms with AI, discover accredited hospitals, book verified doctors and keep every health record in one secure place.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#prediction"
                className="inline-flex items-center gap-2 bg-white text-[#087f8c] font-bold px-6 py-3.5 rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
              >
                <Stethoscope className="w-5 h-5" />
                Check Symptoms
              </a>
              <Link
                to="/book-appointment"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur font-bold px-6 py-3.5 rounded-xl transition-all"
              >
                <Calendar className="w-5 h-5" />
                Book Appointment
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-white/75">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Free to use</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Verified doctors</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Secure records</span>
            </div>
          </div>

          {/* Visual: floating health cards */}
          <div className="lg:col-span-5 relative hidden md:block">
            <div className="relative mx-auto max-w-sm animate-float">
              <div className="rounded-3xl bg-white/95 text-slate-800 p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">Health Score</p>
                      <p className="text-lg font-extrabold">Excellent</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">+12%</span>
                </div>

                {/* Mini heart-rate chart */}
                <svg viewBox="0 0 300 70" className="w-full h-16 mt-4" fill="none">
                  <defs>
                    <linearGradient id="hrFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0aa2b0" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0aa2b0" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 45 L40 45 L55 20 L70 60 L85 35 L120 40 L140 15 L155 55 L175 38 L210 42 L230 22 L245 50 L265 40 L300 40 L300 70 L0 70 Z" fill="url(#hrFill)" />
                  <path d="M0 45 L40 45 L55 20 L70 60 L85 35 L120 40 L140 15 L155 55 L175 38 L210 42 L230 22 L245 50 L265 40 L300 40" stroke="#087f8c" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                </svg>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  {[['72', 'BPM'], ['118/76', 'mmHg'], ['98%', 'SpO2']].map(([v, l]) => (
                    <div key={l} className="rounded-xl bg-slate-50 py-2">
                      <p className="text-sm font-extrabold">{v}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{l}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating appointment card */}
              <div className="absolute -left-10 -bottom-10 rounded-2xl bg-white text-slate-800 p-3.5 shadow-xl flex items-center gap-3 w-60">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Cardiology Consult</p>
                  <p className="text-[11px] text-slate-400">Tomorrow · 10:30 AM</p>
                </div>
              </div>

              {/* Floating AI badge */}
              <div className="absolute -right-6 -top-6 rounded-2xl bg-white text-slate-800 px-3.5 py-2.5 shadow-xl flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold">AI Assessment Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative mt-14 grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-5 py-4">
              <p className="text-2xl sm:text-3xl font-extrabold">{s.value}</p>
              <p className="text-xs text-white/70 font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo credentials note (kept for presentations) */}
      {!user && (
        <div className="-mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/70 shadow-soft text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Info className="w-4 h-4 text-[#087f8c] shrink-0" />
            <span className="font-bold text-slate-800">Demo login:</span>
            <code className="px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-xs">patient@healthai.com</code>
            <span>/</span>
            <code className="px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-xs">Patient@123</code>
          </div>
          <Link to="/login" className="btn-primary text-xs py-2 px-4">
            Log in now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ================= HOW IT WORKS ================= */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="section-eyebrow"><Sparkles className="w-3.5 h-3.5" /> How it works</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4">Care in three simple steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="card-health hover:-translate-y-1 group">
              <span className="absolute top-5 right-6 text-5xl font-extrabold text-slate-100 group-hover:text-teal-50 transition-colors select-none">
                0{i + 1}
              </span>
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#087f8c] to-[#0aa2b0] text-white flex items-center justify-center shadow-glow mb-5">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="relative font-bold text-lg text-slate-900">{title}</h3>
              <p className="relative text-sm text-slate-500 mt-1.5 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= AI SYMPTOM CHECKER ================= */}
      <section id="prediction" className="scroll-mt-24">
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2 space-y-5 lg:sticky lg:top-28">
            <span className="section-eyebrow"><Brain className="w-3.5 h-3.5" /> AI Disease Prediction</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Not feeling well? <span className="text-gradient">Ask our AI.</span>
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Describe your symptoms to receive an informational assessment with possible conditions and recommended next steps.
            </p>
            <ul className="space-y-3 text-sm">
              {['Understands everyday language', 'Flags emergency red-flag symptoms', 'Suggests the right specialist'].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-slate-700 font-medium">
                  <span className="w-6 h-6 rounded-full bg-teal-50 text-[#087f8c] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 card-health !p-0 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50/80 to-indigo-50/60">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#087f8c] to-indigo-500 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">HealthAI Symptom Assistant</p>
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                </p>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleCheckSymptoms} className="space-y-4">
                <div>
                  <label htmlFor="symptoms" className="block text-sm font-bold text-slate-700 mb-2">
                    What symptoms are you experiencing?
                  </label>
                  <textarea
                    id="symptoms"
                    value={symptomsInput}
                    onChange={(e) => setSymptomsInput(e.target.value)}
                    placeholder="Example: fever, persistent cough, headache, fatigue"
                    rows="4"
                    className="input-health resize-none"
                  ></textarea>
                </div>

                <div className="flex flex-wrap gap-2">
                  {quickSymptoms.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addQuickSymptom(s)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-[#087f8c] hover:bg-teal-50 transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <button type="submit" disabled={predictLoading} className="btn-primary w-full sm:w-auto py-3">
                    {predictLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analyzing symptoms...
                      </>
                    ) : (
                      <>
                        <Stethoscope className="w-4 h-4" />
                        Check Symptoms
                      </>
                    )}
                  </button>

                  <Link
                    to="/symptom-checker"
                    className="text-sm font-semibold text-[#087f8c] hover:underline flex items-center gap-1"
                  >
                    Full assessment questionnaire <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </form>

              {predictError && (
                <div className="mt-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2 animate-in">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{predictError}</p>
                </div>
              )}

              {predictResult && (
                <div className={`mt-6 p-5 rounded-2xl border text-sm space-y-4 animate-in ${
                  predictResult.emergency_alert
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-gradient-to-br from-teal-50/80 to-indigo-50/40 border-teal-200 text-slate-800'
                }`}>
                  {predictResult.emergency_alert && (
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-base border-b border-rose-200 pb-3">
                      <ShieldAlert className="w-5 h-5 text-rose-600 animate-bounce" />
                      <span>EMERGENCY ALERT: IMMEDIATE ACTION REQUIRED</span>
                    </div>
                  )}

                  <p className="font-medium leading-relaxed">{predictResult.summary}</p>

                  {predictResult.possible_conditions?.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-teal-200/60">
                      <p className="font-bold text-[11px] uppercase tracking-wider text-teal-800">Possible conditions (informational only)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {predictResult.possible_conditions.map((item, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
                            <p className="font-semibold text-slate-800">{item.name}</p>
                            <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                              {item.match_indicator}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {predictResult.self_care_advice?.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <p className="font-bold text-[11px] uppercase tracking-wider text-teal-800">Next steps & self-care</p>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {predictResult.self_care_advice.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-teal-200/60 text-xs">
                    <span className="text-slate-400 font-mono">Engine: {predictResult.ai_model_used}</span>
                    <Link to="/book-appointment" className="text-[#087f8c] font-bold hover:underline">
                      Book doctor consultation →
                    </Link>
                  </div>
                </div>
              )}

              <div className="mt-6 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-px text-amber-600" />
                <p className="leading-relaxed">
                  This tool does not provide a medical diagnosis. Consult a qualified healthcare professional. For life-threatening emergencies, call 108 or 112 immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <span className="section-eyebrow"><Activity className="w-3.5 h-3.5" /> Our services</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4">A complete healthcare ecosystem</h2>
            <p className="text-slate-500 mt-2">Everything you need for your health, from diagnosis to recovery, in one integrated platform.</p>
          </div>
          <Link to={user ? '/dashboard' : '/register'} className="btn-secondary shrink-0">
            {user ? 'Go to dashboard' : 'Get started free'} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map(({ to, title, text, icon: Icon, color }) => (
            <Link key={to} to={to} className="card-health group hover:-translate-y-1 hover:border-teal-200">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{title}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{text}</p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#087f8c] mt-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= HOSPITALS ================= */}
      <section id="hospitals" className="scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="section-eyebrow"><Building2 className="w-3.5 h-3.5" /> Hospital network</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4">Accredited hospitals near you</h2>
          <p className="text-slate-500 mt-2">View verified hospital details and live bed availability.</p>

          {!hospitalsLoaded && (
            <button onClick={handleLoadHospitals} disabled={hospitalsLoading} className="btn-primary mt-6 py-3 px-6">
              {hospitalsLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading hospitals...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  Show Hospitals
                </>
              )}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hospitals.map((hospital) => {
            const total = Number(hospital.total_beds) || 0;
            const available = Number(hospital.available_beds) || 0;
            const pct = total ? Math.round((available / total) * 100) : 0;
            return (
              <div key={hospital.id} className="card-health flex flex-col justify-between hover:-translate-y-1 animate-in">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#087f8c] flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-slate-900 leading-snug">{hospital.hospital_name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{hospital.city || hospital.address}</span>
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-lg shrink-0">
                      <Star className="w-3 h-3 fill-current" /> {hospital.rating}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2">{hospital.address}</p>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                        <BedDouble className="w-3.5 h-3.5 text-[#087f8c]" /> Beds available
                      </span>
                      <span className="font-bold text-slate-900">{available} / {total}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#087f8c] to-cyan-400" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <PhoneCall className="w-3.5 h-3.5" /> {hospital.phone || 'N/A'}
                      </span>
                      <span className={`flex items-center gap-1 font-bold ${hospital.emergency_available ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <Clock className="w-3.5 h-3.5" /> {hospital.emergency_available ? '24×7 ER' : 'No ER'}
                      </span>
                    </div>
                  </div>

                  {hospital.facilities && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      <span className="font-semibold text-slate-700">Facilities:</span> {hospital.facilities}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link to={`/book-appointment?hospitalId=${hospital.id}`} className="btn-primary text-xs py-2 px-3.5">
                    Book OPD Visit
                  </Link>
                  <Link to="/hospitals" className="text-xs font-semibold text-[#087f8c] hover:underline flex items-center gap-1">
                    View on map <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {hospitalsLoaded && hospitals.length === 0 && (
          <p className="text-center text-slate-500 py-8">No hospital records found.</p>
        )}
      </section>

      {/* ================= CTA ================= */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#0b1f29] text-white px-6 py-12 sm:px-12 sm:py-14">
        <div className="pointer-events-none absolute -top-24 right-10 w-80 h-80 rounded-full bg-teal-500/25 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-24 left-10 w-80 h-80 rounded-full bg-indigo-500/25 blur-3xl"></div>
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Take charge of your health <span className="text-teal-300">today.</span>
            </h2>
            <p className="text-slate-400 mt-3">
              Create a free account to book appointments, track vitals, manage prescriptions and store medical records securely.
            </p>
            <div className="flex items-center gap-4 mt-5 text-sm text-slate-300">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-teal-300" /> Private & secure</span>
              <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-teal-300" /> All records in one place</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={user ? '/dashboard' : '/register'} className="btn-primary py-3.5 px-6 text-base">
              {user ? 'Open Dashboard' : 'Create Free Account'} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/emergency" className="btn-danger py-3.5 px-6 text-base">
              <ShieldAlert className="w-5 h-5" /> Emergency SOS
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
