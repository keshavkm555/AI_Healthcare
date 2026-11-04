import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BriefcaseMedical,
  Calendar,
  Clock,
  User,
  FilePlus,
  CheckCircle2,
  AlertCircle,
  Video,
  Pill,
  Save
} from 'lucide-react';

export default function DoctorPortalPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState(null);

  // Prescription Form state
  const [showRxModal, setShowRxModal] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [meds, setMeds] = useState([
    { medicine_name: '', dosage: '', frequency: 'Once daily', timing: 'After Food' }
  ]);
  const [rxLoading, setRxLoading] = useState(false);
  const [rxSuccess, setRxSuccess] = useState('');

  // Consultation notes update state
  const [consultStatus, setConsultStatus] = useState('Completed');
  const [consultNotes, setConsultNotes] = useState('');
  const [updatingNotes, setUpdatingNotes] = useState(false);

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctor-portal/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Error loading doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const handleAddMedRow = () => {
    setMeds([...meds, { medicine_name: '', dosage: '', frequency: 'Once daily', timing: 'After Food' }]);
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...meds];
    updated[index][field] = value;
    setMeds(updated);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApt || !diagnosis || !meds[0].medicine_name) return;

    setRxLoading(true);
    setRxSuccess('');

    try {
      const res = await api.post('/prescriptions', {
        user_id: selectedApt.user_id,
        hospital_id: selectedApt.hospital_id,
        diagnosis: diagnosis.trim(),
        notes: notes.trim(),
        medicines: meds.map(m => ({
          ...m,
          start_date: new Date().toISOString().slice(0, 10),
          end_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
        }))
      });

      if (res.data.success) {
        setRxSuccess('Prescription recorded and dispatched to patient EHR!');
        setTimeout(() => {
          setShowRxModal(false);
          setDiagnosis('');
          setNotes('');
          setRxSuccess('');
        }, 1500);
      }
    } catch (err) {
      console.error('Error creating prescription:', err);
    } finally {
      setRxLoading(false);
    }
  };

  const handleUpdateConsultation = async (e) => {
    e.preventDefault();
    if (!selectedApt) return;
    setUpdatingNotes(true);
    try {
      const res = await api.put(`/doctor-portal/appointments/${selectedApt.id}/consultation`, {
        status: consultStatus,
        consultation_notes: consultNotes
      });
      if (res.data.success) {
        alert('Consultation updated successfully!');
        fetchDoctorAppointments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed.');
    } finally {
      setUpdatingNotes(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
          <BriefcaseMedical className="w-3.5 h-3.5" />
          Physician Clinical Console
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800">Doctor Patient Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review daily consultation queues, examine medical history, and issue digital prescriptions.
        </p>
      </div>

      {/* Main Grid: Queue & Patient Medical Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Appointments Queue */}
        <div className="card-health p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-800">Assigned Patient Queue</h3>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              {appointments.length} Consultations
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No patients assigned currently.</p>
          ) : (
            <div className="space-y-2.5">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => {
                    setSelectedApt(apt);
                    setConsultNotes(apt.consultation_notes || '');
                    setConsultStatus(apt.status);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedApt?.id === apt.id
                      ? 'bg-teal-50/80 border-[#087f8c] shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="font-bold text-sm text-slate-800">{apt.patient_name}</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {apt.appointment_type.slice(0, 3)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5">{apt.appointment_date} at {apt.appointment_time}</p>
                  <p className="text-xs text-slate-700 font-medium truncate mt-1">Reason: {apt.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Selected Patient Details, Consultation Notes & Prescription Issue */}
        <div className="lg:col-span-2 space-y-6">
          {selectedApt ? (
            <div className="card-health p-6 space-y-6 border-teal-200">
              
              {/* Patient Top Summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono text-slate-400">{selectedApt.booking_reference}</span>
                  <h2 className="text-xl font-black text-slate-800">{selectedApt.patient_name}</h2>
                  <p className="text-xs text-slate-500">
                    Age: {selectedApt.age || '—'} • Blood Group: {selectedApt.blood_group || '—'} • Contact: {selectedApt.patient_phone || selectedApt.patient_email}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedApt.appointment_type === 'Video Teleconsultation' && (
                    <Link
                      to={`/video-consult?room=${selectedApt.booking_reference}`}
                      className="btn-primary text-xs py-2 px-3"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Enter Video Room
                    </Link>
                  )}

                  <button
                    onClick={() => setShowRxModal(true)}
                    className="btn-secondary text-xs py-2 px-3"
                  >
                    <FilePlus className="w-3.5 h-3.5 text-teal-600" />
                    Write Prescription
                  </button>
                </div>
              </div>

              {/* Patient Medical Alerts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-red-50/70 rounded-xl border border-red-200">
                  <strong className="text-red-800 uppercase block mb-1">Patient Drug Allergies:</strong>
                  <p className="text-slate-800">{selectedApt.allergies || 'None reported'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-700 uppercase block mb-1">Chronic Medical History:</strong>
                  <p className="text-slate-800">{selectedApt.existing_conditions || 'None reported'}</p>
                </div>
              </div>

              {/* Consultation Notes Form */}
              <form onSubmit={handleUpdateConsultation} className="space-y-4 pt-2 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Consultation Status</label>
                  <select
                    value={consultStatus}
                    onChange={(e) => setConsultStatus(e.target.value)}
                    className="input-health text-xs"
                  >
                    <option value="Confirmed">Confirmed (In Progress)</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Physician Clinical Notes</label>
                  <textarea
                    value={consultNotes}
                    onChange={(e) => setConsultNotes(e.target.value)}
                    rows="3"
                    placeholder="Enter clinical examination notes, prognosis, and patient recommendations..."
                    className="input-health text-xs"
                  ></textarea>
                </div>

                <button type="submit" disabled={updatingNotes} className="btn-primary text-xs py-2 px-4">
                  <Save className="w-3.5 h-3.5" />
                  {updatingNotes ? 'Saving Notes...' : 'Save Consultation Notes'}
                </button>
              </form>

            </div>
          ) : (
            <div className="card-health text-center py-16 text-slate-400 text-sm">
              <BriefcaseMedical className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>Select a patient from the queue to review medical details and update consultation notes.</p>
            </div>
          )}
        </div>

      </div>

      {/* ISSUE DIGITAL PRESCRIPTION MODAL */}
      {showRxModal && selectedApt && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">Official Clinical Rx</span>
                <h3 className="text-xl font-bold text-slate-800">Issue Prescription for {selectedApt.patient_name}</h3>
              </div>
              <button onClick={() => setShowRxModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {rxSuccess ? (
              <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-center text-sm font-bold">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-teal-600" />
                {rxSuccess}
              </div>
            ) : (
              <form onSubmit={handlePrescriptionSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Clinical Diagnosis <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Acute Pharyngitis / Allergic Rhinitis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                    className="input-health text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 uppercase">Prescribed Medicines</label>
                    <button type="button" onClick={handleAddMedRow} className="text-teal-700 font-bold hover:underline">
                      + Add Medicine
                    </button>
                  </div>

                  {meds.map((med, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Medicine name (e.g. Paracetamol)"
                          value={med.medicine_name}
                          onChange={(e) => handleMedChange(idx, 'medicine_name', e.target.value)}
                          required
                          className="input-health text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Dosage (e.g. 500 mg)"
                          value={med.dosage}
                          onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                          required
                          className="input-health text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={med.frequency}
                          onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                          className="input-health text-xs"
                        >
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily (Morning & Night)</option>
                          <option value="Thrice daily">Thrice daily</option>
                          <option value="As needed (SOS)">As needed (SOS)</option>
                        </select>

                        <select
                          value={med.timing}
                          onChange={(e) => handleMedChange(idx, 'timing', e.target.value)}
                          className="input-health text-xs"
                        >
                          <option value="After Food">After Food</option>
                          <option value="Before Food">Before Food</option>
                          <option value="With Food">With Food</option>
                          <option value="Anytime">Anytime</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Doctor Advice &amp; Lifestyle Instructions</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                    placeholder="e.g. Plenty of oral hydration, steam inhalation, avoid cold food..."
                    className="input-health text-xs"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setShowRxModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={rxLoading} className="btn-primary">
                    {rxLoading ? 'Recording Prescription...' : 'Issue Prescription'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
