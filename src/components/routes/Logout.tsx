import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { logout as apiLogout } from '@/services/bibleService';
import { analytics } from '@/lib/analytics';

/**
 * `/logout` — calls the backend logout endpoint, clears local tokens,
 * resets analytics identity, and redirects to the home/sign-in screen.
 *
 * frontend-next has this as a route (not a button click) so the same URL
 * works whether triggered by a menu item or a backend redirect.
 */
export default function Logout() {
  const navigate = useNavigate();
  const { dispatch } = useApp();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await apiLogout();
      } catch {
        // swallow — clearing local state is the important part
      }
      if (cancelled) return;
      analytics.reset();
      dispatch({ type: 'SET_SIGNED_IN', value: false, userId: null });
      navigate('/login', { replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate]);

  return (
    <div
      className="flex flex-col items-center justify-center h-full"
      style={{ backgroundColor: '#1B1B1B', color: '#E7E7E7' }}
    >
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>Signing you out…</p>
    </div>
  );
}
