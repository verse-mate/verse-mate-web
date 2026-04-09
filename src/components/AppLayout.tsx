import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="phone-frame relative flex flex-col w-full max-w-[390px] h-[100dvh] max-h-[844px] mx-auto bg-background rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.12)] overflow-hidden">
      <main className="flex-1 overflow-y-auto relative">
        <Outlet />
      </main>
    </div>
  );
}
