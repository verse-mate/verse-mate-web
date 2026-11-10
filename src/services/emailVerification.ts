import { ApiError, apiClient, getAccessToken, setAccessToken, unwrap } from '@/api/client';
import { getUserMe, postAuthSendEmailVerification, postAuthVerifyEmail } from '@/api/generated/sdk.gen';

export type ConfirmOutcome = 'confirmed' | 'already' | 'invalid' | 'signed-out' | 'failed';

export async function fetchEmailVerified(): Promise<boolean | null> {
  const me = await unwrap(getUserMe({ client: apiClient }));
  return typeof me.emailVerified === 'boolean' ? me.emailVerified : null;
}

export async function sendVerificationEmail(): Promise<void> {
  await unwrap(postAuthSendEmailVerification({ client: apiClient }));
}

export async function confirmEmail(key: string): Promise<ConfirmOutcome> {
  if (!getAccessToken()) return 'signed-out';
  try {
    const session = await unwrap(postAuthVerifyEmail({ client: apiClient, body: { token: key } }));
    if (session.accessToken) setAccessToken(session.accessToken);
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
