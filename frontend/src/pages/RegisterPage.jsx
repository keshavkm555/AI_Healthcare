import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthShell from '../components/AuthShell';

// Indian mobile number: optional +91 / 91 / 0 prefix, then 10 digits starting with 6-9
const PHONE_REGEX = /^(?:\+?91|0)?[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z .'-]{1,99}$/;

// Remove spaces and dashes so "+91 98765-43210" becomes "+919876543210"
const normalizePhone = (value) => value.replace(/[\s-]/g, '');

// Simple password strength score (0-4) for the visual meter
const getPasswordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};
const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-teal-500', 'bg-emerald-500'];

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);
  const phoneValid = PHONE_REGEX.test(normalizePhone(phone));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Full name, email, mobile number, and password are required.');
      return;
    }

    if (!NAME_REGEX.test(fullName.trim())) {
      setError('Please enter a valid full name (letters and spaces only).');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!PHONE_REGEX.test(normalizePhone(phone))) {
      setError('Please enter a valid 10-digit mobile number starting with 6, 7, 8 or 9 (e.g. 9876543210 or +91 98765 43210).');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: normalizePhone(phone)
      });
      // Registration successful: go to Login with a success message and the email pre-filled
      navigate('/login', {
        replace: true,
        state: { registered: true, email: email.trim().toLowerCase() }
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join HealthAI for personalized digital healthcare. It's free.">
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5 animate-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-px" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Full name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Mercer"
              autoComplete="name"
              required
              className="input-health pl-11"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                autoComplete="email"
                required
                className="input-health pl-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ''))}
                placeholder="+91 98765 43210"
                maxLength={16}
                inputMode="tel"
                autoComplete="tel"
                required
                className={`input-health pl-11 ${
                  phone && !phoneValid ? '!border-rose-300 focus:!ring-rose-100' : ''
                } ${phone && phoneValid ? '!border-emerald-300' : ''}`}
              />
            </div>
            {phone && !phoneValid && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">10 digits, starting with 6–9</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              autoComplete="new-password"
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
          {password && (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-slate-200'}`}
                  ></span>
                ))}
              </div>
              <span className="text-[11px] font-bold text-slate-500 w-14 text-right">{strengthLabels[strength]}</span>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm !mt-6">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          By creating an account you agree to use HealthAI for informational guidance only. It does not replace professional medical advice.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-[#087f8c] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
