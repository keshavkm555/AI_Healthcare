import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  Navigation,
  AlertTriangle,
  Heart,
  CheckCircle2,
  Building2,
  Clock,
  ExternalLink
} from 'lucide-react';

const EMERGENCY_NUMBERS = [
  { name: 'National Ambulance Dispatch', number: '108', desc: 'Emergency paramedic transport & on-site resuscitation', primary: true },
  { name: 'Unified National Emergency Service', number: '112', desc: 'Central emergency response (Police, Fire, Ambulance)', primary: true },
  { name: 'Women Distress Helpline', number: '1091', desc: '24/7 emergency rescue & support for women', primary: false },
  { name: 'National Childline', number: '1098', desc: 'Emergency care, protection & medical dispatch for children', primary: false },
  { name: 'Tele-MANAS Mental Health', number: '14416', desc: 'Psychological crisis intervention and mental health support', primary: false },
  { name: 'National Poison Information Centre (AIIMS)', number: '1800-116-117', desc: 'Toxic chemical, medicine overdose, or venom advice', primary: false }
];

export default function EmergencyPage() {
  const { user } = useAuth();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [gpsError, setGpsError] = useState('');
  const [eventLogged, setEventLogged] = useState(false);
  const [nearestHospitals, setNearestHospitals] = useState([]);

  // Acquire user's GPS coordinates with explicit permission
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setCoords({ lat: userLat, lng: userLng });
        setGpsLoading(false);

        // Log emergency event to backend MySQL
        try {
          const res = await api.post('/emergency/log-event', {
            caller_name: user?.full_name || 'Emergency Visitor',
            latitude: userLat,
            longitude: userLng,
            action_taken: 'User triggered SOS location share and called emergency link',
            emergency_type: 'Acute Trauma / Medical Distress'
          });
          if (res.data.success) {
            setEventLogged(true);
            if (res.data.nearestHospitals) {
              setNearestHospitals(res.data.nearestHospitals);
            }
          }
        } catch (err) {
          console.error('Error logging emergency event:', err);
        }
      },
      (err) => {
        setGpsError(`Location access denied or unavailable: ${err.message}`);
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Warning Banner & Ethical Transparency Notice */}
      <div className="p-5 rounded-2xl bg-red-600 text-white shadow-md space-y-2">
        <div className="flex items-center gap-2 font-black text-lg sm:text-xl">
          <ShieldAlert className="w-7 h-7 text-white animate-pulse" />
          <span>EMERGENCY SOS HUB — IMMEDIATE CLINICAL ASSISTANCE</span>
        </div>
        <p className="text-xs sm:text-sm text-red-100 leading-relaxed font-medium">
          If you or someone nearby is experiencing acute chest pain, severe breathlessness, sudden speech slurring, severe hemorrhage, or loss of consciousness, use the one-tap telephony buttons below to dial national emergency services immediately.
        </p>
      </div>

      {/* Mandatory Regulatory Transparency Disclosure */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block text-amber-800">Medical Safety & Integrity Notice:</strong>
          <p className="leading-relaxed">
            This web application provides direct telephony links to national helplines and nearby trauma maps. It does not automatically dispatch an ambulance or reserve ICU beds without human telephonic confirmation with 108/112 dispatchers. Always dial the phone links provided.
          </p>
        </div>
      </div>

      {/* PRIMARY EMERGENCY DIAL BUTTONS */}
      <div>
        <h2 className="text-xl font-black text-slate-800 mb-4">One-Tap Emergency Direct Call Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EMERGENCY_NUMBERS.map((item, idx) => (
            <a
              key={idx}
              href={`tel:${item.number}`}
              className={`p-5 rounded-2xl border transition-all flex items-center justify-between group shadow-xs ${
                item.primary
                  ? 'bg-red-50/70 border-red-300 hover:bg-red-100/80 hover:border-red-400'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-1">
                <span className="font-bold text-base text-slate-900 group-hover:text-red-700 transition-colors">
                  {item.name}
                </span>
                <p className="text-xs text-slate-500">{item.desc}</p>
                <span className="inline-block text-lg font-black text-red-600 font-mono mt-1">
                  📞 {item.number}
                </span>
              </div>

              <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                <PhoneCall className="w-6 h-6" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* USER'S EMERGENCY MEDICAL ID (Blood Group, Allergies, Emergency Contacts) */}
      {user && (
        <div className="card-health p-6 border-teal-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Patient Critical Medical ID Card
            </h3>
            <span className="text-xs text-slate-500">For First Responders</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-red-50/60 border border-red-100">
              <span className="text-red-700 font-bold uppercase block text-[10px]">Blood Group</span>
              <span className="font-black text-xl text-slate-800">{user.profile?.blood_group || 'Not recorded'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold uppercase block text-[10px]">Patient Name</span>
              <span className="font-bold text-sm text-slate-800">{user.full_name}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold uppercase block text-[10px]">Known Allergies</span>
              <span className="font-bold text-xs text-red-800">{user.profile?.allergies || 'None reported'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold uppercase block text-[10px]">Emergency Contact</span>
              <span className="font-bold text-xs text-slate-800">
                {user.profile?.emergency_contact_phone ? (
                  <a href={`tel:${user.profile.emergency_contact_phone}`} className="text-teal-700 underline">
                    {user.profile.emergency_contact_name} ({user.profile.emergency_contact_phone})
                  </a>
                ) : 'Not configured'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* OPTIONAL LOCATION SHARING & NEAREST HOSPITAL DIRECTIONS */}
      <div className="card-health p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#087f8c]" />
              GPS Coordinate Broadcasting &amp; Nearest Emergency Trauma Care
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Acquires current GPS location after user permission to locate closest hospital emergency room.
            </p>
          </div>

          <button
            type="button"
            onClick={handleShareLocation}
            disabled={gpsLoading}
            className="btn-primary text-xs py-2 px-4 shrink-0 shadow-xs"
          >
            {gpsLoading ? 'Retrieving GPS...' : 'Share My Live Location'}
          </button>
        </div>

        {gpsError && (
          <p className="text-xs text-red-600 italic">{gpsError}</p>
        )}

        {coords && (
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-2">
            <p className="font-bold">
              ✓ Latitude: {coords.lat.toFixed(6)} | Longitude: {coords.lng.toFixed(6)}
            </p>
            <p className="text-slate-600">
              {eventLogged ? 'Emergency incident logged in database for audit review.' : ''}
            </p>
            <a
              href={`https://www.google.com/maps/search/hospital/@${coords.lat},${coords.lng},14z`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-[#087f8c] hover:underline"
            >
              Open Nearest Hospitals on Map <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {nearestHospitals.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Closest Emergency Trauma Hospitals to Your Location:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {nearestHospitals.map((nh) => (
                <div key={nh.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-800">{nh.hospital_name}</p>
                  <p className="text-slate-500 text-[11px]">{nh.address}</p>
                  <p className="text-teal-700 font-bold">{parseFloat(nh.distance_km).toFixed(1)} km away</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${nh.latitude},${nh.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#087f8c] font-semibold underline block pt-1"
                  >
                    Get Driving Directions →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
