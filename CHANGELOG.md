# Changelog

All notable changes to this project are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] — 2026-05-02

### Added — full Spatie v7 feature parity
- `Builder.where(name, FilterOperator, value)` — dynamic operator filter, pairs with `AllowedFilter::operator($name, FilterOperator::DYNAMIC)` on the server. Emits `?filter[name]=>3000`, `?filter[id]=!=3`, etc.
- `FilterOperator` const object (mirrors `Spatie\QueryBuilder\Enums\FilterOperator`): `EQUAL`, `NOT_EQUAL`, `GREATER_THAN`, `GREATER_THAN_OR_EQUAL`, `LESS_THAN`, `LESS_THAN_OR_EQUAL`.
- `Builder.withTrashed()` / `Builder.onlyTrashed()` — Spatie SoftDeletes `?filter[trashed]=with|only`.
- `Builder.whereNull(name)` / `Builder.whereNotNull(name)` — Spatie nullable filter (v7.0.1) shorthand → `?filter[name]=null` / `not-null`.
- `Builder.includeSum`, `includeAvg`, `includeMin`, `includeMax` — pair with Spatie aggregate includes (`AllowedInclude::sum/avg/min/max`, v7.0.0).
- `Builder.delimiter(delimiter)` and `CrispOquentConfig.setFilterDelimiter(delimiter)` — override the comma-join delimiter for array filter values, mirroring Spatie's `query-builder.array_value_delimiter` config (v7.2.0).
- 13 new tests (total: 41) covering every new helper.

### Changed
- `QueryParams.delimiter` is now a first-class field on the query string builder.

## [2.0.0] — 2026-05-02

**BREAKING — full rewrite.** The 1.0.0 API surface is not preserved.

### Added
- 1:1 parity with Spatie `laravel-query-builder`'s URL contract: `filter[…]`, `sort=`, `include=`, `fields[type]=`, `append=`.
- `Builder.filterGroup(shorthand, value)` — client-side shorthand for Spatie v7.3.0 Filter Groups (PR [#1060](https://github.com/spatie/laravel-query-builder/pull/1060)).
- Aggregate include helpers: `includeCount`, `includeExists`.
- Terminal methods: `get`, `first`, `find`, `paginate`, `all`, `create`.
- `Model.save()` (auto POST for new, PUT for persisted), `Model.delete()`, `Model.fill()`, `Model.toJSON()`.
- `Proxy`-based attribute access on `Model` (`user.name` → `user.attributes.name`).
- `HttpError` with `status`, `body`, `isValidationError`, `validationErrors`, `isNotFound`, `isUnauthorized`, `isForbidden`.
- `CrispOquentConfig.setBearerToken`, `setHeader`, `removeHeader`, `addRequestInterceptor`, `addResponseInterceptor`, `reset`.
- Laravel API Resource paginated payload parser (`meta.{current_page,per_page,total,last_page,from,to}` + `links.{first,last,prev,next}`).
- Vitest suite (28 tests) covering query-string contract, builder fluent API, HTTP client, and CRUD flows.

### Changed
- ESM-only package (`"type": "module"`, `exports` map). Requires Node ≥ 18.
- TypeScript config modernized: `module: ESNext`, `moduleResolution: Bundler`, `target: ES2020`, `strict: true`.
- License: ISC → **Apache-2.0** (matches the bundled `LICENSE` file).
- Test runner: mocha+ts-node → **vitest**.
- `Model.uri` is now a **static** field (was an instance field), enabling `Model.crispy()` to resolve the endpoint without an instance.

### Fixed (carried over from 1.0.0)
- `Builder.paginate(page, pageSize)` now actually honors its arguments (previously hard-coded to page 1, size 10).
- `parseResults` no longer attempts to instantiate the abstract `Model` class.
- `parseResults` return type now matches what `Builder.paginate` consumes.
- `Builder` constructor correctly retains the model **class**, fixing `this.model.uri` lookups.
- Query string is `encodeURIComponent`-safe for filter values.
- `tsconfig` no longer conflicts with `package.json`'s `"type": "module"`.

## [1.0.0] — 2024-04-02

Initial draft / proof-of-concept release.
