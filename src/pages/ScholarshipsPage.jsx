import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient, { extractArrayPayload } from '../api/client';
import { ScholarshipCard } from '../component/ScholarshipCard';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Search, BookOpen, X, SlidersHorizontal, Loader, Info } from 'lucide-react';
import { ScholarshipSkeleton } from '../component/Skeleton';

/* ── reusable Apple-style modal ── */
const Modal = ({ children, onClose }) => createPortal(
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }} onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}
  >
    <motion.div
      initial={{ scale: 0.96, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 15 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }} onClick={e => e.stopPropagation()}
      style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--borderStrong)', boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
        borderRadius: 24, maxWidth: 620, width: '100%', maxHeight: '88vh', overflowY: 'auto', position: 'relative', padding: '2rem'
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

const FormField = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
      {label}
    </label>
    {children}
  </div>
);

const formInput = {
  width: '100%', padding: '0.65rem 0.9rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)',
  borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
};

export const ScholarshipsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scholarships, setScholarships] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('deadline');

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);

  const cardsRef = useScrollReveal(0.06);

  // Fetch Data from Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch active scholarships
        const schRes = await apiClient.get('/scholarships');
        const safeScholarships = extractArrayPayload(schRes.data);
        const activeScholarships = safeScholarships.filter((s) => s.isActive !== false);
        setScholarships(activeScholarships);

        // Fetch user's existing applications to map "Applied" status
        if (user && user.role === 'student') {
          const appRes = await apiClient.get('/applications/my');
          setUserApplications(extractArrayPayload(appRes.data));
        }
      } catch (error) {
        console.error("Failed to fetch scholarships", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const categories = [...new Set(scholarships.map(s => s.category).filter(Boolean))];

  const hasUserApplied = (scholarshipId) => {
    return userApplications.some(app => app.scholarshipId === scholarshipId);
  };

  const filtered = useMemo(() => {
    let list = scholarships.filter(s => {
      const term = searchTerm.toLowerCase();
      const titleMatch = s.title?.toLowerCase().includes(term) || false;
      const descMatch = s.description?.toLowerCase().includes(term) || false;
      const provMatch = s.provider?.toLowerCase().includes(term) || false;
      
      return (titleMatch || descMatch || provMatch) &&
             (selectedCategory === '' || s.category === selectedCategory);
    });
    
    list.sort((a, b) =>
      sortBy === 'amount' ? b.amount - a.amount :
      sortBy === 'deadline' ? new Date(a.deadline) - new Date(b.deadline) :
      (a.title || '').localeCompare(b.title || '')
    );
    return list;
  }, [scholarships, searchTerm, selectedCategory, sortBy]);

  const handleViewDetails = id => {
    const s = scholarships.find(sch => sch.id === id);
    if (!s) return;
    setDetailsData(s);
    setShowDetailsModal(true);
  };

  const handleApply = id => {
    if (!user) { navigate('/login/student'); return; }
    navigate(`/scholarships/${id}/apply`);
  };


  const selectStyle = { ...formInput, cursor: 'pointer' };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

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
              <div
                style={{
                  position: 'absolute', right: 8, zIndex: 3, width: 34, height: 34, borderRadius: 10,
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
                  value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <select
              value={sortBy} onChange={e => setSortBy(e.target.value)}
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
            <Link to="/login/student" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#EA580C', textDecoration: 'none' }}>
              Login to apply →
            </Link>
          )}
        </div>

        <div style={{ marginTop: '3rem' }}>
          {isLoading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}>
              {[1, 2, 3, 4, 5, 6].map(i => <ScholarshipSkeleton key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <motion.div 
              layout
              ref={cardsRef}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map(s => (
                  <motion.div
                    layout
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ScholarshipCard
                      scholarship={s}
                      onApply={user?.role === 'student' ? () => handleApply(s.id) : undefined}
                      onView={() => handleViewDetails(s.id)}
                      hasApplied={user?.role === 'student' ? hasUserApplied(s.id) : false}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', py: '5rem', background: 'var(--bg-surface)', borderRadius: 24, border: '1px solid var(--border)', padding: '5rem 2rem', boxShadow: 'var(--glass-shadow)' }}
            >
              <div style={{ color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
                <Info size={48} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No scholarships found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters to find more opportunities.</p>
            </motion.div>
          )}
        </div>
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
              ₹{detailsData.amount?.toLocaleString('en-IN')}
            </p>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Deadline: <strong style={{ color: 'var(--text-primary)' }}>{new Date(detailsData.deadline).toLocaleDateString('en-IN')}</strong>
            </p>

            <h4 style={{ margin: '0 0 0.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Description</h4>
            <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>{detailsData.description}</p>

            <h4 style={{ margin: '0 0 0.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Eligibility</h4>
            <ul style={{ margin: '0 0 1rem', paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.8 }}>
              {(detailsData.eligibility || detailsData.eligibilityCriteria || []).map((e, i) => <li key={i}>{e}</li>)}
            </ul>

            <h4 style={{ margin: '0 0 0.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Required Documents</h4>
            <ul style={{ margin: '0 0 1.5rem', paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.8 }}>
              {detailsData.requirements?.map((d, i) => <li key={i}>{d}</li>)}
            </ul>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowDetailsModal(false)} className="apple-btn apple-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Close</button>
              {user?.role === 'student' && !hasUserApplied(detailsData.id) && (
                <button onClick={() => handleApply(detailsData.id)} className="apple-btn apple-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Apply Now</button>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

    </div>
  );
};
