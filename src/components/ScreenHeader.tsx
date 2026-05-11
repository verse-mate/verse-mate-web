import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useRightPanel } from '@/contexts/RightPanelContext';
import { vmTokens } from '@/styles/themeStyles';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  /** Optional right-side action node */
  rightAction?: ReactNode;
  /**
   * Optional E2E test id for the back button. Defaults to
   * "screen-header-back-button"; pages override with feature-scoped values
   * (e.g. "bookmarks-back-button", "settings-back-button") so test selectors
   * mirror the mobile testID inventory.
   */
  backTestId?: string;
  /** Optional E2E test id applied to the screen title element. */
  titleTestId?: string;
}

/**
 * ScreenHeader — sub-page header.
 *
 * Mobile (full-screen): dark 56px bar with back chevron + centered title
 * (the prototype's `.sub-screen-header`).
 * Desktop (right-panel context): hide the dark bar entirely — the main
 * .app-header above the split-body already carries the navigation chrome,
 * so a second dark bar inside the right panel would stack two dark
 * headers vertically. Instead render a quiet white title row with the
 * back chevron + centered title so the panel is self-navigable but
 * doesn't introduce a second slab of black.
 */
export default function ScreenHeader({ title, onBack, rightAction, backTestId, titleTestId }: ScreenHeaderProps) {
  const navigate = useNavigate();
  const rightPanel = useRightPanel();
  // When inside the desktop right panel, always use the panel's goBack
  const handleBack = rightPanel?.isRightPanel ? rightPanel.goBack : (onBack || (() => navigate('/read')));

  const isInRightPanel = !!rightPanel?.isRightPanel;

  if (isInRightPanel) {
    // Light title bar — sits ON the white commentary surface, no second
    // dark slab. Back chevron dark, title dark, subtle bottom divider.
    return (
      <header
        className="shrink-0"
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          background: 'var(--bg-commentary)',
          borderBottom: '1px solid var(--card-border)',
          gap: 8,
        }}
      >
        <button
          onClick={handleBack}
          aria-label="Back"
          data-testid={backTestId || 'screen-header-back-button'}
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: vmTokens.textPrimary,
            borderRadius: 8,
          }}
        >
          <ArrowLeft size={22} color={vmTokens.textPrimary} strokeWidth={2} />
        </button>
        <h1
          data-testid={titleTestId || 'screen-header-title'}
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 17,
            fontWeight: 600,
            color: vmTokens.textPrimary,
            margin: 0,
          }}
        >
          {title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 36 }}>
          {rightAction}
        </div>
      </header>
    );
  }

  return (
    <header
      className="sub-screen-header safe-top"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      <button
        className="icon-btn"
        onClick={handleBack}
        aria-label="Back"
        data-testid={backTestId || 'screen-header-back-button'}
      >
        <ArrowLeft size={22} color={vmTokens.headerFg} strokeWidth={2} />
      </button>
      <h1
        className="sub-screen-title"
        data-testid={titleTestId || 'screen-header-title'}
        style={{ flex: 1, textAlign: 'center' }}
      >
        {title}
      </h1>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {rightAction}
      </div>
    </header>
  );
}
