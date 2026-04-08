import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Menu, X, Sun, Moon } from 'lucide-react';
import finsaarthiLogo from '../../finsaarthi_logo.png';

export const Navigation = () => {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const navigate = useNavigate();
  const dropRef = useRef(null);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="nav-bar">
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.25rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* ── Logo ── */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img
            src={finsaarthiLogo}
            alt="FinSaarthi"
            style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8 }}
          />
          <span className="nav-logo-text">FinSaarthi</span>
        </Link>

        {/* ── Desktop Nav ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden md:flex">
          {user?.role === 'student' && (
            <>
              <Link to="/scholarships" className="nav-link">Scholarships</Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link">Admin Panel</Link>
          )}
          {user && <Link to="/profile" className="nav-link">Profile</Link>}
        </div>

        {/* ── Right side ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          {/* Home — desktop */}
          <div className="hidden md:block">
            <Link to="/" className="apple-btn apple-btn-secondary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}>
              Home
            </Link>
          </div>

          {/* Auth — desktop */}
          <div className="hidden md:block" style={{ position: 'relative' }} ref={dropRef}>
            {!user ? (
              <>
                <button
                  onClick={() => setDropOpen(v => !v)}
                  className="apple-btn apple-btn-primary"
                  style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}
                >
                  Account
                  <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>▾</span>
                </button>
                {dropOpen && (
                  <div className="nav-dropdown">
                    <Link to="/login/student" className="nav-dropdown-item" onClick={() => setDropOpen(false)}>
                      Login as Student
                    </Link>
                    <Link to="/login/admin" className="nav-dropdown-item" onClick={() => setDropOpen(false)}>
                      Login as Admin
                    </Link>
                    <div className="nav-dropdown-sep" />
                    <Link to="/register/student" className="nav-dropdown-item" onClick={() => setDropOpen(false)}>
                      Register as Student
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}
              >
                Logout
              </button>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggle}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            aria-label="Toggle theme"
          >
            <span className="theme-toggle-knob">
              {theme === 'light' ? '☀️' : '🌙'}
            </span>
          </button>

          {/* Hamburger — mobile */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: '0.25rem',
              lineHeight: 0,
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div
          style={{
            background: 'var(--glass-bg)',
            borderTop: '1px solid var(--border)',
            backdropFilter: 'blur(20px)',
            padding: '1rem 1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
          className="md:hidden"
        >
          <Link to="/" className="nav-link" onClick={() => setMobileOpen(false)}>Home</Link>

          {user?.role === 'student' && (
            <>
              <Link to="/scholarships" className="nav-link" onClick={() => setMobileOpen(false)}>Scholarships</Link>
              <Link to="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link" onClick={() => setMobileOpen(false)}>Admin Panel</Link>
          )}
          {user && <Link to="/profile" className="nav-link" onClick={() => setMobileOpen(false)}>Profile</Link>}

          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {!user ? (
              <>
                <Link to="/login/student" className="apple-btn apple-btn-primary" style={{ textAlign: 'center' }} onClick={() => setMobileOpen(false)}>
                  Login as Student
                </Link>
                <Link to="/login/admin" className="apple-btn apple-btn-secondary" style={{ textAlign: 'center' }} onClick={() => setMobileOpen(false)}>
                  Login as Admin
                </Link>
                <Link to="/register/student" className="apple-btn apple-btn-secondary" style={{ textAlign: 'center' }} onClick={() => setMobileOpen(false)}>
                  Register
                </Link>
              </>
            ) : (
              <button className="apple-btn apple-btn-secondary" onClick={handleLogout} style={{ width: '100%' }}>
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};