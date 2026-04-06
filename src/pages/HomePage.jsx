import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Users, TrendingUp, Award, ArrowRight, Star, Zap, Shield } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const HomePage = () => {
  const { user } = useAuth();

  /* Each section gets its own reveal scope */
  const statsRef    = useScrollReveal(0.12);
  const featuresRef = useScrollReveal(0.08);
  const ctaRef      = useScrollReveal(0.15);

  const stats = [
    { icon: <BookOpen size={22} />, label: 'Active Scholarships', value: '4+' },
    { icon: <Users size={22} />,    label: 'Students Helped',     value: '100+' },
    { icon: <TrendingUp size={22} />, label: 'Success Rate',      value: '85%' },
    { icon: <Award size={22} />,    label: 'Amount Disbursed',    value: '₹5L+' },
  ];

  const features = [
    { icon: <Zap size={20} />,       title: 'Easy Application',   desc: 'Simple, streamlined forms that save your time and effort.' },
    { icon: <TrendingUp size={20} />, title: 'Real-time Tracking', desc: 'Track your application status and get instant updates.' },
    { icon: <Star size={20} />,      title: 'Smart Matches',      desc: 'AI-powered recommendations based on your profile.' },
    { icon: <Shield size={20} />,    title: 'Expert Support',     desc: '24 / 7 guidance from education financing experts.' },
  ];

  return (
    <div className="page-enter">

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="hero-section">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 1.5rem', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>

            {/* Left — text (hero is always visible, no reveal needed) */}
            <div>
              <div className="hero-chip" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
                <div className="hero-chip-dot" />
                Scholarship Platform for India
              </div>

              <h1 className="hero-heading" style={{ marginBottom: '1.25rem' }}>
                Your Gateway to{' '}
                <span className="hero-heading-gradient">Educational<br />Excellence</span>
              </h1>

              <p className="hero-sub" style={{ marginBottom: '2.25rem' }}>
                Discover, apply, and secure scholarships that match your dreams.
                FinSaarthi connects deserving students with life-changing educational opportunities.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {user ? (
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="apple-btn apple-btn-primary">
                    {user.role === 'admin' ? 'Admin Panel' : 'Go to Dashboard'} <ArrowRight size={16} />
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="apple-btn apple-btn-primary">
                      Get Started <ArrowRight size={16} />
                    </Link>
                    <Link to="/scholarships" className="apple-btn apple-btn-secondary">
                      Browse Scholarships
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right — image card */}
            <div style={{ position: 'relative', paddingBottom: '2rem' }}>
              <div className="hero-img-card" style={{ transform: 'rotate(2deg)' }}>
                <img
                  src="https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                  alt="Student studying"
                  style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                    "FinSaarthi helped me secure ₹2 lakhs for my engineering degree. The process was seamless!"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.9rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--btn-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                      A
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Ayush Sharma</p>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Computer Engineering Student</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hero-badge">
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>🎓 2,000+ Students</p>
                <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>secured scholarships this year</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          STATS  — scroll reveal
      ══════════════════════════════════ */}
      <section
        ref={statsRef}
        style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '3.5rem 1.5rem', transition: 'background 0.35s ease' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          {stats.map((s, i) => (
            <div
              key={i}
              data-reveal
              className="stat-card"
              style={{ textAlign: 'center', '--reveal-delay': `${i * 0.08}s` }}
            >
              {/* Icon — pops with elastic bounce */}
              <div
                data-reveal="icon"
                className="icon-pill"
                style={{ margin: '0 auto 1rem', borderRadius: '50%', width: 52, height: 52, '--reveal-delay': `${i * 0.08 + 0.05}s` }}
              >
                {s.icon}
              </div>

              {/* Number */}
              <div
                data-reveal="stat"
                style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.35rem', '--reveal-delay': `${i * 0.08 + 0.12}s` }}
              >
                {s.value}
              </div>

              {/* Label */}
              <div
                data-reveal="text"
                style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500, '--reveal-delay': `${i * 0.08 + 0.18}s` }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          FEATURES  — scroll reveal
      ══════════════════════════════════ */}
      <section style={{ padding: '6rem 1.5rem', background: 'var(--bg-base)', transition: 'background 0.35s ease' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Section heading — its own reveal scope so it animates independently */}
          <FeatureHeading />

          {/* Cards grid */}
          <div
            ref={featuresRef}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                data-reveal
                className="feature-card"
                style={{ '--reveal-delay': `${i * 0.1}s` }}
              >
                {/* icon bounces separately */}
                <div
                  data-reveal="icon"
                  className="icon-pill"
                  style={{ '--reveal-delay': `${i * 0.1 + 0.08}s` }}
                >
                  {f.icon}
                </div>

                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {f.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════
          CTA  — scroll reveal
      ══════════════════════════════════ */}
      <section className="cta-section" ref={ctaRef}>
        <div className="hero-orb" style={{ width: 400, height: 400, top: -100, left: '10%', position: 'absolute', background: 'var(--orb-1)' }} />
        <div className="hero-orb" style={{ width: 300, height: 300, bottom: -80, right: '15%', position: 'absolute', background: 'var(--orb-2)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
          <p data-reveal="text" className="section-label">Get Started Today</p>

          <h2
            data-reveal
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1rem', lineHeight: 1.1, color: 'var(--text-primary)', '--reveal-delay': '0.1s' }}
          >
            Ready to start your{' '}
            <span className="cta-gradient-text">scholarship journey?</span>
          </h2>

          <p
            data-reveal="text"
            style={{ color: 'var(--text-secondary)', marginBottom: '2.25rem', fontSize: '1rem', '--reveal-delay': '0.18s' }}
          >
            Join thousands of students who've already found their perfect scholarship match.
          </p>

          {!user && (
            <div
              data-reveal
              style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', '--reveal-delay': '0.26s' }}
            >
              <Link to="/register" className="apple-btn apple-btn-primary">Create Free Account</Link>
              <Link to="/login"    className="apple-btn apple-btn-secondary">Sign In</Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

/* ── Feature section heading — own reveal scope ── */
function FeatureHeading() {
  const ref = useScrollReveal(0.2);
  return (
    <div ref={ref} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
      <p data-reveal="text" className="section-label">Why FinSaarthi?</p>
      <h2
        data-reveal
        style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '0.75rem', '--reveal-delay': '0.08s' }}
      >
        Everything you need,{' '}
        <span className="text-gradient">nothing you don't.</span>
      </h2>
      <p
        data-reveal="text"
        style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '50ch', margin: '0 auto', '--reveal-delay': '0.14s' }}
      >
        A comprehensive platform built to make scholarship discovery and application effortless.
      </p>
    </div>
  );
}