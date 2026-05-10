/**
 * Web port of verse-mate-mobile/hooks/useDeleteAccount.ts.
 *
 * Calls DELETE /auth/account, maps error codes to user-friendly strings,
 * and on success clears the local session and navigates to /login.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { deleteAuthAccount } from '@/services/bibleService';

export function useDeleteAccount() {
  const { signOut } = useApp();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = async (password?: string): Promise<boolean> => {
    setError(null);
    setIsDeleting(true);

    try {
      const result = await deleteAuthAccount(password);

      if (!result.ok) {
        if (result.status === 401 || result.errorCode === 'UNAUTHORIZED') {
          setError('The password you entered is incorrect.');
        } else if (result.status === 429 || result.errorCode === 'TOO_MANY_REQUESTS') {
          setError('Too many attempts. Please try again later.');
        } else if (
          result.errorCode === 'PASSWORD_REQUIRED' ||
          result.errorCode === 'VALIDATION_ERROR'
        ) {
          setError('Password is required to delete your account.');
        } else if (result.errorCode === 'NOT_AUTHENTICATED') {
          setError('You must be signed in to delete your account.');
        } else if (result.errorCode === 'NETWORK_ERROR') {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        setIsDeleting(false);
        return false;
      }

      await signOut();
      navigate('/login', { replace: true });
      setIsDeleting(false);
      return true;
    } catch (err) {
      console.error('Delete account error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsDeleting(false);
      return false;
    }
  };

  const clearError = () => setError(null);

  return { deleteAccount, isDeleting, error, clearError };
}
