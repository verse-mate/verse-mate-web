import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Compass, Bookmark, Menu } from 'lucide-react';

const tabs = [
  { path: '/read', label: 'Reading', icon: BookOpen },
  { path: '/topics', label: 'Topics', icon: Compass },
  { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { path: '/menu', label: 'Menu', icon: Menu },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = tabs.find(t => location.pathname.startsWith(t.path))?.path || '/read';

  return (
    <div className="flex flex-col h-[100dvh] max-w-lg mx-auto bg-background">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Tab Bar */}
      <nav className="flex items-center justify-around border-t border-border bg-card safe-bottom px-2 pt-1 pb-1">
        {tabs.map(tab => {
          const active = activeTab === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                active ? 'text-accent' : 'text-tab-inactive'
              }`}
            >
              <tab.icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[11px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
