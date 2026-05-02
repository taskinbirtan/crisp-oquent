import { describe, it, expect, beforeEach } from 'vitest';
import { CrispOquentConfig, HttpError, request } from '../src/index.js';
import { installFetchMock, jsonResponse } from './helpers.js';

beforeEach(() => CrispOquentConfig.reset());

describe('HttpClient', () => {
  it('default headers + Bearer token gönderilir', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ ok: true }));
    CrispOquentConfig.setBearerToken('abc123');
    await request('/ping');
    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers['Accept']).toBe('application/json');
    expect(headers['Authorization']).toBe('Bearer abc123');
  });

  it('non-2xx → HttpError (status, body, helper)', async () => {
    installFetchMock(() =>
      jsonResponse(
        { message: 'Unprocessable', errors: { email: ['required'] } },
        422,
      ),
    );
    await expect(request('/x', { method: 'POST', body: {} })).rejects.toMatchObject({
      name: 'HttpError',
      status: 422,
    });

    installFetchMock(() => jsonResponse({ message: 'Bad' }, 422));
    try {
      await request('/x', { method: 'POST', body: {} });
    } catch (e) {
      const err = e as HttpError;
      expect(err.isValidationError).toBe(true);
    }
  });

  it('204 No Content → undefined', async () => {
    installFetchMock(() => new Response(null, { status: 204 }));
    const result = await request('/x', { method: 'DELETE' });
    expect(result).toBeUndefined();
  });

  it('request interceptor zinciri çalışır', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ ok: true }));
    CrispOquentConfig.addRequestInterceptor((ctx) => ({
      ...ctx,
      init: { ...ctx.init, headers: { ...ctx.init.headers, 'X-Trace': 'on' } },
    }));
    await request('/ping');
    expect((calls[0]!.init.headers as Record<string, string>)['X-Trace']).toBe('on');
  });

  it('absolute URL bypass eder baseUri', async () => {
    const { calls } = installFetchMock(() => jsonResponse({}));
    await request('https://other.host/raw');
    expect(calls[0]!.url).toBe('https://other.host/raw');
  });
});
