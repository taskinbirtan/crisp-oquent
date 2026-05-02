# crisp-oquent

> Spatie [`laravel-query-builder`](https://github.com/spatie/laravel-query-builder) uyumlu, **fetch-only** TypeScript API client. Eloquent-vari fluent builder + JSON:API Fancy Filter Groups (Spatie v7.3.0 / PR [#1060](https://github.com/spatie/laravel-query-builder/pull/1060)).

- Sadece `fetch` — Axios bağımlılığı yok
- ESM-only, TypeScript-first, Node ≥ 18 ve modern tarayıcılarda çalışır
- Spatie URL kontratı 1:1: `filter[…]`, `sort=`, `include=`, `fields[type]=`, `append=`
- Filter groups (`filterGroup`) — Spatie `AllowedFilter::groupOr / groupAnd` shorthand
- Laravel Resource pagination payload'ını otomatik parse eder
- Bearer auth, request/response interceptor, `HttpError` ile structured hata

## Kurulum

```bash
npm i crisp-oquent
```

## Hızlı Başlangıç

### 1. Config

```ts
// nuxt.config.ts içindeki bir plugin, app entry, vb.
import { CrispOquentConfig } from 'crisp-oquent';

CrispOquentConfig.initialize({ baseUri: 'https://api.example.com' });
CrispOquentConfig.setBearerToken(localStorage.getItem('token'));
```

### 2. Model tanımı

```ts
import { Model } from 'crisp-oquent';

export class User extends Model {
  static override uri = '/users';

  declare id?: number;
  declare name?: string;
  declare email?: string;
}
```

### 3. Sorgular — Spatie URL kontratı

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

Backend'de:

```php
QueryBuilder::for(User::class)
    ->allowedFilters(
        AllowedFilter::groupOr('q', [
            AllowedFilter::partial('name'),
            AllowedFilter::partial('full_name'),
        ]),
    );
```

Client'ta tek satır:

```ts
const matches = await User.crispy().filterGroup('q', 'John').get();
// → GET /users?filter[q]=John
// → backend WHERE (name LIKE '%John%' OR full_name LIKE '%John%')
```

Conjunction (AND/OR), shorthand'ın hangi alanlara dağılacağı, value broadcast — hepsi server-side. Client'ın tek görevi shorthand'i göndermek; mantık `FiltersGroup` içinde.

### 6. Tek kayıt + CRUD

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

### 7. Auth + interceptor

```ts
CrispOquentConfig.setBearerToken('abc123');

CrispOquentConfig.addRequestInterceptor((ctx) => ({
  ...ctx,
  init: { ...ctx.init, headers: { ...ctx.init.headers, 'X-Trace-Id': crypto.randomUUID() } },
}));

CrispOquentConfig.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // refresh, redirect, vs.
  }
  return response;
});
```

### 8. Hata modeli

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

## API kapsamı — Spatie paritesi

| Spatie URL parametresi | Builder metodu                                  |
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

## Geliştirme

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Lisans

Apache-2.0
