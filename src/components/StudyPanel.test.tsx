import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { InductiveStudy } from '@versemate/studies';
import StudyPanel from './StudyPanel';
import { AppProvider } from '@/contexts/AppContext';
import * as bibleService from '@/services/bibleService';

vi.mock('@/services/bibleService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/bibleService')>();
  return { ...actual, fetchStudy: vi.fn() };
});

const study: InductiveStudy = {
  bookId: 1,
  bookName: 'Genesis',
  chapter: 1,
  title: 'Genesis 1',
  subtitle: 'The Precept Method, Verse by Verse',
  themeOneLine: 'In the beginning God created.',
  steps: [
    {
      number: 1,
      kind: 'prose',
      title: 'Begin with prayer',
      summary: 'Apart from the Spirit this is just a method.',
      body: 'Ask for light before you read.',
    },
  ],
  interpretation: {
    movements: [{ number: 1, title: 'The absolute beginning', range: '1:1-2', body: 'God acts.' }],
  },
  application: { questions: [{ range: '1:1-2', question: 'What do you assume God is like?' }] },
};

function renderPanel() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AppProvider>
          <StudyPanel book="Genesis" bookId={1} chapter={1} />
        </AppProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  vi.mocked(bibleService.fetchStudy).mockResolvedValue(study);
});

describe('StudyPanel', () => {
  it('renders the chapter study', async () => {
    renderPanel();
    await waitFor(() =>
      expect(screen.getByText(/Inductive Study of Genesis 1/i)).toBeInTheDocument(),
    );
    expect(screen.getByText('Begin with prayer')).toBeInTheDocument();
  });

  it('treats a missing study as a load failure, not as unwritten content', async () => {
    // Every chapter has a study (all 1,189 ship bundled), so this state means
    // the fetch failed — the copy must not promise content that already exists.
    vi.mocked(bibleService.fetchStudy).mockResolvedValue(null);
    renderPanel();
    const box = await screen.findByTestId('study-unavailable');
    expect(box).toHaveTextContent(/didn't load/i);
    expect(box).toHaveTextContent(/Every chapter has a 9-step Precept inductive study/i);
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/James 1 is the first chapter live/i)).not.toBeInTheDocument();
  });
});
