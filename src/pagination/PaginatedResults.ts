import type { Model, ModelConstructor } from '../Model.js';

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  from: number | null;
  to: number | null;
}

export interface RawLaravelPaginated {
  data: Array<Record<string, unknown>>;
  links?: Partial<PaginationLinks>;
  meta?: {
    current_page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
    from?: number | null;
    to?: number | null;
  };
  current_page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
  from?: number | null;
  to?: number | null;
}

export class PaginatedResults<T extends Model> {
  constructor(
    readonly items: T[],
    readonly meta: PaginationMeta,
    readonly links: PaginationLinks,
  ) {}

  get total(): number {
    return this.meta.total;
  }

  get currentPage(): number {
    return this.meta.currentPage;
  }

  get perPage(): number {
    return this.meta.perPage;
  }

  get lastPage(): number {
    return this.meta.lastPage;
  }

  hasMorePages(): boolean {
    return this.meta.currentPage < this.meta.lastPage;
  }
}

export function parsePaginated<T extends Model>(
  raw: RawLaravelPaginated,
  modelClass: ModelConstructor<T>,
): PaginatedResults<T> {
  const items = (raw.data ?? []).map((item) => new modelClass(item));
  const metaSource = raw.meta ?? raw;
  const linksSource = raw.links ?? {};

  const meta: PaginationMeta = {
    currentPage: metaSource.current_page ?? 1,
    perPage: metaSource.per_page ?? items.length,
    total: metaSource.total ?? items.length,
    lastPage: metaSource.last_page ?? 1,
    from: metaSource.from ?? null,
    to: metaSource.to ?? null,
  };

  const links: PaginationLinks = {
    first: linksSource.first ?? null,
    last: linksSource.last ?? null,
    prev: linksSource.prev ?? null,
    next: linksSource.next ?? null,
  };

  return new PaginatedResults<T>(items, meta, links);
}
