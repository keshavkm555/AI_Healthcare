import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Scan,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export default function ScansPage() {
  const { user } = useAuth();
  const [scans, setScans] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog');
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [selectedScan, setSelectedScan] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00:00');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setBookingDate(d.toISOString().slice(0, 10));

    async function loadData() {
      try {
        setLoading(true);
        const [sRes, hRes] = await Promise.all([
          api.get('/scans/services'),
          api.get('/hospitals')
        ]);
        if (sRes.data.success) setScans(sRes.data.services);
        if (hRes.data.success) {
          setHospitals(hRes.data.hospitals);
          if (hRes.data.hospitals.length > 0) {
            setSelectedHospital(hRes.data.hospitals[0].id.toString());
          }
        }
      } catch (err) {
        console.error('Error loading scans data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const fetchMyBookings = async () => {
    if (!user) return;
    try {
      const res = await api.get('/scans/my-bookings');
      if (res.data.success) setMyBookings(res.data.bookings);
    } catch (err) {
      console.error('Error loading scan bookings:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') fetchMyBookings();
  }, [activeTab]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login?redirect=scans';
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess(null);

    try {
      const res = await api.post('/scans/book', {
        scan_service_id: selectedScan.id,
        hospital_id: parseInt(selectedHospital, 10),
        booking_date: bookingDate,
        booking_time: bookingTime
      });

      if (res.data.success) {
        setBookingSuccess(res.data.booking);
        fetchMyBookings();
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book scan.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Scan className="w-3.5 h-3.5" />
            Radiology & Clinical Imaging
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Medical Scans & Imaging</h1>
          <p className="text-sm text-slate-500 mt-1">
            MRI, CT, Ultrasound, Digital X-Ray, DEXA, Endoscopy, and advanced cardiac diagnostics.
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'catalog' ? 'bg-white text-[#087f8c] shadow-2xs' : 'text-slate-600'
            }`}
          >
            Scan Services
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bookings' ? 'bg-white text-[#087f8c] shadow-2xs' : 'text-slate-600'
            }`}
          >
            My Scan Bookings ({myBookings.length})
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scans.map((scan) => (
            <div key={scan.id} className="card-health flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-slate-800 leading-snug">{scan.name}</h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 shrink-0">
                    {scan.modality}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">{scan.description}</p>

                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Duration</span>
                    <span className="font-bold text-slate-800">{scan.duration_minutes} Mins</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sample Price</span>
                    <span className="font-bold text-teal-700 text-sm">₹{scan.sample_price}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100/60 text-xs text-teal-900">
                  <strong className="block text-[10px] uppercase text-teal-800">Preparation:</strong>
                  {scan.preparation_instructions}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedScan(scan);
                    setBookingSuccess(null);
                    setBookingError('');
                  }}
                  className="btn-primary w-full text-xs py-2 justify-center"
                >
                  Book Imaging Scan
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* MY SCAN BOOKINGS */
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="card-health text-center py-12 text-slate-400 text-sm">
              <Scan className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p>No medical scan bookings on record.</p>
            </div>
          ) : (
            myBookings.map((sb) => (
              <div key={sb.id} className="card-health p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-700">{sb.booking_reference}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {sb.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{sb.scan_name} ({sb.modality})</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    {sb.hospital_name} • Scheduled: {sb.booking_date} at {sb.booking_time}
                  </p>
                  {sb.report_summary && (
                    <div className="p-3 mt-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                      <strong>Radiology Report Summary:</strong> {sb.report_summary}
                    </div>
                  )}
                </div>

                <div className="text-xs font-bold text-teal-700 bg-slate-50 px-3 py-1.5 rounded-lg">
                  Sample Price: ₹{sb.sample_price}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">Book Imaging</span>
                <h3 className="text-xl font-bold text-slate-800">{selectedScan.name}</h3>
                <p className="text-xs text-slate-500">Sample Price: ₹{selectedScan.sample_price}</p>
              </div>
              <button onClick={() => setSelectedScan(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            {bookingSuccess ? (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-sm space-y-3 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-teal-600" />
                <p className="font-bold">Scan Scheduled Successfully!</p>
                <p className="text-xs font-mono">Reference: {bookingSuccess.reference}</p>
                <p className="text-xs text-slate-600">Preparation: {bookingSuccess.preparation}</p>
                <button onClick={() => setSelectedScan(null)} className="btn-primary text-xs mt-2">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
                {bookingError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg">{bookingError}</div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Select Hospital Imaging Centre</label>
                  <select
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    required
                    className="input-health text-xs"
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.hospital_name} ({h.address})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                      className="input-health text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Preferred Time</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="input-health text-xs"
                    >
                      <option value="09:00:00">09:00 AM</option>
                      <option value="11:00:00">11:00 AM</option>
                      <option value="14:00:00">02:00 PM</option>
                      <option value="16:00:00">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-teal-50 rounded-lg text-teal-800">
                  <strong>Preparation:</strong> {selectedScan.preparation_instructions}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setSelectedScan(null)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={bookingLoading} className="btn-primary">
                    {bookingLoading ? 'Scheduling...' : 'Confirm Scan Booking'}
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
