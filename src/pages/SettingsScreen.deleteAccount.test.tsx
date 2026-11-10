import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import SettingsScreen from './SettingsScreen';
import * as bibleService from '@/services/bibleService';
import { ApiError } from '@/api/client';

vi.mock('@/services/bibleService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/bibleService')>();
  return {
    ...actual,
    deleteAuthAccount: vi.fn(),
    checkSession: vi.fn(),
    fetchPendingEmail: vi.fn(async () => null),
    fetchBibleVersions: vi.fn(async () => []),
    fetchBibleLanguages: vi.fn(async () => []),
  };
});

const account = vi.hoisted(() => ({ hasPassword: true as boolean | null, signOut: vi.fn(async () => {}) }));

vi.mock('@/contexts/AppContext', async () => {
  const { loadSettings } = await vi.importActual<typeof import('@/services/bibleService')>('@/services/bibleService');
  const state = {
    isSignedIn: true,
    userId: 'u1',
    userFirstName: 'Ruth',
    userLastName: 'Moab',
    userEmail: 'ruth@example.com',
    userAvatarUrl: null,
    get userHasPassword() {
      return account.hasPassword;
    },
    userPreferredLanguage: null,
    settings: loadSettings(),
  };
  return {
    useApp: () => ({ state, dispatch: vi.fn(), signOut: account.signOut, restoreSession: vi.fn(async () => {}) }),
  };
});

const deleteAuthAccount = vi.mocked(bibleService.deleteAuthAccount);
const checkSession = vi.mocked(bibleService.checkSession);

function renderSettings() {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={['/settings']}>
        <SettingsScreen />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function confirmWithPassword(password: string) {
  fireEvent.change(await screen.findByTestId('delete-account-password-input'), { target: { value: password } });
  fireEvent.click(screen.getByLabelText('Delete account'));
  fireEvent.click(await screen.findByTestId('delete-account-confirm'));
}

async function startDeletion() {
  renderSettings();
  fireEvent.click(await screen.findByTestId('settings-delete-account-button'));
  fireEvent.click(await screen.findByLabelText('Continue with account deletion'));
}

beforeEach(() => {
  deleteAuthAccount.mockReset();
  checkSession.mockReset();
  checkSession.mockResolvedValue(undefined);
  account.hasPassword = true;
  account.signOut.mockClear();
});

describe('a refused deletion password', () => {
  it('goes back to the password prompt with the error, and the next try sends the new password', async () => {
    deleteAuthAccount.mockResolvedValueOnce({ ok: false, status: 401, errorCode: 'UNAUTHORIZED' });
    await startDeletion();
    await confirmWithPassword('wrong');

    await waitFor(() => expect(deleteAuthAccount).toHaveBeenCalledWith('wrong'));
    expect(await screen.findByText('The password you entered is incorrect.')).toBeInTheDocument();
    expect(screen.queryByTestId('delete-account-confirm')).toBeNull();
    expect(screen.getByTestId('delete-account-password-input')).toBeInTheDocument();

    deleteAuthAccount.mockResolvedValueOnce({ ok: false, status: 409, message: 'Not yet.' });
    await confirmWithPassword('right');
    await waitFor(() => expect(deleteAuthAccount).toHaveBeenLastCalledWith('right'));
  });

  it('keeps any other refusal on the final dialog', async () => {
    deleteAuthAccount.mockResolvedValueOnce({ ok: false, status: 409, message: 'Your email changed recently.' });
    await startDeletion();
    await confirmWithPassword('secret');

    expect(await screen.findByText('Your email changed recently.')).toBeInTheDocument();
    expect(screen.getByTestId('delete-account-confirm')).toBeInTheDocument();
  });
});

describe('which accounts are asked for a password', () => {
  it('asks a Google-only account for nothing and deletes it', async () => {
    account.hasPassword = false;
    deleteAuthAccount.mockResolvedValueOnce({ ok: true, status: 200 });
    await startDeletion();
    expect(screen.queryByTestId('delete-account-password-input')).toBeNull();
    fireEvent.click(await screen.findByTestId('delete-account-confirm'));
    await waitFor(() => expect(deleteAuthAccount).toHaveBeenCalledWith(undefined));
  });

  it('asks with the note when it cannot tell, and lets an empty password through', async () => {
    account.hasPassword = null;
    deleteAuthAccount.mockResolvedValueOnce({ ok: true, status: 200 });
    await startDeletion();
    expect(await screen.findByText(/leave this empty/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Delete account'));
    fireEvent.click(await screen.findByTestId('delete-account-confirm'));
    await waitFor(() => expect(deleteAuthAccount).toHaveBeenCalledWith(''));
  });

  it('never sends an account without a password back to a prompt it cannot answer', async () => {
    account.hasPassword = false;
    deleteAuthAccount.mockResolvedValueOnce({ ok: false, status: 401, errorCode: 'UNAUTHORIZED' });
    await startDeletion();
    fireEvent.click(await screen.findByTestId('delete-account-confirm'));
    expect(await screen.findByText(/leave this empty/i)).toBeInTheDocument();
    expect(screen.getByText('The account could not be deleted. If it has a password, enter it and try again.')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete account')).not.toBeDisabled();
  });
});

describe('a deletion refused for another reason', () => {
  it('says when deletion becomes possible during an email change revert window', async () => {
    deleteAuthAccount.mockResolvedValueOnce({
      ok: false,
      status: 409,
      message: 'Your email changed recently.',
      retryAfterSeconds: 3600,
    });
    await startDeletion();
    await confirmWithPassword('secret');
    expect(await screen.findByText(/Your email changed recently\. You can delete it from /)).toBeInTheDocument();
  });

  it('signs out an expired session instead of asking for the password again', async () => {
    deleteAuthAccount.mockResolvedValueOnce({ ok: false, status: 401, errorCode: 'UNAUTHORIZED' });
    checkSession.mockRejectedValueOnce(new ApiError(401, { error: 'UNAUTHORIZED' }, 'expired'));
    await startDeletion();
    await confirmWithPassword('secret');
    await waitFor(() => expect(account.signOut).toHaveBeenCalled());
    expect(screen.queryByTestId('delete-account-password-input')).toBeNull();
  });

  it.each([
    ['unreachable', new ApiError(0, null, 'Network error')],
    ['failing', new ApiError(500, { error: 'INTERNAL' }, 'boom')],
  ])('keeps the session when the session check is %s, and says what went wrong', async (_, failure) => {
    deleteAuthAccount.mockResolvedValueOnce({ ok: false, status: 401, errorCode: 'UNAUTHORIZED' });
    checkSession.mockRejectedValueOnce(failure);
    await startDeletion();
    await confirmWithPassword('secret');
    expect(await screen.findByText(/Network error/)).toBeInTheDocument();
    expect(account.signOut).not.toHaveBeenCalled();
    expect(screen.getByTestId('delete-account-confirm')).toBeInTheDocument();
  });
});
