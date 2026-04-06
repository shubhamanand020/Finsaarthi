import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // IMPORT TOASTER
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './component/Layout';
import { ErrorBoundary } from './component/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminPanel } from './pages/AdminPanel';
import { ScholarshipsPage } from './pages/ScholarshipsPage';
import { ScholarshipApplyPage } from './pages/ScholarshipApplyPage';
import { ProfilePage } from './pages/ProfilePage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { VerifyRegistrationOtpPage } from './pages/VerifyRegistrationOtpPage';
import { VerifyForgotOtpPage } from './pages/VerifyForgotOtpPage';
import { UpdateForgotPasswordPage } from './pages/UpdateForgotPasswordPage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            {/* Global Toast Notifications Config */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                },
                success: {
                  iconTheme: { primary: '#34c759', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ff3b30', secondary: '#fff' },
                },
              }}
            />
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login/:role" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/register/student" element={<RegisterPage />} />
                <Route path="/register/verify-otp" element={<VerifyRegistrationOtpPage />} />
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/scholarships" element={<ScholarshipsPage />} />
                <Route path="/scholarships/:id/apply" element={<ScholarshipApplyPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/forgot-password/verify-otp" element={<VerifyForgotOtpPage />} />
                <Route path="/forgot-password/update-password" element={<UpdateForgotPasswordPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
