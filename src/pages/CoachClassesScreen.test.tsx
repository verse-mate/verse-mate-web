import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import CoachClassesScreen from './CoachClassesScreen';
import * as coachService from '@/services/coachService';

// The screen composes react-query + the coachService client. Mock the client
// so the test drives the UI states (list, add, delete) without a backend.
vi.mock('@/services/coachService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/coachService')>();
  return {
    ...actual,
    fetchCoachMe: vi.fn(),
    fetchCoachClasses: vi.fn(),
    createCoachClass: vi.fn(),
    updateCoachClass: vi.fn(),
    deleteCoachClass: vi.fn(),
    fetchNotetakerStatus: vi.fn(),
  };
});

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/coach/classes']}>
        <CoachClassesScreen />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const meCoach = {
  isCoach: true,
  isAdmin: false,
  profile: { id: 'jeff-ward', name: 'Jeff Ward', email: 'jeff@example.com', group: 'Group', coachName: '' },
  zoomLink: '',
  model: 'v3',
  clusters: [],
  statusBands: [],
};

const CONNECT_URL = 'https://notetaker.example/zoom/install?from=versemate';
const unknownStatus = { known: false, connected: false, zoomEmail: null, connectUrl: CONNECT_URL };

const thursday = {
  id: 'c1',
  name: 'Thursday — James',
  classDate: '2026-10-22',
  recurrence: 'weekly' as const,
  zoomLink: 'https://zoom.us/j/1?pwd=x',
  startTime: '19:00',
  timeZone: 'America/Chicago',
  notetaker: true,
};

beforeEach(() => {
  vi.mocked(coachService.fetchCoachMe).mockResolvedValue(meCoach as never);
  vi.mocked(coachService.fetchNotetakerStatus).mockResolvedValue(unknownStatus);
});

/** Lets a settled status query render before asserting it rendered nothing. */
async function statusSettled() {
  await waitFor(() => expect(coachService.fetchNotetakerStatus).toHaveBeenCalled());
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('CoachClassesScreen', () => {
  it('lists the registered classes with their meeting link', async () => {
    vi.mocked(coachService.fetchCoachClasses).mockResolvedValue([thursday]);

    renderScreen();

    expect(await screen.findByText('Thursday — James')).toBeInTheDocument();
    expect(screen.getByText('https://zoom.us/j/1?pwd=x')).toBeInTheDocument();
    // Add-a-class affordance is present.
    expect(screen.getByTestId('coach-classes-add')).toBeInTheDocument();
  });

  it('shows the empty state when the leader has no classes', async () => {
    vi.mocked(coachService.fetchCoachClasses).mockResolvedValue([]);

    renderScreen();

    expect(await screen.findByTestId('coach-classes-empty')).toBeInTheDocument();
  });

  it('opens the add form and submits a new class', async () => {
    vi.mocked(coachService.fetchCoachClasses).mockResolvedValue([]);
    vi.mocked(coachService.createCoachClass).mockResolvedValue({
      id: 'new',
      name: 'Saturday — Kings',
      classDate: null,
      recurrence: 'weekly',
      zoomLink: 'https://meet.google.com/abc',
      startTime: null,
      timeZone: null,
      notetaker: true,
    });

    renderScreen();

    fireEvent.click(await screen.findByTestId('coach-classes-add'));

    fireEvent.change(screen.getByTestId('coach-class-name'), { target: { value: 'Saturday — Kings' } });
    fireEvent.change(screen.getByTestId('coach-class-zoom'), {
      target: { value: 'https://meet.google.com/abc' },
    });
    fireEvent.click(screen.getByTestId('coach-class-save'));

    await waitFor(() =>
      expect(coachService.createCoachClass).toHaveBeenCalledWith({
        name: 'Saturday — Kings',
        classDate: '',
        recurrence: 'weekly',
        zoomLink: 'https://meet.google.com/abc',
        startTime: '',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notetaker: true,
      }),
    );
  });

  it('sends the start time and time zone, and shows when the class meets', async () => {
    vi.mocked(coachService.fetchCoachClasses).mockResolvedValue([]);
    vi.mocked(coachService.createCoachClass).mockResolvedValue({ ...thursday, id: 'new' });

    renderScreen();

    fireEvent.click(await screen.findByTestId('coach-classes-add'));
    fireEvent.change(screen.getByTestId('coach-class-name'), { target: { value: 'Thursday — James' } });
    fireEvent.change(screen.getByTestId('coach-class-date'), { target: { value: '2026-10-22' } });
    fireEvent.change(screen.getByTestId('coach-class-time'), { target: { value: '19:00' } });
    fireEvent.change(screen.getByTestId('coach-class-zone'), { target: { value: 'America/Chicago' } });
    fireEvent.change(screen.getByTestId('coach-class-zoom'), { target: { value: 'https://zoom.us/j/1?pwd=x' } });
    fireEvent.click(screen.getByTestId('coach-class-notetaker'));

    expect(screen.getByTestId('coach-class-when-preview')).toHaveTextContent('When: Thursdays at 7:00 PM (America/Chicago)');
    fireEvent.click(screen.getByTestId('coach-class-save'));

    await waitFor(() =>
      expect(coachService.createCoachClass).toHaveBeenCalledWith({
        name: 'Thursday — James',
        classDate: '2026-10-22',
        recurrence: 'weekly',
        zoomLink: 'https://zoom.us/j/1?pwd=x',
        startTime: '19:00',
        timeZone: 'America/Chicago',
        notetaker: false,
      }),
    );
  });

  it('says when each class meets and whether the notetaker can join it', async () => {
    vi.mocked(coachService.fetchCoachClasses).mockResolvedValue([
      thursday,
      { ...thursday, id: 'c2', name: 'Saturday — Acts', classDate: null, startTime: null, timeZone: null },
      { ...thursday, id: 'c3', name: 'Monthly — Psalms', recurrence: 'monthly', notetaker: false },
    ]);

    renderScreen();

    await screen.findByText('Saturday — Acts');
    const when = screen.getAllByTestId('coach-class-when').map((el) => el.textContent?.trim());
    expect(when).toEqual(['Thursdays at 7:00 PM (America/Chicago)', 'Weekly', 'Monthly on the 22nd at 7:00 PM (America/Chicago)']);
    const states = screen.getAllByTestId('coach-class-notetaker-state').map((el) => el.textContent?.trim());
    expect(states).toEqual([
      'Notetaker records this class',
      'Add the date, start time and time zone so the notetaker can join',
      'Notetaker off',
    ]);
  });

  it('opens the edit form with the saved time and zone', async () => {
    vi.mocked(coachService.fetchCoachClasses).mockResolvedValue([thursday]);
    vi.mocked(coachService.updateCoachClass).mockResolvedValue(thursday);

    renderScreen();

    fireEvent.click(await screen.findByTestId('coach-class-edit'));
    expect((screen.getByTestId('coach-class-time') as HTMLInputElement).value).toBe('19:00');
    expect((screen.getByTestId('coach-class-zone') as HTMLSelectElement).value).toBe('America/Chicago');
    fireEvent.click(screen.getByTestId('coach-class-save'));

    await waitFor(() =>
      expect(coachService.updateCoachClass).toHaveBeenCalledWith('c1', {
        name: 'Thursday — James',
        classDate: '2026-10-22',
        recurrence: 'weekly',
        zoomLink: 'https://zoom.us/j/1?pwd=x',
        startTime: '19:00',
        timeZone: 'America/Chicago',
        notetaker: true,
      }),
    );
  });

  it('asks for the passcode link, and says the notetaker joins Zoom only', async () => {
    vi.mocked(coachService.fetchCoachClasses).mockResolvedValue([]);

    renderScreen();

    fireEvent.click(await screen.findByTestId('coach-classes-add'));
    expect(screen.queryByTestId('coach-class-link-hint')).toBeNull();

    fireEvent.change(screen.getByTestId('coach-class-zoom'), { target: { value: 'https://us02web.zoom.us/j/123' } });
    expect(screen.getByTestId('coach-class-link-hint')).toHaveTextContent('paste the invite link that includes it (…?pwd=…)');

    fireEvent.change(screen.getByTestId('coach-class-zoom'), { target: { value: 'https://us02web.zoom.us/j/123?pwd=abc' } });
    expect(screen.queryByTestId('coach-class-link-hint')).toBeNull();

    fireEvent.change(screen.getByTestId('coach-class-zoom'), { target: { value: 'https://meet.google.com/abc' } });
    expect(screen.getByTestId('coach-class-link-hint')).toHaveTextContent('The notetaker joins Zoom meetings only for now.');
  });

  it('suggests connecting Zoom when the account is not connected', async () => {
    vi.mocked(coachService.fetchCoachClasses).mockResolvedValue([thursday]);
    vi.mocked(coachService.fetchNotetakerStatus).mockResolvedValue({ ...unknownStatus, known: true });

    renderScreen();

    const card = await screen.findByTestId('coach-notetaker-connect');
    expect(card).toHaveTextContent('Connect your Zoom account (recommended)');
    expect(card).toHaveTextContent('the host has to admit it and allow recording');
    expect(screen.getByTestId('coach-notetaker-connect-button')).toHaveAttribute('href', CONNECT_URL);
    expect(screen.getByTestId('coach-notetaker-how')).toHaveAttribute('href', 'https://versemate.org/coach/notetaker');
    expect(screen.queryByTestId('coach-notetaker-connected')).toBeNull();
  });

  it('says which Zoom account is connected', async () => {
    vi.mocked(coachService.fetchCoachClasses).mockResolvedValue([thursday]);
    vi.mocked(coachService.fetchNotetakerStatus).mockResolvedValue({
      known: true,
      connected: true,
      zoomEmail: 'jeff@zoom.example',
      connectUrl: CONNECT_URL,
    });

    renderScreen();

    expect(await screen.findByTestId('coach-notetaker-connected')).toHaveTextContent('Zoom connected as jeff@zoom.example');
    expect(screen.queryByTestId('coach-notetaker-connect')).toBeNull();
  });

  it('claims nothing about Zoom when the notetaker did not answer or the request failed', async () => {
    vi.mocked(coachService.fetchCoachClasses).mockResolvedValue([thursday]);

    const first = renderScreen();
    await screen.findByText('Thursday — James');
    await statusSettled();
    expect(screen.queryByTestId('coach-notetaker-connect')).toBeNull();
    expect(screen.queryByTestId('coach-notetaker-connected')).toBeNull();
    first.unmount();

    vi.mocked(coachService.fetchNotetakerStatus).mockClear().mockRejectedValue(new Error('coach api failed: 502'));
    renderScreen();
    await screen.findByText('Thursday — James');
    await statusSettled();
    expect(screen.queryByTestId('coach-notetaker-connect')).toBeNull();
    expect(screen.queryByTestId('coach-notetaker-connected')).toBeNull();
    expect(screen.queryByTestId('coach-error')).toBeNull();
  });

  it('disables save until a name is entered and rejects a malformed link', async () => {
    vi.mocked(coachService.fetchCoachClasses).mockResolvedValue([]);

    renderScreen();

    fireEvent.click(await screen.findByTestId('coach-classes-add'));

    const save = screen.getByTestId('coach-class-save') as HTMLButtonElement;
    // No name yet → disabled.
    expect(save.disabled).toBe(true);

    fireEvent.change(screen.getByTestId('coach-class-name'), { target: { value: 'X' } });
    fireEvent.change(screen.getByTestId('coach-class-zoom'), { target: { value: 'not-a-url' } });
    // Bad link → still disabled + inline error.
    expect(save.disabled).toBe(true);
    expect(screen.getByText('Enter a valid http(s) link.')).toBeInTheDocument();
  });
});
