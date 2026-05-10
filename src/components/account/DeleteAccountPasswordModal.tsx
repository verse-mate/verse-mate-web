/**
 * Web port of verse-mate-mobile/components/account/DeleteAccountPasswordModal.tsx.
 * Light-themed (white card) modal — matches mobile pixel-faithfully.
 */

import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DeleteAccountPasswordModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (password: string) => void;
  isLoading: boolean;
  error?: string;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 12,
  padding: 20,
  width: '100%',
  maxWidth: 400,
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
};

const titleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: '#111827',
  textAlign: 'center',
  marginBottom: 8,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#6b7280',
  textAlign: 'center',
  marginBottom: 20,
};

const inputContainerStyle: React.CSSProperties = {
  position: 'relative',
  marginBottom: 12,
};

const baseInputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '12px 48px 12px 16px',
  fontSize: 16,
  color: '#111827',
  background: '#ffffff',
  boxSizing: 'border-box',
  outline: 'none',
};

const eyeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: 8,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const errorContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  background: '#fef2f2',
  padding: '8px 12px',
  borderRadius: 6,
  marginBottom: 12,
};

const errorTextStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#dc2626',
  marginLeft: 6,
  flex: 1,
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginTop: 8,
};

const cancelButtonStyle: React.CSSProperties = {
  flex: 1,
  background: '#f3f4f6',
  color: '#374151',
  padding: '12px 20px',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
};

const deleteButtonStyle: React.CSSProperties = {
  flex: 1,
  background: '#dc2626',
  color: '#ffffff',
  padding: '12px 20px',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
};

export function DeleteAccountPasswordModal({
  visible,
  onCancel,
  onConfirm,
  isLoading,
  error,
}: DeleteAccountPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!visible) {
      setPassword('');
      setShowPassword(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, isLoading, onCancel]);

  if (!visible) return null;

  const handleConfirm = () => {
    if (password.trim()) onConfirm(password);
  };

  const disabled = isLoading || !password.trim();

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-password-title"
      onClick={() => {
        if (!isLoading) onCancel();
      }}
    >
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 id="delete-password-title" style={titleStyle}>
          Verify Your Password
        </h2>
        <p style={subtitleStyle}>Enter your password to confirm account deletion</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!disabled) handleConfirm();
          }}
        >
          <div style={inputContainerStyle}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              autoFocus
              disabled={isLoading}
              aria-label="Password"
              data-testid="delete-account-password-input"
              style={{
                ...baseInputStyle,
                borderColor: error ? '#dc2626' : '#d1d5db',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              disabled={isLoading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={eyeButtonStyle}
            >
              {showPassword ? (
                <EyeOff size={20} color="#6b7280" />
              ) : (
                <Eye size={20} color="#6b7280" />
              )}
            </button>
          </div>

          {error && (
            <div style={errorContainerStyle}>
              <AlertCircle size={16} color="#dc2626" />
              <span style={errorTextStyle}>{error}</span>
            </div>
          )}

          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              style={{ ...cancelButtonStyle, opacity: isLoading ? 0.5 : 1 }}
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={disabled}
              aria-label="Delete account"
              style={{ ...deleteButtonStyle, opacity: disabled ? 0.5 : 1 }}
            >
              {isLoading ? (
                <Loader2 size={20} color="#ffffff" className="animate-spin" />
              ) : (
                'Delete Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
