import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import CoachSettingsScreen from './CoachSettingsScreen';
import * as coachService from '@/services/coachService';

// Drive the UI off mocked coach + profile clients (no backend).
vi.mock('@/services/coachService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/coachService')>();
  return {
    ...actual,
    fetchCoachMe: vi.fn(),
    saveCoachBibleCoach: vi.fn(),
    saveCoachAffiliatedChurch: vi.fn(),
  };
});

// ProfileSection reads the signed-in user from AppContext — mock the hook so
// the test doesn't need the full provider tree.
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    state: {
      isSignedIn: true,
      userFirstName: 'Jeff',
      userLastName: 'Ward',
      userEmail: 'jeff@example.com',
      userAvatarUrl: null,
    },
    restoreSession: vi.fn(),
  }),
}));

const meCoach = {
  isCoach: true,
  isAdmin: false,
  profile: { id: 'jeff-ward', name: 'Jeff Ward', email: 'jeff@example.com', group: 'Group', coachName: '' },
  zoomLink: '',
  affiliatedChurch: 'Austin Ridge Church',
  bibleCoach: '',
  model: 'v3',
  clusters: [],
  statusBands: [],
};

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/coach/settings']}>
        <CoachSettingsScreen />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(coachService.fetchCoachMe).mockResolvedValue(meCoach as never);
  vi.mocked(coachService.saveCoachBibleCoach).mockResolvedValue('Bryan Bailey');
});

describe('CoachSettingsScreen', () => {
  it('shows profile, church affiliation, and Bible-coach picker (no Bible-app prefs)', async () => {
    renderScreen();

    // Profile fields (the "change emails, etc." entry point).
    expect(await screen.findByTestId('coach-settings-email-input')).toHaveValue('jeff@example.com');
    expect(screen.getByTestId('coach-settings-first-name-input')).toHaveValue('Jeff');

    // Coach-scoped setup.
    await waitFor(() => expect(screen.getByTestId('coach-church-input')).toBeInTheDocument());
    const select = screen.getByTestId('coach-bible-coach-select') as HTMLSelectElement;
    // Empty stored value falls back to the Bryan default.
    expect(select.value).toBe('Bryan Bailey');

    // Bridges to app-wide prefs rather than embedding them.
    expect(screen.getByTestId('coach-settings-app-settings')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-version-button')).not.toBeInTheDocument();
  });

  it('has a back control that returns to the coach dashboard', async () => {
    renderScreen();
    // The dedicated coach back testid — the fix for landing on the app Menu.
    expect(await screen.findByTestId('coach-settings-back-button')).toBeInTheDocument();
  });

  it('persists a Bible-coach selection change', async () => {
    renderScreen();
    const select = await screen.findByTestId('coach-bible-coach-select');
    fireEvent.change(select, { target: { value: 'Bryan Bailey' } });
    await waitFor(() =>
      expect(coachService.saveCoachBibleCoach).toHaveBeenCalledWith('Bryan Bailey'),
    );
  });

  it('shows church affiliation + Bible coach to an admin who is not a coachee', async () => {
    // Regression: program admins (isAdmin, isCoach=false) were missing these
    // sections because they were gated on isCoach.
    vi.mocked(coachService.fetchCoachMe).mockResolvedValue({
      ...meCoach,
      isCoach: false,
      isAdmin: true,
      profile: null,
      affiliatedChurch: '',
    } as never);

    renderScreen();
    expect(await screen.findByTestId('coach-church-input')).toBeInTheDocument();
    expect(screen.getByTestId('coach-bible-coach-select')).toBeInTheDocument();
  });
});
