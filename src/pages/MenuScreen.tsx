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
import { vmTokens } from '@/styles/themeStyles';

type Item = {
  label: string;
  icon: typeof Bookmark;
  path: string;
  testId: string;
};

const items: Item[] = [
  { label: 'Bookmarks', icon: Bookmark, path: '/bookmarks', testId: 'menu-item-bookmarks' },
  { label: 'Notes', icon: FileText, path: '/notes', testId: 'menu-item-notes' },
  { label: 'Highlights', icon: Highlighter, path: '/highlights', testId: 'menu-item-highlights' },
  { label: 'Settings', icon: Settings, path: '/menu/settings', testId: 'menu-item-settings' },
  { label: 'About', icon: Info, path: '/menu/about', testId: 'menu-item-about' },
  { label: 'Giving', icon: Heart, path: '/menu/giving', testId: 'menu-item-giving' },
  { label: 'Help', icon: HelpCircle, path: '/menu/help', testId: 'menu-item-help' },
];

export default function MenuScreen() {
  const navigate = useNavigate();
  const { state, signOut } = useApp();

  const handleLogout = async () => {
    if (state.isSignedIn) {
      await signOut();
      navigate('/read');
    } else {
      navigate('/login');
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
    <div data-testid="hamburger-menu" className="menu-container flex flex-col h-full" style={{ backgroundColor: vmTokens.chromeBg }}>
      {/* Header — dark bg, white text */}
      <header
        className="shrink-0 flex items-center justify-between px-5 safe-top"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 48px)', height: 92, backgroundColor: vmTokens.headerBg }}
      >
        <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: 18, lineHeight: '24px', color: vmTokens.headerFg }}>Menu</h1>
        <button
          onClick={() => navigate('/read')}
          aria-label="Close menu"
          data-testid="menu-close-button"
          className="w-[44px] h-[44px] flex items-center justify-center -mr-2"
        >
          <X size={22} style={{ color: vmTokens.headerFg }} strokeWidth={2} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-2" style={{ backgroundColor: vmTokens.pageBg }}>
        {/* User profile card — signed-in users go to Settings (matches
            verse-mate-mobile); signed-out users go to the sign-in page. */}
        <button
          onClick={() => navigate(state.isSignedIn ? '/menu/settings' : '/login')}
          data-testid="menu-profile-card"
          className="flex items-center gap-3 w-full h-[64px] px-4 rounded-xl text-left mb-3"
          style={{ backgroundColor: vmTokens.surfaceRaisedBg, border: `1px solid ${vmTokens.divider}` }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ backgroundColor: vmTokens.chromeBg }}>
            {state.isSignedIn && state.userAvatarUrl ? (
              <img
                src={state.userAvatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <User size={20} style={{ color: vmTokens.textTertiary }} strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', color: vmTokens.gold }}>
              {state.isSignedIn
                ? state.userName || state.userEmail?.split('@')[0] || ''
                : 'Guest'}
            </p>
            <p className="truncate" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 12, lineHeight: '18px', color: vmTokens.textTertiary }}>
              {state.isSignedIn ? state.userEmail || 'Loading...' : 'Tap to sign in'}
            </p>
          </div>
        </button>

        {/* Primary list */}
        <div className="space-y-2">
          {items.slice(0, 4).map(item => (
            <MenuRow
              key={item.label}
              icon={<item.icon size={18} style={{ color: vmTokens.textPrimary }} strokeWidth={1.5} />}
              label={item.label}
              testId={item.testId}
              onClick={() => navigate(item.path)}
            />
          ))}
          <MenuRow
            icon={<ShareIcon size={18} color={vmTokens.textPrimary} />}
            label="Share VerseMate"
            testId="menu-item-share"
            onClick={handleShare}
          />
          {items.slice(4).map(item => (
            <MenuRow
              key={item.label}
              icon={<item.icon size={18} style={{ color: vmTokens.textPrimary }} strokeWidth={1.5} />}
              label={item.label}
              testId={item.testId}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>

        {/* Logout / Sign in */}
        <div className="mt-2">
          <button
            onClick={handleLogout}
            data-testid={state.isSignedIn ? 'menu-item-logout' : 'menu-item-login'}
            className="flex items-center gap-4 w-full h-[56px] px-4 rounded-xl"
            style={{ backgroundColor: vmTokens.surfaceRaisedBg, border: `1px solid ${vmTokens.divider}` }}
          >
            <LogOut size={18} className="text-red-400" strokeWidth={1.5} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 15, lineHeight: '24px' }} className="text-red-400">
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
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className="flex items-center gap-4 w-full h-[56px] px-4 rounded-xl text-left"
      style={{ backgroundColor: vmTokens.surfaceRaisedBg, border: `1px solid ${vmTokens.divider}` }}
    >
      {icon}
      <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 15, lineHeight: '24px', color: vmTokens.textPrimary }}>{label}</span>
    </button>
  );
}
