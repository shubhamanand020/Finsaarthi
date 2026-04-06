import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import apiClient from '../api/client';
import { toast } from 'react-hot-toast';

const EMAIL_STORAGE_KEY = 'forgotPasswordEmail';

export const UpdateForgotPasswordPage = () => {
  const navigate = useNavigate();
  const email = useMemo(() => sessionStorage.getItem(EMAIL_STORAGE_KEY) || '', []);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!email) {
      navigate('/forgot-password');
      return;
    }

    if (password.length < 8) {
      triggerError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      triggerError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/update-password', {
        email,
        newPassword: password,
      });
      sessionStorage.removeItem(EMAIL_STORAGE_KEY);
      toast.success('Password updated successfully. You can now log in.');
      navigate('/login/student');
    } catch (err) {
      triggerError(err.response?.data?.message || 'Unable to update password.');
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
            <Lock size={26} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Update password
          </h1>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Set a new password for {email || 'your account'}.
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
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
              NEW PASSWORD
            </label>
            <div className="apple-input-wrap">
              <Lock size={16} className="apple-input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="apple-input"
                style={{ paddingRight: '2.75rem' }}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
              CONFIRM PASSWORD
            </label>
            <div className="apple-input-wrap">
              <Lock size={16} className="apple-input-icon" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="apple-input"
                style={{ paddingRight: '2.75rem' }}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowConfirmPassword((value) => !value)}>
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="apple-btn apple-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            {loading ? <><span className="btn-spinner" /> Updating...</> : 'Update Password'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/forgot-password/verify-otp" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
            <ArrowLeft size={15} />
            Back to OTP verification
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
