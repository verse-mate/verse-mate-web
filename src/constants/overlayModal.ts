/**
 * Shared size caps for the reading-screen overlay modals (book/topic Search,
 * Verse Insight) so they present at a consistent, compact footprint when the
 * mobile layout is reached by zooming a desktop browser. Using `min(px, vw/vh)`
 * keeps them from ballooning to full-screen at high zoom (small CSS-pixel
 * viewport) while staying comfortably sized on a normal small screen.
 */
export const OVERLAY_MODAL_WIDTH = 'min(420px, 92vw)';
export const OVERLAY_MODAL_HEIGHT = 'min(80vh, 720px)';
// Verse Insight carries more chrome (stepper + action row), so it gets a
// slightly taller ceiling but the same width cap for visual consistency.
export const OVERLAY_MODAL_MAX_HEIGHT = 'min(86vh, 760px)';
