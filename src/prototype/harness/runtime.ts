import issues from "../issues";
import { product } from "../product";

export type FixtureSet = Record<string, unknown>;
type StateEntry = { id: string; route: string; fixtures: string; setup: string[] };
type Answer = { kind: "answered"; status: number; body: unknown } | { kind: "unanswered" } | { kind: "blocked" };

export const UNANSWERED_HEADER = "x-prototype-unanswered";
export const READY_ATTRIBUTE = "data-prototype-state";
export const FIXTURE_LATENCY_MS = 150;
export const BASE = (import.meta.env.BASE_URL ?? "").replace(/\/$/, "");
const MEDIA = "/prototype-media/";
export const log = { answered: [] as string[], unanswered: [] as string[], blocked: [] as string[] };

const states: StateEntry[] = issues.flatMap((issue) =>
  issue.manifest.screens.flatMap((screen: { name: string; states: { name: string; route: string; fixtures: string; setup?: string[] }[] }) =>
    screen.states.map((s) => ({ id: `${screen.name}/${s.name}`, route: s.route, fixtures: s.fixtures, setup: s.setup ?? [] })),
  ),
);

let currentRoute = "/";

export const setRoute = (path: string) => {
  currentRoute = path;
};

export const stateFor = (path: string) => states.find((s) => s.route === path);

export const routeOf = (pathname: string) => pathname.slice(BASE.length).replace(/\/$/, "") || "/";

const fixtureSet = (path: string): FixtureSet => {
  const state = stateFor(path);
  const own = state ? issues.map((i) => i.fixtures[state.fixtures]).find(Boolean) : undefined;
  return { ...product.shellFixtures, ...(own ?? {}) };
};

const matches = (pattern: string, path: string) => {
  const want = pattern.split("/");
  const got = path.split("/");
  return want.length === got.length && want.every((part, i) => part.startsWith(":") || part === got[i]);
};

export const answer = (method: string, url: URL, apiBase: string): Answer => {
  if (!url.href.startsWith(apiBase)) {
    log.blocked.push(`${method} ${url.href}`);
    return { kind: "blocked" };
  }
  const path = url.pathname.slice(new URL(apiBase).pathname.replace(/\/$/, "").length) || "/";
  const set = fixtureSet(currentRoute);
  const key = Object.keys(set).find((k) => {
    const [m, p] = k.split(" ");
    return m === method && matches(p, path);
  });
  if (!key) {
    log.unanswered.push(`${method} ${path}`);
    return { kind: "unanswered" };
  }
  log.answered.push(key);
  const value = set[key] as { $status?: number; $body?: unknown } | null;
  const shaped = value !== null && typeof value === "object" && "$status" in value;
  const body = shaped ? value.$body : value;
  return { kind: "answered", status: shaped ? Number(value.$status) : 200, body: BASE ? JSON.parse(JSON.stringify(body ?? null).replaceAll(`"${MEDIA}`, `"${BASE}${MEDIA}`)) : body };
};

export const sessionWanted = (path: string) => !(stateFor(path)?.setup.includes("signed-out"));
