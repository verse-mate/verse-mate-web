import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { User, Settings, Info, Heart, HelpCircle, LogOut, LogIn, ChevronRight, ChevronLeft, Highlighter, Bookmark, StickyNote } from 'lucide-react';

const menuItems = [
  { label: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
  { label: 'Notes', icon: StickyNote, path: '/notes' },
  { label: 'Highlights', icon: Highlighter, path: '/highlights' },
  { label: 'About', icon: Info, path: '/menu/about' },
  { label: 'Giving', icon: Heart, path: '/menu/giving' },
  { label: 'Help & Feedback', icon: HelpCircle, path: '/menu/help' },
  { label: 'Settings', icon: Settings, path: '/menu/settings' },
];

export default function MenuScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  return (
    <div className="flex flex-col h-full bg-dark-surface">
      {/* Dark header */}
      <div className="shrink-0 flex items-center gap-2 px-3" style={{ height: 56 }}>
        <button onClick={() => navigate(-1)} className="flex items-center justify-center w-[44px] h-[44px] -ml-2">
          <ChevronLeft size={22} className="text-gold" />
        </button>
        <h1 className="text-[17px] font-semibold text-dark-fg">Menu</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* User card */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-dark-raised mb-4">
          <div className="w-12 h-12 rounded-full bg-dark-surface flex items-center justify-center">
            <User size={22} className="text-dark-muted" />
          </div>
          <div>
            <p className="font-semibold text-dark-fg">{state.isSignedIn ? 'Guest User' : 'Not signed in'}</p>
            <p className="text-[13px] text-dark-muted">{state.isSignedIn ? 'guest@versemate.app' : 'Sign in to sync'}</p>
          </div>
        </div>

        <div className="space-y-1">
          {menuItems.map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex items-center justify-between w-full px-4 py-3.5 rounded-lg hover:bg-dark-raised transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className="text-dark-muted" />
                <span className="font-medium text-dark-fg text-[14px]">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-dark-muted" />
            </button>
          ))}

          {!state.isSignedIn && (
            <button
              onClick={() => navigate('/menu/signin')}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-lg hover:bg-dark-raised transition-colors mt-2"
            >
              <LogIn size={18} className="text-gold" />
              <span className="font-medium text-gold text-[14px]">Sign In</span>
            </button>
          )}

          <button
            onClick={() => {
              if (state.isSignedIn) {
                dispatch({ type: 'SET_SIGNED_IN', value: false });
              } else {
                navigate('/menu/signin');
              }
            }}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-lg hover:bg-dark-raised transition-colors mt-4"
          >
            {state.isSignedIn ? <LogOut size={18} className="text-red-400" /> : <LogIn size={18} className="text-gold" />}
            <span className={`font-medium text-[14px] ${state.isSignedIn ? 'text-red-400' : 'text-gold'}`}>
              {state.isSignedIn ? 'Sign Out' : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
