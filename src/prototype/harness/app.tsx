import { type ComponentType, lazy, Suspense, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { productUi } from "../product-ui";
import { startPrototype } from "./bootstrap";
import { routeOfPage } from "./routes";
import { READY_ATTRIBUTE, routeOf, setRoute, stateFor } from "./runtime";

type Pages = Record<string, () => Promise<unknown>>;

const NAVIGATED = "prototype:navigated";

for (const method of ["pushState", "replaceState"] as const) {
  const original = history[method].bind(history);
  history[method] = (...args: Parameters<History["pushState"]>) => {
    original(...args);
    dispatchEvent(new Event(NAVIGATED));
  };
}

const onNavigate = (notify: () => void) => {
  addEventListener("popstate", notify);
  addEventListener(NAVIGATED, notify);
  return () => {
    removeEventListener("popstate", notify);
    removeEventListener(NAVIGATED, notify);
  };
};

function Shown({ path }: { path: string }) {
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    productUi.applyVariant?.({ theme: params.get("theme") ?? undefined, locale: params.get("locale") ?? undefined });
    productUi.onStateChange?.();
    const state = stateFor(path);
    if (state) document.documentElement.setAttribute(READY_ATTRIBUTE, state.id);
    return () => document.documentElement.removeAttribute(READY_ATTRIBUTE);
  }, [path]);
  return null;
}

export function PrototypeApp({ dir, pages }: { dir: string; pages: Pages }) {
  const path = useSyncExternalStore(onNavigate, () => routeOf(location.pathname));
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState("");
  useEffect(() => {
    startPrototype().then(
      () => setReady(true),
      (e: unknown) => {
        console.error("[prototype] the mock worker did not start", e);
        setFailed(e instanceof Error ? e.message : String(e));
      },
    );
  }, []);
  const Screen = useMemo(() => {
    const key = Object.keys(pages).find((k) => routeOfPage(dir, k) === path);
    return key ? lazy(pages[key] as () => Promise<{ default: ComponentType }>) : undefined;
  }, [dir, pages, path]);
  setRoute(path);
  if (failed) return <pre role="alert">{failed}</pre>;
  if (!ready) return null;
  if (!Screen) return <p role="alert">No prototype state at {path}</p>;
  return (
    <productUi.Providers>
      <Suspense fallback={null}>
        <Screen />
        <Shown path={path} />
      </Suspense>
    </productUi.Providers>
  );
}
