import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  CheckCircle2,
  Calendar,
  Building2,
  Clock,
  Sparkles,
  Heart,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function HealthPackagesPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('08:00:00');
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
        const [pRes, hRes] = await Promise.all([
          api.get('/health-packages'),
          api.get('/hospitals')
        ]);
        if (pRes.data.success) setPackages(pRes.data.packages);
        if (hRes.data.success) {
          setHospitals(hRes.data.hospitals);
          if (hRes.data.hospitals.length > 0) {
            setSelectedHospital(hRes.data.hospitals[0].id.toString());
          }
        }
      } catch (err) {
        console.error('Error loading packages:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login?redirect=health-packages';
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess(null);

    try {
      const res = await api.post('/health-packages/book', {
        package_id: selectedPkg.id,
        hospital_id: parseInt(selectedHospital, 10),
        booking_date: bookingDate,
        booking_time: bookingTime
      });

      if (res.data.success) {
        setBookingSuccess(res.data.booking);
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book package.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Package className="w-3.5 h-3.5" />
          Preventive Healthcare
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800">Preventive Health Checkup Packages</h1>
        <p className="text-sm text-slate-500 mt-1">
          Comprehensive wellness screenings designed to detect health risks early and optimize vitality.
        </p>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="card-health flex flex-col justify-between border-slate-200">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-lg text-slate-800">{pkg.package_name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 shrink-0 uppercase">
                  Preventive
                </span>
              </div>

              <p className="text-xs font-semibold text-[#087f8c]">{pkg.tagline}</p>
              <p className="text-xs text-slate-500">{pkg.description}</p>

              {/* Price Tag */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Package Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-slate-800">₹{pkg.sample_price}</span>
                    {pkg.original_price && (
                      <span className="text-xs text-slate-400 line-through">₹{pkg.original_price}</span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">
                  Sample Fee
                </span>
              </div>

              {/* Included Tests */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Tests & Screenings Included:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                  {pkg.included_tests}
                </p>
              </div>

              <div className="text-xs text-teal-800 bg-teal-50/60 p-2.5 rounded-lg">
                <strong>Preparation:</strong> {pkg.preparation_instructions}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedPkg(pkg);
                  setBookingSuccess(null);
                  setBookingError('');
                }}
                className="btn-primary w-full text-xs py-2 justify-center"
              >
                Book Package
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedPkg && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Health Package Booking</span>
                <h3 className="text-xl font-bold text-slate-800">{selectedPkg.package_name}</h3>
                <p className="text-xs text-slate-500">Price: ₹{selectedPkg.sample_price}</p>
              </div>
              <button onClick={() => setSelectedPkg(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            {bookingSuccess ? (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-sm space-y-3 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-teal-600" />
                <p className="font-bold">Package Booked Successfully!</p>
                <p className="text-xs font-mono">Reference: {bookingSuccess.reference}</p>
                <p className="text-xs text-slate-600">Preparation: {bookingSuccess.preparation}</p>
                <button onClick={() => setSelectedPkg(null)} className="btn-primary text-xs mt-2">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
                {bookingError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg">{bookingError}</div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Select Hospital Centre</label>
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
                    <label className="block font-bold text-slate-700 uppercase mb-1">Arrival Time</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="input-health text-xs"
                    >
                      <option value="08:00:00">08:00 AM (Fasting)</option>
                      <option value="09:00:00">09:00 AM</option>
                      <option value="10:00:00">10:00 AM</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-teal-50 rounded-lg text-teal-800">
                  <strong>Preparation:</strong> {selectedPkg.preparation_instructions}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setSelectedPkg(null)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={bookingLoading} className="btn-primary">
                    {bookingLoading ? 'Booking...' : 'Confirm Package Booking'}
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
