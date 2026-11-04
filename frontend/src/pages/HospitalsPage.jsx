import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Building2,
  MapPin,
  PhoneCall,
  Search,
  Navigation,
  Star,
  ExternalLink,
  Calendar,
  ShieldCheck,
  Bed,
  CheckCircle2,
  AlertCircle,
  Compass,
  ArrowUpDown
} from 'lucide-react';

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [sortBy, setSortBy] = useState('distance'); // 'distance' or 'rating'

  // Fetch hospitals from backend API with optional geolocation coordinates
  const fetchHospitals = async (coords = userCoords) => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        emergencyOnly: emergencyOnly ? 'true' : undefined
      };

      if (coords?.lat && coords?.lng) {
        params.latitude = coords.lat;
        params.longitude = coords.lng;
      }

      const res = await api.get('/hospitals', { params });
      if (res.data.success) {
        setHospitals(res.data.hospitals);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [emergencyOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHospitals();
  };

  // Browser Geolocation API for capturing live GPS coordinates
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLocationStatus('Requesting browser GPS permission...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserCoords(coords);
        setLocationStatus(`Live location detected (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}). Hospitals sorted by proximity!`);
        setLocating(false);
        fetchHospitals(coords);
      },
      (err) => {
        setLocationStatus(`Location permission denied or unavailable: ${err.message}. Showing general city list.`);
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Calculate distance in km using Haversine formula (frontend fallback or precise check)
  const getDistanceKm = (hospital) => {
    if (hospital.distance_km !== undefined && hospital.distance_km !== null) {
      return parseFloat(hospital.distance_km).toFixed(1);
    }
    if (!userCoords || !hospital.latitude || !hospital.longitude) return null;
    const R = 6371; // Earth radius in km
    const dLat = ((hospital.latitude - userCoords.lat) * Math.PI) / 180;
    const dLng = ((hospital.longitude - userCoords.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userCoords.lat * Math.PI) / 180) *
        Math.cos((hospital.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Process and sort hospitals
  const displayedHospitals = [...hospitals].sort((a, b) => {
    if (userCoords && sortBy === 'distance') {
      const distA = parseFloat(getDistanceKm(a)) || 999999;
      const distB = parseFloat(getDistanceKm(b)) || 999999;
      return distA - distB;
    }
    return (b.rating || 0) - (a.rating || 0);
  });

  const nearestHospitalId = userCoords && displayedHospitals.length > 0 ? displayedHospitals[0]?.id : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">Hospital Discovery & Live Bed Availability</h1>
        <p className="text-sm text-slate-500 mt-1">
          Detect your live location to suggest the closest accredited hospitals, view ICU/general bed status, and get driving directions.
        </p>
      </div>

      {/* Live Location Suggestion Banner */}
      <div className={`p-4 rounded-2xl border transition-all ${
        userCoords 
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
          : 'bg-teal-50/80 border-teal-200 text-teal-900'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              userCoords ? 'bg-emerald-600 text-white' : 'bg-[#087f8c] text-white'
            }`}>
              <Compass className={`w-5 h-5 ${locating ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {userCoords ? 'Live Location Active — Sorted by Proximity' : 'Find Hospitals Closest to Your Current Location'}
              </h3>
              <p className="text-xs opacity-85 mt-0.5">
                {locationStatus || 'Click below to share your browser GPS location. The app will immediately rank hospitals starting with the nearest one.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locating}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm shrink-0 ${
              userCoords 
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white' 
                : 'bg-[#087f8c] hover:bg-[#06646e] text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            {locating ? 'Detecting GPS...' : userCoords ? 'Refresh Live Location' : 'Use My Live Location'}
          </button>
        </div>
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="card-health p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by hospital name, area, or facility (e.g. Apollo, ICU, Trauma)..."
              className="input-health pl-10 text-sm"
            />
          </div>
          <button type="submit" className="btn-primary text-sm py-2 px-5">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={emergencyOnly}
              onChange={(e) => setEmergencyOnly(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <span>Show 24x7 Emergency Trauma Centres Only</span>
          </label>

          {userCoords && (
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="distance">Nearest to Me (Proximity)</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Hospital Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#087f8c] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : displayedHospitals.length === 0 ? (
        <div className="card-health p-10 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-800">No Hospitals Found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search criteria or clearing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedHospitals.map((hospital) => {
            const distance = getDistanceKm(hospital);
            const isNearest = hospital.id === nearestHospitalId && distance !== null;

            return (
              <div 
                key={hospital.id} 
                className={`card-health flex flex-col justify-between transition-all relative ${
                  isNearest ? 'ring-2 ring-emerald-500 shadow-md bg-emerald-50/20' : ''
                }`}
              >
                {/* Nearest Suggested Badge */}
                {isNearest && (
                  <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1.5 uppercase tracking-wide">
                    <span>🌟 Nearest Hospital to You</span>
                    <span>({distance} km)</span>
                  </div>
                )}

                <div className="space-y-3 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg text-slate-800 leading-snug">{hospital.hospital_name}</h3>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {hospital.rating}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{hospital.address}, {hospital.city}</span>
                  </p>

                  <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                    <a href={`tel:${hospital.phone}`} className="hover:underline">{hospital.phone || 'N/A'}</a>
                  </p>

                  {/* Bed Counts & Distance Banner */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Beds Vacant</span>
                      <span className="font-extrabold text-teal-700 text-sm">{hospital.available_beds}</span>
                      <span className="text-slate-500"> / {hospital.total_beds}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Distance</span>
                      <span className={`font-extrabold text-sm ${isNearest ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {distance ? `${distance} km` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-700">Services:</strong> {hospital.facilities}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/book-appointment?hospitalId=${hospital.id}`}
                    className="btn-primary text-xs py-2 px-3.5 flex-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book OPD Slot
                  </Link>

                  {hospital.latitude && hospital.longitude && (
                    <a
                      href={
                        userCoords 
                          ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${hospital.latitude},${hospital.longitude}`
                          : `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 ${
                        isNearest ? 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100' : ''
                      }`}
                      title={userCoords ? "Get Turn-by-Turn Driving Directions" : "Open in Google Maps"}
                    >
                      <Navigation className="w-3.5 h-3.5 text-teal-600" />
                      {userCoords ? 'Directions' : 'Map'}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OpenStreetMap / Interactive Map Container Preview */}
      <div className="card-health p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#087f8c]" />
            <h3 className="font-bold text-base text-slate-800">Hospital Geographic Radar (Bengaluru Metropolitan Region)</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">OpenStreetMap Layer Active</span>
        </div>

        {/* Embedded OpenStreetMap Iframe for interactive exploration */}
        <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
          <iframe
            title="Hospital Locator Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src="https://www.openstreetmap.org/export/embed.html?bbox=77.5000%2C12.8500%2C77.7200%2C13.0500&amp;layer=mapnik"
          ></iframe>
        </div>
        <p className="text-xs text-slate-400 text-center">
          OpenStreetMap data showing Bengaluru healthcare district coordinates with live directional anchors.
        </p>
      </div>

    </div>
  );
}
