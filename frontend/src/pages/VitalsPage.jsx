import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Heart,
  Thermometer,
  Droplet,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function VitalsPage() {
  const { user } = useAuth();
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // BMI Interactive Calculator
  const [heightCm, setHeightCm] = useState(user?.profile?.height_cm || 175);
  const [weightKg, setWeightKg] = useState(user?.profile?.weight_kg || 71.5);
  const [calculatedBmi, setCalculatedBmi] = useState(23.3);
  const [bmiCategory, setBmiCategory] = useState('Normal weight');

  // Form for logging new vitals
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [spo2, setSpo2] = useState('');
  const [temperature, setTemperature] = useState('');
  const [glucose, setGlucose] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [error, setError] = useState('');

  // Calculate BMI on height/weight change
  useEffect(() => {
    if (heightCm > 0 && weightKg > 0) {
      const hM = heightCm / 100;
      const b = parseFloat((weightKg / (hM * hM)).toFixed(1));
      setCalculatedBmi(b);

      if (b < 18.5) setBmiCategory('Underweight');
      else if (b >= 18.5 && b <= 24.9) setBmiCategory('Normal weight');
      else if (b >= 25 && b <= 29.9) setBmiCategory('Overweight');
      else setBmiCategory('Obesity');
    }
  }, [heightCm, weightKg]);

  const fetchVitals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vitals/history');
      if (res.data.success) {
        setVitalsHistory(res.data.vitals);
      }
    } catch (err) {
      console.error('Error fetching vitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, []);

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!systolic && !heartRate && !spo2 && !temperature && !glucose) {
      setError('Please provide at least one vital measurement.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSubmitMsg('');

    try {
      const res = await api.post('/vitals', {
        systolic_bp: systolic ? parseInt(systolic, 10) : undefined,
        diastolic_bp: diastolic ? parseInt(diastolic, 10) : undefined,
        heart_rate: heartRate ? parseInt(heartRate, 10) : undefined,
        spo2_percent: spo2 ? parseInt(spo2, 10) : undefined,
        temperature_f: temperature ? parseFloat(temperature) : undefined,
        blood_glucose_mg_dl: glucose ? parseInt(glucose, 10) : undefined,
        notes: notes.trim() || undefined,
        source: 'User Entered'
      });

      if (res.data.success) {
        setSubmitMsg('Vital signs successfully recorded in database!');
        setSystolic('');
        setDiastolic('');
        setHeartRate('');
        setSpo2('');
        setTemperature('');
        setGlucose('');
        setNotes('');
        fetchVitals();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record vitals.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format history for Recharts
  const chartData = vitalsHistory.map((item) => ({
    date: item.recorded_at.slice(5, 10),
    Systolic: item.systolic_bp,
    Diastolic: item.diastolic_bp,
    HeartRate: item.heart_rate,
    Glucose: item.blood_glucose_mg_dl
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Activity className="w-3.5 h-3.5" />
          Physiological Biomarkers
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800">BMI & Vital Signs Tracker</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor cardiovascular pressure, oxygen saturation, glucose curves, and biometric trend history.
        </p>
      </div>

      {/* TOP ROW: BMI CALCULATOR & CATEGORY INTERPRETATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Interactive BMI Calculator */}
        <div className="card-health p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-800">Body Mass Index (BMI) Calculator</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Height (cm)</label>
              <input
                type="number"
                min="50"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                className="input-health text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Weight (kg)</label>
              <input
                type="number"
                min="20"
                max="300"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                className="input-health text-sm"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-teal-800 font-semibold block">Calculated Value:</span>
              <span className="text-3xl font-black text-teal-900">{calculatedBmi}</span>
              <span className="text-xs text-teal-700 font-medium ml-1">kg/m²</span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Category:</span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-teal-200 text-teal-900 mt-1">
                {bmiCategory}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            Limitations Notice: BMI provides a general adult screening index and does not distinguish between lean muscle mass and adipose tissue.
          </p>
        </div>

        {/* BMI Categories Reference Table */}
        <div className="card-health p-6 space-y-3">
          <h3 className="font-bold text-base text-slate-800">WHO Adult BMI Reference Standards</h3>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2 flex justify-between">
              <span className="text-slate-600">Underweight</span>
              <span className="font-bold text-blue-700">&lt; 18.5 kg/m²</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-600 font-bold text-emerald-800">Normal / Healthy weight</span>
              <span className="font-bold text-emerald-700">18.5 – 24.9 kg/m²</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-600">Overweight</span>
              <span className="font-bold text-amber-700">25.0 – 29.9 kg/m²</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-600">Obesity Class I &amp; II</span>
              <span className="font-bold text-red-700">&ge; 30.0 kg/m²</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
            <strong>Optimal Targets:</strong> Systolic BP: 120 mmHg • Diastolic BP: 80 mmHg • Resting HR: 60-100 bpm • SpO2: &gt; 95%.
          </div>
        </div>

      </div>

      {/* RECHARTS TREND VISUALIZATION */}
      <div className="card-health p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#087f8c]" />
            <h3 className="font-bold text-base text-slate-800">Blood Pressure & Vital Signs Trends Over Time</h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">User-Logged Measurements</span>
        </div>

        {chartData.length < 2 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Log at least two vital measurements to render trendline graphs.
          </div>
        ) : (
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[50, 160]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Systolic" stroke="#ef4444" strokeWidth={2} name="Systolic BP" />
                <Line type="monotone" dataKey="Diastolic" stroke="#087f8c" strokeWidth={2} name="Diastolic BP" />
                <Line type="monotone" dataKey="HeartRate" stroke="#8b5cf6" strokeWidth={2} name="Heart Rate (BPM)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* LOG NEW VITALS FORM */}
      <div className="card-health p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <PlusCircle className="w-5 h-5 text-[#087f8c]" />
          <h3 className="font-bold text-base text-slate-800">Record Today's Vital Signs</h3>
        </div>

        {submitMsg && (
          <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <p>{submitMsg}</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Systolic BP</label>
              <input
                type="number"
                placeholder="120 mmHg"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Diastolic BP</label>
              <input
                type="number"
                placeholder="80 mmHg"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Heart Rate</label>
              <input
                type="number"
                placeholder="72 BPM"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">SpO2 Oxygen</label>
              <input
                type="number"
                placeholder="98 %"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Temperature</label>
              <input
                type="number"
                step="0.1"
                placeholder="98.6 °F"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Glucose</label>
              <input
                type="number"
                placeholder="95 mg/dL"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                className="input-health text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Clinical Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Measured before breakfast / resting at home"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-health text-xs"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={submitting} className="btn-primary text-xs py-2 px-5">
              {submitting ? 'Recording Vitals...' : 'Log Vital Signs'}
            </button>
          </div>
        </form>
      </div>

      {/* VITALS MEASUREMENT HISTORY TABLE */}
      <div className="card-health p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-800">Historical Measurement Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Date &amp; Time</th>
                <th className="py-2.5 px-3">Blood Pressure</th>
                <th className="py-2.5 px-3">Heart Rate</th>
                <th className="py-2.5 px-3">Oxygen (SpO2)</th>
                <th className="py-2.5 px-3">Temp (°F)</th>
                <th className="py-2.5 px-3">Glucose</th>
                <th className="py-2.5 px-3">Data Source</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vitalsHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{item.recorded_at.slice(0, 16)}</td>
                  <td className="py-2.5 px-3 font-bold text-teal-800">
                    {item.systolic_bp && item.diastolic_bp ? `${item.systolic_bp}/${item.diastolic_bp} mmHg` : '—'}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700">{item.heart_rate ? `${item.heart_rate} bpm` : '—'}</td>
                  <td className="py-2.5 px-3">{item.spo2_percent ? `${item.spo2_percent}%` : '—'}</td>
                  <td className="py-2.5 px-3">{item.temperature_f ? `${item.temperature_f} °F` : '—'}</td>
                  <td className="py-2.5 px-3">{item.blood_glucose_mg_dl ? `${item.blood_glucose_mg_dl} mg/dL` : '—'}</td>
                  <td className="py-2.5 px-3 text-slate-400 italic">{item.source}</td>
                  <td className="py-2.5 px-3 text-slate-500">{item.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
