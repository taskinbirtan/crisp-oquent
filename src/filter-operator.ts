/**
 * Mirrors Spatie\QueryBuilder\Enums\FilterOperator.
 *
 * Use these symbols when calling `Builder.where(field, operator, value)` to
 * build a `?filter[field]=<operator><value>` query string against a Spatie
 * `AllowedFilter::operator(...)` filter declared in DYNAMIC mode.
 *
 * @see https://spatie.be/docs/laravel-query-builder/v7/features/filtering#content-operator-filters
 */
export const FilterOperator = {
  EQUAL: '=',
  NOT_EQUAL: '!=',
  GREATER_THAN: '>',
  GREATER_THAN_OR_EQUAL: '>=',
  LESS_THAN: '<',
  LESS_THAN_OR_EQUAL: '<=',
} as const;

export type FilterOperator = (typeof FilterOperator)[keyof typeof FilterOperator];
