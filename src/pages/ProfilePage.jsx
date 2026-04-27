import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import {
  AlertCircle, Calendar, Camera, CheckCircle, Eye, EyeOff,
  FileText, GraduationCap, Loader, Lock, Mail, MapPin, Phone, Save, ShieldCheck, User,
} from 'lucide-react';

const inputBase = (disabled) => ({
  width: '100%',
  padding: '0.65rem 0.9rem',
  background: disabled ? 'var(--bg-elevated)' : 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  borderRadius: 10,
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  cursor: disabled ? 'default' : 'text',
  opacity: disabled ? 0.7 : 1,
});

const textareaBase = (disabled) => ({ ...inputBase(disabled), resize: 'vertical' });

const FieldLabel = ({ icon, children }) => (
  <label
    style={{
      marginBottom: '0.4rem',
      fontSize: '0.8rem',
      fontWeight: 600,
      color: 'var(--text-secondary)',
      letterSpacing: '0.02em',
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem',
    }}
  >
    {icon && React.cloneElement(icon, { size: 13 })}
    {children}
  </label>
);

const parseDate = (value) => {
  if (!value) return '';
  try {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const createFormState = (profile) => ({
  name: profile?.name || '',
  email: profile?.email || '',
  phone: profile?.phone || '',
  address: profile?.address || '',
  education: profile?.education || '',
  dateOfBirth: parseDate(profile?.dateOfBirth),
  photo: profile?.photo || '',
  resume: profile?.resume || '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const getFriendlyError = (error, fallbackMessage) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message === 'Network Error') {
    return 'Unable to reach the backend. Please make sure the API server is running and VITE_API_URL is configured correctly.';
  }
  return fallbackMessage;
};

export const ProfilePage = () => {
  const { user, login } = useAuth();

  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const [formData, setFormData] = useState(createFormState(null));

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const res = await apiClient.get('/users/me');
        setCurrentUser(res.data);
        setFormData(createFormState(res.data));
      } catch (error) {
        console.error('Failed to load profile:', error);
        setMessage({
          type: 'error',
          text: getFriendlyError(error, 'Failed to load profile data.'),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const isAdmin = String(currentUser?.role || user?.role || '').toLowerCase() === 'admin';

  const isValidUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required.' });
      return false;
    }
    if (!emailRe.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email.' });
      return false;
    }

    if (!isAdmin) {
      if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phone)) {
        setMessage({ type: 'error', text: 'Please enter a valid phone number.' });
        return false;
      }
      if (formData.photo && !isValidUrl(formData.photo)) {
        setMessage({ type: 'error', text: 'Please enter a valid photo URL.' });
        return false;
      }
      if (formData.resume && !isValidUrl(formData.resume)) {
        setMessage({ type: 'error', text: 'Please enter a valid resume URL.' });
        return false;
      }
    }

    if (showPasswordChange) {
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: 'Current password is required.' });
        return false;
      }
      if (formData.newPassword.length < 8) {
        setMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
        return false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match.' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (!validateForm() || !currentUser) return;

    setIsSaving(true);

    try {
      const updates = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        phone: isAdmin ? null : (formData.phone.trim() || null),
        address: isAdmin ? null : (formData.address.trim() || null),
        education: isAdmin ? null : (formData.education.trim() || null),
        dateOfBirth: isAdmin ? null : (formData.dateOfBirth || null),
        photo: isAdmin ? null : (formData.photo.trim() || null),
        resume: isAdmin ? null : (formData.resume.trim() || null),
      };

      if (showPasswordChange && formData.newPassword) {
        updates.currentPassword = formData.currentPassword;
        updates.newPassword = formData.newPassword;
      }

      const res = await apiClient.put(`/users/${currentUser.id}/profile`, updates);
      setCurrentUser(res.data);
      setFormData(createFormState(res.data));

      if (formData.name !== user?.name || formData.email !== user?.email) {
        const token = localStorage.getItem('token');
        login(
          {
            ...user,
            id: res.data.id,
            role: String(res.data.role || user?.role || '').toLowerCase(),
            name: res.data.name,
            email: res.data.email,
          },
          token
        );
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setShowPasswordChange(false);
    } catch (error) {
      console.error('Profile update failed:', error);
      setMessage({
        type: 'error',
        text: getFriendlyError(error, 'An error occurred while updating your profile.'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(createFormState(currentUser));
    setIsEditing(false);
    setShowPasswordChange(false);
    setMessage(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="icon-pill" style={{ width: 56, height: 56, borderRadius: '50%' }}><User size={24} /></div>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Please log in to view your profile.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  const roleBadge = isAdmin
    ? { bg: 'rgba(94,92,230,0.12)', color: '#5e5ce6' }
    : { bg: 'rgba(234,88,12,0.10)', color: '#EA580C' };

  const pageTitle = isAdmin ? 'Admin Profile' : 'My Profile';
  const pageSubtitle = isAdmin
    ? 'Manage your administrator account details and security settings'
    : 'Manage your personal information and account settings';

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '3rem 1.5rem', transition: 'background 0.35s ease' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            {isAdmin ? 'Admin ' : 'My '}<span className="text-gradient">Profile</span>
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {pageSubtitle}
          </p>
        </div>

        {message && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.85rem 1rem',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.88rem',
              fontWeight: 500,
              background: message.type === 'success' ? 'rgba(52,199,89,0.10)' : 'rgba(255,59,48,0.08)',
              border: `1px solid ${message.type === 'success' ? 'rgba(52,199,89,0.25)' : 'rgba(255,59,48,0.22)'}`,
              color: message.type === 'success' ? '#248a3d' : '#ff3b30',
            }}
          >
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2.5fr)', gap: '1.5rem', alignItems: 'start' }}>
          <div className="glass-card" style={{ textAlign: 'center', position: 'sticky', top: '5rem' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
              {currentUser?.photo && !isAdmin ? (
                <img src={currentUser.photo} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid #EA580C' }} />
              ) : (
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: isAdmin ? 'linear-gradient(135deg, #5e5ce6 0%, #7c7af2 100%)' : 'var(--btn-primary-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `3px solid ${isAdmin ? 'rgba(94,92,230,0.22)' : 'rgba(234,88,12,0.25)'}`,
                  }}
                >
                  {isAdmin ? <ShieldCheck size={40} color="#fff" /> : <User size={40} color="#fff" />}
                </div>
              )}
              {!isAdmin && (
                <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'var(--btn-primary-bg)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-surface)' }}>
                  <Camera size={13} color="#fff" />
                </div>
              )}
            </div>

            <h2 style={{ margin: '0 0 0.2rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {currentUser?.name}
            </h2>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{currentUser?.email}</p>
            <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: roleBadge.bg, color: roleBadge.color }}>
              {pageTitle}
            </span>

            <div style={{ marginTop: '1.8rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'grid', gap: '0.75rem', textAlign: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>Account Type</p>
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{isAdmin ? 'Administrator' : 'Student'}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>Member since</p>
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Recently joined'}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>Email status</p>
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: currentUser?.isVerified ? '#248a3d' : '#ff3b30' }}>
                  {currentUser?.isVerified ? 'Verified' : 'Not verified'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {isAdmin ? 'Administrator Details' : 'Personal Information'}
              </h3>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="apple-btn apple-btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}>
                  {isAdmin ? <ShieldCheck size={14} /> : <User size={14} />} Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleCancel} className="apple-btn apple-btn-secondary" disabled={isSaving} style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}>
                    Cancel
                  </button>
                  <button onClick={handleSubmit} disabled={isSaving} className="apple-btn apple-btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}>
                    {isSaving ? <><span className="btn-spinner" /> Saving...</> : <><Save size={14} /> Save Changes</>}
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <FieldLabel icon={isAdmin ? <ShieldCheck /> : <User />}>FULL NAME *</FieldLabel>
                  <input type="text" name="name" required disabled={!isEditing} value={formData.name} onChange={handleChange} style={inputBase(!isEditing)} />
                </div>

                <div>
                  <FieldLabel icon={<Mail />}>EMAIL ADDRESS *</FieldLabel>
                  <input type="email" name="email" required disabled={!isEditing} value={formData.email} onChange={handleChange} style={inputBase(!isEditing)} />
                </div>

                {!isAdmin && (
                  <>
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
                      <input type="url" name="photo" disabled={!isEditing} value={formData.photo} onChange={handleChange} style={inputBase(!isEditing)} placeholder="https://..." />
                    </div>

                    <div>
                      <FieldLabel icon={<FileText />}>RESUME URL</FieldLabel>
                      <input type="url" name="resume" disabled={!isEditing} value={formData.resume} onChange={handleChange} style={inputBase(!isEditing)} placeholder="https://..." />
                    </div>
                  </>
                )}
              </div>

              {isAdmin && (
                <div
                  style={{
                    padding: '1rem 1.1rem',
                    borderRadius: 14,
                    background: 'rgba(94,92,230,0.07)',
                    border: '1px solid rgba(94,92,230,0.16)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                  }}
                >
                  This admin profile is intentionally minimal. Administrator accounts currently manage core identity and security fields only.
                </div>
              )}

              {isEditing && (
                <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPasswordChange ? '1rem' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                      <Lock size={15} style={{ color: isAdmin ? '#5e5ce6' : '#EA580C' }} />
                      Change Password
                    </div>
                    <button type="button" onClick={() => setShowPasswordChange((prev) => !prev)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: isAdmin ? '#5e5ce6' : '#EA580C' }}>
                      {showPasswordChange ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>

                  {showPasswordChange && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                      {[
                        { key: 'currentPassword', label: 'CURRENT PASSWORD', show: showCurrentPwd, toggle: () => setShowCurrentPwd((prev) => !prev) },
                        { key: 'newPassword', label: 'NEW PASSWORD', show: showNewPwd, toggle: () => setShowNewPwd((prev) => !prev) },
                        { key: 'confirmPassword', label: 'CONFIRM NEW PASSWORD', show: false, toggle: null },
                      ].map((field) => (
                        <div key={field.key}>
                          <FieldLabel>{field.label}</FieldLabel>
                          <div style={{ position: 'relative' }}>
                            <input
                              type={field.show ? 'text' : 'password'}
                              name={field.key}
                              required
                              value={formData[field.key]}
                              onChange={handleChange}
                              style={{ ...inputBase(false), paddingRight: field.toggle ? '2.5rem' : undefined }}
                            />
                            {field.toggle && (
                              <button type="button" onClick={field.toggle} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                                {field.show ? <EyeOff size={15} /> : <Eye size={15} />}
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
