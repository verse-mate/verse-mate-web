import type { CapturedNetworkRequest, CaptureResult } from 'posthog-js';

export const REPLAY_BLOCK_CLASS = 'ph-no-capture';

const URL_KEY = /(^\$?|_)(url|referrer|href)$/i;
const QUERY_PROPERTIES = ['search', '$search'];
const EMBEDDED_QUERY = /((?:https?:\/\/|href=")[^\s"'?#\\()<>[\]]*)(?:[?#][^\s"'\\()<>[\]]*)?/g;
const TEXT_TOKEN = /[^\s"'`\\()<>[\]]+/g;
const PATH_START = /^\/|[=:]\//;
const GOOGLE_FILE_LINK = /(https?:\/\/(?:docs|drive|drive\.usercontent)\.google\.com)(?=[/?#\s"'\\()<>[\]]|$)[^\s"'\\()<>[\]]*/gi;
const COACH_PATH = /\/coach((?:\/[^/?#\s"'<>\\]+)+)/gi;
const COACH_WORDS = new Set([
  'admin',
  'affiliated-church',
  'amend',
  'attribute',
  'attribution',
  'bible-coach',
  'classes',
  'coaches',
  'coverage',
  'dimensions',
  'email',
  'feedback',
  'first-lesson',
  'improvements',
  'leader',
  'leaders',
  'manage',
  'me',
  'monthly',
  'monthly-summary',
  'not-teaching',
  'notes',
  'pipeline-failures',
  'recording',
  'recording-url',
  'release',
  'reports',
  'requeue',
  'reshares',
  'resolve',
  'review',
  'revision',
  'revisions',
  'rubric',
  'send',
  'sessions',
  'settings',
  'summary',
  'transcript-url',
  'trends',
  'zoom-link',
]);

export function stripQuery(url: string): string {
  return url.split(/[?#]/)[0];
}

function stripRelativeQuery(token: string): string {
  const cut = token.search(/[?#]/);
  return cut > 0 && PATH_START.test(token.slice(0, cut)) ? token.slice(0, cut) : token;
}

function stripEmbeddedQueries(text: string): string {
  return text.replace(EMBEDDED_QUERY, '$1').replace(TEXT_TOKEN, stripRelativeQuery);
}

function scrubText(text: string, isUrl = false): string {
  return scrubCoachPath((isUrl ? stripQuery(text) : stripEmbeddedQueries(text)).replace(GOOGLE_FILE_LINK, '$1'));
}

export function scrubCoachPath(text: string): string {
  return text.replace(
    COACH_PATH,
    (_match, rest: string) => `/coach${rest.replace(/[^/]+/g, (segment) => (COACH_WORDS.has(segment) ? segment : ':id'))}`,
  );
}

function scrubValue(value: unknown, key = ''): unknown {
  if (typeof value === 'string') return scrubText(value, URL_KEY.test(key));
  if (Array.isArray(value)) return value.map((v) => scrubValue(v, key));
  if (value && typeof value === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scrubValue(v, k)]));
  }
  return value;
}

function scrubHeatmap(data: Record<string, unknown[]>): Record<string, unknown[]> {
  const out: Record<string, unknown[]> = {};
  for (const [url, points] of Object.entries(data)) {
    if (Array.isArray(points)) (out[scrubText(url, true)] ??= []).push(...points);
  }
  return out;
}

function scrubProperties<T extends Record<string, unknown> | undefined>(props: T): T {
  if (!props) return props;
  const out = scrubValue(props) as Record<string, unknown>;
  for (const key of QUERY_PROPERTIES) delete out[key];
  if (out.$heatmap_data) out.$heatmap_data = scrubHeatmap(out.$heatmap_data as Record<string, unknown[]>);
  return out as T;
}

export function scrubEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event) return event;
  try {
    return {
      ...event,
      properties: scrubProperties(event.properties),
      ...(event.$set ? { $set: scrubProperties(event.$set) } : {}),
      ...(event.$set_once ? { $set_once: scrubProperties(event.$set_once) } : {}),
    };
  } catch {
    return null;
  }
}

export function scrubNetworkRequest(request: CapturedNetworkRequest): CapturedNetworkRequest {
  return { ...request, name: scrubText(request.name ?? '', true), requestBody: null, responseBody: null };
}
