import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { ScholarshipCard } from '../component/ScholarshipCard';
import { Plus, CreditCard as Edit, Trash2, BookOpen, CheckCircle, Clock, Search, FileText, Loader, X, Link as LinkIcon } from 'lucide-react';

const parseDate = (d) => {
  if (!d) return '';
  try {
    const date = new Date(d);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  } catch { return ''; }
};

/* ── Apple-style Animated Modal ── */
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
        borderRadius: 24, maxWidth: 800, width: '100%', maxHeight: '88vh', overflowY: 'auto', position: 'relative', padding: '2.5rem 2rem'
      }}
    >
      <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'var(--bg-surface)', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
        <X size={18} />
      </button>
      {children}
    </motion.div>
  </motion.div>,
  document.body
);

const formInput = { width: '100%', padding: '0.65rem 0.9rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' };
const FormField = ({ label, children }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>{label}</label>
    {children}
  </div>
);

export const AdminPanel = () => {
  const { user } = useAuth();

  const normalizeDocuments = (documents = []) => {
    if (!Array.isArray(documents)) return [];

    const seenLinks = new Set();

    return documents
      .map((document) => {
        const rawLink = typeof document?.link === 'string' ? document.link.trim() : '';
        if (!rawLink) return null;

        // Keep only valid http/https links so bad payloads do not pollute state.
        let normalizedLink = rawLink;
        try {
          const url = new URL(rawLink);
          if (!['http:', 'https:'].includes(url.protocol)) {
            return null;
          }
          normalizedLink = url.toString();
        } catch {
          return null;
        }

        const dedupeKey = normalizedLink.toLowerCase();
        if (seenLinks.has(dedupeKey)) return null;
        seenLinks.add(dedupeKey);

        const safeName = typeof document?.name === 'string' && document.name.trim()
          ? document.name.trim()
          : 'Document';

        return {
          ...document,
          name: safeName,
          link: normalizedLink,
        };
      })
      .filter(Boolean);
  };

  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    pendingApplications: 0,
    approvalRate: 0,
  });
  const [applicationTrends, setApplicationTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('scholarships');
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingApplicationIds, setUpdatingApplicationIds] = useState([]);

  const [scholarshipForm, setScholarshipForm] = useState({
    title: '', amount: 0, eligibility: [''], deadline: '',
    description: '', requiredDocuments: [''], provider: '',
    category: 'Merit-based', isActive: true,
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const [schRes, appRes, usrRes, statsRes, trendsRes] = await Promise.all([
          apiClient.get('/scholarships').catch(() => ({ data: [] })),
          apiClient.get('/applications').catch(() => ({ data: [] })), 
          apiClient.get('/users').catch(() => ({ data: [] })),
          apiClient.get('/admin/dashboard/stats').catch(() => ({ data: null })),
          apiClient.get('/admin/dashboard/trends').catch(() => ({ data: [] }))        
        ]);
        
        const safeScholarships = Array.isArray(schRes.data) ? schRes.data : (schRes.data?.content || schRes.data?.data || []);
        const safeApplications = Array.isArray(appRes.data) ? appRes.data : (appRes.data?.content || appRes.data?.data || []);
        const safeUsers = Array.isArray(usrRes.data) ? usrRes.data : (usrRes.data?.content || usrRes.data?.data || []);
        const safeStats = statsRes.data || null;
        const safeTrends = Array.isArray(trendsRes.data) ? trendsRes.data : [];

        // Normalize backend field names: eligibilityCriteria -> eligibility
        const normalized = safeScholarships.map(s => ({
          ...s,
          eligibility: s.eligibilityCriteria || s.eligibility || [],
        }));
        setScholarships(normalized);
        setApplications(
          safeApplications.map((application) => ({
            ...application,
            documents: normalizeDocuments(application.documents),
          }))
        );
        setUsers(safeUsers);
        setDashboardStats(safeStats || {
          totalApplications: safeApplications.length,
          approvedApplications: safeApplications.filter(app => (app.status || '').toUpperCase() === 'APPROVED').length,
          rejectedApplications: safeApplications.filter(app => (app.status || '').toUpperCase() === 'REJECTED').length,
          pendingApplications: safeApplications.filter(app => ['PENDING', 'UNDER_REVIEW'].includes((app.status || '').toUpperCase())).length,
          approvalRate: safeApplications.length === 0 ? 0 : Number(((safeApplications.filter(app => (app.status || '').toUpperCase() === 'APPROVED').length * 100) / safeApplications.length).toFixed(1)),
        });
        setApplicationTrends(safeTrends);
      } catch (error) {
        console.error("Failed to load admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'admin') fetchAdminData();
  }, [user]);

  const getScholarshipById = (id) => scholarships.find(s => s.id === id);
  const getUserById = (id) => users.find(u => u.id === id);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const scholarship = getScholarshipById(app.scholarshipId);
      const student = getUserById(app.studentId);
      const matchesSearch = searchTerm === '' || scholarship?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || student?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '' || (app.status || '').toUpperCase() === statusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    });
  }, [applications, scholarships, users, searchTerm, statusFilter]);

  const resetForm = () => {
    setScholarshipForm({
      title: '', amount: 0, eligibility: [''], deadline: '',
      description: '', requiredDocuments: [''], provider: '',
      category: 'Merit-based', isActive: true,
    });
    setEditingScholarship(null);
  };

  const handleScholarshipSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Map frontend field names to backend field names
    const scholarshipData = {
      title: scholarshipForm.title,
      amount: Number(scholarshipForm.amount),
      description: scholarshipForm.description,
      provider: scholarshipForm.provider,
      category: scholarshipForm.category,
      deadline: scholarshipForm.deadline,
      isActive: scholarshipForm.isActive,
      eligibilityCriteria: (scholarshipForm.eligibility || []).filter(e => e.trim() !== ''),
      requiredDocuments: (scholarshipForm.requiredDocuments || []).filter(r => r.trim() !== ''),
    };

    try {
      if (editingScholarship) {
        const res = await apiClient.put(`/scholarships/${editingScholarship}`, scholarshipData);
        const updated = { ...res.data, eligibility: res.data.eligibilityCriteria || res.data.eligibility || [] };
        setScholarships(prev => prev.map(s => s.id === editingScholarship ? updated : s));
      } else {
        const res = await apiClient.post('/scholarships', scholarshipData);
        const created = { ...res.data, eligibility: res.data.eligibilityCriteria || res.data.eligibility || [] };
        setScholarships(prev => [...prev, created]);
      }
      setShowScholarshipModal(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save scholarship:", error);
      alert("Error saving scholarship.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditScholarship = (scholarship) => {
    setScholarshipForm({
      title: scholarship.title || '',
      amount: scholarship.amount || 0,
      description: scholarship.description || '',
      provider: scholarship.provider || '',
      category: scholarship.category || 'Merit-based',
      deadline: parseDate(scholarship.deadline),
      isActive: scholarship.isActive !== false,
      eligibility: scholarship.eligibility || scholarship.eligibilityCriteria || [''],
      requiredDocuments: (scholarship.requiredDocuments || scholarship.requirements || []).map((document) =>
        typeof document === 'string' ? document : document.name
      ).filter(Boolean).length > 0
        ? (scholarship.requiredDocuments || scholarship.requirements || []).map((document) =>
            typeof document === 'string' ? document : document.name
          ).filter(Boolean)
        : [''],
    });
    setEditingScholarship(scholarship.id);
    setShowScholarshipModal(true);
  };

  const handleDeleteScholarship = async (id) => {
    if (window.confirm('Are you sure you want to delete this scholarship?')) {
      try {
        await apiClient.delete(`/scholarships/${id}`);
        setScholarships(prev => prev.filter(s => s.id !== id));
      } catch (error) {
        console.error("Failed to delete scholarship:", error);
        alert("Cannot delete scholarship. It may have existing applications.");
      }
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, status, notes) => {
    if (updatingApplicationIds.includes(applicationId)) {
      return;
    }

    try {
      setUpdatingApplicationIds((prev) => [...prev, applicationId]);
      const res = await apiClient.patch(`/applications/${applicationId}/status`, { status, adminNotes: notes || null });
      const updatedApplication = {
        ...res.data,
        documents: normalizeDocuments(res.data?.documents),
      };

      setApplications(prev => prev.map(app => app.id === applicationId ? updatedApplication : app));
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(error?.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingApplicationIds((prev) => prev.filter((id) => id !== applicationId));
    }
  };

  // Field arrays
  const addField = (field) => setScholarshipForm(p => ({ ...p, [field]: [...p[field], ''] }));
  const removeField = (field, index) => setScholarshipForm(p => ({ ...p, [field]: p[field].filter((_, i) => i !== index) }));
  const updateField = (field, index, value) => {
    const updated = [...scholarshipForm[field]];
    updated[index] = value;
    setScholarshipForm(p => ({ ...p, [field]: updated }));
  };

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Access Denied. Admin privileges required.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  const dashStats = [
    { icon: <BookOpen size={22} />, label: 'Total Scholarships', value: scholarships.length },
    { icon: <FileText size={22} />, label: 'Total Applications', value: dashboardStats.totalApplications },
    { icon: <Clock size={22} />, label: 'Pending Review', value: dashboardStats.pendingApplications },
    { icon: <CheckCircle size={22}/>, label: 'Approved', value: dashboardStats.approvedApplications },
    { icon: <CheckCircle size={22}/>, label: 'Approval Rate', value: `${dashboardStats.approvalRate}%` },
  ];

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '3rem 1.5rem', transition: 'background 0.35s ease' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', margin: 0, marginBottom: '0.35rem' }}>
            Admin <span className="text-gradient">Panel</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Manage scholarships and review applications.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {dashStats.map((s, i) => (
            <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '1.25rem', gap: '1rem' }}>
              <div className="icon-pill" style={{ flexShrink: 0, marginBottom: 0 }}>{s.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 0.7fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Application Trends</h2>
                <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Daily application counts from the backend trend feed.</p>
              </div>
            </div>
            {applicationTrends.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {applicationTrends.map((trend) => {
                  const maxCount = Math.max(...applicationTrends.map(item => item.count), 1);
                  const width = `${Math.max((trend.count / maxCount) * 100, 8)}%`;
                  return (
                    <div key={trend.date} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 50px', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>{trend.date}</span>
                      <div style={{ height: 10, background: 'var(--bg-surface)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width, background: 'linear-gradient(90deg, #EA580C 0%, #FF9B66 100%)', borderRadius: 999 }} />
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 700, textAlign: 'right' }}>{trend.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No application trend data available yet.</p>
            )}
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Status Breakdown</h2>
            <div style={{ display: 'grid', gap: '0.85rem', marginTop: '1rem' }}>
              {[ 
                ['Approved', dashboardStats.approvedApplications, 'rgba(52,199,89,0.12)', '#248a3d'],
                ['Rejected', dashboardStats.rejectedApplications, 'rgba(255,59,48,0.12)', '#ff3b30'],
                ['Pending', dashboardStats.pendingApplications, 'rgba(255,159,10,0.12)', '#b8860b'],
              ].map(([label, value, bg, color]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', borderRadius: 14, background: bg }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{label}</span>
                  <span style={{ color, fontSize: '1.1rem', fontWeight: 800 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.5rem' }}>
            {[{ id: 'scholarships', label: 'Manage Scholarships' }, { id: 'applications', label: `Review Applications (${applications.filter(a => (a.status || '').toUpperCase() === 'PENDING').length})` }].map(t => (
              <button
                key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ padding: '1rem 0.25rem', marginRight: '2rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: activeTab === t.id ? '#EA580C' : 'var(--text-secondary)', borderBottom: `2px solid ${activeTab === t.id ? '#EA580C' : 'transparent'}`, transition: 'all 0.2s' }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '1.5rem' }}>
            {activeTab === 'scholarships' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Active Scholarships</h2>
                  <button onClick={() => setShowScholarshipModal(true)} className="apple-btn apple-btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    <Plus size={16} style={{ marginRight: '0.3rem' }} /> Add New
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {scholarships.map(scholarship => (
                    <div key={scholarship.id} style={{ position: 'relative' }}>
                      <ScholarshipCard scholarship={scholarship} showActions={false} />
                      <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => handleEditScholarship(scholarship)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}><Edit size={14} /></button>
                        <button onClick={() => handleDeleteScholarship(scholarship.id)} style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                  <div style={{ flex: '1 1 220px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                    <input type="text" placeholder="Search applications..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...formInput, paddingLeft: '2.4rem' }} className="apple-input" />
                  </div>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...formInput, width: 'auto', cursor: 'pointer' }} className="apple-input">
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                {filteredApplications.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredApplications.map(app => {
                      const scholarship = getScholarshipById(app.scholarshipId) || { title: 'Unknown' };
                      const student = getUserById(app.studentId) || { name: 'Unknown User', email: '' };
                      const submittedDocuments = app.documents || [];
                      const isUpdatingStatus = updatingApplicationIds.includes(app.id);
                      const sd = app.studentDetails || {};

                      return (
                        <div key={app.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                              <h3 style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{scholarship.title}</h3>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{student.name} ({student.email})</p>
                            </div>
                            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                              {(app.status || 'pending').toUpperCase()}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                            <div><strong style={{color: 'var(--text-primary)'}}>Phone:</strong> {app.applicantPhone || 'N/A'}</div>
                            <div><strong style={{color: 'var(--text-primary)'}}>Location:</strong> {app.location || 'N/A'}</div>
                            <div><strong style={{color: 'var(--text-primary)'}}>Class:</strong> {app.studentClass || 'N/A'}</div>
                            <div><strong style={{color: 'var(--text-primary)'}}>GPA:</strong> {app.gpa || 'N/A'}</div>
                            <div><strong style={{color: 'var(--text-primary)'}}>10th Marks:</strong> {app.marks10th ? `${app.marks10th}%` : 'N/A'}</div>
                            <div><strong style={{color: 'var(--text-primary)'}}>12th Marks:</strong> {app.marks12th ? `${app.marks12th}%` : 'N/A'}</div>
                            
                            <div style={{ gridColumn: '1 / -1', background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 8, marginTop: '0.5rem' }}>
                              <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Family Details:</p>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                                <div><strong style={{color: 'var(--text-primary)'}}>Parent:</strong> {app.parentName || 'N/A'}</div>
                                <div><strong style={{color: 'var(--text-primary)'}}>Occupation:</strong> {app.parentOccupation || 'N/A'}</div>
                                <div><strong style={{color: 'var(--text-primary)'}}>Mobile:</strong> {app.parentMobile || 'N/A'}</div>
                              </div>
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}><strong style={{color: 'var(--text-primary)'}}>Education:</strong> {app.applicantEducation || 'N/A'}</div>
                            <div style={{ gridColumn: '1 / -1' }}><strong style={{color: 'var(--text-primary)'}}>Address:</strong> {app.applicantAddress || 'N/A'}</div>
                            
                            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                              <strong style={{color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem'}}>Submitted Documents:</strong>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {submittedDocuments.length > 0 ? submittedDocuments.map((document) => (
                                  <div key={document.id || document.link} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{document.name}:</span>
                                    <a
                                      href={document.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: '#EA580C', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                    >
                                      <LinkIcon size={12} />
                                      {document.link.length > 60 ? `${document.link.substring(0, 60)}...` : document.link}
                                    </a>
                                  </div>
                                )) : 'No documents provided'}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button disabled={isUpdatingStatus} onClick={() => handleUpdateApplicationStatus(app.id, 'UNDER_REVIEW')} className="apple-btn" style={{ background: 'rgba(255,159,10,0.1)', color: '#b8860b', padding: '0.4rem 0.8rem', fontSize: '0.8rem', opacity: isUpdatingStatus ? 0.6 : 1, cursor: isUpdatingStatus ? 'not-allowed' : 'pointer' }}>{isUpdatingStatus ? 'Updating...' : 'Under Review'}</button>
                            <button disabled={isUpdatingStatus} onClick={() => handleUpdateApplicationStatus(app.id, 'APPROVED')} className="apple-btn" style={{ background: 'rgba(52,199,89,0.1)', color: '#248a3d', padding: '0.4rem 0.8rem', fontSize: '0.8rem', opacity: isUpdatingStatus ? 0.6 : 1, cursor: isUpdatingStatus ? 'not-allowed' : 'pointer' }}>{isUpdatingStatus ? 'Updating...' : 'Approve'}</button>
                            <button disabled={isUpdatingStatus} onClick={() => { const n = window.prompt('Rejection Reason:'); if (n !== null) handleUpdateApplicationStatus(app.id, 'REJECTED', n); }} className="apple-btn" style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30', padding: '0.4rem 0.8rem', fontSize: '0.8rem', opacity: isUpdatingStatus ? 0.6 : 1, cursor: isUpdatingStatus ? 'not-allowed' : 'pointer' }}>{isUpdatingStatus ? 'Updating...' : 'Reject'}</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>No applications match your search.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add/Edit Scholarship Modal ── */}
      <AnimatePresence>
        {showScholarshipModal && (
          <Modal onClose={() => { setShowScholarshipModal(false); resetForm(); }}>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {editingScholarship ? 'Edit Scholarship' : 'Add New Scholarship'}
            </h2>
            <form onSubmit={handleScholarshipSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <FormField label="TITLE">
                  <input type="text" required value={scholarshipForm.title} onChange={(e) => setScholarshipForm({ ...scholarshipForm, title: e.target.value })} style={formInput} />
                </FormField>
                <FormField label="AMOUNT (₹)">
                  <input type="number" required min="1" value={scholarshipForm.amount} onChange={(e) => setScholarshipForm({ ...scholarshipForm, amount: Number(e.target.value) })} style={formInput} />
                </FormField>
                <FormField label="PROVIDER">
                  <input type="text" required value={scholarshipForm.provider} onChange={(e) => setScholarshipForm({ ...scholarshipForm, provider: e.target.value })} style={formInput} />
                </FormField>
                <FormField label="CATEGORY">
                  <select value={scholarshipForm.category} onChange={(e) => setScholarshipForm({ ...scholarshipForm, category: e.target.value })} style={{ ...formInput, cursor: 'pointer' }}>
                    <option value="Merit-based">Merit-based</option>
                    <option value="Need-based">Need-based</option>
                    <option value="Field-specific">Field-specific</option>
                  </select>
                </FormField>
                <FormField label="DEADLINE">
                  <input type="date" required value={scholarshipForm.deadline} onChange={(e) => setScholarshipForm({ ...scholarshipForm, deadline: e.target.value })} style={formInput} />
                </FormField>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <input type="checkbox" id="isActive" checked={scholarshipForm.isActive} onChange={(e) => setScholarshipForm({ ...scholarshipForm, isActive: e.target.checked })} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                  <label htmlFor="isActive" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Active Scholarship</label>
                </div>
              </div>

              <FormField label="DESCRIPTION">
                <textarea required rows={3} value={scholarshipForm.description} onChange={(e) => setScholarshipForm({ ...scholarshipForm, description: e.target.value })} style={{ ...formInput, resize: 'vertical' }} />
              </FormField>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ELIGIBILITY CRITERIA</label>
                {scholarshipForm.eligibility.map((crit, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="text" value={crit} onChange={(e) => updateField('eligibility', index, e.target.value)} style={formInput} />
                    {scholarshipForm.eligibility.length > 1 && (
                      <button type="button" onClick={() => removeField('eligibility', index)} style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', padding: '0 0.5rem' }}><Trash2 size={18} /></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addField('eligibility')} style={{ background: 'none', border: 'none', color: '#EA580C', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}><Plus size={14} /> Add Criterion</button>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>REQUIRED DOCUMENTS</label>
                {scholarshipForm.requiredDocuments.map((req, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="text" value={req} onChange={(e) => updateField('requiredDocuments', index, e.target.value)} style={formInput} />
                    {scholarshipForm.requiredDocuments.length > 1 && (
                      <button type="button" onClick={() => removeField('requiredDocuments', index)} style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', padding: '0 0.5rem' }}><Trash2 size={18} /></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addField('requiredDocuments')} style={{ background: 'none', border: 'none', color: '#EA580C', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}><Plus size={14} /> Add Document</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => { setShowScholarshipModal(false); resetForm(); }} disabled={isSubmitting} className="apple-btn apple-btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="apple-btn apple-btn-primary">
                  {isSubmitting ? <><span className="btn-spinner"/> Saving...</> : (editingScholarship ? 'Update Scholarship' : 'Create Scholarship')}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};
