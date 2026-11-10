export interface FetchCall {
  url: string;
  init?: RequestInit;
}

export async function describeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<FetchCall> {
  if (input instanceof Request) {
    const body = input.body ? await input.clone().text() : undefined;
    return { url: input.url, init: { method: input.method, headers: input.headers, body } };
  }
  return { url: typeof input === 'string' ? input : input.toString(), init };
}
