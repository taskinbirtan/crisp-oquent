import { describe, it, expect, beforeEach } from 'vitest';
import { Model, CrispOquentConfig, FilterOperator } from '../src/index.js';
import { installFetchMock, jsonResponse } from './helpers.js';

class User extends Model {
  static override uri = '/users';
  declare id?: number;
  declare name?: string;
  declare salary?: number;
}

beforeEach(() => CrispOquentConfig.reset());

describe('Builder.where — dynamic operator filter (Spatie FilterOperator::DYNAMIC)', () => {
  it('GREATER_THAN → filter[salary]=>3000', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    await User.crispy().where('salary', FilterOperator.GREATER_THAN, 3000).get();
    expect(new URL(calls[0]!.url).searchParams.get('filter[salary]')).toBe('>3000');
  });

  it('NOT_EQUAL → filter[id]=!=3', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    await User.crispy().where('id', FilterOperator.NOT_EQUAL, 3).get();
    expect(new URL(calls[0]!.url).searchParams.get('filter[id]')).toBe('!=3');
  });

  it('GREATER_THAN_OR_EQUAL → filter[salary]=>=3000', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    await User.crispy().where('salary', FilterOperator.GREATER_THAN_OR_EQUAL, 3000).get();
    expect(new URL(calls[0]!.url).searchParams.get('filter[salary]')).toBe('>=3000');
  });

  it('LESS_THAN_OR_EQUAL with string value', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    await User.crispy().where('created_at', FilterOperator.LESS_THAN_OR_EQUAL, '2026-01-01').get();
    expect(new URL(calls[0]!.url).searchParams.get('filter[created_at]')).toBe(
      '<=2026-01-01',
    );
  });
});

describe('Builder — trashed helpers (Spatie SoftDeletes)', () => {
  it('withTrashed() → filter[trashed]=with', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    await User.crispy().withTrashed().get();
    expect(new URL(calls[0]!.url).searchParams.get('filter[trashed]')).toBe('with');
  });

  it('onlyTrashed() → filter[trashed]=only', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    await User.crispy().onlyTrashed().get();
    expect(new URL(calls[0]!.url).searchParams.get('filter[trashed]')).toBe('only');
  });
});

describe('Builder — nullable filter helpers', () => {
  it('whereNull(deleted_at) → filter[deleted_at]=null', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    await User.crispy().whereNull('deleted_at').get();
    expect(new URL(calls[0]!.url).searchParams.get('filter[deleted_at]')).toBe('null');
  });

  it('whereNotNull(email) → filter[email]=not-null', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    await User.crispy().whereNotNull('email').get();
    expect(new URL(calls[0]!.url).searchParams.get('filter[email]')).toBe('not-null');
  });
});

describe('Custom delimiter (Spatie v7.2.0 array_value_delimiter)', () => {
  it('per-builder delimiter() overrides default ","', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    await User.crispy().delimiter('|').filter('id', [1, 2, 3]).get();
    expect(new URL(calls[0]!.url).searchParams.get('filter[id]')).toBe('1|2|3');
  });

  it('CrispOquentConfig.setFilterDelimiter applies globally', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    CrispOquentConfig.setFilterDelimiter(';');
    await User.crispy().filter('id', [1, 2, 3]).get();
    expect(new URL(calls[0]!.url).searchParams.get('filter[id]')).toBe('1;2;3');
  });

  it('per-builder delimiter beats global config', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    CrispOquentConfig.setFilterDelimiter(';');
    await User.crispy().delimiter('|').filter('id', [1, 2]).get();
    expect(new URL(calls[0]!.url).searchParams.get('filter[id]')).toBe('1|2');
  });
});

describe('Builder — aggregate include helpers (Spatie AllowedInclude::sum/avg/min/max)', () => {
  it('includeSum(name) → include=postsViewsSum', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    await User.crispy().includeSum('postsViewsSum').get();
    expect(new URL(calls[0]!.url).searchParams.get('include')).toBe('postsViewsSum');
  });

  it('includeAvg + includeCount + includeExists composes into include=', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    await User.crispy()
      .includeAvg('postsViewsAvg')
      .includeMin('postsViewsMin')
      .includeMax('postsViewsMax')
      .includeCount('posts')
      .includeExists('friends')
      .get();
    expect(new URL(calls[0]!.url).searchParams.get('include')).toBe(
      'postsViewsAvg,postsViewsMin,postsViewsMax,postsCount,friendsExists',
    );
  });
});
