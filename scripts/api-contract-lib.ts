import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

export type Document = { openapi?: string; paths?: Record<string, Record<string, unknown>> } & Record<string, unknown>;

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

export function normalise(document: unknown): string {
  return `${JSON.stringify(sortKeys(document), null, 2)}\n`;
}

export function parseDocument(text: string, source: string): Document {
  let document: Document;
  try {
    document = JSON.parse(text) as Document;
  } catch (error) {
    throw new Error(`${source} is not valid JSON: ${String(error)}`);
  }
  if (typeof document?.openapi !== 'string' || !document.paths || typeof document.paths !== 'object') {
    throw new Error(`${source} is not an OpenAPI document (no openapi version or paths)`);
  }
  return document;
}

export const FETCH_TIMEOUT_MS = 30_000;

export type Fetcher = (url: string, init: RequestInit) => Promise<Response>;

export async function fetchDocument(url: string, fetcher: Fetcher = fetch): Promise<Document> {
  let response: Response;
  try {
    response = await fetcher(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    throw new Error(`could not fetch ${url}: ${String(error)}`);
  }
  if (response.status !== 200) throw new Error(`${url} answered HTTP ${response.status}`);
  return parseDocument(await response.text(), url);
}

function operations(document: Document): Map<string, string> {
  const result = new Map<string, string>();
  for (const [path, item] of Object.entries(document.paths ?? {})) {
    for (const method of METHODS) {
      if (item && method in item) result.set(`${method.toUpperCase()} ${path}`, JSON.stringify(sortKeys(item[method])));
    }
  }
  return result;
}

function topLevelDifferences(snapshot: Document, production: Document): string[] {
  const keys = new Set([...Object.keys(snapshot), ...Object.keys(production)]);
  keys.delete('paths');
  const before = snapshot as Record<string, unknown>;
  const after = production as Record<string, unknown>;
  return [...keys].sort().filter((key) => JSON.stringify(sortKeys(before[key])) !== JSON.stringify(sortKeys(after[key])));
}

export function describeDrift(snapshot: Document, production: Document): string[] {
  const before = operations(snapshot);
  const after = operations(production);
  const lines: string[] = [];
  for (const key of [...after.keys()].sort()) {
    if (!before.has(key)) lines.push(`added    ${key}`);
    else if (before.get(key) !== after.get(key)) lines.push(`changed  ${key}`);
  }
  for (const key of [...before.keys()].sort()) {
    if (!after.has(key)) lines.push(`removed  ${key}`);
  }
  for (const key of topLevelDifferences(snapshot, production)) lines.push(`changed  top-level ${key}`);
  return lines;
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function listFiles(dir: string): string[] {
  return walk(dir)
    .map((path) => relative(dir, path))
    .sort();
}

export function compareTrees(expected: string, actual: string): string[] {
  const want = listFiles(expected);
  const have = listFiles(actual);
  const differences: string[] = [];
  for (const file of want) {
    if (!have.includes(file)) differences.push(`missing  ${file}`);
    else if (!readFileSync(join(expected, file)).equals(readFileSync(join(actual, file)))) differences.push(`differs  ${file}`);
  }
  for (const file of have) if (!want.includes(file)) differences.push(`extra    ${file}`);
  return differences;
}

