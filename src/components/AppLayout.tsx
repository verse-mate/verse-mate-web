import { Outlet } from 'react-router-dom';

/**
 * AppLayout — 390x844 phone frame shell, centered on desktop, fullscreen on mobile.
 * Each page owns its own header/footer; AppLayout just hosts the frame chrome.
 */
export default function AppLayout() {
  return (
    <div
      className="phone-frame relative flex flex-col w-full max-w-[390px] h-[100dvh] max-h-[844px] mx-auto overflow-hidden rounded-[2.25rem] shadow-[0_10px_50px_-10px_rgba(0,0,0,0.3)]"
      style={{ backgroundColor: '#1B1B1B' }}
    >
      <Outlet />
    </div>
  );
}
