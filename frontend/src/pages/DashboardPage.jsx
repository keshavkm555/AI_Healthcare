import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  User,
  Heart,
  Activity,
  AlertTriangle,
  Pill,
  TestTube,
  Scan,
  FileText,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  Circle,
  ChevronRight,
  PlusCircle,
  Building2
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingReminderId, setUpdatingReminderId] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients/dashboard');
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleReminder = async (reminderId) => {
    setUpdatingReminderId(reminderId);
    try {
      const res = await api.put(`/prescriptions/reminders/${reminderId}/toggle`);
      if (res.data.success) {
        // Refresh reminders
        fetchDashboard();
      }
    } catch (err) {
      console.error('Error toggling reminder:', err);
    } finally {
      setUpdatingReminderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#087f8c] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Loading your personalized health dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
        <h3 className="font-bold text-lg mb-1">Dashboard Error</h3>
        <p className="text-sm">{error}</p>
        <button onClick={fetchDashboard} className="btn-primary mt-4 text-xs">Retry</button>
      </div>
    );
  }

  const {
    profile = {},
    stats = {},
    upcomingAppointments = [],
    recentLabBookings = [],
    recentScanBookings = [],
    todayMedicineReminders = [],
    recentAssessments = [],
    latestVitals = null,
    followUpReminders = []
  } = dashboardData || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Welcome Bar & Emergency SOS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Welcome back, <span className="text-[#087f8c]">{user?.full_name || 'Patient'}</span>! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registered Email: {user?.email} • Health Profile Completion: {profile?.profile_completed_percentage || 25}%
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/book-appointment"
            className="btn-primary text-xs sm:text-sm py-2 px-4 shadow-xs flex-1 sm:flex-initial"
          >
            <Calendar className="w-4 h-4" />
            Book OPD Slot
          </Link>
          <Link
            to="/emergency"
            className="btn-danger text-xs sm:text-sm py-2 px-4 shadow-xs flex-1 sm:flex-initial"
          >
            <ShieldAlert className="w-4 h-4" />
            Emergency SOS
          </Link>
        </div>
      </div>

      {/* Patient Health Overview Cards & Completion Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Blood Group & BMI */}
        <div className="card-health bg-gradient-to-br from-teal-50 to-white border-teal-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Blood Group</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-200/60 font-bold text-teal-900">
              {profile?.blood_group || 'Not set'}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-800">{profile?.blood_group || '—'}</p>
            <p className="text-xs text-slate-500 mt-1">
              Age: {profile?.age ? `${profile.age} yrs` : '—'} • {profile?.gender || '—'}
            </p>
          </div>
        </div>

        {/* BMI & Weight */}
        <div className="card-health">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Body Mass Index</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
              {profile?.bmi_category || 'Normal'}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-800">{profile?.bmi ? `${profile.bmi} kg/m²` : '23.3'}</p>
            <p className="text-xs text-slate-500 mt-1">
              Height: {profile?.height_cm || 175} cm • Weight: {profile?.weight_kg || 71.5} kg
            </p>
          </div>
        </div>

        {/* Active Appointments */}
        <div className="card-health">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Visits</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-800">{upcomingAppointments.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              Total Recorded: {stats.total_appointments || 0}
            </p>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="card-health">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Status</span>
            <span className="text-xs font-bold text-[#087f8c]">{profile?.profile_completed_percentage || 25}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#087f8c] h-full rounded-full transition-all duration-500"
              style={{ width: `${profile?.profile_completed_percentage || 25}%` }}
            ></div>
          </div>
          <Link to="/profile" className="text-[11px] font-bold text-[#087f8c] hover:underline block mt-2">
            Update Medical Details →
          </Link>
        </div>
      </div>

      {/* Main Row: Upcoming Appointments & Today's Medicines Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upcoming Appointments Card */}
        <div className="card-health flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#087f8c]" />
                <h3 className="font-bold text-base text-slate-800">Upcoming Appointments</h3>
              </div>
              <Link to="/appointments" className="text-xs font-bold text-[#087f8c] hover:underline">
                View All ({upcomingAppointments.length})
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>No upcoming appointments booked.</p>
                <Link to="/book-appointment" className="btn-primary mt-3 text-xs py-1.5 px-3">
                  Schedule Now
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-teal-50/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{apt.doctor_name || 'Hospital Consultation'}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-teal-600" />
                          {apt.hospital_name}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                        {apt.appointment_type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-teal-900">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        {apt.appointment_date} at {apt.appointment_time}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{apt.booking_reference}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
            <Link to="/book-appointment" className="btn-primary text-xs py-2 px-3.5">
              + New Appointment
            </Link>
          </div>
        </div>

        {/* Today's Medicine Reminders & Tracker */}
        <div className="card-health flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#087f8c]" />
                <h3 className="font-bold text-base text-slate-800">Today's Medicine Schedule</h3>
              </div>
              <Link to="/prescriptions" className="text-xs font-bold text-[#087f8c] hover:underline">
                Manage Prescriptions
              </Link>
            </div>

            {todayMedicineReminders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                <Pill className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>No active medicine reminders scheduled for today.</p>
                <Link to="/prescriptions" className="btn-secondary mt-3 text-xs py-1.5 px-3">
                  + Add Medicine Reminder
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {todayMedicineReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      reminder.is_taken
                        ? 'bg-teal-50/60 border-teal-200 text-teal-900 line-through opacity-80'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={updatingReminderId === reminder.id}
                        onClick={() => handleToggleReminder(reminder.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                          reminder.is_taken
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'border-slate-300 hover:border-teal-600 text-transparent'
                        }`}
                        title={reminder.is_taken ? 'Mark as pending' : 'Mark as taken'}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>

                      <div>
                        <p className="font-bold text-sm">{reminder.medicine_name}</p>
                        <p className="text-xs text-slate-500">
                          {reminder.dosage} • {reminder.day_phase} ({reminder.reminder_time})
                        </p>
                      </div>
                    </div>

                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      reminder.is_taken ? 'bg-teal-200/70 text-teal-900' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {reminder.is_taken ? 'Taken' : 'Due'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Daily compliance tracker</span>
            <Link to="/prescriptions" className="text-[#087f8c] font-bold hover:underline">
              Add Personal Reminder →
            </Link>
          </div>
        </div>

      </div>

      {/* Secondary Row: Recent Lab/Scan Bookings & Latest Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Lab & Scan Bookings */}
        <div className="card-health">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <TestTube className="w-4 h-4 text-purple-600" />
              Diagnostics & Scans
            </h4>
            <Link to="/lab-tests" className="text-xs text-[#087f8c] font-semibold">View Tests</Link>
          </div>

          {recentLabBookings.length === 0 && recentScanBookings.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No active test or scan bookings.</p>
          ) : (
            <div className="space-y-2.5">
              {recentLabBookings.map((b) => (
                <div key={b.id} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{b.test_name}</span>
                    <span className="text-purple-700 font-semibold">{b.status}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{b.booking_date} • {b.collection_type}</p>
                </div>
              ))}
              {recentScanBookings.map((s) => (
                <div key={s.id} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{s.scan_name}</span>
                    <span className="text-blue-700 font-semibold">{s.status}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{s.booking_date} • {s.hospital_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Vitals Card */}
        <div className="card-health">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              Latest Vital Signs
            </h4>
            <Link to="/vitals" className="text-xs text-[#087f8c] font-semibold">Log Vitals</Link>
          </div>

          {latestVitals ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase">Blood Pressure</span>
                <span className="text-slate-800 font-bold text-base">
                  {latestVitals.systolic_bp || '—'} / {latestVitals.diastolic_bp || '—'}
                </span>
                <span className="text-[10px] text-slate-400 block">mmHg</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase">Heart Rate</span>
                <span className="text-slate-800 font-bold text-base">
                  {latestVitals.heart_rate || '—'}
                </span>
                <span className="text-[10px] text-slate-400 block">BPM</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase">Oxygen (SpO2)</span>
                <span className="text-slate-800 font-bold text-base">
                  {latestVitals.spo2_percent ? `${latestVitals.spo2_percent}%` : '—'}
                </span>
                <span className="text-[10px] text-slate-400 block">Normal &gt; 95%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase">Blood Glucose</span>
                <span className="text-slate-800 font-bold text-base">
                  {latestVitals.blood_glucose_mg_dl || '—'}
                </span>
                <span className="text-[10px] text-slate-400 block">mg/dL</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No vital signs logged yet.</p>
          )}
        </div>

        {/* Known Allergies & Emergency Contact */}
        <div className="card-health">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Critical Medical Alerts
            </h4>
            <Link to="/profile" className="text-xs text-[#087f8c] font-semibold">Edit</Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-red-50/50 border border-red-100">
              <span className="text-red-700 font-bold block text-[10px] uppercase">Known Allergies</span>
              <p className="font-semibold text-slate-800 mt-0.5">{profile?.allergies || 'None reported'}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Existing Conditions</span>
              <p className="font-semibold text-slate-800 mt-0.5">{profile?.existing_conditions || 'None reported'}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Emergency Contact</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {profile?.emergency_contact_name ? `${profile.emergency_contact_name} (${profile.emergency_contact_phone})` : 'Not configured'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Access Grid to All Modules */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Healthcare Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Link to="/symptom-checker" className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-teal-500 hover:shadow-xs transition-all text-center group">
            <div className="w-8 h-8 mx-auto rounded-lg bg-teal-50 text-[#087f8c] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700 block">Symptom Checker</span>
          </Link>

          <Link to="/hospitals" className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-teal-500 hover:shadow-xs transition-all text-center group">
            <div className="w-8 h-8 mx-auto rounded-lg bg-teal-50 text-[#087f8c] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700 block">Hospital Locator</span>
          </Link>

          <Link to="/video-consult" className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-teal-500 hover:shadow-xs transition-all text-center group">
            <div className="w-8 h-8 mx-auto rounded-lg bg-teal-50 text-[#087f8c] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700 block">Teleconsultation</span>
          </Link>

          <Link to="/medical-records" className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-teal-500 hover:shadow-xs transition-all text-center group">
            <div className="w-8 h-8 mx-auto rounded-lg bg-teal-50 text-[#087f8c] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700 block">Health Records</span>
          </Link>

          <Link to="/blood-bank" className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-teal-500 hover:shadow-xs transition-all text-center group">
            <div className="w-8 h-8 mx-auto rounded-lg bg-teal-50 text-[#087f8c] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-xs font-bold text-slate-700 block">Blood Banks</span>
          </Link>

          <Link to="/emergency" className="p-3.5 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all text-center group">
            <div className="w-8 h-8 mx-auto rounded-lg bg-red-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-red-800 block">Emergency SOS</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
