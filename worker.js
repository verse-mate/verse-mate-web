import { BOOK_SLUGS } from "./src/lib/bookSlugs.ts";
import { handleEdge } from "./src/edge/handler.ts";

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

// Bible-study visuals are hosted on DigitalOcean Spaces + CDN, not bundled
// into the app. registry.ts still uses root-relative `/visuals/...` paths, and
// older mobile builds fetch them from app.versemate.org, so every `/visuals/*`
// request is redirected to the Spaces CDN. 302 (not 301) so the origin can be
// changed later without poisoning browser caches.
const VISUALS_CDN_ORIGIN = "https://versemate.nyc3.cdn.digitaloceanspaces.com";

const SSO_CALLBACK_PATH = /^\/auth\/callback(\/|$)/;

const PRODUCTION_HOST = "app.versemate.org";

const PRIVATE_SCREEN =
  /^\/(notes|bookmarks|highlights|menu|login|logout|create-account|auth|email-verified|coach)(\/|$)/;

const APP_LINK_FILES = new Set([
  "/.well-known/apple-app-site-association",
  "/.well-known/assetlinks.json",
]);

function withHeaders(response, extra) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(extra)) headers.set(name, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function serveAppLinkFile(request, env) {
  const response = await env.ASSETS.fetch(request);
  const isHtml = (response.headers.get("content-type") || "").includes("text/html");
  if (response.status === 404 || isHtml) {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return withHeaders(response, { "content-type": "application/json" });
}

async function serveApp(request, env, url) {
  const response = await env.ASSETS.fetch(request);
  if (response.status !== 404) {
    return response;
  }

  if (!url.pathname.includes(".")) {
    const indexRequest = new Request(
      new URL("/index.html", request.url).toString(),
      request,
    );
    return env.ASSETS.fetch(indexRequest);
  }

  return response;
}

async function route(request, env, url, ctx) {
  if (APP_LINK_FILES.has(url.pathname)) return serveAppLinkFile(request, env);

  const response = (await handleEdge(request, env, url, ctx)) ?? (await serveApp(request, env, url));
  return SSO_CALLBACK_PATH.test(url.pathname)
    ? withHeaders(response, { "Referrer-Policy": "no-referrer" })
    : response;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 0. Visuals are served from the Spaces CDN, not this app's bundle.
    if (url.pathname.startsWith("/visuals/")) {
      return Response.redirect(VISUALS_CDN_ORIGIN + url.pathname, 302);
    }

    // 1. Legacy URL → canonical slug URL (301)
    const redirect = checkLegacyRedirects(url);
    if (redirect) return redirect;

    const response = await route(request, env, url, ctx);
    return url.hostname === PRODUCTION_HOST && !PRIVATE_SCREEN.test(url.pathname)
      ? response
      : withHeaders(response, { "X-Robots-Tag": "noindex" });
  },
};
