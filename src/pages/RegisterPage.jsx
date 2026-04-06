import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import {
  Eye, EyeOff, AlertCircle,
  User, Mail, Lock, GraduationCap, Phone,
} from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    phone: '',
  });

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  /* Password strength */
  const pwStrength = (() => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score; // 0-5
  })();

  const strengthLabel = ['', 'Too weak', 'Weak', 'Fair', 'Strong', 'Very strong'][pwStrength];
  const strengthColor = ['', '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007AFF'][pwStrength];

  const triggerShake = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Updated RFC 5322 Simplified Email Regex
    const emailRe = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (!formData.name.trim()) return triggerShake('Please enter your full name.');
    if (!emailRe.test(formData.email)) return triggerShake('Please enter a valid email address.');
    if (formData.password.length < 8) return triggerShake('Password must be at least 8 characters.');
    if (formData.password !== formData.confirmPassword) return triggerShake('Passwords do not match.');
    setLoading(true);
    
    try {
      // Real API Call to Backend
      await apiClient.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
      });

      const normalizedEmail = formData.email.toLowerCase();
      sessionStorage.setItem('pendingRegistrationEmail', normalizedEmail);
      navigate('/register/verify-otp', {
        state: { email: normalizedEmail },
      });
      
    } catch (err) {
      console.error("Registration Error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        triggerShake(err.response.data.message); // If backend sends specific error
      } else {
        triggerShake('An error occurred while creating your account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Field definitions ── */
  const fields = [
    {
      id: 'name', name: 'name', type: 'text',
      label: 'FULL NAME', placeholder: 'Ayush Sharma',
      icon: <User size={16} />, autoComplete: 'name',
    },
    {
      id: 'email', name: 'email', type: 'email',
      label: 'EMAIL ADDRESS', placeholder: 'name@university.edu',
      icon: <Mail size={16} />, autoComplete: 'email',
    },
    {
      id: 'university', name: 'university', type: 'text',
      label: 'UNIVERSITY', placeholder: 'IIT Bombay, BITS Pilani…',
      icon: <GraduationCap size={16} />, autoComplete: 'organization', required: false,
    },
    {
      id: 'phone', name: 'phone', type: 'tel',
      label: 'PHONE NUMBER', placeholder: '+91 98765 43210',
      icon: <Phone size={16} />, autoComplete: 'tel', required: false,
    },
  ];

  return (
    <div className="login-page page-enter" style={{ alignItems: 'flex-start', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>

      {/* Ambient orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`login-card ${shake ? 'shake' : ''}`}
        style={{ maxWidth: 480 }}
      >
        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: 17,
              background: 'var(--btn-primary-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem', color: '#fff',
            }}
          >
            <GraduationCap size={26} />
          </div>
          <h1
            style={{
              margin: 0, fontSize: '1.6rem', fontWeight: 800,
              letterSpacing: '-0.03em', color: 'var(--text-primary)',
            }}
          >
            Create your account
          </h1>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Join FinSaarthi and start applying for scholarships
          </p>
        </div>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="err"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="error-box">
                <AlertCircle size={16} />
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >

          {/* Regular fields */}
          {fields.map(f => (
            <div key={f.id}>
              <label
                htmlFor={f.id}
                style={{
                  display: 'block', marginBottom: '0.4rem',
                  fontSize: '0.82rem', fontWeight: 600,
                  color: 'var(--text-secondary)', letterSpacing: '0.02em',
                }}
              >
                {f.label}
              </label>
              <div className="apple-input-wrap">
                <span className="apple-input-icon">{f.icon}</span>
                <input
                  id={f.id}
                  name={f.name}
                  type={f.type}
                  required={f.required ?? true}
                  autoComplete={f.autoComplete}
                  placeholder={f.placeholder}
                  value={formData[f.name]}
                  onChange={handleChange}
                  className="apple-input"
                />
              </div>
            </div>
          ))}

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block', marginBottom: '0.4rem',
                fontSize: '0.82rem', fontWeight: 600,
                color: 'var(--text-secondary)', letterSpacing: '0.02em',
              }}
            >
              PASSWORD
            </label>
            <div className="apple-input-wrap">
              <Lock size={16} className="apple-input-icon" />
              <input
                id="password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                className="apple-input"
                style={{ paddingRight: '2.75rem' }}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength bar */}
            {formData.password && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '0.3rem' }}>
                  {[1,2,3,4,5].map(i => (
                    <div
                      key={i}
                      style={{
                        flex: 1, height: 3, borderRadius: 4,
                        background: i <= pwStrength ? strengthColor : 'var(--border)',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: '0.72rem', color: strengthColor, fontWeight: 600 }}>
                  {strengthLabel}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block', marginBottom: '0.4rem',
                fontSize: '0.82rem', fontWeight: 600,
                color: 'var(--text-secondary)', letterSpacing: '0.02em',
              }}
            >
              CONFIRM PASSWORD
            </label>
            <div className="apple-input-wrap">
              <Lock size={16} className="apple-input-icon" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="apple-input"
                style={{
                  paddingRight: '2.75rem',
                  borderColor: formData.confirmPassword
                    ? formData.password === formData.confirmPassword
                      ? '#34c759'
                      : '#ff3b30'
                    : undefined,
                }}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Match indicator */}
            {formData.confirmPassword && (
              <p
                style={{
                  margin: '0.3rem 0 0',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: formData.password === formData.confirmPassword ? '#34c759' : '#ff3b30',
                }}
              >
                {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="apple-btn apple-btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center', fontSize: '0.95rem' }}
          >
            {loading ? <><span className="btn-spinner" /> Creating account...</> : 'Create Account & Send OTP'}
          </button>

        </form>

        {/* Footer */}
        <div className="login-divider">or</div>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          Already have an account?{' '}
          <Link
            to="/login/student"
            className="text-gradient"
            style={{ fontWeight: 700, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </p>

      </motion.div>
    </div>
  );
};
