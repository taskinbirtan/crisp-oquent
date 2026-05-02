import { CrispOquentConfig } from './config.js';
import { HttpError } from './errors.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

function joinUrl(baseUri: string, path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = baseUri.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const config = CrispOquentConfig.options;
  const method = options.method ?? 'GET';

  const init: RequestInit = {
    method,
    headers: { ...config.headers, ...(options.headers ?? {}) },
    signal: options.signal,
  };

  if (options.body !== undefined && method !== 'GET') {
    init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  let ctx = { url: joinUrl(config.baseUri, path), init };
  for (const interceptor of config.requestInterceptors) {
    ctx = await interceptor(ctx);
  }

  let response = await config.fetch(ctx.url, ctx.init);
  for (const interceptor of config.responseInterceptors) {
    response = await interceptor(response, ctx);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const body: unknown = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    throw new HttpError(response, body);
  }

  return body as T;
}
