import React from 'react';
import { Calendar, IndianRupee, Building } from 'lucide-react';

export const ScholarshipCard = ({
  scholarship,
  onApply,
  onView,
  showActions = true,
  hasApplied = false,
}) => {
  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  const daysLeft = Math.ceil(
    (new Date(scholarship.deadline || Date.now()).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isExpired    = daysLeft <= 0;
  const isNear       = daysLeft <= 7 && !isExpired;

  const categoryColor = {
    'Merit-based': { bg: 'rgba(234,88,12,0.10)', color: '#EA580C' },
    'Need-based':  { bg: 'rgba(52,199,89,0.12)', color: '#248a3d' },
  }[scholarship.category] ?? { bg: 'rgba(94,92,230,0.10)', color: '#5e5ce6' };

  // SAFE FALLBACKS: If backend returns null, default to an empty array so it doesn't crash!
  const eligibilityList = scholarship.eligibility || scholarship.eligibilityCriteria || [];

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        cursor: 'default',
        padding: '1.25rem',
        height: '100%',
        transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.012)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(234,88,12,0.14), 0 4px 12px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1, marginRight: '0.75rem' }}>
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {scholarship.title || 'Untitled Scholarship'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <Building size={13} />
            {scholarship.provider || 'Unknown Provider'}
          </div>
        </div>
        <span style={{ flexShrink: 0, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: categoryColor.bg, color: categoryColor.color }}>
          {scholarship.category || 'Other'}
        </span>
      </div>

      {/* Amount */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
        <IndianRupee size={18} style={{ color: '#EA580C' }} />
        <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#EA580C' }}>
          {formatAmount(scholarship.amount)}
        </span>
      </div>

      {/* Description */}
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
        {scholarship.description || 'No description provided.'}
      </p>

      {/* Eligibility pills (Using our safe fallback array) */}
      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ margin: '0 0 0.4rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Key Eligibility</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {eligibilityList.length > 0 ? (
            <>
              {eligibilityList.slice(0, 2).map((c, i) => (
                <span key={i} style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 500, background: 'rgba(234,88,12,0.08)', color: '#EA580C' }}>
                  {c}
                </span>
              ))}
              {eligibilityList.length > 2 && (
                <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', color: 'var(--text-tertiary)', background: 'var(--bg-elevated)' }}>
                  +{eligibilityList.length - 2} more
                </span>
              )}
            </>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Not specified</span>
          )}
        </div>
      </div>

      {/* Deadline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', fontSize: '0.8rem', color: isExpired ? '#ff3b30' : isNear ? '#EA580C' : 'var(--text-secondary)' }}>
        <Calendar size={13} />
        Deadline: {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-IN') : 'N/A'}
        {isExpired && <span style={{ fontWeight: 600 }}> · Expired</span>}
        {isNear && !isExpired && <span style={{ fontWeight: 600 }}> · {daysLeft}d left</span>}
      </div>

      {/* Actions */}
      {showActions && (
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
          <button
            onClick={onView}
            className="apple-btn apple-btn-secondary"
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', padding: '0.5rem' }}
          >
            View Details
          </button>

          {onApply && !isExpired && (
            <button
              onClick={onApply}
              disabled={hasApplied}
              className={hasApplied ? '' : 'apple-btn apple-btn-primary'}
              style={hasApplied ? {
                flex: 1, padding: '0.5rem',
                background: 'rgba(52,199,89,0.12)', color: '#248a3d',
                border: '1px solid rgba(52,199,89,0.25)',
                borderRadius: 50, fontSize: '0.82rem', fontWeight: 600,
                cursor: 'not-allowed',
              } : { flex: 1, justifyContent: 'center', fontSize: '0.82rem', padding: '0.5rem' }}
            >
              {hasApplied ? '✓ Applied' : 'Apply Now'}
            </button>
          )}
        </div>
      )}

      {isExpired && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 10, background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.18)', fontSize: '0.78rem', color: '#ff3b30', fontWeight: 500 }}>
          Application deadline has passed.
        </div>
      )}
    </div>
  );
};