export interface LaravelValidationErrors {
  message: string;
  errors: Record<string, string[]>;
}

export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly body: unknown;

  constructor(response: Response, body: unknown) {
    super(`HTTP ${response.status} ${response.statusText} — ${response.url}`);
    this.name = 'HttpError';
    this.status = response.status;
    this.statusText = response.statusText;
    this.url = response.url;
    this.body = body;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get validationErrors(): Record<string, string[]> | null {
    if (!this.isValidationError || typeof this.body !== 'object' || this.body === null) {
      return null;
    }
    const errors = (this.body as { errors?: unknown }).errors;
    return typeof errors === 'object' && errors !== null
      ? (errors as Record<string, string[]>)
      : null;
  }
}
