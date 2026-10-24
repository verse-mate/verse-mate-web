/**
 * Guard against the lexicon-card dismissal doubling as a verse tap.
 *
 * On desktop / tall viewports the lexical card is an anchored Radix popover
 * with no backing overlay. Radix closes it on the `pointerdown` of an
 * outside click; the matching `click` / `touchend` then lands on the
 * scripture text behind the card and would open the Verse Insight sheet —
 * so a single "dismiss the word card" gesture wrongly surfaced Verse Insight.
 *
 * A press-and-hold on a word raises it too: the hold opens the word's card,
 * and the verse underneath must not also open its long-press actions or, on
 * release, Verse Insight.
 *
 * A horizontal swipe raises the same problem: it ends over some verse, and the
 * click that follows is part of the page-turn, not a choice of verse.
 *
 * A tap outside an open card on a touch screen is the hardest case: Radix
 * closes the card only on the trailing `click`, after the verse has acted on
 * `touchend`. The popover therefore also holds the guard shut for as long as
 * it is open (`holdVerseInsightWhileCardOpen`).
 *
 * Each caller — the popover when it handles an outside interaction or a
 * hold, and `useHorizontalSwipe` when it recognises a swipe — calls
 * `suppressVerseInsightClick()`, opening a short suppression window. `ReadingScreen`'s
 * `openVerseInsight` and `openVerseActions` consult
 * `shouldSuppressVerseInsightClick()` and bail
 * while that window is open, so the dismiss click just closes the card and
 * returns to the text. A verse tapped deliberately (well after the window
 * lapses) still opens Verse Insight as before.
 */

// pointerdown → click is a few ms; a deliberate re-tap on a verse takes far
// longer (reaction + re-aim). 500ms comfortably covers the former without
// swallowing the latter.
const SUPPRESS_WINDOW_MS = 500;

let suppressUntil = 0;
let openCards = 0;

export function suppressVerseInsightClick(): void {
  suppressUntil = Date.now() + SUPPRESS_WINDOW_MS;
}

/**
 * Hold the guard shut for as long as a lexicon card is open. On touch, Radix
 * only dismisses the card on the `click` that ends an outside tap — after the
 * verse has already seen the `touchend` and opened Verse Insight — so the
 * time window alone opens too late there. While any card is open, a tap on
 * the scripture just closes it. Returns the matching release.
 */
export function holdVerseInsightWhileCardOpen(): () => void {
  openCards += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    openCards -= 1;
  };
}

export function shouldSuppressVerseInsightClick(): boolean {
  return openCards > 0 || Date.now() < suppressUntil;
}
