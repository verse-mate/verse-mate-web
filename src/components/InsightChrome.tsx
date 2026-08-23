/**
 * The phone chrome every reading surface wears: a 56px bar whose left slot
 * names what you're looking at, a Bible / Insight toggle on the right, and a
 * centred pill group naming the view.
 *
 * The Bible reader established it, Topics copied it by hand, and the Jesus tab
 * grew a back-arrow header with underline tabs instead — three surfaces, two
 * answers. It lives here so the copies can't drift again.
 *
 * Desktop doesn't use any of this: at ≥768px `DesktopLayout` owns the chrome
 * and these screens render only their content pane.
 */

import { useEffect, useRef } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { vmTokens } from '@/styles/themeStyles';

const FONT = 'Roboto, sans-serif';

/** The Bible / Insight toggle's two states. */
type View = 'bible' | 'insight';

export interface PillTab<T extends string = string> {
  id: T;
  label: string;
}

/**
 * The top bar. `title` is the dropdown-button slot — "Genesis 1" on the
 * reader, the topic's name on a topic, the event's name on a Jesus event.
 */
export function InsightHeader({
  title,
  onTitleClick,
  titleTestId,
  view = 'insight',
  onBible,
  onInsight,
}: {
  title: string;
  onTitleClick: () => void;
  titleTestId: string;
  view?: View;
  onBible: () => void;
  onInsight?: () => void;
}) {
  const navigate = useNavigate();

  return (
    // `.safe-top` adds only the real notch inset (0 on desktop / non-notched)
    // so the bar stays its 56px row instead of carrying a fixed status-bar
    // floor that reads as dead space at desktop zoom.
    <header className="shrink-0 safe-top" style={{ backgroundColor: vmTokens.headerBg }}>
      <div className="flex items-center justify-between px-4" style={{ height: 56 }}>
        <button
          onClick={onTitleClick}
          data-testid={titleTestId}
          className="flex items-center gap-1.5 min-h-[44px] pr-2 -ml-1"
          style={{ color: vmTokens.headerFg }}
        >
          <span
            style={{
              fontFamily: FONT,
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '24px',
              color: vmTokens.headerFg,
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
          <ChevronDown size={18} style={{ color: vmTokens.headerFg }} strokeWidth={2} />
        </button>

        <div className="flex items-center gap-2">
          <div
            style={{
              display: 'flex',
              backgroundColor: vmTokens.pillBg,
              borderRadius: 100,
              padding: '3px',
            }}
          >
            <ViewPill label="Bible" testId="bible-view-icon" active={view === 'bible'} onClick={onBible} />
            <ViewPill
              label="Insight"
              testId="commentary-view-icon"
              active={view === 'insight'}
              onClick={onInsight}
            />
          </div>
          <button
            onClick={() => navigate('/menu')}
            aria-label="Open menu"
            data-testid="hamburger-menu-button"
            className="flex items-center justify-center w-[44px] h-[44px] -mr-2"
          >
            <Menu size={22} style={{ color: vmTokens.headerFg }} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}

function ViewPill({
  label,
  testId,
  active,
  onClick,
}: {
  label: string;
  testId: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      data-testid={testId}
      onClick={onClick}
      style={{
        fontFamily: FONT,
        fontWeight: 400,
        fontSize: 14,
        lineHeight: '24px',
        padding: '2px 12px',
        borderRadius: 100,
        backgroundColor: active ? vmTokens.gold : 'transparent',
        color: active ? vmTokens.pageBg : vmTokens.headerFg,
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

/**
 * The centred pill group under the bar.
 *
 * The track scrolls horizontally rather than wrapping, so a surface with more
 * views than the reader's four (a Jesus event has five) keeps one row of pills
 * instead of a second line that pushes the content down. A group that fits
 * still centres, so the four-pill surfaces look exactly as they did.
 */
export function PillTabs<T extends string>({
  tabs,
  active,
  onSelect,
  testIdPrefix,
  ariaLabel,
  containerTestId,
}: {
  tabs: readonly PillTab<T>[];
  active: T;
  onSelect: (id: T) => void;
  testIdPrefix: string;
  ariaLabel: string;
  containerTestId?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Keep the selected pill on screen when the group is wider than the phone —
  // otherwise selecting the last tab leaves the highlight scrolled out of view.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.querySelector('[aria-selected="true"]')?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
    });
  }, [active]);

  return (
    <div
      className="shrink-0"
      style={{
        backgroundColor: vmTokens.headerBg,
        display: 'flex',
        // `safe center` centres a group that fits and falls back to
        // flex-start when it doesn't — plain `center` would push the first
        // pill off the left edge, where no amount of scrolling reaches it.
        justifyContent: 'safe center',
        padding: '12px 16px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      <div
        ref={trackRef}
        role="tablist"
        aria-label={ariaLabel}
        data-testid={containerTestId}
        style={{
          display: 'flex',
          backgroundColor: vmTokens.pillBg,
          borderRadius: 100,
          padding: '3px',
          gap: 0,
          flexShrink: 0,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => onSelect(t.id)}
            data-testid={`${testIdPrefix}${t.id}`}
            style={{
              borderRadius: 100,
              padding: '4px 16px',
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 400,
              lineHeight: '24px',
              whiteSpace: 'nowrap',
              backgroundColor: active === t.id ? vmTokens.gold : 'transparent',
              color: active === t.id ? vmTokens.headerBg : vmTokens.headerFg,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
