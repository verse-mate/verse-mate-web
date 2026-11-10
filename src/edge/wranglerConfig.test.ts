// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { parseJsonc } from '../../scripts/jsonc';
import { LANGUAGES } from './config';

type Vars = Record<string, unknown>;
type Wrangler = { vars: Vars; workers_dev?: boolean; env: Record<string, { vars?: Vars; workers_dev?: boolean }> };

const wrangler = parseJsonc<Wrangler>(readFileSync(join(__dirname, '../../wrangler.jsonc'), 'utf8'));
const SHARED = ['INDEXED_LANGUAGES', 'EDGE_RENDER', 'API_URL'];

describe('wrangler.jsonc', () => {
  it('repeats the edge variables identically in every environment', () => {
    expect(Object.keys(wrangler.env).length).toBeGreaterThan(0);
    for (const [name, env] of Object.entries(wrangler.env)) {
      for (const key of SHARED) expect(env.vars?.[key], `${name}.${key}`).toEqual(wrangler.vars[key]);
    }
  });

  it('publishes only languages the edge knows', () => {
    const lists = [wrangler.vars.INDEXED_LANGUAGES, ...Object.values(wrangler.env).map((env) => env.vars?.INDEXED_LANGUAGES)];
    for (const list of lists) {
      expect(Array.isArray(list)).toBe(true);
      for (const code of list as string[]) expect(LANGUAGES, code).toContain(code);
    }
  });

  it('keeps production off its workers.dev hostname', () => {
    expect(wrangler.env.production.workers_dev).toBe(false);
  });
});
