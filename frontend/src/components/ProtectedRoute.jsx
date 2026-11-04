import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f8fb]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#087f8c] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600">Verifying secure medical session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded-xl border border-red-200 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Restricted</h2>
        <p className="text-slate-600 mb-6">
          Your account role ({user.role}) does not have permission to view this section.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return children;
}
