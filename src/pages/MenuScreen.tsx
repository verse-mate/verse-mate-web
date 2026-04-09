import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { User, Settings, Info, Heart, HelpCircle, LogOut, LogIn, ChevronRight, Highlighter } from 'lucide-react';

const menuItems = [
  { label: 'About', icon: Info, path: '/menu/about' },
  { label: 'Giving', icon: Heart, path: '/menu/giving' },
  { label: 'Help & Feedback', icon: HelpCircle, path: '/menu/help' },
  { label: 'Highlights', icon: Highlighter, path: '/highlights' },
  { label: 'Settings', icon: Settings, path: '/menu/settings' },
];

export default function MenuScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 py-3 border-b border-border bg-card">
        <h1 className="text-lg font-semibold text-foreground">Menu</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* User card */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border mb-4">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <User size={22} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{state.isSignedIn ? 'Guest User' : 'Not signed in'}</p>
            <p className="text-sm text-muted-foreground">{state.isSignedIn ? 'guest@versemate.app' : 'Sign in to sync your data'}</p>
          </div>
        </div>

        {menuItems.map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex items-center justify-between w-full p-4 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} className="text-muted-foreground" />
              <span className="font-medium text-foreground">{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}

        {!state.isSignedIn && (
          <button
            onClick={() => navigate('/menu/signin')}
            className="flex items-center gap-3 w-full p-4 rounded-lg bg-card border border-border hover:bg-secondary transition-colors mt-2"
          >
            <LogIn size={18} className="text-accent" />
            <span className="font-medium text-accent">Sign In</span>
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
          className="flex items-center gap-3 w-full p-4 rounded-lg bg-card border border-border hover:bg-secondary transition-colors mt-4"
        >
          {state.isSignedIn ? <LogOut size={18} className="text-destructive" /> : <LogIn size={18} className="text-accent" />}
          <span className={`font-medium ${state.isSignedIn ? 'text-destructive' : 'text-accent'}`}>
            {state.isSignedIn ? 'Sign Out' : 'Sign In'}
          </span>
        </button>
      </div>
    </div>
  );
}
