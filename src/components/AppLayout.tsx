import { Outlet, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import DesktopLayout from '@/components/DesktopLayout';
import { AudioPlayerRoot } from '@/audio';
import { TopicViewProvider } from '@/contexts/TopicViewContext';
import { vmTokens } from '@/styles/themeStyles';

/**
 * AppLayout — responsive shell.
 *
 * Desktop (≥1024px) + Tablet (768-1023px): split-view via DesktopLayout
 *   — but ONLY for Bible-reading routes (`/bible/*`, `/read`, `/read/*`).
 *   For non-reading routes (topics, bookmarks, notes, menu sub-pages,
 *   auth, etc.) we fall through to the mobile single-panel layout so the
 *   page renders full-screen and unrelated state in `DesktopLayout` is
 *   torn down. See issue #128.
 * Phone (<768px): single-panel, full-viewport for every route.
 *
 * AudioPlayerRoot wraps every branch so the singleton <audio> element +
 * dock + sheet survive route changes (br-audio-011 cross-nav continuity).
 */
export default function AppLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isTablet = useMediaQuery('(min-width: 768px)');
  const location = useLocation();

  // Desktop split-view paths: `/bible/<slug>/<n>`, `/read`, the commentary
  // sub-routes under `/read/...`, AND topics (`/topic/*`, `/topics/*`)
  // including most-quoted. Keeping topics inside the split-view (rendered
  // in the LEFT panel via Outlet, with commentary/right-panel preserved)
  // means the user doesn't lose the books sidebar or the side panel
  // navigation when drilling into a topic. Auth / menu sub-pages still
  // fall through to full-screen since they replace the whole flow.
  const isReadingPath =
    location.pathname.startsWith('/bible/') ||
    location.pathname === '/read' ||
    location.pathname.startsWith('/read/') ||
    location.pathname.startsWith('/topic/') ||
    location.pathname.startsWith('/topics');

  if (isDesktop && isReadingPath) {
    return (
      <AudioPlayerRoot>
        <TopicViewProvider>
          <DesktopLayout />
        </TopicViewProvider>
      </AudioPlayerRoot>
    );
  }

  if (isTablet && isReadingPath) {
    return (
      <AudioPlayerRoot>
        <TopicViewProvider>
          <DesktopLayout hideSidebar />
        </TopicViewProvider>
      </AudioPlayerRoot>
    );
  }

  return (
    <AudioPlayerRoot>
      <TopicViewProvider>
        <div
          className="relative flex flex-col w-full overflow-hidden"
          style={{ backgroundColor: vmTokens.chromeBg, height: '100dvh' }}
        >
          <Outlet />
        </div>
      </TopicViewProvider>
    </AudioPlayerRoot>
  );
}
