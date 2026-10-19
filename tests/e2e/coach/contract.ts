import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type Schema = {
  type?: string;
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  anyOf?: Schema[];
  const?: unknown;
  enum?: unknown[];
  format?: string;
  patternProperties?: Record<string, Schema>;
};

type Refusal = { status: number; message: string; template?: true };

type Contract = {
  refusals: Record<string, Record<string, Refusal>>;
  routes: Array<{ route: string; response: Record<string, Schema> }>;
};

export const CONTRACT: Contract = JSON.parse(readFileSync(join(import.meta.dirname, 'coach-contract.snapshot.json'), 'utf8'));

export const ERROR_CODES: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
};

export const UNMATCHED_ROUTE = { error: 'NOT_FOUND', message: 'Route not found' };
export const INVALID_REQUEST = { error: 'VALIDATION_ERROR', message: 'Invalid request data' };

const ROUTES = CONTRACT.routes
  .map((r) => {
    const [method, path] = r.route.split(' ');
    const pattern = new RegExp(`^${path.replace(/:[^/]+/g, '[^/]+')}$`);
    return { ...r, method, pattern, params: (path.match(/:/g) ?? []).length };
  })
  .sort((a, b) => a.params - b.params);

export function contractRoute(method: string, pathname: string) {
  const path = pathname.slice(pathname.indexOf('/coach/'));
  return ROUTES.find((r) => r.method === method && r.pattern.test(path));
}

export function refusalOf(route: string, code: string): Refusal & { code: string } {
  const listed = CONTRACT.refusals[route]?.[code];
  if (!listed) throw new Error(`${route} has no refusal ${code} in the contract`);
  return { ...listed, code };
}

function typeErrors(schema: Schema, value: unknown, at: string): string[] {
  const t = schema.type;
  if (!t) return [];
  const ok =
    t === 'null'
      ? value === null
      : t === 'array'
        ? Array.isArray(value)
        : t === 'object'
          ? typeof value === 'object' && value !== null && !Array.isArray(value)
          : t === 'Date'
            ? typeof value === 'string' && !Number.isNaN(Date.parse(value))
            : typeof value === t;
  return ok ? [] : [`${at}: expected ${t}, got ${JSON.stringify(value)}`];
}

const FORMATS: Record<string, RegExp> = {
  date: /^\d{4}-\d{2}-\d{2}$/,
  'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/,
};

export function schemaErrors(schema: Schema, value: unknown, at = 'body'): string[] {
  if (schema.anyOf) {
    const each = schema.anyOf.map((s) => schemaErrors(s, value, at));
    return each.some((e) => e.length === 0) ? [] : [`${at}: matches none of ${schema.anyOf.length} shapes (${each.map((e) => e[0]).join(' | ')})`];
  }
  const wrongType = typeErrors(schema, value, at);
  if (wrongType.length) return wrongType;
  if ('const' in schema && value !== schema.const) return [`${at}: expected ${JSON.stringify(schema.const)}`];
  if (schema.enum && !schema.enum.includes(value)) return [`${at}: ${JSON.stringify(value)} is not one of ${JSON.stringify(schema.enum)}`];
  if (schema.format && typeof value === 'string' && FORMATS[schema.format] && !FORMATS[schema.format].test(value)) {
    return [`${at}: ${JSON.stringify(value)} is not a ${schema.format}`];
  }
  if (Array.isArray(value) && schema.items) return value.flatMap((v, i) => schemaErrors(schema.items as Schema, v, `${at}[${i}]`));
  if (schema.type !== 'object') return [];
  const obj = value as Record<string, unknown>;
  if (schema.patternProperties) {
    const [[pattern, each]] = Object.entries(schema.patternProperties);
    return Object.entries(obj).flatMap(([k, v]) => (new RegExp(pattern).test(k) ? schemaErrors(each, v, `${at}.${k}`) : [`${at}.${k}: not allowed`]));
  }
  const props = schema.properties ?? {};
  return [
    ...(schema.required ?? []).filter((k) => !(k in obj)).map((k) => `${at}.${k}: missing`),
    ...Object.keys(obj)
      .filter((k) => !(k in props))
      .map((k) => `${at}.${k}: not in the contract, the server strips it`),
    ...Object.entries(obj).flatMap(([k, v]) => (k in props && v !== undefined ? schemaErrors(props[k], v, `${at}.${k}`) : [])),
  ];
}

function sameWords(listed: Refusal, message: unknown): boolean {
  if (!listed.template) return message === listed.message;
  return typeof message === 'string' && message.startsWith(listed.message.slice(0, listed.message.indexOf('<')));
}

function errorBodyErrors(status: number, body: Record<string, unknown>): string[] {
  const keys = Object.keys(body).filter((k) => !['error', 'message', 'details'].includes(k));
  return [
    ...(body.error === ERROR_CODES[status] ? [] : [`error: expected ${ERROR_CODES[status]} for a ${status}, got ${JSON.stringify(body.error)}`]),
    ...(typeof body.message === 'string' ? [] : ['message: missing']),
    ...keys.map((k) => `${k}: not in an error body`),
  ];
}

export function contractErrors(method: string, pathname: string, status: number, body: unknown): string[] {
  if (!pathname.includes('/coach/')) return status === 404 ? [] : [`${pathname} is not a coach route: the fake must answer 404`];
  const route = contractRoute(method, pathname);
  if (!route) {
    if (status !== 404) return [`${method} ${pathname} is no route on the server, which answers 404, not ${status}`];
    return JSON.stringify(body) === JSON.stringify(UNMATCHED_ROUTE) ? [] : [`an unmatched route answers ${JSON.stringify(UNMATCHED_ROUTE)}`];
  }
  if (status === 200) return schemaErrors(route.response['200'], body);
  if (typeof body !== 'object' || body === null) return [`${route.route} ${status}: the body is not JSON`];
  const error = body as Record<string, unknown>;
  const shape = errorBodyErrors(status, error);
  if (status === 422) return JSON.stringify(body) === JSON.stringify(INVALID_REQUEST) ? [] : [`a 422 answers ${JSON.stringify(INVALID_REQUEST)}`];
  if (![400, 404, 409].includes(status)) return shape;
  const listed = CONTRACT.refusals[route.route];
  if (!listed) return error.details === undefined ? shape : [...shape, 'details: this route lists no refusals'];
  const code = (error.details as { refusal?: unknown } | undefined)?.refusal;
  const refusal = typeof code === 'string' ? listed[code] : undefined;
  if (!refusal) return [...shape, `${route.route} ${status}: details.refusal ${JSON.stringify(code)} is not one of ${Object.keys(listed).join(', ')}`];
  return [
    ...shape,
    ...(refusal.status === status ? [] : [`${code}: answers ${refusal.status}, not ${status}`]),
    ...(sameWords(refusal, error.message) ? [] : [`${code}: the words are ${JSON.stringify(refusal.message)}, not ${JSON.stringify(error.message)}`]),
  ];
}
