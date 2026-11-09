// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import worker from '../../worker.js';
import { context, edgeEnv, fakeAssets, fakeData, installEdgeGlobals } from './testing/fakeEdge';

afterEach(() => vi.unstubAllGlobals());

const publicFile = (name: string) => readFileSync(join(__dirname, '../../public', name));

function env() {
  return edgeEnv({
    ASSETS: fakeAssets({
      '/versemate-logo-white.png': () => new Response(publicFile('versemate-logo-white.png'), { headers: { 'content-type': 'image/png' } }),
      '/og/default.png': () => new Response(publicFile('og/default.png'), { headers: { 'content-type': 'image/png' } }),
    }),
  });
}

async function card(path: string) {
  const ctx = context();
  const response = await worker.fetch(new Request(`https://app.versemate.org${path}`), env(), ctx);
  const bytes = new Uint8Array(await response.arrayBuffer());
  await ctx.settle();
  const view = new DataView(bytes.buffer, bytes.byteOffset);
  const isPng = bytes.length > 24 && [...bytes.slice(0, 8)].join(',') === '137,80,78,71,13,10,26,10';
  return { response, bytes, isPng, width: isPng ? view.getUint32(16) : 0, height: isPng ? view.getUint32(20) : 0 };
}

describe('chapter share cards', () => {
  it('are 1200 by 630 PNGs, in the page language', async () => {
    installEdgeGlobals();

    const english = await card('/og/bible/john/3.png');
    const spanish = await card('/og/bible/john/3.png?lang=es-MX');

    expect(english.response.status).toBe(200);
    expect(english.response.headers.get('content-type')).toBe('image/png');
    expect(english.isPng).toBe(true);
    expect([english.width, english.height]).toEqual([1200, 630]);
    expect([spanish.width, spanish.height]).toEqual([1200, 630]);
    expect(Buffer.from(spanish.bytes).equals(Buffer.from(english.bytes))).toBe(false);
  }, 30_000);

  it('are kept in the edge cache like the pages', async () => {
    const { api } = installEdgeGlobals();

    const first = await card('/og/bible/john/3.png');
    const calls = api.calls.length;
    const second = await card('/og/bible/john/3.png');

    expect(api.calls.length).toBe(calls);
    expect(Buffer.from(second.bytes).equals(Buffer.from(first.bytes))).toBe(true);
  }, 30_000);

  it('do not exist for a chapter that does not exist', async () => {
    installEdgeGlobals();

    expect((await card('/og/bible/john/999.png')).response.status).toBe(404);
    expect((await card('/og/bible/notabook/1.png')).response.status).toBe(404);
  });

  it('fall back to the default card when the API is down, without keeping it', async () => {
    const { cache } = installEdgeGlobals(fakeData({ down: true }));

    const fallback = await card('/og/bible/john/3.png');

    expect(fallback.response.status).toBe(200);
    expect(Buffer.from(fallback.bytes).equals(publicFile('og/default.png'))).toBe(true);
    expect([...cache.entries.keys()].some((key) => key.includes('/og/'))).toBe(false);
  });
});
