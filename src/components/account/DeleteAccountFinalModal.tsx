/**
 * Web port of verse-mate-mobile/components/account/DeleteAccountFinalModal.tsx.
 * Light-themed (white card) modal — matches mobile pixel-faithfully.
 */

import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { vmTokens } from '@/styles/themeStyles';

interface DeleteAccountFinalModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean;
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
  background: vmTokens.surfaceRaisedBg,
  borderRadius: 12,
  padding: 24,
  width: '100%',
  maxWidth: 400,
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: 20,
};

const titleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: '#111827',
  textAlign: 'center',
  marginTop: 16,
};

const warningBoxStyle: React.CSSProperties = {
  background: '#fef2f2',
  borderLeft: `4px solid ${vmTokens.statusError}`,
  padding: 16,
  borderRadius: 8,
  marginBottom: 24,
};

const warningTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: '#991b1b',
  marginBottom: 8,
};

const warningTextStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#7f1d1d',
  lineHeight: '20px',
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const cancelButtonStyle: React.CSSProperties = {
  background: '#f3f4f6',
  color: '#374151',
  padding: '14px 20px',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
};

const confirmButtonStyle: React.CSSProperties = {
  background: vmTokens.statusError,
  color: vmTokens.surfaceRaisedBg,
  padding: '14px 20px',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 52,
};

export function DeleteAccountFinalModal({
  visible,
  onCancel,
  onConfirm,
  isLoading,
}: DeleteAccountFinalModalProps) {
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, isLoading, onCancel]);

  if (!visible) return null;

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-final-title"
      onClick={() => {
        if (!isLoading) onCancel();
      }}
    >
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <AlertCircle size={64} color={vmTokens.statusError} />
          <h2 id="delete-final-title" style={titleStyle}>
            Are You Absolutely Sure?
          </h2>
        </div>

        <div style={warningBoxStyle}>
          <p style={warningTitleStyle}>This is your last chance to cancel.</p>
          <p style={warningTextStyle}>
            Your account and all data will be permanently deleted and cannot be recovered.
          </p>
        </div>

        <div style={buttonContainerStyle}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Cancel account deletion"
            style={{ ...cancelButtonStyle, opacity: isLoading ? 0.5 : 1 }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            aria-label="Confirm account deletion permanently"
            data-testid="delete-account-confirm"
            style={{ ...confirmButtonStyle, opacity: isLoading ? 0.5 : 1 }}
          >
            {isLoading ? (
              <Loader2 size={20} color="#ffffff" className="animate-spin" />
            ) : (
              'Yes, Delete My Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
