import { vi } from 'vitest';
import { CrispOquentConfig, type FetchLike } from '../src/index.js';

export interface CapturedCall {
  url: string;
  init: RequestInit;
}

export function installFetchMock(
  responder: (call: CapturedCall) => Response | Promise<Response>,
): { calls: CapturedCall[]; fetch: FetchLike } {
  const calls: CapturedCall[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const call: CapturedCall = { url: String(input), init };
    calls.push(call);
    return responder(call);
  }) as unknown as FetchLike;

  CrispOquentConfig.initialize({ baseUri: 'https://api.test', fetch: fetchMock });
  return { calls, fetch: fetchMock };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export function emptyResponse(status = 204): Response {
  return new Response(null, { status });
}
