import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { analytics } from '@/lib/analytics';
import { handleSSOCallback } from '@/lib/ssoCallback';
import { exchangeSSOCode, fetchCurrentUser } from '@/services/bibleService';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const { provider } = useParams<{ provider: 'google' | 'apple' }>();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const outcome = useRef<ReturnType<typeof handleSSOCallback>>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!outcome.current) {
        const params = new URLSearchParams(searchParams);
        window.history.replaceState(window.history.state, '', window.location.pathname);
        outcome.current = handleSSOCallback(params, exchangeSSOCode);
      }
      const result = await outcome.current;

      if (!result.success) {
        if (!cancelled) setError(result.errorMessage || 'Sign-in failed');
        return;
      }

      // Tokens are now in cookies. Fetch the user, sync app state, fire
      // analytics, then redirect.
      try {
        const user = await fetchCurrentUser();
        if (cancelled) return;

        dispatch({
          type: 'SET_SIGNED_IN',
          value: true,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userAvatarUrl: user.avatarUrl,
        });

        try {
          analytics.identify(user.id, { email: user.email });
          analytics.setUserProperties({
            email: user.email,
            account_type: provider,
            is_registered: true,
          });
          analytics.track('login_completed', { method: provider });
        } catch {
          /* analytics is best-effort */
        }

        navigate(result.redirectUrl || '/', { replace: true });
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'Could not load your account after sign-in.',
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, provider, navigate, dispatch]);

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full px-6 text-center"
        style={{ backgroundColor: '#1B1B1B', color: '#E7E7E7' }}
      >
        <h1
          style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: 22, marginBottom: 12 }}
        >
          Sign-in failed
        </h1>
        <p
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: 14,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 24,
            maxWidth: 360,
          }}
        >
          {error}
        </p>
        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            backgroundColor: '#B09A6D',
            color: '#000',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center h-full"
      style={{ backgroundColor: '#1B1B1B', color: '#E7E7E7' }}
    >
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>
        Completing {provider === 'apple' ? 'Apple' : 'Google'} sign-in…
      </p>
    </div>
  );
}
