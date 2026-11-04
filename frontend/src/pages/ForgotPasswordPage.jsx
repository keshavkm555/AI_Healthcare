import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Activity, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email || !newPassword) {
      setError('Please provide email and your new password.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        newPassword
      });
      if (res.data.success) {
        setSubmitted(true);
        setMessage(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 text-[#087f8c] mb-3">
          <Activity className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Password Recovery</h1>
        <p className="text-sm text-slate-500 mt-1">Reset your HealthAI account credentials</p>
      </div>

      {submitted ? (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-sm space-y-3 text-center">
          <CheckCircle2 className="w-8 h-8 mx-auto text-teal-600" />
          <p className="font-semibold">{message}</p>
          <Link to="/login" className="btn-primary inline-flex mt-2">
            Proceed to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Registered Email
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              New Password (Min 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
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
            {loading ? 'Updating Password...' : 'Reset Password'}
          </button>

          <div className="text-center pt-4">
            <Link to="/login" className="text-sm font-semibold text-[#087f8c] hover:underline">
              ← Return to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
