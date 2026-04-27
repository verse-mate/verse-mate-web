import { Outlet } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import DesktopLayout from '@/components/DesktopLayout';
import { AudioPlayerRoot } from '@/audio';

/**
 * AppLayout — responsive shell.
 * Desktop (≥1024px): split-view with sidebar via DesktopLayout.
 * Tablet (768-1023px): split-view without sidebar (Bible + Commentary).
 * Phone (<768px): single-panel, full-viewport.
 *
 * AudioPlayerRoot wraps every branch so the singleton <audio> element +
 * dock + sheet survive route changes (br-audio-011 cross-nav continuity).
 */
export default function AppLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isTablet = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <AudioPlayerRoot>
        <DesktopLayout />
      </AudioPlayerRoot>
    );
  }

  if (isTablet) {
    return (
      <AudioPlayerRoot>
        <DesktopLayout hideSidebar />
      </AudioPlayerRoot>
    );
  }

  // Phone: single-panel, full-screen
  return (
    <AudioPlayerRoot>
      <div
        className="relative flex flex-col w-full overflow-hidden"
        style={{ backgroundColor: '#1B1B1B', height: '100dvh' }}
      >
        <Outlet />
      </div>
    </AudioPlayerRoot>
  );
}
