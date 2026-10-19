import { ApiError, api, getAccessToken, setAccessToken, setRefreshToken } from './api';

export type ConfirmOutcome = 'confirmed' | 'already' | 'invalid' | 'signed-out' | 'failed';

export async function fetchEmailVerified(): Promise<boolean | null> {
  const me = await api.get<{ emailVerified?: unknown }>('/user/me');
  return typeof me?.emailVerified === 'boolean' ? me.emailVerified : null;
}

export async function sendVerificationEmail(): Promise<void> {
  await api.post('/auth/send-email-verification');
}

export async function confirmEmail(key: string): Promise<ConfirmOutcome> {
  if (!getAccessToken()) return 'signed-out';
  try {
    const session = await api.post<{ accessToken?: string; refreshToken?: string }>('/auth/verify-email', { token: key });
    if (session?.accessToken) setAccessToken(session.accessToken);
    if (session?.refreshToken) setRefreshToken(session.refreshToken);
    return 'confirmed';
  } catch (err) {
    if (!(err instanceof ApiError)) return 'failed';
    const message = (err.body as { message?: string } | null)?.message ?? '';
    if (err.status === 409 && message === 'User already verified') return 'already';
    if (err.status === 400 || err.status === 409) return 'invalid';
    if (err.status === 401) return 'signed-out';
    return 'failed';
  }
}
