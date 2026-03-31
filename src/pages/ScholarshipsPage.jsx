import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ScholarshipCard } from '../component/ScholarshipCard';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Search, BookOpen, X, SlidersHorizontal } from 'lucide-react';

/* ── reusable Apple-style modal ── */
const Modal = ({ children, onClose }) => createPortal(
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}
  >
    <motion.div
      initial={{ scale: 0.96, y: 15 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.96, y: 15 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={e => e.stopPropagation()}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--borderStrong)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
        borderRadius: 24,
        maxWidth: 620, width: '100%', maxHeight: '88vh', overflowY: 'auto', position: 'relative', padding: '2rem'
      }}
    >
      <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--bg-surface)', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
        <X size={18} />
      </button>
      {children}
    </motion.div>
  </motion.div>,
  document.body
);

/* ── reusable Apple-style form input ── */
const FormField = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
      {label}
    </label>
    {children}
  </div>
);

const formInput = {
  width: '100%', padding: '0.65rem 0.9rem',
  background: 'var(--input-bg)', border: '1px solid var(--input-border)',
  borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.9rem',
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
};

export const ScholarshipsPage = () => {
  const { user } = useAuth();
  const { getActiveScholarships, hasUserApplied, addApplication, getScholarshipById } = useLocalStorage();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy]                   = useState('deadline');

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData]           = useState(null);

  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship]   = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    name: user?.name || '', email: user?.email || '',
    phone: '', address: '', education: '', gpa: 0,
  });

  const cardsRef = useScrollReveal(0.06);

  const scholarships = getActiveScholarships();
  const categories   = [...new Set(scholarships.map(s => s.category))];

  const filtered = useMemo(() => {
    let list = scholarships.filter(s => {
      const term = searchTerm.toLowerCase();
      return (
        (s.title.toLowerCase().includes(term) || s.description.toLowerCase().includes(term) || s.provider.toLowerCase().includes(term)) &&
        (selectedCategory === '' || s.category === selectedCategory)
      );
    });
    list.sort((a, b) =>
      sortBy === 'amount'   ? b.amount - a.amount :
      sortBy === 'deadline' ? new Date(a.deadline) - new Date(b.deadline) :
      a.title.localeCompare(b.title)
    );
    return list;
  }, [scholarships, searchTerm, selectedCategory, sortBy]);

  const handleViewDetails = id => {
    const s = getScholarshipById(id);
    if (!s) return;
    setDetailsData(s);
    setShowDetailsModal(true);
  };

  const handleApply = id => {
    if (!user) { navigate('/login'); return; }
    setSelectedScholarship(id);
    setShowApplicationModal(true);
    setShowDetailsModal(false);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!user || !selectedScholarship) return;
    addApplication({ studentId: user.id, scholarshipId: selectedScholarship, status: 'pending', studentDetails: applicationForm });
    setShowApplicationModal(false);
    setSelectedScholarship(null);
    setApplicationForm({ name: user.name, email: user.email, phone: '', address: '', education: '', gpa: 0 });
    alert('Application submitted successfully!');
  };

  const selectStyle = { ...formInput, cursor: 'pointer' };

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '3rem 1.5rem', transition: 'background 0.35s ease' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* ── Page header ── */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="section-label">Opportunities</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Available <span className="text-gradient">Scholarships</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '52ch', margin: '0 auto' }}>
            Discover scholarship opportunities that match your profile and educational goals.
          </p>
        </div>

        {/* ── Search + Filters ── */}
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {/* Search + Categories Icon */}
            <div style={{ flex: '1 1 260px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-tertiary)', pointerEvents: 'none', zIndex: 2 }} />
              <input
                type="text"
                placeholder="Search scholarships…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ ...formInput, paddingLeft: '2.6rem', paddingRight: '3.5rem' }}
                className="apple-input"
              />
              
              {/* Category Dropdown (Invisible select over an icon) */}
              <div
                style={{
                  position: 'absolute', right: 8, zIndex: 3,
                  width: 34, height: 34, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: selectedCategory ? 'rgba(234,88,12,0.1)' : 'var(--bg-elevated)',
                  color: selectedCategory ? '#EA580C' : 'var(--text-secondary)',
                  border: `1px solid ${selectedCategory ? 'rgba(234,88,12,0.2)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                title="Filter by Category"
              >
                <SlidersHorizontal size={15} />
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ ...selectStyle, width: 'auto', flexShrink: 0, paddingRight: '2rem' }}
              className="apple-input"
            >
              <option value="deadline">Sort: Deadline</option>
              <option value="amount">Sort: Amount</option>
              <option value="title">Sort: Title</option>
            </select>
          </div>
        </div>

        {/* ── Count row ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of {scholarships.length} scholarships
          </p>
          {!user && (
            <Link to="/login" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#EA580C', textDecoration: 'none' }}>
              Login to apply →
            </Link>
          )}
        </div>

        {/* ── Grid ── */}
        {filtered.length > 0 ? (
          <div
            ref={cardsRef}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}
          >
            {filtered.map((s, i) => (
              <div key={s.id} data-reveal style={{ '--reveal-delay': `${i * 0.06}s` }}>
                <ScholarshipCard
                  scholarship={s}
                  onApply={user ? () => handleApply(s.id) : undefined}
                  onView={() => handleViewDetails(s.id)}
                  hasApplied={user ? hasUserApplied(user.id, s.id) : false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div className="icon-pill" style={{ margin: '0 auto 1.25rem', width: 64, height: 64, borderRadius: '50%' }}>
              <BookOpen size={28} />
            </div>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>No scholarships found</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* ── View Details Modal ── */}
      <AnimatePresence>
        {showDetailsModal && detailsData && (
          <Modal onClose={() => setShowDetailsModal(false)}>
          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', paddingRight: '2rem' }}>
            {detailsData.title}
          </h2>
          <p style={{ margin: '0 0 0.75rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            by <strong style={{ color: 'var(--text-primary)' }}>{detailsData.provider}</strong>
          </p>
          <p style={{ margin: '0 0 1rem', fontSize: '1.6rem', fontWeight: 800, color: '#EA580C', letterSpacing: '-0.03em' }}>
            ₹{detailsData.amount.toLocaleString('en-IN')}
          </p>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Deadline: <strong style={{ color: 'var(--text-primary)' }}>{new Date(detailsData.deadline).toLocaleDateString('en-IN')}</strong>
          </p>

          <h4 style={{ margin: '0 0 0.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Description</h4>
          <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>{detailsData.description}</p>

          <h4 style={{ margin: '0 0 0.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Eligibility</h4>
          <ul style={{ margin: '0 0 1rem', paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.8 }}>
            {detailsData.eligibility.map((e, i) => <li key={i}>{e}</li>)}
          </ul>

          <h4 style={{ margin: '0 0 0.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Required Documents</h4>
          <ul style={{ margin: '0 0 1.5rem', paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.8 }}>
            {detailsData.requirements.map((d, i) => <li key={i}>{d}</li>)}
          </ul>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setShowDetailsModal(false)} className="apple-btn apple-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Close</button>
            {user?.role === 'student' && !hasUserApplied(user.id, detailsData.id) && (
              <button onClick={() => handleApply(detailsData.id)} className="apple-btn apple-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Apply Now</button>
            )}
          </div>
        </Modal>
        )}
      </AnimatePresence>

      {/* ── Application Modal ── */}
      <AnimatePresence>
        {showApplicationModal && selectedScholarship && (
          <Modal onClose={() => setShowApplicationModal(false)}>
          <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', paddingRight: '2rem' }}>
            Apply for Scholarship
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <FormField label="FULL NAME">
                <input type="text" required value={applicationForm.name} onChange={e => setApplicationForm({ ...applicationForm, name: e.target.value })} style={formInput} />
              </FormField>
              <FormField label="EMAIL">
                <input type="email" required value={applicationForm.email} onChange={e => setApplicationForm({ ...applicationForm, email: e.target.value })} style={formInput} />
              </FormField>
              <FormField label="PHONE">
                <input type="tel" required value={applicationForm.phone} onChange={e => setApplicationForm({ ...applicationForm, phone: e.target.value })} style={formInput} />
              </FormField>
              <FormField label="GPA / PERCENTAGE">
                <input type="number" required min="0" max="100" step="0.01" value={applicationForm.gpa} onChange={e => setApplicationForm({ ...applicationForm, gpa: parseFloat(e.target.value) })} style={formInput} />
              </FormField>
            </div>
            <FormField label="ADDRESS">
              <textarea required rows={3} value={applicationForm.address} onChange={e => setApplicationForm({ ...applicationForm, address: e.target.value })} style={{ ...formInput, resize: 'vertical' }} />
            </FormField>
            <FormField label="EDUCATIONAL BACKGROUND">
              <textarea required rows={3} value={applicationForm.education} onChange={e => setApplicationForm({ ...applicationForm, education: e.target.value })} style={{ ...formInput, resize: 'vertical' }} />
            </FormField>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowApplicationModal(false)} className="apple-btn apple-btn-secondary">Cancel</button>
              <button type="submit" className="apple-btn apple-btn-primary">Submit Application</button>
            </div>
          </form>
        </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};