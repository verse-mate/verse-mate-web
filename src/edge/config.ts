export const SITE_ORIGIN = 'https://app.versemate.org';
export const PRODUCTION_HOST = new URL(SITE_ORIGIN).hostname;
export const ORGANIZATION_ID = 'https://versemate.org/#org';
export const DEFAULT_LANGUAGE = 'en-US';
export const LANGUAGES = ['en-US', 'es-MX', 'pt-BR', 'uk', 'ru', 'ro-RO', 'de', 'fr'] as const;
export type Language = (typeof LANGUAGES)[number];
export const GUEST_VERSION = 'NASB1995';
const DEFAULT_API_URL = 'https://api.versemate.org';

export interface EdgeEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
  API_URL?: string;
  EDGE_RENDER?: boolean | string;
  INDEXED_LANGUAGES?: string[] | string;
  CF_VERSION_METADATA?: { id?: string };
}

export interface EdgeConfig {
  enabled: boolean;
  apiUrl: string;
  indexedLanguages: Language[];
  buildId: string;
}

function parseLanguages(value: EdgeEnv['INDEXED_LANGUAGES']): Language[] {
  let list: unknown = value;
  if (typeof value === 'string') {
    try {
      list = JSON.parse(value);
    } catch {
      list = value.split(',');
    }
  }
  if (!Array.isArray(list)) return [];
  return LANGUAGES.filter((code) => list.some((item) => String(item).trim() === code));
}

export function readConfig(env: EdgeEnv): EdgeConfig {
  return {
    enabled: env.EDGE_RENDER === true || env.EDGE_RENDER === 'true',
    apiUrl: (env.API_URL || DEFAULT_API_URL).replace(/\/+$/, ''),
    indexedLanguages: parseLanguages(env.INDEXED_LANGUAGES),
    buildId: env.CF_VERSION_METADATA?.id || 'dev',
  };
}

export function languageFromQuery(value: string | null): Language {
  if (!value) return DEFAULT_LANGUAGE;
  const match = LANGUAGES.find((code) => code.toLowerCase() === value.trim().toLowerCase());
  return match ?? DEFAULT_LANGUAGE;
}
