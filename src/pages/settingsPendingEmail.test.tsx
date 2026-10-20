import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentType } from 'react';
import CoachSettingsScreen from './CoachSettingsScreen';
import SettingsScreen from './SettingsScreen';
import * as bibleService from '@/services/bibleService';
import * as coachService from '@/services/coachService';
import { ApiError } from '@/services/api';

vi.mock('@/services/coachService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/coachService')>();
  return { ...actual, fetchCoachMe: vi.fn(), saveCoachBibleCoach: vi.fn(), saveCoachAffiliatedChurch: vi.fn() };
});

vi.mock('@/services/bibleService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/bibleService')>();
  return {
    ...actual,
    updateAuthProfile: vi.fn(),
    fetchPendingEmail: vi.fn(),
    fetchBibleVersions: vi.fn(async () => []),
    fetchBibleLanguages: vi.fn(async () => []),
  };
});

vi.mock('@/contexts/AppContext', async () => {
  const { loadSettings } = await vi.importActual<typeof import('@/services/bibleService')>('@/services/bibleService');
  const state = {
    isSignedIn: true,
    userId: 'u1',
    userFirstName: 'Jeff',
    userLastName: 'Ward',
    userEmail: 'jeff@example.com',
    userAvatarUrl: null,
    userPreferredLanguage: null,
    settings: loadSettings(),
  };
  return {
    useApp: () => ({ state, dispatch: vi.fn(), signOut: vi.fn(), restoreSession: vi.fn(async () => {}) }),
  };
});

const CURRENT = 'jeff@example.com';

const screens: Array<{ name: string; Screen: ComponentType; path: string; field: string; notice: string }> = [
  {
    name: 'CoachSettingsScreen',
    Screen: CoachSettingsScreen,
    path: '/coach/settings',
    field: 'coach-settings-email-input',
    notice: 'coach-settings-pending-email',
  },
  {
    name: 'SettingsScreen',
    Screen: SettingsScreen,
    path: '/menu/settings',
    field: 'settings-email-input',
    notice: 'settings-pending-email',
  },
];

function newClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe.each(screens)('$name pending email notice', ({ Screen, path, field, notice }) => {
  function renderScreen(client = newClient()) {
    return render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[path]}>
          <Screen />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  async function typeEmail(value: string) {
    fireEvent.change(await screen.findByTestId(field), { target: { value } });
  }

  async function expectNotice(address: string) {
    const el = await screen.findByTestId(notice, {}, { timeout: 3000 });
    await waitFor(() => expect(el).toHaveTextContent(`Check ${address} for a message from us to finish changing your email.`), {
      timeout: 3000,
    });
  }

  beforeEach(() => {
    vi.mocked(coachService.fetchCoachMe).mockResolvedValue({
      isCoach: true,
      isAdmin: false,
      profile: null,
      affiliatedChurch: '',
      bibleCoach: '',
    } as never);
    vi.mocked(bibleService.fetchPendingEmail).mockReset().mockResolvedValue(null);
    vi.mocked(bibleService.updateAuthProfile).mockReset();
  });

  it('Notice appears right after requesting a change', async () => {
    vi.mocked(bibleService.updateAuthProfile).mockResolvedValue('new@example.com');
    renderScreen();
    await typeEmail('new@example.com');
    await expectNotice('new@example.com');
    expect(screen.getByTestId(field)).toHaveValue(CURRENT);
    expect(screen.getByTestId(field)).toHaveAttribute('aria-describedby', notice);
  });

  it('Requesting an address that belongs to another account', async () => {
    vi.mocked(bibleService.updateAuthProfile).mockResolvedValue('taken@example.com');
    renderScreen();
    await typeEmail('taken@example.com');
    await expectNotice('taken@example.com');
    expect(screen.queryByText(/already in use/i)).not.toBeInTheDocument();
  });

  it('Notice is shown again when settings reopen, and on other signed-in devices', async () => {
    vi.mocked(bibleService.fetchPendingEmail).mockResolvedValue('new@example.com');
    renderScreen();
    await expectNotice('new@example.com');
    expect(screen.getByTestId(field)).toHaveValue(CURRENT);
  });

  it('No notice without a pending change', async () => {
    renderScreen();
    await screen.findByTestId(field);
    await waitFor(() => expect(bibleService.fetchPendingEmail).toHaveBeenCalled());
    expect(screen.queryByTestId(notice)).not.toBeInTheDocument();
  });

  it('Saving the current address again keeps the pending change', async () => {
    vi.mocked(bibleService.fetchPendingEmail).mockResolvedValue('new@example.com');
    vi.mocked(bibleService.updateAuthProfile).mockResolvedValue('new@example.com');
    renderScreen();
    await expectNotice('new@example.com');
    fireEvent.change(screen.getByDisplayValue('Ward'), { target: { value: 'Warden' } });
    await typeEmail(CURRENT);
    await waitFor(() => expect(bibleService.updateAuthProfile).toHaveBeenCalled(), { timeout: 3000 });
    await expectNotice('new@example.com');
    expect(screen.getByTestId(field)).toHaveValue(CURRENT);
  });

  it('Saving the pending address again', async () => {
    vi.mocked(bibleService.fetchPendingEmail).mockResolvedValue('new@example.com');
    vi.mocked(bibleService.updateAuthProfile).mockResolvedValue('new@example.com');
    renderScreen();
    await expectNotice('new@example.com');
    await typeEmail('new@example.com');
    await waitFor(() => expect(bibleService.updateAuthProfile).toHaveBeenCalled(), { timeout: 3000 });
    await expectNotice('new@example.com');
  });

  it('A newer request replaces the pending address', async () => {
    vi.mocked(bibleService.fetchPendingEmail).mockResolvedValue('first@example.com');
    vi.mocked(bibleService.updateAuthProfile).mockResolvedValue('second@example.com');
    renderScreen();
    await expectNotice('first@example.com');
    await typeEmail('second@example.com');
    await expectNotice('second@example.com');
    expect(screen.queryByText('first@example.com')).not.toBeInTheDocument();
  });

  it('A refused request', async () => {
    vi.mocked(bibleService.fetchPendingEmail).mockResolvedValue('first@example.com');
    vi.mocked(bibleService.updateAuthProfile).mockRejectedValue(new ApiError(429, {}, 'Too many requests'));
    renderScreen();
    await expectNotice('first@example.com');
    await typeEmail('second@example.com');
    expect(
      await screen.findByText('An error occurred while saving your changes.', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    await expectNotice('first@example.com');
  });

  it.each([
    ['Notice clears when the request expires'],
    ['Notice clears when the requesting session signs out'],
  ])('%s', async () => {
    const client = newClient();
    vi.mocked(bibleService.fetchPendingEmail).mockResolvedValueOnce('new@example.com').mockResolvedValue(null);
    const first = renderScreen(client);
    await expectNotice('new@example.com');
    first.unmount();
    renderScreen(client);
    await screen.findByTestId(field);
    await waitFor(() => expect(bibleService.fetchPendingEmail).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByTestId(notice)).not.toBeInTheDocument());
  });
});
