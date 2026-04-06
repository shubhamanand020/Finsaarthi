import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { ScholarshipCard } from '../component/ScholarshipCard';
import { useScrollReveal } from '../hooks/useScrollReveal';
import {
  Search, BookOpen, Clock, CheckCircle,
  XCircle, AlertCircle, X, ArrowRight, SlidersHorizontal, Loader, TrendingUp
} from 'lucide-react';
import Skeleton, { DashboardStatSkeleton, ScholarshipSkeleton } from '../component/Skeleton';
import { useNavigate } from 'react-router-dom';

/* ── Modal ── */
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

const formInput = { width: '100%', padding: '0.65rem 0.9rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' };
const FormField = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>{label}</label>
    {children}
  </div>
);

const STATUS_CONFIG = {
  approved:     { icon: <CheckCircle size={14} />, bg: 'rgba(52,199,89,0.14)',  color: '#28cd41', label: 'Approved' },
  rejected:     { icon: <XCircle    size={14} />, bg: 'rgba(255,59,48,0.12)',  color: '#ff3b30', label: 'Rejected' },
  'under-review':{ icon: <AlertCircle size={14}/>, bg: 'rgba(255,159,10,0.15)', color: '#ff9f0a', label: 'Under Review' },
  pending:      { icon: <Clock      size={14} />, bg: 'rgba(234,88,12,0.12)', color: '#EA580C', label: 'Pending' },
};

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('deadline');

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

  const statsRef = useScrollReveal(0.1);
  const cardsRef = useScrollReveal(0.06);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const [schRes, appRes] = await Promise.all([
          apiClient.get('/scholarships'),
          apiClient.get('/applications/my')
        ]);
        
        // SAFELY EXTRACT ARRAYS
        const safeScholarships = Array.isArray(schRes.data) ? schRes.data : (schRes.data?.content || schRes.data?.data || []);
        const safeApplications = Array.isArray(appRes.data) ? appRes.data : (appRes.data?.content || appRes.data?.data || []);

        setScholarships(safeScholarships.filter(s => s.isActive !== false));
        setApplications(safeApplications);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  // MOVED useMemo HERE: Above the early returns!
  const filtered = useMemo(() => {
    let list = scholarships.filter(s => {
      const t = searchTerm.toLowerCase();
      return ((s.title?.toLowerCase() || '').includes(t) || (s.description?.toLowerCase() || '').includes(t) || (s.provider?.toLowerCase() || '').includes(t))
        && (selectedCategory === '' || s.category === selectedCategory);
    });
    list.sort((a, b) =>
      sortBy === 'amount' ? b.amount - a.amount :
      sortBy === 'deadline' ? new Date(a.deadline) - new Date(b.deadline) :
      (a.title || '').localeCompare(b.title || '')
    );
    return list;
  }, [scholarships, searchTerm, selectedCategory, sortBy]);

  // EARLY RETURNS MUST GO AFTER ALL HOOKS
  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Please log in to access your dashboard.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <Skeleton width="300px" height="2.5rem" />
            <Skeleton width="450px" height="1.2rem" style={{ marginTop: '0.5rem' }} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[1, 2, 3].map(i => <DashboardStatSkeleton key={i} />)}
          </div>

          <div className="glass-card" style={{ height: '400px' }}>
            <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem' }}>
              <Skeleton width="150px" height="2rem" />
              <Skeleton width="150px" height="2rem" />
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {[1, 2, 3].map(i => <ScholarshipSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasUserApplied = (scholarshipId) => {
    return applications.some(app => app.scholarshipId === scholarshipId);
  };

  const getScholarshipById = (id) => scholarships.find(s => s.id === id);

  const categories = [...new Set(scholarships.map(s => s.category).filter(Boolean))];

  const handleViewDetails = id => {
    const s = getScholarshipById(id);
    if (!s) return;
    setDetailsData(s);
    setShowDetailsModal(true);
  };

  const handleApply = id => {
    navigate(`/scholarships/${id}/apply`);
  };


  const dashStats = [
    { icon: <BookOpen size={22} />, label: 'Available',    value: scholarships.length },
    { icon: <Clock    size={22} />, label: 'Applied',      value: applications.length },
    { icon: <CheckCircle size={22}/>,label:'Approved',     value: applications.filter(a => (a.status || '').toLowerCase() === 'approved').length },
  ];

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '3rem 1.5rem', transition: 'background 0.35s ease' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', margin: 0, marginBottom: '0.35rem' }}>
            Welcome back, <span className="text-gradient">{user.name}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Track your applications and discover new scholarship opportunities.
          </p>
        </div>

        <div ref={statsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {dashStats.map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card" 
              style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', gap: '1rem' }}
            >
              <div className="icon-pill" style={{ flexShrink: 0, marginBottom: 0, width: 44, height: 44, borderRadius: 12 }}>{s.icon}</div>
              <div>
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}
                >
                  {s.value}
                </motion.p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2, fontWeight: 500 }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.5rem' }}>
            {[{ id: 'browse', label: 'Browse Scholarships' }, { id: 'applications', label: `My Applications (${applications.length})` }].map(t => (
              <button
                key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ padding: '1rem 0.25rem', marginRight: '2rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: activeTab === t.id ? '#EA580C' : 'var(--text-secondary)', borderBottom: `2px solid ${activeTab === t.id ? '#EA580C' : 'transparent'}`, transition: 'color 0.2s, border-color 0.2s' }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '1.5rem' }}>
            {activeTab === 'browse' ? (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                  <div style={{ flex: '1 1 220px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-tertiary)', pointerEvents: 'none', zIndex: 2 }} />
                    <input type="text" placeholder="Search scholarships…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...formInput, paddingLeft: '2.4rem', paddingRight: '2.75rem' }} className="apple-input" />
                    <div style={{ position: 'absolute', right: 6, zIndex: 3, width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedCategory ? 'rgba(234,88,12,0.1)' : 'var(--bg-elevated)', color: selectedCategory ? '#EA580C' : 'var(--text-secondary)', border: `1px solid ${selectedCategory ? 'rgba(234,88,12,0.2)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s' }} title="Filter by Category">
                      <SlidersHorizontal size={14} />
                      <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...formInput, cursor: 'pointer', width: 'auto', flexShrink: 0, paddingRight: '1.75rem' }} className="apple-input">
                    <option value="deadline">Sort: Deadline</option>
                    <option value="amount">Sort: Amount</option>
                    <option value="title">Sort: Title</option>
                  </select>
                </div>

                {filtered.length > 0 ? (
                  <motion.div 
                    layout
                    ref={cardsRef} 
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}
                  >
                    <AnimatePresence mode="popLayout">
                      {filtered.map((s, i) => (
                        <motion.div 
                          layout
                          key={s.id} 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ScholarshipCard scholarship={s} onApply={() => handleApply(s.id)} onView={() => handleViewDetails(s.id)} hasApplied={hasUserApplied(s.id)} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="icon-pill" style={{ margin: '0 auto 1rem', width: 56, height: 56, borderRadius: '50%' }}><BookOpen size={24} /></div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No scholarships found</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem' }}>Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {applications.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {applications.map(app => {
                      const sch = getScholarshipById(app.scholarshipId) || { title: 'Unknown Scholarship', provider: 'N/A', amount: 0 };
                      const statusKey = (app.status || 'pending').toLowerCase();
                      const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.pending;
                      
                      return (
                        <div key={app.id} style={{
                          background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem 1.5rem',
                          display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start',
                        }}>
                          <div>
                            <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{sch.title}</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              Applied {new Date(app.submittedAt || Date.now()).toLocaleDateString('en-IN')} · {sch.provider}
                            </p>
                            {app.adminNotes && (
                              <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Note: {app.adminNotes}</p>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#EA580C' }}>₹{sch.amount?.toLocaleString('en-IN')}</p>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                              {cfg.icon}{cfg.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="icon-pill" style={{ margin: '0 auto 1rem', width: 56, height: 56, borderRadius: '50%' }}><Clock size={24} /></div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No applications yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>Start browsing scholarships and apply to ones that match your profile.</p>
                    <button onClick={() => setActiveTab('browse')} className="apple-btn apple-btn-primary">Browse Scholarships <ArrowRight size={16} /></button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDetailsModal && detailsData && (
          <Modal onClose={() => setShowDetailsModal(false)}>
          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', paddingRight: '2rem' }}>{detailsData.title}</h2>
          <p style={{ margin: '0 0 0.75rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>by <strong style={{ color: 'var(--text-primary)' }}>{detailsData.provider}</strong></p>
          <p style={{ margin: '0 0 1rem', fontSize: '1.6rem', fontWeight: 800, color: '#EA580C', letterSpacing: '-0.03em' }}>₹{detailsData.amount?.toLocaleString('en-IN')}</p>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Deadline: <strong>{new Date(detailsData.deadline).toLocaleDateString('en-IN')}</strong></p>
          <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>Description</h4>
          <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>{detailsData.description}</p>
          <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>Eligibility</h4>
          <ul style={{ margin: '0 0 1rem', paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.8 }}>{(detailsData.eligibility || detailsData.eligibilityCriteria || []).map((e, i) => <li key={i}>{e}</li>)}</ul>
          <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>Required Documents</h4>
          <ul style={{ margin: '0 0 1.5rem', paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.8 }}>{detailsData.requirements?.map((d, i) => <li key={i}>{d}</li>)}</ul>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setShowDetailsModal(false)} className="apple-btn apple-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Close</button>
            {!hasUserApplied(detailsData.id) && (
              <button onClick={() => handleApply(detailsData.id)} className="apple-btn apple-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Apply Now</button>
            )}
          </div>
          </Modal>
        )}
      </AnimatePresence>

    </div>
  );
};