import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  User, Camera, FileText, Save,
  AlertCircle, CheckCircle, Eye, EyeOff,
  Calendar, Phone, MapPin, GraduationCap, Lock,
} from 'lucide-react';

/* ── shared form field style ── */
const inputBase = (disabled) => ({
  width: '100%', padding: '0.65rem 0.9rem',
  background: disabled ? 'var(--bg-elevated)' : 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.9rem',
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  cursor: disabled ? 'default' : 'text',
  opacity: disabled ? 0.7 : 1,
});
const textareaBase = (disabled) => ({ ...inputBase(disabled), resize: 'vertical' });

const FieldLabel = ({ icon, children }) => (
  <label style={{ marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
    {icon && React.cloneElement(icon, { size: 13 })}
    {children}
  </label>
);

export const ProfilePage = () => {
  const { user, login } = useAuth();
  const { getUserById, updateUser } = useLocalStorage();

  const [isEditing, setIsEditing]               = useState(false);
  const [isLoading, setIsLoading]               = useState(false);
  const [message, setMessage]                   = useState(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd]     = useState(false);
  const [showNewPwd, setShowNewPwd]             = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', education: '',
    dateOfBirth: '', photo: '', resume: '',
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const currentUser = user ? getUserById(user.id) : null;

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '', email: currentUser.email || '',
        phone: currentUser.phone || '', address: currentUser.address || '',
        education: currentUser.education || '', dateOfBirth: currentUser.dateOfBirth || '',
        photo: currentUser.photo || '', resume: currentUser.resume || '',
        currentPassword: '', newPassword: '', confirmPassword: '',
      });
    }
  }, [currentUser]);

  const isValidUrl = s => { try { new URL(s); return true; } catch { return false; } };

  const validateForm = () => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim())           return setMessage({ type: 'error', text: 'Name is required.' }), false;
    if (!emailRe.test(formData.email))   return setMessage({ type: 'error', text: 'Please enter a valid email.' }), false;
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phone))
                                         return setMessage({ type: 'error', text: 'Please enter a valid phone number.' }), false;
    if (formData.photo && !isValidUrl(formData.photo)) return setMessage({ type: 'error', text: 'Please enter a valid photo URL.' }), false;
    if (formData.resume && !isValidUrl(formData.resume)) return setMessage({ type: 'error', text: 'Please enter a valid resume URL.' }), false;
    if (showPasswordChange) {
      if (!formData.currentPassword)     return setMessage({ type: 'error', text: 'Current password is required.' }), false;
      if (currentUser && formData.currentPassword !== currentUser.password)
                                         return setMessage({ type: 'error', text: 'Current password is incorrect.' }), false;
      if (formData.newPassword.length < 6) return setMessage({ type: 'error', text: 'New password must be at least 6 characters.' }), false;
      if (formData.newPassword !== formData.confirmPassword) return setMessage({ type: 'error', text: 'New passwords do not match.' }), false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(null);
    if (!validateForm() || !user || !currentUser) return;
    setIsLoading(true);
    try {
      const updates = {
        name: formData.name.trim(), email: formData.email.toLowerCase(),
        phone: formData.phone.trim() || undefined, address: formData.address.trim() || undefined,
        education: formData.education.trim() || undefined, dateOfBirth: formData.dateOfBirth || undefined,
        photo: formData.photo.trim() || undefined, resume: formData.resume.trim() || undefined,
      };
      if (showPasswordChange && formData.newPassword) updates.password = formData.newPassword;
      updateUser(user.id, updates);
      if (formData.name !== user.name || formData.email !== user.email)
        login({ ...user, name: formData.name.trim(), email: formData.email.toLowerCase() });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setShowPasswordChange(false);
      setFormData(p => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch {
      setMessage({ type: 'error', text: 'An error occurred while updating your profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (currentUser) setFormData({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone || '', address: currentUser.address || '', education: currentUser.education || '', dateOfBirth: currentUser.dateOfBirth || '', photo: currentUser.photo || '', resume: currentUser.resume || '', currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsEditing(false);
    setShowPasswordChange(false);
    setMessage(null);
  };

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  if (!user || !currentUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="icon-pill" style={{ width: 56, height: 56, borderRadius: '50%' }}><User size={24} /></div>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Please log in to view your profile.</p>
      </div>
    );
  }

  /* Role badge colours */
  const roleBadge = currentUser.role === 'admin'
    ? { bg: 'rgba(94,92,230,0.12)', color: '#5e5ce6' }
    : { bg: 'rgba(234,88,12,0.10)', color: '#EA580C' };

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '3rem 1.5rem', transition: 'background 0.35s ease' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* ── Page heading ── */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            My <span className="text-gradient">Profile</span>
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage your personal information and account settings
          </p>
        </div>

        {/* ── Success / Error message ── */}
        {message && (
          <div style={{
            marginBottom: '1.5rem', padding: '0.85rem 1rem',
            borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', fontWeight: 500,
            background: message.type === 'success' ? 'rgba(52,199,89,0.10)' : 'rgba(255,59,48,0.08)',
            border: `1px solid ${message.type === 'success' ? 'rgba(52,199,89,0.25)' : 'rgba(255,59,48,0.22)'}`,
            color: message.type === 'success' ? '#248a3d' : '#ff3b30',
          }}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2.5fr)', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Left sidebar card ── */}
          <div className="glass-card" style={{ textAlign: 'center', position: 'sticky', top: '5rem' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
              {currentUser.photo ? (
                <img src={currentUser.photo} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid #EA580C' }} />
              ) : (
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--btn-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(234,88,12,0.25)' }}>
                  <User size={40} color="#fff" />
                </div>
              )}
              <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'var(--btn-primary-bg)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-surface)' }}>
                <Camera size={13} color="#fff" />
              </div>
            </div>

            <h2 style={{ margin: '0 0 0.2rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {currentUser.name}
            </h2>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{currentUser.email}</p>
            <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: roleBadge.bg, color: roleBadge.color }}>
              {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
            </span>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>Member since</p>
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {new Date(currentUser.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* ── Right form card ── */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Card header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Personal Information</h3>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="apple-btn apple-btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}>
                  <User size={14} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleCancel} className="apple-btn apple-btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}>Cancel</button>
                  <button onClick={handleSubmit} disabled={isLoading} className="apple-btn apple-btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}>
                    {isLoading ? <><span className="btn-spinner" /> Saving…</> : <><Save size={14} /> Save Changes</>}
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>

                <div>
                  <FieldLabel icon={<User />}>FULL NAME *</FieldLabel>
                  <input type="text" name="name" required disabled={!isEditing} value={formData.name} onChange={handleChange} style={inputBase(!isEditing)} />
                </div>

                <div>
                  <FieldLabel>EMAIL ADDRESS *</FieldLabel>
                  <input type="email" name="email" required disabled={!isEditing} value={formData.email} onChange={handleChange} style={inputBase(!isEditing)} />
                </div>

                <div>
                  <FieldLabel icon={<Phone />}>PHONE</FieldLabel>
                  <input type="tel" name="phone" disabled={!isEditing} value={formData.phone} onChange={handleChange} style={inputBase(!isEditing)} />
                </div>

                <div>
                  <FieldLabel icon={<Calendar />}>DATE OF BIRTH</FieldLabel>
                  <input type="date" name="dateOfBirth" disabled={!isEditing} value={formData.dateOfBirth} onChange={handleChange} style={inputBase(!isEditing)} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <FieldLabel icon={<MapPin />}>ADDRESS</FieldLabel>
                  <textarea name="address" rows={2} disabled={!isEditing} value={formData.address} onChange={handleChange} style={textareaBase(!isEditing)} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <FieldLabel icon={<GraduationCap />}>EDUCATION</FieldLabel>
                  <textarea name="education" rows={2} disabled={!isEditing} value={formData.education} onChange={handleChange} style={textareaBase(!isEditing)} />
                </div>

                <div>
                  <FieldLabel icon={<Camera />}>PHOTO URL</FieldLabel>
                  <input type="url" name="photo" disabled={!isEditing} value={formData.photo} onChange={handleChange} style={inputBase(!isEditing)} placeholder="https://…" />
                </div>

                <div>
                  <FieldLabel icon={<FileText />}>RESUME URL</FieldLabel>
                  <input type="url" name="resume" disabled={!isEditing} value={formData.resume} onChange={handleChange} style={inputBase(!isEditing)} placeholder="https://…" />
                </div>
              </div>

              {/* ── Change password ── */}
              {isEditing && (
                <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPasswordChange ? '1rem' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                      <Lock size={15} style={{ color: '#EA580C' }} />
                      Change Password
                    </div>
                    <button type="button" onClick={() => setShowPasswordChange(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#EA580C' }}>
                      {showPasswordChange ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>

                  {showPasswordChange && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                      {[
                        { key: 'currentPassword', label: 'CURRENT PASSWORD', show: showCurrentPwd, toggle: () => setShowCurrentPwd(v => !v) },
                        { key: 'newPassword',     label: 'NEW PASSWORD',     show: showNewPwd,    toggle: () => setShowNewPwd(v => !v) },
                        { key: 'confirmPassword', label: 'CONFIRM NEW PASSWORD', show: false, toggle: null },
                      ].map(f => (
                        <div key={f.key}>
                          <FieldLabel>{f.label}</FieldLabel>
                          <div style={{ position: 'relative' }}>
                            <input type={f.show ? 'text' : 'password'} name={f.key} required value={formData[f.key]} onChange={handleChange} style={{ ...inputBase(false), paddingRight: f.toggle ? '2.5rem' : undefined }} />
                            {f.toggle && (
                              <button type="button" onClick={f.toggle} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                                {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
