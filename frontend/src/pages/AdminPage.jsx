import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldCheck,
  Users,
  Building2,
  Calendar,
  Activity,
  UserCheck,
  CheckCircle2,
  XCircle,
  PlusCircle,
  FileText,
  Clock,
  Search
} from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'appointments', 'add-doctor'
  const [loading, setLoading] = useState(true);

  // New Doctor Form State
  const [docName, setDocName] = useState('');
  const [docHospital, setDocHospital] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docQual, setDocQual] = useState('');
  const [docExp, setDocExp] = useState(5);
  const [docFee, setDocFee] = useState(600);
  const [docDays, setDocDays] = useState('Mon,Tue,Wed,Thu,Fri');
  const [docBio, setDocBio] = useState('');
  const [docSuccess, setDocSuccess] = useState('');
  const [docError, setDocError] = useState('');

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentLogs(res.data.recentLogs);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/admin/appointments');
      if (res.data.success) setAppointments(res.data.appointments);
    } catch (err) {
      console.error('Error loading appointments:', err);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [hRes, sRes] = await Promise.all([
        api.get('/hospitals'),
        api.get('/doctors/specialties')
      ]);
      if (hRes.data.success) {
        setHospitals(hRes.data.hospitals);
        if (hRes.data.hospitals.length > 0) setDocHospital(hRes.data.hospitals[0].id.toString());
      }
      if (sRes.data.success) {
        setSpecialties(sRes.data.specialties);
        if (sRes.data.specialties.length > 0) setDocSpecialty(sRes.data.specialties[0].id.toString());
      }
    } catch (err) {
      console.error('Error loading dependencies:', err);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchDependencies();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'appointments') fetchAppointments();
  }, [activeTab]);

  const handleToggleUser = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-status`);
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user.');
    }
  };

  const handleUpdateAptStatus = async (aptId, status) => {
    try {
      const res = await api.put(`/admin/appointments/${aptId}/status`, { status });
      if (res.data.success) {
        fetchAppointments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status.');
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    if (!docName || !docHospital || !docSpecialty || !docQual) {
      setDocError('Please fill in doctor name, hospital, specialty, and qualifications.');
      return;
    }

    setDocError('');
    setDocSuccess('');

    try {
      const res = await api.post('/admin/doctors', {
        name: docName.trim(),
        hospital_id: parseInt(docHospital, 10),
        specialty_id: parseInt(docSpecialty, 10),
        qualification: docQual.trim(),
        experience_years: parseInt(docExp, 10) || 5,
        consultation_fee: parseFloat(docFee) || 500,
        available_days: docDays,
        bio: docBio.trim()
      });

      if (res.data.success) {
        setDocSuccess('Doctor created and added to clinical directory!');
        setDocName('');
        setDocQual('');
        setDocBio('');
      }
    } catch (err) {
      setDocError(err.response?.data?.message || 'Failed to add doctor.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            System Administration
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Administrative Control Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Role-based platform oversight, account permissions, doctor management, and system audit logs.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-white text-[#087f8c] shadow-2xs' : 'text-slate-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-white text-[#087f8c] shadow-2xs' : 'text-slate-600'
            }`}
          >
            Users ({users.length || stats?.totalUsers || 0})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'appointments' ? 'bg-white text-[#087f8c] shadow-2xs' : 'text-slate-600'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('add-doctor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'add-doctor' ? 'bg-white text-[#087f8c] shadow-2xs' : 'text-slate-600'
            }`}
          >
            + Add Doctor
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* STATS COUNTER CARDS */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="card-health p-5">
                <span className="text-slate-400 text-xs uppercase font-bold block mb-1">Registered Patients</span>
                <span className="text-2xl font-black text-slate-800">{stats.totalPatients}</span>
              </div>
              <div className="card-health p-5">
                <span className="text-slate-400 text-xs uppercase font-bold block mb-1">Clinical Doctors</span>
                <span className="text-2xl font-black text-[#087f8c]">{stats.totalDoctors}</span>
              </div>
              <div className="card-health p-5">
                <span className="text-slate-400 text-xs uppercase font-bold block mb-1">Hospital Centres</span>
                <span className="text-2xl font-black text-slate-800">{stats.totalHospitals}</span>
              </div>
              <div className="card-health p-5">
                <span className="text-slate-400 text-xs uppercase font-bold block mb-1">Total Appointments</span>
                <span className="text-2xl font-black text-emerald-700">{stats.totalAppointments}</span>
              </div>
              <div className="card-health p-5">
                <span className="text-slate-400 text-xs uppercase font-bold block mb-1">AI Assessments</span>
                <span className="text-2xl font-black text-purple-700">{stats.totalAssessments}</span>
              </div>
              <div className="card-health p-5">
                <span className="text-slate-400 text-xs uppercase font-bold block mb-1">Diagnostic Labs</span>
                <span className="text-2xl font-black text-blue-700">{stats.totalLabBookings}</span>
              </div>
              <div className="card-health p-5">
                <span className="text-slate-400 text-xs uppercase font-bold block mb-1">Medical Scans</span>
                <span className="text-2xl font-black text-slate-800">{stats.totalScanBookings}</span>
              </div>
              <div className="card-health p-5">
                <span className="text-slate-400 text-xs uppercase font-bold block mb-1">Emergency Events</span>
                <span className="text-2xl font-black text-red-600">{stats.totalEmergencyEvents}</span>
              </div>
            </div>
          )}

          {/* AUDIT LOGS TABLE */}
          <div className="card-health p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Clock className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-base text-slate-800">System Security Audit Logs</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-y border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Entity</th>
                    <th className="py-2.5 px-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{log.created_at.slice(0, 19)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{log.user_name || 'System / Guest'}</td>
                      <td className="py-2.5 px-3 font-bold text-purple-700">{log.action}</td>
                      <td className="py-2.5 px-3 text-slate-500">{log.entity_type} #{log.entity_id}</td>
                      <td className="py-2.5 px-3 text-slate-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="card-health p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-800">Registered Accounts Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono">{u.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{u.full_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{u.email}</td>
                    <td className="py-2.5 px-3 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'doctor' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{u.phone || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleToggleUser(u.id)}
                        className={`text-xs font-bold px-2.5 py-1 rounded border transition-colors ${
                          u.is_active
                            ? 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPOINTMENTS OVERSIGHT TAB */}
      {activeTab === 'appointments' && (
        <div className="card-health p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-800">Master Appointments Oversight</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Hospital</th>
                  <th className="py-2.5 px-3">Doctor</th>
                  <th className="py-2.5 px-3">Date &amp; Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{a.booking_reference}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{a.patient_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{a.hospital_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{a.doctor_name || 'Duty Doctor'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{a.appointment_date} {a.appointment_time}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : a.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={a.status}
                        onChange={(e) => handleUpdateAptStatus(a.id, e.target.value)}
                        className="input-health text-xs py-1"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Rescheduled">Rescheduled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD DOCTOR FORM TAB */}
      {activeTab === 'add-doctor' && (
        <div className="card-health p-6 sm:p-8 space-y-4 max-w-2xl">
          <h3 className="font-bold text-base text-slate-800">Add Clinical Doctor to Directory</h3>
          
          {docSuccess && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <p>{docSuccess}</p>
            </div>
          )}

          {docError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              <p>{docError}</p>
            </div>
          )}

          <form onSubmit={handleCreateDoctor} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Doctor Name (with prefix)</label>
              <input
                type="text"
                placeholder="Dr. Ramesh Gowda, MD"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
                className="input-health text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Hospital Affiliation</label>
                <select
                  value={docHospital}
                  onChange={(e) => setDocHospital(e.target.value)}
                  className="input-health text-xs"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>{h.hospital_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Specialty Field</label>
                <select
                  value={docSpecialty}
                  onChange={(e) => setDocSpecialty(e.target.value)}
                  className="input-health text-xs"
                >
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Medical Qualifications</label>
              <input
                type="text"
                placeholder="MBBS, MD (Medicine), DM (Cardiology)"
                value={docQual}
                onChange={(e) => setDocQual(e.target.value)}
                required
                className="input-health text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Experience (Yrs)</label>
                <input
                  type="number"
                  value={docExp}
                  onChange={(e) => setDocExp(e.target.value)}
                  className="input-health text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Consult Fee (₹)</label>
                <input
                  type="number"
                  value={docFee}
                  onChange={(e) => setDocFee(e.target.value)}
                  className="input-health text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Available Days</label>
                <input
                  type="text"
                  value={docDays}
                  onChange={(e) => setDocDays(e.target.value)}
                  placeholder="Mon,Tue,Wed,Thu,Fri"
                  className="input-health text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Doctor Bio</label>
              <textarea
                value={docBio}
                onChange={(e) => setDocBio(e.target.value)}
                rows="2"
                placeholder="Clinical background, achievements, and focused research..."
                className="input-health text-xs"
              ></textarea>
            </div>

            <button type="submit" className="btn-primary text-xs py-2 px-5">
              Add Doctor to MySQL
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
