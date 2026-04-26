import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { analytics } from '@/lib/analytics';
import { handleSSOCallback } from '@/lib/ssoCallback';
import { fetchCurrentUser } from '@/services/bibleService';

/**
 * `/auth/callback/{google,apple}` — handles the redirect back from the
 * backend's SSO endpoint. Backend signs the user in, sets accessToken
 * + refreshToken in the URL search params, and redirects here. We:
 *   1. Parse the params, store the tokens (in cookies — see Phase 4)
 *   2. Fire analytics.identify so PostHog ties the SSO flow to a user
 *   3. Dispatch SET_SIGNED_IN so the app's React state reflects the
 *      new auth state without a page reload
 *   4. Navigate to whichever URL was saved as `redirectTo` (or `/`)
 *
 * Failure case shows the same kind of error UI frontend-next does.
 *
 * URL contract (set by backend's /auth/sso/{provider}/redirect):
 *   Success: ?accessToken=…&refreshToken=…&verified=…
 *   Failure: ?error=…&error_description=…
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const { provider } = useParams<{ provider: 'google' | 'apple' }>();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = handleSSOCallback(searchParams);

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
