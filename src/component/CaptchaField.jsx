import React, { useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import apiClient from '../api/client';

export const CaptchaField = ({
  value,
  onChange,
  error,
  refreshSignal = 0,
  label = 'CAPTCHA',
}) => {
  const [captchaImage, setCaptchaImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState('');

  const fetchCaptcha = async () => {
    try {
      setIsLoading(true);
      setCaptchaError('');
      const response = await apiClient.get('/auth/captcha');
      setCaptchaImage(response.data.image || '');
      onChange({
        captchaId: response.data.captchaId || '',
        captchaInput: '',
      });
    } catch (fetchError) {
      console.error('Failed to fetch captcha:', fetchError);
      setCaptchaImage('');
      onChange({
        captchaId: '',
        captchaInput: '',
      });
      setCaptchaError('Unable to load captcha. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, [refreshSignal]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
        {label}
      </label>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ minHeight: 60, minWidth: 180, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {captchaImage ? (
            <img
              src={`data:image/png;base64,${captchaImage}`}
              alt="Captcha"
              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {isLoading ? 'Loading...' : 'Captcha unavailable'}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={fetchCaptcha}
          disabled={isLoading}
          className="apple-btn"
          style={{ justifyContent: 'center', minWidth: 140 }}
        >
          <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <input
        type="text"
        value={value.captchaInput}
        onChange={(event) => onChange({ ...value, captchaInput: event.target.value })}
        placeholder="Enter the text from the image"
        className="apple-input"
        style={{ borderColor: error ? '#dc2626' : 'var(--input-border)' }}
      />

      {(error || captchaError) && (
        <span style={{ color: '#dc2626', fontSize: '0.82rem', fontWeight: 600 }}>
          {error || captchaError}
        </span>
      )}
    </div>
  );
};
