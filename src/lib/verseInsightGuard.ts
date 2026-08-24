/**
 * Guard against the lexicon-card dismissal doubling as a verse tap.
 *
 * On desktop / tall viewports the lexical card is an anchored Radix popover
 * with no backing overlay. Radix closes it on the `pointerdown` of an
 * outside click; the matching `click` / `touchend` then lands on the
 * scripture text behind the card and would open the Verse Insight sheet —
 * so a single "dismiss the word card" gesture wrongly surfaced Verse Insight.
 *
 * A horizontal swipe raises the same problem: it ends over some verse, and the
 * click that follows is part of the page-turn, not a choice of verse.
 *
 * Both callers — the popover when it handles an outside interaction, and
 * `useHorizontalSwipe` when it recognises a swipe — call
 * `suppressVerseInsightClick()`, opening a short suppression window. `ReadingScreen`'s
 * `openVerseInsight` consults `shouldSuppressVerseInsightClick()` and bails
 * while that window is open, so the dismiss click just closes the card and
 * returns to the text. A verse tapped deliberately (well after the window
 * lapses) still opens Verse Insight as before.
 */

// pointerdown → click is a few ms; a deliberate re-tap on a verse takes far
// longer (reaction + re-aim). 500ms comfortably covers the former without
// swallowing the latter.
const SUPPRESS_WINDOW_MS = 500;

let suppressUntil = 0;

export function suppressVerseInsightClick(): void {
  suppressUntil = Date.now() + SUPPRESS_WINDOW_MS;
}

export function shouldSuppressVerseInsightClick(): boolean {
  return Date.now() < suppressUntil;
}
