import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Compass, Bookmark, StickyNote, Menu } from 'lucide-react';

const tabs = [
  { path: '/read', label: 'Reading', icon: BookOpen },
  { path: '/topics', label: 'Topics', icon: Compass },
  { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { path: '/notes', label: 'Notes', icon: StickyNote },
  { path: '/menu', label: 'Menu', icon: Menu },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = tabs.find(t => location.pathname.startsWith(t.path))?.path || '/read';

  return (
    <div className="phone-frame relative flex flex-col w-full max-w-[390px] h-[100dvh] max-h-[844px] mx-auto bg-background rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.12)] overflow-hidden">
      {/* Status bar spacer */}
      <div className="safe-top shrink-0 h-[44px] bg-card" />

      <main className="flex-1 overflow-y-auto relative">
        <Outlet />
      </main>

      {/* Bottom Tab Bar */}
      <nav className="shrink-0 flex items-center justify-around border-t border-border bg-card safe-bottom px-1 pt-1.5 pb-2">
        {tabs.map(tab => {
          const active = activeTab === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
                active ? 'text-accent' : 'text-tab-inactive'
              }`}
            >
              <tab.icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
