import { Outlet } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import DesktopLayout from '@/components/DesktopLayout';

/**
 * AppLayout — responsive shell.
 * Desktop (≥1024px): split-view via DesktopLayout.
 * Mobile/Tablet (<1024px): full-viewport, no phone frame.
 */
export default function AppLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (isDesktop) {
    return <DesktopLayout />;
  }

  // Mobile/tablet: full-screen, no frame constraint
  return (
    <div
      className="relative flex flex-col w-full overflow-hidden"
      style={{ backgroundColor: '#1B1B1B', height: '100dvh' }}
    >
      <Outlet />
    </div>
  );
}
