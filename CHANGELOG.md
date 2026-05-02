# Changelog

All notable changes to this project are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
