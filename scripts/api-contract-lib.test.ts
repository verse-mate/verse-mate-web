// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { compareTrees, describeDrift, fetchDocument, parseDocument, type Document } from './api-contract-lib';

const doc = (paths: Document['paths'], extra: Record<string, unknown> = {}): Document => ({ openapi: '3.1.0', paths, ...extra });

describe('the production comparison', () => {
  it('names the operations added, changed and removed', () => {
    const before = doc({ '/a': { get: { summary: 'a' } }, '/b': { post: { summary: 'b' } } });
    const after = doc({ '/a': { get: { summary: 'a2' } }, '/c': { get: {} } });
    expect(describeDrift(before, after)).toEqual(['changed  GET /a', 'added    GET /c', 'removed  POST /b']);
  });

  it('names the top-level parts that differ outside the operations', () => {
    const before = doc({ '/a': { get: {} } }, { servers: [{ url: 'https://x' }], components: {} });
    const after = doc({ '/a': { get: {} } }, { servers: [{ url: 'https://y' }], components: { schemas: {} }, openapi: '3.1.1' });
    expect(describeDrift(before, after)).toEqual(['changed  top-level components', 'changed  top-level openapi', 'changed  top-level servers']);
  });

  it('finds nothing for the same document', () => {
    const same = doc({ '/a': { get: { summary: 'a' } } });
    expect(describeDrift(same, structuredClone(same))).toEqual([]);
  });
});

describe('reading a document', () => {
  it('refuses text that is not JSON', () => {
    expect(() => parseDocument('<html>', 'prod')).toThrow('prod is not valid JSON');
  });

  it('refuses JSON that is not an OpenAPI document', () => {
    expect(() => parseDocument('{"paths":{}}', 'prod')).toThrow('not an OpenAPI document');
    expect(() => parseDocument('{"openapi":"3.1.0"}', 'prod')).toThrow('not an OpenAPI document');
  });

  it('fails on an answer other than 200', async () => {
    const fetcher = async () => new Response('down', { status: 503 });
    await expect(fetchDocument('https://api.test/openapi/json', fetcher)).rejects.toThrow('answered HTTP 503');
  });
});

describe('comparing generated trees', () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  function tree(files: Record<string, string>) {
    const dir = mkdtempSync(join(tmpdir(), 'contract-tree-'));
    dirs.push(dir);
    for (const [name, text] of Object.entries(files)) {
      mkdirSync(join(dir, name, '..'), { recursive: true });
      writeFileSync(join(dir, name), text);
    }
    return dir;
  }

  it('lists files missing, differing and extra', () => {
    const expected = tree({ 'a.ts': '1', 'b/c.ts': '2', 'd.ts': '4' });
    const actual = tree({ 'a.ts': '1', 'b/c.ts': '3', 'e.ts': '5' });
    expect(compareTrees(expected, actual)).toEqual(['differs  b/c.ts', 'missing  d.ts', 'extra    e.ts']);
  });
});
