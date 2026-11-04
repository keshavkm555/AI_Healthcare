import React, { useState, useEffect } from 'react';
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
  Heart,
  CheckCircle,
  AlertTriangle,
  PhoneCall,
  Clock,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  
  // Interactive Symptom Checker on Landing Page (Preserving original demo feature!)
  const [symptomsInput, setSymptomsInput] = useState('');
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictResult, setPredictResult] = useState(null);
  const [predictError, setPredictError] = useState(null);

  // Hospital List preview (Preserving original demo feature!)
  const [hospitals, setHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [hospitalsLoaded, setHospitalsLoaded] = useState(false);

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
    <div className="space-y-16">
      
      {/* Demo Credentials Quick-Notice Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-[#087f8c] text-white p-4 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Demo Credentials</span>
            <span className="font-medium">Patient: <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono">patient@healthai.com</code> / <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono">Patient@123</code></span>
          </div>
          <div className="flex items-center gap-4 text-teal-100">
            <span>Doctor: <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-white">doctor@healthai.com</code></span>
            <span>Admin: <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-white">admin@healthai.com</code></span>
            {!user && (
              <Link to="/login" className="bg-white text-[#087f8c] font-bold px-3 py-1 rounded-lg hover:bg-teal-50 transition-colors shadow-xs">
                Log In Now
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section (Preserving user original text and teal-and-white theme) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#dff7f5] via-[#eaf0ff] to-white p-8 sm:p-14 border border-teal-100/80 shadow-xs">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/70 border border-teal-200 text-[#087f8c] text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            YOUR PERSONAL HEALTHCARE ASSISTANT
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#243447] tracking-tight leading-[1.15]">
            Smarter Healthcare,<br />
            <span className="text-[#087f8c]">Better Living.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#617080] max-w-2xl leading-relaxed">
            Enter your symptoms to explore possible health conditions, discover accredited hospitals, and book verified OPD appointments seamlessly.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a href="#prediction" className="btn-primary py-3 px-6 text-base shadow-md">
              <Stethoscope className="w-5 h-5" />
              Check Symptoms
            </a>
            <Link to="/book-appointment" className="btn-secondary py-3 px-6 text-base">
              <Calendar className="w-5 h-5 text-[#087f8c]" />
              Book an Appointment
            </Link>
            <Link to="/emergency" className="btn-danger py-3 px-5 text-base">
              <ShieldAlert className="w-5 h-5" />
              Emergency SOS
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Interactive Symptom Checker Card (Preserving original Section ID: #prediction) */}
      <section id="prediction" className="scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">AI Disease Prediction</h2>
          <p className="text-slate-500 mt-2">
            Describe your symptoms to receive an informational assessment and clinical recommendations.
          </p>
        </div>

        <div className="card-health max-w-2xl mx-auto border-teal-100 shadow-md">
          <form onSubmit={handleCheckSymptoms} className="space-y-4">
            <div>
              <label htmlFor="symptoms" className="block text-sm font-bold text-slate-700 mb-2">
                Enter Your Symptoms
              </label>
              <textarea
                id="symptoms"
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder="Example: fever, persistent cough, headache, fatigue"
                rows="4"
                className="input-health text-slate-800 placeholder:text-slate-400"
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="submit"
                disabled={predictLoading}
                className="btn-primary w-full sm:w-auto"
              >
                {predictLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Checking symptoms...
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
                className="text-xs font-semibold text-[#087f8c] hover:underline flex items-center gap-1"
              >
                Open Full Assessment Questionnaire <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </form>

          {/* Validation / Error Message */}
          {predictError && (
            <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{predictError}</p>
            </div>
          )}

          {/* Assessment Result Box */}
          {predictResult && (
            <div className={`mt-6 p-5 rounded-xl border text-sm space-y-4 animate-in fade-in-50 duration-300 ${
              predictResult.emergency_alert
                ? 'bg-red-50 border-red-300 text-red-900'
                : 'bg-teal-50/70 border-teal-200 text-slate-800'
            }`}>
              {predictResult.emergency_alert && (
                <div className="flex items-center gap-2 text-red-700 font-bold text-base border-b border-red-200 pb-2">
                  <ShieldAlert className="w-5 h-5 text-red-600 animate-bounce" />
                  <span>EMERGENCY ALERT: IMMEDIATE ACTION REQUIRED</span>
                </div>
              )}

              <p className="font-medium leading-relaxed">{predictResult.summary}</p>

              {predictResult.possible_conditions?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-teal-200/60">
                  <p className="font-bold text-xs uppercase tracking-wider text-teal-800">Possible Conditions (Informational Only):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {predictResult.possible_conditions.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-teal-100 shadow-2xs">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                          {item.match_indicator}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {predictResult.self_care_advice?.length > 0 && (
                <div className="space-y-1 pt-2">
                  <p className="font-bold text-xs uppercase tracking-wider text-teal-800">Recommended Next Steps & Self-Care:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                    {predictResult.self_care_advice.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-teal-200/60 text-xs">
                <span className="text-slate-500 font-mono">Engine: {predictResult.ai_model_used}</span>
                <Link to="/book-appointment" className="text-[#087f8c] font-bold hover:underline">
                  Book Doctor Consultation →
                </Link>
              </div>
            </div>
          )}

          {/* Medical Safety Disclaimer (Preserving original demo warning) */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-2 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <p className="leading-relaxed">
              This tool does not provide a medical diagnosis. Consult a qualified healthcare professional. For life-threatening emergencies, call 108 or 112 immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Hospital Information Section (Preserving user Section ID: #hospitals) */}
      <section id="hospitals" className="scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hospital Information</h2>
          <p className="text-slate-500 mt-2">
            View verified hospital details and live bed availability in our MySQL database.
          </p>
          
          {!hospitalsLoaded && (
            <button
              onClick={handleLoadHospitals}
              disabled={hospitalsLoading}
              className="btn-primary mt-4"
            >
              {hospitalsLoading ? 'Loading Hospitals from Database...' : 'Load Hospitals'}
            </button>
          )}
        </div>

        {/* Hospital Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital) => (
            <div key={hospital.id} className="card-health flex flex-col justify-between border-slate-200">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-lg text-[#087f8c]">{hospital.hospital_name}</h3>
                  <span className="text-xs font-bold px-2 py-1 bg-teal-50 text-teal-800 rounded-md border border-teal-200/50">
                    ★ {hospital.rating}
                  </span>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2">{hospital.address}</p>

                <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                  {hospital.phone || 'Phone number not available'}
                </p>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Available Beds</span>
                    <span className="text-teal-700 font-bold text-sm">{hospital.available_beds}</span> / {hospital.total_beds}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Emergency 24x7</span>
                    <span className="text-emerald-700 font-bold">{hospital.emergency_available ? 'Active' : 'No'}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 line-clamp-2">
                  <strong className="text-slate-700">Facilities:</strong> {hospital.facilities}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/book-appointment?hospitalId=${hospital.id}`}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  Book OPD Visit
                </Link>
                <Link
                  to="/hospitals"
                  className="text-xs font-semibold text-[#087f8c] hover:underline flex items-center gap-1"
                >
                  View on Map <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {hospitalsLoaded && hospitals.length === 0 && (
          <p className="text-center text-slate-500 py-8">No hospital records found in database.</p>
        )}
      </section>

      {/* 8 Feature Modules Showcase */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-800">Comprehensive Healthcare Ecosystem</h2>
          <p className="text-slate-500 mt-2">All essential medical services in one integrated clinical platform.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/book-appointment" className="p-5 rounded-2xl bg-teal-50/50 hover:bg-teal-50 border border-teal-100 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">OPD Booking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Book outpatient appointments with doctor choice and conflict-free time slots.</p>
          </Link>

          <Link to="/video-consult" className="p-5 rounded-2xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Teleconsultation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Consult registered medical specialists securely from home with digital notes.</p>
          </Link>

          <Link to="/lab-tests" className="p-5 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Diagnostic Labs</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Book blood tests with convenient home collection or lab visit options.</p>
          </Link>

          <Link to="/emergency" className="p-5 rounded-2xl bg-red-50/50 hover:bg-red-50 border border-red-100 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Emergency SOS</h3>
            <p className="text-xs text-slate-500 leading-relaxed">One-touch emergency dialer (108/112), GPS location, and nearest trauma care.</p>
          </Link>
        </div>
      </section>

    </div>
  );
}
