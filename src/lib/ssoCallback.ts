import { setAccessToken, setRefreshToken } from '@/services/api';

export type SSOErrorCode =
  | 'access_denied'
  | 'invalid_state'
  | 'missing_code'
  | 'auth_failed'
  | 'oauth_error'
  | 'user_cancelled_authorize'
  | 'unknown_error'
  | string;

export interface SSOCallbackResult {
  success: boolean;
  code?: string;
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
  oauth_error:
    'We couldn’t complete sign-in with that provider. Please try again or use a different sign-in method.',
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

  const code = params.get('code');
  const accessToken = params.get('accessToken');
  const refreshToken = params.get('refreshToken');
  const verified = params.get('verified');
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  if (code) {
    return { success: true, code };
  }

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

export const SSO_VERIFIER_KEY = 'ssoVerifier';

function base64url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function ssoChallengeFor(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

export async function startSSOSignIn(redirectUrl: string): Promise<void> {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  sessionStorage.setItem(SSO_VERIFIER_KEY, verifier);
  const challenge = await ssoChallengeFor(verifier);
  window.location.href = `${redirectUrl}?challenge=${challenge}`;
}

function takePendingVerifier(): string | null {
  try {
    const verifier = sessionStorage.getItem(SSO_VERIFIER_KEY);
    sessionStorage.removeItem(SSO_VERIFIER_KEY);
    return verifier;
  } catch {
    return null;
  }
}

export type SSOCodeExchange = (
  code: string,
  verifier: string,
) => Promise<{ accessToken: string }>;

async function sessionTokenFrom(
  result: SSOCallbackResult,
  verifier: string | null,
  exchangeCode: SSOCodeExchange,
): Promise<string | undefined> {
  if (!verifier) return undefined;
  if (!result.code) return result.accessToken;
  try {
    return (await exchangeCode(result.code, verifier)).accessToken;
  } catch {
    return undefined;
  }
}

export async function handleSSOCallback(
  searchParams: string | URLSearchParams,
  exchangeCode: SSOCodeExchange,
): Promise<{
  success: boolean;
  redirectUrl?: string;
  error?: SSOErrorCode;
  errorMessage?: string;
}> {
  const parsed = parseSSOCallbackParams(searchParams);
  const verifier = takePendingVerifier();

  if (parsed.success) {
    const accessToken = await sessionTokenFrom(parsed, verifier, exchangeCode);
    if (accessToken) {
      setAccessToken(accessToken);
      if (parsed.refreshToken) setRefreshToken(parsed.refreshToken);

      let redirectTo = '/';
      try {
        redirectTo = localStorage.getItem('redirectTo') || '/';
        localStorage.removeItem('redirectTo');
      } catch {
        /* ignore */
      }

      return { success: true, redirectUrl: redirectTo };
    }
  }

  const error = parsed.success ? 'auth_failed' : parsed.error;
  return {
    success: false,
    error,
    errorMessage: getSSOErrorMessage(error || 'unknown_error', parsed.errorDescription),
  };
}
