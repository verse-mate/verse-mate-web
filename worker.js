/**
 * Cloudflare Worker for serving the VerseMate web app (Vite SPA).
 *
 * Three responsibilities:
 *   1. SEO 301 redirects for legacy URL shapes (so existing Google links
 *      flow into the canonical /bible/<slug>/<chapter> URL).
 *   2. Static asset serving from the Vite build output.
 *   3. SPA fallback to /index.html for any non-asset path so React Router
 *      handles client-side routing.
 *
 * Source-of-truth for slugs: src/lib/bookSlugs.ts (kept in sync — when
 * the canonical map there changes, also update BOOK_SLUGS below).
 */

// MUST stay in sync with src/lib/bookSlugs.ts
const BOOK_SLUGS = {
  1: "genesis", 2: "exodus", 3: "leviticus", 4: "numbers", 5: "deuteronomy",
  6: "joshua", 7: "judges", 8: "ruth", 9: "1-samuel", 10: "2-samuel",
  11: "1-kings", 12: "2-kings", 13: "1-chronicles", 14: "2-chronicles",
  15: "ezra", 16: "nehemiah", 17: "esther", 18: "job", 19: "psalms",
  20: "proverbs", 21: "ecclesiastes", 22: "song-of-solomon", 23: "isaiah",
  24: "jeremiah", 25: "lamentations", 26: "ezekiel", 27: "daniel",
  28: "hosea", 29: "joel", 30: "amos", 31: "obadiah", 32: "jonah",
  33: "micah", 34: "nahum", 35: "habakkuk", 36: "zephaniah", 37: "haggai",
  38: "zechariah", 39: "malachi",
  40: "matthew", 41: "mark", 42: "luke", 43: "john", 44: "acts",
  45: "romans", 46: "1-corinthians", 47: "2-corinthians", 48: "galatians",
  49: "ephesians", 50: "philippians", 51: "colossians",
  52: "1-thessalonians", 53: "2-thessalonians", 54: "1-timothy",
  55: "2-timothy", 56: "titus", 57: "philemon", 58: "hebrews",
  59: "james", 60: "1-peter", 61: "2-peter", 62: "1-john",
  63: "2-john", 64: "3-john", 65: "jude", 66: "revelation",
};

/**
 * Match the same legacy redirects the monorepo's frontend-next does in
 * its Next.js middleware. The two cases:
 *
 *   /?bookId=N&verseId=M[&testament=T]  →  /bible/<slug>/N
 *   /bible/<numeric>/<chapter>          →  /bible/<slug>/<chapter>
 *
 * Returns a Response (301) if the URL matches a legacy shape, or null
 * if no redirect applies.
 */
function checkLegacyRedirects(url) {
  // Case 1: query-param URLs (the OLD shape from before Next.js migration)
  if (url.pathname === "/" && url.searchParams.has("bookId") && url.searchParams.has("verseId")) {
    const bookIdStr = url.searchParams.get("bookId");
    const chapterStr = url.searchParams.get("verseId");
    const testament = url.searchParams.get("testament");

    // Don't redirect topic links — testament=TOPIC has a different shape
    if (testament === "TOPIC") return null;

    const bookId = Number.parseInt(bookIdStr, 10);
    const chapter = Number.parseInt(chapterStr, 10);
    if (
      Number.isNaN(bookId) || Number.isNaN(chapter) ||
      bookId < 1 || bookId > 66 || chapter < 1
    ) {
      return null;
    }
    const slug = BOOK_SLUGS[bookId];
    if (!slug) return null;

    // Preserve any other query params (explanationType, bibleVersion, etc.)
    const preserved = new URLSearchParams();
    for (const [k, v] of url.searchParams.entries()) {
      if (k !== "bookId" && k !== "verseId" && k !== "testament") {
        preserved.append(k, v);
      }
    }
    const qs = preserved.toString();
    const target = `/bible/${slug}/${chapter}${qs ? `?${qs}` : ""}`;
    return Response.redirect(new URL(target, url.origin).toString(), 301);
  }

  // Case 2: numeric ID in /bible path → slug
  const bibleMatch = url.pathname.match(/^\/bible\/(\d+)\/(\d+)\/?$/);
  if (bibleMatch) {
    const bookId = Number.parseInt(bibleMatch[1], 10);
    const chapter = Number.parseInt(bibleMatch[2], 10);
    if (bookId >= 1 && bookId <= 66) {
      const slug = BOOK_SLUGS[bookId];
      if (slug) {
        const target = `/bible/${slug}/${chapter}${url.search}`;
        return Response.redirect(new URL(target, url.origin).toString(), 301);
      }
    }
  }

  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Legacy URL → canonical slug URL (301)
    const redirect = checkLegacyRedirects(url);
    if (redirect) return redirect;

    // 2. Try to serve a static asset
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      return response;
    }

    // 3. SPA fallback for non-asset paths
    if (!url.pathname.includes(".")) {
      const indexRequest = new Request(
        new URL("/index.html", request.url).toString(),
        request,
      );
      return env.ASSETS.fetch(indexRequest);
    }

    return response;
  },
};
