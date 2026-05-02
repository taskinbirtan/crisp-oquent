export type QueryValue = string | number | boolean;

export interface QueryParams {
  filter?: Record<string, QueryValue | QueryValue[]>;
  sort?: string[];
  include?: string[];
  fields?: Record<string, string[]>;
  append?: string[];
  page?: number;
  perPage?: number;
  extra?: Record<string, QueryValue | QueryValue[]>;
}

const enc = encodeURIComponent;

function joinValues(value: QueryValue | QueryValue[]): string {
  return Array.isArray(value) ? value.map(String).join(',') : String(value);
}

export function buildQueryString(params: QueryParams): string {
  const parts: string[] = [];

  if (params.filter) {
    for (const [name, value] of Object.entries(params.filter)) {
      parts.push(`filter[${enc(name)}]=${enc(joinValues(value))}`);
    }
  }

  if (params.sort && params.sort.length > 0) {
    parts.push(`sort=${enc(params.sort.join(','))}`);
  }

  if (params.include && params.include.length > 0) {
    parts.push(`include=${enc(params.include.join(','))}`);
  }

  if (params.fields) {
    for (const [type, names] of Object.entries(params.fields)) {
      if (names.length === 0) continue;
      parts.push(`fields[${enc(type)}]=${enc(names.join(','))}`);
    }
  }

  if (params.append && params.append.length > 0) {
    parts.push(`append=${enc(params.append.join(','))}`);
  }

  if (params.page !== undefined) {
    parts.push(`page=${params.page}`);
  }

  if (params.perPage !== undefined) {
    parts.push(`per_page=${params.perPage}`);
  }

  if (params.extra) {
    for (const [name, value] of Object.entries(params.extra)) {
      parts.push(`${enc(name)}=${enc(joinValues(value))}`);
    }
  }

  return parts.length === 0 ? '' : `?${parts.join('&')}`;
}
