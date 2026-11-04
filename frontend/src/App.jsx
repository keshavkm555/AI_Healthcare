import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import HospitalsPage from './pages/HospitalsPage';
import DoctorsPage from './pages/DoctorsPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import AppointmentsPage from './pages/AppointmentsPage';
import VideoConsultPage from './pages/VideoConsultPage';
import LabTestsPage from './pages/LabTestsPage';
import ScansPage from './pages/ScansPage';
import HealthPackagesPage from './pages/HealthPackagesPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import VitalsPage from './pages/VitalsPage';
import FirstAidPage from './pages/FirstAidPage';
import EmergencyPage from './pages/EmergencyPage';
import BloodBankPage from './pages/BloodBankPage';
import HelplinesPage from './pages/HelplinesPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import DoctorPortalPage from './pages/DoctorPortalPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main App Layout */}
          <Route element={<AppLayout />}>
            {/* Public Accessible Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
            <Route path="/hospitals" element={<HospitalsPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/lab-tests" element={<LabTestsPage />} />
            <Route path="/scans" element={<ScansPage />} />
            <Route path="/health-packages" element={<HealthPackagesPage />} />
            <Route path="/first-aid" element={<FirstAidPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/blood-bank" element={<BloodBankPage />} />
            <Route path="/helplines" element={<HelplinesPage />} />

            {/* Authenticated Patient Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-appointment"
              element={
                <ProtectedRoute>
                  <BookAppointmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/video-consult"
              element={
                <ProtectedRoute>
                  <VideoConsultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions"
              element={
                <ProtectedRoute>
                  <PrescriptionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical-records"
              element={
                <ProtectedRoute>
                  <MedicalRecordsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vitals"
              element={
                <ProtectedRoute>
                  <VitalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Management Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Doctor Clinical Route */}
            <Route
              path="/doctor-portal"
              element={
                <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                  <DoctorPortalPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
