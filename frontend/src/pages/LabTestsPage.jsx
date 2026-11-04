import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  TestTube,
  Search,
  Clock,
  Home,
  Building,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function LabTestsPage() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'bookings'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [selectedTest, setSelectedTest] = useState(null);
  const [collectionType, setCollectionType] = useState('Home Sample Collection');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('08:00:00');
  const [patientAddress, setPatientAddress] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Default tomorrow's date
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setBookingDate(d.toISOString().slice(0, 10));
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lab-tests/tests', {
        params: { search: searchTerm || undefined }
      });
      if (res.data.success) {
        setTests(res.data.tests);
      }
    } catch (err) {
      console.error('Error fetching lab tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!user) return;
    try {
      const res = await api.get('/lab-tests/my-bookings');
      if (res.data.success) {
        setMyBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching lab bookings:', err);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchMyBookings();
    }
  }, [activeTab]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login?redirect=lab-tests';
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess(null);

    try {
      const res = await api.post('/lab-tests/book', {
        lab_test_id: selectedTest.id,
        collection_type: collectionType,
        booking_date: bookingDate,
        booking_time: bookingTime,
        patient_address: collectionType === 'Home Sample Collection' ? patientAddress : undefined
      });

      if (res.data.success) {
        setBookingSuccess(res.data.booking);
        fetchMyBookings();
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book lab test.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
            <TestTube className="w-3.5 h-3.5" />
            Clinical Diagnostics
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Diagnostic Laboratory Tests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Certified pathology and biochemistry profiles with home phlebotomist sample collection.
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'catalog' ? 'bg-white text-[#087f8c] shadow-2xs' : 'text-slate-600'
            }`}
          >
            Test Catalog
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bookings' ? 'bg-white text-[#087f8c] shadow-2xs' : 'text-slate-600'
            }`}
          >
            My Lab Bookings ({myBookings.length})
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* Search Bar */}
          <div className="card-health p-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && fetchCatalog()}
                placeholder="Search lab tests (e.g. CBC, Lipid, HbA1c, Thyroid, Vitamin D)..."
                className="input-health pl-10 text-sm"
              />
            </div>
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div key={test.id} className="card-health flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-800 leading-snug">{test.name}</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 shrink-0">
                      {test.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">{test.description}</p>

                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Turnaround</span>
                      <span className="font-bold text-slate-800">{test.turnaround_time}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sample</span>
                      <span className="font-bold text-slate-800">{test.sample_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sample Price</span>
                      <span className="font-bold text-teal-700 text-sm">₹{test.sample_price}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100/60 text-xs text-teal-900">
                    <strong className="block text-[10px] uppercase text-teal-800">Preparation:</strong>
                    {test.preparation_instructions}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTest(test);
                      setBookingSuccess(null);
                      setBookingError('');
                    }}
                    className="btn-primary w-full text-xs py-2 justify-center"
                  >
                    Book Diagnostic Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* MY BOOKINGS TAB */
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="card-health text-center py-12 text-slate-400 text-sm">
              <TestTube className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p>No lab test bookings on record.</p>
            </div>
          ) : (
            myBookings.map((b) => (
              <div key={b.id} className="card-health p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-700">{b.booking_reference}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      {b.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{b.test_name}</h3>
                  <p className="text-xs text-slate-500">
                    Scheduled: {b.booking_date} at {b.booking_time} • {b.collection_type}
                  </p>
                  {b.result_summary && (
                    <div className="p-3 mt-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                      <strong>Authorized Result Summary:</strong> {b.result_summary}
                    </div>
                  )}
                </div>

                <div className="text-xs font-bold text-teal-700 bg-slate-50 px-3 py-1.5 rounded-lg">
                  Sample Price: ₹{b.sample_price}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">Book Test</span>
                <h3 className="text-xl font-bold text-slate-800">{selectedTest.name}</h3>
                <p className="text-xs text-slate-500">Sample Price: ₹{selectedTest.sample_price}</p>
              </div>
              <button onClick={() => setSelectedTest(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            {bookingSuccess ? (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-sm space-y-3 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-teal-600" />
                <p className="font-bold">Test Booked Successfully!</p>
                <p className="text-xs font-mono">Reference: {bookingSuccess.reference}</p>
                <p className="text-xs text-slate-600">Preparation: {bookingSuccess.preparation}</p>
                <button onClick={() => setSelectedTest(null)} className="btn-primary text-xs mt-2">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
                {bookingError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg">{bookingError}</div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Collection Preference</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Home Sample Collection', 'Laboratory Visit'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setCollectionType(mode)}
                        className={`p-2.5 rounded-lg border font-bold text-center transition-all ${
                          collectionType === mode
                            ? 'bg-[#087f8c] text-white border-[#087f8c]'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {collectionType === 'Home Sample Collection' && (
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Home Collection Address</label>
                    <textarea
                      value={patientAddress}
                      onChange={(e) => setPatientAddress(e.target.value)}
                      rows="2"
                      placeholder="Enter flat / house number, street, city..."
                      required
                      className="input-health text-xs"
                    ></textarea>
                  </div>
                )}

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
                      <option value="07:30:00">07:30 AM (Fasting)</option>
                      <option value="08:30:00">08:30 AM</option>
                      <option value="09:30:00">09:30 AM</option>
                      <option value="11:00:00">11:00 AM</option>
                      <option value="16:00:00">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-teal-50 rounded-lg text-teal-800">
                  <strong>Instructions:</strong> {selectedTest.preparation_instructions}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setSelectedTest(null)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={bookingLoading} className="btn-primary">
                    {bookingLoading ? 'Booking...' : 'Confirm Lab Booking'}
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
