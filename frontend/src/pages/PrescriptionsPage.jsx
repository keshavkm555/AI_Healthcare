import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Pill,
  Clock,
  Printer,
  Calendar,
  CheckCircle2,
  PlusCircle,
  Building2,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [todayReminders, setTodayReminders] = useState([]);
  const [adherenceRate, setAdherenceRate] = useState(100);
  const [loading, setLoading] = useState(true);

  // New Personal Reminder Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [customMedName, setCustomMedName] = useState('');
  const [customDosage, setCustomDosage] = useState('');
  const [customTime, setCustomTime] = useState('08:00:00');
  const [customPhase, setCustomPhase] = useState('Morning');
  const [addLoading, setAddLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, rRes] = await Promise.all([
        api.get('/prescriptions/my-prescriptions'),
        api.get('/prescriptions/reminders/today')
      ]);

      if (pRes.data.success) setPrescriptions(pRes.data.prescriptions);
      if (rRes.data.success) {
        setTodayReminders(rRes.data.reminders);
        setAdherenceRate(rRes.data.adherenceRate);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleTaken = async (id) => {
    try {
      const res = await api.put(`/prescriptions/reminders/${id}/toggle`);
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Error toggling reminder:', err);
    }
  };

  const handleAddCustomReminder = async (e) => {
    e.preventDefault();
    if (!customMedName || !customDosage) return;
    setAddLoading(true);
    try {
      const res = await api.post('/prescriptions/reminders/custom', {
        medicine_name: customMedName,
        dosage: customDosage,
        reminder_time: customTime,
        day_phase: customPhase
      });
      if (res.data.success) {
        setShowAddModal(false);
        setCustomMedName('');
        setCustomDosage('');
        fetchData();
      }
    } catch (err) {
      console.error('Error adding reminder:', err);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Pill className="w-3.5 h-3.5" />
            Medication Management
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Prescriptions & Medicine Reminders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Doctor-issued clinical prescriptions, dosage timings, and daily pill adherence tracking.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs sm:text-sm py-2 px-4 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Add Medicine Reminder
        </button>
      </div>

      {/* TODAY'S MEDICINE SCHEDULE & ADHERENCE BANNER */}
      <div className="card-health p-6 bg-gradient-to-r from-teal-50/70 via-white to-teal-50/40 border-teal-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Today's Dose Compliance</h3>
            <p className="text-xs text-slate-500">Check off each medicine after taking your prescribed dosage.</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-teal-200">
            <span className="text-xs font-semibold text-slate-500">Adherence Rate:</span>
            <span className="text-base font-black text-teal-700">{adherenceRate}%</span>
          </div>
        </div>

        {todayReminders.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No medicine reminders scheduled for today.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayReminders.map((r) => (
              <div
                key={r.id}
                onClick={() => handleToggleTaken(r.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  r.is_taken
                    ? 'bg-teal-50/60 border-teal-300 text-teal-900 opacity-80'
                    : 'bg-white border-slate-200 hover:border-teal-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      r.is_taken
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'border-slate-300 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${r.is_taken ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                      {r.medicine_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {r.dosage} • {r.day_phase} ({r.reminder_time.slice(0, 5)})
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  r.is_taken ? 'bg-teal-200/70 text-teal-900' : 'bg-amber-100 text-amber-800'
                }`}>
                  {r.is_taken ? 'Taken' : 'Due'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DOCTOR-ISSUED PRESCRIPTIONS LIST */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Authorized Doctor Prescriptions</h2>

        {prescriptions.length === 0 ? (
          <div className="card-health text-center py-12 text-slate-400 text-sm">
            <Pill className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p>No physician prescriptions recorded in your medical history.</p>
          </div>
        ) : (
          prescriptions.map((p) => (
            <div key={p.id} className="card-health p-6 space-y-4 border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                      {p.source_type}
                    </span>
                    <span className="text-xs font-mono text-slate-400">RX-{p.id}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mt-1">{p.diagnosis}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    Issued by <strong>{p.doctor_name}</strong> • Valid until: {p.valid_until || 'Indefinite'}
                  </p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="btn-secondary text-xs py-2 px-3 print:hidden"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Prescription
                </button>
              </div>

              {/* Medicines Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-y border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Medicine Name</th>
                      <th className="py-2.5 px-3">Dosage</th>
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Timing</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {p.medicines?.map((med) => (
                      <tr key={med.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-800">{med.medicine_name}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{med.dosage}</td>
                        <td className="py-2.5 px-3 text-slate-600">{med.frequency}</td>
                        <td className="py-2.5 px-3 font-semibold text-teal-700">{med.timing}</td>
                        <td className="py-2.5 px-3 text-slate-500">{med.start_date} to {med.end_date}</td>
                        <td className="py-2.5 px-3 text-slate-500 italic">{med.instructions || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {p.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <strong>Doctor Advice:</strong> {p.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ADD CUSTOM MEDICINE REMINDER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">Patient Logged</span>
                <h3 className="text-lg font-bold text-slate-800">Add Personal Medicine Reminder</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddCustomReminder} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Medicine Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={customMedName}
                  onChange={(e) => setCustomMedName(e.target.value)}
                  placeholder="e.g. Vitamin C / Cetirizine"
                  required
                  className="input-health text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Dosage <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={customDosage}
                    onChange={(e) => setCustomDosage(e.target.value)}
                    placeholder="e.g. 500 mg"
                    required
                    className="input-health text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Time Phase</label>
                  <select
                    value={customPhase}
                    onChange={(e) => setCustomPhase(e.target.value)}
                    className="input-health text-xs"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Reminder Time</label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="input-health text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={addLoading} className="btn-primary">
                  {addLoading ? 'Saving...' : 'Add Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
