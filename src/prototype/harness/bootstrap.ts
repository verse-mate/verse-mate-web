import { delay, HttpResponse, http, passthrough } from "msw";
import { setupWorker } from "msw/browser";
import { product } from "../product";
import { answer, BASE, FIXTURE_LATENCY_MS, log, routeOf, sessionWanted, setRoute, UNANSWERED_HEADER } from "./runtime";

const showUnanswered = (line: string) => {
  const banner = document.getElementById("prototype-unanswered") ?? document.createElement("pre");
  banner.id = "prototype-unanswered";
  banner.setAttribute("style", "position:fixed;left:0;right:0;bottom:0;z-index:99999;margin:0;padding:8px;background:#b00020;color:#fff;font:12px monospace;white-space:pre-wrap");
  banner.textContent = `${banner.textContent ?? ""}no fixture: ${line}\n`;
  document.body.appendChild(banner);
};

const start = async () => {
  product.patchWeb?.();
  const route = routeOf(location.pathname);
  setRoute(route);
  if (sessionWanted(route)) product.writeSession((key, value) => localStorage.setItem(key, value));
  Object.assign(globalThis, { __prototype: log });
  const apiBase = product.apiBase(location.origin);
  await setupWorker(
    http.all("*", async ({ request }) => {
      const url = new URL(request.url);
      if (url.origin === location.origin && !url.href.startsWith(apiBase)) return passthrough();
      const result = answer(request.method, url, apiBase);
      if (result.kind === "blocked") return new HttpResponse(null, { status: 204 });
      await delay(FIXTURE_LATENCY_MS);
      if (result.kind === "unanswered") {
        const line = `${request.method} ${url.pathname}`;
        showUnanswered(line);
        return HttpResponse.json({ prototype: "no fixture for this request" }, { status: 501, headers: { [UNANSWERED_HEADER]: line } });
      }
      return HttpResponse.json(result.body as object, { status: result.status });
    }),
  ).start({ serviceWorker: { url: `${BASE}/mockServiceWorker.js`, options: { scope: `${BASE}/` } }, onUnhandledRequest: "bypass", quiet: true });
};

let started: Promise<void> | undefined;

export const startPrototype = () => {
  started ??= start();
  return started;
};
