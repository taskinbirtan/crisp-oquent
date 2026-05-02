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
  /**
   * Default delimiter for joining array filter values.
   * Spatie's default is ','. Mirror your server-side
   * `query-builder.array_value_delimiter` config here.
   */
  filterDelimiter: string;
}

export interface CrispOquentInit {
  baseUri: string;
  headers?: Record<string, string>;
  fetch?: FetchLike;
  filterDelimiter?: string;
}

const DEFAULTS: CrispOquentOptions = {
  baseUri: '',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  fetch: ((...args) => globalThis.fetch(...args)) as FetchLike,
  requestInterceptors: [],
  responseInterceptors: [],
  filterDelimiter: ',',
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

  static setFilterDelimiter(delimiter: string): void {
    this._options.filterDelimiter = delimiter;
  }

  static reset(): void {
    this._options = { ...DEFAULTS, headers: { ...DEFAULTS.headers } };
  }
}
