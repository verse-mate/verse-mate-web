import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { ChevronLeft, Mail } from 'lucide-react';

export default function SignInScreen() {
  const navigate = useNavigate();
  const { dispatch } = useApp();

  const signIn = () => {
    dispatch({ type: 'SET_SIGNED_IN', value: true });
    navigate('/menu');
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Sign In</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">Welcome to VerseMate</h2>
          <p className="text-muted-foreground text-sm">Sign in to sync your bookmarks, notes, and highlights across devices.</p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={signIn}
            className="flex items-center justify-center gap-3 w-full py-3 rounded-lg bg-foreground text-background font-medium text-sm transition-opacity hover:opacity-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-1.74.97-3.28 1.22-5.05 1.22-4.13 0-8.18-2.79-8.18-8.18S7.87 5 12 5c2.18 0 4.04.78 5.52 2.08l-2.24 2.16c-.6-.57-1.65-1.24-3.28-1.24-2.81 0-5.1 2.33-5.1 5.2s2.29 5.2 5.1 5.2c3.26 0 4.49-2.34 4.68-3.55H12v-2.84h7.82c.08.47.13.94.13 1.56 0 3.85-2.57 6.71-6.9 6.71z"/></svg>
            Continue with Google
          </button>
          <button
            onClick={signIn}
            className="flex items-center justify-center gap-3 w-full py-3 rounded-lg bg-foreground text-background font-medium text-sm transition-opacity hover:opacity-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            Continue with Apple
          </button>
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <button
            onClick={signIn}
            className="flex items-center justify-center gap-3 w-full py-3 rounded-lg border border-border bg-card text-foreground font-medium text-sm hover:bg-secondary transition-colors"
          >
            <Mail size={18} />
            Continue with Email
          </button>
        </div>
      </div>
    </div>
  );
}
