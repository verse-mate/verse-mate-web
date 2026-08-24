import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ChapterAlignment } from '@versemate/lexicon';
import PassageScripture from './PassageScripture';
import * as bibleService from '@/services/bibleService';
import { loadSettings } from '@/services/bibleService';

// The lexicon package pulls in generated per-chapter JSON, which a unit test
// has no business loading. Stub the two entry points the render path uses.
const loadAlignmentFor =
  vi.fn<(bookId: number, chapter: number) => Promise<ChapterAlignment | null>>();
const loadStrongsIndex = vi.fn();
vi.mock('@versemate/lexicon', () => ({
  loadAlignmentFor: (bookId: number, chapter: number) => loadAlignmentFor(bookId, chapter),
  loadStrongsIndex: () => loadStrongsIndex(),
}));

vi.mock('@/services/bibleService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/bibleService')>();
  return {
    ...actual,
    fetchChapterById: vi.fn(),
    fetchChapter: vi.fn(),
    fetchVerseInsights: vi.fn(),
  };
});

// `AppProvider` reads its settings once at module load, so a test can't flip a
// toggle through localStorage. Stub the hook instead — the passage only needs
// the reader's version and settings, and the Verse Insight sheet only needs
// those plus the sign-in state.
const appState = {
  book: 'Genesis',
  bookId: 1,
  chapter: 1,
  version: 'NASB1995',
  isSignedIn: false,
  settings: loadSettings(),
};
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({ state: appState, dispatch: vi.fn(), addHighlight: vi.fn() }),
}));

const JOHN_3 = {
  book: 'John',
  bookId: 43,
  chapter: 3,
  verses: [
    { number: 16, text: 'For God so loved the world' },
    { number: 17, text: 'For God did not send the Son into the world to judge the world' },
  ],
};

/** One tokenized word ("loved") so the lexical path has something to decorate. */
const ALIGNMENT = {
  bookId: 43,
  book: 'John',
  chapter: 3,
  version: 'BSB',
  verses: { 16: [{ surface: 'loved', lemma: 'agapao' }] },
  lexicon: {
    agapao: {
      lemma: 'ἀγαπάω',
      translit: 'agapaō',
      strongs: 'G0025',
      pos: 'verb',
      basicGloss: 'carries the sense of settled, self-giving love',
    },
  },
} as unknown as ChapterAlignment;

function renderPassage() {
  return render(
    <MemoryRouter>
      <PassageScripture
        bookId={43}
        bookName="John"
        chapter={3}
        verses={[
          { number: 16, text: 'For God so loved the world' },
          { number: 17, text: 'For God did not send the Son into the world to judge the world' },
        ]}
      />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  appState.settings = { ...loadSettings(), verseInsightsPopup: true };
  loadAlignmentFor.mockResolvedValue(ALIGNMENT);
  loadStrongsIndex.mockResolvedValue({});
  vi.mocked(bibleService.fetchChapterById).mockResolvedValue(JOHN_3);
  vi.mocked(bibleService.fetchChapter).mockResolvedValue(JOHN_3);
  vi.mocked(bibleService.fetchVerseInsights).mockResolvedValue([
    { verse: 16, crossReferences: ['Romans 5:8'], historicalContext: 'God gave what was dearest.' },
  ]);
});

describe('PassageScripture', () => {
  it('opens the Verse Insight card for the verse that was clicked', async () => {
    renderPassage();
    fireEvent.click(await screen.findByTestId('scripture-verse-17'));

    const sheet = await screen.findByRole('dialog', { name: 'Verse Insight' });
    // The card is scoped to the passage's book, not whatever the reader last
    // had open — the whole point of passing the reference through.
    expect(sheet).toHaveTextContent('John 3:17');
    expect(bibleService.fetchVerseInsights).toHaveBeenCalledWith('John', 3, 43);
    expect(bibleService.fetchChapterById).toHaveBeenCalledWith(43, 'John', 3, 'NASB1995');
  });

  it('makes the words tappable for their definition', async () => {
    const { container } = renderPassage();
    await waitFor(() =>
      expect(container.querySelector('[data-lex-word="agapaō"]')).toBeInTheDocument(),
    );
    const word = container.querySelector('[data-lex-word="agapaō"]') as HTMLElement;
    expect(word).toHaveTextContent('loved');
    expect(word).toHaveAttribute('aria-label', expect.stringContaining('self-giving love'));
    expect(loadAlignmentFor).toHaveBeenCalledWith(43, 3);
  });

  it('leaves the verses inert when the reader has turned Verse Insights off', async () => {
    appState.settings = { ...appState.settings, verseInsightsPopup: false };
    const { container } = renderPassage();

    await screen.findByText(/For God so/);
    expect(screen.queryByTestId('scripture-verse-16')).not.toBeInTheDocument();
    // The words still carry their definitions — only the verse tap is off.
    await waitFor(() =>
      expect(container.querySelector('[data-lex-word="agapaō"]')).toBeInTheDocument(),
    );
  });

  it("sets the passage at the reader's own font size", async () => {
    // A passage is scripture wherever it appears, so the Font Size slider in
    // Settings has to reach it — the Bible tab and the Jesus tab can't drift
    // apart just because one of them hard-codes the reading size.
    appState.settings = { ...appState.settings, fontSize: 26 };
    const { container } = renderPassage();

    await screen.findByText(/For God so loved the world/);
    const body = container.querySelector('.leading-relaxed') as HTMLElement;
    expect(body).toHaveStyle({ fontSize: '26px' });
  });

  it('lets a caller override the reading size explicitly', async () => {
    appState.settings = { ...appState.settings, fontSize: 26 };
    const { container } = render(
      <MemoryRouter>
        <PassageScripture
          bookId={43}
          bookName="John"
          chapter={3}
          fontSize={15}
          verses={[{ number: 16, text: 'For God so loved the world' }]}
        />
      </MemoryRouter>,
    );

    await screen.findByText(/For God so loved the world/);
    const body = container.querySelector('.leading-relaxed') as HTMLElement;
    expect(body).toHaveStyle({ fontSize: '15px' });
  });

  it('still renders the passage when neither the lexicon nor the chapter resolves', async () => {
    loadAlignmentFor.mockResolvedValue(null);
    vi.mocked(bibleService.fetchChapterById).mockResolvedValue({
      book: 'John',
      bookId: 43,
      chapter: 3,
      verses: [],
    });
    const { container } = renderPassage();

    expect(await screen.findByText(/For God so loved the world/)).toBeInTheDocument();
    await waitFor(() => expect(loadAlignmentFor).toHaveBeenCalled());
    expect(container.querySelector('[data-lex-word]')).not.toBeInTheDocument();
    // The verse tap survives the lexicon being unavailable.
    expect(screen.getByTestId('scripture-verse-16')).toBeInTheDocument();
  });
});
