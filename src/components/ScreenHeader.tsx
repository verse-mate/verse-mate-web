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
 * ScreenHeader — sub-page header with white bg and dark text (matches production).
 * Production: background: white, back button with dark oil (#1B1B1B) icon.
 * Figma reference: Mobile App section — back arrow on the left, centered title.
 */
export default function ScreenHeader({ title, onBack, rightAction }: ScreenHeaderProps) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate(-1));

  return (
    <header
      className="shrink-0 bg-white text-[#1B1B1B] safe-top"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)',
        borderBottom: '1px solid rgba(220,224,227,0.5)',
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
          <ArrowLeft size={24} color="#1B1B1B" strokeWidth={2} />
        </button>
        <h1 className="text-[18px] font-medium text-[#1B1B1B] tracking-tight">{title}</h1>
        {rightAction && (
          <div className="absolute right-2 flex items-center">{rightAction}</div>
        )}
      </div>
    </header>
  );
}
