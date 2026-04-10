import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  /** Optional right-side action node */
  rightAction?: ReactNode;
}

/**
 * ScreenHeader — sub-page header with dark bg and white text (Figma Mobile App section).
 * Background: #1B1B1B (dark-surface), back button with white icon.
 * Figma reference: Mobile App section — back arrow on the left, centered title.
 */
export default function ScreenHeader({ title, onBack, rightAction }: ScreenHeaderProps) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate('/read'));

  return (
    <header
      className="shrink-0 text-dark-fg safe-top"
      style={{
        backgroundColor: '#1A1A1A',
        paddingTop: 'max(env(safe-area-inset-top), 48px)',
        borderBottom: '1px solid #323232',
      }}
    >
      <div className="relative flex items-center justify-center px-3" style={{ height: 56 }}>
        <button
          onClick={handleBack}
          aria-label="Back"
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            marginRight: '12px',
            borderRadius: '4px',
            cursor: 'pointer',
            position: 'absolute',
            left: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
          }}
        >
          <ArrowLeft size={24} color="#fff" strokeWidth={2} />
        </button>
        <h1 className="text-[18px] font-medium text-dark-fg tracking-tight">{title}</h1>
        {rightAction && (
          <div className="absolute right-2 flex items-center">{rightAction}</div>
        )}
      </div>
    </header>
  );
}
