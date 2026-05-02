# Changelog

## 2.0.0 — 2026-05-02

**BREAKING — komple refactor.** API yüzeyi 1.0.0 ile uyumlu değil.

### Eklenenler
- Spatie `laravel-query-builder` URL kontratı 1:1: `filter[…]`, `sort=`, `include=`, `fields[type]=`, `append=`
- `Builder.filterGroup(shorthand, value)` — Spatie v7.3.0 / PR [#1060](https://github.com/spatie/laravel-query-builder/pull/1060) Filter Groups shorthand desteği
- Aggregate include helper'ları: `includeCount`, `includeExists`
- Terminal metodlar: `get`, `first`, `find`, `paginate`, `all`, `create`
- `Model.save()` (POST/PUT auto), `Model.delete()`, `Model.fill()`, `Model.toJSON()`
- `Model` üzerinde `Proxy`-bazlı attribute access (`user.name` → `attributes.name`)
- `HttpError` — `status`, `body`, `isValidationError`, `validationErrors`, `isNotFound`, `isUnauthorized`
- `CrispOquentConfig.setBearerToken`, `setHeader`, `addRequestInterceptor`, `addResponseInterceptor`
- Laravel Resource paginated payload parser (`meta.{current_page,per_page,total,last_page}` + `links`)
- vitest test suite — query string, builder, http client, Spatie URL contract assertions

### Değişiklikler
- ESM-only paket (`"type": "module"`, `exports` map). Node ≥ 18 gerekli.
- `module: ESNext`, `moduleResolution: Bundler`, `target: ES2020`.
- License: ISC → Apache-2.0 (LICENSE dosyasıyla tutarlı).
- Test runner: mocha+ts-node → **vitest**.

### Düzeltmeler (1.0.0 bug'ları)
- `Builder.paginate(page, pageSize)` parametreleri artık gerçekten kullanılıyor.
- `parseResults` `new Model(abstract)` derleme hatası giderildi; concrete model factory.
- `parseResults` dönüş tipi artık gerçekten `PaginatedResults<T>`.
- Builder constructor model **class**'ı doğru şekilde tutuyor (önceden instance-as-class karışıklığı).
- Query string `encodeURIComponent` ile değer-güvenli.
- `tsconfig` ESM/CJS çakışması giderildi.

## 1.0.0 — 2024-04-02

İlk taslak; bug'lı / yarım kalmış prototip.
