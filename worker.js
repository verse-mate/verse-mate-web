/**
 * Cloudflare Worker for serving the VerseMate web app (Vite SPA).
 *
 * Serves built static assets first; for any non-asset path without a file
 * extension, falls back to /index.html so React Router handles client-side
 * routing. Phase 3 will add legacy URL → slug 301 redirects here.
 */

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);

    if (response.status !== 404) {
      return response;
    }

    const url = new URL(request.url);
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
