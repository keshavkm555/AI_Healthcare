import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  ShieldCheck,
  Heart,
  Save,
  CheckCircle2,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({});
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [allergies, setAllergies] = useState('');
  const [existingConditions, setExistingConditions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicy, setInsurancePolicy] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await api.get('/patients/profile');
        if (res.data.success) {
          const u = res.data.user;
          const p = res.data.profile;
          setProfile(p);
          setFullName(u.full_name || '');
          setPhone(u.phone || '');
          setDateOfBirth(p.date_of_birth || '');
          setAge(p.age || '');
          setGender(p.gender || 'Male');
          setBloodGroup(p.blood_group || 'O+');
          setHeightCm(p.height_cm || '');
          setWeightKg(p.weight_kg || '');
          setAllergies(p.allergies || '');
          setExistingConditions(p.existing_conditions || '');
          setCurrentMedications(p.current_medications || '');
          setEmergencyName(p.emergency_contact_name || '');
          setEmergencyPhone(p.emergency_contact_phone || '');
          setEmergencyRelation(p.emergency_contact_relation || '');
          setInsuranceProvider(p.insurance_provider || '');
          setInsurancePolicy(p.insurance_policy_number || '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.put('/patients/profile', {
        full_name: fullName.trim(),
        phone: phone.trim(),
        date_of_birth: dateOfBirth || null,
        age: age ? parseInt(age, 10) : null,
        gender,
        blood_group: bloodGroup,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        allergies: allergies.trim(),
        existing_conditions: existingConditions.trim(),
        current_medications: currentMedications.trim(),
        emergency_contact_name: emergencyName.trim(),
        emergency_contact_phone: emergencyPhone.trim(),
        emergency_contact_relation: emergencyRelation.trim(),
        insurance_provider: insuranceProvider.trim(),
        insurance_policy_number: insurancePolicy.trim()
      });

      if (res.data.success) {
        setSuccessMsg('Your health profile has been successfully updated in MySQL!');
        setProfile(res.data.profile);
        refreshUser();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update health profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#087f8c] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#087f8c] text-xs font-bold uppercase tracking-wider mb-2">
          <User className="w-3.5 h-3.5" />
          Personal Health Record
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800">Patient Health Information &amp; Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Maintain your biometrics, emergency contacts, known allergies, and insurance policy details.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-health p-6 sm:p-8 space-y-6">
        
        {/* Section 1: Demographics */}
        <div>
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            1. Personal Demographics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Contact</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Age (Years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input-health text-xs"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="input-health text-xs"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Biometrics & BMI */}
        <div>
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            2. Biometric Measurements
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="e.g. 175"
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 71.5"
                className="input-health text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Clinical Safety (Allergies & Conditions) */}
        <div>
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            3. Clinical Safety &amp; Medical History
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Known Drug or Environmental Allergies
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa drugs, Shellfish"
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Existing Chronic Medical Conditions
              </label>
              <input
                type="text"
                value={existingConditions}
                onChange={(e) => setExistingConditions(e.target.value)}
                placeholder="e.g. Type 2 Diabetes, Mild Hypertension, Asthma"
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Current Regular Medications
              </label>
              <input
                type="text"
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
                placeholder="e.g. Metformin 500mg, Montelukast 10mg"
                className="input-health text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Emergency Contact */}
        <div>
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            4. Emergency Contact Person
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Name</label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="e.g. Sarah Mercer"
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Emergency Phone</label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+91 98765 43219"
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Relationship</label>
              <input
                type="text"
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
                placeholder="e.g. Spouse / Parent / Sibling"
                className="input-health text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Insurance */}
        <div>
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            5. Health Insurance Policy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Insurance Provider</label>
              <input
                type="text"
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                placeholder="e.g. Star Health / ICICI Lombard"
                className="input-health text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Policy / Member ID</label>
              <input
                type="text"
                value={insurancePolicy}
                onChange={(e) => setInsurancePolicy(e.target.value)}
                placeholder="SHI-2026-984421"
                className="input-health text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-2.5 px-6 text-sm shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Health Profile...' : 'Save Profile Changes'}
          </button>
        </div>

      </form>

    </div>
  );
}
