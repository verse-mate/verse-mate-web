import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseJsonc } from './jsonc';

export const HOST = 'app.versemate.org';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS_PER_SUBMISSION = 10_000;

export type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;
type Result = { ok: boolean; status: number; detail?: string };
type Wrangler = { vars?: Record<string, unknown>; env?: Record<string, { vars?: Record<string, unknown> }> };

function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim());
  if (typeof value === 'string') {
    try {
      return asList(JSON.parse(value));
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

export function publishedLanguages(wranglerSource: string, env = 'production') {
  const config = parseJsonc<Wrangler>(wranglerSource);
  return asList(config.env?.[env]?.vars?.INDEXED_LANGUAGES ?? config.vars?.INDEXED_LANGUAGES);
}

export function newlyPublished(previous: string[], current: string[]) {
  return current.filter((lang) => !previous.includes(lang));
}

export const urlsFromSitemap = (xml: string) =>
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    match[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&'),
  );

type Wait = (ms: number) => Promise<void>;
const sleep: Wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const READ_TIMEOUT_MS = 60_000;

async function readText(url: string, fetcher: Fetcher) {
  const response = await fetcher(url, { signal: AbortSignal.timeout(READ_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const type = response.headers.get('content-type') ?? 'no content type';
  if (!/\b(application|text)\/xml\b/.test(type)) throw new Error(`${url}: not a sitemap (${type})`);
  return response.text();
}

async function readSitemap(url: string, fetcher: Fetcher) {
  return urlsFromSitemap(await readText(url, fetcher));
}

const messageOf = (failure: unknown) => (failure instanceof Error ? failure.message : String(failure));

const childrenOf = (index: string[], lang: string) => index.filter((child) => child.endsWith(`-${lang}.xml`));

async function readPublished(languages: string[], fetcher: Fetcher) {
  const index = await readSitemap(`https://${HOST}/sitemap.xml`, fetcher);
  const missing = languages.filter((lang) => childrenOf(index, lang).length === 0);
  if (missing.length > 0) throw new Error(`the sitemap index lists no sitemap for ${missing.join(', ')}`);
  const urls: string[] = [];
  for (const lang of languages) {
    const found: string[] = [];
    for (const child of childrenOf(index, lang)) found.push(...(await readSitemap(child, fetcher)));
    if (found.length === 0) throw new Error(`the sitemaps of ${lang} list no URLs`);
    urls.push(...found);
  }
  return urls;
}

export async function urlsForLanguages(
  languages: string[],
  fetcher: Fetcher,
  { wait = sleep, attempts = 20, intervalMs = 15_000 }: { wait?: Wait; attempts?: number; intervalMs?: number } = {},
) {
  let reason = '';
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await readPublished(languages, fetcher);
    } catch (failure) {
      reason = messageOf(failure);
    }
    if (attempt < attempts) await wait(intervalMs);
  }
  throw new Error(`${reason} after ${attempts} reads`);
}

export async function submitToIndexNow({ key, urls, fetcher }: { key: string; urls: string[]; fetcher: Fetcher }): Promise<Result> {
  let last: Result = { ok: true, status: 0 };
  for (let start = 0; start < urls.length; start += MAX_URLS_PER_SUBMISSION) {
    try {
      const response = await fetcher(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: HOST,
          key,
          keyLocation: `https://${HOST}/${key}.txt`,
          urlList: urls.slice(start, start + MAX_URLS_PER_SUBMISSION),
        }),
      });
      if (!response.ok) return { ok: false, status: response.status, detail: (await response.text()).slice(0, 500) };
      last = { ok: true, status: response.status };
    } catch (error) {
      return { ok: false, status: 0, detail: String(error) };
    }
  }
  return last;
}

export function keyIn(publicDir: string) {
  const files = readdirSync(publicDir).filter((name) => /^[0-9a-f]{32}\.txt$/.test(name));
  if (files.length !== 1) throw new Error(`indexnow: expected one <32 hex>.txt key file in ${publicDir}, found ${files.length}`);
  return files[0].replace(/\.txt$/, '');
}

const USAGE =
  'usage: bun scripts/indexnow.ts changed <previous wrangler.jsonc> <current wrangler.jsonc> | all <current wrangler.jsonc> | recent <current wrangler.jsonc> --days <n> [--dry-run]';

export const datedUrlsFromSitemap = (xml: string) =>
  [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>)?/g)].map((match) => ({
    url: urlsFromSitemap(`<loc>${match[1]}</loc>`)[0],
    lastmod: match[2]?.slice(0, 10),
  }));

function windowStart(now: Date, days: number) {
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return start.toISOString().slice(0, 10);
}

async function recentUrls(languages: string[], since: string, fetcher: Fetcher) {
  const failures: string[] = [];
  const urls: string[] = [];
  let index: string[];
  try {
    index = urlsFromSitemap(await readText(`https://${HOST}/sitemap.xml`, fetcher));
  } catch (failure) {
    return { urls, failures: [messageOf(failure)] };
  }
  for (const lang of languages) {
    const children = childrenOf(index, lang);
    if (children.length === 0) failures.push(`the sitemap index lists no sitemap for ${lang}`);
    for (const child of children) {
      try {
        const entries = datedUrlsFromSitemap(await readText(child, fetcher));
        const undated = entries.filter((entry) => !entry.lastmod).length;
        if (undated > 0) failures.push(`${child}: ${undated} of ${entries.length} URLs have no lastmod`);
        for (const entry of entries) {
          if (entry.lastmod && entry.lastmod >= since) urls.push(entry.url);
        }
      } catch (failure) {
        failures.push(messageOf(failure));
      }
    }
  }
  return { urls, failures };
}

async function runRecent(
  file: string,
  flags: string[],
  { fetcher, publicDir, log, error, now }: { fetcher: Fetcher; publicDir: string; log: (line: string) => void; error: (line: string) => void; now: Date },
) {
  const daysAt = flags.indexOf('--days');
  const days = Number(flags[daysAt + 1]);
  if (daysAt < 0 || !Number.isInteger(days) || days < 1) {
    error(USAGE);
    return 1;
  }
  const dryRun = flags.includes('--dry-run');
  const languages = publishedLanguages(readFileSync(file, 'utf8'));
  if (languages.length === 0) {
    error(`indexnow: ${file} publishes no language, nothing to read`);
    return 1;
  }
  const since = windowStart(now, days);
  const { urls, failures } = await recentUrls(languages, since, fetcher);
  for (const failure of failures) error(`indexnow: ${failure}`);

  let submitted = true;
  if (urls.length === 0) {
    const scope = failures.length > 0 ? 'in the sitemaps that could be read' : `for ${HOST} (${languages.join(', ')})`;
    log(`indexnow: no URL changed since ${since} ${scope}, nothing to submit`);
  } else if (dryRun) {
    log(`indexnow: dry run, would submit ${urls.length} URLs changed since ${since}:`);
    for (const url of urls) log(`  ${url}`);
  } else {
    const result = await submitToIndexNow({ key: keyIn(publicDir), urls, fetcher });
    const line = `indexnow: ${urls.length} URLs changed since ${since} for ${HOST} (${languages.join(', ')}), HTTP ${result.status}`;
    if (result.ok) log(line);
    else error(`${line}, submission failed: ${result.detail ?? ''}`);
    submitted = result.ok;
  }
  return submitted && failures.length === 0 ? 0 : 1;
}

export async function run(
  args: string[],
  {
    fetcher = fetch as Fetcher,
    publicDir = 'public',
    log = console.log,
    error = console.error,
    wait = sleep,
    now = new Date(),
  }: { fetcher?: Fetcher; publicDir?: string; log?: (line: string) => void; error?: (line: string) => void; wait?: Wait; now?: Date } = {},
) {
  const [mode, ...files] = args;
  if (mode === 'recent' && files.length >= 1) return runRecent(files[0], files.slice(1), { fetcher, publicDir, log, error, now });
  let languages: string[];
  if (mode === 'changed' && files.length === 2) {
    const [previous, current] = files.map((file) => publishedLanguages(readFileSync(file, 'utf8')));
    languages = newlyPublished(previous, current);
  } else if (mode === 'all' && files.length === 1) {
    languages = publishedLanguages(readFileSync(files[0], 'utf8'));
  } else {
    error(USAGE);
    return 1;
  }
  if (languages.length === 0) {
    log('indexnow: no newly published languages, nothing to submit');
    return 0;
  }

  let urls: string[];
  try {
    urls = await urlsForLanguages(languages, fetcher, { wait });
  } catch (failure) {
    error(`indexnow: could not read the sitemaps of ${languages.join(', ')}: ${messageOf(failure)}`);
    return 1;
  }
  const result = await submitToIndexNow({ key: keyIn(publicDir), urls, fetcher });
  const line = `indexnow: ${urls.length} URLs for ${HOST} (${languages.join(', ')}), HTTP ${result.status}`;
  if (result.ok) {
    log(line);
    return 0;
  }
  error(`${line}, submission failed: ${result.detail ?? ''}`);
  return 1;
}

const entry = import.meta as ImportMeta & { main?: boolean; dir?: string };
if (entry.main) {
  process.exit(await run(process.argv.slice(2), { publicDir: join(entry.dir ?? '.', '..', 'public') }));
}
