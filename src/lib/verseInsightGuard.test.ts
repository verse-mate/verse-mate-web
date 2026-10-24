import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  holdVerseInsightWhileCardOpen,
  shouldSuppressVerseInsightClick,
  suppressVerseInsightClick,
} from './verseInsightGuard';

describe('verseInsightGuard', () => {
  afterEach(() => vi.restoreAllMocks());

  it('does not suppress before any dismissal', () => {
    vi.spyOn(Date, 'now').mockReturnValue(10_000);
    expect(shouldSuppressVerseInsightClick()).toBe(false);
  });

  it('suppresses the click immediately after an outside dismissal', () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(20_000);
    suppressVerseInsightClick();
    // The verse click follows within a few ms — still inside the window.
    now.mockReturnValue(20_050);
    expect(shouldSuppressVerseInsightClick()).toBe(true);
  });

  it('stops suppressing once the window lapses', () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(30_000);
    suppressVerseInsightClick();
    // A deliberate re-tap well after the window should open Verse Insight.
    now.mockReturnValue(30_600);
    expect(shouldSuppressVerseInsightClick()).toBe(false);
  });

  it('self-clears so an unrelated later verse tap is not swallowed', () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(40_000);
    suppressVerseInsightClick(); // dismissal that lands off any verse
    now.mockReturnValue(60_000); // seconds later, a genuine verse tap
    expect(shouldSuppressVerseInsightClick()).toBe(false);
  });

  it('suppresses for as long as a card is open, however long that is', () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(40_000);
    const release = holdVerseInsightWhileCardOpen();
    // A slow tap outside the card on a touch screen: the verse sees touchend
    // long after any time window, and before Radix closes the card.
    now.mockReturnValue(45_000);
    expect(shouldSuppressVerseInsightClick()).toBe(true);
    release();
    release();
    expect(shouldSuppressVerseInsightClick()).toBe(false);
  });
});
