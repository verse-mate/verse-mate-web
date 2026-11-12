import type { CapturedNetworkRequest, CaptureResult } from 'posthog-js';
import { boundCampaignValue } from './firstTouch';

export const REPLAY_BLOCK_CLASS = 'ph-no-capture';

const URL_KEY = /(^\$?|_)(url|referrer|href)$/i;
const CAMPAIGN_KEY = /(^|_)utm_(source|medium|campaign|content|term)$/;
const SEARCH_KEYWORD = /(^|_)ph_keyword$/;
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
  'check',
  'classes',
  'coaches',
  'completion',
  'coverage',
  'dimensions',
  'email',
  'feedback',
  'first-lesson',
  'improvements',
  'leader',
  'leaders',
  'learners',
  'learning',
  'lessons',
  'manage',
  'me',
  'modules',
  'monthly',
  'monthly-summary',
  'not-teaching',
  'notes',
  'notetaker',
  'pipeline-failures',
  'preview',
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
  'status',
  'summary',
  'transcript-url',
  'trends',
  'zoom',
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
  if (typeof value === 'string' && CAMPAIGN_KEY.test(key)) return boundCampaignValue(value);
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
  for (const key of Object.keys(out)) if (SEARCH_KEYWORD.test(key)) delete out[key];
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

const INITIAL_PERSON_INFO = '$initial_person_info';
const LEGACY_INITIAL_INFO = ['$initial_campaign_params', '$initial_referrer_info'];
const LANDING_CAMPAIGN_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gad_source'];
const DIRECT = '$direct';
const STORED_LIMIT = 1000;

type StoredPersonInfo = { r?: string; u?: string };

export type InitialInfoStore = {
  props: Record<string, unknown>;
  register(props: Record<string, unknown>): boolean;
};

function parseUrl(url: string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

export function scrubLandingUrl(url: string): string | undefined {
  const parsed = parseUrl(url);
  if (!parsed) return undefined;
  const kept = new URLSearchParams();
  for (const key of LANDING_CAMPAIGN_PARAMS) {
    const value = parsed.searchParams.get(key);
    if (value) kept.set(key, boundCampaignValue(value));
  }
  const query = kept.toString();
  return `${scrubText(`${parsed.origin}${parsed.pathname}`, true)}${query ? `?${query}` : ''}`.slice(0, STORED_LIMIT);
}

function scrubReferrer(referrer: string): string | undefined {
  if (referrer === DIRECT) return referrer;
  const parsed = parseUrl(referrer);
  return parsed && scrubText(`${parsed.origin}${parsed.pathname}`, true).slice(0, STORED_LIMIT);
}

function scrubPersonInfo(info: Record<string, unknown>): StoredPersonInfo {
  return {
    r: typeof info.r === 'string' ? scrubReferrer(info.r) : undefined,
    u: typeof info.u === 'string' ? scrubLandingUrl(info.u) : undefined,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function scrubStoredInitialInfo(store: InitialInfoStore | undefined, win: Window): void {
  if (!store) return;
  const scrubbed: Record<string, unknown> = {};
  for (const key of LEGACY_INITIAL_INFO) {
    const value = store.props[key];
    if (isRecord(value)) scrubbed[key] = scrubProperties(value);
  }
  const hasLegacyRecord = Object.keys(scrubbed).length > 0;
  const stored = store.props[INITIAL_PERSON_INFO];
  if (stored !== undefined || !hasLegacyRecord) {
    const info = isRecord(stored) ? stored : { r: win.document.referrer || DIRECT, u: win.location.href };
    scrubbed[INITIAL_PERSON_INFO] = scrubPersonInfo(info);
  }
  const changed = Object.entries(scrubbed).filter(
    ([key, value]) => JSON.stringify(store.props[key]) !== JSON.stringify(value),
  );
  if (changed.length > 0) store.register(Object.fromEntries(changed));
}
