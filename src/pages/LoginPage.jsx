import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  Eye, EyeOff, Mail, Lock, Key,
  AlertCircle, GraduationCap, ShieldCheck,
} from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { getUserByCredentials } = useLocalStorage();
  const navigate = useNavigate();
  const { role: urlRole } = useParams();
  const formRef = useRef(null);

  const [role, setRole] = useState(urlRole === 'admin' ? 'admin' : 'student');
  const [formData, setFormData] = useState({ email: '', password: '', adminCode: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (urlRole) setRole(urlRole === 'admin' ? 'admin' : 'student');
  }, [urlRole]);

  const isAdmin = role === 'admin';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleRoleSwitch = (r) => {
    setFormData({ email: '', password: '', adminCode: '' });
    setError('');
    navigate(`/login/${r}`);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    /* Validate */
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      triggerShake();
      return;
    }
    if (!emailRe.test(formData.email)) {
      setError('Please enter a valid email address.');
      triggerShake();
      return;
    }
    if (isAdmin && formData.adminCode.trim() !== 'ADMIN2026') {
      setError('Invalid admin access code.');
      triggerShake();
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const user = getUserByCredentials(formData.email, formData.password);
        if (user && user.role === role) {
          login({ id: user.id, email: user.email, name: user.name, role: user.role });
          navigate(role === 'admin' ? '/admin' : '/dashboard');
        } else {
          setError(`Invalid credentials for ${role} access.`);
          triggerShake();
        }
      } catch {
        setError('Authentication service unavailable.');
        triggerShake();
      } finally {
        setLoading(false);
      }
    }, 1100);
  };

  return (
    <div className="login-page page-enter">

      {/* Ambient orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`login-card ${shake ? 'shake' : ''}`}
        ref={formRef}
      >
        {/* Header */}
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
            {isAdmin
              ? <ShieldCheck size={26} />
              : <GraduationCap size={26} />
            }
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.6rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}
          >
            {isAdmin ? 'Admin Portal' : 'Welcome back'}
          </h1>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isAdmin ? 'Authorized access only' : 'Sign in to your FinSaarthi account'}
          </p>
        </div>

        {/* Role Tabs */}
        <div className="login-role-tabs">
          <button
            type="button"
            className={`login-tab ${role === 'student' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('student')}
          >
            Student
          </button>
          <button
            type="button"
            className={`login-tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('admin')}
          >
            Admin
          </button>
        </div>

        {/* Error */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}
            >
              EMAIL ADDRESS
            </label>
            <div className="apple-input-wrap">
              <Mail size={16} className="apple-input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="name@university.edu"
                value={formData.email}
                onChange={handleChange}
                className="apple-input"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label
                htmlFor="password"
                style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}
              >
                PASSWORD
              </label>
            </div>
            <div className="apple-input-wrap">
              <Lock size={16} className="apple-input-icon" />
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="apple-input"
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPwd(v => !v)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Link
                to="#"
                style={{ fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}
                className="text-gradient"
              >
                Forgot password ?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="apple-btn apple-btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center', fontSize: '0.95rem' }}
          >
            {loading
              ? <><span className="btn-spinner" /> Verifying…</>
              : 'Sign In'
            }
          </button>

        </form>

        {/* Footer */}
        {/* Footer */}
        {!isAdmin && (
          <>
            <div className="login-divider">or</div>
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                margin: 0,
              }}
            >
              Don't have an account?{' '}
              <Link
                to={`/register/${role}`}
                className="text-gradient"
                style={{ fontWeight: 700, textDecoration: 'none' }}
              >
                Sign up free
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};