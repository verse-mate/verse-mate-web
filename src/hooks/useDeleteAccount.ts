import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { ApiError } from '@/api/client';
import { checkSession, deleteAuthAccount } from '@/services/bibleService';

export type DeleteOutcome = 'deleted' | 'password-refused' | 'signed-out' | 'refused';

export function deletableFrom(retryAfterSeconds: number, now = Date.now()): string {
  return new Date(now + retryAfterSeconds * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

async function sessionState(): Promise<'valid' | 'expired' | 'unknown'> {
  return checkSession().then(
    () => 'valid' as const,
    (error: unknown) => (error instanceof ApiError && error.status === 401 ? 'expired' : 'unknown'),
  );
}

export function useDeleteAccount() {
  const { signOut } = useApp();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = async (password?: string): Promise<DeleteOutcome> => {
    setError(null);
    setIsDeleting(true);

    try {
      const result = await deleteAuthAccount(password);

      if (!result.ok) {
        let outcome: DeleteOutcome = 'refused';
        if (result.status === 401 || result.errorCode === 'UNAUTHORIZED') {
          const session = await sessionState();
          if (session === 'expired') {
            setError(null);
            outcome = 'signed-out';
            await signOut();
            navigate('/login', { replace: true });
          } else if (session === 'unknown') {
            setError('Network error. Please check your connection and try again.');
          } else if (password) {
            setError('The password you entered is incorrect.');
            outcome = 'password-refused';
          } else {
            setError('The account could not be deleted. If it has a password, enter it and try again.');
            outcome = 'password-refused';
          }
        } else if (result.status === 429 || result.errorCode === 'TOO_MANY_REQUESTS') {
          setError('Too many attempts. Please try again later.');
        } else if (
          result.errorCode === 'PASSWORD_REQUIRED' ||
          result.errorCode === 'VALIDATION_ERROR'
        ) {
          setError('Password is required to delete your account.');
          outcome = 'password-refused';
        } else if (result.errorCode === 'NOT_AUTHENTICATED') {
          setError('You must be signed in to delete your account.');
        } else if (result.status === 409 && result.message) {
          setError(
            result.retryAfterSeconds
              ? `${result.message} You can delete it from ${deletableFrom(result.retryAfterSeconds)}.`
              : result.message
          );
        } else if (result.errorCode === 'NETWORK_ERROR') {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        setIsDeleting(false);
        return outcome;
      }

      await signOut();
      navigate('/login', { replace: true });
      setIsDeleting(false);
      return 'deleted';
    } catch (err) {
      console.error('Delete account error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsDeleting(false);
      return 'refused';
    }
  };

  const clearError = () => setError(null);

  return { deleteAccount, isDeleting, error, clearError };
}
