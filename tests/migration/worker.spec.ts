import { type ChildProcess, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const { beforeAll, afterAll } = test;

const __dirname_local = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname_local, '..', '..');

// Wrangler dev cold-start with vite build + binding setup takes 30–60s.
// Set the hook timeout high so beforeAll doesn't get cut off.
test.describe.configure({ timeout: 180_000 });

/**
 * Phase 3 verification: edge-side 301 redirects served by worker.js.
 *
 * Boots `wrangler dev` against the production build output, then asserts
 * the legacy URL redirects work as the cutover runbook expects. These
 * tests verify the actual worker code paths that go live in Phase 7 —
 * not the React Router fallbacks tested in routes.spec.ts.
 */

const WORKER_PORT = 8789;
const WORKER_URL = `http://localhost:${WORKER_PORT}`;

let wrangler: ChildProcess | null = null;

async function waitForWorker(timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  // Wrangler reports "Ready" before the asset bindings are wired, so we
  // need to wait for an actual successful asset response — not just any
  // response. Probe / until it returns 200 with HTML content.
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(WORKER_URL);
      if (res.status === 200) {
        const text = await res.text();
        if (text.includes('<!DOCTYPE html>')) return;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`wrangler dev did not become ready within ${timeoutMs}ms`);
}

beforeAll(async () => {
  test.setTimeout(180_000);

  // Build the SPA so dist/ exists for ASSETS binding
  const build = spawn('bunx', ['vite', 'build'], {
    cwd: REPO_ROOT,
    shell: true,
    stdio: 'pipe',
  });
  await new Promise<void>((resolve, reject) => {
    build.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`build exit ${code}`))));
  });

  // Boot wrangler dev pointing at the repo's wrangler.jsonc.
  // On Windows, bunx must go through cmd.exe (shell:true), and we use
  // .cmd shim explicitly to avoid PATH resolution surprises.
  const wranglerCmd = process.platform === 'win32' ? 'wrangler.exe' : 'wrangler';
  const localBin = path.join(REPO_ROOT, 'node_modules', '.bin', wranglerCmd);
  wrangler = spawn(
    localBin,
    ['dev', '--config', 'wrangler.jsonc', '--port', String(WORKER_PORT), '--log-level', 'warn'],
    {
      cwd: REPO_ROOT,
      stdio: 'pipe',
    },
  );
  wrangler.stderr?.on('data', (d) => process.stderr.write(`[wrangler] ${d}`));
  wrangler.stdout?.on('data', (d) => process.stdout.write(`[wrangler] ${d}`));
  await waitForWorker();
});

afterAll(() => {
  if (wrangler && !wrangler.killed) {
    wrangler.kill('SIGTERM');
  }
});

test.describe('Phase 3 — edge 301 redirects', () => {
  test('legacy ?bookId=1&verseId=1 → /bible/genesis/1', async () => {
    const res = await fetch(`${WORKER_URL}/?bookId=1&verseId=1`, { redirect: 'manual' });
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toMatch(/\/bible\/genesis\/1$/);
  });

  test('legacy ?bookId=43&verseId=3 (John 3) → /bible/john/3', async () => {
    const res = await fetch(`${WORKER_URL}/?bookId=43&verseId=3`, { redirect: 'manual' });
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toMatch(/\/bible\/john\/3$/);
  });

  test('legacy URL preserves additional query params (explanationType)', async () => {
    const res = await fetch(
      `${WORKER_URL}/?bookId=1&verseId=1&explanationType=detailed&bibleVersion=NASB1995`,
      { redirect: 'manual' },
    );
    expect(res.status).toBe(301);
    const loc = res.headers.get('location') || '';
    expect(loc).toContain('/bible/genesis/1');
    expect(loc).toContain('explanationType=detailed');
    expect(loc).toContain('bibleVersion=NASB1995');
  });

  test('legacy URL strips bookId/verseId/testament from preserved params', async () => {
    const res = await fetch(`${WORKER_URL}/?bookId=1&verseId=1&testament=OT&foo=bar`, {
      redirect: 'manual',
    });
    expect(res.status).toBe(301);
    const loc = res.headers.get('location') || '';
    expect(loc).not.toContain('bookId=');
    expect(loc).not.toContain('verseId=');
    expect(loc).not.toContain('testament=');
    expect(loc).toContain('foo=bar');
  });

  test('testament=TOPIC URL is NOT redirected (different shape)', async () => {
    const res = await fetch(`${WORKER_URL}/?bookId=1&verseId=1&testament=TOPIC`, {
      redirect: 'manual',
    });
    // Should pass through to SPA, not 301 — testament=TOPIC means topic
    // link, which has different routing semantics
    expect(res.status).not.toBe(301);
  });

  test('numeric /bible/1/1 → /bible/genesis/1', async () => {
    const res = await fetch(`${WORKER_URL}/bible/1/1`, { redirect: 'manual' });
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toMatch(/\/bible\/genesis\/1$/);
  });

  test('numeric /bible/66/22 (Revelation 22) → /bible/revelation/22', async () => {
    const res = await fetch(`${WORKER_URL}/bible/66/22`, { redirect: 'manual' });
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toMatch(/\/bible\/revelation\/22$/);
  });

  test('out-of-range book id (67) is NOT redirected', async () => {
    const res = await fetch(`${WORKER_URL}/bible/67/1`, { redirect: 'manual' });
    // Should fall through to SPA (which renders NotFound)
    expect(res.status).not.toBe(301);
  });

  test('slug URL /bible/genesis/1 is NOT redirected (already canonical)', async () => {
    const res = await fetch(`${WORKER_URL}/bible/genesis/1`, { redirect: 'manual' });
    expect(res.status).not.toBe(301);
  });

  test('SPA fallback: arbitrary path resolves to index.html', async () => {
    // wrangler dev mode 307s non-asset paths to / (then / serves index.html);
    // real CF Workers run our worker.js fallback which returns index.html
    // directly as 200. Both end-states are correct for SPA routing — the
    // user lands on index.html either way.
    const res = await fetch(`${WORKER_URL}/some/random/path`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('<!DOCTYPE html>');
  });

  test('root path serves index.html', async () => {
    const res = await fetch(`${WORKER_URL}/`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('<!DOCTYPE html>');
  });

  test('paths with extensions return their actual response (no SPA fallback)', async () => {
    const res = await fetch(`${WORKER_URL}/missing-asset.js`, { redirect: 'manual' });
    // Worker explicitly returns the 404 for paths with extensions
    expect(res.status).toBe(404);
  });
});
