import { describe, it, expect, beforeEach } from 'vitest';
import { Model, CrispOquentConfig } from '../src/index.js';
import { installFetchMock, jsonResponse } from './helpers.js';

class User extends Model {
  static override uri = '/users';
  declare id?: number;
  declare name?: string;
  declare email?: string;
}

beforeEach(() => CrispOquentConfig.reset());

describe('Builder — Spatie URL kontratı', () => {
  it('get() → /users', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [{ id: 1, name: 'A' }] }));
    const items = await User.crispy().get();
    expect(calls[0]!.url).toBe('https://api.test/users');
    expect(items).toHaveLength(1);
    expect(items[0]).toBeInstanceOf(User);
  });

  it('filter + sort + include URL kontratı', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    await User.crispy()
      .filter('status', 'active')
      .filter('id', [1, 2, 3])
      .sortByDesc('created_at')
      .sortBy('name')
      .include('posts', 'profile')
      .get();
    const url = new URL(calls[0]!.url);
    expect(url.searchParams.get('filter[status]')).toBe('active');
    expect(url.searchParams.get('filter[id]')).toBe('1,2,3');
    expect(url.searchParams.get('sort')).toBe('-created_at,name');
    expect(url.searchParams.get('include')).toBe('posts,profile');
  });

  it('fields[type] sparse fieldsets', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    await User.crispy().fields('users', 'id', 'name').get();
    expect(new URL(calls[0]!.url).searchParams.get('fields[users]')).toBe('id,name');
  });

  it('filterGroup (Spatie #1060) shorthand → filter[shorthand]=value', async () => {
    const { calls } = installFetchMock(() => jsonResponse({ data: [] }));
    await User.crispy().filterGroup('q', 'John').get();
    expect(new URL(calls[0]!.url).searchParams.get('filter[q]')).toBe('John');
  });

  it('first() → perPage=1, ilk item', async () => {
    const { calls } = installFetchMock(() =>
      jsonResponse({ data: [{ id: 7, name: 'first' }] }),
    );
    const user = await User.crispy().filter('active', true).first();
    expect(user).not.toBeNull();
    expect(user!.getKey()).toBe(7);
    expect(new URL(calls[0]!.url).searchParams.get('per_page')).toBe('1');
  });

  it('find(id) → /users/:id', async () => {
    const { calls } = installFetchMock(() =>
      jsonResponse({ data: { id: 42, name: 'Found' } }),
    );
    const user = await User.crispy().find(42);
    expect(calls[0]!.url).toBe('https://api.test/users/42');
    expect(user!.getKey()).toBe(42);
  });

  it('find() 404 → null', async () => {
    installFetchMock(() => jsonResponse({ message: 'Not found' }, 404));
    const user = await User.crispy().find(999);
    expect(user).toBeNull();
  });

  it('paginate() Laravel Resource formatını parse eder', async () => {
    installFetchMock(() =>
      jsonResponse({
        data: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
        meta: { current_page: 2, per_page: 10, total: 23, last_page: 3, from: 11, to: 20 },
        links: { first: '/u?page=1', last: '/u?page=3', prev: '/u?page=1', next: '/u?page=3' },
      }),
    );
    const page = await User.crispy().paginate(2, 10);
    expect(page.items).toHaveLength(2);
    expect(page.currentPage).toBe(2);
    expect(page.perPage).toBe(10);
    expect(page.total).toBe(23);
    expect(page.lastPage).toBe(3);
    expect(page.hasMorePages()).toBe(true);
    expect(page.links.next).toBe('/u?page=3');
  });
});

describe('Model — attribute proxy + CRUD', () => {
  it('attribute proxy: instance.name → attributes.name', () => {
    const u = new User({ id: 1, name: 'Birtan' });
    expect(u.name).toBe('Birtan');
    expect(u.id).toBe(1);
    expect(u.getKey()).toBe(1);
    expect(u.isPersisted()).toBe(true);
  });

  it('save() yeni model → POST', async () => {
    const { calls } = installFetchMock(() =>
      jsonResponse({ data: { id: 99, name: 'New', email: 'a@b' } }, 201),
    );
    const u = new User({ name: 'New', email: 'a@b' });
    await u.save();
    expect(calls[0]!.url).toBe('https://api.test/users');
    expect(calls[0]!.init.method).toBe('POST');
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ name: 'New', email: 'a@b' });
    expect(u.getKey()).toBe(99);
  });

  it('save() var olan model → PUT', async () => {
    const { calls } = installFetchMock(() =>
      jsonResponse({ data: { id: 5, name: 'Upd' } }),
    );
    const u = new User({ id: 5, name: 'Upd' });
    await u.save();
    expect(calls[0]!.url).toBe('https://api.test/users/5');
    expect(calls[0]!.init.method).toBe('PUT');
  });

  it('delete() → DELETE /users/:id', async () => {
    const { calls } = installFetchMock(() => new Response(null, { status: 204 }));
    const u = new User({ id: 5 });
    await u.delete();
    expect(calls[0]!.url).toBe('https://api.test/users/5');
    expect(calls[0]!.init.method).toBe('DELETE');
  });

  it('Builder.create(payload) → POST + döner instance', async () => {
    installFetchMock(() => jsonResponse({ data: { id: 1, name: 'X' } }, 201));
    const u = await User.crispy().create({ name: 'X' });
    expect(u).toBeInstanceOf(User);
    expect(u.getKey()).toBe(1);
  });
});
