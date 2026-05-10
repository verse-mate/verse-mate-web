import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AUTH_PATH_PREFIXES = [
  '/login',
  '/create-account',
  '/auth/callback',
  '/logout',
  '/menu/signin',
];

const STORAGE_KEY = 'redirectTo';

function isAuthRoute(pathname: string): boolean {
  return AUTH_PATH_PREFIXES.some(p => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Persist the most recent non-auth URL to localStorage so the sign-in flow
 * (email + SSO) can return the user to where they were when they tapped
 * Sign In. The SSO callback (src/lib/ssoCallback.ts) and the email submit
 * path (src/pages/SignInScreen.tsx) both consume `redirectTo`.
 */
export function useTrackPreAuthLocation() {
  const location = useLocation();
  useEffect(() => {
    if (isAuthRoute(location.pathname)) return;
    try {
      localStorage.setItem(STORAGE_KEY, location.pathname + location.search);
    } catch {
      /* ignore */
    }
  }, [location.pathname, location.search]);
}

export function consumeRedirectTo(): string | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v) localStorage.removeItem(STORAGE_KEY);
    return v;
  } catch {
    return null;
  }
}
