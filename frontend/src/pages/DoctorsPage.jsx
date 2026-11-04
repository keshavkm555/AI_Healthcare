import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  UserCheck,
  Search,
  Star,
  Award,
  Clock,
  Calendar,
  Video,
  Building2,
  Stethoscope,
  Filter
} from 'lucide-react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [teleconsultOnly, setTeleconsultOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSpecialties() {
      try {
        const res = await api.get('/doctors/specialties');
        if (res.data.success) {
          setSpecialties(res.data.specialties);
        }
      } catch (err) {
        console.error('Error loading specialties:', err);
      }
    }
    loadSpecialties();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctors', {
        params: {
          specialtyId: selectedSpecialty || undefined,
          search: searchTerm || undefined,
          teleconsultOnly: teleconsultOnly ? 'true' : undefined
        }
      });
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, teleconsultOnly]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">Specialist Medical Doctor Directory</h1>
        <p className="text-sm text-slate-500 mt-1">
          Browse board-certified specialists, verify clinical qualifications, and schedule OPD or teleconsultations.
        </p>
      </div>

      {/* Specialty Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedSpecialty('')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            selectedSpecialty === ''
              ? 'bg-[#087f8c] text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Specialties
        </button>
        {specialties.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSpecialty(s.id.toString())}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              selectedSpecialty === s.id.toString()
                ? 'bg-[#087f8c] text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="card-health p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search doctor by name, qualification, or hospital..."
            className="input-health pl-10 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 px-2 cursor-pointer">
          <input
            type="checkbox"
            checked={teleconsultOnly}
            onChange={(e) => setTeleconsultOnly(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
          />
          <span>Video Consultation Available</span>
        </label>

        <button type="submit" className="btn-primary text-sm py-2 px-5">
          Filter
        </button>
      </form>

      {/* Doctors Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#087f8c] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="card-health flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{doc.name}</h3>
                    <p className="text-xs font-bold text-[#087f8c]">{doc.specialty_name}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {doc.rating}
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-snug line-clamp-1">{doc.qualification}</p>

                <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  {doc.hospital_name}
                </p>

                <div className="flex items-center gap-4 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Experience</span>
                    <span className="font-bold text-slate-800">{doc.experience_years}+ Years</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Consult Fee</span>
                    <span className="font-bold text-teal-700">₹{doc.consultation_fee}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 line-clamp-2">
                  {doc.bio}
                </div>

                <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Days: {doc.available_days}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                <Link
                  to={`/book-appointment?hospitalId=${doc.hospital_id}&doctorId=${doc.id}&type=OPD`}
                  className="btn-primary text-xs py-2 px-3 flex-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book OPD
                </Link>

                {doc.teleconsult_available ? (
                  <Link
                    to={`/book-appointment?hospitalId=${doc.hospital_id}&doctorId=${doc.id}&type=Video`}
                    className="btn-secondary text-xs py-2 px-3 flex-1"
                  >
                    <Video className="w-3.5 h-3.5 text-blue-600" />
                    Video Call
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {doctors.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-400 text-sm">
          No doctors match the selected criteria.
        </div>
      )}

    </div>
  );
}
