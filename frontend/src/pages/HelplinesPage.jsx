import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  PhoneCall,
  ShieldAlert,
  Clock,
  Sparkles,
  PhoneForwarded,
  Heart
} from 'lucide-react';

export default function HelplinesPage() {
  const [helplines, setHelplines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHelplines() {
      try {
        setLoading(true);
        const res = await api.get('/emergency/helplines');
        if (res.data.success) {
          setHelplines(res.data.helplines);
        }
      } catch (err) {
        console.error('Error fetching helplines:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHelplines();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#087f8c] text-xs font-bold uppercase tracking-wider mb-2">
          <PhoneCall className="w-3.5 h-3.5" />
          Immediate Emergency Dispatch
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800">24/7 Verified Emergency Helplines</h1>
        <p className="text-sm text-slate-500 mt-1">
          Government-backed national response hotlines for trauma, mental health, poison management, and women/child protection.
        </p>
      </div>

      {/* Helplines Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#087f8c] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {helplines.map((item) => (
            <div key={item.id} className="card-health p-5 flex flex-col justify-between border-slate-200">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/50">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-black text-slate-800 mt-1.5">{item.service_name}</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {item.available_hours}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hotline Number</span>
                  <span className="text-xl font-black text-[#087f8c] font-mono">{item.phone_number}</span>
                </div>

                <a
                  href={`tel:${item.phone_number}`}
                  className="btn-primary text-xs py-2 px-4 shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Call Now
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advice Footnote */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs text-center leading-relaxed">
        All helplines listed above are verified national numbers. Calls to 108, 112, and 1098 are toll-free from any mobile or landline carrier in India.
      </div>

    </div>
  );
}
