import { ApiUnavailable, type Runtime } from './api';
import type { EdgeConfig, EdgeEnv } from './config';

export const DAY = 24 * 60 * 60;

export interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void;
}

export interface EdgeRequest {
  request: Request;
  env: EdgeEnv;
  url: URL;
  config: EdgeConfig;
  runtime: Runtime;
}

export interface Rendered {
  body: string | ArrayBuffer;
  status: number;
  headers: Record<string, string>;
  fresh: number;
  stale: number;
}

export function reportFailure(error: unknown) {
  if (!(error instanceof ApiUnavailable)) console.error('edge render failed', error);
}
