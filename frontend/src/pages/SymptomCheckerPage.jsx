import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  MessageSquare,
  ClipboardList,
  AlertTriangle,
  ShieldAlert,
  Printer,
  BookmarkPlus,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  User,
  Clock,
  Sparkles,
  PhoneCall,
  Calendar
} from 'lucide-react';

export default function SymptomCheckerPage() {
  const { user } = useAuth();

  // Mode: 'chat' (Conversational natural language) or 'form' (Structured clinical step-by-step form)
  const [activeTab, setActiveTab] = useState('form');

  // Form Fields
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('A few days (2-4 days)');
  const [severity, setSeverity] = useState('Mild');
  const [age, setAge] = useState(user?.profile?.age || 30);
  const [medicalHistory, setMedicalHistory] = useState(user?.profile?.existing_conditions || '');
  const [allergies, setAllergies] = useState(user?.profile?.allergies || '');

  // Conversational Chat Messages
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am HealthAI's Clinical Assessment Assistant. You can describe what symptoms you are feeling in your own words, and I'll analyze possible conditions, self-care suggestions, and recommended specialists."
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Assessment Output State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Submit Structured Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Please specify at least one symptom you are experiencing.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setSavedSuccess(false);

    try {
      const res = await api.post('/symptoms/assess', {
        symptoms: symptoms.trim(),
        duration,
        severity,
        age: parseInt(age, 10) || 30,
        medicalHistory,
        allergies,
        saveToRecords: Boolean(user)
      });

      if (res.data.success) {
        setResult(res.data.assessment);
        if (res.data.assessment.id) {
          setSavedSuccess(true);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing symptom assessment.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Chat Message
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setLoading(true);

    try {
      const res = await api.post('/symptoms/assess', {
        symptoms: userText,
        duration: 'Recent onset',
        severity: 'Moderate',
        age: user?.profile?.age || 30,
        medicalHistory: user?.profile?.existing_conditions || '',
        allergies: user?.profile?.allergies || ''
      });

      if (res.data.success) {
        const assessment = res.data.assessment;
        setResult(assessment);
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: assessment.summary,
            assessment: assessment
          }
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I apologize, but I could not connect to the clinical service right now. Please try again or check the backend terminal.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Save assessment explicitly
  const handleSaveAssessment = async () => {
    if (!result) return;
    try {
      const res = await api.post('/symptoms/save', {
        symptoms: symptoms || chatMessages[chatMessages.length - 2]?.text || 'User Symptoms',
        duration,
        severity,
        age,
        medical_history: medicalHistory,
        allergies,
        possible_conditions: result.possible_conditions,
        recommended_specialist: result.recommended_specialist,
        self_care_advice: result.self_care_advice,
        emergency_alert: result.emergency_alert,
        ai_model_used: result.ai_model_used
      });
      if (res.data.success) {
        setSavedSuccess(true);
      }
    } catch (err) {
      console.error('Save assessment error:', err);
    }
  };

  // Print Report
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#087f8c] text-xs font-bold uppercase tracking-wider mb-2">
          <Stethoscope className="w-3.5 h-3.5" />
          Clinical Assessment Engine
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">AI Health Assistant & Symptom Checker</h1>
        <p className="text-sm text-slate-500 mt-2">
          Describe what you are feeling to explore matching clinical profiles, doctor specialties, and safe self-care instructions.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'form'
                ? 'bg-white text-[#087f8c] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Step-by-Step Clinical Form
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-white text-[#087f8c] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Conversational Health Chat
          </button>
        </div>
      </div>

      {/* TAB 1: STEP-BY-STEP CLINICAL FORM */}
      {activeTab === 'form' && (
        <div className="card-health border-teal-100">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Primary Symptoms */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                1. What symptoms are you experiencing? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows="4"
                placeholder="Example: I have had a high fever for two days, along with a throbbing headache, throat tickle, and muscle fatigue."
                required
                className="input-health text-slate-800"
              ></textarea>
              <p className="text-xs text-slate-400 mt-1">
                Be as specific as possible (e.g. location of pain, intensity, triggers).
              </p>
            </div>

            {/* Duration and Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Symptom Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input-health text-sm"
                >
                  <option value="Started today (Less than 24 hours)">Started today (Less than 24 hours)</option>
                  <option value="A few days (2-4 days)">A few days (2-4 days)</option>
                  <option value="About a week (5-7 days)">About a week (5-7 days)</option>
                  <option value="Two weeks or more">Two weeks or more</option>
                  <option value="Chronic / Recurring for months">Chronic / Recurring for months</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Perceived Severity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Mild', 'Moderate', 'Severe'].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        severity === sev
                          ? sev === 'Severe'
                            ? 'bg-red-500 text-white border-red-500 shadow-xs'
                            : 'bg-[#087f8c] text-white border-[#087f8c] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Age, Medical History, Allergies */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Patient Age
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input-health text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Known Allergies (Optional)
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts"
                  className="input-health text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Chronic History (Optional)
                </label>
                <input
                  type="text"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="e.g. Asthma, Hypertension"
                  className="input-health text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing symptoms against clinical engine...
                </>
              ) : (
                <>
                  <Stethoscope className="w-5 h-5" />
                  Run Clinical Symptom Assessment
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: CONVERSATIONAL CHAT */}
      {activeTab === 'chat' && (
        <div className="card-health p-0 overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-sm font-bold text-slate-800">
            <Sparkles className="w-4 h-4 text-[#087f8c]" />
            Natural Language Health Chatbot
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#087f8c] text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-4 rounded-2xl text-sm text-slate-500 flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#087f8c] rounded-full animate-ping"></div>
                  Evaluating reported symptoms...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Describe what you feel (e.g. sharp headache, nausea, mild fever)..."
              className="input-health text-sm flex-1"
            />
            <button
              type="submit"
              disabled={loading || !chatInput.trim()}
              className="btn-primary px-5 text-sm"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* ASSESSMENT RESULTS PANEL */}
      {result && (
        <div className="card-health border-teal-200 shadow-md space-y-6 print:border-none print:shadow-none animate-in fade-in-50 duration-300">
          
          {/* Print & Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">Clinical Report</span>
              <h3 className="text-xl font-extrabold text-slate-800">Health Assessment Evaluation</h3>
              <span className="text-xs text-slate-400 font-mono">Engine: {result.ai_model_used}</span>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={handlePrintReport}
                className="btn-secondary text-xs py-2 px-3"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>

              {user && (
                <button
                  type="button"
                  onClick={handleSaveAssessment}
                  disabled={savedSuccess}
                  className={`text-xs py-2 px-3 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                    savedSuccess
                      ? 'bg-teal-100 text-teal-800 cursor-default'
                      : 'btn-primary'
                  }`}
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  {savedSuccess ? 'Saved to Records' : 'Save to Records'}
                </button>
              )}
            </div>
          </div>

          {/* CRITICAL EMERGENCY BANNER (If Red Flag Detected) */}
          {result.emergency_alert && (
            <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-400 text-red-900 space-y-3">
              <div className="flex items-center gap-2 text-red-700 font-extrabold text-lg">
                <ShieldAlert className="w-6 h-6 text-red-600 animate-bounce" />
                <span>{result.emergency_title || 'CRITICAL EMERGENCY DETECTED'}</span>
              </div>
              <p className="font-semibold text-sm leading-relaxed">
                {result.summary}
              </p>
              
              <div className="pt-2 border-t border-red-200 flex flex-wrap items-center gap-4">
                <a
                  href="tel:108"
                  className="btn-danger inline-flex items-center gap-2 py-2.5 px-4 text-sm"
                >
                  <PhoneCall className="w-4 h-4" />
                  Call Ambulance (108)
                </a>
                <a
                  href="tel:112"
                  className="btn-secondary inline-flex items-center gap-2 py-2.5 px-4 text-sm border-red-300 text-red-800 hover:bg-red-100"
                >
                  <PhoneCall className="w-4 h-4" />
                  Call National Emergency (112)
                </a>
                <Link
                  to="/emergency"
                  className="text-xs font-bold text-red-800 underline ml-auto"
                >
                  Open Emergency SOS Hub →
                </Link>
              </div>
            </div>
          )}

          {/* Assessment Summary */}
          {!result.emergency_alert && (
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-slate-800">
              <p className="text-sm font-medium leading-relaxed">{result.summary}</p>
            </div>
          )}

          {/* Matched Conditions Grid */}
          {result.possible_conditions?.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                Matching Clinical Conditions (Educational & Informational Only):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.possible_conditions.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900 text-base">{item.name}</p>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 shrink-0">
                        {item.match_indicator}
                      </span>
                    </div>

                    {item.matched_symptoms?.length > 0 && (
                      <p className="text-xs text-slate-500">
                        <strong>Matching symptoms:</strong> {item.matched_symptoms.join(', ')}
                      </p>
                    )}

                    <p className="text-xs text-slate-600">
                      <strong>Recommended Doctor:</strong> {item.recommended_specialist}
                    </p>

                    {item.next_steps && (
                      <p className="text-xs text-teal-800 bg-teal-50 p-2 rounded-lg font-medium">
                        {item.next_steps}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Doctor Specialty & Booking Button */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase block">Specialist Recommendation</span>
              <p className="text-lg font-extrabold text-[#087f8c]">{result.recommended_specialist}</p>
              <p className="text-xs text-slate-500">Qualified physicians available for OPD and Video Consultations</p>
            </div>
            <Link
              to="/book-appointment"
              className="btn-primary text-xs py-2 px-4 shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              Book Consultation Now
            </Link>
          </div>

          {/* Self-Care Advice */}
          {result.self_care_advice?.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                Recommended Self-Care & Supportive Measures:
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200">
                {result.self_care_advice.map((item, index) => (
                  <li key={index} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* MANDATORY MEDICAL DISCLAIMER */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Medical Safety & Ethical Disclaimer:</span>
            </div>
            <p className="leading-relaxed">
              {result.disclaimer}
            </p>
            <p className="text-[11px] text-amber-800">
              • AI matching is algorithmic and NOT a clinically confirmed diagnosis.<br />
              • No antibiotics or prescription medications are automatically dispensed without doctor review.<br />
              • In case of chest tightness, breathlessness, or neurological changes, call emergency services (108 / 112) without delay.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
