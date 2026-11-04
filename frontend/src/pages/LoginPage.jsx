import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.user.role === 'admin') navigate('/admin');
      else if (res.user.role === 'doctor') navigate('/doctor-portal');
      else navigate(from);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for presentation demonstration
  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 text-[#087f8c] mb-3">
          <Activity className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Sign In to HealthAI</h1>
        <p className="text-sm text-slate-500 mt-1">Access your medical dashboard & healthcare records</p>
      </div>

      {/* Demo Credentials Quick Pill Selector */}
      <div className="mb-6 p-3 rounded-xl bg-teal-50/70 border border-teal-200/60 text-xs">
        <p className="font-bold text-teal-900 mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-teal-700" />
          Click to Autofill Demo Credentials:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('patient@healthai.com', 'Patient@123')}
            className="px-2.5 py-1 bg-white hover:bg-teal-100 rounded-md border border-teal-200 font-semibold text-teal-800 shadow-2xs transition-colors"
          >
            Alex (Patient)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('doctor@healthai.com', 'Doctor@123')}
            className="px-2.5 py-1 bg-white hover:bg-blue-100 rounded-md border border-blue-200 font-semibold text-blue-800 shadow-2xs transition-colors"
          >
            Dr. Ananya (Doctor)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('admin@healthai.com', 'Admin@123')}
            className="px-2.5 py-1 bg-white hover:bg-purple-100 rounded-md border border-purple-200 font-semibold text-purple-800 shadow-2xs transition-colors"
          >
            Admin
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@healthai.com"
              required
              className="input-health pl-10"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-[#087f8c] font-semibold hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input-health pl-10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 text-sm mt-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-bold text-[#087f8c] hover:underline">
          Create Patient Account
        </Link>
      </div>
    </div>
  );
}
