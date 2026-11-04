import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Search,
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  ShieldCheck
} from 'lucide-react';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodBankPage() {
  const { user } = useAuth();
  const [bloodBanks, setBloodBanks] = useState([]);
  const [donors, setDonors] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [loading, setLoading] = useState(true);

  // Donor Registration Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [donorName, setDonorName] = useState(user?.full_name || '');
  const [donorGroup, setDonorGroup] = useState(user?.profile?.blood_group || 'O+');
  const [donorPhone, setDonorPhone] = useState(user?.phone || '');
  const [donorCity, setDonorCity] = useState('Bengaluru');
  const [donorConsent, setDonorConsent] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, dRes] = await Promise.all([
        api.get('/blood-banks'),
        api.get('/blood-banks/donors', {
          params: { bloodGroup: selectedGroup !== 'All' ? selectedGroup : undefined }
        })
      ]);

      if (bRes.data.success) setBloodBanks(bRes.data.bloodBanks);
      if (dRes.data.success) setDonors(dRes.data.donors);
    } catch (err) {
      console.error('Error fetching blood bank data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedGroup]);

  const handleRegisterDonor = async (e) => {
    e.preventDefault();
    if (!donorName || !donorGroup || !donorPhone || !donorConsent) {
      setRegisterError('Please fill in all fields and provide voluntary donor consent.');
      return;
    }

    setRegisterError('');
    try {
      const res = await api.post('/blood-banks/donors', {
        full_name: donorName.trim(),
        blood_group: donorGroup,
        phone: donorPhone.trim(),
        city: donorCity.trim(),
        consent_given: true
      });

      if (res.data.success) {
        setRegisterSuccess(true);
        fetchData();
      }
    } catch (err) {
      setRegisterError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5" />
            Transfusion Support Network
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Blood Bank &amp; Voluntary Donor Registry</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time blood component availability across certified centres and voluntary donor registry.
          </p>
        </div>

        <button
          onClick={() => {
            setShowRegisterModal(true);
            setRegisterSuccess(false);
            setRegisterError('');
          }}
          className="btn-primary text-xs sm:text-sm py-2 px-4 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          Register as Voluntary Donor
        </button>
      </div>

      {/* Blood Group Filter Selector */}
      <div className="card-health p-4 space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Filter by Required Blood Group:
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              onClick={() => setSelectedGroup(bg)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                selectedGroup === bg
                  ? 'bg-red-600 text-white shadow-xs scale-105'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {bg}
            </button>
          ))}
        </div>
      </div>

      {/* REGISTERED BLOOD BANKS DIRECTORY */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Certified Blood Banks (Bengaluru Region)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bloodBanks.map((bank) => (
            <div key={bank.id} className="card-health flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-slate-800 leading-snug">{bank.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    {bank.operating_hours}
                  </span>
                </div>

                <p className="text-xs text-slate-500 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{bank.address}, {bank.city}</span>
                </p>

                <p className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                  <a href={`tel:${bank.contact_number}`} className="hover:underline">{bank.contact_number}</a>
                </p>

                {/* Stock Summary Badges */}
                {bank.stock_summary && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Units Available by Blood Group:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                      {Object.entries(bank.stock_summary).map(([grp, units]) => (
                        <div
                          key={grp}
                          className={`p-1 rounded font-bold ${
                            selectedGroup === grp
                              ? 'bg-red-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="block text-[10px] opacity-80">{grp}</span>
                          <span>{units}u</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <a
                  href={`tel:${bank.contact_number}`}
                  className="btn-secondary w-full text-xs py-2 justify-center"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                  Call Blood Bank
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VOLUNTARY DONORS DIRECTORY */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            Registered Voluntary Donors {selectedGroup !== 'All' ? `(${selectedGroup})` : ''}
          </h2>
          <span className="text-xs text-slate-500">Explicit consent granted</span>
        </div>

        {donors.length === 0 ? (
          <div className="card-health text-center py-8 text-slate-400 text-xs">
            No voluntary donors currently available for {selectedGroup}.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {donors.map((d) => (
              <div key={d.id} className="card-health p-4 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-red-100 text-red-700 font-black flex items-center justify-center text-xs">
                      {d.blood_group}
                    </span>
                    <p className="font-bold text-sm text-slate-800">{d.full_name}</p>
                  </div>
                  <p className="text-xs text-slate-500">{d.city} • Last Donated: {d.last_donated_date || 'Eligible'}</p>
                </div>

                <a
                  href={`tel:${d.phone}`}
                  className="btn-primary text-xs py-1.5 px-3"
                  title="Contact Donor"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Call
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DONOR REGISTRATION MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider block">Voluntary Registry</span>
                <h3 className="text-xl font-bold text-slate-800">Register as a Blood Donor</h3>
              </div>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {registerSuccess ? (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-sm space-y-3 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-teal-600" />
                <p className="font-bold">Thank You For Registering!</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your pledge helps save lives during acute surgical procedures and trauma emergencies.
                </p>
                <button onClick={() => setShowRegisterModal(false)} className="btn-primary text-xs mt-2">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterDonor} className="space-y-4 text-xs">
                {registerError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg">{registerError}</div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    required
                    className="input-health text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Blood Group</label>
                    <select
                      value={donorGroup}
                      onChange={(e) => setDonorGroup(e.target.value)}
                      className="input-health text-xs"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">City</label>
                    <input
                      type="text"
                      value={donorCity}
                      onChange={(e) => setDonorCity(e.target.value)}
                      required
                      className="input-health text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    required
                    className="input-health text-xs"
                  />
                </div>

                <label className="flex items-start gap-2 cursor-pointer font-medium text-slate-700 pt-1">
                  <input
                    type="checkbox"
                    checked={donorConsent}
                    onChange={(e) => setDonorConsent(e.target.checked)}
                    required
                    className="w-4 h-4 text-red-600 rounded border-slate-300 mt-0.5"
                  />
                  <span>
                    I voluntarily consent to be contacted in emergency situations when my blood group is urgently needed.
                  </span>
                </label>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setShowRegisterModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Submit Donor Pledge
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
