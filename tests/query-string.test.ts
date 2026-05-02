import { describe, it, expect } from 'vitest';
import { buildQueryString } from '../src/index.js';

describe('buildQueryString — Spatie URL contract', () => {
  it('returns empty string for empty params', () => {
    expect(buildQueryString({})).toBe('');
  });

  it('filter[name]=value (brackets raw, value encoded)', () => {
    expect(buildQueryString({ filter: { name: 'John' } })).toBe('?filter[name]=John');
  });

  it('filter[id]=1,2,3 — array values are comma-joined', () => {
    expect(buildQueryString({ filter: { id: [1, 2, 3] } })).toBe('?filter[id]=1%2C2%2C3');
  });

  it('sort= multi-field with leading "-" for desc', () => {
    expect(buildQueryString({ sort: ['-created_at', 'name'] })).toBe(
      '?sort=-created_at%2Cname',
    );
  });

  it('include= comma-joined relations', () => {
    expect(buildQueryString({ include: ['author', 'comments.user'] })).toBe(
      '?include=author%2Ccomments.user',
    );
  });

  it('fields[type]= sparse fieldsets per resource type', () => {
    expect(
      buildQueryString({ fields: { posts: ['id', 'title'], users: ['name'] } }),
    ).toBe('?fields[posts]=id%2Ctitle&fields[users]=name');
  });

  it('append= comma-joined accessor names', () => {
    expect(buildQueryString({ append: ['full_name', 'avatar_url'] })).toBe(
      '?append=full_name%2Cavatar_url',
    );
  });

  it('page + per_page', () => {
    expect(buildQueryString({ page: 2, perPage: 25 })).toBe('?page=2&per_page=25');
  });

  it('reserved characters inside values are URL-encoded', () => {
    expect(buildQueryString({ filter: { q: 'hello world & friends' } })).toBe(
      '?filter[q]=hello%20world%20%26%20friends',
    );
  });

  it('combines all parameters in deterministic order', () => {
    const qs = buildQueryString({
      filter: { status: 'active' },
      sort: ['-created_at'],
      include: ['author'],
      fields: { posts: ['id', 'title'] },
      page: 1,
      perPage: 10,
    });
    expect(qs).toBe(
      '?filter[status]=active&sort=-created_at&include=author&fields[posts]=id%2Ctitle&page=1&per_page=10',
    );
  });
});
