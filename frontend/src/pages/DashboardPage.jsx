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
  Building2,
  Stethoscope,
  Droplet
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
      <div className="space-y-6">
        <div className="h-44 rounded-3xl bg-slate-200/70 animate-pulse"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/60 animate-pulse"></div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-slate-200/60 animate-pulse"></div>
          <div className="h-64 rounded-2xl bg-slate-200/60 animate-pulse"></div>
        </div>
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

  const completion = Math.min(100, Number(profile?.profile_completed_percentage) || 25);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#04363d] via-[#087f8c] to-indigo-600 text-white p-6 sm:p-8 shadow-[0_30px_60px_-30px_rgba(8,127,140,0.6)]">
        <div className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-cyan-300/20 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-indigo-400/25 blur-3xl"></div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }}
        ></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 border border-white/25 backdrop-blur flex items-center justify-center text-xl sm:text-2xl font-extrabold shrink-0">
              {(user?.full_name || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-white/70 font-semibold">{greeting} 👋</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                {user?.full_name || 'Patient'}
              </h1>
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                {user?.email} · {todayLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/book-appointment"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 bg-white text-[#087f8c] font-bold text-sm px-5 py-3 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </Link>
            <Link
              to="/emergency"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 bg-rose-500/90 hover:bg-rose-500 border border-rose-300/40 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              SOS
            </Link>
          </div>
        </div>

        {/* Profile completion */}
        <div className="relative mt-6 flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-white/80">Health profile completion</span>
              <span className="font-extrabold">{completion}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-200 to-emerald-200 transition-all duration-700"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
          </div>
          {completion < 100 && (
            <Link to="/profile" className="text-xs font-bold bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg transition-colors text-center">
              Complete profile →
            </Link>
          )}
        </div>
      </div>

      {/* Health Overview Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Blood Group',
            value: profile?.blood_group || '—',
            sub: `Age ${profile?.age ? `${profile.age} yrs` : '—'} · ${profile?.gender || '—'}`,
            icon: Droplet,
            tile: 'from-rose-500 to-pink-500',
          },
          {
            label: 'Body Mass Index',
            value: profile?.bmi || '—',
            sub: profile?.bmi_category || 'Not calculated',
            icon: Activity,
            tile: 'from-emerald-500 to-teal-500',
          },
          {
            label: 'Upcoming Visits',
            value: upcomingAppointments.length,
            sub: `${stats.total_appointments || 0} total appointments`,
            icon: Calendar,
            tile: 'from-[#087f8c] to-cyan-500',
          },
          {
            label: 'Prescriptions',
            value: stats.total_prescriptions || 0,
            sub: `${stats.total_records || 0} medical records`,
            icon: Pill,
            tile: 'from-indigo-500 to-violet-500',
          },
        ].map(({ label, value, sub, icon: Icon, tile }) => (
          <div key={label} className="card-health !p-5 hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <p className="text-xs font-bold text-slate-500">{label}</p>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tile} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{value}</p>
            <p className="text-xs text-slate-500 mt-1 truncate">{sub}</p>
          </div>
        ))}
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
