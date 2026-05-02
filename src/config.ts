export type FetchLike = typeof fetch;

export interface RequestContext {
  url: string;
  init: RequestInit;
}

export type RequestInterceptor = (
  ctx: RequestContext,
) => RequestContext | Promise<RequestContext>;

export type ResponseInterceptor = (
  response: Response,
  ctx: RequestContext,
) => Response | Promise<Response>;

export interface CrispOquentOptions {
  baseUri: string;
  headers: Record<string, string>;
  fetch: FetchLike;
  requestInterceptors: RequestInterceptor[];
  responseInterceptors: ResponseInterceptor[];
}

export interface CrispOquentInit {
  baseUri: string;
  headers?: Record<string, string>;
  fetch?: FetchLike;
}

const DEFAULTS: CrispOquentOptions = {
  baseUri: '',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  fetch: ((...args) => globalThis.fetch(...args)) as FetchLike,
  requestInterceptors: [],
  responseInterceptors: [],
};

export class CrispOquentConfig {
  private static _options: CrispOquentOptions = { ...DEFAULTS };

  static get options(): CrispOquentOptions {
    return this._options;
  }

  static initialize(init: CrispOquentInit): void {
    this._options = {
      ...DEFAULTS,
      ...init,
      headers: { ...DEFAULTS.headers, ...(init.headers ?? {}) },
      requestInterceptors: [],
      responseInterceptors: [],
    };
  }

  static setHeader(name: string, value: string): void {
    this._options.headers[name] = value;
  }

  static removeHeader(name: string): void {
    delete this._options.headers[name];
  }

  static setBearerToken(token: string | null): void {
    if (token === null) {
      this.removeHeader('Authorization');
    } else {
      this.setHeader('Authorization', `Bearer ${token}`);
    }
  }

  static addRequestInterceptor(interceptor: RequestInterceptor): void {
    this._options.requestInterceptors.push(interceptor);
  }

  static addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this._options.responseInterceptors.push(interceptor);
  }

  static reset(): void {
    this._options = { ...DEFAULTS, headers: { ...DEFAULTS.headers } };
  }
}
