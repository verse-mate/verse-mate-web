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

beforeEach(() => {
  vi.mocked(coachService.fetchCoachMe).mockResolvedValue(meCoach as never);
});

describe('CoachClassesScreen', () => {
  it('lists the registered classes with their meeting link', async () => {
    vi.mocked(coachService.fetchCoachClasses).mockResolvedValue([
      { id: 'c1', name: 'Thursday — James', classDate: '2026-07-23', recurrence: 'weekly', zoomLink: 'https://zoom.us/j/1' },
    ]);

    renderScreen();

    expect(await screen.findByText('Thursday — James')).toBeInTheDocument();
    expect(screen.getByText('https://zoom.us/j/1')).toBeInTheDocument();
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
      }),
    );
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
