import type { CapturedNetworkRequest, CaptureResult } from 'posthog-js';

export const REPLAY_BLOCK_CLASS = 'ph-no-capture';

const URL_PROPERTIES = ['$current_url', '$referrer', '$initial_current_url', '$initial_referrer'];
const QUERY_PROPERTIES = ['search', '$search'];
const MINTED_ADDRESS = /\/(recording|transcript)-url$/;

export function stripQuery(url: string): string {
  return url.split(/[?#]/)[0];
}

function scrubProperties<T extends Record<string, unknown> | undefined>(props: T): T {
  if (!props) return props;
  const out: Record<string, unknown> = { ...props };
  for (const key of URL_PROPERTIES) {
    if (typeof out[key] === 'string') out[key] = stripQuery(out[key] as string);
  }
  for (const key of QUERY_PROPERTIES) delete out[key];
  return out as T;
}

export function scrubEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event) return event;
  return {
    ...event,
    properties: scrubProperties(event.properties),
    ...(event.$set ? { $set: scrubProperties(event.$set) } : {}),
    ...(event.$set_once ? { $set_once: scrubProperties(event.$set_once) } : {}),
  };
}

export function scrubNetworkRequest(request: CapturedNetworkRequest): CapturedNetworkRequest {
  const name = stripQuery(request.name ?? '');
  return {
    ...request,
    name,
    ...(MINTED_ADDRESS.test(name) ? { responseBody: null } : {}),
  };
}
