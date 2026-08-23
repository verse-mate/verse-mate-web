import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ScriptureText } from './ScriptureBlock';

const VERSES = [
  { number: 16, text: 'For God so loved the world' },
  { number: '3-4', text: 'A run stitched from two verses', reference: 'John 3:3-4' },
];

describe('ScriptureText', () => {
  it('stays plain, non-interactive prose when no interactions are passed', () => {
    // The topic pane renders scripture this way; adding the reader's verse tap
    // must not change how a quoted passage renders there.
    const { container } = render(<ScriptureText verses={VERSES} />);
    expect(screen.getByText(/For God so loved the world/)).toBeInTheDocument();
    expect(container.querySelector('.verse-span')).not.toBeInTheDocument();
    expect(screen.queryByTestId('scripture-verse-16')).not.toBeInTheDocument();
  });

  it('makes each verse a tap target when a click handler is passed', () => {
    const onVerseClick = vi.fn();
    render(<ScriptureText verses={VERSES} onVerseClick={onVerseClick} />);

    fireEvent.click(screen.getByTestId('scripture-verse-16'));
    expect(onVerseClick).toHaveBeenCalledWith(VERSES[0]);

    fireEvent.click(screen.getByTestId('scripture-verse-3-4'));
    expect(onVerseClick).toHaveBeenCalledWith(VERSES[1]);
  });

  it('treats a drag that ends on a verse as a selection, not a tap', () => {
    const onVerseClick = vi.fn();
    render(<ScriptureText verses={VERSES} onVerseClick={onVerseClick} />);

    const selection = { isCollapsed: false, toString: () => 'so loved' } as unknown as Selection;
    const getSelection = vi.spyOn(window, 'getSelection').mockReturnValue(selection);
    fireEvent.click(screen.getByTestId('scripture-verse-16'));
    expect(onVerseClick).not.toHaveBeenCalled();
    getSelection.mockRestore();
  });

  it('lets the caller decorate the verse text', () => {
    render(
      <ScriptureText
        verses={VERSES}
        renderVerseText={(v) => <em data-testid={`decorated-${v.number}`}>{v.text}</em>}
      />,
    );
    expect(screen.getByTestId('decorated-16')).toHaveTextContent('For God so loved the world');
    // The trailing citation on a stitched run still renders alongside it.
    expect(screen.getByText('(John 3:3-4)')).toBeInTheDocument();
  });
});
