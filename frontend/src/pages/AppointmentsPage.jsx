import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Calendar,
  Clock,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Video,
  Printer,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [rescheduleApt, setRescheduleApt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00:00');
  const [modalError, setModalError] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/my-appointments', {
        params: { status: filterStatus || undefined }
      });
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancellingId(id);
    try {
      const res = await api.put(`/appointments/${id}/cancel`);
      if (res.data.success) {
        fetchAppointments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleApt || !newDate || !newTime) return;
    setModalError('');
    try {
      const res = await api.put(`/appointments/${rescheduleApt.id}/reschedule`, {
        new_date: newDate,
        new_time: newTime
      });
      if (res.data.success) {
        setRescheduleApt(null);
        fetchAppointments();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Rescheduling failed.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">My Medical Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track upcoming consultations, review doctor notes, reschedule or cancel bookings.
          </p>
        </div>

        <Link to="/book-appointment" className="btn-primary text-sm py-2 px-4 shadow-xs">
          + Book New Appointment
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterStatus === st
                ? 'bg-teal-50 text-[#087f8c] border border-teal-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st === '' ? 'All Appointments' : st}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#087f8c] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card-health text-center py-12 text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="font-bold text-base text-slate-700">No appointments found</h3>
          <p className="text-xs text-slate-400 mt-1">You have no booked consultations under this filter.</p>
          <Link to="/book-appointment" className="btn-primary mt-4 text-xs py-2 px-4 inline-flex">
            Book an Appointment
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="card-health p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    apt.status === 'Confirmed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : apt.status === 'Completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {apt.status}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{apt.booking_reference}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/50">
                    {apt.appointment_type}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">
                    {apt.doctor_name || 'Hospital Duty Physician'}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    {apt.hospital_name} — {apt.hospital_address}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1 font-bold text-teal-900">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    {apt.appointment_date}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-teal-900">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    {apt.appointment_time}
                  </span>
                  <span><strong>Reason:</strong> {apt.reason}</span>
                </div>

                {apt.consultation_notes && (
                  <p className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 mt-2">
                    <strong>Doctor Notes:</strong> {apt.consultation_notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {apt.appointment_type === 'Video Teleconsultation' && apt.status === 'Confirmed' && (
                  <Link
                    to={`/video-consult?room=${apt.booking_reference}`}
                    className="btn-primary text-xs py-2 px-3 shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Call
                  </Link>
                )}

                {apt.status === 'Confirmed' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setRescheduleApt(apt);
                        setNewDate(apt.appointment_date);
                        setNewTime(apt.appointment_time);
                      }}
                      className="btn-secondary text-xs py-2 px-3"
                    >
                      Reschedule
                    </button>

                    <button
                      type="button"
                      disabled={cancellingId === apt.id}
                      onClick={() => handleCancel(apt.id)}
                      className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                    >
                      {cancellingId === apt.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Reschedule Appointment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select a new date and time slot for {rescheduleApt.doctor_name || 'your consultation'}.
            </p>

            {modalError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs mb-3">{modalError}</div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="input-health text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Time Slot
                </label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="input-health text-sm"
                >
                  <option value="09:00:00">09:00 AM</option>
                  <option value="10:00:00">10:00 AM</option>
                  <option value="11:30:00">11:30 AM</option>
                  <option value="14:00:00">02:00 PM</option>
                  <option value="15:30:00">03:30 PM</option>
                  <option value="16:30:00">04:30 PM</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRescheduleApt(null)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
