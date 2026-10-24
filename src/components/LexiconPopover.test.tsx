import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { AlignedToken, LexEntry } from '@versemate/lexicon';
import LexiconPopover from './LexiconPopover';
import { shouldSuppressVerseInsightClick } from '@/lib/verseInsightGuard';

vi.mock('@/hooks/usePreferredLanguage', () => ({ usePreferredLanguage: () => 'en' }));

const ENTRY = {
  lemma: 'ἀγαπάω',
  translit: 'agapaō',
  strongs: 'G0025',
  pos: 'verb',
  basicGloss: 'settled, self-giving love',
} as LexEntry;
const TOKEN: AlignedToken = { surface: 'loved', lemma: 'agapao' };
const GLOSS = 'settled, self-giving love';

function renderWord() {
  const onVerseClick = vi.fn();
  const utils = render(
    <span onClick={onVerseClick}>
      For God so{' '}
      <LexiconPopover surface="loved" entry={ENTRY} token={TOKEN}>
        loved
      </LexiconPopover>
    </span>,
  );
  const word = utils.container.querySelector('[data-lex-word="agapaō"]') as HTMLElement;
  return { ...utils, word, onVerseClick };
}

const touchAt = (x: number, y: number) => ({ touches: [{ clientX: x, clientY: y }] });

describe('LexiconPopover with a mouse', () => {
  it('opens the definition on right-click instead of the browser menu', () => {
    const { word } = renderWord();
    const notCancelled = fireEvent.contextMenu(word);
    expect(notCancelled).toBe(false);
    expect(screen.getByText(GLOSS)).toBeInTheDocument();
    expect(word).toHaveClass('lex-word-open');
  });

  it('lets a left click fall through to the verse', () => {
    const { word, onVerseClick } = renderWord();
    fireEvent.click(word);
    expect(onVerseClick).toHaveBeenCalled();
    expect(screen.queryByText(GLOSS)).not.toBeInTheDocument();
  });
});

describe('LexiconPopover on a touch screen', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('opens the definition on press-and-hold, and the verse stands down', () => {
    const { word, onVerseClick } = renderWord();
    fireEvent.touchStart(word, touchAt(10, 10));
    act(() => vi.advanceTimersByTime(400));
    fireEvent.touchEnd(word);
    // Some browsers still send a click on release; it must not reach the verse.
    fireEvent.click(word);

    expect(screen.getByText(GLOSS)).toBeInTheDocument();
    expect(onVerseClick).not.toHaveBeenCalled();
    expect(shouldSuppressVerseInsightClick()).toBe(true);
  });

  it('closes on a tap outside without the verse opening Verse Insight', () => {
    const { word, onVerseClick } = renderWord();
    fireEvent.touchStart(word, touchAt(10, 10));
    act(() => vi.advanceTimersByTime(400));
    fireEvent.touchEnd(word);
    // Long after any time window, the reader taps the scripture to close it.
    act(() => vi.advanceTimersByTime(5000));
    // The verse acts on touchend, before Radix closes the card on the click.
    expect(shouldSuppressVerseInsightClick()).toBe(true);
    fireEvent.pointerDown(document.body);
    fireEvent.click(document.body);

    expect(screen.queryByText(GLOSS)).not.toBeInTheDocument();
    expect(onVerseClick).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1000));
    // With the card gone, the next tap on a verse is the reader's again.
    expect(shouldSuppressVerseInsightClick()).toBe(false);
  });

  it('leaves a short tap to the verse', () => {
    const { word, onVerseClick } = renderWord();
    fireEvent.touchStart(word, touchAt(10, 10));
    act(() => vi.advanceTimersByTime(150));
    fireEvent.touchEnd(word);
    fireEvent.click(word);
    act(() => vi.advanceTimersByTime(1000));

    expect(onVerseClick).toHaveBeenCalled();
    expect(screen.queryByText(GLOSS)).not.toBeInTheDocument();
  });

  it('does not open while the finger is scrolling', () => {
    const { word } = renderWord();
    fireEvent.touchStart(word, touchAt(10, 10));
    fireEvent.touchMove(word, touchAt(10, 40));
    act(() => vi.advanceTimersByTime(1000));

    expect(screen.queryByText(GLOSS)).not.toBeInTheDocument();
  });
});
