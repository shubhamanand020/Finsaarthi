import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle, ChevronLeft, ChevronRight, Info, Link as LinkIcon, Loader, Send, ShieldCheck, User, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { CaptchaField } from '../component/CaptchaField';

const STEPS = [
  { key: 'personal', label: 'Personal Details', icon: User },
  { key: 'education', label: 'Educational Details', icon: BookOpen },
  { key: 'parent', label: 'Parent Details', icon: Users },
  { key: 'documents', label: 'Documents', icon: LinkIcon },
  { key: 'review', label: 'Captcha + Submit', icon: ShieldCheck },
];
const baseInputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  borderRadius: 14,
  color: 'var(--text-primary)',
  fontSize: '0.95rem',
  outline: 'none',
};

const buildInitialFormData = (user) => ({
  personal: { name: user?.name || '', email: user?.email || '', phone: '', address: '', location: '' },
  education: { education: '', studentClass: '', marks10th: '', marks12th: '', gpa: '' },
  parent: { parentName: '', parentOccupation: '', parentMobile: '' },
  documents: [],
});

const Field = ({ label, value, onChange, error, type = 'text', textarea = false, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>{label.toUpperCase()}</label>
    {textarea ? (
      <textarea rows={4} value={value} onChange={onChange} placeholder={placeholder} style={{ ...baseInputStyle, minHeight: 120, resize: 'vertical', borderColor: error ? '#dc2626' : 'var(--input-border)' }} />
    ) : (
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ ...baseInputStyle, borderColor: error ? '#dc2626' : 'var(--input-border)' }} />
    )}
    {error && <span style={{ color: '#dc2626', fontSize: '0.82rem', fontWeight: 600 }}>{error}</span>}
  </div>
);

const Card = ({ title, subtitle, children }) => (
  <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 28, padding: '2rem', boxShadow: '0 18px 48px rgba(15, 23, 42, 0.08)' }}>
    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h2>
    {subtitle && <p style={{ margin: '0.5rem 0 1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{subtitle}</p>}
    {children}
  </motion.div>
);

const SummaryRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.85rem 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
    <span style={{ color: 'var(--text-primary)', textAlign: 'right', wordBreak: 'break-word' }}>{value || '-'}</span>
  </div>
);

const isValidHttpLink = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const isScore = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100;
};

export const ScholarshipApplyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [formData, setFormData] = useState(() => buildInitialFormData(user));
  const [currentStep, setCurrentStep] = useState(0);
  const [stepErrors, setStepErrors] = useState({});
  const [captcha, setCaptcha] = useState({ captchaId: '', captchaInput: '' });
  const [captchaRefreshSignal, setCaptchaRefreshSignal] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const currentStepConfig = STEPS[currentStep];

  useEffect(() => {
    setFormData((prev) => ({ ...prev, personal: { ...prev.personal, name: user?.name || prev.personal.name, email: user?.email || prev.personal.email } }));
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [scholarshipRes, documentsRes] = await Promise.all([
          apiClient.get(`/scholarships/${id}`),
          apiClient.get(`/scholarships/${id}/required-documents`),
        ]);
        setScholarship(scholarshipRes.data);
        const fetchedRequiredDocuments = Array.isArray(documentsRes.data) ? documentsRes.data : [];
        setRequiredDocuments(fetchedRequiredDocuments);
        setFormData((prev) => ({
          ...prev,
          documents: fetchedRequiredDocuments.map((document) => {
            const existing = prev.documents.find((entry) => entry.documentName === document.name);
            return { documentName: document.name, link: existing?.link || '' };
          }),
        }));
        if (user) {
          const checkRes = await apiClient.get(`/applications/check?scholarshipId=${id}`);
          if (checkRes.data.hasApplied) setHasApplied(true);
        }
      } catch (error) {
        console.error('Failed to fetch scholarship details:', error);
        toast.error('Failed to load scholarship details.');
        navigate('/scholarships');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, user]);

  const setSectionField = (section, field, value) => {
    setFormData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const handleDocumentChange = (documentName, value) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((document) => document.documentName === documentName ? { ...document, link: value } : document),
    }));
  };

  const getStepErrors = (stepKey) => {
    const errors = {};
    if (stepKey === 'personal') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.personal.name.trim()) errors.name = 'Full name is required.';
      if (!formData.personal.email.trim()) errors.email = 'Email is required.';
      else if (!emailPattern.test(formData.personal.email.trim())) errors.email = 'Enter a valid email address.';
      if (!formData.personal.phone.trim()) errors.phone = 'Phone number is required.';
      if (!formData.personal.address.trim()) errors.address = 'Address is required.';
      if (!formData.personal.location.trim()) errors.location = 'Location is required.';
    }
    if (stepKey === 'education') {
      if (!formData.education.studentClass.trim()) errors.studentClass = 'Class or course is required.';
      if (!formData.education.education.trim()) errors.education = 'Education details are required.';
      if (!String(formData.education.marks10th).trim()) errors.marks10th = '10th marks are required.';
      else if (!isScore(formData.education.marks10th)) errors.marks10th = 'Enter a score between 0 and 100.';
      if (!String(formData.education.marks12th).trim()) errors.marks12th = '12th marks are required.';
      else if (!isScore(formData.education.marks12th)) errors.marks12th = 'Enter a score between 0 and 100.';
      if (!String(formData.education.gpa).trim()) errors.gpa = 'GPA or percentage is required.';
      else if (!isScore(formData.education.gpa)) errors.gpa = 'Enter a value between 0 and 100.';
    }
    if (stepKey === 'parent') {
      if (!formData.parent.parentName.trim()) errors.parentName = 'Parent name is required.';
      if (!formData.parent.parentOccupation.trim()) errors.parentOccupation = 'Parent occupation is required.';
      if (!formData.parent.parentMobile.trim()) errors.parentMobile = 'Parent mobile number is required.';
    }
    if (stepKey === 'documents') {
      if (!requiredDocuments.length) {
        errors.documents = 'No required documents are configured for this scholarship yet.';
      } else {
        requiredDocuments.forEach((requiredDocument) => {
          const documentEntry = formData.documents.find((document) => document.documentName === requiredDocument.name);
          const key = `document:${requiredDocument.name}`;
          if (!documentEntry?.link?.trim()) errors[key] = `Please provide the link for ${requiredDocument.name}.`;
          else if (!isValidHttpLink(documentEntry.link.trim())) errors[key] = `Enter a valid http/https link for ${requiredDocument.name}.`;
        });
      }
    }
    if (stepKey === 'review') {
      if (!captcha.captchaId || !captcha.captchaInput.trim()) errors.captcha = 'Please complete the captcha challenge.';
    }
    return errors;
  };

  const currentValidationErrors = useMemo(() => getStepErrors(currentStepConfig.key), [currentStepConfig.key, formData, captcha, requiredDocuments]);

  useEffect(() => {
    setStepErrors(currentValidationErrors);
  }, [currentValidationErrors]);

  const goToNextStep = () => {
    const nextErrors = getStepErrors(currentStepConfig.key);
    setStepErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please complete the required fields before continuing.');
      return;
    }
    setCurrentStep((prev) => prev + 1);
    setSubmitError('');
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error('Please login to apply.');
      navigate('/login/student');
      return;
    }
    const reviewErrors = getStepErrors('review');
    setStepErrors(reviewErrors);
    if (Object.keys(reviewErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await apiClient.post('/applications', {
        scholarshipId: Number(id),
        applicantName: formData.personal.name.trim(),
        applicantEmail: formData.personal.email.trim(),
        applicantPhone: formData.personal.phone.trim(),
        applicantAddress: formData.personal.address.trim(),
        applicantEducation: formData.education.education.trim(),
        studentClass: formData.education.studentClass.trim(),
        location: formData.personal.location.trim(),
        parentName: formData.parent.parentName.trim(),
        parentOccupation: formData.parent.parentOccupation.trim(),
        parentMobile: formData.parent.parentMobile.trim(),
        marks10th: Number(formData.education.marks10th),
        marks12th: Number(formData.education.marks12th),
        gpa: Number(formData.education.gpa),
        documents: formData.documents.map((document) => ({ documentName: document.documentName, link: document.link.trim() })),
        captchaId: captcha.captchaId,
        captchaInput: captcha.captchaInput.trim(),
      });
      toast.success('Application submitted successfully!');
      setHasApplied(true);
      setTimeout(() => navigate('/scholarships'), 1800);
    } catch (error) {
      console.error('Application submission failed:', error);
      const message = error.response?.data?.message || 'Failed to submit application.';
      setSubmitError(message);
      toast.error(message);
      setCaptcha({ captchaId: '', captchaInput: '' });
      setCaptchaRefreshSignal((prev) => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (currentStepConfig.key === 'personal') {
      return (
        <Card title="Personal Details" subtitle="Add your basic contact details before moving to the next section.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <Field label="Full Name" value={formData.personal.name} onChange={(event) => setSectionField('personal', 'name', event.target.value)} placeholder="As per your documents" error={stepErrors.name} />
            <Field label="Email Address" type="email" value={formData.personal.email} onChange={(event) => setSectionField('personal', 'email', event.target.value)} placeholder="name@example.com" error={stepErrors.email} />
            <Field label="Phone Number" value={formData.personal.phone} onChange={(event) => setSectionField('personal', 'phone', event.target.value)} placeholder="+91 XXXXX XXXXX" error={stepErrors.phone} />
            <Field label="Current Location" value={formData.personal.location} onChange={(event) => setSectionField('personal', 'location', event.target.value)} placeholder="City, State" error={stepErrors.location} />
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Permanent Address" value={formData.personal.address} onChange={(event) => setSectionField('personal', 'address', event.target.value)} placeholder="Street, area, city, state, pincode" textarea error={stepErrors.address} />
            </div>
          </div>
        </Card>
      );
    }

    if (currentStepConfig.key === 'education') {
      return (
        <Card title="Educational Details" subtitle="These values are carried forward directly into the existing application submission payload.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <Field label="Current Class / Course" value={formData.education.studentClass} onChange={(event) => setSectionField('education', 'studentClass', event.target.value)} placeholder="12th Standard, B.Tech 2nd Year" error={stepErrors.studentClass} />
            <Field label="Overall GPA / Percentage" type="number" value={formData.education.gpa} onChange={(event) => setSectionField('education', 'gpa', event.target.value)} placeholder="0 - 100" error={stepErrors.gpa} />
            <Field label="10th Marks (%)" type="number" value={formData.education.marks10th} onChange={(event) => setSectionField('education', 'marks10th', event.target.value)} placeholder="0 - 100" error={stepErrors.marks10th} />
            <Field label="12th Marks (%)" type="number" value={formData.education.marks12th} onChange={(event) => setSectionField('education', 'marks12th', event.target.value)} placeholder="0 - 100" error={stepErrors.marks12th} />
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Education Details" value={formData.education.education} onChange={(event) => setSectionField('education', 'education', event.target.value)} placeholder="School, college, board, stream, or relevant academic context" textarea error={stepErrors.education} />
            </div>
          </div>
        </Card>
      );
    }

    if (currentStepConfig.key === 'parent') {
      return (
        <Card title="Parent Details" subtitle="Parent information stays in the shared form state, so moving back and forth will not reset anything.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <Field label="Parent Name" value={formData.parent.parentName} onChange={(event) => setSectionField('parent', 'parentName', event.target.value)} placeholder="Parent or guardian name" error={stepErrors.parentName} />
            <Field label="Parent Occupation" value={formData.parent.parentOccupation} onChange={(event) => setSectionField('parent', 'parentOccupation', event.target.value)} placeholder="Teacher, farmer, employee, business" error={stepErrors.parentOccupation} />
            <Field label="Parent Mobile Number" value={formData.parent.parentMobile} onChange={(event) => setSectionField('parent', 'parentMobile', event.target.value)} placeholder="+91 XXXXX XXXXX" error={stepErrors.parentMobile} />
          </div>
        </Card>
      );
    }

    if (currentStepConfig.key === 'documents') {
      return (
        <Card title="Required Documents" subtitle="Document inputs are fully dynamic and come from the backend scholarship configuration.">
          <div style={{ display: 'flex', gap: '0.8rem', background: 'rgba(234, 88, 12, 0.08)', border: '1px solid rgba(234, 88, 12, 0.18)', borderRadius: 16, padding: '1rem', marginBottom: '1.5rem' }}>
            <Info size={18} style={{ color: '#ea580c', flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Paste a public view link for each required document. The link is mapped by document name, so the backend receives the exact expected structure.</p>
          </div>
          {stepErrors.documents && <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: '1rem' }}>{stepErrors.documents}</div>}
          <div style={{ display: 'grid', gap: '1rem' }}>
            {requiredDocuments.map((document) => {
              const documentEntry = formData.documents.find((entry) => entry.documentName === document.name);
              return (
                <Field
                  key={document.name}
                  label={document.name}
                  type="url"
                  value={documentEntry?.link || ''}
                  onChange={(event) => handleDocumentChange(document.name, event.target.value)}
                  placeholder={`Paste the ${document.name} link`}
                  error={stepErrors[`document:${document.name}`]}
                />
              );
            })}
          </div>
        </Card>
      );
    }

    return (
      <Card title="Review and Submit" subtitle="Review the current data, complete the image captcha, and submit using the existing backend application API with backend-side captcha verification.">
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 20, padding: '1.25rem' }}>
            <SummaryRow label="Applicant" value={formData.personal.name} />
            <SummaryRow label="Email" value={formData.personal.email} />
            <SummaryRow label="Phone" value={formData.personal.phone} />
            <SummaryRow label="Location" value={formData.personal.location} />
            <SummaryRow label="Course / Class" value={formData.education.studentClass} />
            <SummaryRow label="GPA / Percentage" value={formData.education.gpa} />
            <SummaryRow label="Parent" value={formData.parent.parentName} />
            <SummaryRow label="Documents" value={`${formData.documents.filter((document) => document.link.trim()).length} / ${requiredDocuments.length} attached`} />
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 20, padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.9rem', color: 'var(--text-primary)', fontSize: '1rem' }}>CAPTCHA Verification</h3>
            <CaptchaField
              value={captcha}
              onChange={setCaptcha}
              refreshSignal={captchaRefreshSignal}
              error={stepErrors.captcha}
            />
          </div>
          {submitError && <div style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.18)', color: '#dc2626', borderRadius: 16, padding: '0.95rem 1rem', fontWeight: 600 }}>{submitError}</div>}
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}><Loader className="animate-spin text-orange-600" size={48} /><p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading scholarship details...</p></div>;
  }

  if (hasApplied) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ maxWidth: 520, width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
          <div className="icon-pill" style={{ color: '#34c759', background: 'rgba(52,199,89,0.1)', width: 84, height: 84, borderRadius: '50%', margin: '0 auto 1.5rem' }}><CheckCircle size={40} /></div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Application Submitted</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>You have already applied for <strong>{scholarship?.title}</strong>. We will update you once the review progresses.</p>
          <button onClick={() => navigate('/scholarships')} className="apple-btn apple-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Back to Scholarships</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '5rem' }}>
      <div style={{ position: 'relative', minHeight: 340, background: 'linear-gradient(135deg, #141414 0%, #303030 100%)', padding: '2rem 1.5rem 6rem', overflow: 'hidden' }}>
        <motion.div animate={{ x: [0, 42, 0], y: [0, 26, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', top: '-10%', right: '12%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,88,12,0.18) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate('/scholarships')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', padding: '0.7rem 1.1rem', borderRadius: 999, fontWeight: 700, cursor: 'pointer', marginBottom: '2rem' }}><ArrowLeft size={16} />Back to Scholarships</button>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ maxWidth: 700 }}>
              <span style={{ display: 'inline-block', background: 'rgba(234,88,12,0.18)', color: '#ff9b66', padding: '0.35rem 0.8rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '1rem' }}>APPLY NOW</span>
              <h1 style={{ margin: 0, color: 'white', fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1.08 }}>{scholarship?.title}</h1>
              <p style={{ color: 'rgba(255,255,255,0.72)', marginTop: '1rem', lineHeight: 1.7, maxWidth: '60ch' }}>Submit a complete application in guided steps. Your data stays in one form state from start to finish.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem 1.75rem', background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
              <div style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>AWARD AMOUNT</div>
              <div style={{ color: '#ff9b66', fontSize: '2.2rem', fontWeight: 800 }}>Rs. {scholarship?.amount?.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1080, margin: '-3.5rem auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 28, padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 18px 48px rgba(15, 23, 42, 0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem' }}>
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isComplete = index < currentStep;
                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.95rem 1rem', borderRadius: 18, border: isActive ? '1px solid rgba(234, 88, 12, 0.35)' : '1px solid var(--border)', background: isActive ? 'rgba(234, 88, 12, 0.08)' : isComplete ? 'rgba(52, 199, 89, 0.08)' : 'transparent' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isComplete ? '#34c759' : isActive ? '#ea580c' : 'rgba(148, 163, 184, 0.12)', color: isComplete || isActive ? '#fff' : 'var(--text-secondary)', flexShrink: 0 }}><Icon size={18} /></div>
                    <div><div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>STEP {index + 1}</div><div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{step.label}</div></div>
                  </div>
                );
              })}
            </div>
          </div>
          {renderStepContent()}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={goToPreviousStep} disabled={currentStep === 0 || isSubmitting} className="apple-btn" style={{ minWidth: 150, justifyContent: 'center', opacity: currentStep === 0 ? 0.55 : 1 }}>
              <ChevronLeft size={18} />
              Back
            </button>
            {currentStep < STEPS.length - 1 ? (
              <button type="button" onClick={goToNextStep} disabled={Object.keys(stepErrors).length > 0} className="apple-btn apple-btn-primary" style={{ minWidth: 180, justifyContent: 'center', opacity: Object.keys(stepErrors).length > 0 ? 0.65 : 1 }}>
                Next
                <ChevronRight size={18} />
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting || Object.keys(stepErrors).length > 0} className="apple-btn apple-btn-primary" style={{ minWidth: 220, justifyContent: 'center', opacity: isSubmitting || Object.keys(stepErrors).length > 0 ? 0.7 : 1 }}>
                {isSubmitting ? <><Loader className="animate-spin" size={18} />Submitting...</> : <><Send size={18} />Submit Application</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
