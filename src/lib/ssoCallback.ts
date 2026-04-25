/**
 * SSO callback utilities. Ported from
 * verse-mate/packages/frontend-base/src/auth/lib.ts so the same callback
 * URL contract works in this repo.
 *
 * Callback URL contract (set by the backend's /auth/sso/{provider}/redirect):
 *   Success: /auth/callback/{provider}?accessToken=…&refreshToken=…&verified=…
 *   Failure: /auth/callback/{provider}?error=…&error_description=…
 */

import { setAccessToken, setRefreshToken } from '@/services/api';

export type SSOErrorCode =
  | 'access_denied'
  | 'invalid_state'
  | 'missing_code'
  | 'auth_failed'
  | 'user_cancelled_authorize'
  | 'unknown_error'
  | string;

export interface SSOCallbackResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  verified?: boolean;
  error?: SSOErrorCode;
  errorDescription?: string;
}

const SSO_ERROR_MESSAGES: Record<string, string> = {
  access_denied:
    'You denied access to your account. Please try again and allow access to continue.',
  invalid_state: 'Your sign-in session has expired. Please try again.',
  missing_code: 'The sign-in process was interrupted. Please try again.',
  auth_failed:
    'Authentication failed. Please try again or contact support if the problem persists.',
  user_cancelled_authorize: 'You cancelled the sign-in process. Please try again when ready.',
  default: 'Something went wrong during sign-in. Please try again.',
};

export function getSSOErrorMessage(code: SSOErrorCode, description?: string): string {
  // Use the provider's description if it's user-friendly (no underscores, short)
  if (description && !description.includes('_') && description.length < 200) {
    return description;
  }
  return SSO_ERROR_MESSAGES[code] || SSO_ERROR_MESSAGES.default;
}

export function parseSSOCallbackParams(
  searchParams: string | URLSearchParams,
): SSOCallbackResult {
  const params =
    typeof searchParams === 'string' ? new URLSearchParams(searchParams) : searchParams;

  const accessToken = params.get('accessToken');
  const refreshToken = params.get('refreshToken');
  const verified = params.get('verified');
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  if (accessToken) {
    return {
      success: true,
      accessToken,
      refreshToken: refreshToken || undefined,
      verified: verified === 'true',
    };
  }

  return {
    success: false,
    error: error || 'unknown_error',
    errorDescription: errorDescription || undefined,
  };
}

/**
 * Top-level orchestrator: parse the URL params, store tokens, return
 * the redirect destination. Mirrors handleSSOCallback in frontend-base.
 */
export function handleSSOCallback(searchParams: string | URLSearchParams): {
  success: boolean;
  redirectUrl?: string;
  error?: SSOErrorCode;
  errorMessage?: string;
} {
  const result = parseSSOCallbackParams(searchParams);

  if (result.success && result.accessToken) {
    setAccessToken(result.accessToken);
    if (result.refreshToken) setRefreshToken(result.refreshToken);

    let redirectTo = '/';
    try {
      redirectTo = localStorage.getItem('redirectTo') || '/';
      localStorage.removeItem('redirectTo');
    } catch {
      /* ignore */
    }

    return { success: true, redirectUrl: redirectTo };
  }

  return {
    success: false,
    error: result.error,
    errorMessage: getSSOErrorMessage(result.error || 'unknown_error', result.errorDescription),
  };
}
