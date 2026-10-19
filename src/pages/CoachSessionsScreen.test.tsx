/**
 * Sessions (/coach/sessions) as the notetaker's schedule: the class form's
 * time, zone and notetaker switch, editing a class, the "Connect your Zoom
 * account" card, and an admin scheduling for a leader on the drill-in.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CoachSessionsScreen from './CoachSessionsScreen';
import * as coachService from '@/services/coachService';
import type { AdminCoachClass, CoachClass, CoachMe } from '@/services/coachService';

vi.mock('@/services/coachService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/coachService')>();
  return {
    ...actual,
    fetchCoachMe: vi.fn(),
    fetchCoachReportSummaries: vi.fn(),
    fetchCoachClasses: vi.fn(),
    fetchAllCoachClasses: vi.fn(),
    fetchAdminCoaches: vi.fn(),
    fetchNotetakerStatus: vi.fn(),
    createCoachClass: vi.fn(),
    updateCoachClass: vi.fn(),
    deleteCoachClass: vi.fn(),
    createAdminCoachClass: vi.fn(),
    updateAdminCoachClass: vi.fn(),
    deleteAdminCoachClass: vi.fn(),
  };
});

vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    state: { isSignedIn: true, userFirstName: 'Avery', userLastName: 'Hollis', userEmail: 'avery@example.com', userAvatarUrl: '' },
  }),
}));

const me: CoachMe = {
  isCoach: true,
  isAdmin: false,
  profile: { id: 'avery', name: 'Avery Hollis', email: 'avery@example.com', group: 'Saturday Morning', coachName: '' },
  zoomLink: '',
  affiliatedChurch: '',
  bibleCoach: '',
  model: 'v3',
  clusters: [],
  statusBands: [],
};

const CONNECT_URL = 'https://notetaker.example/zoom/install?from=versemate';
const unknownStatus = { known: false, connected: false, zoomEmail: null, connectUrl: CONNECT_URL };

const thursday: CoachClass = {
  id: 'c1',
  name: 'Thursday — James',
  classDate: '2026-10-22',
  recurrence: 'weekly',
  zoomLink: 'https://zoom.us/j/1?pwd=x',
  startTime: '19:00',
  timeZone: 'America/Chicago',
  notetaker: true,
};
// Created before start times existed: no time, no zone.
const older: CoachClass = { ...thursday, id: 'c2', name: 'Saturday — Acts', classDate: '2026-10-24', startTime: null, timeZone: null };

const ofAvery = (c: CoachClass): AdminCoachClass => ({ ...c, leader: { id: 'avery', name: 'Avery Hollis', email: 'avery@example.com' } });

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/coach/sessions" element={<CoachSessionsScreen />} />
          <Route path="/coach/leader/:coachId/sessions" element={<CoachSessionsScreen />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Lets a settled status query render before asserting it rendered nothing. */
async function statusSettled() {
  await waitFor(() => expect(coachService.fetchNotetakerStatus).toHaveBeenCalled());
  await new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
  // Anything not mocked above (the learning offer) gets a 404, never the network.
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })));
  vi.mocked(coachService.fetchCoachMe).mockResolvedValue(me);
  vi.mocked(coachService.fetchCoachReportSummaries).mockResolvedValue({ items: [], total: 0, streakWeeks: 0, quarterSessions: 0 });
  vi.mocked(coachService.fetchCoachClasses).mockResolvedValue([thursday, older]);
  vi.mocked(coachService.fetchAllCoachClasses).mockResolvedValue([ofAvery(thursday), ofAvery(older)]);
  vi.mocked(coachService.fetchAdminCoaches).mockResolvedValue([
    { id: 'avery', name: 'Avery Hollis', group: 'Saturday Morning', coachName: '', sessionCount: 2, latest: null },
  ]);
  vi.mocked(coachService.fetchNotetakerStatus).mockResolvedValue(unknownStatus);
  vi.mocked(coachService.createCoachClass).mockResolvedValue(thursday);
  vi.mocked(coachService.updateCoachClass).mockResolvedValue(thursday);
  vi.mocked(coachService.createAdminCoachClass).mockResolvedValue(ofAvery(thursday));
  vi.mocked(coachService.updateAdminCoachClass).mockResolvedValue(thursday);
  vi.mocked(coachService.deleteAdminCoachClass).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('Sessions, leader view', () => {
  it('says when each class meets and what the notetaker still needs', async () => {
    renderAt('/coach/sessions');

    await screen.findByText('Saturday — Acts');
    const when = screen.getAllByTestId('coach-class-when').map((el) => el.textContent);
    expect(when).toEqual(['Thursdays at 7:00 PM (America/Chicago)', 'Saturdays']);
    const states = screen.getAllByTestId('coach-class-notetaker-state').map((el) => el.textContent?.trim());
    expect(states).toEqual(['Notetaker records this class', 'Add the start time and time zone so the notetaker can join']);
  });

  it('adds a class with its start time, zone and notetaker choice', async () => {
    renderAt('/coach/sessions');

    fireEvent.click(await screen.findByTestId('coach-sessions-add'));
    const form = screen.getByTestId('coach-class-form');
    expect(within(form).getByTestId('coach-class-notetaker')).toHaveAttribute('aria-checked', 'true');
    expect((within(form).getByTestId('coach-class-zone') as HTMLSelectElement).value).toBe(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );

    fireEvent.change(within(form).getByTestId('coach-class-name'), { target: { value: 'Tuesday — Acts' } });
    fireEvent.change(within(form).getByTestId('coach-class-date'), { target: { value: '2026-10-20' } });
    fireEvent.change(within(form).getByTestId('coach-class-recurrence'), { target: { value: 'biweekly' } });
    fireEvent.change(within(form).getByTestId('coach-class-time'), { target: { value: '18:30' } });
    fireEvent.change(within(form).getByTestId('coach-class-zone'), { target: { value: 'America/New_York' } });
    expect(within(form).getByTestId('coach-class-when-preview')).toHaveTextContent('When Every other Tuesday at 6:30 PM (America/New_York)');

    fireEvent.change(within(form).getByTestId('coach-class-zoom'), { target: { value: 'https://us02web.zoom.us/j/9' } });
    expect(within(form).getByTestId('coach-class-link-hint')).toHaveTextContent('paste the invite link that includes it (…?pwd=…)');
    fireEvent.change(within(form).getByTestId('coach-class-zoom'), { target: { value: 'https://meet.google.com/abc' } });
    expect(within(form).getByTestId('coach-class-link-hint')).toHaveTextContent('The notetaker joins Zoom meetings only for now.');
    fireEvent.change(within(form).getByTestId('coach-class-zoom'), { target: { value: 'https://us02web.zoom.us/j/9?pwd=q' } });
    expect(within(form).queryByTestId('coach-class-link-hint')).toBeNull();

    fireEvent.click(within(form).getByTestId('coach-class-notetaker'));
    expect(within(form).getByTestId('coach-class-notetaker')).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(within(form).getByTestId('coach-class-save'));

    await waitFor(() =>
      expect(coachService.createCoachClass).toHaveBeenCalledWith({
        name: 'Tuesday — Acts',
        classDate: '2026-10-20',
        recurrence: 'biweekly',
        zoomLink: 'https://us02web.zoom.us/j/9?pwd=q',
        startTime: '18:30',
        timeZone: 'America/New_York',
        notetaker: false,
      }),
    );
    expect(coachService.createAdminCoachClass).not.toHaveBeenCalled();
  });

  it('edits a class made before start times, so it gets a time and zone', async () => {
    renderAt('/coach/sessions');

    await screen.findByText('Saturday — Acts');
    fireEvent.click(screen.getAllByTestId('coach-class-edit')[1]);
    const form = screen.getByTestId('coach-class-form');
    expect((within(form).getByTestId('coach-class-name') as HTMLInputElement).value).toBe('Saturday — Acts');
    expect((within(form).getByTestId('coach-class-time') as HTMLInputElement).value).toBe('');

    fireEvent.change(within(form).getByTestId('coach-class-time'), { target: { value: '09:00' } });
    fireEvent.change(within(form).getByTestId('coach-class-zone'), { target: { value: 'America/Denver' } });
    fireEvent.click(within(form).getByTestId('coach-class-save'));

    await waitFor(() =>
      expect(coachService.updateCoachClass).toHaveBeenCalledWith('c2', {
        name: 'Saturday — Acts',
        classDate: '2026-10-24',
        recurrence: 'weekly',
        zoomLink: 'https://zoom.us/j/1?pwd=x',
        startTime: '09:00',
        timeZone: 'America/Denver',
        notetaker: true,
      }),
    );
    expect(coachService.updateAdminCoachClass).not.toHaveBeenCalled();
  });

  it('suggests connecting Zoom above the classes', async () => {
    vi.mocked(coachService.fetchNotetakerStatus).mockResolvedValue({ ...unknownStatus, known: true });
    renderAt('/coach/sessions');

    const card = await screen.findByTestId('coach-notetaker-connect');
    expect(card).toHaveTextContent('Connect your Zoom account (recommended)');
    expect(card).toHaveTextContent('the host has to admit it and allow recording');
    expect(within(card).getByTestId('coach-notetaker-connect-button')).toHaveAttribute('href', CONNECT_URL);
    expect(within(card).getByTestId('coach-notetaker-how')).toHaveAttribute('href', 'https://versemate.org/coach/notetaker');
    // Above the "Recurring classes" heading.
    const heading = screen.getByText('Recurring classes');
    expect(card.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('names the connected Zoom account', async () => {
    vi.mocked(coachService.fetchNotetakerStatus).mockResolvedValue({ known: true, connected: true, zoomEmail: 'avery@zoom.example', connectUrl: CONNECT_URL });
    renderAt('/coach/sessions');

    expect(await screen.findByTestId('coach-notetaker-connected')).toHaveTextContent('Zoom connected as avery@zoom.example');
    expect(screen.queryByTestId('coach-notetaker-connect')).toBeNull();
  });

  it('shows no Zoom card when the notetaker did not answer or the request failed', async () => {
    const first = renderAt('/coach/sessions');
    await screen.findByText('Saturday — Acts');
    await statusSettled();
    expect(screen.queryByTestId('coach-notetaker-connect')).toBeNull();
    expect(screen.queryByTestId('coach-notetaker-connected')).toBeNull();
    first.unmount();

    vi.mocked(coachService.fetchNotetakerStatus).mockClear().mockRejectedValue(new Error('coach api failed: 502'));
    renderAt('/coach/sessions');
    await screen.findByText('Saturday — Acts');
    await statusSettled();
    expect(screen.queryByTestId('coach-notetaker-connect')).toBeNull();
    expect(screen.queryByTestId('coach-notetaker-connected')).toBeNull();
    expect(screen.queryByTestId('coach-error')).toBeNull();
  });
});

describe('Sessions, admin drill-in', () => {
  it("schedules a class for the leader through the admin route, and reads the list again", async () => {
    renderAt('/coach/leader/avery/sessions');

    await screen.findByText('Saturday — Acts');
    expect(coachService.fetchAllCoachClasses).toHaveBeenCalledTimes(1);
    const add = screen.getByTestId('coach-sessions-add');
    expect(add).toHaveTextContent('+ Schedule a class');
    fireEvent.click(add);

    const form = screen.getByTestId('coach-class-form');
    fireEvent.change(within(form).getByTestId('coach-class-name'), { target: { value: 'Monday — Ruth' } });
    fireEvent.change(within(form).getByTestId('coach-class-date'), { target: { value: '2026-10-26' } });
    fireEvent.change(within(form).getByTestId('coach-class-time'), { target: { value: '20:00' } });
    fireEvent.change(within(form).getByTestId('coach-class-zone'), { target: { value: 'America/Chicago' } });
    fireEvent.click(within(form).getByTestId('coach-class-save'));

    await waitFor(() =>
      expect(coachService.createAdminCoachClass).toHaveBeenCalledWith('avery', {
        name: 'Monday — Ruth',
        classDate: '2026-10-26',
        recurrence: 'weekly',
        zoomLink: '',
        startTime: '20:00',
        timeZone: 'America/Chicago',
        notetaker: true,
      }),
    );
    expect(coachService.createCoachClass).not.toHaveBeenCalled();
    await waitFor(() => expect(coachService.fetchAllCoachClasses).toHaveBeenCalledTimes(2));
  });

  it("edits and removes the leader's class through the admin routes, removing only after a confirm", async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    renderAt('/coach/leader/avery/sessions');

    await screen.findByText('Saturday — Acts');
    fireEvent.click(screen.getAllByTestId('coach-class-edit')[0]);
    const form = screen.getByTestId('coach-class-form');
    fireEvent.click(within(form).getByTestId('coach-class-notetaker'));
    fireEvent.click(within(form).getByTestId('coach-class-save'));
    await waitFor(() =>
      expect(coachService.updateAdminCoachClass).toHaveBeenCalledWith('c1', expect.objectContaining({ notetaker: false, startTime: '19:00' })),
    );
    expect(coachService.updateCoachClass).not.toHaveBeenCalled();

    await waitFor(() => expect(screen.queryByTestId('coach-class-form')).toBeNull());
    fireEvent.click(screen.getAllByTestId('coach-class-remove')[1]);
    expect(coachService.deleteAdminCoachClass).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByTestId('coach-class-remove')[1]);
    await waitFor(() => expect(coachService.deleteAdminCoachClass).toHaveBeenCalledWith('c2'));
    expect(coachService.deleteCoachClass).not.toHaveBeenCalled();
    expect(confirm).toHaveBeenCalledTimes(2);
  });

  it('asks nothing about Zoom: the connect card is the leader’s own', async () => {
    vi.mocked(coachService.fetchNotetakerStatus).mockResolvedValue({ ...unknownStatus, known: true });
    renderAt('/coach/leader/avery/sessions');

    await screen.findByText('Saturday — Acts');
    expect(coachService.fetchNotetakerStatus).not.toHaveBeenCalled();
    expect(screen.queryByTestId('coach-notetaker-connect')).toBeNull();
  });
});
