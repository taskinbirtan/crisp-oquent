# crisp-oquent

> A **fetch-only**, TypeScript-first API client that speaks Spatie [`laravel-query-builder`](https://github.com/spatie/laravel-query-builder)'s URL contract — including JSON:API Fancy Filter Groups (Spatie v7.3.0 / PR [#1060](https://github.com/spatie/laravel-query-builder/pull/1060)).

[![npm version](https://img.shields.io/npm/v/crisp-oquent.svg)](https://www.npmjs.com/package/crisp-oquent)
[![license](https://img.shields.io/npm/l/crisp-oquent.svg)](./LICENSE)

- **Zero dependencies.** Just `fetch` — no Axios, no polyfills.
- **ESM-only**, strict TypeScript, ships its own `.d.ts`. Node ≥ 18 and modern browsers.
- **1:1 with Spatie's URL contract:** `filter[…]`, `sort=`, `include=`, `fields[type]=`, `append=`.
- **Filter groups:** `filterGroup()` shorthand for server-side `AllowedFilter::groupOr / groupAnd`.
- **Laravel-aware pagination** — parses Laravel API Resource paginated responses out of the box.
- **Auth + interceptors + structured errors:** bearer token, request/response middleware, `HttpError` with helpers like `isValidationError`.

## Install

```bash
npm install crisp-oquent
```

## Quick start

### 1. Configure once

```ts
import { CrispOquentConfig } from 'crisp-oquent';

CrispOquentConfig.initialize({ baseUri: 'https://api.example.com' });
CrispOquentConfig.setBearerToken(localStorage.getItem('token'));
```

### 2. Define a model

```ts
import { Model } from 'crisp-oquent';

export class User extends Model {
  static override uri = '/users';

  declare id?: number;
  declare name?: string;
  declare email?: string;
}
```

### 3. Fluent queries — Spatie URL contract

```ts
const users = await User.crispy()
  .filter('status', 'active')        // filter[status]=active
  .filter('id', [1, 2, 3])           // filter[id]=1,2,3
  .sortByDesc('created_at')          // sort=-created_at
  .sortBy('name')                    // sort=-created_at,name
  .include('posts', 'profile')       // include=posts,profile
  .fields('users', 'id', 'name')     // fields[users]=id,name
  .append('full_name')               // append=full_name
  .get();
```

### 4. Pagination

```ts
const page = await User.crispy().filter('active', true).paginate(2, 25);

page.items;          // User[]
page.currentPage;    // 2
page.perPage;        // 25
page.total;          // 137
page.lastPage;       // 6
page.hasMorePages(); // true
page.links.next;     // 'https://api.example.com/users?page=3'
```

### 5. Filter Groups (Spatie v7.3.0 — PR #1060)

On the backend:

```php
QueryBuilder::for(User::class)
    ->allowedFilters(
        AllowedFilter::groupOr('q', [
            AllowedFilter::partial('name'),
            AllowedFilter::partial('full_name'),
        ]),
    );
```

On the client, one line:

```ts
const matches = await User.crispy().filterGroup('q', 'John').get();
// → GET /users?filter[q]=John
// → backend WHERE (name LIKE '%John%' OR full_name LIKE '%John%')
```

The conjunction (AND/OR), which fields the shorthand fans out to, and value broadcasting all live server-side. The client just sends the shorthand; the composition is owned by `FiltersGroup`.

### 6. Single records & CRUD

```ts
const user = await User.crispy().find(42);  // GET /users/42 (404 → null)
const first = await User.crispy().filter('active', true).first();

// Create
const fresh = await User.crispy().create({ name: 'Birtan', email: 'b@x' });

// Update
fresh.name = 'Birtan T.';
await fresh.save();   // PUT /users/:id

// Delete
await fresh.delete(); // DELETE /users/:id
```

### 7. Auth & interceptors

```ts
CrispOquentConfig.setBearerToken('abc123');

CrispOquentConfig.addRequestInterceptor((ctx) => ({
  ...ctx,
  init: {
    ...ctx.init,
    headers: { ...ctx.init.headers, 'X-Trace-Id': crypto.randomUUID() },
  },
}));

CrispOquentConfig.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // refresh, redirect, …
  }
  return response;
});
```

### 8. Error handling

```ts
import { HttpError } from 'crisp-oquent';

try {
  await new User({ email: '' }).save();
} catch (e) {
  if (e instanceof HttpError && e.isValidationError) {
    e.validationErrors; // { email: ['required'] }
  }
}
```

## API surface — Spatie parity

| Spatie URL parameter   | Builder method                                  |
|------------------------|-------------------------------------------------|
| `filter[name]=`        | `.filter(name, value)`                          |
| `filter[name]=a,b`     | `.filter(name, [a, b])`                         |
| `filter[shorthand]=`   | `.filterGroup(shorthand, value)` (#1060)        |
| `sort=`                | `.sortBy(field)` / `.sortByDesc(field)`         |
| `include=`             | `.include(...rels)`                             |
| aggregate `xCount`     | `.includeCount(...rels)`                        |
| aggregate `xExists`    | `.includeExists(...rels)`                       |
| `fields[type]=`        | `.fields(type, ...names)`                       |
| `append=`              | `.append(...names)`                             |
| `page=` + `per_page=`  | `.page(n)` / `.perPage(n)` / `.paginate(p, pp)` |

## Compatibility

- **Node:** ≥ 18 (uses native `fetch`)
- **Bundlers / frameworks:** Vite, Webpack 5+, Rollup, esbuild — Nuxt 3, Next.js 13+, Vue 3, React 18+, SvelteKit
- **Backend:** Laravel + Spatie `laravel-query-builder` ≥ 7.0 (Filter Groups require ≥ 7.3.0)

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Contributing

Issues and pull requests welcome on [GitHub](https://github.com/taskinbirtan/crisp-oquent). For Spatie URL contract questions, please link to the relevant `laravel-query-builder` documentation or PR.

## License

[Apache-2.0](./LICENSE)
