import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * Stub for `/auth/callback/{google,apple}`. The Lovable codebase wires
 * SSO via the Google Identity Services popup (Google) and a redirect to
 * the backend's /auth/sso/apple/redirect endpoint (Apple) — neither of
 * which lands here. But frontend-next has these routes for backwards
 * compatibility with users mid-flow during the cutover, and Apple
 * specifically redirects through them.
 *
 * Phase 5 (SSO callbacks) will read the auth code/token from the URL,
 * complete the exchange against the backend, set the session cookies,
 * and redirect to `/`. For now this is a placeholder so direct hits
 * don't 404.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { provider } = useParams<{ provider: 'google' | 'apple' }>();

  useEffect(() => {
    // TODO Phase 5: read code/token from query/hash, exchange via backend,
    // set cookies, dispatch SET_SIGNED_IN, redirect.
    const t = setTimeout(() => navigate('/login', { replace: true }), 1500);
    return () => clearTimeout(t);
  }, [navigate]);

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
