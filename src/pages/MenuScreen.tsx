import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import {
  User,
  Bookmark,
  FileText,
  Highlighter,
  Settings,
  Info,
  Heart,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react';
import ShareIcon from '@/components/ShareIcon';

/**
 * MenuScreen — dark drawer. Figma frame 5307:4338.
 * Every row is a rounded dark-raised card with a thin border, stacked vertically
 * with 12px gaps. User profile is the first card (tappable when signed out).
 */

type Item = {
  label: string;
  icon: typeof Bookmark;
  path: string;
};

const items: Item[] = [
  { label: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
  { label: 'Notes', icon: FileText, path: '/notes' },
  { label: 'Highlights', icon: Highlighter, path: '/highlights' },
  { label: 'Settings', icon: Settings, path: '/menu/settings' },
  // Share is rendered inline below with a custom onClick
  { label: 'About', icon: Info, path: '/menu/about' },
  { label: 'Giving', icon: Heart, path: '/menu/giving' },
  { label: 'Help', icon: HelpCircle, path: '/menu/help' },
];

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
    <div className="flex flex-col h-full text-white" style={{ backgroundColor: '#1B1B1B' }}>
      {/* Header — title + close */}
      <header
        className="shrink-0 flex items-center justify-between px-5 safe-top"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 48px)', height: 92, backgroundColor: '#1A1A1A' }}
      >
        <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: 18, lineHeight: '24px', color: '#FFFFFF' }}>Menu</h1>
        <button
          onClick={() => navigate('/read')}
          aria-label="Close menu"
          className="w-[44px] h-[44px] flex items-center justify-center -mr-2"
        >
          <X size={22} style={{ color: '#FFFFFF' }} strokeWidth={2} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-2" style={{ backgroundColor: '#000000' }}>
        {/* User profile card */}
        <button
          onClick={() => !state.isSignedIn && navigate('/menu/signin')}
          disabled={state.isSignedIn}
          className="flex items-center gap-3 w-full h-[64px] px-4 rounded-xl text-left mb-3"
          style={{ backgroundColor: '#323232', border: '1px solid #323232' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#1B1B1B' }}>
            <User size={20} style={{ color: 'rgba(255,255,255,0.6)' }} strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', color: '#B09A6D' }}>
              {state.isSignedIn
                ? state.userName || state.userEmail?.split('@')[0] || ''
                : 'Guest'}
            </p>
            <p className="truncate" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 12, lineHeight: '18px', color: 'rgba(255,255,255,0.6)' }}>
              {state.isSignedIn ? state.userEmail || 'Loading...' : 'Tap to sign in'}
            </p>
          </div>
        </button>

        {/* Primary list */}
        <div className="space-y-2">
          {items.slice(0, 4).map(item => (
            <MenuRow
              key={item.label}
              icon={<item.icon size={18} style={{ color: '#FFFFFF' }} strokeWidth={1.5} />}
              label={item.label}
              onClick={() => navigate(item.path)}
            />
          ))}
          <MenuRow
            icon={<ShareIcon size={18} color="#FFFFFF" />}
            label="Share VerseMate"
            onClick={handleShare}
          />
          {items.slice(4).map(item => (
            <MenuRow
              key={item.label}
              icon={<item.icon size={18} style={{ color: '#FFFFFF' }} strokeWidth={1.5} />}
              label={item.label}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>

        {/* Logout / Sign in — bordered card in red */}
        <div className="mt-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full h-[56px] px-4 rounded-xl"
            style={{ backgroundColor: '#323232', border: '1px solid #323232' }}
          >
            <LogOut size={18} className="text-red-400" strokeWidth={1.5} />
            <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 15, lineHeight: '24px' }} className="text-red-400">
              {state.isSignedIn ? 'Logout' : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full h-[56px] px-4 rounded-xl text-left"
      style={{ backgroundColor: '#323232', border: '1px solid #323232' }}
    >
      {icon}
      <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 15, lineHeight: '24px', color: '#FFFFFF' }}>{label}</span>
    </button>
  );
}
