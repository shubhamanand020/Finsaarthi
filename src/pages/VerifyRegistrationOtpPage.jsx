import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';

export const VerifyRegistrationOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const email = useMemo(
    () => location.state?.email || sessionStorage.getItem('pendingRegistrationEmail') || '',
    [location.state?.email]
  );

  const triggerShake = (message) => {
    setError(message);
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email) {
      triggerShake('Registration email not found. Please create your account again.');
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      triggerShake('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/auth/verify-registration-otp', {
        email,
        otp: otp.trim(),
      });

      sessionStorage.removeItem('pendingRegistrationEmail');
      navigate('/login/student', {
        replace: true,
        state: { verifiedEmail: email },
      });
    } catch (err) {
      triggerShake(err.response?.data?.message || 'Unable to verify OTP right now. Please try again.');
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
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 17,
              background: 'var(--btn-primary-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#fff',
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Verify your email
          </h1>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Enter the OTP sent to <strong style={{ color: 'var(--text-primary)' }}>{email || 'your email'}</strong>
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
            <label
              htmlFor="otp"
              style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}
            >
              ONE-TIME PASSWORD
            </label>
            <div className="apple-input-wrap">
              <Mail size={16} className="apple-input-icon" />
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                className="apple-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="apple-btn apple-btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center', fontSize: '0.95rem' }}
          >
            {loading ? <><span className="btn-spinner" /> Verifying...</> : 'Verify OTP'}
          </button>
        </form>

        <div className="login-divider">or</div>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          Need to start over?{' '}
          <Link to="/register/student" className="text-gradient" style={{ fontWeight: 700, textDecoration: 'none' }}>
            Register again
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
