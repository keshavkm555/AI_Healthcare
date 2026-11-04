import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Sparkles, User, Stethoscope, ShieldCheck } from 'lucide-react';
import AuthShell from '../components/AuthShell';

const demoAccounts = [
  { label: 'Patient', email: 'patient@healthai.com', password: 'Patient@123', icon: User, style: 'hover:border-teal-300 hover:bg-teal-50 text-teal-800' },
  { label: 'Doctor', email: 'doctor@healthai.com', password: 'Doctor@123', icon: Stethoscope, style: 'hover:border-blue-300 hover:bg-blue-50 text-blue-800' },
  { label: 'Admin', email: 'admin@healthai.com', password: 'Admin@123', icon: ShieldCheck, style: 'hover:border-purple-300 hover:bg-purple-50 text-purple-800' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Set when the user arrives here right after a successful registration
  const justRegistered = location.state?.registered === true;

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <AuthShell title="Welcome back 👋" subtitle="Sign in to access your health dashboard and records.">
      {justRegistered && !error && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 animate-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <p><span className="font-bold">Registration successful!</span> Please sign in with your new account.</p>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5 animate-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="input-health pl-11"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">Password</label>
            <Link to="/forgot-password" className="text-xs text-[#087f8c] font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="input-health pl-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm !mt-6">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick Fill */}
      <div className="mt-7">
        <div className="flex items-center gap-3 mb-3">
          <span className="h-px flex-1 bg-slate-200"></span>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Try a demo account
          </span>
          <span className="h-px flex-1 bg-slate-200"></span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {demoAccounts.map(({ label, email: e, password: p, icon: Icon, style }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleQuickFill(e, p)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold transition-all ${style}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-7 text-center text-sm text-slate-600">
        New to HealthAI?{' '}
        <Link to="/register" className="font-bold text-[#087f8c] hover:underline">
          Create a free account
        </Link>
      </p>
    </AuthShell>
  );
}
