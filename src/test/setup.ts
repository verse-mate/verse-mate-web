import "@testing-library/jest-dom";

// Browser shims, only where there is a DOM: a file can opt into the node
// environment (`// @vitest-environment node`, e.g. the Cloudflare worker test).
if (typeof window !== "undefined") Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom implements no layout, so it ships no scrollIntoView. Chrome that keeps
// a selected control on screen (the pill tabs) calls it on mount.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
