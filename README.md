# crisp-oquent

> A **fetch-only**, TypeScript-first API client that speaks Spatie [`laravel-query-builder`](https://github.com/spatie/laravel-query-builder)'s URL contract — including JSON:API Fancy Filter Groups (Spatie v7.3.0 / PR [#1060](https://github.com/spatie/laravel-query-builder/pull/1060)).

[![npm version](https://img.shields.io/npm/v/crisp-oquent.svg)](https://www.npmjs.com/package/crisp-oquent)
[![license](https://img.shields.io/npm/l/crisp-oquent.svg)](./LICENSE)

- **Zero dependencies.** Just `fetch` — no Axios, no polyfills.
- **ESM-only**, strict TypeScript, ships its own `.d.ts`. Node ≥ 18 and modern browsers.
- **Full Spatie v7 feature parity:** `filter[…]`, dynamic operators, trashed, nullable, sort, include (incl. count/exists/sum/avg/min/max), sparse fieldsets, append.
- **Filter groups:** `filterGroup()` shorthand for server-side `AllowedFilter::groupOr / groupAnd` (Spatie v7.3.0 / PR [#1060](https://github.com/spatie/laravel-query-builder/pull/1060)).
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

### 5. Dynamic operator filters

Pairs with `AllowedFilter::operator($name, FilterOperator::DYNAMIC)` on the server.

```ts
import { FilterOperator } from 'crisp-oquent';

await User.crispy()
  .where('salary', FilterOperator.GREATER_THAN, 3000)        // filter[salary]=>3000
  .where('id', FilterOperator.NOT_EQUAL, 7)                  // filter[id]=!=7
  .where('created_at', FilterOperator.LESS_THAN_OR_EQUAL, '2026-01-01')
  .get();
```

Available operators: `EQUAL`, `NOT_EQUAL`, `GREATER_THAN`, `GREATER_THAN_OR_EQUAL`, `LESS_THAN`, `LESS_THAN_OR_EQUAL`.

### 6. Trashed (SoftDeletes) and nullable filters

```ts
await User.crispy().withTrashed().get();   // filter[trashed]=with
await User.crispy().onlyTrashed().get();   // filter[trashed]=only

await User.crispy().whereNull('deleted_at').get();   // filter[deleted_at]=null
await User.crispy().whereNotNull('email').get();     // filter[email]=not-null
```

### 7. Aggregate includes (sum / avg / min / max / count / exists)

Pairs with Spatie's `AllowedInclude::sum / avg / min / max / count / exists`. Pass the include name declared on the server.

```ts
await User.crispy()
  .includeCount('posts')                    // postsCount
  .includeExists('friends')                 // friendsExists
  .includeSum('postsViewsSum')              // postsViewsSum
  .includeAvg('postsViewsAvg')
  .includeMin('postsViewsMin')
  .includeMax('postsViewsMax')
  .get();
// → ?include=postsCount,friendsExists,postsViewsSum,postsViewsAvg,postsViewsMin,postsViewsMax
```

### 8. Custom array delimiter (Spatie v7.2.0)

Mirror your server-side `query-builder.array_value_delimiter` config:

```ts
CrispOquentConfig.setFilterDelimiter('|');
await User.crispy().filter('id', [1, 2, 3]).get();   // filter[id]=1|2|3

// Per-builder override:
await User.crispy().delimiter(';').filter('id', [1, 2]).get();
```

### 9. Filter Groups (Spatie v7.3.0 — PR #1060)

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

### 10. Single records & CRUD

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

### 11. Auth & interceptors

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

### 12. Error handling

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

| Spatie feature                                | URL emitted                                  | Builder method                                          |
|-----------------------------------------------|----------------------------------------------|---------------------------------------------------------|
| Partial / exact / scope / callback filter     | `?filter[name]=…`                            | `.filter(name, value)`                                  |
| Comma-separated values                        | `?filter[name]=a,b`                          | `.filter(name, [a, b])`                                 |
| Dynamic operator (`FilterOperator::DYNAMIC`)  | `?filter[salary]=>3000`                      | `.where(name, FilterOperator.GREATER_THAN, value)`      |
| BelongsTo filter                              | `?filter[post]=1`                            | `.filter('post', value)`                                |
| Trashed (SoftDeletes)                         | `?filter[trashed]=with` / `only`             | `.withTrashed()` / `.onlyTrashed()`                     |
| Nullable filter (v7.0.1)                      | `?filter[deleted_at]=null` / `not-null`      | `.whereNull(name)` / `.whereNotNull(name)`              |
| Custom array delimiter (v7.2.0)               | `?filter[id]=1\|2\|3`                        | `.delimiter('\|')` / `setFilterDelimiter('\|')`         |
| Filter groups (v7.3.0 / [#1060](https://github.com/spatie/laravel-query-builder/pull/1060)) | `?filter[shorthand]=…`                       | `.filterGroup(shorthand, value)`                        |
| Sort (multi-field, `-` for desc)              | `?sort=-created_at,name`                     | `.sortBy(field)` / `.sortByDesc(field)`                 |
| Include relations                             | `?include=posts,profile`                     | `.include(...rels)`                                     |
| Aggregate include `Count`                     | `?include=postsCount`                        | `.includeCount(...rels)`                                |
| Aggregate include `Exists`                    | `?include=postsExists`                       | `.includeExists(...rels)`                               |
| Aggregate include `sum / avg / min / max`     | `?include=postsViewsSum`                     | `.includeSum / Avg / Min / Max(...names)`               |
| Sparse fieldsets                              | `?fields[users]=id,name`                     | `.fields(type, ...names)`                               |
| Append accessors                              | `?append=full_name`                          | `.append(...names)`                                     |
| Pagination (Laravel Resource)                 | `?page=2&per_page=25`                        | `.page(n)` / `.perPage(n)` / `.paginate(p, pp)`         |

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
