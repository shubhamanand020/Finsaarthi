import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, Mail, Send } from 'lucide-react';
import apiClient from '../api/client';

const EMAIL_STORAGE_KEY = 'forgotPasswordEmail';
const RESET_TOKEN_STORAGE_KEY = 'forgotPasswordResetToken';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(sessionStorage.getItem(EMAIL_STORAGE_KEY) || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerError = (message) => {
    setError(message);
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRe.test(normalizedEmail)) {
      triggerError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: normalizedEmail });
      sessionStorage.setItem(EMAIL_STORAGE_KEY, normalizedEmail);
      sessionStorage.removeItem(RESET_TOKEN_STORAGE_KEY);
      navigate('/forgot-password/verify-otp');
    } catch (err) {
      triggerError(err.response?.data?.message || 'Unable to send OTP right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page page-enter">
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`login-card ${shake ? 'shake' : ''}`}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 17, background: 'var(--btn-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff' }}>
            <Mail size={26} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Forgot password
          </h1>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Enter your student email and we&apos;ll send you an OTP.
          </p>
        </div>

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

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
              EMAIL ADDRESS
            </label>
            <div className="apple-input-wrap">
              <Mail size={16} className="apple-input-icon" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="apple-input"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="apple-btn apple-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            {loading ? <><span className="btn-spinner" /> Sending OTP...</> : <><Send size={16} /> Send OTP</>}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/login/student" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
            <ArrowLeft size={15} />
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
