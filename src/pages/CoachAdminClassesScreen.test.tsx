import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import CoachAdminClassesScreen from './CoachAdminClassesScreen';
import * as coachService from '@/services/coachService';
import type { AdminCoachClass, CoachSummary, NotetakerZoom, NotetakerZoomMeeting } from '@/services/coachService';

// The screen composes react-query + the coachService client. Mock the client
// so the test drives the admin schedule without a backend.
vi.mock('@/services/coachService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/coachService')>();
  return {
    ...actual,
    fetchAllCoachClasses: vi.fn(),
    fetchAdminCoaches: vi.fn(),
    fetchNotetakerZoom: vi.fn(),
    createAdminCoachClass: vi.fn(),
    updateAdminCoachClass: vi.fn(),
    deleteAdminCoachClass: vi.fn(),
  };
});

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/coach/admin/classes']}>
        <CoachAdminClassesScreen />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const roster = [
  { id: 'milo-kerr', name: 'Milo Kerr', group: '', coachName: '', sessionCount: 0, latest: null },
  { id: 'jeff-ward', name: 'Jeff Ward', group: '', coachName: '', sessionCount: 3, latest: null },
] as CoachSummary[];

const thursday: AdminCoachClass = {
  id: 'c1',
  name: 'Thursday — James',
  classDate: '2026-10-22',
  recurrence: 'weekly',
  zoomLink: 'https://zoom.us/j/1?pwd=x',
  startTime: '19:00',
  timeZone: 'America/Chicago',
  notetaker: true,
  leader: { id: 'jeff-ward', name: 'Jeff Ward', email: 'jeff@example.com' },
};

const meeting = (over: Partial<NotetakerZoomMeeting>): NotetakerZoomMeeting => ({
  meetingId: '555',
  topic: 'Tuesday Acts',
  joinUrl: 'https://us02web.zoom.us/j/555?pwd=p',
  hostEmail: 'jeff@zoom.example',
  classDate: '2026-10-20',
  startTime: '18:30',
  timeZone: 'America/New_York',
  recurrence: 'biweekly',
  invited: false,
  leader: { id: 'jeff-ward', name: 'Jeff Ward' },
  classId: null,
  ...over,
});

const zoom: NotetakerZoom = {
  available: true,
  connectUrl: 'https://notetaker.example/zoom/install',
  connections: [
    { email: 'jeff@zoom.example', name: 'Jeff Ward', connectedAt: null, leader: { id: 'jeff-ward', name: 'Jeff Ward' } },
    { email: 'guest@zoom.example', name: 'Guest Host', connectedAt: null, leader: null },
  ],
  meetings: [
    meeting({}),
    meeting({ meetingId: '1', topic: 'Thursday — James', classId: 'c1', recurrence: 'weekly' }),
    meeting({ meetingId: '777', topic: 'Friday Psalms', hostEmail: 'guest@zoom.example', leader: null }),
  ],
};

beforeEach(() => {
  vi.mocked(coachService.fetchAllCoachClasses).mockResolvedValue([thursday]);
  vi.mocked(coachService.fetchAdminCoaches).mockResolvedValue(roster);
  vi.mocked(coachService.fetchNotetakerZoom).mockResolvedValue(zoom);
  vi.mocked(coachService.createAdminCoachClass).mockResolvedValue(thursday);
  vi.mocked(coachService.updateAdminCoachClass).mockResolvedValue(thursday);
  vi.mocked(coachService.deleteAdminCoachClass).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('CoachAdminClassesScreen', () => {
  it('shows when each class meets and whether the notetaker records it', async () => {
    renderScreen();

    const row = await screen.findByTestId('coach-admin-class-row');
    expect(within(row).getByTestId('coach-class-when')).toHaveTextContent('Thursdays at 7:00 PM (America/Chicago)');
    expect(within(row).getByTestId('coach-class-notetaker-state')).toHaveTextContent('Notetaker records this class');
  });

  it('schedules a class for a leader picked from the roster', async () => {
    renderScreen();

    fireEvent.click(await screen.findByTestId('coach-admin-schedule'));
    const save = screen.getByTestId('coach-class-save') as HTMLButtonElement;
    fireEvent.change(screen.getByTestId('coach-class-name'), { target: { value: 'Tuesday — Acts' } });
    // No leader chosen yet → nothing to save.
    expect(save.disabled).toBe(true);

    await waitFor(() => expect(screen.getAllByRole('option', { name: 'Milo Kerr' })).toHaveLength(1));
    fireEvent.change(screen.getByTestId('coach-class-leader'), { target: { value: 'milo-kerr' } });
    fireEvent.change(screen.getByTestId('coach-class-date'), { target: { value: '2026-10-20' } });
    fireEvent.change(screen.getByTestId('coach-class-time'), { target: { value: '18:30' } });
    fireEvent.change(screen.getByTestId('coach-class-zone'), { target: { value: 'America/New_York' } });
    fireEvent.change(screen.getByTestId('coach-class-zoom'), { target: { value: 'https://zoom.us/j/9?pwd=q' } });
    fireEvent.click(save);

    await waitFor(() =>
      expect(coachService.createAdminCoachClass).toHaveBeenCalledWith('milo-kerr', {
        name: 'Tuesday — Acts',
        classDate: '2026-10-20',
        recurrence: 'weekly',
        zoomLink: 'https://zoom.us/j/9?pwd=q',
        startTime: '18:30',
        timeZone: 'America/New_York',
        notetaker: true,
      }),
    );
  });

  it('shows the refusal in the form when the roster no longer knows the leader', async () => {
    vi.mocked(coachService.createAdminCoachClass).mockRejectedValue(
      new coachService.CoachApiError('admin/classes', 404, 'Leader not found', { refusal: 'unknown-leader' }),
    );
    renderScreen();

    fireEvent.click(await screen.findByTestId('coach-admin-schedule'));
    await waitFor(() => expect(screen.getAllByRole('option', { name: 'Milo Kerr' })).toHaveLength(1));
    fireEvent.change(screen.getByTestId('coach-class-leader'), { target: { value: 'milo-kerr' } });
    fireEvent.change(screen.getByTestId('coach-class-name'), { target: { value: 'X' } });
    fireEvent.click(screen.getByTestId('coach-class-save'));

    expect(await screen.findByTestId('coach-class-error')).toHaveTextContent('Refused (404): Leader not found');
  });

  it("edits and removes a leader's class, removing only after a confirm", async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    renderScreen();

    fireEvent.click(await screen.findByTestId('coach-class-edit'));
    expect(screen.queryByTestId('coach-class-leader')).toBeNull();
    fireEvent.click(screen.getByTestId('coach-class-notetaker'));
    fireEvent.click(screen.getByTestId('coach-class-save'));
    await waitFor(() =>
      expect(coachService.updateAdminCoachClass).toHaveBeenCalledWith('c1', expect.objectContaining({ notetaker: false, startTime: '19:00' })),
    );

    await waitFor(() => expect(screen.getByTestId('coach-class-delete')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('coach-class-delete'));
    expect(coachService.deleteAdminCoachClass).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('coach-class-delete'));
    await waitFor(() => expect(coachService.deleteAdminCoachClass).toHaveBeenCalledWith('c1'));
    expect(confirm).toHaveBeenCalledTimes(2);
  });

  it('lists connected Zoom accounts and records a meeting from one, prefilled', async () => {
    renderScreen();

    const accounts = await screen.findAllByTestId('coach-admin-zoom-account');
    expect(accounts).toHaveLength(2);
    expect(accounts[0]).toHaveTextContent('jeff@zoom.example · Leader: Jeff Ward');
    expect(accounts[1]).toHaveTextContent('guest@zoom.example · not matched to a leader');
    expect(within(accounts[0]).getByTestId('coach-admin-zoom-recorded')).toHaveTextContent('Recorded');
    expect(within(accounts[0]).getByText('Every other Tuesday at 6:30 PM (America/New_York)')).toBeInTheDocument();

    fireEvent.click(within(accounts[0]).getByTestId('coach-admin-zoom-record'));
    const form = within(accounts[0]).getByTestId('coach-class-form');
    await waitFor(() => expect((within(form).getByTestId('coach-class-leader') as HTMLSelectElement).value).toBe('jeff-ward'));
    expect((within(form).getByTestId('coach-class-name') as HTMLInputElement).value).toBe('Tuesday Acts');
    fireEvent.click(within(form).getByTestId('coach-class-save'));

    await waitFor(() =>
      expect(coachService.createAdminCoachClass).toHaveBeenCalledWith('jeff-ward', {
        name: 'Tuesday Acts',
        classDate: '2026-10-20',
        recurrence: 'biweekly',
        zoomLink: 'https://us02web.zoom.us/j/555?pwd=p',
        startTime: '18:30',
        timeZone: 'America/New_York',
        notetaker: true,
      }),
    );
  });

  it('asks for the leader when a meeting is not matched to one', async () => {
    renderScreen();

    const accounts = await screen.findAllByTestId('coach-admin-zoom-account');
    fireEvent.click(within(accounts[1]).getByTestId('coach-admin-zoom-record'));
    const form = within(accounts[1]).getByTestId('coach-class-form');
    expect((within(form).getByTestId('coach-class-leader') as HTMLSelectElement).value).toBe('');
    expect((within(form).getByTestId('coach-class-save') as HTMLButtonElement).disabled).toBe(true);
  });

  it('says so quietly when the notetaker is not reachable', async () => {
    vi.mocked(coachService.fetchNotetakerZoom).mockResolvedValue({ ...zoom, available: false, connections: [], meetings: [] });
    renderScreen();

    expect(await screen.findByTestId('coach-admin-zoom-unavailable')).toHaveTextContent('The notetaker is not reachable right now.');
    expect(screen.queryByTestId('coach-admin-zoom-account')).toBeNull();
  });
});
