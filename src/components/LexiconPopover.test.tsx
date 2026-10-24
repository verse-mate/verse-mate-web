import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { AlignedToken, LexEntry } from '@versemate/lexicon';
import LexiconPopover from './LexiconPopover';

vi.mock('@/hooks/usePreferredLanguage', () => ({ usePreferredLanguage: () => 'en' }));

const ENTRY = {
  lemma: 'ἀγαπάω',
  translit: 'agapaō',
  strongs: 'G0025',
  pos: 'verb',
  basicGloss: 'settled, self-giving love',
} as LexEntry;
const TOKEN: AlignedToken = { surface: 'loved', lemma: 'agapao' };

const originalMatchMedia = window.matchMedia;

/** Pretend the reader has a mouse (hover + fine pointer), or a touch screen. */
function setPointer(kind: 'mouse' | 'touch') {
  window.matchMedia = ((query: string) => ({
    matches: kind === 'mouse' && query.includes('pointer: fine'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

function renderWord(onVerseClick = vi.fn()) {
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

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

describe('LexiconPopover with a mouse', () => {
  it('opens the definition on right-click instead of the browser menu', () => {
    setPointer('mouse');
    const { word } = renderWord();
    expect(word).not.toHaveClass('lex-word');

    const notCancelled = fireEvent.contextMenu(word);
    expect(notCancelled).toBe(false);
    expect(screen.getByText('settled, self-giving love')).toBeInTheDocument();
  });

  it('lets a left click fall through to the verse', () => {
    setPointer('mouse');
    const { word, onVerseClick } = renderWord();
    fireEvent.click(word);
    expect(onVerseClick).toHaveBeenCalled();
    expect(screen.queryByText('settled, self-giving love')).not.toBeInTheDocument();
  });
});

describe('LexiconPopover on a touch screen', () => {
  it('keeps the underline and opens the definition on tap', () => {
    setPointer('touch');
    const { word, onVerseClick } = renderWord();
    expect(word).toHaveClass('lex-word');

    fireEvent.click(word);
    expect(onVerseClick).not.toHaveBeenCalled();
    expect(screen.getByText('settled, self-giving love')).toBeInTheDocument();
  });
});
