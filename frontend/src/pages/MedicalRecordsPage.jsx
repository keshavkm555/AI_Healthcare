import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Printer,
  Calendar,
  Building2,
  Stethoscope,
  TestTube,
  Scan,
  Pill,
  User,
  ShieldCheck,
  Download,
  Filter
} from 'lucide-react';

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [healthSummary, setHealthSummary] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [summaryView, setSummaryView] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/medical-records', {
        params: { type: filterType || undefined }
      });
      if (res.data.success) {
        setRecords(res.data.records);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get('/medical-records/summary');
      if (res.data.success) {
        setHealthSummary(res.data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchSummary();
  }, [filterType]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            Electronic Health Records (EHR)
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Patient Medical History</h1>
          <p className="text-sm text-slate-500 mt-1">
            Consolidated timeline of clinical consults, authorized lab results, radiology scans, and prescriptions.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => setSummaryView(!summaryView)}
            className={`btn-secondary text-xs py-2 px-3.5 ${summaryView ? 'bg-teal-50 text-[#087f8c] border-teal-300' : ''}`}
          >
            {summaryView ? 'View Timeline' : 'View Full EHR Summary'}
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary text-xs py-2 px-3.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Health Report
          </button>
        </div>
      </div>

      {summaryView && healthSummary ? (
        /* COMPREHENSIVE PATIENT HEALTH SUMMARY SHEET (PRINT-READY) */
        <div className="card-health p-8 space-y-6 border-slate-300 shadow-md print:shadow-none print:border-none">
          <div className="flex items-start justify-between pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block">Confidential Clinical Record</span>
              <h2 className="text-2xl font-black text-slate-800 mt-1">HealthAI Patient EHR Summary</h2>
              <p className="text-xs text-slate-400">Generated: {new Date(healthSummary.reportGeneratedAt).toLocaleString()}</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-slate-800">HealthAI Clinical System</p>
              <p className="text-slate-500">Karnataka, India</p>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold block">Patient Name</span>
              <span className="font-bold text-slate-800 text-sm">{healthSummary.patient?.full_name}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold block">Blood Group</span>
              <span className="font-bold text-teal-800 text-sm">{healthSummary.profile?.blood_group || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold block">Age / Gender</span>
              <span className="font-bold text-slate-800">{healthSummary.profile?.age ? `${healthSummary.profile.age} yrs` : '—'} • {healthSummary.profile?.gender || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold block">BMI Category</span>
              <span className="font-bold text-slate-800">{healthSummary.profile?.bmi || '—'} ({healthSummary.profile?.bmi_category || 'Normal'})</span>
            </div>
          </div>

          {/* Allergies & Existing Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-red-50/60 rounded-xl border border-red-200">
              <strong className="text-red-800 uppercase block mb-1">Known Allergies:</strong>
              <p className="text-slate-800">{healthSummary.profile?.allergies || 'No allergies recorded'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-slate-700 uppercase block mb-1">Existing Conditions:</strong>
              <p className="text-slate-800">{healthSummary.profile?.existing_conditions || 'None recorded'}</p>
            </div>
          </div>

          {/* Prescriptions Section */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Active Prescriptions:</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
              {healthSummary.prescriptions?.map((p) => (
                <div key={p.id} className="p-3 bg-white">
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>{p.diagnosis} — Dr. {p.doctor_name}</span>
                    <span className="text-slate-400">{p.issued_date}</span>
                  </div>
                  <div className="text-slate-600 space-y-0.5">
                    {p.medicines?.map((m) => (
                      <p key={m.id}>• {m.medicine_name} ({m.dosage}) — {m.frequency}, {m.timing}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Appointments & Diagnostics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Recent Consultations:</h3>
              <div className="space-y-1.5 text-xs">
                {healthSummary.appointments?.slice(0, 4).map((a) => (
                  <div key={a.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="font-bold text-slate-800">{a.doctor_name || 'Hospital Duty Doctor'}</p>
                    <p className="text-slate-500 text-[11px]">{a.appointment_date} at {a.appointment_time} • {a.hospital_name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Recent Diagnostic Reports:</h3>
              <div className="space-y-1.5 text-xs">
                {healthSummary.labReports?.slice(0, 3).map((lb) => (
                  <div key={lb.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="font-bold text-slate-800">{lb.test_name}</p>
                    <p className="text-slate-500 text-[11px]">{lb.booking_date} • Status: {lb.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-4 border-t border-slate-200">
            End of Health Record Summary. Maintained securely in HealthAI database.
          </div>
        </div>
      ) : (
        /* TIMELINE VIEW */
        <div className="space-y-4">
          {/* Record Type Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {['', 'Health Assessment', 'Prescription', 'Lab Report', 'Imaging Scan', 'Clinical Note'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  filterType === t
                    ? 'bg-teal-50 text-[#087f8c] border border-teal-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t === '' ? 'All Timeline Entries' : t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#087f8c] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="card-health text-center py-12 text-slate-400 text-sm">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p>No medical records logged under this filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <div key={r.id} className="card-health p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        {r.record_type}
                      </span>
                      {r.reference_id && (
                        <span className="text-xs font-mono text-slate-400">{r.reference_id}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-slate-800">{r.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
                    <p className="text-[11px] text-slate-400 pt-1">
                      Facility: <strong>{r.doctor_or_facility || 'HealthAI Clinical'}</strong> • Date: {r.record_date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
