import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import {
  User,
  BookOpen,
  Bookmark,
  FileText,
  Highlighter,
  Compass,
  Settings,
  Share2,
  Info,
  Heart,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react';

const primaryItems: {
  label: string;
  icon: typeof BookOpen;
  path: string;
  onClick?: () => void;
}[] = [
  { label: 'Reading', icon: BookOpen, path: '/read' },
  { label: 'Topics', icon: Compass, path: '/topics' },
  { label: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
  { label: 'Notes', icon: FileText, path: '/notes' },
  { label: 'Highlights', icon: Highlighter, path: '/highlights' },
  { label: 'Settings', icon: Settings, path: '/menu/settings' },
  { label: 'About', icon: Info, path: '/menu/about' },
  { label: 'Giving', icon: Heart, path: '/menu/giving' },
  { label: 'Help', icon: HelpCircle, path: '/menu/help' },
];

/**
 * MenuScreen — dark drawer-style screen matching Figma Mobile App Menu frame.
 * Title on top with X close, user profile row, list of items, logout in red.
 */
export default function MenuScreen() {
  const navigate = useNavigate();
  const { state, signOut } = useApp();

  const handleLogout = async () => {
    if (state.isSignedIn) {
      await signOut();
      navigate('/read');
    } else {
      navigate('/menu/signin');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({
        title: 'VerseMate',
        text: 'Read the Bible with VerseMate',
        url: window.location.origin,
      });
    } catch {
      navigator.clipboard?.writeText(window.location.origin).catch(() => undefined);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-surface text-dark-fg">
      {/* Header — title + close */}
      <header
        className="shrink-0 flex items-center justify-between px-5 safe-top"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 48px)', height: 104 }}
      >
        <h1 className="text-[18px] font-medium text-dark-fg">Menu</h1>
        <button
          onClick={() => navigate('/read')}
          aria-label="Close menu"
          className="w-[44px] h-[44px] flex items-center justify-center -mr-2"
        >
          <X size={22} className="text-dark-fg" strokeWidth={2} />
        </button>
      </header>

      {/* User row */}
      <div className="px-5 pb-2">
        <div className="flex items-center gap-3 pb-5 border-b border-dark">
          <div className="w-10 h-10 rounded-full bg-dark-raised flex items-center justify-center">
            <User size={20} className="text-dark-muted" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] text-dark-fg font-normal truncate">
              {state.isSignedIn ? 'Alexandr Zarovsky' : 'Guest'}
            </p>
            <p className="text-[12px] text-dark-muted truncate">
              {state.isSignedIn ? 'alexandr.zarovsky@gmail.com' : 'Tap to sign in'}
            </p>
          </div>
        </div>
      </div>

      {/* Menu list */}
      <div className="flex-1 overflow-y-auto px-2 pt-2">
        {primaryItems.map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-4 w-full h-[48px] px-3 rounded-lg hover:bg-dark-raised transition-colors"
          >
            <item.icon size={20} className="text-dark-fg" strokeWidth={1.5} />
            <span className="text-[15px] text-dark-fg font-normal">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Share + Logout */}
      <div className="shrink-0 px-2 pb-6 safe-bottom space-y-1">
        <button
          onClick={handleShare}
          className="flex items-center gap-4 w-full h-[48px] px-3 rounded-lg hover:bg-dark-raised transition-colors"
        >
          <Share2 size={20} className="text-dark-fg" strokeWidth={1.5} />
          <span className="text-[15px] text-dark-fg font-normal">Share VerseMate</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full h-[48px] px-3 rounded-lg hover:bg-dark-raised transition-colors"
        >
          <LogOut size={20} className="text-red-400" strokeWidth={1.5} />
          <span className="text-[15px] text-red-400 font-normal">
            {state.isSignedIn ? 'Logout' : 'Sign In'}
          </span>
        </button>
      </div>
    </div>
  );
}
