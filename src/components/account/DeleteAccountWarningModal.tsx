/**
 * Web port of verse-mate-mobile/components/account/DeleteAccountWarningModal.tsx.
 * Light-themed (white card) modal — matches mobile pixel-faithfully.
 */

import {
  AlertTriangle,
  BookOpen,
  Bookmark,
  MessageSquare,
  Pencil,
  Settings as SettingsIcon,
  User,
} from 'lucide-react';
import { useEffect } from 'react';
import { vmTokens } from '@/styles/themeStyles';

interface DeleteAccountWarningModalProps {
  visible: boolean;
  onCancel: () => void;
  onContinue: () => void;
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
  padding: 20,
  width: '100%',
  maxWidth: 400,
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: 16,
};

const titleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: '#111827',
  textAlign: 'center',
  marginTop: 12,
};

const warningTextStyle: React.CSSProperties = {
  fontSize: 16,
  color: vmTokens.statusError,
  textAlign: 'center',
  marginBottom: 20,
  fontWeight: 600,
};

const dataListStyle: React.CSSProperties = {
  background: '#f9fafb',
  borderRadius: 8,
  padding: 16,
  marginBottom: 20,
};

const dataListTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 12,
};

const dataItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 8,
};

const dataItemTextStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#6b7280',
  marginLeft: 8,
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
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

const continueButtonStyle: React.CSSProperties = {
  flex: 1,
  background: vmTokens.statusError,
  color: vmTokens.surfaceRaisedBg,
  padding: '12px 20px',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
};

export function DeleteAccountWarningModal({
  visible,
  onCancel,
  onContinue,
}: DeleteAccountWarningModalProps) {
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, onCancel]);

  if (!visible) return null;

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-warning-title"
      onClick={onCancel}
    >
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <AlertTriangle size={48} color={vmTokens.statusError} />
          <h2 id="delete-warning-title" style={titleStyle}>
            Delete Your Account?
          </h2>
        </div>

        <p style={warningTextStyle}>This action is permanent and cannot be undone.</p>

        <div style={dataListStyle}>
          <p style={dataListTitleStyle}>The following data will be permanently deleted:</p>
          <div style={dataItemStyle}>
            <User size={16} color="#6b7280" />
            <span style={dataItemTextStyle}>Profile information</span>
          </div>
          <div style={dataItemStyle}>
            <BookOpen size={16} color="#6b7280" />
            <span style={dataItemTextStyle}>Reading progress and history</span>
          </div>
          <div style={dataItemStyle}>
            <Pencil size={16} color="#6b7280" />
            <span style={dataItemTextStyle}>Notes and highlights</span>
          </div>
          <div style={dataItemStyle}>
            <Bookmark size={16} color="#6b7280" />
            <span style={dataItemTextStyle}>Bookmarks and favorites</span>
          </div>
          <div style={dataItemStyle}>
            <MessageSquare size={16} color="#6b7280" />
            <span style={dataItemTextStyle}>Chat conversations</span>
          </div>
          <div style={dataItemStyle}>
            <SettingsIcon size={16} color="#6b7280" />
            <span style={dataItemTextStyle}>All preferences and settings</span>
          </div>
        </div>

        <div style={buttonContainerStyle}>
          <button
            type="button"
            onClick={onCancel}
            style={cancelButtonStyle}
            aria-label="Cancel account deletion"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onContinue}
            style={continueButtonStyle}
            aria-label="Continue with account deletion"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
