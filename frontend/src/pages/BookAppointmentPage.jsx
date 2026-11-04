import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  Building2,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ArrowRight,
  ShieldCheck,
  Video
} from 'lucide-react';

const TIME_SLOTS = [
  '09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00',
  '14:00:00', '14:30:00', '15:00:00', '15:30:00', '16:00:00', '16:30:00'
];

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form selections
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(searchParams.get('hospitalId') || '');
  const [selectedDoctor, setSelectedDoctor] = useState(searchParams.get('doctorId') || '');
  const [appointmentType, setAppointmentType] = useState(
    searchParams.get('type') === 'Video' ? 'Video Teleconsultation' : 'OPD In-Person'
  );
  
  // Date default to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().slice(0, 10);

  const [appointmentDate, setAppointmentDate] = useState(defaultDateStr);
  const [appointmentTime, setAppointmentTime] = useState('10:00:00');
  const [reason, setReason] = useState('Routine clinical checkup and consultation');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Load hospitals on mount
  useEffect(() => {
    async function loadData() {
      try {
        const hRes = await api.get('/hospitals');
        if (hRes.data.success) {
          setHospitals(hRes.data.hospitals);
          if (!selectedHospital && hRes.data.hospitals.length > 0) {
            setSelectedHospital(hRes.data.hospitals[0].id.toString());
          }
        }
      } catch (err) {
        console.error('Error loading hospitals:', err);
      }
    }
    loadData();
  }, []);

  // Load doctors whenever selected hospital changes
  useEffect(() => {
    async function loadDoctors() {
      if (!selectedHospital) return;
      try {
        const dRes = await api.get('/doctors', { params: { hospitalId: selectedHospital } });
        if (dRes.data.success) {
          setDoctors(dRes.data.doctors);
        }
      } catch (err) {
        console.error('Error loading doctors for hospital:', err);
      }
    }
    loadDoctors();
  }, [selectedHospital]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=book-appointment');
      return;
    }

    if (!selectedHospital || !appointmentDate || !appointmentTime || !reason) {
      setError('Please fill in all required appointment fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/appointments', {
        hospital_id: parseInt(selectedHospital, 10),
        doctor_id: selectedDoctor ? parseInt(selectedDoctor, 10) : null,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        appointment_type: appointmentType,
        reason: reason.trim()
      });

      if (res.data.success) {
        setConfirmedBooking(res.data.booking);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment. Please check if slot is already booked.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#087f8c] text-xs font-bold uppercase tracking-wider mb-2">
          <Calendar className="w-3.5 h-3.5" />
          OPD & Telehealth Scheduling
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800">Book a Medical Appointment</h1>
        <p className="text-sm text-slate-500 mt-1">
          Select a hospital, verified doctor, and preferred time slot with immediate confirmation.
        </p>
      </div>

      {confirmedBooking ? (
        /* PRINTABLE BOOKING CONFIRMATION SLIP */
        <div className="card-health border-teal-300 p-8 space-y-6 animate-in zoom-in-95 duration-300 print:shadow-none print:border-none">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-[#087f8c] flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">Official Receipt</span>
                <h3 className="text-xl font-black text-slate-800">Appointment Confirmed!</h3>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="btn-secondary text-xs py-2 px-3 print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Slip
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-5 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-400 text-xs uppercase block font-semibold">Booking Reference</span>
              <span className="font-mono text-base font-extrabold text-teal-800">{confirmedBooking.booking_reference}</span>
            </div>

            <div>
              <span className="text-slate-400 text-xs uppercase block font-semibold">Consultation Mode</span>
              <span className="font-bold text-slate-800">{confirmedBooking.appointment_type}</span>
            </div>

            <div>
              <span className="text-slate-400 text-xs uppercase block font-semibold">Hospital Centre</span>
              <span className="font-bold text-slate-800">{confirmedBooking.hospital_name}</span>
            </div>

            <div>
              <span className="text-slate-400 text-xs uppercase block font-semibold">Doctor Assigned</span>
              <span className="font-bold text-slate-800">{confirmedBooking.doctor_name}</span>
            </div>

            <div>
              <span className="text-slate-400 text-xs uppercase block font-semibold">Appointment Date</span>
              <span className="font-bold text-slate-800">{confirmedBooking.appointment_date}</span>
            </div>

            <div>
              <span className="text-slate-400 text-xs uppercase block font-semibold">Scheduled Time Slot</span>
              <span className="font-bold text-slate-800">{confirmedBooking.appointment_time}</span>
            </div>
          </div>

          {confirmedBooking.meeting_link && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Video consultation room link generated.</span>
              </div>
              <Link to={confirmedBooking.meeting_link} className="btn-primary text-xs py-1.5 px-3">
                Join Room
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 print:hidden">
            <Link to="/appointments" className="btn-primary text-sm">
              View All My Appointments
            </Link>
            <button
              onClick={() => setConfirmedBooking(null)}
              className="text-sm font-semibold text-slate-600 hover:underline"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      ) : (
        /* BOOKING FORM */
        <div className="card-health border-teal-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Step 1: Hospital */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Hospital / Clinic Centre <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedHospital}
                onChange={(e) => {
                  setSelectedHospital(e.target.value);
                  setSelectedDoctor('');
                }}
                required
                className="input-health text-sm"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.hospital_name} — {h.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Consultation Type & Doctor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Consultation Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['OPD In-Person', 'Video Teleconsultation'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAppointmentType(type)}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                        appointmentType === type
                          ? 'bg-[#087f8c] text-white border-[#087f8c] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Select Doctor (Optional)
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="input-health text-sm"
                >
                  <option value="">Hospital Resident Physician (Any Available)</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty_name} - ₹{d.consultation_fee})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Date & Time Slot Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  4. Appointment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                  className="input-health text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  5. Time Slot <span className="text-red-500">*</span>
                </label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  required
                  className="input-health text-sm"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot.slice(0, 5)} {parseInt(slot.slice(0, 2), 10) >= 12 ? 'PM' : 'AM'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 4: Reason for Visit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                6. Reason for Appointment <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                placeholder="Briefly state symptoms, reason for consultation, or routine checkup..."
                required
                className="input-health text-sm"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Confirming Booking in Database...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm and Book Appointment
                </>
              )}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
