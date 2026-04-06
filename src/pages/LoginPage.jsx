import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client'; // Import the real API client
import { CaptchaField } from '../component/CaptchaField';
import {
  Eye, EyeOff, Mail, Lock,
  AlertCircle, GraduationCap, ShieldCheck,
} from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { role: urlRole } = useParams();
  const formRef = useRef(null);

  const [role, setRole] = useState(urlRole === 'admin' ? 'admin' : 'student');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [captcha, setCaptcha] = useState({ captchaId: '', captchaInput: '' });
  const [captchaRefreshSignal, setCaptchaRefreshSignal] = useState(0);

  useEffect(() => {
    if (location.state?.verifiedEmail) {
      setFormData((prev) => ({ ...prev, email: location.state.verifiedEmail }));
      setError('');
    }
  }, [location.state]);

  useEffect(() => {
    if (urlRole) setRole(urlRole === 'admin' ? 'admin' : 'student');
  }, [urlRole]);

  const isAdmin = role === 'admin';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleRoleSwitch = (r) => {
    setFormData({ email: '', password: '' });
    setError('');
    setCaptcha({ captchaId: '', captchaInput: '' });
    setCaptchaRefreshSignal((prev) => prev + 1);
    navigate(`/login/${r}`);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const handleSubmit = async (e) => {
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
    if (!captcha.captchaId || !captcha.captchaInput.trim()) {
      setError('Please complete the captcha challenge.');
      triggerShake();
      return;
    }

    setLoading(true);
    
    try {
      // Make real API call to the backend
      const response = await apiClient.post('/auth/login', {
        email: formData.email,
        password: formData.password,
        captchaId: captcha.captchaId,
        captchaInput: captcha.captchaInput.trim(),
      });

      // Support both wrapped ({ data: { token, user } }) and direct ({ token, user }) payloads
      const payload = response?.data?.data ?? response?.data;
      const token = payload?.token;
      const user = payload?.user;

      if (!token || !user?.role) {
        setError('Unexpected login response from server. Please try again.');
        triggerShake();
        setLoading(false);
        return;
      }
      
      // Check if user role matches the portal they are trying to log into
      const normalizedRole = String(user.role).toLowerCase();
      if (normalizedRole !== role) {
        setError(`Invalid credentials for ${role} access.`);
        triggerShake();
        setLoading(false);
        return;
      }

      // Pass user object and JWT token to context
      login(user, token);
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      
    } catch (err) {
      console.error("Login Error:", err);
      setCaptcha({ captchaId: '', captchaInput: '' });
      setCaptchaRefreshSignal((prev) => prev + 1);
      // Handle different error status codes from backend
      if (err.response && err.response.status === 401) {
        setError('Incorrect email or password.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Authentication service unavailable. Please try again later.');
      }
      triggerShake();
    } finally {
      setLoading(false);
    }
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
            {isAdmin ? <ShieldCheck size={26} /> : <GraduationCap size={26} />}
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
                to="/forgot-password"
                style={{ fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}
                className="text-gradient"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <CaptchaField
              value={captcha}
              onChange={setCaptcha}
              refreshSignal={captchaRefreshSignal}
              error={!captcha.captchaInput.trim() && error.toLowerCase().includes('captcha') ? error : ''}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="apple-btn apple-btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center', fontSize: '0.95rem' }}
          >
            {loading ? <><span className="btn-spinner" /> Verifying…</> : 'Sign In'}
          </button>

        </form>

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
