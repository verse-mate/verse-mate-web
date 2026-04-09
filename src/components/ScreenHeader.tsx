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
 * ScreenHeader — the shared dark header used on every non-Reading screen.
 * Figma reference: Mobile App section — back arrow on the left, centered title.
 * Height ~118px including the top padding (status area + 56px title row).
 */
export default function ScreenHeader({ title, onBack, rightAction }: ScreenHeaderProps) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate(-1));

  return (
    <header
      className="shrink-0 bg-dark-surface text-dark-fg safe-top"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 48px)' }}
    >
      <div className="relative flex items-center justify-center px-3" style={{ height: 56 }}>
        <button
          onClick={handleBack}
          aria-label="Back"
          className="absolute left-2 flex items-center justify-center w-[44px] h-[44px]"
        >
          <ArrowLeft size={22} className="text-dark-fg" strokeWidth={2} />
        </button>
        <h1 className="text-[18px] font-medium text-dark-fg tracking-tight">{title}</h1>
        {rightAction && (
          <div className="absolute right-2 flex items-center">{rightAction}</div>
        )}
      </div>
    </header>
  );
}
