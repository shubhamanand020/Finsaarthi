import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './component/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminPanel } from './pages/AdminPanel';
import { ScholarshipsPage } from './pages/ScholarshipsPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Fallback route: redirects unknown URLs to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;